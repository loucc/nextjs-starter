import { Callout } from "@/components/mdx/Callout";
import { JsonLd } from "@/components/JsonLd";
import { Locale, LOCALES } from "@/i18n/routing";
import { getPosts } from "@/lib/content";
import { blogPostingJsonLd } from "@/lib/jsonLd";
import { constructMetadata } from "@/lib/metadata";
import { BlogPost } from "@/types/blog";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type Params = Promise<{
  locale: string;
  slug: string;
}>;

type MetadataProps = {
  params: Params;
};

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { locale, slug } = await params;
  let { posts }: { posts: BlogPost[] } = await getPosts(locale);
  const post = posts.find((post) => post.slug === "/" + slug);

  if (!post) {
    return constructMetadata({
      title: "404",
      description: "Page not found",
      noIndex: true,
      locale: locale as Locale,
      path: `/blog/${slug}`,
      canonicalUrl: `/blog/${slug}`,
    });
  }

  return constructMetadata({
    page: "blog",
    title: post.title,
    description: post.description,
    images: post.image ? [post.image] : [],
    locale: locale as Locale,
    path: `/blog/${slug}`,
    canonicalUrl: `/blog/${slug}`,
  });
}

export default async function BlogPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  let { posts }: { posts: BlogPost[] } = await getPosts(locale);

  const post = posts.find((item) => item.slug === "/" + slug);

  if (!post) {
    return notFound();
  }

  return (
    <div className="w-full md:w-3/5 px-2 md:px-12">
      <JsonLd data={blogPostingJsonLd(post, locale)} />
      <h1 className="break-words text-4xl font-bold mt-6 mb-4">{post.title}</h1>
      {post.image && (
        <img src={post.image} alt={post.title} className="rounded-sm" />
      )}
      {post.tags && post.tags.split(",").length ? (
        <div className="flex flex-wrap gap-2">
          {post.tags.split(",").map((tag) => {
            return (
              <div
                key={tag}
                className="rounded-full border border-line/60 bg-white/60 px-3 py-1.5 text-xs font-light text-text-muted backdrop-blur-sm transition-colors hover:border-healing-blue hover:text-blue-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:text-blue-300"
              >
                {tag.trim()}
              </div>
            );
          })}
        </div>
      ) : (
        <></>
      )}
      {post.description && <Callout>{post.description}</Callout>}
      {post.Component && <post.Component />}
    </div>
  );
}

export async function generateStaticParams() {
  let posts = (await getPosts()).posts;

  // Filter out posts without a slug
  posts = posts.filter((post) => post.slug);

  return LOCALES.flatMap((locale) =>
    posts.map((post) => {
      const slugPart = post.slug.replace(/^\//, "").replace(/^blog\//, "");

      return {
        locale,
        slug: slugPart,
      };
    })
  );
}
