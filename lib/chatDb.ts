// ---------------------------------------------------------------------------
// D1 data layer for conversations and messages.
//
// All functions take the D1 database as their first argument so routes keep
// control of the binding lookup (mapping a missing binding to 503, matching
// the getDB() degrade pattern). Timestamps are epoch milliseconds.
// ---------------------------------------------------------------------------

import type { D1Database } from "@cloudflare/workers-types";

export interface ConversationRow {
  id: string;
  title: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface MessageRow {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

const LIST_LIMIT = 100;
const TITLE_MAX_LENGTH = 30;

function mapConversation(row: Record<string, unknown>): ConversationRow {
  return {
    id: row.id as string,
    title: (row.title as string | null) ?? null,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

export async function listConversations(
  db: D1Database,
  userId: string
): Promise<ConversationRow[]> {
  const { results } = await db
    .prepare(
      "SELECT id, title, created_at, updated_at FROM conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT ?"
    )
    .bind(userId, LIST_LIMIT)
    .all();
  return (results ?? []).map(mapConversation);
}

export async function createConversation(
  db: D1Database,
  userId: string
): Promise<ConversationRow> {
  const id = crypto.randomUUID();
  const now = Date.now();
  await db
    .prepare(
      "INSERT INTO conversations (id, user_id, title, created_at, updated_at) VALUES (?, ?, NULL, ?, ?)"
    )
    .bind(id, userId, now, now)
    .run();
  return { id, title: null, createdAt: now, updatedAt: now };
}

/**
 * Deletes a conversation the user owns. Returns true when the row existed
 * (ownership-checked); foreign or unknown ids behave identically (404).
 */
export async function deleteConversation(
  db: D1Database,
  userId: string,
  conversationId: string
): Promise<boolean> {
  const results = await db.batch([
    db
      .prepare("DELETE FROM messages WHERE conversation_id = ?")
      .bind(conversationId),
    db
      .prepare("DELETE FROM conversations WHERE id = ? AND user_id = ?")
      .bind(conversationId, userId),
  ]);
  const last = results[results.length - 1];
  return ((last?.meta as { changes?: number } | undefined)?.changes ?? 0) > 0;
}

export async function getConversation(
  db: D1Database,
  userId: string,
  conversationId: string
): Promise<ConversationRow | null> {
  const row = await db
    .prepare(
      "SELECT id, title, created_at, updated_at FROM conversations WHERE id = ? AND user_id = ?"
    )
    .bind(conversationId, userId)
    .first();
  return row ? mapConversation(row) : null;
}

export async function listMessages(
  db: D1Database,
  conversationId: string
): Promise<MessageRow[]> {
  const { results } = await db
    .prepare(
      "SELECT id, role, content, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC"
    )
    .bind(conversationId)
    .all();
  return (results ?? []).map((row) => ({
    id: row.id as string,
    role: row.role as "user" | "assistant",
    content: row.content as string,
    createdAt: row.created_at as number,
  }));
}

export async function addMessage(
  db: D1Database,
  conversationId: string,
  role: "user" | "assistant",
  content: string
): Promise<MessageRow> {
  const id = crypto.randomUUID();
  const createdAt = Date.now();
  await db
    .prepare(
      "INSERT INTO messages (id, conversation_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(id, conversationId, role, content, createdAt)
    .run();
  return { id, role, content, createdAt };
}

/** Truncated title derived from the first user message. */
export function buildAutoTitle(content: string): string {
  const trimmed = content.trim();
  if (trimmed.length <= TITLE_MAX_LENGTH) return trimmed;
  return `${trimmed.slice(0, TITLE_MAX_LENGTH)}…`;
}

/**
 * Sets the conversation title on the first user message (COALESCE keeps an
 * existing title) and bumps updated_at — one statement, race-safe.
 */
export async function autoTitleAndTouch(
  db: D1Database,
  conversationId: string,
  firstMessageContent: string,
  now: number
): Promise<void> {
  await db
    .prepare(
      "UPDATE conversations SET title = COALESCE(title, ?), updated_at = ? WHERE id = ?"
    )
    .bind(buildAutoTitle(firstMessageContent), now, conversationId)
    .run();
}
