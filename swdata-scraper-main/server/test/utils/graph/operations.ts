import { graphClient, Operations } from "../../../src/utils/graph";

export const graphOperationsUnitTests = () => {
  describe("Operations", () => {
    it("Can get daily prices", async () => {
      const response = await graphClient.query({
        query: Operations.PRICES_DAILY,
      });

      expect(response.errors).toBeUndefined();

      const firstToken = response.data.prices_tokens[0];

      expect(firstToken.symbol === "MCK");
      expect(firstToken.tokenset).toBe(true);
      expect(firstToken.dailies[0]).toEqual(
        expect.objectContaining({ __typename: "prices_daily" })
      );
      expect(firstToken.hourlies).toBeUndefined();
      expect(firstToken.minutes).toBeUndefined();
    });

    it("Can get hourly prices", async () => {
      const response = await graphClient.query({
        query: Operations.PRICES_HOURLY,
      });

      expect(response.errors).toBeUndefined();

      const firstToken = response.data.prices_tokens[0];

      expect(firstToken.symbol === "MCK");
      expect(firstToken.tokenset).toBe(true);
      expect(firstToken.dailies).toBeUndefined();
      expect(firstToken.hourlies[0]).toEqual(
        expect.objectContaining({ __typename: "prices_hourly" })
      );
      expect(firstToken.minutes).toBeUndefined();
    });

    it("Can get minute prices", async () => {
      const response = await graphClient.query({
        query: Operations.PRICES_MINUTES,
      });

      expect(response.errors).toBeUndefined();

      const firstToken = response.data.prices_tokens[0];

      expect(firstToken.symbol === "MCK");
      expect(firstToken.tokenset).toBe(true);
      expect(firstToken.dailies).toBeUndefined();
      expect(firstToken.hourlies).toBeUndefined();
      expect(firstToken.minutes[0]).toEqual(
        expect.objectContaining({ __typename: "prices_minutes" })
      );
    });

    it("Can get all prices", async () => {
      const response = await graphClient.query({
        query: Operations.PRICES_ALL,
      });

      expect(response.errors).toBeUndefined();

      const firstToken = response.data.prices_tokens[0];

      expect(firstToken.symbol === "MCK");
      expect(firstToken.tokenset).toBe(true);
      expect(firstToken.dailies[0]).toEqual(
        expect.objectContaining({ __typename: "prices_daily" })
      );
      expect(firstToken.hourlies[0]).toEqual(
        expect.objectContaining({ __typename: "prices_hourly" })
      );
      expect(firstToken.minutes[0]).toEqual(
        expect.objectContaining({ __typename: "prices_minutes" })
      );
    });

    it("Can get all settokens", async () => {
      const response = await graphClient.query({
        query: Operations.SETTOKEN_TOKENS,
      });

      expect(response.errors).toBeUndefined();

      const firstToken = response.data.prices_tokens[0];
      expect(firstToken.symbol).toMatch("MCK");
      expect(firstToken.address.toLowerCase()).toMatch(
        "0xabcde619a4b46a6da29355023e0533a1332c7d84"
      );
      expect(firstToken.network.name).toMatch("testnet");
    });

    //TODO mock tradable/non-tradable
    it("Can get all tradable tokens", async () => {
      const response = await graphClient.query({
        query: Operations.TRADABLE_TOKENS,
      });

      expect(response.errors).toBeUndefined();

      const firstToken = response.data.prices_tokens[0];
      expect(firstToken.symbol).toMatch("MCK");
      expect(firstToken.address).toMatch(
        "0xABCDE619a4B46A6da29355023E0533a1332c7D84"
      );
      expect(firstToken.network.name).toMatch("testnet");
    });
  });
};
