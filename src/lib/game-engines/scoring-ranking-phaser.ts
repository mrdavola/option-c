// Score & Rank — Phaser engine with 3 game options.
// Math: Order, compare, and rank numbers — counting and cardinality.
// Options: sorting-lane, number-line-drop, leaderboard-fix
//
// ════════════════════════════════════════════════════════════════════════════
// INTRINSIC REBUILD (v2) — sorting-lane and leaderboard-fix rebuilt so the
// math is validated by physics / visible structure rather than a "Check" click.
// number-line-drop is already truly intrinsic and is left unchanged.
// ════════════════════════════════════════════════════════════════════════════

import type { ThemeConfig, MathParams, GameOption } from "./engine-types"
import { phaserGame } from "./base-phaser-template"
import { getOptionDef } from "./game-option-registry"

export function scoringRankingPhaserEngine(
  config: ThemeConfig,
  math: MathParams,
  option: GameOption = "sorting-lane"
): string {
  const validOptions = ["sorting-lane", "number-line-drop", "leaderboard-fix"]
  const activeOption = validOptions.includes(option) ? option : "sorting-lane"

  const optDef = getOptionDef(activeOption)

  const sceneMap: Record<string, string> = {
    "sorting-lane": "SortingLaneScene",
    "number-line-drop": "NumberLineDropScene",
    "leaderboard-fix": "LeaderboardFixScene",
  }

  return phaserGame({
    config,
    math,
    option: activeOption,
    sceneName: sceneMap[activeOption],
    introText: optDef?.introText || "Sort the items!",
    helpText: optDef?.helpText || "Put items in order.",
    gameSceneCode: GAME_SCENES,
  })
}

const GAME_SCENES = `
// ─── Shared: Round helper ────────────────────────────────────────────────────
function getSortRound(roundIndex) {
  const data = getRound(roundIndex);
  const isDefault = !data || data.prompt === 'Solve this!' ||
    (Array.isArray(data.items) && data.items.length === 6 &&
     data.items[0] === 10 && data.items[1] === 5 && data.items[2] === 8);
  if (isDefault) {
    const fallbacks = [
      [4, 9, 2, 7],
      [12, 3, 18, 7, 15],
      [25, 11, 8, 19, 33],
      [45, 12, 28, 61, 7, 39],
      [88, 14, 52, 33, 71, 9],
    ];
    const items = fallbacks[roundIndex % fallbacks.length].slice();
    return { prompt: 'Stack the weights: smallest on bottom, largest on top.', items };
  }
  return {
    prompt: data.prompt || 'Stack the weights in order.',
    items: Array.isArray(data.items) && data.items.length >= 3 ? data.items.slice() : [4, 9, 2, 7]
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION A: Weight Tower Builder (sorting-lane rebuild)
// ═══════════════════════════════════════════════════════════════════════════════
// INTRINSIC DESIGN: Numbers are WEIGHT BLOCKS whose width is proportional to
// value. Player clicks blocks in order to stack them into a tower (bottom-up).
// If stacked in ascending order (largest on bottom, smallest on top) the tower
// stands straight. If a block is out of order — a bigger block placed on a
// smaller one — the tower VISIBLY WOBBLES and the offending block slides off
// the stack back to the pool. Physical stability IS the validation. When all
// blocks are successfully stacked, the tower glows and locks.
// ═══════════════════════════════════════════════════════════════════════════════
class SortingLaneScene extends Phaser.Scene {
  constructor() { super('SortingLaneScene'); }

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
    const W = this.W, pad = 14;
    this.scoreLbl = this.add.text(W-pad, pad, 'Score: 0', {
      fontSize: '16px', color: COL_ACCENT, fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(1, 0).setDepth(10);
    this.heartsGroup = this.add.group(); this._rh();
    this.dotGroup = this.add.group(); this._rd();
    this.promptLbl = this.add.text(W/2, pad, '', {
      fontSize: '13px', color: COL_TEXT, fontFamily: "'Lexend', system-ui",
      wordWrap: { width: W - 60 }, align: 'center'
    }).setOrigin(0.5, 0).setDepth(10);
  }
  _rh() { this.heartsGroup.clear(true,true); for(let i=0;i<this.lives;i++) this.heartsGroup.add(this.add.text(14+i*22,14,'♥',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dotGroup.clear(true,true); for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555'; this.dotGroup.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  startRound() {
    if (this.rg) this.rg.clear(true, true);
    this.rg = this.add.group();
    if (this.solutionCard) { this.solutionCard.destroy && this.solutionCard.destroy(); this.solutionCard = null; }

    const data = getSortRound(this.round);
    this.promptLbl.setText(data.prompt);
    this.values = data.items.slice();
    // Correct order: ascending values, largest on BOTTOM of tower. Player must
    // place largest first, then next-largest, etc.
    this.correctOrder = this.values.slice().sort((a, b) => b - a);
    this.stacked = [];
    this.locked = false;
    this._rd();

    this._drawGround();
    this._drawPool();
    this._drawStackArea();
  }

  _drawGround() {
    const W = this.W, H = this.H;
    this.groundY = H * 0.62;
    this.rg.add(this.add.rectangle(W/2, this.groundY + 6, W * 0.9, 8, hexToNum(COL_SECONDARY), 0.7).setDepth(3));
    this.rg.add(this.add.text(W * 0.12, this.groundY + 22, 'build: biggest on BOTTOM → smallest on TOP', {
      fontSize: '11px', color: '#888', fontFamily: "'Lexend', system-ui"
    }).setOrigin(0, 0).setDepth(4));
  }

  _drawPool() {
    // Pool of blocks at bottom, widths proportional to value
    if (this.poolObjs) this.poolObjs.forEach(o => { o.bg.destroy(); o.lbl.destroy(); });
    this.poolObjs = [];
    const W = this.W, H = this.H;
    const maxVal = Math.max.apply(null, this.values);
    const maxWidth = 110;
    const minWidth = 36;
    const poolY = H * 0.82;
    const gap = Math.min(130, (W * 0.9) / this.values.length);
    const startX = W/2 - ((this.values.length - 1) * gap)/2;
    this.values.forEach((v, i) => {
      if (this.stacked.indexOf(v) !== -1) return;
      const width = minWidth + (v / maxVal) * (maxWidth - minWidth);
      const x = startX + i * gap;
      const bg = this.add.rectangle(x, poolY, width, 30, hexToNum(COL_PRIMARY), 0.7)
        .setStrokeStyle(2, hexToNum(COL_ACCENT), 0.6).setInteractive({ useHandCursor: true }).setDepth(6);
      const lbl = this.add.text(x, poolY, String(v), {
        fontSize: '15px', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(7);
      bg.on('pointerdown', () => { if (!this.locked) this._tryPlace(v); });
      this.rg.add(bg); this.rg.add(lbl);
      this.poolObjs.push({ bg, lbl, val: v });
    });
  }

  _drawStackArea() {
    // Mark the stack area
    this.stackX = this.W / 2;
    this.stackObjs = [];
  }

  _tryPlace(val) {
    // Determine expected next value
    const expected = this.correctOrder[this.stacked.length];
    const maxVal = Math.max.apply(null, this.values);
    const maxWidth = 110;
    const minWidth = 36;
    const blockH = 30;
    const width = minWidth + (val / maxVal) * (maxWidth - minWidth);
    const yOnStack = this.groundY - (this.stacked.length * (blockH + 2)) - blockH/2;
    // Create block at stack position
    const bg = this.add.rectangle(this.stackX, yOnStack - 60, width, blockH, hexToNum(COL_ACCENT), 0.9)
      .setStrokeStyle(2, hexToNum(COL_PRIMARY), 0.8).setDepth(7);
    const lbl = this.add.text(this.stackX, yOnStack - 60, String(val), {
      fontSize: '15px', color: '#000', fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(8);
    this.rg.add(bg); this.rg.add(lbl);

    // Animate drop
    this.tweens.add({
      targets: [bg, lbl], y: yOnStack, duration: 320, ease: 'Quad.easeIn',
      onComplete: () => {
        if (val === expected) {
          // Stable — lock into place
          this.stacked.push(val);
          this.stackObjs.push({ bg, lbl });
          // Hide the pool block
          const pool = this.poolObjs.find(o => o.val === val);
          if (pool) { pool.bg.setAlpha(0); pool.lbl.setAlpha(0); }
          // Check for completion
          if (this.stacked.length === this.correctOrder.length) {
            this._onComplete();
          }
        } else {
          // WOBBLE: visible instability — larger block on top of smaller
          this.cameras.main.shake(250, 0.008);
          heroShake(this, this.hero);
          this.lives--; this._rh();
          // Wobble the whole tower
          const allTower = [bg, lbl, ...this.stackObjs.flatMap(o => [o.bg, o.lbl])];
          this.tweens.add({
            targets: allTower,
            angle: { from: -6, to: 6 }, yoyo: true, repeat: 2, duration: 90
          });
          // Slide the offending block off the stack back to pool
          this.time.delayedCall(400, () => {
            allTower.forEach(o => { if (o.setAngle) o.setAngle(0); });
            this.tweens.add({
              targets: [bg, lbl],
              x: this.W * 0.5,
              y: this.H * 0.82,
              alpha: 0,
              duration: 500,
              ease: 'Quad.easeOut',
              onComplete: () => { bg.destroy(); lbl.destroy(); }
            });
            if (this.lives <= 0) {
              this.time.delayedCall(700, () => this.scene.start('LoseScene', { score: gameScore }));
            }
          });
        }
      }
    });
  }

  _onComplete() {
    this.locked = true;
    gameScore += 10 * (this.round + 1);
    this.scoreLbl.setText('Score: ' + gameScore);
    this.cameras.main.flash(200, 34, 197, 94);
    heroCheer(this, this.hero);
    // Glow the tower
    this.stackObjs.forEach(o => {
      this.tweens.add({
        targets: o.bg, scaleX: { from: 1, to: 1.05 }, scaleY: { from: 1, to: 1.08 },
        yoyo: true, duration: 260
      });
    });
    this.time.delayedCall(400, () => this._showSolutionCard());
  }

  _showSolutionCard() {
    const W = this.W, H = this.H;
    const backdrop = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.6).setDepth(50);
    const card = this.add.rectangle(W/2, H/2, W - 50, 220, 0x18181b, 1).setStrokeStyle(2, hexToNum(COL_ACCENT)).setDepth(51);
    const title = this.add.text(W/2, H/2 - 70, 'Tower locked!', {
      fontSize: '20px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(52);
    const order = this.correctOrder.slice().reverse().join(' < ');
    const line = this.add.text(W/2, H/2 - 16, order, {
      fontSize: '18px', color: COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(52);
    const sub = this.add.text(W/2, H/2 + 20, 'ascending: smallest to largest', {
      fontSize: '12px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5).setDepth(52);
    const btn = this.add.rectangle(W/2, H/2 + 70, 220, 44, hexToNum(COL_ACCENT), 1).setInteractive({ useHandCursor: true }).setDepth(52);
    const btnLbl = this.add.text(W/2, H/2 + 70, this.round + 1 >= TOTAL_ROUNDS ? 'Finish!' : 'Got it! Next round →', {
      fontSize: '14px', color: '#000', fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(53);
    const cleanup = () => {
      [backdrop, card, title, line, sub, btn, btnLbl].forEach(o => o.destroy());
      this.solutionCard = null;
      this.round++;
      if (this.round >= TOTAL_ROUNDS) this.scene.start('VictoryScene', { score: gameScore });
      else this.startRound();
    };
    btn.on('pointerdown', cleanup);
    this.solutionCard = { destroy: cleanup };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION B: Number Line Drop (UNCHANGED — already truly intrinsic)
// ═══════════════════════════════════════════════════════════════════════════════
class NumberLineDropScene extends Phaser.Scene {
  constructor() { super('NumberLineDropScene'); }

  create() {
    this.W = this.scale.width;
    this.H = this.scale.height;
    this.round = 0;
    this.lives = MAX_LIVES;
    this.placedCount = 0;

    this._buildBackground();
    this._buildUI();
    this.hero = addCharacter(this, this.W * 0.85, this.H * 0.35, 0.4);
    this.startRound();
  }

  _buildBackground() {
    const bg = this.add.image(this.W / 2, this.H / 2, 'bg');
    bg.setScale(Math.max(this.W / bg.width, this.H / bg.height));
    this.add.rectangle(this.W / 2, this.H / 2, this.W, this.H, 0x000000, 0.65);
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
    this.add.text(W / 2, pad, 'Drop each number on the number line', {
      fontSize: '14px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5, 0).setDepth(10);
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

  startRound() {
    if (this.lineGroup) this.lineGroup.clear(true, true);
    this.lineGroup = this.add.group();
    this.placedCount = 0;
    const data = getRound(this.round);
    this.nlMin = data.items.length >= 2 ? Math.min(...data.items) - 2 : 0;
    this.nlMax = data.items.length >= 2 ? Math.max(...data.items) + 2 : 20;
    this.nlValues = data.items;
    this.currentIdx = 0;
    this._redrawDots();
    this._drawNumberLine();
    this._showCurrentValue();
  }

  _drawNumberLine() {
    const W = this.W, H = this.H;
    const lineY = H * 0.55;
    const lineLeft = W * 0.1, lineRight = W * 0.9;
    this.lineGroup.add(
      this.add.rectangle((lineLeft + lineRight) / 2, lineY, lineRight - lineLeft, 3, hexToNum(COL_TEXT), 0.6).setDepth(5)
    );
    const range = this.nlMax - this.nlMin;
    const tickCount = Math.min(range + 1, 11);
    const step = range / (tickCount - 1);
    for (let i = 0; i < tickCount; i++) {
      const val = Math.round(this.nlMin + i * step);
      const x = lineLeft + (i / (tickCount - 1)) * (lineRight - lineLeft);
      this.lineGroup.add(
        this.add.rectangle(x, lineY, 2, 12, hexToNum(COL_TEXT), 0.4).setDepth(5)
      );
      this.lineGroup.add(
        this.add.text(x, lineY + 14, String(val), {
          fontSize: '11px', color: COL_TEXT, fontFamily: "'Lexend', system-ui", alpha: 0.6
        }).setOrigin(0.5, 0).setDepth(5)
      );
    }
    const dropZone = this.add.rectangle((lineLeft + lineRight) / 2, lineY, lineRight - lineLeft, 50, 0x000000, 0)
      .setInteractive({ useHandCursor: true }).setDepth(8);
    dropZone.on('pointerdown', (pointer) => {
      const clickX = pointer.x;
      const frac = (clickX - lineLeft) / (lineRight - lineLeft);
      const clickedValue = Math.round(this.nlMin + frac * (this.nlMax - this.nlMin));
      this._checkDrop(clickedValue, clickX, lineY);
    });
    this.lineGroup.add(dropZone);
    this.lineLeft = lineLeft;
    this.lineRight = lineRight;
    this.lineY = lineY;
  }

  _showCurrentValue() {
    if (this.valueLbl) this.valueLbl.destroy();
    if (this.currentIdx >= this.nlValues.length) return;
    this.valueLbl = this.add.text(this.W / 2, this.H * 0.3, String(this.nlValues[this.currentIdx]), {
      fontSize: '42px', color: COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);
  }

  _checkDrop(clickedValue, clickX, lineY) {
    const target = this.nlValues[this.currentIdx];
    const tolerance = Math.max(1, Math.ceil((this.nlMax - this.nlMin) * 0.08));
    if (Math.abs(clickedValue - target) <= tolerance) {
      this.lineGroup.add(
        this.add.circle(clickX, lineY, 8, hexToNum(COL_ACCENT)).setDepth(9)
      );
      this.lineGroup.add(
        this.add.text(clickX, lineY - 18, String(target), {
          fontSize: '13px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(9)
      );
      this.currentIdx++;
      this.placedCount++;
      if (this.currentIdx >= this.nlValues.length) {
        gameScore += 10 * (this.round + 1);
        this.scoreLbl.setText('Score: ' + gameScore);
        this.cameras.main.flash(200, 34, 197, 94); heroCheer(this, this.hero);
        this.round++;
        if (this.round >= TOTAL_ROUNDS) {
          this.time.delayedCall(600, () => this.scene.start('VictoryScene', { score: gameScore }));
        } else {
          this.time.delayedCall(800, () => this.startRound());
        }
      } else {
        this._showCurrentValue();
      }
    } else {
      this.lives--;
      this._redrawHearts();
      this.cameras.main.shake(200, 0.01); heroShake(this, this.hero);
      if (this.lives <= 0) {
        this.time.delayedCall(500, () => this.scene.start('LoseScene', { score: gameScore }));
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION C: Leaderboard Fix — Staircase Builder (rebuild)
// ═══════════════════════════════════════════════════════════════════════════════
// INTRINSIC DESIGN: Scores are BLOCKS whose heights are proportional to score.
// They're shown stacked in the wrong order (visibly a jagged staircase — some
// short blocks above tall ones). Player clicks blocks to swap adjacent pairs.
// As the ordering improves, the silhouette approaches a clean descending
// staircase. When the staircase is monotonically descending, the whole row
// glows — the shape IS the validation. No "check" button; the clean stair
// pattern emerges as the ranking becomes correct.
// ═══════════════════════════════════════════════════════════════════════════════
class LeaderboardFixScene extends Phaser.Scene {
  constructor() { super('LeaderboardFixScene'); }

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
    const W = this.W, pad = 14;
    this.scoreLbl = this.add.text(W-pad, pad, 'Score: 0', {
      fontSize: '16px', color: COL_ACCENT, fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(1, 0).setDepth(10);
    this.hg = this.add.group(); this._rh();
    this.dg = this.add.group(); this._rd();
    this.promptLbl = this.add.text(W/2, pad, '', {
      fontSize: '13px', color: COL_TEXT, fontFamily: "'Lexend', system-ui",
      wordWrap: { width: W - 60 }, align: 'center'
    }).setOrigin(0.5, 0).setDepth(10);
  }
  _rh() { this.hg.clear(true,true); for(let i=0;i<this.lives;i++) this.hg.add(this.add.text(14+i*22,14,'♥',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dg.clear(true,true); for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555'; this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  startRound() {
    if (this.rg) this.rg.clear(true, true);
    this.rg = this.add.group();
    if (this.solutionCard) { this.solutionCard.destroy && this.solutionCard.destroy(); this.solutionCard = null; }

    const data = getSortRound(this.round);
    this.promptLbl.setText('Tap a block, then tap its neighbour to swap. Build a descending staircase.');
    // Initial display may already be scrambled. Ensure not sorted.
    let display = data.items.slice();
    // If sorted already, introduce a couple swaps
    const sorted = display.slice().sort((a,b) => b - a);
    const isAlreadySorted = display.every((v,i) => v === sorted[i]);
    if (isAlreadySorted) {
      for (let s = 0; s < 2; s++) {
        const i = Math.floor(Math.random() * (display.length - 1));
        [display[i], display[i+1]] = [display[i+1], display[i]];
      }
    }
    this.display = display;
    this.correct = sorted;
    this.selected = -1;
    this.locked = false;
    this._rd();
    this._drawBlocks();
  }

  _drawBlocks() {
    if (this.blockObjs) this.blockObjs.forEach(o => { o.bg.destroy(); o.lbl.destroy(); if (o.rank) o.rank.destroy(); });
    this.blockObjs = [];
    const W = this.W, H = this.H;
    const n = this.display.length;
    const maxVal = Math.max.apply(null, this.display);
    const blockMaxH = H * 0.38;
    const blockW = Math.min(80, (W * 0.85) / n);
    const gap = 6;
    const totalW = n * blockW + (n - 1) * gap;
    const startX = W/2 - totalW/2 + blockW/2;
    const baseY = H * 0.68;

    this.display.forEach((v, i) => {
      const h = 30 + (v / maxVal) * (blockMaxH - 30);
      const x = startX + i * (blockW + gap);
      const y = baseY - h/2;
      const bg = this.add.rectangle(x, y, blockW - 4, h, hexToNum(COL_PRIMARY), 0.8)
        .setStrokeStyle(2, hexToNum(COL_ACCENT), 0.6)
        .setInteractive({ useHandCursor: true }).setDepth(6);
      const lbl = this.add.text(x, y, String(v), {
        fontSize: '14px', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(7);
      const rank = this.add.text(x, baseY + 18, '#' + (i+1), {
        fontSize: '11px', color: '#888', fontFamily: "'Lexend', system-ui"
      }).setOrigin(0.5).setDepth(7);
      bg.on('pointerdown', () => { if (!this.locked) this._tapBlock(i); });
      this.rg.add(bg); this.rg.add(lbl); this.rg.add(rank);
      this.blockObjs.push({ bg, lbl, rank, val: v, idx: i });
    });
    // Base line
    this.rg.add(this.add.rectangle(W/2, baseY + 4, totalW + 20, 4, hexToNum(COL_SECONDARY), 0.8).setDepth(4));
    this._checkStair();
  }

  _tapBlock(i) {
    if (this.selected === -1) {
      this.selected = i;
      this.blockObjs[i].bg.setStrokeStyle(3, hexToNum(COL_DANGER), 1);
    } else if (this.selected === i) {
      this.blockObjs[i].bg.setStrokeStyle(2, hexToNum(COL_ACCENT), 0.6);
      this.selected = -1;
    } else {
      // Must be adjacent
      if (Math.abs(this.selected - i) === 1) {
        const a = this.selected, b = i;
        [this.display[a], this.display[b]] = [this.display[b], this.display[a]];
        this.selected = -1;
        this._drawBlocks();
      } else {
        // Not adjacent — flash invalid
        this.cameras.main.shake(120, 0.005);
        this.blockObjs[this.selected].bg.setStrokeStyle(2, hexToNum(COL_ACCENT), 0.6);
        this.selected = -1;
      }
    }
  }

  _checkStair() {
    // Check monotonic descending
    let descending = true;
    for (let i = 1; i < this.display.length; i++) {
      if (this.display[i] > this.display[i-1]) { descending = false; break; }
    }
    if (descending && !this.locked) {
      this.locked = true;
      // Glow
      this.blockObjs.forEach((o, i) => {
        this.tweens.add({
          targets: o.bg, scaleY: { from: 1, to: 1.06 }, yoyo: true,
          duration: 240, delay: i * 60,
          onStart: () => { o.bg.setStrokeStyle(3, hexToNum(COL_ACCENT), 1); o.bg.setFillStyle(hexToNum(COL_ACCENT), 0.85); }
        });
      });
      this.cameras.main.flash(220, 34, 197, 94);
      heroCheer(this, this.hero);
      gameScore += 10 * (this.round + 1);
      this.scoreLbl.setText('Score: ' + gameScore);
      this.time.delayedCall(700, () => this._showSolutionCard());
    }
  }

  _showSolutionCard() {
    const W = this.W, H = this.H;
    const backdrop = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.6).setDepth(50);
    const card = this.add.rectangle(W/2, H/2, W - 50, 220, 0x18181b, 1).setStrokeStyle(2, hexToNum(COL_ACCENT)).setDepth(51);
    const title = this.add.text(W/2, H/2 - 70, 'Leaderboard fixed!', {
      fontSize: '20px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(52);
    const line = this.add.text(W/2, H/2 - 16, this.correct.join('  >  '), {
      fontSize: '18px', color: COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(52);
    const sub = this.add.text(W/2, H/2 + 20, 'descending: highest rank first', {
      fontSize: '12px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5).setDepth(52);
    const btn = this.add.rectangle(W/2, H/2 + 70, 220, 44, hexToNum(COL_ACCENT), 1).setInteractive({ useHandCursor: true }).setDepth(52);
    const btnLbl = this.add.text(W/2, H/2 + 70, this.round + 1 >= TOTAL_ROUNDS ? 'Finish!' : 'Got it! Next round →', {
      fontSize: '14px', color: '#000', fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(53);
    const cleanup = () => {
      [backdrop, card, title, line, sub, btn, btnLbl].forEach(o => o.destroy());
      this.solutionCard = null;
      this.round++;
      if (this.round >= TOTAL_ROUNDS) this.scene.start('VictoryScene', { score: gameScore });
      else this.startRound();
    };
    btn.on('pointerdown', cleanup);
    this.solutionCard = { destroy: cleanup };
  }
}
`
