import { clearSessionCookie } from "@/lib/session";
import { NextResponse } from "next/server";

/** POST /api/auth/logout — clears the session cookie (stateless logout). */
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.headers.set("Set-Cookie", clearSessionCookie());
  return response;
}
