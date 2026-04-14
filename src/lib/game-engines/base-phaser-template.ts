// Shared Phaser base template for all 19 game engines.
// Provides: HTML shell, BootScene, VictoryScene, LoseScene, HUD helpers, game juice.
// Each engine provides: GameScene code as a string, intro/help text.

import type { ThemeConfig, MathParams } from "./engine-types"
import { resolveSpriteUrl } from "../sprite-library"

export interface PhaserGameOpts {
  config: ThemeConfig
  math: MathParams
  option: string
  /** JS source code defining one or more Phaser Scene classes. Must include a class
   *  matching `sceneName`. Can reference: THEME, MATH, COL_*, hexToNum(), etc. */
  gameSceneCode: string
  /** The class name of the scene to start after BootScene, e.g. "FreeCollectScene" */
  sceneName: string
  /** Shown on tutorial overlay before game starts */
  introText: string
  /** Shown when player clicks the (?) help button */
  helpText: string
}

export function phaserGame(opts: PhaserGameOpts): string {
  const { config, math, option, gameSceneCode, sceneName, introText, helpText } = opts
  const c = config.colors

  // ─── Skeleton Mode ─────────────────────────────────────────────────────────
  // Strip all theme — plain dark bg, white stickman, neutral white circle items.
  // Lets the learner meet the pure math mechanic before picking a theme.
  const SKELETON_STICKMAN_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">' +
      '<g stroke="#ffffff" stroke-width="6" stroke-linecap="round" fill="none">' +
        '<circle cx="60" cy="28" r="14" fill="#ffffff" stroke="none"/>' +
        '<line x1="60" y1="44" x2="60" y2="84"/>' +
        '<line x1="60" y1="54" x2="36" y2="70"/>' +
        '<line x1="60" y1="54" x2="84" y2="70"/>' +
        '<line x1="60" y1="84" x2="40" y2="110"/>' +
        '<line x1="60" y1="84" x2="80" y2="110"/>' +
      '</g>' +
    '</svg>'
  const SKELETON_ITEM_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
      '<circle cx="32" cy="32" r="26" fill="#e4e4e7" stroke="#a1a1aa" stroke-width="3"/>' +
    '</svg>'
  const SKELETON_BG_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">' +
      '<rect width="800" height="600" fill="#0a0a0a"/>' +
    '</svg>'
  const toDataUri = (svg: string) =>
    'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)

  const skeleton = config.skeletonMode === true

  const characterUrl = skeleton
    ? toDataUri(SKELETON_STICKMAN_SVG)
    : config.characterSprite
      ? resolveSpriteUrl("characters", config.characterSprite)
      : resolveSpriteUrl("characters", "wizard")

  const itemUrl = skeleton
    ? toDataUri(SKELETON_ITEM_SVG)
    : config.itemSprite
      ? resolveSpriteUrl("items", config.itemSprite)
      : resolveSpriteUrl("items", "gem")

  const bgUrl = skeleton
    ? toDataUri(SKELETON_BG_SVG)
    : config.backgroundImage
      ? resolveSpriteUrl("backgrounds", config.backgroundImage)
      : resolveSpriteUrl("backgrounds", "cave")

  const bg = skeleton ? "#0a0a0a" : c.bg
  const primary = skeleton ? "#60a5fa" : c.primary
  const secondary = skeleton ? "#e4e4e7" : c.secondary
  const accent = skeleton ? "#fbbf24" : c.accent
  const danger = skeleton ? "#ef4444" : c.danger
  const textColor = skeleton ? "#e4e4e7" : c.text

  // Escape help text for safe embedding in JS string
  const escapedHelpText = helpText.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')

  // Backstory banner — shown as a thin strip at the top of the game (not in skeleton mode)
  const showBackstory = !skeleton && typeof config.backstory === "string" && config.backstory.trim().length > 0
  const backstoryText = showBackstory
    ? config.backstory!.trim()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/`/g, "&#96;")
        .replace(/\$/g, "&#36;")
    : ""

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${config.title}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Lexend:wght@300;400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: ${bg}; font-family: 'Lexend', system-ui, sans-serif; }
  #game-container { width: 100%; height: 100%; }

  /* Backstory banner — thin dark strip at top of game */
  #backstory-banner {
    position: fixed; top: 0; left: 0; right: 0;
    background: rgba(0, 0, 0, 0.72);
    color: #ffffff;
    font-family: 'Lexend', system-ui, sans-serif;
    font-size: 13px; font-weight: 400;
    padding: 6px 14px;
    line-height: 1.35;
    z-index: 800;
    cursor: pointer;
    backdrop-filter: blur(4px);
    border-bottom: 1px solid rgba(255,255,255,0.08);
    max-height: 28px; overflow: hidden;
    white-space: nowrap; text-overflow: ellipsis;
    transition: max-height 0.25s ease;
  }
  #backstory-banner.expanded {
    max-height: 200px; white-space: normal;
  }

  /* Get Hint button — floating bottom-right */
  #hint-btn {
    position: fixed; bottom: 14px; right: 14px;
    padding: 8px 14px; border-radius: 20px;
    background: ${primary}; color: #fff;
    border: none; font-family: 'Lexend', system-ui, sans-serif;
    font-size: 12px; font-weight: 600;
    cursor: pointer; z-index: 900;
    box-shadow: 0 2px 10px rgba(0,0,0,0.35);
    opacity: 0.85;
  }
  #hint-btn:hover { opacity: 1; }

  /* Hint modal */
  #hint-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.82);
    display: none; align-items: center; justify-content: center;
    z-index: 1100;
  }
  #hint-overlay.open { display: flex; }
  .hint-box {
    background: ${bg}; border: 3px solid ${secondary};
    border-radius: 16px; padding: 24px 28px; max-width: 420px; width: 90%;
    color: ${textColor}; white-space: pre-line;
  }
  .hint-box h3 { font-family: 'Space Grotesk', sans-serif; font-size: 18px; margin-bottom: 12px; color: ${accent}; }
  .hint-box p { font-size: 13px; line-height: 1.6; margin-bottom: 8px; }
  .hint-box .hint-close {
    margin-top: 12px; padding: 8px 20px;
    background: ${secondary}; color: ${bg}; border: none;
    border-radius: 8px; font-size: 14px; font-weight: 600;
    cursor: pointer;
  }
</style>
</head>
<body>

<!-- Backstory banner (shown if learner wrote one, not in skeleton mode) -->
${showBackstory ? `<div id="backstory-banner" onclick="toggleBackstory()" title="Tap to expand">${backstoryText}</div>` : ""}

<!-- Hint modal -->
<div id="hint-overlay" onclick="closeHint()">
  <div class="hint-box" onclick="event.stopPropagation()">
    <h3>Get Hint</h3>
    <p id="hint-content"></p>
    <button class="hint-close" onclick="closeHint()">Got it</button>
  </div>
</div>

<!-- Get Hint button -->
<button id="hint-btn" onclick="showHint()">Get Hint</button>

<div id="game-container"></div>

<script src="https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js"><\/script>
<script>
// ─── Shared Constants ────────────────────────────────────────────────────────
const TOTAL_ROUNDS   = 5;
const MAX_LIVES      = 3;
const CHARACTER_URL  = "${characterUrl}";
const ITEM_URL       = "${itemUrl}";
const BG_URL         = "${bgUrl}";
const COL_BG         = "${bg}";
const COL_PRIMARY    = "${primary}";
const COL_SECONDARY  = "${secondary}";
const COL_ACCENT     = "${accent}";
const COL_DANGER     = "${danger}";
const COL_TEXT       = "${textColor}";
const WIN_MSG        = ${JSON.stringify(config.winMessage)};
const LOSE_MSG       = ${JSON.stringify(config.loseMessage)};
const ITEM_NAME      = ${JSON.stringify(config.itemName)};
const CHARACTER_NAME = ${JSON.stringify(config.character)};
const WORLD_NAME     = ${JSON.stringify(config.worldName)};
const AI_ROUNDS      = ${math.rounds ? JSON.stringify(math.rounds) : "null"};
const GAME_OPTION    = ${JSON.stringify(option)};
const HELP_TEXT      = '${escapedHelpText}';

const THEME = {
  title: ${JSON.stringify(config.title)},
  character: CHARACTER_NAME,
  itemName: ITEM_NAME,
  worldName: WORLD_NAME,
  winMessage: WIN_MSG,
  loseMessage: LOSE_MSG,
  colors: { bg: COL_BG, primary: COL_PRIMARY, secondary: COL_SECONDARY, accent: COL_ACCENT, danger: COL_DANGER, text: COL_TEXT }
};
const MATH = ${JSON.stringify({ grade: math.grade, standardId: math.standardId, standardDescription: math.standardDescription, difficulty: math.difficulty })};

// ─── Shared Utilities ────────────────────────────────────────────────────────
function hexToNum(hex) {
  return parseInt(hex.replace('#', ''), 16);
}

// Place the character sprite in a scene. Returns the sprite so scenes can tween it.
// Call in create(): this.hero = addCharacter(this, x, y, scale)
function addCharacter(scene, x, y, scale) {
  const hero = scene.add.image(x, y, 'character').setScale(scale || 0.5).setDepth(20).setAlpha(0.9);
  // Gentle idle bob
  scene.tweens.add({ targets: hero, y: y - 4, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  return hero;
}

// Character reacts to correct answer — jump + scale
function heroCheer(scene, hero) {
  if (!hero) return;
  scene.tweens.add({ targets: hero, y: hero.y - 20, scaleX: 0.55, scaleY: 0.55, duration: 200, yoyo: true, ease: 'Back.easeOut' });
}

// Character reacts to wrong answer — shake head
function heroShake(scene, hero) {
  if (!hero) return;
  const ox = hero.x;
  scene.tweens.add({ targets: hero, x: ox - 8, duration: 60, yoyo: true, repeat: 3, ease: 'Sine.easeInOut', onComplete: () => { hero.x = ox; } });
}

// ─── Shared: Get round data from AI_ROUNDS (required) ────────────────────────
// ALL math content comes from AI_ROUNDS. Engines must NOT generate their own math.
function getRound(roundIndex) {
  if (!AI_ROUNDS || !AI_ROUNDS[roundIndex]) {
    return { prompt: 'Solve this!', target: 10, items: [10, 5, 8, 3, 12, 7], hint: 'Think carefully!' };
  }
  const r = AI_ROUNDS[roundIndex];
  return {
    prompt: r.prompt || 'Solve this!',
    target: typeof r.target === 'number' ? r.target : 10,
    items: Array.isArray(r.items) ? r.items : [10, 5, 8, 3, 12, 7],
    hint: r.hint || null
  };
}

// ─── State ───────────────────────────────────────────────────────────────────
let gameScore = 0;
let gameStarted = false;

// ─── BootScene ───────────────────────────────────────────────────────────────
class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Loading bar
    const barBg = this.add.rectangle(W / 2, H / 2, 300, 18, 0x333333, 1).setOrigin(0.5);
    const bar   = this.add.rectangle(W / 2 - 149, H / 2, 2, 14, hexToNum(COL_ACCENT), 1).setOrigin(0, 0.5);
    this.add.text(W / 2, H / 2 - 24, 'Loading...', {
      fontSize: '14px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5);

    this.load.on('progress', (v) => {
      bar.width = Math.max(2, v * 298);
    });

    // Load shared assets
    this.load.svg('character', CHARACTER_URL, { width: 120, height: 120 });
    this.load.svg('item',      ITEM_URL,      { width: 64,  height: 64  });
    this.load.svg('bg',        BG_URL,        { width: 800, height: 600 });
  }

  create() {
    this.scene.start('${sceneName}');
  }
}

// ─── VictoryScene ────────────────────────────────────────────────────────────
class VictoryScene extends Phaser.Scene {
  constructor() { super('VictoryScene'); }

  create(data) {
    const W = this.scale.width, H = this.scale.height;

    const bg = this.add.image(W / 2, H / 2, 'bg');
    bg.setScale(Math.max(W / bg.width, H / bg.height));
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.6);

    this.add.image(W / 2, H / 2 - 40, 'character').setScale(1.1).setDepth(5);

    this.add.text(W / 2, H / 2 + 80, WIN_MSG, {
      fontSize: '22px', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold',
      align: 'center', wordWrap: { width: W - 60 }
    }).setOrigin(0.5).setDepth(6);

    this.add.text(W / 2, H / 2 + 120, 'Score: ' + (data.score || 0), {
      fontSize: '18px', color: COL_ACCENT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5).setDepth(6);

    // Fireworks
    const burst = () => {
      const x = 60 + Math.random() * (W - 120);
      const y = 60 + Math.random() * (H / 2);
      const colours = [hexToNum(COL_ACCENT), hexToNum(COL_PRIMARY), 0xffffff, hexToNum(COL_SECONDARY)];
      const col = colours[Math.floor(Math.random() * colours.length)];
      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 / 20) * i;
        const dist  = 40 + Math.random() * 70;
        const dot   = this.add.circle(x, y, 4 + Math.random() * 4, col, 1).setDepth(10);
        this.tweens.add({
          targets: dot,
          x: x + Math.cos(angle) * dist,
          y: y + Math.sin(angle) * dist,
          alpha: 0, scale: 0.1,
          duration: 600 + Math.random() * 400,
          ease: 'Cubic.easeOut',
          onComplete: () => dot.destroy()
        });
      }
    };
    burst();
    this.time.addEvent({ delay: 500, loop: true, callback: burst });

    this.time.delayedCall(2000, () => {
      var hintUsed = (typeof window.__getHintUsed === 'function') ? window.__getHintUsed() : false;
      window.parent.postMessage({ type: 'game_win', hintUsed: hintUsed, score: data.score || 0 }, '*');
    });
  }
}

// ─── LoseScene ───────────────────────────────────────────────────────────────
class LoseScene extends Phaser.Scene {
  constructor() { super('LoseScene'); }

  create(data) {
    const W = this.scale.width, H = this.scale.height;

    const bg = this.add.image(W / 2, H / 2, 'bg');
    bg.setScale(Math.max(W / bg.width, H / bg.height));
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.7);

    this.add.image(W / 2, H / 2 - 50, 'character').setScale(0.9).setDepth(5).setTint(0x888888);

    this.add.text(W / 2, H / 2 + 50, LOSE_MSG, {
      fontSize: '20px', color: COL_DANGER, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold',
      align: 'center', wordWrap: { width: W - 60 }
    }).setOrigin(0.5).setDepth(6);

    this.add.text(W / 2, H / 2 + 90, 'Score: ' + (data.score || 0), {
      fontSize: '16px', color: '#aaa', fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5).setDepth(6);
  }
}

// ─── Game Juice Mixin ────────────────────────────────────────────────────────
// Engines can call these on any scene: this._screenShake(), this._burstParticles(), etc.
// We add them to Phaser.Scene prototype so all scenes get them.
Phaser.Scene.prototype._screenShake = function(intensity) {
  if (this._shaking) return;
  this._shaking = true;
  this.cameras.main.shake(380, intensity || 0.012);
  this.time.delayedCall(420, () => { this._shaking = false; });
};

Phaser.Scene.prototype._burstParticles = function(x, y, count) {
  count = count || 18;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i;
    const dist  = 60 + Math.random() * 80;
    const dot   = this.add.circle(x, y, 5 + Math.random() * 6, hexToNum(COL_ACCENT), 1).setDepth(20);
    this.tweens.add({
      targets: dot,
      x: x + Math.cos(angle) * dist,
      y: y + Math.sin(angle) * dist,
      alpha: 0, scale: 0.2,
      duration: 550 + Math.random() * 200,
      ease: 'Cubic.easeOut',
      onComplete: () => dot.destroy()
    });
  }
  for (let i = 0; i < 8; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist  = 30 + Math.random() * 60;
    const dot   = this.add.circle(x, y, 3 + Math.random() * 4, hexToNum(COL_PRIMARY), 1).setDepth(20);
    this.tweens.add({
      targets: dot,
      x: x + Math.cos(angle) * dist,
      y: y + Math.sin(angle) * dist,
      alpha: 0, scale: 0.1,
      duration: 400 + Math.random() * 300,
      ease: 'Cubic.easeOut',
      onComplete: () => dot.destroy()
    });
  }
};

Phaser.Scene.prototype._showScorePop = function(txt, col) {
  const color = col || COL_ACCENT;
  const pop = this.add.text(this.scale.width / 2, this.scale.height / 2 - 40, txt, {
    fontSize: '22px', fontStyle: 'bold', color: color,
    fontFamily: "'Lexend', system-ui", stroke: '#000', strokeThickness: 4
  }).setOrigin(0.5).setDepth(30).setAlpha(0);

  this.tweens.add({
    targets: pop, alpha: 1, y: this.scale.height / 2 - 80,
    duration: 300, ease: 'Cubic.easeOut',
    onComplete: () => {
      this.tweens.add({
        targets: pop, alpha: 0, y: this.scale.height / 2 - 110,
        delay: 600, duration: 300,
        onComplete: () => pop.destroy()
      });
    }
  });
};

// ─── Engine-Specific Game Scene(s) ───────────────────────────────────────────
${gameSceneCode}

// ─── Phaser Config ───────────────────────────────────────────────────────────
const phaserConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: COL_BG,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  scene: [BootScene, ${sceneName}, VictoryScene, LoseScene],
};

// ─── Bootstrap ───────────────────────────────────────────────────────────────
let _game = null;
let _hintUsed = false;

// Expose hintUsed globally so engine scenes can read it when posting game_win
window.__getHintUsed = function() { return _hintUsed; };

// Backstory banner expand/collapse
function toggleBackstory() {
  var el = document.getElementById('backstory-banner');
  if (el) el.classList.toggle('expanded');
}

function showHint() {
  // Get current round index if the scene tracks it, else use round 0.
  // Prefer a DIFFERENT round's hint so the teaching example has different numbers
  // than the current problem.
  var roundIdx = (typeof window.__currentRound === 'number') ? window.__currentRound : 0;
  var hintContent = 'Skill: ' + MATH.standardDescription + '\\n\\n';

  if (AI_ROUNDS && AI_ROUNDS.length > 0) {
    // Pick a different round than the current one for the example
    var exampleIdx = (roundIdx + 1) % AI_ROUNDS.length;
    var exampleRound = AI_ROUNDS[exampleIdx];
    if (exampleRound && exampleRound.hint) {
      hintContent += exampleRound.hint + '\\n\\n';
    }
    if (exampleRound && exampleRound.prompt) {
      hintContent += 'Example: ' + exampleRound.prompt;
      if (typeof exampleRound.target !== 'undefined') {
        hintContent += '\\nAnswer: ' + exampleRound.target;
      }
    }
  } else {
    hintContent += HELP_TEXT;
  }

  _hintUsed = true;
  document.getElementById('hint-content').textContent = hintContent;
  document.getElementById('hint-overlay').classList.add('open');
}

function closeHint() {
  document.getElementById('hint-overlay').classList.remove('open');
}

// Auto-start the game — no tutorial card.
_game = new Phaser.Game(phaserConfig);
<\/script>
</body>
</html>`
}
