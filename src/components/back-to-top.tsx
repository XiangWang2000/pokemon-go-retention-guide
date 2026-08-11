"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export const BACK_TO_TOP_THRESHOLD = 640;

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY >= BACK_TO_TOP_THRESHOLD);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  if (!visible) return null;

  function scrollToTop() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="回到頁面頂端"
      title="回到頂端"
      className="back-to-top fixed right-4 bottom-[calc(env(safe-area-inset-bottom)_+_1rem)] z-30 grid size-11 place-items-center rounded-full border bg-[var(--surface)] text-[var(--foreground)] shadow-lg transition hover:bg-[var(--surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] lg:hidden"
    >
      <ArrowUp aria-hidden size={20} />
    </button>
  );
}
