# Pokémon GO Retention Guide Repository Map

這是 task 導航圖，不是完整檔案樹。變更前仍須用 `rg` 與目前程式確認符號、資料格式及指令行為。

## Start Here

- `AGENTS.md`：專案差異、資料邊界與驗證分流。
- `docs/codex-thread-summary.md`：持久架構決策與未解限制。
- `README.md`：產品範圍、完整操作說明與使用者文件。
- `docs/data-update.md`：來源研究、審核與資料更新 checklist。
- `docs/github-pages.md`：GitHub Pages static export、snapshot 與部署邊界。
- `docs/legacy-sites-migration.md`：退休 Sites/Vinext/Cloudflare 遷移的歷史紀錄，非現行操作手冊。

## Runtime

- GitHub Pages：Next.js static export 與 `out/` artifact；部署只使用 `.github/workflows/deploy-pages.yml`。
- Next.js：本機 fallback；使用 `npm run dev:local`、`npm run build:local` 與 `npm run start:local`。
- `scripts/serve-pages.mjs`：本機提供 Pages `out/` artifact 的 HTTP 入口。

## 資料流程

1. 研究證據進入 `research_notes/` 與 `data/sources/`，並保留來源版本與查閱資訊。
2. Prisma schema、migration 與 seed 定義結構化資料與資料庫操作。
3. `scripts/validate-data.ts`、`scripts/generate-review.ts` 與 remediation scripts 驗證資料並產出審核資訊。
4. `scripts/prepare-release-snapshot.ts` 將 `scripts/generate-static-snapshot.ts` 的輸出寫入 staging，
   由 `scripts/verify-release.ts` 驗證後才 promote 到 `site-data/`、`public/data/`、`public/exports/` 與 Excel 交付資料。
5. GitHub Pages 讀取受控 static snapshot；不要讓部署 runtime 直接依賴本機 SQLite。

## 主要區域

| 路徑                          | 責任                                   |
| ----------------------------- | -------------------------------------- |
| `src/rules/`                  | 保留／傳送判定規則與規則引擎。         |
| `src/data/`                   | 資料讀取、轉換與 schema 周邊程式。     |
| `src/app/`、`src/components/` | Next.js 介面與 API／匯出路由。         |
| `prisma/`                     | Schema、migration 與 seed。            |
| `scripts/`                    | 匯入、驗證、審核報告與 snapshot 產生。 |
| `tests/`                      | 單元與整合測試。                       |

## Source of Truth 與產生物

- 研究資料與來源快照必須能追溯到 `research_notes/`、`data/sources/` 或受控 import。
- `site-data/`、`public/data/`、`public/exports/`、資料庫、build output 與 caches 是流程產物；修正應回到其來源。
- 每次資料批次完成前須有來源、審核與變更紀錄；無法驗證的結論保持在 review 狀態。

## 驗證

`scripts/verify.ps1` 是非變異驗證 wrapper：預設快速驗證，`-Full` 透過共用 `release:verify` contract
檢查既有 review、snapshot、資料與 GitHub Pages static build。資料產生順序依 `docs/data-update.md`，個別
`npm run` 指令仍以 `README.md` 為準。
