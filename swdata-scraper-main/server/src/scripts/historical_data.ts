import {
  collectAndInsertDaily,
  collectAndInsertHourly,
  collectAndInsertMinutes,
} from "../utils/scraper";
import yargs from "yargs/yargs";

const argv = yargs(process.argv.slice(2)).options({
  dataType: {
    type: "string",
    demandOption: true,
    choices: ["dailies", "hourlies", "minutes"],
  },
}).argv;

switch (argv.dataType) {
  case "dailies":
    collectAndInsertDaily();
    break;
  case "hourlies":
    collectAndInsertHourly();
    break;
  case "minutes":
    collectAndInsertMinutes();
    break;
  default:
    console.log("Sorry, that is not something I know how to do.");
}
