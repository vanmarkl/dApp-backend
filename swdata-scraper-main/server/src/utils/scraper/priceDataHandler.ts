import Logger from "../../lib/logger";
import { TokenGetters } from "../tokens";
import { PriceGetters } from "../prices";
import {
  getDailyDataFromCoinGecko,
  getHourlyDataFromCoinGecko,
  getMinutesDataFromCoinGecko,
  getPriceAgainstUSDCfrom0x,
} from "../sources";

import {
  insertPricesDaily,
  insertPricesHourly,
  insertPricesMinutes,
} from "./insertPriceDataGraph";

import xor from "lodash/xor";
import { difference, differenceBy } from "lodash";
import { PriceData } from "types";
import { DateTime } from "luxon";
import {
  updateCoinGeckoCheckDailies,
  updateCoinGeckoCheckHourlies,
  updateCoinGeckoCheckMinutes,
} from "./tokenStateGraph";

const collectAndInsertDaily = async () => {
  const tokens = await TokenGetters.getTradableTokens();
  const callableTokens = tokens.filter(
    (token) => !token.calledCoinGeckoDailies
  );
  const tokenIds = callableTokens.map((token) => token.id);

  Logger.debug(`TOKEN IDS: ${tokenIds.toString()}`);

  const from = Math.round(DateTime.now().minus({ year: 1 }).toSeconds());
  const dailyPricesPerToken = await PriceGetters.getPricesTokensDaily(
    callableTokens.map((token) => token.address),
    from
  );

  // Try the Graph
  // const tokenPricesWithSushi = await Promise.all(
  //   tokenPrices.map(
  //     async (token: TokenPrices) => await getDailyDataFromSushiGraph(token)
  //   )
  // );

  // Try coingecko (only daily when +90 days)
  const tokenPricesWithSushiAndCoingecko = await Promise.all(
    dailyPricesPerToken.map(
      async (token) => await getDailyDataFromCoinGecko(token)
    )
  );

  const diffDailies = dailyPricesPerToken.map((tokenPrice, index) => {
    if (!tokenPricesWithSushiAndCoingecko[index].dailies) {
      return undefined;
    }

    return differenceBy(
      tokenPricesWithSushiAndCoingecko[index].dailies,
      tokenPrice.dailies || [],
      (data: PriceData) =>
        DateTime.fromSeconds(data.epoch).startOf("day").toSeconds()
    );
  });

  await Promise.all(
    diffDailies.map(async (dailies) => {
      if (!dailies || dailies.length === 0) {
        Logger.debug(`[priceDataHandler] No new daily data to insert`);
        return undefined;
      }
      Logger.debug(
        `[priceDataHandler] ${dailies.length} rows of dailies to insert`
      );

      await insertPricesDaily(dailies)
        .then((res) => {
          Logger.info(
            `[priceDataHandler] stored ${res.data.insert_prices_daily.affected_rows} daily prices`
          );
        })
        .catch((e) =>
          Logger.error(
            `[priceDataHandler] inserting daily prices returned ${e.message}`
          )
        );
    })
  ).then(() => updateCoinGeckoCheckDailies(tokenIds, true));
};

const collectAndInsertHourly = async () => {
  const tokens = await TokenGetters.getTradableTokens();
  const callableTokens = tokens.filter(
    (token) => !token.calledCoinGeckoHourlies
  );
  const tokenIds = callableTokens.map((token) => token.id);

  Logger.debug(`TOKEN IDS: ${tokenIds.toString()}`);

  const from = Math.round(DateTime.now().minus({ month: 1 }).toSeconds());

  const hourlyPricesPerToken = await PriceGetters.getPricesTokensHourly(
    callableTokens.map((token) => token.address),
    from
  );

  // Try the Graph
  // const tokenPricesWithSushi = await Promise.all(
  //   tokenPrices.map(async (token) => await getHourlyDataFromSushiGraph(token))
  // );

  // Try coingecko
  const tokenPricesWithSushiAndCoingecko = await Promise.all(
    hourlyPricesPerToken.map(
      async (token) => await getHourlyDataFromCoinGecko(token)
    )
  );

  const diffHourlies = hourlyPricesPerToken.map((tokenPrice, index) => {
    if (!tokenPricesWithSushiAndCoingecko[index].hourlies) {
      return undefined;
    }

    return differenceBy(
      tokenPricesWithSushiAndCoingecko[index].hourlies,
      tokenPrice.hourlies || [],
      (data: PriceData) =>
        DateTime.fromSeconds(data.epoch).startOf("hour").toSeconds()
    );
  });

  await Promise.all(
    diffHourlies.map(async (hourlies) => {
      if (!hourlies || hourlies.length === 0) {
        Logger.debug(`[priceDataHandler] No new hourly data to insert`);
        return undefined;
      }
      Logger.debug(
        `[priceDataHandler] ${hourlies.length} rows of hourlies to insert`
      );
      await insertPricesHourly(hourlies)
        .then((res) =>
          Logger.info(
            `[priceDataHandler] stored ${res.data.insert_prices_hourly.affected_rows} hourly prices`
          )
        )
        .catch((e) =>
          Logger.error(
            `[priceDataHandler] inserting hourly prices returned ${e.message}`
          )
        );
    })
  ).then(() => updateCoinGeckoCheckHourlies(tokenIds, true));
};

const collectAndInsertMinutes = async () => {
  const tokens = await TokenGetters.getTradableTokens();
  const callableTokens = tokens.filter(
    (token) => !token.calledCoinGeckoMinutes
  );
  const tokenIds = callableTokens.map((token) => token.id);

  const from = Math.round(DateTime.now().minus({ week: 1 }).toSeconds());

  const minutePricesPerToken = await PriceGetters.getPricesTokensMinutes(
    callableTokens.map((token) => token.address),
    from
  );

  // Try coingecko
  const tokenPricesWithCoingecko = await Promise.all(
    minutePricesPerToken.map(
      async (token) => await getMinutesDataFromCoinGecko(token)
    )
  );

  const diffMinutes = minutePricesPerToken.map((tokenPrice, index) => {
    if (!tokenPricesWithCoingecko[index].minutes) {
      return undefined;
    }

    return differenceBy(
      tokenPricesWithCoingecko[index].minutes,
      tokenPrice.minutes || [],
      (data: PriceData) =>
        DateTime.fromSeconds(data.epoch).startOf("minute").toSeconds()
    );
  });

  await Promise.all(
    diffMinutes.map(async (minutes) => {
      if (!minutes || minutes.length === 0) {
        Logger.debug(`[priceDataHandler] No new minute data to insert`);
        return undefined;
      }

      Logger.debug(
        `[priceDataHandler] ${minutes.length} rows of minutes to insert`
      );
      if (minutes.length > 0) {
        await insertPricesMinutes(minutes)
          .then((res) =>
            Logger.info(
              `[priceDataHandler] stored ${res.data.insert_prices_minutes.affected_rows} minute prices`
            )
          )
          .catch((e) =>
            Logger.error(
              `[priceDataHandler] inserting minute prices returned ${e.message}`
            )
          );
      }
    })
  ).then(() => updateCoinGeckoCheckMinutes(tokenIds, true));
};

const collectAndInsertCurrent = async () => {
  const tokens = await TokenGetters.getTradableTokens();
  const filteredTokens = tokens.filter(
    (token) => !["SWAP"].includes(token.symbol)
  );

  const currentPrices = await Promise.all(
    filteredTokens.map(async (token) => await getPriceAgainstUSDCfrom0x(token))
  );

  const toStore = currentPrices.filter(
    (currentPrice) => Object.keys(currentPrice).length !== 0
  );

  Logger.debug(`[priceDataHandler] Inserting ${toStore.length} current prices`);
  if (toStore.length > 0) {
    await insertPricesMinutes(toStore)
      .then((res) => {
        Logger.info(
          `[priceDataHandler] stored ${res.data.insert_prices_minutes.affected_rows} current prices`
        );
      })
      .catch((e) =>
        Logger.error(
          `[priceDataHandler] inserting current price returned ${e.message}`
        )
      );
  }
};

export {
  collectAndInsertDaily,
  collectAndInsertHourly,
  collectAndInsertMinutes,
  collectAndInsertCurrent,
};
