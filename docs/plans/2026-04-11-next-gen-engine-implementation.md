# Next-Gen Phaser Engine Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the Collect & Manage engine's DOM-based rendering with Phaser 3.90 + sprites, add a sprite library and student artwork upload flow, and test on one Grade 4 moon.

**Architecture:** The existing engine registry (`src/lib/game-engines/index.ts`) maps mechanic IDs to engine functions that return HTML strings. We create a new Phaser-based Collect & Manage engine that returns a single HTML file with Phaser loaded via CDN, sprite URLs injected, and the same postMessage protocol. The Game Card Builder gets a new "artwork" step. Student uploads go to Firebase Storage.

**Tech Stack:** Phaser 3.90 (CDN), Firebase Storage (uploads), Next.js 16 API routes, TypeScript, existing Haiku AI for ThemeConfig generation.

**Design doc:** `docs/plans/2026-04-11-next-gen-engine-design.md`

---

## Task 1: Add Sprite Library Assets

**Files:**
- Create: `public/sprites/characters/` (10 PNG files)
- Create: `public/sprites/items/` (10 PNG files)
- Create: `public/sprites/backgrounds/` (10 PNG files)

**Step 1: Create sprite directories**

```bash
mkdir -p public/sprites/characters public/sprites/items public/sprites/backgrounds
```

**Step 2: Generate placeholder sprites**

Use AI image generation or source free game asset packs. Create simple, clean 256x256 PNG sprites with transparent backgrounds for characters and items, 800x600 for backgrounds.

Characters (10): `pirate.png`, `robot.png`, `astronaut.png`, `knight.png`, `chef.png`, `diver.png`, `ghost.png`, `ninja.png`, `wizard.png`, `explorer.png`

Items (10): `coin.png`, `gem.png`, `treasure-chest.png`, `crystal.png`, `potion.png`, `fruit.png`, `star.png`, `shell.png`, `mushroom.png`, `key.png`

Backgrounds (10): `underwater.png`, `space.png`, `forest.png`, `castle.png`, `kitchen.png`, `cave.png`, `city.png`, `volcano.png`, `arctic.png`, `jungle.png`

**Step 3: Create sprite registry**

Create `src/lib/sprite-library.ts`:

```typescript
export const SPRITE_CHARACTERS = [
  { id: "pirate", label: "Pirate", keywords: ["ocean", "ship", "treasure", "sea", "water"] },
  { id: "robot", label: "Robot", keywords: ["tech", "space", "factory", "machine", "cyber"] },
  { id: "astronaut", label: "Astronaut", keywords: ["space", "moon", "planet", "star", "galaxy"] },
  { id: "knight", label: "Knight", keywords: ["castle", "medieval", "dragon", "kingdom", "sword"] },
  { id: "chef", label: "Chef", keywords: ["kitchen", "food", "cook", "restaurant", "recipe"] },
  { id: "diver", label: "Diver", keywords: ["ocean", "underwater", "sea", "shipwreck", "coral"] },
  { id: "ghost", label: "Ghost", keywords: ["haunted", "spooky", "castle", "night", "dark"] },
  { id: "ninja", label: "Ninja", keywords: ["stealth", "temple", "shadow", "warrior", "dojo"] },
  { id: "wizard", label: "Wizard", keywords: ["magic", "spell", "tower", "enchanted", "potion"] },
  { id: "explorer", label: "Explorer", keywords: ["jungle", "cave", "forest", "adventure", "map"] },
] as const

export const SPRITE_ITEMS = [
  { id: "coin", label: "Coins", keywords: ["treasure", "gold", "pirate", "money", "rich"] },
  { id: "gem", label: "Gems", keywords: ["crystal", "jewel", "cave", "mine", "sparkle"] },
  { id: "treasure-chest", label: "Treasure Chests", keywords: ["pirate", "gold", "ship", "loot", "hidden"] },
  { id: "crystal", label: "Crystals", keywords: ["magic", "cave", "glow", "enchanted", "power"] },
  { id: "potion", label: "Potions", keywords: ["magic", "wizard", "spell", "brew", "alchemy"] },
  { id: "fruit", label: "Fruit", keywords: ["kitchen", "food", "nature", "garden", "fresh"] },
  { id: "star", label: "Stars", keywords: ["space", "sky", "night", "galaxy", "cosmic"] },
  { id: "shell", label: "Shells", keywords: ["ocean", "beach", "sea", "underwater", "coral"] },
  { id: "mushroom", label: "Mushrooms", keywords: ["forest", "nature", "magic", "enchanted", "fairy"] },
  { id: "key", label: "Keys", keywords: ["lock", "door", "treasure", "secret", "dungeon"] },
] as const

export const SPRITE_BACKGROUNDS = [
  { id: "underwater", label: "Underwater", keywords: ["ocean", "sea", "dive", "coral", "fish"] },
  { id: "space", label: "Outer Space", keywords: ["star", "planet", "galaxy", "cosmic", "moon"] },
  { id: "forest", label: "Enchanted Forest", keywords: ["tree", "nature", "magic", "fairy", "mushroom"] },
  { id: "castle", label: "Castle", keywords: ["medieval", "knight", "kingdom", "stone", "tower"] },
  { id: "kitchen", label: "Kitchen", keywords: ["food", "cook", "chef", "recipe", "restaurant"] },
  { id: "cave", label: "Crystal Cave", keywords: ["dark", "gem", "crystal", "mine", "underground"] },
  { id: "city", label: "Neon City", keywords: ["urban", "cyber", "tech", "robot", "night"] },
  { id: "volcano", label: "Volcano", keywords: ["lava", "fire", "hot", "mountain", "dragon"] },
  { id: "arctic", label: "Arctic", keywords: ["ice", "snow", "cold", "polar", "frozen"] },
  { id: "jungle", label: "Jungle", keywords: ["tropical", "vine", "explorer", "adventure", "wild"] },
] as const

export type SpriteId = typeof SPRITE_CHARACTERS[number]["id"]
export type ItemSpriteId = typeof SPRITE_ITEMS[number]["id"]
export type BackgroundId = typeof SPRITE_BACKGROUNDS[number]["id"]

// Resolve a sprite ID (or upload URL) to a full URL
export function resolveSpriteUrl(
  type: "characters" | "items" | "backgrounds",
  idOrUrl: string
): string {
  // If it's already a URL (student upload), return as-is
  if (idOrUrl.startsWith("http") || idOrUrl.startsWith("data:")) return idOrUrl
  // Otherwise resolve from library
  return `/sprites/${type}/${idOrUrl}.png`
}
```

**Step 4: Commit**

```bash
git add public/sprites/ src/lib/sprite-library.ts
git commit -m "feat: add sprite library with 30 assets and registry"
```

---

## Task 2: Extend ThemeConfig for Sprites

**Files:**
- Modify: `src/lib/game-engines/engine-types.ts` (lines 3-21, ThemeConfig interface)

**Step 1: Add sprite fields to ThemeConfig**

In `src/lib/game-engines/engine-types.ts`, add three optional fields to the ThemeConfig interface (optional so existing engines don't break):

```typescript
export interface ThemeConfig {
  title: string
  character: string
  itemName: string
  targetName: string
  worldName: string
  colors: {
    bg: string
    primary: string
    secondary: string
    accent: string
    danger: string
    text: string
  }
  vibe: "kawaii" | "stickman" | "c64"
  winMessage: string
  loseMessage: string
  dare?: string
  // Sprite overrides (Phase 1: Phaser engines)
  characterSprite?: string   // sprite library ID or upload URL
  itemSprite?: string        // sprite library ID or upload URL
  backgroundImage?: string   // sprite library ID or upload URL
}
```

**Step 2: Verify existing engines still compile**

```bash
npx next build
```

Expected: PASS (new fields are optional, no existing code breaks).

**Step 3: Commit**

```bash
git add src/lib/game-engines/engine-types.ts
git commit -m "feat: add sprite fields to ThemeConfig interface"
```

---

## Task 3: Build the Phaser Collect & Manage Engine

**Files:**
- Create: `src/lib/game-engines/collect-manage-phaser.ts`

**Step 1: Write the new Phaser engine**

Create `src/lib/game-engines/collect-manage-phaser.ts`. This is a large file — the engine function returns a complete HTML string containing:

- Phaser 3.90 loaded via CDN
- Three Phaser scenes: BootScene (preload), GameScene (gameplay), VictoryScene (celebration)
- Sprite-based character, items, and background
- Same postMessage protocol (`game_win`, `game_lose`)
- Same 5-round progressive difficulty
- Same variant support (classic, timed, challenge)

```typescript
import type { ThemeConfig, MathParams, GameVariant } from "./engine-types"
import { resolveSpriteUrl } from "../sprite-library"

export function collectManagePhaserEngine(
  config: ThemeConfig,
  math: MathParams,
  variant: GameVariant = "classic"
): string {
  const c = config.colors
  const characterUrl = resolveSpriteUrl("characters", config.characterSprite || "explorer")
  const itemUrl = resolveSpriteUrl("items", config.itemSprite || "coin")
  const bgUrl = resolveSpriteUrl("backgrounds", config.backgroundImage || "forest")

  const timerSeconds = variant === "timed" ? 45 : 0
  const isChallenge = variant === "challenge"

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${config.title}</title>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js"><\/script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: ${c.bg}; overflow: hidden; }
  canvas { display: block; margin: 0 auto; }
</style>
</head>
<body>
<!-- coreVerb: collect-manage-phaser -->
<script>
const THEME = ${JSON.stringify({
    title: config.title,
    character: config.character,
    itemName: config.itemName,
    worldName: config.worldName,
    winMessage: config.winMessage,
    loseMessage: config.loseMessage,
    dare: config.dare || "",
    colors: config.colors,
    vibe: config.vibe,
  })};
const MATH = ${JSON.stringify(math)};
const TIMER_SECONDS = ${timerSeconds};
const IS_CHALLENGE = ${isChallenge};
const TOTAL_ROUNDS = 5;

// ── BootScene: preload all assets ──
class BootScene extends Phaser.Scene {
  constructor() { super("Boot"); }

  preload() {
    // Loading bar
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const bar = this.add.graphics();
    const box = this.add.graphics();
    box.fillStyle(0x222222, 0.8);
    box.fillRect(w/4, h/2 - 15, w/2, 30);

    this.load.on("progress", (v) => {
      bar.clear();
      bar.fillStyle(parseInt(THEME.colors.primary.replace("#",""), 16), 1);
      bar.fillRect(w/4 + 4, h/2 - 11, (w/2 - 8) * v, 22);
    });

    this.load.image("bg", "${bgUrl}");
    this.load.image("character", "${characterUrl}");
    this.load.image("item", "${itemUrl}");
  }

  create() { this.scene.start("Game"); }
}

// ── GameScene: core gameplay ──
class GameScene extends Phaser.Scene {
  constructor() { super("Game"); }

  create() {
    this.score = 0;
    this.currentRound = 0;
    this.collectedValues = [];
    this.currentTotal = 0;
    this.wrongCount = 0;

    // Background (stretched to fill)
    const bg = this.add.image(400, 300, "bg").setDisplaySize(800, 600);

    // Semi-transparent overlay for readability
    this.add.rectangle(400, 300, 800, 600, parseInt(THEME.colors.bg.replace("#",""), 16), 0.4);

    // Character sprite (bottom-left, bobbing idle animation)
    this.characterSprite = this.add.image(100, 480, "character")
      .setDisplaySize(96, 96).setOrigin(0.5, 1);
    this.tweens.add({
      targets: this.characterSprite,
      y: this.characterSprite.y - 6,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    // Header: title + score
    this.add.text(400, 20, THEME.title, {
      fontSize: "22px", fontFamily: "Arial, sans-serif",
      color: THEME.colors.text, fontStyle: "bold"
    }).setOrigin(0.5, 0);

    this.scoreText = this.add.text(750, 20, "Score: 0", {
      fontSize: "16px", fontFamily: "Arial, sans-serif",
      color: THEME.colors.accent
    }).setOrigin(1, 0);

    // Round dots
    this.roundDots = [];
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      const dot = this.add.circle(340 + i * 24, 55, 8,
        parseInt(THEME.colors.secondary.replace("#",""), 16), 0.4);
      this.roundDots.push(dot);
    }

    // Target display
    this.targetText = this.add.text(400, 100, "", {
      fontSize: "18px", fontFamily: "Arial, sans-serif", color: THEME.colors.text
    }).setOrigin(0.5);

    this.targetNumber = this.add.text(400, 140, "", {
      fontSize: "56px", fontFamily: "Arial, sans-serif",
      color: THEME.colors.accent, fontStyle: "bold"
    }).setOrigin(0.5);

    // Current total
    this.totalLabel = this.add.text(400, 195, "You have:", {
      fontSize: "14px", fontFamily: "Arial, sans-serif",
      color: THEME.colors.text, alpha: 0.6
    }).setOrigin(0.5);

    this.totalText = this.add.text(400, 225, "0", {
      fontSize: "40px", fontFamily: "Arial, sans-serif",
      color: THEME.colors.primary, fontStyle: "bold"
    }).setOrigin(0.5);

    // Items container area
    this.itemSprites = [];

    // Done button
    this.doneBtn = this.add.text(400, 540, "  Done!  ", {
      fontSize: "20px", fontFamily: "Arial, sans-serif",
      color: THEME.colors.bg, backgroundColor: THEME.colors.primary,
      padding: { x: 24, y: 10 }, fontStyle: "bold"
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.doneBtn.on("pointerdown", () => this.checkCollection());
    this.doneBtn.on("pointerover", () => this.doneBtn.setScale(1.05));
    this.doneBtn.on("pointerout", () => this.doneBtn.setScale(1));

    // Help button
    const helpBtn = this.add.text(770, 570, " ? ", {
      fontSize: "18px", fontFamily: "Arial, sans-serif",
      color: THEME.colors.text, backgroundColor: THEME.colors.secondary + "88",
      padding: { x: 8, y: 4 }
    }).setOrigin(1, 1).setInteractive({ useHandCursor: true });
    helpBtn.on("pointerdown", () => this.toggleHelp());
    this.helpPanel = null;

    // Timer bar (timed variant)
    this.timerBar = null;
    this.timerEvent = null;
    if (TIMER_SECONDS > 0) {
      this.timerBg = this.add.rectangle(400, 75, 300, 8,
        parseInt(THEME.colors.secondary.replace("#",""), 16), 0.3).setOrigin(0.5);
      this.timerBar = this.add.rectangle(250, 75, 300, 8,
        parseInt(THEME.colors.accent.replace("#",""), 16), 1).setOrigin(0, 0.5);
    }

    // Particles emitter (for celebrations)
    this.particles = this.add.particles(0, 0, "item", {
      speed: { min: 100, max: 300 },
      angle: { min: 220, max: 320 },
      scale: { start: 0.3, end: 0 },
      lifespan: 800,
      gravityY: 400,
      emitting: false,
      quantity: 8,
    });

    this.startRound();
  }

  startRound() {
    this.collectedValues = [];
    this.currentTotal = 0;
    this.totalText.setText("0");
    this.totalText.setColor(THEME.colors.primary);

    // Clear old items
    this.itemSprites.forEach(s => s.destroy());
    this.itemSprites = [];

    // Difficulty scaling
    const round = this.currentRound;
    const minTarget = 10 + round * 8;
    const maxTarget = 20 + round * 12;
    this.targetValue = Phaser.Math.Between(minTarget, maxTarget);

    // Generate items
    const count = 5 + Math.floor(round * 1.5);
    const values = this.generateValues(this.targetValue, count);

    this.targetText.setText("Collect exactly:");
    this.targetNumber.setText(this.targetValue.toString());

    // Whoosh in the target
    this.targetNumber.setScale(0);
    this.tweens.add({ targets: this.targetNumber, scale: 1, duration: 400, ease: "Back.easeOut" });

    // Spawn items with staggered drop animation
    const startX = 200;
    const spacing = 75;
    const cols = Math.min(count, 6);

    values.forEach((val, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * spacing + Phaser.Math.Between(-10, 10);
      const y = 300 + row * 80 + Phaser.Math.Between(-5, 5);

      const container = this.add.container(x, -50);

      const img = this.add.image(0, 0, "item").setDisplaySize(52, 52);
      const label = this.add.text(0, 0,
        IS_CHALLENGE ? "?" : val.toString(), {
        fontSize: "18px", fontFamily: "Arial, sans-serif",
        color: "#fff", fontStyle: "bold"
      }).setOrigin(0.5);

      container.add([img, label]);
      container.setSize(52, 52);
      container.setInteractive({ useHandCursor: true });
      container.itemValue = val;
      container.label = label;
      container.collected = false;

      // Drop in animation
      this.tweens.add({
        targets: container,
        y: y,
        duration: 500,
        delay: i * 80,
        ease: "Bounce.easeOut"
      });

      // Hover effects
      container.on("pointerover", () => {
        this.tweens.add({ targets: container, scale: 1.15, duration: 100 });
        if (IS_CHALLENGE) label.setText(val.toString());
      });
      container.on("pointerout", () => {
        this.tweens.add({ targets: container, scale: 1, duration: 100 });
        if (IS_CHALLENGE) label.setText("?");
      });

      // Click to collect
      container.on("pointerdown", () => {
        if (container.collected) return;
        container.collected = true;
        this.collectItem(container, val);
      });

      this.itemSprites.push(container);
    });

    // Start timer if timed variant
    if (TIMER_SECONDS > 0 && this.timerBar) {
      this.timerBar.width = 300;
      if (this.timerEvent) this.timerEvent.remove();
      this.timerEvent = this.time.addEvent({
        delay: TIMER_SECONDS * 1000,
        callback: () => this.timesUp(),
      });
      this.tweens.add({
        targets: this.timerBar,
        width: 0,
        duration: TIMER_SECONDS * 1000,
        ease: "Linear",
      });
    }
  }

  generateValues(target, count) {
    // Ensure at least one valid subset sums to target
    const values = [];
    let remaining = target;
    const subsetSize = Phaser.Math.Between(2, Math.min(4, count - 1));

    for (let i = 0; i < subsetSize - 1; i++) {
      const maxVal = Math.max(1, remaining - (subsetSize - i - 1));
      const v = Phaser.Math.Between(1, Math.min(maxVal, Math.ceil(target / 2)));
      values.push(v);
      remaining -= v;
    }
    values.push(remaining); // last piece completes the target

    // Fill rest with distractors
    while (values.length < count) {
      values.push(Phaser.Math.Between(1, Math.ceil(target * 0.8)));
    }

    return Phaser.Utils.Array.Shuffle(values);
  }

  collectItem(container, value) {
    this.collectedValues.push(value);
    this.currentTotal += value;
    this.totalText.setText(this.currentTotal.toString());

    // Color code the total
    if (this.currentTotal === this.targetValue) {
      this.totalText.setColor(THEME.colors.accent);
    } else if (this.currentTotal > this.targetValue) {
      this.totalText.setColor(THEME.colors.danger);
    } else {
      this.totalText.setColor(THEME.colors.primary);
    }

    // Animate: shrink and fly to total display
    this.tweens.add({
      targets: container,
      x: 400, y: 225, scale: 0.2, alpha: 0,
      duration: 350, ease: "Cubic.easeIn",
      onComplete: () => container.destroy()
    });

    // Score pop
    const pop = this.add.text(container.x, container.y, "+" + value, {
      fontSize: "16px", fontFamily: "Arial, sans-serif",
      color: THEME.colors.accent, fontStyle: "bold"
    }).setOrigin(0.5);
    this.tweens.add({
      targets: pop, y: pop.y - 40, alpha: 0,
      duration: 600, onComplete: () => pop.destroy()
    });
  }

  checkCollection() {
    if (this.currentTotal === this.targetValue) {
      this.roundWin();
    } else if (this.currentTotal > this.targetValue) {
      this.roundWrong("Too much!");
    } else {
      this.roundWrong("Not enough!");
    }
  }

  roundWin() {
    if (this.timerEvent) this.timerEvent.remove();
    const points = 10 * (this.currentRound + 1);
    this.score += points;
    this.scoreText.setText("Score: " + this.score);

    // Light up round dot
    this.roundDots[this.currentRound].setFillStyle(
      parseInt(THEME.colors.accent.replace("#",""), 16), 1);

    // Character celebration
    this.tweens.add({
      targets: this.characterSprite,
      y: this.characterSprite.y - 20, duration: 200, yoyo: true, ease: "Quad.easeOut"
    });

    // Particles burst
    this.particles.setPosition(400, 225);
    this.particles.explode(12);

    this.currentRound++;
    if (this.currentRound >= TOTAL_ROUNDS) {
      this.time.delayedCall(800, () => this.scene.start("Victory", { score: this.score }));
    } else {
      this.time.delayedCall(800, () => this.startRound());
    }
  }

  roundWrong(msg) {
    this.wrongCount++;

    // Screen shake
    this.cameras.main.shake(300, 0.01);

    // Character flinch
    this.tweens.add({
      targets: this.characterSprite,
      x: this.characterSprite.x - 8, duration: 50, yoyo: true, repeat: 3
    });

    // Flash message
    const flash = this.add.text(400, 280, msg, {
      fontSize: "20px", fontFamily: "Arial, sans-serif",
      color: THEME.colors.danger, fontStyle: "bold"
    }).setOrigin(0.5);
    this.tweens.add({
      targets: flash, alpha: 0, y: flash.y - 30,
      duration: 1000, onComplete: () => flash.destroy()
    });

    // Reset collected items back
    this.collectedValues = [];
    this.currentTotal = 0;
    this.totalText.setText("0");
    this.totalText.setColor(THEME.colors.primary);

    // 3 wrong = game over
    if (this.wrongCount >= 3) {
      this.time.delayedCall(500, () => {
        window.parent.postMessage({ type: "game_lose" }, "*");
      });
    }

    // Regenerate items
    this.time.delayedCall(600, () => this.startRound());
  }

  timesUp() {
    window.parent.postMessage({ type: "game_lose" }, "*");
  }

  toggleHelp() {
    if (this.helpPanel) {
      this.helpPanel.destroy();
      this.helpPanel = null;
      return;
    }
    const bg = this.add.rectangle(400, 300, 500, 350,
      parseInt(THEME.colors.bg.replace("#",""), 16), 0.95);
    const title = this.add.text(400, 160, "How to play", {
      fontSize: "22px", fontFamily: "Arial, sans-serif",
      color: THEME.colors.text, fontStyle: "bold"
    }).setOrigin(0.5);
    const body = this.add.text(400, 300,
      "Each round shows a target number.\\n\\n" +
      "Click " + THEME.itemName + " to collect them.\\n" +
      "Your total must match the target exactly.\\n\\n" +
      "Example: Target is 15\\n" +
      "Click items worth 8 + 7 = 15  (correct!)\\n" +
      "Click items worth 8 + 9 = 17  (too much!)", {
      fontSize: "14px", fontFamily: "Arial, sans-serif",
      color: THEME.colors.text, align: "center", lineSpacing: 6
    }).setOrigin(0.5);
    const close = this.add.text(400, 420, "  Got it  ", {
      fontSize: "16px", fontFamily: "Arial, sans-serif",
      color: THEME.colors.bg, backgroundColor: THEME.colors.primary,
      padding: { x: 16, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    close.on("pointerdown", () => this.toggleHelp());
    this.helpPanel = this.add.container(0, 0, [bg, title, body, close]);
  }
}

// ── VictoryScene: celebration + postMessage ──
class VictoryScene extends Phaser.Scene {
  constructor() { super("Victory"); }

  create(data) {
    const bg = this.add.image(400, 300, "bg").setDisplaySize(800, 600);
    this.add.rectangle(400, 300, 800, 600,
      parseInt(THEME.colors.bg.replace("#",""), 16), 0.6);

    // Character victory pose
    const char = this.add.image(400, 350, "character").setDisplaySize(120, 120).setScale(0);
    this.tweens.add({ targets: char, scale: 1, duration: 600, ease: "Back.easeOut" });

    // Win text
    const winText = this.add.text(400, 180, THEME.winMessage, {
      fontSize: "32px", fontFamily: "Arial, sans-serif",
      color: THEME.colors.accent, fontStyle: "bold"
    }).setOrigin(0.5).setScale(0);
    this.tweens.add({ targets: winText, scale: 1, duration: 500, delay: 300, ease: "Back.easeOut" });

    // Score
    this.add.text(400, 240, "Score: " + data.score, {
      fontSize: "20px", fontFamily: "Arial, sans-serif",
      color: THEME.colors.text
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({
      targets: this.children.list[this.children.list.length - 1],
      alpha: 1, duration: 400, delay: 600
    });

    // Dare text
    if (THEME.dare) {
      this.add.text(400, 280, '"' + THEME.dare + '"', {
        fontSize: "14px", fontFamily: "Arial, sans-serif",
        color: THEME.colors.text, fontStyle: "italic", alpha: 0.7
      }).setOrigin(0.5);
    }

    // Fireworks particles
    const particles = this.add.particles(0, 0, "item", {
      speed: { min: 150, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.4, end: 0 },
      lifespan: 1200,
      gravityY: 200,
      emitting: false,
      quantity: 15,
    });

    // Burst fireworks at intervals
    [0, 400, 800, 1200].forEach((delay) => {
      this.time.delayedCall(delay, () => {
        particles.setPosition(Phaser.Math.Between(150, 650), Phaser.Math.Between(100, 400));
        particles.explode(15);
      });
    });

    // Send win message after celebration
    this.time.delayedCall(2000, () => {
      window.parent.postMessage({ type: "game_win" }, "*");
    });
  }
}

// ── Launch game ──
new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: document.body,
  backgroundColor: THEME.colors.bg,
  scene: [BootScene, GameScene, VictoryScene],
  physics: { default: "arcade", arcade: { gravity: { y: 0 }, debug: false } },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});
<\/script>
</body>
</html>`;
}
```

**Step 2: Verify it compiles**

```bash
npx next build
```

Expected: PASS

**Step 3: Commit**

```bash
git add src/lib/game-engines/collect-manage-phaser.ts
git commit -m "feat: add Phaser-based Collect & Manage engine"
```

---

## Task 4: Register the Phaser Engine

**Files:**
- Modify: `src/lib/game-engines/index.ts` (lines 1-5 imports, lines 24-44 registry)

**Step 1: Import and register the new engine**

Add import at top of `src/lib/game-engines/index.ts`:

```typescript
import { collectManagePhaserEngine } from "./collect-manage-phaser"
```

Replace the `"resource-management"` entry in ENGINE_REGISTRY:

```typescript
"resource-management": collectManagePhaserEngine,
```

This means ALL Collect & Manage games now use the Phaser engine. The old `collect-manage.ts` stays in the codebase as a fallback reference.

**Step 2: Verify build**

```bash
npx next build
```

Expected: PASS

**Step 3: Commit**

```bash
git add src/lib/game-engines/index.ts
git commit -m "feat: register Phaser engine for resource-management mechanic"
```

---

## Task 5: Update ThemeConfig Generation to Pick Sprites

**Files:**
- Modify: `src/app/api/game/generate-engine/route.ts` (lines 22-94, Haiku prompt)

**Step 1: Extend the Haiku prompt to output sprite selections**

In `src/app/api/game/generate-engine/route.ts`, update the AI prompt to also return `characterSprite`, `itemSprite`, and `backgroundImage` fields. Add the available sprite IDs to the prompt so it can select from them.

Add to the system prompt (after the existing ThemeConfig instructions):

```
Also select sprites from the available library:
Characters: pirate, robot, astronaut, knight, chef, diver, ghost, ninja, wizard, explorer
Items: coin, gem, treasure-chest, crystal, potion, fruit, star, shell, mushroom, key
Backgrounds: underwater, space, forest, castle, kitchen, cave, city, volcano, arctic, jungle

Pick the best match for the theme. Return these as:
"characterSprite": "id",
"itemSprite": "id",
"backgroundImage": "id"
```

Also ensure the parsed ThemeConfig includes these three fields from the AI response.

**Step 2: Verify by testing locally**

```bash
npm run dev
```

Navigate to a Collect & Manage moon, go through the card builder, and verify the API response includes sprite selections.

**Step 3: Commit**

```bash
git add src/app/api/game/generate-engine/route.ts
git commit -m "feat: extend ThemeConfig generation to select sprites from library"
```

---

## Task 6: Add Student Artwork Upload UI

**Files:**
- Create: `src/components/game/artwork-picker.tsx`
- Modify: `src/components/standard/game-card-builder.tsx` (add artwork step after vibe selection)

**Step 1: Create the ArtworkPicker component**

Create `src/components/game/artwork-picker.tsx`:

```typescript
"use client"

import { useState, useRef } from "react"
import { Upload, X, ImageIcon } from "lucide-react"
import { SPRITE_CHARACTERS, SPRITE_ITEMS, SPRITE_BACKGROUNDS, resolveSpriteUrl } from "@/lib/sprite-library"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"

interface ArtworkPickerProps {
  onSelect: (sprites: {
    characterSprite: string
    itemSprite: string
    backgroundImage: string
  }) => void
  onSkip: () => void
  defaultCharacter?: string
  defaultItem?: string
  defaultBackground?: string
}

export function ArtworkPicker({
  onSelect, onSkip,
  defaultCharacter, defaultItem, defaultBackground
}: ArtworkPickerProps) {
  const [character, setCharacter] = useState(defaultCharacter || "")
  const [item, setItem] = useState(defaultItem || "")
  const [background, setBackground] = useState(defaultBackground || "")
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (
    file: File,
    type: "characters" | "items" | "backgrounds",
    setter: (url: string) => void
  ) => {
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2MB")
      return
    }
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }
    setUploading(true)
    try {
      const storage = getStorage()
      const path = `sprites/uploads/${Date.now()}-${file.name}`
      const storageRef = ref(storage, path)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      setter(url)
    } catch (err) {
      console.error("Upload failed:", err)
      alert("Upload failed, please try again")
    } finally {
      setUploading(false)
    }
  }

  // Render: three rows (character, item, background)
  // Each row shows library options as clickable thumbnails + upload button
  // Selected option is highlighted
  // "Use these" button at bottom calls onSelect
  // "Skip" link calls onSkip (uses AI-selected defaults)
}
```

The component renders three rows of clickable sprite thumbnails from the library, each with an "Upload your own" button. The full JSX implementation should show sprite images as 64x64 thumbnails in a scrollable row.

**Step 2: Wire into GameCardBuilder**

In `src/components/standard/game-card-builder.tsx`, add a new step after vibe selection. When the student finishes picking a vibe, show the ArtworkPicker. The selected sprites get added to the designDoc passed to `onBuildGame`.

Add to the existing card builder state:

```typescript
const [sprites, setSprites] = useState<{
  characterSprite?: string
  itemSprite?: string
  backgroundImage?: string
}>({})
```

After the vibe step, add the artwork step:

```typescript
{step === "artwork" && (
  <ArtworkPicker
    onSelect={(s) => {
      setSprites(s)
      setStep("review") // or whatever the next step is
    }}
    onSkip={() => setStep("review")}
    defaultCharacter={aiSuggestedCharacter}
    defaultItem={aiSuggestedItem}
    defaultBackground={aiSuggestedBackground}
  />
)}
```

Pass sprites through to the designDoc in the onBuildGame callback.

**Step 3: Verify locally**

```bash
npm run dev
```

Navigate through the card builder flow. Verify the artwork step appears after vibe selection. Test selecting library sprites and uploading a custom image.

**Step 4: Commit**

```bash
git add src/components/game/artwork-picker.tsx src/components/standard/game-card-builder.tsx
git commit -m "feat: add artwork picker with sprite library and upload support"
```

---

## Task 7: Pass Sprites Through to Engine

**Files:**
- Modify: `src/components/game/build-screen.tsx` (lines 152-170, engine call)
- Modify: `src/app/api/game/generate-engine/route.ts` (merge sprites into ThemeConfig)

**Step 1: Pass sprite selections in the build request**

In `build-screen.tsx`, the fetch to `/api/game/generate-engine` needs to include sprite data. The designDoc (or a new field) should carry the sprite selections from the card builder.

Add to the fetch body:

```typescript
body: JSON.stringify({
  designDoc,
  mechanicId,
  vibe: preSelectedVibe,
  standardId: designDoc.standardId,
  standardDescription: designDoc.concept || designDoc.mathRole,
  grade: "6",
  cardChoices: (designDoc as any).cardChoices,
  sprites: (designDoc as any).sprites, // { characterSprite, itemSprite, backgroundImage }
}),
```

**Step 2: Merge in the generate-engine route**

In `src/app/api/game/generate-engine/route.ts`, after building the ThemeConfig from Haiku's response, override with student-selected sprites if provided:

```typescript
const { sprites } = body
if (sprites?.characterSprite) themeConfig.characterSprite = sprites.characterSprite
if (sprites?.itemSprite) themeConfig.itemSprite = sprites.itemSprite
if (sprites?.backgroundImage) themeConfig.backgroundImage = sprites.backgroundImage
```

Student uploads (URLs) take priority over AI-selected library IDs.

**Step 3: End-to-end test locally**

```bash
npm run dev
```

Full flow: pick a Collect & Manage moon → card builder → pick vibe → pick artwork → build → verify the game renders with the selected sprites in the Phaser canvas.

**Step 4: Commit**

```bash
git add src/components/game/build-screen.tsx src/app/api/game/generate-engine/route.ts
git commit -m "feat: wire sprite selections through to Phaser engine"
```

---

## Task 8: Firebase Storage Rules for Uploads

**Files:**
- Create or modify: `storage.rules` (if Firebase Storage rules are managed in the project)

**Step 1: Add storage rules for sprite uploads**

Ensure Firebase Storage allows authenticated writes to the `sprites/uploads/` path and public reads (so iframes can load the images):

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /sprites/uploads/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.resource.size < 2 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

**Step 2: Deploy rules**

If using Firebase CLI:
```bash
firebase deploy --only storage
```

Otherwise configure in Firebase Console → Storage → Rules.

**Step 3: Commit**

```bash
git add storage.rules
git commit -m "feat: add Firebase Storage rules for sprite uploads"
```

---

## Task 9: Test on Grade 4 Moon

**Files:**
- No code changes — manual testing

**Step 1: Start dev server**

```bash
npm run dev
```

**Step 2: Navigate to a Grade 4 arithmetic moon**

Go to the galaxy → find a Grade 4 planet (Operations & Algebraic Thinking) → click a blue moon with standard 4.OA.A.3 or similar.

**Step 3: Full flow test**

1. Pick the "Collect & Manage" mechanic
2. Fill the card builder (theme, character, action, win condition)
3. Pick a vibe
4. Pick artwork (test both library selection AND uploading a custom image)
5. Click Build
6. Verify: Phaser game loads with correct sprites, background, character
7. Play through 5 rounds — verify math works, items are clickable, score updates
8. Win the game — verify celebration animation and `game_win` postMessage fires
9. Test timed variant (if accessible)
10. Test on mobile viewport (Phaser scale mode should handle it)

**Step 4: Compare before/after**

Play an old engine game on a different mechanic and compare. Document the visual difference.

---

## Task 10: Deploy and Validate in Production

**Step 1: Build**

```bash
npx next build
```

Expected: PASS with no errors.

**Step 2: Commit all remaining changes**

```bash
git add -A
git commit -m "feat: next-gen Phaser engine prototype complete"
git push origin main
```

**Step 3: Deploy**

```bash
vercel --prod
```

**Step 4: Production test**

Repeat the Task 9 flow on `https://www.diagonally.app`. Verify sprites load from the public CDN (not localhost).

---

## Summary

| Task | What | Estimated effort |
|------|------|-----------------|
| 1 | Sprite library + registry | Small |
| 2 | ThemeConfig sprite fields | Tiny |
| 3 | Phaser engine (the big one) | Large |
| 4 | Register engine | Tiny |
| 5 | AI sprite selection | Small |
| 6 | Artwork picker UI | Medium |
| 7 | Wire sprites through | Small |
| 8 | Firebase Storage rules | Tiny |
| 9 | Test on Grade 4 moon | Manual testing |
| 10 | Deploy + validate | Small |
