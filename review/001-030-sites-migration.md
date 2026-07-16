# #001～#030 Sites 遷移審核報告

- 遷移日期：2026-07-16
- 遷移前基準 commit：`843c74b6b02326d8ec9a72e842aa23e22caae528`
- 遷移前 SQLite SHA-256：`97A4AE6BC3FB420387852B3A7CBE15492654F622DF4813F7DF51AEF8A6F4524F`
- Sites 邏輯快照 SHA-256：`2fd0a31adbe900aa87ea49c6e5ceaa4de2aa622820274928020a32276b4bce82`
- rulesVersion：`2026.07.15-v2`

## 遷移方式

保留 Prisma／SQLite 作為本機研究、匯入、規則重算與審核的唯一來源；Sites 執行階段改讀取建置前產生、可雜湊驗證的唯讀 JSON 快照。Excel 於建置前產生為靜態檔，避免在 Worker 執行階段載入 Prisma、SQLite 原生驅動或 ExcelJS。

第一版沒有帳號、個人背包或線上編輯，因此 `.openai/hosting.json` 的 D1、R2 維持 `null`。未來加入持久化寫入時再以 migration 導入 D1，不在本次遷移中建立雙寫。

## 完整性結果

| 項目             |  數量 |
| ---------------- | ----: |
| 圖鑑物種         |    30 |
| Pokémon 型態     |    35 |
| 戰鬥版本         |   153 |
| 詳細頁快照       |   153 |
| 原始評估資料     |   123 |
| 類別評估         | 1,071 |
| 資料來源         |   107 |
| 變更紀錄         |   303 |
| 規則追蹤         | 1,683 |
| 開啟中的審核問題 |   134 |

決策分布：建議保留 76、條件式保留 17、通常可傳送 35、需要重新確認 25。

## 驗證結果

- Sites 相容性檢查：11 項支援、0 項部分支援、0 項問題。
- Vitest：8 個測試檔、47 個測試全部通過。
- remediation integration：4 個測試全部通過。
- 資料驗證：通過。
- TypeScript typecheck：通過。
- ESLint：通過。
- Vinext production build：通過。
- Next.js 本機相容模式 production build：通過。
- 瀏覽器煙霧測試：首頁 153 筆、搜尋、詳細頁、審核佇列 134 筆、來源、變更紀錄、靜態 Excel 及舊匯出 API redirect 均通過。
- Worker bundle 未包含 Prisma、better-sqlite3 或 ExcelJS。

## 保留與回復

完整 SQLite 備份位於被 Git 忽略的 `backups/pre-sites-migration-20260716/dev.db`，其 manifest 保存檔案大小與 SHA-256。若要回復遷移前程式狀態，可由上述基準 commit 建立分支；若要回復資料，先停止程序，再以備份檔覆寫根目錄 `dev.db` 並核對雜湊。

## 尚待人工確認

本次工作只遷移執行與部署架構，不改寫 #001～#030 的研究判斷。資料中的 25 筆 `NEEDS_REVIEW` 與 134 個開啟中的審核問題仍由既有 Review Queue 管理，不因遷移而自動降級或猜測補值。
