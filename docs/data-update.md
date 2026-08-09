# 資料更新檢查表

1. 每批最多 30 個圖鑑編號，先登記批次範圍與查閱日期。
2. 官方來源優先確認 PokemonForm 與所有 BattleVariant 的推出狀態。
3. PvPoke 排名必須記錄賽制、CP 上限、檔案版本與 commit；物種排名不可寫成個體 IV Rank。
4. Pokebattler／GO Hub 原始頁必須可開啟並保存標題、網址、版本、查閱日。
5. 沒有精確 rank 時只保存 tier、rating 或原始摘要，不自行換算。
6. 一般、暗影、淨化、Mega、Dynamax、Gigantamax 不可合併。
7. 來源衝突須同時保存、說明方法差異、降低 confidence 並建立 Review Queue。
8. 更新後先明確產生 review 與 Sites snapshot，再執行完整驗證；驗證不得代替產生步驟或隱性改寫受控產物。
9. 人工確認本批 Markdown／JSON 報告後才可開始下一批。

## 目前批次執行順序

```powershell
npm run db:seed
npm run data:remediate
npm run data:import:031-060
npm run data:import:061-090
npm run data:import:091-120
npm run data:import:121-151
npm run data:import:152-181
npm run data:import:182-211
npm run data:import:212-241
npm run data:import:242-251
npm run data:import:252-281
npm run data:import:282-311
npm run data:import:312-341
npm run data:import:342-371
npm run data:import:372-386
npm run data:recompute:001-386
npm run data:validate
npm run review:generate
npm run sites:snapshot
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify.ps1 -Full
```

`data:import:*` 依每批最多 30 個圖鑑編號切開；#312～#386 使用 `312-341`、`342-371`、`372-386` 三個可獨立驗證的來源、batch、form 與 review 單位，再連續執行 `data:recompute:001-386`、資料驗證與 Sites snapshot。第三世代的 `canonicalGen3Species` 與獨立 `canonicalGen3Forms` 分別驗證物種、正式型態、型態名稱、屬性與 BattleVariant 邊界；Castform 天氣型態、Deoxys 四種 Forme、Shadow evolution closure、Primal 與 Mega 顯示名稱都不可由 batch 自己同時產生 expected 值繞過檢查。沒有完成重算、review、snapshot 與完整驗證前，不得把新 snapshot 視為最終驗收結果。

## 共用重算規則

- PvE 用途固定分為 `CORE_INVESTMENT`（核心投資）、`USABLE_OR_BUDGET`（可用／預算型）、`SPECIAL_USE`（特殊用途）、`NO_SIGNIFICANT_USE`（無顯著用途）。
- 每個 `BattleVariant` 另存 `AssessmentDisposition`：已有明確用途、用途有限、無顯著用途、不適用／尚未推出、真正待補資料。
- 只有 `TRUE_DATA_PENDING` 才能使用 `HOLD_FOR_NOW`，並顯示「無法判斷，暫時不要傳」；未推出版本、用途有限與次要欄位缺來源不可沿用這個提示。
