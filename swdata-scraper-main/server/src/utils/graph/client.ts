import ApolloClient, { InMemoryCache } from "apollo-boost";
import "cross-fetch/polyfill";
import Logger from "../../lib/logger";

const url =
  process.env.HASURA_GQL_ENDPOINT || "http://localhost:8080/v1/graphql";

const client = new ApolloClient({
  uri: url,
  cache: new InMemoryCache({ resultCaching: false }),
  onError: ({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
      graphQLErrors.forEach(({ message, locations, path }) =>
        Logger.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        )
      );

    if (networkError) Logger.error(`[Network error]: ${networkError}`);
  },
  headers: {
    "x-hasura-admin-secret": process.env.HASURA_SECRET || "",
  },
});

export default client;
