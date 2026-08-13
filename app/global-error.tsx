"use client";

// Renders outside the root layout — no NextIntlClientProvider is available
// here, so the copy is plain English.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "2rem",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1 style={{ fontSize: "1.875rem", fontWeight: 700 }}>
            Something went wrong
          </h1>
          <p style={{ color: "#6b7280", maxWidth: "28rem" }}>
            An unexpected error occurred. Please try again, or come back
            later.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "0.5rem",
              background: "#111827",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
