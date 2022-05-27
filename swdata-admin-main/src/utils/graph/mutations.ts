import { gql } from "apollo-boost";

const INSERT_DAILY = gql`
  mutation insertPricesDaily($objects: [prices_daily_insert_input!] = {}) {
    insert_prices_daily(
      objects: $objects
      on_conflict: { constraint: daily_tokenId_price_epoch_key }
    ) {
      affected_rows
    }
  }
`;

const INSERT_HOURLY = gql`
  mutation insertPricesHourly($objects: [prices_hourly_insert_input!] = {}) {
    insert_prices_hourly(
      objects: $objects
      on_conflict: { constraint: hourly_tokenId_price_epoch_key }
    ) {
      affected_rows
    }
  }
`;

const INSERT_MINUTES = gql`
  mutation insertPricesMinutes($objects: [prices_minutes_insert_input!] = {}) {
    insert_prices_minutes(
      objects: $objects
      on_conflict: { constraint: minutes_tokenId_price_epoch_key }
    ) {
      affected_rows
    }
  }
`;

const INSERT_TOKENSET_ALLOCATIONS = gql`
  mutation insertTokenSetAllocations(
    $objects: [prices_tokenset_allocations_insert_input!] = {}
    $update_columns: [prices_tokenset_allocations_update_column!] = [
      currentPrice
      fullAmountInSet
      icon
      percentOfSet
      priceChange24Hr
      quantity
    ]
  ) {
    insert_prices_tokenset_allocations(
      on_conflict: {
        constraint: tokenset_allocations_setTokenId_tokenId_key
        update_columns: $update_columns
      }
      objects: $objects
    ) {
      affected_rows
    }
  }
`;

const INSERT_TOKEN = gql`
  mutation insertToken(
    $object: prices_tokens_insert_input! = {}
    $update_columns: [prices_tokens_update_column!] = [tokensetComponent]
  ) {
    insert_prices_tokens_one(
      object: $object
      on_conflict: {
        constraint: tokens_address_chainId_key
        update_columns: $update_columns
      }
    ) {
      id
    }
  }
`;

const INSERT_TOKEN_MARKET_DATA = gql`
  mutation insertTokenMarketData(
    $objects: [prices_token_infos_insert_input!] = {}
    $update_columns: [prices_token_infos_update_column!] = [
      changePercentDay
      currentPrice
      marketCap
      totalSupply
      volumeDay
    ]
  ) {
    insert_prices_token_infos(
      objects: $objects
      on_conflict: {
        constraint: token_info_tokenId_key
        update_columns: $update_columns
      }
    ) {
      affected_rows
    }
  }
`;

export {
  INSERT_DAILY,
  INSERT_HOURLY,
  INSERT_MINUTES,
  INSERT_TOKENSET_ALLOCATIONS,
  INSERT_TOKEN,
  INSERT_TOKEN_MARKET_DATA,
};
