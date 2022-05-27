type Token = {
  id: number;
  symbol: string;
  address: string;
  chainId: number;
  creationEpoch: number;
  tokenset: boolean;
  decimals: number;
  tokensetComponent: boolean;
  tradable: boolean;
  network: Network;
  calledCoinGeckoDailies: boolean;
  calledCoinGeckoHourlies: boolean;
  calledCoinGeckoMinutes: boolean;
};

type Network = {
  id: number;
  chainId: string;
  name: string;
};

type PriceData = {
  tokenId: number;
  price: string;
  epoch: number;
};

type Timerange = {
  from: number;
  to: number;
};

type Details = {
  name: string;
  image: string;
  description: { [key: string]: string };
  market_data: {
    price_change_percentage_24h: number;
    price_change_24h_in_currency: Record<string, number>;
    current_price: Record<string, number>;
    market_cap: Record<string, number>;
    total_volume: Record<string, number>;
    total_supply: number;
  };
};

type Position = {
  component: string;
  module: string;
  unit: number;
  positionState: number;
  data: any;
};

type AllocationData = {
  tokenAddress: string;
  tokenSetAddres: string;
  changePercent1Day?: string;
  currentPrice?: string;
  fullAmountInSet: string;
  icon?: string;
  name?: string;
  percentOfSet: string;
  quantity: string;
  symbol: string;
};

type MarketData = {
  tokenId: number;
  marketCap: string;
  changePercentDay: string;
  volumeDay: string;
  totalSupply: string;
  currentPrice: string;
};

interface TokenPrices extends Token {
  dailies?: PriceData[];
  hourlies?: PriceData[];
  minutes?: PriceData[];
}

interface TokenDetails extends Token, Details {}

interface TokenSetAllocationData {
  tokenId: number;
  setTokenId: number;
  icon: string;
  fullAmountInSet: string;
  percentOfSet: string;
  quantity: string;
  priceChange24Hr: string;
  currentPrice: string;
}

type AppState = {
  updatingDailies: boolean;
  updatingHourlies: boolean;
  calculatingHourlies: boolean;
  updatingMinutes: boolean;
  updatingTokenSetComponentData: boolean;
  updatingCurrentPrices: boolean;
  updatingCurrentMarketData: boolean;
  setUpdatingDailies: (state: boolean) => void;
  setUpdatingHourlies: (state: boolean) => void;
  setCalculatingHourlies: (state: boolean) => void;
  setUpdatingMinutes: (state: boolean) => void;
  setUpdatingTokenSetComponentData: (state: boolean) => void;
  setUpdatingCurrentPrices: (state: boolean) => void;
  setUpdatingCurrentMarketData: (state: boolean) => void;
};

export {
  Token,
  PriceData,
  Details,
  AllocationData,
  Position,
  TokenPrices,
  TokenDetails,
  TokenSetAllocationData,
  AppState,
  Timerange,
  MarketData,
};
