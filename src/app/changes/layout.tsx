import { pageMetadata } from "../seo-metadata";

export const metadata = pageMetadata({
  title: "變更紀錄",
  description: "查看 Pokémon GO 保留指南的欄位修改前後值、修改原因、資料來源與規則版本。",
  pathname: "/changes/",
});

export default function ChangesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
