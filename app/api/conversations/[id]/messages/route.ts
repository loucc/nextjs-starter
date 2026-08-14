import {
  addMessage,
  autoTitleAndTouch,
  getConversation,
  listMessages,
  MessageRow,
} from "@/lib/chatDb";
import { getFallbackAssistantMessage } from "@/lib/ai/prompt";
import { getChatProvider } from "@/lib/ai/provider";
import { getDB } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { NextResponse } from "next/server";

const MAX_CONTENT_LENGTH = 4000;
const HISTORY_WINDOW = 20;

type RouteContext = { params: Promise<{ id: string }> };

/** GET /api/conversations/[id]/messages — message history, oldest first. */
export async function GET(request: Request, context: RouteContext) {
  const auth = await requireUser(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  const conversation = await getConversation(getDB()!, auth.user.id, id);
  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const messages = await listMessages(getDB()!, id);
  return NextResponse.json({ messages });
}

/**
 * POST /api/conversations/[id]/messages — sends a user message and streams
 * the assistant reply as SSE frames:
 *   data: {"type":"delta","content":"..."}
 *   data: {"type":"done","message":{...},"conversation":{...}}
 *   data: {"type":"error","error":"..."}   (mid-stream failure; a fallback
 *                                           assistant message was persisted)
 */
export async function POST(request: Request, context: RouteContext) {
  const auth = await requireUser(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const db = getDB()!;
  const provider = getChatProvider();
  if (!provider) {
    return NextResponse.json({ error: "AI is not configured" }, { status: 503 });
  }

  const { id } = await context.params;
  const conversation = await getConversation(db, auth.user.id, id);
  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { content } = await request.json();
  if (!content || typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json(
      { error: "content is too long" },
      { status: 400 }
    );
  }

  // Persist the user message and auto-title BEFORE streaming, so history
  // stays consistent even if the client aborts mid-reply.
  await addMessage(db, id, "user", content);
  await autoTitleAndTouch(db, id, content, Date.now());

  const locale = auth.user.locale ?? "en";
  const history = await listMessages(db, id);
  const recent = history
    .slice(-HISTORY_WINDOW)
    .map((m) => ({ role: m.role, content: m.content }));

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const frame = (data: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      let assistantText = "";
      let failed = false;

      try {
        for await (const delta of provider.streamChat({
          messages: recent,
          locale,
        })) {
          assistantText += delta;
          frame({ type: "delta", content: delta });
        }
      } catch (error) {
        failed = true;
        console.error("[chat] AI stream failed", error);
      }

      if (request.signal.aborted) {
        // Client disconnected — persist whatever accumulated, then stop.
        if (assistantText.trim()) {
          try {
            await addMessage(db, id, "assistant", assistantText.trim());
          } catch {
            // Best effort only.
          }
        }
        try {
          controller.close();
        } catch {
          // Already cancelled.
        }
        return;
      }

      if (failed) {
        // Persist the localized fallback so history stays consistent, then
        // tell the client to reload the conversation.
        try {
          await addMessage(
            db,
            id,
            "assistant",
            getFallbackAssistantMessage(locale)
          );
        } catch (error) {
          console.error("[chat] failed to persist fallback message", error);
        }
        try {
          frame({ type: "error", error: "AI stream failed" });
          controller.close();
        } catch {
          // Stream already gone.
        }
        return;
      }

      let saved: MessageRow | null = null;
      if (assistantText.trim()) {
        saved = await addMessage(db, id, "assistant", assistantText.trim());
      }

      const updatedConversation = await getConversation(db, auth.user.id, id);
      try {
        frame({
          type: "done",
          message: saved,
          conversation: updatedConversation,
        });
        controller.close();
      } catch {
        // Stream already gone.
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
