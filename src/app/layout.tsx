import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { DATA_VERSION, DATA_VERSION_DATE_ZH_TW } from "@/config/release";
import { sitePath } from "@/config/site";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "./seo-metadata";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL.origin),
  title: {
    default: SITE_TITLE,
    template: `%s｜${SITE_TITLE}`,
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: sitePath("/") },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: new URL(sitePath("/"), SITE_URL.origin).toString(),
    siteName: SITE_TITLE,
    title: `${SITE_TITLE}（資料版本 ${DATA_VERSION}）`,
    description: `${SITE_DESCRIPTION} 資料版本：${DATA_VERSION}（${DATA_VERSION_DATE_ZH_TW} 更新）。`,
  },
  twitter: {
    card: "summary",
    title: `${SITE_TITLE}（${DATA_VERSION}）`,
    description: SITE_DESCRIPTION,
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
