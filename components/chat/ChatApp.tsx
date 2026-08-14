"use client";

import { useEffect } from "react";
import ChatShell from "@/components/chat/ChatShell";
import SignInPanel from "@/components/chat/SignInPanel";
import { useChat } from "@/hooks/useChat";
import { useChatStore } from "@/stores/chatStore";

/** Gate: session check -> sign-in panel or the chat shell. */
export default function ChatApp() {
  const status = useChatStore((s) => s.status);
  const { loadMe, loadConversations } = useChat();

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  useEffect(() => {
    if (status === "authed") loadConversations();
  }, [status, loadConversations]);

  if (status === "checking") {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gradient-to-r from-blue-400 to-violet-400" />
      </div>
    );
  }

  if (status === "guest") {
    return <SignInPanel />;
  }

  return <ChatShell />;
}
