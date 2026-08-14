/** Shapes shared by the chat UI, store and API routes. */

export interface ChatUser {
  id: string;
  email: string | null;
  name: string | null;
  picture: string | null;
  locale: string | null;
}

export interface Conversation {
  id: string;
  title: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}
