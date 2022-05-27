import React from "react";
import {
  Edit,
  SimpleForm,
  TextField,
  BooleanInput,
  ReferenceInput,
  SelectInput,
  TextInput,
} from "react-admin";

export const TokenEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
      <TextField source="symbol" />
      <TextField source="id" />
      <TextInput source="address" />
      <TextInput source="creationEpoch" />
      <ReferenceInput label="Network" source="chainId" reference="prices_networks">
        <SelectInput optionText="chainId" />
      </ReferenceInput>
      <BooleanInput source="tokenset" />
    </SimpleForm>
  </Edit>
);

export default TokenEdit;
