# Audit Group C — Deep Findings

**Engines audited:** build-structure, montessori, singapore-cpa, standard-pedagogy, measurement-time, middle-school-gaps, classic-overlays, race-calculate

## KEY DISCOVERY: "The Fatal 2-Phase Problem"

Many games that LOOK intrinsic have a fatal structure:
- **Phase 1:** Intrinsic manipulation (bundling beads, shading wedges, placing discs) ✓
- **Phase 2:** Type an answer OR click "Check" ✗

This breaks intrinsicness because the player must translate from **game world representation** back to **symbolic notation**. This requires prior knowledge — it's not discovered.

Example: In golden-beads, clicking 23 beads reveals "2 ten-bars, 3 units." But the player must already KNOW that "2 ten-bars + 3 units = 23." The typed answer phase assumes prior knowledge.

**Fix pattern:** Remove typed-answer/Check phases. Let the final representation auto-generate from manipulation. The game world reveals the answer.

## Classifications

### TRULY INTRINSIC (3)
- `fraction-circles` — Shading wedges IS fractional representation
- `factor-finder` — Tree-building IS factorization
- `race-calculate` (default/launch-to-target) — Projectile landing IS the truth

### PARTIALLY INTRINSIC (fixable with Check button removal)
- `golden-beads` — Bundling is intrinsic, typed answer breaks it
- `stamp-game` — Clicking stamps reveals composition, external Check breaks it
- `checkerboard-multiply` — Grid-filling IS multiplication, typed answer breaks it
- `bead-chain` — Color-coded chain + live count is intrinsic, typed answer breaks it
- `place-value-discs` — Columns + discs work, Verify button breaks it
- `cuisenaire-rods` — Physical matching works, Verify button breaks it
- `expression-transformer` — Cancellation is intrinsic, typed answer breaks it

### FAKE INTRINSIC (needs rebuild)
- `shape-matcher` — Graphics decorative, actual gameplay is counter-matching
- `free-build` — Running total turns colors (UI judgment, not discovery)
- `shape-decomposer` — L-shape is scenery, math is calculation-checking
- `category-sort` — Looks interactive, is menu-classification
- `number-classifier` — Similar pattern to category-sort

### QUIZ-WRAPPER (rebuild or move to practice)
- `hundred-board` — "Find N on the grid" is recognition, not discovery
- `bar-model` — Diagram is pre-drawn, player just solves
- `number-bonds` — Diagram is given, player types missing
- `measure-and-plot` — Place-point-and-check
- `clock-reader` — Read and type
- `time-matcher` — Multiple choice
- `time-elapsed` — Read two clocks, type answer
- `inequality-grapher` — Menu selection
- `signed-divide` — Select sign, type magnitude
- `fraction-to-decimal` — Type decimal answer
- `sci-notation` — Type coefficient and exponent
- `proof-stepper` — Select justification from dropdown
- `speed-trap` (race-calculate variant) — Type speed
- `catch-up` (race-calculate variant) — Type speed

### PRACTICE-ONLY (by design)
- All 6 classic-overlays games (snake-math, maze-runner-math, falling-blocks-math, dot-eater-math, launcher-math, breakout-math)

## Fix priorities from Group C

**Quick wins (remove Check buttons, auto-generate answers):**
- golden-beads: drag bundles to place-value columns; number auto-displays
- stamp-game: drag stamps to labeled mat; total auto-calculates
- checkerboard-multiply: grid fullness auto-shows product
- bead-chain: drag chain to target zone slider
- place-value-discs: remove Verify; physical snap when correct
- cuisenaire-rods: remove Verify; snap/lock on correct alignment
- expression-transformer: cancellation auto-shows simplified form

**Major rebuilds:**
- All 3 build-structure games
- bar-model: player builds bars from rods
- inequality-grapher: interactive shading discovery
- signed-divide: physical sign + magnitude manipulation
- fraction-to-decimal: dual number line
- sci-notation: decimal slider
- proof-stepper: input/output matching cards

**Move to Practice-only:**
- hundred-board → practice grid matching after learning place value elsewhere
- time-matcher → practice after learning clock
- time-elapsed → practice after learning elapsed time intrinsically
- speed-trap, catch-up → practice variants of race-calculate

## Redesign proposals (select — full list in rebuild specs)

**bar-model:** Player receives word problem + draggable colored rods of various lengths. Must physically arrange rods end-to-end to match scenario. Total length auto-reads off a measurement track below.

**clock-reader (keep as learning game):** Player can rotate hands manually. Live digital display updates as hands move. Target time shown as digital. Player rotates until digital displays match.

**inequality-grapher:** Player drags a circle onto the number line, then drags an arrow/shading from the circle. As they shade, the game tests whether shaded region satisfies the inequality. Visual glow spreads if correct.

**proof-stepper:** Each proof card shows INPUT (assumed) and OUTPUT (derived). Player physically connects cards — connection only forms if output of one matches input of next.

---

## Full detail
Summary table compiled. Individual game entries preserved in audit memory.
