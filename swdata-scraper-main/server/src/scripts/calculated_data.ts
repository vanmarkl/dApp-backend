import yargs from "yargs/yargs";
import { PriceCalculators } from "../utils/prices";

const argv = yargs(process.argv.slice(2)).options({
  dataType: {
    type: "string",
    demandOption: true,
    choices: ["hourlies", "dailies"],
  },
}).argv;

switch (argv.dataType) {
  case "dailies":
    PriceCalculators.calculateMissingDailies();
    break;
  case "hourlies":
    PriceCalculators.calculateMissingHourlies();
    break;
  default:
    console.log("Sorry, that is not something I know how to do.");
}
