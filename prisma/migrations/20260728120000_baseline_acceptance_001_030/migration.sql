UPDATE "IvRecommendation"
SET
  "attackIvMin" = NULL,
  "attackIvPriority" = 15,
  "totalIvPercentMin" = NULL,
  "totalIvPercentPriority" = NULL,
  "secondaryAttackIv" = NULL,
  "secondaryTotalIvPercentMin" = NULL,
  "ivRecommendationZhTw" = 'PvE：先看物種與型態、招式、等級／CP與既有投入，再看攻防耐久斷點，最後才以IV比較同種候選。15攻優先；14攻高整體IV亦可留。不設硬性IV淘汰線。',
  "shortIvLabelZhTw" = 'PvE：15攻優先；14攻高整體IV亦可留',
  "rulesVersion" = '2026.07.28-iv-v2',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'iv-global-pve';

UPDATE "IvRecommendation"
SET
  "attackIvMin" = NULL,
  "attackIvPriority" = 15,
  "totalIvPercentMin" = NULL,
  "totalIvPercentPriority" = NULL,
  "secondaryAttackIv" = NULL,
  "secondaryTotalIvPercentMin" = NULL,
  "ivRecommendationZhTw" = 'Mega／PvE：先看物種、招式、等級／CP與既有投入，再看斷點，最後才以IV比較同種候選。15攻優先；14攻高整體IV亦可留。通常只需保留少量候選。',
  "shortIvLabelZhTw" = 'Mega：15攻優先；14攻高整體IV亦可留',
  "rulesVersion" = '2026.07.28-iv-v2',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'iv-global-mega';

UPDATE "IvRecommendation"
SET
  "attackIvMin" = NULL,
  "attackIvPriority" = 15,
  "attackIvConditionalMin" = NULL,
  "ivRecommendationZhTw" = '暗影標準較寬；15攻優先，不設硬性最低IV。高價值暗影不得只因攻擊或總IV偏低而傳送或淨化；只有一隻或取得稀有時原則上至少保留一隻。淨化不可逆。',
  "shortIvLabelZhTw" = '暗影標準較寬；15攻優先，不設硬性最低IV',
  "rulesVersion" = '2026.07.28-iv-v2',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'iv-global-shadow-pve';

INSERT INTO "ChangeLog" (
  "id", "entityType", "entityId", "fieldName", "previousValue", "newValue",
  "sourceId", "changeReasonZhTw", "changedAt", "rulesVersion"
) VALUES
  (
    'baseline-20260728-data-version',
    'Dataset',
    'batch-001-030',
    'dataVersion',
    '2026.07.18-r5',
    '2026.07.28-r6',
    NULL,
    '完成 #001～#030 基準驗收，更新資料版本並保留批次邊界。',
    '2026-07-28 04:00:00',
    '2026.07.28-v5'
  ),
  (
    'baseline-20260728-pve-iv-policy',
    'IvRecommendation',
    'iv-global-pve',
    'ivRecommendationZhTw',
    '15攻／96%以上優先；15攻／91%以上可留；14攻／96%以上為次選。',
    '15攻優先；14攻高整體IV亦可留；IV只在物種、型態、招式、等級／CP、投入與斷點之後比較。',
    NULL,
    '移除PvE硬性IV淘汰線，避免14/15/15、14/15/14與14攻高整體IV候選被錯誤傳送。',
    '2026-07-28 04:00:00',
    '2026.07.28-iv-v2'
  ),
  (
    'baseline-20260728-shadow-iv-policy',
    'IvRecommendation',
    'iv-global-shadow-pve',
    'ivRecommendationZhTw',
    '攻擊13以上建議保留；攻擊10～12條件式保留。',
    '暗影標準較寬；15攻優先，不設硬性最低IV；不得只因總IV低而傳送或淨化。',
    NULL,
    '移除暗影攻擊13與總IV硬性門檻，保留稀有、高價值與唯一個體的不可逆安全原則。',
    '2026-07-28 04:00:00',
    '2026.07.28-iv-v2'
  );
