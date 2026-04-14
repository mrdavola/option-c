// Collect & Manage — Phaser engine with 3 game options.
// Math: Add values to hit a target sum.
// Options: free-collect, conveyor-belt, split-the-loot
//
// ═══════════════════════════════════════════════════════════════════════════════
// INTRINSIC DESIGN NOTES — all three scenes follow MysterySideScene's model:
//
// The math the child is learning is EMBEDDED in the physical manipulation.
// You cannot succeed by reading numbers and computing in your head. You succeed
// by watching a visual state (dot fields / liquid levels / silo fills) match a
// target. Numbers appear as reinforcement (labels), never as gates.
//
// Self-revealing truth: when the visual match happens, the system auto-snaps
// and reveals the arithmetic that was just performed. No "Check" buttons.
// ═══════════════════════════════════════════════════════════════════════════════

import type { ThemeConfig, MathParams, GameOption } from "./engine-types"
import { phaserGame } from "./base-phaser-template"
import { getOptionDef } from "./game-option-registry"

export function collectManagePhaserEngine(
  config: ThemeConfig,
  math: MathParams,
  option: GameOption = "free-collect"
): string {
  const validOptions = ["free-collect", "conveyor-belt", "split-the-loot"]
  const activeOption = validOptions.includes(option) ? option : "free-collect"

  const optDef = getOptionDef(activeOption)

  const sceneMap: Record<string, string> = {
    "free-collect": "FreeCollectScene",
    "conveyor-belt": "ConveyorBeltScene",
    "split-the-loot": "SplitTheLootScene",
  }

  return phaserGame({
    config,
    math,
    option: activeOption,
    sceneName: sceneMap[activeOption],
    introText: optDef?.introText || "Match the target!",
    helpText: optDef?.helpText || "Match the target by physical manipulation.",
    gameSceneCode: GAME_SCENES,
  })
}

const GAME_SCENES = `
// ─── Shared helpers ──────────────────────────────────────────────────────────
function _buildHUD(scene) {
  const W = scene.W, pad = 14;
  scene.scoreLbl = scene.add.text(W - pad, pad, 'Score: 0', {
    fontSize: '16px', color: COL_ACCENT, fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
  }).setOrigin(1, 0).setDepth(10);
  scene.heartsGroup = scene.add.group();
  _redrawHearts(scene);
  scene.dotGroup = scene.add.group();
  _redrawDots(scene);
}
function _redrawHearts(scene) {
  scene.heartsGroup.clear(true, true);
  for (let i = 0; i < MAX_LIVES; i++) {
    const col = i < scene.lives ? COL_DANGER : '#444';
    scene.heartsGroup.add(scene.add.text(14 + i * 22, 14, '♥', {
      fontSize: '18px', color: col, fontFamily: 'system-ui'
    }).setDepth(10));
  }
}
function _redrawDots(scene) {
  scene.dotGroup.clear(true, true);
  const dotW = 10, gap = 6, total = (dotW + gap) * TOTAL_ROUNDS - gap;
  const startX = scene.W / 2 - total / 2;
  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    let col = i < scene.round ? hexToNum(COL_ACCENT) : i === scene.round ? hexToNum(COL_PRIMARY) : 0x444444;
    scene.dotGroup.add(scene.add.circle(startX + i * (dotW + gap), scene.H - 14, dotW / 2, col, 1).setDepth(10));
  }
}

function _sceneBackground(scene) {
  const bg = scene.add.image(scene.W / 2, scene.H / 2, 'bg');
  bg.setScale(Math.max(scene.W / bg.width, scene.H / bg.height));
  scene.add.rectangle(scene.W / 2, scene.H / 2, scene.W, scene.H, 0x000000, 0.7);
}

// Show a solution-reveal card (MysterySideScene pattern). Lines = array of strings.
function _showSolutionCard(scene, lines, onNext) {
  if (scene.solutionCard) return;
  const W = scene.W, H = scene.H;
  const backdrop = scene.add.rectangle(W/2, H/2, W, H, 0x000000, 0.55).setDepth(50);
  const card = scene.add.rectangle(W/2, H * 0.55, W - 40, 240, 0x18181b, 1)
    .setStrokeStyle(2, hexToNum(COL_ACCENT)).setDepth(51);
  const h1 = scene.add.text(W/2, H * 0.55 - 95, 'You matched it!', {
    fontSize: '22px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
  }).setOrigin(0.5).setDepth(52);
  const textObjs = [];
  lines.forEach((line, i) => {
    const t = scene.add.text(W/2, H * 0.55 - 55 + i * 28, line, {
      fontSize: i === lines.length - 1 ? '22px' : '15px',
      color: i === lines.length - 1 ? COL_ACCENT : COL_TEXT,
      fontFamily: "'Space Grotesk', sans-serif",
      fontStyle: i === lines.length - 1 ? 'bold' : 'normal',
      align: 'center'
    }).setOrigin(0.5).setDepth(52).setAlpha(0);
    textObjs.push(t);
    scene.time.delayedCall(180 * i, () => {
      scene.tweens.add({ targets: t, alpha: 1, duration: 280 });
    });
  });
  const nextY = H * 0.55 + 90;
  const isLast = scene.round + 1 >= TOTAL_ROUNDS;
  const nextBg = scene.add.rectangle(W/2, nextY, 210, 42, hexToNum(COL_ACCENT), 1)
    .setInteractive({ useHandCursor: true }).setDepth(52).setAlpha(0);
  const nextLbl = scene.add.text(W/2, nextY, isLast ? 'Finish!' : 'Got it! Next round →', {
    fontSize: '14px', color: '#000', fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
  }).setOrigin(0.5).setDepth(53).setAlpha(0);
  scene.time.delayedCall(180 * lines.length + 160, () => {
    scene.tweens.add({ targets: [nextBg, nextLbl], alpha: 1, duration: 280 });
  });
  const cleanup = () => {
    [backdrop, card, h1, ...textObjs, nextBg, nextLbl].forEach(o => o && o.destroy());
    scene.solutionCard = null;
    onNext();
  };
  nextBg.on('pointerdown', cleanup);
  scene.solutionCard = { destroy: cleanup };
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION A: Free Collect — INTRINSIC REBUILD (visual dot-field matching)
//
// Items are VISUAL GROUPS OF DOTS (no numbers to read to succeed — numbers are
// labels for reinforcement only). A target dot-field is shown at the top.
// Clicking an item flies its dots into a growing collection dot-field at the
// bottom. When the bottom field visually matches the target field (same dot
// count AND same arrangement), it snaps, locks, and the equation is revealed.
//
// Child discovers addition through visual combining. They do NOT need to read
// or compute numbers to succeed. The system auto-detects the match — no Check
// button. Discovery + Self-Revealing Truth.
// ═══════════════════════════════════════════════════════════════════════════════
class FreeCollectScene extends Phaser.Scene {
  constructor() { super('FreeCollectScene'); }

  create() {
    this.W = this.scale.width;
    this.H = this.scale.height;
    this.round = 0;
    this.lives = MAX_LIVES;
    this.collected = []; // array of { val, dots: [] }
    this.currentTotal = 0;

    _sceneBackground(this);
    _buildHUD(this);
    this._buildLabels();
    this.hero = addCharacter(this, this.W * 0.88, this.H * 0.55, 0.8);
    this.startRound();
  }

  _buildLabels() {
    const W = this.W, pad = 14;
    this.equationLbl = this.add.text(W / 2, 40, '', {
      fontSize: '18px', color: COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(10);
    this.promptLbl = this.add.text(W / 2, 66, 'Tap items — grow your field to match the target', {
      fontSize: '12px', color: COL_TEXT, fontFamily: "'Lexend', system-ui",
      align: 'center', wordWrap: { width: W - 40 }, alpha: 0.8
    }).setOrigin(0.5, 0).setDepth(10);
  }

  _fieldLayout(count) {
    // Grid arrangement: columns grow with count
    const cols = count <= 4 ? count : count <= 9 ? 3 : count <= 16 ? 4 : 5;
    const rows = Math.ceil(count / cols);
    const positions = [];
    for (let i = 0; i < count; i++) {
      const c = i % cols, r = Math.floor(i / cols);
      positions.push({ cx: c - (cols - 1) / 2, cy: r - (rows - 1) / 2 });
    }
    return { cols, rows, positions };
  }

  _drawField(centerX, centerY, count, color, dotR, gap) {
    // Returns array of circles drawn at given center
    const layout = this._fieldLayout(count);
    const out = [];
    layout.positions.forEach(p => {
      const x = centerX + p.cx * gap;
      const y = centerY + p.cy * gap;
      const c = this.add.circle(x, y, dotR, hexToNum(color), 1).setDepth(5);
      out.push(c);
    });
    return out;
  }

  startRound() {
    const data = getRound(this.round);
    // Fallback to guarantee solvability: items must include a subset summing to target
    const roundVariation = [
      { target: 7,  items: [3, 4, 2, 5] },
      { target: 10, items: [4, 6, 3, 7, 2] },
      { target: 12, items: [5, 7, 4, 8, 3] },
      { target: 15, items: [6, 9, 4, 7, 5] },
      { target: 18, items: [8, 10, 6, 7, 5] },
    ];
    const isDefault = !data || data.prompt === 'Solve this!' ||
      (Array.isArray(data.items) && data.items[0] === 10 && data.items[1] === 5);
    const fb = roundVariation[this.round % roundVariation.length];
    this.targetValue = isDefault ? fb.target : (data.target || fb.target);
    this.itemValues  = isDefault ? fb.items.slice() : (Array.isArray(data.items) && data.items.length ? data.items.slice() : fb.items.slice());

    // Reset state
    this.collected = [];
    this.currentTotal = 0;
    if (this._itemObjs) this._itemObjs.forEach(o => o.destroy && o.destroy());
    if (this._targetObjs) this._targetObjs.forEach(o => o.destroy && o.destroy());
    if (this._collectedObjs) this._collectedObjs.forEach(o => o.destroy && o.destroy());
    this._itemObjs = [];
    this._targetObjs = [];
    this._collectedObjs = [];

    this.equationLbl.setText('Target: ' + this.targetValue + ' dots');
    _redrawDots(this);

    // Draw TARGET field (top)
    const targetCX = this.W / 2, targetCY = this.H * 0.22;
    const tBg = this.add.rectangle(targetCX, targetCY, this.W * 0.55, 90, 0x000000, 0.3)
      .setStrokeStyle(2, hexToNum(COL_ACCENT), 0.7).setDepth(4);
    this._targetObjs.push(tBg);
    const tLbl = this.add.text(targetCX, targetCY - 58, 'TARGET', {
      fontSize: '11px', color: COL_ACCENT, fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6);
    this._targetObjs.push(tLbl);
    const tNumLbl = this.add.text(targetCX + this.W * 0.22, targetCY, String(this.targetValue), {
      fontSize: '26px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6);
    this._targetObjs.push(tNumLbl);
    const targetDots = this._drawField(targetCX - 30, targetCY, this.targetValue, COL_ACCENT, 5, 14);
    targetDots.forEach(d => this._targetObjs.push(d));

    // Draw COLLECTION field (middle) — empty at start
    this.collectCX = this.W / 2;
    this.collectCY = this.H * 0.48;
    const cBg = this.add.rectangle(this.collectCX, this.collectCY, this.W * 0.55, 90, 0x000000, 0.25)
      .setStrokeStyle(2, hexToNum(COL_PRIMARY), 0.5).setDepth(4);
    this._collectedObjs.push(cBg);
    this.collectBg = cBg;
    this.collectNumLbl = this.add.text(this.collectCX + this.W * 0.22, this.collectCY, '0', {
      fontSize: '26px', color: COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6);
    this._collectedObjs.push(this.collectNumLbl);
    const cLbl = this.add.text(this.collectCX, this.collectCY - 58, 'YOUR FIELD', {
      fontSize: '11px', color: COL_PRIMARY, fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6);
    this._collectedObjs.push(cLbl);

    // Draw ITEM BANK (bottom) — each item is a small dot-cluster (with number label for reinforcement)
    const bankY = this.H * 0.78;
    const n = this.itemValues.length;
    const gap = Math.min(86, (this.W - 40) / n);
    const startX = this.W / 2 - ((n - 1) * gap) / 2;
    this.itemValues.forEach((val, i) => {
      const x = startX + i * gap;
      const bg = this.add.rectangle(x, bankY, 70, 70, hexToNum(COL_SECONDARY), 0.25)
        .setStrokeStyle(1, hexToNum(COL_TEXT), 0.3).setDepth(4)
        .setInteractive({ useHandCursor: true });
      const dots = this._drawField(x, bankY - 4, val, COL_PRIMARY, 3, 8);
      const numLbl = this.add.text(x, bankY + 28, String(val), {
        fontSize: '14px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(6);
      let used = false;
      bg.on('pointerdown', () => {
        if (used || this.solutionCard) return;
        used = true;
        bg.setAlpha(0.3);
        dots.forEach(d => d.setAlpha(0.25));
        numLbl.setAlpha(0.4);
        this._flyItem(x, bankY - 4, val);
      });
      this._itemObjs.push(bg, numLbl);
      dots.forEach(d => this._itemObjs.push(d));
      this._itemObjs.push({ destroy: () => {} }); // placeholder
    });
  }

  _flyItem(srcX, srcY, val) {
    // Create val "flying dots" that travel from source to collection area
    // then become part of the collection dot-field.
    const entry = { val, dots: [] };
    for (let i = 0; i < val; i++) {
      const dot = this.add.circle(srcX + (Math.random() - 0.5) * 10, srcY + (Math.random() - 0.5) * 10, 4, hexToNum(COL_PRIMARY), 1).setDepth(15);
      entry.dots.push(dot);
    }
    this.collected.push(entry);
    this.currentTotal += val;
    this.collectNumLbl.setText(String(this.currentTotal));
    // Tween dots to their layout positions in the collection field
    this._relayoutCollection(true, srcX, srcY);

    // Auto-check after animation
    this.time.delayedCall(420, () => this._checkMatch());
  }

  _relayoutCollection(animateFromSource, srcX, srcY) {
    // All dots in this.collected form ONE combined field with currentTotal dots
    const layout = this._fieldLayout(this.currentTotal);
    const gap = 14;
    const cx = this.collectCX - 30;
    const cy = this.collectCY;
    let k = 0;
    this.collected.forEach(entry => {
      entry.dots.forEach(dot => {
        const p = layout.positions[k++];
        if (!p) return;
        const targetX = cx + p.cx * gap;
        const targetY = cy + p.cy * gap;
        this.tweens.add({
          targets: dot,
          x: targetX, y: targetY,
          duration: 380,
          ease: 'Cubic.easeOut'
        });
      });
    });
    // Color update
    const matched = this.currentTotal === this.targetValue;
    this.collectBg.setStrokeStyle(2, matched ? hexToNum(COL_ACCENT) : hexToNum(COL_PRIMARY), matched ? 1 : 0.5);
    this.collectNumLbl.setColor(matched ? COL_ACCENT : this.currentTotal > this.targetValue ? COL_DANGER : COL_PRIMARY);
  }

  _checkMatch() {
    if (this.solutionCard) return;
    if (this.currentTotal === this.targetValue) {
      // VISUAL MATCH — snap, lock, reveal
      heroCheer(this, this.hero);
      this.cameras.main.flash(140, 34, 197, 94);
      this.collected.forEach(e => e.dots.forEach(d => d.setFillStyle(hexToNum(COL_ACCENT), 1)));
      gameScore += 10 * (this.round + 1);
      this.scoreLbl.setText('Score: ' + gameScore);
      // Reveal equation
      const parts = this.collected.map(e => e.val);
      const eqStr = parts.join(' + ') + ' = ' + this.targetValue;
      _showSolutionCard(this, [
        'You combined ' + parts.length + ' group' + (parts.length === 1 ? '' : 's') + ' of dots:',
        eqStr,
        'Total: ' + this.targetValue,
      ], () => {
        this.round++;
        if (this.round >= TOTAL_ROUNDS) {
          this.scene.start('VictoryScene', { score: gameScore });
        } else {
          this.startRound();
        }
      });
    } else if (this.currentTotal > this.targetValue) {
      // Over — lose a life, reset
      this.lives--;
      _redrawHearts(this);
      heroShake(this, this.hero);
      this.cameras.main.shake(160, 0.008);
      if (this.lives <= 0) {
        this.time.delayedCall(500, () => this.scene.start('LoseScene', { score: gameScore }));
        return;
      }
      this.time.delayedCall(600, () => this.startRound());
    }
    // else: under target — keep playing silently
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION B: Conveyor Belt — INTRINSIC REBUILD (liquid mixing tank)
//
// Conveyor cups scroll past. Each cup holds proportional liquid (visible by
// fill level, and labelled). Tap a cup to pour its liquid into a transparent
// TANK. Target line marked on the tank. When the liquid LEVEL reaches the
// target line exactly, the tank glows and locks.
//
// Overfill is visibly catastrophic — the tank overflows red. The accumulation
// IS the addition. Child sees liquid rise visually — no number reading needed
// to succeed.
// ═══════════════════════════════════════════════════════════════════════════════
class ConveyorBeltScene extends Phaser.Scene {
  constructor() { super('ConveyorBeltScene'); }

  create() {
    this.W = this.scale.width;
    this.H = this.scale.height;
    this.round = 0;
    this.lives = MAX_LIVES;
    this.tankAmount = 0;
    this.beltItems = [];
    this.poured = []; // array of values for the equation
    this.beltSpeed = 1.2;

    _sceneBackground(this);
    _buildHUD(this);
    this._buildLabels();
    this._buildTank();
    this._buildBelt();
    this.hero = addCharacter(this, this.W * 0.88, this.H * 0.55, 0.8);
    this.startRound();
  }

  _buildLabels() {
    const W = this.W;
    this.equationLbl = this.add.text(W / 2, 40, '', {
      fontSize: '18px', color: COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(10);
    this.promptLbl = this.add.text(W / 2, 66, 'Tap cups to pour — fill to the target line exactly', {
      fontSize: '12px', color: COL_TEXT, fontFamily: "'Lexend', system-ui", alpha: 0.8,
      align: 'center', wordWrap: { width: W - 40 }
    }).setOrigin(0.5, 0).setDepth(10);
  }

  _buildTank() {
    const W = this.W, H = this.H;
    // Tank body on the left side
    this.tankX = W * 0.18;
    this.tankTopY = H * 0.22;
    this.tankBotY = H * 0.62;
    this.tankW = 90;
    this.tankH = this.tankBotY - this.tankTopY;
    // Walls
    this.add.rectangle(this.tankX, (this.tankTopY + this.tankBotY) / 2, this.tankW, this.tankH, 0x000000, 0.35)
      .setStrokeStyle(3, hexToNum(COL_TEXT), 0.8).setDepth(4);
    // Target line (drawn per round)
    this.tankLiquid = this.add.rectangle(this.tankX, this.tankBotY, this.tankW - 6, 0, hexToNum(COL_PRIMARY), 0.8)
      .setOrigin(0.5, 1).setDepth(5);
    this.tankValueLbl = this.add.text(this.tankX, this.tankBotY + 20, '0', {
      fontSize: '22px', color: COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(6);
  }

  _buildBelt() {
    const W = this.W, H = this.H;
    this.beltY = H * 0.78;
    // Belt track on right side of tank
    this.beltLeft = W * 0.32;
    this.beltRight = W - 20;
    this.add.rectangle((this.beltLeft + this.beltRight) / 2, this.beltY, this.beltRight - this.beltLeft, 54, hexToNum(COL_SECONDARY), 0.2).setDepth(2);
    this.add.text(this.beltLeft - 6, this.beltY, '◀', {
      fontSize: '22px', color: COL_SECONDARY, fontFamily: 'system-ui'
    }).setOrigin(1, 0.5).setDepth(3);
  }

  startRound() {
    const data = getRound(this.round);
    const roundVariation = [
      { target: 8,  items: [3, 5, 2, 4, 1] },
      { target: 10, items: [4, 6, 3, 2, 5] },
      { target: 12, items: [5, 7, 4, 3, 2] },
      { target: 15, items: [6, 9, 4, 5, 3] },
      { target: 18, items: [8, 10, 5, 6, 3] },
    ];
    const isDefault = !data || data.prompt === 'Solve this!' ||
      (Array.isArray(data.items) && data.items[0] === 10 && data.items[1] === 5);
    const fb = roundVariation[this.round % roundVariation.length];
    this.targetValue = isDefault ? fb.target : (data.target || fb.target);
    this.items       = isDefault ? fb.items.slice() : (Array.isArray(data.items) && data.items.length ? data.items.slice() : fb.items.slice());
    this.maxTankValue = Math.max(this.targetValue * 1.4, this.targetValue + 4);
    this.beltSpeed = 1.0 + this.round * 0.25;

    // Reset state
    this.tankAmount = 0;
    this.poured = [];
    this.beltItems.forEach(b => { b.spr.destroy(); b.fill.destroy(); b.lbl.destroy(); });
    this.beltItems = [];

    // Redraw target line
    if (this.targetLine) this.targetLine.destroy();
    if (this.targetLineLbl) this.targetLineLbl.destroy();
    const frac = this.targetValue / this.maxTankValue;
    const lineY = this.tankBotY - this.tankH * frac;
    this.targetLine = this.add.rectangle(this.tankX, lineY, this.tankW + 16, 3, hexToNum(COL_ACCENT), 1).setDepth(6);
    this.targetLineLbl = this.add.text(this.tankX - this.tankW / 2 - 10, lineY, String(this.targetValue), {
      fontSize: '14px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(1, 0.5).setDepth(6);

    this._updateTank();
    this.equationLbl.setText('Fill to the orange line (' + this.targetValue + ')');
    _redrawDots(this);

    // Spawn cups staggered
    let idx = 0;
    if (this.spawnTimer) this.spawnTimer.remove();
    this.spawnTimer = this.time.addEvent({
      delay: 900,
      repeat: this.items.length - 1,
      callback: () => {
        if (idx < this.items.length) {
          this._spawnCup(this.items[idx]);
          idx++;
        }
      }
    });
  }

  _spawnCup(val) {
    const x = this.beltRight + 40;
    // Cup body — proportional height to value (so bigger value = visibly more liquid)
    const maxCupH = 44;
    const cupH = Math.max(16, Math.min(maxCupH, 8 + val * 3));
    const cupW = 28;
    const spr = this.add.rectangle(x, this.beltY, cupW, maxCupH, 0x000000, 0.3)
      .setStrokeStyle(2, hexToNum(COL_TEXT), 0.8).setDepth(6)
      .setInteractive({ useHandCursor: true });
    const fill = this.add.rectangle(x, this.beltY + maxCupH / 2 - 2, cupW - 4, cupH, hexToNum(COL_PRIMARY), 0.75)
      .setOrigin(0.5, 1).setDepth(7);
    const lbl = this.add.text(x, this.beltY + maxCupH / 2 + 14, String(val), {
      fontSize: '13px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(7);
    const entry = { spr, fill, lbl, val, taken: false };
    spr.on('pointerdown', () => this._pour(entry));
    this.beltItems.push(entry);
  }

  update() {
    for (let i = this.beltItems.length - 1; i >= 0; i--) {
      const it = this.beltItems[i];
      if (it.taken) continue;
      it.spr.x -= this.beltSpeed;
      it.fill.x = it.spr.x;
      it.lbl.x = it.spr.x;
      if (it.spr.x < this.beltLeft - 40) {
        it.spr.destroy(); it.fill.destroy(); it.lbl.destroy();
        this.beltItems.splice(i, 1);
      }
    }
  }

  _pour(entry) {
    if (entry.taken || this.solutionCard) return;
    entry.taken = true;
    entry.spr.disableInteractive();
    // Animate cup flying to tank, tipping, draining
    this.tweens.add({
      targets: [entry.spr, entry.fill, entry.lbl],
      x: this.tankX, duration: 320, ease: 'Cubic.easeInOut'
    });
    this.tweens.add({
      targets: [entry.spr, entry.fill, entry.lbl],
      y: this.tankTopY - 40, duration: 280, ease: 'Cubic.easeOut'
    });
    this.time.delayedCall(340, () => {
      // Drain fill
      this.tweens.add({
        targets: entry.fill,
        height: 0, duration: 260, ease: 'Cubic.easeIn',
        onComplete: () => {
          entry.spr.destroy(); entry.fill.destroy(); entry.lbl.destroy();
          const idx = this.beltItems.indexOf(entry);
          if (idx !== -1) this.beltItems.splice(idx, 1);
        }
      });
      // Raise tank level
      this.tankAmount += entry.val;
      this.poured.push(entry.val);
      this._updateTank();
      this.time.delayedCall(320, () => this._checkMatch());
    });
  }

  _updateTank() {
    const frac = Math.min(1, this.tankAmount / this.maxTankValue);
    const newH = this.tankH * frac;
    this.tweens.add({
      targets: this.tankLiquid, height: newH, duration: 260, ease: 'Cubic.easeOut'
    });
    const matched = this.tankAmount === this.targetValue;
    const over = this.tankAmount > this.targetValue;
    this.tankLiquid.fillColor = matched ? hexToNum(COL_ACCENT) : over ? hexToNum(COL_DANGER) : hexToNum(COL_PRIMARY);
    this.tankValueLbl.setText(String(this.tankAmount));
    this.tankValueLbl.setColor(matched ? COL_ACCENT : over ? COL_DANGER : COL_PRIMARY);
  }

  _checkMatch() {
    if (this.solutionCard) return;
    if (this.tankAmount === this.targetValue) {
      if (this.spawnTimer) this.spawnTimer.remove();
      heroCheer(this, this.hero);
      this.cameras.main.flash(140, 34, 197, 94);
      gameScore += 10 * (this.round + 1);
      this.scoreLbl.setText('Score: ' + gameScore);
      const eqStr = this.poured.join(' + ') + ' = ' + this.targetValue;
      _showSolutionCard(this, [
        'You poured ' + this.poured.length + ' cup' + (this.poured.length === 1 ? '' : 's') + ':',
        eqStr,
        'Tank level: ' + this.targetValue,
      ], () => {
        this.round++;
        if (this.round >= TOTAL_ROUNDS) {
          this.scene.start('VictoryScene', { score: gameScore });
        } else {
          this.startRound();
        }
      });
    } else if (this.tankAmount > this.targetValue) {
      // Overflow — lose a life, reset round
      this.lives--;
      _redrawHearts(this);
      heroShake(this, this.hero);
      this.cameras.main.shake(180, 0.01);
      if (this.lives <= 0) {
        if (this.spawnTimer) this.spawnTimer.remove();
        this.time.delayedCall(600, () => this.scene.start('LoseScene', { score: gameScore }));
        return;
      }
      this.time.delayedCall(700, () => this.startRound());
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION C: Split the Loot — INTRINSIC REBUILD (silo fill lines)
//
// Two transparent SILOS, each with a target FILL LINE. Grain-weight items sit
// in a bank. Drag each into LEFT or RIGHT silo — grain pours in, silo level
// rises by that weight. When BOTH silos hit their fill lines exactly, both
// glow and snap. Overflow is red and catastrophic.
//
// The visual height in each silo IS the sum. No computing in your head —
// the height tells you.
// ═══════════════════════════════════════════════════════════════════════════════
class SplitTheLootScene extends Phaser.Scene {
  constructor() { super('SplitTheLootScene'); }

  create() {
    this.W = this.scale.width;
    this.H = this.scale.height;
    this.round = 0;
    this.lives = MAX_LIVES;
    this.items = [];
    this.totalA = 0;
    this.totalB = 0;

    _sceneBackground(this);
    _buildHUD(this);
    this._buildLabels();
    this._buildSilos();
    this.hero = addCharacter(this, this.W * 0.88, this.H * 0.55, 0.8);
    this.startRound();
  }

  _buildLabels() {
    const W = this.W;
    this.equationLbl = this.add.text(W / 2, 40, '', {
      fontSize: '16px', color: COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5, 0).setDepth(10);
    this.promptLbl = this.add.text(W / 2, 62, 'Drag weights into a silo — fill BOTH silos to their lines', {
      fontSize: '12px', color: COL_TEXT, fontFamily: "'Lexend', system-ui", alpha: 0.8,
      align: 'center', wordWrap: { width: W - 40 }
    }).setOrigin(0.5, 0).setDepth(10);
  }

  _buildSilos() {
    const W = this.W, H = this.H;
    this.siloTopY = H * 0.18;
    this.siloBotY = H * 0.56;
    this.siloH = this.siloBotY - this.siloTopY;
    this.siloW = 84;
    const xA = W * 0.28, xB = W * 0.58;
    // Silo A
    this.siloAX = xA;
    this.add.rectangle(xA, (this.siloTopY + this.siloBotY) / 2, this.siloW, this.siloH, 0x000000, 0.35)
      .setStrokeStyle(3, hexToNum(COL_PRIMARY), 0.8).setDepth(4);
    this.siloAFill = this.add.rectangle(xA, this.siloBotY, this.siloW - 6, 0, hexToNum(COL_PRIMARY), 0.75)
      .setOrigin(0.5, 1).setDepth(5);
    this.siloALbl = this.add.text(xA, this.siloBotY + 14, '0', {
      fontSize: '18px', color: COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(6);
    this.add.text(xA, this.siloTopY - 18, 'SILO A', {
      fontSize: '11px', color: COL_PRIMARY, fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6);
    // Silo B
    this.siloBX = xB;
    this.add.rectangle(xB, (this.siloTopY + this.siloBotY) / 2, this.siloW, this.siloH, 0x000000, 0.35)
      .setStrokeStyle(3, hexToNum(COL_SECONDARY), 0.8).setDepth(4);
    this.siloBFill = this.add.rectangle(xB, this.siloBotY, this.siloW - 6, 0, hexToNum(COL_SECONDARY), 0.75)
      .setOrigin(0.5, 1).setDepth(5);
    this.siloBLbl = this.add.text(xB, this.siloBotY + 14, '0', {
      fontSize: '18px', color: COL_SECONDARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(6);
    this.add.text(xB, this.siloTopY - 18, 'SILO B', {
      fontSize: '11px', color: COL_SECONDARY, fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6);
  }

  startRound() {
    const data = getRound(this.round);
    const roundVariation = [
      { a: 5,  b: 6,  items: [3, 2, 4, 2, 6] },
      { a: 8,  b: 7,  items: [5, 3, 4, 3, 7] },
      { a: 10, b: 8,  items: [6, 4, 5, 3, 8] },
      { a: 12, b: 10, items: [7, 5, 6, 4, 5] },
      { a: 14, b: 12, items: [8, 6, 7, 5, 4] },
    ];
    const isDefault = !data || data.prompt === 'Solve this!' ||
      (Array.isArray(data.items) && data.items[0] === 10 && data.items[1] === 5);
    const fb = roundVariation[this.round % roundVariation.length];
    // If AI provides items, split target ~ half
    if (isDefault) {
      this.targetA = fb.a;
      this.targetB = fb.b;
      this.itemValues = fb.items.slice();
    } else {
      const t = data.target || (fb.a + fb.b);
      this.targetA = Math.ceil(t / 2);
      this.targetB = t - this.targetA;
      this.itemValues = (Array.isArray(data.items) && data.items.length ? data.items : fb.items).slice();
    }
    this.maxSilo = Math.max(this.targetA, this.targetB) * 1.4 + 2;

    // Reset state
    this.totalA = 0;
    this.totalB = 0;
    if (this._itemObjs) this._itemObjs.forEach(o => o.destroy && o.destroy());
    this._itemObjs = [];
    this.items = [];

    // Redraw silo target lines
    if (this.lineA) this.lineA.destroy();
    if (this.lineALbl) this.lineALbl.destroy();
    if (this.lineB) this.lineB.destroy();
    if (this.lineBLbl) this.lineBLbl.destroy();
    const yA = this.siloBotY - this.siloH * (this.targetA / this.maxSilo);
    const yB = this.siloBotY - this.siloH * (this.targetB / this.maxSilo);
    this.lineA = this.add.rectangle(this.siloAX, yA, this.siloW + 14, 3, hexToNum(COL_ACCENT), 1).setDepth(6);
    this.lineALbl = this.add.text(this.siloAX - this.siloW / 2 - 8, yA, String(this.targetA), {
      fontSize: '13px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(1, 0.5).setDepth(6);
    this.lineB = this.add.rectangle(this.siloBX, yB, this.siloW + 14, 3, hexToNum(COL_ACCENT), 1).setDepth(6);
    this.lineBLbl = this.add.text(this.siloBX - this.siloW / 2 - 8, yB, String(this.targetB), {
      fontSize: '13px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(1, 0.5).setDepth(6);

    this.equationLbl.setText('Silo A: fill to ' + this.targetA + '    |    Silo B: fill to ' + this.targetB);
    _redrawDots(this);
    this._updateSilos();

    // Place item bank at bottom
    const bankY = this.H * 0.78;
    const n = this.itemValues.length;
    const gap = Math.min(76, (this.W - 40) / n);
    const startX = this.W / 2 - ((n - 1) * gap) / 2;
    this.itemValues.forEach((val, i) => {
      const x = startX + i * gap;
      // Proportional weight shape (taller = more)
      const wH = Math.max(22, Math.min(58, 14 + val * 3));
      const spr = this.add.rectangle(x, bankY, 44, wH, hexToNum(COL_TEXT), 0.5)
        .setStrokeStyle(2, hexToNum(COL_ACCENT), 0.6).setDepth(6)
        .setInteractive({ useHandCursor: true, draggable: true });
      const lbl = this.add.text(x, bankY + wH / 2 + 10, String(val), {
        fontSize: '12px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0.5, 0).setDepth(7);
      spr._val = val;
      spr._lbl = lbl;
      spr._origX = x;
      spr._origY = bankY;
      spr._inSilo = null;
      this.input.setDraggable(spr);
      this.items.push(spr);
      this._itemObjs.push(spr, lbl);
    });

    // Drag handlers (only set up once)
    if (!this._dragBound) {
      this._dragBound = true;
      this.input.on('drag', (pointer, obj, dragX, dragY) => {
        if (!obj._val) return;
        obj.x = dragX; obj.y = dragY;
        if (obj._lbl) obj._lbl.setPosition(dragX, dragY + obj.height / 2 + 10);
      });
      this.input.on('dragend', (pointer, obj) => {
        if (!obj._val) return;
        // Determine drop target by position
        const distA = Math.abs(obj.x - this.siloAX);
        const distB = Math.abs(obj.x - this.siloBX);
        const inSiloArea = obj.y > this.siloTopY - 20 && obj.y < this.siloBotY + 40;
        if (inSiloArea && distA < this.siloW) {
          this._dropInSilo(obj, 'A');
        } else if (inSiloArea && distB < this.siloW) {
          this._dropInSilo(obj, 'B');
        } else {
          if (obj._inSilo) this._removeFromSilo(obj);
          this.tweens.add({ targets: obj, x: obj._origX, y: obj._origY, duration: 220 });
          this.tweens.add({ targets: obj._lbl, x: obj._origX, y: obj._origY + obj.height / 2 + 10, duration: 220 });
        }
      });
    }
  }

  _dropInSilo(spr, which) {
    if (spr._inSilo === which) return;
    if (spr._inSilo) this._removeFromSilo(spr);
    spr._inSilo = which;
    if (which === 'A') this.totalA += spr._val; else this.totalB += spr._val;
    // Park the weight visually on top of silo
    const x = which === 'A' ? this.siloAX : this.siloBX;
    const y = this.siloTopY - 30 - (which === 'A' ? this.totalA : this.totalB) * 2;
    this.tweens.add({ targets: spr, x, y: Math.max(80, y), scale: 0.6, duration: 220 });
    this.tweens.add({ targets: spr._lbl, x, y: Math.max(80, y) + spr.height / 2 + 6, duration: 220 });
    this._updateSilos();
    this.time.delayedCall(260, () => this._checkMatch());
  }

  _removeFromSilo(spr) {
    if (spr._inSilo === 'A') this.totalA -= spr._val;
    else if (spr._inSilo === 'B') this.totalB -= spr._val;
    spr._inSilo = null;
    spr.setScale(1);
    this._updateSilos();
  }

  _updateSilos() {
    const fracA = Math.min(1, this.totalA / this.maxSilo);
    const fracB = Math.min(1, this.totalB / this.maxSilo);
    this.tweens.add({ targets: this.siloAFill, height: this.siloH * fracA, duration: 240 });
    this.tweens.add({ targets: this.siloBFill, height: this.siloH * fracB, duration: 240 });
    const matchA = this.totalA === this.targetA;
    const overA  = this.totalA > this.targetA;
    const matchB = this.totalB === this.targetB;
    const overB  = this.totalB > this.targetB;
    this.siloAFill.fillColor = matchA ? hexToNum(COL_ACCENT) : overA ? hexToNum(COL_DANGER) : hexToNum(COL_PRIMARY);
    this.siloBFill.fillColor = matchB ? hexToNum(COL_ACCENT) : overB ? hexToNum(COL_DANGER) : hexToNum(COL_SECONDARY);
    this.siloALbl.setText(String(this.totalA)).setColor(matchA ? COL_ACCENT : overA ? COL_DANGER : COL_PRIMARY);
    this.siloBLbl.setText(String(this.totalB)).setColor(matchB ? COL_ACCENT : overB ? COL_DANGER : COL_SECONDARY);
  }

  _checkMatch() {
    if (this.solutionCard) return;
    if (this.totalA > this.targetA || this.totalB > this.targetB) {
      // Overflow — lose life, reset
      this.lives--;
      _redrawHearts(this);
      heroShake(this, this.hero);
      this.cameras.main.shake(160, 0.008);
      if (this.lives <= 0) {
        this.time.delayedCall(600, () => this.scene.start('LoseScene', { score: gameScore }));
        return;
      }
      this.time.delayedCall(700, () => this.startRound());
      return;
    }
    if (this.totalA === this.targetA && this.totalB === this.targetB) {
      heroCheer(this, this.hero);
      this.cameras.main.flash(140, 34, 197, 94);
      gameScore += 10 * (this.round + 1);
      this.scoreLbl.setText('Score: ' + gameScore);
      // Build equation strings from items placed
      const partsA = this.items.filter(s => s._inSilo === 'A').map(s => s._val);
      const partsB = this.items.filter(s => s._inSilo === 'B').map(s => s._val);
      const eqA = partsA.join(' + ') + ' = ' + this.targetA;
      const eqB = partsB.join(' + ') + ' = ' + this.targetB;
      _showSolutionCard(this, [
        'Silo A: ' + eqA,
        'Silo B: ' + eqB,
        'Total split: ' + (this.targetA + this.targetB),
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
}
`
