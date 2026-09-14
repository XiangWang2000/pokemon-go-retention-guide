# Pokémon GO Retention Guide

Pokémon GO 通用寶可夢保留價值指南。系統以 `PokemonForm × BattleVariant` 為最小評估單位，將來源資料、規則推導、審核狀態與最終保留建議分開保存，協助回鍋玩家判斷一般個體在 PvP、PvE、火箭隊、道館、Mega／Primal、Max Battle 與後續進化上的保留價值。

本專案不讀取個人背包、不操作 Pokémon GO，也不把異色、特殊造型、活動背卡、紀念或個人收藏價值自動納入傳送建議。

## 正式網站

正式 production 僅使用 GitHub Pages：

`https://xiangwang2000.github.io/pokemon-go-retention-guide/`

GitHub Pages 採 Next.js static export，production 不依賴 runtime Prisma／SQLite、Next.js API route 或舊 Sites／Vinext worker。完整部署與驗證流程請見 [`docs/github-pages.md`](docs/github-pages.md)。

退休 Sites／Vinext／Cloudflare Worker 僅保留在歷史 review 與遷移紀錄中；目前正式路徑只使用 GitHub Pages。歷史說明請見 [`docs/history/legacy-sites-migration.md`](docs/history/legacy-sites-migration.md)。

## 公開資料的 source of truth

不要在文件中另外維護一份容易過期的圖鑑範圍或版本號；目前正式資料請直接以以下檔案為準：

- `src/config/data-scope.ts`：目前公開圖鑑上限與資料範圍。
- `docs/data-coverage.md`：正式 runtime 覆蓋範圍與 Gen5～Gen9 research audit 的差異、總驗收條件。
- `src/config/release.ts`：目前資料版本與更新日期。
- `src/config/batch-registry.ts`：已發布批次的順序、匯入 phase／adapter 與 review 輸出。
- `src/config/release-contract.ts`：目前 release 的共用驗證契約與 generated-path allowlist。
- `scripts/data/verify-published-integrity.ts`：保留歷史批次、Gen4 canonical form 與跨世代 family 的完整性檢查。
- `site-data/manifest.json`：snapshot 來源、筆數、SHA-256、runtime JSON 與 Excel artifact 資訊。

首頁顯示的資料範圍與更新日期由上述設定產生，新增下一批寶可夢時不需要再手動修改 README 的批次數字。

## 目前正式資料範圍

目前正式 static snapshot 已將 National Dex **#001～#649（第一至第五世代）** 納入完整的 `PokemonForm × BattleVariant` runtime 模型；第五世代合眾資料以 `#494–#523`、`#524–#553`、`#554–#583`、`#584–#613`、`#614–#643` 與 `#644–#649` 六個 Registry 批次管理。每個型態仍分開保存推出狀態、PvP／PvE／Max 證據、進化關係、來源、審核問題與保留判定。

第六至第九世代（#650～#1025）目前仍是研究審核資料，尚未進入正式 runtime、release snapshot 或 Excel 交付物。正式範圍、目前版本與產出筆數請以 `src/config/` 與 [`site-data/manifest.json`](site-data/manifest.json) 為準；兩者的差異與下一階段驗收條件記錄在 [`docs/data-coverage.md`](docs/data-coverage.md)。

## 使用介面

首頁提供三種模式：

- **家族總覽**：先看整個進化家族的清包策略，再展開成員、型態與完整判斷。
- **單隻圖鑑**：依圖鑑型態逐隻查看精簡保留結論。
- **資料審核**：檢查各 BattleVariant 的資料狀態、來源與判斷軌跡。

另外提供 `/review/` 待補清單、`/sources/` 資料來源與 `/changes/` 變更紀錄頁。瀏覽器先載入精簡首頁／audit summary，家族與 BattleVariant 的詳細資料再按需要載入 `public/data/families/`、`public/data/audit/` 與 `public/data/details/`，避免首頁一次傳送完整研究資料。

## 保留決策模型

BattleVariant 的最終使用者建議只使用四種狀態：

- `KEEP`
- `CONDITIONAL_KEEP`
- `HOLD_FOR_NOW`
- `TRANSFER_CANDIDATE`

資料完整性與使用者建議分開管理；來源不足或有 review issue 不代表一定要 `HOLD_FOR_NOW`。只有可能實際改變不可逆傳送決策的關鍵不確定性，才應阻止傳送。

家族層另外使用 presentation-only 清包策略：

- `KEEP_TARGETS`
- `SELECTIVE_KEEP`
- `MOSTLY_TRANSFER`
- `HOLD_FOR_NOW`

家族分組依 `familyKey` 與實際 `EvolutionPath` connected components 建立，不以圖鑑編號連續性猜測進化關係；不同地區型態若沒有相連進化路徑可形成獨立子群組。

## IV 判斷原則

IV 規則的程式 source of truth 是 [`src/iv/strategy.ts`](src/iv/strategy.ts)。核心原則如下：

- **PvE**：先判斷物種／型態本身是否值得投資，再看招式、等級／CP、既有投入、攻擊與耐久斷點，最後才用 IV 比較同種候選。一般資源分配線為 **91%以上可投入，96%以上且15攻優先長期／XL投資**。15 攻是同種候選的優先條件，不是硬性淘汰門檻；14 攻的高整體 IV 個體仍可保留。低於91%仍可因急用、唯一候選、既有投入或實測斷點例外，不是自動傳送線。
- **暗影 PvE**：標準應明顯寬於普通個體，不設硬性最低 IV。高價值暗影、只有一隻或取得稀有的個體，不應只因攻擊或總 IV 偏低就傳送或淨化；淨化不可逆。
- **Mega／Primal**：仍以物種、招式、等級與實際用途優先；沿用 PvE 的91%／96%兩段資源分配線，通常只需保留少量投資候選。
- **Great／Ultra League**：只有物種與型態本身有對應聯盟用途時，才使用個體 PvP IV Rank／Stat Product PR 篩選；目前通用優先條件為 `Rank≤100` 或 `PR≥97.5%`。
- **Master League**：15 攻與高整體 IV 通常較重要，仍需考慮物種特定 CMP、攻防斷點與實際聯盟用途。
- **道館防守**：不設固定 IV 門檻；物種、等級、CP、防禦、HP 與既有投入優先。
- **Max Battle**：依攻擊、坦克、支援或彈性角色分開判斷，不用單一總 IV 門檻套用所有角色。

低戰鬥價值物種不會因為 100% IV 自動變成 `KEEP`；任何 IV 門檻都必須先確認對應用途確實成立。

## 資料與部署架構

```text
研究證據（research_notes/sources + data/sources）
  → Prisma schema + SQLite（dev.db 研究庫；rebuild-ci.db 可拋棄 release 庫）
  → Registry 匯入／共用重算／審核／資料驗證
  → npm run release:snapshot（staging → validate → promote）
  → site-data JSON + public/data JSON + 預建 XLSX
  → Next.js static export（out/）
  → GitHub Pages
```

`release:snapshot` 會產生 GitHub Pages 正式使用的 static snapshot。正式站只讀靜態檔案，不需要將研究資料庫部署到 production。根目錄 `dev.db` 是本機研究資料庫；正式 release 的 clean rebuild 使用可拋棄的 `rebuild-ci.db`，不可用 seed／reset 或驗證流程覆寫 `dev.db`，也不要手動修改 `site-data/`、`public/data/`、`public/exports/` 或 `out/`。

## 開發與 Pages 驗證

需要 Node.js 版本請以 `package.json` 的 `engines` 為準。

```powershell
npm install
npm run db:generate
npm run dev
```

`npm run dev` 是 GitHub Pages／Next.js 路徑的預設開發入口；`dev:local`、`build:local`、`start:local` 只在需要本機 Node runtime fallback 時使用。`dev.db` 仍是本機研究資料庫；`snapshot:check` 與 `release:verify` 依 release contract 對可取得的 `rebuild-ci.db` 做來源資料庫與 snapshot 驗證，所以不需要為了啟動開發或建置而改寫 `.env`。

一般程式或規則變更可執行共用驗證入口：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify.ps1
```

資料、Pages runtime 或建置變更使用 `-Full`；它會另外執行整合、資料、release 與 static build 驗證，並需要相符的 disposable `rebuild-ci.db`。

完整 production build／驗證：

```powershell
npm run build
npm run pages:verify
npm start
```

`npm run pages:verify` 會檢查 static artifact、canonical URL、sitemap／robots、runtime JSON、Excel、所有 Pokémon detail route 與本機 HTTP smoke。Pull Request 另外由 `.github/workflows/verify-pages-pr.yml` 執行 snapshot、lint、typecheck、tests、完整 static export 與 Pages 驗證；合併至 `main` 後再由 `.github/workflows/deploy-pages.yml` 正式部署並執行 post-deploy smoke。

## 更新資料

每批最多 30 個圖鑑編號，批次順序、範圍、匯入 adapter 與 review 輸出以 `src/config/batch-registry.ts` 為準；`npm run data:import:batch -- <batch-key>` 只適合定向匯入驗證，不能單獨產生正式 snapshot。完整來源、人工審核與 release checklist 請見 [`docs/data-update.md`](docs/data-update.md)。

需要產生新的正式 snapshot 時，先使用可拋棄資料庫完成 clean rebuild，不要對根目錄 `dev.db` 重跑 seed／reset：

```powershell
$env:ALLOW_DESTRUCTIVE_REBUILD = "1"
$env:DATABASE_URL = "file:./rebuild-ci.db"
npx tsx scripts/data/verify-research-rebuild.ts
npm run data:verify:published-integrity
npm run review:generate
npx tsx scripts/review/generate-current-recalibration-report.ts
npm run release:snapshot
npm run release:verify
npm run build
npm run pages:verify
```

若資料庫 schema、來源匯入或規則有變更，先執行對應 migration／import／recompute，再重新產生 snapshot。`release:snapshot` 使用 staging → validate → promote 流程；`release:verify` 是 PR、Pages deploy 與手動 release preparation 共用的驗證入口。`site-data/manifest.json` 會記錄正式輸出的資料版本、筆數與檔案雜湊供 CI 驗證。

## 歷史遷移紀錄

舊 Sites／Vinext／Cloudflare Worker 的實作已從現行 runtime 與 npm workflow 移除；
可重現性與決策背景保留在 [`docs/history/legacy-sites-migration.md`](docs/history/legacy-sites-migration.md)
及 `review/history/001-030-sites-migration.*`，不應作為目前部署或驗證入口。

## 重要目錄

- `src/app/`、`src/components/`、`src/lib/`：網站路由、介面元件與 static data loader。
- `src/config/`、`src/rules/`、`src/iv/`、`src/presentation/`：資料範圍／release contract、保留規則、IV 策略與家族 presentation。
- `src/data/`、`data/sources/`：資料模型周邊、canonical fixtures 與外部來源快照。
- `prisma/`：研究資料模型與 migrations。
- `scripts/data/`、`scripts/review/`、`scripts/release/`、`scripts/pages/`：依責任分類的資料、審核、發布與 Pages 工具；`scripts/verify.ps1` 是共用驗證入口。
- `site-data/`：release snapshot 與 manifest。
- `public/data/`：GitHub Pages 瀏覽器實際讀取的 runtime JSON。
- `public/exports/`：由 snapshot 流程產生的 Excel 交付物；`out/` 是 Pages build output。
- `review/`：目前 release 的逐批審核報告；`review/history/` 保存歷史 checkpoint 與遷移紀錄。
- `research_notes/sources/`：可追溯的研究來源 JSON；`research_notes/history/` 保存早期人工筆記。
- `docs/`：現行部署與維護說明；`docs/history/` 保存退休架構與歷史截圖。
- `.github/workflows/`：PR 驗證、release snapshot 與 Pages deploy automation。
- `tests/`：規則、資料一致性、Pages 與 regression tests。

## 非目標

本專案目前不提供：

- Pokémon GO 帳號登入或背包同步。
- 自動傳送、點擊、ADB／OCR 操作遊戲。
- 使用者個體 IV 上傳後的即時計算服務。
- 需要 production 資料庫寫入的功能。
- 付費 API 才能運作的核心流程。

目標是維持一份可追溯、可審核、可靜態發布的通用保留指南，讓清包決策與資料證據彼此分離。
