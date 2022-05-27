import { MarketData, Token } from "types";
import Logger from "../../lib/logger";
import { graphClient, Operations } from "../graph";

const getTradableTokens = async () => {
  Logger.info(`Getting all tradable tokens`);
  return await graphClient
    .query({
      query: Operations.TRADABLE_TOKENS,
    })
    .then((res) => res.data.prices_tokens as Token[]);
};

const getSetTokenTokens = async () => {
  Logger.info(`Getting all tokenset tokens`);
  return await graphClient
    .query({
      query: Operations.SETTOKEN_TOKENS,
    })
    .then((res) => res.data.prices_tokens as Token[]);
};

const getTokenMarketData = async (tokenIds: number[]) => {
  Logger.info(`Getting all tokenset tokens`);
  return await graphClient
    .query({
      query: Operations.TOKEN_MARKET_DATA,
      variables: { tokenIds },
    })
    .then((res) => res.data.prices_token_infos as MarketData[]);
};

export { getTradableTokens, getSetTokenTokens, getTokenMarketData };
