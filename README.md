# Pokémon GO Retention Guide

Pokémon GO 通用寶可夢保留價值指南。系統以 `PokemonForm × BattleVariant` 為最小評估單位，將來源原始資料與規則引擎推導結論分開保存，回答一般個體在排除異色、特殊造型、活動背卡、紀念與個人收藏價值後，是否具有 PvP、PvE、火箭隊、道館、Mega、Max Battle 或後續進化用途。

第一版只處理通用圖鑑資料，不讀取個人背包、不輸入 IV、不比較個體，也不使用付費 API 或任何會操作 Pokémon GO 的功能。

## #001～#030 類別狀態修正（2026-07-15）

本版以正式 Prisma migration 在既有資料庫上完成修正，保留所有 `SourceReference`、`RawEvaluationData`、舊版 `RetentionEvaluation`、原查閱日期與 `ChangeLog`：

- 每個 BattleVariant 具有七個獨立 `CategoryEvaluation`：PvP、PvE、火箭隊、道館、Mega、Max Battle、後續進化。
- 類別資料狀態與最終決策分開；`NOT_APPLICABLE`、`UNRANKED`、`DATA_UNAVAILABLE`、`PARTIALLY_VERIFIED` 不會自動產生 `NEEDS_REVIEW`。
- PokemonForm／BattleVariant 推出狀態改為 `RELEASED`、`UNRELEASED`、`UNKNOWN` 三態。
- Purified 以 Normal 基礎評估加淨化 modifier／optional override，Return 已由普通版重新歸類。
- 火箭隊改為定性 `rocketRating`／`rocketRoles`；目前沒有完整可重現排名時使用 `DATA_UNAVAILABLE`。
- PvPoke 精確名次綁定固定 commit、檔案雜湊、Open／Overall、species／form／variant 與擷取方法。
- Max 屬性內名次、整體價值、投資優先度與用途廣度分欄保存。
- 修正前 126 筆 `NEEDS_REVIEW`，修正後 25 筆；剩餘項目都有具體原因、影響標記與建議處理方式。

修正報告：`review/001-030-remediation.md`、`review/001-030-remediation.json`。

### 建立或更新資料庫

```powershell
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
npm run data:remediate
npm run data:validate
npm run review:generate
npm run review:remediation
npm run dev
```

`db:seed` 在偵測到既有資料時會停止寫入，不會清空來源、歷史評估或變更紀錄。要重跑本批修正使用 `npm run data:remediate`；腳本使用 upsert／append-only 評估版本，可安全重跑。

## 已完成範圍

- Next.js 16 App Router、TypeScript、Tailwind CSS、SQLite、Prisma 7。
- #001～#030，共 30 個物種、35 個關都／阿羅拉型態。
- 153 個普通、暗影、淨化、Mega、Dynamax、Gigantamax 獨立戰鬥版本。
- 123 筆結構化原始評估資料、107 筆來源記錄。
- PvPoke GL／UL／ML 原始排名 JSON 本機快照與 commit 版本。
- Pokémon GO 官方推出狀態、Mega／Max／暗影／進化／活動招式研究記錄。
- GO Hub Database 的 PvE、Mega、Max Battle、道館資料與來源衝突記錄。
- 集中式規則引擎、規則追蹤、審核佇列、來源頁、變更紀錄。
- 10 張繁體中文工作表的 `.xlsx` 匯出。
- JSON／CSV 匯入、交易式寫入、資料一致性驗證。
- `review/001-030.md` 與 `review/001-030.json` 批次審核報告。

目前規則引擎產生 19 筆 `KEEP`、6 筆 `CONDITIONAL_KEEP`、2 筆 `TRANSFER_CANDIDATE`、126 筆 `NEEDS_REVIEW`。大量 `NEEDS_REVIEW` 是刻意的保守結果：缺少物種級官方推出證據、Purified 獨立排名、可重現的火箭隊資料或可靠 PvE 交叉資料時，不以推測補值。

## 本機需求

- Windows、macOS 或 Linux。
- Node.js 22.12 以上；本專案已以 Node.js 24.15 驗證。
- npm 11 以上。
- 不需要外部資料庫或付費服務。

## 安裝與啟動

```powershell
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)。

若要使用不同 SQLite 檔案，先複製 `.env.example` 為 `.env`，再修改：

```dotenv
DATABASE_URL="file:./dev.db"
```

`prisma.config.ts` 供 Prisma CLI 使用；應用程式透過 `@prisma/adapter-better-sqlite3` 連線。若安裝被中斷而找不到 native binding，可執行：

```powershell
npm rebuild better-sqlite3
```

## 驗證指令

```powershell
npm run lint
npm run typecheck
npm test
npm run data:validate
npm run review:generate
npm run build
```

測試包含：

- 同圖鑑多型態、Mega X／Y、普通／Dynamax、招式關聯資料模型。
- `052`、`52`、全形數字、中英文名稱、地區型態、別名與進化名稱搜尋。
- 來源缺失、漂亮 IV 不覆蓋物種低價值、暗影獨立評估、Mega、特殊盃、果然翁、壺壺、地區型態與後續進化規則。
- Excel 可重新開啟、工作表齊全、中文欄位、超連結、日期格式、凍結列、自動篩選與穩定 ID。
- 匯入資料的重複 ID、名稱、網址、日期、rank 與 Enum 驗證。

## 網站功能

### 圖鑑評估

- 依圖鑑編號、中英文名稱、型態、別名、進化前後名稱搜尋。
- 忽略英文大小寫、全半形數字、前導零、前後／多餘空白與常見標點差異。
- 依戰鬥版本、最終分類、PvP／PvE／道館資料、新鮮度與人工審核狀態篩選。
- 桌面固定表頭與完整欄位；手機使用基本卡片檢視。
- 展開原始資料、來源與規則引擎追蹤。

### 詳細頁

- 基本資料、屬性、所有戰鬥版本。
- PvP、PvE、火箭隊、道館、Mega、Max Battle、進化、招式與 IV 摘要。
- 原始資料、來源、規則追蹤與審核狀態。

### 審核佇列

- 缺少來源、來源衝突、可能過期、推出狀態不明、未經人工確認與 `NEEDS_REVIEW`。
- 支援研究批次及圖鑑範圍篩選。

### Excel 匯出

首頁「匯出 Excel」呼叫 `/api/export`，產生：

1. 寶可夢型態
2. 評估總覽
3. PvP原始資料
4. PvE原始資料
5. 道館與Max Battle
6. 招式資料
7. 進化關係
8. 需要重新確認
9. 資料來源
10. 變更紀錄

每張工作表凍結標題列、啟用自動篩選、設定欄寬；網址為超連結、日期統一為 `yyyy-mm-dd`，並保留英文 ID 與 Enum 供重新匯入。

## 資料研究與來源政策

本次環境具備即時網路搜尋。研究日期為 2026-07-15，原始研究清單位於：

- `research_notes/official-001-030.json`／`.md`
- `research_notes/battle-001-015.json`／`.md`
- `research_notes/battle-016-030.json`／`.md`
- `data/sources/pvpoke/rankings-1500.json`
- `data/sources/pvpoke/rankings-2500.json`
- `data/sources/pvpoke/rankings-10000.json`
- `data/sources/pvpoke/source-version.json`

PvPoke 本機快照版本為 commit `86847e535b7e0a0f4e91f9628b3fc713ae6adca7`。`RawEvaluationData.rank` 保存的是物種在聯盟中的整體排名，不是該物種內部的個體 IV Rank。

每個來源保存原始頁面標題、網址、來源類型、語言、查閱日、發布日（若有）、版本及中文摘要。來源衝突不會靜默覆蓋：系統保存雙方原始資料、建立 `SOURCE_CONFLICT`，降低信心並讓 `DATA_INCOMPLETE` 高優先規則輸出 `NEEDS_REVIEW`。

## 資料更新流程

每批最多 30 個圖鑑編號；完成一批後先人工檢查，不會自動進入下一批。

1. 用 Pokémon GO 官方原始頁確認型態與推出狀態。
2. 保存普通、暗影、淨化、Mega、Dynamax、Gigantamax 的獨立狀態。
3. 建立進化關係與重要招式。
4. 下載 PvPoke 當期 GL／UL／ML 原始 JSON，記錄 commit 或版本。
5. 由 Pokebattler／GO Hub 原始頁研究 PvE、Mega、Max Battle、道館。
6. 將研究 JSON 放入 `research_notes`，或使用匯入工具更新資料表。
7. 執行 `npm run data:validate`。
8. 重新執行 seed／規則引擎與 `npm run review:generate`。
9. 執行 lint、typecheck、tests、production build。
10. 人工審核後才開始下一批。

資料新鮮期限集中於 `src/config/freshness.ts`：PvP 90 天、PvE／招式 180 天、型態推出／官方機制／道館 365 天、Max Battle 180 天。

## JSON／CSV 匯入

匯入支援 `PokemonSpecies`、`PokemonForm`、`BattleVariant`、`EvolutionPath`、`Move`、`VariantMove`、`RawEvaluationData`、`SourceReference`。

JSON 可以直接是記錄陣列：

```json
[
  {
    "id": "species-052",
    "dexNumber": 52,
    "nameEn": "Meowth",
    "nameZhTw": "喵喵",
    "generation": 1,
    "familyKey": "KANTO_FAMILY_052"
  }
]
```

也可以使用：

```json
{
  "entity": "PokemonSpecies",
  "records": []
}
```

CSV 第一列使用英文資料庫欄位名；陣列欄位可放 JSON 字串。執行：

```powershell
npm run data:import -- data\import\species.json --entity PokemonSpecies
npm run data:import -- data\import\forms.csv --entity PokemonForm
```

工具先驗證整批資料，再用單一 Prisma transaction 寫入。任何記錄失敗時整批回滾，不留下部分更新；錯誤訊息使用繁體中文。

## 規則引擎

- 規則設定：`src/rules/rules.ts`
- 規則執行：`src/rules/engine.ts`
- 版本：`2026.07.15-v2`

優先序由資料不完整／衝突開始，再判斷主要戰鬥價值、重要進化、條件式用途及已確認低價值。React 元件及 API route 不包含保留判斷條件。

## 專案結構

```text
Pokemon/
├─ prisma/
│  ├─ schema.prisma
│  ├─ migrations/20260714162646_init/migration.sql
│  └─ seed.ts
├─ data/sources/pvpoke/        # 可稽核 PvPoke 原始快照
├─ research_notes/             # 官方與第三方研究結果
├─ review/                     # 批次人工／機器審核報告
├─ scripts/
│  ├─ import-data.ts
│  ├─ validate-data.ts
│  └─ generate-review.ts
├─ src/
│  ├─ app/                     # Next.js 頁面及 Excel route
│  ├─ components/              # 表格、篩選、導覽、深色模式
│  ├─ config/freshness.ts
│  ├─ data/                    # 種子、研究整合與匯入 schema
│  ├─ export/excel.ts
│  ├─ lib/                     # Prisma、查詢、搜尋正規化
│  ├─ locales/zh-TW.ts         # 集中式繁中顯示 mapping
│  └─ rules/                   # 集中式規則引擎
├─ tests/
├─ package.json
├─ prisma.config.ts
└─ README.md
```

## 已知限制與待人工確認

- 126 個戰鬥版本維持 `NEEDS_REVIEW`；主要來自推出狀態不明、缺 PvE／Max／Purified 資料。
- 火箭隊目前沒有可靠、逐物種、當季且可重現的完整排名，本批不以其他類別代替。
- Pokebattler 動態攻擊手表出現物種錯置風險，未匯入不可穩定重現的全域排名。
- Purified 常與普通版共用基礎排名，但 Return 可能改變招式；因此沒有直接複製普通版結論。
- GMax 巴大蝶的 GO Hub 頁面曾出現排名與文字建議衝突，保留 `SOURCE_CONFLICT`。
- 大嘴雀目前 PvPoke GL #20，但 GO Hub 敘述疑似未同步，已降低信心。
- Mega 雷丘 X／Y 官方公告首次登場日為 2026-07-18；研究查閱日 2026-07-15，因此記為已公告但尚未推出。
- #030 尼多娜可進化成 #031 尼多后，但 #031 不在本批；沒有自動延伸研究到 #031～#060。
- 第一版的人工審核狀態仍全為未簽核；網站及 JSON 報告清楚保留此狀態。

所有頁面都使用同一則範圍說明：本結論只針對一般戰鬥及實用價值；異色、特殊造型、活動背卡、紀念與個人收藏價值需另行判斷。
