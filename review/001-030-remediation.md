# #001～#030 資料修正報告

- 更新日期：2026-07-17
- rulesVersion：2026.07.17-v4

## 1. 原問題摘要

舊規則仍可能把個別類別缺資料提升為 NEEDS_REVIEW，即使已有足以作出實用保留判斷的人工整理或繼承資料。

## 2. Schema 修改

- 新增 EvaluationDataStatus 與 CategoryEvaluation／CategoryEvaluationSource。
- PokemonForm、BattleVariant 新增 RELEASED／UNRELEASED／UNKNOWN 三態。
- 新增 Purified 繼承、Rocket 定性欄位、Max 拆分維度、PvP 擷取 metadata 與 Review reason。
- 新增 EvaluationProvenance，區分 SOURCE_VERIFIED、MANUAL_CURATED、INHERITED、DATA_UNAVAILABLE。

## 3. 規則引擎修改

- finalDecision 不再包含 NEEDS_REVIEW；關鍵不確定性依不可逆風險原則產生 HOLD_FOR_NOW。
- SOURCE_MISSING、NOT_APPLICABLE、UNRANKED、DATA_UNAVAILABLE、PARTIALLY_VERIFIED 等次要缺口不會自動產生 HOLD_FOR_NOW。
- 類別缺口保留在資料待補清單並視情況降低 confidence，不會自動覆蓋 finalDecision。

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

## 9. 原 NEEDS_REVIEW 重新分類統計

- 原 NEEDS_REVIEW：19
- 轉為 KEEP：0
- 轉為 CONDITIONAL_KEEP：0
- 轉為 HOLD_FOR_NOW：19
- 轉為 TRANSFER_CANDIDATE：0
- 不影響最終決策的資料待補：112
- 含 NOT_APPLICABLE 而仍可判斷：0
- 含 DATA_UNAVAILABLE 而仍可判斷：0
- 因 Purified 繼承而解決：9
- 因已有足夠實用判斷依據而解決：0

## 10. HOLD_FOR_NOW 的具體原因

- 004-kanto-purified：此戰鬥版本是否已在 Pokémon GO 推出仍無法確認；若實際已推出，可能具有獨立用途。傳送不可逆，確認前建議暫時保留。
- 004-kanto-shadow：此戰鬥版本是否已在 Pokémon GO 推出仍無法確認；若實際已推出，可能具有獨立用途。傳送不可逆，確認前建議暫時保留。
- 007-kanto-purified：此戰鬥版本是否已在 Pokémon GO 推出仍無法確認；若實際已推出，可能具有獨立用途。傳送不可逆，確認前建議暫時保留。
- 007-kanto-shadow：此戰鬥版本是否已在 Pokémon GO 推出仍無法確認；若實際已推出，可能具有獨立用途。傳送不可逆，確認前建議暫時保留。
- 011-kanto-normal：此戰鬥版本是否已在 Pokémon GO 推出仍無法確認；若實際已推出，可能具有獨立用途。傳送不可逆，確認前建議暫時保留。
- 019-kanto-purified：此戰鬥版本是否已在 Pokémon GO 推出仍無法確認；若實際已推出，可能具有獨立用途。傳送不可逆，確認前建議暫時保留。
- 019-kanto-shadow：此戰鬥版本是否已在 Pokémon GO 推出仍無法確認；若實際已推出，可能具有獨立用途。傳送不可逆，確認前建議暫時保留。
- 021-kanto-purified：此戰鬥版本是否已在 Pokémon GO 推出仍無法確認；若實際已推出，可能具有獨立用途。傳送不可逆，確認前建議暫時保留。
- 021-kanto-shadow：此戰鬥版本是否已在 Pokémon GO 推出仍無法確認；若實際已推出，可能具有獨立用途。傳送不可逆，確認前建議暫時保留。
- 022-kanto-purified：此戰鬥版本是否已在 Pokémon GO 推出仍無法確認；若實際已推出，可能具有獨立用途。傳送不可逆，確認前建議暫時保留。
- 022-kanto-shadow：此戰鬥版本是否已在 Pokémon GO 推出仍無法確認；若實際已推出，可能具有獨立用途。傳送不可逆，確認前建議暫時保留。
- 023-kanto-purified：此戰鬥版本是否已在 Pokémon GO 推出仍無法確認；若實際已推出，可能具有獨立用途。傳送不可逆，確認前建議暫時保留。
- 023-kanto-shadow：此戰鬥版本是否已在 Pokémon GO 推出仍無法確認；若實際已推出，可能具有獨立用途。傳送不可逆，確認前建議暫時保留。
- 025-kanto-purified：此戰鬥版本是否已在 Pokémon GO 推出仍無法確認；若實際已推出，可能具有獨立用途。傳送不可逆，確認前建議暫時保留。
- 025-kanto-shadow：此戰鬥版本是否已在 Pokémon GO 推出仍無法確認；若實際已推出，可能具有獨立用途。傳送不可逆，確認前建議暫時保留。
- 026-alola-purified：此戰鬥版本是否已在 Pokémon GO 推出仍無法確認；若實際已推出，可能具有獨立用途。傳送不可逆，確認前建議暫時保留。
- 026-alola-shadow：此戰鬥版本是否已在 Pokémon GO 推出仍無法確認；若實際已推出，可能具有獨立用途。傳送不可逆，確認前建議暫時保留。
- 026-kanto-purified：此戰鬥版本是否已在 Pokémon GO 推出仍無法確認；若實際已推出，可能具有獨立用途。傳送不可逆，確認前建議暫時保留。
- 026-kanto-shadow：此戰鬥版本是否已在 Pokémon GO 推出仍無法確認；若實際已推出，可能具有獨立用途。傳送不可逆，確認前建議暫時保留。

## 11. 資料待補項目

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
- 020-kanto-shadow｜MATERIAL_DATA_GAP｜PVE 類別仍有資料備註，目前狀態為 SOURCE_MISSING。尚無足夠的可重現 PvE 定位資料；只有在可能改變結論時才會阻止正式決策。
- 020-alola-shadow｜MATERIAL_DATA_GAP｜PVE 類別仍有資料備註，目前狀態為 SOURCE_MISSING。尚無足夠的可重現 PvE 定位資料；只有在可能改變結論時才會阻止正式決策。
- 024-kanto-shadow｜MATERIAL_DATA_GAP｜PVE 類別仍有資料備註，目前狀態為 SOURCE_MISSING。尚無足夠的可重現 PvE 定位資料；只有在可能改變結論時才會阻止正式決策。
- 001-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 001-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 001-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 001-kanto-dynamax｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：MAX_BATTLE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 002-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 002-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 002-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 002-kanto-dynamax｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：MAX_BATTLE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 003-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 003-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 003-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 003-kanto-dynamax｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：ROCKET=DATA_UNAVAILABLE。
- 003-kanto-mega｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 003-kanto-gigantamax｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：ROCKET=DATA_UNAVAILABLE。
- 004-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 004-kanto-dynamax｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：MAX_BATTLE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 005-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 005-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 005-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 005-kanto-dynamax｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：MAX_BATTLE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 006-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 006-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 006-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 006-kanto-dynamax｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：ROCKET=DATA_UNAVAILABLE。
- 006-kanto-mega-x｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 006-kanto-mega-y｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 006-kanto-gigantamax｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：ROCKET=DATA_UNAVAILABLE。
- 007-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 007-kanto-dynamax｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：MAX_BATTLE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 008-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 008-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 008-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 008-kanto-dynamax｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：MAX_BATTLE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 009-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 009-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 009-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 009-kanto-dynamax｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：ROCKET=DATA_UNAVAILABLE。
- 009-kanto-mega｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 009-kanto-gigantamax｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：ROCKET=DATA_UNAVAILABLE。
- 010-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 010-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 010-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 010-kanto-dynamax｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：MAX_BATTLE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 011-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 011-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：ROCKET=DATA_UNAVAILABLE。
- 011-kanto-dynamax｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：MAX_BATTLE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
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
- 020-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、ROCKET=DATA_UNAVAILABLE。
- 020-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、ROCKET=DATA_UNAVAILABLE。
- 020-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、ROCKET=DATA_UNAVAILABLE。
- 020-alola-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 020-alola-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、ROCKET=DATA_UNAVAILABLE。
- 020-alola-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 021-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 022-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、PVE=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 023-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、PVE=SOURCE_MISSING、ROCKET=DATA_UNAVAILABLE。
- 024-kanto-normal｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
- 024-kanto-shadow｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=DATA_UNAVAILABLE、ROCKET=DATA_UNAVAILABLE。
- 024-kanto-purified｜OPTIONAL_DATA_MISSING｜非關鍵類別仍有次要缺口：GYM=PARTIALLY_VERIFIED、ROCKET=DATA_UNAVAILABLE。
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

## 12. 資料問題是否影響最終保留結論

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
- 020-kanto-shadow：不會；建議：保留目前實用結論，後續補齊 PVE 精確資料並重新評估信心程度。
- 020-alola-shadow：不會；建議：保留目前實用結論，後續補齊 PVE 精確資料並重新評估信心程度。
- 024-kanto-shadow：不會；建議：保留目前實用結論，後續補齊 PVE 精確資料並重新評估信心程度。
- 001-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 001-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 001-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 001-kanto-dynamax：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 002-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 002-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 002-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 002-kanto-dynamax：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 003-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 003-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 003-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 003-kanto-dynamax：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 003-kanto-mega：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 003-kanto-gigantamax：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 004-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 004-kanto-dynamax：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 005-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 005-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 005-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 005-kanto-dynamax：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 006-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 006-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 006-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 006-kanto-dynamax：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 006-kanto-mega-x：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 006-kanto-mega-y：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 006-kanto-gigantamax：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 007-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 007-kanto-dynamax：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 008-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 008-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 008-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 008-kanto-dynamax：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 009-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 009-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 009-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 009-kanto-dynamax：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 009-kanto-mega：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 009-kanto-gigantamax：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 010-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 010-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 010-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 010-kanto-dynamax：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 011-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 011-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 011-kanto-dynamax：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
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
- 020-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 020-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 020-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 020-alola-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 020-alola-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 020-alola-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 021-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 022-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 023-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 024-kanto-normal：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 024-kanto-shadow：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
- 024-kanto-purified：不會；建議：日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。
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

## 13. 測試結果

- lint：通過（0 errors, 0 warnings）
- typecheck：通過
- unitTests：通過（9 files, 62 tests）
- integrationTests：通過（包含資料庫 HOLD_FOR_NOW、reviewIssues 與 affectsFinalDecision 驗證）
- dataValidation：通過（30 species, 35 forms, 153 variants, 123 raw records, 1071 category statuses, 107 sources）
- migration：通過（5 migrations, no pending migrations）
- seed：通過（既有 30 筆物種時安全略過，不清空歷史資料）
- productionBuild：通過（Next.js 16.2.10）
- uiSmoke：通過（首頁顯示 19 個暫時保留版本、混合版本摘要不遺失 HOLD、資料待補清單欄位與分頁、影響結論篩選）

## 13. 已知限制

- 仍有部分 Shadow／Purified 推出狀態缺少可靠逐物種原始來源。
- 部分 PvE 只有 GO Hub 屬性 Tier／角色定位，未聲稱為 Pokebattler 全域排名。
- 火箭隊目前沒有可靠完整的當季全物種排名。
- #030 的後續進化 #031 超出本批範圍，仍保留 material review。
