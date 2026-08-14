import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_AI_MODEL,
  parseSseStream,
  workersAiProvider,
} from "./provider";

function sseStream(frames: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const chunks = frames.map((f) => encoder.encode(`data: ${f}\n\n`));
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    },
  });
}

async function collect(generator: AsyncGenerator<string>): Promise<string[]> {
  const out: string[] = [];
  for await (const delta of generator) out.push(delta);
  return out;
}

describe("parseSseStream", () => {
  it("yields only .response fields, skipping other events", async () => {
    const stream = sseStream([
      '{"response":"Hel"}',
      '{"response":"lo"}',
      '{"event":"thinking"}',
      "not-json",
      '{"response":" world"}',
    ]);
    expect(await collect(parseSseStream(stream))).toEqual(["Hel", "lo", " world"]);
  });

  it("tolerates split frames across chunks", async () => {
    const encoder = new TextEncoder();
    const parts = ['data: {"response":"ab', 'c"}\n\ndata: {"response":"de"}\n\n'];
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        for (const part of parts) controller.enqueue(encoder.encode(part));
        controller.close();
      },
    });
    expect(await collect(parseSseStream(stream))).toEqual(["abc", "de"]);
  });
});

describe("workersAiProvider", () => {
  it("prepends the locale system prompt and streams deltas", async () => {
    const run = vi.fn().mockResolvedValue(
      sseStream(['{"response":"I hear you."}', '{"response":" Take a breath."}'])
    );
    const env = { AI: { run }, AI_MODEL: undefined } as unknown as CloudflareEnv;

    const provider = workersAiProvider(env);
    const deltas = await collect(
      provider.streamChat({
        locale: "zh",
        messages: [{ role: "user", content: "今天好累" }],
      })
    );

    expect(deltas).toEqual(["I hear you.", " Take a breath."]);
    expect(run).toHaveBeenCalledTimes(1);

    const [model, inputs] = run.mock.calls[0] as [
      string,
      { messages: Array<{ role: string; content: string }> }
    ];
    expect(model).toBe(DEFAULT_AI_MODEL);
    expect(inputs.messages[0].role).toBe("system");
    expect(inputs.messages[0].content).toContain("SerenAI");
    expect(inputs.messages[0].content).toContain("语言");
    expect(inputs.messages[1]).toEqual({ role: "user", content: "今天好累" });
  });

  it("honors the AI_MODEL override", async () => {
    const run = vi.fn().mockResolvedValue(sseStream([]));
    const env = {
      AI: { run },
      AI_MODEL: "@cf/custom/model",
    } as unknown as CloudflareEnv;

    const provider = workersAiProvider(env);
    await collect(
      provider.streamChat({ locale: "en", messages: [] })
    );

    expect(run.mock.calls[0][0]).toBe("@cf/custom/model");
  });
});
