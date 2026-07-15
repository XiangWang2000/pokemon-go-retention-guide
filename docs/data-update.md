# 資料更新檢查表

1. 每批最多 30 個圖鑑編號，先登記批次範圍與查閱日期。
2. 官方來源優先確認 PokemonForm 與所有 BattleVariant 的推出狀態。
3. PvPoke 排名必須記錄賽制、CP 上限、檔案版本與 commit；物種排名不可寫成個體 IV Rank。
4. Pokebattler／GO Hub 原始頁必須可開啟並保存標題、網址、版本、查閱日。
5. 沒有精確 rank 時只保存 tier、rating 或原始摘要，不自行換算。
6. 一般、暗影、淨化、Mega、Dynamax、Gigantamax 不可合併。
7. 來源衝突須同時保存、說明方法差異、降低 confidence 並建立 Review Queue。
8. 更新後依序執行 `data:validate`、`review:generate`、`lint`、`typecheck`、`test`、`build`。
9. 人工確認本批 Markdown／JSON 報告後才可開始下一批。
