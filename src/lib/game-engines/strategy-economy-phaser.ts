// Strategy & Economy — Phaser engine with 3 game options.
// Math: Multiplication, exponential growth, strategic planning.
// Options: investment-sim, population-boom, doubling-maze
//
// ═══════════════════════════════════════════════════════════════════════════════
// TRULY INTRINSIC REDESIGNS v2 (April 13, 2026)
// Modeled on MysterySideScene in balance-systems-phaser.ts.
//
// InvestmentSimScene  → "Multiplication Array": dots visibly SPLIT each time
//                       you tap a multiplier. Exponential growth is SEEN.
// PopulationBoomScene → "Visible Population": creatures visibly split each
//                       generation by the chosen growth rate. Growth is SEEN.
// DoublingMazeScene   → "Split-and-Double Path": a stack of blocks visibly
//                       doubles/triples at each fork chosen. Multiplication IS
//                       the physical stack growth.
//
// Every scene has:
//   - math prompt at the top
//   - physical/visual manipulation only (no number pads)
//   - live feedback as the player acts
//   - automatic success detection (no "Check" button)
//   - a solution reveal card with "Got it! Next round →"
//   - 5 rounds with fallback variation if AI_ROUNDS absent
//   - hero visible at W*0.88, H*0.55, scale 0.8
// ═══════════════════════════════════════════════════════════════════════════════

import type { ThemeConfig, MathParams, GameOption } from "./engine-types"
import { phaserGame } from "./base-phaser-template"
import { getOptionDef } from "./game-option-registry"

export function strategyEconomyPhaserEngine(
  config: ThemeConfig,
  math: MathParams,
  option: GameOption = "investment-sim"
): string {
  const validOptions = ["investment-sim", "population-boom", "doubling-maze"]
  const activeOption = validOptions.includes(option) ? option : "investment-sim"
  const optDef = getOptionDef(activeOption)
  const sceneMap: Record<string, string> = {
    "investment-sim": "InvestmentSimScene",
    "population-boom": "PopulationBoomScene",
    "doubling-maze": "DoublingMazeScene",
  }
  return phaserGame({
    config, math, option: activeOption,
    sceneName: sceneMap[activeOption],
    introText: optDef?.introText || "Watch the numbers multiply!",
    helpText: optDef?.helpText || "Pick multipliers to reach the target.",
    gameSceneCode: GAME_SCENES,
  })
}

const GAME_SCENES = `
// ═══════════════════════════════════════════════════════════════════════════════
// InvestmentSimScene — "Multiplication Array"
//
// Teaches: Multiplication / exponential growth as REPEATED SPLITTING.
//
// Setup: A base group of dots (start=2). The target is shown (e.g. 8).
// Player taps a multiplier button (×2 or ×3). Each existing dot VISIBLY SPLITS
// into that many copies — the array doubles or triples in front of their eyes.
// When the dot count equals the target, the array glows green and the solution
// card appears. Player discovers multiplication by WATCHING the splits.
//
// Self-revealing truth: every dot makes N copies of itself → total × N.
// ═══════════════════════════════════════════════════════════════════════════════
class InvestmentSimScene extends Phaser.Scene {
  constructor() { super('InvestmentSimScene'); }

  create() {
    this.W = this.scale.width;
    this.H = this.scale.height;
    this.round = 0;
    this.lives = MAX_LIVES;
    this._buildBackground();
    this._buildUI();
    this.hero = addCharacter(this, this.W * 0.88, this.H * 0.55, 0.8);
    this.startRound();
  }

  _buildBackground() {
    const bg = this.add.image(this.W / 2, this.H / 2, 'bg');
    bg.setScale(Math.max(this.W / bg.width, this.H / bg.height));
    this.add.rectangle(this.W / 2, this.H / 2, this.W, this.H, 0x000000, 0.7);
  }

  _buildUI() {
    const W = this.W, pad = 14;
    this.scoreLbl = this.add.text(W - pad, pad, 'Score: 0', {
      fontSize: '16px', color: COL_ACCENT, fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(1, 0).setDepth(10);
    this.heartsGroup = this.add.group(); this._redrawHearts();
    this.dotGroup = this.add.group(); this._redrawDots();
    this.promptLbl = this.add.text(W / 2, 20, '', {
      fontSize: '18px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold',
      wordWrap: { width: W - 60 }, align: 'center'
    }).setOrigin(0.5, 0).setDepth(10);
    this.subPromptLbl = this.add.text(W / 2, 50, '', {
      fontSize: '13px', color: COL_TEXT, fontFamily: "'Lexend', system-ui", align: 'center'
    }).setOrigin(0.5, 0).setDepth(10);
    this.statusLbl = this.add.text(W / 2, this.H * 0.66, '', {
      fontSize: '15px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);
  }

  _redrawHearts() {
    this.heartsGroup.clear(true, true);
    for (let i = 0; i < this.lives; i++) {
      this.heartsGroup.add(
        this.add.text(14 + i * 22, 14, '\\u2665', { fontSize: '18px', color: COL_DANGER }).setDepth(10)
      );
    }
  }
  _redrawDots() {
    this.dotGroup.clear(true, true);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      const col = i < this.round ? COL_ACCENT : (i === this.round ? COL_PRIMARY : '#555555');
      this.dotGroup.add(this.add.circle(this.W / 2 - 40 + i * 20, this.H - 16, 5, hexToNum(col)).setDepth(10));
    }
  }

  startRound() {
    // Fallback variation if AI rounds don't fit
    const fallbacks = [
      { start: 2, target: 8 },    // ×2 ×2
      { start: 2, target: 12 },   // ×2 ×3 or ×3 ×2
      { start: 3, target: 18 },   // ×3 ×2 or ×2 ×3
      { start: 2, target: 16 },   // ×2 ×2 ×2
      { start: 2, target: 24 },   // ×2 ×2 ×3
    ];
    const data = getRound(this.round);
    const fb = fallbacks[this.round % fallbacks.length];
    const isDefault = !data || data.prompt === 'Solve this!' ||
      (Array.isArray(data.items) && data.items.length === 6 && data.items[0] === 10);
    const start = isDefault ? fb.start : (Array.isArray(data.items) && data.items[0] > 1 ? data.items[0] : fb.start);
    const target = isDefault ? fb.target : (data.target && data.target > start ? data.target : fb.target);

    this.startVal = start;
    this.target = target;
    this.currentVal = start;
    this.solved = false;

    if (this.roundGroup) this.roundGroup.clear(true, true);
    this.roundGroup = this.add.group();

    this.promptLbl.setText('Target: ' + target + ' dots');
    this.subPromptLbl.setText('Start with ' + start + '. Tap ×2 or ×3 to split every dot.');
    this.statusLbl.setText('Current: ' + this.currentVal).setColor(COL_PRIMARY);

    this._redrawDots();
    this._buildArray();
    this._buildMultButtons();
  }

  _buildArray() {
    // Array display area in the upper-middle of the screen
    const W = this.W, H = this.H;
    this.arrayArea = { cx: W / 2, cy: H * 0.36, w: W * 0.8, h: H * 0.32 };
    // Soft frame to contain the splitting dots
    const frame = this.add.rectangle(this.arrayArea.cx, this.arrayArea.cy, this.arrayArea.w, this.arrayArea.h, hexToNum(COL_SECONDARY), 0.08)
      .setStrokeStyle(1, hexToNum(COL_SECONDARY), 0.3).setDepth(3);
    this.roundGroup.add(frame);

    // Initial dots laid out in a row
    this.dots = [];
    for (let i = 0; i < this.startVal; i++) {
      const dot = this._spawnDot();
      this.dots.push(dot);
    }
    this._relayout(false);
  }

  _spawnDot(x, y) {
    const d = this.add.circle(x || this.arrayArea.cx, y || this.arrayArea.cy, 10, hexToNum(COL_ACCENT), 1)
      .setStrokeStyle(2, hexToNum(COL_PRIMARY), 0.9).setDepth(7);
    this.roundGroup.add(d);
    return d;
  }

  _relayout(animate) {
    // Grid-layout all current dots within arrayArea
    const n = this.dots.length;
    if (n === 0) return;
    const { cx, cy, w, h } = this.arrayArea;
    // Pick cols/rows so they fit
    const cols = Math.ceil(Math.sqrt(n * (w / h)));
    const rows = Math.ceil(n / cols);
    const gapX = w / (cols + 1);
    const gapY = h / (rows + 1);
    const size = Math.max(4, Math.min(16, Math.min(gapX, gapY) * 0.45));
    this.dots.forEach((d, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const tx = cx - w / 2 + (c + 1) * gapX;
      const ty = cy - h / 2 + (r + 1) * gapY;
      d.setRadius ? null : null;
      if (animate) {
        this.tweens.add({ targets: d, x: tx, y: ty, radius: size, duration: 250, ease: 'Quad.easeOut' });
      } else {
        d.x = tx; d.y = ty;
      }
      // Radius setter: recreate if needed (Phaser arc)
      d.geom.radius = size;
      d.setSize(size * 2, size * 2);
    });
  }

  _buildMultButtons() {
    const W = this.W, H = this.H;
    const y = H * 0.78;
    const opts = [2, 3];
    const spacing = 130;
    opts.forEach((m, i) => {
      const x = W / 2 - spacing / 2 + i * spacing;
      const bg = this.add.rectangle(x, y, 110, 52, hexToNum(COL_PRIMARY), 1)
        .setInteractive({ useHandCursor: true }).setDepth(10);
      const lbl = this.add.text(x, y, '\\u00d7' + m, {
        fontSize: '24px', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(11);
      bg.on('pointerdown', () => this._multiply(m));
      this.roundGroup.add(bg); this.roundGroup.add(lbl);
    });
    // Subtle instruction
    this.roundGroup.add(this.add.text(W / 2, y - 36, 'Each tap splits every dot:', {
      fontSize: '11px', color: COL_TEXT, fontFamily: "'Lexend', system-ui", alpha: 0.6
    }).setOrigin(0.5).setDepth(10));
  }

  _multiply(m) {
    if (this.solved) return;
    const projected = this.currentVal * m;
    if (projected > this.target * 1.6) {
      // Would overshoot badly — lose a life, shake, don't apply
      this.lives--; this._redrawHearts();
      this.cameras.main.shake(160, 0.008); heroShake(this, this.hero);
      this.statusLbl.setText(this.currentVal + ' \\u00d7 ' + m + ' = ' + projected + ' — too many!').setColor(COL_DANGER);
      if (this.lives <= 0) {
        this.time.delayedCall(700, () => this.scene.start('LoseScene', { score: gameScore }));
      }
      return;
    }
    // Split each existing dot into m copies
    const oldDots = this.dots.slice();
    this.dots = [];
    oldDots.forEach(src => {
      for (let k = 0; k < m; k++) {
        const nd = this._spawnDot(src.x + (Math.random() - 0.5) * 8, src.y + (Math.random() - 0.5) * 8);
        nd.setScale(0.1);
        this.tweens.add({ targets: nd, scale: 1, duration: 300, ease: 'Back.easeOut' });
        this.dots.push(nd);
      }
      // Destroy the source with a tiny flash
      this.tweens.add({ targets: src, alpha: 0, scale: 0, duration: 180, onComplete: () => src.destroy() });
    });
    this.currentVal = projected;
    this.time.delayedCall(220, () => this._relayout(true));
    this.statusLbl.setText('Current: ' + this.currentVal).setColor(COL_PRIMARY);
    this.time.delayedCall(500, () => this._checkSolved(m));
  }

  _checkSolved(lastM) {
    if (this.solved) return;
    if (this.currentVal === this.target) {
      this.solved = true;
      // Glow: tween all dots to green with pulse
      this.dots.forEach(d => {
        d.setFillStyle(hexToNum(COL_ACCENT), 1);
        this.tweens.add({ targets: d, scale: 1.3, duration: 250, yoyo: true, repeat: 1 });
      });
      this.cameras.main.flash(120, 34, 197, 94);
      heroCheer(this, this.hero);
      gameScore += 10 * (this.round + 1);
      this.scoreLbl.setText('Score: ' + gameScore);
      this.time.delayedCall(500, () => this._showSolutionCard());
    } else if (this.currentVal > this.target) {
      // Overshot exactly — mark red, lose life, reset round
      this.lives--; this._redrawHearts();
      this.cameras.main.shake(200, 0.01); heroShake(this, this.hero);
      this.statusLbl.setText('Overshot: ' + this.currentVal + ' > ' + this.target).setColor(COL_DANGER);
      if (this.lives <= 0) {
        this.time.delayedCall(700, () => this.scene.start('LoseScene', { score: gameScore }));
      } else {
        this.time.delayedCall(900, () => this.startRound());
      }
    }
  }

  _showSolutionCard() {
    const W = this.W, H = this.H;
    const backdrop = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.55).setDepth(50);
    const card = this.add.rectangle(W/2, H*0.5, W - 40, 220, 0x18181b, 1)
      .setStrokeStyle(2, hexToNum(COL_ACCENT)).setDepth(51);
    const h1 = this.add.text(W/2, H*0.5 - 80, 'You grew it!', {
      fontSize: '22px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(52);
    const lines = [
      'Started with ' + this.startVal + ' dots',
      'Every split \\u00d7 made more copies',
      'You reached ' + this.target + ' dots!',
    ];
    const texts = [];
    lines.forEach((line, i) => {
      const t = this.add.text(W/2, H*0.5 - 30 + i * 26, line, {
        fontSize: '14px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif"
      }).setOrigin(0.5).setDepth(52).setAlpha(0);
      this.time.delayedCall(180 * i, () => this.tweens.add({ targets: t, alpha: 1, duration: 260 }));
      texts.push(t);
    });
    const nextY = H*0.5 + 70;
    const nextBg = this.add.rectangle(W/2, nextY, 200, 44, hexToNum(COL_ACCENT), 1)
      .setInteractive({ useHandCursor: true }).setDepth(52).setAlpha(0);
    const nextLbl = this.add.text(W/2, nextY, this.round + 1 >= TOTAL_ROUNDS ? 'Finish!' : 'Got it! Next round \\u2192', {
      fontSize: '14px', color: '#000', fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(53).setAlpha(0);
    this.time.delayedCall(180 * lines.length + 200, () => {
      this.tweens.add({ targets: [nextBg, nextLbl], alpha: 1, duration: 280 });
    });
    nextBg.on('pointerdown', () => {
      [backdrop, card, h1, ...texts, nextBg, nextLbl].forEach(o => o.destroy());
      this.round++;
      if (this.round >= TOTAL_ROUNDS) this.scene.start('VictoryScene', { score: gameScore });
      else this.startRound();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PopulationBoomScene — "Visible Population"
//
// Teaches: Growth rate (multiplication) as creatures visibly splitting each
// generation by the chosen rate.
//
// Setup: N creatures on screen. Player picks a growth rate (\\u00d72, \\u00d73, \\u00d74),
// then taps "Next Generation". Every creature splits into that many copies.
// Target population is shown. Player adjusts rate and advances generations
// until population matches target. No number input — the creatures ARE the count.
//
// Self-revealing truth: population[n+1] = population[n] \\u00d7 rate. The player
// SEES the multiplication happen each generation.
// ═══════════════════════════════════════════════════════════════════════════════
class PopulationBoomScene extends Phaser.Scene {
  constructor() { super('PopulationBoomScene'); }

  create() {
    this.W = this.scale.width;
    this.H = this.scale.height;
    this.round = 0;
    this.lives = MAX_LIVES;
    this._buildBackground();
    this._buildUI();
    this.hero = addCharacter(this, this.W * 0.88, this.H * 0.55, 0.8);
    this.startRound();
  }

  _buildBackground() {
    const bg = this.add.image(this.W / 2, this.H / 2, 'bg');
    bg.setScale(Math.max(this.W / bg.width, this.H / bg.height));
    this.add.rectangle(this.W / 2, this.H / 2, this.W, this.H, 0x000000, 0.7);
  }

  _buildUI() {
    const W = this.W, pad = 14;
    this.scoreLbl = this.add.text(W - pad, pad, 'Score: 0', {
      fontSize: '16px', color: COL_ACCENT, fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(1, 0).setDepth(10);
    this.heartsGroup = this.add.group(); this._redrawHearts();
    this.dotGroup = this.add.group(); this._redrawDots();
    this.promptLbl = this.add.text(W / 2, 20, '', {
      fontSize: '18px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(10);
    this.subPromptLbl = this.add.text(W / 2, 50, '', {
      fontSize: '13px', color: COL_TEXT, fontFamily: "'Lexend', system-ui", align: 'center'
    }).setOrigin(0.5, 0).setDepth(10);
    this.statusLbl = this.add.text(W / 2, this.H * 0.66, '', {
      fontSize: '15px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);
  }

  _redrawHearts() {
    this.heartsGroup.clear(true, true);
    for (let i = 0; i < this.lives; i++) {
      this.heartsGroup.add(this.add.text(14 + i * 22, 14, '\\u2665', { fontSize: '18px', color: COL_DANGER }).setDepth(10));
    }
  }
  _redrawDots() {
    this.dotGroup.clear(true, true);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      const col = i < this.round ? COL_ACCENT : (i === this.round ? COL_PRIMARY : '#555555');
      this.dotGroup.add(this.add.circle(this.W / 2 - 40 + i * 20, this.H - 16, 5, hexToNum(col)).setDepth(10));
    }
  }

  startRound() {
    const fallbacks = [
      { start: 2, target: 8,  gens: 2 }, // 2->4->8 at \\u00d72
      { start: 1, target: 9,  gens: 2 }, // 1->3->9 at \\u00d73
      { start: 2, target: 16, gens: 3 }, // 2->4->8->16
      { start: 3, target: 12, gens: 2 }, // 3->6->12
      { start: 2, target: 18, gens: 2 }, // 2->6->18
    ];
    const data = getRound(this.round);
    const fb = fallbacks[this.round % fallbacks.length];
    const isDefault = !data || data.prompt === 'Solve this!' ||
      (Array.isArray(data.items) && data.items.length === 6 && data.items[0] === 10);
    const start = isDefault ? fb.start : (Array.isArray(data.items) && data.items[0] > 0 && data.items[0] < 6 ? data.items[0] : fb.start);
    const target = isDefault ? fb.target : (data.target && data.target > start && data.target <= 30 ? data.target : fb.target);

    this.startPop = start;
    this.targetPop = target;
    this.currentRate = 2;
    this.pop = start;
    this.solved = false;
    this.generations = 0;

    if (this.roundGroup) this.roundGroup.clear(true, true);
    this.roundGroup = this.add.group();

    this.promptLbl.setText('Target: ' + target + ' creatures');
    this.subPromptLbl.setText('Pick a rate, then grow. Every creature splits.');
    this.statusLbl.setText('Now: ' + this.pop + ' \\u00b7 Gen 0').setColor(COL_PRIMARY);

    this._redrawDots();
    this._buildField();
    this._buildRateChooser();
    this._buildNextBtn();
  }

  _buildField() {
    const W = this.W, H = this.H;
    this.fieldArea = { cx: W / 2, cy: H * 0.36, w: W * 0.8, h: H * 0.32 };
    const frame = this.add.rectangle(this.fieldArea.cx, this.fieldArea.cy, this.fieldArea.w, this.fieldArea.h, hexToNum(COL_SECONDARY), 0.08)
      .setStrokeStyle(1, hexToNum(COL_SECONDARY), 0.3).setDepth(3);
    this.roundGroup.add(frame);
    this.creatures = [];
    for (let i = 0; i < this.startPop; i++) this.creatures.push(this._spawnCreature());
    this._relayoutCreatures(false);
  }

  _spawnCreature(x, y) {
    const c = this.add.circle(x || this.fieldArea.cx, y || this.fieldArea.cy, 10, hexToNum(COL_PRIMARY), 1)
      .setStrokeStyle(2, hexToNum(COL_ACCENT), 0.9).setDepth(7);
    this.roundGroup.add(c);
    return c;
  }

  _relayoutCreatures(animate) {
    const n = this.creatures.length;
    if (n === 0) return;
    const { cx, cy, w, h } = this.fieldArea;
    const cols = Math.ceil(Math.sqrt(n * (w / h)));
    const rows = Math.ceil(n / cols);
    const gapX = w / (cols + 1);
    const gapY = h / (rows + 1);
    const size = Math.max(4, Math.min(14, Math.min(gapX, gapY) * 0.45));
    this.creatures.forEach((d, i) => {
      const c = i % cols, r = Math.floor(i / cols);
      const tx = cx - w / 2 + (c + 1) * gapX;
      const ty = cy - h / 2 + (r + 1) * gapY;
      d.geom.radius = size; d.setSize(size * 2, size * 2);
      if (animate) this.tweens.add({ targets: d, x: tx, y: ty, duration: 300, ease: 'Quad.easeOut' });
      else { d.x = tx; d.y = ty; }
    });
  }

  _buildRateChooser() {
    const W = this.W, H = this.H;
    const rates = [2, 3, 4];
    const y = H * 0.74;
    const spacing = 82;
    this.rateBtns = [];
    rates.forEach((r, i) => {
      const x = W / 2 - spacing + i * spacing;
      const bg = this.add.rectangle(x, y, 66, 40, hexToNum(COL_SECONDARY), 0.5)
        .setInteractive({ useHandCursor: true }).setDepth(10);
      const lbl = this.add.text(x, y, '\\u00d7' + r, {
        fontSize: '20px', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(11);
      bg.on('pointerdown', () => { this.currentRate = r; this._highlightRate(); });
      this.roundGroup.add(bg); this.roundGroup.add(lbl);
      this.rateBtns.push({ bg, val: r });
    });
    this.roundGroup.add(this.add.text(W / 2, y - 28, 'Growth rate (each splits into...):', {
      fontSize: '11px', color: COL_TEXT, fontFamily: "'Lexend', system-ui", alpha: 0.6
    }).setOrigin(0.5).setDepth(10));
    this._highlightRate();
  }

  _highlightRate() {
    this.rateBtns.forEach(b => {
      const on = b.val === this.currentRate;
      b.bg.setFillStyle(hexToNum(on ? COL_PRIMARY : COL_SECONDARY), on ? 1 : 0.5);
    });
  }

  _buildNextBtn() {
    const W = this.W, H = this.H;
    const y = H * 0.85;
    const bg = this.add.rectangle(W / 2, y, 200, 44, hexToNum(COL_ACCENT), 1)
      .setInteractive({ useHandCursor: true }).setDepth(10);
    const lbl = this.add.text(W / 2, y, 'Next Generation \\u2192', {
      fontSize: '14px', color: '#000', fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);
    bg.on('pointerdown', () => this._nextGen());
    this.roundGroup.add(bg); this.roundGroup.add(lbl);
  }

  _nextGen() {
    if (this.solved) return;
    const projected = this.pop * this.currentRate;
    if (projected > this.targetPop * 1.6) {
      this.lives--; this._redrawHearts();
      this.cameras.main.shake(160, 0.008); heroShake(this, this.hero);
      this.statusLbl.setText(this.pop + ' \\u00d7 ' + this.currentRate + ' = ' + projected + ' — too many!').setColor(COL_DANGER);
      if (this.lives <= 0) this.time.delayedCall(700, () => this.scene.start('LoseScene', { score: gameScore }));
      return;
    }
    const old = this.creatures.slice();
    this.creatures = [];
    old.forEach(src => {
      for (let k = 0; k < this.currentRate; k++) {
        const nc = this._spawnCreature(src.x + (Math.random() - 0.5) * 10, src.y + (Math.random() - 0.5) * 10);
        nc.setScale(0.1);
        this.tweens.add({ targets: nc, scale: 1, duration: 320, ease: 'Back.easeOut' });
        this.creatures.push(nc);
      }
      this.tweens.add({ targets: src, alpha: 0, scale: 0, duration: 180, onComplete: () => src.destroy() });
    });
    this.pop = projected;
    this.generations++;
    this.time.delayedCall(240, () => this._relayoutCreatures(true));
    this.statusLbl.setText('Now: ' + this.pop + ' \\u00b7 Gen ' + this.generations).setColor(COL_PRIMARY);
    this.time.delayedCall(520, () => this._checkSolved());
  }

  _checkSolved() {
    if (this.solved) return;
    if (this.pop === this.targetPop) {
      this.solved = true;
      this.creatures.forEach(d => {
        d.setFillStyle(hexToNum(COL_ACCENT), 1);
        this.tweens.add({ targets: d, scale: 1.3, duration: 220, yoyo: true, repeat: 1 });
      });
      this.cameras.main.flash(120, 34, 197, 94);
      heroCheer(this, this.hero);
      gameScore += 10 * (this.round + 1);
      this.scoreLbl.setText('Score: ' + gameScore);
      this.time.delayedCall(500, () => this._showSolutionCard());
    } else if (this.pop > this.targetPop) {
      this.lives--; this._redrawHearts();
      this.cameras.main.shake(200, 0.01); heroShake(this, this.hero);
      this.statusLbl.setText('Overshot: ' + this.pop + ' > ' + this.targetPop).setColor(COL_DANGER);
      if (this.lives <= 0) this.time.delayedCall(700, () => this.scene.start('LoseScene', { score: gameScore }));
      else this.time.delayedCall(900, () => this.startRound());
    }
  }

  _showSolutionCard() {
    const W = this.W, H = this.H;
    const backdrop = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.55).setDepth(50);
    const card = this.add.rectangle(W/2, H*0.5, W - 40, 220, 0x18181b, 1)
      .setStrokeStyle(2, hexToNum(COL_ACCENT)).setDepth(51);
    const h1 = this.add.text(W/2, H*0.5 - 80, 'Population reached!', {
      fontSize: '22px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(52);
    const lines = [
      'Started with ' + this.startPop + ' creatures',
      'Grew for ' + this.generations + ' generation(s)',
      'Final population: ' + this.pop,
    ];
    const texts = [];
    lines.forEach((line, i) => {
      const t = this.add.text(W/2, H*0.5 - 30 + i * 26, line, {
        fontSize: '14px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif"
      }).setOrigin(0.5).setDepth(52).setAlpha(0);
      this.time.delayedCall(180 * i, () => this.tweens.add({ targets: t, alpha: 1, duration: 260 }));
      texts.push(t);
    });
    const nextY = H*0.5 + 70;
    const nextBg = this.add.rectangle(W/2, nextY, 200, 44, hexToNum(COL_ACCENT), 1)
      .setInteractive({ useHandCursor: true }).setDepth(52).setAlpha(0);
    const nextLbl = this.add.text(W/2, nextY, this.round + 1 >= TOTAL_ROUNDS ? 'Finish!' : 'Got it! Next round \\u2192', {
      fontSize: '14px', color: '#000', fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(53).setAlpha(0);
    this.time.delayedCall(180 * lines.length + 200, () => {
      this.tweens.add({ targets: [nextBg, nextLbl], alpha: 1, duration: 280 });
    });
    nextBg.on('pointerdown', () => {
      [backdrop, card, h1, ...texts, nextBg, nextLbl].forEach(o => o.destroy());
      this.round++;
      if (this.round >= TOTAL_ROUNDS) this.scene.start('VictoryScene', { score: gameScore });
      else this.startRound();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DoublingMazeScene — "Split-and-Double Path"
//
// Teaches: Multiplication as repeated doubling/tripling along a branching path.
//
// Setup: A stack of blocks shows the current value. Ahead lies a series of
// forks — each fork offers a \\u00d72 or \\u00d73 choice. When the player taps a fork,
// the stack VISIBLY multiplies (blocks literally clone to form the new stack).
// Target value is shown. Player must pick forks so the stack ends at exactly
// the target. The physical stack growth IS the multiplication.
//
// Self-revealing truth: the stack after fork k equals start \\u00d7 (product of chosen
// multipliers). Growing the stack IS computing the product.
// ═══════════════════════════════════════════════════════════════════════════════
class DoublingMazeScene extends Phaser.Scene {
  constructor() { super('DoublingMazeScene'); }

  create() {
    this.W = this.scale.width;
    this.H = this.scale.height;
    this.round = 0;
    this.lives = MAX_LIVES;
    this._buildBackground();
    this._buildUI();
    this.hero = addCharacter(this, this.W * 0.88, this.H * 0.55, 0.8);
    this.startRound();
  }

  _buildBackground() {
    const bg = this.add.image(this.W / 2, this.H / 2, 'bg');
    bg.setScale(Math.max(this.W / bg.width, this.H / bg.height));
    this.add.rectangle(this.W / 2, this.H / 2, this.W, this.H, 0x000000, 0.7);
  }

  _buildUI() {
    const W = this.W, pad = 14;
    this.scoreLbl = this.add.text(W - pad, pad, 'Score: 0', {
      fontSize: '16px', color: COL_ACCENT, fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(1, 0).setDepth(10);
    this.heartsGroup = this.add.group(); this._redrawHearts();
    this.dotGroup = this.add.group(); this._redrawDots();
    this.promptLbl = this.add.text(W / 2, 20, '', {
      fontSize: '18px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(10);
    this.subPromptLbl = this.add.text(W / 2, 50, '', {
      fontSize: '13px', color: COL_TEXT, fontFamily: "'Lexend', system-ui", align: 'center'
    }).setOrigin(0.5, 0).setDepth(10);
    this.statusLbl = this.add.text(W / 2, this.H * 0.82, '', {
      fontSize: '14px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);
  }

  _redrawHearts() {
    this.heartsGroup.clear(true, true);
    for (let i = 0; i < this.lives; i++) {
      this.heartsGroup.add(this.add.text(14 + i * 22, 14, '\\u2665', { fontSize: '18px', color: COL_DANGER }).setDepth(10));
    }
  }
  _redrawDots() {
    this.dotGroup.clear(true, true);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      const col = i < this.round ? COL_ACCENT : (i === this.round ? COL_PRIMARY : '#555555');
      this.dotGroup.add(this.add.circle(this.W / 2 - 40 + i * 20, this.H - 16, 5, hexToNum(col)).setDepth(10));
    }
  }

  startRound() {
    // Build a valid fork chain that multiplies start to target
    const fallbacks = [
      { start: 2, forks: [2, 2] },         // 2->4->8
      { start: 2, forks: [2, 3] },         // 2->4->12
      { start: 3, forks: [2, 2] },         // 3->6->12
      { start: 2, forks: [2, 2, 2] },      // 2->4->8->16
      { start: 2, forks: [3, 2, 2] },      // 2->6->12->24
    ];
    const fb = fallbacks[this.round % fallbacks.length];
    const data = getRound(this.round);
    const isDefault = !data || data.prompt === 'Solve this!' ||
      (Array.isArray(data.items) && data.items.length === 6 && data.items[0] === 10);
    let start, correctPath, target;
    if (isDefault) {
      start = fb.start; correctPath = fb.forks.slice();
      target = start; correctPath.forEach(m => target *= m);
    } else {
      start = fb.start; correctPath = fb.forks.slice();
      target = (data.target && data.target > start) ? data.target : (start * correctPath.reduce((a, b) => a * b, 1));
      // Rebuild correctPath to reach the AI target if possible
      correctPath = this._findPath(start, target, fb.forks.length);
      if (!correctPath) { correctPath = fb.forks.slice(); target = start; correctPath.forEach(m => target *= m); }
    }

    this.startVal = start;
    this.target = target;
    this.currentVal = start;
    this.correctPath = correctPath;
    this.forkIndex = 0;
    this.forkCount = correctPath.length;
    this.solved = false;

    if (this.roundGroup) this.roundGroup.clear(true, true);
    this.roundGroup = this.add.group();

    this.promptLbl.setText('Target stack: ' + target);
    this.subPromptLbl.setText('Pick the right forks. The stack grows with you.');
    this.statusLbl.setText('Stack: ' + this.currentVal + ' / ' + this.target).setColor(COL_PRIMARY);

    this._redrawDots();
    this._buildStack();
    this._buildForks();
  }

  _findPath(start, target, maxLen) {
    // BFS paths of {2,3} within maxLen+1 that multiply start to target
    const queue = [{ val: start, path: [] }];
    while (queue.length) {
      const cur = queue.shift();
      if (cur.val === target && cur.path.length > 0) return cur.path;
      if (cur.path.length >= maxLen + 1) continue;
      for (const m of [2, 3]) {
        if (cur.val * m > target * 4) continue;
        queue.push({ val: cur.val * m, path: [...cur.path, m] });
      }
    }
    return null;
  }

  _buildStack() {
    const W = this.W, H = this.H;
    this.stackArea = { cx: W * 0.28, cy: H * 0.5, w: W * 0.25, h: H * 0.4 };
    const frame = this.add.rectangle(this.stackArea.cx, this.stackArea.cy, this.stackArea.w, this.stackArea.h, hexToNum(COL_SECONDARY), 0.08)
      .setStrokeStyle(1, hexToNum(COL_SECONDARY), 0.3).setDepth(3);
    this.roundGroup.add(frame);
    this.roundGroup.add(this.add.text(this.stackArea.cx, this.stackArea.cy - this.stackArea.h / 2 - 12, 'Your stack', {
      fontSize: '11px', color: COL_TEXT, fontFamily: "'Lexend', system-ui", alpha: 0.6
    }).setOrigin(0.5).setDepth(6));
    // Target indicator (dashed line showing target height)
    this.targetLine = this.add.rectangle(this.stackArea.cx, this._stackYForValue(this.target), this.stackArea.w * 0.95, 2, hexToNum(COL_ACCENT), 0.7).setDepth(5);
    this.roundGroup.add(this.targetLine);
    this.roundGroup.add(this.add.text(this.stackArea.cx + this.stackArea.w * 0.5 + 6, this._stackYForValue(this.target), 'target', {
      fontSize: '10px', color: COL_ACCENT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0, 0.5).setDepth(6));

    this.blocks = [];
    for (let i = 0; i < this.startVal; i++) this.blocks.push(this._spawnBlock(i));
    this._layoutStack(false);
  }

  _stackYForValue(v) {
    // Map value -> y position in stackArea (bottom = 0 count)
    const bottom = this.stackArea.cy + this.stackArea.h / 2 - 10;
    const top = this.stackArea.cy - this.stackArea.h / 2 + 10;
    const maxV = Math.max(this.target, this.currentVal || 1);
    const h = bottom - top;
    const ratio = Math.min(1, v / maxV);
    return bottom - ratio * h;
  }

  _spawnBlock(index) {
    const b = this.add.rectangle(this.stackArea.cx, this.stackArea.cy, this.stackArea.w * 0.6, 8, hexToNum(COL_PRIMARY), 1)
      .setStrokeStyle(1, hexToNum(COL_ACCENT), 0.8).setDepth(7);
    this.roundGroup.add(b);
    return b;
  }

  _layoutStack(animate) {
    const n = this.blocks.length;
    if (n === 0) return;
    const bottom = this.stackArea.cy + this.stackArea.h / 2 - 6;
    const top = this.stackArea.cy - this.stackArea.h / 2 + 6;
    const maxV = Math.max(this.target, this.currentVal);
    const fullH = bottom - top;
    const blockH = Math.max(3, Math.min(14, (fullH / maxV) * 0.9));
    const gap = blockH * 0.2;
    this.blocks.forEach((b, i) => {
      const y = bottom - i * (blockH + gap) - blockH / 2;
      b.setSize(this.stackArea.w * 0.6, blockH);
      if (animate) this.tweens.add({ targets: b, x: this.stackArea.cx, y, duration: 260, ease: 'Quad.easeOut' });
      else { b.x = this.stackArea.cx; b.y = y; }
    });
    if (this.targetLine) this.targetLine.y = this._stackYForValue(this.target);
  }

  _buildForks() {
    // Right side: currently active fork (two choices)
    const W = this.W, H = this.H;
    const cx = W * 0.65, cy = H * 0.5;
    if (this.forkGroup) this.forkGroup.clear(true, true);
    this.forkGroup = this.add.group();
    this.roundGroup.add(this.add.text(cx, cy - 120, 'Fork ' + (this.forkIndex + 1) + ' of ' + this.forkCount, {
      fontSize: '13px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5).setDepth(10));
    const options = [2, 3];
    options.forEach((m, i) => {
      const x = cx;
      const y = cy - 40 + i * 72;
      const bg = this.add.rectangle(x, y, 180, 56, hexToNum(COL_PRIMARY), 1)
        .setInteractive({ useHandCursor: true }).setDepth(10);
      const lbl = this.add.text(x, y, '\\u00d7' + m + '  (\\u2192 ' + (this.currentVal * m) + ')', {
        fontSize: '18px', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(11);
      bg.on('pointerdown', () => this._takeFork(m));
      this.forkGroup.add(bg); this.forkGroup.add(lbl);
      this.roundGroup.add(bg); this.roundGroup.add(lbl);
    });
  }

  _takeFork(m) {
    if (this.solved) return;
    const projected = this.currentVal * m;
    if (projected > this.target) {
      // Overshoot — lose life
      this.lives--; this._redrawHearts();
      this.cameras.main.shake(180, 0.009); heroShake(this, this.hero);
      this.statusLbl.setText(this.currentVal + ' \\u00d7 ' + m + ' = ' + projected + ' — too big!').setColor(COL_DANGER);
      if (this.lives <= 0) this.time.delayedCall(700, () => this.scene.start('LoseScene', { score: gameScore }));
      else this.time.delayedCall(900, () => this.startRound());
      return;
    }
    // Clone each block m times
    const old = this.blocks.slice();
    this.blocks = [];
    old.forEach(src => {
      for (let k = 0; k < m; k++) {
        const nb = this.add.rectangle(src.x, src.y, src.width, src.height, hexToNum(COL_PRIMARY), 1)
          .setStrokeStyle(1, hexToNum(COL_ACCENT), 0.8).setDepth(7);
        this.roundGroup.add(nb);
        nb.setAlpha(0.3);
        this.tweens.add({ targets: nb, alpha: 1, duration: 260, ease: 'Quad.easeOut' });
        this.blocks.push(nb);
      }
      this.tweens.add({ targets: src, alpha: 0, duration: 160, onComplete: () => src.destroy() });
    });
    this.currentVal = projected;
    this.forkIndex++;
    this.time.delayedCall(240, () => this._layoutStack(true));
    this.statusLbl.setText('Stack: ' + this.currentVal + ' / ' + this.target).setColor(COL_PRIMARY);
    this.time.delayedCall(560, () => {
      if (this.currentVal === this.target) this._onSolved();
      else if (this.forkIndex >= this.forkCount) {
        // Exhausted forks without reaching target
        this.lives--; this._redrawHearts();
        this.cameras.main.shake(200, 0.01); heroShake(this, this.hero);
        this.statusLbl.setText('Finished at ' + this.currentVal + ' — need ' + this.target).setColor(COL_DANGER);
        if (this.lives <= 0) this.time.delayedCall(700, () => this.scene.start('LoseScene', { score: gameScore }));
        else this.time.delayedCall(900, () => this.startRound());
      } else {
        this._buildForks();
      }
    });
  }

  _onSolved() {
    this.solved = true;
    this.blocks.forEach(b => {
      b.setFillStyle(hexToNum(COL_ACCENT), 1);
      this.tweens.add({ targets: b, scaleX: 1.1, scaleY: 1.1, duration: 200, yoyo: true });
    });
    this.cameras.main.flash(120, 34, 197, 94);
    heroCheer(this, this.hero);
    gameScore += 10 * (this.round + 1);
    this.scoreLbl.setText('Score: ' + gameScore);
    this.time.delayedCall(500, () => this._showSolutionCard());
  }

  _showSolutionCard() {
    const W = this.W, H = this.H;
    const backdrop = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.55).setDepth(50);
    const card = this.add.rectangle(W/2, H*0.5, W - 40, 220, 0x18181b, 1)
      .setStrokeStyle(2, hexToNum(COL_ACCENT)).setDepth(51);
    const h1 = this.add.text(W/2, H*0.5 - 80, 'Target reached!', {
      fontSize: '22px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(52);
    const lines = [
      this.startVal + ' \\u00d7 ' + this.correctPath.slice(0, this.forkIndex).join(' \\u00d7 ') + ' = ' + this.target,
      'Each fork multiplied the stack',
      'You built a tower of ' + this.target,
    ];
    const texts = [];
    lines.forEach((line, i) => {
      const t = this.add.text(W/2, H*0.5 - 30 + i * 26, line, {
        fontSize: i === 0 ? '15px' : '13px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif"
      }).setOrigin(0.5).setDepth(52).setAlpha(0);
      this.time.delayedCall(180 * i, () => this.tweens.add({ targets: t, alpha: 1, duration: 260 }));
      texts.push(t);
    });
    const nextY = H*0.5 + 70;
    const nextBg = this.add.rectangle(W/2, nextY, 200, 44, hexToNum(COL_ACCENT), 1)
      .setInteractive({ useHandCursor: true }).setDepth(52).setAlpha(0);
    const nextLbl = this.add.text(W/2, nextY, this.round + 1 >= TOTAL_ROUNDS ? 'Finish!' : 'Got it! Next round \\u2192', {
      fontSize: '14px', color: '#000', fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(53).setAlpha(0);
    this.time.delayedCall(180 * lines.length + 200, () => {
      this.tweens.add({ targets: [nextBg, nextLbl], alpha: 1, duration: 280 });
    });
    nextBg.on('pointerdown', () => {
      [backdrop, card, h1, ...texts, nextBg, nextLbl].forEach(o => o.destroy());
      this.round++;
      if (this.round >= TOTAL_ROUNDS) this.scene.start('VictoryScene', { score: gameScore });
      else this.startRound();
    });
  }
}
`
