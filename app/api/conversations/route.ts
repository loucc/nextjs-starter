import { createConversation, listConversations } from "@/lib/chatDb";
import { getDB } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { NextResponse } from "next/server";

/** GET /api/conversations — the user's conversations, newest activity first. */
export async function GET(request: Request) {
  const auth = await requireUser(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const conversations = await listConversations(getDB()!, auth.user.id);
  return NextResponse.json({ conversations });
}

/** POST /api/conversations — creates an untitled conversation. */
export async function POST(request: Request) {
  const auth = await requireUser(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const conversation = await createConversation(getDB()!, auth.user.id);
  return NextResponse.json({ conversation }, { status: 201 });
}
