// Step 3 setup: turn mapping.json + groupings.json into a lookup table.
// Only entries with status "approved" are used. Anything inconsistent stops
// the mapper with a plain explanation instead of producing wrong totals.
import { cleanValue } from "./clean";

export interface Grouping {
  channel: string;
  platforms: string[];
}

export interface Alias {
  key: string;
  example_raw_value: string;
  channel: string;
  platform: string | null;
  status: string;
  basis: string;
  approved_by: string | null;
  approved_on: string | null;
}

export interface ApprovedEntry {
  channel: string;
  platform: string | null;
}

export type ApprovedList = Map<string, ApprovedEntry>;

export function buildApprovedList(
  aliases: Alias[],
  groupings: Grouping[],
): ApprovedList {
  const channels = new Map(groupings.map((g) => [g.channel, g.platforms]));
  const list: ApprovedList = new Map();

  for (const a of aliases) {
    if (a.status !== "approved") continue;

    const platforms = channels.get(a.channel);
    if (!platforms) {
      throw new Error(`"${a.key}" uses channel "${a.channel}", which is not in groupings.json.`);
    }
    if (a.platform !== null && !platforms.includes(a.platform)) {
      throw new Error(`"${a.key}" uses platform "${a.platform}", which is not listed under ${a.channel}.`);
    }
    if (cleanValue(a.key) !== a.key) {
      throw new Error(`"${a.key}" is not a cleaned value. It should be "${cleanValue(a.key)}".`);
    }
    const existing = list.get(a.key);
    if (existing && existing.channel !== a.channel) {
      throw new Error(`"${a.key}" is approved twice with different channels (${existing.channel}, ${a.channel}).`);
    }
    list.set(a.key, { channel: a.channel, platform: a.platform });
  }
  return list;
}
