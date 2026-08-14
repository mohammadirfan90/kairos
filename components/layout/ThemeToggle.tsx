"use client";

import React, { useEffect, useState } from "react";
import { Icons } from "../ui/Icons";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("kairos-theme") as "light" | "dark" | null;
    if (stored) {
      setTheme(stored);
      document.documentElement.classList.toggle("dark", stored === "dark");
    } else {
      // Default to dark mode for technical engineering aesthetic
      setTheme("dark");
      document.documentElement.classList.add("dark");
      localStorage.setItem("kairos-theme", "dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("kairos-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  if (!mounted) {
    return (
      <div className="h-8 px-2.5 border border-neutral-300 dark:border-neutral-700 flex items-center text-xs font-mono rounded-sm opacity-50">
        <Icons.Moon size={14} className="mr-1.5" /> THEME
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="h-8 px-2.5 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1.5 text-xs font-mono rounded-sm select-none"
      title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? (
        <>
          <Icons.Sun size={14} className="text-amber-400" />
          <span className="tracking-wider uppercase text-[11px]">LIGHT</span>
        </>
      ) : (
        <>
          <Icons.Moon size={14} className="text-neutral-700" />
          <span className="tracking-wider uppercase text-[11px]">DARK</span>
        </>
      )}
    </button>
  );
}
