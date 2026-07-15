# #001～#030 資料修正報告

- 更新日期：2026-07-15
- rulesVersion：2026.07.15-v2

## 1. 原問題摘要

舊規則把任何類別缺資料都提升為 NEEDS_REVIEW，且推出狀態只有 nullable boolean，Purified 重複要求排名，Max 屬性排名與整體投資混在一起。

## 2. Schema 修改

- 新增 EvaluationDataStatus 與 CategoryEvaluation／CategoryEvaluationSource。
- PokemonForm、BattleVariant 新增 RELEASED／UNRELEASED／UNKNOWN 三態。
- 新增 Purified 繼承、Rocket 定性欄位、Max 拆分維度、PvP 擷取 metadata 與 Review reason。

## 3. 規則引擎修改

- 只有 material category 的 SOURCE_MISSING／SOURCE_CONFLICT／UNKNOWN_RELEASE_STATUS 阻止正式決策。
- NOT_APPLICABLE、UNRANKED、DATA_UNAVAILABLE、PARTIALLY_VERIFIED 不會自動觸發 NEEDS_REVIEW。
- confidence 與 final decision 分開計算。

## 4. 火箭隊策略修改

火箭隊改存 DATA_UNAVAILABLE／定性 rocketRating／rocketRoles；未使用 PvP 或 PvE 排名替代。

## 5. Pokebattler 策略修改

不保存無法穩定重現的全域攻擊手名次；資料鍵需包含物種、型態、版本、雙招、Boss、等級、天氣、好友與排序方法。

## 6. Purified 繼承策略

- 繼承 Normal 的 Purified 版本：35
- 免除重複建立的基礎類別評估：140
- 需要 override：5
- Return 從普通版重新歸類到 Purified；高價值 Shadow 顯示不可逆淨化風險。

## 7. Max 評估維度拆分

- GMax 巴大蝶：蟲屬性 #1／S；整體=LIMITED；投資=LOW；用途=NARROW。
- 這些是不同維度，不再標記為 SOURCE_CONFLICT。

## 8. PvPoke 排名驗證策略

- 固定 commit：86847e535b7e0a0f4e91f9628b3fc713ae6adca7
- 只接受 Open League／Overall 完整 JSON；保存 species、form、variant、league、cup、category、版本、擷取方法與 reproducible。
- 大嘴雀 GL #20：完整榜單可重現，因此保留。

## 9. 修正前後 NEEDS_REVIEW 統計

- 修正前：126
- 修正後：25
- 已解決：101
- 含 NOT_APPLICABLE 而仍可判斷：76
- 含 DATA_UNAVAILABLE 而仍可判斷：76
- 因 Purified 繼承而解決：25
- 因推出狀態三態化而解決：101

## 10. 仍待人工確認項目

- 020-kanto-shadow｜MATERIAL_DATA_GAP｜PVE 是本筆最終決策的關鍵類別，目前狀態為 SOURCE_MISSING。尚無足夠的可重現 PvE 定位資料；只有在可能改變結論時才會阻止正式決策。
- 020-alola-shadow｜MATERIAL_DATA_GAP｜PVE 是本筆最終決策的關鍵類別，目前狀態為 SOURCE_MISSING。尚無足夠的可重現 PvE 定位資料；只有在可能改變結論時才會阻止正式決策。
- 024-kanto-shadow｜MATERIAL_DATA_GAP｜PVE 是本筆最終決策的關鍵類別，目前狀態為 SOURCE_MISSING。尚無足夠的可重現 PvE 定位資料；只有在可能改變結論時才會阻止正式決策。
- 030-kanto-normal｜MATERIAL_DATA_GAP｜EVOLUTION_VALUE 是本筆最終決策的關鍵類別，目前狀態為 SOURCE_MISSING。#030 的後續進化落在本批範圍外，需人工確認 #031 的實用價值後再定案。
- 030-kanto-shadow｜MATERIAL_DATA_GAP｜EVOLUTION_VALUE 是本筆最終決策的關鍵類別，目前狀態為 SOURCE_MISSING。#030 的後續進化落在本批範圍外，需人工確認 #031 的實用價值後再定案。
- 030-kanto-purified｜MATERIAL_DATA_GAP｜EVOLUTION_VALUE 是本筆最終決策的關鍵類別，目前狀態為 SOURCE_MISSING。基礎評價繼承普通版；另考慮強化成本、IV 增加、報恩與失去暗影型態的不可逆影響。#030 的後續進化落在本批範圍外，需人工確認 #031 的實用價值後再定案。
- 004-kanto-shadow｜UNKNOWN_RELEASE_STATUS｜此 BattleVariant 是否已在 Pokémon GO 推出仍無法由可靠原始來源確認。
- 004-kanto-purified｜UNKNOWN_RELEASE_STATUS｜此 BattleVariant 是否已在 Pokémon GO 推出仍無法由可靠原始來源確認。
- 007-kanto-shadow｜UNKNOWN_RELEASE_STATUS｜此 BattleVariant 是否已在 Pokémon GO 推出仍無法由可靠原始來源確認。
- 007-kanto-purified｜UNKNOWN_RELEASE_STATUS｜此 BattleVariant 是否已在 Pokémon GO 推出仍無法由可靠原始來源確認。
- 011-kanto-normal｜UNKNOWN_RELEASE_STATUS｜此 BattleVariant 是否已在 Pokémon GO 推出仍無法由可靠原始來源確認。
- 019-kanto-shadow｜UNKNOWN_RELEASE_STATUS｜此 BattleVariant 是否已在 Pokémon GO 推出仍無法由可靠原始來源確認。
- 019-kanto-purified｜UNKNOWN_RELEASE_STATUS｜此 BattleVariant 是否已在 Pokémon GO 推出仍無法由可靠原始來源確認。
- 021-kanto-shadow｜UNKNOWN_RELEASE_STATUS｜此 BattleVariant 是否已在 Pokémon GO 推出仍無法由可靠原始來源確認。
- 021-kanto-purified｜UNKNOWN_RELEASE_STATUS｜此 BattleVariant 是否已在 Pokémon GO 推出仍無法由可靠原始來源確認。
- 022-kanto-shadow｜UNKNOWN_RELEASE_STATUS｜此 BattleVariant 是否已在 Pokémon GO 推出仍無法由可靠原始來源確認。
- 022-kanto-purified｜UNKNOWN_RELEASE_STATUS｜此 BattleVariant 是否已在 Pokémon GO 推出仍無法由可靠原始來源確認。
- 023-kanto-shadow｜UNKNOWN_RELEASE_STATUS｜此 BattleVariant 是否已在 Pokémon GO 推出仍無法由可靠原始來源確認。
- 023-kanto-purified｜UNKNOWN_RELEASE_STATUS｜此 BattleVariant 是否已在 Pokémon GO 推出仍無法由可靠原始來源確認。
- 025-kanto-shadow｜UNKNOWN_RELEASE_STATUS｜此 BattleVariant 是否已在 Pokémon GO 推出仍無法由可靠原始來源確認。
- 025-kanto-purified｜UNKNOWN_RELEASE_STATUS｜此 BattleVariant 是否已在 Pokémon GO 推出仍無法由可靠原始來源確認。
- 026-kanto-shadow｜UNKNOWN_RELEASE_STATUS｜此 BattleVariant 是否已在 Pokémon GO 推出仍無法由可靠原始來源確認。
- 026-kanto-purified｜UNKNOWN_RELEASE_STATUS｜此 BattleVariant 是否已在 Pokémon GO 推出仍無法由可靠原始來源確認。
- 026-alola-shadow｜UNKNOWN_RELEASE_STATUS｜此 BattleVariant 是否已在 Pokémon GO 推出仍無法由可靠原始來源確認。
- 026-alola-purified｜UNKNOWN_RELEASE_STATUS｜此 BattleVariant 是否已在 Pokémon GO 推出仍無法由可靠原始來源確認。
- 001-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 001-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 001-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 002-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 002-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 002-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 003-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 003-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 003-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 003-kanto-dynamax｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：ROCKET=DATA_UNAVAILABLE。
- 003-kanto-mega｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 003-kanto-gigantamax｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：ROCKET=DATA_UNAVAILABLE。
- 004-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 005-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 005-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 005-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 006-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 006-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 006-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 006-kanto-dynamax｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：ROCKET=DATA_UNAVAILABLE。
- 006-kanto-mega-x｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 006-kanto-mega-y｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 006-kanto-gigantamax｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：ROCKET=DATA_UNAVAILABLE。
- 007-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 008-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 008-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 008-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 009-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 009-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 009-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 009-kanto-dynamax｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：ROCKET=DATA_UNAVAILABLE。
- 009-kanto-mega｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 009-kanto-gigantamax｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：ROCKET=DATA_UNAVAILABLE。
- 010-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 010-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 010-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 011-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 012-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、ROCKET=DATA_UNAVAILABLE。
- 012-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、ROCKET=DATA_UNAVAILABLE。
- 012-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、ROCKET=DATA_UNAVAILABLE。
- 012-kanto-dynamax｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：ROCKET=DATA_UNAVAILABLE。
- 013-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 013-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 013-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 014-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 014-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 014-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 015-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、ROCKET=DATA_UNAVAILABLE。
- 015-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、ROCKET=DATA_UNAVAILABLE。
- 015-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、ROCKET=DATA_UNAVAILABLE。
- 015-kanto-mega｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 016-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 016-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 016-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 017-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 017-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 017-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 018-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 018-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、ROCKET=DATA_UNAVAILABLE。
- 018-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 018-kanto-mega｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 019-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 019-alola-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 019-alola-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 019-alola-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 020-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、ROCKET=DATA_UNAVAILABLE。
- 020-alola-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 020-alola-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、ROCKET=DATA_UNAVAILABLE。
- 020-alola-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 021-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 023-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 024-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、ROCKET=DATA_UNAVAILABLE。
- 025-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 026-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 026-alola-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 027-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 027-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 027-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 027-alola-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 027-alola-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 027-alola-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 028-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 028-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、ROCKET=DATA_UNAVAILABLE。
- 028-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 028-alola-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 028-alola-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 028-alola-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 029-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 029-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 029-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 030-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、ROCKET=DATA_UNAVAILABLE。
- 030-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、ROCKET=DATA_UNAVAILABLE。
- 030-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、ROCKET=DATA_UNAVAILABLE。
- 012-kanto-gigantamax｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：ROCKET=DATA_UNAVAILABLE。
- 025-kanto-gigantamax｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：MAX_BATTLE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 001-kanto-dynamax｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：MAX_BATTLE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 002-kanto-dynamax｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：MAX_BATTLE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 004-kanto-dynamax｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：MAX_BATTLE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 005-kanto-dynamax｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：MAX_BATTLE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 007-kanto-dynamax｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：MAX_BATTLE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 008-kanto-dynamax｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：MAX_BATTLE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 010-kanto-dynamax｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：MAX_BATTLE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 011-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：ROCKET=DATA_UNAVAILABLE。
- 011-kanto-dynamax｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：MAX_BATTLE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 020-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、ROCKET=DATA_UNAVAILABLE。
- 020-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、ROCKET=DATA_UNAVAILABLE。
- 022-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 024-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 024-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。

## 11. 剩餘問題是否影響最終保留結論

- 020-kanto-shadow：會；建議：補齊可重現的 PVE 原始資料，或確認此類別不會改變保留結論後調整 materialToDecision。
- 020-alola-shadow：會；建議：補齊可重現的 PVE 原始資料，或確認此類別不會改變保留結論後調整 materialToDecision。
- 024-kanto-shadow：會；建議：補齊可重現的 PVE 原始資料，或確認此類別不會改變保留結論後調整 materialToDecision。
- 030-kanto-normal：會；建議：補齊可重現的 EVOLUTION_VALUE 原始資料，或確認此類別不會改變保留結論後調整 materialToDecision。
- 030-kanto-shadow：會；建議：補齊可重現的 EVOLUTION_VALUE 原始資料，或確認此類別不會改變保留結論後調整 materialToDecision。
- 030-kanto-purified：會；建議：補齊可重現的 EVOLUTION_VALUE 原始資料，或確認此類別不會改變保留結論後調整 materialToDecision。
- 004-kanto-shadow：會；建議：查找 Pokémon GO 官方公告、官方新聞或可核對日期的正式推出紀錄。
- 004-kanto-purified：會；建議：查找 Pokémon GO 官方公告、官方新聞或可核對日期的正式推出紀錄。
- 007-kanto-shadow：會；建議：查找 Pokémon GO 官方公告、官方新聞或可核對日期的正式推出紀錄。
- 007-kanto-purified：會；建議：查找 Pokémon GO 官方公告、官方新聞或可核對日期的正式推出紀錄。
- 011-kanto-normal：會；建議：查找 Pokémon GO 官方公告、官方新聞或可核對日期的正式推出紀錄。
- 019-kanto-shadow：會；建議：查找 Pokémon GO 官方公告、官方新聞或可核對日期的正式推出紀錄。
- 019-kanto-purified：會；建議：查找 Pokémon GO 官方公告、官方新聞或可核對日期的正式推出紀錄。
- 021-kanto-shadow：會；建議：查找 Pokémon GO 官方公告、官方新聞或可核對日期的正式推出紀錄。
- 021-kanto-purified：會；建議：查找 Pokémon GO 官方公告、官方新聞或可核對日期的正式推出紀錄。
- 022-kanto-shadow：會；建議：查找 Pokémon GO 官方公告、官方新聞或可核對日期的正式推出紀錄。
- 022-kanto-purified：會；建議：查找 Pokémon GO 官方公告、官方新聞或可核對日期的正式推出紀錄。
- 023-kanto-shadow：會；建議：查找 Pokémon GO 官方公告、官方新聞或可核對日期的正式推出紀錄。
- 023-kanto-purified：會；建議：查找 Pokémon GO 官方公告、官方新聞或可核對日期的正式推出紀錄。
- 025-kanto-shadow：會；建議：查找 Pokémon GO 官方公告、官方新聞或可核對日期的正式推出紀錄。
- 025-kanto-purified：會；建議：查找 Pokémon GO 官方公告、官方新聞或可核對日期的正式推出紀錄。
- 026-kanto-shadow：會；建議：查找 Pokémon GO 官方公告、官方新聞或可核對日期的正式推出紀錄。
- 026-kanto-purified：會；建議：查找 Pokémon GO 官方公告、官方新聞或可核對日期的正式推出紀錄。
- 026-alola-shadow：會；建議：查找 Pokémon GO 官方公告、官方新聞或可核對日期的正式推出紀錄。
- 026-alola-purified：會；建議：查找 Pokémon GO 官方公告、官方新聞或可核對日期的正式推出紀錄。
- 001-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 001-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 001-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 002-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 002-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 002-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 003-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 003-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 003-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 003-kanto-dynamax：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 003-kanto-mega：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 003-kanto-gigantamax：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 004-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 005-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 005-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 005-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 006-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 006-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 006-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 006-kanto-dynamax：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 006-kanto-mega-x：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 006-kanto-mega-y：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 006-kanto-gigantamax：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 007-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 008-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 008-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 008-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 009-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 009-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 009-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 009-kanto-dynamax：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 009-kanto-mega：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 009-kanto-gigantamax：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 010-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 010-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 010-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 011-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 012-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 012-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 012-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 012-kanto-dynamax：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 013-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 013-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 013-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 014-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 014-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 014-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 015-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 015-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 015-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 015-kanto-mega：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 016-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 016-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 016-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 017-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 017-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 017-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 018-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 018-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 018-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 018-kanto-mega：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 019-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 019-alola-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 019-alola-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 019-alola-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 020-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 020-alola-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 020-alola-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 020-alola-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 021-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 023-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 024-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 025-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 026-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 026-alola-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 027-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 027-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 027-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 027-alola-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 027-alola-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 027-alola-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 028-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 028-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 028-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 028-alola-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 028-alola-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 028-alola-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 029-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 029-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 029-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 030-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 030-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 030-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 012-kanto-gigantamax：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 025-kanto-gigantamax：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 001-kanto-dynamax：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 002-kanto-dynamax：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 004-kanto-dynamax：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 005-kanto-dynamax：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 007-kanto-dynamax：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 008-kanto-dynamax：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 010-kanto-dynamax：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 011-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 011-kanto-dynamax：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 020-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 020-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 022-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 024-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 024-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。

## 12. 測試結果

- lint：通過（0 errors, 0 warnings）
- typecheck：通過
- unitTests：通過（7 files, 43 tests）
- integrationTests：通過（1 file, 4 tests）
- dataValidation：通過（30 species, 35 forms, 153 variants, 123 raw records, 1071 category statuses, 107 sources）
- migration：通過（3 migrations, no pending migrations）
- seed：通過（既有 30 筆物種時安全略過，不清空歷史資料）
- productionBuild：通過（Next.js 16.2.10）
- uiSmoke：通過（首頁中文搜尋、Fearow #20、Review Queue 影響與處理欄、GMax Butterfree 分維度與無衝突狀態）

## 13. 已知限制

- 仍有部分 Shadow／Purified 推出狀態缺少可靠逐物種原始來源。
- 部分 PvE 只有 GO Hub 屬性 Tier／角色定位，未聲稱為 Pokebattler 全域排名。
- 火箭隊目前沒有可靠完整的當季全物種排名。
- #030 的後續進化 #031 超出本批範圍，仍保留 material review。
