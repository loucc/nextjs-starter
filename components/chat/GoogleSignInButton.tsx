"use client";

import Script from "next/script";
import { useRef } from "react";
import { useChatStore } from "@/stores/chatStore";
import { useTranslations } from "next-intl";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, unknown>
          ) => void;
        };
      };
    };
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

/**
 * Official "Sign in with Google" button. The GIS script initializes on
 * onLoad and renders the official button into a container styled with the
 * healing tokens (pill shape, frosted surroundings come from the parent).
 */
export default function GoogleSignInButton() {
  const t = useTranslations("Chat");
  const containerRef = useRef<HTMLDivElement>(null);

  const init = () => {
    if (!CLIENT_ID || !window.google || !containerRef.current) return;

    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: async ({ credential }) => {
        try {
          const res = await fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential }),
          });
          const data = await res.json();
          if (!res.ok) {
            useChatStore
              .getState()
              .setSignInError(data.error || t("signInError"));
            return;
          }
          useChatStore.getState().setUser(data.user);
          useChatStore.getState().setStatus("authed");
          useChatStore.getState().setSignInError(null);
        } catch {
          useChatStore.getState().setSignInError(t("signInError"));
        }
      },
    });

    window.google.accounts.id.renderButton(containerRef.current, {
      theme: "outline",
      size: "large",
      shape: "pill",
      width: 240,
    });
  };

  return (
    <div>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={init}
      />
      <div ref={containerRef} />
    </div>
  );
}
