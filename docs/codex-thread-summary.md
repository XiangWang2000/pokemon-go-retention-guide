# Pokémon GO Retention Guide Codex Context

> 更新日期：2026-07-23。只記錄會影響後續 task 的持久決策；產品細節與完整命令請回到 `README.md`。

## 持久決策

- Sites／Vinext 是主要部署 runtime；Next.js 是本機 fallback。使用 Sites 時遵循 `.openai/hosting.json` 與 `docs/sites-migration.md`。
- 部署前資料必須透過 `site-data/` snapshot 固化；Sites runtime 不直接使用本機 Prisma／SQLite。
- D1 與 R2 目前沒有啟用 binding；未經明確架構變更不得假設可用。
- 資料判定必須保留來源、查閱日期、版本與 review 狀態；研究資料不完整時使用 review／hold 狀態，而非推測填值。

## 資料更新邊界

- 資料批次依 `docs/data-update.md` 進行研究、匯入、驗證、審核與 snapshot；每次只處理可人工確認的一小批。
- `HOLD_FOR_NOW`、`NEEDS_REVIEW`、來源衝突或缺資料是有效結果，不能為了完成率而改成保留或傳送結論。
- 快照與 Excel 匯出由 scripts 生成；修正必須回到研究資料、schema 或規則來源。

## 驗證與交接

- 一般程式變更：`scripts/verify.ps1`。
- 資料、schema、Sites 或建置變更：`scripts/verify.ps1 -Full`。
- 交接時只補：完成內容、驗證、未解資料限制、下一步與涉及的來源／資料版本；逐步命令輸出留在 task thread 或產生的 logs。

## 參考

- [`repo-map.md`](repo-map.md)
- [`data-update.md`](data-update.md)
- [`sites-migration.md`](sites-migration.md)
- [`../README.md`](../README.md)

## 2026-08-06 #001～#151 共用重算

- 四級 PvE 用途與五種逐版本資料處置已集中到 src/rules/battle-assessment.ts；#001～#151 透過
  npm run data:recompute:001-151 批次重算，只有 TRUE_DATA_PENDING 才使用 HOLD_FOR_NOW 與「無法判斷，暫時不要傳」。
- PvE 顯示四級投資標籤，並分開呈現團體戰、火箭隊、道館、Mega／Primal、Max Battle、暗影與後續進化；非關鍵欄位顯示「此欄位待補，但不影響普通個體結論」。
- 缺口以 BattleVariant 與類別狀態拆分；site-data/ 與 public/exports/ 必須由 snapshot／export scripts 重新產生。

## 2026-08-06 固定公開網址與首頁 SSR

- 公開入口固定為 `/`、`/api/home`、`/data/home.json`；資料版本保留在 meta、`X-Data-Version`、manifest 與內部紀錄，不再附加公開版本 query。
- 首頁由 server build 產生精簡摘要，直接輸出更新日期、PvE 四級分類統計與重要家族連結；完整 `HomeSnapshot` 仍由瀏覽器載入。
- `worker/index.ts` 與 `scripts/purge-sites-cache.mjs` 形成部署後 CDN purge 流程；正式部署成功後必須執行 `npm run sites:purge` 並驗證三個固定入口回傳同一個資料版本。
