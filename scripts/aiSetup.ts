// Shared setup for scripts that call the real AI. Reads the key from the
// ANTHROPIC_API_KEY environment variable or the macOS Keychain, never from a
// file in the project.
import Anthropic from "@anthropic-ai/sdk";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { AskAI, Grouping } from "../src/mapper";

export const dataDir = fileURLToPath(new URL("../data/", import.meta.url));

export function loadGroupings(): Grouping[] {
  return JSON.parse(readFileSync(dataDir + "groupings.json", "utf8")).groupings;
}

// Team rules the AI must follow, kept in groupings.json so the team can edit them.
export function loadRules(): string[] {
  return JSON.parse(readFileSync(dataDir + "groupings.json", "utf8")).rules_for_ai ?? [];
}

// Name of the macOS Keychain entry that holds the key.
const KEYCHAIN_ENTRY = "channel-mapper-anthropic";

// On a Mac, read the key from the Keychain if it isn't in the environment.
function keyFromKeychain(): string | undefined {
  if (process.platform !== "darwin") return undefined;
  try {
    return execFileSync("security", ["find-generic-password", "-s", KEYCHAIN_ENTRY, "-w"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim() || undefined;
  } catch {
    return undefined;
  }
}

export function makeClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY || keyFromKeychain();
  if (!apiKey) {
    console.error(
      `No API key found. On a Mac, save it once to the Keychain by typing this in a terminal:\n\n` +
        `  security add-generic-password -a "$USER" -s ${KEYCHAIN_ENTRY} -w\n\n` +
        `then paste the key at both prompts (nothing shows as you paste) and press Enter.`,
    );
    process.exit(1);
  }
  return new Anthropic({ apiKey });
}

// Wraps the AI call to count requests and record exactly what was sent.
export function counting(askAI: AskAI) {
  const sent: string[][] = [];
  const wrapped: AskAI = async (values) => {
    sent.push(values);
    return askAI(values);
  };
  return { askAI: wrapped, sent };
}
