import { DateTime } from "luxon";

import { PriceData, Timerange, Token, TokenPrices } from "types";
import Logger from "../lib/logger";
import { ethereumProvider, polygonProvider } from "./web3";
import { difference } from "lodash";

//TODO no provider on missing network
const getProviderForToken = (token: Partial<Token>) => {
  if (token?.network?.chainId === "0x1") {
    return ethereumProvider;
  }

  if (token?.network?.chainId === "0x89") {
    return polygonProvider;
  }

  Logger.info(
    `[utils] getProvider ${token.symbol} no matching provider ${token?.network?.chainId}`
  );
  return ethereumProvider;
};

//TODO filter limits per source and not in general
const findMissingDays = (tokenData: Partial<TokenPrices>) => {
  Logger.debug(`Checking gaps in daily ${tokenData.symbol} prices`);

  if (!tokenData.creationEpoch) {
    Logger.debug("No creation epoch found");
    return undefined;
  }

  const missingValues = checkForMissingDays(
    tokenData.creationEpoch,
    tokenData?.dailies
  );

  const clustered = clusterArray(missingValues, "quarter");
  return minMaxClusters(clustered) as Timerange[];
};

const findMissingHours = (tokenData: Partial<TokenPrices>) => {
  Logger.debug(`Checking gaps in hourly ${tokenData.symbol} prices`);

  if (!tokenData.creationEpoch) {
    Logger.debug("No creation epoch found");
    return undefined;
  }

  const missingValues = checkForMissingHours(
    tokenData.creationEpoch,
    tokenData?.hourlies
  );

  const clustered = clusterArray(missingValues, "week");
  return minMaxClusters(clustered) as Timerange[];
};

const findMissingMinutes = (tokenData: Partial<TokenPrices>) => {
  Logger.debug(`Checking gaps in minutes ${tokenData.symbol} prices`);

  if (!tokenData.creationEpoch) {
    Logger.debug("No creation epoch found");
    return undefined;
  }

  const missingValues = checkForMissingMinutes(
    tokenData.creationEpoch,
    tokenData?.minutes
  );

  const clustered = clusterArray(missingValues, "day");
  return minMaxClusters(clustered) as Timerange[];
};

const generateTimestamps = (
  from: number,
  to: number,
  intervalInSeconds: number
): number[] => {
  const goal = to;
  let timestamps = [from];
  while (timestamps[timestamps.length - 1] < goal) {
    timestamps.push(timestamps[timestamps.length - 1] + intervalInSeconds);
  }

  return timestamps;
};

const getEpochStartOfUnit = (
  timestamp: number,
  unit: "quarter" | "week" | "day" | "hour" | "minute"
) => {
  return Math.round(DateTime.fromSeconds(timestamp).startOf(unit).toSeconds());
};

const checkForMissingDays = (
  creationEpoch: number,
  epochsFound?: PriceData[]
) => {
  const now = DateTime.now().toSeconds();
  const intervalInSeconds = 24 * 60 * 60;

  const timestampsSinceEpoch = generateTimestamps(
    creationEpoch,
    now,
    intervalInSeconds
  ).map((timestamp: number) => getEpochStartOfUnit(timestamp, "day"));

  if (!epochsFound) {
    return timestampsSinceEpoch;
  }

  const epochFixedStartOfDay = epochsFound.map((priceData: PriceData) =>
    getEpochStartOfUnit(priceData.epoch, "day")
  );

  return difference(timestampsSinceEpoch, epochFixedStartOfDay);
};

const checkForMissingHours = (
  creationEpoch: number,
  epochsFound?: PriceData[]
) => {
  const now = DateTime.now().toSeconds();
  const intervalInSeconds = 60 * 60;

  const timestampsSinceEpoch = generateTimestamps(
    creationEpoch,
    now,
    intervalInSeconds
  ).map((timestamp: number) => getEpochStartOfUnit(timestamp, "hour"));

  if (!epochsFound) {
    return timestampsSinceEpoch;
  }

  const epochFixedStartOfHour = epochsFound.map((priceData: PriceData) =>
    getEpochStartOfUnit(priceData.epoch, "hour")
  );

  return difference(timestampsSinceEpoch, epochFixedStartOfHour);
};

const checkForMissingMinutes = (
  creationEpoch: number,
  epochsFound?: PriceData[]
) => {
  const now = DateTime.now().toSeconds();
  const intervalInSeconds = 60;

  const timestampsSinceEpoch = generateTimestamps(
    creationEpoch,
    now,
    intervalInSeconds
  ).map((timestamp: number) => getEpochStartOfUnit(timestamp, "minute"));

  if (!epochsFound) {
    return timestampsSinceEpoch;
  }

  const epochFixedStartOfMinute = epochsFound.map((priceData: PriceData) =>
    getEpochStartOfUnit(priceData.epoch, "minute")
  );

  return difference(timestampsSinceEpoch, epochFixedStartOfMinute);
};

const clusterArray = (
  fields: number[],
  groupBy: "quarter" | "week" | "day" | "hour"
): number[][] => {
  return fields.reduce((arr: number[][], val, i, a) => {
    if (
      !i ||
      getEpochStartOfUnit(val, groupBy) !==
        getEpochStartOfUnit(a[i - 1], groupBy)
    )
      arr.push([] as number[]);
    arr[arr.length - 1].push(val);
    return arr;
  }, []);
};

const minMaxClusters = (clusteredArray: number[][]) => {
  return clusteredArray.map((v: number[]) => {
    return { from: v[0], to: v[v.length - 1] };
  });
};

export {
  generateTimestamps,
  findMissingDays,
  findMissingHours,
  findMissingMinutes,
  checkForMissingHours,
  checkForMissingDays,
  getProviderForToken,
  clusterArray,
};
