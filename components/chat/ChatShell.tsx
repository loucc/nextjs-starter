"use client";

import Composer from "@/components/chat/Composer";
import ConversationList from "@/components/chat/ConversationList";
import MessageList from "@/components/chat/MessageList";

/**
 * Two-pane chat layout: frosted conversation sidebar (chip row on mobile)
 * + message pane. Height is bounded so the page never scrolls on its own.
 */
export default function ChatShell() {
  return (
    <div className="flex h-[calc(100dvh-7rem)] w-full flex-col gap-3 md:flex-row md:gap-4">
      <ConversationList />
      <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-3xl border border-line/60 bg-white/40 shadow-soft-glow backdrop-blur-sm dark:border-night-line dark:bg-night/40">
        <MessageList />
        <Composer />
      </section>
    </div>
  );
}
