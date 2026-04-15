// Game Option Registry — all 65 game options across 23 mechanics.
// Each option is a genuinely different gameplay mode, not just a difficulty tweak.
// This registry feeds the Circuit Board Builder UI and engine routing.

export interface GameOptionDef {
  id: string                    // e.g. "free-collect"
  mechanicId: string            // e.g. "resource-management"
  name: string                  // e.g. "Free Collect"
  description: string           // short — shown on option card in builder
  introText: string             // shown on tutorial overlay before play
  helpText: string              // shown in help panel (?) during play
  practiceOnly?: boolean        // true = formula drill, AFTER discovery via another option
}

export const GAME_OPTIONS: GameOptionDef[] = [
  // ─── 1. Collect & Manage (resource-management) ───
  {
    id: "free-collect",
    mechanicId: "resource-management",
    name: "Free Collect",
    description: "Tap dot-clusters to grow a field that matches the target",
    introText: "A target field of dots appears at the top. Tap item clusters at the bottom — their dots fly up and merge into your growing field. When your field matches the target size exactly, it snaps and locks. No typing, no Check button — the visual match IS the answer.",
    helpText: "Tap a cluster — its dots fly up and join your field.\n\nTarget has 12 dots → combine 5 + 7 = 12 → field snaps.\nYour field grows past the target → lose a life.",
  },
  {
    id: "conveyor-belt",
    mechanicId: "resource-management",
    name: "Liquid Mixing Tank",
    description: "Tap scrolling cups to pour liquid until the tank hits the target line",
    introText: "Cups of colored liquid scroll past on a belt. Tap a cup to pour it into the transparent tank. A target line is drawn on the tank — when the liquid level reaches the line exactly, the tank glows and locks. Overflow is red and catastrophic. The belt speeds up each round.",
    helpText: "Tap cups to pour them into the tank.\n\nTarget line at 12 → pour 5 + 4 + 3 = 12 → tank glows.\nLiquid overflows the line → lose a life.",
  },
  {
    id: "split-the-loot",
    mechanicId: "resource-management",
    name: "Two Silos",
    description: "Drag grain-weights into two silos until both fill lines are reached",
    introText: "Two transparent silos, each with its own target fill line. Drag grain-weights into a silo — grain pours in and the level rises by that weight. When BOTH silos reach their fill lines exactly, both glow and snap. The visual fill level IS the sum.",
    helpText: "Drag weights into Silo A or Silo B.\n\nSilo A line at 10, Silo B at 8 → split weights so each fills exactly.\nAny silo overflows → lose a life, round resets.",
  },

  // ─── 2. Split & Share (partitioning) ───
  {
    id: "cut-the-bar",
    mechanicId: "partitioning",
    name: "Cut the Bar",
    description: "Cut a bar into equal parts, shade the fraction",
    introText: "A bar appears on screen. Tap to place cut lines and divide it into equal parts. Then click sections to shade the correct fraction!",
    helpText: "Divide the bar into equal parts, then shade the right amount.\n\n✅ Show 3/4 → cut into 4 equal parts, shade 3 of them\n❌ Unequal cuts don't count — parts must be the same size!",
  },
  {
    id: "pour-the-liquid",
    mechanicId: "partitioning",
    name: "Pour the Liquid",
    description: "Drag slider to pour the right fraction into a glass",
    introText: "A container has a target line showing a fraction. Drag the slider to pour liquid to exactly that level. Watch the fraction update as you pour!",
    helpText: "Pour liquid to match the target fraction.\n\n✅ Target is 2/3 → pour until the fraction reads 2/3\n❌ Over or under the line loses a life!",
  },
  {
    id: "share-the-pizza",
    mechanicId: "partitioning",
    name: "Share the Pizza",
    description: "Drag slices to plates so everyone gets equal amounts",
    introText: "Pizzas are cut into slices. Drag slices to plates so each person gets an equal share. Everyone must get the same amount!",
    helpText: "Give everyone an equal share of pizza.\n\n✅ 8 slices, 4 people → 2 slices each\n❌ 3 slices for one, 1 for another — not fair!",
  },

  // ─── 3. Balance & Equalize (balance-systems) ───
  {
    id: "free-balance",
    mechanicId: "balance-systems",
    name: "Free Balance",
    description: "Left pan holds a mystery weight — add visible weights to the right until balanced",
    introText: "The left pan is pre-filled with a mystery block labelled ?. The right pan is empty. Tap weights (shown as differently-sized blocks) to place them on the right. The beam tilts live. When both sides balance, the mystery is revealed — the sum of what you placed IS the mystery value. Tap a placed weight again to remove it.",
    helpText: "Tap weights to add them to the right pan; tap again to remove.\n\nMystery left = 12 → place 7 + 5 → beam levels → left reveals 12.\nOvershoot tilts right — just remove a weight to undo. No Check button.",
  },
  {
    id: "mystery-side",
    mechanicId: "balance-systems",
    name: "Mystery Side",
    description: "Remove the same from both sides until x is alone — true algebra",
    introText: "The scale is already balanced: a mystery box (x) plus some blocks on one side equals blocks on the other. You can only remove the SAME AMOUNT from both sides. Keep doing this until only the box remains on the left — then the right side shows what's inside the box!",
    helpText: "Solve x + p = q by removing equal amounts from both sides.\n\n✅ Scale starts balanced: x + 3 = 10 means left (x + 3 blocks) equals right (10 blocks)\n✅ Click −3 to remove 3 from BOTH sides: now x = 7\n✅ When only x is left, the right side IS the answer\n❌ You can't remove more than what's there — lose a life if you try from the right",
  },
  {
    id: "chain-scales",
    mechanicId: "balance-systems",
    name: "Chain Scales",
    description: "Solve 3 cascading scales — each answer becomes the next scale's total",
    introText: "Three scales stacked in a cascade. Each is x + p = q. Solve Scale 1 by tapping −1, −2, −3 (or −all) to remove the same amount from both sides until only x remains. The value of x then flows down to become Scale 2's right-side total. Solve scale 2, feed scale 3, done. No typed answers — only physical removal.",
    helpText: "Tap the −N buttons to remove N blocks from BOTH sides of the active scale.\n\nScale 1: x + 3 = 10 → tap −3 → x = 7. Scale 2 right side becomes 7.\nAll three scales solved → chain locks and round completes.",
  },

  // ─── 4. Fit & Rotate (spatial-puzzles) ───
  {
    id: "rotate-to-match",
    mechanicId: "spatial-puzzles",
    name: "Rotate to Match",
    description: "Drag the handle to rotate the shape into the ghost overlay",
    introText: "A ghost outline shows where the shape needs to point. Drag the rotation handle around the centre — the shape spins to follow. When you align with the ghost it snaps and locks. No buttons.",
    helpText: "Drag the handle to rotate the shape.\n\n✅ Align with the ghost — the shape snaps when close enough\n❌ Drag back the other way if you spin past it",
  },
  {
    id: "tangram-fill",
    mechanicId: "spatial-puzzles",
    name: "Tangram Fill",
    description: "Drag and rotate multiple pieces to fill an outline",
    introText: "An outline appears on screen. Drag and rotate pieces to fill it completely — no gaps, no overlaps!",
    helpText: "Fill the outline with all the pieces.\n\n✅ All pieces fit with no gaps → round complete\n❌ Gaps or overlaps mean pieces need repositioning!",
  },
  {
    id: "mirror-puzzle",
    mechanicId: "spatial-puzzles",
    name: "Mirror Puzzle",
    description: "Drag the shape into the ghost reflection across the mirror",
    introText: "A mirror line divides the screen. The original shape is on the left and a translucent ghost shows where the reflection belongs. Drag your shape into the ghost — it snaps when placed correctly.",
    helpText: "Drag the shape onto its mirrored ghost.\n\n✅ Same distance from the mirror on both sides\n❌ Off by too much? Drag again — it returns to the bank if it doesn't snap",
  },

  // ─── 5. Roll & Predict (probability-systems) ───
  {
    id: "find-the-stat",
    mechanicId: "probability-systems",
    name: "Find the Stat",
    description: "Drag weighted dots onto a number line and watch the stat emerge",
    introText: "Each round asks for the mean, median, or mode. Drag the dots onto the number line. A seesaw, middle band, or stacks below show the answer EMERGE physically — no typing.",
    helpText: "Drag every dot onto its value on the line.\n\n✅ For mean: the seesaw's balance point IS the mean\n✅ For median: the middle dot lights up when sorted\n✅ For mode: the tallest stack wins",
  },
  {
    id: "bet-the-spinner",
    mechanicId: "probability-systems",
    name: "Bet the Spinner",
    description: "Spin 100x, watch bars fill, then rank colours by likelihood",
    introText: "A spinner with coloured sections is on screen. Press Spin 100x — the spins run automatically and bars fill with counts. Then drag colour tiles into MOST → LEAST likely slots.",
    helpText: "Watch the law of large numbers in action.\n\n✅ Bigger section = more counts → higher up in the ranking\n❌ A wrong slot order shakes — try a different arrangement",
  },
  {
    id: "build-the-chart",
    mechanicId: "probability-systems",
    name: "Build the Chart",
    description: "Drag bar heights so a balance scale's fulcrum lands on the target mean",
    introText: "Drag bars up or down. Below the chart, a balance scale shows where the data balances — that IS the mean. Adjust until the fulcrum sits on the target mark and the bars lock.",
    helpText: "The mean is the balance point of the data.\n\n✅ Move bars until the fulcrum slides onto the target line\n❌ Beam tilts when you're off — drag the other direction",
  },

  // ─── 6. Navigate & Optimize (path-optimization) ───
  {
    id: "shortest-route",
    mechanicId: "path-optimization",
    name: "Shortest Route",
    description: "Draw your own path — shortest total wins",
    introText: "Nodes sit on a map with labeled distances between them. Click nodes in order to DRAW a path from Start to End. The running total adds itself up as you go. Try different paths — beat the best known distance!",
    helpText: "Draw a path by clicking nodes.\n\n✅ Click Start → node → End. Total updates live. Try again to beat it.\n❌ No single 'right answer' — shorter than last try = win.",
  },
  {
    id: "map-builder",
    mechanicId: "path-optimization",
    name: "Map Builder",
    description: "Draw path under a budget — meter turns red if over",
    introText: "Draw a path from Start to End, passing through a required node. A live meter shows your running total: green = under budget, red = over. Find any valid path and it locks in!",
    helpText: "Click nodes to draw your path.\n\n✅ Meter stays green and you reach End → path locks.\n❌ Meter red = over budget. Try a cheaper route.",
  },
  {
    id: "delivery-run",
    mechanicId: "path-optimization",
    name: "Delivery Run",
    description: "Visit all stops — try different orders to minimize",
    introText: "All delivery stops are shown. Click them in any order — a line draws as you go and the total distance updates live. Try different orders. Personal best is shown so you can beat your own record!",
    helpText: "Click stops in chosen order.\n\n✅ Visit all stops, lower total = new personal best.\n❌ Backtracking adds distance — try a smoother loop!",
  },

  // ─── 7. Build & Measure (construction-systems) ───
  {
    id: "stack-to-target",
    mechanicId: "construction-systems",
    name: "Sinking Pan",
    description: "Drag height-blocks onto a pan until it sinks to the target line",
    introText: "A scale pan hangs above a target line. Drag blocks onto the pan — each block sinks the pan by its visible height. Match the target exactly!",
    helpText: "Stack blocks so the pan sinks to the target line.\n\n✅ Target 10 → drop blocks of height 4 + 3 + 3\n❌ Overshoot the line → too heavy!",
  },
  {
    id: "fill-the-floor",
    mechanicId: "construction-systems",
    name: "Resizable Rectangle",
    description: "Drag a corner to stretch the rectangle until W × H matches the target",
    introText: "A selection rectangle sits on a grid. Drag its corner to change width and height. W × H updates live — match the target shape exactly!",
    helpText: "Stretch the rectangle so W × H equals the target area AND the target shape.\n\n✅ Target 3 × 4 = 12\n❌ 2 × 6 = 12 but wrong shape!",
  },
  {
    id: "box-packer",
    mechanicId: "construction-systems",
    name: "Transparent Cube Box",
    description: "Slide L, W, H dials to fill a transparent box with unit cubes",
    introText: "A transparent box outline. Three sliders control length, width, and height. Unit cubes stack inside as you slide — match the target volume!",
    helpText: "Slide L × W × H to the target volume.\n\n✅ 3 × 2 × 2 = 12 cubes\n❌ 4 × 2 × 2 = 16 — too many cubes!",
  },

  // ─── 8. Race & Calculate (motion-simulation) ───
  {
    id: "launch-to-target",
    mechanicId: "motion-simulation",
    name: "Launch to Target",
    description: "Set speed to hit target distance",
    introText: "Set the launch speed with the slider. Your object will fly and land at a distance based on speed × time. Hit the target zone!",
    helpText: "Set the right speed to hit the target.\n\n✅ Target at 60m, time = 3s → set speed to 20 m/s (20×3=60)\n❌ Speed 25 → lands at 75m, too far!",
  },
  {
    id: "speed-trap",
    mechanicId: "motion-simulation",
    name: "Speed Trap",
    description: "Object passes checkpoints — calculate speed",
    introText: "Watch an object pass two checkpoints. You see the distance between them and the time it took. Calculate the speed!",
    helpText: "Speed = distance ÷ time.\n\n✅ 100m in 5 seconds → speed = 20 m/s\n❌ 100 ÷ 5 = 20, not 25!",
    practiceOnly: true,
  },
  {
    id: "catch-up",
    mechanicId: "motion-simulation",
    name: "Catch Up",
    description: "Set right speed to catch the leader in time",
    introText: "A leader is ahead of you, moving at a set speed. Set your speed to catch them before they reach the finish line!",
    helpText: "Set speed to catch the leader.\n\n✅ Leader at 10m/s, 50m ahead, finish in 100m → you need faster than 10 m/s to close the gap\n❌ Same speed = you never catch up!",
    practiceOnly: true,
  },

  // ─── 9. Solve & Eliminate (constraint-puzzles) ───
  {
    id: "elimination-grid",
    mechanicId: "constraint-puzzles",
    name: "Elimination Grid",
    description: "Use clues to eliminate wrong answers",
    introText: "A grid of numbers. Clues appear one at a time — 'it's even', 'it's greater than 20'. Click numbers to eliminate them. The last one standing is the answer!",
    helpText: "Eliminate numbers using clues.\n\n✅ 'It's even' → eliminate all odd numbers\n❌ Don't eliminate numbers that match the clue!",
  },
  {
    id: "twenty-questions",
    mechanicId: "constraint-puzzles",
    name: "20 Questions",
    description: "Ask yes/no to narrow down the number",
    introText: "A mystery number is hidden. Pick yes/no questions from the menu to narrow it down. Fewer questions = more points!",
    helpText: "Ask smart questions to find the number.\n\n✅ 'Is it > 50?' eliminates half the range\n❌ 'Is it 37?' only eliminates one number!",
  },
  {
    id: "logic-chain",
    mechanicId: "constraint-puzzles",
    name: "Logic Chain",
    description: "Each clue visibly eliminates numbers from the grid",
    introText: "A grid of numbers is shown. Each clue you reveal fades out the numbers that don't fit — until only one remains. Click the glowing survivor to confirm!",
    helpText: "Apply clues to narrow the grid to one number.\n\n✅ Each clue grays out failing numbers — watch the grid shrink\n❌ Don't click an eliminated (faded) number!",
  },

  // ─── 10. Grow & Compound (strategy-economy) ───
  {
    id: "investment-sim",
    mechanicId: "strategy-economy",
    name: "Multiplication Array",
    description: "Watch every dot split — multiplication you can SEE",
    introText: "Start with a small group of dots. Tap ×2 or ×3 and every dot visibly splits into copies. The array grows before your eyes. Reach exactly the target dot count!",
    helpText: "Each tap multiplies every dot by that number.\n\n✅ Start 2, target 8 → ×2 (→4) then ×2 (→8)\n❌ ×3 when you're at 4 → 12 — overshot!",
  },
  {
    id: "population-boom",
    mechanicId: "strategy-economy",
    name: "Visible Population",
    description: "Pick a growth rate — every creature splits into that many",
    introText: "Some creatures are on the field. Pick a growth rate (×2, ×3, ×4), then tap Next Generation. Every creature splits into that many copies. Reach the exact target population.",
    helpText: "Growth rate = how many copies each creature makes.\n\n✅ 2 creatures, target 8 → rate ×2, then ×2 (2→4→8)\n❌ rate ×4 from 3 → 12 — too big!",
  },
  {
    id: "doubling-maze",
    mechanicId: "strategy-economy",
    name: "Split-and-Double Path",
    description: "Pick forks — each one doubles or triples your block stack",
    introText: "You have a stack of blocks. Each fork offers ×2 or ×3 — choose one and your stack visibly multiplies. Pick the right forks so the final stack equals the target.",
    helpText: "Each fork multiplies the whole stack.\n\n✅ Start 2, target 12 → ×2 then ×3 (2→4→12)\n❌ ×3 then ×3 from 2 → 18 — too tall!",
  },

  // ─── 11. Measure & Compare (measurement-challenges) ───
  {
    id: "size-picker",
    mechanicId: "measurement-challenges",
    name: "Size Picker",
    description: "Compare two items — pick bigger/smaller",
    introText: "Two items appear with measurements. Pick the bigger one (or smaller — read the prompt!). Quick-fire rounds!",
    helpText: "Compare and pick correctly.\n\n✅ 1.5m vs 140cm → 1.5m = 150cm, so 1.5m is bigger\n❌ 140 > 1.5 as numbers, but check the units!",
  },
  {
    id: "ruler-race",
    mechanicId: "measurement-challenges",
    name: "Ruler Race",
    description: "Drag a measurement line to span an object's length",
    introText: "An object lies along a ruler. Drag the endpoints of the measurement line to cover the object exactly. The ruler reads the length live — when the line spans the object precisely, it locks in.",
    helpText: "Stretch the measurement line across the object.\n\n✅ Object spans from 0 to 7 → drag the line endpoints to 0 and 7\n✅ Live reading shows you the length as you drag\n❌ If the line is shorter or longer than the object, keep adjusting!",
  },
  {
    id: "unit-converter",
    mechanicId: "measurement-challenges",
    name: "Unit Converter",
    description: "Practice drill: convert between units using a formula",
    introText: "Practice drill. A value appears in one unit — convert it to the target unit using the conversion shown.",
    helpText: "Use the conversion fact to convert.\n\n✅ 1 m = 100 cm → 3 m = 300 cm\n❌ Don't just copy the number — apply the factor!",
    practiceOnly: true,
  },

  // ─── 12. Score & Rank (scoring-ranking) ───
  {
    id: "sorting-lane",
    mechanicId: "scoring-ranking",
    name: "Weight Tower Builder",
    description: "Stack weight blocks — physics validates order",
    introText: "Numbers are weight blocks whose width shows their value. Stack biggest-on-bottom to smallest-on-top. A wrong block makes the tower wobble and slide off!",
    helpText: "Stack blocks largest at the bottom.\n\nPlace the heaviest first, then the next-heaviest, and so on.\nIf a bigger block is placed on a smaller one, the tower wobbles and slides the wrong block off — try the next-largest instead.",
  },
  {
    id: "number-line-drop",
    mechanicId: "scoring-ranking",
    name: "Number Line Drop",
    description: "Drop numbers onto correct position",
    introText: "A number line with some positions marked. Drag number tokens and drop them at the right spot on the line!",
    helpText: "Place numbers at the right position.\n\n✅ Drop 7.5 halfway between 7 and 8\n❌ 7.5 placed at 7 — too far left!",
  },
  {
    id: "leaderboard-fix",
    mechanicId: "scoring-ranking",
    name: "Height Ranking",
    description: "Reorder height-blocks into a clean descending staircase",
    introText: "Scores are blocks whose heights match their value — a jagged row at first. Tap a block, then tap a neighbour to swap. The row glows when it forms a clean descending staircase.",
    helpText: "Build a descending staircase, tallest on the left.\n\nTap two adjacent blocks to swap them.\nWhen each block is shorter than the one to its left, the row locks in.",
  },

  // ─── 13. Pattern & Repeat (timing-rhythm) ───
  {
    id: "sequence-builder",
    mechanicId: "timing-rhythm",
    name: "Black Box Machine",
    description: "Feed inputs, observe outputs, then drag the predicted output",
    introText: "A machine has a hidden rule. Drag number tiles into its INPUT funnel and watch outputs emerge. After a few experiments, drag your predicted output tile onto the target slot. The machine confirms when it's right!",
    helpText: "Discover the rule by experimenting.\n\nDrag small numbers into the input funnel and read off the output each time.\nWhen you see the pattern, drag the predicted output tile onto the target slot — the machine runs and chimes if you're right.",
  },
  {
    id: "pattern-machine",
    mechanicId: "timing-rhythm",
    name: "Pattern Machine",
    description: "Eliminate wrong rules through experiments",
    introText: "Possible rules sit on the right. Drag inputs into the machine — each output that doesn't match a rule eliminates it visually. When only one rule still fits, tap it to lock in.",
    helpText: "Eliminate by experimenting.\n\nFeed inputs to the machine; watch which rule cards get crossed out.\nLock in the rule that still matches every experiment.",
  },
  {
    id: "broken-pattern",
    mechanicId: "timing-rhythm",
    name: "Rolling Balls on a Ramp",
    description: "Watch balls roll — click the one that lands wrong",
    introText: "Numbers are balls rolling down a ramp onto pegs. A consistent rule makes evenly spaced landings. One ball lands wrong and visibly bounces off — click that off-ball!",
    helpText: "Spot the ball that breaks the rhythm.\n\nRoll the balls and watch the landing pattern.\nThe one that lands at the wrong height is the off-ball — click it.",
  },

  // ─── 14. Scale & Transform (scaling-resizing) ───
  {
    id: "resize-tool",
    mechanicId: "scaling-resizing",
    name: "Grid Stretcher",
    description: "Drag a corner to stretch a small grid — each cell becomes an N×N block",
    introText: "A small grid sits beside a larger target grid. Drag the corner handle to stretch — each original cell grows into an N×N block until the stretched shape matches the target.",
    helpText: "Stretch until original × factor = target.\n\n✅ 3 × 2 = 6 (each cell becomes a 2×2 block)\n❌ 3 × 3 = 9 — stretched too far!",
  },
  {
    id: "recipe-scaler",
    mechanicId: "scaling-resizing",
    name: "Stacked Mixing Bowl",
    description: "Drag ingredient blocks into a bowl until each stack matches the scaled recipe",
    introText: "A base recipe is shown as colored block towers. Drag ingredient blocks from the pool into the bowl until each stack is exactly ×N the original recipe.",
    helpText: "Stack ×N of each ingredient.\n\n✅ Base 2 flour × 2 → stack 4 flour blocks\n❌ Only 3 in the stack — not enough!",
  },
  {
    id: "map-distance",
    mechanicId: "scaling-resizing",
    name: "Draggable Scale Bar",
    description: "Drag a scale bar along a route — each drop adds one unit to the total",
    introText: "A scale bar labeled '1 bar = N km'. Drag it along the dashed route from A to B. Each placement adds N to the running sum. Cover the whole route!",
    helpText: "Place enough bars to cover the route.\n\n✅ Scale 1 bar = 5 km, 3 bars → 5 + 5 + 5 = 15 km\n❌ Bar dropped off the route — try again!",
  },

  // ─── 15. Craft & Combine (inventory-crafting) ───
  {
    id: "recipe-mixer",
    mechanicId: "inventory-crafting",
    name: "Recipe Mixer",
    description: "Drag ingredients to match the target bowl",
    introText: "A target bowl shows colored layers of ingredients. Drag items from the bins into your bowl — each layer locks when it matches. Match every layer to win!",
    helpText: "Stack ingredients to match the target bowl.\n\n✅ Drag flour until the red layer locks, then sugar, then eggs\n❌ Overflowing a layer wastes ingredients — watch the count!",
  },
  {
    id: "potion-lab",
    mechanicId: "inventory-crafting",
    name: "Potion Lab",
    description: "Pick a multiplier so the bottle reaches the target line",
    introText: "The bottle starts with a base number of glowing drops. Pick a multiplier (×2, ×3, ×4...) to copy the base that many times. Match the target line on the bottle!",
    helpText: "Multiply the base to match the target.\n\n✅ Base 3, target 12 → ×4 fills the bottle (3+3+3+3 = 12)\n❌ Wrong multiplier overshoots or undershoots the target line!",
  },
  {
    id: "assembly-line",
    mechanicId: "inventory-crafting",
    name: "Assembly Line",
    description: "Set items per pallet and pallets to hit the target total",
    introText: "Two sliders control items-per-pallet and number-of-pallets. The conveyor shows your pallets live. Adjust both until N × M equals the target total!",
    helpText: "Use grouping to make the total.\n\n✅ Target 12 → 4 items × 3 pallets = 12\n❌ 5 × 3 = 15 — too many; try 4 × 3!",
  },

  // ─── 16. Plot & Explore (terrain-generation) ───
  {
    id: "coordinate-hunter",
    mechanicId: "terrain-generation",
    name: "Coordinate Hunter",
    description: "Click (x,y) to find targets",
    introText: "Hidden targets are on the grid. You're given coordinates like (3,5) — click that exact spot. Hit = found, miss = lose a life!",
    helpText: "Click the exact coordinate.\n\n✅ (3,5) → go right 3, up 5, click\n❌ (5,3) is a different spot — x first, then y!",
  },
  {
    id: "battleship",
    mechanicId: "terrain-generation",
    name: "Battleship",
    description: "Call coordinates to sink hidden ships",
    introText: "Ships are hidden on the grid. Call a coordinate to fire. Hits show up in red, misses in white. Sink all ships before running out of shots!",
    helpText: "Use hits to find ship orientation.\n\n✅ Hit at (3,4) → try (3,5) to find the ship's direction\n❌ Random shots waste ammo!",
  },
  {
    id: "treasure-trail",
    mechanicId: "terrain-generation",
    name: "Treasure Trail",
    description: "Follow coordinate instructions to find treasure",
    introText: "Follow a trail of coordinate clues: 'Go to (2,3), then move right 4 and up 2.' Each clue leads to the next. Find the treasure!",
    helpText: "Follow each clue step by step.\n\n✅ At (2,3), move right 4 → now at (6,3)\n❌ Right 4 from (2,3) is (6,3), not (2,7)!",
  },

  // ─── 17. Bid & Estimate (bidding-auction) ───
  {
    id: "auction-house",
    mechanicId: "bidding-auction",
    name: "Auction House",
    description: "Estimate value, bid within 20%",
    introText: "An item appears with clues about its value. Estimate the value and place your bid. Win if you're within 20% — but don't overspend your budget!",
    helpText: "Practice mode — unlocks after you've mastered this concept through another game.",
    practiceOnly: true,
  },
  {
    id: "price-is-right",
    mechanicId: "bidding-auction",
    name: "Price is Right",
    description: "Guess without going over",
    introText: "An item has a hidden price. Guess as close as you can WITHOUT going over. Closest guess without exceeding the price wins!",
    helpText: "Practice mode — unlocks after you've mastered this concept through another game.",
    practiceOnly: true,
  },
  {
    id: "round-and-win",
    mechanicId: "bidding-auction",
    name: "Round and Win",
    description: "Round to nearest 10/100 — closest wins",
    introText: "A number appears. Round it to the nearest 10 (or 100, or 1000). Pick the correct answer from the options — fastest correct answer gets bonus points!",
    helpText: "Practice mode — unlocks after you've mastered this concept through another game.",
    practiceOnly: true,
  },

  // ─── 18. Rise & Fall (above-below-zero) ───
  {
    id: "depth-navigator",
    mechanicId: "above-below-zero",
    name: "Depth Navigator",
    description: "Move to target on number line",
    introText: "A vertical number line with sea level at 0. Use the +/- buttons to move your submarine to the target depth. Above zero = sky, below zero = ocean!",
    helpText: "Navigate to the target depth.\n\n✅ Target is -5 → press minus 5 times from 0\n❌ At -3, target is +2 → you need to go UP 5 steps, not down!",
  },
  {
    id: "temperature-swing",
    mechanicId: "above-below-zero",
    name: "Temperature Swing",
    description: "Add/subtract to stay in target zone",
    introText: "A thermometer shows the current temperature. Add or subtract degrees to reach the target zone. Watch out — random events can push you off target!",
    helpText: "Stay in the target zone.\n\n✅ Target zone: 5° to 10°, current: 3° → add 4° to reach 7°\n❌ A cold front hits (-5°) → now at 2°, adjust quickly!",
  },
  {
    id: "elevator-operator",
    mechanicId: "above-below-zero",
    name: "Elevator Operator",
    description: "Pick up passengers at +/− floors",
    introText: "You're an elevator operator starting at floor 0. Passengers wait at different floors (including basement floors with negative numbers). Pick everyone up!",
    helpText: "Pick up all passengers efficiently.\n\n✅ Passengers at floors -2, +3, +5 → go -2 first, then up to +3, then +5\n❌ Going +5 then -2 then +3 = more travel!",
  },

  // ─── 19. Build a Structure (build-structure) ───
  {
    id: "shape-matcher",
    mechanicId: "build-structure",
    name: "Shape Matcher",
    description: "Drag shapes to match the target arrangement",
    introText: "A target picture is shown at the top. Drag shapes from the pool into your workspace. When your workspace matches the target in count and kind, it locks in automatically!",
    helpText: "Match the target picture by dragging shapes.\n\n✅ Target shows 2 triangles + 1 square → drag exactly those into your workspace\n❌ Placed an extra shape? It auto-returns so you can try again.\n\nThe arrangement IS the answer — no Check button.",
  },
  {
    id: "free-build",
    mechanicId: "build-structure",
    name: "Free Build",
    description: "Drag unit squares edge-to-edge to hit the target perimeter",
    introText: "Drag unit squares into the Building Zone — they must touch edge-to-edge. A live perimeter meter shows the outer boundary of your shape. Match the target perimeter to win!",
    helpText: "Build a connected shape and watch the perimeter meter.\n\n✅ Each unit square adds 4 edges, and touching squares hide 2 edges where they meet\n✅ 3 squares in a row = perimeter 8 (12 total − 4 shared)\n❌ Squares must touch edge-to-edge — no floating tiles!\n\nPlacement IS addition — no Add button, no Check button.",
  },
  {
    id: "shape-decomposer",
    mechanicId: "build-structure",
    name: "Shape Decomposer",
    description: "Fill each coloured region to see the area as a sum",
    introText: "A composite shape made of unit squares appears, split into two coloured regions. Drag matching-colour tiles into each region. The total area is revealed automatically as the sum of the two parts!",
    helpText: "Fill every cell in both coloured regions.\n\n✅ Blue region has 3 cells + green region has 2 cells → 3 + 2 = 5 square units\n✅ Each tile must go in a cell of its matching colour\n❌ No typing areas — placing tiles IS counting.\n\nFilling the shape IS the decomposition.",
  },

  // ─── 20. Montessori Materials (montessori-materials) ───
  {
    id: "golden-beads",
    mechanicId: "montessori-materials",
    name: "Golden Beads",
    description: "Drag hundred-squares, ten-bars, and unit beads into place-value columns to build a number",
    introText: "A target number appears at the top. Drag golden bead pieces — hundred-squares, ten-bars, and single beads — into their Hundreds, Tens, and Ones columns. Your number at the bottom auto-forms from what you drop.",
    helpText: "Drag each piece into its matching column.\n\n100-square → Hundreds (adds 100).\nTen-bar → Tens (adds 10).\nSingle bead → Ones (adds 1).\n\n✅ For 152: one 100-square, five ten-bars, two single beads.\n❌ A ten-bar dropped in the Ones column bounces back — the mat enforces place value.\n\nWhen your number matches the target, the round ends on its own — no Check button.",
  },
  {
    id: "hundred-board",
    mechanicId: "montessori-materials",
    name: "Hundred Board",
    description: "Place numbers in the correct spot on a 10×10 grid",
    introText: "A 10×10 hundred board with some numbers shown as guides. A number appears at the top — click the correct cell where it belongs! Numbers go 1-100, left to right, top to bottom.",
    helpText: "Place each number in the right cell.\n\nNumbers go left to right: 1-10 in the first row, 11-20 in the second, etc.\n\n✅ 35 → row 4, column 5\n❌ 35 is not in row 3 — that's 21-30!",
  },
  {
    id: "stamp-game",
    mechanicId: "montessori-materials",
    name: "Stamp Game",
    description: "Drag place-value stamps onto a 4-column mat to compose a 4-digit number",
    introText: "A target number appears at the top. Drag colored stamps (1000, 100, 10, 1) onto a labeled Place Value Mat. Every stamp adds its value to a live readout so you watch the number build up as you go.",
    helpText: "Each column of the mat holds only one value.\n\nGreen 1000 → Thousands.\nRed 100 → Hundreds.\nBlue 10 → Tens.\nYellow 1 → Ones.\n\n✅ For 3452: three 1000s + four 100s + five 10s + two 1s.\n❌ A 10-stamp dropped on Hundreds bounces back — wrong column, wrong place value.\n\nThe round ends by itself when your total matches the target.",
  },
  {
    id: "fraction-circles",
    mechanicId: "montessori-materials",
    name: "Fraction Circles",
    description: "Color wedges of a circle to show a fraction",
    introText: "A circle is divided into equal wedges. Click wedges to color them and show the fraction! Click again to uncolor. Your colored count must match the numerator.",
    helpText: "Color the right number of wedges.\n\nThe circle is divided into equal parts (the denominator).\n\n✅ Show 3/4 → color 3 out of 4 wedges\n❌ 2 colored out of 4 = 2/4, not 3/4!",
  },
  {
    id: "bead-chain",
    mechanicId: "montessori-materials",
    name: "Bead Chain",
    description: "Slide a marker along a bead chain to the Nth group to multiply by skip-counting",
    introText: "A chain of colored beads is grouped into segments of N. A ▼ target flag marks the answer. Drag the marker along the chain — it snaps to each segment boundary, and the live readout shows N × (groups) = count as you go.",
    helpText: "Drag the marker along the bead chain.\n\nThe marker snaps to each segment end. The readout updates live: N × (groups passed) = running total.\n\n✅ Skip-count by 7, slide to the 5th segment → 7 × 5 = 35 beads passed.\n❌ Don't guess — watch the readout and the ▼ flag. When the marker reaches the flag, the round ends.\n\nNo typing, no Check button — the chain IS the multiplication.",
  },
  {
    id: "checkerboard-multiply",
    mechanicId: "montessori-materials",
    name: "Checkerboard Multiply",
    description: "Fill every cell of a rows × columns grid to see the product emerge from the count",
    introText: "A Montessori checkerboard shows columns across the top and rows down the side. Click any cell to drop a bead. A live readout updates as rows fill: columns × (rows completed) = beads placed. Fill the whole grid and the product reveals itself.",
    helpText: "Click cells to place beads until every cell is filled.\n\nEach row has the same number of cells (the columns factor). Filling one full row adds that many to the count.\n\n✅ 3 columns × 4 rows → 12 cells total. Fill the first row → 3 × 1 = 3. Fill the second → 3 × 2 = 6. Keep going until 3 × 4 = 12.\n❌ Skipping cells leaves the readout mid-row — the grid isn't a product until it's complete.\n\nNo typing — the filled rectangle IS the product.",
  },

  // ─── 21. Clock & Time (measurement-time) ───
  {
    id: "clock-reader",
    mechanicId: "measurement-time",
    name: "Discovery Clock",
    description: "Rotate clock hands to match the target digital time",
    introText: "A blank analog clock is shown. Drag the hour hand and the minute hand to rotate them. A live digital display updates as you rotate. A target time is shown above — rotate the hands until the digital reading matches the target.",
    helpText: "Rotate the hands by dragging them.\n\n✅ Target is 3:15 → drag the hour hand to point just past 3, drag the minute hand to point at 3 (the 15-min mark)\n✅ Watch the live digital display — it updates as you rotate\n❌ The hour hand moves as minutes pass — a 3:30 clock has the hour hand halfway between 3 and 4",
  },
  {
    id: "time-matcher",
    mechanicId: "measurement-time",
    name: "Time Matcher",
    description: "Match analog clock to digital time",
    introText: "Practice drill. A clock shows a time. Pick the matching digital time from 4 choices! Watch out — some are close but wrong.",
    helpText: "Match the clock.\n\nLook at the hour hand first, then the minute hand.\n\n✅ If the hour hand is past 2 and minute hand is on 3 → 2:15\n❌ 3:10 looks similar but is wrong!",
    practiceOnly: true,
  },
  {
    id: "time-elapsed",
    mechanicId: "measurement-time",
    name: "Time Elapsed",
    description: "Stretch an interval bar across a timeline to match elapsed time",
    introText: "A timeline shows a start time on the left. Drag the right edge of the interval bar to stretch it along the timeline. The bar reads the elapsed time live (e.g. '3 hr 15 min'). Stretch until the reading matches the target.",
    helpText: "Drag the right edge of the interval bar.\n\n✅ Target is 2 hr 30 min → stretch the bar until the live reading says '2 hr 30 min'\n✅ The bar locks in place when you match the target\n❌ Watch the live reading — it updates as you drag",
  },

  // ─── 22. Singapore CPA (singapore-cpa) ───
  {
    id: "bar-model",
    mechanicId: "singapore-cpa",
    name: "Bar Model",
    description: "Build the answer by placing unit rods end-to-end on a measurement track",
    introText: "Read the word problem. Place colored unit rods end-to-end on the track — the running length on the ruler IS your answer. No number pad: the rods ARE the math.",
    helpText: "Arrange rods to model the problem.\n\nAddition: combine rods end-to-end.\nSubtraction: place the whole, then remove the taken-away piece.\nMultiplication: place equal rods side-by-side.\n\n✅ The ruler reads your total as you build.\n❌ Don't guess — build the picture and the answer appears.",
  },
  {
    id: "place-value-discs",
    mechanicId: "singapore-cpa",
    name: "Place Value Discs",
    description: "Drop BIG/MEDIUM/SMALL discs into unlabeled regions — the mat's place value emerges",
    introText: "Three unlabeled regions on a mat. Three disc sizes: BIG = 100, MEDIUM = 10, SMALL = 1. Drop discs into regions until the live total matches the target. The meaning of each column emerges from where you put the big and small discs.",
    helpText: "Build the target number from discs.\n\nBIG disc = 100, MEDIUM = 10, SMALL = 1.\n\n✅ Target 234 → 2 BIG + 3 MEDIUM + 4 SMALL discs anywhere on the mat.\n❌ The TOTAL at the bottom is the truth — watch it as you place discs.",
  },
  {
    id: "number-bonds",
    mechanicId: "singapore-cpa",
    name: "Number Bonds",
    description: "Drop numbered balls into part-part-whole circles — the bond auto-reveals the missing value",
    introText: "Three circles: a Whole and two Parts. Drag the two KNOWN values from the number pool into the correct circles. When both are placed, the bond auto-reveals the third — the structure ENFORCES the relationship.",
    helpText: "Complete the bond by placing what you know.\n\nWhole = Part + Part.\n\n✅ Put 7 in one Part circle and 8 in the other → the Whole auto-reveals as 15.\n✅ Put 15 in Whole and 7 in a Part → the other Part auto-reveals as 8.\n❌ You don't need to do the math — place the knowns, and the bond finishes itself.",
  },
  {
    id: "cuisenaire-rods",
    mechanicId: "singapore-cpa",
    name: "Cuisenaire Rods",
    description: "Build a train of rods that matches a reference rod's length — rods snap-lock when exact",
    introText: "A reference rod at the top shows the target length. Click shorter rods to add them end-to-end beneath it. When your train's length exactly matches the reference, the rods SNAP together with a lock animation.",
    helpText: "Match the reference rod's length using shorter rods.\n\n✅ Target 7 → 3 + 4, or 2 + 2 + 3, or 1 + 6 all work.\n❌ Going over length won't lock — remove a rod and try again.\nThe rods themselves tell you when you're right.",
  },

  // ─── 23. Standard Pedagogy (standard-pedagogy) ───
  {
    id: "expression-transformer",
    mechanicId: "standard-pedagogy",
    name: "Expression Transformer",
    description: "Algebra tiles — click to cancel zero pairs until the expression is simplified",
    introText: "Colored tiles represent numbers and variables. Green = +1, red = −1, blue = +x, dark red = −x. Click any tile to cancel it with its opposite. When no more pairs can cancel, the simplified form is revealed automatically.",
    helpText: "Cancel zero pairs. No typing needed.\n\n✅ +1 +1 +1 −1 −1 → cancel two pairs → +1 remains\n❌ Leaving an opposite pair uncancelled means you're not simplified yet.",
  },
  {
    id: "factor-finder",
    mechanicId: "standard-pedagogy",
    name: "Factor Finder",
    description: "Build a factor tree by clicking composite numbers to split them",
    introText: "A number appears at the top. Click it to split into two factors. Keep splitting until all leaves are prime (green). The factor tree must be complete to check!",
    helpText: "Split composites until only primes remain.\n\nClick a number to split it into its smallest factor and the remainder.\n\n✅ 12 → 2 × 6 → 2 × 2 × 3 (all prime!)\n❌ 6 is not prime — keep splitting!",
  },
  {
    id: "category-sort",
    mechanicId: "standard-pedagogy",
    name: "Self-Revealing Buckets",
    description: "Two unlabeled buckets with secret rules — discover them by dropping numbers",
    introText: "Two buckets sit below. Each has a SECRET rule — no labels! Drag a number in: if it fits, the bucket glows and keeps it. If not, it bounces back. Figure out each bucket's hidden rule and sort every item.",
    helpText: "Drop numbers to discover the hidden rules.\n\n✅ Drop 4 into the left bucket → glows → rule might be 'even'\n❌ Drop 5 there → bounces back → 5 doesn't fit",
  },
  {
    id: "measure-and-plot",
    mechanicId: "standard-pedagogy",
    name: "Coordinate Crosshairs",
    description: "Drag a marker on a grid — live crosshairs show its (x, y)",
    introText: "A grid with x and y axes is shown. A target coordinate appears at the top. Drag the marker — crosshairs and a live (x, y) label follow it. When the marker matches the target, it snaps in.",
    helpText: "Move the marker to the target coordinates.\n\n✅ Target (3, 5) → drag until the label reads (3, 5) and it snaps\n❌ (5, 3) is a different point — order matters: across, then up.",
  },

  // ─── 24. Middle School Gaps (middle-school-gaps) ───
  {
    id: "inequality-grapher",
    mechanicId: "middle-school-gaps",
    name: "Inequality Grapher",
    description: "Drag a circle, toggle open/closed, and paint the inequality region",
    introText: "An inequality like 'x > 5' appears above a number line. Drag the circle onto the boundary, click it to toggle open or closed, then drag across the line to shade the region. When your shading captures every value that satisfies the inequality, it glows green and locks!",
    helpText: "Build the graph by feel — no Check button.\n\nDrag the circle onto the boundary number. Click to toggle open (>, <) or closed (≥, ≤). Drag across the line to paint the shaded region.\n\n✅ Shading covers every number that satisfies the inequality → glows green and locks\n❌ Wrong direction or wrong circle type → shading stays dim until you adjust",
  },
  {
    id: "signed-divide",
    mechanicId: "middle-school-gaps",
    name: "Signed Divide",
    description: "Two-stage physical division: combine sign particles, then split into groups",
    introText: "Stage 1: Drag a sign particle from the dividend pool and one from the divisor pool into the reactor. Same signs make a GREEN ball (positive); opposite signs make a RED ball (negative). Stage 2: Watch the dividend's blocks physically separate into divisor-sized groups. The ball's color and the group count ARE the answer!",
    helpText: "Two-stage physical division — no typing.\n\nStage 1 (Sign): Drop one + or - particle from each pool into the reactor. Same signs → green; opposite → red.\nStage 2 (Magnitude): Press 'Separate' to split the blocks into groups of |divisor|. Count the groups.\n\n✅ -12 ÷ 3 → opposite signs (red), 12 splits into 4 groups → -4",
  },
  {
    id: "fraction-to-decimal",
    mechanicId: "middle-school-gaps",
    name: "Fraction to Decimal",
    description: "Slide a marker across two parallel number lines to see the equivalent decimal",
    introText: "Two parallel number lines: the top shows fractions, the bottom shows decimals. Drag the vertical marker left and right — wherever you stop, the top reads the fraction and the bottom reads the matching decimal. Slide to the target fraction and the decimal reveals itself!",
    helpText: "Slide the marker — no typing.\n\nThe marker spans both lines. Top reads the fraction; bottom reads the decimal at the same horizontal position. Land on the target fraction to lock in.\n\n✅ Slide to 3/4 on top → bottom shows 0.75. Same spot, same quantity, two notations.",
  },
  {
    id: "number-classifier",
    mechanicId: "middle-school-gaps",
    name: "Number Classifier",
    description: "Feel the difference: rationals snap to ticks; irrationals shimmer and drift",
    introText: "Drag each number onto the number line. Rational numbers (fractions, terminating, repeating decimals) SNAP to an exact tick mark with a click. Irrationals (√2, π, e) SHIMMER and float above the line — they can't find a clean spot. Then drop each into the Rational or Irrational bin!",
    helpText: "The line itself teaches — no Check button.\n\nDrag a number toward the line: snap = rational, shimmer = irrational. Then drop into the matching bin.\n\n✅ 1/2 snaps to its tick → Rational bin\n✅ √2 hovers and drifts → Irrational bin",
  },
  {
    id: "sci-notation",
    mechanicId: "middle-school-gaps",
    name: "Scientific Notation",
    description: "Slide the decimal point left until the coefficient lands in 1–10",
    introText: "A large number like 450000 appears. Drag the slider to move the decimal point one place at a time: 450000 → 45000.0 → 4500.00 → 450.000 → 45.0000 → 4.50000. The exponent counter ticks up as you slide. When the coefficient lands between 1 and 10, the slider locks in the green zone!",
    helpText: "Slide the decimal — no typing.\n\nAs you slide, the coefficient reformats and the exponent counter rises. Stop when the coefficient is between 1 and 10.\n\n✅ 450000: slide 5 places → 4.5 × 10^5 → locks green\n❌ Stopping at 45 × 10^4 keeps the slider unlocked — coefficient must be < 10",
  },
  {
    id: "proof-stepper",
    mechanicId: "middle-school-gaps",
    name: "Proof Stepper",
    description: "Build a proof chain by matching each card's INPUT to the previous OUTPUT",
    introText: "Each proof step is a card with a visible INPUT (assumption) and OUTPUT (conclusion). The cards are shuffled in the sidebar. Drag them into the chain — a card only locks into a slot when its INPUT matches the previous card's OUTPUT. Mismatches refuse to connect. Connect GIVEN to THEOREM step by step!",
    helpText: "Match inputs to outputs — no reordering by guess.\n\nDrag cards from the sidebar into open slots. A card locks (green) only if its IN matches the previous OUT. Wrong matches bounce back.\n\n✅ Card with IN '2x + 3 = 11' / OUT '2x = 8' fits the slot after the GIVEN '2x + 3 = 11'.",
  },

  // ─── Classic Game Overlays (classic-overlays) ───
  {
    id: "snake-math",
    mechanicId: "classic-overlays",
    name: "Snake Math",
    description: "Steer a growing crawler to eat the correct answer",
    introText: "A crawler moves continuously across the grid. Steer it to eat the food with the correct answer to each math question. Eating wrong answers shrinks you. Hitting walls or yourself costs a life!",
    helpText: "The crawler moves non-stop — steer with arrows or swipe.\n\nEat the food with the RIGHT answer to the math question.\n\n✅ Question: '3 × 4 = ?' → eat the 12\n❌ Eating 8 = wrong answer, you shrink!\n❌ Hitting walls or yourself = lose a life",
    practiceOnly: true,
  },
  {
    id: "maze-runner-math",
    mechanicId: "classic-overlays",
    name: "Maze Runner",
    description: "Navigate a maze — choose the path with the correct answer",
    introText: "You're in a maze! At each junction, paths are labeled with different values. Read the math question and pick the correct path. Wrong paths are dead ends!",
    helpText: "At each junction, click the path with the correct answer.\n\n✅ Question: 'What is 7 × 8?' → take the path labeled 56\n❌ Wrong path = dead end, you bounce back and lose a life",
    practiceOnly: true,
  },
  {
    id: "falling-blocks-math",
    mechanicId: "classic-overlays",
    name: "Falling Blocks",
    description: "Position falling number blocks so rows sum to the target",
    introText: "Numbered blocks fall from the top. Move them left and right to position them. When a row of blocks sums to the target number, it clears! Don't let blocks stack to the top.",
    helpText: "Blocks fall with numbers on them.\n\nUse arrows or tap a column to position them.\n\n✅ Target is 15 → place 8, 4, 3 in a row (8+4+3=15) → row clears!\n❌ Stack to the top = lose a life",
    practiceOnly: true,
  },
  {
    id: "dot-eater-math",
    mechanicId: "classic-overlays",
    name: "Dot Eater",
    description: "Navigate a maze collecting only the correct numbered dots",
    introText: "A maze full of numbered dots! Read the math question and collect only the dots with the correct answer. Watch out for enemies chasing you — wrong dots cost a life!",
    helpText: "Move through the maze with arrows or swipe.\n\nCollect ONLY dots matching the correct answer.\n\n✅ Question: '12 ÷ 3 = ?' → collect dots showing 4\n❌ Wrong dot = lose a life\n❌ Caught by an enemy = lose a life",
    practiceOnly: true,
  },
  {
    id: "launcher-math",
    mechanicId: "classic-overlays",
    name: "Launcher Math",
    description: "Fly through the gate with the correct answer",
    introText: "Your character flies forward automatically. Gates appear with different numbers — tap or press up to flap and steer through the gate with the correct answer. Wrong gate = crash!",
    helpText: "Tap/click or press UP to flap upward.\n\nFly through the gate with the RIGHT answer.\n\n✅ Question: '5 + 9 = ?' → fly through the gate labeled 14\n❌ Wrong gate or hitting a wall = lose a life",
    practiceOnly: true,
  },
  {
    id: "breakout-math",
    mechanicId: "classic-overlays",
    name: "Breakout Math",
    description: "Bounce a ball to break bricks that sum to the target",
    introText: "Bricks with numbers fill the top of the screen. Bounce the ball off your paddle to break bricks. Your goal: break bricks that sum to exactly the target number. Go over and penalty bricks appear!",
    helpText: "Move the paddle with your mouse/finger or arrow keys.\n\nBreak bricks that add up to the target sum.\n\n✅ Target is 20 → break bricks 8 + 5 + 7 = 20 (perfect!)\n❌ Break too many (sum > target) = penalty bricks + lose a life",
    practiceOnly: true,
  },

  // ─── Ten-Frame Combine (new reference implementation, April 14) ───
  // First game built using the Learning Contract workflow.
  // Covers K.OA.A.1, K.OA.A.2, K.OA.A.5. See docs/contracts/K.OA.A.1.md.
  {
    id: "number-frames",
    mechanicId: "number-frames",
    name: "Number Frames",
    description: "Fill ten-frames with counters, combine, and count the total",
    introText: "Two ten-frames. Fill each one with counters to show the two numbers, then combine them and count the total.",
    helpText: "Use the ten-frames to add.\n\nFill each frame with the right number of counters, then press Done. Combined counters appear. Tap each counter to count, then pick the total.",
  },
]

// ─── Lookup helpers ───

export const GAME_OPTIONS_BY_MECHANIC = new Map<string, GameOptionDef[]>()
GAME_OPTIONS.forEach(opt => {
  const list = GAME_OPTIONS_BY_MECHANIC.get(opt.mechanicId) || []
  list.push(opt)
  GAME_OPTIONS_BY_MECHANIC.set(opt.mechanicId, list)
})

export function getGameOptions(mechanicId: string): GameOptionDef[] {
  return GAME_OPTIONS_BY_MECHANIC.get(mechanicId) || []
}

export function getDefaultOption(mechanicId: string): string {
  const options = GAME_OPTIONS_BY_MECHANIC.get(mechanicId)
  return options?.[0]?.id || "free-collect"
}

export function getOptionDef(optionId: string): GameOptionDef | undefined {
  return GAME_OPTIONS.find(o => o.id === optionId)
}
