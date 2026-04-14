// Middle School Gaps — Phaser engine with 6 game options.
// Math: Inequalities, signed division, fractions/decimals, number classification, scientific notation, proof ordering.
// Options: inequality-grapher, signed-divide, fraction-to-decimal, number-classifier, sci-notation, proof-stepper
//
// INTRINSIC DESIGN PRINCIPLE
// --------------------------
// Every game here teaches the concept through PHYSICAL manipulation, not through
// typed answers or menu-selection quiz wrappers. The interaction *is* the math.
// Pattern modeled on MysterySideScene in balance-systems-phaser.ts.
//
//  * Math prompt up top.
//  * Physical/visual manipulation only — drag, slide, shade, snap.
//  * Live feedback during interaction (glow, shimmer, color, snap).
//  * Auto-detect success — no Check buttons.
//  * Solution reveal card with "Got it! Next round →" that explains the concept.
//  * 5 rounds, per-scene fallback variation when AI rounds are absent.
//  * Hero visible at W*0.88, H*0.55, scale 0.8.

import type { ThemeConfig, MathParams, GameOption } from "./engine-types"
import { phaserGame } from "./base-phaser-template"
import { getOptionDef } from "./game-option-registry"

export function middleSchoolGapsPhaserEngine(
  config: ThemeConfig,
  math: MathParams,
  option: GameOption = "inequality-grapher"
): string {
  const validOptions = ["inequality-grapher", "signed-divide", "fraction-to-decimal", "number-classifier", "sci-notation", "proof-stepper"]
  const activeOption = validOptions.includes(option) ? option : "inequality-grapher"
  const optDef = getOptionDef(activeOption)
  const sceneMap: Record<string, string> = {
    "inequality-grapher": "InequalityGrapherScene",
    "signed-divide": "SignedDivideScene",
    "fraction-to-decimal": "FractionToDecimalScene",
    "number-classifier": "NumberClassifierScene",
    "sci-notation": "SciNotationScene",
    "proof-stepper": "ProofStepperScene",
  }
  return phaserGame({
    config, math, option: activeOption,
    sceneName: sceneMap[activeOption],
    introText: optDef?.introText || "Discover middle school math through play!",
    helpText: optDef?.helpText || "Manipulate the pieces — the game shows you when you're right.",
    gameSceneCode: GAME_SCENES,
  })
}

const GAME_SCENES = `
// ─── Shared base: chrome, solution card, round advance ────────────────────────
// All 6 scenes extend this so the score/hearts/dots/hero chrome and the
// solution-reveal card are written once and behave identically.
class GapsBaseScene extends Phaser.Scene {
  _buildChrome() {
    this.W = this.scale.width; this.H = this.scale.height;
    if (typeof this.round !== 'number') this.round = 0;
    if (typeof this.lives !== 'number') this.lives = MAX_LIVES;
    const bg = this.add.image(this.W/2, this.H/2, 'bg');
    bg.setScale(Math.max(this.W/bg.width, this.H/bg.height));
    this.add.rectangle(this.W/2, this.H/2, this.W, this.H, 0x000000, 0.68);
    this.scoreLbl = this.add.text(this.W-14, 14, 'Score: '+gameScore, {
      fontSize:'16px', color: COL_ACCENT, fontFamily:"'Lexend', system-ui", fontStyle:'bold'
    }).setOrigin(1,0).setDepth(10);
    this.heartsGroup = this.add.group();
    this.dotGroup = this.add.group();
    this._redrawHearts(); this._redrawDots();
    // Hero placed per spec: W*0.88, H*0.55, scale 0.8
    this.hero = addCharacter(this, this.W*0.88, this.H*0.55, 0.8);
  }
  _redrawHearts() {
    this.heartsGroup.clear(true, true);
    for (let i=0; i<this.lives; i++)
      this.heartsGroup.add(this.add.text(14+i*22, 14, '♥', { fontSize:'18px', color: COL_DANGER }).setDepth(10));
  }
  _redrawDots() {
    this.dotGroup.clear(true, true);
    for (let i=0; i<TOTAL_ROUNDS; i++) {
      const c = i<this.round ? COL_ACCENT : (i===this.round ? COL_PRIMARY : '#555555');
      this.dotGroup.add(this.add.circle(this.W/2-40+i*20, this.H-16, 5, hexToNum(c)).setDepth(10));
    }
  }
  _win(explanationLines) {
    gameScore += 10 * (this.round + 1);
    this.scoreLbl.setText('Score: ' + gameScore);
    this.cameras.main.flash(140, 34, 197, 94);
    heroCheer(this, this.hero);
    this._showSolutionCard(explanationLines);
  }
  _showSolutionCard(lines) {
    const W = this.W, H = this.H;
    const backdrop = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.6).setDepth(50);
    const card = this.add.rectangle(W/2, H*0.5, W - 60, Math.min(280, 80 + lines.length*30), 0x18181b, 1)
      .setStrokeStyle(2, hexToNum(COL_ACCENT)).setDepth(51);
    const h1 = this.add.text(W/2, H*0.5 - card.height/2 + 26, 'You discovered it!', {
      fontSize:'20px', color: COL_ACCENT, fontFamily:"'Space Grotesk', sans-serif", fontStyle:'bold'
    }).setOrigin(0.5).setDepth(52);
    const texts = [];
    lines.forEach((ln, i) => {
      const t = this.add.text(W/2, H*0.5 - card.height/2 + 58 + i*26, ln, {
        fontSize:'13px', color: COL_TEXT, fontFamily:"'Lexend', system-ui",
        wordWrap:{ width: W-100 }, align:'center'
      }).setOrigin(0.5, 0).setDepth(52).setAlpha(0);
      texts.push(t);
      this.time.delayedCall(140*i, () => this.tweens.add({ targets: t, alpha: 1, duration: 260 }));
    });
    const btnY = H*0.5 + card.height/2 - 30;
    const btnLabel = this.round + 1 >= TOTAL_ROUNDS ? 'Finish!' : 'Got it! Next round →';
    const btnBg = this.add.rectangle(W/2, btnY, 220, 40, hexToNum(COL_ACCENT), 1)
      .setInteractive({ useHandCursor: true }).setDepth(52).setAlpha(0);
    const btnLbl = this.add.text(W/2, btnY, btnLabel, {
      fontSize:'14px', color:'#000', fontFamily:"'Lexend', system-ui", fontStyle:'bold'
    }).setOrigin(0.5).setDepth(53).setAlpha(0);
    this.time.delayedCall(140*lines.length + 200, () =>
      this.tweens.add({ targets:[btnBg, btnLbl], alpha:1, duration:260 }));
    btnBg.on('pointerdown', () => {
      [backdrop, card, h1, ...texts, btnBg, btnLbl].forEach(o => o.destroy());
      this.round++;
      if (this.round >= TOTAL_ROUNDS) this.scene.start('VictoryScene', { score: gameScore });
      else { this._clearRoundGroup(); this.startRound(); }
    });
  }
  _clearRoundGroup() { if (this.rg) { this.rg.clear(true, true); this.rg.destroy(true); } this.rg = this.add.group(); }
  _loseLife() {
    this.lives--; this._redrawHearts();
    this.cameras.main.shake(140, 0.006);
    heroShake(this, this.hero);
    if (this.lives <= 0) this.time.delayedCall(400, () => this.scene.start('LoseScene', { score: gameScore }));
  }
}


// ═════════════════════════════════════════════════════════════════════════════
// InequalityGrapherScene — Interactive Shading Discovery
// ─────────────────────────────────────────────────────────────────────────────
// INTRINSIC: Student drags a circle to mark the boundary, clicks it to toggle
// OPEN/CLOSED, and paints a shaded region with a drag. The game continuously
// tests sample numbers inside the shading — if every shaded number satisfies
// the inequality, the region GLOWS green and locks. The shading IS the graph.
// No Check button. No symbol menu. The visual captures the meaning of ">",
// "≥", etc. through the act of marking the boundary and the region.
// ═════════════════════════════════════════════════════════════════════════════
class InequalityGrapherScene extends GapsBaseScene {
  constructor() { super('InequalityGrapherScene'); }
  create() { this._buildChrome(); this.rg = this.add.group(); this.startRound(); }

  startRound() {
    this._clearRoundGroup();
    this._redrawDots();
    const data = getRound(this.round);
    const W = this.W, H = this.H;

    // Per-round fallback variation (symbol index 0:> 1:< 2:>= 3:<=)
    const variation = [
      { n: 3, sym: 0 }, { n: -2, sym: 1 }, { n: 5, sym: 2 }, { n: 0, sym: 3 }, { n: -4, sym: 0 }
    ];
    const fb = variation[this.round % variation.length];
    const isDefault = !data || data.prompt === 'Solve this!';
    const boundary = isDefault ? fb.n : (typeof data.target === 'number' ? data.target : fb.n);
    const symIdx = isDefault ? fb.sym
      : (Array.isArray(data.items) && typeof data.items[0] === 'number' ? data.items[0] : fb.sym);
    const symStr = ['>', '<', '≥', '≤'][symIdx] || '>';
    const strict = symIdx === 0 || symIdx === 1;   // strict → open circle
    const goesRight = symIdx === 0 || symIdx === 2; // x > or x ≥ → shade right

    this.boundary = boundary; this.strict = strict; this.goesRight = goesRight;

    // Prompt
    this.rg.add(this.add.text(W/2, H*0.08, isDefault ? ('Graph: x ' + symStr + ' ' + boundary) : data.prompt, {
      fontSize:'16px', color: COL_PRIMARY, fontFamily:"'Space Grotesk', sans-serif", fontStyle:'bold',
      wordWrap:{ width: W-60 }, align:'center'
    }).setOrigin(0.5, 0).setDepth(6));
    this.rg.add(this.add.text(W/2, H*0.16, 'x ' + symStr + ' ' + boundary, {
      fontSize:'22px', color: COL_ACCENT, fontFamily:"'Space Grotesk', sans-serif", fontStyle:'bold'
    }).setOrigin(0.5).setDepth(6));

    // Number line
    const nlY = H*0.42, nlLeft = W*0.1, nlRight = W*0.9;
    const range = 10;
    const pxPer = (nlRight - nlLeft) / (range * 2);
    const valToX = (v) => nlLeft + (v + range) * pxPer;
    this.valToX = valToX; this.nlLeft = nlLeft; this.nlRight = nlRight; this.nlY = nlY; this.range = range; this.pxPer = pxPer;

    this.rg.add(this.add.rectangle((nlLeft+nlRight)/2, nlY, nlRight-nlLeft, 3, hexToNum(COL_TEXT), 0.55).setDepth(5));
    for (let v=-range; v<=range; v++) {
      const x = valToX(v);
      const major = v % 5 === 0;
      this.rg.add(this.add.rectangle(x, nlY, 1, major?14:8, hexToNum(COL_TEXT), major?0.7:0.35).setDepth(5));
      if (major) this.rg.add(this.add.text(x, nlY+12, String(v), {
        fontSize:'11px', color: COL_TEXT, fontFamily:"'Lexend', system-ui"
      }).setOrigin(0.5, 0).setDepth(5));
    }

    // Draggable circle (start in a holder area)
    const holderY = H*0.62;
    this.rg.add(this.add.text(W/2, holderY - 30, 'Drag the circle onto the number line. Click it to toggle open/closed. Then drag across the line to shade.', {
      fontSize:'11px', color: COL_TEXT, fontFamily:"'Lexend', system-ui",
      wordWrap:{ width: W-80 }, align:'center', alpha: 0.7
    }).setOrigin(0.5).setDepth(6));

    this.circleOpen = true;   // starts open
    this.circlePlaced = false;
    this.circleVal = null;
    this.circle = this.add.circle(W*0.3, holderY, 12, 0x000000, 0).setStrokeStyle(3, hexToNum(COL_PRIMARY))
      .setInteractive({ useHandCursor: true, draggable: true }).setDepth(9);
    this.rg.add(this.circle);
    this.input.setDraggable(this.circle);
    this.circle.on('drag', (p, dx, dy) => {
      if (this.locked) return;
      this.circle.x = dx;
      this.circle.y = Math.abs(dy - nlY) < 40 ? nlY : dy;
    });
    this.circle.on('dragend', () => {
      if (this.locked) return;
      if (Math.abs(this.circle.y - nlY) < 20) {
        const v = Math.round((this.circle.x - nlLeft)/pxPer - range);
        const clamped = Math.max(-range, Math.min(range, v));
        this.circle.x = valToX(clamped);
        this.circle.y = nlY;
        this.circleVal = clamped;
        this.circlePlaced = true;
        this._updateShadeTest();
      }
    });
    this.circle.on('pointerup', () => {
      // Tap-toggle only if it was a pure click (no drag)
      if (this.locked) return;
      if (this._circleDragDist < 4 && this.circlePlaced) {
        this.circleOpen = !this.circleOpen;
        this._refreshCircleStyle();
        this._updateShadeTest();
      }
      this._circleDragDist = 0;
    });
    this.circle.on('dragstart', () => { this._circleDragDist = 0; });
    this.circle.on('drag', (p, dx, dy) => { this._circleDragDist = Math.max(this._circleDragDist||0, Math.abs(dx - this.circle.x) + Math.abs(dy - this.circle.y)); });

    // Shading drag: a second handle (arrow) the player drags along the line
    this.shade = null;       // Phaser rect for shaded region
    this.shadeFrom = null;   // starting x (at boundary)
    this.shadeTo = null;
    this.locked = false;

    // Big invisible hit strip ABOVE the number line for dragging shading
    const shadeStrip = this.add.rectangle((nlLeft+nlRight)/2, nlY - 18, nlRight-nlLeft, 36, 0x000000, 0.001)
      .setInteractive({ useHandCursor: true }).setDepth(4);
    this.rg.add(shadeStrip);
    let painting = false;
    shadeStrip.on('pointerdown', (p) => {
      if (this.locked || !this.circlePlaced) return;
      painting = true;
      this.shadeFrom = valToX(this.circleVal);
      this.shadeTo = p.x;
      this._drawShade();
    });
    shadeStrip.on('pointermove', (p) => {
      if (!painting || this.locked) return;
      this.shadeTo = p.x;
      this._drawShade();
    });
    const stopPaint = () => {
      if (!painting) return;
      painting = false;
      this._updateShadeTest();
    };
    shadeStrip.on('pointerup', stopPaint);
    shadeStrip.on('pointerupoutside', stopPaint);

    // Shade color label (updated live)
    this.shadeStatus = this.add.text(W/2, H*0.52, '', {
      fontSize:'12px', color: COL_TEXT, fontFamily:"'Lexend', system-ui"
    }).setOrigin(0.5).setDepth(6);
    this.rg.add(this.shadeStatus);

    this._refreshCircleStyle();
  }

  _refreshCircleStyle() {
    // Open: outline only (fillAlpha 0). Closed: filled.
    if (this.circleOpen) this.circle.setFillStyle(0x000000, 0);
    else this.circle.setFillStyle(hexToNum(COL_PRIMARY), 1);
  }

  _drawShade() {
    if (this.shade) this.shade.destroy();
    const fx = Math.min(this.shadeFrom, this.shadeTo);
    const w = Math.abs(this.shadeTo - this.shadeFrom);
    this.shade = this.add.rectangle(fx + w/2, this.nlY, w, 10, hexToNum(COL_PRIMARY), 0.35).setDepth(4);
    this.rg.add(this.shade);
  }

  _sampleSatisfies(v) {
    if (v === this.boundary) return !this.strict; // closed includes boundary
    return this.goesRight ? v > this.boundary : v < this.boundary;
  }

  _updateShadeTest() {
    if (!this.circlePlaced || !this.shade) return;
    // Test every integer in shaded region.
    const fx = Math.min(this.shadeFrom, this.shadeTo);
    const tx = Math.max(this.shadeFrom, this.shadeTo);
    const vFrom = Math.round((fx - this.nlLeft)/this.pxPer - this.range);
    const vTo   = Math.round((tx - this.nlLeft)/this.pxPer - this.range);
    // Requirements:
    //  (a) circleVal === boundary
    //  (b) open vs closed matches strictness
    //  (c) direction of shade matches (> shade right, < shade left)
    //  (d) shade reaches near the edge of the line (captures all values in direction)
    let allSatisfy = true;
    const samples = [];
    for (let v=vFrom; v<=vTo; v++) samples.push(v);
    // Include boundary as sample if shaded region touches it
    if (vFrom <= this.boundary && this.boundary <= vTo && !this.strict) samples.push(this.boundary);
    samples.forEach(v => { if (!this._sampleSatisfies(v)) allSatisfy = false; });
    const boundaryOk = this.circleVal === this.boundary;
    const openOk = this.circleOpen === this.strict;
    const dirRight = (this.shadeTo > this.shadeFrom);
    const dirOk = dirRight === this.goesRight;
    const reachesEdge = this.goesRight ? (tx >= this.nlRight - this.pxPer*0.6) : (fx <= this.nlLeft + this.pxPer*0.6);

    if (allSatisfy && boundaryOk && openOk && dirOk && reachesEdge && samples.length >= 2) {
      // GLOW + LOCK
      this.locked = true;
      this.shade.setFillStyle(hexToNum(COL_ACCENT), 0.55);
      this.shadeStatus.setText('Shading captures every number — locked in!').setColor(COL_ACCENT);
      const sym = ['>','<','≥','≤'][(this.strict?0:2) + (this.goesRight?0:1)];
      this.time.delayedCall(600, () => this._win([
        'Your shading covered every x that makes x ' + sym + ' ' + this.boundary + ' true.',
        this.strict ? 'Open circle means the boundary ' + this.boundary + ' is NOT included.'
                    : 'Closed circle means the boundary ' + this.boundary + ' IS included.',
        'The arrow keeps going forever in the direction of the inequality.'
      ]));
    } else {
      // Dim — tells them it doesn't hold yet, but no life lost
      this.shade.setFillStyle(hexToNum(COL_PRIMARY), 0.2);
      let msg = 'Not quite — keep adjusting.';
      if (!boundaryOk) msg = 'Boundary circle should be AT the number in the inequality.';
      else if (!openOk) msg = (this.strict ? 'Strict inequality (> or <) wants an OPEN circle.'
                                           : 'Non-strict (≥ or ≤) wants a CLOSED circle.');
      else if (!dirOk) msg = 'Try shading the other direction.';
      else if (!reachesEdge) msg = 'Extend your shading to the edge of the line.';
      else if (!allSatisfy) msg = 'Some shaded numbers don\\u2019t satisfy the inequality.';
      this.shadeStatus.setText(msg).setColor(COL_TEXT);
    }
  }
}


// ═════════════════════════════════════════════════════════════════════════════
// SignedDivideScene — Two-Stage Physical Division
// ─────────────────────────────────────────────────────────────────────────────
// INTRINSIC: Stage 1 (SIGN) — two particle pools (dividend sign, divisor sign).
// Player drags a particle from each pool into a "reactor". Same signs →
// GREEN ball; opposite signs → RED ball. The visual reaction teaches the
// sign rule. Stage 2 (MAGNITUDE) — |dividend| unit blocks split physically
// into |divisor|-sized groups; the number of groups is the quotient. The
// result ball's color + count IS the answer. No typing.
// ═════════════════════════════════════════════════════════════════════════════
class SignedDivideScene extends GapsBaseScene {
  constructor() { super('SignedDivideScene'); }
  create() { this._buildChrome(); this.rg = this.add.group(); this.startRound(); }

  startRound() {
    this._clearRoundGroup();
    this._redrawDots();
    const data = getRound(this.round);
    const W = this.W, H = this.H;

    // Per-round fallback variation (dividend, divisor)
    const variation = [ [-12, 3], [20, -4], [-15, -5], [18, 6], [-28, 7] ];
    const fb = variation[this.round % variation.length];
    const isDefault = !data || data.prompt === 'Solve this!';
    let dividend = fb[0], divisor = fb[1];
    if (!isDefault) {
      if (Array.isArray(data.items) && data.items.length >= 2 &&
          typeof data.items[0] === 'number' && typeof data.items[1] === 'number' && data.items[1] !== 0) {
        dividend = data.items[0]; divisor = data.items[1];
      } else if (typeof data.target === 'number') {
        // Try to derive from target
        dividend = data.target * fb[1];
        divisor = fb[1];
      }
    }
    this.dividend = dividend; this.divisor = divisor;
    this.answer = dividend / divisor;
    this.stage = 1;

    // Prompt
    this.rg.add(this.add.text(W/2, H*0.08, dividend + ' ÷ ' + divisor + ' = ?', {
      fontSize:'26px', color: COL_ACCENT, fontFamily:"'Space Grotesk', sans-serif", fontStyle:'bold'
    }).setOrigin(0.5, 0).setDepth(6));
    this.stageLbl = this.add.text(W/2, H*0.16, 'Stage 1 — Find the SIGN of the answer.', {
      fontSize:'13px', color: COL_TEXT, fontFamily:"'Lexend', system-ui"
    }).setOrigin(0.5, 0).setDepth(6);
    this.rg.add(this.stageLbl);

    this._buildSignStage();
  }

  _buildSignStage() {
    const W = this.W, H = this.H;
    const dSign = this.dividend >= 0 ? '+' : '-';
    const vSign = this.divisor  >= 0 ? '+' : '-';

    // Two pools
    this.rg.add(this.add.text(W*0.22, H*0.26, 'Dividend pool (' + this.dividend + ')', {
      fontSize:'11px', color: COL_TEXT, fontFamily:"'Lexend', system-ui"
    }).setOrigin(0.5).setDepth(6));
    this.rg.add(this.add.text(W*0.78, H*0.26, 'Divisor pool (' + this.divisor + ')', {
      fontSize:'11px', color: COL_TEXT, fontFamily:"'Lexend', system-ui"
    }).setOrigin(0.5).setDepth(6));

    // Create draggable particle in each pool (sign-bearing)
    const mkParticle = (x, y, sign) => {
      const col = sign === '+' ? COL_ACCENT : COL_DANGER;
      const c = this.add.circle(x, y, 22, hexToNum(col), 0.9)
        .setStrokeStyle(2, 0xffffff).setInteractive({ useHandCursor: true, draggable: true }).setDepth(9);
      const lbl = this.add.text(x, y, sign, { fontSize:'20px', color:'#fff', fontFamily:"'Space Grotesk', sans-serif", fontStyle:'bold' })
        .setOrigin(0.5).setDepth(10);
      this.rg.add(c); this.rg.add(lbl);
      this.input.setDraggable(c);
      const homeX = x, homeY = y;
      c.on('drag', (p, dx, dy) => { c.x = dx; c.y = dy; lbl.x = dx; lbl.y = dy; });
      c.on('dragend', () => {
        // Check if dropped in reactor (center)
        const rx = W/2, ry = H*0.42;
        if (Phaser.Math.Distance.Between(c.x, c.y, rx, ry) < 60) {
          // Snap into reactor slot
          c._inReactor = true;
          c.disableInteractive();
          // Place in one of two slots depending on which particle
          if (c._which === 'dividend') { c.x = rx - 30; c.y = ry; lbl.x = rx - 30; lbl.y = ry; }
          else { c.x = rx + 30; c.y = ry; lbl.x = rx + 30; lbl.y = ry; }
          this._checkReactor();
        } else { c.x = homeX; c.y = homeY; lbl.x = homeX; lbl.y = homeY; }
      });
      return c;
    };
    const p1 = mkParticle(W*0.22, H*0.32, dSign); p1._which = 'dividend';
    const p2 = mkParticle(W*0.78, H*0.32, vSign); p2._which = 'divisor';
    this.particles = [p1, p2];

    // Reactor
    const rx = W/2, ry = H*0.42;
    this.rg.add(this.add.circle(rx, ry, 70, hexToNum(COL_SECONDARY), 0.15).setStrokeStyle(2, hexToNum(COL_SECONDARY), 0.5).setDepth(5));
    this.rg.add(this.add.text(rx, ry - 90, 'Drop one particle from each pool into the reactor', {
      fontSize:'11px', color: COL_TEXT, fontFamily:"'Lexend', system-ui", align:'center',
      wordWrap:{ width: W*0.6 }
    }).setOrigin(0.5).setDepth(6));
    this.reactorX = rx; this.reactorY = ry;
  }

  _checkReactor() {
    const both = this.particles.every(p => p._inReactor);
    if (!both) return;
    // Determine product sign
    const sameSign = (this.dividend >= 0) === (this.divisor >= 0);
    const W = this.W, H = this.H;
    // Emit result ball
    const col = sameSign ? COL_ACCENT : COL_DANGER;
    this.resultBall = this.add.circle(this.reactorX, this.reactorY, 26, hexToNum(col), 1)
      .setStrokeStyle(2, 0xffffff).setDepth(11);
    this.tweens.add({ targets: this.resultBall, scale:{ from: 0, to: 1 }, duration: 400, ease:'Back.easeOut' });
    this.rg.add(this.resultBall);
    this.stageLbl.setText(sameSign
      ? 'Same signs → GREEN ball → result is POSITIVE.'
      : 'Opposite signs → RED ball → result is NEGATIVE.');
    this.time.delayedCall(1100, () => this._startMagnitudeStage(sameSign));
  }

  _startMagnitudeStage(sameSign) {
    this.stage = 2;
    const W = this.W, H = this.H;
    // Hide sign stage particles
    this.particles.forEach(p => p.setVisible(false));
    this.stageLbl.setText('Stage 2 — Physically group ' + Math.abs(this.dividend) + ' blocks into groups of ' + Math.abs(this.divisor) + '.');

    // Layout: rows of dividend blocks that the player drags apart into groups of divisor.
    // We'll auto-animate the grouping for them — click "separate" to watch groups form.
    const total = Math.abs(this.dividend);
    const groupSize = Math.abs(this.divisor);
    const groups = Math.floor(total / groupSize);

    const startY = H*0.52;
    const blockSize = Math.min(22, (W*0.8)/total);
    const rowWidth = total * blockSize;
    const startX = W/2 - rowWidth/2 + blockSize/2;
    this.magBlocks = [];
    for (let i=0; i<total; i++) {
      const bx = startX + i * blockSize;
      const r = this.add.rectangle(bx, startY, blockSize - 2, blockSize - 2, hexToNum(COL_PRIMARY), 0.9)
        .setStrokeStyle(1, 0xffffff, 0.5).setDepth(8);
      this.magBlocks.push(r);
      this.rg.add(r);
    }

    // "Separate" button — big intrinsic action
    const btn = this.add.rectangle(W/2, H*0.66, 220, 36, hexToNum(COL_PRIMARY), 1)
      .setInteractive({ useHandCursor: true }).setDepth(10);
    const btnLbl = this.add.text(W/2, H*0.66, 'Separate into groups →', {
      fontSize:'13px', color:'#fff', fontFamily:"'Lexend', system-ui", fontStyle:'bold'
    }).setOrigin(0.5).setDepth(11);
    this.rg.add(btn); this.rg.add(btnLbl);

    btn.on('pointerdown', () => {
      btn.disableInteractive();
      // Animate each block into its group position
      const groupGap = 30;
      const groupWidth = groupSize * blockSize;
      const totalW = groups * groupWidth + (groups - 1) * groupGap;
      const gStartX = W/2 - totalW/2;
      this.magBlocks.forEach((b, i) => {
        const gi = Math.floor(i / groupSize);
        const inner = i % groupSize;
        const nx = gStartX + gi * (groupWidth + groupGap) + inner * blockSize + blockSize/2;
        this.tweens.add({ targets: b, x: nx, duration: 600, delay: i*30, ease:'Cubic.easeOut' });
      });
      // After animation, show group count label under each group
      this.time.delayedCall(700 + total*30, () => {
        const groupGapLocal = 30;
        const groupWidthLocal = groupSize * blockSize;
        const totalWLocal = groups * groupWidthLocal + (groups - 1) * groupGapLocal;
        const gStartXLocal = W/2 - totalWLocal/2;
        for (let g=0; g<groups; g++) {
          const cx = gStartXLocal + g * (groupWidthLocal + groupGapLocal) + groupWidthLocal/2;
          this.rg.add(this.add.text(cx, startY + blockSize + 6, 'group ' + (g+1), {
            fontSize:'10px', color: COL_ACCENT, fontFamily:"'Lexend', system-ui"
          }).setOrigin(0.5, 0).setDepth(8));
        }
        // Result count next to the color ball
        const sign = sameSign ? '+' : '-';
        const finalVal = (sameSign ? 1 : -1) * groups;
        this.rg.add(this.add.text(this.reactorX, this.reactorY + 44, String(finalVal), {
          fontSize:'22px', color: sameSign ? COL_ACCENT : COL_DANGER,
          fontFamily:"'Space Grotesk', sans-serif", fontStyle:'bold'
        }).setOrigin(0.5, 0).setDepth(11));
        this.time.delayedCall(600, () => this._win([
          Math.abs(this.dividend) + ' split into groups of ' + Math.abs(this.divisor) + ' makes ' + groups + ' groups.',
          sameSign ? 'Same signs → positive.' : 'Opposite signs → negative.',
          this.dividend + ' ÷ ' + this.divisor + ' = ' + finalVal
        ]));
      });
    });
  }
}


// ═════════════════════════════════════════════════════════════════════════════
// FractionToDecimalScene — Dual Number Line
// ─────────────────────────────────────────────────────────────────────────────
// INTRINSIC: Two parallel number lines stacked. Top: fraction marks.
// Bottom: decimal marks. The player drags a vertical MARKER left-right; as
// they drag, both lines read the same horizontal position, so the fraction
// on the top AUTO-CORRESPONDS to the decimal on the bottom. Target fraction
// is named; the player slides the marker to the exact fraction, and the
// bottom line reveals the decimal equivalent. The visual correspondence IS
// the conversion. No typing.
// ═════════════════════════════════════════════════════════════════════════════
class FractionToDecimalScene extends GapsBaseScene {
  constructor() { super('FractionToDecimalScene'); }
  create() { this._buildChrome(); this.rg = this.add.group(); this.startRound(); }

  startRound() {
    this._clearRoundGroup();
    this._redrawDots();
    const data = getRound(this.round);
    const W = this.W, H = this.H;

    // Per-round fallback: common fraction/decimal pairs
    const variation = [
      { num: 1, den: 4, dec: 0.25 },
      { num: 3, den: 4, dec: 0.75 },
      { num: 1, den: 2, dec: 0.5 },
      { num: 2, den: 5, dec: 0.4 },
      { num: 3, den: 8, dec: 0.375 },
    ];
    const fb = variation[this.round % variation.length];
    const isDefault = !data || data.prompt === 'Solve this!';
    let num = fb.num, den = fb.den;
    if (!isDefault && Array.isArray(data.items) && data.items.length >= 2 &&
        data.items[0] > 0 && data.items[1] > 0) { num = data.items[0]; den = data.items[1]; }
    const correctDec = num / den;
    this.num = num; this.den = den; this.correctDec = correctDec;

    // Prompt
    this.rg.add(this.add.text(W/2, H*0.07, 'Slide the marker to ' + num + '/' + den + ' on the top line.', {
      fontSize:'14px', color: COL_PRIMARY, fontFamily:"'Space Grotesk', sans-serif", fontStyle:'bold',
      align:'center', wordWrap:{ width: W-60 }
    }).setOrigin(0.5, 0).setDepth(6));
    this.rg.add(this.add.text(W/2, H*0.14, 'The bottom line shows the matching decimal.', {
      fontSize:'11px', color: COL_TEXT, fontFamily:"'Lexend', system-ui", alpha: 0.7
    }).setOrigin(0.5, 0).setDepth(6));

    // Number lines
    const left = W*0.1, right = W*0.88, lineLen = right - left;
    const topY = H*0.32, botY = H*0.52;

    // Top: fraction marks at 0, 1/den, 2/den, ..., den/den
    this.rg.add(this.add.line(0, 0, left, topY, right, topY, hexToNum(COL_TEXT)).setLineWidth(2).setOrigin(0, 0).setDepth(5));
    for (let i=0; i<=den; i++) {
      const x = left + (i/den) * lineLen;
      const isEnd = i===0 || i===den;
      this.rg.add(this.add.rectangle(x, topY, 1, 12, hexToNum(COL_ACCENT), isEnd?1:0.7).setDepth(5));
      const label = i===0 ? '0' : (i===den ? '1' : (i + '/' + den));
      this.rg.add(this.add.text(x, topY - 16, label, {
        fontSize:'11px', color: COL_ACCENT, fontFamily:"'Space Grotesk', sans-serif"
      }).setOrigin(0.5, 1).setDepth(5));
    }

    // Bottom: decimal marks at 0, 0.1, 0.2, ..., 1
    this.rg.add(this.add.line(0, 0, left, botY, right, botY, hexToNum(COL_TEXT)).setLineWidth(2).setOrigin(0, 0).setDepth(5));
    for (let i=0; i<=10; i++) {
      const x = left + (i/10) * lineLen;
      this.rg.add(this.add.rectangle(x, botY, 1, 12, hexToNum(COL_PRIMARY), i%5===0?1:0.6).setDepth(5));
      const label = (i/10).toFixed(1);
      this.rg.add(this.add.text(x, botY + 16, label, {
        fontSize:'10px', color: COL_PRIMARY, fontFamily:"'Space Grotesk', sans-serif"
      }).setOrigin(0.5, 0).setDepth(5));
    }

    // Vertical connector + draggable marker
    const markerStartX = left + 0.5*lineLen;
    this.marker = this.add.rectangle(markerStartX, (topY+botY)/2, 18, botY-topY+30, hexToNum(COL_SECONDARY), 0.2)
      .setInteractive({ useHandCursor: true, draggable: true }).setDepth(6);
    this.markerLine = this.add.rectangle(markerStartX, (topY+botY)/2, 2, botY-topY, 0xffffff, 1).setDepth(7);
    this.topDot = this.add.circle(markerStartX, topY, 8, hexToNum(COL_ACCENT), 1).setDepth(8);
    this.botDot = this.add.circle(markerStartX, botY, 8, hexToNum(COL_PRIMARY), 1).setDepth(8);
    this.rg.add(this.marker); this.rg.add(this.markerLine); this.rg.add(this.topDot); this.rg.add(this.botDot);

    // Readouts
    this.fracReadout = this.add.text(W/2, H*0.72, '', {
      fontSize:'22px', color: COL_ACCENT, fontFamily:"'Space Grotesk', sans-serif", fontStyle:'bold'
    }).setOrigin(0.5).setDepth(6);
    this.decReadout = this.add.text(W/2, H*0.78, '', {
      fontSize:'22px', color: COL_PRIMARY, fontFamily:"'Space Grotesk', sans-serif", fontStyle:'bold'
    }).setOrigin(0.5).setDepth(6);
    this.rg.add(this.fracReadout); this.rg.add(this.decReadout);

    this.left = left; this.right = right; this.lineLen = lineLen; this.topY = topY; this.botY = botY;
    this.locked = false;

    this.input.setDraggable(this.marker);
    this.marker.on('drag', (p, dx) => {
      if (this.locked) return;
      const nx = Phaser.Math.Clamp(dx, left, right);
      this.marker.x = nx; this.markerLine.x = nx; this.topDot.x = nx; this.botDot.x = nx;
      this._updateReadouts();
    });
    this.marker.on('dragend', () => { if (!this.locked) this._checkSnap(); });
    this._updateReadouts();
  }

  _updateReadouts() {
    const t = (this.marker.x - this.left) / this.lineLen; // 0..1
    // Snap fraction to nearest i/den for display
    const i = Math.round(t * this.den);
    const fracVal = i / this.den;
    this.fracReadout.setText(i===0 ? '0' : (i===this.den ? '1' : (i + '/' + this.den)));
    // Decimal: show the exact t to 3 places
    this.decReadout.setText(t.toFixed(3).replace(/0+$/,'').replace(/\\.$/,'') || '0');
  }

  _checkSnap() {
    const t = (this.marker.x - this.left) / this.lineLen;
    const correctT = this.num / this.den;
    if (Math.abs(t - correctT) < 0.02) {
      // Snap exactly, reveal decimal
      this.locked = true;
      const snapX = this.left + correctT * this.lineLen;
      this.tweens.add({ targets:[this.marker, this.markerLine, this.topDot, this.botDot], x: snapX, duration: 200 });
      this.time.delayedCall(220, () => {
        this.fracReadout.setText(this.num + '/' + this.den);
        this.decReadout.setText(this.correctDec.toString());
        this._win([
          this.num + '/' + this.den + ' and ' + this.correctDec + ' are at the SAME spot on the number line.',
          'That\\u2019s what conversion means — the same quantity, two notations.',
          this.num + '/' + this.den + ' = ' + this.correctDec
        ]);
      });
    }
  }
}


// ═════════════════════════════════════════════════════════════════════════════
// NumberClassifierScene — Number Line Physics
// ─────────────────────────────────────────────────────────────────────────────
// INTRINSIC: A number line with tick marks fills the screen. Candidate
// numbers float in a holder. When the player drags a number over the line:
//   - RATIONALS (fractions, terminating/repeating decimals) SNAP to their
//     exact tick position with a click.
//   - IRRATIONALS (√2, π, e, √3) SHIMMER and FLOAT above the line; they
//     cannot find a clean tick. The behavior itself teaches "can/can't be
//     expressed as a/b".
// After feeling this, the player drops each number into the correct BIN.
// The physics already revealed the answer — no Check button needed.
// ═════════════════════════════════════════════════════════════════════════════
class NumberClassifierScene extends GapsBaseScene {
  constructor() { super('NumberClassifierScene'); }
  create() { this._buildChrome(); this.rg = this.add.group(); this.startRound(); }

  startRound() {
    this._clearRoundGroup();
    this._redrawDots();
    const data = getRound(this.round);
    const W = this.W, H = this.H;

    // Each round: 4 numbers — mix of rational and irrational.
    // We store: { label, value, rational (bool) }
    const variation = [
      [ {l:'1/2', v:0.5, r:true}, {l:'√2', v:1.41421356, r:false}, {l:'0.75', v:0.75, r:true}, {l:'π', v:3.14159265, r:false} ],
      [ {l:'3/4', v:0.75, r:true}, {l:'√3', v:1.7320508, r:false}, {l:'0.333…', v:0.3333333, r:true}, {l:'e', v:2.71828, r:false} ],
      [ {l:'2', v:2, r:true}, {l:'√5', v:2.2360679, r:false}, {l:'-1/2', v:-0.5, r:true}, {l:'π/2', v:1.5707963, r:false} ],
      [ {l:'1.5', v:1.5, r:true}, {l:'√7', v:2.6457513, r:false}, {l:'5/4', v:1.25, r:true}, {l:'2π', v:6.2831853, r:false} ],
      [ {l:'0.2', v:0.2, r:true}, {l:'√10', v:3.1622776, r:false}, {l:'-3/2', v:-1.5, r:true}, {l:'√11', v:3.3166247, r:false} ],
    ];
    const nums = variation[this.round % variation.length];
    this.nums = nums;

    // Prompt
    this.rg.add(this.add.text(W/2, H*0.07, 'Feel the difference: drag each number onto the line. Rationals SNAP. Irrationals drift.', {
      fontSize:'12px', color: COL_PRIMARY, fontFamily:"'Space Grotesk', sans-serif", fontStyle:'bold',
      wordWrap:{ width: W-40 }, align:'center'
    }).setOrigin(0.5, 0).setDepth(6));
    this.rg.add(this.add.text(W/2, H*0.14, 'Then drop each into the correct bin below.', {
      fontSize:'11px', color: COL_TEXT, fontFamily:"'Lexend', system-ui", alpha: 0.7
    }).setOrigin(0.5, 0).setDepth(6));

    // Number line
    const nlY = H*0.33, nlLeft = W*0.1, nlRight = W*0.9;
    const range = 8;  // -8..+8
    const lineLen = nlRight - nlLeft;
    const valToX = (v) => nlLeft + ((v + range) / (range*2)) * lineLen;
    this.valToX = valToX; this.nlLeft = nlLeft; this.nlRight = nlRight; this.nlY = nlY; this.range = range;

    this.rg.add(this.add.rectangle((nlLeft+nlRight)/2, nlY, lineLen, 2, hexToNum(COL_TEXT), 0.5).setDepth(5));
    // Fine tick marks every 0.25
    for (let v=-range; v<=range; v+=0.25) {
      const x = valToX(v);
      const major = Math.abs(v - Math.round(v)) < 0.01;
      this.rg.add(this.add.rectangle(x, nlY, 1, major?12:4, hexToNum(COL_TEXT), major?0.8:0.25).setDepth(5));
      if (major && v % 2 === 0) this.rg.add(this.add.text(x, nlY + 10, String(v), {
        fontSize:'10px', color: COL_TEXT, fontFamily:"'Lexend', system-ui"
      }).setOrigin(0.5, 0).setDepth(5));
    }

    // Two bins at bottom
    const binY = H*0.82;
    const ratBin = this.add.rectangle(W*0.28, binY, W*0.4, 60, hexToNum(COL_ACCENT), 0.18)
      .setStrokeStyle(2, hexToNum(COL_ACCENT), 0.7).setDepth(4);
    const irrBin = this.add.rectangle(W*0.72, binY, W*0.4, 60, hexToNum(COL_DANGER), 0.18)
      .setStrokeStyle(2, hexToNum(COL_DANGER), 0.7).setDepth(4);
    this.rg.add(ratBin); this.rg.add(irrBin);
    this.rg.add(this.add.text(W*0.28, binY - 38, 'Rational', {
      fontSize:'14px', color: COL_ACCENT, fontFamily:"'Lexend', system-ui", fontStyle:'bold'
    }).setOrigin(0.5).setDepth(5));
    this.rg.add(this.add.text(W*0.72, binY - 38, 'Irrational', {
      fontSize:'14px', color: COL_DANGER, fontFamily:"'Lexend', system-ui", fontStyle:'bold'
    }).setOrigin(0.5).setDepth(5));
    this.ratBinX = W*0.28; this.irrBinX = W*0.72; this.binY = binY;

    // Number holder row
    const holderY = H*0.56;
    this.tokens = [];
    this.sortedCount = 0;
    nums.forEach((n, i) => {
      const x = W*0.18 + i * (W*0.2);
      const t = this.add.text(x, holderY, n.l, {
        fontSize:'22px', color: '#fff', fontFamily:"'Space Grotesk', sans-serif", fontStyle:'bold',
        backgroundColor: '#00000066', padding: { x: 8, y: 4 }
      }).setOrigin(0.5).setDepth(9).setInteractive({ useHandCursor: true, draggable: true });
      this.rg.add(t);
      this.input.setDraggable(t);
      t._num = n; t._home = { x, y: holderY }; t._sorted = false; t._shimmer = null;
      this.tokens.push(t);

      t.on('drag', (p, dx, dy) => {
        if (t._sorted) return;
        t.x = dx; t.y = dy;
        // On line? snap if rational, shimmer if irrational
        if (Math.abs(t.y - nlY) < 22) {
          if (n.r) {
            // snap exactly
            t.x = valToX(n.v);
            t.y = nlY - 14;
            this._snapFeedback(t);
          } else {
            // drift — random small jitter above line
            t.y = nlY - 30 + Math.sin(this.time.now/120 + i) * 6;
            t.x += (Math.random() - 0.5) * 2;
            this._shimmerFeedback(t);
          }
        }
      });
      t.on('dragend', () => {
        if (t._sorted) return;
        // Dropped in a bin?
        const d1 = Phaser.Math.Distance.Between(t.x, t.y, this.ratBinX, binY);
        const d2 = Phaser.Math.Distance.Between(t.x, t.y, this.irrBinX, binY);
        if (d1 < 80) { this._bin(t, true); return; }
        if (d2 < 80) { this._bin(t, false); return; }
        // else return home
        t.x = t._home.x; t.y = t._home.y;
      });
    });
  }

  _snapFeedback(t) {
    // little click ring + lock font color
    t.setColor('#ffffff');
    const ring = this.add.circle(t.x, this.nlY, 6, 0x000000, 0).setStrokeStyle(2, hexToNum(COL_ACCENT)).setDepth(7);
    this.tweens.add({ targets: ring, radius: 16, alpha: 0, duration: 320, onComplete: () => ring.destroy() });
  }

  _shimmerFeedback(t) {
    // slight color flicker
    const c = Math.random() < 0.5 ? '#fde68a' : '#fca5a5';
    t.setColor(c);
  }

  _bin(t, wasRational) {
    const correct = (t._num.r === wasRational);
    if (!correct) {
      // Bounce back — and nudge life
      this.tweens.add({ targets: t, x: t._home.x, y: t._home.y, duration: 300 });
      this._loseLife();
      return;
    }
    t._sorted = true;
    t.disableInteractive();
    const targetX = wasRational ? this.ratBinX : this.irrBinX;
    const slot = this.sortedCount++;
    this.tweens.add({
      targets: t,
      x: targetX - 60 + (slot % 4) * 28,
      y: this.binY,
      scale: 0.7,
      duration: 320,
      ease: 'Cubic.easeOut'
    });
    // All 4 sorted?
    if (this.tokens.every(tk => tk._sorted)) {
      this.time.delayedCall(420, () => this._win([
        'Rationals land on exact tick marks because they equal a fraction a/b.',
        'Irrationals can\\u2019t sit on any tick — their decimal never ends or repeats.',
        'That\\u2019s the whole definition of irrational.'
      ]));
    }
  }
}


// ═════════════════════════════════════════════════════════════════════════════
// SciNotationScene — Sliding Decimal
// ─────────────────────────────────────────────────────────────────────────────
// INTRINSIC: A large number like 450000 is shown with a visible decimal
// point. A slider moves the decimal left one place at a time. As the slider
// moves, the displayed number reformats (450000 → 45000.0 → 4500.00 → …)
// and the exponent counter ticks upward. When the coefficient crosses into
// the "1 ≤ a < 10" zone, the slider LOCKS with a glow and the answer is
// revealed. Discovery through physical sliding.
// ═════════════════════════════════════════════════════════════════════════════
class SciNotationScene extends GapsBaseScene {
  constructor() { super('SciNotationScene'); }
  create() { this._buildChrome(); this.rg = this.add.group(); this.startRound(); }

  startRound() {
    this._clearRoundGroup();
    this._redrawDots();
    const data = getRound(this.round);
    const W = this.W, H = this.H;

    // Fallback per-round: plain integer, the correct exponent.
    const variation = [
      { val: 450000, exp: 5, coeff: 4.5 },
      { val: 3200, exp: 3, coeff: 3.2 },
      { val: 72000000, exp: 7, coeff: 7.2 },
      { val: 125, exp: 2, coeff: 1.25 },
      { val: 9400000, exp: 6, coeff: 9.4 },
    ];
    const fb = variation[this.round % variation.length];
    const isDefault = !data || data.prompt === 'Solve this!';
    let val = fb.val, correctExp = fb.exp, correctCoeff = fb.coeff;
    if (!isDefault) {
      if (Array.isArray(data.items) && typeof data.items[0] === 'number' && data.items[0] > 0) {
        val = Math.round(data.items[0]);
      }
      if (typeof data.target === 'number' && data.target > 0) correctExp = data.target;
      // recompute coefficient
      correctCoeff = val / Math.pow(10, correctExp);
    }
    this.val = val; this.correctExp = correctExp; this.correctCoeff = correctCoeff;

    const digits = String(val).replace(/[^0-9]/g, '');
    const digitCount = digits.length;
    const maxShift = digitCount - 1;

    // Prompt
    this.rg.add(this.add.text(W/2, H*0.07, isDefault ? 'Write ' + val + ' in scientific notation.' : data.prompt, {
      fontSize:'14px', color: COL_PRIMARY, fontFamily:"'Space Grotesk', sans-serif", fontStyle:'bold',
      wordWrap:{ width: W-60 }, align:'center'
    }).setOrigin(0.5, 0).setDepth(6));
    this.rg.add(this.add.text(W/2, H*0.14, 'Slide the decimal left until the coefficient is between 1 and 10.', {
      fontSize:'11px', color: COL_TEXT, fontFamily:"'Lexend', system-ui", alpha: 0.7, wordWrap:{ width: W-60 }, align:'center'
    }).setOrigin(0.5, 0).setDepth(6));

    // Coefficient display (live-updating)
    this.coeffLbl = this.add.text(W*0.36, H*0.3, digits, {
      fontSize:'36px', color: '#fff', fontFamily:"'Space Grotesk', sans-serif", fontStyle:'bold'
    }).setOrigin(0.5).setDepth(6);
    this.xLbl = this.add.text(W*0.56, H*0.3, '× 10', {
      fontSize:'26px', color: COL_TEXT, fontFamily:"'Space Grotesk', sans-serif"
    }).setOrigin(0.5).setDepth(6);
    this.expLbl = this.add.text(W*0.66, H*0.26, '0', {
      fontSize:'20px', color: COL_ACCENT, fontFamily:"'Space Grotesk', sans-serif", fontStyle:'bold'
    }).setOrigin(0.5).setDepth(6);
    this.rg.add(this.coeffLbl); this.rg.add(this.xLbl); this.rg.add(this.expLbl);

    // Slider
    const sliderY = H*0.5;
    const sliderLeft = W*0.12, sliderRight = W*0.88;
    const sliderW = sliderRight - sliderLeft;
    this.rg.add(this.add.rectangle((sliderLeft+sliderRight)/2, sliderY, sliderW, 4, hexToNum(COL_SECONDARY), 0.5).setDepth(5));
    // Tick marks per shift
    for (let i=0; i<=maxShift; i++) {
      const x = sliderLeft + (i/maxShift) * sliderW;
      this.rg.add(this.add.rectangle(x, sliderY, 2, 14, hexToNum(COL_TEXT), 0.5).setDepth(5));
      this.rg.add(this.add.text(x, sliderY + 14, '10^' + i, {
        fontSize:'9px', color: COL_TEXT, fontFamily:"'Lexend', system-ui"
      }).setOrigin(0.5, 0).setDepth(5));
    }
    // "Valid coefficient zone" highlight: at exponent = correctExp
    const zoneX = sliderLeft + (correctExp / maxShift) * sliderW;
    this.zoneGlow = this.add.circle(zoneX, sliderY, 22, hexToNum(COL_ACCENT), 0.2).setDepth(4);
    this.rg.add(this.zoneGlow);
    this.tweens.add({ targets: this.zoneGlow, alpha: { from: 0.15, to: 0.4 }, duration: 900, yoyo: true, repeat: -1 });

    // Handle
    this.handle = this.add.circle(sliderLeft, sliderY, 14, hexToNum(COL_PRIMARY), 1)
      .setStrokeStyle(2, 0xffffff).setInteractive({ useHandCursor: true, draggable: true }).setDepth(8);
    this.rg.add(this.handle);
    this.input.setDraggable(this.handle);
    this.locked = false;
    this.digits = digits; this.maxShift = maxShift; this.sliderLeft = sliderLeft; this.sliderW = sliderW; this.sliderY = sliderY;

    this.handle.on('drag', (p, dx) => {
      if (this.locked) return;
      const nx = Phaser.Math.Clamp(dx, sliderLeft, sliderRight);
      this.handle.x = nx;
      const frac = (nx - sliderLeft) / sliderW;
      const shift = Math.round(frac * maxShift);
      this._updateAt(shift);
    });
    this._updateAt(0);
  }

  _updateAt(shift) {
    const digits = this.digits;
    let coeffStr;
    if (shift === 0) coeffStr = digits;
    else if (shift <= digits.length - 1) {
      coeffStr = digits.slice(0, digits.length - shift) + '.' + digits.slice(digits.length - shift);
    } else {
      coeffStr = '0.' + '0'.repeat(shift - digits.length) + digits;
    }
    // Clean: strip trailing zeros after decimal
    if (coeffStr.includes('.')) coeffStr = coeffStr.replace(/0+$/, '').replace(/\\.$/, '');
    this.coeffLbl.setText(coeffStr);
    this.expLbl.setText(String(shift));
    // Color coefficient by whether it's in valid zone [1, 10)
    const num = parseFloat(coeffStr);
    const inZone = num >= 1 && num < 10 && shift > 0;
    this.coeffLbl.setColor(inZone ? COL_ACCENT : '#ffffff');
    if (inZone && shift === this.correctExp && !this.locked) {
      this.locked = true;
      // Lock animation
      this.handle.setFillStyle(hexToNum(COL_ACCENT), 1);
      const glow = this.add.circle(this.handle.x, this.sliderY, 22, hexToNum(COL_ACCENT), 0.5).setDepth(7);
      this.tweens.add({ targets: glow, radius: 40, alpha: 0, duration: 500, onComplete: () => glow.destroy() });
      this.time.delayedCall(600, () => this._win([
        'You moved the decimal ' + shift + ' places left.',
        'Now the coefficient is ' + coeffStr + ', which is between 1 and 10 — the scientific notation rule.',
        this.val + ' = ' + coeffStr + ' × 10^' + shift
      ]));
    }
  }
}


// ═════════════════════════════════════════════════════════════════════════════
// ProofStepperScene — Input-Output Cards
// ─────────────────────────────────────────────────────────────────────────────
// INTRINSIC: Each proof step is a CARD with an INPUT (assumed) and OUTPUT
// (proved). A "Given" anchor starts at the top; the player's goal is the
// "Theorem" anchor. The player drags cards between anchors. Cards only
// CONNECT when their INPUT matches the previous card's OUTPUT — a glowing
// arrow forms the bond. Mismatches simply refuse to link. The matching
// rule IS the logical flow of the proof. No dropdowns, no generic
// reordering. The chain completes when Given flows to Theorem.
// ═════════════════════════════════════════════════════════════════════════════
class ProofStepperScene extends GapsBaseScene {
  constructor() { super('ProofStepperScene'); }
  create() { this._buildChrome(); this.rg = this.add.group(); this.startRound(); }

  startRound() {
    this._clearRoundGroup();
    this._redrawDots();
    const data = getRound(this.round);
    const W = this.W, H = this.H;

    // A round is: theorem text, an ordered list of facts where fact[i] is
    // the output of step i, and fact[0] is the GIVEN. Cards represent a
    // single step: input=fact[i-1], output=fact[i].
    // Fallback variation: simple algebraic proofs where each output plugs
    // into the next input.
    const variation = [
      {
        theorem: 'If 2x + 3 = 11, then x = 4.',
        facts: ['2x + 3 = 11', '2x = 8', 'x = 4']
      },
      {
        theorem: 'If a + b = 10 and b = 3, then a = 7.',
        facts: ['a + b = 10, b = 3', 'a + 3 = 10', 'a = 7']
      },
      {
        theorem: 'If 3(y − 1) = 12, then y = 5.',
        facts: ['3(y − 1) = 12', 'y − 1 = 4', 'y = 5']
      },
      {
        theorem: 'If x = y and y = 7, then x = 7.',
        facts: ['x = y, y = 7', 'x = 7']
      },
      {
        theorem: 'If 5n = 20, then n = 4.',
        facts: ['5n = 20', 'n = 4']
      },
    ];
    const fb = variation[this.round % variation.length];
    const isDefault = !data || data.prompt === 'Solve this!' || !Array.isArray(data.items) || data.items.length < 2;
    const theorem = isDefault ? fb.theorem : (data.prompt || fb.theorem);
    const facts = isDefault ? fb.facts
      : (data.items.length >= 2 ? data.items.map(x => String(x)) : fb.facts);
    this.facts = facts;
    const stepCount = facts.length - 1; // each card bridges two facts

    // Prompt
    this.rg.add(this.add.text(W/2, H*0.06, 'Prove: ' + theorem, {
      fontSize:'13px', color: COL_PRIMARY, fontFamily:"'Space Grotesk', sans-serif", fontStyle:'bold',
      wordWrap:{ width: W-40 }, align:'center'
    }).setOrigin(0.5, 0).setDepth(6));
    this.rg.add(this.add.text(W/2, H*0.14, 'Drag the step cards into the chain. Cards only connect when the OUTPUT of one matches the INPUT of the next.', {
      fontSize:'10px', color: COL_TEXT, fontFamily:"'Lexend', system-ui", alpha: 0.6,
      wordWrap:{ width: W-60 }, align:'center'
    }).setOrigin(0.5, 0).setDepth(6));

    // Chain column (left 60% of screen). Slots are vertical; slot 0 is fixed
    // "Given" at the top. Slots 1..stepCount are where cards go.
    const chainX = W*0.35;
    const chainTop = H*0.22;
    const slotH = Math.min(54, (H*0.62) / (stepCount + 2));
    this.slotH = slotH;
    this.chainX = chainX;

    // Given anchor
    this.rg.add(this.add.rectangle(chainX, chainTop, W*0.52, slotH, hexToNum(COL_ACCENT), 0.18)
      .setStrokeStyle(1, hexToNum(COL_ACCENT), 0.6).setDepth(4));
    this.rg.add(this.add.text(chainX, chainTop, 'GIVEN: ' + facts[0], {
      fontSize:'11px', color: COL_ACCENT, fontFamily:"'Lexend', system-ui", fontStyle:'bold',
      wordWrap:{ width: W*0.48 }, align:'center'
    }).setOrigin(0.5).setDepth(5));

    // Empty slots for each step
    this.slots = [];
    for (let i=1; i<=stepCount; i++) {
      const y = chainTop + i * (slotH + 10);
      this.rg.add(this.add.rectangle(chainX, y, W*0.52, slotH, hexToNum(COL_SECONDARY), 0.1)
        .setStrokeStyle(1, hexToNum(COL_SECONDARY), 0.35).setDepth(3));
      this.slots.push({ x: chainX, y, expectedInput: facts[i-1], expectedOutput: facts[i], card: null });
    }

    // Theorem anchor at bottom
    const theoremY = chainTop + (stepCount + 1) * (slotH + 10);
    this.rg.add(this.add.rectangle(chainX, theoremY, W*0.52, slotH, hexToNum(COL_PRIMARY), 0.18)
      .setStrokeStyle(1, hexToNum(COL_PRIMARY), 0.6).setDepth(4));
    this.rg.add(this.add.text(chainX, theoremY, 'THEOREM: ' + facts[facts.length-1], {
      fontSize:'11px', color: COL_PRIMARY, fontFamily:"'Lexend', system-ui", fontStyle:'bold',
      wordWrap:{ width: W*0.48 }, align:'center'
    }).setOrigin(0.5).setDepth(5));

    // Sidebar: draggable cards, shuffled. Each card = {input, output}.
    const sidebarX = W*0.78;
    const sideStartY = chainTop;
    const cardList = [];
    for (let i=1; i<facts.length; i++) cardList.push({ input: facts[i-1], output: facts[i] });
    // Shuffle
    for (let i=cardList.length-1; i>0; i--) {
      const j = Math.floor(Math.random() * (i+1));
      [cardList[i], cardList[j]] = [cardList[j], cardList[i]];
    }
    this.sidebarCards = [];
    cardList.forEach((c, i) => {
      const y = sideStartY + i * (slotH + 6);
      const cont = this.add.container(sidebarX, y).setDepth(8).setSize(W*0.36, slotH - 4);
      const bg = this.add.rectangle(0, 0, W*0.36, slotH - 4, hexToNum(COL_SECONDARY), 0.4)
        .setStrokeStyle(1, hexToNum(COL_PRIMARY), 0.6);
      const inTxt = this.add.text(0, -(slotH-4)/2 + 8, 'IN: ' + c.input, {
        fontSize:'9px', color: COL_ACCENT, fontFamily:"'Lexend', system-ui",
        wordWrap:{ width: W*0.34 }, align:'center'
      }).setOrigin(0.5, 0);
      const outTxt = this.add.text(0, (slotH-4)/2 - 8, 'OUT: ' + c.output, {
        fontSize:'9px', color: COL_PRIMARY, fontFamily:"'Lexend', system-ui",
        wordWrap:{ width: W*0.34 }, align:'center'
      }).setOrigin(0.5, 1);
      cont.add([bg, inTxt, outTxt]);
      cont.setInteractive(new Phaser.Geom.Rectangle(-(W*0.36)/2, -(slotH-4)/2, W*0.36, slotH-4),
        Phaser.Geom.Rectangle.Contains);
      this.input.setDraggable(cont);
      cont._card = c; cont._home = { x: sidebarX, y }; cont._bg = bg;
      this.rg.add(cont);
      this.sidebarCards.push(cont);

      cont.on('dragstart', () => cont.setDepth(15));
      cont.on('drag', (p, dx, dy) => { cont.x = dx; cont.y = dy; });
      cont.on('dragend', () => {
        cont.setDepth(8);
        // Find nearest slot
        let nearest = null, nearestDist = 9999;
        this.slots.forEach(s => {
          if (s.card) return;
          const d = Phaser.Math.Distance.Between(cont.x, cont.y, s.x, s.y);
          if (d < nearestDist) { nearestDist = d; nearest = s; }
        });
        if (nearest && nearestDist < 80) {
          // Check matching: input must equal expectedInput AND output must equal expectedOutput
          if (cont._card.input === nearest.expectedInput && cont._card.output === nearest.expectedOutput) {
            cont.x = nearest.x; cont.y = nearest.y;
            bg.setFillStyle(hexToNum(COL_ACCENT), 0.3);
            bg.setStrokeStyle(2, hexToNum(COL_ACCENT), 1);
            nearest.card = cont;
            cont.disableInteractive();
            // Glowing connector arrow above this slot
            this._drawArrowTo(nearest);
            // All filled?
            if (this.slots.every(s => s.card)) {
              this.time.delayedCall(500, () => this._win([
                'Each card\\u2019s OUTPUT matched the next card\\u2019s INPUT.',
                'That chain of matching inputs and outputs IS a proof.',
                'You connected GIVEN to THEOREM step by step.'
              ]));
            }
          } else {
            // Refuse to link — bounce back with a shake
            this.cameras.main.shake(100, 0.004);
            bg.setStrokeStyle(2, hexToNum(COL_DANGER), 1);
            this.tweens.add({ targets: cont, x: cont._home.x, y: cont._home.y, duration: 280 });
            this.time.delayedCall(320, () => bg.setStrokeStyle(1, hexToNum(COL_PRIMARY), 0.6));
          }
        } else {
          this.tweens.add({ targets: cont, x: cont._home.x, y: cont._home.y, duration: 220 });
        }
      });
    });
  }

  _drawArrowTo(slot) {
    const W = this.W;
    const ax = slot.x - W*0.27;
    const ay = slot.y;
    const arrow = this.add.triangle(ax, ay, 0, -6, 14, 0, 0, 6, hexToNum(COL_ACCENT), 1).setDepth(6);
    this.rg.add(arrow);
    this.tweens.add({ targets: arrow, alpha: { from: 0, to: 1 }, duration: 300 });
  }
}
`
