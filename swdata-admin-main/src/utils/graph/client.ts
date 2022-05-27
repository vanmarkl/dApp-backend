import ApolloClient, { InMemoryCache } from "apollo-boost";
import "cross-fetch/polyfill";

const url =
  process.env.REACT_APP_HASURA_GQL_ENDPOINT ||
  "http://localhost:8080/v1/graphql";

console.log("HASURA ENDPOINT: ", url);

const client = new ApolloClient({
  uri: url,
  cache: new InMemoryCache({ resultCaching: false }),
  onError: ({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        )
      );

    if (networkError) console.error(`[Network error]: ${networkError}`);
  },
  headers: {
    "x-hasura-admin-secret": process.env.REACT_APP_HASURA_SECRET || "",
  },
});

export default client;
