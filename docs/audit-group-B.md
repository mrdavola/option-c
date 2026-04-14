# Pedagogical Audit: Game Engines Group B

Audit Date: April 13, 2026
Auditor: Claude Code - Rigorous Intrinsic vs Fake Intrinsic Classification

## CLASSIFICATION SUMMARY

### TRULY INTRINSIC (9 games - Learner discovers math through interaction)

1. **size-picker** (measurement) - Magnitude comparison by clicking larger/smaller cards
2. **cut-the-bar** (partitioning) - Fractions by shading parts; fraction label updates real-time
3. **pour-the-liquid** (partitioning) - Continuous fractions; liquid height shows amount
4. **share-the-pizza** (partitioning) - Fair division by distributing slices; visual equality feedback
5. **elimination-grid** (constraint-puzzles) - Deduction by eliminating wrong numbers (color dims)
6. **twenty-questions** (constraint-puzzles) - Binary search; yes/no answers shown as color highlights
7. **tangram-fill** (spatial-puzzles) - Area addition; fill bar updates real-time, turns green at target
8. **launch-to-target** (motion-simulation) - d=s*t discoverable; projectile position shows distance

### MOSTLY INTRINSIC (3 games - Discovery works, but final success check uses hidden logic)

1. **logic-chain** (constraint-puzzles) - Clue reveals progressive and visual, but final answer check is silent
2. **bet-the-spinner** (probability-systems) - Visual probability estimation, but correctness judged silently
3. **mirror-puzzle** (spatial-puzzles) - Reflection discovered by placing shapes, but final tolerance check hidden

### FAKE INTRINSIC (5 games - Math SHOWN visually, but not DISCOVERED; learner observes operations)

1. **investment-sim** (strategy-economy) - Player sees multiplication happen (2→4→12) but doesn't discover WHY
2. **doubling-maze** (strategy-economy) - Chooses x2 or x3 forks; result shown but exponentiation not taught
3. **rotate-to-match** (spatial-puzzles) - Rotation visible each click, but final check uses silent comparison
4. **delivery-run** (path-optimization) - Distance accumulates visibly, but optimal strategy hidden; judged by 30% tolerance

### QUIZ-WRAPPER (10 games - Multiple choice or formula application disguised as games)

1. **auction-house** - Type bid; game judges silently (tolerance rule 20% never explained)
2. **price-is-right** - Type price; acceptance rule (50%-100%) hidden
3. **round-and-win** - Type rounded value; rounding rules must be known ahead of time
4. **ruler-race** - Read ruler and type length; learner must know ruler already
5. **unit-converter** - Observe formula hint, type conversion; formula-solving task
6. **population-boom** - Click percentage buttons; percentage growth formula hidden
7. **find-the-stat** - Multiple choice mode/median/mean; definitions must be memorized
8. **build-the-chart** - Solve for missing value given mean; algebra problem disguised
9. **shortest-route** - Game shows totals; learner doesn't add them, just compares
10. **map-builder** - Click edges; graph connectivity logic hidden, path never visible
11. **speed-trap** - Formula (s = d/t) given in feedback, not discovered
12. **catch-up** - Solve speed equation; formula not taught

---

## REDESIGN EXAMPLES

### Example 1: investment-sim → FAKE INTRINSIC TO TRULY INTRINSIC

**Current design:** Player clicks x2, x3, x4 buttons. Value updates (2 → 4 → 12). Hidden tolerance check at lock-in.

**Problem:** Multiplication happens but learner doesn't discover WHY 2×2=4. They're observing, not thinking.

**Redesign: Multiplication Array**
- Display a 2×2 grid of dots (=4 items)
- Player clicks 'Double' button → rows double (now 2×4 grid = 8 items)
- Player clicks 'Triple' button → another row triples it
- Target shown as a larger grid outline (e.g., 3×5 = 15 dots)
- Player builds arrays by clicking buttons until visual match
- When player's grid EXACTLY matches target grid, round auto-advances
- **Why it works:** The array SHOWS the multiplication. Learner physically sees 2×3=6 by counting dots.

### Example 2: ruler-race → QUIZ-WRAPPER TO TRULY INTRINSIC

**Current design:** Visual ruler shown, learner types length, game judges silently.

**Problem:** Learner must already know how to read a ruler. Interaction doesn't teach measurement.

**Redesign: Drag-to-Measure**
- Object (rectangle) drawn at the top
- Ruler drawn with labeled ticks (0, 5, 10, 15...)
- Player drags a line segment from ruler start to ruler end, overlaying the object
- As player drags, tooltip shows current length: 'Length: 7 cm'
- When dragged line EXACTLY matches object length, field turns GREEN
- Player clicks 'Confirm' only when green
- **Why it works:** The drag IS the measurement. Visual alignment teaches units.

### Example 3: build-the-chart → QUIZ-WRAPPER TO TRULY INTRINSIC

**Current design:** Player sees list with one missing value, given mean; must solve: x = (n × mean) - sum_of_others.

**Problem:** Algebra is hidden. Guessing teaches nothing.

**Redesign: Balance Scale Mean**
- Show a balance scale with two sides
- Left side: show the known values as weights labeled (10, 13, 11, ?)
- Right side: show the 'target mean level' as a red line
- Player adjusts the unknown value using a slider (0-20)
- As slider moves, the balance scale visibly tips or levels
- When the scale balances exactly at the target line, it glows GREEN and auto-submits
- Feedback: 'The missing value is 14. When you balance all values, mean = 12!' 
- **Why it works:** Balance point IS the mean. Math is physical (equilibrium).

### Example 4: auction-house → QUIZ-WRAPPER TO TRULY INTRINSIC

**Current design:** Type bid; game judges if within 20% of true value silently.

**Problem:** 20% tolerance is arbitrary, never explained. Pure trial-and-error.

**Redesign: Tolerance Zone Slider**
- Show item with known price label (e.g., 'Real price: 47 coins')
- Show a vertical scale from 0-100
- Draw target zone (green band) from 38-56 (which is 47±20%)
- Player drags a slider to their estimate
- If slider lands in green zone, round advances immediately (visual feedback)
- If slider lands in red zone, it shakes and resets
- Over multiple rounds, player discovers: 'There's a green zone, and I need to hit it!'
- Later, after success, hint reveals: 'You estimated within 20% each time!'
- **Why it works:** Tolerance is VISUAL first, then explained. Learner discovers the zone.

---

## FINAL RECOMMENDATIONS

### CRITICAL REBUILD (12 games)
Priority 1 - Replace with intrinsic designs:
- All 3 bidding-auction games
- ruler-race, unit-converter
- All 3 strategy-economy games
- find-the-stat, build-the-chart
- All 3 path-optimization games
- speed-trap, catch-up

### ENHANCEMENT (3 games)
Add live visual feedback before final check:
- logic-chain: Show eliminating numbers as clues reveal
- bet-the-spinner: Add histogram of 10 spins to teach probability empirically
- mirror-puzzle: Show ghost reflection overlay as player places shape

### KEEP AS-IS (8 games)
These pass both intrinsic tests:
- size-picker
- cut-the-bar, pour-the-liquid, share-the-pizza
- elimination-grid, twenty-questions
- tangram-fill
- launch-to-target
