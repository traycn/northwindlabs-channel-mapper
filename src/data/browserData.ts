// The data the website runs on, bundled in at build time from /data.
import sourceCounts from "virtual:source-counts";
import mapping from "../../data/mapping.json";
import groupingsFile from "../../data/groupings.json";
import saved from "../../data/saved_suggestions.json";
import { buildApprovedList, valuesForAI, type Alias, type SavedSuggestions } from "../mapper";

export const groupings = groupingsFile.groupings;
export const approvedList = buildApprovedList(mapping.aliases as Alias[], groupings);
// One entry per touchpoint, rebuilt from the counts (the file itself is never bundled).
export const sources = Object.entries(sourceCounts).flatMap(([source, n]) => Array<string>(n).fill(source));
export const unfamiliarValues = valuesForAI(sources, approvedList);
export const savedSuggestions = saved as SavedSuggestions;
