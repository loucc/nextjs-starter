"use client";

// ---------------------------------------------------------------------------
// Chat data flow: session bootstrap, conversation CRUD and SSE consumption.
// All server state lives in stores/chatStore.ts; actions use getState() so
// callbacks never capture stale store snapshots.
// ---------------------------------------------------------------------------

import { useCallback, useRef } from "react";
import { useChatStore } from "@/stores/chatStore";
import type { Conversation, Message } from "@/types/chat";

export type ActionResult = { ok: boolean; error?: string };

interface SseFrame {
  type: "delta" | "done" | "error";
  content?: string;
  message?: Message;
  conversation?: Conversation;
  error?: string;
}

export function useChat() {
  const abortRef = useRef<AbortController | null>(null);

  /** Bootstrap: 200 -> authed, 401/other -> guest. */
  const loadMe = useCallback(async () => {
    try {
      const res = await fetch("/api/me");
      if (res.status === 401) {
        useChatStore.getState().setStatus("guest");
        return;
      }
      if (!res.ok) {
        useChatStore.getState().setStatus("guest");
        return;
      }
      const data = await res.json();
      useChatStore.getState().setUser(data.user);
      useChatStore.getState().setStatus("authed");
    } catch {
      useChatStore.getState().setStatus("guest");
    }
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (!res.ok) return;
      const data = await res.json();
      useChatStore.getState().setConversations(data.conversations);
    } catch {
      // Offline — the sidebar just stays as-is.
    }
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      if (!res.ok) return;
      const data = await res.json();
      useChatStore.getState().setMessages(conversationId, data.messages);
    } catch {
      // Offline — keep whatever is cached.
    }
  }, []);

  const openConversation = useCallback(
    async (id: string) => {
      useChatStore.getState().setActiveConversation(id);
      const cached = useChatStore.getState().messagesByConversation[id];
      if (!cached) await loadMessages(id);
    },
    [loadMessages]
  );

  const createConversation = useCallback(async (): Promise<Conversation | null> => {
    try {
      const res = await fetch("/api/conversations", { method: "POST" });
      if (!res.ok) return null;
      const data = await res.json();
      useChatStore.getState().upsertConversation(data.conversation);
      useChatStore.getState().setActiveConversation(data.conversation.id);
      useChatStore.getState().setMessages(data.conversation.id, []);
      return data.conversation;
    } catch {
      return null;
    }
  }, []);

  const deleteConversation = useCallback(async (id: string): Promise<ActionResult> => {
    try {
      const res = await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 404) {
        return { ok: false, error: String(res.status) };
      }
      useChatStore.getState().removeConversation(id);
      return { ok: true };
    } catch {
      return { ok: false };
    }
  }, []);

  /**
   * Sends a message and consumes the SSE reply. The user bubble is appended
   * optimistically; the assistant message and refreshed title arrive via the
   * `done` frame. On an `error` frame (or a stopped stream) the history is
   * reloaded so the persisted server-side fallback/partial reply appears.
   */
  const sendMessage = useCallback(
    async (content: string): Promise<ActionResult> => {
      let conversationId = useChatStore.getState().activeConversationId;
      if (!conversationId) {
        const created = await createConversation();
        if (!created) return { ok: false };
        conversationId = created.id;
      }

      useChatStore.getState().appendMessage(conversationId, {
        id: `local-${Date.now()}`,
        role: "user",
        content,
        createdAt: Date.now(),
      });
      useChatStore.getState().setStreaming({ conversationId, text: "" });

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`/api/conversations/${conversationId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({ content }),
          signal: controller.signal,
        });

        if (res.status === 401) {
          useChatStore.getState().reset();
          return { ok: false, error: "session expired" };
        }
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          return { ok: false, error: data?.error };
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let frameEnd;
          while ((frameEnd = buffer.indexOf("\n\n")) !== -1) {
            const frameText = buffer.slice(0, frameEnd);
            buffer = buffer.slice(frameEnd + 2);

            for (const line of frameText.split("\n")) {
              if (!line.startsWith("data:")) continue;
              let frame: SseFrame;
              try {
                frame = JSON.parse(line.slice(5).trim());
              } catch {
                continue;
              }

              if (frame.type === "delta" && frame.content) {
                const current = useChatStore.getState().streaming;
                if (current?.conversationId === conversationId) {
                  useChatStore
                    .getState()
                    .setStreaming({
                      conversationId,
                      text: current.text + frame.content,
                    });
                }
              } else if (frame.type === "done") {
                if (frame.message) {
                  useChatStore.getState().appendMessage(conversationId, frame.message);
                }
                if (frame.conversation) {
                  useChatStore.getState().upsertConversation(frame.conversation);
                }
              } else if (frame.type === "error") {
                // Server persisted a fallback reply — reload to show it.
                await loadMessages(conversationId);
              }
            }
          }
        }
        return { ok: true };
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          // Stopped by the user — reload so any persisted partial shows.
          await loadMessages(conversationId);
          return { ok: true };
        }
        return { ok: false, error: (error as Error).message };
      } finally {
        useChatStore.getState().setStreaming(null);
        abortRef.current = null;
      }
    },
    [createConversation, loadMessages]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      useChatStore.getState().reset();
    }
  }, []);

  return {
    loadMe,
    loadConversations,
    loadMessages,
    openConversation,
    createConversation,
    deleteConversation,
    sendMessage,
    stopStreaming,
    logout,
  };
}
