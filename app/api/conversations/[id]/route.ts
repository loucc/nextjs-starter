import { deleteConversation } from "@/lib/chatDb";
import { getDB } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { NextResponse } from "next/server";

/** DELETE /api/conversations/[id] — deletes the conversation and its messages. */
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  const deleted = await deleteConversation(getDB()!, auth.user.id, id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
