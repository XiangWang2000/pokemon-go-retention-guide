import { pageMetadata } from "../seo-metadata";

export const metadata = pageMetadata({
  title: "資料待補清單",
  description: "查看 Pokémon GO 保留指南目前仍待補充或待驗證的資料項目，以及是否影響家族保留結論。",
  pathname: "/review/",
});

export default function ReviewLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
