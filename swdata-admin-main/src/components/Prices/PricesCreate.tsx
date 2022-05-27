import { DateTime } from "luxon";
import React, { useState } from "react";
import {
  Create,
  FileField,
  FileInput,
  ReferenceInput,
  SelectInput,
  useNotify,
  SimpleForm,
  required,
  RadioButtonGroupInput,
} from "react-admin";
import { PriceData } from "../../types";
import { graphClient, Mutations } from "../../utils/graph";

export const PricesCreate = (props: any) => {
  const notify = useNotify();
  const [token, setToken] = useState<number>();
  const [granularity, setGranularity] = useState<string>();
  const [records, setRecords] = useState<Partial<PriceData>[]>([]);

  const insertPricesDaily = async (objects: any[]) => {
    console.info(`Inserting ${objects.length} daily prices`);
    return await graphClient.mutate({
      mutation: Mutations.INSERT_DAILY,
      variables: { objects },
    });
  };

  const insertPricesHourly = async (objects: any[]) => {
    console.info(`Inserting ${objects.length} daily prices`);
    return await graphClient.mutate({
      mutation: Mutations.INSERT_HOURLY,
      variables: { objects },
    });
  };

  const insertPricesMinutes = async (objects: any[]) => {
    console.info(`Inserting ${objects.length} daily prices`);
    return await graphClient.mutate({
      mutation: Mutations.INSERT_MINUTES,
      variables: { objects },
    });
  };

  const storeRecords = async (
    priceData: Partial<PriceData>[],
    tokenId: number
  ) => {
    const completeRecords = priceData.map((data) => ({
      epoch: data.epoch,
      price: data.price,
      tokenId: tokenId,
    }));
    if (graphClient) {
      switch (granularity) {
        case "daily":
          await insertPricesDaily(completeRecords).then((res) =>
            console.log(res)
          );
          break;
        case "hourly":
          await insertPricesHourly(completeRecords).then((res) =>
            console.log(res)
          );
          break;
        case "minutes":
          await insertPricesMinutes(completeRecords).then((res) =>
            console.log(res)
          );
          break;
        default:
          break;
      }
    } else {
      console.log("No data provider available");
    }
  };

  const checkAndSave = async () => {
    if (granularity && token && records) {
      await storeRecords(records, token);
    } else {
      const message = "Missing data, double check input values";
      console.warn(message);
      notify(message, { type: "warning" });
    }
  };

  const parseCsvOnDrop = (upload: any) => {
    console.log("Got file");
    var reader = new FileReader();
    reader.readAsText(upload[0]);
    reader.onload = () => {
      const text = reader.result as string;
      const parsed = text
        .split("\n")
        .map((record: string) => record.split(","))
        .map((dataset: string[]) => {
          return {
            epoch: Number(
              DateTime.fromFormat(dataset[0], "yyyy-MM-dd")
                .toSeconds()
                .toFixed()
            ),
            price: dataset[1].replace(/[^\d.]/gim, ""),
          };
        })
        .filter((parsed) => !isNaN(parsed.epoch));
      console.log(`Setting ${parsed.length} records`);
      setRecords(parsed);
    };
    reader.onerror = () => {
      notify(reader.error?.message || "Error parsing file", "warning");
    };
  };

  const tokenSelect = (e: any) => {
    console.info("Token: ", e.target.value);
    setToken(e.target.value);
  };

  const optionRenderer = (choice: any) =>
    `${choice.symbol} (${choice.chainId.toString()} - ${choice.address})`;

  const choices = [
    { id: "daily", name: "Daily" },
    { id: "hourly", name: "Hourly" },
    { id: "minutes", name: "Minutes" },
  ];

  const granularitySelect = (value: any) => {
    console.log(value);
    setGranularity(value);
  };

  return (
    <Create title="Upload historical daily data" {...props}>
      <SimpleForm warnWhenUnsavedChanges save={checkAndSave}>
        <ReferenceInput
          source="tokenId"
          reference="prices_tokens"
          onChange={tokenSelect}
          validate={[required()]}
          sort={{ field: "symbol", order: "ASC" }}
        >
          <SelectInput optionText={optionRenderer} />
        </ReferenceInput>
        <RadioButtonGroupInput
          source="category"
          choices={choices}
          validate={[required()]}
          onChange={granularitySelect}
        />

        <FileInput
          source="csvFile"
          placeholder="Upload file (.csv) formatted [date, price]. Date should be YYYY-MM-DD"
          accept=".csv"
          options={{ onDrop: parseCsvOnDrop }}
        >
          <FileField source="src" title="title" />
        </FileInput>
      </SimpleForm>
    </Create>
  );
};

export default PricesCreate;
