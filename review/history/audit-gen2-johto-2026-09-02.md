# Gen 2（城都 #152～#251）資料審查 — 2026-09-02

## 審查目的

本次沿用 Gen1 已確認的安全原則：排行榜門檻是主要框架但不是絕對真理；只有會影響誤傳的資料缺口才需要 HOLD；普通、暗影、淨化、Mega 與 Max 必須以精確版本分開判斷。

## 1. PvP 快照

Gen2 四個批次統一改讀：
- PvPoke snapshot: `data/sources/pvpoke/2026-09-01/`
- commit: `7b96d91fb553780653190ad32de001b5d9086a7f`
- GL / UL / ML 均以完整 JSON index + 1 重現物種名次。

比較舊快照與 2026-09-01 快照後，Gen2 沒有物種跨越目前主要保留分級（Top 100 / 101～250 / >250）。因此這次 PvP 更新主要是來源一致性與可重現性，不是大幅改寫保留結論。

## 2. Max 推出狀態修正

舊資料遺漏了數個截至 2026-09-02 已可取得／使用的 Dynamax 型態。本次補上：

- #163 咕咕 Dynamax
- #164 貓頭夜鷹 Dynamax
- #196 太陽伊布 Dynamax
- #197 月亮伊布 Dynamax
- #215 狃拉 Dynamax

既有的 #213 壺壺、#237 戰舞郎，以及 #242 / #243 / #244 / #245 / #249 / #250 等已推出 Max 型態繼續保留。

來源使用 2026-09-02 可重現的 GO Hub Max 個別頁、Max Attackers / Defenders / Healers tier lists；「已推出」只代表版本存在，不再自動等於 KEEP。

## 3. Max 保留從「推出即 KEEP」改為角色分級

Gen2 audit 新增可選的 variant-specific Max evidence，只有 Gen2 批次啟用，不改 Gen3～Gen4 舊行為。

主要判斷：

- Dynamax Blissey：核心保留。Max Healer S Tier，另有防守用途。
- Dynamax Espeon：有明確 Psychic Max 攻擊用途，留少量高品質候選。
- Dynamax Raikou / Entei / Suicune / Ho-Oh：有攻擊、治療或防守角色，但非全都屬核心，改為選擇性保留。
- Dynamax Lugia / Umbreon / Noctowl：主要靠治療等輔助角色，少量留即可。
- Dynamax Sneasel：冰系 Max 攻擊有可用價值，少量留。
- Dynamax Shuckle / Hitmontop：目前 Max 攻擊價值低，只需特殊用途／收藏級少量候選。

這避免「只要是 Dynamax 就全部 KEEP」造成背包過度保留。

## 4. 普通／暗影／Max 的 PvE 用途拆開

舊 legacy importer 的 form-level PvE 標籤會同時影響普通與暗影版本，容易把不同角色混成同一結論。本次新增 optional `variantUseOverrides`，可對精確 BattleVariant 覆蓋 PvE、Gym、Max 角色。

代表修正：

### 幸福蛋
- 普通幸福蛋不再標成一般團戰 PvE 候選。
- 普通版的主要保留理由改為道館防守。
- Dynamax Blissey 則因 Max Healer S Tier 獨立升為核心 Max 候選。

### 雷公
- 普通雷公由舊的 CORE 降為可用／預算型。
- 暗影雷公依目前資料獨立標為核心 PvE 投資；暗影標準仍較寬。
- Dynamax Raikou 另依 Max 角色選擇性保留。

### 炎帝
- 普通炎帝由 CORE 改為可用型。
- 暗影炎帝保留實戰價值，但不等同 Shadow Raikou 等級的核心投資。
- Dynamax Entei 的主要額外價值包含 Max 治療。

### 水君
- 普通水君明確不屬一般團戰投資目標。
- Max Suicune 仍因 Max 防守／治療角色有獨立保留價值。

### 盔甲鳥
- 普通與暗影盔甲鳥不再因 Mega/同家族資料被標成 PvE 攻擊候選。
- 普通／暗影團戰價值低；PvP、Mega 分開判斷。

## 5. 規則彈性調整

### `NO_SIGNIFICANT_USE`
舊 `legacyInitialDecision` 只檢查 PvE map 是否有值，導致 `NO_SIGNIFICANT_USE` 這種明確「無顯著用途」字串也會被當成 CONDITIONAL_KEEP。

本次修正為只有 CORE / USABLE / SPECIAL 等真正有用途的值才能成為 PvE 保留證據。

### PvP snapshot
legacy importer 新增 optional snapshot 參數，可讓單一世代逐批升級來源，不必一次重算後續世代。

### Variant role override
新增 optional variant-specific PvE / Gym / Max evidence 與 decision override；沒有設定的後續世代維持原行為。

## 6. 清包安全原則

- 異色、特殊造型、活動背卡、紀念與個人收藏仍在一般戰鬥評估之外。
- PvE 不把 15 攻當硬淘汰線；14 攻高整體 IV 仍可保留。
- 暗影標準比普通版寬，不以普通版 IV 門檻直接清掉。
- Max 版本與普通個體不可互相替代。
- 有進化路徑不代表整家族必留；只保留後續目標真正需要的少量候選。
- 查不到次要資料不自動 HOLD；只有缺口可能改變「可不可以安全傳送」時才暫緩。

## 主要 2026-09-02 來源

- PvPoke 2026-09-01 repository snapshot
- Pokémon GO Hub — Max Attackers Tier List:
  https://pokemongohub.net/post/guide/max-attackers-tier-list/
- Pokémon GO Hub — Max Defenders Tier List:
  https://pokemongohub.net/post/guide/max-defenders-tier-list/
- Pokémon GO Hub — Max Healers Tier List:
  https://pokemongohub.net/post/guide/max-healers-tier-list-june-2025/
- Dynamax Hoothoot debut:
  https://pokemongohub.net/post/guide/dynamax-hoothoot-max-monday-event-guide/
- Dynamax Espeon:
  https://db.pokemongohub.net/pokemon/196-Dynamax
- Dynamax Umbreon:
  https://db.pokemongohub.net/pokemon/197-Dynamax
- Dynamax Sneasel:
  https://db.pokemongohub.net/pokemon/215-Dynamax
- Blissey role:
  https://pokemongohub.net/post/battledex/blissey/
- Shadow Raikou:
  https://db.pokemongohub.net/pokemon/243-Shadow
- Shadow Entei:
  https://db.pokemongohub.net/pokemon/244-Shadow
- Suicune:
  https://db.pokemongohub.net/pokemon/245
- Skarmory:
  https://db.pokemongohub.net/pokemon/227

## 驗證要求

PR 必須通過：
1. clean disposable DB rebuild
2. research rebuild verification
3. historical published-data integrity
4. release verification contract
5. lint / typecheck / Vitest
6. static Pages build / artifact smoke checks

Gen2 PR merge 後才開始 Gen3 audit。
