# Pokémon GO Retention Guide Codex Context

> 更新日期：2026-08-09。只記錄會影響後續 task 的持久決策；產品細節與完整命令請回到 `README.md`。

## 持久決策

- Sites／Vinext 是預設開發、建置與部署 runtime；Next.js 是本機 fallback。使用 Sites 時遵循 `.openai/hosting.json` 與 `docs/sites-migration.md`。
- 部署前資料必須透過 `site-data/` snapshot 固化；Sites runtime 不直接使用本機 Prisma／SQLite。
- D1 與 R2 目前沒有啟用 binding；未經明確架構變更不得假設可用。
- 資料判定必須保留來源、查閱日期、版本與 review 狀態；研究資料不完整時使用 review／hold 狀態，而非推測填值。

## 資料更新邊界

- 資料批次依 `docs/data-update.md` 進行研究、匯入、驗證、審核與 snapshot；每次只處理可人工確認的一小批。
- `HOLD_FOR_NOW`、`NEEDS_REVIEW`、來源衝突或缺資料是有效結果，不能為了完成率而改成保留或傳送結論。
- `site-data/`、`public/data/`、`public/exports/` 與 `public/_headers` 由 scripts 生成；修正必須回到研究資料、schema 或規則來源。

## 驗證與交接

- `scripts/verify.ps1` 與 `-Full` 都是非變異驗證；資料更新須先依 `docs/data-update.md` 明確產生 review 與 snapshot。
- 一般程式變更使用預設驗證；資料、schema、Sites 或建置變更使用 `scripts/verify.ps1 -Full`，可見 UI 流程另做 browser smoke test。
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
- `worker/index.ts` 與 `scripts/purge-sites-cache.mjs` 形成部署後 CDN purge hook；正式部署成功後必須執行 `npm run sites:purge`，`/` 與 `/api/home` 驗證 `X-Data-Version`，`/data/home.json` 驗證公開檔案雜湊。Sites runtime 若拒絕 Cache API，hook 會退回 no-store 與 canonical revalidation，不得讓請求失敗。

## 2026-08-09 #152-#386 Gen2 and Gen3 integration checkpoint

- DATA_VERSION is 2026.08.09-r23; the controlled pipeline imports #152-#386 and recomputes the full #001-#386 scope from canonical `dev.db`.
- Gen2 members are linked to existing Kanto families where appropriate; formal Johto migrations remove same-species `*-kanto` stubs, while future-generation targets remain explicit evolution stubs.
- Gen3 standard forms use `HOENN` / `豐緣`; the controlled source/review units are `312-341`, `342-371`, and `372-386`, each at most 30 dex numbers. Wurmple branches, Nincada's special-family association, the Ralts/Gallade branch, Azurill's Johto-family merge, and the Probopass stub are represented without fake evolution edges.
- `src/data/canonical/gen3.ts` and `src/data/canonical/gen3-forms.ts` are independent #252-#386 identity fixtures. Batch sources and the database are both checked against the species and form fixtures, including Castform's four weather forms and Deoxys's four Formes, so a batch cannot make a wrong name, type, form key, or variant boundary pass by defining its own expected value.
- Shadow evidence distinguishes direct roster release, derived/inherited evolution closure, and the actual formal evolution edge. Derived descendants are not presented as if the roster source listed them directly.
- Kyogre/Groudon retain the internal `MEGA` variant key for compatibility but use 原始蓋歐卡／原始固拉多 and 原始回歸候選 in user-facing summaries; Rayquaza remains Mega.
- Runtime snapshot, review, Excel, schema validation, review consistency, snapshot provenance checks, and regression tests are generated for this checkpoint; the next expansion point is after #386.

## 2026-08-15 #001～#416 r24 cross-generation canonicalization

- DATA_VERSION is `2026.08.13-r24`; the controlled clean rebuild now covers #001～#416 and verifies 1912 BattleVariants, 245 presentation families, 13 IV recommendations, and zero current `TRUE_DATA_PENDING` rows.
- `src/data/region-key.ts` is the single TypeScript RegionKey contract and is checked against the Prisma enum. It includes `SINNOH`, `UNOVA`, and `KALOS`; batch, canonical, import-schema, validation, and cross-generation code reuse it instead of maintaining stale unions.
- Cross-generation source data natively identifies Roserade as `407-sinnoh` / `SINNOH`, with the canonical `315-hoenn -> 407-sinnoh` path. `src/data/evolution-path.ts` treats an endpoint pair as the path identity, so an owning-generation importer updates an existing future stub/path instead of creating a duplicate.
- Gen3 import defers only evolution edges whose endpoints are not yet materialized; the owning batch creates the real form and edge. This removes the rebuild-only boundary stubs for #342/#372 and the Roserade-specific source mutation, form migration, and edge handoff helpers. The clean rebuild asserts the source manifest is byte-for-byte unchanged.
- `src/config/batch-registry.ts` is now the ordered source of truth for all published batches through #416, including import phase/adapter metadata and review generator/output paths. `scripts/import-batch.ts`, clean rebuild, review generation, and review consistency validation all resolve through it; legacy, Gen3, and Gen4 implementations remain as adapters where their evidence semantics differ.
- The published snapshot and Pages artifact are generated from the clean #001～#416 rebuild; timestamp/provenance/hash churn is expected from the fresh database, while semantic changes are limited to the canonical Roserade identity/path presentation and the r24 review/remediation outputs.
