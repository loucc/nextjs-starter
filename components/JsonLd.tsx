/**
 * Renders a JSON-LD structured data script tag. Works in server components;
 * the inline <script> is covered by the 'unsafe-inline' script-src entry
 * in the production CSP.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
