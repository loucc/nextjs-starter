import { requireUser, toPublicUser } from "@/lib/session";
import { NextResponse } from "next/server";

/** GET /api/me — returns the session user, 401 when unauthenticated. */
export async function GET(request: Request) {
  const auth = await requireUser(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  return NextResponse.json({ user: toPublicUser(auth.user) });
}
