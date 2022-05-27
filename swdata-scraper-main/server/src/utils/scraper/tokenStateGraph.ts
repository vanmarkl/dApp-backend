import Logger from "../../lib/logger";
import { graphClient, Mutations } from "../graph";

const updateCoinGeckoCheckDailies = async (
  ids: number[],
  calledCoinGecko: boolean
) => {
  Logger.info(
    `[tokenState] Setting tokens ${ids.toString()} to ${calledCoinGecko} on CoinGeckoCheckDailies`
  );
  return graphClient
    .mutate({
      mutation: Mutations.UPDATE_COINGECKO_CHECK_DAILIES,
      variables: { ids, calledCoinGeckoDailies: calledCoinGecko },
    })
    .then((res) => {
      return res;
    })
    .catch((e) =>
      Logger.error(`[tokenState] error setting token state ${e.message}`)
    );
};

const updateCoinGeckoCheckHourlies = async (
  ids: number[],
  calledCoinGecko: boolean
) => {
  Logger.info(
    `[tokenState] Setting tokens ${ids.toString()} to ${calledCoinGecko} on CoinGeckoCheckHourlies`
  );
  return graphClient
    .mutate({
      mutation: Mutations.UPDATE_COINGECKO_CHECK_HOURLIES,
      variables: { ids, calledCoinGeckoHourlies: calledCoinGecko },
    })
    .then((res) => {
      return res;
    })
    .catch((e) =>
      Logger.error(`[tokenState] error setting token state ${e.message}`)
    );
};

const updateCoinGeckoCheckMinutes = async (
  ids: number[],
  calledCoinGecko: boolean
) => {
  Logger.info(
    `[tokenState] Setting tokens ${ids.toString()} to ${calledCoinGecko} on CoinGeckoCheckMinutes`
  );
  return graphClient
    .mutate({
      mutation: Mutations.UPDATE_COINGECKO_CHECK_MINUTES,
      variables: { ids, calledCoinGeckoMinutes: calledCoinGecko },
    })
    .then((res) => {
      return res;
    })
    .catch((e) =>
      Logger.error(`[tokenState] error setting token state ${e.message}`)
    );
};

export {
  updateCoinGeckoCheckDailies,
  updateCoinGeckoCheckHourlies,
  updateCoinGeckoCheckMinutes,
};
