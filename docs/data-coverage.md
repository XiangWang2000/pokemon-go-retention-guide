# Data coverage and audit status

This document distinguishes **formal published runtime coverage** from **research-only generation audit notes**.

## Formal published runtime data

The GitHub Pages runtime, release snapshot, Excel export, batch registry, and release contract currently publish:

- National Dex **#001–#649**
- Generations **1–5**
- Gen 5 / Unova in six Registry batches: `494-523`, `524-553`, `554-583`, `584-613`, `614-643`, and `644-649`

The source of truth is `src/config/data-scope.ts`, which currently sets
`CURRENT_DATA_MAX_DEX = 649`, together with the contiguous definitions in `src/config/batch-registry.ts`.

These generations are represented as `PokemonForm × BattleVariant` records with release state,
category evidence, retention decisions, review output, static JSON, and Excel artifacts. The current
release contract expects 3,105 BattleVariants, 409 presentation families, 13 IV recommendations, and
598 `TRUE_DATA_PENDING` evaluations; `site-data/manifest.json` records the exact snapshot counts,
source-database bytes and SHA-256, runtime JSON hashes, and Excel artifact hash.

Gen 5 history notes under `research_notes/history/` remain useful as research context and audit evidence,
but their formal runtime records now come from the Gen 5 import, review, and snapshot pipeline.

## Research-audited presentation notes

Generations 6–9 have been audited as bag-cleanup presentation notes and are stored under
`research_notes/history/`:

- Gen 6 / Kalos: #650–#721
- Gen 7 / Alola: #722–#809
- Gen 8 / Galar + Hisui: #810–#905
- Gen 9 / Paldea: #906–#1025

These notes were checked against the repository's fixed 2026-09-01 PvPoke snapshot and standardized to
the accepted Open PvP buckets:

- Top 100: priority keep
- 101–250: selective keep
- >250 / unranked: no standalone Open PvP keep reason

They also retain independent PvE, Max, evolution, legendary, and special-form reasons where recorded.

## Important boundary

The Gen 6–9 notes are **not yet equivalent to the formal Gen 1–5 runtime model**.

A full Gen 1–9 publication is complete only when:

1. `CURRENT_DATA_MAX_DEX` reaches #1025.
2. `BATCH_REGISTRY` is contiguous through #1025.
3. Gen 6–9 are imported as exact BattleVariants rather than only species-level presentation rows.
4. Release state, PvP, PvE, Shadow, Mega/Primal, Max, evolution, and special-form evidence are stored
   with the same provenance model used for Gen 1–5.
5. The release snapshot, runtime JSON, review checkpoints, and Excel artifact are regenerated through
   #1025.
6. Clean rebuild, historical-integrity, lint, typecheck, tests, Pages build, and artifact verification
   are all green on that final release.

## QA guardrail

`tests/generation-audit-coverage.test.ts` verifies that the Gen 5–9 research notes:

- cover their full National Dex ranges exactly once,
- have matching summary counts,
- use the accepted 101–250 conditional PvP bucket,
- keep form-isolation wording and cross-form evidence boundaries explicit,
- do not mark any displayed Open rank ≤250 as ordinary duplicate transfer.

The test keeps the historical notes internally consistent; it does not promote Gen 6–9 into formal
runtime publication.
