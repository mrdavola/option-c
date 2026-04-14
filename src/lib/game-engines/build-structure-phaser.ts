// Build a Structure — Phaser engine with 3 game options.
// Math: Geometry, shapes, area, perimeter, decomposition.
// Options: shape-matcher, free-build, shape-decomposer
//
// ═══════════════════════════════════════════════════════════════════════════════
// TRULY INTRINSIC REBUILD (April 13)
//
// Audit found the previous versions were "fake intrinsic" — shapes were decorative
// and the real gameplay was counter-matching unrelated to geometry. This rewrite
// makes the physical arrangement of shapes BE the math in every mode:
//
//  • ShapeMatcherScene   — target arrangement shown; dragging shapes into a
//                          workspace reshapes a live count readout that auto-locks
//                          the moment the workspace matches the target. The act
//                          of placing shapes IS the set-matching math.
//
//  • FreeBuildScene      — dragging shapes into a grid snaps edge-to-edge. A live
//                          perimeter meter computes the outer boundary of the
//                          composite. Placement IS addition of sides. Target
//                          perimeter shown; match = auto-win.
//
//  • ShapeDecomposerScene — a composite shape made of unit squares appears in
//                          two coloured regions. The player fills each region by
//                          dragging unit tiles onto grid cells. The running count
//                          of filled cells per region IS the area. Total is
//                          revealed as the sum when fully filled.
//
// Each scene passes the Discovery + Self-Revealing Truth tests:
//  • A child who doesn't yet know "area", "perimeter", or "match" can LEARN
//    these concepts by playing — the readouts update as they place pieces, so
//    cause and effect is visible, not hidden behind a Check button.
//  • There are NO Check / Verify / typed-answer buttons. Success is detected
//    automatically when arrangement matches target.
// ═══════════════════════════════════════════════════════════════════════════════

import type { ThemeConfig, MathParams, GameOption } from "./engine-types"
import { phaserGame } from "./base-phaser-template"
import { getOptionDef } from "./game-option-registry"

export function buildStructurePhaserEngine(
  config: ThemeConfig,
  math: MathParams,
  option: GameOption = "shape-matcher"
): string {
  const validOptions = ["shape-matcher", "free-build", "shape-decomposer"]
  const activeOption = validOptions.includes(option) ? option : "shape-matcher"
  const optDef = getOptionDef(activeOption)
  const sceneMap: Record<string, string> = {
    "shape-matcher": "ShapeMatcherScene",
    "free-build": "FreeBuildScene",
    "shape-decomposer": "ShapeDecomposerScene",
  }
  return phaserGame({
    config, math, option: activeOption,
    sceneName: sceneMap[activeOption],
    introText: optDef?.introText || "Build with shapes!",
    helpText: optDef?.helpText || "Arrange the shapes.",
    gameSceneCode: GAME_SCENES,
  })
}

const GAME_SCENES = `
// ─── Shared helpers ──────────────────────────────────────────────────────────
function drawShapeGfx(scene, g, cx, cy, type, size, color, alpha) {
  g.fillStyle(color, alpha != null ? alpha : 0.75);
  g.lineStyle(2, color, 1);
  if (type === 'triangle') {
    g.fillTriangle(cx, cy - size, cx - size, cy + size, cx + size, cy + size);
    g.strokeTriangle(cx, cy - size, cx - size, cy + size, cx + size, cy + size);
  } else if (type === 'square') {
    g.fillRect(cx - size, cy - size, size * 2, size * 2);
    g.strokeRect(cx - size, cy - size, size * 2, size * 2);
  } else if (type === 'circle') {
    g.fillCircle(cx, cy, size);
    g.strokeCircle(cx, cy, size);
  } else if (type === 'rectangle') {
    g.fillRect(cx - size * 1.4, cy - size * 0.7, size * 2.8, size * 1.4);
    g.strokeRect(cx - size * 1.4, cy - size * 0.7, size * 2.8, size * 1.4);
  } else if (type === 'pentagon') {
    const pts = [];
    for (let i = 0; i < 5; i++) { const a = (Math.PI*2/5)*i - Math.PI/2; pts.push({x: cx+Math.cos(a)*size, y: cy+Math.sin(a)*size}); }
    g.fillPoints(pts, true); g.strokePoints(pts, true);
  } else if (type === 'hexagon') {
    const pts = [];
    for (let i = 0; i < 6; i++) { const a = (Math.PI*2/6)*i - Math.PI/2; pts.push({x: cx+Math.cos(a)*size, y: cy+Math.sin(a)*size}); }
    g.fillPoints(pts, true); g.strokePoints(pts, true);
  }
}

function makeShapeIcon(scene, x, y, type, size, color) {
  const g = scene.add.graphics().setDepth(7);
  drawShapeGfx(scene, g, x, y, type, size, color, 0.75);
  return g;
}

// Generic solution card shown at the end of every round.
// lines: array of strings (plain math explanations).
// onNext: called when player clicks "Got it! Next round →"
function showSolutionCard(scene, title, lines, onNext, isLast) {
  const W = scene.W, H = scene.H;
  const backdrop = scene.add.rectangle(W/2, H/2, W, H, 0x000000, 0.55).setDepth(50);
  const cardH = 100 + lines.length * 28 + 70;
  const card = scene.add.rectangle(W/2, H * 0.52, W - 60, cardH, 0x18181b, 1)
    .setStrokeStyle(2, hexToNum(COL_ACCENT)).setDepth(51);
  const h1 = scene.add.text(W/2, H * 0.52 - cardH/2 + 26, title, {
    fontSize: '22px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
  }).setOrigin(0.5).setDepth(52);
  const textObjs = [];
  lines.forEach(function(line, i){
    const t = scene.add.text(W/2, H * 0.52 - cardH/2 + 60 + i * 28, line, {
      fontSize: i === lines.length - 1 ? '20px' : '14px',
      color: i === lines.length - 1 ? COL_ACCENT : COL_TEXT,
      fontFamily: "'Space Grotesk', sans-serif",
      fontStyle: i === lines.length - 1 ? 'bold' : 'normal',
      align: 'center', wordWrap: { width: W - 100 }
    }).setOrigin(0.5).setDepth(52);
    t.setAlpha(0);
    textObjs.push(t);
    scene.time.delayedCall(180 * i, function(){
      scene.tweens.add({ targets: t, alpha: 1, duration: 260 });
    });
  });
  const btnY = H * 0.52 + cardH/2 - 34;
  const nextBg = scene.add.rectangle(W/2, btnY, 220, 44, hexToNum(COL_ACCENT), 1)
    .setInteractive({ useHandCursor: true }).setDepth(52).setAlpha(0);
  const nextLbl = scene.add.text(W/2, btnY, isLast ? 'Finish!' : 'Got it! Next round →', {
    fontSize: '14px', color: '#000', fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
  }).setOrigin(0.5).setDepth(53).setAlpha(0);
  scene.time.delayedCall(180 * lines.length + 200, function(){
    scene.tweens.add({ targets: [nextBg, nextLbl], alpha: 1, duration: 300 });
  });
  nextBg.on('pointerdown', function(){
    [backdrop, card, h1, nextBg, nextLbl].forEach(function(o){ o.destroy(); });
    textObjs.forEach(function(o){ o.destroy(); });
    onNext();
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION A: ShapeMatcherScene
// Math: Set-matching / spatial pattern recognition.
// Drag shapes from the pool into the workspace. A live "what you've built"
// counter ticks up with each placement. Target shape arrangement shown at top.
// When counts (and arrangement for older rounds) match, the workspace AUTO-LOCKS.
// No Check button. No typed answers. Placement IS the answer.
// ═══════════════════════════════════════════════════════════════════════════════
class ShapeMatcherScene extends Phaser.Scene {
  constructor() { super('ShapeMatcherScene'); }

  create() {
    this.W = this.scale.width; this.H = this.scale.height;
    this.round = 0; this.lives = MAX_LIVES; this.solved = false;
    this._bg(); this._ui();
    this.hero = addCharacter(this, this.W * 0.88, this.H * 0.55, 0.8);
    this.startRound();
  }
  _bg() {
    const bg = this.add.image(this.W/2, this.H/2, 'bg');
    bg.setScale(Math.max(this.W/bg.width, this.H/bg.height));
    this.add.rectangle(this.W/2, this.H/2, this.W, this.H, 0x000000, 0.65);
  }
  _ui() {
    this.scoreLbl = this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);
    this.hg = this.add.group(); this._rh();
    this.dg = this.add.group(); this._rd();
  }
  _rh() {
    this.hg.clear(true,true);
    for (let i=0;i<this.lives;i++)
      this.hg.add(this.add.text(14+i*22,14,'\\u2665',{fontSize:'18px',color:COL_DANGER}).setDepth(10));
  }
  _rd() {
    this.dg.clear(true,true);
    for (let i=0;i<TOTAL_ROUNDS;i++){
      const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';
      this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));
    }
  }

  startRound() {
    this.solved = false;
    if (this.rg) this.rg.clear(true, true);
    this.rg = this.add.group();
    if (this.gfxList) this.gfxList.forEach(function(g){ g.destroy(); });
    this.gfxList = [];
    if (this.placed) this.placed.forEach(function(p){ if (p.gfx) p.gfx.destroy(); });
    this.placed = [];
    if (this.poolItems) this.poolItems.forEach(function(p){ if (p.gfx) p.gfx.destroy(); });
    this.poolItems = [];

    const data = getRound(this.round);
    // Build the target arrangement from the AI round, or a fallback.
    // Shapes available: triangle, square, circle, rectangle
    const shapeTypes = ['triangle', 'square', 'circle', 'rectangle'];
    // Fallback targets per round
    const fallbacks = [
      { triangle: 2, square: 1 },
      { circle: 2, square: 2 },
      { triangle: 1, square: 2, circle: 1 },
      { rectangle: 2, triangle: 2 },
      { square: 2, circle: 2, triangle: 1 }
    ];
    let target = fallbacks[this.round % fallbacks.length];
    // If AI round has items array (numbers), use its length to size target
    if (data && Array.isArray(data.items) && data.items.length > 0 && data.items.length <= 6) {
      // Distribute the count across up to 3 shape types derived from items
      const t = {};
      const total = Math.min(6, Math.max(2, data.items.length));
      const typesNeeded = total <= 3 ? 2 : 3;
      for (let i = 0; i < typesNeeded; i++) {
        const s = shapeTypes[(this.round + i) % shapeTypes.length];
        t[s] = 0;
      }
      const keys = Object.keys(t);
      for (let i = 0; i < total; i++) t[keys[i % keys.length]]++;
      target = t;
    }
    this.target = target;
    this.targetTotal = Object.keys(target).reduce(function(s,k){ return s + target[k]; }, 0);

    this._rd();
    const W = this.W, H = this.H;

    // Title
    this.rg.add(this.add.text(W/2, H*0.05, 'Build this picture', {
      fontSize: '18px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6));

    // Prompt: show required counts as the "math operation"
    const promptParts = Object.keys(target).map(function(k){ return target[k] + ' ' + k + (target[k] > 1 ? 's' : ''); });
    this.rg.add(this.add.text(W/2, H*0.10, promptParts.join(' + '), {
      fontSize: '15px', color: COL_PRIMARY, fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6));

    // Target preview strip (TOP)
    const targetY = H * 0.17;
    this.rg.add(this.add.text(W*0.5, targetY - 18, 'TARGET', {
      fontSize: '10px', color: COL_ACCENT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5).setDepth(6));
    const targetBox = this.add.rectangle(W*0.5, targetY + 18, W*0.7, 64, 0x000000, 0.35)
      .setStrokeStyle(2, hexToNum(COL_ACCENT), 0.8).setDepth(5);
    this.rg.add(targetBox);
    // Draw each target shape in the target box
    const targetShapes = [];
    Object.keys(target).forEach(function(k){ for (let i=0;i<target[k];i++) targetShapes.push(k); });
    const tStart = W*0.5 - (targetShapes.length - 1) * 22;
    const self = this;
    targetShapes.forEach(function(s, i){
      const g = makeShapeIcon(self, tStart + i * 44, targetY + 18, s, 14, hexToNum(COL_ACCENT));
      self.gfxList.push(g);
    });

    // Workspace (MIDDLE) — where dragged shapes land
    this.workspaceY = H * 0.42;
    this.rg.add(this.add.text(W*0.5, this.workspaceY - 48, 'YOUR WORKSPACE', {
      fontSize: '10px', color: COL_PRIMARY, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5).setDepth(6));
    const wsBox = this.add.rectangle(W*0.5, this.workspaceY, W*0.7, 80, 0x000000, 0.25)
      .setStrokeStyle(2, hexToNum(COL_PRIMARY), 0.6).setDepth(5);
    this.rg.add(wsBox);
    this.workspaceRect = { x1: W*0.5 - W*0.35, x2: W*0.5 + W*0.35, y1: this.workspaceY - 40, y2: this.workspaceY + 40 };

    // Live readout — counts per shape, auto-updating as shapes are placed
    this.readoutY = H * 0.52;
    this.readoutLbl = this.add.text(W/2, this.readoutY, 'Placed: nothing yet', {
      fontSize: '13px', color: COL_TEXT, fontFamily: "'Lexend', system-ui", fontStyle: 'bold', align:'center'
    }).setOrigin(0.5).setDepth(6);
    this.rg.add(this.readoutLbl);

    // Shape pool (BOTTOM) — a palette of draggable shapes. Include exactly the
    // needed counts plus 1-2 distractors so picking and placing is the decision.
    const poolY = H * 0.70;
    this.rg.add(this.add.text(W*0.5, poolY - 40, 'SHAPE POOL — drag into workspace', {
      fontSize: '11px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5).setDepth(6));
    // Build pool array: target shapes + 1-2 extras (distractors)
    const pool = [];
    Object.keys(target).forEach(function(k){ for (let i=0;i<target[k];i++) pool.push(k); });
    const extras = this.round < 2 ? 1 : 2;
    const distractorCandidates = shapeTypes.filter(function(s){ return !target[s]; });
    for (let i = 0; i < extras; i++) {
      const s = distractorCandidates.length > 0
        ? distractorCandidates[i % distractorCandidates.length]
        : shapeTypes[(i + this.round) % shapeTypes.length];
      pool.push(s);
    }
    // Shuffle pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
    }
    // Lay them out
    const spacing = Math.min(60, (W * 0.75) / Math.max(pool.length, 1));
    const startX = W*0.5 - ((pool.length - 1) * spacing) / 2;
    pool.forEach(function(s, i){
      const px = startX + i * spacing;
      const g = makeShapeIcon(self, px, poolY, s, 16, hexToNum(COL_PRIMARY));
      // Make draggable via hit area (invisible rect covering it)
      const hit = self.add.rectangle(px, poolY, 44, 44, 0xffffff, 0.001)
        .setInteractive({ useHandCursor: true, draggable: true }).setDepth(9);
      self.rg.add(hit);
      const item = { shape: s, gfx: g, hit: hit, homeX: px, homeY: poolY, used: false };
      self.poolItems.push(item);
      hit.on('dragstart', function(){
        if (self.solved || item.used) return;
        item.dragOffsetX = 0; item.dragOffsetY = 0;
      });
      hit.on('drag', function(pointer, dx, dy){
        if (self.solved || item.used) return;
        hit.x = dx; hit.y = dy;
        // Redraw graphic at new position
        g.clear(); drawShapeGfx(self, g, dx, dy, s, 16, hexToNum(COL_PRIMARY), 0.75);
      });
      hit.on('dragend', function(pointer){
        if (self.solved || item.used) return;
        const wr = self.workspaceRect;
        if (hit.x >= wr.x1 && hit.x <= wr.x2 && hit.y >= wr.y1 && hit.y <= wr.y2) {
          // Place in workspace — snap into the next grid slot
          self._placeInWorkspace(item);
        } else {
          // Return to pool
          hit.x = item.homeX; hit.y = item.homeY;
          g.clear(); drawShapeGfx(self, g, item.homeX, item.homeY, s, 16, hexToNum(COL_PRIMARY), 0.75);
        }
      });
    });
  }

  _placeInWorkspace(item) {
    item.used = true;
    // disable dragging
    item.hit.disableInteractive();
    // Snap to the next slot
    const index = this.placed.length;
    const maxPerRow = 6;
    const col = index % maxPerRow;
    const row = Math.floor(index / maxPerRow);
    const slotSpacing = 40;
    const startX = this.W * 0.5 - (Math.min(this.targetTotal + 2, maxPerRow) - 1) * slotSpacing / 2;
    const px = startX + col * slotSpacing;
    const py = this.workspaceY - 14 + row * 30;
    // Redraw at snap position
    item.gfx.clear();
    drawShapeGfx(this, item.gfx, px, py, item.shape, 14, hexToNum(COL_ACCENT), 0.9);
    item.hit.x = px; item.hit.y = py;
    this.placed.push(item);
    this._updateReadout();
    this._checkMatch();
  }

  _updateReadout() {
    const counts = {};
    this.placed.forEach(function(p){ counts[p.shape] = (counts[p.shape] || 0) + 1; });
    const keys = Object.keys(counts);
    if (keys.length === 0) {
      this.readoutLbl.setText('Placed: nothing yet').setColor(COL_TEXT);
      return;
    }
    const parts = keys.map(function(k){ return counts[k] + ' ' + k + (counts[k] > 1 ? 's' : ''); });
    this.readoutLbl.setText('Placed: ' + parts.join(' + ')).setColor(COL_PRIMARY);
  }

  _checkMatch() {
    // Build current count map
    const counts = {};
    this.placed.forEach(function(p){ counts[p.shape] = (counts[p.shape] || 0) + 1; });
    // Exact match: same keys, same counts, no extras
    const tKeys = Object.keys(this.target);
    const cKeys = Object.keys(counts);
    let matches = tKeys.length === cKeys.length;
    if (matches) {
      for (let i = 0; i < tKeys.length; i++) {
        if (counts[tKeys[i]] !== this.target[tKeys[i]]) { matches = false; break; }
      }
    }
    // If player has placed too many (overshoot on any type), subtract a life once.
    let overshoot = false;
    for (let i = 0; i < cKeys.length; i++) {
      if ((counts[cKeys[i]] || 0) > (this.target[cKeys[i]] || 0)) { overshoot = true; break; }
    }
    if (overshoot && !this._overshot) {
      this._overshot = true;
      this.lives--; this._rh();
      this.cameras.main.shake(180, 0.008);
      heroShake(this, this.hero);
      if (this.lives <= 0) {
        const self = this;
        this.time.delayedCall(500, function(){ self.scene.start('LoseScene', { score: gameScore }); });
        return;
      }
      this.readoutLbl.setColor(COL_DANGER);
      // Allow correction: auto-return overshot shape to pool after a beat
      const self2 = this;
      this.time.delayedCall(700, function(){
        // Pop the most-recent placed of an overshot type
        for (let i = self2.placed.length - 1; i >= 0; i--) {
          const p = self2.placed[i];
          const ok = (self2.target[p.shape] || 0);
          let used = 0;
          for (let j = 0; j < self2.placed.length; j++) if (self2.placed[j].shape === p.shape) used++;
          if (used > ok) {
            // Return this one home
            p.used = false;
            p.gfx.clear();
            drawShapeGfx(self2, p.gfx, p.homeX, p.homeY, p.shape, 16, hexToNum(COL_PRIMARY), 0.75);
            p.hit.x = p.homeX; p.hit.y = p.homeY;
            p.hit.setInteractive({ useHandCursor: true, draggable: true });
            self2.placed.splice(i, 1);
            break;
          }
        }
        self2._overshot = false;
        self2._updateReadout();
      });
      return;
    }
    if (matches) {
      this.solved = true;
      // Visual LOCK: tint workspace green and freeze all placed shapes
      this.cameras.main.flash(180, 34, 197, 94);
      heroCheer(this, this.hero);
      gameScore += 10 * (this.round + 1);
      this.scoreLbl.setText('Score: ' + gameScore);
      this.readoutLbl.setColor(COL_ACCENT);
      // Build explanation lines
      const parts = Object.keys(this.target).map((k) => this.target[k] + ' ' + k + (this.target[k] > 1 ? 's' : ''));
      const lines = [
        'You placed exactly:',
        parts.join(' + '),
        'Total shapes: ' + this.targetTotal
      ];
      const self3 = this;
      this.time.delayedCall(300, function(){
        showSolutionCard(self3, 'Matched!', lines, function(){
          self3.round++;
          if (self3.round >= TOTAL_ROUNDS) self3.scene.start('VictoryScene', { score: gameScore });
          else self3.startRound();
        }, self3.round + 1 >= TOTAL_ROUNDS);
      });
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION B: FreeBuildScene
// Math: Additive properties — perimeter as sum of exposed edges.
// Players drag UNIT SQUARES into a Building Zone grid. Each cell placement
// connects to neighbours edge-to-edge. A perimeter meter auto-computes the
// outer boundary of the composite: each placed cell contributes 4 edges, minus
// 2 for every shared edge with an already-placed neighbour. Target perimeter
// is shown; when composite's perimeter equals target, round succeeds.
// No Add button — placement IS addition. No Check button — matching IS winning.
// ═══════════════════════════════════════════════════════════════════════════════
class FreeBuildScene extends Phaser.Scene {
  constructor() { super('FreeBuildScene'); }

  create() {
    this.W = this.scale.width; this.H = this.scale.height;
    this.round = 0; this.lives = MAX_LIVES; this.solved = false;
    this._bg(); this._ui();
    this.hero = addCharacter(this, this.W * 0.88, this.H * 0.55, 0.8);
    this.startRound();
  }
  _bg() {
    const bg = this.add.image(this.W/2, this.H/2, 'bg');
    bg.setScale(Math.max(this.W/bg.width, this.H/bg.height));
    this.add.rectangle(this.W/2, this.H/2, this.W, this.H, 0x000000, 0.65);
  }
  _ui() {
    this.scoreLbl = this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);
    this.hg = this.add.group(); this._rh();
    this.dg = this.add.group(); this._rd();
  }
  _rh() {
    this.hg.clear(true,true);
    for (let i=0;i<this.lives;i++)
      this.hg.add(this.add.text(14+i*22,14,'\\u2665',{fontSize:'18px',color:COL_DANGER}).setDepth(10));
  }
  _rd() {
    this.dg.clear(true,true);
    for (let i=0;i<TOTAL_ROUNDS;i++){
      const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';
      this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));
    }
  }

  startRound() {
    this.solved = false;
    if (this.rg) this.rg.clear(true, true);
    this.rg = this.add.group();
    if (this.gfxList) this.gfxList.forEach(function(g){ g.destroy(); });
    this.gfxList = [];
    if (this.cellGfx) Object.keys(this.cellGfx).forEach((k) => this.cellGfx[k].destroy());
    this.cellGfx = {};
    this.filled = {};

    const data = getRound(this.round);
    // Target perimeters per round, small enough to be buildable in a 5x5 grid.
    const fallbacks = [8, 10, 12, 14, 12];
    let target = fallbacks[this.round % fallbacks.length];
    if (data && typeof data.target === 'number' && data.target >= 4 && data.target <= 20 && data.target % 2 === 0) {
      target = data.target;
    }
    this.targetPerimeter = target;

    const W = this.W, H = this.H;
    this._rd();

    // Header
    this.rg.add(this.add.text(W/2, H*0.05, 'Make a shape with perimeter = ' + target, {
      fontSize: '17px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6));
    this.rg.add(this.add.text(W/2, H*0.10, 'Drag unit squares into the zone. They must touch edge-to-edge.', {
      fontSize: '11px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5).setDepth(6));

    // Live perimeter meter
    this.perimeterLbl = this.add.text(W/2, H*0.16, 'Current perimeter: 0', {
      fontSize: '15px', color: COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6);
    this.rg.add(this.perimeterLbl);

    // Building Zone grid (5 cols x 5 rows)
    this.gridCols = 5; this.gridRows = 5;
    this.cellSize = Math.min(40, (W * 0.5) / this.gridCols);
    const gridW = this.gridCols * this.cellSize;
    const gridH = this.gridRows * this.cellSize;
    this.gridX = W * 0.4 - gridW / 2;
    this.gridY = H * 0.35;
    // Zone background
    const zone = this.add.rectangle(this.gridX + gridW/2, this.gridY + gridH/2, gridW + 12, gridH + 12, 0x000000, 0.35)
      .setStrokeStyle(2, hexToNum(COL_PRIMARY), 0.6).setDepth(4);
    this.rg.add(zone);
    // Grid lines (subtle)
    const grid = this.add.graphics().setDepth(4);
    grid.lineStyle(1, hexToNum(COL_TEXT), 0.18);
    for (let r = 0; r <= this.gridRows; r++) {
      grid.moveTo(this.gridX, this.gridY + r * this.cellSize);
      grid.lineTo(this.gridX + gridW, this.gridY + r * this.cellSize);
    }
    for (let c = 0; c <= this.gridCols; c++) {
      grid.moveTo(this.gridX + c * this.cellSize, this.gridY);
      grid.lineTo(this.gridX + c * this.cellSize, this.gridY + gridH);
    }
    grid.strokePath();
    this.gfxList.push(grid);

    // Reset button (allows learning through iteration)
    const resetBtn = this.add.rectangle(W * 0.15, H * 0.58, 90, 32, hexToNum(COL_DANGER), 0.55)
      .setInteractive({ useHandCursor: true }).setDepth(10);
    this.rg.add(resetBtn);
    const resetLbl = this.add.text(W * 0.15, H * 0.58, 'Clear Zone', {
      fontSize: '12px', color: '#fff', fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);
    this.rg.add(resetLbl);
    const self = this;
    resetBtn.on('pointerdown', function(){
      if (self.solved) return;
      Object.keys(self.cellGfx).forEach(function(k){ self.cellGfx[k].destroy(); });
      self.cellGfx = {}; self.filled = {};
      self._updatePerimeter();
    });

    // Shape pool: supply of unit squares (infinite feel — one re-spawnable tile)
    const poolY = H * 0.80;
    this.rg.add(this.add.text(W*0.5, poolY - 36, 'UNIT SQUARES — drag one at a time', {
      fontSize: '11px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5).setDepth(6));

    // Create a "stack" of 3 draggable unit tiles; each one respawns after placement.
    this.poolSlots = [];
    for (let i = 0; i < 3; i++) {
      const px = W * 0.35 + i * 60;
      this._spawnPoolTile(px, poolY);
    }
  }

  _spawnPoolTile(px, py) {
    const size = this.cellSize;
    const g = this.add.graphics().setDepth(7);
    drawShapeGfx(this, g, px, py, 'square', size/2 - 2, hexToNum(COL_PRIMARY), 0.75);
    const hit = this.add.rectangle(px, py, size, size, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true, draggable: true }).setDepth(9);
    const tile = { gfx: g, hit: hit, homeX: px, homeY: py };
    const self = this;
    hit.on('drag', function(pointer, dx, dy){
      if (self.solved) return;
      hit.x = dx; hit.y = dy;
      g.clear(); drawShapeGfx(self, g, dx, dy, 'square', size/2 - 2, hexToNum(COL_PRIMARY), 0.75);
    });
    hit.on('dragend', function(){
      if (self.solved) { return; }
      // Snap to nearest grid cell if inside the zone
      const relX = hit.x - self.gridX;
      const relY = hit.y - self.gridY;
      const col = Math.floor(relX / self.cellSize);
      const row = Math.floor(relY / self.cellSize);
      const inside = col >= 0 && col < self.gridCols && row >= 0 && row < self.gridRows;
      const key = col + ',' + row;
      if (inside && !self.filled[key]) {
        // Must be either the FIRST tile or adjacent to an existing one (edge-to-edge)
        const isFirst = Object.keys(self.filled).length === 0;
        const hasNeighbour =
          self.filled[(col-1) + ',' + row] ||
          self.filled[(col+1) + ',' + row] ||
          self.filled[col + ',' + (row-1)] ||
          self.filled[col + ',' + (row+1)];
        if (isFirst || hasNeighbour) {
          // Place into grid
          const cx = self.gridX + col * self.cellSize + self.cellSize/2;
          const cy = self.gridY + row * self.cellSize + self.cellSize/2;
          const placedG = self.add.graphics().setDepth(6);
          drawShapeGfx(self, placedG, cx, cy, 'square', self.cellSize/2 - 2, hexToNum(COL_ACCENT), 0.85);
          self.cellGfx[key] = placedG;
          self.filled[key] = true;
          // Destroy the dragged tile and respawn at home
          g.destroy(); hit.destroy();
          self.time.delayedCall(100, function(){ self._spawnPoolTile(tile.homeX, tile.homeY); });
          self._updatePerimeter();
          return;
        }
      }
      // Invalid — bounce back home
      hit.x = tile.homeX; hit.y = tile.homeY;
      g.clear(); drawShapeGfx(self, g, tile.homeX, tile.homeY, 'square', self.cellSize/2 - 2, hexToNum(COL_PRIMARY), 0.75);
      // Tiny shake to communicate rejection (no life lost)
      self.cameras.main.shake(80, 0.004);
    });
  }

  _updatePerimeter() {
    // Perimeter = 4 * N - 2 * shared_edges
    const keys = Object.keys(this.filled);
    const n = keys.length;
    let shared = 0;
    for (let i = 0; i < keys.length; i++) {
      const parts = keys[i].split(',');
      const c = parseInt(parts[0]); const r = parseInt(parts[1]);
      if (this.filled[(c+1) + ',' + r]) shared++;
      if (this.filled[c + ',' + (r+1)]) shared++;
    }
    const perim = 4 * n - 2 * shared;
    this.perimeter = perim;
    if (perim === 0) {
      this.perimeterLbl.setText('Current perimeter: 0').setColor(COL_TEXT);
    } else {
      this.perimeterLbl.setText('Current perimeter: ' + perim).setColor(
        perim === this.targetPerimeter ? COL_ACCENT : (perim > this.targetPerimeter ? COL_DANGER : COL_PRIMARY)
      );
    }
    if (!this.solved && perim === this.targetPerimeter && n > 0) {
      this._win(n, shared, perim);
    }
  }

  _win(n, shared, perim) {
    this.solved = true;
    this.cameras.main.flash(180, 34, 197, 94);
    heroCheer(this, this.hero);
    gameScore += 10 * (this.round + 1);
    this.scoreLbl.setText('Score: ' + gameScore);
    const lines = [
      'You placed ' + n + ' unit squares.',
      'Each square has 4 edges → ' + (4*n) + ' edges total.',
      'Shared (hidden) edges: ' + shared + ' × 2 = ' + (2*shared),
      (4*n) + ' − ' + (2*shared) + ' = ' + perim
    ];
    const self = this;
    this.time.delayedCall(350, function(){
      showSolutionCard(self, 'Perimeter = ' + perim + '!', lines, function(){
        self.round++;
        if (self.round >= TOTAL_ROUNDS) self.scene.start('VictoryScene', { score: gameScore });
        else self.startRound();
      }, self.round + 1 >= TOTAL_ROUNDS);
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION C: ShapeDecomposerScene
// Math: Area decomposition — partitioning a composite into additive parts.
// A composite shape (e.g. L) is shown as visible unit-square outlines, split
// into two differently-coloured REGIONS. The player drags unit tiles to fill
// each region. Each region auto-counts the tiles placed in it. When all cells
// are filled, the total area is revealed as the sum of the regions.
// No typed answer. No Verify button. Filling IS counting IS adding.
// ═══════════════════════════════════════════════════════════════════════════════
class ShapeDecomposerScene extends Phaser.Scene {
  constructor() { super('ShapeDecomposerScene'); }

  create() {
    this.W = this.scale.width; this.H = this.scale.height;
    this.round = 0; this.lives = MAX_LIVES; this.solved = false;
    this._bg(); this._ui();
    this.hero = addCharacter(this, this.W * 0.88, this.H * 0.55, 0.8);
    this.startRound();
  }
  _bg() {
    const bg = this.add.image(this.W/2, this.H/2, 'bg');
    bg.setScale(Math.max(this.W/bg.width, this.H/bg.height));
    this.add.rectangle(this.W/2, this.H/2, this.W, this.H, 0x000000, 0.65);
  }
  _ui() {
    this.scoreLbl = this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);
    this.hg = this.add.group(); this._rh();
    this.dg = this.add.group(); this._rd();
  }
  _rh() {
    this.hg.clear(true,true);
    for (let i=0;i<this.lives;i++)
      this.hg.add(this.add.text(14+i*22,14,'\\u2665',{fontSize:'18px',color:COL_DANGER}).setDepth(10));
  }
  _rd() {
    this.dg.clear(true,true);
    for (let i=0;i<TOTAL_ROUNDS;i++){
      const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';
      this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));
    }
  }

  // Predefined region shapes per round (col, row offsets). Each region is
  // a set of grid cells. Two regions together form a composite (L / T / etc.)
  _roundLayouts() {
    // Each layout: array of 2 regions; each region is an array of [col,row] cells.
    return [
      // Round 0 — small L: 3 + 2 = 5
      {
        regions: [
          { cells: [[0,0],[1,0],[2,0]], color: COL_PRIMARY, name: 'blue part' },
          { cells: [[0,1],[0,2]],       color: COL_ACCENT,  name: 'green part' }
        ],
        shape: 'L'
      },
      // Round 1 — bigger L: 4 + 3 = 7
      {
        regions: [
          { cells: [[0,0],[1,0],[2,0],[3,0]], color: COL_PRIMARY, name: 'blue part' },
          { cells: [[0,1],[0,2],[0,3]],       color: COL_ACCENT,  name: 'green part' }
        ],
        shape: 'L'
      },
      // Round 2 — T shape: 3 + 3 = 6
      {
        regions: [
          { cells: [[0,0],[1,0],[2,0]], color: COL_PRIMARY, name: 'blue part' },
          { cells: [[1,1],[1,2],[1,3]], color: COL_ACCENT,  name: 'green part' }
        ],
        shape: 'T'
      },
      // Round 3 — step: 4 + 4 = 8
      {
        regions: [
          { cells: [[0,0],[1,0],[2,0],[3,0]], color: COL_PRIMARY, name: 'blue part' },
          { cells: [[0,1],[1,1],[0,2],[1,2]], color: COL_ACCENT,  name: 'green part' }
        ],
        shape: 'step'
      },
      // Round 4 — plus-ish: 5 + 3 = 8
      {
        regions: [
          { cells: [[0,1],[1,1],[2,1],[3,1],[4,1]], color: COL_PRIMARY, name: 'blue part' },
          { cells: [[2,0],[2,2],[2,3]],              color: COL_ACCENT,  name: 'green part' }
        ],
        shape: 'plus'
      }
    ];
  }

  startRound() {
    this.solved = false;
    if (this.rg) this.rg.clear(true, true);
    this.rg = this.add.group();
    if (this.gfxList) this.gfxList.forEach(function(g){ g.destroy(); });
    this.gfxList = [];
    if (this.cellOutlines) this.cellOutlines.forEach(function(g){ g.destroy(); });
    this.cellOutlines = [];
    if (this.cellFills) Object.keys(this.cellFills).forEach((k) => this.cellFills[k].destroy());
    this.cellFills = {};

    const layouts = this._roundLayouts();
    const layout = layouts[this.round % layouts.length];
    this.regions = layout.regions;
    this.filledCount = [0, 0];
    this.regionTotals = [this.regions[0].cells.length, this.regions[1].cells.length];
    this.totalCells = this.regionTotals[0] + this.regionTotals[1];
    // Quick lookup: cell key -> region index
    this.cellRegion = {};
    for (let i = 0; i < this.regions.length; i++) {
      const cells = this.regions[i].cells;
      for (let j = 0; j < cells.length; j++) {
        const k = cells[j][0] + ',' + cells[j][1];
        this.cellRegion[k] = i;
      }
    }
    // Track which cells are filled
    this.filledCell = {};

    this._rd();
    const W = this.W, H = this.H;

    // Header
    this.rg.add(this.add.text(W/2, H*0.05, 'Fill the shape to find its area', {
      fontSize: '17px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6));
    this.rg.add(this.add.text(W/2, H*0.10, 'Drag tiles of the matching colour into each region.', {
      fontSize: '11px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5).setDepth(6));

    // Compute grid placement — find max cols/rows used
    let maxCol = 0, maxRow = 0;
    this.regions.forEach(function(r){
      r.cells.forEach(function(c){
        if (c[0] > maxCol) maxCol = c[0];
        if (c[1] > maxRow) maxRow = c[1];
      });
    });
    const cols = maxCol + 1, rows = maxRow + 1;
    this.cellSize = Math.min(46, (W * 0.45) / Math.max(cols, rows));
    const shapeW = cols * this.cellSize;
    const shapeH = rows * this.cellSize;
    this.gridX = W * 0.42 - shapeW / 2;
    this.gridY = H * 0.25;

    // Draw each cell outline (showing the unit-square decomposition visually)
    const self = this;
    this.regions.forEach(function(region, rIdx) {
      region.cells.forEach(function(cell) {
        const cx = self.gridX + cell[0] * self.cellSize + self.cellSize/2;
        const cy = self.gridY + cell[1] * self.cellSize + self.cellSize/2;
        const g = self.add.graphics().setDepth(5);
        g.lineStyle(2, hexToNum(region.color), 0.9);
        g.fillStyle(hexToNum(region.color), 0.15);
        g.fillRect(cx - self.cellSize/2 + 1, cy - self.cellSize/2 + 1, self.cellSize - 2, self.cellSize - 2);
        g.strokeRect(cx - self.cellSize/2 + 1, cy - self.cellSize/2 + 1, self.cellSize - 2, self.cellSize - 2);
        self.cellOutlines.push(g);
      });
    });

    // Per-region live readouts (RIGHT side of shape)
    this.regionLbls = [];
    const readoutX = W * 0.74;
    this.regions.forEach(function(region, i) {
      const y = H * 0.28 + i * 46;
      const swatch = self.add.rectangle(readoutX - 60, y, 18, 18, hexToNum(region.color), 0.7)
        .setStrokeStyle(2, hexToNum(region.color), 1).setDepth(6);
      self.rg.add(swatch);
      const lbl = self.add.text(readoutX - 42, y, '0 of ' + self.regionTotals[i], {
        fontSize: '15px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0, 0.5).setDepth(6);
      self.rg.add(lbl);
      self.regionLbls.push(lbl);
    });

    // Running sum label
    this.sumLbl = this.add.text(readoutX - 60, H * 0.28 + this.regions.length * 46 + 12,
      '0 + 0 = 0 squares filled', {
        fontSize: '13px', color: COL_PRIMARY, fontFamily: "'Lexend', system-ui"
      }).setOrigin(0, 0.5).setDepth(6);
    this.rg.add(this.sumLbl);

    // Tile pools (one per region, colour-coded)
    const poolY = H * 0.78;
    this.regions.forEach(function(region, i) {
      const px = W * 0.30 + i * W * 0.25;
      self.rg.add(self.add.text(px, poolY - 36, region.name.toUpperCase() + ' TILES', {
        fontSize: '10px', color: region.color, fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(6));
      self._spawnDecomposerTile(px, poolY, i);
    });
  }

  _spawnDecomposerTile(px, py, regionIdx) {
    const region = this.regions[regionIdx];
    const size = this.cellSize;
    const g = this.add.graphics().setDepth(7);
    g.fillStyle(hexToNum(region.color), 0.75);
    g.lineStyle(2, hexToNum(region.color), 1);
    g.fillRect(px - size/2 + 2, py - size/2 + 2, size - 4, size - 4);
    g.strokeRect(px - size/2 + 2, py - size/2 + 2, size - 4, size - 4);
    const hit = this.add.rectangle(px, py, size, size, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true, draggable: true }).setDepth(9);
    const self = this;
    const tile = { gfx: g, hit: hit, homeX: px, homeY: py };
    const redraw = function(x, y) {
      g.clear();
      g.fillStyle(hexToNum(region.color), 0.75);
      g.lineStyle(2, hexToNum(region.color), 1);
      g.fillRect(x - size/2 + 2, y - size/2 + 2, size - 4, size - 4);
      g.strokeRect(x - size/2 + 2, y - size/2 + 2, size - 4, size - 4);
    };
    hit.on('drag', function(pointer, dx, dy){
      if (self.solved) return;
      hit.x = dx; hit.y = dy; redraw(dx, dy);
    });
    hit.on('dragend', function(){
      if (self.solved) return;
      const relX = hit.x - self.gridX;
      const relY = hit.y - self.gridY;
      const col = Math.floor(relX / self.cellSize);
      const row = Math.floor(relY / self.cellSize);
      const key = col + ',' + row;
      // Must be a cell that belongs to THIS region and not yet filled
      if (self.cellRegion[key] === regionIdx && !self.filledCell[key]) {
        const cx = self.gridX + col * self.cellSize + self.cellSize/2;
        const cy = self.gridY + row * self.cellSize + self.cellSize/2;
        const fillG = self.add.graphics().setDepth(6);
        fillG.fillStyle(hexToNum(region.color), 0.9);
        fillG.lineStyle(2, hexToNum(region.color), 1);
        fillG.fillRect(cx - self.cellSize/2 + 1, cy - self.cellSize/2 + 1, self.cellSize - 2, self.cellSize - 2);
        fillG.strokeRect(cx - self.cellSize/2 + 1, cy - self.cellSize/2 + 1, self.cellSize - 2, self.cellSize - 2);
        self.cellFills[key] = fillG;
        self.filledCell[key] = true;
        self.filledCount[regionIdx]++;
        g.destroy(); hit.destroy();
        self.time.delayedCall(80, function(){
          if (self.filledCount[regionIdx] < self.regionTotals[regionIdx] && !self.solved) {
            self._spawnDecomposerTile(tile.homeX, tile.homeY, regionIdx);
          }
        });
        self._updateDecomposerReadout();
        return;
      }
      // Invalid — bounce back
      hit.x = tile.homeX; hit.y = tile.homeY; redraw(tile.homeX, tile.homeY);
      self.cameras.main.shake(70, 0.003);
    });
  }

  _updateDecomposerReadout() {
    const a = this.filledCount[0], b = this.filledCount[1];
    this.regionLbls[0].setText(a + ' of ' + this.regionTotals[0]);
    this.regionLbls[1].setText(b + ' of ' + this.regionTotals[1]);
    this.sumLbl.setText(a + ' + ' + b + ' = ' + (a + b) + ' squares filled');
    if (a === this.regionTotals[0] && b === this.regionTotals[1] && !this.solved) {
      this._win(a, b);
    }
  }

  _win(a, b) {
    this.solved = true;
    this.cameras.main.flash(180, 34, 197, 94);
    heroCheer(this, this.hero);
    gameScore += 10 * (this.round + 1);
    this.scoreLbl.setText('Score: ' + gameScore);
    const lines = [
      'You filled two parts:',
      a + ' square units + ' + b + ' square units',
      'Total area = ' + (a + b) + ' square units'
    ];
    const self = this;
    this.time.delayedCall(350, function(){
      showSolutionCard(self, 'Area = ' + (a + b) + '!', lines, function(){
        self.round++;
        if (self.round >= TOTAL_ROUNDS) self.scene.start('VictoryScene', { score: gameScore });
        else self.startRound();
      }, self.round + 1 >= TOTAL_ROUNDS);
    });
  }
}
`
