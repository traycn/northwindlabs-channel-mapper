// POST /api/suggest  { "values": ["partner_acme", "li", ...] }
// The only place that talks to the AI. The key comes from Cloudflare's secure
// settings (ANTHROPIC_API_KEY) and never reaches the browser.
//
// Needs, in the Cloudflare Pages project settings:
//   ANTHROPIC_API_KEY  secret
//   SUGGEST_KV         KV namespace (cache + request counters)
import Anthropic from "@anthropic-ai/sdk";
import mapping from "../../data/mapping.json";
import groupingsFile from "../../data/groupings.json";
import { buildApprovedList, pickExamples, suggest, type Alias, type Cache } from "../../src/mapper";
import { makeAskClaude } from "../../src/mapper/suggest/claude";
import { makeLimiter, visitorId } from "../../src/mapper/suggest/limit";

interface Env {
  ANTHROPIC_API_KEY: string;
  SUGGEST_KV: KVNamespace;
}

const MAX_VALUES_PER_REQUEST = 200;
const MAX_VALUE_LENGTH = 200;

const groupings = groupingsFile.groupings;
const rules = groupingsFile.rules_for_ai ?? [];
const list = buildApprovedList(mapping.aliases as Alias[], groupings);
const examples = pickExamples(list);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = (await request.json().catch(() => null)) as { values?: unknown } | null;
  const values = body?.values;
  if (!Array.isArray(values) || values.length > MAX_VALUES_PER_REQUEST ||
      !values.every((v) => typeof v === "string" && v.length <= MAX_VALUE_LENGTH)) {
    return json({ error: `Send {"values": [...]} with at most ${MAX_VALUES_PER_REQUEST} short text values.` }, 400);
  }

  if (!env.ANTHROPIC_API_KEY) {
    console.error(JSON.stringify({ event: "ai_error", message: "ANTHROPIC_API_KEY is not set" }));
    return json({ error: "The AI connection isn't set up. Saved results are shown instead." }, 503);
  }

  const today = new Date().toISOString().slice(0, 10);
  const visitor = await visitorId(request.headers.get("CF-Connecting-IP") ?? "unknown");
  const limiter = makeLimiter(env.SUGGEST_KV, visitor, today);

  const cache: Cache = {
    get: async (k) => (await env.SUGGEST_KV.get(`answer:${k}`, "json")) ?? undefined,
    put: async (k, v) => env.SUGGEST_KV.put(`answer:${k}`, JSON.stringify(v)),
  };

  const askClaude = makeAskClaude(new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }), groupings, examples, rules);
  let limited = false;
  const askAI = async (batch: string[]) => {
    if (!(await limiter.allowed())) {
      limited = true;
      throw new Error("limit");
    }
    await limiter.record();
    // Log only what was sent, to confirm blank or broken values never reach the AI.
    console.log(JSON.stringify({ event: "ai_request", values: batch }));
    return askClaude(batch);
  };

  try {
    const suggestions = await suggest(values as string[], { list, groupings, askAI, cache });
    return json({ suggestions });
  } catch (err) {
    if (limited) return json({ error: "Request limit reached for today. Saved results are shown instead." }, 429);
    console.error(JSON.stringify({ event: "ai_error", message: String(err) }));
    return json({ error: "The AI connection failed. Saved results are shown instead." }, 502);
  }
};
