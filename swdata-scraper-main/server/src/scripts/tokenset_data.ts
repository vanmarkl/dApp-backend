import { collectAndInsertTokenSetAllocationData } from "../utils/scraper";
import yargs from "yargs/yargs";

const argv = yargs(process.argv.slice(2)).options({
  dataType: {
    type: "string",
    demandOption: true,
    choices: ["allocationData"],
  },
}).argv;

switch (argv.dataType) {
  case "allocationData":
    collectAndInsertTokenSetAllocationData();
    break;
  default:
    console.log("Sorry, that is not something I know how to do.");
}
