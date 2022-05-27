import mockGraph from "../../config/mockGraph";
import { graphClientUnitTests } from "./client";
import { graphMutationsUnitTests } from "./mutations";
import { graphOperationsUnitTests } from "./operations";

const graph = mockGraph();
beforeAll(async () => {
  await graph.listen({ port: 8080 }).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
});

afterAll(async () => {
  await graph.stop().then(() => {
    console.log(`🚀 Apollo down`);
  });
});

//TODO type validation
describe("Graph unit tests", () => {
  graphClientUnitTests();
  graphOperationsUnitTests();
  graphMutationsUnitTests();
});
