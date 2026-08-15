# Pokémon GO Retention Guide Instructions

此專案繼承 `C:\Users\User\.codex\AGENTS.md`；不要重複全域的工具、推理強度或子代理規則。

## 閱讀順序

1. `AGENTS.md`
2. `docs/repo-map.md`
3. `docs/codex-thread-summary.md`
4. 相關的 `docs/data-update.md`、`docs/github-pages.md`、`docs/legacy-sites-migration.md` 與目標程式碼

## Subagent Orchestration Policy（專案覆寫）

本專案的非瑣碎任務由主代理負責拆解與協調；當委派能明顯改善正確性、專業性、平行效率或 context isolation 時，可直接啟用子代理，不必再次取得授權。本節覆寫全域「僅在明確授權後 spawn」的限制。

- 優先委派範圍明確、彼此獨立、偏讀取的探索、分析、除錯、測試分析、code review、安全檢查與驗證工作。
- 不為簡單或高度循序的工作啟用子代理，並避免多個代理同時修改重疊檔案。
- 依工作性質選擇內建或自訂代理；描述相符時優先使用 specialized custom agent，範圍明確的執行工作優先使用 `luna_worker`。
- 主代理負責架構決策、任務分配、整合修改、處理衝突、驗證子代理結論及最終正確性。
- 複雜或高風險變更完成前，至少安排一次獨立 review 或 verification。
- 最終回覆前必須等待相關子代理、處理重大發現，並執行適用的測試、lint、type check、建置與其他驗證。

## Runtime 與資料邊界

- GitHub Pages／Next.js static export 是預設開發、建置與部署路徑；`dev:local`、`build:local`、`start:local` 僅供本機 Node fallback。
- `research_notes/`、`data/sources/` 與 `prisma/` 分別保存研究證據、來源快照與資料模型；正式研究資料庫為根目錄 `dev.db`，不得以空的 `prisma/dev.db` 覆蓋。
- 每批資料更新必須遵守 `docs/data-update.md` 的來源、人工審核與變更紀錄規則；人工核准前不得把下一批列為已完成。
- `site-data/`、`public/data/`、`public/exports/` 等交付產物必須透過既有 scripts 產生；需要新 snapshot 時明確執行 `npm run release:snapshot`，驗證不得隱性改寫它們。

## 驗證

- 純文件變更：檢查 Markdown 連結、命令與本檔閱讀順序。
- 一般規則、元件或程式變更：`powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify.ps1`。
- 可見 UI 行為變更：執行一般驗證，並以 in-app Browser 完成相關流程的 smoke test。
- Pages runtime、routing 或建置變更：執行 `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify.ps1 -Full`，並對受影響流程執行 browser smoke test。
- 資料、來源、Prisma 或 snapshot 變更：先依 `docs/data-update.md` 明確產生 review 與 snapshot，再執行完整驗證；驗證本身不得改寫受控產物。

## 產生物與範圍

- 不手動修改建置輸出、快取、SQLite 資料庫或受控交付產物；變更應回到資料、schema、規則或 scripts 的來源。
- 只在架構、資料邊界、驗證入口或未解限制改變時更新 `docs/codex-thread-summary.md`；不要把短期執行紀錄複製進去。
