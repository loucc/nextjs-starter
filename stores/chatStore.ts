// ---------------------------------------------------------------------------
// Client state for the chat feature (zustand, same pattern as localeStore).
// Only client components read it — never touched during SSR.
// ---------------------------------------------------------------------------

import { create } from "zustand";
import type { ChatUser, Conversation, Message } from "@/types/chat";

export type ChatStatus = "checking" | "guest" | "authed";

interface ChatState {
  user: ChatUser | null;
  status: ChatStatus;
  signInError: string | null;
  conversations: Conversation[];
  activeConversationId: string | null;
  messagesByConversation: Record<string, Message[]>;
  streaming: { conversationId: string; text: string } | null;
  setUser: (user: ChatUser | null) => void;
  setStatus: (status: ChatStatus) => void;
  setSignInError: (error: string | null) => void;
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (id: string | null) => void;
  upsertConversation: (conversation: Conversation) => void;
  removeConversation: (id: string) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  appendMessage: (conversationId: string, message: Message) => void;
  setStreaming: (streaming: ChatState["streaming"]) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  user: null,
  status: "checking",
  signInError: null,
  conversations: [],
  activeConversationId: null,
  messagesByConversation: {},
  streaming: null,

  setUser: (user) => set({ user }),
  setStatus: (status) => set({ status }),
  setSignInError: (signInError) => set({ signInError }),

  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (id) => set({ activeConversationId: id }),

  upsertConversation: (conversation) =>
    set((state) => {
      const exists = state.conversations.some((c) => c.id === conversation.id);
      return {
        conversations: exists
          ? state.conversations.map((c) =>
              c.id === conversation.id ? conversation : c
            )
          : [conversation, ...state.conversations],
      };
    }),

  removeConversation: (id) =>
    set((state) => {
      const messages = { ...state.messagesByConversation };
      delete messages[id];
      return {
        conversations: state.conversations.filter((c) => c.id !== id),
        activeConversationId:
          state.activeConversationId === id ? null : state.activeConversationId,
        messagesByConversation: messages,
      };
    }),

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: messages,
      },
    })),

  appendMessage: (conversationId, message) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: [
          ...(state.messagesByConversation[conversationId] ?? []),
          message,
        ],
      },
    })),

  setStreaming: (streaming) => set({ streaming }),

  reset: () =>
    set({
      user: null,
      status: "guest",
      signInError: null,
      conversations: [],
      activeConversationId: null,
      messagesByConversation: {},
      streaming: null,
    }),
}));
