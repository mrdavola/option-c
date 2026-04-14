// Craft & Combine — Phaser engine with 3 game options.
// Math: Add, multiply, combine quantities to match a recipe/target.
// Options: recipe-mixer, potion-lab, assembly-line

import type { ThemeConfig, MathParams, GameOption } from "./engine-types"
import { phaserGame } from "./base-phaser-template"
import { getOptionDef } from "./game-option-registry"

export function inventoryCraftingPhaserEngine(
  config: ThemeConfig,
  math: MathParams,
  option: GameOption = "recipe-mixer"
): string {
  const validOptions = ["recipe-mixer", "potion-lab", "assembly-line"]
  const activeOption = validOptions.includes(option) ? option : "recipe-mixer"

  const optDef = getOptionDef(activeOption)

  const sceneMap: Record<string, string> = {
    "recipe-mixer": "RecipeMixerScene",
    "potion-lab": "PotionLabScene",
    "assembly-line": "AssemblyLineScene",
  }

  return phaserGame({
    config,
    math,
    option: activeOption,
    sceneName: sceneMap[activeOption],
    introText: optDef?.introText || "Mix the ingredients!",
    helpText: optDef?.helpText || "Set amounts to match the recipe.",
    gameSceneCode: GAME_SCENES,
  })
}

const GAME_SCENES = `
// ─── Shared HUD helpers (mixin on Phaser.Scene) ─────────────────────────────
Phaser.Scene.prototype._cc_buildHud = function() {
  const W = this.scale.width, H = this.scale.height, pad = 14;
  this.scoreLbl = this.add.text(W - pad, pad, 'Score: 0', {
    fontSize: '16px', color: COL_ACCENT, fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
  }).setOrigin(1, 0).setDepth(10);
  this.heartsGroup = this.add.group();
  this._cc_redrawHearts();
  this.dotGroup = this.add.group();
  this._cc_redrawDots();
  this.promptLbl = this.add.text(W / 2, 44, '', {
    fontSize: '18px', color: COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold',
    align: 'center', wordWrap: { width: W - 80 }
  }).setOrigin(0.5, 0).setDepth(10);
  this.subPromptLbl = this.add.text(W / 2, 72, '', {
    fontSize: '12px', color: COL_TEXT, fontFamily: "'Lexend', system-ui",
    align: 'center', wordWrap: { width: W - 80 }
  }).setOrigin(0.5, 0).setDepth(10);
};
Phaser.Scene.prototype._cc_redrawHearts = function() {
  this.heartsGroup.clear(true, true);
  for (let i = 0; i < this.lives; i++) {
    this.heartsGroup.add(this.add.text(14 + i * 22, 14, '\\u2665',
      { fontSize: '18px', color: COL_DANGER }).setDepth(10));
  }
};
Phaser.Scene.prototype._cc_redrawDots = function() {
  this.dotGroup.clear(true, true);
  const W = this.scale.width, H = this.scale.height;
  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const col = i < this.round ? COL_ACCENT : (i === this.round ? COL_PRIMARY : '#555555');
    this.dotGroup.add(this.add.circle(W / 2 - 40 + i * 20, H - 16, 5, hexToNum(col)).setDepth(10));
  }
};
Phaser.Scene.prototype._cc_buildBg = function() {
  const W = this.scale.width, H = this.scale.height;
  const bg = this.add.image(W / 2, H / 2, 'bg');
  bg.setScale(Math.max(W / bg.width, H / bg.height));
  this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.7);
};

// Solution reveal card (shared) — shows a short message with a "Next round" button.
Phaser.Scene.prototype._cc_showSolutionCard = function(lines, onNext) {
  const W = this.scale.width, H = this.scale.height;
  const backdrop = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.55).setDepth(50);
  const card = this.add.rectangle(W/2, H * 0.5, W - 60, 240, 0x18181b, 1)
    .setStrokeStyle(2, hexToNum(COL_ACCENT)).setDepth(51);
  const h1 = this.add.text(W/2, H * 0.5 - 90, 'You solved it!', {
    fontSize: '22px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
  }).setOrigin(0.5).setDepth(52);
  const textObjs = [];
  lines.forEach((line, i) => {
    const t = this.add.text(W/2, H * 0.5 - 50 + i * 26, line, {
      fontSize: i === lines.length - 1 ? '20px' : '14px',
      color: i === lines.length - 1 ? COL_ACCENT : COL_TEXT,
      fontFamily: "'Space Grotesk', sans-serif",
      fontStyle: i === lines.length - 1 ? 'bold' : 'normal'
    }).setOrigin(0.5).setDepth(52);
    t.setAlpha(0);
    textObjs.push(t);
    this.time.delayedCall(150 * i, () => {
      this.tweens.add({ targets: t, alpha: 1, duration: 300 });
    });
  });
  const nextY = H * 0.5 + 85;
  const nextBg = this.add.rectangle(W/2, nextY, 220, 44, hexToNum(COL_ACCENT), 1)
    .setInteractive({ useHandCursor: true }).setDepth(52).setAlpha(0);
  const isLast = (this.round + 1) >= TOTAL_ROUNDS;
  const nextLbl = this.add.text(W/2, nextY, isLast ? 'Finish!' : 'Got it! Next round \\u2192', {
    fontSize: '14px', color: '#000', fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
  }).setOrigin(0.5).setDepth(53).setAlpha(0);
  this.time.delayedCall(150 * lines.length + 200, () => {
    this.tweens.add({ targets: [nextBg, nextLbl], alpha: 1, duration: 300 });
  });
  nextBg.on('pointerdown', () => {
    [backdrop, card, h1, ...textObjs, nextBg, nextLbl].forEach(o => o.destroy());
    onNext && onNext();
  });
};

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION A: Recipe Mixer — "Transparent Mixing Bowl"
// INTRINSIC: The target recipe is shown as COLOR LAYERS stacked inside a bowl.
// Player has ingredient bins and DRAGS items into the bowl. Each dropped item
// becomes a colored block that stacks visibly. Each layer auto-locks when its
// count matches the target. When all layers match, bowl glows. No +/- buttons,
// no Check button. The visual match IS the success condition. The child does
// NOT need to already know the math — they stack until colors match.
// ═══════════════════════════════════════════════════════════════════════════════
class RecipeMixerScene extends Phaser.Scene {
  constructor() { super('RecipeMixerScene'); }

  create() {
    this.W = this.scale.width;
    this.H = this.scale.height;
    this.round = 0;
    this.lives = MAX_LIVES;
    this._cc_buildBg();
    this._cc_buildHud();
    this.hero = addCharacter(this, this.W * 0.88, this.H * 0.55, 0.8);
    this.startRound();
  }

  _fallbackRecipe(round) {
    const variations = [
      [4, 2],
      [5, 3, 2],
      [6, 4, 2],
      [7, 5, 3],
      [8, 6, 4],
    ];
    return variations[round % variations.length];
  }

  startRound() {
    if (this.roundGroup) this.roundGroup.destroy(true);
    this.roundGroup = this.add.container(0, 0).setDepth(6);

    const data = getRound(this.round);
    const isDefault = !data || data.prompt === 'Solve this!' ||
      (Array.isArray(data.items) && data.items.length === 6 &&
       data.items[0] === 10 && data.items[1] === 5 && data.items[2] === 8);

    // Use up to 3 ingredient types; take counts from AI items or fallback
    let counts = isDefault ? this._fallbackRecipe(this.round)
      : (Array.isArray(data.items) ? data.items.filter(v => v > 0 && v <= 12).slice(0, 3) : []);
    if (!counts || counts.length < 2) counts = this._fallbackRecipe(this.round);
    counts = counts.slice(0, 3);

    this.targetCounts = counts.slice();
    this.playerCounts = counts.map(() => 0);
    this.layerColors = [COL_DANGER, COL_ACCENT, '#f1f5f9']; // red flour, yellow sugar, white eggs

    const layerNames = ['Flour', 'Sugar', 'Eggs'];
    this.layerNames = layerNames.slice(0, counts.length);

    this.promptLbl.setText(isDefault ? 'Fill the bowl to match!' : (data.prompt || 'Fill the bowl to match!'));
    this.subPromptLbl.setText('Drag ingredients into the bowl. Each layer locks when it matches.');
    this._cc_redrawDots();

    this._buildBowlAndTarget();
    this._buildIngredientBins();
  }

  _buildBowlAndTarget() {
    const W = this.W, H = this.H;
    // Two bowls side by side: TARGET (left) and PLAYER (right)
    const bowlW = 120, bowlH = 180;
    this.targetBowlX = W * 0.28;
    this.playerBowlX = W * 0.60;
    const bowlY = H * 0.48;
    this.bowlBottomY = bowlY + bowlH / 2 - 6;
    this.bowlH = bowlH;
    this.bowlW = bowlW;

    // Target bowl outline
    const tBowl = this.add.rectangle(this.targetBowlX, bowlY, bowlW, bowlH, 0x000000, 0.2)
      .setStrokeStyle(3, hexToNum(COL_TEXT), 0.8).setDepth(5);
    this.roundGroup.add(tBowl);
    this.roundGroup.add(this.add.text(this.targetBowlX, bowlY - bowlH/2 - 18, 'Target', {
      fontSize: '14px', color: COL_TEXT, fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6));

    // Player bowl outline
    const pBowl = this.add.rectangle(this.playerBowlX, bowlY, bowlW, bowlH, 0x000000, 0.2)
      .setStrokeStyle(3, hexToNum(COL_PRIMARY), 0.9).setDepth(5);
    this.roundGroup.add(pBowl);
    this.playerBowlOutline = pBowl;
    this.roundGroup.add(this.add.text(this.playerBowlX, bowlY - bowlH/2 - 18, 'Your bowl', {
      fontSize: '14px', color: COL_PRIMARY, fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6));

    // Draw target layers (stacked from bottom up)
    let y = this.bowlBottomY;
    const blockH = 10;
    this.targetCounts.forEach((n, li) => {
      const color = this.layerColors[li];
      for (let i = 0; i < n; i++) {
        const blk = this.add.rectangle(this.targetBowlX, y - i * blockH, bowlW - 14, blockH - 1,
          hexToNum(color), 0.85).setDepth(6);
        this.roundGroup.add(blk);
      }
      // Count badge
      this.roundGroup.add(this.add.text(this.targetBowlX + bowlW/2 + 8, y - (n - 1) * blockH / 2, 'x' + n, {
        fontSize: '12px', color: color, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0, 0.5).setDepth(7));
      y -= n * blockH;
    });

    // Player layer containers (blocks we'll add dynamically)
    this.playerLayers = this.targetCounts.map(() => []);
    this.layerLocked = this.targetCounts.map(() => false);

    // Live count labels next to player bowl
    this.playerCountLbls = [];
    let ly = this.bowlBottomY;
    this.targetCounts.forEach((tgt, li) => {
      const lbl = this.add.text(this.playerBowlX + bowlW/2 + 8, ly - (tgt - 1) * 10 / 2, '0/' + tgt, {
        fontSize: '12px', color: this.layerColors[li], fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0, 0.5).setDepth(7);
      this.roundGroup.add(lbl);
      this.playerCountLbls.push(lbl);
      ly -= tgt * 10;
    });
  }

  _buildIngredientBins() {
    const W = this.W, H = this.H;
    const binY = H - 70;
    const binSpacing = Math.min(140, W / (this.targetCounts.length + 1));
    const startX = W / 2 - ((this.targetCounts.length - 1) * binSpacing) / 2;

    this.bins = [];
    this.targetCounts.forEach((tgt, li) => {
      const bx = startX + li * binSpacing;
      const color = this.layerColors[li];
      const binBg = this.add.rectangle(bx, binY, 90, 56, hexToNum(color), 0.25)
        .setStrokeStyle(2, hexToNum(color), 0.9).setDepth(7);
      this.roundGroup.add(binBg);
      this.roundGroup.add(this.add.text(bx, binY - 14, this.layerNames[li], {
        fontSize: '11px', color: color, fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(8));
      this.roundGroup.add(this.add.text(bx, binY + 8, 'drag up', {
        fontSize: '10px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
      }).setOrigin(0.5).setDepth(8));

      // A draggable "source" token that always respawns
      this._spawnDragToken(li, bx, binY);
      this.bins.push({ x: bx, y: binY, color });
    });
  }

  _spawnDragToken(layerIdx, bx, by) {
    if (this.layerLocked[layerIdx]) return;
    const color = this.layerColors[layerIdx];
    const tok = this.add.circle(bx, by, 12, hexToNum(color), 1).setStrokeStyle(2, 0xffffff, 0.6).setDepth(9);
    tok.setInteractive({ useHandCursor: true, draggable: true });
    this.input.setDraggable(tok);
    this.roundGroup.add(tok);

    tok.on('drag', (_p, dx, dy) => {
      tok.x = dx; tok.y = dy;
    });
    tok.on('dragend', () => {
      const inBowl = Math.abs(tok.x - this.playerBowlX) < this.bowlW / 2 &&
                     Math.abs(tok.y - (this.bowlBottomY - this.bowlH / 2)) < this.bowlH / 2;
      if (inBowl && !this.layerLocked[layerIdx]) {
        tok.destroy();
        this._dropIntoBowl(layerIdx);
        this._spawnDragToken(layerIdx, bx, by);
      } else {
        this.tweens.add({ targets: tok, x: bx, y: by, duration: 200, ease: 'Cubic.easeOut' });
      }
    });
  }

  _dropIntoBowl(layerIdx) {
    // If this layer is already full, over-fill = mistake (lose life, remove a block)
    const target = this.targetCounts[layerIdx];
    const current = this.playerLayers[layerIdx].length;

    // If a lower layer isn't complete yet, you can't add to this one (stacked realism)
    for (let i = 0; i < layerIdx; i++) {
      if (this.playerLayers[i].length < this.targetCounts[i]) {
        this._flashMsg('Fill the ' + this.layerNames[i] + ' layer first!');
        return;
      }
    }

    if (current >= target) {
      this._flashMsg('Too much ' + this.layerNames[layerIdx] + '!');
      this.lives--;
      this._cc_redrawHearts();
      heroShake(this, this.hero);
      this.cameras.main.shake(150, 0.006);
      if (this.lives <= 0) {
        this.time.delayedCall(500, () => this.scene.start('LoseScene', { score: gameScore }));
      }
      return;
    }

    // Stack a block
    const blockH = 10;
    // Compute y: stack above any completed lower layers
    let baseOffset = 0;
    for (let i = 0; i < layerIdx; i++) baseOffset += this.targetCounts[i] * blockH;
    const yy = this.bowlBottomY - baseOffset - current * blockH;
    const blk = this.add.rectangle(this.playerBowlX, yy, this.bowlW - 14, blockH - 1,
      hexToNum(this.layerColors[layerIdx]), 0.9).setDepth(6).setAlpha(0);
    this.roundGroup.add(blk);
    this.tweens.add({ targets: blk, alpha: 0.9, duration: 180 });
    this.playerLayers[layerIdx].push(blk);

    // Update count
    this.playerCountLbls[layerIdx].setText((current + 1) + '/' + target);

    // Auto-lock when layer reaches target
    if (current + 1 === target) {
      this.layerLocked[layerIdx] = true;
      this.cameras.main.flash(120, 96, 165, 250);
      this.playerCountLbls[layerIdx].setText('\\u2713 ' + target);
      this._flashMsg(this.layerNames[layerIdx] + ' layer locked!');
      // Check all done
      if (this.layerLocked.every(Boolean)) {
        this._onAllLocked();
      }
    }
  }

  _flashMsg(msg) {
    if (this.msgLbl) this.msgLbl.destroy();
    this.msgLbl = this.add.text(this.W / 2, this.H * 0.15, msg, {
      fontSize: '14px', color: COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(30);
    this.tweens.add({ targets: this.msgLbl, alpha: 0, delay: 900, duration: 400,
      onComplete: () => this.msgLbl && this.msgLbl.destroy() });
  }

  _onAllLocked() {
    // Glow + chime
    this.cameras.main.flash(200, 34, 197, 94);
    heroCheer(this, this.hero);
    this.tweens.add({
      targets: this.playerBowlOutline,
      alpha: { from: 1, to: 0.3 },
      duration: 300, yoyo: true, repeat: 2
    });
    gameScore += 10 * (this.round + 1);
    this.scoreLbl.setText('Score: ' + gameScore);

    const total = this.targetCounts.reduce((a, b) => a + b, 0);
    const eqn = this.targetCounts.join(' + ') + ' = ' + total;
    this.time.delayedCall(600, () => {
      this._cc_showSolutionCard([
        'Perfect recipe!',
        this.layerNames.map((n, i) => n + ': ' + this.targetCounts[i]).join('   '),
        eqn,
      ], () => {
        this.round++;
        if (this.round >= TOTAL_ROUNDS) this.scene.start('VictoryScene', { score: gameScore });
        else this.startRound();
      });
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION B: Potion Lab — "Potion Bottle Growth"
// INTRINSIC: The bottle starts with a base quantity shown as glowing drops.
// Multiplier buttons (×2, ×3, ×4) make the bottle VISIBLY COPY the base that
// many times (stacking as repeated groups). Target line shown on the bottle.
// When liquid matches target, bottle glows. Player explores by clicking
// multipliers. Multiplication emerges from visible repetition.
// ═══════════════════════════════════════════════════════════════════════════════
class PotionLabScene extends Phaser.Scene {
  constructor() { super('PotionLabScene'); }

  create() {
    this.W = this.scale.width;
    this.H = this.scale.height;
    this.round = 0;
    this.lives = MAX_LIVES;
    this._cc_buildBg();
    this._cc_buildHud();
    this.hero = addCharacter(this, this.W * 0.88, this.H * 0.55, 0.8);
    this.startRound();
  }

  _fallback(round) {
    const v = [
      { base: 2, mult: 3 }, // target 6
      { base: 3, mult: 2 }, // 6
      { base: 2, mult: 4 }, // 8
      { base: 3, mult: 4 }, // 12
      { base: 4, mult: 3 }, // 12
    ];
    return v[round % v.length];
  }

  startRound() {
    if (this.roundGroup) this.roundGroup.destroy(true);
    this.roundGroup = this.add.container(0, 0).setDepth(6);

    const data = getRound(this.round);
    const isDefault = !data || data.prompt === 'Solve this!' ||
      (Array.isArray(data.items) && data.items.length === 6 &&
       data.items[0] === 10 && data.items[1] === 5 && data.items[2] === 8);
    const fb = this._fallback(this.round);
    // Target from AI; base from items[0] if reasonable
    let target = (!isDefault && typeof data.target === 'number' && data.target > 1 && data.target <= 40)
      ? data.target : fb.base * fb.mult;
    let base = (!isDefault && Array.isArray(data.items) && data.items[0] > 1)
      ? data.items[0] : fb.base;
    // Ensure target is a multiple of base in [2..5]
    if (base < 2) base = fb.base;
    if (target % base !== 0 || target / base < 2 || target / base > 5) {
      base = fb.base; target = fb.base * fb.mult;
    }
    this.base = base;
    this.target = target;
    this.correctMult = target / base;
    this.selectedMult = 1;

    this.promptLbl.setText('Make ' + target + ' drops of potion');
    this.subPromptLbl.setText('Base is ' + base + '. Pick a multiplier to copy it.');
    this._cc_redrawDots();

    this._buildBottle();
    this._buildMultiplierButtons();
    this._updateBottle();
  }

  _buildBottle() {
    const W = this.W, H = this.H;
    this.bottleX = W * 0.5;
    this.bottleTop = H * 0.18;
    this.bottleBottom = H * 0.62;
    this.bottleHeight = this.bottleBottom - this.bottleTop;
    this.bottleWidth = 110;
    // Neck
    const neck = this.add.rectangle(this.bottleX, this.bottleTop - 10, 40, 20, hexToNum(COL_SECONDARY), 0.5)
      .setStrokeStyle(2, hexToNum(COL_TEXT), 0.9).setDepth(5);
    this.roundGroup.add(neck);
    // Body
    const body = this.add.rectangle(this.bottleX, (this.bottleTop + this.bottleBottom)/2,
      this.bottleWidth, this.bottleHeight, 0x000000, 0.25)
      .setStrokeStyle(3, hexToNum(COL_TEXT), 0.9).setDepth(5);
    this.roundGroup.add(body);
    this.bottleOutline = body;

    // Target line across the bottle — visible goal
    // Each drop = 8px tall; capacity 25 drops
    this.pxPerDrop = Math.min(12, (this.bottleHeight - 20) / 25);
    const targetY = this.bottleBottom - 8 - this.target * this.pxPerDrop;
    this.roundGroup.add(this.add.line(0, 0,
      this.bottleX - this.bottleWidth/2, targetY,
      this.bottleX + this.bottleWidth/2, targetY,
      hexToNum(COL_ACCENT), 1).setLineWidth(3).setDepth(7));
    this.roundGroup.add(this.add.text(this.bottleX + this.bottleWidth/2 + 8, targetY,
      'target ' + this.target, {
      fontSize: '12px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0, 0.5).setDepth(7));

    // Base label shown at bottom-left of bottle
    this.roundGroup.add(this.add.text(this.bottleX - this.bottleWidth/2 - 8, this.bottleBottom - 8,
      'base: ' + this.base, {
      fontSize: '11px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(1, 1).setDepth(7));
  }

  _buildMultiplierButtons() {
    const W = this.W, H = this.H;
    const options = [1, 2, 3, 4, 5];
    const btnW = 64, spacing = 10;
    const totalW = options.length * btnW + (options.length - 1) * spacing;
    const startX = W/2 - totalW/2 + btnW/2;
    const by = H - 90;

    this.roundGroup.add(this.add.text(W/2, by - 34, 'Multiplier', {
      fontSize: '13px', color: COL_TEXT, fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(7));

    this.multBtns = [];
    options.forEach((m, i) => {
      const x = startX + i * (btnW + spacing);
      const bg = this.add.rectangle(x, by, btnW, 44, hexToNum(COL_SECONDARY), 0.4)
        .setStrokeStyle(2, hexToNum(COL_PRIMARY), 0.5)
        .setInteractive({ useHandCursor: true }).setDepth(8);
      const lbl = this.add.text(x, by, '\\u00d7' + m, {
        fontSize: '18px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(9);
      this.roundGroup.add(bg);
      this.roundGroup.add(lbl);
      bg.on('pointerdown', () => this._selectMult(m));
      this.multBtns.push({ bg, lbl, m });
    });
  }

  _selectMult(m) {
    this.selectedMult = m;
    this.multBtns.forEach(b => {
      if (b.m === m) {
        b.bg.setFillStyle(hexToNum(COL_PRIMARY), 0.8);
        b.lbl.setColor('#fff');
      } else {
        b.bg.setFillStyle(hexToNum(COL_SECONDARY), 0.4);
        b.lbl.setColor(COL_TEXT);
      }
    });
    this._updateBottle();
  }

  _updateBottle() {
    // Clear old drops
    if (this._drops) this._drops.forEach(d => d.destroy());
    this._drops = [];
    const total = this.base * this.selectedMult;
    // Render as groups: selectedMult groups of base drops, each group a slightly different shade
    const groupColors = [COL_PRIMARY, COL_ACCENT, COL_DANGER, '#f59e0b', '#a855f7'];
    let dropIdx = 0;
    for (let g = 0; g < this.selectedMult; g++) {
      const col = groupColors[g % groupColors.length];
      for (let i = 0; i < this.base; i++) {
        const y = this.bottleBottom - 8 - dropIdx * this.pxPerDrop;
        if (y < this.bottleTop + 6) break;
        const d = this.add.rectangle(this.bottleX, y, this.bottleWidth - 10, this.pxPerDrop - 1,
          hexToNum(col), 0.85).setDepth(6).setAlpha(0);
        this.roundGroup.add(d);
        this.tweens.add({ targets: d, alpha: 0.85, duration: 120 });
        this._drops.push(d);
        dropIdx++;
      }
    }

    // Live equation
    if (this.eqnLbl) this.eqnLbl.destroy();
    this.eqnLbl = this.add.text(this.W/2, this.H * 0.7, this.base + ' \\u00d7 ' + this.selectedMult + ' = ' + total, {
      fontSize: '22px', color: total === this.target ? COL_ACCENT : COL_PRIMARY,
      fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);
    this.roundGroup.add(this.eqnLbl);

    if (total === this.target) this._onSolved();
  }

  _onSolved() {
    if (this._solved) return;
    this._solved = true;
    this.cameras.main.flash(200, 34, 197, 94);
    heroCheer(this, this.hero);
    this.tweens.add({
      targets: this.bottleOutline,
      alpha: { from: 1, to: 0.4 },
      duration: 280, yoyo: true, repeat: 2
    });
    gameScore += 10 * (this.round + 1);
    this.scoreLbl.setText('Score: ' + gameScore);
    const addition = new Array(this.selectedMult).fill(this.base).join(' + ');
    this.time.delayedCall(600, () => {
      this._cc_showSolutionCard([
        'Perfect potion!',
        addition + ' = ' + this.target,
        this.base + ' \\u00d7 ' + this.selectedMult + ' = ' + this.target,
      ], () => {
        this._solved = false;
        this.round++;
        if (this.round >= TOTAL_ROUNDS) this.scene.start('VictoryScene', { score: gameScore });
        else this.startRound();
      });
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION C: Assembly Line — "Conveyor with Pallets"
// INTRINSIC: Target total is shown. Two sliders control "items per pallet" and
// "number of pallets." As sliders move, pallets appear on a conveyor with the
// chosen number of items each. Live total updates as "N × M = T". When total
// matches target, conveyor activates. Multiplication emerges from grouping —
// the child does NOT need to know multiplication, only to experiment with
// groups until the total matches.
// ═══════════════════════════════════════════════════════════════════════════════
class AssemblyLineScene extends Phaser.Scene {
  constructor() { super('AssemblyLineScene'); }

  create() {
    this.W = this.scale.width;
    this.H = this.scale.height;
    this.round = 0;
    this.lives = MAX_LIVES;
    this._cc_buildBg();
    this._cc_buildHud();
    this.hero = addCharacter(this, this.W * 0.88, this.H * 0.55, 0.8);
    this.startRound();
  }

  _fallback(round) {
    const v = [
      { perPallet: 3, pallets: 2 }, // 6
      { perPallet: 4, pallets: 3 }, // 12
      { perPallet: 5, pallets: 3 }, // 15
      { perPallet: 4, pallets: 5 }, // 20
      { perPallet: 6, pallets: 4 }, // 24
    ];
    return v[round % v.length];
  }

  startRound() {
    if (this.roundGroup) this.roundGroup.destroy(true);
    this.roundGroup = this.add.container(0, 0).setDepth(6);
    this._solved = false;

    const data = getRound(this.round);
    const isDefault = !data || data.prompt === 'Solve this!' ||
      (Array.isArray(data.items) && data.items.length === 6 &&
       data.items[0] === 10 && data.items[1] === 5 && data.items[2] === 8);
    const fb = this._fallback(this.round);
    let target = (!isDefault && typeof data.target === 'number' && data.target >= 4 && data.target <= 36)
      ? data.target : fb.perPallet * fb.pallets;
    // Ensure target is a product of two integers in [1..6]
    if (!Number.isInteger(target) || target < 4) target = fb.perPallet * fb.pallets;
    this.target = target;

    this.perPallet = 1;
    this.pallets = 1;

    this.promptLbl.setText('Deliver exactly ' + target + ' items');
    this.subPromptLbl.setText('Adjust items-per-pallet and number-of-pallets.');
    this._cc_redrawDots();

    this._buildConveyor();
    this._buildSliders();
    this._updateConveyor();
  }

  _buildConveyor() {
    const W = this.W, H = this.H;
    // Conveyor belt visual
    this.conveyorY = H * 0.42;
    this.conveyorX1 = W * 0.08;
    this.conveyorX2 = W * 0.92;
    const belt = this.add.rectangle(W/2, this.conveyorY, this.conveyorX2 - this.conveyorX1, 50,
      hexToNum(COL_SECONDARY), 0.4)
      .setStrokeStyle(2, hexToNum(COL_TEXT), 0.6).setDepth(5);
    this.roundGroup.add(belt);
    this.beltRect = belt;
    // Target badge on right (delivery end)
    this.targetBadge = this.add.rectangle(this.conveyorX2 + 2, this.conveyorY, 70, 60,
      hexToNum(COL_ACCENT), 0.25).setStrokeStyle(2, hexToNum(COL_ACCENT), 1).setDepth(5);
    this.roundGroup.add(this.targetBadge);
    this.roundGroup.add(this.add.text(this.conveyorX2 + 2, this.conveyorY - 10, 'Need', {
      fontSize: '11px', color: COL_ACCENT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5).setDepth(7));
    this.roundGroup.add(this.add.text(this.conveyorX2 + 2, this.conveyorY + 8, String(this.target), {
      fontSize: '22px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(7));
  }

  _buildSliders() {
    const W = this.W, H = this.H;
    const MAX_PER = 6, MAX_PALLETS = 6;

    const mkSlider = (y, label, max, getVal, setVal) => {
      this.roundGroup.add(this.add.text(W * 0.1, y, label, {
        fontSize: '13px', color: COL_TEXT, fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
      }).setOrigin(0, 0.5).setDepth(8));
      const valLbl = this.add.text(W * 0.1, y + 16, String(getVal()), {
        fontSize: '22px', color: COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0, 0.5).setDepth(8);
      this.roundGroup.add(valLbl);

      // Buttons -/+
      const minus = this.add.rectangle(W * 0.35, y + 8, 40, 36, hexToNum(COL_DANGER), 0.6)
        .setInteractive({ useHandCursor: true }).setDepth(8);
      this.roundGroup.add(minus);
      this.roundGroup.add(this.add.text(W * 0.35, y + 8, '\\u2212', {
        fontSize: '22px', color: '#fff', fontFamily: 'sans-serif', fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(9));

      // Tick track
      const trackX1 = W * 0.42, trackX2 = W * 0.78;
      this.roundGroup.add(this.add.rectangle((trackX1+trackX2)/2, y + 8,
        trackX2 - trackX1, 4, hexToNum(COL_TEXT), 0.3).setDepth(7));
      const ticks = [];
      for (let i = 1; i <= max; i++) {
        const tx = trackX1 + ((i - 1) / (max - 1)) * (trackX2 - trackX1);
        const c = this.add.circle(tx, y + 8, 6, hexToNum(COL_SECONDARY), 0.7).setDepth(8);
        this.roundGroup.add(c);
        ticks.push(c);
      }
      const updateTicks = () => {
        ticks.forEach((c, i) => {
          const active = (i + 1) <= getVal();
          c.setFillStyle(hexToNum(active ? COL_PRIMARY : COL_SECONDARY), active ? 1 : 0.6);
          c.setRadius(active ? 8 : 6);
        });
        valLbl.setText(String(getVal()));
      };

      const plus = this.add.rectangle(W * 0.85, y + 8, 40, 36, hexToNum(COL_ACCENT), 0.7)
        .setInteractive({ useHandCursor: true }).setDepth(8);
      this.roundGroup.add(plus);
      this.roundGroup.add(this.add.text(W * 0.85, y + 8, '+', {
        fontSize: '22px', color: '#000', fontFamily: 'sans-serif', fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(9));

      minus.on('pointerdown', () => {
        if (getVal() > 1) { setVal(getVal() - 1); updateTicks(); this._updateConveyor(); }
      });
      plus.on('pointerdown', () => {
        if (getVal() < max) { setVal(getVal() + 1); updateTicks(); this._updateConveyor(); }
      });

      updateTicks();
    };

    mkSlider(H * 0.68, 'Items per pallet', MAX_PER,
      () => this.perPallet, v => this.perPallet = v);
    mkSlider(H * 0.82, 'Number of pallets', MAX_PALLETS,
      () => this.pallets, v => this.pallets = v);
  }

  _updateConveyor() {
    if (this._solved) return;
    // Redraw pallets
    if (this._palletVisuals) this._palletVisuals.forEach(v => v.destroy());
    this._palletVisuals = [];

    const beltW = this.conveyorX2 - this.conveyorX1;
    const gap = beltW / (this.pallets + 1);
    for (let p = 0; p < this.pallets; p++) {
      const px = this.conveyorX1 + gap * (p + 1);
      // Pallet base
      const base = this.add.rectangle(px, this.conveyorY + 8, 52, 10,
        hexToNum(COL_PRIMARY), 0.9).setDepth(6);
      this._palletVisuals.push(base);
      this.roundGroup.add(base);
      // Items stacked on pallet — up to 6, arranged 3 per row
      for (let i = 0; i < this.perPallet; i++) {
        const col = i % 3; const row = Math.floor(i / 3);
        const ix = px - 16 + col * 14;
        const iy = this.conveyorY - 2 - row * 12;
        const item = this.add.circle(ix, iy, 5, hexToNum(COL_ACCENT), 1).setDepth(6);
        this._palletVisuals.push(item);
        this.roundGroup.add(item);
      }
    }

    // Live equation
    const total = this.perPallet * this.pallets;
    if (this.eqnLbl) this.eqnLbl.destroy();
    this.eqnLbl = this.add.text(this.W/2, this.H * 0.55,
      this.perPallet + ' \\u00d7 ' + this.pallets + ' = ' + total + '   (need ' + this.target + ')', {
      fontSize: '18px', color: total === this.target ? COL_ACCENT : COL_PRIMARY,
      fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);
    this.roundGroup.add(this.eqnLbl);

    if (total === this.target) this._onSolved(total);
  }

  _onSolved(total) {
    this._solved = true;
    // Animate pallets moving off the belt to the delivery badge
    if (this._palletVisuals) {
      this._palletVisuals.forEach(v => {
        this.tweens.add({ targets: v, x: v.x + (this.conveyorX2 - this.conveyorX1) * 0.3,
          duration: 600, ease: 'Sine.easeIn' });
      });
    }
    this.cameras.main.flash(220, 34, 197, 94);
    heroCheer(this, this.hero);
    gameScore += 10 * (this.round + 1);
    this.scoreLbl.setText('Score: ' + gameScore);

    this.time.delayedCall(700, () => {
      this._cc_showSolutionCard([
        'Delivered!',
        this.pallets + ' pallets of ' + this.perPallet + ' items each',
        this.perPallet + ' \\u00d7 ' + this.pallets + ' = ' + total,
      ], () => {
        this.round++;
        if (this.round >= TOTAL_ROUNDS) this.scene.start('VictoryScene', { score: gameScore });
        else this.startRound();
      });
    });
  }
}
`
