client = {
  service: {
    name: "hasura",
    includes: ['./server/src/utils/**/*.ts'],
    localSchemaFile: "./server/src/resources/schema.graphql",
  },
};
