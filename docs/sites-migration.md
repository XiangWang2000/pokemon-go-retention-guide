# Sites 遷移說明

## 目標

保留原本可在本機執行的 Next.js／Prisma／SQLite 研究系統，同時讓使用者介面能以 Sites 的 Vinext／Cloudflare Worker 格式建置與發布。第一版沒有任何線上寫入，因此不把本機研究資料庫改成第二套雲端資料庫。

## 遷移前保存狀態

- Git 基準 commit：`843c74b6b02326d8ec9a72e842aa23e22caae528`
- 根目錄 SQLite：`dev.db`
- 遷移前大小：`2633728` bytes
- 遷移前 SHA-256：`97A4AE6BC3FB420387852B3A7CBE15492654F622DF4813F7DF51AEF8A6F4524F`
- 忽略版控的實體備份：`backups/pre-sites-migration-20260716/dev.db`
- 備份 manifest：`backups/pre-sites-migration-20260716/manifest.json`

`prisma/dev.db` 是空檔，不是正式資料來源。所有資料工具都繼續使用根目錄 `dev.db`。

## 架構

```text
dev.db
  │
  ├─ Prisma schema／migration／seed／import／規則引擎／資料驗證
  │
  └─ npm run sites:snapshot
       ├─ site-data/dashboard.json
       ├─ site-data/details.json
       ├─ site-data/review.json
       ├─ site-data/sources.json
       ├─ site-data/changes.json
       ├─ site-data/manifest.json
       └─ public/exports/pokemon-go-retention-001-181.xlsx
              │
              └─ Vinext → Cloudflare Worker／Sites
```

本機 Prisma 是唯一研究主資料；Sites snapshot 是不可變的發布 read model。這避免在第一版引入不必要的 D1、雙向同步、第二份 schema 或 Worker native SQLite 問題。

## 資料一致性

`site-data/manifest.json` 保存：

- 根目錄 `dev.db` 大小與 SHA-256。
- 15 個正式資料表的筆數。
- dashboard、Review Queue、Sources、Change Log 與詳細資料筆數。
- 每個 JSON 的大小與 SHA-256。
- 合併 snapshot SHA-256。
- Excel 大小、SHA-256 與工作表數。
- rulesVersion 與資料日期。

執行：

```powershell
npm run sites:snapshot
npm run sites:snapshot:check
```

在本機存在 `dev.db` 時，檢查器會要求資料庫雜湊與 snapshot 完全相同；如果資料庫已更新但忘記重新產生 snapshot，建置會失敗。部署建置沒有 SQLite 時，仍會驗證所有受版本控制的 JSON 與 Excel 雜湊。

## 常用指令

### Sites／Vinext

```powershell
npm run dev
npm run build
npm run start
```

### 保留的 Next.js Node 模式

```powershell
npm run dev:local
npm run build:local
npm run start:local
```

### 資料更新後建置

```powershell
npm run data:validate
npm run review:generate
npm run review:remediation
npm run sites:snapshot
npm run sites:snapshot:check
npm test
npm run test:integration
npm run lint
npm run typecheck
npm run build
```

## Excel

ExcelJS 只在本機 snapshot 產生流程與測試執行，不進入 Worker runtime。首頁直接下載：

```text
/exports/pokemon-go-retention-001-181.xlsx
```

舊 `/api/export` 以 307 轉址保留相容性。這避免 Worker runtime 的 Node stream、記憶體、CPU 與 bundle 風險，同時保留十張繁中工作表、超連結、日期、穩定 ID、凍結列與自動篩選。

## Sites binding

第一版設定：

```json
{
  "d1": null,
  "r2": null
}
```

只有開始實作個人背包、帳號、線上人工審核、線上資料更新或其他 runtime 寫入時，才需要新增 D1。屆時必須建立代表 Prisma 最終 schema 的全新 D1 baseline，不得直接重播包含 table rebuild 的既有 Prisma migration。

## 還原方式

來源程式可由遷移前 Git commit 還原；SQLite 可由備份複製回根目錄。還原前應先保存目前工作，再核對備份 manifest 的 SHA-256。不要使用空的 `prisma/dev.db` 覆蓋正式資料。

## 固定公開網址與部署後 CDN purge

對外固定使用 `/`、`/api/home` 與 `/data/home.json`，不把資料版本 query 放進公開連結。首頁由 SSG 先輸出更新日期、四級 PvE 分類統計與重要家族摘要；完整家族資料仍由瀏覽器從 `/api/home` 載入。

每次 production deployment 成功後，執行：

```powershell
npm run sites:purge
```

此流程會以目前 `site-data/manifest.json` 的 `dataVersion`，依序呼叫固定入口的 purge hook 並重新驗證；`/` 與 `/api/home` 必須回傳相同的 `X-Data-Version`，`/data/home.json` 則以公開檔案 SHA-256 比對（Sites 可能不會對靜態 asset 套用自訂 header）。任一路徑仍回傳舊版本時，流程會失敗，不應視為部署完成。
