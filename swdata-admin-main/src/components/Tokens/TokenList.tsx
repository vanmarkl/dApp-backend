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
      <TextField source="address" />
      <TextField source="symbol" />
      <TextField source="creationEpoch" />
      <FunctionField
        label="Creation Date"
        render={(record: any) =>
          DateTime.fromSeconds(record.creationEpoch).toLocaleString()
        }
      />
      <ReferenceField
        label="Network"
        source="chainId"
        reference="prices_networks"
      >
        <TextField source="name" />
      </ReferenceField>
      <BooleanField source="tradable" />
      <BooleanField source="tokenset" />
      <BooleanField source="tokensetComponent" />
      <NumberField source="decimals" />
    </Datagrid>
  </List>
);

export default TokenList;
