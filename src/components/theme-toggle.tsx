"use client";

import { SunMoon } from "lucide-react";
import { useEffect } from "react";

export function ThemeToggle() {
  useEffect(() => {
    const preferred =
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", preferred);
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center gap-2 rounded-lg border bg-[var(--surface)] px-3 text-sm font-medium transition hover:bg-[var(--surface-muted)]"
      aria-label="切換淺色或深色模式"
    >
      <SunMoon aria-hidden size={18} />
      <span className="hidden lg:inline">切換主題</span>
    </button>
  );
}
