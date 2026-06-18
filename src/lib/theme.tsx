import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "light" | "dark" | "default";

type Ctx = { theme: Theme; setTheme: (t: Theme) => void };
const ThemeContext = createContext<Ctx>({ theme: "default", setTheme: () => {} });

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const isDark =
    theme === "dark" ||
    (theme === "default" && window.matchMedia?.("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", isDark);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("default");

  useEffect(() => {
    let initial: Theme = "default";
    try {
      const saved = localStorage.getItem("app:theme") as Theme | null;
      if (saved === "light" || saved === "dark" || saved === "default") initial = saved;
    } catch {}
    setThemeState(initial);
    applyTheme(initial);

    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onChange = () => { if ((localStorage.getItem("app:theme") || "default") === "default") applyTheme("default"); };
    mq?.addEventListener?.("change", onChange);
    return () => mq?.removeEventListener?.("change", onChange);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    try { localStorage.setItem("app:theme", t); } catch {}
    applyTheme(t);
  };

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
