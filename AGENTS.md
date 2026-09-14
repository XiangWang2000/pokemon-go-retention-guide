# Pokémon GO Retention Guide Instructions

## 按需閱讀

- 初次接手、跨模組或不熟悉的流程：讀 [repo-map](docs/repo-map.md)，再查看相關程式碼。
- 接續先前任務或需要交接背景：讀 [thread summary](docs/codex-thread-summary.md)；一般小修不必先讀。
- 資料、來源或 snapshot 更新：先讀 [data update](docs/data-update.md)。
- GitHub Pages 建置、路由或部署：讀 [GitHub Pages](docs/github-pages.md)。
- 涉及舊 Sites 遷移歷史或相容性：才讀 [legacy migration](docs/history/legacy-sites-migration.md)。

## Runtime 與資料邊界

- GitHub Pages／Next.js static export 是預設開發、建置與部署路徑；`dev:local`、`build:local`、`start:local` 僅供本機 Node fallback。
- `research_notes/sources/`、`data/sources/` 與 `prisma/` 分別保存研究證據、來源快照與資料模型；`research_notes/history/` 只保存早期人工筆記；正式研究資料庫為根目錄 `dev.db`，不得以空的 `prisma/dev.db` 覆蓋。
- 每批資料更新必須遵守 `docs/data-update.md` 的來源、人工審核與變更紀錄規則；人工核准前不得把下一批列為已完成。
- `site-data/`、`public/data/`、`public/exports/` 等交付產物必須透過既有 scripts 產生；需要新 snapshot 時明確執行 `npm run release:snapshot`，驗證不得隱性改寫它們。

## 驗證

- 純文件或指引變更：檢查受影響的 Markdown 連結、命令與規則一致性；不因此執行應用程式建置或資料產生流程。
- 一般規則、元件或程式變更：`powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify.ps1`。
- 可見 UI 行為變更：執行一般驗證，並以 in-app Browser 完成相關流程的 smoke test。
- Pages runtime、routing 或建置變更：執行 `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify.ps1 -Full`，並對受影響流程執行 browser smoke test。
- 資料、來源、Prisma 或 snapshot 變更：先依 `docs/data-update.md` 明確產生 review 與 snapshot，再執行完整驗證；驗證本身不得改寫受控產物。

## 產生物與範圍

- 不手動修改建置輸出、快取、SQLite 資料庫或受控交付產物；變更應回到資料、schema、規則或 scripts 的來源。
- 只在架構、資料邊界、驗證入口或未解限制改變時更新 `docs/codex-thread-summary.md`；不要把短期執行紀錄複製進去。
