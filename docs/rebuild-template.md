# Rebuild Template (for implementation agents)

When an implementation agent rebuilds a game, follow this template exactly.

## Input (spec provided)
- Engine file path
- Game option ID (e.g., "free-balance")
- Math operation (the standard's actual skill)
- Design pattern to apply (from `intrinsic-design-patterns.md`)
- Detailed redesign concept
- Any existing code to preserve

## Reference
- `src/lib/game-engines/balance-systems-phaser.ts` → `MysterySideScene` is the REFERENCE IMPLEMENTATION. Study it before writing.
- It has: equation display at top, scale visualization, constrained tools, live equation update, solution reveal card, Next Round button.

## Required in every rebuild

### 1. Scene structure
```javascript
class [OptionName]Scene extends Phaser.Scene {
  constructor() { super('[OptionName]Scene'); }
  create() {
    this.W = this.scale.width;
    this.H = this.scale.height;
    this.round = 0;
    this.lives = MAX_LIVES;
    this._buildBackground();    // Uses 'bg' texture (theme background)
    this._buildUI();             // Score, hearts, dots, equation, prompt, status
    this._buildMathVisualization(); // The core visual (scale, number line, etc.)
    this._buildControls();        // Constrained tools that enforce the invariant
    this.hero = addCharacter(this, this.W * 0.88, this.H * 0.55, 0.8);  // Visible hero
    this.startRound();
  }
  // ... scene methods
}
```

### 2. UI elements (required)
- **scoreLbl** top-right: "Score: N"
- **heartsGroup** top-left: MAX_LIVES hearts
- **dotGroup** bottom-center: TOTAL_ROUNDS progress dots
- **equationLbl** top-center: the problem being solved (large, colorful)
- **promptLbl** below equation: brief instruction
- **statusLbl** middle: live state update as player acts

### 3. Round handling
- Use `getRound(this.round)` to fetch AI-generated round data
- Have a FALLBACK round variation array (5 rounds of different values) for when AI fails
- Detect default/empty rounds: check if `data.prompt === 'Solve this!'` or items match defaults [10, 5, 8, 3, 12, 7]

### 4. Solution reveal card (required)
When the player solves a round, show a full-screen card with:
- Backdrop (semi-transparent)
- Card container
- "You solved it!" headline
- Step-by-step algebra/reasoning (staggered appearance, 200ms each)
- Final answer (bold, colored, larger font)
- "Got it! Next round →" button (or "Finish!" on last round)

### 5. Two tests — VERIFY before finishing
Write a comment at the top of the scene:
```javascript
// ═══════════════════════════════════════════════════════════════════════════════
// [SceneName] — INTRINSIC REBUILD (April 13)
//
// Teaches: [the math operation]
// How it's intrinsic:
//   - Discovery: [how the game teaches the concept]
//   - Self-revealing truth: [how correctness is shown by physics, not a popup]
// ═══════════════════════════════════════════════════════════════════════════════
```

### 6. Update game-option-registry.ts
Update the option's description, introText, and helpText to match the new mechanic.

## What to AVOID

- ❌ Dragging items with visible numbers onto a target (that's selection)
- ❌ Typing answers via keypad (that's a quiz)
- ❌ Multiple-choice buttons (that's a quiz)
- ❌ "Correct!" or "Wrong!" popups (use physical feedback instead)
- ❌ Game mechanic that's just decoration around a math question

## The 2 Tests (apply rigorously)

1. **Discovery:** Can a learner who doesn't know the math LEARN it by playing? The game must teach through its mechanics.
2. **Self-Revealing Truth:** Correctness is shown by game-world physics/behavior, not by a judgment popup.

Both must pass. If you can't make a game pass both, mark it Practice-only.

## Output

- Updated `src/lib/game-engines/[engine]-phaser.ts`
- Updated `src/lib/game-engines/game-option-registry.ts` entry
- A brief note (in the rebuild docs) describing what changed and how the new design passes both tests
