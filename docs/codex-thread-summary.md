# Pokémon GO Retention Guide Codex Context

> 更新日期：2026-08-09。只記錄會影響後續 task 的持久決策；產品細節與完整命令請回到 `README.md`。

## 持久決策

- GitHub Pages／Next.js static export 是預設開發、建置與部署路徑；`dev:local`、`build:local`、`start:local` 僅供本機 Node fallback。退休 runtime 的背景見 `docs/legacy-sites-migration.md`。
- 部署前資料必須透過 `site-data/` snapshot 固化；GitHub Pages 不直接使用本機 Prisma／SQLite。
- D1 與 R2 目前沒有啟用 binding；未經明確架構變更不得假設可用。
- 資料判定必須保留來源、查閱日期、版本與 review 狀態；研究資料不完整時使用 review／hold 狀態，而非推測填值。

## 資料更新邊界

- 資料批次依 `docs/data-update.md` 進行研究、匯入、驗證、審核與 snapshot；每次只處理可人工確認的一小批。
- `HOLD_FOR_NOW`、`NEEDS_REVIEW`、來源衝突或缺資料是有效結果，不能為了完成率而改成保留或傳送結論。
- `site-data/`、`public/data/` 與 `public/exports/` 由 scripts 生成；修正必須回到研究資料、schema 或規則來源。

## 驗證與交接

- `scripts/verify.ps1` 與 `-Full` 都是非變異驗證；資料更新須先依 `docs/data-update.md` 明確產生 review 與 snapshot。
- 一般程式變更使用預設驗證；資料、schema、Pages 或建置變更使用 `scripts/verify.ps1 -Full`，可見 UI 流程另做 browser smoke test。
- 交接時只補：完成內容、驗證、未解資料限制、下一步與涉及的來源／資料版本；逐步命令輸出留在 task thread 或產生的 logs。

## 參考

- [`repo-map.md`](repo-map.md)
- [`data-update.md`](data-update.md)
- [`legacy-sites-migration.md`](legacy-sites-migration.md)
- [`../README.md`](../README.md)

## 2026-08-06 #001～#151 共用重算

- 四級 PvE 用途與五種逐版本資料處置已集中到 src/rules/battle-assessment.ts；#001～#151 透過
  npm run data:recompute:001-151 批次重算，只有 TRUE_DATA_PENDING 才使用 HOLD_FOR_NOW 與「無法判斷，暫時不要傳」。
- PvE 顯示四級投資標籤，並分開呈現團體戰、火箭隊、道館、Mega／Primal、Max Battle、暗影與後續進化；非關鍵欄位顯示「此欄位待補，但不影響普通個體結論」。
- 缺口以 BattleVariant 與類別狀態拆分；site-data/ 與 public/exports/ 必須由 snapshot／export scripts 重新產生。

## 2026-08-06 固定公開網址與首頁 SSR

- 公開入口固定為 `/`、`/api/home`、`/data/home.json`；資料版本保留在 meta、`X-Data-Version`、manifest 與內部紀錄，不再附加公開版本 query。
- 首頁由 server build 產生精簡摘要，直接輸出更新日期、PvE 四級分類統計與重要家族連結；完整 `HomeSnapshot` 仍由瀏覽器載入。
- GitHub Pages 不使用 runtime API、Cloudflare purge 或 response headers；部署後以 Pages URL 執行 `pages:smoke:deployed`，瀏覽器資料透過 `DATA_VERSION` query 進行快取失效。

## 2026-08-09 #152-#386 Gen2 and Gen3 integration checkpoint

- DATA_VERSION is 2026.08.09-r23; the controlled pipeline imports #152-#386 and recomputes the full #001-#386 scope from canonical `dev.db`.
- Gen2 members are linked to existing Kanto families where appropriate; formal Johto migrations remove same-species `*-kanto` stubs, while future-generation targets remain explicit evolution stubs.
- Gen3 standard forms use `HOENN` / `豐緣`; the controlled source/review units are `312-341`, `342-371`, and `372-386`, each at most 30 dex numbers. Wurmple branches, Nincada's special-family association, the Ralts/Gallade branch, Azurill's Johto-family merge, and the Probopass stub are represented without fake evolution edges.
- `src/data/canonical/gen3.ts` and `src/data/canonical/gen3-forms.ts` are independent #252-#386 identity fixtures. Batch sources and the database are both checked against the species and form fixtures, including Castform's four weather forms and Deoxys's four Formes, so a batch cannot make a wrong name, type, form key, or variant boundary pass by defining its own expected value.
- Shadow evidence distinguishes direct roster release, derived/inherited evolution closure, and the actual formal evolution edge. Derived descendants are not presented as if the roster source listed them directly.
- Kyogre/Groudon retain the internal `MEGA` variant key for compatibility but use 原始蓋歐卡／原始固拉多 and 原始回歸候選 in user-facing summaries; Rayquaza remains Mega.
- Runtime snapshot, review, Excel, schema validation, review consistency, snapshot provenance checks, and regression tests are generated for this checkpoint; the next expansion point is after #386.

## 2026-08-16 #001～#493 r25 Gen4 expansion and generic ownership

- DATA_VERSION is `2026.08.16-r25`; the controlled clean rebuild now covers #001～#493 and verifies 2344 BattleVariants, 318 presentation families, 13 IV recommendations, and zero current `TRUE_DATA_PENDING` rows.
- The ordered Batch Registry now includes the three Gen4 slices `417-446`, `447-476`, and `477-493`. Generic Gen4 import, review generation, clean rebuild dispatch, published-integrity checks, and persistence verification resolve their scope and paths from the registered definitions rather than adding another routing chain.
- `src/data/batch-gen4.ts` owns the slice definitions and keeps the existing `387-416` evidence semantics behind a small `legacy-387-416` adapter. New slices use the generic adapter; this preserves the reviewed #387～#416 presentation without coupling the persistence importer to a specific dex range.
- The canonical Gen4 source fixtures contain #417～#493 with Sinnoh identity, explicit forms, evolution edges, Max/Mega/special variants, release manifests, PvPoke snapshots, and variant-level PvE evidence. Cross-generation targets through #493 use their owning form identity and are materialized deterministically without parallel `*-other` forms.
- The clean rebuild still asserts that the cross-generation source manifest is unchanged. The generic future-stub-to-owning-form transition preserves target metadata, removes superseded stub identities, and leaves one endpoint-identified evolution path; Roserade remains `407-sinnoh` with `315-hoenn -> 407-sinnoh`.
- Release preparation continues to use the shared current-scope contract and staging/validate/promote snapshot flow. Expected semantic changes are the published #417～#493 expansion, canonical owning-generation form/path completion, and their research evidence; no retention, IV, family-policy, or pending-state regression is intended.
