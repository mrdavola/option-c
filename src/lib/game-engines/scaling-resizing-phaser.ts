// Scale & Transform — Phaser engine with 3 game options.
// Math: Proportional scaling, recipe scaling, map scale → real distance.
// Options: resize-tool, recipe-scaler, map-distance
//
// INTRINSIC DESIGN NOTES (April 13 rebuild):
// All three games are manipulation-driven. No typed numbers, no Check
// buttons, no Verify buttons. Auto-detect success by physical match.
// - resize-tool ("Grid Stretcher"): child drags corner of a small grid.
//   Each original cell grows into an N×N block. When stretched to target
//   grid size, shapes overlay and snap. Scale factor is visually obvious.
// - recipe-scaler ("Stacked Mixing Bowl"): base recipe shown as colored
//   block towers. Player drags ingredient blocks into a bowl. When each
//   ingredient's stack equals base × multiplier, the bowl locks.
// - map-distance ("Draggable Scale Bar"): scale bar "1 unit = 5 km" is
//   physically dragged along a route on a map. Each drop = one scale unit.
//   Cumulative sum shown live. When the bar covers the full route in an
//   integer number of steps, the distance is revealed.

import type { ThemeConfig, MathParams, GameOption } from "./engine-types"
import { phaserGame } from "./base-phaser-template"
import { getOptionDef } from "./game-option-registry"

export function scalingResizingPhaserEngine(
  config: ThemeConfig,
  math: MathParams,
  option: GameOption = "resize-tool"
): string {
  const validOptions = ["resize-tool", "recipe-scaler", "map-distance"]
  const activeOption = validOptions.includes(option) ? option : "resize-tool"

  const optDef = getOptionDef(activeOption)

  const sceneMap: Record<string, string> = {
    "resize-tool": "ResizeToolScene",
    "recipe-scaler": "RecipeScalerScene",
    "map-distance": "MapDistanceScene",
  }

  return phaserGame({
    config,
    math,
    option: activeOption,
    sceneName: sceneMap[activeOption],
    introText: optDef?.introText || "Scale it up!",
    helpText: optDef?.helpText || "Use ratios to resize.",
    gameSceneCode: GAME_SCENES,
  })
}

const GAME_SCENES = `
// ─── Shared helpers ──────────────────────────────────────────────────────────
function drawHeartsDotsScoreUI(scene) {
  const W = scene.W, pad = 14;
  scene.scoreLbl = scene.add.text(W - pad, pad, 'Score: 0', {
    fontSize: '16px', color: COL_ACCENT, fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
  }).setOrigin(1, 0).setDepth(10);
  scene.heartsGroup = scene.add.group();
  scene._redrawHearts = function() {
    scene.heartsGroup.clear(true, true);
    for (let i = 0; i < scene.lives; i++) {
      scene.heartsGroup.add(scene.add.text(14 + i * 22, 14, '♥',
        { fontSize: '18px', color: COL_DANGER }).setDepth(10));
    }
  };
  scene.dotGroup = scene.add.group();
  scene._redrawDots = function() {
    scene.dotGroup.clear(true, true);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      const col = i < scene.round ? COL_ACCENT : (i === scene.round ? COL_PRIMARY : '#555555');
      scene.dotGroup.add(scene.add.circle(scene.W / 2 - 40 + i * 20, scene.H - 16, 5, hexToNum(col)).setDepth(10));
    }
  };
  scene._redrawHearts();
  scene._redrawDots();
}

function showSolutionCard(scene, title, lines, onNext) {
  const W = scene.W, H = scene.H;
  const backdrop = scene.add.rectangle(W/2, H/2, W, H, 0x000000, 0.6).setDepth(50);
  const card = scene.add.rectangle(W/2, H * 0.5, Math.min(W - 40, 420), 260, 0x18181b, 1)
    .setStrokeStyle(2, hexToNum(COL_ACCENT)).setDepth(51);
  const h1 = scene.add.text(W/2, H * 0.5 - 100, title, {
    fontSize: '22px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
  }).setOrigin(0.5).setDepth(52);
  const textObjs = [];
  lines.forEach((line, i) => {
    const isFinal = i === lines.length - 1;
    const t = scene.add.text(W/2, H * 0.5 - 55 + i * 28, line, {
      fontSize: isFinal ? '22px' : '15px',
      color: isFinal ? COL_ACCENT : COL_TEXT,
      fontFamily: "'Space Grotesk', sans-serif",
      fontStyle: isFinal ? 'bold' : 'normal',
      align: 'center'
    }).setOrigin(0.5).setDepth(52);
    t.setAlpha(0);
    textObjs.push(t);
    scene.time.delayedCall(180 * i, () => scene.tweens.add({ targets: t, alpha: 1, duration: 260 }));
  });
  const btnY = H * 0.5 + 100;
  const finalLabel = scene.round + 1 >= TOTAL_ROUNDS ? 'Finish!' : 'Got it! Next round →';
  const nextBg = scene.add.rectangle(W/2, btnY, 220, 44, hexToNum(COL_ACCENT), 1)
    .setInteractive({ useHandCursor: true }).setDepth(52).setAlpha(0);
  const nextLbl = scene.add.text(W/2, btnY, finalLabel, {
    fontSize: '14px', color: '#000', fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
  }).setOrigin(0.5).setDepth(53).setAlpha(0);
  scene.time.delayedCall(180 * lines.length + 200, () => {
    scene.tweens.add({ targets: [nextBg, nextLbl], alpha: 1, duration: 260 });
  });
  const cleanup = () => {
    [backdrop, card, h1, ...textObjs, nextBg, nextLbl].forEach(o => o.destroy && o.destroy());
    onNext();
  };
  nextBg.on('pointerdown', cleanup);
}

// Fallback variations
const RESIZE_FALLBACK = [
  { original: 2, factor: 2 },
  { original: 3, factor: 2 },
  { original: 2, factor: 3 },
  { original: 3, factor: 3 },
  { original: 2, factor: 4 },
];
const RECIPE_FALLBACK = [
  { base: [2, 1], mult: 2 },
  { base: [1, 3], mult: 2 },
  { base: [2, 2, 1], mult: 2 },
  { base: [1, 2, 3], mult: 3 },
  { base: [2, 1, 2], mult: 3 },
];
const MAP_FALLBACK = [
  { unit: 5, steps: 3 },  // 15
  { unit: 4, steps: 3 },  // 12
  { unit: 5, steps: 4 },  // 20
  { unit: 10, steps: 3 }, // 30
  { unit: 6, steps: 4 },  // 24
];

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION A: Resize Tool — "Grid Stretcher"
// Original shape drawn on small grid (N×N cells). Target shape is larger grid
// (N*F × N*F, scale factor F). Drag corner to stretch; each cell grows to F×F.
// When stretched to target, grids overlay and snap.
// ═══════════════════════════════════════════════════════════════════════════════
class ResizeToolScene extends Phaser.Scene {
  constructor() { super('ResizeToolScene'); }

  create() {
    this.W = this.scale.width;
    this.H = this.scale.height;
    this.round = 0;
    this.lives = MAX_LIVES;
    this._bg();
    drawHeartsDotsScoreUI(this);
    this._buildHeaders();
    this.hero = addCharacter(this, this.W * 0.88, this.H * 0.55, 0.8);
    this.startRound();
  }

  _bg() {
    const bg = this.add.image(this.W / 2, this.H / 2, 'bg');
    bg.setScale(Math.max(this.W / bg.width, this.H / bg.height));
    this.add.rectangle(this.W / 2, this.H / 2, this.W, this.H, 0x000000, 0.7);
  }

  _buildHeaders() {
    const W = this.W;
    this.mathLbl = this.add.text(W / 2, 38, '', {
      fontSize: '20px', color: COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(10);
    this.promptLbl = this.add.text(W / 2, 70, '', {
      fontSize: '12px', color: COL_TEXT, fontFamily: "'Lexend', system-ui",
      align: 'center', wordWrap: { width: W - 60 }
    }).setOrigin(0.5, 0).setDepth(10);
    this.liveLbl = this.add.text(W / 2, this.H - 56, '', {
      fontSize: '16px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);
  }

  startRound() {
    if (this.roundGroup) this.roundGroup.clear(true, true);
    this.roundGroup = this.add.group();
    this.locked = false;

    const data = getRound(this.round);
    const fb = RESIZE_FALLBACK[this.round % RESIZE_FALLBACK.length];
    const isDefault = !data || data.prompt === 'Solve this!' ||
      (Array.isArray(data.items) && data.items[0] === 10 && data.items[1] === 5);

    let original, factor;
    if (isDefault) {
      original = fb.original; factor = fb.factor;
    } else {
      original = Array.isArray(data.items) && data.items[0] >= 2 ? Math.min(4, data.items[0]) : fb.original;
      const tgt = data.target;
      if (tgt && tgt % original === 0) {
        factor = tgt / original;
        if (factor < 2 || factor > 5) { original = fb.original; factor = fb.factor; }
      } else {
        factor = fb.factor;
      }
    }
    this.origN = original;
    this.factor = factor;
    this.targetN = original * factor;

    this.mathLbl.setText(original + ' × ' + factor + ' = ' + this.targetN);
    this.promptLbl.setText('Stretch the small grid until it matches the target. Each small square grows into a ' + factor + '×' + factor + ' block.');

    this._drawStage();
    this._redrawPlayerGrid();
  }

  _drawStage() {
    const W = this.W, H = this.H;
    // Dedicate cell size so target grid fits
    const maxTargetPx = Math.min(W * 0.5, H * 0.5, 280);
    const cellPx = Math.floor(maxTargetPx / this.targetN);
    this.cellPx = cellPx;
    this.origPx = cellPx; // the SMALL grid uses the same unit cell size (player stretches)
    // Base (small) grid anchor
    this.baseX = W * 0.12;
    this.baseY = H * 0.3;
    // Target grid anchor (ghost on right)
    this.targetX = W * 0.5;
    this.targetY = H * 0.3;

    // Draw TARGET grid outline (ghost) — a grid of targetN × targetN cells
    const tgtGrid = this.add.graphics().setDepth(3);
    tgtGrid.lineStyle(1, hexToNum(COL_DANGER), 0.5);
    for (let i = 0; i <= this.targetN; i++) {
      tgtGrid.lineBetween(this.targetX + i * cellPx, this.targetY,
                          this.targetX + i * cellPx, this.targetY + this.targetN * cellPx);
      tgtGrid.lineBetween(this.targetX, this.targetY + i * cellPx,
                          this.targetX + this.targetN * cellPx, this.targetY + i * cellPx);
    }
    this.roundGroup.add(tgtGrid);
    const tlbl = this.add.text(this.targetX + (this.targetN * cellPx) / 2, this.targetY - 14,
      'target ' + this.targetN + '×' + this.targetN, {
      fontSize: '12px', color: COL_DANGER, fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(0.5, 1).setDepth(3);
    this.roundGroup.add(tlbl);
    const olbl = this.add.text(this.baseX + (this.origN * cellPx) / 2, this.baseY - 14,
      'original ' + this.origN + '×' + this.origN, {
      fontSize: '12px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5, 1).setDepth(3);
    this.roundGroup.add(olbl);

    // Player grid (starts at size = origN × cellPx). curFactor controls stretch.
    this.curFactor = 1;
    this.playerGfx = this.add.graphics().setDepth(5);
    this.roundGroup.add(this.playerGfx);

    // Corner handle (draggable) — bottom-right of player grid
    this.pHandle = this.add.circle(this.baseX + this.origN * cellPx,
                                   this.baseY + this.origN * cellPx, 12, hexToNum(COL_PRIMARY), 1)
      .setStrokeStyle(2, 0xffffff, 1).setDepth(8).setInteractive({ draggable: true, useHandCursor: true });
    this.roundGroup.add(this.pHandle);
    const maxF = this.factor + 1; // allow a bit of overshoot
    this.pHandle.on('drag', (p, dx, dy) => {
      if (this.locked) return;
      // Convert dy to factor based on distance from baseX/baseY
      const dragH = Math.max(cellPx, dy - this.baseY);
      const dragW = Math.max(cellPx, dx - this.baseX);
      // We lock aspect: uniform scale factor from larger of the two
      const f = Math.max(dragW / (this.origN * cellPx), dragH / (this.origN * cellPx));
      let snappedF = Math.max(1, Math.min(maxF, Math.round(f)));
      if (snappedF !== this.curFactor) {
        this.curFactor = snappedF;
        this._redrawPlayerGrid();
      }
    });
  }

  _redrawPlayerGrid() {
    this.playerGfx.clear();
    const cellPx = this.cellPx;
    const f = this.curFactor;
    const sideN = this.origN * f; // number of sub-cells along each side
    const sidePx = sideN * cellPx;
    // Draw the stretched grid at base position — show every sub-cell.
    this.playerGfx.lineStyle(1, hexToNum(COL_PRIMARY), 0.9);
    this.playerGfx.fillStyle(hexToNum(COL_PRIMARY), 0.15);
    this.playerGfx.fillRect(this.baseX, this.baseY, sidePx, sidePx);
    for (let i = 0; i <= sideN; i++) {
      this.playerGfx.lineBetween(this.baseX + i * cellPx, this.baseY,
                                 this.baseX + i * cellPx, this.baseY + sidePx);
      this.playerGfx.lineBetween(this.baseX, this.baseY + i * cellPx,
                                 this.baseX + sidePx, this.baseY + i * cellPx);
    }
    // Highlight the "original cell outline" (heavier lines every factor cells) so
    // the child SEES each original square has become an f×f block.
    this.playerGfx.lineStyle(3, hexToNum(COL_ACCENT), 0.9);
    for (let i = 0; i <= this.origN; i++) {
      this.playerGfx.lineBetween(this.baseX + i * f * cellPx, this.baseY,
                                 this.baseX + i * f * cellPx, this.baseY + sidePx);
      this.playerGfx.lineBetween(this.baseX, this.baseY + i * f * cellPx,
                                 this.baseX + sidePx, this.baseY + i * f * cellPx);
    }
    // Move handle to new corner
    this.pHandle.x = this.baseX + sidePx;
    this.pHandle.y = this.baseY + sidePx;

    this.liveLbl.setText(this.origN + ' × ' + f + ' = ' + (this.origN * f))
      .setColor(f === this.factor ? COL_ACCENT : COL_TEXT);

    if (!this.locked && f === this.factor) {
      this._lockSuccess();
    }
  }

  _lockSuccess() {
    this.locked = true;
    this.pHandle.disableInteractive();
    this.cameras.main.flash(180, 34, 197, 94);
    heroCheer(this, this.hero);
    gameScore += 10 * (this.round + 1);
    this.scoreLbl.setText('Score: ' + gameScore);
    showSolutionCard(this, 'Perfect scale!', [
      'Original: ' + this.origN + '×' + this.origN,
      'Scale factor: ×' + this.factor,
      'Each square became a ' + this.factor + '×' + this.factor + ' block',
      this.origN + ' × ' + this.factor + ' = ' + this.targetN,
    ], () => {
      this.round++;
      if (this.round >= TOTAL_ROUNDS) {
        this.scene.start('VictoryScene', { score: gameScore });
      } else {
        this.startRound();
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION B: Recipe Scaler — "Stacked Mixing Bowl"
// Base recipe shown as block towers (e.g., 2 flour, 1 sugar). Target = ×mult.
// Drag blocks from a pool into labeled bowl columns until each stack reaches
// base * mult. Bowl locks automatically when all ingredients match.
// ═══════════════════════════════════════════════════════════════════════════════
class RecipeScalerScene extends Phaser.Scene {
  constructor() { super('RecipeScalerScene'); }

  create() {
    this.W = this.scale.width;
    this.H = this.scale.height;
    this.round = 0;
    this.lives = MAX_LIVES;
    this._bg();
    drawHeartsDotsScoreUI(this);
    this._buildHeaders();
    this.hero = addCharacter(this, this.W * 0.88, this.H * 0.55, 0.8);
    this.startRound();
  }

  _bg() {
    const bg = this.add.image(this.W / 2, this.H / 2, 'bg');
    bg.setScale(Math.max(this.W / bg.width, this.H / bg.height));
    this.add.rectangle(this.W / 2, this.H / 2, this.W, this.H, 0x000000, 0.72);
  }

  _buildHeaders() {
    const W = this.W;
    this.mathLbl = this.add.text(W / 2, 38, '', {
      fontSize: '19px', color: COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(10);
    this.promptLbl = this.add.text(W / 2, 68, '', {
      fontSize: '12px', color: COL_TEXT, fontFamily: "'Lexend', system-ui",
      align: 'center', wordWrap: { width: W - 60 }
    }).setOrigin(0.5, 0).setDepth(10);
  }

  startRound() {
    if (this.roundGroup) this.roundGroup.clear(true, true);
    this.roundGroup = this.add.group();
    this.locked = false;

    const data = getRound(this.round);
    const fb = RECIPE_FALLBACK[this.round % RECIPE_FALLBACK.length];
    const isDefault = !data || data.prompt === 'Solve this!' ||
      (Array.isArray(data.items) && data.items[0] === 10 && data.items[1] === 5);

    let base, mult;
    if (isDefault) {
      base = fb.base.slice(); mult = fb.mult;
    } else {
      // target = multiplier (2 or 3); items = base recipe amounts
      mult = data.target >= 2 && data.target <= 4 ? data.target : fb.mult;
      base = Array.isArray(data.items) ? data.items.slice(0, 4).filter(v => v >= 1 && v <= 4) : [];
      if (base.length < 2) base = fb.base.slice();
    }
    this.base = base;
    this.mult = mult;
    this.targets = base.map(b => b * mult);
    this.placed = base.map(() => 0);

    const COLORS = [COL_PRIMARY, COL_ACCENT, COL_DANGER, COL_SECONDARY];
    const NAMES = ['Flour', 'Sugar', 'Butter', 'Eggs'];
    this.ingColors = this.base.map((_, i) => COLORS[i % COLORS.length]);
    this.ingNames = this.base.map((_, i) => NAMES[i % NAMES.length]);

    this.mathLbl.setText('Scale recipe ×' + mult);
    this.promptLbl.setText('Base recipe on the left. Drag ingredient blocks into the bowl until each stack is ' + mult + '× the original.');

    this._drawStage();
    this._redrawStacks();
  }

  _drawStage() {
    const W = this.W, H = this.H;
    const N = this.base.length;
    // Base recipe column display (left)
    const baseX = W * 0.14;
    const baseY = H * 0.32;
    const rowH = 26;
    this.base.forEach((amt, i) => {
      const y = baseY + i * 48;
      // Label
      this.roundGroup.add(this.add.text(baseX, y, this.ingNames[i] + ' ×' + amt, {
        fontSize: '13px', color: this.ingColors[i], fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
      }).setOrigin(0, 0.5).setDepth(6));
      // Small tower to show base amount
      for (let k = 0; k < amt; k++) {
        const bx = baseX + 90 + k * 14;
        const by = y;
        const bk = this.add.rectangle(bx, by, 12, 18, hexToNum(this.ingColors[i]), 0.85).setDepth(6);
        bk.setStrokeStyle(1, 0xffffff, 0.4);
        this.roundGroup.add(bk);
      }
    });
    this.roundGroup.add(this.add.text(baseX, baseY - 24, 'Base recipe (for 1):', {
      fontSize: '12px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0, 0.5).setDepth(6));

    // Bowl (center-right) — a semicircular-ish area with columns
    const bowlCX = W * 0.55;
    const bowlCY = H * 0.6;
    const bowlW = Math.min(280, W * 0.45);
    const bowlH = 180;
    // Bowl outline (trapezoid-ish for visual)
    const bowlGfx = this.add.graphics().setDepth(4);
    bowlGfx.lineStyle(3, hexToNum(COL_SECONDARY), 0.8);
    bowlGfx.fillStyle(hexToNum(COL_SECONDARY), 0.1);
    bowlGfx.beginPath();
    bowlGfx.moveTo(bowlCX - bowlW / 2, bowlCY - bowlH / 2);
    bowlGfx.lineTo(bowlCX - bowlW / 2 + 20, bowlCY + bowlH / 2);
    bowlGfx.lineTo(bowlCX + bowlW / 2 - 20, bowlCY + bowlH / 2);
    bowlGfx.lineTo(bowlCX + bowlW / 2, bowlCY - bowlH / 2);
    bowlGfx.closePath();
    bowlGfx.fillPath();
    bowlGfx.strokePath();
    this.roundGroup.add(bowlGfx);

    // Bowl columns — one per ingredient
    this.colCenterX = [];
    const colGap = bowlW / (N + 1);
    for (let i = 0; i < N; i++) {
      const cx = bowlCX - bowlW / 2 + colGap * (i + 1);
      this.colCenterX.push(cx);
      // Column label
      this.roundGroup.add(this.add.text(cx, bowlCY + bowlH / 2 + 14, this.ingNames[i], {
        fontSize: '11px', color: this.ingColors[i], fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(6));
      // Target hint (ghost outline showing target stack height)
      for (let k = 0; k < this.targets[i]; k++) {
        const gy = bowlCY + bowlH / 2 - 14 - k * 18;
        const g = this.add.rectangle(cx, gy, 24, 14, 0x000000, 0)
          .setStrokeStyle(1, hexToNum(this.ingColors[i]), 0.3).setDepth(4);
        this.roundGroup.add(g);
      }
    }
    this.bowlBaseY = bowlCY + bowlH / 2 - 14;

    // Pool of draggable ingredient blocks (bottom)
    const poolY = H * 0.87;
    const poolStartX = W * 0.12;
    // Make enough blocks per ingredient for 2 successful attempts
    this.poolSprites = [];
    for (let i = 0; i < N; i++) {
      // Supply enough for target + 1 overflow (so child can try and correct)
      for (let k = 0; k < this.targets[i] + 1; k++) {
        const px = poolStartX + (i * (this.targets[0] + 2) + k) * 22;
        if (px > W * 0.9) break;
        const bk = this.add.rectangle(px, poolY, 18, 22, hexToNum(this.ingColors[i]), 0.9).setDepth(7);
        bk.setStrokeStyle(1, 0xffffff, 0.5);
        bk.setInteractive({ draggable: true, useHandCursor: true });
        bk._ingIdx = i;
        bk._origX = px;
        bk._origY = poolY;
        bk.on('dragstart', () => { bk.setDepth(20); });
        bk.on('drag', (p, dx, dy) => { bk.x = dx; bk.y = dy; });
        bk.on('dragend', () => this._handleDrop(bk));
        this.roundGroup.add(bk);
        this.poolSprites.push(bk);
      }
    }
  }

  _handleDrop(bk) {
    if (this.locked) return;
    const i = bk._ingIdx;
    // Is it inside the bowl area (roughly)?
    const nearestCol = this.colCenterX[i];
    const dx = Math.abs(bk.x - nearestCol);
    if (bk.y > this.bowlBaseY - this.targets[i] * 22 - 20 && bk.y < this.bowlBaseY + 40 && dx < 60) {
      // Accept into column
      if (this.placed[i] >= this.targets[i] + 1) {
        // Too many — bounce back
        this.tweens.add({ targets: bk, x: bk._origX, y: bk._origY, duration: 200 });
        return;
      }
      this.placed[i]++;
      bk.disableInteractive();
      // Place it in the column at correct height
      const targetY = this.bowlBaseY - (this.placed[i] - 1) * 18;
      this.tweens.add({ targets: bk, x: nearestCol, y: targetY, duration: 220, ease: 'Sine.easeOut' });
      bk.setDepth(6 + this.placed[i]);
      this._redrawStacks();
    } else {
      // Not in bowl — return
      this.tweens.add({ targets: bk, x: bk._origX, y: bk._origY, duration: 200 });
    }
  }

  _redrawStacks() {
    const allMatch = this.placed.every((p, i) => p === this.targets[i]);
    if (allMatch && !this.locked) this._lockSuccess();
  }

  _lockSuccess() {
    this.locked = true;
    this.cameras.main.flash(180, 34, 197, 94);
    heroCheer(this, this.hero);
    gameScore += 10 * (this.round + 1);
    this.scoreLbl.setText('Score: ' + gameScore);
    const lines = this.base.map((b, i) =>
      this.ingNames[i] + ': ' + b + ' × ' + this.mult + ' = ' + (b * this.mult)
    );
    lines.push('Recipe scaled by ×' + this.mult);
    showSolutionCard(this, 'Bowl ready!', lines, () => {
      this.round++;
      if (this.round >= TOTAL_ROUNDS) {
        this.scene.start('VictoryScene', { score: gameScore });
      } else {
        this.startRound();
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION C: Map Distance — "Draggable Scale Bar"
// A scale bar "1 bar = U km". Player drags the bar along a route on the map.
// Each drop appends one bar-length to a cumulative track. Live sum "U + U + U".
// When the route is exactly covered in integer bars, distance is revealed.
// ═══════════════════════════════════════════════════════════════════════════════
class MapDistanceScene extends Phaser.Scene {
  constructor() { super('MapDistanceScene'); }

  create() {
    this.W = this.scale.width;
    this.H = this.scale.height;
    this.round = 0;
    this.lives = MAX_LIVES;
    this._bg();
    drawHeartsDotsScoreUI(this);
    this._buildHeaders();
    this.hero = addCharacter(this, this.W * 0.88, this.H * 0.55, 0.8);
    this.startRound();
  }

  _bg() {
    const bg = this.add.image(this.W / 2, this.H / 2, 'bg');
    bg.setScale(Math.max(this.W / bg.width, this.H / bg.height));
    this.add.rectangle(this.W / 2, this.H / 2, this.W, this.H, 0x000000, 0.7);
  }

  _buildHeaders() {
    const W = this.W;
    this.mathLbl = this.add.text(W / 2, 38, '', {
      fontSize: '19px', color: COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(10);
    this.promptLbl = this.add.text(W / 2, 68, '', {
      fontSize: '12px', color: COL_TEXT, fontFamily: "'Lexend', system-ui",
      align: 'center', wordWrap: { width: W - 60 }
    }).setOrigin(0.5, 0).setDepth(10);
    this.liveLbl = this.add.text(W / 2, this.H - 56, '', {
      fontSize: '16px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);
  }

  startRound() {
    if (this.roundGroup) this.roundGroup.clear(true, true);
    this.roundGroup = this.add.group();
    this.locked = false;
    this.placedSteps = 0;

    const data = getRound(this.round);
    const fb = MAP_FALLBACK[this.round % MAP_FALLBACK.length];
    const isDefault = !data || data.prompt === 'Solve this!' ||
      (Array.isArray(data.items) && data.items[0] === 10 && data.items[1] === 5);

    let unit, steps;
    if (isDefault) {
      unit = fb.unit; steps = fb.steps;
    } else {
      unit = Array.isArray(data.items) && data.items[0] >= 2 && data.items[0] <= 20 ? data.items[0] : fb.unit;
      if (data.target && data.target % unit === 0) {
        steps = data.target / unit;
        if (steps < 2 || steps > 6) { unit = fb.unit; steps = fb.steps; }
      } else {
        steps = fb.steps;
      }
    }
    this.unit = unit;
    this.steps = steps;
    this.totalDist = unit * steps;

    this.mathLbl.setText('Distance = ' + unit + ' × ' + steps + ' = ' + this.totalDist + ' km');
    this.promptLbl.setText('Drag the scale bar along the route. Each drop is one scale unit. Cover the whole route.');

    this._drawStage();
  }

  _drawStage() {
    const W = this.W, H = this.H;
    // Map area background
    const mapX = W * 0.08, mapY = H * 0.18;
    const mapW = W * 0.82, mapH = H * 0.42;
    const mapBg = this.add.rectangle(mapX, mapY, mapW, mapH, hexToNum(COL_SECONDARY), 0.15)
      .setOrigin(0, 0).setStrokeStyle(1, hexToNum(COL_TEXT), 0.3).setDepth(3);
    this.roundGroup.add(mapBg);

    // Route: horizontal line from A to B
    const routeY = mapY + mapH * 0.5;
    // Compute bar pixel length so total fits within mapW * 0.8
    const maxRouteW = mapW * 0.78;
    const barPx = Math.floor(maxRouteW / this.steps);
    this.barPx = barPx;
    const routeStartX = mapX + (mapW - barPx * this.steps) / 2;
    const routeEndX = routeStartX + barPx * this.steps;
    this.routeStartX = routeStartX;
    this.routeEndX = routeEndX;
    this.routeY = routeY;

    // Dashed route
    const routeGfx = this.add.graphics().setDepth(4);
    routeGfx.lineStyle(3, hexToNum(COL_TEXT), 0.5);
    const dashLen = 8;
    for (let x = routeStartX; x < routeEndX; x += dashLen * 2) {
      routeGfx.lineBetween(x, routeY, Math.min(x + dashLen, routeEndX), routeY);
    }
    this.roundGroup.add(routeGfx);

    // Markers A (start) and B (end)
    const a = this.add.circle(routeStartX, routeY, 8, hexToNum(COL_ACCENT)).setDepth(5);
    const b = this.add.circle(routeEndX, routeY, 8, hexToNum(COL_DANGER)).setDepth(5);
    this.roundGroup.add(a); this.roundGroup.add(b);
    this.roundGroup.add(this.add.text(routeStartX, routeY - 16, 'A', {
      fontSize: '14px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5, 1).setDepth(5));
    this.roundGroup.add(this.add.text(routeEndX, routeY - 16, 'B', {
      fontSize: '14px', color: COL_DANGER, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5, 1).setDepth(5));

    // Placed-bar group (becomes visual history of drops)
    this.placedBarsGroup = this.add.group();

    // Scale legend
    this.roundGroup.add(this.add.text(W / 2, mapY + mapH + 18, 'Scale: 1 bar = ' + this.unit + ' km', {
      fontSize: '15px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(5));

    // The draggable scale bar (shown below)
    this._spawnDragBar();
    this._updateLive();
  }

  _spawnDragBar() {
    const W = this.W, H = this.H;
    const y = H * 0.78;
    const x = W * 0.5;
    if (this.dragBar) { this.dragBar.destroy(); this.dragBarLbl.destroy(); }
    const bar = this.add.rectangle(x, y, this.barPx, 20, hexToNum(COL_PRIMARY), 0.9).setDepth(10);
    bar.setStrokeStyle(2, 0xffffff, 1);
    bar.setInteractive({ draggable: true, useHandCursor: true });
    const lbl = this.add.text(x, y, this.unit + ' km', {
      fontSize: '13px', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);
    bar.on('drag', (p, dx, dy) => {
      bar.x = dx; bar.y = dy;
      lbl.x = dx; lbl.y = dy;
    });
    bar.on('dragend', () => this._tryPlace(bar, lbl));
    this.roundGroup.add(bar);
    this.roundGroup.add(lbl);
    this.dragBar = bar;
    this.dragBarLbl = lbl;
  }

  _tryPlace(bar, lbl) {
    if (this.locked) return;
    if (this.placedSteps >= this.steps) {
      // Already full — bounce back
      this.tweens.add({ targets: [bar, lbl], x: this.W * 0.5, y: this.H * 0.78, duration: 200 });
      return;
    }
    // Expected drop zone: next segment along the route
    const expectedX = this.routeStartX + (this.placedSteps + 0.5) * this.barPx;
    const expectedY = this.routeY;
    const distX = Math.abs(bar.x - expectedX);
    const distY = Math.abs(bar.y - expectedY);
    if (distX < this.barPx * 0.6 && distY < 40) {
      // Snap and record
      this.placedSteps++;
      bar.disableInteractive();
      this.tweens.add({ targets: [bar, lbl], x: expectedX, y: expectedY, duration: 220, ease: 'Sine.easeOut',
        onComplete: () => {
          // Freeze it in the route as a placed bar
          this.placedBarsGroup.add(bar);
          this.placedBarsGroup.add(lbl);
          this._updateLive();
          if (this.placedSteps === this.steps) {
            this._lockSuccess();
          } else {
            // Spawn a fresh bar for the next drop
            this._spawnDragBar();
          }
        }
      });
    } else {
      // Return
      this.tweens.add({ targets: [bar, lbl], x: this.W * 0.5, y: this.H * 0.78, duration: 200 });
    }
  }

  _updateLive() {
    const parts = [];
    for (let i = 0; i < this.placedSteps; i++) parts.push(String(this.unit));
    if (parts.length === 0) {
      this.liveLbl.setText('0 km so far (target ' + this.totalDist + ')').setColor(COL_TEXT);
    } else {
      const sum = this.unit * this.placedSteps;
      this.liveLbl.setText(parts.join(' + ') + ' = ' + sum + ' km (target ' + this.totalDist + ')')
        .setColor(sum === this.totalDist ? COL_ACCENT : COL_TEXT);
    }
  }

  _lockSuccess() {
    this.locked = true;
    this.cameras.main.flash(180, 34, 197, 94);
    heroCheer(this, this.hero);
    gameScore += 10 * (this.round + 1);
    this.scoreLbl.setText('Score: ' + gameScore);
    if (this.dragBar) { this.dragBar.disableInteractive(); }
    const sumStr = Array(this.steps).fill(this.unit).join(' + ');
    showSolutionCard(this, 'Route covered!', [
      'Scale: 1 bar = ' + this.unit + ' km',
      'Bars placed: ' + this.steps,
      sumStr + ' = ' + this.totalDist,
      this.unit + ' × ' + this.steps + ' = ' + this.totalDist + ' km',
    ], () => {
      this.round++;
      if (this.round >= TOTAL_ROUNDS) {
        this.scene.start('VictoryScene', { score: gameScore });
      } else {
        this.startRound();
      }
    });
  }
}
`
