import React from "react";
import {
  BooleanInput,
  Create,
  NumberInput,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  TextInput,
} from "react-admin";

export const TokenCreate = (props: any) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="address" />
      <TextInput source="symbol" />
      <ReferenceInput source="chainId" reference="prices_networks">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <NumberInput source="creationEpoch" />
      <BooleanInput source="tokenset" />
      <BooleanInput source="tokensetComponent" />
      <BooleanInput source="tradable" />
      <NumberInput source="decimals" />
    </SimpleForm>
  </Create>
);

export default TokenCreate;
