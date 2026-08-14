"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useChatStore } from "@/stores/chatStore";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const CTA_CLASS =
  "inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-blue-400 to-violet-400 px-4 py-2 text-sm font-light tracking-wide text-white shadow-[0_10px_30px_-8px_rgba(96,165,250,0.6),0_0_24px_rgba(167,139,250,0.4)] transition-all duration-300 hover:scale-[1.03] hover:brightness-105 active:scale-[0.98]";

/**
 * Conversation sidebar (desktop) / chip row (mobile). Row delete uses a
 * two-step inline confirm so no dialog dependency is needed.
 */
export default function ConversationList() {
  const t = useTranslations("Chat");
  const conversations = useChatStore((s) => s.conversations);
  const activeId = useChatStore((s) => s.activeConversationId);
  const { createConversation, openConversation, deleteConversation } = useChat();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const newChatButton = (
    <button onClick={createConversation} className={CTA_CLASS}>
      <Plus className="h-3.5 w-3.5" />
      {t("newChat")}
    </button>
  );

  const row = (convId: string, title: string) => {
    const active = convId === activeId;
    const confirming = confirmId === convId;

    return (
      <div key={convId} className="group relative shrink-0">
        <button
          onClick={() => openConversation(convId)}
          className={cn(
            "block w-full truncate rounded-xl px-3 py-2 text-left text-sm font-light transition-colors",
            active
              ? "bg-white/70 text-text-main shadow-soft-glow dark:bg-night-card/70 dark:text-gray-100"
              : "text-text-muted hover:bg-white/50 hover:text-text-main dark:hover:bg-night-card/50 dark:hover:text-gray-200"
          )}
        >
          {title}
        </button>

        {confirming ? (
          <span className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
            <button
              onClick={() => {
                setConfirmId(null);
                void deleteConversation(convId);
              }}
              className="rounded-md bg-red-500/90 px-2 py-0.5 text-xs font-normal text-white"
            >
              {t("delete")}
            </button>
            <button
              onClick={() => setConfirmId(null)}
              className="rounded-md border border-line/60 bg-white/80 px-2 py-0.5 text-xs text-text-muted dark:border-night-line dark:bg-night-card/80"
            >
              {t("cancel")}
            </button>
          </span>
        ) : (
          <button
            onClick={() => setConfirmId(convId)}
            aria-label={t("delete")}
            title={t("confirmDelete")}
            className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-md p-1 text-text-muted/60 hover:text-red-500 group-hover:block dark:hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 flex-col gap-3 rounded-3xl border border-line/60 bg-white/55 p-4 shadow-soft-glow backdrop-blur-xl dark:border-night-line dark:bg-night/40 md:flex">
        {newChatButton}
        <div className="flex min-h-0 flex-col gap-1 overflow-y-auto pr-1">
          {conversations.map((conv) =>
            row(conv.id, conv.title || t("newConversation"))
          )}
          {conversations.length === 0 && (
            <p className="px-3 py-4 text-center text-xs font-light text-text-muted">
              {t("emptyConversations")}
            </p>
          )}
        </div>
      </aside>

      {/* Mobile chip row */}
      <div className="flex shrink-0 items-center gap-2 overflow-x-auto pb-1 md:hidden">
        <button
          onClick={createConversation}
          className={cn(CTA_CLASS, "shrink-0 px-3 py-1.5 text-xs")}
        >
          <Plus className="h-3 w-3" />
          {t("newChat")}
        </button>
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => openConversation(conv.id)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-light transition-colors",
              conv.id === activeId
                ? "border-healing-blue bg-white/80 text-text-main dark:bg-night-card/80 dark:text-gray-100"
                : "border-line/60 bg-white/50 text-text-muted dark:border-night-line dark:bg-night/50"
            )}
          >
            {conv.title || t("newConversation")}
          </button>
        ))}
      </div>
    </>
  );
}
