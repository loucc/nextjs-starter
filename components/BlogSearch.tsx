"use client";

import { Link as I18nLink } from "@/i18n/routing";
import { SearchablePost, filterPosts } from "@/lib/search";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

const MAX_RESULTS = 8;

export default function BlogSearch({
  posts,
  locale,
}: {
  posts: SearchablePost[];
  locale: string;
}) {
  const t = useTranslations("Blog");
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const results = useMemo(
    () => filterPosts(posts, query).slice(0, MAX_RESULTS),
    [posts, query]
  );

  const showResults = focused && query.trim().length > 0;

  return (
    <div className="relative max-w-xl mx-auto mb-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
          className="w-full pl-10 pr-4 py-2.5 rounded-full border border-line/70 bg-white/60 backdrop-blur-md text-sm font-light shadow-soft-glow focus:outline-none focus:ring-2 focus:ring-blue-400/40 dark:border-white/10 dark:bg-slate-800/50"
        />
      </div>

      {showResults && (
        <div className="absolute z-20 mt-2 w-full rounded-2xl border border-line/70 bg-white/70 backdrop-blur-xl shadow-soft-glow overflow-hidden dark:border-white/10 dark:bg-slate-800/70">
          {results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
              {t("noResults")}
            </div>
          ) : (
            results.map((post) => (
              <I18nLink
                key={post.slug}
                href={`/blog${post.slug}`}
                locale={locale}
                onMouseDown={(e) => e.preventDefault()}
                className="block px-4 py-3 hover:bg-blue-50/60 dark:hover:bg-slate-700/40 border-b border-slate-100/70 dark:border-slate-700/60 last:border-b-0"
              >
                <div className="text-sm font-medium text-slate-900 dark:text-gray-200 truncate">
                  {post.title}
                </div>
                {post.description && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {post.description}
                  </div>
                )}
              </I18nLink>
            ))
          )}
        </div>
      )}
    </div>
  );
}
