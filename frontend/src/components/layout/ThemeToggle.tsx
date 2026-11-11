"use client";

import { useEffect, useState } from "react";

/**
 * Toggles the Precision Spec dark (default) / light themes by swapping the
 * `dark`/`light` class on <html>. Persisted in localStorage; the no-flash
 * init script in the root layout restores it before first paint.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(!document.documentElement.classList.contains("light"));
  }, []);

  const toggle = () => {
    const el = document.documentElement;
    const next = el.classList.contains("dark") ? "light" : "dark";
    el.classList.toggle("dark", next === "dark");
    el.classList.toggle("light", next === "light");
    try {
      localStorage.setItem("gsmhub-theme", next);
    } catch {
      /* storage unavailable — theme just won't persist */
    }
    setIsDark(next === "dark");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors ${className}`}
    >
      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
        {isDark ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
