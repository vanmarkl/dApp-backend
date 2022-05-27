import React from "react";
import {
  Edit,
  SimpleForm,
  TextField,
  BooleanInput,
  ReferenceInput,
  SelectInput,
  TextInput,
  NumberInput,
} from "react-admin";

export const TokenEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
      <TextField source="symbol" />
      <TextField source="id" />
      <TextInput source="address" />
      <TextInput source="creationEpoch" />
      <ReferenceInput
        label="Network"
        source="chainId"
        reference="prices_networks"
      >
        <SelectInput optionText="chainId" />
      </ReferenceInput>
      <BooleanInput source="tokenset" />
      <BooleanInput source="tokensetComponent" />
      <BooleanInput source="tradable" />
      <BooleanInput source="calledCoinGeckoDailies" />
      <BooleanInput source="calledCoinGeckoHourlies" />
      <BooleanInput source="calledCoinGeckoMinutes" />
      <NumberInput source="decimals" />
    </SimpleForm>
  </Edit>
);

export default TokenEdit;
