import { TokenPrices } from "types";
import Logger from "../../lib/logger";
import { graphClient, Operations } from "../graph";

const getPricesTokensDaily = async (addresses: string[], fromEpoch: number) => {
  Logger.info(`Getting daily prices for ${addresses.toString()}`);
  return await graphClient
    .query({
      query: Operations.PRICES_DAILY,
      variables: { addresses, fromEpoch },
    })
    .then((res) => res.data.prices_tokens as TokenPrices[]);
};

const getPricesTokensHourly = async (
  addresses: string[],
  fromEpoch: number
) => {
  Logger.info(`Getting hourly prices for ${addresses.toString()}`);
  return await graphClient
    .query({
      query: Operations.PRICES_HOURLY,
      variables: { addresses, fromEpoch },
    })
    .then((res) => res.data.prices_tokens as TokenPrices[]);
};

const getPricesTokensMinutes = async (
  addresses: string[],
  fromEpoch: number
) => {
  Logger.info(`Getting minute prices for ${addresses.toString()}`);
  return await graphClient
    .query({
      query: Operations.PRICES_MINUTES,
      variables: { addresses, fromEpoch },
    })
    .then((res) => res.data.prices_tokens as TokenPrices[]);
};

const getPricesTokensAll = async (addresses: string[], fromEpoch: number) => {
  Logger.info(`Getting all prices for ${addresses.toString()}`);
  return await graphClient
    .query({
      query: Operations.PRICES_ALL,
      variables: { addresses, from: fromEpoch },
    })
    .then((res) => res.data.prices_tokens as TokenPrices[]);
};

export {
  getPricesTokensDaily,
  getPricesTokensHourly,
  getPricesTokensMinutes,
  getPricesTokensAll,
};
