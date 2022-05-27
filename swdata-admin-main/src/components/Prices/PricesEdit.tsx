import React from "react";
import {
  NumberInput,
  Edit,
  NumberField,
  SimpleForm,
  TextInput,
} from "react-admin";

export const PricesEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
      <NumberField source="tokenId" />
      <TextInput source="price" />
      <NumberInput source="epoch" />
    </SimpleForm>
  </Edit>
);

export default PricesEdit;
