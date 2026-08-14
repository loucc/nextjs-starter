"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// ---------------------------------------------------------------------------
// Minimal theme provider replacing next-themes.
//
// next-themes renders a raw <script> element inside its client component
// tree, which React 19.2 rejects in dev ("Encountered a script tag while
// rendering React component"). This implementation keeps the same public
// surface (ThemeProvider / useTheme / setTheme) but injects the no-flash
// script as static HTML in the root layout instead.
// ---------------------------------------------------------------------------

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "theme";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  setTheme: () => {},
  resolvedTheme: "light",
});

export function useTheme() {
  return useContext(ThemeContext);
}

function systemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  enableSystem = true,
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  attribute?: string; // accepted for API compatibility (class strategy only)
  enableSystem?: boolean;
}) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    try {
      return (localStorage.getItem(STORAGE_KEY) as Theme) || defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => {
    if (theme === "system") {
      return typeof window !== "undefined" && enableSystem
        ? systemTheme()
        : "light";
    }
    return theme;
  });

  // Applies the theme to the DOM and returns the resolved value. Pure DOM
  // side effect — state updates are the caller's responsibility, so the
  // mount effect below never sets state synchronously.
  const applyToDom = useCallback(
    (next: Theme): "light" | "dark" => {
      const resolved =
        next === "system" ? (enableSystem ? systemTheme() : "light") : next;
      const el = document.documentElement;
      el.classList.remove("light", "dark");
      el.classList.add(resolved);
      el.style.colorScheme = resolved;
      return resolved;
    },
    [enableSystem]
  );

  const setTheme = useCallback(
    (next: Theme) => {
      setThemeState(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // storage unavailable — session-only theme
      }
      setResolvedTheme(applyToDom(next));
    },
    [applyToDom]
  );

  useEffect(() => {
    applyToDom(theme);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (theme === "system") {
        setResolvedTheme(applyToDom("system"));
      }
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme, applyToDom]);

  const value = useMemo(
    () => ({ theme, setTheme, resolvedTheme }),
    [theme, setTheme, resolvedTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
