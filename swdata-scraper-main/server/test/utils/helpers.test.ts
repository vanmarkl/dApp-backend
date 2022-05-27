import { DateTime } from "luxon";
import * as Utils from "../../src/utils/helpers";
import { PriceData, TokenPrices, Timerange } from "../../types";

describe("Helpers", () => {
  describe("Utils for datasources", () => {
    //TODO untill or including?
    it("generates a set of timestamps for days", () => {
      const now = DateTime.now();
      const from = now.minus({ days: 10 }).toSeconds();
      const generatedTimestamps = Utils.generateTimestamps(
        from,
        now.toSeconds(),
        24 * 60 * 60
      );
      expect(generatedTimestamps.length).toEqual(11);
    });

    it("generates a set of timestamps for hours", () => {
      const now = DateTime.now();
      const from = now.minus({ hours: 10 }).toSeconds();
      const generatedTimestamps = Utils.generateTimestamps(
        from,
        now.toSeconds(),
        60 * 60
      );
      expect(generatedTimestamps.length).toEqual(11);
    });

    it("generates a set of timestamps for minutes", () => {
      const now = DateTime.now();
      const from = now.minus({ minutes: 10 }).toSeconds();
      const generatedTimestamps = Utils.generateTimestamps(
        from,
        now.toSeconds(),
        60
      );
      expect(generatedTimestamps.length).toEqual(11);
    });

    it("get provider corresponding with token", async () => {
      const tokenMainnet = {
        symbol: "MCK-main",
        network: { name: "mainnet", chainId: "0x1" },
      };

      const providerTokenMainnet = Utils.getProviderForToken(tokenMainnet);
      expect(
        await providerTokenMainnet.getNetwork().then((res) => res.chainId)
      ).toEqual(parseInt(tokenMainnet.network.chainId));

      const tokenPolygon = {
        symbol: "MCK-poly",
        network: { name: "polygon-pos", chainId: "0x89" },
      };

      const providerTokenPolygon = Utils.getProviderForToken(tokenPolygon);
      expect(
        await providerTokenPolygon.getNetwork().then((res) => res.chainId)
      ).toEqual(parseInt(tokenPolygon.network.chainId));

      //TODO handling unsupported network
      const tokenUnknown = {
        symbol: "MCK-unknown",
        network: { name: "polygon-pos", chainId: "0x42" },
      };

      const providerTokenUnknown = Utils.getProviderForToken(tokenUnknown);
      expect(
        await providerTokenUnknown.getNetwork().then((res) => res.chainId)
      ).toEqual(parseInt(tokenMainnet.network.chainId));
    });

    it("finds missing days when creationEpoch provided", async () => {
      const now = DateTime.now();
      const days = 20;

      // Token age x-days + 10 -> 30 days
      const creationEpoch = now.minus({ days: days + 10 });

      // Data for last x-days -> 20 days
      let dailyPriceData = Array(days).fill(undefined);
      dailyPriceData = dailyPriceData.map((_v, index) => {
        return {
          tokenId: 2,
          price: index.toString(),
          epoch: now.minus({ days: days - index }).toSeconds(),
        } as PriceData;
      });

      const priceData: Partial<TokenPrices> = {
        creationEpoch: creationEpoch.toSeconds(),
        dailies: dailyPriceData,
      };

      // Limit for not querying x-days -10 -> 10 days
      const limits: Timerange = {
        from: now.minus({ days: days - 10 }).toSeconds(),
        to: now.toSeconds(),
      };

      const missingDays = Utils.findMissingDays(priceData, limits);

      // Expect array of 1 from creationEpoch (10 days covers 1 quarter)
      expect(missingDays.length).toEqual(1);

      // First timeframe from creationEpoch up until 1 week
      // Second timeframe from 1 week after creationEpoch
      const firstStart = creationEpoch.startOf("day").toSeconds();
      expect(missingDays[0].from).toEqual(firstStart);
    });

    it("finds missing hours when creationEpoch provided", async () => {
      const now = DateTime.now();
      const days = 20;
      const hours = days * 24;

      // Token age x-days + 10 -> 30 days
      const creationEpoch = now.minus({ days: days + 10 });

      // Data for last x-days -> 20 days
      let hourlyPriceData = Array(hours).fill(undefined);
      hourlyPriceData = hourlyPriceData.map((_v, index) => {
        return {
          tokenId: 4,
          price: index.toString(),
          epoch: now.minus({ hours: hours - index }).toSeconds(),
        } as PriceData;
      });

      const priceData: Partial<TokenPrices> = {
        creationEpoch: creationEpoch.toSeconds(),
        hourlies: hourlyPriceData,
      };

      // Limit for not querying x-days
      const limits: Timerange = {
        from: creationEpoch.startOf("hour").toSeconds(),
        to: now.toSeconds(),
      };

      const missingHours = Utils.findMissingHours(priceData, limits);

      // Expect array for every week missing hours  since creationEpoch
      expect(missingHours.length).toEqual(2);

      // First timeframe from creationEpoch up until 1 week
      // Second timeframe from 1 week after creationEpoch
      const firstStart = creationEpoch.startOf("hour").toSeconds();
      const secondStart = DateTime.fromSeconds(firstStart)
        .plus({ week: 1 })
        .startOf("week")
        .toSeconds();

      expect(missingHours[0].from).toEqual(firstStart);
      expect(missingHours[1].from).toEqual(secondStart);
    });

    it("finds missing minutes when creationEpoch provided", () => {
      const now = DateTime.now();
      const days = 20;
      const minutes = days * 24 * 60;

      // Token age x-days + 10 -> 30 days
      const creationEpoch = now.minus({ days: days + 10 });

      // Data for last x-days -> 20 days
      let minutePriceData = Array(minutes).fill(undefined);
      minutePriceData = minutePriceData.map((_v, index) => {
        return {
          tokenId: 4,
          price: index.toString(),
          epoch: now.minus({ minute: minutes - index }).toSeconds(),
        } as PriceData;
      });

      const priceData: Partial<TokenPrices> = {
        creationEpoch: creationEpoch.toSeconds(),
        minutes: minutePriceData,
      };

      // Limit for not querying x-days -10 -> 10 days
      const limits: Timerange = {
        from: creationEpoch.startOf("minute").toSeconds(),
        to: now.toSeconds(),
      };

      const missingMinutes = Utils.findMissingMinutes(priceData, limits);

      // Expect array for every day missing minutes since creationEpoch
      expect(missingMinutes.length).toEqual(11);

      // First timeframe from creationEpoch up until 1 week
      // Second timeframe from 1 week after creationEpoch
      const firstStart = creationEpoch.startOf("minute").toSeconds();
      const secondStart = DateTime.fromSeconds(firstStart)
        .plus({ day: 1 })
        .startOf("day")
        .toSeconds();

      expect(missingMinutes[0].from).toEqual(firstStart);
      expect(missingMinutes[1].from).toEqual(secondStart);
    });
  });
});
