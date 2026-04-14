// Measure & Compare — Phaser engine with 3 game options.
// Math: Measurement, units, length, weight, capacity, conversion.
// Options: size-picker (intrinsic), ruler-race (intrinsic), unit-converter (practice)

import type { ThemeConfig, MathParams, GameOption } from "./engine-types"
import { phaserGame } from "./base-phaser-template"
import { getOptionDef } from "./game-option-registry"

export function measurementChallengesPhaserEngine(
  config: ThemeConfig,
  math: MathParams,
  option: GameOption = "size-picker"
): string {
  const validOptions = ["size-picker", "ruler-race", "unit-converter"]
  const activeOption = validOptions.includes(option) ? option : "size-picker"

  const optDef = getOptionDef(activeOption)

  const sceneMap: Record<string, string> = {
    "size-picker": "SizePickerScene",
    "ruler-race": "RulerRaceScene",
    "unit-converter": "UnitConverterScene",
  }

  return phaserGame({
    config,
    math,
    option: activeOption,
    sceneName: sceneMap[activeOption],
    introText: optDef?.introText || "Compare the sizes!",
    helpText: optDef?.helpText || "Pick the bigger or smaller item.",
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
// OPTION A: Size Picker — already intrinsic (compare two items, pick bigger/smaller)
// ═══════════════════════════════════════════════════════════════════════════════
class SizePickerScene extends Phaser.Scene {
  constructor() { super('SizePickerScene'); }

  create() {
    this.W = this.scale.width; this.H = this.scale.height;
    this.round = 0; this.lives = MAX_LIVES;
    this._buildBackground(); this._buildUI(); this.hero = addCharacter(this, this.W * 0.85, this.H * 0.35, 0.4); this.startRound();
  }

  _buildBackground() {
    const bg = this.add.image(this.W / 2, this.H / 2, 'bg');
    bg.setScale(Math.max(this.W / bg.width, this.H / bg.height));
    this.add.rectangle(this.W / 2, this.H / 2, this.W, this.H, 0x000000, 0.65);
  }

  _buildUI() {
    const W = this.W, pad = 14;
    this.scoreLbl = this.add.text(W - pad, pad, 'Score: 0', { fontSize: '16px', color: COL_ACCENT, fontFamily: "'Lexend', system-ui", fontStyle: 'bold' }).setOrigin(1, 0).setDepth(10);
    this.heartsGroup = this.add.group(); this._redrawHearts();
    this.dotGroup = this.add.group(); this._redrawDots();
    this.promptLbl = this.add.text(W / 2, pad + 5, '', { fontSize: '16px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold' }).setOrigin(0.5, 0).setDepth(10);
  }

  _redrawHearts() { this.heartsGroup.clear(true, true); for (let i = 0; i < this.lives; i++) { this.heartsGroup.add(this.add.text(14 + i * 22, 14, '♥', { fontSize: '18px', color: COL_DANGER }).setDepth(10)); } }
  _redrawDots() { this.dotGroup.clear(true, true); for (let i = 0; i < TOTAL_ROUNDS; i++) { const col = i < this.round ? COL_ACCENT : (i === this.round ? COL_PRIMARY : '#555555'); this.dotGroup.add(this.add.circle(this.W / 2 - 40 + i * 20, this.H - 16, 5, hexToNum(col)).setDepth(10)); } }

  startRound() {
    if (this.roundGroup) this.roundGroup.clear(true, true);
    this.roundGroup = this.add.group();
    const data = getRound(this.round);
    data.valueA = data.items[0] || 10;
    data.valueB = data.items[1] || 5;
    data.unit = 'cm';
    data.bigger = data.valueA > data.valueB ? 'A' : 'B';
    this.correctAnswer = data.bigger;
    this.promptLbl.setText(data.prompt);
    this._redrawDots();
    const W = this.W, H = this.H;
    const cardA = this.add.rectangle(W * 0.28, H * 0.45, W * 0.35, H * 0.3, hexToNum(COL_SECONDARY), 0.15)
      .setStrokeStyle(2, hexToNum(COL_PRIMARY), 0.4).setInteractive({ useHandCursor: true }).setDepth(5);
    this.roundGroup.add(cardA);
    this.roundGroup.add(this.add.image(W * 0.28, H * 0.38, 'item').setScale(0.7).setDepth(6));
    this.roundGroup.add(this.add.text(W * 0.28, H * 0.55, data.valueA + ' ' + data.unit, {
      fontSize: '22px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6));
    cardA.on('pointerdown', () => this._pick('A'));
    const cardB = this.add.rectangle(W * 0.72, H * 0.45, W * 0.35, H * 0.3, hexToNum(COL_SECONDARY), 0.15)
      .setStrokeStyle(2, hexToNum(COL_PRIMARY), 0.4).setInteractive({ useHandCursor: true }).setDepth(5);
    this.roundGroup.add(cardB);
    this.roundGroup.add(this.add.image(W * 0.72, H * 0.38, 'item').setScale(0.7).setDepth(6));
    this.roundGroup.add(this.add.text(W * 0.72, H * 0.55, data.valueB + ' ' + data.unit, {
      fontSize: '22px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6));
    cardB.on('pointerdown', () => this._pick('B'));
    this.roundGroup.add(this.add.text(W / 2, H * 0.45, 'VS', { fontSize: '20px', color: '#555', fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold' }).setOrigin(0.5).setDepth(7));
  }

  _pick(choice) {
    if (choice === this.correctAnswer) {
      gameScore += 10 * (this.round + 1); this.scoreLbl.setText('Score: ' + gameScore);
      this.cameras.main.flash(200, 34, 197, 94); heroCheer(this, this.hero);
      this.round++;
      if (this.round >= TOTAL_ROUNDS) { this.time.delayedCall(600, () => this.scene.start('VictoryScene', { score: gameScore })); }
      else { this.time.delayedCall(600, () => this.startRound()); }
    } else {
      this.lives--; this._redrawHearts(); this.cameras.main.shake(200, 0.01); heroShake(this, this.hero);
      if (this.lives <= 0) { this.time.delayedCall(500, () => this.scene.start('LoseScene', { score: gameScore })); }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION B: Ruler Race — TRULY INTRINSIC REBUILD
//
// Teaches: Length measurement as alignment of two endpoints with a ruler.
//
// Setup: A horizontal ruler lies across the stage with tick-marks (1 unit
// per tick). A colored object-bar lies ABOVE the ruler with its left edge
// fixed at 0. A draggable MEASUREMENT LINE sits on top with both endpoints
// draggable. As the player drags, a live readout shows the line's current
// length in ruler units.
//
// Player's tools: Drag either endpoint of the measurement line. That's it.
//
// Self-revealing truth: when the measurement line spans from the object's
// left edge to its right edge exactly, it locks and glows. The LENGTH
// is what the ruler reads — the player discovers the measurement, never
// types it.
// ═══════════════════════════════════════════════════════════════════════════════
class RulerRaceScene extends Phaser.Scene {
  constructor() { super('RulerRaceScene'); }

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
    this.mathLbl = this.add.text(this.W/2, 16, '', {
      fontSize: '14px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5, 0).setDepth(10);
    this.targetLbl = this.add.text(this.W/2, 40, '', {
      fontSize: '24px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(10);
  }

  _rh() {
    this.hg.clear(true, true);
    for (let i = 0; i < this.lives; i++) {
      this.hg.add(this.add.text(14 + i*22, 14, '♥', { fontSize: '18px', color: COL_DANGER }).setDepth(10));
    }
  }
  _rd() {
    this.dg.clear(true, true);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      const col = i < this.round ? COL_ACCENT : (i === this.round ? COL_PRIMARY : '#555555');
      this.dg.add(this.add.circle(this.W/2 - 40 + i*20, this.H - 16, 5, hexToNum(col)).setDepth(10));
    }
  }

  startRound() {
    if (this.rg) this.rg.clear(true, true);
    this.rg = this.add.group();
    this._rd();
    this.locked = false;

    const data = getRound(this.round);
    // Target length — from AI round target, then items[0], then fallback
    let targetLen = null;
    if (typeof data.target === 'number' && data.target > 0) targetLen = data.target;
    else if (Array.isArray(data.items) && typeof data.items[0] === 'number' && data.items[0] > 0) targetLen = data.items[0];
    if (typeof targetLen !== 'number' || isNaN(targetLen) || targetLen <= 0) {
      const fallbacks = [5, 7, 4, 9, 6];
      targetLen = fallbacks[this.round % fallbacks.length];
    }
    targetLen = Math.max(1, Math.min(15, Math.round(targetLen)));
    this.targetLen = targetLen;
    const unit = this.round < 3 ? 'cm' : 'mm';
    this.unit = unit;

    this.mathLbl.setText('Measure the object in ' + unit + ':');
    this.targetLbl.setText('Target: ' + targetLen + ' ' + unit);

    const W = this.W, H = this.H;
    // Ruler spans enough units that target fits with slack
    const rulerUnits = Math.max(12, targetLen + 4);
    this.rulerUnits = rulerUnits;

    const rulerLeft = W * 0.08;
    const rulerRight = W * 0.72;
    const rulerY = H * 0.58;
    this.rulerLeft = rulerLeft; this.rulerRight = rulerRight; this.rulerY = rulerY;
    this.pxPerUnit = (rulerRight - rulerLeft) / rulerUnits;

    // Object bar (what we're measuring) — sits above the ruler, fixed from 0..targetLen
    const objY = rulerY - 44;
    const objW = targetLen * this.pxPerUnit;
    this.rg.add(this.add.rectangle(rulerLeft, objY, objW, 28, hexToNum(COL_SECONDARY), 0.6)
      .setOrigin(0, 0.5).setStrokeStyle(2, hexToNum(COL_TEXT), 0.5).setDepth(5));
    this.rg.add(this.add.text(rulerLeft + objW/2, objY, 'Measure me!', {
      fontSize: '12px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5).setDepth(6));

    // Ruler base
    const rg = this.add.graphics().setDepth(4);
    this.rg.add(rg);
    rg.lineStyle(3, hexToNum(COL_TEXT), 0.6);
    rg.beginPath();
    rg.moveTo(rulerLeft, rulerY);
    rg.lineTo(rulerRight, rulerY);
    rg.strokePath();
    for (let i = 0; i <= rulerUnits; i++) {
      const x = rulerLeft + i * this.pxPerUnit;
      const h = (i % 5 === 0) ? 14 : 8;
      rg.lineStyle(2, hexToNum(COL_TEXT), 0.7);
      rg.beginPath();
      rg.moveTo(x, rulerY);
      rg.lineTo(x, rulerY + h);
      rg.strokePath();
      if (i % 5 === 0 || rulerUnits <= 14) {
        this.rg.add(this.add.text(x, rulerY + 20, String(i), {
          fontSize: '10px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
        }).setOrigin(0.5, 0).setDepth(5));
      }
    }
    this.rg.add(this.add.text(rulerRight + 12, rulerY, unit, {
      fontSize: '12px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0, 0.5).setDepth(5));

    // Measurement line — starts at 2..5 (some non-zero position)
    this.leftUnit = 0;
    this.rightUnit = Math.min(3, targetLen);

    const lineY = rulerY - 18;
    this.lineY = lineY;
    this.measurementLine = this.add.rectangle(
      rulerLeft + this.leftUnit * this.pxPerUnit,
      lineY,
      (this.rightUnit - this.leftUnit) * this.pxPerUnit,
      6,
      hexToNum(COL_PRIMARY), 1
    ).setOrigin(0, 0.5).setDepth(7);
    this.rg.add(this.measurementLine);

    // Endpoints — draggable
    this.leftEndpoint = this.add.circle(
      rulerLeft + this.leftUnit * this.pxPerUnit, lineY, 12,
      hexToNum(COL_ACCENT), 1
    ).setStrokeStyle(2, 0xffffff, 0.9).setDepth(11)
      .setInteractive({ useHandCursor: true, draggable: true });
    this.rightEndpoint = this.add.circle(
      rulerLeft + this.rightUnit * this.pxPerUnit, lineY, 12,
      hexToNum(COL_ACCENT), 1
    ).setStrokeStyle(2, 0xffffff, 0.9).setDepth(11)
      .setInteractive({ useHandCursor: true, draggable: true });
    this.rg.add(this.leftEndpoint);
    this.rg.add(this.rightEndpoint);

    // Live readout
    this.liveLbl = this.add.text(this.W/2, lineY - 26, '', {
      fontSize: '16px', color: COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5, 1).setDepth(10);
    this.rg.add(this.liveLbl);
    this._updateLive();

    this.rg.add(this.add.text(this.W/2, this.H - 44, 'Drag the endpoints to span the object', {
      fontSize: '11px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5, 1).setDepth(10));

    this.input.off('drag', this._onDrag, this);
    this.input.on('drag', this._onDrag, this);
  }

  _onDrag(pointer, obj, dragX, dragY) {
    if (this.locked) return;
    const rawUnit = Math.round((dragX - this.rulerLeft) / this.pxPerUnit);
    const clamped = Math.max(0, Math.min(this.rulerUnits, rawUnit));
    if (obj === this.leftEndpoint) {
      if (clamped >= this.rightUnit) return;
      this.leftUnit = clamped;
    } else if (obj === this.rightEndpoint) {
      if (clamped <= this.leftUnit) return;
      this.rightUnit = clamped;
    } else {
      return;
    }
    const lx = this.rulerLeft + this.leftUnit * this.pxPerUnit;
    const rx = this.rulerLeft + this.rightUnit * this.pxPerUnit;
    this.leftEndpoint.x = lx;
    this.rightEndpoint.x = rx;
    this.measurementLine.x = lx;
    this.measurementLine.width = Math.max(2, rx - lx);
    this._updateLive();
    this._checkMatch();
  }

  _updateLive() {
    const len = this.rightUnit - this.leftUnit;
    this.liveLbl.setText('Length: ' + len + ' ' + this.unit);
    // Align live label above the middle of the line
    const mx = this.rulerLeft + ((this.leftUnit + this.rightUnit) / 2) * this.pxPerUnit;
    this.liveLbl.x = mx;
    const match = (this.leftUnit === 0 && this.rightUnit === this.targetLen);
    this.liveLbl.setColor(match ? COL_ACCENT : COL_PRIMARY);
    this.measurementLine.fillColor = match ? hexToNum(COL_ACCENT) : hexToNum(COL_PRIMARY);
  }

  _checkMatch() {
    if (this.leftUnit === 0 && this.rightUnit === this.targetLen) {
      this._onSolved();
    }
  }

  _onSolved() {
    if (this.locked) return;
    this.locked = true;
    gameScore += 10 * (this.round + 1);
    this.scoreLbl.setText('Score: ' + gameScore);
    this.cameras.main.flash(200, 34, 197, 94);
    heroCheer(this, this.hero);
    const lines = [
      'The object measures',
      this.targetLen + ' ' + this.unit,
      'From 0 to ' + this.targetLen + ' on the ruler'
    ];
    this.time.delayedCall(400, () => {
      showSolutionCard(this, lines, () => {
        this.round++;
        if (this.round >= TOTAL_ROUNDS) {
          this.scene.start('VictoryScene', { score: gameScore });
        } else {
          this.startRound();
        }
      });
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION C: Unit Converter — practice-only drill (kept as-is)
// ═══════════════════════════════════════════════════════════════════════════════
class UnitConverterScene extends Phaser.Scene {
  constructor() { super('UnitConverterScene'); }

  create() {
    this.W = this.scale.width; this.H = this.scale.height;
    this.round = 0; this.lives = MAX_LIVES;
    this._buildBackground(); this._buildUI(); this.hero = addCharacter(this, this.W * 0.85, this.H * 0.35, 0.4); this.startRound();
  }

  _buildBackground() { const bg = this.add.image(this.W / 2, this.H / 2, 'bg'); bg.setScale(Math.max(this.W / bg.width, this.H / bg.height)); this.add.rectangle(this.W / 2, this.H / 2, this.W, this.H, 0x000000, 0.65); }
  _buildUI() { const W = this.W, pad = 14; this.scoreLbl = this.add.text(W - pad, pad, 'Score: 0', { fontSize: '16px', color: COL_ACCENT, fontFamily: "'Lexend', system-ui", fontStyle: 'bold' }).setOrigin(1, 0).setDepth(10); this.heartsGroup = this.add.group(); this._redrawHearts(); this.dotGroup = this.add.group(); this._redrawDots(); }
  _redrawHearts() { this.heartsGroup.clear(true, true); for (let i = 0; i < this.lives; i++) { this.heartsGroup.add(this.add.text(14 + i * 22, 14, '♥', { fontSize: '18px', color: COL_DANGER }).setDepth(10)); } }
  _redrawDots() { this.dotGroup.clear(true, true); for (let i = 0; i < TOTAL_ROUNDS; i++) { const col = i < this.round ? COL_ACCENT : (i === this.round ? COL_PRIMARY : '#555555'); this.dotGroup.add(this.add.circle(this.W / 2 - 40 + i * 20, this.H - 16, 5, hexToNum(col)).setDepth(10)); } }

  startRound() {
    if (this.roundGroup) this.roundGroup.clear(true, true);
    this.roundGroup = this.add.group();
    const data = getRound(this.round);
    this.correctAnswer = data.target;
    data.value = data.items[0] || 100;
    data.fromUnit = data.items[1] || 'cm';
    data.toUnit = data.items[2] || 'm';
    data.factor = data.items[3] || 100;
    data.answer = data.target;
    this._redrawDots();
    const W = this.W, H = this.H;
    this.roundGroup.add(this.add.text(W / 2, H * 0.2, 'Convert:', { fontSize: '14px', color: COL_TEXT, fontFamily: "'Lexend', system-ui" }).setOrigin(0.5).setDepth(6));
    this.roundGroup.add(this.add.text(W / 2, H * 0.3, data.value + ' ' + data.fromUnit, {
      fontSize: '36px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6));
    this.roundGroup.add(this.add.text(W / 2, H * 0.4, '= ? ' + data.toUnit, {
      fontSize: '24px', color: COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6));
    this.roundGroup.add(this.add.text(W / 2, H * 0.5, '1 ' + data.toUnit + ' = ' + data.factor + ' ' + data.fromUnit, {
      fontSize: '13px', color: COL_TEXT, fontFamily: "'Lexend', system-ui", alpha: 0.5
    }).setOrigin(0.5).setDepth(6));
    this.inputText = '';
    this.inputLbl = this.add.text(W / 2, H * 0.6, '_ ' + data.toUnit, { fontSize: '28px', color: COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold' }).setOrigin(0.5).setDepth(10);
    this.roundGroup.add(this.inputLbl);
    for (let i = 0; i <= 9; i++) {
      const col = i < 5 ? i : i - 5; const row = i < 5 ? 0 : 1;
      const x = W / 2 - 100 + col * 50; const y = H * 0.72 + row * 44;
      const btn = this.add.rectangle(x, y, 40, 36, hexToNum(COL_SECONDARY), 0.4).setInteractive({ useHandCursor: true }).setDepth(10);
      this.add.text(x, y, String(i), { fontSize: '18px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold' }).setOrigin(0.5).setDepth(11);
      btn.on('pointerdown', () => { if (this.inputText.length < 5) { this.inputText += String(i); this.inputLbl.setText(this.inputText + ' ' + data.toUnit); } });
      this.roundGroup.add(btn);
    }
    const sub = this.add.rectangle(W / 2, H * 0.72 + 100, 120, 38, hexToNum(COL_PRIMARY), 1).setInteractive({ useHandCursor: true }).setDepth(10);
    this.add.text(W / 2, H * 0.72 + 100, 'Convert!', { fontSize: '14px', color: '#fff', fontFamily: "'Lexend', system-ui", fontStyle: 'bold' }).setOrigin(0.5).setDepth(11);
    sub.on('pointerdown', () => this._check());
    this.roundGroup.add(sub);
  }

  _check() {
    if (parseInt(this.inputText) === this.correctAnswer) {
      gameScore += 10 * (this.round + 1); this.scoreLbl.setText('Score: ' + gameScore);
      this.cameras.main.flash(200, 34, 197, 94); heroCheer(this, this.hero); this.round++;
      if (this.round >= TOTAL_ROUNDS) { this.time.delayedCall(600, () => this.scene.start('VictoryScene', { score: gameScore })); }
      else { this.time.delayedCall(800, () => this.startRound()); }
    } else {
      this.lives--; this._redrawHearts(); this.cameras.main.shake(200, 0.01); heroShake(this, this.hero); this.inputText = ''; this.inputLbl.setText('_');
      if (this.lives <= 0) { this.time.delayedCall(500, () => this.scene.start('LoseScene', { score: gameScore })); }
    }
  }
}
`
