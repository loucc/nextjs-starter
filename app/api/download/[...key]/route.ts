import { isSafeObjectKey } from "@/lib/assetKey";
import { getBucket } from "@/lib/bucket";
import { NextResponse } from "next/server";

// Public download endpoint for R2 assets (e.g. /api/download/assets/press-kit.pdf).
// Content is streamed straight from the bucket with long-lived caching.

export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string[] }> }
) {
  const { key } = await context.params;
  const objectKey = key.join("/");

  if (!isSafeObjectKey(objectKey)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const bucket = getBucket();
  if (!bucket) {
    return NextResponse.json(
      { error: "Storage is not configured" },
      { status: 503 }
    );
  }

  const object = await bucket.get(objectKey);
  if (!object) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const headers = new Headers();
  headers.set(
    "Content-Type",
    object.httpMetadata?.contentType || "application/octet-stream"
  );
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set(
    "Content-Disposition",
    `inline; filename="${objectKey.split("/").pop()}"`
  );
  if (object.etag) {
    headers.set("ETag", object.etag);
  }

  // The workers-types ReadableStream differs slightly from the DOM lib's
  // (missing asyncIterator) — cast across the boundary. It streams fine on
  // both workerd and Node.
  return new Response(object.body as unknown as BodyInit, { headers });
}
