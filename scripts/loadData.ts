// Reads the files in /data for the counts script and the tests.
// Kept out of /src/mapper so the mapper never touches files itself.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { buildApprovedList, parseCsv, type Alias, type Grouping } from "../src/mapper";

export { parseCsv };

const dataDir = fileURLToPath(new URL("../data/", import.meta.url));

export function loadTouchpoints() {
  return parseCsv(readFileSync(dataDir + "touchpoints.csv", "utf8"));
}

export function loadApprovedList() {
  const { aliases } = JSON.parse(readFileSync(dataDir + "mapping.json", "utf8")) as { aliases: Alias[] };
  const { groupings } = JSON.parse(readFileSync(dataDir + "groupings.json", "utf8")) as { groupings: Grouping[] };
  return buildApprovedList(aliases, groupings);
}
