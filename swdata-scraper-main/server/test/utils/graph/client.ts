import { graphClient, Operations } from "../../../src/utils/graph";

export const graphClientUnitTests = () => {
  describe("Graph client", () => {
    it("can connect to (mock) Graph server", async () => {
      const result = await graphClient.query({
        query: Operations.SETTOKEN_TOKENS,
      });

      expect(result.errors).toBeUndefined();
      expect(result.data.prices_tokens[0].symbol === "MCK");
    });
  });
};
