"use client";

import { ClipboardList, Database, FileClock, TableProperties } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_BASE_PATH } from "@/config/site";
import { isPrimaryNavigationActive } from "@/lib/navigation";

const links = [
  { href: "/", label: "圖鑑評估", mobileLabel: "圖鑑", icon: TableProperties },
  { href: "/review", label: "資料待補清單", mobileLabel: "待補", icon: ClipboardList },
  { href: "/sources", label: "資料來源", mobileLabel: "來源", icon: Database },
  { href: "/changes", label: "變更紀錄", mobileLabel: "變更", icon: FileClock },
] as const;

export function SiteNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="主要導覽"
      className="flex flex-1 justify-between gap-0.5 overflow-x-auto sm:justify-start sm:gap-1"
    >
      {links.map(({ href, label, mobileLabel, icon: Icon }) => {
        const active = isPrimaryNavigationActive(pathname, href, SITE_BASE_PATH);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 shrink-0 items-center gap-1 rounded-lg px-1 text-xs transition sm:gap-2 sm:px-3 sm:text-sm ${
              active
                ? "bg-[var(--surface-muted)] font-bold text-[var(--primary)]"
                : "font-medium text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <Icon aria-hidden size={17} />
            <span className="sm:hidden">{mobileLabel}</span>
            <span className="hidden sm:inline">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
