# 2026.08.09-r21 canonical database 封版紀錄

## 範圍

- 正式資料版本：`2026.08.09-r21`。
- 實際使用：`DATABASE_URL=file:./dev.db`，manifest 的 `sourceDatabase.path` 為 `dev.db`。
- 本次只重建已驗證的 canonical SQLite 與產出物；沒有重新定義 #001～#251 的留傳規則。

## 歷史整理判斷

r20 的本機 dev.db 混有多次 seed/import/recompute 產生的重複評估。這些歷史列並不是現行最新評估，也不是現行保留結論的唯一依據；原始資料、來源、類別狀態與必要的可追溯 change log 則保留。因此這次是刻意的 canonical reset，不是遺失有效 audit history。

| 資料表 | 重建前 | r21 canonical | 處理 |
| --- | ---: | ---: | --- |
| `RetentionEvaluation` | 2,397 | 1,355 | 每個 BattleVariant 保留現行評估，保留必要歷史列 |
| `EvaluationRuleTrace` | 8,984 | 2,160 | 刪除重複評估的軟迹，保留現行與代表性歷史 |
| `EvaluationSource` | 4,844 | 1,978 | 只保留現行/仍有關聯的評估來源 |
| `ChangeLog` | 2,999 | 457 | 清除重複重算差異，保留來源整理、類別處理、批次與跨世代資料、現行跨世代資料與本次 reset 記錄 |
| `DataIssue` | 1,775 | 1,122 | 保留資料缺口追蹤，將重複/舊版列主動關閉 |

本次封版留下資料庫內的 `r21-canonical-reset-20260809` change log，以及本機備份 `backups/dev-before-r21-provenance-20260809.db` 供追查。

## 現行結論驗收

- 最新 1,190 筆 BattleVariant：`91 KEEP / 296 CONDITIONAL_KEEP / 803 TRANSFER_CANDIDATE / 0 HOLD_FOR_NOW`。
- 最新評估：`trueDataPending=[]`。
- open review issues：241 筆，全部 `affectsFinalDecision=false`；safety-affecting open issues：0。
- 開放 issue 數由報表的 174 變為 241 是非安全性 audit 範圍重新整理，不代表留傳結論變動，也沒有新增 HOLD_FOR_NOW。

## Provenance 驗證

`npm run sites:snapshot:check` 會用實際解析的 `DATABASE_URL` 比對 `dev.db` 的 bytes/SHA256，防止產出物指向已刪除的 `fresh-r21h.db`。
