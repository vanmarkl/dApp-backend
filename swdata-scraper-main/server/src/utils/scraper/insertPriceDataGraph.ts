import { MarketData, PriceData, TokenSetAllocationData } from "types";
import Logger from "../../lib/logger";
import { graphClient, Mutations } from "../graph";

const insertPricesDaily = async (objects: PriceData[]) => {
  Logger.info(`[insertPriceData] Inserting ${objects.length} daily prices`);
  return graphClient
    .mutate({
      mutation: Mutations.INSERT_DAILY,
      variables: { objects },
    })
    .then((res) => {
      return res;
    })
    .catch((e) =>
      Logger.error(
        `[insertPriceDataGraph] error inserting dailies ${e.message}`
      )
    );
};

const insertPricesHourly = async (objects: PriceData[]) => {
  Logger.info(`[insertPriceData] Inserting ${objects.length} hourly prices`);
  return graphClient
    .mutate({
      mutation: Mutations.INSERT_HOURLY,
      variables: { objects },
    })
    .then((res) => {
      return res;
    })
    .catch((e) =>
      Logger.error(
        `[insertPriceDataGraph] error inserting hourlies ${e.message}`
      )
    );
};

const insertPricesMinutes = async (objects: PriceData[]) => {
  Logger.info(`[insertPriceData] Inserting ${objects.length} minute prices`);
  return graphClient
    .mutate({
      mutation: Mutations.INSERT_MINUTES,
      variables: { objects },
    })
    .then((res) => {
      return res;
    })
    .catch((e) =>
      Logger.error(
        `[insertPriceDataGraph] error inserting minutes ${e.message}`
      )
    );
};

const insertMarketData = async (objects: Partial<MarketData>[]) => {
  Logger.info(`[insertPriceData] Inserting ${objects.length} market data sets`);
  return graphClient.mutate({
    mutation: Mutations.INSERT_TOKEN_MARKET_DATA,
    variables: { objects },
  });
};

const insertAllocationData = async (objects: TokenSetAllocationData[]) => {
  await graphClient
    .mutate({
      mutation: Mutations.INSERT_TOKENSET_ALLOCATIONS,
      variables: { objects },
    })
    .then(() =>
      Logger.info(
        `[tokensetHandler] collectAndInsertTokenSetAllocationData succesful for ${objects
          .keys()
          .toString()}`
      )
    )
    .catch((e) =>
      Logger.error(`[tokensetHandler] Error inserting: ${e.message}`)
    );
};

export {
  insertPricesDaily,
  insertPricesHourly,
  insertPricesMinutes,
  insertMarketData,
  insertAllocationData,
};
