"use client";

import { ClipboardList, Database, FileClock, TableProperties } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_BASE_PATH } from "@/config/site";
import { isPrimaryNavigationActive } from "@/lib/navigation";

const links = [
  { href: "/", label: "圖鑑評估", icon: TableProperties },
  { href: "/review", label: "資料待補清單", icon: ClipboardList },
  { href: "/sources", label: "資料來源", icon: Database },
  { href: "/changes", label: "變更紀錄", icon: FileClock },
] as const;

export function SiteNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="主要導覽" className="flex flex-1 gap-1 overflow-x-auto">
      {links.map(({ href, label, icon: Icon }) => {
        const active = isPrimaryNavigationActive(pathname, href, SITE_BASE_PATH);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-sm transition ${
              active
                ? "bg-[var(--surface-muted)] font-bold text-[var(--primary)]"
                : "font-medium text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <Icon aria-hidden size={17} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
