import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { DATA_VERSION, DATA_VERSION_DATE_ZH_TW } from "@/config/release";
import { sitePath } from "@/config/site";
import "./globals.css";

const siteTitle = "Pokémon GO 寶可夢保留價值指南";
const siteDescription = "以可追溯來源與集中式規則評估 Pokémon GO 各型態的通用保留價值。";
const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://pokemon-go-retention-guide.wang890921.chatgpt.site/",
);

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl.origin),
  title: {
    default: siteTitle,
    template: `%s｜${siteTitle}`,
  },
  description: siteDescription,
  alternates: { canonical: sitePath("/") },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: new URL(sitePath("/"), siteUrl.origin).toString(),
    siteName: siteTitle,
    title: `${siteTitle}（資料版本 ${DATA_VERSION}）`,
    description: `${siteDescription} 資料版本：${DATA_VERSION}（${DATA_VERSION_DATE_ZH_TW} 更新）。`,
  },
  twitter: {
    card: "summary",
    title: `${siteTitle}（${DATA_VERSION}）`,
    description: siteDescription,
  },
  robots: { index: true, follow: true },
  other: {
    "data-version": DATA_VERSION,
    "data-version-date": DATA_VERSION_DATE_ZH_TW,
  },
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
