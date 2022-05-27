import { ethers } from "ethers";
import { Position, Token } from "types";

import SetTokenAbi from "../../resources/setTokenAbi.json";
import ERC20Abi from "../../resources/erc20.json";

import { getTokenInfoFromCoinGecko } from "../sources";
import Logger from "../../lib/logger";
import { getProviderForToken } from "../helpers";

const getSetTokenPositions = async (token: Token): Promise<Position[]> => {
  const provider = getProviderForToken(token);
  const TOKENSET_CONTRACT = new ethers.Contract(
    token.address,
    SetTokenAbi,
    provider
  );

  return await TOKENSET_CONTRACT.getPositions()
    .then((res: any) => {
      return res;
    })
    .catch((e: { message: any }) => {
      Logger.error(
        `[getPositions]: Getting positions for ${token.symbol} on ${token.network.name} returned ${e.message}`
      );
      return [];
    });
};

const getSetTokenComponentInfo = async (token: Partial<Token>) => {
  if (!token.address) {
    Logger.debug(`[tokenset] no address found for ${token}`);
    return token;
  }
  const provider = getProviderForToken(token);

  let decimals = 18;
  let name = undefined;
  let symbol = undefined;
  
  const TOKEN_CONTRACT = new ethers.Contract(token.address, ERC20Abi, provider);

  decimals = await TOKEN_CONTRACT.decimals()
    .then((res: any) => res)
    .catch((e: { message: any }) =>
      Logger.error(
        `[tokenset] getSetTokenComponentInfo error getting decimals: ${e.message}`
      )
    );

  name = await TOKEN_CONTRACT.name()
    .then((res: any) => res)
    .catch((e: { message: any }) =>
      Logger.error(
        `[tokenset] getSetTokenComponentInfo error getting decimals: ${e.message}`
      )
    );

  symbol = await TOKEN_CONTRACT.symbol()
    .then((res: any) => res)
    .catch((e: { message: any }) =>
      Logger.error(
        `[tokenset] getSetTokenComponentInfo error getting decimals: ${e.message}`
      )
    );

  let tokenInfo = await getTokenInfoFromCoinGecko(token);
  return {
    ...tokenInfo,
    decimals,
    address: token.address.toLowerCase(),
    name: tokenInfo.name || name,
    symbol: tokenInfo.symbol || symbol,
  };
};

const getSetTokenSupply = async (setToken: Token) => {
  const provider = getProviderForToken(setToken);

  const TOKEN_CONTRACT = new ethers.Contract(
    setToken.address,
    SetTokenAbi,
    provider
  );

  const decimals = await TOKEN_CONTRACT.decimals()
    .then((res: any) => res)
    .catch((e: { message: any }) =>
      Logger.error(
        `[tokenset] getSetTokenSupply error getting decimals: ${e.message}`
      )
    );

  const totalSupply = await TOKEN_CONTRACT.totalSupply()
    .then((res: any) => res)
    .catch((e: { message: any }) =>
      Logger.error(
        `[tokenset] getSetTokenSupply error getting total supply: ${e.message}`
      )
    );

  return ethers.utils.formatUnits(totalSupply, decimals);
};

export { getSetTokenPositions, getSetTokenComponentInfo, getSetTokenSupply };
