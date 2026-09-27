// The real AI call, through the Anthropic SDK. Used only on the server
// (the Cloudflare function) and in team scripts, never in the browser.
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { Grouping } from "../approvedList";
import { MODEL } from "./config";
import { answerSchema, buildSystemPrompt, buildUserMessage, type Example } from "./prompt";
import type { AskAI } from "./suggest";

export function makeAskClaude(client: Anthropic, groupings: Grouping[], examples: Example[], rules: string[] = []): AskAI {
  const system = buildSystemPrompt(groupings, examples, rules);
  const format = zodOutputFormat(answerSchema(groupings));

  return async (values) => {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      temperature: 0, // consistent answers
      system,
      messages: [{ role: "user", content: buildUserMessage(values) }],
      output_config: { format },
    });

    // A cut-off or declined answer counts as no answer: those values go to a person.
    if (response.stop_reason !== "end_turn") return [];
    const text = response.content.find((b) => b.type === "text")?.text;
    if (!text) return [];
    try {
      const parsed = JSON.parse(text) as { answers?: unknown };
      return Array.isArray(parsed.answers) ? parsed.answers : [];
    } catch {
      return [];
    }
  };
}
