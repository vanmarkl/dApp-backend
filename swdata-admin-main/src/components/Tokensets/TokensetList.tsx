import React from "react";
import {
  BooleanField,
  CreateButton,
  Datagrid,
  FilterButton,
  FunctionField,
  List,
  NumberField,
  ReferenceField,
  ReferenceInput,
  SearchInput,
  SelectInput,
  TextField,
  TextInput,
  TopToolbar,
} from "react-admin";
import { ImportButton } from "react-admin-import-csv";
import { DateTime } from "luxon";

const tokensFilters = [
  <SearchInput source="symbol" />,
  <ReferenceInput
    label="Network"
    source="networkId"
    reference="prices_networks"
    sortBy="id"
  >
    <SelectInput source="name" />
  </ReferenceInput>,
];

const ListActions = (props: any) => {
  const { className, basePath } = props;
  return (
    <TopToolbar className={className}>
      <FilterButton />
      <ImportButton {...props} />
      <CreateButton basePath={basePath} />
    </TopToolbar>
  );
};

const TokenList = (props: any) => (
  <List
    filters={tokensFilters}
    actions={<ListActions />}
    title={"Tokens"}
    {...props}
  >
    <Datagrid rowClick="edit">
      <ReferenceField source="tokenId" reference="prices_tokens">
        <TextField source="symbol" />
      </ReferenceField>
      <ReferenceField source="setTokenId" reference="prices_tokens">
        <TextField source="symbol" />
      </ReferenceField>
      <TextField source="currentPrice" />
      <TextField source="fullAmountInSet" />
      <TextField source="icon" />
      <TextField source="id" />
      <TextField source="percentOfSet" />
      <TextField source="priceChange24Hr" />
      <TextField source="quantity" />
    </Datagrid>
  </List>
);

export default TokenList;
