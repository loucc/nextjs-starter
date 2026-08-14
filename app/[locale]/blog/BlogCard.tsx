import { Link as I18nLink } from "@/i18n/routing";
import { BlogPost } from "@/types/blog";
import dayjs from "dayjs";
import Image from "next/image";

export function BlogCard({ post, locale }: { post: BlogPost; locale: string }) {
  return (
    <I18nLink
      href={`/blog${post.slug}`}
      prefetch={false}
      className="group block overflow-hidden rounded-[2rem] border border-white/50 bg-white/50 p-4 shadow-lg shadow-blue-500/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-blue-400/10 dark:border-white/10 dark:bg-slate-800/40"
    >
      <div className="relative overflow-hidden rounded-3xl pt-[56.25%]">
        <Image
          src={post.image || "/placeholder.svg"}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-1 flex-col px-2 py-4">
        <h2 className="line-clamp-2 flex-grow text-base font-normal leading-relaxed tracking-wide text-slate-800 transition-colors duration-300 group-hover:text-blue-600 dark:text-gray-200 dark:group-hover:text-blue-300">
          {post.title}
        </h2>
        <p className="mt-3 text-xs font-light tracking-wider text-slate-400 dark:text-slate-500">
          {dayjs(post.date).format("YYYY-MM-DD")}
        </p>
      </div>
    </I18nLink>
  );
}
