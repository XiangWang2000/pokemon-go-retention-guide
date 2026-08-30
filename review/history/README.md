# 歷史審核報告

`review/` 根目錄保留目前 release 的逐批審核輸出與 current recalibration report。`review/history/` 保存已被後續批次取代的 checkpoint、recalibration、migration/remediation 與 family aggregation 報告；這些檔案不屬於目前 release allowlist，也不是部署來源。

封存報告的 JSON companion 是結構化 canonical record；Markdown 只是人工閱讀版本。`family-aggregation-20260718.md` 含 398 個無法還原的 `?` 字元，請以同名 JSON 為準。
