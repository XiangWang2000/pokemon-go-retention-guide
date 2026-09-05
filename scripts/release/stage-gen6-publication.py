from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    target = Path(path)
    text = target.read_text(encoding="utf-8")
    if old not in text:
        raise SystemExit(f"marker not found in {path}: {old[:100]!r}")
    target.write_text(text.replace(old, new, 1), encoding="utf-8")


# Publish the three validated Gen6 batches.
registry_path = Path("src/config/batch-registry.ts")
registry = registry_path.read_text(encoding="utf-8")
anchor = '  published("644-649", 5, "gen5", "post-recompute", "scripts/data/import-gen5.ts", "scripts/review/generate-review-gen5.ts"),\n'
gen6_entries = (
    '  published("650-679", 6, "gen6", "post-recompute", "scripts/data/import-gen6.ts", "scripts/review/generate-review-gen6.ts"),\n'
    '  published("680-709", 6, "gen6", "post-recompute", "scripts/data/import-gen6.ts", "scripts/review/generate-review-gen6.ts"),\n'
    '  published("710-721", 6, "gen6", "post-recompute", "scripts/data/import-gen6.ts", "scripts/review/generate-review-gen6.ts"),\n'
)
if 'published("650-679", 6, "gen6"' not in registry:
    if anchor not in registry:
        raise SystemExit("Gen5 registry tail anchor not found")
    registry = registry.replace(anchor, anchor + gen6_entries, 1)
registry_path.write_text(registry, encoding="utf-8")

replace_once("src/config/data-scope.ts", "CURRENT_DATA_MAX_DEX = 649", "CURRENT_DATA_MAX_DEX = 721")

candidate_path = Path("src/config/candidate-batch-registry.ts")
candidate = candidate_path.read_text(encoding="utf-8")
start = candidate.index("export const CANDIDATE_BATCH_REGISTRY = [")
end_marker = "] as const satisfies readonly CandidateBatchRegistryEntry[];"
end = candidate.index(end_marker, start) + len(end_marker)
replacement = "export const CANDIDATE_BATCH_REGISTRY: readonly CandidateBatchRegistryEntry[] = [];"
candidate_path.write_text(candidate[:start] + replacement + candidate[end:], encoding="utf-8")

Path("src/config/release.ts").write_text(
    'export const DATA_VERSION = "2026.09.06-r33";\n'
    'export const DATA_VERSION_DATE_ZH_TW = "2026/09/06";\n'
    'export const DATA_VERSION_DATE_ISO = "2026-09-06";\n',
    encoding="utf-8",
)
replace_once("src/config/release-contract.ts", "battleVariants: 3105", "battleVariants: 3757")
replace_once("src/config/release-contract.ts", "families: 409", "families: 487")

replace_once(
    "tests/gen6-candidate-650-679.test.ts",
    '''  it("stages immediately after the formal #649 release without expanding production", () => {\n    expect(CURRENT_DATA_MAX_DEX).toBe(649);\n    expect(BATCH_REGISTRY.at(-1)?.maxDex).toBe(649);\n    expect(CANDIDATE_BATCH_REGISTRY.find((entry) => entry.key === "650-679")).toMatchObject({\n      minDex: 650,\n      maxDex: 679,\n      generation: 6,\n      stage: "EVIDENCE",\n    });\n    expect(() => assertCandidateBatchRegistry()).not.toThrow();\n  });''',
    '''  it("is formally published through #721 with no Gen6 candidate remaining", () => {\n    expect(CURRENT_DATA_MAX_DEX).toBe(721);\n    expect(BATCH_REGISTRY.at(-1)?.maxDex).toBe(721);\n    expect(CANDIDATE_BATCH_REGISTRY.some((entry) => entry.generation === 6)).toBe(false);\n    expect(() => assertCandidateBatchRegistry()).not.toThrow();\n  });''',
)
replace_once(
    "tests/gen6-candidate-680-709.test.ts",
    '''  it("continues Gen6 candidate staging while formal publication remains #649", () => {\n    expect(CURRENT_DATA_MAX_DEX).toBe(649);\n    expect(() => assertCandidateBatchRegistry()).not.toThrow();\n    expect(CANDIDATE_BATCH_REGISTRY.find((entry) => entry.key === "680-709")).toMatchObject({\n      minDex: 680,\n      maxDex: 709,\n      generation: 6,\n      stage: "EVIDENCE",\n    });\n  });''',
    '''  it("is formally published with the Gen6 candidate registry cleared", () => {\n    expect(CURRENT_DATA_MAX_DEX).toBe(721);\n    expect(() => assertCandidateBatchRegistry()).not.toThrow();\n    expect(CANDIDATE_BATCH_REGISTRY.some((entry) => entry.generation === 6)).toBe(false);\n  });''',
)
replace_once(
    "tests/gen6-candidate-710-721.test.ts",
    '''  it("completes Gen6 identity staging without expanding formal publication", () => {\n    expect(CURRENT_DATA_MAX_DEX).toBe(649);\n    expect(() => assertCandidateBatchRegistry()).not.toThrow();\n    expect(CANDIDATE_BATCH_REGISTRY.find((entry) => entry.key === "710-721")).toMatchObject({\n      minDex: 710,\n      maxDex: 721,\n      generation: 6,\n      stage: "EVIDENCE",\n    });\n  });''',
    '''  it("completes formal Gen6 publication through #721", () => {\n    expect(CURRENT_DATA_MAX_DEX).toBe(721);\n    expect(() => assertCandidateBatchRegistry()).not.toThrow();\n    expect(CANDIDATE_BATCH_REGISTRY.some((entry) => entry.generation === 6)).toBe(false);\n  });''',
)
replace_once(
    "tests/gen6-pve-max-evidence.test.ts",
    '''  it("keeps production scope at published Gen5 while Gen6 is still candidate evidence", () => {\n    expect(CURRENT_DATA_MAX_DEX).toBe(649);\n    expect(BATCH_REGISTRY.at(-1)?.maxDex).toBe(649);\n  });''',
    '''  it("keeps PvE and Max evidence aligned with the formal Gen6 publication scope", () => {\n    expect(CURRENT_DATA_MAX_DEX).toBe(721);\n    expect(BATCH_REGISTRY.at(-1)?.maxDex).toBe(721);\n  });''',
)
replace_once(
    "tests/gen6-pvp-evidence.test.ts",
    '''  it("advances all Gen6 candidate slices to evidence while production is still #649", () => {\n    expect(CANDIDATE_BATCH_REGISTRY.filter((entry) => entry.generation === 6)).toHaveLength(3);\n    expect(CANDIDATE_BATCH_REGISTRY.filter((entry) => entry.generation === 6).every((entry) => entry.stage === "EVIDENCE")).toBe(true);\n  });''',
    '''  it("retains pinned Gen6 PvP evidence after the candidate registry is cleared for publication", () => {\n    expect(CANDIDATE_BATCH_REGISTRY.filter((entry) => entry.generation === 6)).toHaveLength(0);\n  });''',
)
replace_once(
    "tests/generation-audit-coverage.test.ts",
    '''  it("keeps Gen6-9 research notes distinct after Gen5 publication", () => {\n    // Gen5 is now formally published through #649; later-generation audit notes remain\n    // research-only and must not be mistaken for additional runtime publication.\n    expect(CURRENT_DATA_MAX_DEX).toBe(649);\n  });''',
    '''  it("keeps Gen7-9 research notes distinct after Gen6 publication", () => {\n    // Gen5 and Gen6 are formally published through #721; later-generation audit notes remain\n    // research-only and must not be mistaken for additional runtime publication.\n    expect(CURRENT_DATA_MAX_DEX).toBe(721);\n  });''',
)

static_path = Path("tests/static-snapshot.test.ts")
static = static_path.read_text(encoding="utf-8")
for old, new in {
    "pokemonSpecies: 658": "pokemonSpecies: 729",
    "pokemonForms: 766": "pokemonForms: 927",
    "rawEvaluationData: 1995": "rawEvaluationData: 2239",
    "sourceReferences: 308": "sourceReferences: 348",
    "retentionEvaluations: 3270": "retentionEvaluations: 3922",
    "categoryEvaluations: 21735": "categoryEvaluations: 26299",
}.items():
    if old not in static:
        raise SystemExit(f"static snapshot marker not found: {old}")
    static = static.replace(old, new, 1)
static_path.write_text(static, encoding="utf-8")

Path("docs/data-coverage.md").write_text(
    """# Data coverage and audit status

This document distinguishes **formal published runtime coverage** from **research-only generation audit notes**.

## Formal published runtime data

The GitHub Pages runtime, release snapshot, Excel export, batch registry, and release contract publish:

- National Dex **#001–#721**
- Generations **1–6**

The source of truth is `src/config/data-scope.ts`, which sets `CURRENT_DATA_MAX_DEX = 721`.

Generations 1–6 are represented as exact `PokemonForm × BattleVariant` records with release state,
category evidence, retention decisions, review output, static JSON, and Excel artifacts. Gen5 and Gen6
historical research notes remain under `research_notes/history/` as audit references, but their runtime
coverage is now formal rather than research-only.

## Research-audited presentation notes

The remaining unpublished generations are still research-only audit notes:

- Gen 7 / Alola: #722–#809
- Gen 8 / Galar + Hisui: #810–#905
- Gen 9 / Paldea: #906–#1025

The retained Gen5–Gen9 research guides were checked against the repository's fixed 2026-09-01 PvPoke
snapshot and preserve explicit form isolation so alternate, regional, battle, or Gigantamax value cannot
silently flow into another exact identity.

## Important boundary

Gen7–Gen9 research notes are **not yet equivalent to the formal Gen1–Gen6 runtime model**. They do not
populate the published `BattleVariant` database, `site-data`, runtime JSON, or Excel release artifact.

A full Gen1–Gen9 publication is complete only when:

1. `CURRENT_DATA_MAX_DEX` reaches #1025.
2. `BATCH_REGISTRY` is contiguous through #1025.
3. Gen7–Gen9 are imported as exact BattleVariants rather than only species-level presentation rows.
4. Release state, PvP, PvE, Shadow, Mega/Primal, Max, evolution, and special-form evidence use the same provenance model as the published generations.
5. The release snapshot, runtime JSON, review checkpoints, and Excel artifact are regenerated through #1025.
6. Clean rebuild, historical integrity, lint, typecheck, tests, Pages build, artifact verification, and deployed smoke are all green.

## QA guardrail

`tests/generation-audit-coverage.test.ts` verifies that the retained Gen5–Gen9 research notes cover their
full National Dex ranges exactly once, have matching summary counts, preserve the accepted 101–250
conditional PvP bucket, and do not mark a displayed Open rank <=250 as an ordinary duplicate transfer.
""",
    encoding="utf-8",
)
