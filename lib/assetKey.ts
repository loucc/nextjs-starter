export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Sanitizes an uploaded file name into a safe R2 object key under the
 * "assets/" prefix. Throws when the name is unusable.
 */
export function sanitizeAssetKey(filename: string): string {
  const base = filename
    .toLowerCase()
    // Keep only safe characters; anything else becomes a dash.
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/\.{2,}/g, ".")
    .replace(/^[-.]+|[-.]+$/g, "");

  if (!base) {
    throw new Error("Invalid file name");
  }

  return `assets/${base}`;
}

/** Rejects object keys containing path traversal or empty segments. */
export function isSafeObjectKey(key: string): boolean {
  const segments = key.split("/");
  return segments.every((segment) => segment !== "" && segment !== "..");
}
