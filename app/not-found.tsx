import Link from "next/link";

// Root catch-all for paths that bypass the locale middleware (e.g. unknown
// /api routes). Plain HTML — no providers are mounted at this level.
export default function NotFound() {
  return (
    <html>
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h1 style={{ fontSize: "1.875rem", fontWeight: 700 }}>404</h1>
        <p style={{ color: "#6b7280" }}>This page could not be found.</p>
        <Link href="/" style={{ color: "#2563eb" }}>
          Go to homepage
        </Link>
      </body>
    </html>
  );
}
