// Request limit: caps AI requests per visitor per day, and in total per day.
// Counters live in a key-value store (Cloudflare KV on the server). KV isn't
// strictly atomic, so the limit is approximate under heavy parallel use;
// the Anthropic monthly spending limit is the hard backstop.
import { REQUESTS_PER_DAY_TOTAL, REQUESTS_PER_VISITOR_PER_DAY } from "./config";

export interface CounterStore {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

const TWO_DAYS = 2 * 24 * 60 * 60;

export function makeLimiter(store: CounterStore, visitor: string, today: string) {
  const keys = [`limit:${today}:visitor:${visitor}`, `limit:${today}:all`];
  const caps = [REQUESTS_PER_VISITOR_PER_DAY, REQUESTS_PER_DAY_TOTAL];
  const read = async (k: string) => Number((await store.get(k)) ?? 0);

  return {
    async allowed(): Promise<boolean> {
      const counts = await Promise.all(keys.map(read));
      return counts.every((n, i) => n < caps[i]);
    },
    async record(): Promise<void> {
      for (const k of keys) await store.put(k, String((await read(k)) + 1), { expirationTtl: TWO_DAYS });
    },
  };
}

// Visitors are identified by a one-way hash of their IP address, so raw
// addresses are never stored.
export async function visitorId(ip: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`channel-mapper:${ip}`));
  return [...new Uint8Array(bytes)].slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("");
}
