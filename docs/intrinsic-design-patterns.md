# Intrinsic Design Patterns

Reusable mechanics that pass both tests. Apply these when redesigning games.

## Pattern 1: "Keep the Scale Level" (Algebraic Manipulation)
**Used for:** Equation solving, inverse operations

The scale starts BALANCED with an unknown. Player's only tools are buttons that apply the same operation to BOTH sides. Player cannot win by computing the answer — they must physically isolate the unknown by applying operations.

**Example:** mystery-side v2. x + p = q. Remove N from both sides until only x remains.

**Key property:** The action (symmetric operation) IS the math concept (equation invariance).

## Pattern 2: "The Emergent Center" (Statistics)
**Used for:** Mean, median, mode, center of data

Player places weighted data points on a physical structure (seesaw, number line, stack). The center (balance point, middle, peak) EMERGES from the placement. Player doesn't compute — they observe.

**Example:** find-the-stat redesign: drag data points as weighted dots onto a seesaw. The seesaw automatically tips to its balance point — THAT'S the mean.

**Key property:** Physics computes the statistic; player discovers it by watching.

## Pattern 3: "Mass Trial" (Probability)
**Used for:** Likelihood, distributions, law of large numbers

Player sets up an experiment then runs it MANY times (automated, fast). Distribution emerges visually from repeated trials. Player observes actual probability, doesn't predict.

**Example:** bet-the-spinner redesign: spinner is shown, player clicks "spin 100x". Bars fill up showing outcome counts. Distribution emerges.

**Key property:** The repeated action reveals the probability — no prediction required.

## Pattern 4: "Physical Invariant" (Rounding, Comparison)
**Used for:** Rounding, comparing magnitudes

Number (or object) is placed on a physical structure with zones or attractors. Physics pulls it to its "home" zone. Player observes which zone it lands in.

**Example:** price-is-right redesign: number sits on a slope between tick marks (40 and 50). Gravity pulls it to the closer mark. Player places the number, physics does the rounding.

**Key property:** Physics solves the problem; player learns by watching the attractor work.

## Pattern 5: "Reveal Through Manipulation" (Measurement, Area, Volume)
**Used for:** Measurement, counting through structure

Player manipulates physical objects (tiles, rods, bars) to FILL a target space. The filling reveals the measurement.

**Example:** cut-the-bar (already intrinsic): click segments to shade N out of D. The shading IS the fraction.

**Key property:** The act of filling/arranging IS the mathematical construction.

## Pattern 6: "Discovery Through Experimentation" (Patterns, Rules)
**Used for:** Finding patterns, understanding rules

Player has a "mystery machine" with a hidden rule. Feed in inputs, see outputs. After several trials, predict the next output BEFORE running the machine.

**Example:** pattern-machine redesign: number goes in, transformed number comes out. Rule is hidden (e.g., ×2+1). Player experiments to find the rule, then predicts.

**Key property:** Discovery through systematic trials. The experiment IS the learning.

## Pattern 7: "Matching Structure" (Factoring, Composition)
**Used for:** Factoring, decomposing, building up

Player performs a physical operation that mirrors the math: cutting a number into factors, composing pieces into wholes.

**Example:** factor-finder redesign: drag a split line through a number-rectangle. The line cuts it into factor-rectangles. Keep cutting until all leaves are prime (they turn green).

**Key property:** The cutting IS the factoring.

## Pattern 8: "Physical Inverse Operation"
**Used for:** Division, subtraction, inverse operations

Player performs the operation physically: sharing, removing, separating. The result of the operation is visible.

**Example:** share-the-pizza redesign (if not already intrinsic): Automatic dealing — the dealing IS division.

**Key property:** The physical sharing IS the mathematical operation.

## Pattern 9: "Order Emerges from Connection" (Sequencing, Proofs, Logic)
**Used for:** Proofs, logical chains, ordering

Cards/steps have visible INPUTS and OUTPUTS. To connect two in sequence, the OUTPUT of one must match the INPUT of the next. The chain only works if the logic flows.

**Example:** proof-stepper redesign: each proof card shows what it assumes and what it proves. Connections form when input matches output.

**Key property:** Logical flow is enforced by the matching mechanic.

## Pattern 10: "Self-Revealing Classification"
**Used for:** Rational/irrational, prime/composite, properties of numbers

Classification is revealed by PHYSICAL BEHAVIOR rather than by the player selecting a bin.

**Example:** number-classifier redesign: drop a number onto a number line. Rationals SNAP to exact positions. Irrationals shimmer and won't snap because they don't fit cleanly. The physics teaches the distinction.

**Key property:** The number's behavior teaches its nature.

---

## When NO intrinsic pattern fits

Some standards are inherently recall/recognition:
- "Is 17 prime?"
- "What is 8 × 7?"
- "What time does the clock show?"

For these, BE HONEST. They're not learning games — they're fluency drills. Move to **Practice-only** status:
- Flag `practiceOnly: true` in the game option registry
- Only accessible AFTER the learner demonstrates the concept through a truly intrinsic game
- Classic arcade overlays (Snake, Pac-Man, etc.) are the natural home for these

---

## Required Elements in Every Intrinsic Rebuild

1. **Equation/concept display** at top showing what's being solved
2. **Physical state visualization** (scale, number line, area, etc.)
3. **Constrained player tools** — only actions that enforce the mathematical invariant
4. **Live equation/state update** as player acts (CPA abstract stage alongside concrete)
5. **Solution reveal card** when solved — shows the full mathematical reasoning step-by-step
6. **"Got it! Next round" button** — learner controls pacing, not auto-advance
7. **Round variation** — fallback patterns if AI rounds aren't available

See `mystery-side` in `balance-systems-phaser.ts` for the reference implementation.
