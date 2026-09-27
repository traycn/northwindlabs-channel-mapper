import { readFileSync } from "node:fs";
import { defineConfig, type Plugin } from "vitest/config";
import react from "@vitejs/plugin-react";
import { parseCsv } from "./src/mapper/csv";

// The website only needs how often each source value appears. This builds
// those counts from data/touchpoints.csv at build time, so person IDs, dates
// and campaigns are never sent to visitors' browsers.
function sourceCounts(): Plugin {
  const id = "virtual:source-counts";
  const file = new URL("./data/touchpoints.csv", import.meta.url);
  return {
    name: "source-counts",
    resolveId: (source) => (source === id ? "\0" + id : undefined),
    load(resolved) {
      if (resolved !== "\0" + id) return;
      this.addWatchFile(file.pathname);
      const counts: Record<string, number> = {};
      for (const row of parseCsv(readFileSync(file, "utf8"))) counts[row.source] = (counts[row.source] ?? 0) + 1;
      return `export default ${JSON.stringify(counts)};`;
    },
  };
}

export default defineConfig({
  plugins: [react(), sourceCounts()],
  test: { include: ["tests/**/*.test.ts"] },
});
