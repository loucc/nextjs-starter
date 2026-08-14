/**
 * Client-side post filtering for the blog search box. Pure function —
 * content is bundled at build time, so filtering happens locally (a D1
 * FTS5 index can replace this when the content volume grows).
 */
export interface SearchablePost {
  slug: string;
  title: string;
  description?: string;
  tags?: string;
  date: string;
}

export function filterPosts(
  posts: SearchablePost[],
  query: string
): SearchablePost[] {
  const q = query.trim().toLowerCase();
  if (!q) return posts;

  return posts.filter((post) => {
    const haystack = [post.title, post.description, post.tags]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
