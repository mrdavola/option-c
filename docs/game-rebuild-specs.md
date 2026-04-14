# Game Rebuild Specs — Working Document

**Started:** April 13, 2026 — overnight session
**Goal:** Re-audit all 87 game options, rebuild any that fail Mr. Chesure's 2 tests.

## The Two Tests (Both Required)

1. **Discovery:** A learner who doesn't know the math can LEARN the concept by playing. The game teaches through its own mechanics, not pre-instruction.
2. **Self-Revealing Truth:** Correctness is shown by the physics/behavior of the game world — not a "correct/wrong" popup judgment.

**Key question for every game:** Does the player DISCOVER the answer through the interaction, or already know it and just deliver it through a fancy input?

## Status Tracker

| # | Engine | Option | Previous | Re-audit | Action | Status |
|---|---|---|---|---|---|---|
| — | TBD | TBD | TBD | TBD | TBD | Starting |

*(This document is updated as work progresses.)*

## Phase 2 decisions (April 14)

**Hardcoded rounds:** 5 per standard, always the same (for speed). 466 × 5 = 2,330 rounds to write. Known trade-off: repeat plays see same numbers. Acceptable for now.

**Round difficulty:** Still apply basic → intermediate → advanced progression across the 5 rounds (e.g., round 1 = basic, round 2 = basic, round 3 = intermediate, round 4 = intermediate, round 5 = advanced).

**Storage:** `src/lib/standard-rounds.ts` with `{standardId: [5 rounds]}` structure.

**Round schema per entry:**
```ts
{
  prompt: string      // brief instruction
  target: number      // correct answer
  items?: number[]    // value choices / distractors (engine-dependent)
  hint?: string       // optional concept reminder
}
```

