import React, { useEffect, useState } from "react";
import { Admin, Resource } from "react-admin";
import buildHasuraProvider from "ra-data-hasura";
import { TokenList, TokenEdit, TokenCreate } from "./components/Tokens";
import { PricesCreate, PricesEdit, PricesList } from "./components/Prices";
import { NetworkCreate, NetworkEdit, NetworkList } from "./components/Networks";
import Dashboard from "./components/Dashboard";
import {
  TokensetCreate,
  TokensetEdit,
  TokensetList,
} from "./components/Tokensets";
import { graphClient } from "./utils/graph";
import { authProvider } from "./utils/firebase";

const App = () => {
  const [dataProvider, setDataProvider] = useState<any>(null);

  useEffect(() => {
    const buildDataProvider = async () => {
      const dataProvider = await buildHasuraProvider({
        client: graphClient,
      });

      setDataProvider(() => dataProvider);
    };
    buildDataProvider();
  }, []);

  if (!dataProvider) return <p>Loading...</p>;

  return (
    <Admin
      dashboard={Dashboard}
      dataProvider={dataProvider}
      authProvider={authProvider}
    >
      <Resource
        name="prices_networks"
        create={NetworkCreate}
        list={NetworkList}
        edit={NetworkEdit}
        options={{ label: "Networks" }}
      />
      <Resource
        name="prices_tokens"
        create={TokenCreate}
        list={TokenList}
        edit={TokenEdit}
        options={{ label: "Tokens" }}
      />
      <Resource
        name="prices_tokenset_allocations"
        create={TokensetCreate}
        list={TokensetList}
        edit={TokensetEdit}
        options={{ label: "Tokenset" }}
      />
      <Resource
        name="prices_daily"
        create={PricesCreate}
        list={PricesList}
        edit={PricesEdit}
        options={{ label: "Dailies" }}
      />
      <Resource
        name="prices_hourly"
        create={PricesCreate}
        list={PricesList}
        edit={PricesEdit}
        options={{ label: "Hourlies" }}
      />
      <Resource
        name="prices_minutes"
        create={PricesCreate}
        list={PricesList}
        edit={PricesEdit}
        options={{ label: "Minutes" }}
      />
    </Admin>
  );
};

export default App;
