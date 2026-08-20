# 資料更新檢查表

1. 每批最多 30 個圖鑑編號，先登記批次範圍與查閱日期。
2. 官方來源優先確認 PokemonForm 與所有 BattleVariant 的推出狀態。
3. PvPoke 排名必須記錄賽制、CP 上限、檔案版本與 commit；物種排名不可寫成個體 IV Rank。
4. Pokebattler／GO Hub 原始頁必須可開啟並保存標題、網址、版本、查閱日。
5. 沒有精確 rank 時只保存 tier、rating 或原始摘要，不自行換算。
6. 一般、暗影、淨化、Mega、Dynamax、Gigantamax 不可合併。
7. 來源衝突須同時保存、說明方法差異、降低 confidence 並建立 Review Queue。
8. 更新後先明確產生 review 與 static snapshot，再執行完整驗證；驗證不得代替產生步驟或隱性改寫受控產物。
9. 人工確認本批 Markdown／JSON 報告後才可開始下一批。

## 目前批次執行順序

```powershell
npm run db:seed
npm run data:remediate
npm run data:import:batch -- <batch-key>
npm run data:recompute -- --max <max-dex>
npm run data:validate
npm run review:generate
npm run release:snapshot
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify.ps1 -Full
```

`data:import:batch` 接受 Batch Registry 中的一個 `batch-key`；批次順序、範圍與 adapter 以 Registry 為準，不再由 package scripts 維護一串別名。完成所有已登錄批次後，使用 `data:recompute -- --max <max-dex>` 執行目前 scope 的共用重算。#312～#386 仍使用 `312-341`、`342-371`、`372-386` 三個可獨立驗證的來源、batch、form 與 review 單位；第三世代的 `canonicalGen3Species` 與獨立 `canonicalGen3Forms` 分別驗證物種、正式型態、型態名稱、屬性與 BattleVariant 邊界。Castform 天氣型態、Deoxys 四種 Forme、Shadow evolution closure、Primal 與 Mega 顯示名稱都不可由 batch 自己同時產生 expected 值繞過檢查。沒有完成重算、review、snapshot 與完整驗證前，不得把新 snapshot 視為最終驗收結果。

## Current release clean rebuild

完整重建由 `scripts/verify-research-rebuild.ts` 建立新的 `rebuild-ci` SQLite 檔案，依 Batch Registry
的 seed、pre-recompute 與 post-recompute phase 執行匯入、重算、IV backfill 與資料驗證，再由共用
release contract 驗證目前 scope、review 與 snapshot。Gen3／Gen4 的證據差異仍由各自 importer adapter
處理，不在 release verifier 內重複路由。
`research_notes/cross-generation-evolution-targets.json` 必須在重建前後保持不變；不能以暫時改寫來源檔
來通過舊版相容邏輯。跨批次進化邊界由尚未存在 endpoint 時延後，並由擁有該 endpoint 的批次匯入，
不得新增批次或 Pokémon 專用的 rebuild stub。

```powershell
$env:ALLOW_DESTRUCTIVE_REBUILD = "1"
$env:DATABASE_URL = "file:./rebuild-ci.db"
npx tsx scripts/verify-research-rebuild.ts
$env:DATABASE_URL = "file:./rebuild-ci.db"
npm run data:verify:published-integrity
npm run review:generate
npx tsx scripts/generate-current-recalibration-report.ts
npm run release:snapshot
npm run release:verify
```

`release:snapshot` 先把完整輸出寫入 repository 內的暫存目錄，再以 `release:verify` 驗證 manifest、來源
資料庫、review 與目前 scope，最後才 promote 到 `site-data/`、`public/data/`、`public/exports/` 與
正式 static artifact。驗證失敗時不會留下半成品正式 artifact。

`Prepare Release Snapshot` workflow 會在 Pages 建置驗證後，將同一次驗證使用的 `rebuild-ci.db` 與
`site-data/manifest.json` 保留為 `canonical-release-database-<run-id>` artifact（90 天）。需要在本機
重現 strict provenance check 時，可從該次 workflow 下載 artifact 到 repository root，再執行：

```powershell
gh run download <run-id> --name canonical-release-database-<run-id> --dir .
$env:DATABASE_URL = "file:./rebuild-ci.db"
npm run snapshot:check
```

Artifact 只供 provenance 重現使用，不會部署到 GitHub Pages，也不取代 manifest 的 bytes 與 SHA-256 驗證。

驗收除了批次範圍與資料版本，還要確認 2344 個 BattleVariants、302 個展示家族、13 個 IV
recommendations、`407-sinnoh`、唯一的 `315-hoenn -> 407-sinnoh`，以及不存在 `407-other`。

## 共用重算規則

- PvE 用途固定分為 `CORE_INVESTMENT`（核心投資）、`USABLE_OR_BUDGET`（可用／預算型）、`SPECIAL_USE`（特殊用途）、`NO_SIGNIFICANT_USE`（無顯著用途）。
- 每個 `BattleVariant` 另存 `AssessmentDisposition`：已有明確用途、用途有限、無顯著用途、不適用／尚未推出、真正待補資料。
- 只有 `TRUE_DATA_PENDING` 才能使用 `HOLD_FOR_NOW`，並顯示「無法判斷，暫時不要傳」；未推出版本、用途有限與次要欄位缺來源不可沿用這個提示。
