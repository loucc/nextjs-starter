"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChat } from "@/hooks/useChat";
import { Link as I18nLink } from "@/i18n/routing";
import { useChatStore } from "@/stores/chatStore";
import { LogOut, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

const LOGIN_CLASS =
  "hidden md:inline-flex items-center rounded-full bg-gradient-to-r from-blue-400 to-violet-400 px-5 py-2 text-sm font-light tracking-wide text-white shadow-[0_10px_30px_-8px_rgba(96,165,250,0.6),0_0_24px_rgba(167,139,250,0.4)] transition-all duration-300 hover:scale-[1.05] hover:brightness-105 active:scale-[0.98]";

/**
 * Header auth area, driven by the shared chat store: the gradient login
 * button for guests, an avatar dropdown (Chat / Log out) when authed.
 */
export default function UserMenu() {
  const tHeader = useTranslations("Header");
  const tChat = useTranslations("Chat");
  const user = useChatStore((s) => s.user);
  const status = useChatStore((s) => s.status);
  const { loadMe, logout } = useChat();

  useEffect(() => {
    if (status === "checking") loadMe();
  }, [status, loadMe]);

  if (status !== "authed" || !user) {
    return (
      <I18nLink href="/chat" className={LOGIN_CLASS}>
        {tHeader("login")}
      </I18nLink>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={user.name ?? "Account"}
        className="hidden md:block rounded-full outline-none focus-visible:ring-2 focus-visible:ring-healing-blue/50"
      >
        {user.picture ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote Google avatar, not an optimized asset
          <img
            src={user.picture}
            alt={user.name ?? ""}
            className="h-8 w-8 rounded-full border border-line/60 dark:border-white/10"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-violet-400 text-sm font-normal text-white">
            {(user.name ?? "S").charAt(0).toUpperCase()}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem>
          <I18nLink href="/chat" className="flex items-center gap-2 font-light">
            <MessageSquare className="h-4 w-4" />
            {tChat("newChat")}
          </I18nLink>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => void logout()}
          className="flex items-center gap-2 font-light"
        >
          <LogOut className="h-4 w-4" />
          {tChat("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
