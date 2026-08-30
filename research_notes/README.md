# Research notes

`research_notes/sources/` 是目前資料流程使用的來源快照區，保存 38 個可機器讀取的 JSON；import、測試與 provenance 檢查應從此處讀取。

`research_notes/history/` 保存 13 個歷史 Markdown 研究筆記，供人工追溯與閱讀，不直接作為目前 import 輸入。檔名與 sources 中的 JSON companion 對應；研究來源有疑義時保留 review／hold 狀態，不以歷史筆記推測填值。

此目錄根層只作導覽；`data/sources/` 是另一個資料來源區，依其自身 schema 與更新流程管理。
