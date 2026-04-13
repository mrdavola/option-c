# Tyler Deep Dive: Ideas 2, 3, 4, 5

## Idea 2: Classic Game Overlays — Detailed Examples

The gameplay mechanics of these classic games are NOT copyrighted — they're generic game patterns. Only the specific names, characters, and art are trademarked. We use the MECHANIC, not the brand.

### Snake Math
**How it works:**
- Grid-based play area. A line (the "crawler") moves continuously in one direction
- Math question appears at the top: "What is 3/4 of 12?"
- Several food items appear on the grid, each with a number (9, 8, 3, 6)
- Player steers the crawler using arrow keys/swipe to eat the CORRECT answer (9)
- Eating correct answer: crawler grows longer, next question appears
- Eating wrong answer: crawler shrinks (or loses a life)
- Hitting the wall or yourself: lose a life
- The growing crawler makes navigation harder — pressure increases naturally

**Why it's intrinsically math:** You MUST solve the math to know which food to eat. Eating randomly = death. The time pressure of continuous movement prevents guessing.

**Works for:** Any standard where the answer is a number (most of them).

### Maze Runner Math
**How it works:**
- Top-down maze. Player character navigates through corridors
- At each intersection, paths are labeled with values
- Math condition shown: "Only walk on multiples of 7"
- Player must choose the path with 7, 14, 21, 28... 
- Wrong path = dead end (wall appears) or enemy appears
- Reach the exit to complete the round

**Why it's intrinsically math:** You can't navigate without understanding the math rule. Every step is a math decision.

**Works for:** Multiplication, factors, multiples, even/odd, number properties.

### Falling Blocks Math (Tetris-style)
**How it works:**
- Blocks fall from the top, each containing a number
- Target sum shown on the side: "Make rows that sum to 20"
- Player positions blocks left/right as they fall
- When a horizontal row of blocks sums to the target, the row clears
- If blocks stack to the top, game over
- Speed increases each round

**Why it's intrinsically math:** You must mentally add numbers and plan placement to create target sums. Pure arithmetic under time pressure.

**Works for:** Addition, subtraction, number sense, mental math.

### Dot Eater Math (Pac-Man style)
**How it works:**
- Maze with dots scattered throughout
- Math rule shown: "Collect only fractions greater than 1/2"
- Dots have values: 3/4, 1/3, 2/5, 5/8, etc.
- Correct dots: score points. Wrong dots: enemy gets faster
- Enemies chase you through the maze
- Power pellets = hint (shows which dots are correct for 5 seconds)

**Why it's intrinsically math:** Every dot is a math decision. Collecting blindly = enemies overwhelm you.

**Works for:** Fractions, decimals, inequalities, number comparison.

### Launcher Math (Flappy Bird style)
**How it works:**
- Character flies/bounces continuously
- Gates appear with numbers. Question at top: "7 × 8 = ?"
- Three gates: 54, 56, 58. Fly through the correct one (56)
- Wrong gate: crash. Correct gate: keep flying
- Speed increases. Gates get closer together.

**Why it's intrinsically math:** You must solve quickly to choose the right gate. Wrong = instant fail.

**Works for:** Multiplication facts, quick arithmetic, any single-answer question.

### Breakout Math
**How it works:**
- Wall of bricks at the top, each with a number
- Ball bounces off paddle at bottom
- Target shown: "Break bricks that sum to exactly 24"
- Player aims the ball at specific bricks to hit the target sum
- Breaking wrong bricks adds penalty bricks
- Clear the target to advance

**Why it's intrinsically math:** Aiming requires knowing which numbers you need. Strategic targeting = addition/subtraction planning.

**Works for:** Addition to target, number decomposition, strategic math.

---

## Idea 3: HTML Modding Lab — Detailed Step-by-Step

### How the learner would do it:

**Step 1: Build a normal game**
Learner goes through the regular flow: moon → assembler → build → test → submit → approved.

**Step 2: Open the Modding Lab**
On the game's page (in My Stuff or Library), a new button: "Open in Modding Lab" (only for their own approved games).

**Step 3: The editor loads**
Split screen:
- LEFT: Code editor (simplified, like CodePen but simpler)
- RIGHT: Live preview of the game

The code is the game's HTML, split into two visible sections:
- 🟢 **GREEN zone** (editable): CSS styles, text content, colors, sizes, positions, images
- 🔴 **RED zone** (read-only): JavaScript game logic, math functions, answer checking

**Step 4: What they can change**
- Background colors: `background: #18181b` → `background: #1a0a2e`
- Font sizes: `fontSize: '16px'` → `fontSize: '20px'`
- Element positions: `left: '50%'` → `left: '30%'`
- Text content: `'Score:'` → `'Points:'`
- Add CSS animations: `@keyframes glow { ... }`
- Change sprite sizes
- Add decorative HTML elements (divs with borders, gradients)

**Step 5: What they CANNOT change**
- Any `<script>` tag contents (game logic)
- The `getRound()` function
- Answer checking functions
- Score calculation
- Win/lose conditions
- The `gameWin()` / `gameLose()` protocol

**Step 6: Save as mod**
Click "Save Mod" → system validates:
1. Extract all `<script>` blocks from the modified HTML
2. Compare with the original game's `<script>` blocks (character-by-character)
3. If ANY script content changed → REJECT: "You can only change how the game looks, not how it works"
4. If only CSS/HTML changed → ACCEPT: save as a new version

**Step 7: Play and share**
The modded game works exactly like the original (same math, same engine) but looks different. Other learners can play it. Credit goes to both the original builder and the modder.

### What code editor to use:
**Monaco Editor** (the same engine VS Code uses). It's open source, runs in the browser, and supports:
- Syntax highlighting
- Read-only regions (exactly what we need)
- Line numbers
- Auto-complete for CSS

We'd configure Monaco to mark `<script>` blocks as read-only. The editor physically prevents typing inside them — the cursor skips over red zones.

### Risks:
1. **Learner breaks the layout** — game becomes unplayable visually. Fix: "Reset to original" button always available
2. **Learner adds offensive content** — text/images. Fix: same content moderation as game names
3. **Learner injects script via CSS** — e.g., `background: url(javascript:...)`. Fix: sanitize CSS, strip any `javascript:` or `expression()` patterns
4. **Performance** — learner adds heavy CSS animations. Fix: limit the size of modifications (max +5KB over original)

---

## Idea 4: Drag-and-Drop Scene Builder (Scratch-like)

### The Problem
If you let learners freely position game elements, the gameplay breaks:
- Math question overlaps the answer buttons
- Items go off-screen
- Interactive zones don't align with visual elements

### The Solution: Constrained Canvas

Instead of free positioning, give learners a **zone-based layout system**:

```
┌─────────────────────────────┐
│ [QUESTION ZONE]   [SCORE]   │  ← Fixed, can't move
├─────────────────────────────┤
│                             │
│   [PLAY AREA]               │  ← Learner customizes INSIDE this
│   - Background (drag image) │
│   - Decorations (place any) │
│   - Character position (pick│
│     from 4 spots)           │
│                             │
├─────────────────────────────┤
│ [INTERACTION ZONE]          │  ← Fixed layout, learner picks style
│ (buttons / number pad /     │
│  slider / click targets)    │
└─────────────────────────────┘
```

**What the learner controls:**
1. **Background**: upload or pick, it fills the play area
2. **Decorations**: drag decorative elements anywhere in the play area (clouds, trees, stars, borders). These are purely visual — no collision or interaction
3. **Character position**: pick from 4 preset spots (top-left, top-right, bottom-left, center)
4. **Item layout**: choose grid, circle, or random arrangement for clickable items
5. **Color scheme**: pick accent colors that restyle buttons and text
6. **Sound effects**: pick from a library of click/correct/wrong sounds

**What's locked:**
- Question zone position and content (AI-generated)
- Score/hearts/round dots position
- Interaction mechanics (how clicking/dragging works)
- Answer validation
- Win/lose conditions

### How decorations work without breaking gameplay:
- Decorations are rendered on a **separate layer** BEHIND interactive elements
- They have `pointer-events: none` — clicks pass through them
- They can't overlap the question zone or interaction zone (constrained to play area)
- Maximum 10 decorations per game
- Decorations are purely CSS/SVG positioned elements, no JavaScript

### Step by step:
1. Learner builds game normally (assembler → build)
2. Before testing, a "Customize Layout" option appears
3. Canvas view opens: game preview with draggable decoration layer
4. Learner drags items from a decoration tray: trees, rocks, sparkles, borders, text labels
5. Picks character position from 4 spots
6. Picks color scheme from 5 presets
7. Clicks "Done" → game generates with their layout applied as a CSS overlay
8. The math engine runs identically — only the visual layer changes

### What could go wrong and how to prevent it:
| Risk | Prevention |
|------|-----------|
| Decoration covers answer buttons | Decorations on separate z-layer, pointer-events: none |
| Too many decorations = lag | Max 10 items, each < 50KB |
| Decoration contains text that gives away answer | Decorations are from a pre-approved library, no free text |
| Player puts character in a confusing spot | Only 4 preset spots to choose from |
| Color scheme makes text unreadable | Presets only, all tested for contrast |

---

## Idea 5: Character Customization — That Actually Works

### Instead of accessories that get dropped during gameplay:

**The character IS the player's identity across ALL their games.**

1. **Character Creator** (one-time, in My Stuff):
   - Pick a base body (stick figure, round body, tall body, small body)
   - Pick a color (skin/body color from a palette)
   - Pick hair/hat (10 options)
   - Pick an accessory (glasses, scarf, cape, crown, none)
   - Pick an expression (happy, determined, cool, silly)
   - Give it a name

2. **The character appears IN every game they build:**
   - Idle: bobs gently (already built)
   - Correct answer: cheers with their chosen expression (already built)
   - Wrong answer: shakes head (already built)
   - Victory: does a celebration based on their accessory (cape = flying spin, crown = royal wave, glasses = smart nod)

3. **The character appears on their profile:**
   - Next to their name in My Stuff
   - On the leaderboard
   - In the Game Library (author avatar)

4. **Other learners SEE the character:**
   - When playing someone's game, the author's character appears as the guide/host
   - "This game was built by [character name] 🧙‍♂️"

### Why this works:
- It's NOT an in-game gimmick that gets forgotten
- It's the learner's IDENTITY — they care about it
- It persists across all games and appears everywhere
- Zero math impact — purely visual/social
- Creates emotional investment in the platform

### Technical implementation:
- Store character config in the user's Firestore profile: `{ body: "round", color: "#ff6b6b", hair: "spiky", accessory: "cape", expression: "determined", name: "Blaze" }`
- Render as a layered SVG (body layer + hair layer + accessory layer + expression layer)
- Pass to game engines as the character sprite URL (replaces the library character)
- Display on profile/leaderboard as a small avatar

Sources:
- [Snake Math Game](https://dissonantsymphony.com/2015/04/21/snake-math-game/)
- [Math Snake on Google Play](https://play.google.com/store/apps/details?id=math.snake)
- [CodePen Editor](https://codepen.io/)
- [Scratch Drag and Drop](https://scarfedigitalsandbox.teach.educ.ubc.ca/drag-and-drop-programming-scratch/)
- [HTMLifier — Scratch to HTML](https://sheeptester.github.io/htmlifier/)
- [Monaco Editor (VS Code engine)](https://microsoft.github.io/monaco-editor/)
