import React from "react";
import {
  Datagrid,
  List,
  TextField,
  NumberField,
  FunctionField,
  TopToolbar,
} from "react-admin";
import {
  CreateButton,
  FilterButton,
  NumberInput,
  ReferenceField,
} from "ra-ui-materialui";
import { DateTime } from "luxon";

const pricesFilters = [<NumberInput label="Token" source="tokenId" alwaysOn />];

const ListActions = (props: any) => {
  const { className, basePath } = props;
  return (
    <TopToolbar className={className}>
      <FilterButton />
      <CreateButton basePath={basePath} />
    </TopToolbar>
  );
};

const PricesList = (props: any) => (
  <List
    title={"Available tokens"}
    filters={pricesFilters}
    actions={<ListActions />}
    {...props}
  >
    <Datagrid rowClick="edit">
      <ReferenceField
        label="Token"
        source="tokenId"
        reference="prices_tokens"
        sortBy="name"
      >
        <TextField source="symbol" />
      </ReferenceField>
      <ReferenceField
        label="Chain"
        source="tokenId"
        reference="prices_tokens"
        sortBy="name"
      >
        <NumberField source="chainId" />
      </ReferenceField>
      <TextField source="price" />
      <TextField source="epoch" />
      <FunctionField
        label="DateTime"
        render={(record: any) => DateTime.fromSeconds(record.epoch).toString()}
      />
    </Datagrid>
  </List>
);

export default PricesList;
