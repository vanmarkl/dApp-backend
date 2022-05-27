import { DateTime } from "luxon";
import { PriceData, Timerange, Token, TokenDetails, TokenPrices } from "types";
import isNumber from "lodash/isNumber";
import flatten from "lodash/flatten";
import concat from "lodash/concat";
import Logger from "../../lib/logger";
import api from "../axios";
import {
  findMissingDays,
  findMissingHours,
  findMissingMinutes,
} from "../helpers";
import { AxiosRequestHeaders } from "axios";

const baseUrl =
  process.env.BASEURL_COINGECKO || "https://api.coingecko.com/api/v3";

const headers: AxiosRequestHeaders = {
  "X-Cg-Pro-Api-Key": process.env.COINGECKO_API_KEY || "",
};

const getPriceDataFromCoingecko = async (
  token: TokenPrices,
  range: Timerange
) => {
  if (!isNumber(range.from || !isNumber(range.to))) {
    return [] as PriceData[];
  }

  const params = {
    vs_currency: "usd",
    from: range.from.toString(),
    to: range.to.toString(),
  };

  const networkName =
    token.network.name.toLowerCase() === "polygon"
      ? "polygon-pos"
      : token.network.name.toLowerCase();

  const path = `/coins/${networkName}/contract/${token.address.toLowerCase()}/market_chart/range`;
  const cacheOptions = {
    maxAge: 5 * 1000,
  };

  return await api
    .get(`${baseUrl}${path}`, { headers: headers, params, cache: cacheOptions })
    .then((response) => response.data.prices)
    .then(
      (prices) =>
        prices.map((data: number[]) => mapToDb(token, data)) as PriceData[]
    )
    .catch((error) => {
      Logger.error(
        `[CoinGecko]: getPriceData ${token.symbol} ${path} returned ${error}`
      );
      return [];
    });
};

const getTokenInfoFromCoinGecko = async (token: Partial<TokenDetails>) => {
  //TODO get platform ID based on networkId
  //https://www.coingecko.com/en/api/documentation

  if (token.address && token.network && token.network.name) {
    const networkName =
      token.network.name.toLowerCase() === "polygon"
        ? "polygon-pos"
        : token.network.name.toLowerCase();
    const path = `/coins/${networkName}/contract/${token.address.toLowerCase()}`;

    const cacheOptions = {
      maxAge: 5 * 1000,
    };

    return await api
      .get(`${baseUrl}${path}`, { headers, cache: cacheOptions })
      .then((response) => response.data)
      .then((data) => getTokenDetails(token, data))
      .catch((error) => {
        Logger.error(
          `[CoinGecko]: getTokenInfo ${token.symbol} ${path} returned ${error}`
        );
        return token;
      });
  }

  return token;
};

const getDailyDataFromCoinGecko = async (
  token: TokenPrices
): Promise<TokenPrices> => {
  // above 90 days
  const cutoff = DateTime.now()
    .minus({ seconds: 90 * 24 * 60 * 60 })
    .toSeconds();
  if (token.creationEpoch > 0 && token.creationEpoch < cutoff) {
    let rangesToCheck = findMissingDays(token);

    if (!rangesToCheck || rangesToCheck.length === 0) {
      return token;
    }

    let newPrices = await Promise.all(
      rangesToCheck.map(async (range) => {
        Logger.info(
          `Calling coingecko for daily prices for ${token.symbol} at ${token.address} on ${token.network.name} from ${range.from} to ${range.to}`
        );
        return getPriceDataFromCoingecko(token, range);
      })
    );

    if (token.dailies && token.dailies?.length > 0) {
      return {
        ...token,
        dailies: concat(token.dailies, ...flatten(newPrices)),
      };
    }

    return { ...token, dailies: flatten(newPrices) };
  }

  Logger.info(
    `[coingecko] getDailyDataFromCoinGecko token ${token.symbol} does not meet minimum age threshold for dailies`
  );

  return token;
};

const getHourlyDataFromCoinGecko = async (
  token: TokenPrices
): Promise<TokenPrices> => {
  // >1
  const now = DateTime.now();
  const cutoff = now.minus({ days: 7 }).toSeconds();

  if (token.creationEpoch > 0 && token.creationEpoch < cutoff) {
    let rangesToCheck = findMissingHours(token);

    if (!rangesToCheck || rangesToCheck.length === 0) {
      return token;
    }

    const newPrices = await Promise.all(
      rangesToCheck.map(async (range) => {
        Logger.info(
          `Calling coingecko for hourly prices for ${token.symbol} at ${token.address} on ${token.network.name} from ${range.from} to ${range.to}`
        );
        return getPriceDataFromCoingecko(token, range);
      })
    );

    if (token.hourlies && token.hourlies?.length > 0) {
      return {
        ...token,
        hourlies: concat(token.hourlies, ...flatten(newPrices)),
      };
    }

    return { ...token, hourlies: flatten(newPrices) };
  }

  Logger.info(
    `[coingecko] getDailyDataFromCoinGecko token ${token.symbol} does not meet minimum age threshold for hourlies`
  );

  return token;
};

const getMinutesDataFromCoinGecko = async (
  token: TokenPrices
): Promise<TokenPrices> => {
  let rangesToCheck = findMissingMinutes(token);

  if (!rangesToCheck || rangesToCheck.length === 0) {
    return token;
  }

  const newPrices = await Promise.all(
    rangesToCheck.map(async (range) => {
      Logger.info(
        `Calling coingecko for minutes prices for ${token.symbol} at ${token.address} on ${token.network.name} from ${range.from} to ${range.to}`
      );
      return getPriceDataFromCoingecko(token, range);
    })
  );

  if (token.minutes && token.minutes?.length > 0) {
    return {
      ...token,
      minutes: concat(token.minutes, ...flatten(newPrices)),
    };
  }

  return { ...token, minutes: flatten(newPrices) };
};

const getTokenDetails = (
  token: Partial<Token>,
  data: any
): Partial<TokenDetails> => {
  if (data?.contract_address && data?.symbol) {
    return {
      address: data.contract_address,
      symbol: data.symbol,
      name: data?.name,
      description: data?.description?.en,
      image: data?.image?.thumb,
      market_data: {
        current_price: data.market_data.current_price,
        price_change_24h_in_currency:
          data.market_data.price_change_24h_in_currency,
        price_change_percentage_24h:
          data.market_data.price_change_percentage_24h,
        market_cap: data.market_data.market_cap,
        total_volume: data.market_data.total_volume,
        total_supply: data.market_data.total_supply,
      },
    };
  }
  return token;
};

const mapToDb = (token: Token, price: number[]): PriceData => {
  return {
    tokenId: token.id,
    epoch: Math.round(DateTime.fromMillis(price[0]).toSeconds()),
    price: price[1].toString(),
  };
};

export {
  getDailyDataFromCoinGecko,
  getHourlyDataFromCoinGecko,
  getMinutesDataFromCoinGecko,
  getTokenInfoFromCoinGecko,
};
