import React from "react";
import {
  Datagrid,
  List,
  TextField,
} from "react-admin";

const NetworkList = (props: any) => (
  <List title={"Supported networks"} {...props}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="chainId" />
    </Datagrid>
  </List>
);

export default NetworkList;
