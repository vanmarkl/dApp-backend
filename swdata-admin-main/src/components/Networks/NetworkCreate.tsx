import React from "react";
import { Create, SimpleForm, TextInput } from "react-admin";

export const NetworkCreate = (props: any) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="chainId" />
    </SimpleForm>
  </Create>
);

export default NetworkCreate;
