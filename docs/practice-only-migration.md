# Practice-Only Migration

Quiz-wrapper games are fluency drills — they don't teach concepts, they rehearse them after mastery. Marking them `practiceOnly: true` keeps them out of the default "learn it" path and makes them optional post-mastery reps.

## Options now marked `practiceOnly: true`

### Bidding-auction (3)
- `auction-house`
- `price-is-right`
- `round-and-win`

### Classic overlays (6)
- `snake-math`
- `maze-runner-math`
- `falling-blocks-math`
- `dot-eater-math`
- `launcher-math`
- `breakout-math`

(All 9 already carried the flag in `src/lib/game-engines/game-option-registry.ts`; their `helpText` was already normalized to: "Practice mode — unlocks after you've mastered this concept through another game.")

## Standard mappings reordered

None. Every standard that already blends practice-only options with intrinsic options lists the intrinsic options first. Verified standards (practice-only options already last):

- `5.NF.A.2` — `["cut-the-bar", "pour-the-liquid", "auction-house"]`
- `7.EE.B.3` — `["free-collect", "recipe-mixer", "auction-house"]`
- `8.NS.A.2` — `["number-line-drop", "sorting-lane", "auction-house"]`
- `8.EE.A.3` — `["investment-sim", "population-boom", "auction-house"]`
- `N-Q.A.2` — `["recipe-scaler", "auction-house"]`
- `N-Q.A.3` — `["ruler-race", "auction-house", "round-and-win"]`
- `S-MD.B.5a` — `["bet-the-spinner", "auction-house"]`
- `S-MD.B.5b` — `["bet-the-spinner", "auction-house", "investment-sim"]`

## Gaps — standards with ONLY practice-only options

These standards have no intrinsic option. Students hitting them today would be dropped straight into a fluency drill for a concept they haven't learned yet. Intrinsic redesign needed:

- `3.NBT.A.1` (Round to nearest 10 or 100) — `["round-and-win", "auction-house"]`
- `4.NBT.A.1` (Digit = 10x place to right) — `["auction-house", "round-and-win"]`
- `4.NBT.A.3` (Round multi-digit numbers) — `["round-and-win", "auction-house", "price-is-right"]`
- `5.NBT.A.1` (Digit = 10x right, 1/10 left) — `["auction-house", "round-and-win"]`
- `5.NBT.A.4` (Round decimals to any place) — `["round-and-win", "auction-house"]`

All five cluster on **rounding / place-value understanding**. They need an intrinsic option (e.g., a number-line zoom-and-snap, or a place-value-chart builder) before the practice drills make sense.

## TypeScript

No code changes required — existing flags and helpText already match the target state. Compilation unaffected.
