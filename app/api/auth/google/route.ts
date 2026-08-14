import { upsertUser, verifyGoogleIdToken } from "@/lib/auth/google";
import { getDB } from "@/lib/db";
import { sessionCookieHeader, signSessionToken, toPublicUser } from "@/lib/session";
import { NextResponse } from "next/server";

/**
 * POST /api/auth/google — exchanges a Google Identity Services `credential`
 * (ID token JWT) for a SerenAI session. Verifies the token with Google,
 * upserts the user, and sets the httpOnly session cookie.
 */
export async function POST(request: Request) {
  try {
    const db = getDB();
    if (!db) {
      return NextResponse.json(
        { error: "Database is not configured" },
        { status: 503 }
      );
    }

    const { credential } = await request.json();
    if (!credential || typeof credential !== "string") {
      return NextResponse.json(
        { error: "credential is required" },
        { status: 400 }
      );
    }

    const profile = await verifyGoogleIdToken(credential);
    const user = await upsertUser(db, profile);
    const token = await signSessionToken(user.google_sub);

    const response = NextResponse.json({
      user: toPublicUser({
        id: user.id,
        googleSub: user.google_sub,
        email: user.email,
        name: user.name,
        picture: user.picture,
        locale: user.locale,
      }),
    });
    response.headers.set("Set-Cookie", sessionCookieHeader(token));
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.startsWith("Google sign-in is not configured")) {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    if (message === "Invalid Google ID token") {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    console.error("[auth/google]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
