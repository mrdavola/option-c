# The Janitor — Codebase Health Review

**Date:** April 15, 2026
**Scope:** Full audit of `src/`, `docs/`, `package.json`

---

## A. What Went Wrong (Code Health Perspective)

### 1. The 87-game bulk build left massive debris

The April 13-14 overnight rebuild produced 51 game engine files in `src/lib/game-engines/`. The project then pivoted to "one moon at a time" with plain HTML/CSS/JS (no Phaser). Result: **27,168 lines of legacy Phaser engine code** sitting in the codebase alongside the one verified engine (`number-frames.ts`, 516 lines). The old engines are registered in `index.ts` and `game-option-registry.ts` but only 2 standards actually map to verified games.

**Pattern of mess:** Build fast, pivot hard, leave the old code in place. This happened at least twice (old non-Phaser engines, then Phaser engines, now plain HTML).

### 2. Three generations of engine architecture coexist

| Generation | Files | Template | Status |
|---|---|---|---|
| Gen 1: Non-Phaser | 19 files (`balance-equalize.ts`, `collect-manage.ts`, etc.) | `base-template.ts` | **18 of 19 orphaned** — not imported in `index.ts`. Only `race-calculate.ts` is registered. |
| Gen 2: Phaser | 25 files (`*-phaser.ts`) | `base-phaser-template.ts` | Registered in `index.ts` but unmapped to verified standards. |
| Gen 3: Plain HTML | 1 file (`number-frames.ts`) | None (self-contained) | **The current approach.** Only verified engine. |

The 18 Gen-1 orphans (`balance-equalize.ts`, `bid-estimate.ts`, `build-measure.ts`, `build-structure.ts`, `collect-manage.ts`, `craft-combine.ts`, `fit-rotate.ts`, `grow-compound.ts`, `measure-compare.ts`, `navigate-optimize.ts`, `pattern-repeat.ts`, `plot-explore.ts`, `rise-fall.ts`, `roll-predict.ts`, `scale-transform.ts`, `score-rank.ts`, `solve-eliminate.ts`, `split-share.ts`) are imported by **nothing**. They exist only as dead weight.

### 3. Data files ballooned before verification

- `standard-rounds.ts` — **3,115 lines** of hardcoded round data for ~255 K-5 standards. Only K.OA.A.1 is verified.
- `standard-real-world-uses.ts` — **2,186 lines** for all 466 standards. Only K.OA.A.1 is verified.
- `game-option-registry.ts` — **808 lines** defining 65 game options. Only `number-frames` is verified.
- `mechanic-animations.tsx` — **1,245 lines** of stickman SVG animations for 24 mechanics.

These were built for the "coverage first" phase. Now they're cargo: present in the build, referenced by the UI, but pedagogically unverified.

### 4. Naming inconsistency: "student" vs "learner"

The project renamed "student" to "learner" but traces remain:
- `src/app/student/page.tsx` — redirect stub (functional but legacy)
- `src/components/student-nav.tsx` — **orphaned**, imported by nothing
- `src/lib/feedback-types.ts` — uses `"student"` in type unions
- `src/app/api/game/design-doc/route.ts` — AI prompt says "student"

### 5. Unused npm dependencies

| Package | Evidence |
|---|---|
| `graphology` | Zero imports in `src/` |
| `graphology-layout-forceatlas2` | Zero imports in `src/` |
| `sigma` | Zero imports in `src/` |
| `@sigma/edge-curve` | Zero imports in `src/` |

These four were likely from an earlier graph implementation before `react-force-graph-3d` was adopted. They add to install size for zero benefit.

### 6. What should have been cleaned earlier

- The Gen-1 engine files should have been archived when Gen-2 (Phaser) was built.
- The `standard-game-options.ts` bulk mappings (464 unverified entries) were correctly cleaned on April 16. This kind of cleanup should have happened when the pivot to "one moon at a time" was decided — not weeks later.
- The `student` -> `learner` rename should have been a single find-and-replace session, not left half-done.

---

## B. What COULD Still Go Wrong

### P1 — High Risk

**1. Legacy Phaser engines still registered in `index.ts` and callable.**
The 25 Phaser engines + `race-calculate` are all in `ENGINE_REGISTRY`. If any code path calls `generateWithEngine("balance-systems", ...)`, it will produce a Phaser game that has NOT been verified against Mr. Chesure's tests. The `game-option-registry.ts` still advertises 65 options to the Circuit Board Builder UI. A learner could theoretically select an unverified game option.

**Risk:** A learner plays an unverified game that teaches wrong math. This is the exact failure mode the project pivoted away from.

**2. `standard-rounds.ts` has 3,115 lines of unverified round data.**
Only K.OA.A.1 rounds are confirmed correct. The remaining ~250 standards' rounds were AI-generated and never human-checked. If any code path serves these rounds to a game, the math could be wrong (Failure 3 from history).

**3. API routes that call AI are still live.**
- `/api/game/generate` — generates themed games with AI
- `/api/game/generate-engine` — called from `mechanic-skeleton.tsx`, `standard-panel.tsx`, `build-screen.tsx`
- `/api/game/chat` — called from `workshop.tsx`
- `/api/game/design-doc` — called from `circuit-board-builder.tsx`, `template-chat.tsx`
- `/api/game/visual-concept` — called from `build-screen.tsx`

These endpoints are actively referenced by frontend components. If a learner reaches the old build flow, AI will generate unverified content. Cost risk too (Haiku calls per interaction).

### P2 — Medium Risk

**4. `knowledge-graph.tsx` is orphaned but still in the build.**
Uses `sigma` and `graphology` (which are in `package.json`). Not imported by any component. Dead code that references unused dependencies.

**5. `character-phaser.ts` (375 lines) — orphaned.**
Imported by nothing. Was the Phaser-specific character rendering. Superseded by `character-svg.ts` (which IS used by `character-creator.tsx`).

**6. Confusion between `standard-real-world-uses.ts` (2,186 lines) and `standard-scenarios.ts` (98 lines).**
Both provide "real world" context for standards. `standard-scenarios.ts` is used by 3 components. `standard-real-world-uses.ts` is used only by the `/api/game/real-world-uses` route, which is itself only referenced by `mechanic-skeleton.tsx`. Overlapping purpose, split audiences.

### P3 — Lower Risk (Confusion / Maintenance)

**7. Docs directory has 20+ files from the pre-pivot era.**
`audit-consolidated.md`, `audit-group-B.md`, `audit-group-C.md`, `game-rebuild-specs.md`, `intrinsic-audit-strict.md`, `rebuild-morning-status.md`, `rebuild-template.md`, `practice-only-migration.md`, `soso-review-table.html`, etc. These document the 87-game approach that was abandoned. Future agents may read these and get confused about the current direction.

**8. `kid-friendly-labels.ts` (40 lines) and `simple-backgrounds.ts` (58 lines) — orphaned.**
Neither is imported by any file in `src/`.

**9. `stickman-poses.ts` (401 lines) — orphaned.**
In `game-engines/` directory but not imported by any file.

**10. Admin page is 1,596 lines.**
Single-file admin dashboard. Should be split but is functional.

---

## C. Suggestions for Fixes

### P1 — Do Now (safe, no discussion needed)

| # | Action | Files | Evidence |
|---|---|---|---|
| 1 | **Delete `student-nav.tsx`** | `src/components/student-nav.tsx` | Zero imports anywhere. Fully orphaned. |
| 2 | **Delete `kid-friendly-labels.ts`** | `src/lib/kid-friendly-labels.ts` | Zero imports anywhere. 40 lines. |
| 3 | **Delete `simple-backgrounds.ts`** | `src/lib/simple-backgrounds.ts` | Zero imports anywhere. 58 lines. |
| 4 | **Delete `character-phaser.ts`** | `src/lib/character-phaser.ts` | Zero imports anywhere. 375 lines. Superseded by `character-svg.ts`. |
| 5 | **Delete `stickman-poses.ts`** | `src/lib/game-engines/stickman-poses.ts` | Zero imports anywhere. 401 lines. |
| 6 | **Delete `knowledge-graph.tsx`** | `src/components/graph/knowledge-graph.tsx` | Zero imports anywhere. Old sigma-based graph. |
| 7 | **Remove unused npm packages** | `package.json` | `graphology`, `graphology-layout-forceatlas2`, `sigma`, `@sigma/edge-curve` — zero imports in src. |
| 8 | **Rename "student" to "learner" in `feedback-types.ts`** | `src/lib/feedback-types.ts` | Type union uses `"student"` — should be `"learner"`. |

**Total dead code removal: ~1,275 lines + 4 npm packages.**

### P2 — Do Soon (safe but larger scope)

| # | Action | Files | Impact |
|---|---|---|---|
| 9 | **Archive 18 Gen-1 orphan engine files** | 18 files in `src/lib/game-engines/` | ~7,500 lines. None imported by anything. Move to `src/lib/game-engines/_archived/` or delete. Also archive `base-template.ts` (only used by these 18). |
| 10 | **Gate the Circuit Board Builder** | `game-option-registry.ts` + builder UI | The registry advertises 65 game options. Only `number-frames` is verified. The builder should only show verified options (those in `standard-game-options.ts`). |
| 11 | **Add "unverified" guard to `generateWithEngine()`** | `src/lib/game-engines/index.ts` | Before returning engine output, check if the requested mechanic has any verified standard mappings. Log a warning or return null for unverified engines. |

### P3 — Discuss First (needs Barbara's input)

| # | Action | Why discuss |
|---|---|---|
| 12 | **Archive or clearly mark legacy Phaser engines** | 25 Phaser engines (26,652 lines) are registered but unverified. Barbara may want to reference them when building new verified games. Recommend moving to `_legacy/` with a README. |
| 13 | **Archive pre-pivot docs** | 15+ docs from the 87-game era. Valuable history but potentially confusing. `project-history-and-lessons.md` already captures the lessons. Move old docs to `docs/_archive/`. |
| 14 | **Consolidate `standard-real-world-uses.ts` and `standard-scenarios.ts`** | Overlapping purpose. Decide which is the source of truth for "real world context" per standard. |
| 15 | **Split `admin/page.tsx` (1,596 lines)** | Functional but large. Extract sub-tabs into separate components when next touching this file. |
| 16 | **Remove or gate `/api/game/card-enhance` route** | Zero frontend references. Appears fully dead. But confirm no external callers. |
| 17 | **Remove or gate `/api/chat` route** | Zero frontend references from .tsx files. May be called from elsewhere. Confirm before removing. |
| 18 | **Decide on `standard-rounds.ts` (3,115 lines)** | Only K.OA.A.1 rounds are verified. The rest are AI-generated. Options: (a) keep as draft data, clearly marked unverified, (b) strip to verified-only like `standard-game-options.ts` was stripped, (c) move unverified to a separate file. |

---

## D. Ideas for the Dream

> "A platform where learners learn a math concept, build a game that teaches that math concept, and play other learners' games to solidify that concept."

### Target: 22 verified games + learner-pasted games at scale

#### Architecture Recommendation

**1. Separate verified engines from the legacy bulk.**

```
src/lib/game-engines/
  verified/              <-- Only games that passed the full quality gate
    number-frames.ts     <-- K.OA.A.1, K.OA.A.3
    (future engines)
  legacy/                <-- Old Phaser engines, reference only, NOT in ENGINE_REGISTRY
    balance-systems-phaser.ts
    ...
  engine-types.ts
  index.ts               <-- Only imports from verified/
  game-option-registry.ts <-- Only lists verified options
```

This makes the boundary between "safe to serve" and "reference material" physically visible in the file system.

**2. One engine file, multiple modes via config.**

`number-frames.ts` already supports add mode and decompose mode for different standards. This pattern should be the norm. A single well-tested engine file with mode parameters is far safer than 25 separate files. Target: ~22 engine files, each covering a cluster of related standards.

Suggested engine file structure:
```typescript
// Each verified engine exports:
export interface EngineMode {
  standardId: string       // Which standard this mode serves
  modeName: string         // "add" | "decompose" | "subtract" | etc.
  roundData: RoundData[]   // Hardcoded, verified rounds
  config: ModeConfig       // Number ranges, operation types, frame counts, etc.
}

export function generateGame(mode: EngineMode): string {
  // Returns complete HTML document
}
```

**3. Learner-pasted games need a separate registry.**

Verified games (your 22) and learner-pasted games (unlimited) are fundamentally different:
- Verified: hardcoded rounds, guaranteed pedagogy, served from engine files.
- Pasted: arbitrary HTML, sandboxed iframe, judged by AI + peer review + guide approval.

Keep them in separate data stores and separate UI sections. Never mix a pasted game into the verified game flow. The database schema should have a `source` field: `"verified"` vs `"learner-pasted"`.

**4. The Learning Contract should be machine-readable.**

Currently `docs/contracts/K.OA.A.1.md` is a markdown file. For 466 standards, you will want a structured format (JSON or YAML) that agents can parse and validate against. Fields like `standard_id`, `verified_engine`, `verified_modes`, `round_count`, `approved_date`, `approved_by` would let agents automatically check coverage and freshness.

**5. Scale path for 466 standards:**

```
Phase 1 (now):     K games (4 engines, ~23 standards)
Phase 2:           Grade 1-2 (reuse + extend K engines, ~4-6 new engines)
Phase 3:           Grade 3-5 (fraction/multiplication engines, ~6-8 new)
Phase 4:           Grade 6-8 (algebra/geometry engines, ~4-6 new)
Phase 5:           HS (some standards may be practice-only, ~2-4 new)
```

At each phase, the `standard-game-options.ts` file grows. The `game-option-registry.ts` grows in lockstep. Everything not in these two files is invisible to learners. This is the correct gating mechanism — it just needs to be enforced in the UI too (P2 item #10 above).

**6. Keep the build lightweight.**

Right now, all 51 engine files are in the build even though only 1 is verified. With 22 verified engines, the build is manageable. But the 25+ legacy Phaser engines should be removed from `index.ts` imports to reduce bundle size. Each Phaser engine embeds the entire Phaser CDN URL and generates a full HTML document as a string literal — these are not small.

---

## Summary Metrics

| Metric | Count |
|---|---|
| Total files in `src/` | 189 (.ts/.tsx) |
| Dead files (CERTAIN) | 6 files, ~1,275 lines |
| Dead files (LIKELY) | 18 Gen-1 engines + `base-template.ts`, ~7,900 lines |
| Unused npm packages | 4 packages |
| Legacy-but-registered engines | 25 Phaser + 1 non-Phaser = 26 engines |
| Verified engines | 1 (`number-frames.ts`) |
| Files over 1,000 lines | 8 files |
| Files over 500 lines | 20 files |
| Unverified data lines | ~5,300 (rounds + real-world-uses) |

**Bottom line:** The codebase is carrying roughly 35,000 lines of legacy engine code from two previous generations, plus 5,300 lines of unverified data. The verified, working code (number-frames + supporting infrastructure) is clean and well-structured. The priority is creating a clear boundary between verified and legacy, then gradually removing legacy as verified replacements are built.
