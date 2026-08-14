import * as React from "react";

import { cn } from "@/lib/utils";

// Hand-written shadcn-style textarea, styled with the healing tokens
// (matches the frosted-input language used across the chat UI).
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[2.75rem] w-full rounded-2xl border border-line/60 bg-white/70 px-4 py-2.5 text-sm font-light text-text-main backdrop-blur-sm placeholder:text-text-muted/60 focus-visible:border-healing-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-healing-blue/50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-night-line dark:bg-night-card/60 dark:text-gray-100 dark:placeholder:text-slate-500",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
