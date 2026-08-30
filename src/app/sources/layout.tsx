import { pageMetadata } from "../seo-metadata";

export const metadata = pageMetadata({
  title: "資料來源",
  description:
    "查看 Pokémon GO 保留指南使用的官方公告、PvP 資料與其他可追溯來源，以及各來源的引用範圍。",
  pathname: "/sources/",
});

export default function SourcesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
