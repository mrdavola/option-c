// Pattern & Repeat — Phaser engine with 3 game options.
// Math: Patterns, sequences, rules, arithmetic/geometric sequences.
// Options: sequence-builder, pattern-machine, broken-pattern
//
// ════════════════════════════════════════════════════════════════════════════
// INTRINSIC REBUILD (v2) — all three scenes redesigned so the math is
// discovered FROM THE INTERACTION. No typed numeric answers, no check buttons,
// no cold multiple-choice guesses. Each scene uses physical/visual manipulation
// and live feedback, matching the MysterySideScene (balance-systems) gold
// standard.
// ════════════════════════════════════════════════════════════════════════════

import type { ThemeConfig, MathParams, GameOption } from "./engine-types"
import { phaserGame } from "./base-phaser-template"
import { getOptionDef } from "./game-option-registry"

export function timingRhythmPhaserEngine(
  config: ThemeConfig,
  math: MathParams,
  option: GameOption = "sequence-builder"
): string {
  const validOptions = ["sequence-builder", "pattern-machine", "broken-pattern"]
  const activeOption = validOptions.includes(option) ? option : "sequence-builder"
  const optDef = getOptionDef(activeOption)
  const sceneMap: Record<string, string> = {
    "sequence-builder": "SequenceBuilderScene",
    "pattern-machine": "PatternMachineScene",
    "broken-pattern": "BrokenPatternScene",
  }
  return phaserGame({
    config, math, option: activeOption,
    sceneName: sceneMap[activeOption],
    introText: optDef?.introText || "Find the pattern!",
    helpText: optDef?.helpText || "Look for the rule in the sequence.",
    gameSceneCode: GAME_SCENES,
  })
}

const GAME_SCENES = `
// ─── Shared: Rule inference ──────────────────────────────────────────────────
// Given a sequence, infer an arithmetic (+n) or geometric (xn) rule.
function inferRule(seq) {
  if (!seq || seq.length < 2) return { type: 'add', val: 1, apply: (x) => x + 1, label: '+1' };
  const d = seq[1] - seq[0];
  let isAdd = true;
  for (let i = 2; i < seq.length; i++) {
    if (seq[i] - seq[i-1] !== d) { isAdd = false; break; }
  }
  if (isAdd && d !== 0) return { type: 'add', val: d, apply: (x) => x + d, label: (d >= 0 ? '+' : '') + d };
  if (seq[0] !== 0) {
    const r = seq[1] / seq[0];
    let isMul = Number.isFinite(r) && r !== 1;
    if (isMul) {
      for (let i = 2; i < seq.length; i++) {
        if (seq[i-1] === 0 || seq[i] / seq[i-1] !== r) { isMul = false; break; }
      }
    }
    if (isMul) return { type: 'mult', val: r, apply: (x) => x * r, label: '×' + r };
  }
  // Fallback — treat as +1
  return { type: 'add', val: 1, apply: (x) => x + 1, label: '+1' };
}

// Fallback round variations — used when AI rounds are the default placeholder.
const ROUND_FALLBACKS = [
  { seq: [2, 4, 6, 8, 10], next: 12 },
  { seq: [5, 10, 15, 20, 25], next: 30 },
  { seq: [3, 6, 12, 24], next: 48 },
  { seq: [1, 4, 7, 10, 13], next: 16 },
  { seq: [2, 6, 18, 54], next: 162 },
];

function getPatternRound(roundIndex) {
  const data = getRound(roundIndex);
  const isDefault = !data || data.prompt === 'Solve this!' ||
    (Array.isArray(data.items) && data.items.length === 6 &&
     data.items[0] === 10 && data.items[1] === 5 && data.items[2] === 8);
  if (isDefault) {
    const fb = ROUND_FALLBACKS[roundIndex % ROUND_FALLBACKS.length];
    return { prompt: 'Find the pattern.', sequence: fb.seq.slice(), next: fb.next };
  }
  const seq = Array.isArray(data.items) ? data.items.slice() : [];
  let next = typeof data.target === 'number' ? data.target : null;
  if (seq.length >= 2 && next == null) {
    const rule = inferRule(seq);
    next = rule.apply(seq[seq.length - 1]);
  }
  if (seq.length < 2) {
    const fb = ROUND_FALLBACKS[roundIndex % ROUND_FALLBACKS.length];
    return { prompt: data.prompt || 'Find the pattern.', sequence: fb.seq.slice(), next: fb.next };
  }
  return { prompt: data.prompt || 'Find the pattern.', sequence: seq, next: next };
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION A: Black Box Machine — feed inputs, see outputs, predict before running.
// ═══════════════════════════════════════════════════════════════════════════════
// INTRINSIC DESIGN: A machine has a hidden rule derived from the AI sequence.
// Player DRAGS number tiles into the INPUT funnel. The machine visibly crunches,
// emits an OUTPUT tile, which lands on the output shelf. After experimenting,
// a TARGET INPUT is displayed. Player must DRAG a predicted output tile onto
// the output slot BEFORE running the machine. If the prediction matches when
// the machine runs, it chimes and locks. The learner discovers the rule
// through experimentation — no typed answers, no multiple choice.
// ═══════════════════════════════════════════════════════════════════════════════
class SequenceBuilderScene extends Phaser.Scene {
  constructor() { super('SequenceBuilderScene'); }

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
    this.statusLbl = this.add.text(W/2, this.H * 0.88, '', {
      fontSize: '13px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold',
      wordWrap: { width: W - 40 }, align: 'center'
    }).setOrigin(0.5).setDepth(10);
  }

  _rh() {
    this.hg.clear(true, true);
    for (let i = 0; i < this.lives; i++)
      this.hg.add(this.add.text(14 + i*22, 14, '♥', { fontSize: '18px', color: COL_DANGER }).setDepth(10));
  }
  _rd() {
    this.dg.clear(true, true);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      const c = i < this.round ? COL_ACCENT : (i === this.round ? COL_PRIMARY : '#555555');
      this.dg.add(this.add.circle(this.W/2 - 40 + i*20, this.H - 16, 5, hexToNum(c)).setDepth(10));
    }
  }

  startRound() {
    // Cleanup
    if (this.rg) this.rg.clear(true, true);
    this.rg = this.add.group();
    if (this.solutionCard) { this.solutionCard.destroy && this.solutionCard.destroy(); this.solutionCard = null; }

    const data = getPatternRound(this.round);
    this.rule = inferRule(data.sequence);
    this.targetInput = data.sequence[data.sequence.length - 1];
    this.targetOutput = this.rule.apply(this.targetInput);
    this.experiments = [];
    this.prediction = null;
    this.locked = false;
    this._rd();
    this.promptLbl.setText('Feed inputs to learn the machine. Then predict the output for the target.');
    this.statusLbl.setText('');

    const W = this.W, H = this.H;

    // Machine body
    const mx = W/2, my = H * 0.34;
    this.rg.add(this.add.rectangle(mx, my, 180, 120, hexToNum(COL_SECONDARY), 0.5).setStrokeStyle(3, hexToNum(COL_PRIMARY)).setDepth(5));
    this.rg.add(this.add.text(mx, my - 38, 'BLACK BOX', {
      fontSize: '12px', color: COL_ACCENT, fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6));
    this.ruleLbl = this.add.text(mx, my, '?', {
      fontSize: '32px', color: COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6);
    this.rg.add(this.ruleLbl);

    // Input funnel (left of machine)
    this.inX = mx - 130; this.inY = my;
    this.rg.add(this.add.triangle(this.inX, this.inY, 0, -20, 0, 20, 30, 0, hexToNum(COL_ACCENT), 0.8).setDepth(5));
    this.rg.add(this.add.text(this.inX, this.inY - 34, 'IN', { fontSize: '11px', color: COL_TEXT }).setOrigin(0.5).setDepth(6));

    // Output slot (right of machine)
    this.outX = mx + 130; this.outY = my;
    this.outSlot = this.add.rectangle(this.outX, this.outY, 54, 44, hexToNum(COL_ACCENT), 0.15)
      .setStrokeStyle(2, hexToNum(COL_ACCENT), 0.6).setDepth(5);
    this.rg.add(this.outSlot);
    this.rg.add(this.add.text(this.outX, this.outY - 34, 'OUT', { fontSize: '11px', color: COL_TEXT }).setOrigin(0.5).setDepth(6));

    // Experiments log (above machine)
    this.logLbls = [];
    this.rg.add(this.add.text(W/2, H * 0.08 + 4, 'experiments', { fontSize: '11px', color: '#888' }).setOrigin(0.5).setDepth(6));

    // Input tiles (bottom-left row) — drag these into the funnel
    this.inputPool = this._chooseInputPool();
    this.tileObjs = [];
    const poolY = H * 0.6;
    const gap = 56;
    const startX = W/2 - ((this.inputPool.length - 1) * gap)/2;
    this.inputPool.forEach((v, i) => {
      const tx = startX + i * gap;
      this._makeDraggableTile(tx, poolY, v, 'input');
    });

    // TARGET display (below machine)
    this.targetBanner = this.add.rectangle(W/2, H * 0.73, W * 0.8, 60, hexToNum(COL_PRIMARY), 0.12)
      .setStrokeStyle(2, hexToNum(COL_PRIMARY), 0.5).setDepth(5);
    this.rg.add(this.targetBanner);
    this.rg.add(this.add.text(W/2 - 110, H * 0.73, 'Target input: ' + this.targetInput, {
      fontSize: '15px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6));
    this.rg.add(this.add.text(W/2 + 20, H * 0.73, '→ predicted output:', {
      fontSize: '12px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5).setDepth(6));
    this.predSlot = this.add.rectangle(W/2 + 120, H * 0.73, 54, 40, hexToNum(COL_ACCENT), 0.15)
      .setStrokeStyle(2, hexToNum(COL_ACCENT), 0.6).setDepth(5);
    this.rg.add(this.predSlot);
    this.predLbl = this.add.text(W/2 + 120, H * 0.73, '?', {
      fontSize: '18px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6);
    this.rg.add(this.predLbl);

    // Prediction tile row (candidate outputs)
    this.predPool = this._choosePredictionPool();
    const predY = H * 0.82;
    const pgap = 56;
    const pStartX = W/2 - ((this.predPool.length - 1) * pgap)/2;
    this.predPool.forEach((v, i) => {
      const tx = pStartX + i * pgap;
      this._makeDraggableTile(tx, predY, v, 'predict');
    });
  }

  _chooseInputPool() {
    // Small numbers the learner can feed to discover the rule
    const base = [1, 2, 3, 5, 10];
    return base.slice(0, 5);
  }

  _choosePredictionPool() {
    // True answer + 3 plausible distractors based on common wrong rules
    const x = this.targetInput;
    const correct = this.targetOutput;
    const distractors = new Set();
    if (this.rule.type === 'add') {
      distractors.add(x + (this.rule.val + 1));
      distractors.add(x + (this.rule.val - 1));
      distractors.add(x * 2);
    } else {
      distractors.add(x + this.rule.val);
      distractors.add(correct + 1);
      distractors.add(correct - 1);
    }
    const pool = [correct];
    for (const d of distractors) {
      if (pool.length >= 4) break;
      if (d !== correct && d > 0) pool.push(d);
    }
    while (pool.length < 4) pool.push(correct + pool.length + 2);
    // Shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i+1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
  }

  _makeDraggableTile(x, y, val, kind) {
    const bg = this.add.rectangle(x, y, 46, 38, hexToNum(COL_SECONDARY), 0.6)
      .setStrokeStyle(2, hexToNum(COL_PRIMARY), 0.6).setInteractive({ draggable: true, useHandCursor: true }).setDepth(8);
    const lbl = this.add.text(x, y, String(val), {
      fontSize: '17px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(9);
    this.rg.add(bg); this.rg.add(lbl);
    bg._origX = x; bg._origY = y; bg._val = val; bg._kind = kind;
    this.input.setDraggable(bg);
    bg.on('drag', (pointer, dx, dy) => { bg.x = dx; bg.y = dy; lbl.x = dx; lbl.y = dy; });
    bg.on('dragend', () => {
      if (kind === 'input') {
        const d = Phaser.Math.Distance.Between(bg.x, bg.y, this.inX, this.inY);
        if (d < 60 && !this.locked) {
          this._runExperiment(val);
        }
        bg.x = bg._origX; bg.y = bg._origY; lbl.x = bg._origX; lbl.y = bg._origY;
      } else if (kind === 'predict') {
        const d = Phaser.Math.Distance.Between(bg.x, bg.y, this.predSlot.x, this.predSlot.y);
        if (d < 50 && !this.locked) {
          this._setPrediction(val);
        }
        bg.x = bg._origX; bg.y = bg._origY; lbl.x = bg._origX; lbl.y = bg._origY;
      }
    });
    this.tileObjs.push({ bg, lbl });
  }

  _runExperiment(inputVal) {
    const out = this.rule.apply(inputVal);
    // Animate: flash the machine
    this.tweens.add({
      targets: this.ruleLbl, scale: { from: 0.6, to: 1.2 }, duration: 180, yoyo: true,
      onYoyo: () => this.ruleLbl.setText('?'),
      onStart: () => this.ruleLbl.setText('…')
    });
    this.cameras.main.flash(80, 120, 180, 255);
    // Add to log
    this.experiments.push({ in: inputVal, out: out });
    this._redrawLog();
    // Brief output reveal in slot
    const pulseLbl = this.add.text(this.outX, this.outY, String(out), {
      fontSize: '22px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);
    this.tweens.add({ targets: pulseLbl, alpha: { from: 1, to: 0 }, y: pulseLbl.y - 20, duration: 1400, onComplete: () => pulseLbl.destroy() });
  }

  _redrawLog() {
    this.logLbls.forEach(l => l.destroy());
    this.logLbls = [];
    const W = this.W, y = this.H * 0.13;
    const recent = this.experiments.slice(-4);
    const gap = 100;
    const startX = W/2 - ((recent.length - 1) * gap)/2;
    recent.forEach((e, i) => {
      const t = this.add.text(startX + i * gap, y, e.in + ' → ' + e.out, {
        fontSize: '13px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(7);
      this.logLbls.push(t);
    });
  }

  _setPrediction(val) {
    this.prediction = val;
    this.predLbl.setText(String(val));
    this.predLbl.setColor(COL_PRIMARY);
    // Auto-run the machine on the target input to validate
    this.time.delayedCall(400, () => this._runFinal());
  }

  _runFinal() {
    if (this.locked) return;
    this.locked = true;
    const actual = this.targetOutput;
    this.statusLbl.setText('Running on target input ' + this.targetInput + '...');
    this.tweens.add({
      targets: this.ruleLbl, scale: { from: 0.6, to: 1.4 }, duration: 400, yoyo: true,
      onStart: () => this.ruleLbl.setText('…'),
      onComplete: () => this.ruleLbl.setText('?')
    });
    this.time.delayedCall(900, () => {
      if (this.prediction === actual) {
        // CHIME
        this.predLbl.setColor(COL_ACCENT);
        this.cameras.main.flash(200, 34, 197, 94);
        heroCheer(this, this.hero);
        gameScore += 10 * (this.round + 1);
        this.scoreLbl.setText('Score: ' + gameScore);
        this._showSolutionCard(true, actual);
      } else {
        this.cameras.main.shake(220, 0.012);
        heroShake(this, this.hero);
        this.lives--; this._rh();
        this.statusLbl.setText('Machine output ' + actual + ' — your prediction was ' + this.prediction).setColor(COL_DANGER);
        if (this.lives <= 0) {
          this.time.delayedCall(700, () => this.scene.start('LoseScene', { score: gameScore }));
          return;
        }
        this._showSolutionCard(false, actual);
      }
    });
  }

  _showSolutionCard(correct, actual) {
    const W = this.W, H = this.H;
    const backdrop = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.6).setDepth(50);
    const card = this.add.rectangle(W/2, H/2, W - 50, 240, 0x18181b, 1).setStrokeStyle(2, hexToNum(correct ? COL_ACCENT : COL_PRIMARY)).setDepth(51);
    const title = this.add.text(W/2, H/2 - 88, correct ? 'Rule found!' : 'The rule was...', {
      fontSize: '20px', color: correct ? COL_ACCENT : COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(52);
    const ruleLine = this.add.text(W/2, H/2 - 40, 'rule: ' + this.rule.label, {
      fontSize: '24px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(52);
    const eqLine = this.add.text(W/2, H/2, this.targetInput + ' ' + this.rule.label + ' = ' + actual, {
      fontSize: '18px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif"
    }).setOrigin(0.5).setDepth(52);
    const btn = this.add.rectangle(W/2, H/2 + 70, 220, 44, hexToNum(COL_ACCENT), 1).setInteractive({ useHandCursor: true }).setDepth(52);
    const btnLbl = this.add.text(W/2, H/2 + 70, this.round + 1 >= TOTAL_ROUNDS ? 'Finish!' : 'Got it! Next round →', {
      fontSize: '14px', color: '#000', fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(53);
    const cleanup = () => {
      [backdrop, card, title, ruleLine, eqLine, btn, btnLbl].forEach(o => o.destroy());
      this.solutionCard = null;
      if (correct) {
        this.round++;
        if (this.round >= TOTAL_ROUNDS) this.scene.start('VictoryScene', { score: gameScore });
        else this.startRound();
      } else {
        // Retry same round
        this.startRound();
      }
    };
    btn.on('pointerdown', cleanup);
    this.solutionCard = { destroy: cleanup };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION B: Pattern Machine (rule discovery via experimentation)
// ═══════════════════════════════════════════════════════════════════════════════
// INTRINSIC DESIGN: Sequence produced by a hidden rule is shown at top. Player
// feeds test inputs into the machine and watches outputs emerge. Rule options
// are listed on the right — each option grays out as experiments contradict it.
// When only one rule remains consistent, the player clicks it to lock in.
// Experimentation narrows the options visually — the math IS the elimination.
// ═══════════════════════════════════════════════════════════════════════════════
class PatternMachineScene extends Phaser.Scene {
  constructor() { super('PatternMachineScene'); }

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

    const data = getPatternRound(this.round);
    this.rule = inferRule(data.sequence);
    this.sequence = data.sequence;
    this.options = this._buildRuleOptions(this.rule);
    this.eliminated = new Set();
    this.experiments = [];
    this.locked = false;
    this._rd();
    this.promptLbl.setText('Feed inputs. Watch outputs. Eliminate rules that do not fit. Lock in the last one standing.');

    const W = this.W, H = this.H;

    // Shown sequence banner
    this.rg.add(this.add.text(W/2, H * 0.08, 'hidden rule produced:', { fontSize: '11px', color: '#888' }).setOrigin(0.5).setDepth(6));
    const seqStr = this.sequence.join('  →  ');
    this.rg.add(this.add.text(W/2, H * 0.12, seqStr, {
      fontSize: '18px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6));

    // Machine body
    const mx = W * 0.34, my = H * 0.32;
    this.rg.add(this.add.rectangle(mx, my, 140, 90, hexToNum(COL_SECONDARY), 0.5).setStrokeStyle(3, hexToNum(COL_PRIMARY)).setDepth(5));
    this.ruleLbl = this.add.text(mx, my, '?', {
      fontSize: '26px', color: COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6);
    this.rg.add(this.ruleLbl);
    // Input funnel
    this.inX = mx - 90; this.inY = my;
    this.rg.add(this.add.triangle(this.inX, this.inY, 0, -16, 0, 16, 24, 0, hexToNum(COL_ACCENT), 0.8).setDepth(5));
    // Output slot
    this.outX = mx + 90; this.outY = my;
    this.rg.add(this.add.rectangle(this.outX, this.outY, 44, 36, hexToNum(COL_ACCENT), 0.15).setStrokeStyle(2, hexToNum(COL_ACCENT), 0.6).setDepth(5));

    // Input tiles below machine
    this.inputPool = [1, 2, 4, 6, 8];
    this.tileObjs = [];
    const poolY = H * 0.48;
    const gap = 50;
    const startX = mx - ((this.inputPool.length - 1) * gap)/2;
    this.inputPool.forEach((v, i) => {
      const tx = startX + i * gap;
      this._makeDraggableTile(tx, poolY, v);
    });

    // Options column on right
    this.optionObjs = [];
    const ox = W * 0.78, oyStart = H * 0.22, ogap = 50;
    this.rg.add(this.add.text(ox, oyStart - 24, 'Possible rules', { fontSize: '12px', color: COL_TEXT, fontFamily: "'Lexend', system-ui", fontStyle: 'bold' }).setOrigin(0.5).setDepth(6));
    this.options.forEach((opt, i) => {
      const y = oyStart + i * ogap;
      const bg = this.add.rectangle(ox, y, 110, 40, hexToNum(COL_SECONDARY), 0.5)
        .setStrokeStyle(2, hexToNum(COL_PRIMARY), 0.6).setInteractive({ useHandCursor: true }).setDepth(7);
      const lbl = this.add.text(ox, y, opt.label, {
        fontSize: '16px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(8);
      bg.on('pointerdown', () => this._lockRule(i));
      this.rg.add(bg); this.rg.add(lbl);
      this.optionObjs.push({ bg, lbl, opt, idx: i });
    });

    // Log
    this.logLbls = [];
  }

  _buildRuleOptions(rule) {
    const opts = [];
    // Always include the correct rule
    opts.push({ label: rule.label, apply: rule.apply, correct: true });
    // Add distractors
    const candidates = [];
    if (rule.type === 'add') {
      candidates.push({ label: '+' + (rule.val + 1), apply: (x) => x + (rule.val + 1) });
      candidates.push({ label: '+' + Math.max(1, rule.val - 1), apply: (x) => x + Math.max(1, rule.val - 1) });
      candidates.push({ label: '×2', apply: (x) => x * 2 });
    } else {
      candidates.push({ label: '×' + (rule.val + 1), apply: (x) => x * (rule.val + 1) });
      candidates.push({ label: '+' + rule.val, apply: (x) => x + rule.val });
      candidates.push({ label: '+' + (rule.val * 2), apply: (x) => x + (rule.val * 2) });
    }
    for (const c of candidates) {
      if (opts.length >= 4) break;
      if (c.label !== rule.label) opts.push({ label: c.label, apply: c.apply, correct: false });
    }
    // Shuffle
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i+1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  }

  _makeDraggableTile(x, y, val) {
    const bg = this.add.rectangle(x, y, 42, 34, hexToNum(COL_SECONDARY), 0.6)
      .setStrokeStyle(2, hexToNum(COL_PRIMARY), 0.6).setInteractive({ draggable: true, useHandCursor: true }).setDepth(8);
    const lbl = this.add.text(x, y, String(val), {
      fontSize: '15px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(9);
    this.rg.add(bg); this.rg.add(lbl);
    bg._origX = x; bg._origY = y;
    this.input.setDraggable(bg);
    bg.on('drag', (pointer, dx, dy) => { bg.x = dx; bg.y = dy; lbl.x = dx; lbl.y = dy; });
    bg.on('dragend', () => {
      const d = Phaser.Math.Distance.Between(bg.x, bg.y, this.inX, this.inY);
      if (d < 60 && !this.locked) this._runExperiment(val);
      bg.x = bg._origX; bg.y = bg._origY; lbl.x = bg._origX; lbl.y = bg._origY;
    });
  }

  _runExperiment(inputVal) {
    const out = this.rule.apply(inputVal);
    this.experiments.push({ in: inputVal, out });
    // Animate
    this.cameras.main.flash(80, 120, 180, 255);
    const pulse = this.add.text(this.outX, this.outY, String(out), {
      fontSize: '20px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);
    this.tweens.add({ targets: pulse, alpha: { from: 1, to: 0 }, y: pulse.y - 16, duration: 1200, onComplete: () => pulse.destroy() });

    // Eliminate wrong options visually
    this.optionObjs.forEach((o) => {
      if (this.eliminated.has(o.idx)) return;
      if (o.opt.apply(inputVal) !== out) {
        this.eliminated.add(o.idx);
        o.bg.setFillStyle(hexToNum(COL_DANGER), 0.15);
        o.bg.setStrokeStyle(2, hexToNum(COL_DANGER), 0.4);
        o.lbl.setColor('#666');
        // Strikethrough effect
        const line = this.add.rectangle(o.bg.x, o.bg.y, 100, 2, hexToNum(COL_DANGER), 0.8).setDepth(9);
        this.rg.add(line);
      }
    });

    // Redraw log
    this._redrawLog();
  }

  _redrawLog() {
    this.logLbls.forEach(l => l.destroy());
    this.logLbls = [];
    const W = this.W, y = this.H * 0.58;
    const recent = this.experiments.slice(-4);
    const gap = 90;
    const startX = W * 0.34 - ((recent.length - 1) * gap)/2;
    recent.forEach((e, i) => {
      const t = this.add.text(startX + i * gap, y, e.in + ' → ' + e.out, {
        fontSize: '13px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(7);
      this.logLbls.push(t);
    });
  }

  _lockRule(idx) {
    if (this.locked) return;
    if (this.eliminated.has(idx)) return;
    this.locked = true;
    const chosen = this.options[idx];
    if (chosen.correct) {
      this.cameras.main.flash(200, 34, 197, 94);
      heroCheer(this, this.hero);
      gameScore += 10 * (this.round + 1);
      this.scoreLbl.setText('Score: ' + gameScore);
      this._showSolutionCard(true);
    } else {
      this.cameras.main.shake(220, 0.012);
      heroShake(this, this.hero);
      this.lives--; this._rh();
      if (this.lives <= 0) { this.time.delayedCall(700, () => this.scene.start('LoseScene', { score: gameScore })); return; }
      this._showSolutionCard(false);
    }
  }

  _showSolutionCard(correct) {
    const W = this.W, H = this.H;
    const backdrop = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.6).setDepth(50);
    const card = this.add.rectangle(W/2, H/2, W - 50, 220, 0x18181b, 1).setStrokeStyle(2, hexToNum(correct ? COL_ACCENT : COL_PRIMARY)).setDepth(51);
    const title = this.add.text(W/2, H/2 - 70, correct ? 'Rule locked in!' : 'The rule was...', {
      fontSize: '20px', color: correct ? COL_ACCENT : COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(52);
    const ruleLine = this.add.text(W/2, H/2 - 20, this.rule.label, {
      fontSize: '28px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(52);
    const eg = this.add.text(W/2, H/2 + 18, 'e.g. ' + this.sequence[0] + ' ' + this.rule.label + ' = ' + this.rule.apply(this.sequence[0]), {
      fontSize: '14px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif"
    }).setOrigin(0.5).setDepth(52);
    const btn = this.add.rectangle(W/2, H/2 + 70, 220, 44, hexToNum(COL_ACCENT), 1).setInteractive({ useHandCursor: true }).setDepth(52);
    const btnLbl = this.add.text(W/2, H/2 + 70, this.round + 1 >= TOTAL_ROUNDS ? 'Finish!' : 'Got it! Next round →', {
      fontSize: '14px', color: '#000', fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(53);
    const cleanup = () => {
      [backdrop, card, title, ruleLine, eg, btn, btnLbl].forEach(o => o.destroy());
      this.solutionCard = null;
      if (correct) {
        this.round++;
        if (this.round >= TOTAL_ROUNDS) this.scene.start('VictoryScene', { score: gameScore });
        else this.startRound();
      } else { this.startRound(); }
    };
    btn.on('pointerdown', cleanup);
    this.solutionCard = { destroy: cleanup };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION C: Broken Pattern — Rolling Balls on a Ramp
// ═══════════════════════════════════════════════════════════════════════════════
// INTRINSIC DESIGN: The sequence is shown as balls rolling down a track and
// landing on pegs whose heights are proportional to value. A consistent rule
// produces evenly spaced landings. When a ball's value breaks the pattern, it
// visibly LANDS WRONG — offset from the predicted landing line. The learner
// can watch the balls roll and click the one that misses. The physical anomaly
// IS the validation; the math is discovered from the visible broken rhythm.
// ═══════════════════════════════════════════════════════════════════════════════
class BrokenPatternScene extends Phaser.Scene {
  constructor() { super('BrokenPatternScene'); }

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

    // Build sequence with one broken value
    const data = getPatternRound(this.round);
    // Use the AI sequence as base; if AI target matches arithmetic continuation, inject a break mid-sequence.
    let base = data.sequence.slice();
    // If base already looks broken, detect by rule check; else inject break
    const rule = inferRule(base);
    let brokenIdx = -1;
    for (let i = 2; i < base.length; i++) {
      if (rule.apply(base[i-1]) !== base[i]) { brokenIdx = i; break; }
    }
    if (brokenIdx < 0) {
      // Inject a break
      brokenIdx = 1 + Math.floor(Math.random() * (base.length - 2));
      const correctVal = base[brokenIdx];
      const delta = (Math.random() > 0.5 ? 1 : -1) * (Math.max(1, Math.floor(Math.abs(rule.val || 2) * 0.6)) + 1);
      base[brokenIdx] = correctVal + delta;
      this.correctVal = correctVal;
    } else {
      // Compute correct value
      this.correctVal = rule.apply(base[brokenIdx - 1]);
    }
    this.sequence = base;
    this.brokenIdx = brokenIdx;
    this.rule = rule;
    this.locked = false;
    this._rd();
    this.promptLbl.setText('Roll the balls. One lands wrong. Click the OFF-BALL.');

    this._drawRamp();
    this._drawBalls();
    this._drawRollButton();
  }

  _drawRamp() {
    const W = this.W, H = this.H;
    // Compute ramp geometry
    this.rampLeft = W * 0.08;
    this.rampRight = W * 0.92;
    this.rampTop = H * 0.22;
    this.rampBottom = H * 0.62;
    // Ramp line
    this.rg.add(this.add.line(0, 0, this.rampLeft, this.rampTop, this.rampRight, this.rampBottom, hexToNum(COL_SECONDARY), 1).setLineWidth(4).setOrigin(0,0).setDepth(3));
    // Ground
    this.groundY = H * 0.68;
    this.rg.add(this.add.rectangle(W/2, this.groundY + 4, W, 6, hexToNum(COL_SECONDARY), 0.6).setDepth(3));
    // Expected landing line (predicted by rule from first value)
    this.pegs = [];
    // Each ball gets a peg at x proportional to index
    const n = this.sequence.length;
    for (let i = 0; i < n; i++) {
      const x = this.rampLeft + (i / Math.max(1, n-1)) * (this.rampRight - this.rampLeft);
      // Peg height represents the value the rule PREDICTS (relative)
      const predicted = (i === 0) ? this.sequence[0] : this.rule.apply(this._predictedAt(i-1));
      this.pegs.push({ x, predicted });
    }
  }

  _predictedAt(i) {
    // Predicted value at index i if rule held perfectly from seq[0]
    let v = this.sequence[0];
    for (let k = 1; k <= i; k++) v = this.rule.apply(v);
    return v;
  }

  _drawBalls() {
    this.ballObjs = [];
    const maxVal = Math.max.apply(null, this.sequence.map(v => Math.abs(v))) || 1;
    const allPredicted = this.sequence.map((_, i) => this._predictedAt(i));
    const allMaxForScale = Math.max(maxVal, Math.max.apply(null, allPredicted.map(v => Math.abs(v))));
    const H = this.H;
    // Starting positions at top of ramp
    this.sequence.forEach((val, i) => {
      const peg = this.pegs[i];
      // Actual landing Y — proportional to value (smaller value = higher on ground? We'll show as column height)
      const colHeight = 10 + (Math.abs(val) / allMaxForScale) * (H * 0.18);
      const landingY = this.groundY - colHeight/2;
      const startX = this.rampLeft + 20 + i * 2; // stagger along top
      const startY = this.rampTop - 20;
      const ball = this.add.circle(startX, startY, 14, hexToNum(COL_ACCENT), 1).setStrokeStyle(2, hexToNum(COL_PRIMARY)).setDepth(8);
      const lbl = this.add.text(startX, startY, String(val), {
        fontSize: '13px', color: '#000', fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(9);
      ball.setInteractive({ useHandCursor: true });
      ball.on('pointerdown', () => this._clickBall(i));
      this.rg.add(ball); this.rg.add(lbl);
      this.ballObjs.push({ ball, lbl, val, i, colHeight, landingY, targetX: peg.x, predicted: peg.predicted });
    });
  }

  _drawRollButton() {
    const W = this.W, H = this.H;
    const btn = this.add.rectangle(W/2, H - 50, 180, 40, hexToNum(COL_PRIMARY), 1).setInteractive({ useHandCursor: true }).setDepth(10);
    const lbl = this.add.text(W/2, H - 50, 'Roll the balls →', {
      fontSize: '14px', color: '#fff', fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);
    btn.on('pointerdown', () => { if (!this.rolled) this._rollAll(btn, lbl); });
    this.rg.add(btn); this.rg.add(lbl);
    this.rollBtn = btn; this.rollLbl = lbl;
  }

  _rollAll(btn, lbl) {
    this.rolled = true;
    btn.disableInteractive(); btn.setFillStyle(hexToNum(COL_SECONDARY), 0.5);
    lbl.setText('rolling...');
    // Tween each ball down the ramp to its landing column
    this.ballObjs.forEach((b, i) => {
      this.time.delayedCall(i * 220, () => {
        // First slide down the ramp to the peg's x at groundY
        this.tweens.add({
          targets: [b.ball, b.lbl],
          x: b.targetX,
          y: this.groundY - 14,
          duration: 650,
          ease: 'Quad.easeIn',
          onComplete: () => {
            // Bounce up to final landing height (proportional to actual value)
            const isBroken = (i === this.brokenIdx);
            this.tweens.add({
              targets: [b.ball, b.lbl],
              y: b.landingY,
              duration: 400,
              ease: isBroken ? 'Back.easeOut' : 'Quad.easeOut',
              onComplete: () => {
                if (isBroken) {
                  // Visible wobble — the physical anomaly
                  this.tweens.add({
                    targets: [b.ball, b.lbl],
                    x: '+=8', yoyo: true, repeat: 3, duration: 80
                  });
                  b.ball.setFillStyle(hexToNum(COL_DANGER));
                }
              }
            });
          }
        });
      });
    });
    // Enable the final-state check after all roll
    this.time.delayedCall(this.ballObjs.length * 220 + 1400, () => {
      lbl.setText('click the OFF-BALL');
    });
  }

  _clickBall(i) {
    if (this.locked) return;
    if (i === this.brokenIdx) {
      this.locked = true;
      this.cameras.main.flash(200, 34, 197, 94);
      heroCheer(this, this.hero);
      const b = this.ballObjs[i];
      b.ball.setFillStyle(hexToNum(COL_ACCENT));
      b.lbl.setText(String(this.correctVal));
      b.lbl.setColor(COL_ACCENT);
      gameScore += 10 * (this.round + 1);
      this.scoreLbl.setText('Score: ' + gameScore);
      this._showSolutionCard(true);
    } else {
      this.cameras.main.shake(220, 0.012);
      heroShake(this, this.hero);
      this.lives--; this._rh();
      const b = this.ballObjs[i];
      b.ball.setFillStyle(hexToNum(COL_DANGER));
      this.time.delayedCall(280, () => b.ball.setFillStyle(hexToNum(COL_ACCENT)));
      if (this.lives <= 0) { this.time.delayedCall(600, () => this.scene.start('LoseScene', { score: gameScore })); }
    }
  }

  _showSolutionCard(correct) {
    const W = this.W, H = this.H;
    const backdrop = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.6).setDepth(50);
    const card = this.add.rectangle(W/2, H/2, W - 50, 220, 0x18181b, 1).setStrokeStyle(2, hexToNum(COL_ACCENT)).setDepth(51);
    const title = this.add.text(W/2, H/2 - 70, 'Pattern restored!', {
      fontSize: '20px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(52);
    const ruleLine = this.add.text(W/2, H/2 - 20, 'rule: ' + this.rule.label, {
      fontSize: '22px', color: COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(52);
    const fixLine = this.add.text(W/2, H/2 + 16, 'off-ball was ' + this.sequence[this.brokenIdx] + ' — should be ' + this.correctVal, {
      fontSize: '14px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif"
    }).setOrigin(0.5).setDepth(52);
    const btn = this.add.rectangle(W/2, H/2 + 70, 220, 44, hexToNum(COL_ACCENT), 1).setInteractive({ useHandCursor: true }).setDepth(52);
    const btnLbl = this.add.text(W/2, H/2 + 70, this.round + 1 >= TOTAL_ROUNDS ? 'Finish!' : 'Got it! Next round →', {
      fontSize: '14px', color: '#000', fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(53);
    const cleanup = () => {
      [backdrop, card, title, ruleLine, fixLine, btn, btnLbl].forEach(o => o.destroy());
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
