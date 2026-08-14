import { describe, expect, it } from "vitest";
import { createD1Stub } from "@/lib/testing/d1Stub";
import {
  addMessage,
  autoTitleAndTouch,
  buildAutoTitle,
  createConversation,
  deleteConversation,
  getConversation,
  listConversations,
  listMessages,
} from "./chatDb";

const CONV_ROW = {
  id: "conv-1",
  user_id: "user-1",
  title: "My feelings today",
  created_at: 1000,
  updated_at: 2000,
};

describe("conversations data layer", () => {
  it("lists conversations newest first", async () => {
    const { db, statements } = createD1Stub({
      rows: { "ORDER BY updated_at DESC": [CONV_ROW] },
    });

    const rows = await listConversations(db, "user-1");
    expect(rows).toEqual([
      { id: "conv-1", title: "My feelings today", createdAt: 1000, updatedAt: 2000 },
    ]);
    expect(statements[0].args).toEqual(["user-1", 100]);
  });

  it("creates a conversation with a null title", async () => {
    const { db, statements } = createD1Stub();
    const row = await createConversation(db, "user-1");

    expect(row.title).toBeNull();
    expect(row.id).toMatch(/^[0-9a-f-]{36}$/);

    const insert = statements[0];
    expect(insert.sql).toContain("INSERT INTO conversations");
    expect(insert.args[0]).toBe(row.id);
    expect(insert.args[1]).toBe("user-1");
  });

  it("deletes messages and the conversation in one batch, reporting ownership", async () => {
    const { db, batchStatements } = createD1Stub({
      batchResult: [{ success: true }, { success: true, meta: { changes: 1 } }],
    });

    const deleted = await deleteConversation(db, "user-1", "conv-1");
    expect(deleted).toBe(true);
    expect(batchStatements.map((s) => s.sql)).toEqual([
      "DELETE FROM messages WHERE conversation_id = ?",
      "DELETE FROM conversations WHERE id = ? AND user_id = ?",
    ]);
  });

  it("reports false when the conversation does not belong to the user", async () => {
    const { db } = createD1Stub({
      batchResult: [{ success: true }, { success: true, meta: { changes: 0 } }],
    });
    expect(await deleteConversation(db, "attacker", "conv-1")).toBe(false);
  });

  it("resolves a conversation by id and owner, null otherwise", async () => {
    const { db } = createD1Stub({ rows: { "WHERE id = ? AND user_id = ?": [CONV_ROW] } });
    const found = await getConversation(db, "user-1", "conv-1");
    expect(found?.title).toBe("My feelings today");

    const { db: emptyDb } = createD1Stub();
    expect(await getConversation(emptyDb, "user-1", "missing")).toBeNull();
  });

  it("lists messages oldest first", async () => {
    const { db } = createD1Stub({
      rows: {
        "ORDER BY created_at ASC": [
          { id: "m1", role: "user", content: "hi", created_at: 1 },
          { id: "m2", role: "assistant", content: "hello", created_at: 2 },
        ],
      },
    });

    const messages = await listMessages(db, "conv-1");
    expect(messages.map((m) => m.role)).toEqual(["user", "assistant"]);
  });

  it("adds a message with a uuid and timestamp", async () => {
    const { db, statements } = createD1Stub();
    const message = await addMessage(db, "conv-1", "user", "hello");

    expect(message.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(message.role).toBe("user");
    expect(statements[0].args.slice(1, 5)).toEqual(["conv-1", "user", "hello", message.createdAt]);
  });

  it("truncates long auto-titles", () => {
    expect(buildAutoTitle(" short ")).toBe("short");
    expect(buildAutoTitle("a".repeat(50)).length).toBe(31);
    expect(buildAutoTitle("a".repeat(50)).endsWith("…")).toBe(true);
  });

  it("auto-titles with COALESCE so later messages never overwrite", async () => {
    const { db, statements } = createD1Stub();
    await autoTitleAndTouch(db, "conv-1", "I feel anxious today", 5000);

    const update = statements[0];
    expect(update.sql).toContain("COALESCE(title, ?)");
    expect(update.args).toEqual(["I feel anxious today", 5000, "conv-1"]);
  });
});
