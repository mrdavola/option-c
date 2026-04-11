# Next-Gen Game Engine: Phaser + Sprites Prototype

**Date:** 2026-04-11
**Status:** Approved
**Scope:** Prototype on Collect & Manage engine, Grade 4 (4.OA.A.3)

## Problem

The 19 pre-built game engines produce working games, but visually they're colored circles and rectangles with CSS animations. Students expect game-quality visuals — sprites, characters, animated worlds. The gap between what students design (pirate shipwreck adventure) and what they see (colored circles on a flat background) kills engagement.

## Decision

**Phase 1 (this prototype): Approach A** — Embed Phaser 3.90 via CDN in the existing single-HTML architecture. Upgrade one engine (Collect & Manage) with real sprites, Phaser rendering, and student artwork uploads. Test on one moon (Grade 4, 4.OA.A.3). Validate with students before rolling out.

**Phase 2+: Approach B** — Migrate to full project structures served via Vercel Sandbox. Captured in the roadmap below.

## Architecture

### What changes

| Layer | Current | Prototype |
|-------|---------|-----------|
| Rendering | DOM divs + CSS | Phaser 3.90 Canvas/WebGL |
| Characters | Colored circles | Sprites (library or uploaded) |
| Items | Colored circles with numbers | Sprite items with value labels |
| Background | Solid CSS color | Illustrated scene image |
| Effects | CSS transitions | Phaser tweens, particles, physics |
| Storage | HTML string in Firestore | Same |
| Iframe | srcDoc | Same |

### What does NOT change

- Game Card Builder UI flow
- ThemeConfig generation (AI generates names/colors/sprite picks)
- Firestore storage format (HTML string)
- Iframe sandboxing
- Win/lose postMessage protocol
- The other 18 engines (untouched)

## Sprite & Artwork System

### Sprite library (pre-made)

Stored in `/public/sprites/`, organized by category:

```
/public/sprites/
  characters/   pirate.png, robot.png, astronaut.png, knight.png, chef.png,
                diver.png, ghost.png, ninja.png, wizard.png, explorer.png
  items/        coin.png, gem.png, treasure-chest.png, crystal.png, potion.png,
                fruit.png, star.png, shell.png, mushroom.png, key.png
  backgrounds/  underwater.png, space.png, forest.png, castle.png, kitchen.png,
                cave.png, city.png, volcano.png, arctic.png, jungle.png
```

~30-40 sprites to start (10 characters, 10 items, 10 backgrounds).

### Student uploads

New optional step in Game Card Builder after vibe selection:

1. "Want to add your own art?" (skip = library defaults)
2. Upload up to 3 images: character, item, background
3. Stored in Firebase Storage: `sprites/{userId}/{gameId}/`
4. URLs injected into ThemeConfig, override library selections
5. Validation: png/jpg/webp, max 2MB, basic dimensions check

### ThemeConfig extensions

```typescript
interface ThemeConfig {
  // ... existing fields ...
  characterSprite: string   // library key or upload URL
  itemSprite: string        // library key or upload URL
  backgroundImage: string   // library key or upload URL
}
```

AI (Haiku) selects library sprites by matching theme keywords. Student uploads override.

## Phaser Game Structure

Single HTML file with Phaser loaded via CDN:

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js"></script>
</head>
<body>
  <script>
    const CONFIG = { /* ThemeConfig + MathParams as JSON */ };
    
    class BootScene extends Phaser.Scene { /* preload sprites */ }
    class GameScene extends Phaser.Scene { /* gameplay */ }
    class VictoryScene extends Phaser.Scene { /* celebration + postMessage */ }
    
    new Phaser.Game({
      type: Phaser.AUTO,
      width: 800, height: 600,
      scene: [BootScene, GameScene, VictoryScene],
      physics: { default: 'arcade' }
    });
  </script>
</body>
</html>
```

### Visual upgrade (Collect & Manage)

| Element | Current | v2 with Phaser |
|---------|---------|----------------|
| Player character | Not visible | Sprite with idle animation (bobbing), reacts to correct/wrong |
| Items | 56px colored circles | Sprite items that float, wobble, glow on hover, fly to score on collect |
| Background | Flat CSS color | Illustrated scene with subtle parallax |
| Correct answer | CSS flash | Particle burst, item flies to character with sparkle trail |
| Wrong answer | CSS color change | Screen shake, character flinch, items scatter |
| Round win | Text appears | Particles from character, items rain, victory pose |
| Game win | Basic confetti CSS | Full fireworks, character dances, score tallies |
| Help button | DOM overlay | Phaser UI overlay with animated panels |
| Round progress | Dot indicators | Visual bar that fills and pulses |

### Game loop

1. **Intro**: Character walks in, background pans, title drops with animation
2. **Per round**: Target whooshes in. Items fall/float into play area. Click to collect (fly to collection zone). "Done" button — correct = celebration, wrong = character reacts + items return
3. **Difficulty**: Round 1 sums ~15, Round 5 sums ~50+, more items per round
4. **Victory**: Full celebration, score tally, `window.parent.postMessage({type:'game_win'}, '*')`

### Variants

- **Classic**: 5 rounds, no timer
- **Timed**: Phaser timer bar drains visually, red pulse when low
- **Challenge**: Items have hidden values (reveal on hover), decoy items worth 0

## Test Plan

- Target moon: Grade 4, 4.OA.A.3 (multi-step arithmetic word problems)
- Wire up: only this moon uses the new Phaser engine; all others use current engines
- Success criteria: game renders, sprites load, math works, win/lose fires correctly, looks dramatically better than current

---

## Phase 2: Roll Out to All 19 Engines

**Trigger:** Phase 1 validated with real students.

- Migrate remaining 18 engines to Phaser one by one
- Expand sprite library to 100-150 assets
- Add multiple game types per math concept (e.g., fractions: "split & share" + "pour & mix")
- Target: 25-30 mechanics, 75-90 variants
- Each engine follows the same pattern: BootScene → GameScene → VictoryScene

## Phase 3: Full Sandbox Architecture (Approach B)

**Trigger:** All 19 engines migrated to Phaser. Team ready for infrastructure work.

Each game becomes a mini bundled project instead of a single HTML string:

- Engine generates JS + asset references (not inline HTML)
- Vercel Sandbox spins up, bundles the project (~5s)
- Built output deployed as static asset (Vercel Blob or Firebase Storage)
- Iframe points to static URL instead of using srcDoc
- Enables: npm packages, multiple files, larger games, multiplayer potential

### Cost estimates at scale

| Scale | Sandbox builds/month | Storage | Estimated monthly cost |
|-------|---------------------|---------|----------------------|
| 50 students | ~500 builds | ~2GB | $5-10 |
| 100 students | ~1,000 builds | ~5GB | $5-20 |
| 500 students | ~5,000 builds | ~20GB | $20-50 |
| 1,000 students | ~10,000 builds | ~40GB | $30-80 |

Key insight: Sandbox is only needed for the **build step**. Game plays are static asset loads (near-zero marginal cost). This keeps costs very low even at scale.

## Phase 4: Multiple Game Types Per Concept

- Each math concept gets 2-3 mechanic options instead of 1
- Example: Fractions → "Split & Share" (cut/slice) + "Pour & Mix" (equivalence) + "Scale & Resize" (proportion)
- Target: 30-40 mechanics total, 90-120 variants
- Requires new engine authoring but follows established Phaser pattern
