import { BookOpenCheck, ClipboardList, Database, FileClock, TableProperties } from "lucide-react";
import Link from "next/link";
import { DATA_VERSION } from "@/config/release";
import { ThemeToggle } from "./theme-toggle";

const links = [
  { href: "/", label: "圖鑑評估", icon: TableProperties },
  { href: "/review", label: "資料待補清單", icon: ClipboardList },
  { href: "/sources", label: "資料來源", icon: Database },
  { href: "/changes", label: "變更紀錄", icon: FileClock },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-[color-mix(in_srgb,var(--background)_92%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3 lg:px-6">
        <Link href="/" className="flex min-h-11 items-center gap-3 rounded-lg pr-2 font-bold">
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
        <nav aria-label="主要導覽" className="flex flex-1 gap-1 overflow-x-auto">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
            >
              <Icon aria-hidden size={17} />
              {label}
            </Link>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
