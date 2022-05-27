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
      <NumberInput source="creationEpoch" />
      <ReferenceInput source="chainId" reference="prices_networks">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <BooleanInput source="tokenset" />
    </SimpleForm>
  </Create>
);

export default TokenCreate;
