import yargs from "yargs/yargs";
import {
  collectAndInsertCurrent,
  collectAndInsertCurrentMarketData,
} from "../utils/scraper";

const argv = yargs(process.argv.slice(2)).options({
  dataType: {
    type: "string",
    demandOption: true,
    choices: ["currentPrice", "marketData"],
  },
}).argv;

switch (argv.dataType) {
  case "currentPrice":
    collectAndInsertCurrent();
    break;
  case "marketData":
    collectAndInsertCurrentMarketData();
    break;
  default:
    console.log("Sorry, that is not something I know how to do.");
}
