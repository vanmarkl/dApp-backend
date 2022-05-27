import Logger from "../../lib/logger";
import ApolloClient, { DocumentNode, gql } from "apollo-boost";
import { PriceData, Token, TokenPrices } from "types";
import concat from "lodash/concat";

type SushiTokenPriceData = {
  date: number;
  priceUSD: string;
};

// https://thegraph.com/hosted-service/subgraph/sushiswap/exchange
const urls = {
  mainnet:
    process.env.SUSHIGRAPH_MAINNET ||
    "https://api.thegraph.com/subgraphs/name/sushiswap/exchange",
  polygon:
    process.env.SUSHIGRAPH_POLYGON ||
    "https://api.thegraph.com/subgraphs/name/sushiswap/matic-exchange",
};

const queryTokensDayData = gql`
  query tokens($id: String!) {
    tokens(where: { id: $id }) {
      id
      symbol
      name
      dayData {
        date
        priceUSD
      }
    }
  }
`;

const queryTokensHourlyData = gql`
  query tokens($id: String!) {
    tokens(where: { id: $id }) {
      id
      symbol
      name
      hourData {
        date
        priceUSD
      }
    }
  }
`;

const getClient = (token: Token) => {
  let client = new ApolloClient({
    uri: urls.mainnet,
  });
  switch (token.network.chainId.toString()) {
    case "1":
      client = new ApolloClient({
        uri: urls.mainnet,
      });
      break;
    case "80001":
      client = new ApolloClient({
        uri: urls.polygon,
      });
      break;
    default:
      break;
  }

  return client;
};

// TODO array of IDs
const getTokenDataFromSushiGraph = async (
  token: TokenPrices,
  query: DocumentNode
) => {
  const client = getClient(token);
  return await client
    .query({
      query,
      variables: { id: token.address },
    })
    .then((res) => res.data.tokens[0])
    .catch((err) => Logger.error(`ERR: ${JSON.stringify(err)}`));
};

const getDailyDataFromSushiGraph = async (
  token: TokenPrices
): Promise<TokenPrices> => {
  return await getTokenDataFromSushiGraph(token, queryTokensDayData)
    .then((res) => {
      let _token = token;
      if (res.dayData) {
        const priceData: PriceData[] = res.dayData.map(
          (data: SushiTokenPriceData) => mapToDb(token, data)
        );
        if (token.dailies && token.dailies.length > 0) {
          _token = { ..._token, dailies: concat(token.dailies, priceData) };
        } else {
          _token = { ..._token, dailies: priceData };
        }
      }
      return token;
    })
    .catch((err) => {
      Logger.error(err);
      return token;
    });
};

const getHourlyDataFromSushiGraph = async (
  token: TokenPrices
): Promise<TokenPrices> => {
  return await getTokenDataFromSushiGraph(token, queryTokensHourlyData)
    .then((res) => {
      let _token = token;
      if (res.hourData) {
        const priceData: PriceData[] = res.hourData.map(
          (data: SushiTokenPriceData) => mapToDb(token, data)
        );
        if (token.hourlies && token.hourlies.length > 0) {
          _token = { ..._token, hourlies: concat(token.hourlies, priceData) };
        } else {
          _token = { ..._token, hourlies: priceData };
        }
      }
      return token;
    })
    .catch((err) => {
      Logger.error(err);
      return token;
    });
};

const mapToDb = (token: Token, data: SushiTokenPriceData): PriceData => {
  return {
    tokenId: token.id,
    epoch: data.date,
    price: data.priceUSD,
  };
};

export { getDailyDataFromSushiGraph, getHourlyDataFromSushiGraph };
