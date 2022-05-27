import { PriceData } from "types";
import meanBy from "lodash/meanBy";
import { TokenGetters } from "../tokens";
import { PriceGetters } from ".";
import { checkForMissingDays, checkForMissingHours } from "../helpers";
import { DateTime } from "luxon";
import { flatMap } from "lodash";
import {
  insertPricesDaily,
  insertPricesHourly,
} from "../scraper/insertPriceDataGraph";
import Logger from "../../lib/logger";
import { std } from "mathjs";

const meanPrice = (pricedata: PriceData[]) => {
  return meanBy(pricedata, (data) => parseFloat(data.price));
};

const trimStandardDeviation = (priceData: PriceData[]) => {
  if (priceData.length > 0) {
    Logger.debug(
      `[priceScaler] ${priceData.length} underlyings for ${priceData[0].tokenId} before trimming`
    );
    const prices = priceData.map((data) => parseFloat(data.price));
    const meanValue = meanPrice(priceData);
    const standardDeviation = std(prices) as unknown as number;

    Logger.debug(
      `[priceScaler] ${standardDeviation.toString()} is 1SD for ${
        priceData[0].tokenId
      }`
    );

    const standardDeviationMinMax = [
      meanValue - 3 * standardDeviation,
      meanValue + 3 * standardDeviation,
    ];
    return priceData.filter(
      (data) =>
        parseFloat(data.price) >= standardDeviationMinMax[0] &&
        parseFloat(data.price) <= standardDeviationMinMax[1] &&
        parseFloat(data.price) > 0
    );
  }

  return priceData;
};

const findUnderlyingsForMissingEpochs = (
  underlyings: PriceData[],
  missingEpochs: number[],
  unit: "hour" | "day"
) => {
  if (unit === "hour") {
    const limit = Math.round(DateTime.now().minus({ month: 1 }).toSeconds());

    return missingEpochs
      .filter((epoch) => epoch >= limit)
      .map((epoch) => {
        const from = DateTime.fromSeconds(epoch)
          .minus({ hour: 1 })
          .startOf("hour")
          .toSeconds();
        const to = DateTime.fromSeconds(epoch).startOf("hour").toSeconds();
        return underlyings.filter(
          (value) => value.epoch >= from && value.epoch <= to
        );
      });
  }

  if (unit === "day") {
    const limit = Math.round(DateTime.now().minus({ year: 1 }).toSeconds());

    return missingEpochs
      .filter((epoch) => epoch >= limit)
      .map((epoch) => {
        const from = DateTime.fromSeconds(epoch)
          .minus({ day: 1 })
          .startOf("day")
          .toSeconds();
        const to = DateTime.fromSeconds(epoch).startOf("day").toSeconds();
        return underlyings.filter(
          (value) => value.epoch >= from && value.epoch <= to
        );
      });
  }
};

const calculateTrimmedMeansBasedOnUnderlyings = (
  availableUnderlyingsPerUnit: PriceData[][],
  tokenId: number,
  unit: "hour" | "day"
) => {
  return availableUnderlyingsPerUnit
    .map((availableUnderlyings) => trimStandardDeviation(availableUnderlyings))
    .map((trimmedAvailableUnderlyings) => {
      let minimum = undefined;
      if (unit === "hour") minimum = 45;
      if (unit === "day") minimum = 20;

      if (!minimum || trimmedAvailableUnderlyings.length < minimum) {
        Logger.debug(
          `[priceScaler] Not enough underlyings (${
            trimmedAvailableUnderlyings.length
          }) for ${unit} - ${tokenId || "no ID"}`
        );
        return undefined;
      }

      Logger.debug(
        `[priceScaler] ${
          trimmedAvailableUnderlyings.length
        }) underlyings for ${unit} - ${tokenId || "no ID"}`
      );

      const epoch = Math.round(
        DateTime.fromSeconds(trimmedAvailableUnderlyings[0].epoch)
          .endOf(unit)
          .toSeconds()
      );
      const price = meanPrice(trimmedAvailableUnderlyings);

      return { tokenId, price: price.toString(), epoch } as PriceData;
    })
    .filter((calculatedMean): calculatedMean is PriceData => !!calculatedMean);
};

const calculateMissingHourlies = async () => {
  const tokens = await TokenGetters.getTradableTokens();
  const limit = Math.round(DateTime.now().minus({ year: 1 }).toSeconds());

  const allTokenPrices = await PriceGetters.getPricesTokensAll(
    tokens.map((token) => token.address),
    limit
  );

  const allMinutes = allTokenPrices.map(
    (tokenPrices) => tokenPrices.minutes || []
  );

  const calculatedMeansPerHour = allTokenPrices
    .map((tokenPrices) => {
      const threshold =
        limit >= tokenPrices.creationEpoch ? limit : tokenPrices.creationEpoch;
      return checkForMissingHours(threshold, tokenPrices?.hourlies);
    })
    .map((missingHours, tokenIndex) => {
      const underlyings = allMinutes[tokenIndex];
      if (!underlyings) {
        return [];
      }

      return findUnderlyingsForMissingEpochs(underlyings, missingHours, "hour");
    })
    .map((availableMinutesPerHour, tokenIndex) => {
      if (!availableMinutesPerHour) {
        Logger.debug(
          `[priceScaler] No minute underlyings for ${allTokenPrices[tokenIndex].symbol} on ${allTokenPrices[tokenIndex].chainId}`
        );
        return [];
      }

      Logger.debug(
        `[priceScaler] ${availableMinutesPerHour.length} minute underlyings for ${allTokenPrices[tokenIndex].symbol} on ${allTokenPrices[tokenIndex].chainId}`
      );
      return calculateTrimmedMeansBasedOnUnderlyings(
        availableMinutesPerHour,
        allTokenPrices[tokenIndex].id,
        "hour"
      );
    });

  const toStore = flatMap(calculatedMeansPerHour);

  Logger.debug(`[priceScaler] storing ${toStore.length} infered hourly prices`);
  if (toStore) {
    await insertPricesHourly(toStore);
  }
};

const calculateMissingDailies = async () => {
  const tokens = await TokenGetters.getTradableTokens();
  const limit = Math.round(DateTime.now().minus({ year: 1 }).toSeconds());

  const allTokenPrices = await PriceGetters.getPricesTokensAll(
    tokens.map((token) => token.address),
    limit
  );

  const allHours = allTokenPrices.map(
    (tokenPrices) => tokenPrices.hourlies || ([] as PriceData[])
  );

  const calculatedMeansPerDay = allTokenPrices
    .map((tokenPrices) => {
      const threshold =
        limit >= tokenPrices.creationEpoch ? limit : tokenPrices.creationEpoch;
      return checkForMissingDays(threshold, tokenPrices?.dailies);
    })
    .map((missingDays, tokenIndex) => {
      const underlyings = allHours[tokenIndex];
      if (!underlyings) {
        return [];
      }

      return findUnderlyingsForMissingEpochs(underlyings, missingDays, "day");
    })
    .map((availableHoursPerDay, tokenIndex) => {
      if (!availableHoursPerDay) {
        Logger.debug(
          `[priceScaler] No hourly underlyings for ${allTokenPrices[tokenIndex].symbol} on ${allTokenPrices[tokenIndex].chainId}`
        );
        return [];
      }

      Logger.debug(
        `[priceScaler] ${availableHoursPerDay.length} hour underlyings for ${allTokenPrices[tokenIndex].symbol} on ${allTokenPrices[tokenIndex].chainId}`
      );
      return calculateTrimmedMeansBasedOnUnderlyings(
        availableHoursPerDay,
        allTokenPrices[tokenIndex].id,
        "day"
      );
    });

  const toStore = flatMap(calculatedMeansPerDay);

  Logger.debug(`[priceScaler] storing ${toStore.length} infered daily prices`);
  if (toStore) {
    await insertPricesDaily(toStore);
  }
};

export { calculateMissingHourlies, calculateMissingDailies };
