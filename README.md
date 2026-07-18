# Pokémon GO Retention Guide

## 家族總覽與結構化 IV 建議（2026-07-18）

首頁預設為「家族總覽」，另保留「單隻圖鑑」與「資料審核」模式。顯示分組不會改寫或合併 `PokemonForm`、`BattleVariant`、`RawEvaluationData`、`SourceReference`、`ChangeLog` 或既有評估。

### 家族分組

1. 先依 `PokemonSpecies.familyKey` 建立候選家族。
2. 再把 `EvolutionPath` 視為無向連線，於同一 `familyKey` 內計算 connected components。
3. 同一進化網路只顯示一個家族群組；所有成員與 BattleVariant 仍保留在展開層。
4. 不同地區型態若沒有互相連接的進化路徑，會形成獨立子群組，例如關都與阿羅拉小拉達。
5. 分支進化使用完整 `EvolutionPath` 圖，不以圖鑑編號連續性推測，且會顯示分支數與需分開保留的提示。

目前 #001～#030 共整理為 15 個顯示群組。小個體與中間進化各自具有 `memberSummary`，角色可為 `EVOLUTION_MATERIAL`、`INDEPENDENT_PVP`、`INDEPENDENT_PVE`、`GYM_DEFENDER`、`MEGA_CANDIDATE`、`MAX_CANDIDATE`、`COLLECTION_ONLY` 或 `NO_DISTINCT_USE`。若小個體或中間進化有獨立用途，家族摘要會明確提醒不要把最佳個體全部進化。

### 家族價值與清包策略

家族摘要不再直接沿用成員的 `finalDecision`，而是分開推導兩個 presentation-only 概念：

- `familyValue`：`HIGH`、`MEDIUM`、`LOW`、`UNKNOWN`，回答家族是否有實際戰鬥價值。
- `familyRetentionStrategy`：`KEEP_TARGETS`、`SELECTIVE_KEEP`、`MOSTLY_TRANSFER`、`HOLD_FOR_NOW`，回答清包時應如何處理重複個體。

聚合會先找出真正具有 PvP、PvE、道館、Mega、Max 或特殊版本用途的 `primaryRetentionTargets`，再判斷用途是否廣泛、是否只限特定版本，以及是否有小個體或中間進化的獨立用途。單純存在進化路徑、屬於進化素材或成員不是 `TRANSFER_CANDIDATE`，都不再自動形成選擇性保留；前階只有在目標進化成員確實有用途時，才會顯示為符合目標 IV 條件的進化候選。

關鍵來源衝突、物種錯置、規則未涵蓋或可能改變用途的 Mega／Max 推出狀態才會產生 `UNKNOWN + HOLD_FOR_NOW`。火箭隊缺少統一排名、Purified 繼承普通版及其他不影響清包策略的缺口，只保留為資料待補提示。重新計算結果與逐家族摘要見 `review/family-aggregation-20260718.md` 及其 JSON 版本。

### IV 策略與數字門檻

結構化規則保存於 `IvRecommendation`，而不是只保存中文長句。全域預設包括：

- 一般 PvE：`15攻／96%以上優先`；`15攻／91%以上可留`；`14攻／96%以上次選`。
- Mega：`15攻／96%以上優先`；`15攻／91%以上可先留`，通常只留少量候選。
- Master League：`15攻／96%以上`；`15攻／98%以上優先`；`100%最優先`。
- Great／Ultra League：只有物種本身有對應聯盟用途時，才套用個體 `Rank≤100` 或 `PR≥97.5%`；`Rank 101～200` 為條件式。
- 暗影 PvE：`攻擊13以上建議保留，15優先`；低 IV 不會自動建議傳送或淨化。
- 道館：不設固定 IV 門檻，物種、等級、CP、耐久與既有投入優先。
- Max 攻擊手：`15攻優先`；坦克：`防禦／HP優先`；支援與彈性角色使用角色或物種規則。

IV 百分比統一以 `(attackIv + defenseIv + staminaIv) / 45 × 100` 計算，畫面依 Pokémon GO 慣例顯示 45/45=100%、44/45=98%、43/45=96%、42/45=93%、41/45=91%、40/45=89%。

覆寫優先序為：

```text
BattleVariant 用途覆寫
→ PokemonForm 覆寫
→ 家族成員（PokemonSpecies）覆寫
→ familyKey 家族預設
→ GLOBAL 全域預設
```

任何門檻都先檢查該用途是否成立；低戰鬥價值物種不會因為 100% IV 自動變成 `KEEP`。規則與候選判定位於 `src/iv/strategy.ts`，家族聚合位於 `src/presentation/family-overview.ts`，表單摘要位於 `src/presentation/form-overview.ts`。

新增 migration：`prisma/migrations/20260718120000_family_overview_structured_iv/migration.sql`。既有最新評估可用下列指令回填成具體 IV 文字，並同步寫入 `ChangeLog`：

```powershell
npm run db:deploy
npm run data:backfill-iv
npm run sites:snapshot
```

### 介面結構

- 桌面：固定八欄家族表格，最終建議與 IV 短標籤位於主要視野，不設定超寬最小寬度。
- 手機：家族卡片，展開後依成員顯示卡片，不使用超寬表格。
- 第一層：家族、成員、已推出版本、PvP、PvE、道館、Mega／Max、最終建議與 IV 短標籤。
- 第二層：成員角色、用途、IV 完整條件與成員結論。
- 第三層：所有 BattleVariant、GL／UL／ML、原始資料、來源、confidence、dataStatus、reviewIssues 與 Change Log。

第一版仍不接受使用者個體 IV 輸入，因此不會計算使用者背包中的實際 PvP Rank；介面提供的是該用途的可執行篩選門檻。Max 角色以目前人工整理的角色與來源推導，資料待補項目仍留在資料審核層。
Pokémon GO 通用寶可夢保留價值指南。系統以 `PokemonForm × BattleVariant` 為最小評估單位，將來源原始資料與規則引擎推導結論分開保存，回答一般個體在排除異色、特殊造型、活動背卡、紀念與個人收藏價值後，是否具有 PvP、PvE、火箭隊、道館、Mega、Max Battle 或後續進化用途。

第一版只處理通用圖鑑資料，不讀取個人背包、不輸入 IV、不比較個體，也不使用付費 API 或任何會操作 Pokémon GO 的功能。

## Sites 遷移（2026-07-16）

網站已改用 Sites 官方 Vinext／Cloudflare Worker 建置流程，同時完整保留本機 Prisma／SQLite 研究資料層。由於第一版沒有帳號、個人背包、線上編輯或任何 runtime 寫入，部署版採用風險較低的唯讀 snapshot，而不引入 D1：

```text
本機 Prisma + SQLite（研究、匯入、規則、審核的唯一主資料）
  → npm run sites:snapshot
  → 受版本控制的 site-data JSON + 預建 XLSX
  → Sites／Vinext 唯讀網站
```

- `.openai/hosting.json` 的 `d1`、`r2` 均為 `null`；未使用不必要的雲端儲存。
- Worker runtime 不載入 Prisma、`better-sqlite3` 或 ExcelJS。
- `site-data/manifest.json` 保存來源 DB SHA-256、各表筆數、rulesVersion、每個 snapshot 檔與 Excel 的 SHA-256。
- `npm run build` 會先執行 snapshot 完整性檢查；本機 `dev.db` 若已變更但 snapshot 未更新，建置會停止。
- Excel 改為建置前產生的靜態資產；舊 `/api/export` 仍保留相容轉址。
- 遷移前來源基準 commit：`843c74b6b02326d8ec9a72e842aa23e22caae528`；SQLite 備份與 manifest 位於忽略版控的 `backups/pre-sites-migration-20260716/`。

完整說明請見 `docs/sites-migration.md`。

## #001～#030 保留決策與資料待補流程（2026-07-17）

本版以正式 Prisma migration 在既有資料庫上完成修正，保留所有 `SourceReference`、`RawEvaluationData`、舊版 `RetentionEvaluation`、原查閱日期與 `ChangeLog`：

- 每個 BattleVariant 具有七個獨立 `CategoryEvaluation`：PvP、PvE、火箭隊、道館、Mega、Max Battle、後續進化。
- `finalDecision` 只包含 `KEEP`、`CONDITIONAL_KEEP`、`HOLD_FOR_NOW`、`TRANSFER_CANDIDATE`；`NEEDS_REVIEW` 不再是使用者建議。
- 類別資料狀態與最終決策分開；`NOT_APPLICABLE`、`UNRANKED`、`DATA_UNAVAILABLE`、`PARTIALLY_VERIFIED` 等次要缺口只會降低信心或加入資料待補清單。
- `HOLD_FOR_NOW` 只用於可能改變結論的關鍵不確定性；因傳送不可逆，資料補齊前由系統直接建議暫時保留。
- 評估依據新增 `SOURCE_VERIFIED`、`MANUAL_CURATED`、`INHERITED`、`DATA_UNAVAILABLE`；人工整理結論不會假裝為完整來源驗證。
- PokemonForm／BattleVariant 推出狀態改為 `RELEASED`、`UNRELEASED`、`UNKNOWN` 三態。
- Purified 以 Normal 基礎評估加淨化 modifier／optional override，Return 已由普通版重新歸類。
- 火箭隊改為定性 `rocketRating`／`rocketRoles`；目前沒有完整可重現排名時使用 `DATA_UNAVAILABLE`。
- PvPoke 精確名次綁定固定 commit、檔案雜湊、Open／Overall、species／form／variant 與擷取方法。
- Max 屬性內名次、整體價值、投資優先度與用途廣度分欄保存。
- 前一版最新評估有 19 筆 `NEEDS_REVIEW`；本版全部重新分類為 19 筆 `HOLD_FOR_NOW`，原因皆為推出狀態仍無法由可靠原始來源確認。原值已寫入 `ChangeLog`。

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
npm run sites:snapshot
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
- 集中式規則引擎、規則追蹤、資料待補清單、來源頁、變更紀錄。
- 10 張繁體中文工作表的 `.xlsx` 匯出。
- JSON／CSV 匯入、交易式寫入、資料一致性驗證。
- `review/001-030.md` 與 `review/001-030.json` 批次審核報告。

目前規則引擎產生 20 筆 `KEEP`、76 筆 `CONDITIONAL_KEEP`、19 筆 `HOLD_FOR_NOW`、38 筆 `TRANSFER_CANDIDATE`。後續進化是唯一主要價值時使用條件式保留；只有推出狀態不明、物種疑似錯置、關鍵來源衝突、限定招式影響不明或規則未涵蓋等實質不確定性，才暫時保留。

## 本機需求

- Windows、macOS 或 Linux。
- Node.js 22.13 以上；本專案已以 Node.js 24.15 驗證。
- npm 11 以上。
- 不需要外部資料庫或付費服務。

## 安裝與啟動

```powershell
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
npm run sites:snapshot
npm run dev
```

`npm run dev` 啟動 Sites／Vinext 開發預覽；使用終端機顯示的網址。完成 `npm run build` 後，可用 `npm run start` 透過 Wrangler 啟動與 Sites 部署環境一致的 production 預覽。若需驗證原本的 Next.js Node server，使用 `npm run dev:local`，預設開啟 [http://localhost:3000](http://localhost:3000)。

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
npm run test:integration
npm run data:validate
npm run review:generate
npm run sites:check
npm run sites:snapshot:check
npm run build
npm run build:local
```

測試包含：

- 同圖鑑多型態、Mega X／Y、普通／Dynamax、招式關聯資料模型。
- `052`、`52`、全形數字、中英文名稱、地區型態、別名與進化名稱搜尋。
- 缺火箭隊排名與 `NOT_APPLICABLE` 不觸發暫時保留、關鍵 Mega 狀態不明才觸發 `HOLD_FOR_NOW`、漂亮 IV 不覆蓋物種低價值、暗影獨立評估、後續進化條件式保留與具體中文理由。
- Excel 可重新開啟、工作表齊全、中文欄位、超連結、日期格式、凍結列、自動篩選與穩定 ID。
- 匯入資料的重複 ID、名稱、網址、日期、rank 與 Enum 驗證。

## 網站功能

### 圖鑑評估

- 依圖鑑編號、中英文名稱、型態、別名、進化前後名稱搜尋。
- 忽略英文大小寫、全半形數字、前導零、前後／多餘空白與常見標點差異。
- 依戰鬥版本、最終分類、PvP／PvE／道館資料、新鮮度與資料維護狀態篩選。
- 桌面固定表頭與完整欄位；手機使用基本卡片檢視。
- 展開原始資料、來源與規則引擎追蹤。

### 詳細頁

- 基本資料、屬性、所有戰鬥版本。
- PvP、PvE、火箭隊、道館、Mega、Max Battle、進化、招式與 IV 摘要。
- 原始資料、來源、規則追蹤與資料維護狀態。

### 資料待補清單

- 供開發者與後續 Codex 研究使用；一般使用者不需要自行判斷 PvP、PvE、Mega、Max 或道館價值。
- 顯示缺少資料、無法自動確認原因、是否影響目前建議、暫定建議、下一步研究行動、相關來源與最後研究日期。
- 支援研究批次、圖鑑範圍及是否影響最終建議篩選。

### Excel 匯出

首頁「匯出 Excel」下載 `/exports/pokemon-go-retention-001-030.xlsx`；檔案由 `npm run sites:snapshot` 從本機可信資料庫預先產生，舊 `/api/export` 會以 307 轉址到同一檔案。內容包含：

1. 寶可夢型態
2. 評估總覽
3. PvP原始資料
4. PvE原始資料
5. 道館與Max Battle
6. 招式資料
7. 進化關係
8. 資料待補清單
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

每個來源保存原始頁面標題、網址、來源類型、語言、查閱日、發布日（若有）、版本及中文摘要。來源衝突不會靜默覆蓋：系統保存雙方原始資料並建立 `SOURCE_CONFLICT`；尚未解決且可能導致誤傳時輸出 `HOLD_FOR_NOW`，否則保留正式建議並降低信心。

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
9. 執行 `npm run sites:snapshot`，檢查 `site-data/`、manifest 與預建 Excel 差異。
10. 執行 lint、typecheck、tests、`npm run sites:snapshot:check` 與 production build。
11. 人工審核後才開始下一批。

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
- 版本：`2026.07.16-v3`

優先序先判斷是否真的無法形成實用結論，再判斷主要戰鬥價值、重要進化、條件式用途及已確認低價值。類別缺資料只會在沒有其他可靠定性、人工整理或繼承依據時阻止正式決策；React 元件及 API route 不包含保留判斷條件。

## 專案結構

```text
Pokemon/
├─ .openai/hosting.json       # Sites project 與可選 binding；第一版不使用 D1/R2
├─ build/sites-vite-plugin.ts # 封裝 Sites metadata
├─ worker/index.ts            # Cloudflare Worker 入口
├─ site-data/                 # 受版本控制的唯讀網站 snapshot 與 manifest
├─ public/exports/            # 預建 Excel 靜態資產
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
│  ├─ generate-sites-snapshot.ts
│  ├─ check-sites-snapshot.ts
│  └─ generate-review.ts
├─ src/
│  ├─ app/                     # Next.js 頁面及 Excel route
│  ├─ components/              # 表格、篩選、導覽、深色模式
│  ├─ config/freshness.ts
│  ├─ data/                    # 種子、研究整合與匯入 schema
│  ├─ export/excel.ts
│  ├─ lib/                     # Sites snapshot、Prisma 本機查詢、搜尋正規化
│  ├─ locales/zh-TW.ts         # 集中式繁中顯示 mapping
│  └─ rules/                   # 集中式規則引擎
├─ tests/
├─ package.json
├─ prisma.config.ts
├─ vite.config.ts
└─ README.md
```

## 已知限制與資料待補

- 19 個戰鬥版本目前為 `HOLD_FOR_NOW`，皆因推出狀態無法由可靠原始來源確認；每筆均有具體中文原因與研究行動。
- 另有 112 個不影響正式結論的開放資料待補項目，主畫面仍顯示可執行建議。
- 火箭隊目前沒有可靠、逐物種、當季且可重現的完整排名，本批不以其他類別代替。
- Pokebattler 動態攻擊手表出現物種錯置風險，未匯入不可穩定重現的全域排名。
- Purified 以普通版為基礎再套用淨化 modifier／optional override；Return 與失去 Shadow 價值會另外處理。
- GMax 巴大蝶已將蟲屬性排名與整體投資價值拆成不同維度，不再建立假 `SOURCE_CONFLICT`。
- 大嘴雀 PvPoke GL Overall #20 已由固定 commit 的完整結構化 JSON 重現並保留。
- Sites 第一版是唯讀 snapshot；開始實作個人背包、線上審核或 runtime 寫入時，才需要遷移到 D1。
- Mega 雷丘 X／Y 官方公告首次登場日為 2026-07-18；研究查閱日 2026-07-15，因此記為已公告但尚未推出。
- #030 尼多娜可進化成 #031 尼多后，先以 `MANUAL_CURATED` 保存條件式保留結論；#031 完整原始排名仍不在本批，也沒有自動延伸研究到 #031～#060。
- 資料維護狀態不代表使用者必須自行判斷；網站、Excel 與 JSON 報告均分開保存 `finalDecision`、`confidence`、`reviewStatus`、`reviewIssues` 與缺失摘要。

所有頁面都使用同一則範圍說明：本結論只針對一般戰鬥及實用價值；異色、特殊造型、活動背卡、紀念與個人收藏價值需另行判斷。
