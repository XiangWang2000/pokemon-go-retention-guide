import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pokémon GO 寶可夢保留價值指南",
  description: "以可追溯來源與集中式規則評估 Pokémon GO 各型態的通用保留價值。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body>
        <a
          href="#main-content"
          className="fixed left-3 top-3 z-50 -translate-y-24 rounded-lg bg-[var(--foreground)] px-4 py-2 text-[var(--background)] focus:translate-y-0"
        >
          跳至主要內容
        </a>
        <SiteHeader />
        <main id="main-content" className="mx-auto max-w-[1600px] px-4 py-6 lg:px-6 lg:py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
