import { BookOpenCheck } from "lucide-react";
import Link from "next/link";
import { DATA_VERSION } from "@/config/release";
import { SiteNavigation } from "./site-navigation";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-[color-mix(in_srgb,var(--background)_92%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3 lg:px-6">
        <Link
          href="/"
          aria-label="Pokémon GO 保留指南首頁"
          className="hidden min-h-11 items-center gap-3 rounded-lg pr-2 font-bold sm:flex"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-[var(--primary)] text-[var(--primary-contrast)]">
            <BookOpenCheck aria-hidden size={22} />
          </span>
          <span className="hidden lg:block">
            <span className="block text-base">Pokémon GO 保留指南</span>
            <span className="block text-[10px] font-semibold tracking-wide text-[var(--muted)]">
              資料版本 {DATA_VERSION}
            </span>
          </span>
        </Link>
        <SiteNavigation />
        <ThemeToggle />
      </div>
    </header>
  );
}
