"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Locale,
  LOCALE_NAMES,
  routing,
  usePathname,
  useRouter,
} from "@/i18n/routing";
import { useLocaleStore } from "@/stores/localeStore";
import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { useSyncExternalStore, useTransition } from "react";

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = useLocale();
  const { dismissLanguageAlert } = useLocaleStore();
  const [, startTransition] = useTransition();
  // hydration-safe "mounted" flag: false during SSR, true after hydration
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  function onSelectChange(nextLocale: Locale) {
    dismissLanguageAlert();

    startTransition(() => {
      router.replace(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        // { pathname: "/", params: params || {} }, // if your want to redirect to the home page
        { pathname, params: params || {} }, // if your want to redirect to the current page
        { locale: nextLocale },
      );
    });
  }

  // avoid hydration mismatch, don't render until client is mounted
  if (!mounted) {
    return (
      <div className="w-fit h-9 bg-transparent border border-line/70 dark:border-white/20 rounded-md px-3 py-2 flex items-center">
        <Globe className="w-4 h-4 mr-1 text-text-main dark:text-white" />
        <span className="text-text-main dark:text-white text-sm">
          {LOCALE_NAMES[locale as Locale]}
        </span>
      </div>
    );
  }

  return (
    <Select value={locale} onValueChange={onSelectChange}>
      <SelectTrigger className="w-fit bg-transparent border-gray-300 dark:border-white/30 text-text-main dark:text-white hover:bg-healing-mist/70 dark:hover:bg-white/10">
        <Globe className="w-4 h-4 mr-1" />
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        {routing.locales.map((cur) => (
          <SelectItem key={cur} value={cur}>
            {LOCALE_NAMES[cur]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
