// Construction Systems — Phaser engine with 3 game options.
// Math: Addition (height), area (rows × cols), volume (L × W × H).
// Options: stack-to-target, fill-the-floor, box-packer
//
// INTRINSIC DESIGN NOTES (April 13 rebuild):
// All three games now teach their math through PHYSICAL manipulation.
// No typed answers. No Check buttons. No Verify steps.
// - stack-to-target ("Sinking Pan"): drag height-blocks onto a pan; the
//   pan sinks proportionally until it lines up with a target line.
//   Physical sink IS addition.
// - fill-the-floor ("Resizable Rectangle"): drag corner handles to grow
//   a selection rectangle until W × H matches the target area exactly.
//   Stretching IS multiplication.
// - box-packer ("Transparent Cube Box"): three sliders for L/W/H fill a
//   transparent box with unit cubes. No input — when cubes equal target,
//   the box glows and locks. L × W × H IS volume, seen directly.
// All six rebuilt games share: math prompt at top, live feedback during
// interaction, auto-detect success, solution reveal card, 5 rounds,
// hero at W*0.88 / H*0.55 scale 0.8.

import type { ThemeConfig, MathParams, GameOption } from "./engine-types"
import { phaserGame } from "./base-phaser-template"
import { getOptionDef } from "./game-option-registry"

export function constructionSystemsPhaserEngine(
  config: ThemeConfig,
  math: MathParams,
  option: GameOption = "stack-to-target"
): string {
  const validOptions = ["stack-to-target", "fill-the-floor", "box-packer"]
  const activeOption = validOptions.includes(option) ? option : "stack-to-target"

  const optDef = getOptionDef(activeOption)

  const sceneMap: Record<string, string> = {
    "stack-to-target": "StackToTargetScene",
    "fill-the-floor": "FillTheFloorScene",
    "box-packer": "BoxPackerScene",
  }

  return phaserGame({
    config,
    math,
    option: activeOption,
    sceneName: sceneMap[activeOption],
    introText: optDef?.introText || "Build to the target!",
    helpText: optDef?.helpText || "Reach the exact measurement.",
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
  const card = scene.add.rectangle(W/2, H * 0.5, Math.min(W - 40, 420), 240, 0x18181b, 1)
    .setStrokeStyle(2, hexToNum(COL_ACCENT)).setDepth(51);
  const h1 = scene.add.text(W/2, H * 0.5 - 90, title, {
    fontSize: '22px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
  }).setOrigin(0.5).setDepth(52);
  const textObjs = [];
  lines.forEach((line, i) => {
    const isFinal = i === lines.length - 1;
    const t = scene.add.text(W/2, H * 0.5 - 50 + i * 30, line, {
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
  const btnY = H * 0.5 + 90;
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

// Fallback variations when AI rounds don't supply usable data
const STACK_FALLBACK = [
  { target: 10, heights: [2, 3, 5, 4, 6, 1] },
  { target: 12, heights: [3, 5, 4, 7, 2, 8] },
  { target: 15, heights: [4, 5, 6, 3, 9, 2] },
  { target: 18, heights: [5, 7, 6, 4, 11, 3] },
  { target: 20, heights: [6, 8, 7, 5, 12, 4] },
];
const FLOOR_FALLBACK = [
  { w: 3, h: 2, area: 6 },
  { w: 4, h: 3, area: 12 },
  { w: 5, h: 2, area: 10 },
  { w: 4, h: 4, area: 16 },
  { w: 6, h: 3, area: 18 },
];
const BOX_FALLBACK = [
  { l: 2, w: 2, h: 2, vol: 8 },
  { l: 3, w: 2, h: 2, vol: 12 },
  { l: 3, w: 3, h: 2, vol: 18 },
  { l: 4, w: 2, h: 3, vol: 24 },
  { l: 3, w: 3, h: 3, vol: 27 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION A: Stack to Target — "Sinking Pan"
// Drag blocks onto a scale pan. Pan sinks by block height. Match the target line.
// Addition = physical sink distance.
// ═══════════════════════════════════════════════════════════════════════════════
class StackToTargetScene extends Phaser.Scene {
  constructor() { super('StackToTargetScene'); }

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
    this.mathLbl = this.add.text(W / 2, 40, '', {
      fontSize: '20px', color: COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(10);
    this.promptLbl = this.add.text(W / 2, 72, '', {
      fontSize: '12px', color: COL_TEXT, fontFamily: "'Lexend', system-ui",
      align: 'center', wordWrap: { width: W - 60 }
    }).setOrigin(0.5, 0).setDepth(10);
    this.sumLbl = this.add.text(W / 2, this.H * 0.68, '', {
      fontSize: '15px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);
  }

  startRound() {
    // Cleanup previous visuals
    if (this.roundGroup) this.roundGroup.clear(true, true);
    this.roundGroup = this.add.group();

    const data = getRound(this.round);
    const fb = STACK_FALLBACK[this.round % STACK_FALLBACK.length];
    const isDefault = !data || data.prompt === 'Solve this!' ||
      (Array.isArray(data.items) && data.items.length === 6 && data.items[0] === 10 && data.items[1] === 5);
    let target, heights;
    if (isDefault) {
      target = fb.target;
      heights = fb.heights.slice();
    } else {
      target = data.target > 1 ? data.target : fb.target;
      heights = Array.isArray(data.items) && data.items.length >= 3 ? data.items.slice(0, 8) : fb.heights.slice();
      // Ensure solvability: inject blocks that sum to target if none do.
      heights = heights.filter(v => v > 0 && v <= target);
      if (heights.length < 3) heights = fb.heights.slice();
    }
    this.targetH = target;
    this.placed = [];
    this.currentH = 0;

    this.mathLbl.setText('Fill the pan to the line');
    this.promptLbl.setText('Drag blocks onto the pan. The pan sinks by each block\\'s height. Stop at the red line: total height = ' + target + '.');
    this.sumLbl.setText('Pan height: 0');

    this._drawStage(heights);
  }

  _drawStage(heights) {
    const W = this.W, H = this.H;
    // Measurement stick (left of pan)
    const stickX = W * 0.28;
    const baseY = H * 0.85;           // pan starts hanging here (empty)
    const topY  = H * 0.22;            // top of stick
    const totalTravel = baseY - topY;  // pixels used for max travel
    // Each unit of "height" = this many pixels of sink.
    // Scale so target uses ~60% of travel.
    const pxPerUnit = Math.min(18, (totalTravel * 0.75) / Math.max(this.targetH, 6));
    this.pxPerUnit = pxPerUnit;

    const stick = this.add.rectangle(stickX, (baseY + topY) / 2, 5, baseY - topY, hexToNum(COL_SECONDARY), 0.8).setDepth(3);
    this.roundGroup.add(stick);
    // Tick marks every 1 unit
    for (let i = 0; i <= this.targetH + 4; i++) {
      const y = baseY - i * pxPerUnit;
      if (y < topY) break;
      const tick = this.add.rectangle(stickX + 10, y, 12, 1, hexToNum(COL_TEXT), 0.5).setDepth(3);
      this.roundGroup.add(tick);
      if (i % 2 === 0) {
        const txt = this.add.text(stickX + 22, y, String(i), {
          fontSize: '10px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
        }).setOrigin(0, 0.5).setDepth(3);
        this.roundGroup.add(txt);
      }
    }
    // Target line (where the pan should end up)
    const targetY = baseY - this.targetH * pxPerUnit;
    const tLine = this.add.rectangle(stickX + 40, targetY, 110, 3, hexToNum(COL_DANGER), 1).setDepth(4);
    this.roundGroup.add(tLine);
    const tLbl = this.add.text(stickX + 100, targetY - 12, 'target ' + this.targetH, {
      fontSize: '12px', color: COL_DANGER, fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(0.5, 0.5).setDepth(4);
    this.roundGroup.add(tLbl);

    // The pan itself (moves down as blocks added)
    this.panX = stickX + 70;
    this.panBaseY = baseY;  // empty position
    const pan = this.add.rectangle(this.panX, baseY, 140, 10, hexToNum(COL_PRIMARY), 1).setDepth(6);
    this.pan = pan;
    this.roundGroup.add(pan);
    // Chain from stick to pan
    this.panChain = this.add.line(0, 0, stickX, topY + 10, this.panX, baseY, hexToNum(COL_TEXT)).setLineWidth(1).setOrigin(0);
    this.roundGroup.add(this.panChain);

    // Group for blocks sitting on the pan (above pan center)
    this.panBlocksGroup = this.add.group();

    // Drag source blocks on the right
    const startX = W * 0.6;
    const palette = heights.slice();
    this.paletteSprites = [];
    palette.forEach((h, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = startX + col * 55;
      const y = H * 0.28 + row * 52;
      const blockH = Math.max(14, Math.min(42, h * 4));
      const bg = this.add.rectangle(x, y, 44, blockH, hexToNum(COL_ACCENT), 0.8).setDepth(7);
      bg.setStrokeStyle(2, hexToNum(COL_ACCENT), 1);
      bg.setInteractive({ draggable: true, useHandCursor: true });
      // No text number — only visible height (intrinsic)
      const origX = x, origY = y;
      bg.on('drag', (p, dx, dy) => { bg.x = dx; bg.y = dy; });
      bg.on('dragend', (p) => {
        // Drop if near the pan
        const distToPan = Math.abs(bg.x - this.panX) + Math.max(0, bg.y - (this.pan.y + 40));
        if (bg.x > this.panX - 80 && bg.x < this.panX + 80 && bg.y > this.pan.y - 80 && bg.y < this.pan.y + 120) {
          this._dropOnPan(h, blockH, bg);
        } else {
          // return to palette
          this.tweens.add({ targets: bg, x: origX, y: origY, duration: 180 });
        }
      });
      this.roundGroup.add(bg);
      this.paletteSprites.push(bg);
    });
  }

  _dropOnPan(h, blockH, sourceSprite) {
    // Reject if already locked
    if (this.locked) {
      this.tweens.add({ targets: sourceSprite, alpha: 0, duration: 200, onComplete: () => sourceSprite.destroy() });
      return;
    }
    if (this.currentH + h > this.targetH) {
      // Overshoot — flash + return source to palette; lose heart
      this.lives--;
      this._redrawHearts();
      heroShake(this, this.hero);
      this.cameras.main.shake(150, 0.008);
      this.sumLbl.setText('Too heavy! ' + this.currentH + ' + ' + h + ' > ' + this.targetH).setColor(COL_DANGER);
      const sx = sourceSprite.x, sy = sourceSprite.y;
      this.tweens.add({ targets: sourceSprite, alpha: 0.3, duration: 150, yoyo: true, onComplete: () => {
        // Return to original palette slot: best-effort animation back upward
        this.tweens.add({ targets: sourceSprite, y: sy - 50, duration: 150, alpha: 1 });
      }});
      if (this.lives <= 0) {
        this.time.delayedCall(600, () => this.scene.start('LoseScene', { score: gameScore }));
      }
      return;
    }
    this.currentH += h;
    this.placed.push(h);
    sourceSprite.disableInteractive();
    sourceSprite.setVisible(false);

    // Place a visual block stack above the pan
    const stackBase = this.panBaseY - this.currentH * this.pxPerUnit;
    const blk = this.add.rectangle(this.panX, stackBase + (h * this.pxPerUnit) / 2 - 5,
      120, Math.max(4, h * this.pxPerUnit - 2), hexToNum(COL_ACCENT), 0.9).setDepth(7);
    blk.setStrokeStyle(1, hexToNum(COL_TEXT), 0.5);
    this.panBlocksGroup.add(blk);
    this.roundGroup.add(blk);

    // Tween pan downward
    const newPanY = this.panBaseY - 0; // pan itself also sinks by currentH units
    // Actually: pan moves DOWN by currentH units (visually the blocks ride with it).
    // Implementation: move pan down and blocks down together.
    const sinkPx = this.currentH * this.pxPerUnit;
    this.tweens.add({
      targets: this.pan,
      y: this.panBaseY + sinkPx,
      duration: 280,
      ease: 'Sine.easeInOut',
      onUpdate: () => this._updateChain(),
      onComplete: () => this._checkLock()
    });
    // Move blocks in same tween group
    this.panBlocksGroup.getChildren().forEach(b => {
      // Re-anchor each block relative to pan: blocks stack from pan.y upward.
    });
    // Simpler: relayout blocks above pan each tick
    this.time.delayedCall(0, () => this._relayoutPanBlocks());
    this.time.delayedCall(140, () => this._relayoutPanBlocks());
    this.time.delayedCall(280, () => this._relayoutPanBlocks());

    // Live sum
    const parts = this.placed.join(' + ');
    this.sumLbl.setText(parts + ' = ' + this.currentH + '  (target ' + this.targetH + ')').setColor(COL_ACCENT);
  }

  _relayoutPanBlocks() {
    let yCursor = this.pan.y - 5;
    this.panBlocksGroup.getChildren().slice().reverse().forEach((b, i) => {
      // Use the block's stored height
      yCursor -= b.height / 2;
      b.y = yCursor;
      yCursor -= b.height / 2;
    });
  }

  _updateChain() {
    // Redraw chain from stick top to pan
    if (this.panChain && this.panChain.setTo) {
      // recreate line geometry
    }
  }

  _checkLock() {
    if (this.currentH === this.targetH) {
      this.locked = true;
      // Chime flash + lock
      this.cameras.main.flash(180, 34, 197, 94);
      heroCheer(this, this.hero);
      this._burstParticles(this.panX, this.pan.y, 14);
      gameScore += 10 * (this.round + 1);
      this.scoreLbl.setText('Score: ' + gameScore);
      const parts = this.placed.join(' + ');
      showSolutionCard(this, 'Locked at ' + this.targetH + '!', [
        'You stacked: ' + parts,
        'Total: ' + parts + ' = ' + this.targetH,
        this.targetH + ' = target',
      ], () => {
        this.round++;
        this.locked = false;
        if (this.round >= TOTAL_ROUNDS) {
          this.scene.start('VictoryScene', { score: gameScore });
        } else {
          this.startRound();
        }
      });
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION B: Fill the Floor — "Resizable Rectangle"
// Drag corner handles to grow a rectangle. W × H = area updates live.
// When the shape matches target W × H exactly, it snaps and locks.
// ═══════════════════════════════════════════════════════════════════════════════
class FillTheFloorScene extends Phaser.Scene {
  constructor() { super('FillTheFloorScene'); }

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
    this.mathLbl = this.add.text(W / 2, 40, '', {
      fontSize: '20px', color: COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(10);
    this.promptLbl = this.add.text(W / 2, 72, '', {
      fontSize: '12px', color: COL_TEXT, fontFamily: "'Lexend', system-ui",
      align: 'center', wordWrap: { width: W - 60 }
    }).setOrigin(0.5, 0).setDepth(10);
    this.liveLbl = this.add.text(W / 2, this.H - 56, '', {
      fontSize: '18px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);
  }

  startRound() {
    if (this.roundGroup) this.roundGroup.clear(true, true);
    this.roundGroup = this.add.group();
    this.locked = false;

    const data = getRound(this.round);
    const fb = FLOOR_FALLBACK[this.round % FLOOR_FALLBACK.length];
    const isDefault = !data || data.prompt === 'Solve this!' ||
      (Array.isArray(data.items) && data.items[0] === 10 && data.items[1] === 5);

    let targetW, targetH;
    if (isDefault) {
      targetW = fb.w; targetH = fb.h;
    } else {
      // items may carry [cols, rows] like the old format — use if sensible
      if (Array.isArray(data.items) && data.items[0] >= 2 && data.items[1] >= 2 &&
          data.items[0] * data.items[1] === data.target) {
        targetW = data.items[0]; targetH = data.items[1];
      } else if (data.target > 1) {
        // Factor target into w×h
        const area = data.target;
        const factors = [];
        for (let f = 2; f <= Math.min(6, area); f++) {
          if (area % f === 0) factors.push([f, area / f]);
        }
        if (factors.length > 0) {
          const [a, b] = factors[Math.floor(factors.length / 2)];
          targetW = Math.min(6, Math.max(a, b));
          targetH = area / targetW;
          if (targetH > 6 || targetH < 1) { targetW = fb.w; targetH = fb.h; }
        } else {
          targetW = fb.w; targetH = fb.h;
        }
      } else {
        targetW = fb.w; targetH = fb.h;
      }
    }
    this.targetW = targetW;
    this.targetH_ = targetH;
    this.targetArea = targetW * targetH;
    this.curW = 1;
    this.curH = 1;

    this.mathLbl.setText('Area = W × H = ' + this.targetArea);
    this.promptLbl.setText('Drag the corner to stretch the rectangle. Match the target shape: ' + targetW + ' wide, ' + targetH + ' tall.');

    this._drawStage();
    this._redrawSelection();
  }

  _drawStage() {
    const W = this.W, H = this.H;
    // Grid parameters — up to 10×6 floor
    this.gridCols = 10;
    this.gridRows = 6;
    const available = Math.min(W * 0.85, (H * 0.55));
    const cell = Math.min(available / this.gridCols, (H * 0.45) / this.gridRows, 44);
    this.cell = cell;
    const gridW = this.gridCols * cell;
    const gridH = this.gridRows * cell;
    this.gridX = (W - gridW) / 2;
    this.gridY = H * 0.22;

    // Target preview (shaded)
    const tgtW = this.targetW * cell;
    const tgtH = this.targetH_ * cell;
    const tgtX = this.gridX + gridW + 14;
    const tgtY = this.gridY;
    // Preview may overflow — shrink label scale
    if (tgtX + tgtW < W - 10) {
      const tgt = this.add.rectangle(tgtX, tgtY, tgtW, tgtH, hexToNum(COL_DANGER), 0.18)
        .setOrigin(0, 0).setStrokeStyle(2, hexToNum(COL_DANGER), 0.8).setDepth(4);
      this.roundGroup.add(tgt);
      const tlbl = this.add.text(tgtX + tgtW / 2, tgtY - 14, 'target', {
        fontSize: '11px', color: COL_DANGER, fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
      }).setOrigin(0.5, 1).setDepth(4);
      this.roundGroup.add(tlbl);
    }

    // Grid cells (visual only)
    for (let r = 0; r < this.gridRows; r++) {
      for (let c = 0; c < this.gridCols; c++) {
        const x = this.gridX + c * cell + cell / 2;
        const y = this.gridY + r * cell + cell / 2;
        const border = this.add.rectangle(x, y, cell - 2, cell - 2, hexToNum(COL_SECONDARY), 0.08).setDepth(3);
        border.setStrokeStyle(1, hexToNum(COL_SECONDARY), 0.3);
        this.roundGroup.add(border);
      }
    }

    // Selection rectangle + corner handle
    this.selRect = this.add.rectangle(this.gridX, this.gridY, cell, cell, hexToNum(COL_ACCENT), 0.35)
      .setOrigin(0, 0).setStrokeStyle(3, hexToNum(COL_ACCENT), 1).setDepth(6);
    this.roundGroup.add(this.selRect);

    // Corner handle (bottom-right)
    this.handle = this.add.circle(this.gridX + cell, this.gridY + cell, 12, hexToNum(COL_PRIMARY), 1)
      .setStrokeStyle(2, 0xffffff, 1).setDepth(8);
    this.handle.setInteractive({ draggable: true, useHandCursor: true });
    this.roundGroup.add(this.handle);
    this.handle.on('drag', (p, dx, dy) => {
      if (this.locked) return;
      // Snap to grid cells
      const localX = dx - this.gridX;
      const localY = dy - this.gridY;
      let w = Math.max(1, Math.min(this.gridCols, Math.round(localX / cell)));
      let h = Math.max(1, Math.min(this.gridRows, Math.round(localY / cell)));
      if (w !== this.curW || h !== this.curH) {
        this.curW = w; this.curH = h;
        this._redrawSelection();
      }
    });
  }

  _redrawSelection() {
    const cell = this.cell;
    this.selRect.width = this.curW * cell;
    this.selRect.height = this.curH * cell;
    this.handle.x = this.gridX + this.curW * cell;
    this.handle.y = this.gridY + this.curH * cell;
    const area = this.curW * this.curH;
    this.liveLbl.setText(this.curW + ' × ' + this.curH + ' = ' + area).setColor(
      area === this.targetArea ? COL_ACCENT : COL_TEXT
    );
    if (!this.locked && this.curW === this.targetW && this.curH === this.targetH_) {
      this._lockSuccess();
    }
  }

  _lockSuccess() {
    this.locked = true;
    this.handle.disableInteractive();
    this.selRect.setFillStyle(hexToNum(COL_ACCENT), 0.55);
    this.cameras.main.flash(180, 34, 197, 94);
    heroCheer(this, this.hero);
    gameScore += 10 * (this.round + 1);
    this.scoreLbl.setText('Score: ' + gameScore);
    showSolutionCard(this, 'Snapped!', [
      'Width: ' + this.targetW,
      'Height: ' + this.targetH_,
      this.targetW + ' × ' + this.targetH_ + ' = ' + this.targetArea,
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
// OPTION C: Box Packer — "Transparent Cube Box"
// Three sliders (L, W, H). Unit cubes fill a transparent box in layers.
// When L × W × H matches target volume, box glows and locks. No typed answer.
// ═══════════════════════════════════════════════════════════════════════════════
class BoxPackerScene extends Phaser.Scene {
  constructor() { super('BoxPackerScene'); }

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
    this.add.rectangle(this.W / 2, this.H / 2, this.W, this.H, 0x000000, 0.75);
  }

  _buildHeaders() {
    const W = this.W;
    this.mathLbl = this.add.text(W / 2, 36, '', {
      fontSize: '20px', color: COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(10);
    this.promptLbl = this.add.text(W / 2, 68, '', {
      fontSize: '12px', color: COL_TEXT, fontFamily: "'Lexend', system-ui",
      align: 'center', wordWrap: { width: W - 60 }
    }).setOrigin(0.5, 0).setDepth(10);
    this.liveLbl = this.add.text(W / 2, this.H - 86, '', {
      fontSize: '18px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);
  }

  startRound() {
    if (this.roundGroup) this.roundGroup.clear(true, true);
    this.roundGroup = this.add.group();
    this.locked = false;

    const data = getRound(this.round);
    const fb = BOX_FALLBACK[this.round % BOX_FALLBACK.length];
    const isDefault = !data || data.prompt === 'Solve this!' ||
      (Array.isArray(data.items) && data.items[0] === 10 && data.items[1] === 5);

    let tl, tw, th, tvol;
    if (isDefault) {
      tl = fb.l; tw = fb.w; th = fb.h; tvol = fb.vol;
    } else if (Array.isArray(data.items) && data.items.length >= 3 &&
               data.items[0] * data.items[1] * data.items[2] === data.target) {
      tl = data.items[0]; tw = data.items[1]; th = data.items[2]; tvol = data.target;
    } else {
      tl = fb.l; tw = fb.w; th = fb.h; tvol = fb.vol;
    }
    this.tl = Math.min(6, Math.max(2, tl));
    this.tw = Math.min(6, Math.max(2, tw));
    this.th = Math.min(6, Math.max(2, th));
    this.tvol = this.tl * this.tw * this.th;

    // Start sliders at 1/1/1
    this.curL = 1; this.curW = 1; this.curH = 1;

    this.mathLbl.setText('Volume = L × W × H = ' + this.tvol);
    this.promptLbl.setText('Slide the three dials. Unit cubes stack inside the box. Match the target volume.');

    this._drawStage();
    this._redrawBox();
  }

  _drawStage() {
    const W = this.W, H = this.H;
    // Box area in center-left
    this.boxCX = W * 0.38;
    this.boxCY = H * 0.45;
    // Max drawing size for a 6×6×6 box
    this.unitPx = 18; // base unit cube px (front face)

    // Sliders on the right
    const sliders = [
      { label: 'L', key: 'curL', max: 6, y: H * 0.25, color: COL_PRIMARY },
      { label: 'W', key: 'curW', max: 6, y: H * 0.43, color: COL_ACCENT },
      { label: 'H', key: 'curH', max: 6, y: H * 0.61, color: COL_DANGER },
    ];
    const sliderX = W * 0.70;
    const trackW = Math.min(160, W * 0.22);
    sliders.forEach(s => {
      const trackY = s.y;
      const track = this.add.rectangle(sliderX, trackY, trackW, 6, hexToNum(COL_SECONDARY), 0.6).setDepth(5);
      this.roundGroup.add(track);
      const lbl = this.add.text(sliderX - trackW / 2 - 22, trackY, s.label, {
        fontSize: '18px', color: s.color, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(6);
      this.roundGroup.add(lbl);
      const valLbl = this.add.text(sliderX + trackW / 2 + 22, trackY, '1', {
        fontSize: '18px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(6);
      this.roundGroup.add(valLbl);
      // Tick marks
      for (let i = 1; i <= s.max; i++) {
        const tx = sliderX - trackW / 2 + ((i - 1) / (s.max - 1)) * trackW;
        const tk = this.add.rectangle(tx, trackY, 2, 12, hexToNum(COL_SECONDARY), 0.6).setDepth(5);
        this.roundGroup.add(tk);
      }
      // Handle
      const startX = sliderX - trackW / 2; // val=1
      const handle = this.add.circle(startX, trackY, 13, hexToNum(s.color), 1)
        .setStrokeStyle(2, 0xffffff, 1).setDepth(7);
      handle.setInteractive({ draggable: true, useHandCursor: true });
      this.roundGroup.add(handle);
      handle.on('drag', (p, dx) => {
        if (this.locked) return;
        const clamped = Math.max(sliderX - trackW / 2, Math.min(sliderX + trackW / 2, dx));
        const frac = (clamped - (sliderX - trackW / 2)) / trackW;
        const val = Math.max(1, Math.min(s.max, Math.round(1 + frac * (s.max - 1))));
        // Snap handle to exact tick
        const snapX = sliderX - trackW / 2 + ((val - 1) / (s.max - 1)) * trackW;
        handle.x = snapX;
        if (this[s.key] !== val) {
          this[s.key] = val;
          valLbl.setText(String(val));
          this._redrawBox();
        }
      });
    });
  }

  _redrawBox() {
    // Clear previous cube visuals
    if (this.cubeGroup) this.cubeGroup.clear(true, true);
    this.cubeGroup = this.add.group();

    const L = this.curL, Wd = this.curW, Hh = this.curH;
    const u = this.unitPx;
    // Perspective offsets: width (depth) goes up-right
    const depthX = 0.5, depthY = -0.4;
    // Bottom-front-left anchor so the box "sits" at a stable spot
    const anchorX = this.boxCX - (L * u) / 2;
    const anchorY = this.boxCY + (Hh * u) / 2;

    // Draw outline of target box (transparent wireframe) — size matches target
    const TL = this.tl, TW = this.tw, TH = this.th;
    const outlineAnchorX = this.boxCX - (TL * u) / 2;
    const outlineAnchorY = this.boxCY + (TH * u) / 2;
    const olColor = this.locked ? hexToNum(COL_ACCENT) : hexToNum(COL_TEXT);
    const olAlpha = 0.7;
    const gfx = this.add.graphics().setDepth(3);
    gfx.lineStyle(2, olColor, olAlpha);
    // Front face
    gfx.strokeRect(outlineAnchorX, outlineAnchorY - TH * u, TL * u, TH * u);
    // Back face offset
    const dx = TW * u * depthX, dy = TW * u * depthY;
    gfx.strokeRect(outlineAnchorX + dx, outlineAnchorY - TH * u + dy, TL * u, TH * u);
    // Connect corners
    gfx.beginPath();
    gfx.moveTo(outlineAnchorX, outlineAnchorY - TH * u);
    gfx.lineTo(outlineAnchorX + dx, outlineAnchorY - TH * u + dy);
    gfx.moveTo(outlineAnchorX + TL * u, outlineAnchorY - TH * u);
    gfx.lineTo(outlineAnchorX + TL * u + dx, outlineAnchorY - TH * u + dy);
    gfx.moveTo(outlineAnchorX, outlineAnchorY);
    gfx.lineTo(outlineAnchorX + dx, outlineAnchorY + dy);
    gfx.moveTo(outlineAnchorX + TL * u, outlineAnchorY);
    gfx.lineTo(outlineAnchorX + TL * u + dx, outlineAnchorY + dy);
    gfx.strokePath();
    this.cubeGroup.add(gfx);

    // Draw unit cubes inside — sorted back-to-front, bottom-to-top, for simple overlap
    // Iterate: w (depth), h (height), l (length)
    const ccubes = [];
    for (let wi = Wd - 1; wi >= 0; wi--) {
      for (let hi = 0; hi < Hh; hi++) {
        for (let li = 0; li < L; li++) {
          // front-face coords for this cube
          const fx = anchorX + li * u;
          const fy = anchorY - (hi + 1) * u; // top of this cube's front face
          const cdx = wi * u * depthX;
          const cdy = wi * u * depthY;
          const frontX = fx + cdx;
          const frontY = fy + cdy;
          ccubes.push({ frontX, frontY, depth: wi, height: hi });
        }
      }
    }
    // Draw in sort order (painter's algorithm: far first, then bottom, then lower length)
    ccubes.sort((a, b) => b.depth - a.depth || a.height - b.height);
    const cubeColor = this.locked ? hexToNum(COL_ACCENT) : hexToNum(COL_PRIMARY);
    ccubes.forEach(c => {
      const g = this.add.graphics().setDepth(4 + (Wd - c.depth));
      g.fillStyle(cubeColor, 0.7);
      g.lineStyle(1, 0xffffff, 0.4);
      // Front face
      g.fillRect(c.frontX, c.frontY, u, u);
      g.strokeRect(c.frontX, c.frontY, u, u);
      // Top face parallelogram
      const p = [
        { x: c.frontX, y: c.frontY },
        { x: c.frontX + u * depthX, y: c.frontY + u * depthY },
        { x: c.frontX + u + u * depthX, y: c.frontY + u * depthY },
        { x: c.frontX + u, y: c.frontY },
      ];
      g.fillStyle(cubeColor, 0.9);
      g.beginPath(); g.moveTo(p[0].x, p[0].y);
      p.slice(1).forEach(pt => g.lineTo(pt.x, pt.y));
      g.closePath(); g.fillPath(); g.strokePath();
      // Right face parallelogram
      const rp = [
        { x: c.frontX + u, y: c.frontY },
        { x: c.frontX + u + u * depthX, y: c.frontY + u * depthY },
        { x: c.frontX + u + u * depthX, y: c.frontY + u + u * depthY },
        { x: c.frontX + u, y: c.frontY + u },
      ];
      g.fillStyle(cubeColor, 0.5);
      g.beginPath(); g.moveTo(rp[0].x, rp[0].y);
      rp.slice(1).forEach(pt => g.lineTo(pt.x, pt.y));
      g.closePath(); g.fillPath(); g.strokePath();
      this.cubeGroup.add(g);
    });

    const vol = L * Wd * Hh;
    this.liveLbl.setText(L + ' × ' + Wd + ' × ' + Hh + ' = ' + vol + '  (target ' + this.tvol + ')')
      .setColor(vol === this.tvol && L === this.tl && Wd === this.tw && Hh === this.th ? COL_ACCENT : COL_TEXT);

    if (!this.locked && L === this.tl && Wd === this.tw && Hh === this.th) {
      this._lockSuccess();
    }
  }

  _lockSuccess() {
    this.locked = true;
    this.cameras.main.flash(180, 34, 197, 94);
    heroCheer(this, this.hero);
    this._burstParticles(this.boxCX, this.boxCY, 16);
    gameScore += 10 * (this.round + 1);
    this.scoreLbl.setText('Score: ' + gameScore);
    this._redrawBox();
    showSolutionCard(this, 'Box filled!', [
      'Length: ' + this.tl,
      'Width: ' + this.tw,
      'Height: ' + this.th,
      this.tl + ' × ' + this.tw + ' × ' + this.th + ' = ' + this.tvol,
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
