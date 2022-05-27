import Logger from "../../lib/logger";
import { TokenGetters } from "../tokens";
import {
  getPriceAgainstUSDCfrom0x,
  getTokenInfoFromCoinGecko,
} from "../sources";

import { insertMarketData } from "./insertPriceDataGraph";

import _ from "lodash";
import { MarketData, PriceData, Token, TokenDetails } from "types";

const collectAndInsertCurrentMarketData = async () => {
  const tokens = await TokenGetters.getTradableTokens();

  const currentPrices = await Promise.all(
    tokens.map(async (token) => await getPriceAgainstUSDCfrom0x(token))
  );

  const currentMarketData = await TokenGetters.getTokenMarketData(
    tokens.map((token: Token) => token.id)
  );

  const coinGeckoMarketData = await Promise.all(
    tokens.map(async (token) => await getTokenInfoFromCoinGecko(token))
  );

  const merge = (
    token: Token,
    currentPrice: PriceData,
    coingeckoDetails: Partial<TokenDetails>,
    currentMarketData: MarketData
  ): Partial<MarketData> => {
    if (token.tokenset) {
      return {
        tokenId: token.id,
        marketCap: currentMarketData.marketCap,
        changePercentDay: currentMarketData.changePercentDay,
        volumeDay: currentMarketData.volumeDay,
        totalSupply: currentMarketData.totalSupply,
        currentPrice: currentMarketData.currentPrice,
      };
    }

    return {
      tokenId: token.id,
      marketCap: coingeckoDetails?.market_data?.market_cap["usd"].toString(),
      changePercentDay:
        coingeckoDetails?.market_data?.price_change_percentage_24h.toString(),
      volumeDay: coingeckoDetails?.market_data?.total_volume["usd"].toString(),
      totalSupply: coingeckoDetails?.market_data?.total_supply.toString(),
      currentPrice:
        currentPrice.price ||
        coingeckoDetails.market_data?.current_price["usd"].toString(),
    };
  };

  const toStore = tokens.map((token, index) => {
    const _marketData =
      currentMarketData.find(
        (marketData: MarketData) => marketData.tokenId === token.id
      ) || ({} as MarketData);
    return merge(
      token,
      currentPrices[index],
      coinGeckoMarketData[index],
      _marketData
    );
  });

  Logger.debug(
    `[market data handler]: Inserting ${toStore.length} market data objects`
  );

  if (toStore.length > 0) {
    await insertMarketData(toStore)
      .then(() =>
        Logger.info(
          `[market data handler]: stored ${toStore.length} market data object`
        )
      )
      .catch((e) =>
        Logger.error(
          `[market data handler]: inserting market data returned ${e.message}`
        )
      )
  }
};

export { collectAndInsertCurrentMarketData };
