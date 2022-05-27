import Logger from "../../lib/logger";
import { PriceData, Token } from "types";
import { DateTime } from "luxon";
import api from "../axios";
import { utils } from "ethers";

const urls = {
  mainnet: process.env.OX_MAINNET || "https://api.0x.org",
  polygon: process.env.OX_POLYGON || "https://polygon.api.0x.org",
};

const USDC = {
  mainnet:
    process.env.USDC_MAINNET || "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  polygon:
    process.env.USDC_POLYGON || "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
};

const getApiUrl = (token: Token) => {
  let url = "";

  switch (token.network.chainId.toString()) {
    case "0x1":
      url = urls.mainnet;
      break;
    case "0x89":
      url = urls.polygon;
      break;
    default:
      break;
  }

  return url;
};

const getUSDCAddress = (token: Token) => {
  let address = "";
  switch (token.network.chainId.toString()) {
    case "0x1":
      address = USDC.mainnet;
      break;
    case "0x89":
      address = USDC.polygon;
      break;
    default:
      break;
  }

  return address;
};

const getPriceAgainstUSDCfrom0x = async (token: Token) => {
  const path = `/swap/v1/price`;

  const cacheOptions = {
    maxAge: 1000,
  };

  const url = getApiUrl(token);
  const usdc = getUSDCAddress(token);
  const params = {
    buyToken: token.address,
    sellToken: usdc,
    sellAmount: utils.parseUnits("1", 6).toString(), 
  };

  return await api
    .get(`${url}${path}`, { params, cache: cacheOptions })
    .then((response) => response.data.price)
    .then((price) => mapToDb(token, price))
    .then((priceData) => tokenPriceToUSD(priceData))
    .catch((error) => {
      Logger.error(
        `[0x]: Getting ${token.symbol} on ${token.network.name} price ${error}`
      );
      return {} as PriceData;
    });
};

const mapToDb = (token: Token, price: string): PriceData => {
  return {
    tokenId: token.id,
    epoch: Math.round(DateTime.now().toSeconds()),
    price,
  };
};

const tokenPriceToUSD = (priceData: PriceData): PriceData => {
  const USDprice = 1 / Number(priceData.price);
  return { ...priceData, price: USDprice.toString() };
};

export { getPriceAgainstUSDCfrom0x };
