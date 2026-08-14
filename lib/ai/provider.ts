// ---------------------------------------------------------------------------
// Chat provider abstraction.
//
// streamChat yields plain-text deltas — the single seam for swapping the
// LLM backend. WorkersAIProvider is the free-tier default; a future
// external API (OpenAI/DeepSeek/...) only needs to implement the same
// interface and getChatProvider() picks it up.
// ---------------------------------------------------------------------------

import { getSystemPrompt } from "@/lib/ai/prompt";
import { getCloudflareEnv } from "@/lib/cloudflareEnv";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface StreamRequest {
  messages: ChatMessage[];
  locale: string;
}

export interface ChatProvider {
  /** Yields plain-text deltas of the assistant reply. */
  streamChat(req: StreamRequest): AsyncGenerator<string>;
}

export const DEFAULT_AI_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

/**
 * Parses a Workers AI SSE stream (chunks of `data: {"response": ...}` lines)
 * into plain-text deltas. Only reads the `.response` field so frame-format
 * variance across models stays contained here.
 */
export async function* parseSseStream(
  stream: ReadableStream<Uint8Array>
): AsyncGenerator<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let frameEnd;
      while ((frameEnd = buffer.indexOf("\n\n")) !== -1) {
        const frame = buffer.slice(0, frameEnd);
        buffer = buffer.slice(frameEnd + 2);

        for (const line of frame.split("\n")) {
          if (!line.startsWith("data:")) continue;
          const raw = line.slice(5).trim();
          if (!raw || raw === "[DONE]") continue;
          try {
            const parsed = JSON.parse(raw);
            if (typeof parsed.response === "string" && parsed.response) {
              yield parsed.response;
            }
          } catch {
            // Skip malformed frames — keep streaming what follows.
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export function workersAiProvider(env: CloudflareEnv): ChatProvider {
  const model = env.AI_MODEL || DEFAULT_AI_MODEL;

  return {
    async *streamChat({ messages, locale }) {
      // Runtime model string → the generic run() overload; the response is a
      // ReadableStream of SSE frames when { stream: true }.
      const output = (await env.AI!.run(model, {
        stream: true,
        messages: [
          { role: "system", content: getSystemPrompt(locale) },
          ...messages,
        ],
        max_tokens: 768,
        temperature: 0.7,
        top_p: 0.95,
      })) as unknown as ReadableStream<Uint8Array>;

      yield* parseSseStream(output);
    },
  };
}

/** Returns the configured provider, or undefined when the AI binding is missing. */
export function getChatProvider(): ChatProvider | undefined {
  const env = getCloudflareEnv();
  if (!env?.AI) return undefined;
  return workersAiProvider(env);
}
