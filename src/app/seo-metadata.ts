import type { Metadata } from "next";
import { DATA_VERSION, DATA_VERSION_DATE_ZH_TW } from "@/config/release";
import { sitePath } from "@/config/site";

export const SITE_TITLE = "Pokémon GO 寶可夢保留價值指南";
export const SITE_DESCRIPTION = "以可追溯來源與集中式規則評估 Pokémon GO 各型態的通用保留價值。";

export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://xiangwang2000.github.io/pokemon-go-retention-guide/",
);

export function absoluteSiteUrl(pathname: string) {
  return new URL(sitePath(pathname), SITE_URL.origin).toString();
}

export function pageMetadata({
  title,
  description = SITE_DESCRIPTION,
  pathname,
}: {
  title: string;
  description?: string;
  pathname: string;
}): Metadata {
  const url = absoluteSiteUrl(pathname);
  return {
    title,
    description,
    alternates: { canonical: sitePath(pathname) },
    openGraph: {
      type: "website",
      locale: "zh_TW",
      url,
      siteName: SITE_TITLE,
      title: `${title}｜${SITE_TITLE}`,
      description,
    },
    twitter: {
      card: "summary",
      title: `${title}｜${SITE_TITLE}`,
      description,
    },
    other: {
      "data-version": DATA_VERSION,
      "data-version-date": DATA_VERSION_DATE_ZH_TW,
    },
  };
}
