# Remaining branch integration review — 2026-09-15

This integration accepts Gen6 **candidate research**, not formal Gen6 publication. Published scope remains #001–#649 and the r33 snapshot is unchanged. Candidate source summaries retain their original observation dates; this review does not claim a fresh external-source audit.

## Branch decisions

| Branch | Disposition | Reason |
| --- | --- | --- |
| data/gen6-formal-publication | Integrate candidate data, evidence and pure import plan with corrections | 72 identities, 161 exact forms and 652 planned variants. The 433 UNKNOWN variants remain HOLD_FOR_NOW / TRUE_DATA_PENDING. |
| preflight/gen6-formal-publication | Retain history; exclude temporary workflow | Generates publication code inside CI and bypasses the normal reviewable source path. The useful candidate content is included above. |
| preflight/gen6-publication | Retain history; exclude staging script and temporary workflow | Hardcodes an older release date/version, expected counts and test replacements. These are not a validated release migration. |
| preflight/gen6-publication-fix | Retain history; use reviewed candidate integration | Intermediate preflight repairs; its candidate content is superseded by the reviewed Gen6 branch. |
| data/gen5-494-523-pve-evidence | Preserve conflicting research, retain current published implementation | Closed PR #92 differs from accepted PR #93. Overall investment tier and type-specific utility use different criteria; deleting positive evidence would silently change published judgments. |
| retention-gen8-galar-hisui | Retain history; use current archived guide | Later audits #70 and #73 correct the old species-level presentation and add exact-form isolation. Do not restore old files under active review/. |
| retention-gen9-paldea | Retain history; use current archived guide | Later audits #71 and #73 supersede the old presentation and inherited Gen5–Gen8 tables. |

## Excluded unsafe publication paths

The Gen6 persistence importer and publication review script are excluded from the active tree. They are not registered in the published batch registry and have no end-to-end persistence coverage here. The importer assigns every evaluation reviewed/resolved with HIGH confidence, silently skips unresolved source links and labels new Gen6 fallback sources GEN5-PVE. The review script requires zero TRUE_DATA_PENDING despite unresolved release evidence. Their source remains in the merged branch history for reference, not as executable release tooling.

## Conflicting Gen5 research

The unchanged [PR #92 source manifest](../research_notes/history/branch-review-2026-09-15/pr92-pve-494-523.json) records alternative Shadow Serperior and Dynamax Unfezant assessments. Current evidence distinguishes limited/type-specific utility from core investment. Neither interpretation is reclassified as freshly verified by this branch review. Before changing published recommendations, compare the dated source methods, record both positions in the formal review queue, and regenerate the reviewed release through the existing pipeline.

## Gen6 publication prerequisites

1. Review dated release/PvP/PvE/Max evidence per batch, preserving unresolved or conflicting evidence.
2. Implement a registered importer with canonical source mapping, conservative pending states, transactions and persistence tests; do not automatically mark candidate research human-approved.
3. Generate batch review reports and obtain the required batch review before proceeding to the next batch.
4. Change scope/version/contracts from actual rebuild results, generate snapshot and workbook using the existing scripts, and pass full release/Pages verification.

No temporary preflight workflow is activated by this integration. Existing published sources, registry entries, database and runtime artifacts are retained.

## Reviewed branch heads

- `data/gen6-formal-publication`: `495f01880c32538b675ff471f44407e55f9e6b75`
- `preflight/gen6-formal-publication`: `885990590dfc8d38dd9ec289e0582c21f5d30e1f`
- `preflight/gen6-publication`: `81f22fcc32c2118576a51719a1fa08e75f24d360`
- `preflight/gen6-publication-fix`: `91c1ca739bddd6b4de91080ff8d017edfc7d5702`
- `data/gen5-494-523-pve-evidence`: `6fefac9633c1bc092c9b899c7c66e27337466923`
- `retention-gen8-galar-hisui`: `4adcec72524189d18090bc16beb9b941d57be138`
- `retention-gen9-paldea`: `d6f2d7d9c5e04874c2add05521b7e5fdd785edf3`
