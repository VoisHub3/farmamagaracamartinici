import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.server";

const MODEL = "openai/gpt-6-astra";
const MAX_KNOWLEDGE = 300_000;

async function loadKnowledge() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  const sb = createClient<Database>(process.env.SUPABASE_URL!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
  const { data, error } = await sb.from("knowledge_base").select("content").eq("id", 1).maybeSingle();
  if (error) console.error("knowledge load failed", error);
  return (data?.content ?? "").slice(0, MAX_KNOWLEDGE);
}

export async function handleChat(request: Request) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return Response.json({ error: "AI is not configured" }, { status: 500 });

  let body: { messages?: UIMessage[]; lang?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const messages = Array.isArray(body.messages) ? body.messages.slice(-30) : [];
  if (!messages.length) return Response.json({ error: "No messages" }, { status: 400 });
  const lang = body.lang === "en" ? "English" : "Montenegrin/Serbian (Latin script)";

  const knowledge = await loadKnowledge();
  const system = `You are the friendly assistant of a family donkey farm. You answer visitors' questions about donkey milk and its uses (nutrition, health, skin care, storage, dosage, children, cosmetics).
Answer in ${lang} unless the visitor clearly writes in another language — then answer in their language.
Base your answers primarily on the KNOWLEDGE BASE below. If the answer is not in it, say so honestly and give only general, cautious information. For medical concerns, recommend consulting a doctor. Keep answers concise and warm; use short paragraphs or bullet lists.

KNOWLEDGE BASE:
"""
${knowledge || "(No document uploaded yet.)"}
"""`;

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const result = streamText({
    model: provider.responses(MODEL),
    instructions: system,
    messages: await convertToModelMessages(messages),
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  return withLovableAiGatewayRunIdHeader(
    result.toUIMessageStreamResponse({ originalMessages: messages }),
    runIdFetch,
  );
}
