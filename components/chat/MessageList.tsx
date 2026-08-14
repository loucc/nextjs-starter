"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "@/stores/chatStore";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

/**
 * Message pane: user bubbles on the right (gradient), assistant bubbles on
 * the left (frosted). Plain text with whitespace-pre-wrap — no markdown
 * dependency. Auto-scrolls while streaming.
 */
export default function MessageList() {
  const t = useTranslations("Chat");
  const activeId = useChatStore((s) => s.activeConversationId);
  const messages = useChatStore((s) =>
    s.activeConversationId
      ? (s.messagesByConversation[s.activeConversationId] ?? [])
      : []
  );
  const streaming = useChatStore((s) => s.streaming);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, streaming?.text]);

  if (!activeId) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="max-w-sm text-center text-sm font-light leading-relaxed text-text-muted">
          {t("emptyState")}
        </p>
      </div>
    );
  }

  const bubble = (
    key: string,
    role: "user" | "assistant",
    content: string,
    isStreaming = false
  ) => (
    <div key={key} className={cn("flex", role === "user" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] whitespace-pre-wrap rounded-3xl px-4 py-2.5 text-sm font-light leading-relaxed",
          role === "user"
            ? "rounded-br-md bg-gradient-to-r from-blue-400 to-violet-400 text-white"
            : "rounded-bl-md border border-line/60 bg-white/55 text-text-main backdrop-blur-sm dark:border-night-line dark:bg-night-card/50 dark:text-gray-100"
        )}
      >
        {content}
        {isStreaming && (
          <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-full bg-blue-400 align-middle" />
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
      {messages.length === 0 && !streaming && (
        <div className="flex h-full items-center justify-center">
          <p className="max-w-sm text-center text-sm font-light leading-relaxed text-text-muted">
            {t("emptyState")}
          </p>
        </div>
      )}
      {messages.map((m) => bubble(m.id, m.role, m.content))}
      {streaming &&
        streaming.conversationId === activeId &&
        bubble("streaming", "assistant", streaming.text, true)}
      <div ref={bottomRef} />
    </div>
  );
}
