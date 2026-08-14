import { MAX_UPLOAD_BYTES, sanitizeAssetKey } from "@/lib/assetKey";
import { getBucket } from "@/lib/bucket";
import { getCloudflareEnv } from "@/lib/cloudflareEnv";
import { NextResponse } from "next/server";

// Admin asset management API (download assets: trial builds, press kit,
// docs...). Protected by a Bearer secret (ASSET_UPLOAD_SECRET) — the upload
// endpoint is disabled entirely when the secret is not configured.
// Assets are served publicly via /api/download/<key>.

// Worker secrets are only exposed via the env binding (not process.env),
// so check both — binding first, process.env as a local-Node fallback.
function getAssetSecret(): string | undefined {
  return getCloudflareEnv()?.ASSET_UPLOAD_SECRET || process.env.ASSET_UPLOAD_SECRET;
}

function isAuthorized(request: Request): boolean {
  const secret = getAssetSecret();
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

function bucketUnavailable() {
  return NextResponse.json(
    { error: "Storage is not configured" },
    { status: 503 }
  );
}

/** Lists uploaded assets. */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bucket = getBucket();
  if (!bucket) return bucketUnavailable();

  const list = await bucket.list({ prefix: "assets/" });
  return NextResponse.json({
    objects: list.objects.map((object) => ({
      key: object.key,
      size: object.size,
      uploaded: object.uploaded,
    })),
  });
}

/** Uploads a single file (multipart/form-data, field "file"). */
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bucket = getBucket();
  if (!bucket) return bucketUnavailable();

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_UPLOAD_BYTES / 1024 / 1024}MB)` },
      { status: 413 }
    );
  }

  let key: string;
  try {
    key = sanitizeAssetKey(file.name);
  } catch {
    return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  await bucket.put(key, arrayBuffer, {
    httpMetadata: {
      contentType: file.type || "application/octet-stream",
    },
  });

  return NextResponse.json({ success: true, key, url: `/api/download/${key}` });
}
