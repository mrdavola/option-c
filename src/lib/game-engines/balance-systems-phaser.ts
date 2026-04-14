// Balance & Equalize — Phaser engine with 3 game options.
// Math: Keep both sides equal — solving equations by balancing.
// Options: free-balance, mystery-side, chain-scales

import type { ThemeConfig, MathParams, GameOption } from "./engine-types"
import { phaserGame } from "./base-phaser-template"
import { getOptionDef } from "./game-option-registry"

export function balanceSystemsPhaserEngine(
  config: ThemeConfig,
  math: MathParams,
  option: GameOption = "free-balance"
): string {
  const validOptions = ["free-balance", "mystery-side", "chain-scales"]
  const activeOption = validOptions.includes(option) ? option : "free-balance"

  const optDef = getOptionDef(activeOption)

  const sceneMap: Record<string, string> = {
    "free-balance": "FreeBalanceScene",
    "mystery-side": "MysterySideScene",
    "chain-scales": "ChainScalesScene",
  }

  return phaserGame({
    config,
    math,
    option: activeOption,
    sceneName: sceneMap[activeOption],
    introText: optDef?.introText || "Balance the scale!",
    helpText: optDef?.helpText || "Make both sides equal.",
    gameSceneCode: GAME_SCENES,
  })
}

const GAME_SCENES = `
// ─── Shared: Round Generation ────────────────────────────────────────────────
function generateBalanceRound(round) {
  if (AI_ROUNDS && AI_ROUNDS[round]) {
    const r = AI_ROUNDS[round];
    return {
      prompt: r.prompt || "Balance the scale!",
      leftValue: r.target,
      weights: r.items.slice(),
      hint: r.hint || null
    };
  }
  let maxVal, weightCount;
  if (round < 2)      { maxVal = 12; weightCount = 5; }
  else if (round < 4) { maxVal = 20; weightCount = 6; }
  else                { maxVal = 30; weightCount = 7; }

  const leftValue = Math.floor(Math.random() * (maxVal - 4)) + 5;
  const weights = [];
  // Ensure at least one valid combination that sums to leftValue (2-3 weights)
  // Force at least 2 weights so no single weight = target
  const a = Math.floor(Math.random() * Math.floor(leftValue / 2)) + 1;
  const remainder = leftValue - a;
  if (remainder > maxVal * 0.7 && remainder > 3) {
    // Split remainder further so no single weight is too close to target
    const b = Math.floor(Math.random() * (remainder - 1)) + 1;
    weights.push(a, b, remainder - b);
  } else {
    weights.push(a, remainder);
  }
  // Add distractors — never equal to leftValue, never equal to any existing weight
  const usedValues = new Set(weights);
  usedValues.add(leftValue);
  while (weights.length < weightCount) {
    const v = Math.floor(Math.random() * maxVal) + 1;
    if (!usedValues.has(v)) { weights.push(v); usedValues.add(v); }
  }
  // Shuffle
  for (let i = weights.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [weights[i], weights[j]] = [weights[j], weights[i]];
  }
  return { prompt: "Balance the scale!", leftValue, weights, hint: null };
}

function generateMysteryRound(round) {
  let maxVal;
  if (round < 2)      { maxVal = 15; }
  else if (round < 4) { maxVal = 25; }
  else                { maxVal = 40; }
  const mystery = Math.floor(Math.random() * maxVal) + 3;
  return { mystery, hint: "Add up what you can see on the other side." };
}

function generateChainRound(round) {
  let maxVal;
  if (round < 2)      { maxVal = 10; }
  else if (round < 4) { maxVal = 18; }
  else                { maxVal = 25; }
  const values = [
    Math.floor(Math.random() * maxVal) + 3,
    Math.floor(Math.random() * maxVal) + 3,
    Math.floor(Math.random() * maxVal) + 3,
  ];
  return { values };
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION A: Free Balance — INTRINSIC REBUILD
//
// Left pan is pre-filled with a MYSTERY TOTAL, visualized as a tall stack of
// unknown-shaped blocks (heights, no numbers). Right pan is empty. Player
// drags weights (visible as VARIED HEIGHTS — shorter = lighter, taller =
// heavier, no numeric labels on the weights themselves) onto the right pan.
//
// The scale BEAM TILTS continuously based on the weight difference. Player's
// job: keep adding/removing weights until the beam is level. When the beam
// locks horizontal (sides balance), the left side OPENS and reveals what the
// mystery total was, along with the decomposition of what the player placed.
//
// Overshoot (right > left) tilts the beam to the right = visibly wrong (and
// reversible by removing). No Check button. No typed answers. Balance IS the
// answer. Discovery: player learns that summing heights = the mystery weight.
// Self-revealing truth: beam-level physical state = correctness signal.
// ═══════════════════════════════════════════════════════════════════════════════
class FreeBalanceScene extends Phaser.Scene {
  constructor() { super('FreeBalanceScene'); }

  create() {
    this.W = this.scale.width;
    this.H = this.scale.height;
    this.round = 0;
    this.lives = MAX_LIVES;
    this.rightTotal = 0;
    this.placedWeights = []; // ordered list of placed values

    this._buildBackground();
    this._buildUI();
    this._buildScale();
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
    this.heartsGroup = this.add.group();
    this._redrawHearts();
    this.dotGroup = this.add.group();
    this._redrawDots();
    this.equationLbl = this.add.text(W / 2, 40, '', {
      fontSize: '18px', color: COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(10);
    this.promptLbl = this.add.text(W / 2, 66, 'Add weights to the right pan until the beam is level', {
      fontSize: '12px', color: COL_TEXT, fontFamily: "'Lexend', system-ui", alpha: 0.8,
      align: 'center', wordWrap: { width: W - 40 }
    }).setOrigin(0.5, 0).setDepth(10);
  }

  _redrawHearts() {
    this.heartsGroup.clear(true, true);
    for (let i = 0; i < MAX_LIVES; i++) {
      const col = i < this.lives ? COL_DANGER : '#444';
      this.heartsGroup.add(
        this.add.text(14 + i * 22, 14, '♥', { fontSize: '18px', color: col }).setDepth(10)
      );
    }
  }

  _redrawDots() {
    this.dotGroup.clear(true, true);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      const col = i < this.round ? COL_ACCENT : (i === this.round ? COL_PRIMARY : '#555555');
      this.dotGroup.add(
        this.add.circle(this.W / 2 - 40 + i * 20, this.H - 14, 5, hexToNum(col)).setDepth(10)
      );
    }
  }

  _buildScale() {
    const W = this.W, H = this.H;
    const centerX = W / 2, pivotY = H * 0.34;
    // Fulcrum
    this.add.rectangle(centerX, pivotY + 60, 14, 120, hexToNum(COL_SECONDARY), 1).setDepth(3);
    this.add.triangle(centerX, pivotY + 30, 0, 30, 20, 0, 40, 30, hexToNum(COL_SECONDARY), 1).setDepth(4);
    this.add.rectangle(centerX, pivotY + 120, 160, 14, hexToNum(COL_SECONDARY), 1).setDepth(3);
    // Beam container — rotates based on weight difference
    this.beamContainer = this.add.container(centerX, pivotY).setDepth(5);
    const beamLen = W * 0.58;
    const beam = this.add.rectangle(0, 0, beamLen, 8, hexToNum(COL_TEXT), 1);
    this.beamContainer.add(beam);
    const panOffset = beamLen * 0.45;
    this.leftPanX = -panOffset; this.rightPanX = panOffset;
    this.leftPan = this.add.rectangle(this.leftPanX, 36, 130, 8, hexToNum(COL_PRIMARY), 1);
    this.rightPan = this.add.rectangle(this.rightPanX, 36, 130, 8, hexToNum(COL_ACCENT), 1);
    this.leftChain = this.add.line(0, 0, this.leftPanX, 4, this.leftPanX, 32, hexToNum(COL_TEXT)).setLineWidth(1);
    this.rightChain = this.add.line(0, 0, this.rightPanX, 4, this.rightPanX, 32, hexToNum(COL_TEXT)).setLineWidth(1);
    this.beamContainer.add([this.leftChain, this.rightChain, this.leftPan, this.rightPan]);
    // Level indicator markers (horizontal tick lines flanking the beam)
    this.add.line(0, 0, centerX - beamLen * 0.55, pivotY, centerX - beamLen * 0.5, pivotY, hexToNum(COL_ACCENT), 0.5).setLineWidth(1).setDepth(2);
    this.add.line(0, 0, centerX + beamLen * 0.5, pivotY, centerX + beamLen * 0.55, pivotY, hexToNum(COL_ACCENT), 0.5).setLineWidth(1).setDepth(2);
  }

  _drawLeftMystery() {
    // Clear previous
    if (this._leftVisuals) this._leftVisuals.forEach(o => o.destroy());
    this._leftVisuals = [];
    // Draw a single mystery block on the left pan — HEIGHT proportional to
    // target so the child sees "this is how much it weighs" visually.
    const h = Math.max(22, Math.min(90, this.currentLeft * 4));
    const box = this.add.rectangle(this.leftPanX, 36 - h / 2 - 4, 40, h, hexToNum(COL_PRIMARY), 0.8)
      .setStrokeStyle(2, hexToNum(COL_ACCENT)).setDepth(7);
    this.beamContainer.add(box);
    this._leftVisuals.push(box);
    const q = this.add.text(this.leftPanX, 36 - h / 2 - 4, '?', {
      fontSize: '22px', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(8);
    this.beamContainer.add(q);
    this._leftVisuals.push(q);
  }

  _drawRightStack() {
    if (this._rightVisuals) this._rightVisuals.forEach(o => o.destroy());
    this._rightVisuals = [];
    let stackY = 36 - 4;
    this.placedWeights.forEach(val => {
      const h = Math.max(10, Math.min(50, val * 4));
      stackY -= h;
      const r = this.add.rectangle(this.rightPanX, stackY + h / 2, 36, h, hexToNum(COL_ACCENT), 0.9)
        .setStrokeStyle(1, hexToNum(COL_TEXT), 0.6).setDepth(7);
      this.beamContainer.add(r);
      this._rightVisuals.push(r);
    });
  }

  _updateBeamTilt() {
    // angle = diff / scale, capped
    const diff = this.rightTotal - this.currentLeft;
    const angle = Math.max(-0.18, Math.min(0.18, diff * 0.02));
    this.beamContainer.setRotation(angle);
  }

  _handleWeightClick(val, bg, lbl) {
    if (this.solutionCard) return;
    const idx = bg._placedIdx;
    if (idx == null || idx < 0) {
      // Place it
      this.rightTotal += val;
      this.placedWeights.push(val);
      bg._placedIdx = this.placedWeights.length - 1;
      bg.setFillStyle(hexToNum(COL_PRIMARY), 0.7);
      if (lbl) lbl.setColor(COL_PRIMARY);
    } else {
      // Remove it
      this.placedWeights.splice(idx, 1);
      this.rightTotal -= val;
      bg._placedIdx = null;
      bg.setFillStyle(hexToNum(COL_SECONDARY), 0.3);
      if (lbl) lbl.setColor(COL_TEXT);
      // Re-index remaining placed weights
      let k = 0;
      this._weightBtns.forEach(w => { if (w.bg._placedIdx != null) w.bg._placedIdx = k++; });
    }
    this._drawRightStack();
    this._updateBeamTilt();
    this._checkBalance();
  }

  _checkBalance() {
    if (this.solutionCard) return;
    if (this.rightTotal === this.currentLeft && this.placedWeights.length > 0) {
      heroCheer(this, this.hero);
      this.cameras.main.flash(140, 34, 197, 94);
      gameScore += 10 * (this.round + 1);
      this.scoreLbl.setText('Score: ' + gameScore);
      // Reveal left mystery: replace "?" with the number
      if (this._leftVisuals && this._leftVisuals[1] && this._leftVisuals[1].setText) {
        this._leftVisuals[1].setText(String(this.currentLeft)).setColor(COL_ACCENT);
      }
      const eq = this.placedWeights.join(' + ') + ' = ' + this.currentLeft;
      this._showSolutionCard([
        'The mystery weight was:  ' + this.currentLeft,
        'You placed:  ' + eq,
        'Balance achieved!',
      ]);
    }
    // Over: just keep showing tilt; child reverses by clicking again
  }

  _showSolutionCard(lines) {
    if (this.solutionCard) return;
    const W = this.W, H = this.H;
    const backdrop = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.55).setDepth(50);
    const card = this.add.rectangle(W/2, H * 0.55, W - 40, 240, 0x18181b, 1)
      .setStrokeStyle(2, hexToNum(COL_ACCENT)).setDepth(51);
    const h1 = this.add.text(W/2, H * 0.55 - 95, 'You balanced it!', {
      fontSize: '22px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(52);
    const textObjs = [];
    lines.forEach((line, i) => {
      const t = this.add.text(W/2, H * 0.55 - 55 + i * 30, line, {
        fontSize: i === 0 ? '18px' : '15px',
        color: i === 0 ? COL_ACCENT : COL_TEXT,
        fontFamily: "'Space Grotesk', sans-serif",
        fontStyle: i === 0 ? 'bold' : 'normal',
        align: 'center'
      }).setOrigin(0.5).setDepth(52).setAlpha(0);
      textObjs.push(t);
      this.time.delayedCall(180 * i, () => this.tweens.add({ targets: t, alpha: 1, duration: 280 }));
    });
    const nextY = H * 0.55 + 90;
    const isLast = this.round + 1 >= TOTAL_ROUNDS;
    const nextBg = this.add.rectangle(W/2, nextY, 210, 42, hexToNum(COL_ACCENT), 1)
      .setInteractive({ useHandCursor: true }).setDepth(52).setAlpha(0);
    const nextLbl = this.add.text(W/2, nextY, isLast ? 'Finish!' : 'Got it! Next round →', {
      fontSize: '14px', color: '#000', fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(53).setAlpha(0);
    this.time.delayedCall(180 * lines.length + 160, () => {
      this.tweens.add({ targets: [nextBg, nextLbl], alpha: 1, duration: 280 });
    });
    const cleanup = () => {
      [backdrop, card, h1, ...textObjs, nextBg, nextLbl].forEach(o => o && o.destroy());
      this.solutionCard = null;
      this.round++;
      if (this.round >= TOTAL_ROUNDS) {
        this.scene.start('VictoryScene', { score: gameScore });
      } else {
        this.startRound();
      }
    };
    nextBg.on('pointerdown', cleanup);
    this.solutionCard = { destroy: cleanup };
  }

  startRound() {
    const data = getRound(this.round);
    const roundVariation = [
      { target: 8,  items: [3, 5, 2, 4, 6] },
      { target: 11, items: [4, 7, 3, 5, 8] },
      { target: 14, items: [6, 8, 4, 5, 9] },
      { target: 17, items: [8, 9, 5, 7, 10] },
      { target: 20, items: [9, 11, 6, 8, 12] },
    ];
    const isDefault = !data || data.prompt === 'Solve this!' ||
      (Array.isArray(data.items) && data.items.length === 6 &&
       data.items[0] === 10 && data.items[1] === 5 && data.items[2] === 8);
    const fb = roundVariation[this.round % roundVariation.length];
    this.currentLeft = isDefault ? fb.target : (data.target && data.target > 1 ? data.target : fb.target);
    const items = isDefault ? fb.items.slice() : (Array.isArray(data.items) && data.items.length ? data.items.slice() : fb.items.slice());

    // Reset
    this.rightTotal = 0;
    this.placedWeights = [];
    this.equationLbl.setText('Mystery weight: ?  (find it by balancing)');
    this._redrawDots();
    this._drawLeftMystery();
    this._drawRightStack();
    this._updateBeamTilt();

    // Clear old weight buttons
    if (this._weightBtns) this._weightBtns.forEach(w => { w.bg.destroy(); w.lbl.destroy(); w.tick.destroy(); });
    this._weightBtns = [];
    // Build weight buttons — SHOW SIZE VISUALLY (height = weight) plus a small numeric label
    const bankY = this.H * 0.78;
    const n = items.length;
    const gap = Math.min(80, (this.W - 40) / n);
    const startX = this.W / 2 - ((n - 1) * gap) / 2;
    items.forEach((val, i) => {
      const x = startX + i * gap;
      const h = Math.max(22, Math.min(60, val * 4));
      const bg = this.add.rectangle(x, bankY, 48, h, hexToNum(COL_SECONDARY), 0.3)
        .setStrokeStyle(2, hexToNum(COL_TEXT), 0.6).setDepth(7)
        .setInteractive({ useHandCursor: true });
      const lbl = this.add.text(x, bankY + h / 2 + 10, String(val), {
        fontSize: '13px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0.5, 0).setDepth(8);
      const tick = this.add.text(x, bankY, '', {
        fontSize: '14px', color: COL_PRIMARY, fontFamily: 'system-ui'
      }).setOrigin(0.5).setDepth(9);
      bg._placedIdx = null;
      bg.on('pointerdown', () => this._handleWeightClick(val, bg, lbl));
      this._weightBtns.push({ bg, lbl, tick });
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION B: Mystery Side — one side hidden, figure out its value
// ═══════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════
// MysterySideScene — TRULY INTRINSIC REDESIGN v2 (April 13, night)
//
// Teaches: x + p = q by inverse operations (the ACTUAL skill in 6.EE.B.7).
//
// Setup: The scale is ALREADY BALANCED. Left pan has a mystery box (x) +
// some known blocks (p). Right pan has known blocks (q). Equation shown.
//
// Player's tools: "Remove N from both sides" button. They can also UNDO.
// The only action that makes sense: strip away matching blocks from both
// sides simultaneously to isolate the mystery box. When the left side
// shows ONLY the box, the right side displays the answer.
//
// This IS algebra: the player DOES the inverse operation. They don't count.
// They discover that "what you do to one side, do to the other, until x
// is alone."
// Self-revealing truth: scale stays balanced throughout (teaching invariant).
//                       When left shows only the box, the box IS the answer.
// ═══════════════════════════════════════════════════════════════════════════════
class MysterySideScene extends Phaser.Scene {
  constructor() { super('MysterySideScene'); }

  create() {
    this.W = this.scale.width;
    this.H = this.scale.height;
    this.round = 0;
    this.lives = MAX_LIVES;
    this._buildBackground();
    this._buildUI();
    this._buildScale();
    this._buildControls();
    // Hero in bottom-right corner, clearly sized, watching the scale work.
    // Scale 0.8 for good visibility at a glance.
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
    this.heartsGroup = this.add.group();
    this._redrawHearts();
    this.dotGroup = this.add.group();
    this._redrawDots();
    // Equation display — what we're solving (e.g. "x + 3 = 10")
    this.equationLbl = this.add.text(W / 2, 44, '', {
      fontSize: '22px', color: COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(10);
    // Instruction
    this.promptLbl = this.add.text(W / 2, 76, '', {
      fontSize: '13px', color: COL_TEXT, fontFamily: "'Lexend', system-ui",
      wordWrap: { width: W - 60 }, align: 'center'
    }).setOrigin(0.5, 0).setDepth(10);
    this.statusLbl = this.add.text(W / 2, this.H * 0.65, '', {
      fontSize: '15px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold',
      align: 'center', wordWrap: { width: W - 40 }
    }).setOrigin(0.5).setDepth(10);
  }

  _redrawHearts() {
    this.heartsGroup.clear(true, true);
    for (let i = 0; i < this.lives; i++) {
      this.heartsGroup.add(
        this.add.text(14 + i * 22, 14, '♥', { fontSize: '18px', color: COL_DANGER }).setDepth(10)
      );
    }
  }

  _redrawDots() {
    this.dotGroup.clear(true, true);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      const col = i < this.round ? COL_ACCENT : (i === this.round ? COL_PRIMARY : '#555555');
      this.dotGroup.add(
        this.add.circle(this.W / 2 - 40 + i * 20, this.H - 16, 5, hexToNum(col)).setDepth(10)
      );
    }
  }

  _buildScale() {
    const W = this.W, H = this.H;
    const centerX = W / 2, pivotY = H * 0.38;
    // Fulcrum
    this.add.rectangle(centerX, pivotY + 60, 14, 120, hexToNum(COL_SECONDARY), 1).setDepth(3);
    this.add.triangle(centerX, pivotY + 30, 0, 30, 20, 0, 40, 30, hexToNum(COL_SECONDARY), 1).setDepth(4);
    this.add.rectangle(centerX, pivotY + 120, 160, 14, hexToNum(COL_SECONDARY), 1).setDepth(3);

    // Beam container — stays level because we always maintain equality
    this.beamContainer = this.add.container(centerX, pivotY).setDepth(5);
    const beamLen = W * 0.55;
    const beam = this.add.rectangle(0, 0, beamLen, 8, hexToNum(COL_TEXT), 1);
    this.beamContainer.add(beam);

    const panOffset = beamLen * 0.45;
    this.leftPanX = -panOffset; this.rightPanX = panOffset;

    this.leftPan = this.add.rectangle(this.leftPanX, 30, 130, 8, hexToNum(COL_PRIMARY), 1);
    this.rightPan = this.add.rectangle(this.rightPanX, 30, 130, 8, hexToNum(COL_ACCENT), 1);
    this.leftChain = this.add.line(0, 0, this.leftPanX, 4, this.leftPanX, 26, hexToNum(COL_TEXT)).setLineWidth(1);
    this.rightChain = this.add.line(0, 0, this.rightPanX, 4, this.rightPanX, 26, hexToNum(COL_TEXT)).setLineWidth(1);
    this.beamContainer.add([this.leftChain, this.rightChain, this.leftPan, this.rightPan]);

    // Side total labels (below each pan)
    this.leftTotalLbl = this.add.text(centerX + this.leftPanX, pivotY + 70, '', {
      fontSize: '14px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5).setDepth(7);
    this.rightTotalLbl = this.add.text(centerX + this.rightPanX, pivotY + 70, '', {
      fontSize: '14px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5).setDepth(7);
  }

  _buildControls() {
    // The player's ONLY tool: buttons to "remove N from both sides"
    // This enforces the algebraic invariant: whatever you do, you do to both sides.
    const W = this.W, H = this.H;
    const cy = H * 0.78;
    // Instruction above buttons
    this.add.text(W / 2, cy - 40, 'Remove the same from BOTH sides to isolate x:', {
      fontSize: '12px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5).setDepth(10);

    // Dynamic buttons: will show "-1 from both", "-2 from both", etc. based on what's on the left
    this.removeButtons = [];
    this._rebuildRemoveButtons();

    // Undo button (returns a removed block pair)
    this.undoBtn = this.add.rectangle(W / 2, cy + 60, 160, 36, hexToNum(COL_DANGER), 0.55)
      .setInteractive({ useHandCursor: true }).setDepth(10);
    this.undoLbl = this.add.text(W / 2, cy + 60, 'Undo Last', {
      fontSize: '13px', color: '#fff', fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);
    this.undoBtn.on('pointerdown', () => this._undo());
  }

  _rebuildRemoveButtons() {
    // Destroy previous
    this.removeButtons.forEach(b => { b.bg.destroy(); b.lbl.destroy(); });
    this.removeButtons = [];
    const W = this.W, cy = this.H * 0.78;
    // leftKnown = visible blocks on left pan (not the mystery box)
    const leftKnown = this.leftKnown;
    if (leftKnown <= 0) return;
    // Show up to 4 options: remove 1, 2, 3, or leftKnown
    const options = [];
    const optSet = new Set([1]);
    if (leftKnown >= 2) optSet.add(2);
    if (leftKnown >= 3) optSet.add(3);
    optSet.add(leftKnown); // remove all = one-shot
    [...optSet].sort((a,b)=>a-b).filter(n => n <= leftKnown).slice(0, 4).forEach(n => options.push(n));

    const btnW = 72, spacing = 14;
    const totalW = options.length * btnW + (options.length - 1) * spacing;
    const startX = W / 2 - totalW / 2 + btnW / 2;
    options.forEach((n, i) => {
      const x = startX + i * (btnW + spacing);
      const bg = this.add.rectangle(x, cy, btnW, 36, hexToNum(COL_PRIMARY), 1)
        .setInteractive({ useHandCursor: true }).setDepth(10);
      const lbl = this.add.text(x, cy, '−' + n, {
        fontSize: '16px', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(11);
      bg.on('pointerdown', () => this._removeFromBoth(n));
      this.removeButtons.push({ bg, lbl });
    });
  }

  _removeFromBoth(n) {
    // Can we? Left must have at least n known blocks. Right must have at least n blocks.
    if (n > this.leftKnown) {
      this._flash("Can't remove that many from the left side — not enough blocks there.");
      return;
    }
    if (n > this.rightTotal) {
      this._flash("Can't remove that many from the right side — not enough blocks there.");
      this.lives--;
      this._redrawHearts();
      heroShake(this, this.hero);
      this.cameras.main.shake(150, 0.006);
      if (this.lives <= 0) {
        this.time.delayedCall(700, () => this.scene.start('LoseScene', { score: gameScore }));
      }
      return;
    }
    this.history.push({ n });
    this.leftKnown -= n;
    this.rightTotal -= n;
    this._redrawScaleContents();
    this._rebuildRemoveButtons();
    this._checkSolved();
  }

  _undo() {
    const last = this.history.pop();
    if (!last) return;
    this.leftKnown += last.n;
    this.rightTotal += last.n;
    this._redrawScaleContents();
    this._rebuildRemoveButtons();
    this._checkSolved();
  }

  _checkSolved() {
    // SOLVED when left side has ONLY the mystery box (leftKnown === 0)
    if (this.leftKnown === 0) {
      // The value in the box equals what's on the right now.
      const x = this.rightTotal;
      const p = this.initialLeftKnown;
      const q = p + x;
      // Reveal inside the box
      this._revealBox(x);
      // Subtle celebration — not fireworks, just a clear acknowledgement
      this.cameras.main.flash(120, 34, 197, 94);
      heroCheer(this, this.hero);
      gameScore += 10 * (this.round + 1);
      this.scoreLbl.setText('Score: ' + gameScore);
      // Hide remove buttons (round is done)
      this.removeButtons.forEach(b => { b.bg.destroy(); b.lbl.destroy(); });
      this.removeButtons = [];
      if (this.undoBtn && this.undoBtn.setVisible) { this.undoBtn.setVisible(false); this.undoLbl.setVisible(false); }
      // Show the full algebra transformation (CPA abstract stage)
      this._showSolutionCard(x, p, q);
    } else {
      // Still working — update status to reflect current equation
      this.statusLbl.setText('Current: x + ' + this.leftKnown + ' = ' + this.rightTotal).setColor(COL_TEXT);
      this._updateEquationChain();
    }
  }

  _showSolutionCard(x, p, q) {
    // Dismiss any previous card
    if (this.solutionCard) this.solutionCard.destroy();
    const W = this.W, H = this.H;
    // Semi-transparent backdrop
    const backdrop = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.55).setDepth(50);
    const card = this.add.rectangle(W/2, H * 0.55, W - 40, 260, 0x18181b, 1)
      .setStrokeStyle(2, hexToNum(COL_ACCENT)).setDepth(51);
    // Headline
    const h1 = this.add.text(W/2, H * 0.55 - 105, 'You solved it!', {
      fontSize: '22px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(52);
    // Algebra written out, line by line (CPA abstract stage)
    const lines = [
      'Started with:  x + ' + p + ' = ' + q,
      'Removed ' + p + ' from both sides:',
      'x + ' + p + ' − ' + p + ' = ' + q + ' − ' + p,
      'x = ' + x,
    ];
    const textObjs = [];
    lines.forEach((line, i) => {
      const t = this.add.text(W/2, H * 0.55 - 60 + i * 28, line, {
        fontSize: i === lines.length - 1 ? '22px' : '15px',
        color: i === lines.length - 1 ? COL_ACCENT : COL_TEXT,
        fontFamily: "'Space Grotesk', sans-serif",
        fontStyle: i === lines.length - 1 ? 'bold' : 'normal'
      }).setOrigin(0.5).setDepth(52);
      t.setAlpha(0);
      textObjs.push(t);
      // Stagger appearance for readability
      this.time.delayedCall(200 * i, () => {
        this.tweens.add({ targets: t, alpha: 1, duration: 300 });
      });
    });
    // Next round button
    const nextY = H * 0.55 + 90;
    const nextBg = this.add.rectangle(W/2, nextY, 200, 44, hexToNum(COL_ACCENT), 1)
      .setInteractive({ useHandCursor: true }).setDepth(52);
    const nextLbl = this.add.text(W/2, nextY, this.round + 1 >= TOTAL_ROUNDS ? 'Finish!' : 'Got it! Next round →', {
      fontSize: '14px', color: '#000', fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(53);
    nextBg.setAlpha(0);
    nextLbl.setAlpha(0);
    this.time.delayedCall(200 * lines.length + 200, () => {
      this.tweens.add({ targets: [nextBg, nextLbl], alpha: 1, duration: 300 });
    });
    const cleanup = () => {
      [backdrop, card, h1, ...textObjs, nextBg, nextLbl].forEach(o => o.destroy());
      this.solutionCard = null;
      this.round++;
      if (this.round >= TOTAL_ROUNDS) {
        this.scene.start('VictoryScene', { score: gameScore });
      } else {
        // Restore undo button visibility for next round
        if (this.undoBtn && this.undoBtn.setVisible) { this.undoBtn.setVisible(true); this.undoLbl.setVisible(true); }
        this.startRound();
      }
    };
    nextBg.on('pointerdown', cleanup);
    // Track as an object
    this.solutionCard = { destroy: cleanup };
  }

  _updateEquationChain() {
    // Show the live equation "x + leftKnown = rightTotal" below the scale
    // so learners see the abstract representation alongside concrete action.
    this.statusLbl.setText('x + ' + this.leftKnown + ' = ' + this.rightTotal).setColor(COL_PRIMARY);
  }

  _revealBox(value) {
    // Show the answer inside the mystery box
    if (this.mysteryBoxLbl) {
      this.mysteryBoxLbl.setText(String(value));
      this.mysteryBoxLbl.setColor(COL_ACCENT);
    }
  }

  _flash(msg) {
    this.statusLbl.setText(msg).setColor(COL_DANGER);
  }

  _redrawScaleContents() {
    // Clear previous visuals
    if (this._leftVisuals) this._leftVisuals.forEach(r => r.destroy && r.destroy());
    if (this._rightVisuals) this._rightVisuals.forEach(r => r.destroy && r.destroy());
    this._leftVisuals = [];
    this._rightVisuals = [];

    // Left pan: MYSTERY BOX (always present) + leftKnown unit blocks
    // Mystery box: larger rectangle with "x" label
    const box = this.add.rectangle(this.leftPanX - 35, 8, 32, 36, hexToNum(COL_PRIMARY), 1)
      .setStrokeStyle(2, hexToNum(COL_ACCENT)).setDepth(7);
    this.beamContainer.add(box);
    this._leftVisuals.push(box);
    this.mysteryBoxLbl = this.add.text(this.leftPanX - 35, 8, 'x', {
      fontSize: '18px', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(8);
    this.beamContainer.add(this.mysteryBoxLbl);
    this._leftVisuals.push(this.mysteryBoxLbl);

    // leftKnown unit blocks to the right of the box
    for (let i = 0; i < this.leftKnown; i++) {
      const cx = this.leftPanX + 0 + ((i % 4) * 14);
      const cy = 22 - Math.floor(i / 4) * 14;
      const r = this.add.rectangle(cx, cy, 12, 12, hexToNum(COL_ACCENT), 1).setDepth(7);
      this.beamContainer.add(r);
      this._leftVisuals.push(r);
    }

    // Right pan: rightTotal unit blocks
    for (let i = 0; i < this.rightTotal; i++) {
      const cx = this.rightPanX - 28 + ((i % 5) * 14);
      const cy = 22 - Math.floor(i / 5) * 14;
      const r = this.add.rectangle(cx, cy, 12, 12, hexToNum(COL_ACCENT), 1).setDepth(7);
      this.beamContainer.add(r);
      this._rightVisuals.push(r);
    }

    // Update total labels
    this.leftTotalLbl.setText('x + ' + this.leftKnown);
    this.rightTotalLbl.setText(String(this.rightTotal));
  }

  startRound() {
    const data = getRound(this.round);
    // Per-round variation if AI didn't return varied rounds.
    const roundVariation = [
      { t: 10, p: 3 },   // x + 3 = 10 → x = 7
      { t: 12, p: 5 },   // x + 5 = 12 → x = 7
      { t: 15, p: 8 },   // x + 8 = 15 → x = 7
      { t: 20, p: 14 },  // x + 14 = 20 → x = 6
      { t: 18, p: 11 },  // x + 11 = 18 → x = 7
    ];
    // Detect if we got the default/empty-AI round (base template returns the same target=10 + default items).
    // Signal: prompt is "Solve this!" default OR items match the default [10,5,8,3,12,7].
    const isDefault = !data || data.prompt === 'Solve this!' ||
      (Array.isArray(data.items) && data.items.length === 6 &&
       data.items[0] === 10 && data.items[1] === 5 && data.items[2] === 8);
    const fallback = roundVariation[this.round % roundVariation.length];

    const target = isDefault ? fallback.t : (data.target && data.target > 1 ? data.target : fallback.t);
    // Pick p: small enough to be solvable (< target) but large enough to matter.
    let p;
    if (isDefault) {
      p = fallback.p;
    } else {
      p = Array.isArray(data.items) && data.items.length > 0
        ? Math.min(...data.items.filter(v => v > 0 && v < target))
        : fallback.p;
      if (!isFinite(p) || p <= 0 || p >= target) p = fallback.p;
    }
    const x = target - p;
    if (x <= 0) { p = Math.max(1, target - 2); }

    this.initialLeftKnown = p;
    this.leftKnown = p;
    this.rightTotal = target;
    this.history = [];

    // Equation display (top — the big "solve this" statement)
    this.equationLbl.setText('x + ' + p + ' = ' + target);
    this.promptLbl.setText('Remove the same amount from both sides until only x is left.');
    this.statusLbl.setText('x + ' + p + ' = ' + target).setColor(COL_PRIMARY);

    this._redrawDots();
    this._redrawScaleContents();
    this._rebuildRemoveButtons();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION C: Chain Scales — INTRINSIC REBUILD
//
// Three scales stacked vertically, domino-cascaded. Each scale is the SAME
// puzzle as MysterySideScene: "x + p = q, remove equal amounts from both
// sides to isolate x." But the twist: the VALUE OF x revealed by Scale 1
// becomes the RIGHT-SIDE TOTAL of Scale 2. Solving Scale 2 reveals x2,
// which becomes the right side of Scale 3.
//
// The scales are drawn at three y-positions simultaneously. Scale 1 is
// "active" first (bright + interactive). Scales 2 and 3 are dim, showing
// only "? = ?" placeholders. When Scale 1 solves, its x flows visually
// down to Scale 2's right pan (particle/tween) — THAT becomes the new q.
// Scale 2 activates; child repeats "remove equal from both sides." Cascade.
//
// Physical manipulation (−1, −2, −3, −all buttons). No typed answers.
// Auto-detect: leftKnown === 0 → solved → cascade. Solution card shown
// only after ALL 3 scales are solved (end of round). Intrinsic: the
// child sees that "the answer I found becomes the next problem's input" —
// equation-chaining made visceral.
// ═══════════════════════════════════════════════════════════════════════════════
class ChainScalesScene extends Phaser.Scene {
  constructor() { super('ChainScalesScene'); }

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
    this.heartsGroup = this.add.group();
    this._redrawHearts();
    this.dotGroup = this.add.group();
    this._redrawDots();
    this.promptLbl = this.add.text(W / 2, 14, 'Chain the scales — solve one, feed the next', {
      fontSize: '13px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5, 0).setDepth(10);
    this.statusLbl = this.add.text(W / 2, this.H * 0.62, '', {
      fontSize: '14px', color: COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold',
      align: 'center', wordWrap: { width: W - 40 }
    }).setOrigin(0.5).setDepth(10);
  }

  _redrawHearts() {
    this.heartsGroup.clear(true, true);
    for (let i = 0; i < MAX_LIVES; i++) {
      const col = i < this.lives ? COL_DANGER : '#444';
      this.heartsGroup.add(
        this.add.text(14 + i * 22, 14, '♥', { fontSize: '18px', color: col }).setDepth(10)
      );
    }
  }

  _redrawDots() {
    this.dotGroup.clear(true, true);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      const col = i < this.round ? COL_ACCENT : (i === this.round ? COL_PRIMARY : '#555555');
      this.dotGroup.add(
        this.add.circle(this.W / 2 - 40 + i * 20, this.H - 14, 5, hexToNum(col)).setDepth(10)
      );
    }
  }

  startRound() {
    const data = getRound(this.round);
    // Fallback: 3 chained equations. p values per scale.
    // Each scale: x_i + p_i = q_i; x_i becomes q_{i+1}.
    const roundVariation = [
      { q1: 10, ps: [3, 2, 1] },  // x1=7, then x2+2=7 → x2=5, then x3+1=5 → x3=4
      { q1: 12, ps: [5, 3, 2] },  // x1=7, x2=4, x3=2
      { q1: 15, ps: [6, 4, 3] },  // x1=9, x2=5, x3=2
      { q1: 18, ps: [8, 4, 3] },  // x1=10, x2=6, x3=3
      { q1: 20, ps: [9, 5, 4] },  // x1=11, x2=6, x3=2
    ];
    const isDefault = !data || data.prompt === 'Solve this!' ||
      (Array.isArray(data.items) && data.items.length === 6 &&
       data.items[0] === 10 && data.items[1] === 5 && data.items[2] === 8);
    const fb = roundVariation[this.round % roundVariation.length];

    let q1 = isDefault ? fb.q1 : (data.target && data.target > 3 ? data.target : fb.q1);
    let ps = fb.ps.slice();
    if (!isDefault && Array.isArray(data.items) && data.items.length >= 3) {
      // Use smallest positive items < q1 as p values
      const candidates = data.items.filter(v => v > 0 && v < q1).sort((a,b) => a - b);
      if (candidates.length >= 3) ps = candidates.slice(0, 3);
    }

    // Build chain values. If any x <= 0 or p >= q, fall back.
    const chain = [];
    let q = q1;
    for (let i = 0; i < 3; i++) {
      let p = ps[i];
      if (p <= 0 || p >= q) p = Math.max(1, q - 2);
      const x = q - p;
      if (x <= 0) { p = Math.max(1, q - 1); }
      const finalX = q - p;
      chain.push({ p, q, x: finalX });
      q = finalX;
    }
    this.chain = chain;
    this.activeIdx = 0;
    this.scaleStates = chain.map((c, i) => ({
      leftKnown: c.p,
      rightTotal: c.q,
      initialP: c.p,
      history: [],
      solved: false,
    }));

    // Clear previous visuals
    if (this._sceneGroup) this._sceneGroup.forEach(o => o && o.destroy && o.destroy());
    this._sceneGroup = [];
    if (this._scaleVisuals) this._scaleVisuals.forEach(sv => {
      sv.objs.forEach(o => o && o.destroy && o.destroy());
    });
    this._scaleVisuals = [null, null, null];
    if (this.removeButtons) this.removeButtons.forEach(b => { b.bg.destroy(); b.lbl.destroy(); });
    this.removeButtons = [];
    if (this.undoBtn) { this.undoBtn.destroy(); this.undoLbl.destroy(); this.undoBtn = null; }

    this._redrawDots();
    this._drawAllScales();
    this._buildControls();
    this._updateStatus();
  }

  _drawAllScales() {
    // Three scales arranged horizontally (compact) at upper portion of screen
    const W = this.W, H = this.H;
    const yCenters = [H * 0.22, H * 0.34, H * 0.46];
    for (let i = 0; i < 3; i++) {
      this._drawOneScale(i, W / 2, yCenters[i]);
    }
  }

  _drawOneScale(idx, centerX, centerY) {
    const state = this.scaleStates[idx];
    const c = this.chain[idx];
    const active = idx === this.activeIdx;
    const done = state.solved;
    const dim = !active && !done;
    const alpha = done ? 0.9 : (active ? 1 : 0.4);

    const beamLen = this.W * 0.42;
    const beam = this.add.rectangle(centerX, centerY, beamLen, 5, hexToNum(COL_TEXT), alpha).setDepth(4);
    const tri = this.add.triangle(centerX, centerY + 12, 0, 14, 10, 0, 20, 14, hexToNum(COL_SECONDARY), alpha).setDepth(4);
    const panOff = beamLen * 0.42;
    const leftPanX = centerX - panOff;
    const rightPanX = centerX + panOff;
    const leftPan = this.add.rectangle(leftPanX, centerY + 10, 100, 4,
      hexToNum(active ? COL_PRIMARY : (done ? COL_ACCENT : COL_SECONDARY)), alpha).setDepth(4);
    const rightPan = this.add.rectangle(rightPanX, centerY + 10, 100, 4,
      hexToNum(done ? COL_ACCENT : (active ? COL_PRIMARY : COL_SECONDARY)), alpha).setDepth(4);

    const objs = [beam, tri, leftPan, rightPan];

    // Left pan contents: mystery box + leftKnown unit blocks (if active/solved)
    // If not yet active, show "?" placeholder
    if (dim) {
      const q = this.add.text(leftPanX, centerY - 6, 'x + ?', {
        fontSize: '13px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif"
      }).setOrigin(0.5, 1).setDepth(6).setAlpha(alpha);
      objs.push(q);
      const qR = this.add.text(rightPanX, centerY - 6, '?', {
        fontSize: '13px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif"
      }).setOrigin(0.5, 1).setDepth(6).setAlpha(alpha);
      objs.push(qR);
    } else {
      // Mystery box
      const boxColor = done ? COL_ACCENT : COL_PRIMARY;
      const box = this.add.rectangle(leftPanX - 28, centerY - 4, 22, 22, hexToNum(boxColor), 1)
        .setStrokeStyle(1, hexToNum(COL_ACCENT)).setDepth(6);
      const boxLbl = this.add.text(leftPanX - 28, centerY - 4, done ? String(c.x) : 'x', {
        fontSize: '12px', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(7);
      objs.push(box, boxLbl);
      // leftKnown blocks
      for (let k = 0; k < state.leftKnown; k++) {
        const col = (k % 4), row = Math.floor(k / 4);
        const r = this.add.rectangle(leftPanX - 10 + col * 10, centerY - 2 - row * 10, 8, 8,
          hexToNum(COL_ACCENT), 1).setDepth(6);
        objs.push(r);
      }
      // rightTotal blocks
      for (let k = 0; k < state.rightTotal; k++) {
        const col = (k % 5), row = Math.floor(k / 5);
        const r = this.add.rectangle(rightPanX - 22 + col * 10, centerY - 2 - row * 10, 8, 8,
          hexToNum(COL_ACCENT), 1).setDepth(6);
        objs.push(r);
      }
      // Equation summary under this scale
      const eq = done
        ? ('x = ' + c.x)
        : ('x + ' + state.leftKnown + ' = ' + state.rightTotal);
      const eqLbl = this.add.text(centerX, centerY + 24, eq, {
        fontSize: '12px', color: done ? COL_ACCENT : COL_PRIMARY,
        fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(6);
      objs.push(eqLbl);
    }

    // Chain arrow (scale N's x feeds into scale N+1's right pan)
    if (idx < 2) {
      const arrow = this.add.text(centerX + this.W * 0.28, centerY + 24,
        done ? '↓ ' + c.x + ' feeds next' : '↓',
        { fontSize: '11px', color: done ? COL_ACCENT : '#555', fontFamily: "'Lexend', system-ui" }
      ).setOrigin(0, 0.5).setDepth(6);
      objs.push(arrow);
    }

    // Scale badge (1/2/3)
    const badge = this.add.text(centerX - this.W * 0.28, centerY,
      'Scale ' + (idx + 1), {
      fontSize: '11px', color: active ? COL_PRIMARY : (done ? COL_ACCENT : COL_SECONDARY),
      fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(0, 0.5).setDepth(6).setAlpha(alpha);
    objs.push(badge);

    this._scaleVisuals[idx] = { objs };
  }

  _redrawScales() {
    // Destroy and redraw (simple)
    if (this._scaleVisuals) {
      this._scaleVisuals.forEach(sv => {
        if (sv) sv.objs.forEach(o => o && o.destroy && o.destroy());
      });
    }
    this._scaleVisuals = [null, null, null];
    this._drawAllScales();
  }

  _buildControls() {
    const W = this.W, H = this.H;
    const cy = H * 0.78;
    // Instruction
    if (this.ctrlHint) this.ctrlHint.destroy();
    this.ctrlHint = this.add.text(W / 2, cy - 36, 'Remove the same amount from BOTH sides to isolate x:', {
      fontSize: '12px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5).setDepth(10);

    this._rebuildRemoveButtons();

    if (!this.undoBtn) {
      this.undoBtn = this.add.rectangle(W / 2, cy + 60, 140, 34, hexToNum(COL_DANGER), 0.55)
        .setInteractive({ useHandCursor: true }).setDepth(10);
      this.undoLbl = this.add.text(W / 2, cy + 60, 'Undo Last', {
        fontSize: '12px', color: '#fff', fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(11);
      this.undoBtn.on('pointerdown', () => this._undo());
    }
  }

  _rebuildRemoveButtons() {
    if (this.removeButtons) this.removeButtons.forEach(b => { b.bg.destroy(); b.lbl.destroy(); });
    this.removeButtons = [];
    const state = this.scaleStates[this.activeIdx];
    if (!state || state.solved) return;
    const leftKnown = state.leftKnown;
    if (leftKnown <= 0) return;
    const optSet = new Set([1]);
    if (leftKnown >= 2) optSet.add(2);
    if (leftKnown >= 3) optSet.add(3);
    optSet.add(leftKnown);
    const options = [...optSet].sort((a,b)=>a-b).filter(n => n <= leftKnown).slice(0, 4);

    const W = this.W, cy = this.H * 0.78;
    const btnW = 68, spacing = 12;
    const totalW = options.length * btnW + (options.length - 1) * spacing;
    const startX = W / 2 - totalW / 2 + btnW / 2;
    options.forEach((n, i) => {
      const x = startX + i * (btnW + spacing);
      const bg = this.add.rectangle(x, cy, btnW, 34, hexToNum(COL_PRIMARY), 1)
        .setInteractive({ useHandCursor: true }).setDepth(10);
      const lbl = this.add.text(x, cy, '−' + n, {
        fontSize: '15px', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(11);
      bg.on('pointerdown', () => this._removeFromBoth(n));
      this.removeButtons.push({ bg, lbl });
    });
  }

  _removeFromBoth(n) {
    const state = this.scaleStates[this.activeIdx];
    if (!state || state.solved || this.solutionCard) return;
    if (n > state.leftKnown) { this._flash("Can't remove that many from the left."); return; }
    if (n > state.rightTotal) {
      this._flash("Can't remove that many from the right — not enough there.");
      this.lives--;
      this._redrawHearts();
      heroShake(this, this.hero);
      this.cameras.main.shake(150, 0.006);
      if (this.lives <= 0) {
        this.time.delayedCall(700, () => this.scene.start('LoseScene', { score: gameScore }));
      }
      return;
    }
    state.history.push({ n });
    state.leftKnown -= n;
    state.rightTotal -= n;
    this._redrawScales();
    this._rebuildRemoveButtons();
    this._checkSolved();
  }

  _undo() {
    const state = this.scaleStates[this.activeIdx];
    if (!state || state.solved) return;
    const last = state.history.pop();
    if (!last) return;
    state.leftKnown += last.n;
    state.rightTotal += last.n;
    this._redrawScales();
    this._rebuildRemoveButtons();
    this._updateStatus();
  }

  _checkSolved() {
    const state = this.scaleStates[this.activeIdx];
    if (!state || state.solved) return;
    if (state.leftKnown === 0) {
      // This scale solved! x = rightTotal
      state.solved = true;
      const x = state.rightTotal;
      this.cameras.main.flash(110, 34, 197, 94);
      heroCheer(this, this.hero);
      // Cascade: next scale's rightTotal IS this x (chain invariant already set up)
      // Verify/force: chain[idx+1].q must equal x (by construction it does)
      this.activeIdx++;
      this._redrawScales();
      if (this.activeIdx >= 3) {
        // All solved — show final solution card
        gameScore += 10 * (this.round + 1);
        this.scoreLbl.setText('Score: ' + gameScore);
        if (this.removeButtons) this.removeButtons.forEach(b => { b.bg.destroy(); b.lbl.destroy(); });
        this.removeButtons = [];
        if (this.undoBtn) { this.undoBtn.setVisible(false); this.undoLbl.setVisible(false); }
        const lines = [
          'Scale 1: x + ' + this.chain[0].p + ' = ' + this.chain[0].q + '  →  x = ' + this.chain[0].x,
          'Scale 2: x + ' + this.chain[1].p + ' = ' + this.chain[1].q + '  →  x = ' + this.chain[1].x,
          'Scale 3: x + ' + this.chain[2].p + ' = ' + this.chain[2].q + '  →  x = ' + this.chain[2].x,
          'Chain solved!',
        ];
        this._showSolutionCard(lines);
      } else {
        this._rebuildRemoveButtons();
        this._updateStatus();
      }
    } else {
      this._updateStatus();
    }
  }

  _updateStatus() {
    const state = this.scaleStates[this.activeIdx];
    if (!state) { this.statusLbl.setText(''); return; }
    this.statusLbl.setText('Scale ' + (this.activeIdx + 1) + ':  x + ' + state.leftKnown + ' = ' + state.rightTotal).setColor(COL_PRIMARY);
  }

  _flash(msg) {
    this.statusLbl.setText(msg).setColor(COL_DANGER);
  }

  _showSolutionCard(lines) {
    if (this.solutionCard) return;
    const W = this.W, H = this.H;
    const backdrop = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.55).setDepth(50);
    const card = this.add.rectangle(W/2, H * 0.55, W - 40, 260, 0x18181b, 1)
      .setStrokeStyle(2, hexToNum(COL_ACCENT)).setDepth(51);
    const h1 = this.add.text(W/2, H * 0.55 - 105, 'Chain solved!', {
      fontSize: '22px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(52);
    const textObjs = [];
    lines.forEach((line, i) => {
      const t = this.add.text(W/2, H * 0.55 - 60 + i * 28, line, {
        fontSize: i === lines.length - 1 ? '18px' : '13px',
        color: i === lines.length - 1 ? COL_ACCENT : COL_TEXT,
        fontFamily: "'Space Grotesk', sans-serif",
        fontStyle: i === lines.length - 1 ? 'bold' : 'normal',
        align: 'center'
      }).setOrigin(0.5).setDepth(52).setAlpha(0);
      textObjs.push(t);
      this.time.delayedCall(180 * i, () => this.tweens.add({ targets: t, alpha: 1, duration: 280 }));
    });
    const nextY = H * 0.55 + 95;
    const isLast = this.round + 1 >= TOTAL_ROUNDS;
    const nextBg = this.add.rectangle(W/2, nextY, 210, 42, hexToNum(COL_ACCENT), 1)
      .setInteractive({ useHandCursor: true }).setDepth(52).setAlpha(0);
    const nextLbl = this.add.text(W/2, nextY, isLast ? 'Finish!' : 'Got it! Next round →', {
      fontSize: '14px', color: '#000', fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(53).setAlpha(0);
    this.time.delayedCall(180 * lines.length + 160, () => {
      this.tweens.add({ targets: [nextBg, nextLbl], alpha: 1, duration: 280 });
    });
    const cleanup = () => {
      [backdrop, card, h1, ...textObjs, nextBg, nextLbl].forEach(o => o && o.destroy());
      this.solutionCard = null;
      this.round++;
      if (this.round >= TOTAL_ROUNDS) {
        this.scene.start('VictoryScene', { score: gameScore });
      } else {
        if (this.undoBtn) { this.undoBtn.setVisible(true); this.undoLbl.setVisible(true); }
        this.startRound();
      }
    };
    nextBg.on('pointerdown', cleanup);
    this.solutionCard = { destroy: cleanup };
  }
}
`
