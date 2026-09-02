# Gen 1（關都 #001～#151）資料審查 — 2026-09-02

## 審查目的

本次不是單純重跑既有規則，而是針對「清包時是否能安全、直觀判斷該留或可傳」重新核對第一世代的來源新鮮度、PvP、PvE／Mega／Max、版本推出狀態、進化價值與 IV 呈現。

## 結論

- 第一世代既有資料結構、型態拆分與進化家族模型可沿用。
- PvP 的個體 IV 規則維持不變：GL／UL 只有物種本身有用途時才套用個體 Rank≤100／PR 門檻。
- PvE 的 IV 規則維持不變：15 攻是同種長期投資排序偏好，不是硬性淘汰線；暗影保留標準較寬。
- 本次修正的核心是 **PvP 快照新鮮度與 Mega 寶石海星推出狀態**。

## 1. PvP 快照

### 來源

- PvPoke Open League / Overall 固定快照：`data/sources/pvpoke/2026-09-01/`
- PvPoke commit：`7b96d91fb553780653190ad32de001b5d9086a7f`
- GL / UL / ML 皆使用完整 JSON 陣列 index + 1 重現物種名次。

### 修正

#001～#030 原本已讀取 2026-09-01 快照；本 PR 將 #031～#151 的四個 legacy importer 也切到相同快照，避免資料版本寫 2026-09-02、但部分 PvP 判斷仍停留在 2026-07-03 的狀況。

舊快照與 2026-09-01 快照跨越目前主要保留門檻的 Gen1 例子：

| 物種／型態 | 聯盟 | 舊名次 | 2026-09-01 | 影響 |
|---|---:|---:|---:|---|
| 妙蛙花 | GL | #248 | #252 | #001～030 已由現行 seed 吸收 |
| 暗影噴火龍 | UL | #239 | #252 | #001～030 已由現行 seed 吸收 |
| 關都穿山王 | UL | #205 | #435 | #001～030 已由現行 seed 吸收 |
| 火爆猴 | UL | #113 | #14 | 從選擇性物種用途升為前 100 主要用途 |
| 暗影風速狗 | ML | #207 | #368 | 不再因舊 ML #101～250 名次形成 PvP 保留理由 |
| 暗影蚊香泳士 | UL | #265 | #248 | 進入選擇性 PvP 候選範圍 |

### 保留門檻

- 物種榜前 100：主要 PvP 用途。
- 物種榜 101～250：選擇性／次要 PvP 用途，不等於值得大量投入。
- 250 以外：除非有獨立人工證據或其他 PvE／Mega／Max／進化價值，不能單靠 PvP 升格。
- **物種榜名次與個體 IV Rank 完全分開。**

## 2. ML 顯示語意：已識別，延後為跨世代 presentation 修正

審查確認目前家族摘要會把所有具有 Master League 用途的 BattleVariant 統一寫成「ML 高 IV 投資候選」，即使物種榜只落在 #101～250，也可能造成過度投資的印象。

原本嘗試在本 PR 直接把 ML 分成 Top 100 主力與 #101～250 次要候選，但該函式是 #001～#493 共用 presentation layer，會使 Gen2～Gen4 的既有 review snapshot 全部 stale。為維持「一個世代一個 PR」及可審查性，本 PR **不夾帶跨世代 review 重寫**。

後續處理原則已確定：

- ML 物種榜 #1～100：主力／高 IV 投資候選。
- ML 物種榜 #101～250：次要／選擇性候選，只需少量高 IV。
- 物種榜名次與個體 IV Rank 必須明確分開。

這項 presentation 修正會在 Gen1～Gen4 資料審查完成後，以獨立跨世代 PR 處理並一次重建所有 review snapshot。

## 3. Mega 寶石海星

舊資料是在 2026-08-03 查閱官方公告，因此仍標成「2026-08-22 將登場／尚未開放」。

2026-09-02 重新核對後：

- Pokémon GO 官方活動頁確認 Mega Starmie 於 **2026-08-22 11:00～17:00（當地時間）首次登場**。
- 因此 `121-kanto-mega` 改為 RELEASED。
- #120 海星星與 #121 寶石海星的進化／Mega 候選文字同步更新。
- 普通海星星／寶石海星本身仍不等於 Mega；只因實際進化或 Mega 基底需求保留少量候選。
- 當前 GO Hub Mega Ascension 分析將 Mega Starmie 評為低優先 PvE Mega（B Tier）；因此「已推出」不等於「核心資源投資」，維持選擇性保留較合理。

來源：
- Pokémon GO 官方：https://pokemongo.com/zh-Hant/news/starmie-super-mega-raid-day-2026
- GO Hub Mega Ascension：https://pokemongohub.net/post/meta/mega-ascension-pve-tier-list-which-mega-evolutions-to-raid-in-pokemon-go/

## 4. PvE／暗影／Max 審查原則

本 PR 不退回舊式「15 攻才留」：

- PvE 先看物種與型態、招式、等級／CP、既有投入與斷點，再用 IV 比同種候選。
- 14/15/15 等高整體 IV 不因攻擊不是 15 就直接淘汰。
- 暗影因輸出機制與取得成本，保留標準明顯寬於普通版本；不能用普通個體的高 IV 門檻直接清掉。
- Mega／Max 必須看精確版本；普通個體不能替代 Dynamax／Gigantamax 個體。
- 目前 GO Hub 2026-08-27 Max Attackers Tier List 仍將 Gigantamax Gengar、Kingler、Machamp 列在 S Tier，與 Gen1 對這些 Max 版本的高保留價值方向一致。

Max 參考：
- https://pokemongohub.net/post/guide/max-attackers-tier-list/

## 5. 清包安全邊界

這次審查仍保留以下不可逆安全規則：

- 異色、特殊造型、活動背卡、紀念與個人收藏不因戰鬥價值低而自動傳送。
- 一次性／特殊取得（例如夢幻）不套用普通重複清包規則。
- 前階只有在後續進化確實有用途時才保留少量候選，不因「可以進化」就整家族囤積。
- Purified 不因有 Mega／PvE 用途就自動建議淨化；淨化不可逆。
- 尚未推出的精確版本不得拿普通個體假裝成候選。

## 驗證要求

本 PR 必須通過：

1. 全量 disposable DB clean rebuild。
2. research rebuild verification。
3. published integrity verification。
4. lint、typecheck、Vitest。
5. Pages static build / HTTP smoke contract。
6. Gen1 source-data regression tests。
7. ML 物種排名與個體 IV Rank 顯示分離測試。

PR 通過並 merge 後，才開始 Gen2 審查，避免多個世代同時修改共用規則。
