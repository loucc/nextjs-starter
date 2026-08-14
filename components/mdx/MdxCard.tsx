import Link from "next/link";

import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  href?: string;
  disabled?: boolean;
}

export function MdxCard({
  href,
  className,
  children,
  disabled,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "group relative rounded-2xl border border-line/60 bg-white/50 p-6 shadow-soft-glow backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-400/10",
        disabled && "cursor-not-allowed opacity-60",
        className
      )}
      {...props}
    >
      <div className="flex flex-col justify-between space-y-4">
        <div className="space-y-2 [&>h3]:!mt-0 [&>h4]:!mt-0 [&>p]:text-muted-foreground">
          {children}
        </div>
      </div>
      {href && (
        <Link
          href={disabled ? "#" : href}
          className="absolute inset-0"
          prefetch={false}
        >
          <span className="sr-only">View</span>
        </Link>
      )}
    </div>
  );
}
