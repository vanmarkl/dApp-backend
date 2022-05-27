import { ethers } from "ethers";
import _ from "lodash";
import Logger from "../../lib/logger";
import {
  AllocationData,
  MarketData,
  Position,
  PriceData,
  Token,
  TokenDetails,
  TokenSetAllocationData,
} from "types";
import { graphClient, Mutations, Operations } from "../graph";
import { SetTokenGetters, TokenGetters } from "../tokens";
import {
  getSetTokenComponentInfo,
  getSetTokenSupply,
} from "../tokens/tokenset";
import BigNumber from "bignumber.js";
import {
  insertAllocationData,
  insertMarketData,
  insertPricesMinutes,
} from "./insertPriceDataGraph";
import { DateTime } from "luxon";

//TODO cleanup and reduce into methods
const collectAndInsertTokenSetAllocationData = async () => {
  // Get all tokens that are a tokenset
  const setTokens = await TokenGetters.getSetTokenTokens();
  Logger.info(
    `SetTokens: ${setTokens.map((token: Token) => token.symbol).toString()}`
  );
  const setTokenMarketData = await TokenGetters.getTokenMarketData(
    setTokens.map((token: Token) => token.id)
  );

  // For every tokenset get positions (components and values)
  const tokenPositions = await Promise.all(
    setTokens.map((token) => SetTokenGetters.getSetTokenPositions(token))
  );

  // For every component (token) get current price data
  const positionInfo = await Promise.all(
    tokenPositions.map(
      async (token, index) =>
        await Promise.all(
          token.map(
            async (position) =>
              await getSetTokenComponentInfo({
                network: setTokens[index].network,
                address: position.component,
              })
          )
        )
    )
  );

  // For every component (token) get allocation data
  const tokensAllocationData = positionInfo.map((token, tokenIndex) =>
    token.map((info, positionIndex) =>
      mapInfoToAllocationData(
        info,
        tokenPositions[tokenIndex][positionIndex],
        setTokens[tokenIndex]
      )
    )
  );

  // Calculate total value in fiat
  const totalValueTokenset = tokensAllocationData.map((token) =>
    token.reduce((prev, next) => {
      const toAdd = Number(next?.fullAmountInSet) || 0;
      return prev + toAdd;
    }, 0)
  );

  // Calculate proporti0nal value
  const tokensAllocationDataWithPercentages = tokensAllocationData.map(
    (token, tokenIndex) =>
      token.map((allocationData, positionIndex) => {
        if (allocationData.fullAmountInSet) {
          const valuePercentage =
            Number(allocationData.fullAmountInSet) /
            totalValueTokenset[tokenIndex];
          return {
            ...allocationData,
            percentOfSet: valuePercentage.toString(),
          };
        }

        return allocationData;
      })
  );

  const tokensInTokenSet = _.flatten(
    tokensAllocationDataWithPercentages.map((tokenAllocationdata, tokenIndex) =>
      tokenAllocationdata.map((allocationData, positionIndex) =>
        generateToken(
          setTokens[tokenIndex],
          tokenPositions[tokenIndex][positionIndex],
          allocationData
        )
      )
    )
  );

  // Try to store every component (token) in tokens
  tokensInTokenSet.map((object) => {
    graphClient
      .mutate({
        mutation: Mutations.INSERT_TOKEN,
        variables: { object },
      })
      .then(() =>
        Logger.info(
          `Stored ${object.symbol} as tokensetcomponent on ${object.chainId}`
        )
      )
      .catch((e) => Logger.error(`Error inserting ${object.symbol}: ${e}`));
  });

  // Store every component in tokenset_allocations based on (setTokenId, tokenId)
  const allocationDataEntries = _.flatten(
    await Promise.all(
      tokensAllocationDataWithPercentages.map(
        async (tokenAllocationdata, tokenIndex) =>
          await Promise.all(
            tokenAllocationdata.map(
              async (allocationData, positionIndex) =>
                await generateAllocationDataEntry(
                  setTokens[tokenIndex],
                  tokenPositions[tokenIndex][positionIndex],
                  allocationData,
                  totalValueTokenset[tokenIndex]
                )
            )
          )
      )
    )
  );

  await insertAllocationData(allocationDataEntries);

  //Store tokenset price based on component calculations
  const updatedMarketData = await Promise.all(
    setTokens.map(async (setToken, index) => {
      let totalSupply = new BigNumber(await getSetTokenSupply(setToken));
      const currentPrice = totalValueTokenset[index];
      const marketCap = totalSupply.multipliedBy(currentPrice);

      const _marketData = setTokenMarketData.find(
        (marketData) => marketData.tokenId === setToken.id
      );

      const updatedMarketData = {
        tokenId: setToken.id,
        changePercentDay: _marketData?.changePercentDay,
        volumeDay: _marketData?.volumeDay,
        marketCap: marketCap.toString(),
        currentPrice: currentPrice.toString(),
        totalSupply: totalSupply.toString(),
      } as MarketData;

      return updatedMarketData;
    })
  );

  await insertMarketData(updatedMarketData);

  const minuteTimestamp = DateTime.now().startOf("minute").toSeconds();
  const priceData: PriceData[] = updatedMarketData.map((marketData) => {
    return {
      tokenId: marketData.tokenId,
      price: marketData.currentPrice,
      epoch: minuteTimestamp,
    };
  });

  await insertPricesMinutes(priceData).then((res) =>
    Logger.debug(`Inserted ${res} minute prices`)
  );
};

//TODO call 0x for current price if unknown
const mapInfoToAllocationData = (
  info: Partial<TokenDetails>,
  position: Position,
  setToken: Token
): AllocationData => {
  let fullAmount = "0";
  if (info.market_data?.current_price.usd) {
    fullAmount = (
      +ethers.utils.formatUnits(position.unit, info.decimals) *
      +info?.market_data?.current_price?.usd
    ).toString();
  }

  return {
    tokenAddress: position.component.toLowerCase(),
    tokenSetAddres: setToken.address.toLowerCase(),
    changePercent1Day: info.market_data?.price_change_percentage_24h.toString(),
    currentPrice: info.market_data?.current_price.usd.toString(),
    fullAmountInSet: fullAmount,
    icon: info?.image?.toString(),
    name: info.name,
    percentOfSet: "0",
    quantity: position.unit.toString(),
    symbol: info?.symbol || "",
  };
};

const generateToken = (
  setToken: Token,
  position: Position,
  allocationData: Partial<AllocationData>
) => {
  return {
    symbol: allocationData.symbol?.toUpperCase(),
    address: position.component.toLowerCase(),
    chainId: setToken.network.id,
    tokenset: false,
    tokensetComponent: true,
    tradable: false,
  } as Partial<Token>;
};

const generateAllocationDataEntry = async (
  setToken: Token,
  position: Position,
  allocationData: Partial<AllocationData>,
  totalValueSet: number
) => {
  const tokenId = await graphClient
    .query({
      query: Operations.TOKEN_ID,
      variables: {
        address: position.component.toLowerCase(),
        chainId: setToken.network.chainId.toString(),
      },
    })
    .then((res) => res.data.prices_tokens[0].id);

  return {
    tokenId: tokenId,
    setTokenId: setToken.id,
    icon: allocationData.icon,
    fullAmountInSet: allocationData.fullAmountInSet,
    percentOfSet: (
      (Number(allocationData.fullAmountInSet) / totalValueSet) *
      100
    ).toString(),
    quantity: allocationData.quantity,
    priceChange24Hr: allocationData.changePercent1Day,
    currentPrice: allocationData.currentPrice,
  } as TokenSetAllocationData;
};

export { collectAndInsertTokenSetAllocationData };
