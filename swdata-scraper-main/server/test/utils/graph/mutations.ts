import { graphClient, Mutations } from "../../../src/utils/graph";
import {
  MarketData,
  PriceData,
  Token,
  TokenSetAllocationData,
} from "../../../types/";

export const graphMutationsUnitTests = () => {
  describe("Mutations", () => {
    it("can insert token", async () => {
      const token: Partial<Token> = {
        address: "afsafgvrsecvs",
        symbol: "MCK",
        tokenset: true,
        tokensetComponent: true,
        tradable: true,
        chainId: "0x1",
      };

      const result = await graphClient.mutate({
        mutation: Mutations.INSERT_TOKEN,
        variables: {
          object: token,
        },
      });

      expect(result.errors).toBeUndefined();
      expect(result.data.insert_prices_tokens_one.id).toBeNumber();
    });

    it("can insert daily prices", async () => {
      const price: PriceData = {
        epoch: 1639862050,
        price: "9.7562468",
        tokenId: 1,
      };

      const prices = [10].map(() => price);

      const response = await graphClient.mutate({
        mutation: Mutations.INSERT_DAILY,
        variables: {
          objects: prices,
        },
      });

      expect(response.errors).toBeUndefined();
      expect(response.data.insert_prices_daily.affected_rows).toBeNumber();
    });

    it("can insert hourly prices", async () => {
      const price: PriceData = {
        epoch: 1639862050,
        price: "9.7562468",
        tokenId: 1,
      };

      const prices = [10].map(() => price);

      const response = await graphClient.mutate({
        mutation: Mutations.INSERT_HOURLY,
        variables: {
          objects: prices,
        },
      });

      expect(response.errors).toBeUndefined();
      expect(response.data.insert_prices_hourly.affected_rows).toBeNumber();
    });

    it("can insert minute prices", async () => {
      const price: PriceData = {
        epoch: 1639862050,
        price: "9.7562468",
        tokenId: 1,
      };

      const prices = [10].map(() => price);

      const response = await graphClient.mutate({
        mutation: Mutations.INSERT_MINUTES,
        variables: {
          objects: prices,
        },
      });

      expect(response.errors).toBeUndefined();
      expect(response.data.insert_prices_minutes.affected_rows).toBeNumber();
    });

    it("can insert token market data", async () => {
      const marketData: MarketData = {
        tokenId: 1,
        marketCap: "123214253",
        changePercentDay: "10",
        volumeDay: "123124214325325",
        totalSupply: "100000",
        currentPrice: "10",
      };

      const marketDatas = [10].map(() => marketData);

      const response = await graphClient.mutate({
        mutation: Mutations.INSERT_TOKEN_MARKET_DATA,
        variables: {
          objects: marketDatas,
        },
      });

      expect(response.errors).toBeUndefined();
      expect(
        response.data.insert_prices_token_infos.affected_rows
      ).toBeNumber();
    });

    it("can insert tokenset allocation data", async () => {
      const tokenAllocationdata: TokenSetAllocationData = {
        tokenId: 1,
        setTokenId: 2,
        icon: "http://example.com/image.jps",
        fullAmountInSet: "10",
        percentOfSet: "25.25",
        quantity: "12214321535235535",
        priceChange24Hr: "1.213",
        currentPrice: "4321",
      };

      const allocationData = [2].map(() => tokenAllocationdata);

      const response = await graphClient.mutate({
        mutation: Mutations.INSERT_TOKENSET_ALLOCATIONS,
        variables: {
          objects: allocationData,
        },
      });

      expect(response.errors).toBeUndefined();
      expect(
        response.data.insert_prices_tokenset_allocations.affected_rows
      ).toBeNumber();
    });

    it("Rejects faulty input", async () => {
      expect.assertions(6);
      const faultyInput = [2].map(() => {
        return { foo: "lalala", bar: "kakaka" };
      });

      await graphClient
        .mutate({
          mutation: Mutations.INSERT_DAILY,
          variables: {
            objects: faultyInput,
          },
        })
        .catch((e) =>
          expect(e.message).toMatch(
            "Network error: Response not successful: Received status code 400"
          )
        );

      await graphClient
        .mutate({
          mutation: Mutations.INSERT_HOURLY,
          variables: {
            objects: faultyInput,
          },
        })
        .catch((e) =>
          expect(e.message).toMatch(
            "Network error: Response not successful: Received status code 400"
          )
        );

      await graphClient
        .mutate({
          mutation: Mutations.INSERT_MINUTES,
          variables: {
            objects: faultyInput,
          },
        })
        .catch((e) =>
          expect(e.message).toMatch(
            "Network error: Response not successful: Received status code 400"
          )
        );

      await graphClient
        .mutate({
          mutation: Mutations.INSERT_TOKEN,
          variables: {
            object: faultyInput[0],
          },
        })
        .catch((e) =>
          expect(e.message).toMatch(
            "Network error: Response not successful: Received status code 400"
          )
        );

      await graphClient
        .mutate({
          mutation: Mutations.INSERT_TOKENSET_ALLOCATIONS,
          variables: {
            objects: faultyInput,
          },
        })
        .catch((e) =>
          expect(e.message).toMatch(
            "Network error: Response not successful: Received status code 400"
          )
        );

      await graphClient
        .mutate({
          mutation: Mutations.INSERT_TOKEN_MARKET_DATA,
          variables: {
            objects: faultyInput,
          },
        })
        .catch((e) =>
          expect(e.message).toMatch(
            "Network error: Response not successful: Received status code 400"
          )
        );
    });
  });
};
