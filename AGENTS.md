# Pokémon GO Retention Guide Instructions

此專案繼承 `C:\Users\User\.codex\AGENTS.md`；不要重複全域的工具、推理強度或子代理規則。

## 閱讀順序

1. `AGENTS.md`
2. `docs/repo-map.md`
3. `docs/codex-thread-summary.md`
4. 相關的 `docs/data-update.md`、`docs/sites-migration.md` 與目標程式碼

## Runtime 與資料邊界

- Sites／Vinext 是部署與受控 snapshot 的主要 runtime；Next.js 僅為 `dev:local`、`build:local`、`start:local` 的本機 fallback。
- `research_notes/`、`data/sources/pvpoke/`、`prisma/` 與 `site-data/` 分別保存研究證據、來源快照、資料模型與部署快照；不要繞過既有 scripts 手動改寫產物。
- 每批資料更新必須遵守 `docs/data-update.md` 的來源、人工審核與變更紀錄規則；人工核准前不得把下一批列為已完成。
- `site-data/` 與 `public/exports/` 是由受控流程產生的交付資料。需要新 snapshot 時明確執行 `npm run sites:snapshot`，驗證不應隱性改寫它們。

## 驗證

- 純文件變更：檢查 Markdown 連結、命令與本檔閱讀順序。
- 一般 UI、規則或程式變更：`powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify.ps1`
- 資料、來源、Prisma、Sites binding 或建置變更：`powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify.ps1 -Full`
- 資料更新仍先遵循 `docs/data-update.md` 的既有產生順序，再執行驗證。

## 產生物與範圍

- 不手動修改建置輸出、快取、SQLite 資料庫、snapshot 或匯出檔；變更應回到資料、schema、規則或 scripts 的來源。
- 只在架構、資料邊界、驗證入口或未解限制改變時更新 `docs/codex-thread-summary.md`；不要把短期執行紀錄複製進去。
