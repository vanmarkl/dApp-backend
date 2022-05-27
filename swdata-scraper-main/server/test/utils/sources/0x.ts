import axios from "../../../src/utils/axios";
import { getPriceAgainstUSDCfrom0x } from "../../../src/utils/sources/0x";
import { Token } from "../../../types";
import MockAdapter from "axios-mock-adapter";
import { ethers } from "ethers";

const mockAdapter = new MockAdapter(axios);

export const source0xUnitTests = () => {
  beforeEach(() => mockAdapter.reset());

  describe("0x", () => {
    it("calls 0x for token price Polygon", async () => {
      const token: Token = {
        id: 1,
        symbol: "MCK",
        address: "lalalalalallalala-poly",
        chainId: "0x89",
        creationEpoch: 121434235,
        tokenset: true,
        decimals: 18,
        tokensetComponent: true,
        tradable: true,
        network: { name: "testnet", chainId: "0x89" },
      };

      const params = {
        buyToken: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        sellToken: token.address,
        sellAmount: ethers.utils.parseUnits("1", token.decimals).toString(),
      };

      const mockResponse = { price: "1234235" };

      mockAdapter
        .onGet("https://polygon.api.0x.org/swap/v1/price", params)
        .reply(200, mockResponse);

      expect(await getPriceAgainstUSDCfrom0x(token)).toEqual(
        expect.objectContaining({
          tokenId: token.id,
          price: mockResponse.price,
        })
      );
    });

    it("calls 0x for token price mainnet", async () => {
      const token: Token = {
        id: 2,
        symbol: "MCK",
        address: "lalalalalallalala",
        chainId: "0x1",
        creationEpoch: 121434235,
        tokenset: true,
        decimals: 18,
        tokensetComponent: true,
        tradable: true,
        network: { name: "testnet", chainId: "0x1" },
      };

      const params = {
        buyToken: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        sellToken: token.address,
        sellAmount: ethers.utils.parseUnits("1", token.decimals).toString(),
      };

      const mockResponse = { price: "1234235" };

      mockAdapter
        .onGet("https://api.0x.org/swap/v1/price", params)
        .reply(200, mockResponse);

      expect(await getPriceAgainstUSDCfrom0x(token)).toEqual(
        expect.objectContaining({
          tokenId: token.id,
          price: mockResponse.price,
        })
      );
    });

    it("Returns empty object on error", async () => {
      const token: Token = {
        id: 2,
        symbol: "MCK",
        address: "lalalalalallalala",
        chainId: "0x1",
        creationEpoch: 121434235,
        tokenset: true,
        decimals: 18,
        tokensetComponent: true,
        tradable: true,
        network: { name: "testnet", chainId: "0x1" },
      };

      mockAdapter.onGet("https://api.0x.org/swap/v1/price").networkError;

      expect(await getPriceAgainstUSDCfrom0x(token)).toBeEmptyObject();
    });
  });
};
