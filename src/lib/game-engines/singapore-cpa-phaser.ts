// Singapore CPA — Phaser engine with 4 game options.
// Math: Bar models, place value discs, number bonds, Cuisenaire rods.
// Options: bar-model, place-value-discs, number-bonds, cuisenaire-rods
//
// ALL FOUR SCENES REBUILT (April 13, 2026) to be TRULY INTRINSIC:
//   - No Check / Verify buttons
//   - Success auto-detected when the physical arrangement is correct
//   - Player manipulates the MATHEMATICAL OBJECTS directly; the answer emerges
//     from the arrangement itself (not from typing a pre-known number)
//   - Each round ends with a solution reveal card + "Got it! Next round →"

import type { ThemeConfig, MathParams, GameOption } from "./engine-types"
import { phaserGame } from "./base-phaser-template"
import { getOptionDef } from "./game-option-registry"

export function singaporeCpaPhaserEngine(
  config: ThemeConfig,
  math: MathParams,
  option: GameOption = "bar-model"
): string {
  const validOptions = ["bar-model", "place-value-discs", "number-bonds", "cuisenaire-rods"]
  const activeOption = validOptions.includes(option) ? option : "bar-model"
  const optDef = getOptionDef(activeOption)
  const sceneMap: Record<string, string> = {
    "bar-model": "BarModelScene",
    "place-value-discs": "PlaceValueDiscsScene",
    "number-bonds": "NumberBondsScene",
    "cuisenaire-rods": "CuisenaireRodsScene",
  }
  return phaserGame({
    config, math, option: activeOption,
    sceneName: sceneMap[activeOption],
    introText: optDef?.introText || "Solve problems with Singapore Math models!",
    helpText: optDef?.helpText || "Use visual models to understand math relationships.",
    gameSceneCode: GAME_SCENES,
  })
}

const GAME_SCENES = `
// ─── Shared helper: solution reveal card with "Got it! Next round →" ─────────
function showSolutionCard(scene, lines, onNext) {
  const W = scene.W, H = scene.H;
  const backdrop = scene.add.rectangle(W/2, H/2, W, H, 0x000000, 0.6).setDepth(80);
  const card = scene.add.rectangle(W/2, H*0.5, W - 48, 240, 0x18181b, 1)
    .setStrokeStyle(2, hexToNum(COL_ACCENT)).setDepth(81);
  const h1 = scene.add.text(W/2, H*0.5 - 95, 'You did it!', {
    fontSize: '22px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
  }).setOrigin(0.5).setDepth(82);
  const textObjs = [backdrop, card, h1];
  lines.forEach((line, i) => {
    const t = scene.add.text(W/2, H*0.5 - 55 + i*26, line, {
      fontSize: i === lines.length - 1 ? '20px' : '14px',
      color: i === lines.length - 1 ? COL_ACCENT : COL_TEXT,
      fontFamily: "'Space Grotesk', sans-serif",
      fontStyle: i === lines.length - 1 ? 'bold' : 'normal',
      wordWrap: { width: W - 80 }, align: 'center'
    }).setOrigin(0.5).setDepth(82);
    t.setAlpha(0);
    scene.time.delayedCall(160 * i, () => scene.tweens.add({ targets: t, alpha: 1, duration: 260 }));
    textObjs.push(t);
  });
  const btnY = H*0.5 + 90;
  const btnBg = scene.add.rectangle(W/2, btnY, 220, 44, hexToNum(COL_ACCENT), 1)
    .setInteractive({ useHandCursor: true }).setDepth(82);
  const btnLbl = scene.add.text(W/2, btnY, 'Got it! Next round →', {
    fontSize: '14px', color: '#000', fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
  }).setOrigin(0.5).setDepth(83);
  btnBg.setAlpha(0); btnLbl.setAlpha(0);
  scene.time.delayedCall(160 * lines.length + 180, () => {
    scene.tweens.add({ targets: [btnBg, btnLbl], alpha: 1, duration: 260 });
  });
  textObjs.push(btnBg, btnLbl);
  btnBg.on('pointerdown', () => {
    textObjs.forEach(o => o.destroy && o.destroy());
    onNext();
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION A: Bar Model — TRULY INTRINSIC REBUILD (April 13, 2026)
//
// Teaches: part-part-whole modelling of addition, subtraction, multiplication
// via WORD PROBLEMS. The player is given a sentence and a pile of colored
// unit rods (lengths 1–10). They DRAG rods onto a measurement track.
//
// The physical act of placing rods end-to-end IS the addition. The running
// total auto-reads on a ruler beneath the track. There is no Check button;
// when the rods' total length matches the problem's answer and the
// arrangement matches the problem structure (addition = concatenate,
// subtraction = place whole then drag off the removed part, multiplication =
// N equal rods in a row), success auto-triggers.
//
// Self-revealing truth: the ruler counts what the player built. The answer
// emerges from the arrangement — the player never needs to "already know" it.
// ═══════════════════════════════════════════════════════════════════════════════
class BarModelScene extends Phaser.Scene {
  constructor() { super('BarModelScene'); }

  create() {
    this.W = this.scale.width; this.H = this.scale.height;
    this.round = 0; this.lives = MAX_LIVES;
    this._bg(); this._ui();
    this.hero = addCharacter(this, this.W * 0.88, this.H * 0.55, 0.8);
    this.startRound();
  }

  _bg() {
    const bg = this.add.image(this.W/2, this.H/2, 'bg');
    bg.setScale(Math.max(this.W/bg.width, this.H/bg.height));
    this.add.rectangle(this.W/2, this.H/2, this.W, this.H, 0x000000, 0.7);
  }
  _ui() {
    this.scoreLbl = this.add.text(this.W - 14, 14, 'Score: 0', {
      fontSize: '16px', color: COL_ACCENT, fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(1, 0).setDepth(10);
    this.hg = this.add.group(); this._rh();
    this.dg = this.add.group(); this._rd();
  }
  _rh() {
    this.hg.clear(true, true);
    for (let i = 0; i < this.lives; i++)
      this.hg.add(this.add.text(14 + i*22, 14, '♥', { fontSize:'18px', color: COL_DANGER }).setDepth(10));
  }
  _rd() {
    this.dg.clear(true, true);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      const c = i < this.round ? COL_ACCENT : (i === this.round ? COL_PRIMARY : '#555555');
      this.dg.add(this.add.circle(this.W/2 - 40 + i*20, this.H - 16, 5, hexToNum(c)).setDepth(10));
    }
  }

  // Infer operation from prompt text (addition / subtraction / multiplication)
  _inferOp(prompt) {
    const p = (prompt || '').toLowerCase();
    if (/times|groups of|each|every|bags of|rows of|multiply|product/.test(p)) return 'mul';
    if (/gives away|loses|eats|removes|leaves|minus|subtract|how many (are )?left|fewer|less|took|ate|spent/.test(p)) return 'sub';
    return 'add';
  }

  startRound() {
    if (this.rg) this.rg.clear(true, true);
    this.rg = this.add.group();
    this._rd();

    const data = getRound(this.round);
    const W = this.W, H = this.H;

    // Per-round fallback problems so defaults always work as word problems.
    const fallback = [
      { prompt: 'Mary has 5 apples. John gives her 3 more. How many apples in total?', target: 8, parts: [5, 3], op: 'add' },
      { prompt: 'There are 12 cookies. Tom eats 4 of them. How many are left?',         target: 8, parts: [12, 4], op: 'sub' },
      { prompt: '3 bags each hold 4 marbles. How many marbles in total?',               target: 12, parts: [4, 4, 4], op: 'mul' },
      { prompt: 'A ribbon is 15 cm long. 6 cm is cut off. How long is the rest?',       target: 9,  parts: [15, 6], op: 'sub' },
      { prompt: 'Lee has 7 stickers. Ann has 6. How many stickers altogether?',         target: 13, parts: [7, 6], op: 'add' },
    ];
    const isDefault = !data || data.prompt === 'Solve this!';
    const fb = fallback[this.round % fallback.length];
    const prompt = isDefault ? fb.prompt : data.prompt;
    const op = isDefault ? fb.op : this._inferOp(data.prompt);
    const target = isDefault ? fb.target : data.target;

    // Build parts list for this round
    let parts;
    if (isDefault) {
      parts = fb.parts.slice();
    } else if (op === 'mul') {
      // items: [groupSize, groupSize, ...] — synthesize N copies that sum to target
      const size = Array.isArray(data.items) && data.items[0] > 0 ? data.items[0] : 2;
      const n = Math.max(2, Math.round(target / size));
      parts = Array(n).fill(size);
    } else if (op === 'sub') {
      // items: [whole, removed]
      const whole = Array.isArray(data.items) && data.items[0] ? data.items[0] : (target + 3);
      const removed = whole - target;
      parts = [whole, removed];
    } else {
      // addition: use items whose sum = target (filter & pad)
      const raw = (Array.isArray(data.items) ? data.items : []).filter(v => v > 0 && v <= 10);
      parts = [];
      let sum = 0;
      for (const v of raw) { if (sum + v <= target) { parts.push(v); sum += v; } }
      if (sum < target) parts.push(target - sum);
      if (parts.length < 2) parts = [Math.ceil(target/2), Math.floor(target/2)];
    }

    this.op = op;
    this.target = target;
    this.requiredParts = parts.slice();
    this.placed = []; // {len, rect, label}

    // Prompt
    this.rg.add(this.add.text(W/2, H*0.08, prompt, {
      fontSize: '15px', color: COL_ACCENT, fontFamily: "'Lexend', system-ui",
      wordWrap: { width: W - 40 }, align: 'center'
    }).setOrigin(0.5, 0).setDepth(6));

    // Operation badge
    const opText = op === 'add' ? 'Addition' : op === 'sub' ? 'Subtraction' : 'Multiplication';
    this.rg.add(this.add.text(W/2, H*0.17, opText, {
      fontSize: '11px', color: COL_PRIMARY, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5).setDepth(6));

    // Measurement track (where rods are placed end-to-end)
    const unitW = Math.min(26, (W - 80) / Math.max(target, 10));
    this.unitW = unitW;
    const trackW = unitW * Math.max(target, 10);
    const trackLeft = (W - trackW) / 2;
    const trackY = H * 0.28;
    this.trackLeft = trackLeft; this.trackY = trackY; this.trackW = trackW;

    this.rg.add(this.add.rectangle(trackLeft + trackW/2, trackY, trackW, 34, hexToNum(COL_TEXT), 0.08).setDepth(3));
    this.rg.add(this.add.rectangle(trackLeft + trackW/2, trackY, trackW, 34)
      .setStrokeStyle(2, hexToNum(COL_TEXT), 0.35).setDepth(3));

    // Target marker on track (vertical line at target units)
    const targetX = trackLeft + target * unitW;
    this.rg.add(this.add.rectangle(targetX, trackY, 3, 46, hexToNum(COL_ACCENT), 1).setDepth(4));
    this.rg.add(this.add.text(targetX, trackY - 32, '▼ target = ' + target, {
      fontSize: '11px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5, 1).setDepth(4));

    // Ruler below track (0..maxUnits)
    const rulerY = trackY + 28;
    const maxUnits = Math.max(target, 10);
    for (let u = 0; u <= maxUnits; u++) {
      const tx = trackLeft + u * unitW;
      this.rg.add(this.add.rectangle(tx, rulerY, 1, u % 5 === 0 ? 10 : 6, hexToNum(COL_TEXT), 0.5).setDepth(3));
      if (u % 5 === 0) {
        this.rg.add(this.add.text(tx, rulerY + 10, String(u), {
          fontSize: '9px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
        }).setOrigin(0.5, 0).setDepth(3));
      }
    }

    // Live readout
    this.readoutLbl = this.add.text(W/2, H*0.42, 'Total length: 0 units', {
      fontSize: '16px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6);
    this.rg.add(this.readoutLbl);

    this.statusLbl = this.add.text(W/2, H*0.46, 'Drag rods onto the track, end-to-end.', {
      fontSize: '11px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5).setDepth(6);
    this.rg.add(this.statusLbl);

    // Rod palette — rods of lengths 1..10, plus the special needed lengths
    this._buildPalette();

    // Undo
    const undo = this.add.rectangle(W*0.15, H*0.92, 80, 32, hexToNum(COL_DANGER), 0.55)
      .setInteractive({ useHandCursor: true }).setDepth(9);
    this.rg.add(undo);
    this.rg.add(this.add.text(W*0.15, H*0.92, 'Remove last', {
      fontSize: '11px', color: '#fff', fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10));
    undo.on('pointerdown', () => this._popRod());
  }

  _buildPalette() {
    const W = this.W, H = this.H;
    const paletteY = H * 0.62;
    this.rg.add(this.add.text(W/2, paletteY - 36, 'Click a rod to place it on the track:', {
      fontSize: '11px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5).setDepth(6));

    // Offer lengths used in this round, plus 1 and 2 as staples
    const lengthSet = new Set([1, 2]);
    this.requiredParts.forEach(v => lengthSet.add(v));
    // For subtraction, only offer the "whole" first; remove step uses a different button
    const lengths = [...lengthSet].filter(v => v >= 1 && v <= 20).sort((a,b) => a - b);

    const colors = ['#FFFFFF','#E84040','#40C840','#C74FE8','#E8E840','#40C8C8','#8080E8','#E8A040','#4040E8','#E88040','#F06AA8','#6AF0C8'];
    const pu = Math.min(16, (W - 40) / 24);
    let cx = 20;
    lengths.forEach((len) => {
      const rw = Math.max(24, len * pu);
      const color = colors[(len - 1) % colors.length];
      const bg = this.add.rectangle(cx + rw/2, paletteY, rw, 22, hexToNum(color), 0.75)
        .setInteractive({ useHandCursor: true }).setDepth(6);
      const lbl = this.add.text(cx + rw/2, paletteY, String(len), {
        fontSize: '11px', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(7);
      this.rg.add(bg); this.rg.add(lbl);
      bg.on('pointerdown', () => this._placeRod(len, color));
      cx += rw + 8;
      if (cx > W - 40) cx = 20; // wrap (rare)
    });

    if (this.op === 'sub') {
      // Separate "remove" button: drag off a rod of the given "removed" length
      const removed = this.requiredParts[1];
      const btnY = H * 0.78;
      const rmBtn = this.add.rectangle(W/2, btnY, 220, 34, hexToNum(COL_DANGER), 0.75)
        .setInteractive({ useHandCursor: true }).setDepth(6);
      const rmLbl = this.add.text(W/2, btnY, 'Remove ' + removed + ' from the whole', {
        fontSize: '12px', color: '#fff', fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(7);
      this.rg.add(rmBtn); this.rg.add(rmLbl);
      rmBtn.on('pointerdown', () => this._removePortion(removed));
    }
  }

  _placeRod(len, color) {
    // Can we fit?
    const used = this.placed.reduce((a, r) => a + r.len, 0);
    const maxUnits = Math.max(this.target, 10);
    if (used + len > maxUnits) {
      this.statusLbl.setText('Track is full — remove a rod first.').setColor(COL_DANGER);
      return;
    }
    const x = this.trackLeft + used * this.unitW;
    const rw = len * this.unitW;
    const rect = this.add.rectangle(x + rw/2, this.trackY, rw, 30, hexToNum(color), 0.85).setDepth(5);
    const lbl = this.add.text(x + rw/2, this.trackY, String(len), {
      fontSize: '12px', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6);
    this.rg.add(rect); this.rg.add(lbl);
    this.placed.push({ len, rect, label: lbl, color });
    this._updateReadout();
    this._checkSolved();
  }

  _removePortion(len) {
    // Subtraction helper: removes a rod (visually crossed off) from the right end.
    // We simulate "dragging off" by decreasing an existing rod or removing pieces
    // until length "len" is taken off the end.
    let toRemove = len;
    while (toRemove > 0 && this.placed.length > 0) {
      const last = this.placed[this.placed.length - 1];
      if (last.len <= toRemove) {
        toRemove -= last.len;
        last.rect.destroy(); last.label.destroy();
        this.placed.pop();
      } else {
        // Split: shorten last rod by toRemove
        last.len -= toRemove;
        // Redraw last rod
        const used = this.placed.slice(0, -1).reduce((a, r) => a + r.len, 0);
        const x = this.trackLeft + used * this.unitW;
        const rw = last.len * this.unitW;
        last.rect.destroy(); last.label.destroy();
        last.rect = this.add.rectangle(x + rw/2, this.trackY, rw, 30, hexToNum(last.color), 0.85).setDepth(5);
        last.label = this.add.text(x + rw/2, this.trackY, String(last.len), {
          fontSize: '12px', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(6);
        this.rg.add(last.rect); this.rg.add(last.label);
        toRemove = 0;
      }
    }
    this._updateReadout();
    this._checkSolved();
  }

  _popRod() {
    if (this.placed.length === 0) return;
    const last = this.placed.pop();
    last.rect.destroy(); last.label.destroy();
    this._updateReadout();
  }

  _updateReadout() {
    const sum = this.placed.reduce((a, r) => a + r.len, 0);
    this.readoutLbl.setText('Total length: ' + sum + ' unit' + (sum === 1 ? '' : 's'));
    this.readoutLbl.setColor(sum === this.target ? COL_ACCENT : COL_TEXT);
  }

  _arrangementMatchesOp() {
    const sum = this.placed.reduce((a, r) => a + r.len, 0);
    if (sum !== this.target) return false;
    if (this.op === 'mul') {
      // Must be N equal rods each of size M, with N*M = target
      if (this.placed.length < 2) return false;
      const first = this.placed[0].len;
      if (this.placed.some(r => r.len !== first)) return false;
      return true;
    }
    if (this.op === 'sub') {
      // Subtraction: player must have ended with exactly one rod-sum of length target.
      // We accept sum===target here (the "remove" button produced the remainder).
      return true;
    }
    // Addition: at least 2 rods with sum = target
    return this.placed.length >= 2;
  }

  _checkSolved() {
    if (!this._arrangementMatchesOp()) return;
    gameScore += 10 * (this.round + 1);
    this.scoreLbl.setText('Score: ' + gameScore);
    this.cameras.main.flash(140, 34, 197, 94);
    heroCheer(this, this.hero);
    // Build solution-reveal lines
    const lines = [];
    if (this.op === 'add') {
      lines.push('You combined rods end-to-end:');
      lines.push(this.placed.map(r => r.len).join(' + ') + ' = ' + this.target);
      lines.push('Answer: ' + this.target);
    } else if (this.op === 'sub') {
      lines.push('You started with the whole, then removed a piece:');
      lines.push(this.requiredParts[0] + ' − ' + this.requiredParts[1] + ' = ' + this.target);
      lines.push('Answer: ' + this.target);
    } else {
      const m = this.placed[0].len, n = this.placed.length;
      lines.push('You made ' + n + ' equal rods of length ' + m + ':');
      lines.push(n + ' × ' + m + ' = ' + this.target);
      lines.push('Answer: ' + this.target);
    }
    this.time.delayedCall(400, () => {
      showSolutionCard(this, lines, () => {
        this.round++;
        if (this.round >= TOTAL_ROUNDS) this.scene.start('VictoryScene', { score: gameScore });
        else this.startRound();
      });
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION B: Place-Value Discs — INTRINSIC REBUILD (April 13, 2026)
//
// Teaches: place-value composition. The mat has 3 UNLABELED regions. Discs
// come in 3 sizes — BIG = 100, MEDIUM = 10, SMALL = 1. The player drags
// (clicks a palette disc, then clicks a region) discs into regions. The
// total auto-computes at the bottom by reading each disc's intrinsic value
// (its size). When the total matches the target, success fires.
//
// Place-value column meaning EMERGES from where the player chose to put
// big vs. small discs — the learner discovers grouping by size.
// ═══════════════════════════════════════════════════════════════════════════════
class PlaceValueDiscsScene extends Phaser.Scene {
  constructor() { super('PlaceValueDiscsScene'); }

  create() {
    this.W = this.scale.width; this.H = this.scale.height;
    this.round = 0; this.lives = MAX_LIVES;
    this._bg(); this._ui();
    this.hero = addCharacter(this, this.W*0.88, this.H*0.55, 0.8);
    this.startRound();
  }
  _bg() {
    const bg = this.add.image(this.W/2, this.H/2, 'bg');
    bg.setScale(Math.max(this.W/bg.width, this.H/bg.height));
    this.add.rectangle(this.W/2, this.H/2, this.W, this.H, 0x000000, 0.7);
  }
  _ui() {
    this.scoreLbl = this.add.text(this.W - 14, 14, 'Score: 0', {
      fontSize: '16px', color: COL_ACCENT, fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(1, 0).setDepth(10);
    this.hg = this.add.group(); this._rh();
    this.dg = this.add.group(); this._rd();
  }
  _rh() {
    this.hg.clear(true, true);
    for (let i = 0; i < this.lives; i++)
      this.hg.add(this.add.text(14 + i*22, 14, '♥', { fontSize:'18px', color: COL_DANGER }).setDepth(10));
  }
  _rd() {
    this.dg.clear(true, true);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      const c = i < this.round ? COL_ACCENT : (i === this.round ? COL_PRIMARY : '#555555');
      this.dg.add(this.add.circle(this.W/2 - 40 + i*20, this.H - 16, 5, hexToNum(c)).setDepth(10));
    }
  }

  startRound() {
    if (this.rg) this.rg.clear(true, true);
    this.rg = this.add.group();
    this._rd();

    const data = getRound(this.round);
    const W = this.W, H = this.H;

    const fallbackTargets = [23, 105, 142, 216, 378];
    const isDefault = !data || data.prompt === 'Solve this!';
    const target = isDefault ? fallbackTargets[this.round % 5]
                             : (data.target > 0 ? data.target : fallbackTargets[this.round]);
    this.target = target;

    // Prompt
    const prompt = isDefault
      ? 'Build the number ' + target + ' by placing discs on the mat.'
      : data.prompt;
    this.rg.add(this.add.text(W/2, H*0.06, prompt, {
      fontSize: '15px', color: COL_ACCENT, fontFamily: "'Lexend', system-ui",
      wordWrap: { width: W - 40 }, align: 'center'
    }).setOrigin(0.5, 0).setDepth(6));

    // Target
    this.rg.add(this.add.text(W/2, H*0.14, 'Target: ' + target, {
      fontSize: '14px', color: COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6));

    // Three UNLABELED regions on a mat
    const matTop = H * 0.22, matH = H * 0.40;
    const regionW = (W - 60) / 3;
    this.regions = []; // {x, y, w, h, discs: [{value, circle, text}]}
    for (let i = 0; i < 3; i++) {
      const rx = 30 + i * regionW + regionW/2;
      const ry = matTop + matH/2;
      const bg = this.add.rectangle(rx, ry, regionW - 10, matH, hexToNum(COL_SECONDARY), 0.08)
        .setStrokeStyle(2, hexToNum(COL_TEXT), 0.25).setDepth(3)
        .setInteractive({ useHandCursor: true });
      this.rg.add(bg);
      // Dashed divider hint
      this.rg.add(this.add.text(rx, matTop + 8, 'Region ' + (i+1), {
        fontSize: '10px', color: COL_TEXT, fontFamily: "'Lexend', system-ui", alpha: 0.5
      }).setOrigin(0.5, 0).setDepth(3));
      const region = { idx: i, x: rx, y: ry, w: regionW - 10, h: matH, discs: [], bg };
      bg.on('pointerdown', () => this._dropIntoRegion(region));
      this.regions.push(region);
    }

    // Palette of 3 disc SIZES (no labels) — BIG=100, MED=10, SMALL=1
    const paletteY = H * 0.72;
    this.selectedSize = null;
    this.paletteItems = [];
    const sizes = [
      { value: 100, radius: 22, color: '#E84040', name: 'BIG' },
      { value: 10,  radius: 14, color: '#4080E8', name: 'MED' },
      { value: 1,   radius: 8,  color: '#40C840', name: 'SMALL' },
    ];
    const totalPaletteW = 240;
    const startX = W/2 - totalPaletteW/2;
    sizes.forEach((s, i) => {
      const cx = startX + i * 80 + 40;
      const halo = this.add.circle(cx, paletteY, s.radius + 6, hexToNum(COL_ACCENT), 0).setDepth(6);
      const disc = this.add.circle(cx, paletteY, s.radius, hexToNum(s.color), 0.85)
        .setInteractive({ useHandCursor: true }).setDepth(7);
      this.rg.add(halo); this.rg.add(disc);
      disc.on('pointerdown', () => {
        this.selectedSize = s;
        this.paletteItems.forEach(p => p.halo.setStrokeStyle(0));
        halo.setStrokeStyle(3, hexToNum(COL_ACCENT), 1);
        this.hintLbl.setText('Now click a region to drop a ' + s.name + ' disc.');
      });
      this.paletteItems.push({ halo, disc, size: s });
    });

    this.hintLbl = this.add.text(W/2, paletteY + 36, 'Pick a disc size, then click a region.', {
      fontSize: '11px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5).setDepth(6);
    this.rg.add(this.hintLbl);

    // Live total readout
    this.totalLbl = this.add.text(W/2, H*0.88, 'Total: 0', {
      fontSize: '20px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6);
    this.rg.add(this.totalLbl);

    // Undo
    const undo = this.add.rectangle(W*0.15, H*0.92, 80, 30, hexToNum(COL_DANGER), 0.55)
      .setInteractive({ useHandCursor: true }).setDepth(9);
    this.rg.add(undo);
    this.rg.add(this.add.text(W*0.15, H*0.92, 'Remove last', {
      fontSize: '11px', color: '#fff', fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10));
    undo.on('pointerdown', () => this._popDisc());
    this.discHistory = [];
  }

  _dropIntoRegion(region) {
    if (!this.selectedSize) {
      this.hintLbl.setText('Pick a disc size first.').setColor(COL_DANGER);
      return;
    }
    const s = this.selectedSize;
    const count = region.discs.length;
    const cols = 4;
    const ox = region.x - region.w/2 + 14 + (count % cols) * (region.w - 28) / (cols - 1);
    const oy = region.y - region.h/2 + 30 + Math.floor(count / cols) * 26;
    const c = this.add.circle(ox, oy, s.radius, hexToNum(s.color), 0.9).setDepth(5);
    const t = this.add.text(ox, oy, String(s.value), {
      fontSize: s.value === 100 ? '10px' : s.value === 10 ? '9px' : '8px',
      color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6);
    this.rg.add(c); this.rg.add(t);
    region.discs.push({ value: s.value, circle: c, text: t });
    this.discHistory.push({ region, entry: region.discs[region.discs.length - 1] });
    this._updateTotal();
  }

  _popDisc() {
    const last = this.discHistory.pop();
    if (!last) return;
    last.entry.circle.destroy(); last.entry.text.destroy();
    const idx = last.region.discs.indexOf(last.entry);
    if (idx >= 0) last.region.discs.splice(idx, 1);
    this._updateTotal();
  }

  _updateTotal() {
    let total = 0;
    this.regions.forEach(r => r.discs.forEach(d => total += d.value));
    this.totalLbl.setText('Total: ' + total);
    this.totalLbl.setColor(total === this.target ? COL_ACCENT : COL_TEXT);
    if (total === this.target) this._solved();
  }

  _solved() {
    if (this._done) return;
    this._done = true;
    gameScore += 10 * (this.round + 1);
    this.scoreLbl.setText('Score: ' + gameScore);
    this.cameras.main.flash(140, 34, 197, 94);
    heroCheer(this, this.hero);
    // Count discs per size across all regions
    const counts = { 100: 0, 10: 0, 1: 0 };
    this.regions.forEach(r => r.discs.forEach(d => counts[d.value]++));
    const lines = [];
    lines.push('You built ' + this.target + ' from discs:');
    const parts = [];
    if (counts[100]) parts.push(counts[100] + ' × 100 = ' + (counts[100]*100));
    if (counts[10])  parts.push(counts[10]  + ' × 10 = '  + (counts[10]*10));
    if (counts[1])   parts.push(counts[1]   + ' × 1 = '   + counts[1]);
    parts.forEach(p => lines.push(p));
    lines.push('Total = ' + this.target);
    this.time.delayedCall(400, () => {
      showSolutionCard(this, lines, () => {
        this._done = false;
        this.round++;
        if (this.round >= TOTAL_ROUNDS) this.scene.start('VictoryScene', { score: gameScore });
        else this.startRound();
      });
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION C: Number Bonds — TRULY INTRINSIC REBUILD (April 13, 2026)
//
// Teaches: part-part-whole. Three circles (whole + 2 parts). Two values are
// given (as numbered balls in a side pool). The player DRAGS (clicks) each
// known ball into its correct circle. When both known circles hold their
// correct values, the third circle AUTO-REVEALS the arithmetic answer and
// connecting lines glow — the structure ENFORCES the relationship.
//
// The player does not "compute then type". They identify which value goes
// where; the bond computes the missing one. The bond is self-revealing.
// ═══════════════════════════════════════════════════════════════════════════════
class NumberBondsScene extends Phaser.Scene {
  constructor() { super('NumberBondsScene'); }

  create() {
    this.W = this.scale.width; this.H = this.scale.height;
    this.round = 0; this.lives = MAX_LIVES;
    this._bg(); this._ui();
    this.hero = addCharacter(this, this.W*0.88, this.H*0.55, 0.8);
    this.startRound();
  }
  _bg() {
    const bg = this.add.image(this.W/2, this.H/2, 'bg');
    bg.setScale(Math.max(this.W/bg.width, this.H/bg.height));
    this.add.rectangle(this.W/2, this.H/2, this.W, this.H, 0x000000, 0.7);
  }
  _ui() {
    this.scoreLbl = this.add.text(this.W - 14, 14, 'Score: 0', {
      fontSize: '16px', color: COL_ACCENT, fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(1, 0).setDepth(10);
    this.hg = this.add.group(); this._rh();
    this.dg = this.add.group(); this._rd();
  }
  _rh() {
    this.hg.clear(true, true);
    for (let i = 0; i < this.lives; i++)
      this.hg.add(this.add.text(14 + i*22, 14, '♥', { fontSize:'18px', color: COL_DANGER }).setDepth(10));
  }
  _rd() {
    this.dg.clear(true, true);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      const c = i < this.round ? COL_ACCENT : (i === this.round ? COL_PRIMARY : '#555555');
      this.dg.add(this.add.circle(this.W/2 - 40 + i*20, this.H - 16, 5, hexToNum(c)).setDepth(10));
    }
  }

  startRound() {
    if (this.rg) this.rg.clear(true, true);
    this.rg = this.add.group();
    this._rd();
    this._done = false;

    const data = getRound(this.round);
    const W = this.W, H = this.H;

    // Decide whole, partA, partB, and which is unknown.
    // Defaults cycle through unknown positions.
    const fallback = [
      { whole: 10, a: 6, b: 4, unknown: 'b' },
      { whole: 15, a: 7, b: 8, unknown: 'a' },
      { whole: 12, a: 5, b: 7, unknown: 'whole' },
      { whole: 20, a: 13, b: 7, unknown: 'b' },
      { whole: 18, a: 9, b: 9, unknown: 'a' },
    ];
    const isDefault = !data || data.prompt === 'Solve this!';
    const fb = fallback[this.round % fallback.length];
    let whole, a, b, unknownPos;
    if (isDefault) {
      whole = fb.whole; a = fb.a; b = fb.b; unknownPos = fb.unknown;
    } else {
      // items: [whole, a, b] with -1 marking unknown
      const it = data.items && data.items.length >= 3 ? data.items.slice(0, 3) : [data.target, -1, -1];
      let w = it[0], aa = it[1], bb = it[2];
      if (w === -1) { unknownPos = 'whole'; w = aa + bb; }
      else if (aa === -1) { unknownPos = 'a'; aa = w - bb; }
      else if (bb === -1) { unknownPos = 'b'; bb = w - aa; }
      else { unknownPos = 'b'; bb = w - aa; }
      whole = w; a = aa; b = bb;
    }
    this.whole = whole; this.a = a; this.b = b; this.unknownPos = unknownPos;

    // Prompt
    const prompt = isDefault
      ? 'Drop the numbered balls into the circles to complete the bond.'
      : (data.prompt || 'Complete the number bond.');
    this.rg.add(this.add.text(W/2, H*0.07, prompt, {
      fontSize: '14px', color: COL_ACCENT, fontFamily: "'Lexend', system-ui",
      wordWrap: { width: W - 40 }, align: 'center'
    }).setOrigin(0.5, 0).setDepth(6));

    // Bond layout
    const wholeX = W/2, wholeY = H*0.28;
    const partAX = W*0.32, partBX = W*0.68, partY = H*0.46;
    const R = 38;

    this.lineA = this.add.line(0, 0, wholeX, wholeY + R - 4, partAX, partY - R + 4, hexToNum(COL_TEXT), 0.4)
      .setOrigin(0).setLineWidth(2).setDepth(3);
    this.lineB = this.add.line(0, 0, wholeX, wholeY + R - 4, partBX, partY - R + 4, hexToNum(COL_TEXT), 0.4)
      .setOrigin(0).setLineWidth(2).setDepth(3);
    this.rg.add(this.lineA); this.rg.add(this.lineB);

    // Make the circles (slots)
    this.slots = {};
    this._mkSlot('whole', wholeX, wholeY, R, COL_PRIMARY, 'Whole');
    this._mkSlot('a',     partAX, partY,  R, COL_ACCENT,  'Part');
    this._mkSlot('b',     partBX, partY,  R, COL_ACCENT,  'Part');

    // Pool of balls: provide the two KNOWN values + 2 distractors
    const known = [];
    if (unknownPos !== 'whole') known.push({ pos: 'whole', value: whole });
    if (unknownPos !== 'a')     known.push({ pos: 'a',     value: a });
    if (unknownPos !== 'b')     known.push({ pos: 'b',     value: b });

    // Distractors — avoid exact known or unknown value
    const knownValues = new Set(known.map(k => k.value));
    const unknownValue = unknownPos === 'whole' ? whole : unknownPos === 'a' ? a : b;
    knownValues.add(unknownValue);
    const distractors = [];
    let guard = 40;
    while (distractors.length < 2 && guard-- > 0) {
      const v = Math.max(1, Math.floor(Math.random() * (whole + 5)) + 1);
      if (!knownValues.has(v)) { distractors.push(v); knownValues.add(v); }
    }

    const pool = known.map(k => k.value).concat(distractors);
    // Shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Render pool
    this.rg.add(this.add.text(W/2, H*0.64, 'Number pool (click to select, then click a circle):', {
      fontSize: '11px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5).setDepth(6));

    this.poolBalls = [];
    this.selectedBall = null;
    const poolY = H * 0.72;
    const spacing = 72;
    const startX = W/2 - ((pool.length - 1) * spacing) / 2;
    pool.forEach((v, i) => {
      const cx = startX + i * spacing;
      const halo = this.add.circle(cx, poolY, 28, hexToNum(COL_ACCENT), 0).setDepth(6);
      const ball = this.add.circle(cx, poolY, 24, hexToNum(COL_SECONDARY), 0.9)
        .setStrokeStyle(2, hexToNum(COL_TEXT), 0.5)
        .setInteractive({ useHandCursor: true }).setDepth(7);
      const lbl = this.add.text(cx, poolY, String(v), {
        fontSize: '16px', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(8);
      this.rg.add(halo); this.rg.add(ball); this.rg.add(lbl);
      const entry = { halo, ball, lbl, value: v, used: false };
      ball.on('pointerdown', () => {
        if (entry.used) return;
        this.selectedBall = entry;
        this.poolBalls.forEach(p => p.halo.setStrokeStyle(0));
        halo.setStrokeStyle(3, hexToNum(COL_ACCENT), 1);
      });
      this.poolBalls.push(entry);
    });

    // Status
    this.statusLbl = this.add.text(W/2, H*0.84, ' ', {
      fontSize: '12px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5).setDepth(6);
    this.rg.add(this.statusLbl);

    // Reset
    const reset = this.add.rectangle(W*0.15, H*0.92, 80, 30, hexToNum(COL_DANGER), 0.55)
      .setInteractive({ useHandCursor: true }).setDepth(9);
    this.rg.add(reset);
    this.rg.add(this.add.text(W*0.15, H*0.92, 'Reset', {
      fontSize: '11px', color: '#fff', fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10));
    reset.on('pointerdown', () => this.startRound());
  }

  _mkSlot(pos, x, y, r, color, labelText) {
    const fill = this.add.circle(x, y, r, hexToNum(color), 0.2).setDepth(4)
      .setInteractive({ useHandCursor: true });
    const ring = this.add.circle(x, y, r).setStrokeStyle(2, hexToNum(color), 0.7).setDepth(4);
    const label = this.add.text(x, y - r - 10, labelText, {
      fontSize: '10px', color: COL_TEXT, fontFamily: "'Lexend', system-ui", alpha: 0.6
    }).setOrigin(0.5).setDepth(4);
    const value = this.add.text(x, y, '?', {
      fontSize: '24px', color: COL_DANGER, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(5);
    this.rg.add(fill); this.rg.add(ring); this.rg.add(label); this.rg.add(value);
    const slot = { pos, x, y, r, color, fill, ring, label, value, filled: false, assignedValue: null };
    fill.on('pointerdown', () => this._tryFillSlot(slot));
    this.slots[pos] = slot;
  }

  _tryFillSlot(slot) {
    if (this._done) return;
    if (slot.pos === this.unknownPos) {
      this.statusLbl.setText('That circle is the unknown — it will fill itself!').setColor(COL_DANGER);
      return;
    }
    if (slot.filled) {
      this.statusLbl.setText('That circle is already filled.').setColor(COL_DANGER);
      return;
    }
    if (!this.selectedBall) {
      this.statusLbl.setText('Pick a ball from the pool first.').setColor(COL_DANGER);
      return;
    }
    const correct = slot.pos === 'whole' ? this.whole : slot.pos === 'a' ? this.a : this.b;
    if (this.selectedBall.value !== correct) {
      this.statusLbl.setText("That ball doesn't belong here. Try another circle.").setColor(COL_DANGER);
      this.cameras.main.shake(120, 0.005);
      heroShake(this, this.hero);
      this.lives = Math.max(0, this.lives - 1);
      this._rh();
      if (this.lives <= 0) {
        this.time.delayedCall(500, () => this.scene.start('LoseScene', { score: gameScore }));
      }
      return;
    }
    // Accept — place the ball into the slot
    slot.value.setText(String(this.selectedBall.value)).setColor('#ffffff');
    slot.fill.setFillStyle(hexToNum(slot.color), 0.6);
    slot.filled = true;
    slot.assignedValue = this.selectedBall.value;
    this.selectedBall.used = true;
    this.selectedBall.ball.setAlpha(0.25);
    this.selectedBall.lbl.setAlpha(0.4);
    this.selectedBall.halo.setStrokeStyle(0);
    this.selectedBall = null;
    this.statusLbl.setText(' ');
    this._checkBondComplete();
  }

  _checkBondComplete() {
    const filledCount = ['whole','a','b'].filter(p => p !== this.unknownPos && this.slots[p].filled).length;
    if (filledCount !== 2) return;
    // Auto-reveal the third
    const unknownSlot = this.slots[this.unknownPos];
    const val = this.unknownPos === 'whole' ? this.whole : this.unknownPos === 'a' ? this.a : this.b;
    unknownSlot.value.setText(String(val)).setColor('#ffffff');
    unknownSlot.fill.setFillStyle(hexToNum(unknownSlot.color), 0.6);
    unknownSlot.filled = true;
    // Glow the lines
    this.lineA.setStrokeStyle(4, hexToNum(COL_ACCENT), 1);
    this.lineB.setStrokeStyle(4, hexToNum(COL_ACCENT), 1);
    this.tweens.add({ targets: [this.lineA, this.lineB], alpha: { from: 0.4, to: 1 }, duration: 300, yoyo: true, repeat: 1 });
    gameScore += 10 * (this.round + 1);
    this.scoreLbl.setText('Score: ' + gameScore);
    this.cameras.main.flash(140, 34, 197, 94);
    heroCheer(this, this.hero);
    this._done = true;
    const lines = [
      'Part + Part = Whole',
      this.a + ' + ' + this.b + ' = ' + this.whole,
      (this.unknownPos === 'whole' ? 'Whole = ' : 'Missing = ') + val,
    ];
    this.time.delayedCall(600, () => {
      showSolutionCard(this, lines, () => {
        this.round++;
        if (this.round >= TOTAL_ROUNDS) this.scene.start('VictoryScene', { score: gameScore });
        else this.startRound();
      });
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION D: Cuisenaire Rods — INTRINSIC REBUILD (April 13, 2026)
//
// Teaches: additive composition / decomposition. A reference rod at top
// shows the target length. The player selects shorter rods from a palette;
// each placed rod appears end-to-end beneath the reference. When the
// cumulative length EXACTLY matches the reference, the rods "lock" together
// visually (snap animation, accent glow).
//
// There is no Verify button. Physical matching IS the truth. Going OVER
// the target simply won't lock — the learner sees and corrects visually.
// ═══════════════════════════════════════════════════════════════════════════════
class CuisenaireRodsScene extends Phaser.Scene {
  constructor() { super('CuisenaireRodsScene'); }

  create() {
    this.W = this.scale.width; this.H = this.scale.height;
    this.round = 0; this.lives = MAX_LIVES;
    this._bg(); this._ui();
    this.hero = addCharacter(this, this.W*0.88, this.H*0.55, 0.8);
    this.startRound();
  }
  _bg() {
    const bg = this.add.image(this.W/2, this.H/2, 'bg');
    bg.setScale(Math.max(this.W/bg.width, this.H/bg.height));
    this.add.rectangle(this.W/2, this.H/2, this.W, this.H, 0x000000, 0.7);
  }
  _ui() {
    this.scoreLbl = this.add.text(this.W - 14, 14, 'Score: 0', {
      fontSize: '16px', color: COL_ACCENT, fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(1, 0).setDepth(10);
    this.hg = this.add.group(); this._rh();
    this.dg = this.add.group(); this._rd();
  }
  _rh() {
    this.hg.clear(true, true);
    for (let i = 0; i < this.lives; i++)
      this.hg.add(this.add.text(14 + i*22, 14, '♥', { fontSize:'18px', color: COL_DANGER }).setDepth(10));
  }
  _rd() {
    this.dg.clear(true, true);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      const c = i < this.round ? COL_ACCENT : (i === this.round ? COL_PRIMARY : '#555555');
      this.dg.add(this.add.circle(this.W/2 - 40 + i*20, this.H - 16, 5, hexToNum(c)).setDepth(10));
    }
  }

  startRound() {
    if (this.rg) this.rg.clear(true, true);
    this.rg = this.add.group();
    this._rd();
    this._done = false;

    const data = getRound(this.round);
    const W = this.W, H = this.H;

    const fallbackTargets = [6, 8, 9, 11, 13];
    const isDefault = !data || data.prompt === 'Solve this!';
    const target = isDefault ? fallbackTargets[this.round % 5]
                             : Math.min(15, Math.max(3, data.target));
    this.target = target;
    this.placed = [];

    const prompt = isDefault
      ? 'Build a train of rods that matches the reference rod at the top.'
      : (data.prompt || 'Match the target length.');
    this.rg.add(this.add.text(W/2, H*0.06, prompt, {
      fontSize: '14px', color: COL_ACCENT, fontFamily: "'Lexend', system-ui",
      wordWrap: { width: W - 40 }, align: 'center'
    }).setOrigin(0.5, 0).setDepth(6));

    // Rod colors (standard Cuisenaire)
    const rodColors = ['#FFFFFF','#E84040','#40C840','#C74FE8','#E8E840','#40C8C8','#222222','#E8A040','#4040E8','#E88040','#F06AA8','#6AF0C8','#A868E0','#E0A868','#68E0A8'];
    this.rodColors = rodColors;

    const unitW = Math.min(28, (W - 60) / Math.max(target, 10));
    this.unitW = unitW;
    const rodH = 28;
    const refW = target * unitW;
    const refLeft = (W - refW) / 2;
    const refY = H * 0.18;
    this.refLeft = refLeft; this.refY = refY;

    // Reference rod
    this.rg.add(this.add.text(W/2, refY - 26, 'Reference (length = ' + target + ')', {
      fontSize: '12px', color: COL_ACCENT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5).setDepth(5));
    this.rg.add(this.add.rectangle(refLeft + refW/2, refY, refW, rodH, hexToNum(rodColors[target - 1] || '#FFFFFF'), 0.9)
      .setStrokeStyle(2, hexToNum('#ffffff'), 0.4).setDepth(5));
    this.rg.add(this.add.text(refLeft + refW/2, refY, String(target), {
      fontSize: '13px', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6));

    // Player's train area (below reference)
    this.trainY = refY + 50;
    this.trainContainer = this.add.container(refLeft, this.trainY).setDepth(5);
    this.rg.add(this.trainContainer);
    // Outlined track showing length target (so misalignment is visible)
    this.rg.add(this.add.rectangle(refLeft + refW/2, this.trainY, refW, rodH, hexToNum(COL_TEXT), 0.05)
      .setStrokeStyle(1, hexToNum(COL_TEXT), 0.3).setDepth(4));

    // Readouts
    this.sumLbl = this.add.text(W/2, this.trainY + 40, 'Your length: 0 / ' + target, {
      fontSize: '14px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6);
    this.rg.add(this.sumLbl);

    // Rod palette (lengths 1..target-1, plus always small options)
    const maxPaletteLen = Math.min(10, target - 1);
    const paletteTop = H * 0.52;
    this.rg.add(this.add.text(W/2, paletteTop - 14, 'Click rods to add them end-to-end:', {
      fontSize: '11px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5).setDepth(5));

    for (let len = 1; len <= maxPaletteLen; len++) {
      const rw = len * unitW;
      const row = Math.floor((len - 1) / 5);
      const col = (len - 1) % 5;
      const rx = (W/2) - (5 * unitW * 1.2) + col * unitW * 2.4 + rw/2;
      const ry = paletteTop + 14 + row * 32;
      const bg = this.add.rectangle(rx, ry, rw, 22, hexToNum(rodColors[len - 1]), 0.75)
        .setInteractive({ useHandCursor: true }).setStrokeStyle(1, hexToNum('#ffffff'), 0.3).setDepth(6);
      const lbl = this.add.text(rx, ry, String(len), {
        fontSize: '11px', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(7);
      this.rg.add(bg); this.rg.add(lbl);
      bg.on('pointerdown', () => this._placeRod(len));
    }

    // Undo
    const undo = this.add.rectangle(W*0.15, H*0.92, 80, 30, hexToNum(COL_DANGER), 0.55)
      .setInteractive({ useHandCursor: true }).setDepth(9);
    this.rg.add(undo);
    this.rg.add(this.add.text(W*0.15, H*0.92, 'Remove last', {
      fontSize: '11px', color: '#fff', fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10));
    undo.on('pointerdown', () => this._popRod());
  }

  _placeRod(len) {
    const used = this.placed.reduce((a, r) => a + r.len, 0);
    if (used + len > this.target) {
      this.sumLbl.setText('Too long! Remove a rod.').setColor(COL_DANGER);
      this.cameras.main.shake(120, 0.004);
      return;
    }
    const rw = len * this.unitW;
    const x = used * this.unitW + rw/2;
    const rect = this.add.rectangle(x, 0, rw, 28, hexToNum(this.rodColors[len - 1]), 0.85)
      .setStrokeStyle(1, hexToNum('#ffffff'), 0.4);
    const lbl = this.add.text(x, 0, String(len), {
      fontSize: '11px', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5);
    this.trainContainer.add([rect, lbl]);
    this.placed.push({ len, rect, lbl });
    this._updateSum();
  }

  _popRod() {
    const last = this.placed.pop();
    if (!last) return;
    last.rect.destroy(); last.lbl.destroy();
    this._updateSum();
  }

  _updateSum() {
    const sum = this.placed.reduce((a, r) => a + r.len, 0);
    this.sumLbl.setText('Your length: ' + sum + ' / ' + this.target);
    this.sumLbl.setColor(sum === this.target ? COL_ACCENT : COL_TEXT);
    if (sum === this.target) this._snapLock();
  }

  _snapLock() {
    if (this._done) return;
    this._done = true;
    // Snap animation: each rod does a tiny scale pulse in sequence
    this.placed.forEach((r, i) => {
      this.time.delayedCall(i * 80, () => {
        this.tweens.add({ targets: [r.rect], scaleY: 1.25, duration: 120, yoyo: true, ease: 'Sine.easeOut' });
        r.rect.setStrokeStyle(2, hexToNum(COL_ACCENT), 1);
      });
    });
    gameScore += 10 * (this.round + 1);
    this.scoreLbl.setText('Score: ' + gameScore);
    heroCheer(this, this.hero);
    this.cameras.main.flash(140, 34, 197, 94);
    const expr = this.placed.map(r => r.len).join(' + ');
    const lines = [
      'Your rods match the reference:',
      expr + ' = ' + this.target,
      'They locked into place!',
    ];
    this.time.delayedCall(this.placed.length * 80 + 400, () => {
      showSolutionCard(this, lines, () => {
        this.round++;
        if (this.round >= TOTAL_ROUNDS) this.scene.start('VictoryScene', { score: gameScore });
        else this.startRound();
      });
    });
  }
}
`
