import { gql } from "apollo-boost";

const PRICES_DAILY = gql`
  query getTokenPricesDaily($addresses: [String!] = "", $fromEpoch: Int!) {
    prices_tokens(
      distinct_on: address
      where: { address: { _in: $addresses }, tradable: { _eq: true } }
    ) {
      id
      address
      creationEpoch
      symbol
      tokenset
      decimals
      network {
        chainId
        name
      }
      dailies(where: { epoch: { _gte: $fromEpoch } }) {
        price
        epoch
      }
    }
  }
`;
const PRICES_HOURLY = gql`
  query getTokenPricesHourly($addresses: [String!] = "", $fromEpoch: Int!) {
    prices_tokens(
      distinct_on: address
      where: { address: { _in: $addresses }, tradable: { _eq: true } }
    ) {
      id
      address
      creationEpoch
      symbol
      tokenset
      decimals
      network {
        chainId
        name
      }
      hourlies(where: { epoch: { _gte: $fromEpoch } }) {
        price
        epoch
      }
    }
  }
`;
const PRICES_MINUTES = gql`
  query getTokenPricesMinutes($addresses: [String!] = "", $fromEpoch: Int!) {
    prices_tokens(
      distinct_on: address
      where: { address: { _in: $addresses }, tradable: { _eq: true } }
    ) {
      id
      address
      creationEpoch
      symbol
      tokenset
      decimals
      network {
        chainId
        name
      }
      minutes(where: { epoch: { _gte: $fromEpoch } }) {
        price
        epoch
      }
    }
  }
`;

const PRICES_ALL = gql`
  query getTokenPricesAll($addresses: [String!] = "", $from: Int!) {
    prices_tokens(
      distinct_on: address
      where: { address: { _in: $addresses }, tradable: { _eq: true } }
    ) {
      id
      address
      creationEpoch
      symbol
      tokenset
      decimals
      network {
        chainId
        name
      }
      dailies(where: { epoch: { _gte: $from } }) {
        price
        epoch
      }
      hourlies(where: { epoch: { _gte: $from } }) {
        price
        epoch
      }
      minutes(where: { epoch: { _gte: $from } }) {
        price
        epoch
      }
    }
  }
`;

const SETTOKEN_TOKENS = gql`
  query getTokenSetTokens {
    prices_tokens(where: { tokenset: { _eq: true } }) {
      id
      address
      symbol
      network {
        chainId
        name
      }
    }
  }
`;

const TRADABLE_TOKENS = gql`
  query getTokens {
    prices_tokens(
      order_by: { symbol: asc }
      where: { tradable: { _eq: true } }
    ) {
      id
      address
      creationEpoch
      symbol
      tokenset
      decimals
      network {
        chainId
        name
      }
    }
  }
`;

const TOKEN_MARKET_DATA = gql`
  query getTokenMarketData($tokenIds: [Int!] = []) {
    prices_token_infos(where: { token: { id: { _in: $tokenIds } } }) {
      changePercentDay
      currentPrice
      marketCap
      tokenId
      totalSupply
      volumeDay
    }
  }
`;

const TOKEN_ID = gql`
  query getTokenId($address: String = "", $chainId: Int = 0) {
    prices_tokens(
      where: { address: { _eq: $address }, chainId: { _eq: $chainId } }
    ) {
      id
    }
  }
`;

export {
  PRICES_ALL,
  PRICES_DAILY,
  PRICES_HOURLY,
  PRICES_MINUTES,
  SETTOKEN_TOKENS,
  TRADABLE_TOKENS,
  TOKEN_ID,
  TOKEN_MARKET_DATA,
};
