import React from "react";
import { Edit, SimpleForm, TextInput } from "react-admin";

export const NetworkEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="chainId" />
    </SimpleForm>
  </Edit>
);

export default NetworkEdit;
