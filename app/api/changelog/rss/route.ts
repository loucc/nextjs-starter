import { siteConfig } from "@/config/site";
import { getChangelog } from "@/lib/content";

// RSS 2.0 feed of the changelog (English entries). Subscribe at
// /api/changelog/rss to get release updates in your reader.
export async function GET() {
  const { entries } = await getChangelog("en");

  const items = entries
    .map(
      (entry) => `
    <item>
      <title>${entry.title || entry.version}</title>
      <link>${siteConfig.url}/changelog#${entry.version}</link>
      <guid>${siteConfig.url}/changelog#${entry.version}</guid>
      <pubDate>${new Date(entry.date).toUTCString()}</pubDate>
      <description>${entry.version} release notes — see the changelog page for details.</description>
    </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${siteConfig.name} Changelog</title>
    <link>${siteConfig.url}/changelog</link>
    <description>${siteConfig.description}</description>
    <language>en</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
