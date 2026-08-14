"use client";

import { useState } from "react";
import { Send, Square } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@/hooks/useChat";
import { useChatStore } from "@/stores/chatStore";
import { useTranslations } from "next-intl";

const MAX_LENGTH = 4000;

const SEND_CLASS =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-violet-400 text-white shadow-[0_10px_30px_-8px_rgba(96,165,250,0.6),0_0_24px_rgba(167,139,250,0.4)] transition-all duration-300 hover:scale-[1.05] hover:brightness-105 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40";

/** Input row: Enter sends, Shift+Enter adds a newline; stop button while streaming. */
export default function Composer() {
  const t = useTranslations("Chat");
  const { sendMessage, stopStreaming } = useChat();
  const streaming = useChatStore((s) => s.streaming);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const busy = streaming !== null;

  const submit = async () => {
    const content = value.trim();
    if (!content || busy) return;
    setError(null);
    setValue("");
    const result = await sendMessage(content);
    if (!result.ok) setError(result.error ?? t("errorSend"));
  };

  return (
    <div className="border-t border-line/60 p-3 sm:p-4 dark:border-night-line">
      <div className="flex items-end gap-2">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void submit();
            }
          }}
          placeholder={t("inputPlaceholder")}
          rows={1}
          maxLength={MAX_LENGTH}
          className="max-h-40 flex-1 resize-none"
        />
        {busy ? (
          <button
            onClick={stopStreaming}
            aria-label={t("stop")}
            className={SEND_CLASS}
          >
            <Square className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => void submit()}
            disabled={!value.trim()}
            aria-label={t("send")}
            className={SEND_CLASS}
          >
            <Send className="h-4 w-4" />
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
