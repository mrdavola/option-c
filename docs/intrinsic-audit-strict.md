# Intrinsic Audit — Strict Edition (April 13, night)

## The Question We Asked

For every game option, we applied the strictest possible pedagogical test:

> **Does the PLAYER'S ACTION map to the MATHEMATICAL OPERATION of the standard?**

Not "does it look interactive?" Not "does it involve dragging?" Not "does it have visual feedback?"

**Does what the player DOES with their hands map to the MATH they're supposed to learn?**

## Mr. Chesure's Test, Refined

Previously: "If you can remove the game and the learning doesn't change, the game isn't teaching."

Refined: **"Does the player DISCOVER the answer through the interaction, or do they already know it and just deliver it through a fancy input method?"**

Dragging is not intrinsic. Clicking is not a quiz. The INPUT METHOD is irrelevant. What matters is whether the physical action maps to the mathematical operation.

## Results: Brutal

| Classification | Count | % | Meaning |
|---|---|---|---|
| **TRULY INTRINSIC** | 11 | 13% | Player's action IS the math operation. Manipulation embodies the concept. |
| **FAKE INTRINSIC** | 7 | 8% | Looks physical (drag, click, build) but the action is just counting or selecting. |
| **QUIZ-WRAPPER** | 47 | 54% | Math is text question; game mechanic delivers the answer. |
| **(not yet built)** | — | — | Excluded |

**Only 13% of our games pass the strict intrinsic test.** The "Fake Intrinsic" category is the most dangerous because it creates the illusion of teaching while actually just being a dressed-up quiz.

## The 11 Truly Intrinsic Games (Keep As-Is)

These are the gold standard. The player's physical action IS the mathematical operation:

### Montessori Engine (6/6 intrinsic — strongest engine)
1. **golden-beads** — Clicking beads auto-bundles into ten-bars at 10. The bundling IS place value.
2. **hundred-board** — Placing numbers in spatial positions teaches sequence and pattern.
3. **fraction-circles** — Clicking wedges to shade them IS the fraction representation.
4. **stamp-game** — Clicking colored stamps by place value IS composing numbers.
5. **bead-chain** — Clicking beads to skip count IS multiplication as repeated addition.
6. **checkerboard-multiply** — Filling grid cells IS multiplication as rectangular area.

### Partitioning Engine (2/3 intrinsic)
7. **cut-the-bar** — Clicking segments to shade N out of D IS the fraction.
8. **pour-the-liquid** — Dragging slider to pour liquid to a fraction level IS the proportional quantity.

### Standard Pedagogy Engine (1/4 intrinsic)
9. **expression-transformer** — Clicking opposite-sign tiles to cancel them IS algebraic simplification. (Gold standard — this is how all algebra games should work.)

### Uncertain (need deeper review)
10. **resize-tool** (scaling-resizing) — If slider physically scales an object, intrinsic. Needs code review.
11. **cuisenaire-rods** (singapore-cpa) — If rods visually stack to show additive composition, intrinsic. Needs code review.

## The 7 Fake Intrinsic Games (Most Dangerous)

These LOOK like they teach math through interaction, but the interaction is really just counting or selection dressed up as physical manipulation:

### Balance Systems (3/3 fake intrinsic — entire engine broken)
1. **free-balance** — Drag weights until balanced. Player is SELECTING which weights to put on a pan to reach a number. The scale tilt is nice feedback but the action is "count weights until matches target."
2. **mystery-side** (my v1 prototype) — Drag unit weights onto mystery pan. Player is COUNTING up from p to q. Grade-1 skill, not grade-6 algebra.
3. **chain-scales** — Same problem as free-balance, with more scales.

### Collect & Manage (3/3 fake intrinsic)
4. **free-collect** — Click items to collect; total appears. Player reads number on item, watches sum display update. It's "count on fingers" with a UI. Doesn't teach strategic decomposition or fact fluency.
5. **conveyor-belt** — Same as free-collect but items move. Motion doesn't add math content.
6. **split-the-loot** — Drag items into two bins with different targets. It's multi-part selection with visible numbers.

### Construction Systems (1/3 fake intrinsic — rest need review)
7. **stack-to-target** — Click blocks to stack; height updates. Clicking is toggle-selection. Tower is visual feedback. Player reads numbers and watches sum.

## The 47 Quiz-Wrappers (Reset Expectations)

These never pretended to be intrinsic — they're explicitly "answer a math question through a game mechanic." Includes:
- All 6 classic-overlays (Snake, Pac-Man, etc.) — **acceptable as Rapid Fire Practice** (post-mastery only)
- All 3 bidding-auction options — keypad/multiple choice
- All 3 probability-systems options — click the statistic
- All 3 timing-rhythm options — text input for next number
- All 3 above-below-zero options — buttons for +/- steps
- Many others — see full audit report

## Why This Matters

**Research-backed (Habgood & Ainsworth 2011):** Extrinsic integration (math on top of games) produces NO learning gains over plain worksheets. Only intrinsic integration works.

**Our honest position:** We have 11 games that genuinely teach, 7 that pretend to teach while actually teaching counting/selection, and 47 that are quizzes in costume. The 6 classic overlays are fine as practice drills after mastery. Everything else needs work.

## Path Forward

### Tier 1: Expand the intrinsic library
Build MORE games that match the pattern of expression-transformer, golden-beads, and fraction-circles. These are our models.

### Tier 2: Rebuild the 7 fake-intrinsic games
Each needs a redesign where the action IS the operation, not just visualizes it.

**Examples of correct redesigns:**

- **free-balance / mystery-side:** Instead of unit weights, use labeled blocks (5, 3, 8) AND force algebraic operations. My v2 mystery-side ("Keep the Scale Level") does this: player can only remove equal amounts from both sides. This IS inverse operations.

- **free-collect:** Hide the numbers on items. Show them as groups (5 dots, 3 dots). Player must COMBINE groups to reach target. The combining IS addition, not number-reading.

- **stack-to-target:** Instead of clicking numbered blocks, drag unlabeled blocks of visible sizes. Player must visually estimate composition. The visual reasoning IS the math.

### Tier 3: Decide what to do with 47 quiz-wrappers
Three options for each:
- **A)** Redesign to be intrinsic (biggest effort, highest payoff)
- **B)** Accept as quiz-wrapper, move to Rapid Fire Practice (post-mastery only)
- **C)** Remove entirely if no intrinsic path exists

Some concepts genuinely resist intrinsic design (e.g., "is this number prime?" is inherently recall/recognition). Those belong in Practice mode.

## The 13% Problem

We told ourselves we had 87 great intrinsic games. We actually have 11. This is a foundational issue — the entire premise of Diagonally depends on intrinsic integration, and most of our games don't deliver it.

The good news: we know how to fix it. The 11 games that ARE intrinsic show us the pattern. We need to hold every other game to that same standard — or honestly call them practice drills, not learning tools.

---

## Action Items

**Immediate:**
- [x] Rebuild mystery-side as v2 ("Keep the Scale Level") — DONE
- [ ] Rebuild free-balance with same algebraic-manipulation principle
- [ ] Rebuild chain-scales
- [ ] Decide: fix stack-to-target and collect-manage, or mark as practice?

**Week 1:**
- [ ] Rebuild all 7 fake-intrinsic games
- [ ] Audit "uncertain" games (resize-tool, cuisenaire-rods, tangram-fill rotate mechanic)
- [ ] Update Blueprint with new classifications

**Week 2+:**
- [ ] Work through 47 quiz-wrappers: redesign, move to practice, or remove
- [ ] Expand pedagogy engines (more Montessori-style intrinsic games)
