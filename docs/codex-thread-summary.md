# Pokémon GO Retention Guide Codex Context

> 更新日期：2026-08-25。只記錄會影響後續 task 的持久決策；產品細節與完整命令請回到 `README.md`。

## 持久決策

- GitHub Pages／Next.js static export 是預設開發、建置與部署路徑；`dev:local`、`build:local`、`start:local` 僅供本機 Node fallback。退休 runtime 的背景見 `docs/history/legacy-sites-migration.md`。
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
- [`legacy-sites-migration.md`](history/legacy-sites-migration.md)
- [`../README.md`](../README.md)

## 2026-08-06 #001～#151 共用重算

- 四級 PvE 用途與五種逐版本資料處置已集中到 src/rules/battle-assessment.ts；#001～#151 透過
  npm run data:recompute -- --max 151 批次重算，只有 TRUE_DATA_PENDING 才使用 HOLD_FOR_NOW 與「無法判斷，暫時不要傳」。
- PvE 顯示四級投資標籤，並分開呈現團體戰、火箭隊、道館、Mega／Primal、Max Battle、暗影與後續進化；非關鍵欄位顯示「此欄位待補，但不影響普通個體結論」。
- 缺口以 BattleVariant 與類別狀態拆分；site-data/ 與 public/exports/ 必須由 snapshot／export scripts 重新產生。

## 2026-08-06 固定公開網址與首頁 SSR（歷史，已由 Pages static export 取代）

- 公開入口固定為 `/`、`/api/home`、`/data/home.json`；資料版本保留在 meta、`X-Data-Version`、manifest 與內部紀錄，不再附加公開版本 query。
- 首頁由 server build 產生精簡摘要，直接輸出更新日期、PvE 四級分類統計與重要家族連結；完整 `HomeSnapshot` 仍由瀏覽器載入。
- GitHub Pages 不使用 runtime API、Cloudflare purge 或 response headers；部署後以 Pages URL 執行 `pages:smoke:deployed`，瀏覽器資料透過 `DATA_VERSION` query 進行快取失效。
- 本節記錄當時過渡架構；現行入口與快取契約以 `docs/github-pages.md` 為準，不再提供 `/api/home`。

## 2026-08-09 #152-#386 Gen2 and Gen3 integration checkpoint

- DATA_VERSION is 2026.08.09-r23; the controlled pipeline imports #152-#386 and recomputes the full #001-#386 scope from canonical `dev.db`.
- Gen2 members are linked to existing Kanto families where appropriate; formal Johto migrations remove same-species `*-kanto` stubs, while future-generation targets remain explicit evolution stubs.
- Gen3 standard forms use `HOENN` / `豐緣`; the controlled source/review units are `312-341`, `342-371`, and `372-386`, each at most 30 dex numbers. Wurmple branches, Nincada's special-family association, the Ralts/Gallade branch, Azurill's Johto-family merge, and the Probopass stub are represented without fake evolution edges.
- `src/data/canonical/gen3.ts` and `src/data/canonical/gen3-forms.ts` are independent #252-#386 identity fixtures. Batch sources and the database are both checked against the species and form fixtures, including Castform's four weather forms and Deoxys's four Formes, so a batch cannot make a wrong name, type, form key, or variant boundary pass by defining its own expected value.
- Shadow evidence distinguishes direct roster release, derived/inherited evolution closure, and the actual formal evolution edge. Derived descendants are not presented as if the roster source listed them directly.
- Kyogre/Groudon retain the internal `MEGA` variant key for compatibility but use 原始蓋歐卡／原始固拉多 and 原始回歸候選 in user-facing summaries; Rayquaza remains Mega.
- Runtime snapshot, review, Excel, schema validation, review consistency, snapshot provenance checks, and regression tests are generated for this checkpoint; the next expansion point is after #386.

## 2026-08-16 #001～#493 r25 Gen4 expansion and generic ownership

- DATA_VERSION is `2026.08.16-r25`; the controlled clean rebuild now covers #001～#493 and verifies 2344 BattleVariants, 302 presentation families, 13 IV recommendations, and zero current `TRUE_DATA_PENDING` rows.

- The ordered Batch Registry now includes the three Gen4 slices `417-446`, `447-476`, and `477-493`. Generic Gen4 import, review generation, clean rebuild dispatch, published-integrity checks, and persistence verification resolve their scope and paths from the registered definitions rather than adding another routing chain.
- `src/data/batch-gen4.ts` owns the slice definitions and keeps the existing `387-416` evidence semantics behind a small `legacy-387-416` adapter. New slices use the generic adapter; this preserves the reviewed #387～#416 presentation without coupling the persistence importer to a specific dex range.
- The canonical Gen4 source fixtures contain #417～#493 with Sinnoh identity, explicit forms, evolution edges, Max/Mega/special variants, release manifests, PvPoke snapshots, and variant-level PvE evidence. Cross-generation targets through #493 use their owning form identity and are materialized deterministically without parallel `*-other` forms.
- The clean rebuild still asserts that the cross-generation source manifest is unchanged. The generic future-stub-to-owning-form transition preserves target metadata, removes superseded stub identities, and leaves one endpoint-identified evolution path; Roserade remains `407-sinnoh` with `315-hoenn -> 407-sinnoh`.
- Release preparation continues to use the shared current-scope contract and staging/validate/promote snapshot flow. Expected semantic changes are the published #417～#493 expansion, canonical owning-generation form/path completion, and their research evidence; no retention, IV, family-policy, or pending-state regression is intended.

## 2026-08-28 r26 release provenance tightening

- DATA_VERSION is `2026.08.28-r26`; Galarian Slowking is now a fully materialized released form backed by the official 2021 Halloween announcement, bringing the release scope to 2348 BattleVariants and 221 sources.
- Release remediation now preserves official `UNRELEASED`, treats missing evidence as `UNKNOWN`, and no longer infers Dynamax or Gigantamax release from Pokédex ranges or ranking presence. The controlled contract therefore records 30 current `TRUE_DATA_PENDING` evaluations instead of concealing those gaps with fallback assertions.
- Destructive seed/import/recompute/remediation/materialization entrypoints require `ALLOW_DESTRUCTIVE_REBUILD=1` and the repository-owned `file:./rebuild-ci.db` disposable database.

## 2026-09-01 r27 first-batch official release audit

- DATA_VERSION is `2026.09.01-r27`; the #001～#030 official-source pass confirms Dynamax Caterpie directly and Dynamax Metapod／Butterfree through the official evolution rule, and fills official normal-form evidence for Metapod, Kanto Raticate, Fearow, and Arbok.
- Mega Raichu X／Y are now `RELEASED`, backed by the 2026-07-18 debut announcement and a later official live update. The current release contract records 19 `TRUE_DATA_PENDING` evaluations; unresolved Dynamax, Shadow, Purified, PvE, and source-conflict gaps remain review items rather than inferred conclusions.

## 2026-09-01 r29 deterministic release boundary

- DATA_VERSION is `2026.09.01-r29`; the release contract again has zero `TRUE_DATA_PENDING` rows. This is not a Pokédex-range or PvPoke fallback: #001～#030 Shadow, Dynamax, and Gigantamax states are resolved independently against dated, complete historical rosters after explicit user authorization, and those sources remain typed `SECONDARY`.
- Purified availability now strictly follows the same-form Shadow release state plus the official purification mechanic. A released Shadow implies released Purified; an unreleased Shadow implies unreleased Purified. The seed no longer treats PvPoke ranking presence as release evidence, and recomputation no longer forces every Purified row to `RELEASED`.

## 2026-09-02 r30 PvE accuracy and investment thresholds

- Mega Raichu Y is backed by the 2026-09-02 GO Hub live database and the 2026-09-01 Mega PvE tier analysis: Electric S Tier #1 and overall Raid Attacker A+ #32. Its standard Thunder Shock／Wild Charge benchmark is stored separately from the Super Max additional Charged Attack Zap Cannon+, so the normal Raichu F-tier result can no longer leak into the Mega Y family summary.
- Confirmed PvE and Mega candidates now expose advisory resource thresholds: 91%+ is a general investment candidate, while 96%+ with 15 Attack is preferred for long-term, XL, or maximum-level investment. Below 91% remains a conditional exception for urgent use, the only available copy, existing level investment, or verified breakpoints; it is never an automatic transfer line, and high-value Shadow Pokémon retain their wider IV policy.
- The homepage, family overview, and direct Pokémon detail surface define PvE, PvP, IV, CP, GL／UL／ML, individual IV Rank／PR, DPS／TDO, Tier, XL Candy, and Elite TM, with an explicit warning that PvPoke species rank is not an individual IV rank.
- The shared PvE classifier now accepts the canonical `CORE_INVESTMENT`, `USABLE_OR_BUDGET`, `SPECIAL_USE`, and `NO_SIGNIFICANT_USE` evidence values instead of treating them as unknown combat tiers. The full-scope audit corrected 24 affected PvE evidence rows, including nine released variants that had been incorrectly reduced to `TRANSFER_CANDIDATE`.
- Mega raw battle evidence now participates in the same-form PvE classification with source links while preserving true `SOURCE_CONFLICT` rows. Family PvE aggregation includes Mega-only value, and the detail loader retains the selected audit row's full IV recommendations instead of replacing them with the family payload's compact row.

## 2026-08-20 Source-neutral Dashboard read model

- `src/lib/data-read-model.ts` is the Prisma- and snapshot-independent contract for `DashboardRow` and its serialized nested rows. Both `src/lib/data-prisma.ts` and `src/lib/data.ts` return `Promise<DashboardRow[]>` from this shared contract.
- `src/lib/static-data.ts` no longer imports `Prisma*` type aliases. This change is intentionally limited to DashboardRow; detail, source, review, and change-log payload shapes remain adapter-specific for now.
- The existing Prisma-to-snapshot parity test remains the integration guard and compares the logical read model only when the manifest-pinned canonical SQLite database is available. Persistence-only IV recommendation timestamps are projected out at the static JSON adapter boundary and object-key order is canonicalized, while `verifyStaticSnapshot()` and `verifyRelease()` still enforce the manifest-pinned database path, bytes, and SHA-256 whenever a database is supplied.
- The release preparation workflow now retains the validated `rebuild-ci.db` together with `site-data/manifest.json` as a short-lived, downloadable canonical database artifact before deleting the disposable rebuild output. This preserves strict byte-level provenance without committing or deploying the research database.

## 2026-08-25 Workspace organization and provenance repair

- `scripts/` 依責任拆為 `data/`、`review/`、`release/` 與 `pages/`；跨領域驗證入口仍為 `scripts/verify.ps1`。
- 研究 JSON 移至 `research_notes/sources/`，早期人工筆記移至 `research_notes/history/`；目前 release review 保留於 `review/` 根目錄，舊 checkpoint 歸檔於 `review/history/`。
- 現行文件留在 `docs/`，退休 runtime、canonical reset 紀錄與舊截圖移至 `docs/history/`。
- Source／docs 預設使用 CRLF；byte-addressed `site-data/` 與 `public/data/` 產物維持 LF，XLSX／PNG 視為 binary。
- 根目錄 `dev.db` 仍是本機研究 canonical；release snapshot 的 byte-level provenance 指向 clean-release `rebuild-ci.db`，兩者不得互相覆蓋。
- `release:snapshot`、`snapshot:check` 與 `release:verify` 從 release contract 明確解析 `rebuild-ci.db`；一般開發仍可讓 `.env` 保持 `dev.db`，不再需要為驗證暫時切換。
