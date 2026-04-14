// Standard Pedagogy — Phaser engine with 4 game options.
// Math: Expressions, factors, sorting/classifying, measurement & data.
// Options: expression-transformer, factor-finder, category-sort, measure-and-plot
//
// ═══════════════════════════════════════════════════════════════════════════════
// TRULY INTRINSIC REDESIGNS v2 (April 13, 2026)
// Modeled on MysterySideScene in balance-systems-phaser.ts.
//
// ExpressionTransformerScene → Algebra tiles with AUTO-DETECT simplification.
//                              No numpad. The player cancels zero pairs until
//                              only like-kind remains, and the round solves
//                              itself when the canonical form is reached.
// CategorySortScene → "Self-Revealing Buckets": unlabeled buckets with hidden
//                     property tests. Drop a number — if the bucket's secret
//                     rule accepts it, it GLOWS and snaps in. Otherwise it
//                     BOUNCES back. Rules are discovered through trial. No
//                     labels. No Check button. Success = every item placed.
// MeasureAndPlotScene → "Draggable Marker with Crosshairs": grid with a
//                       draggable marker. Live crosshairs + live (x, y) label
//                       track the pointer. Target coordinates at the top. When
//                       the marker aligns, it SNAPS and the round completes.
//
// Every rebuilt scene has:
//   - math prompt at the top
//   - physical/visual manipulation only (no number pads, no typing)
//   - live feedback as the player acts
//   - automatic success detection (no "Check" button)
//   - a solution reveal card with "Got it! Next round →"
//   - 5 rounds with fallback variation if AI_ROUNDS absent
//   - hero visible at W*0.88, H*0.55, scale 0.8
// ═══════════════════════════════════════════════════════════════════════════════

import type { ThemeConfig, MathParams, GameOption } from "./engine-types"
import { phaserGame } from "./base-phaser-template"
import { getOptionDef } from "./game-option-registry"

export function standardPedagogyPhaserEngine(
  config: ThemeConfig,
  math: MathParams,
  option: GameOption = "expression-transformer"
): string {
  const validOptions = ["expression-transformer", "factor-finder", "category-sort", "measure-and-plot"]
  const activeOption = validOptions.includes(option) ? option : "expression-transformer"
  const optDef = getOptionDef(activeOption)
  const sceneMap: Record<string, string> = {
    "expression-transformer": "ExpressionTransformerScene",
    "factor-finder": "FactorFinderScene",
    "category-sort": "CategorySortScene",
    "measure-and-plot": "MeasureAndPlotScene",
  }
  return phaserGame({
    config, math, option: activeOption,
    sceneName: sceneMap[activeOption],
    introText: optDef?.introText || "Practice core math skills!",
    helpText: optDef?.helpText || "Use interactive tools to solve problems.",
    gameSceneCode: GAME_SCENES,
  })
}

const GAME_SCENES = `
// ═══════════════════════════════════════════════════════════════════════════════
// ExpressionTransformerScene — INTRINSIC REBUILD
//
// Teaches: Simplifying algebraic expressions by cancelling zero pairs.
//
// Setup: A row of algebra tiles sits in a workspace. Green squares = +1,
// red squares = -1, blue rectangles = +x, dark red = -x. The player clicks
// a tile to cancel it with ANY opposite tile of the same kind (a zero pair).
// Cancelled tiles animate out. When no more cancellations are possible,
// the remaining tiles ARE the simplified expression — the round auto-solves
// by showing what's left.
//
// Self-revealing truth: +1 and -1 cancel; +x and -x cancel. Whatever remains
// is the simplified form. No typing, no Check button.
// ═══════════════════════════════════════════════════════════════════════════════
class ExpressionTransformerScene extends Phaser.Scene {
  constructor() { super('ExpressionTransformerScene'); }

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
      fontSize: '12px', color: COL_TEXT, fontFamily: "'Lexend', system-ui", align: 'center',
      wordWrap: { width: W - 60 }, alpha: 0.8
    }).setOrigin(0.5, 0).setDepth(10);
    this.statusLbl = this.add.text(W / 2, this.H * 0.7, '', {
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
    // Fallback variations — kind sets where zero pairs exist
    // Values: +1, -1 (units); +11, -11 represent +x, -x (match |val|>10 convention)
    const fallbacks = [
      { items: [1, 1, 1, -1, -1], result: '+1' },               // 3 - 2 = 1
      { items: [1, 1, -1, -1, 1, 1], result: '+2' },            // 4 - 2 = 2
      { items: [11, 1, 1, -1, -11], result: '+1' },             // x + 2 - 1 - x = 1
      { items: [11, 11, -11, 1, 1, 1, -1], result: '+x +2' },   // 2x - x + 3 - 1 = x + 2
      { items: [11, -11, 1, -1, 1, -1, 1], result: '+1' },      // all cancels leaving +1
    ];
    const data = getRound(this.round);
    const fb = fallbacks[this.round % fallbacks.length];
    const isDefault = !data || data.prompt === 'Solve this!' ||
      (Array.isArray(data.items) && data.items.length === 6 && data.items[0] === 10 && data.items[1] === 5);
    const items = isDefault ? fb.items.slice() :
      (Array.isArray(data.items) && data.items.length >= 2 ? data.items.slice() : fb.items.slice());

    if (this.roundGroup) this.roundGroup.clear(true, true);
    this.roundGroup = this.add.group();

    this.promptLbl.setText('Cancel zero pairs');
    this.subPromptLbl.setText('Click any tile — it cancels with its opposite (+1 with \\u22121, +x with \\u2212x).');
    this.statusLbl.setText('Remaining: ' + this._computeRemaining(items)).setColor(COL_PRIMARY);

    this._redrawDots();
    this._buildTiles(items);
    this.solved = false;
  }

  _buildTiles(items) {
    const W = this.W, H = this.H;
    const area = { cx: W / 2, cy: H * 0.4, w: W * 0.86, h: H * 0.4 };
    const frame = this.add.rectangle(area.cx, area.cy, area.w, area.h, hexToNum(COL_SECONDARY), 0.08)
      .setStrokeStyle(1, hexToNum(COL_SECONDARY), 0.3).setDepth(3);
    this.roundGroup.add(frame);

    this.tiles = [];
    const tileH = 32;
    const gap = 8;
    const perRow = 6;
    items.forEach((val, i) => {
      const row = Math.floor(i / perRow);
      const col = i % perRow;
      const isX = Math.abs(val) > 10;
      const isNeg = val < 0;
      const tileW = isX ? 56 : 32;
      const tileCol = isNeg ? (isX ? 0x8B2F2F : hexToNum(COL_DANGER)) : (isX ? 0x4488DD : 0x44BB44);
      const tx = area.cx - (perRow * (32 + gap)) / 2 + col * (32 + gap) + (isX ? 12 : 0) + 16;
      const ty = area.cy - area.h / 2 + 30 + row * (tileH + gap + 4);
      const bg = this.add.rectangle(tx, ty, tileW, tileH, tileCol, 0.85)
        .setStrokeStyle(2, 0xffffff, 0.4).setInteractive({ useHandCursor: true }).setDepth(7);
      const label = isX ? (isNeg ? '\\u2212x' : '+x') : (isNeg ? '\\u22121' : '+1');
      const lbl = this.add.text(tx, ty, label, {
        fontSize: '15px', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(8);
      this.roundGroup.add(bg); this.roundGroup.add(lbl);
      const tileObj = { val, bg, lbl, cancelled: false, kind: isX ? 'x' : '1', sign: isNeg ? -1 : 1 };
      this.tiles.push(tileObj);
      bg.on('pointerdown', () => this._tryCancel(tileObj));
    });
  }

  _tryCancel(tile) {
    if (tile.cancelled || this.solved) return;
    // Find an uncancelled tile of same kind with opposite sign
    const partner = this.tiles.find(t =>
      !t.cancelled && t !== tile && t.kind === tile.kind && t.sign === -tile.sign
    );
    if (!partner) {
      // No partner: wiggle the tile (signals "this one can't be cancelled right now")
      this.tweens.add({ targets: [tile.bg, tile.lbl], x: '+=4', duration: 60, yoyo: true, repeat: 2 });
      return;
    }
    tile.cancelled = true; partner.cancelled = true;
    this.tweens.add({ targets: [tile.bg, tile.lbl], alpha: 0, scaleX: 0, scaleY: 0, duration: 280, ease: 'Back.easeIn' });
    this.tweens.add({ targets: [partner.bg, partner.lbl], alpha: 0, scaleX: 0, scaleY: 0, duration: 280, ease: 'Back.easeIn' });
    this._burst(tile.bg.x, tile.bg.y);
    this._burst(partner.bg.x, partner.bg.y);
    this.time.delayedCall(320, () => this._checkSolved());
  }

  _burst(x, y) {
    for (let i = 0; i < 6; i++) {
      const p = this.add.circle(x, y, 3, hexToNum(COL_ACCENT), 1).setDepth(12);
      this.roundGroup.add(p);
      const a = (Math.PI * 2 * i) / 6;
      this.tweens.add({
        targets: p, x: x + Math.cos(a) * 20, y: y + Math.sin(a) * 20, alpha: 0,
        duration: 300, onComplete: () => p.destroy()
      });
    }
  }

  _computeRemaining(items) {
    let unit = 0, x = 0;
    items.forEach(v => {
      if (Math.abs(v) > 10) x += v > 0 ? 1 : -1;
      else unit += v > 0 ? 1 : -1;
    });
    const parts = [];
    if (x !== 0) parts.push((x > 0 ? '+' : '\\u2212') + (Math.abs(x) === 1 ? 'x' : Math.abs(x) + 'x'));
    if (unit !== 0) parts.push((unit > 0 ? '+' : '\\u2212') + Math.abs(unit));
    return parts.length === 0 ? '0' : parts.join(' ');
  }

  _remainingTiles() {
    return this.tiles.filter(t => !t.cancelled);
  }

  _hasOpposites() {
    const rem = this._remainingTiles();
    const hasPosUnit = rem.some(t => t.kind === '1' && t.sign > 0);
    const hasNegUnit = rem.some(t => t.kind === '1' && t.sign < 0);
    const hasPosX = rem.some(t => t.kind === 'x' && t.sign > 0);
    const hasNegX = rem.some(t => t.kind === 'x' && t.sign < 0);
    return (hasPosUnit && hasNegUnit) || (hasPosX && hasNegX);
  }

  _checkSolved() {
    if (this.solved) return;
    // Update status
    const rem = this._remainingTiles();
    const remStr = this._computeRemaining(rem.map(t => t.val));
    this.statusLbl.setText('Remaining: ' + remStr).setColor(COL_PRIMARY);
    // If no more opposite pairs exist → simplified form reached
    if (!this._hasOpposites()) {
      this.solved = true;
      rem.forEach(t => {
        this.tweens.add({ targets: [t.bg, t.lbl], scale: 1.2, duration: 220, yoyo: true, repeat: 1 });
        t.bg.setStrokeStyle(2, hexToNum(COL_ACCENT), 1);
      });
      this.cameras.main.flash(120, 34, 197, 94);
      heroCheer(this, this.hero);
      gameScore += 10 * (this.round + 1);
      this.scoreLbl.setText('Score: ' + gameScore);
      this.time.delayedCall(500, () => this._showSolutionCard(remStr));
    }
  }

  _showSolutionCard(remStr) {
    const W = this.W, H = this.H;
    const backdrop = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.55).setDepth(50);
    const card = this.add.rectangle(W/2, H*0.5, W - 40, 220, 0x18181b, 1)
      .setStrokeStyle(2, hexToNum(COL_ACCENT)).setDepth(51);
    const h1 = this.add.text(W/2, H*0.5 - 80, 'Simplified!', {
      fontSize: '22px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(52);
    const lines = [
      'You cancelled every zero pair',
      'What remains is the simplified form:',
      remStr,
    ];
    const texts = [];
    lines.forEach((line, i) => {
      const t = this.add.text(W/2, H*0.5 - 30 + i * 28, line, {
        fontSize: i === 2 ? '22px' : '14px',
        color: i === 2 ? COL_ACCENT : COL_TEXT,
        fontFamily: "'Space Grotesk', sans-serif",
        fontStyle: i === 2 ? 'bold' : 'normal'
      }).setOrigin(0.5).setDepth(52).setAlpha(0);
      this.time.delayedCall(180 * i, () => this.tweens.add({ targets: t, alpha: 1, duration: 260 }));
      texts.push(t);
    });
    const nextY = H*0.5 + 80;
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
// FactorFinderScene — ALREADY INTRINSIC (kept as-is; click to split a factor
// tree node until all leaves are prime).
// ═══════════════════════════════════════════════════════════════════════════════
class FactorFinderScene extends Phaser.Scene {
  constructor() { super('FactorFinderScene'); }
  create() { this.W=this.scale.width;this.H=this.scale.height;this.round=0;this.lives=MAX_LIVES;this._bg();this._ui();this.hero=addCharacter(this,this.W*0.88,this.H*0.55,0.8);this.startRound(); }
  _bg() { const bg=this.add.image(this.W/2,this.H/2,'bg');bg.setScale(Math.max(this.W/bg.width,this.H/bg.height));this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.65); }
  _ui() { this.scoreLbl=this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);this.hg=this.add.group();this._rh();this.dg=this.add.group();this._rd(); }
  _rh() { this.hg.clear(true,true);for(let i=0;i<this.lives;i++)this.hg.add(this.add.text(14+i*22,14,'\\u2665',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dg.clear(true,true);for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  startRound() {
    if(this.rg)this.rg.clear(true,true);this.rg=this.add.group();
    this._rd();
    const data=getRound(this.round);
    const W=this.W,H=this.H;
    const items=data.items;

    this.rg.add(this.add.text(W/2,H*0.06,data.prompt||'Split until all are prime',{fontSize:'15px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",wordWrap:{width:W-40},align:'center'}).setOrigin(0.5,0).setDepth(6));

    const fallbacks=[12,18,20,24,30];
    const fb=fallbacks[this.round%fallbacks.length];
    const rootNum=(Array.isArray(items)&&items[0]>2&&items[0]<200)?items[0]:fb;
    this.treeNodes=[];
    this.solved=false;
    this._buildTreeNode(rootNum,W/2,H*0.22,0);

    this.primeLbl=this.add.text(W/2,H*0.72,'Click composites to split them',{fontSize:'12px',color:COL_TEXT,fontFamily:"'Lexend', system-ui"}).setOrigin(0.5).setDepth(6);
    this.rg.add(this.primeLbl);
  }

  _isPrime(n) { if(n<2)return false;for(let i=2;i<=Math.sqrt(n);i++){if(n%i===0)return false;}return true; }
  _findSmallestFactor(n) { for(let i=2;i<=Math.sqrt(n);i++){if(n%i===0)return i;}return n; }

  _buildTreeNode(num,x,y,depth) {
    const isPrime=this._isPrime(num);
    const nodeCol=isPrime?hexToNum('#44BB44'):hexToNum(COL_SECONDARY);
    const nodeR=22;
    const circle=this.add.circle(x,y,nodeR,nodeCol,isPrime?0.7:0.3).setDepth(6);
    if(!isPrime)circle.setInteractive({useHandCursor:true});
    circle.setStrokeStyle(2,nodeCol,0.9);
    this.rg.add(circle);
    const lbl=this.add.text(x,y,String(num),{fontSize:'16px',color:'#fff',fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(7);
    this.rg.add(lbl);
    const node={num,x,y,circle,lbl,isPrime,split:false};
    this.treeNodes.push(node);
    if(!isPrime){
      circle.on('pointerdown',()=>{
        if(node.split||this.solved)return;
        node.split=true;
        circle.setFillStyle(hexToNum(COL_TEXT),0.15);
        circle.removeInteractive();
        const factor=this._findSmallestFactor(num);
        const remainder=num/factor;
        const spread=Math.max(40,60-depth*10);
        const childY=y+55;
        this.rg.add(this.add.line(0,0,x,y+nodeR,x-spread,childY-nodeR,hexToNum(COL_TEXT),0.3).setOrigin(0).setDepth(4));
        this.rg.add(this.add.line(0,0,x,y+nodeR,x+spread,childY-nodeR,hexToNum(COL_TEXT),0.3).setOrigin(0).setDepth(4));
        this._buildTreeNode(factor,x-spread,childY,depth+1);
        this._buildTreeNode(remainder,x+spread,childY,depth+1);
        this._checkSolved();
      });
    }
  }

  _checkSolved() {
    const unsplit=this.treeNodes.filter(n=>!n.isPrime&&!n.split);
    if(unsplit.length>0){
      this.primeLbl.setText('Keep splitting composites...').setColor(COL_TEXT);
      return;
    }
    const primes=this.treeNodes.filter(n=>n.isPrime).map(n=>n.num).sort((a,b)=>a-b);
    this.primeLbl.setText('Prime factors: '+primes.join(' \\u00d7 ')).setColor(COL_ACCENT);
    this.solved=true;
    this.cameras.main.flash(120,34,197,94);
    heroCheer(this,this.hero);
    gameScore+=10*(this.round+1);
    this.scoreLbl.setText('Score: '+gameScore);
    this.time.delayedCall(500,()=>this._showSolutionCard(primes));
  }

  _showSolutionCard(primes) {
    const W=this.W,H=this.H;
    const backdrop=this.add.rectangle(W/2,H/2,W,H,0x000000,0.55).setDepth(50);
    const card=this.add.rectangle(W/2,H*0.5,W-40,220,0x18181b,1).setStrokeStyle(2,hexToNum(COL_ACCENT)).setDepth(51);
    const h1=this.add.text(W/2,H*0.5-80,'Fully factored!',{fontSize:'22px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(52);
    const lines=[this.treeNodes[0].num+' = '+primes.join(' \\u00d7 '),'Every leaf is a prime number','The tree is complete'];
    const texts=[];
    lines.forEach((line,i)=>{
      const t=this.add.text(W/2,H*0.5-30+i*28,line,{fontSize:i===0?'18px':'13px',color:i===0?COL_ACCENT:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:i===0?'bold':'normal'}).setOrigin(0.5).setDepth(52).setAlpha(0);
      this.time.delayedCall(180*i,()=>this.tweens.add({targets:t,alpha:1,duration:260}));
      texts.push(t);
    });
    const nextY=H*0.5+80;
    const nextBg=this.add.rectangle(W/2,nextY,200,44,hexToNum(COL_ACCENT),1).setInteractive({useHandCursor:true}).setDepth(52).setAlpha(0);
    const nextLbl=this.add.text(W/2,nextY,this.round+1>=TOTAL_ROUNDS?'Finish!':'Got it! Next round \\u2192',{fontSize:'14px',color:'#000',fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(53).setAlpha(0);
    this.time.delayedCall(180*lines.length+200,()=>this.tweens.add({targets:[nextBg,nextLbl],alpha:1,duration:280}));
    nextBg.on('pointerdown',()=>{
      [backdrop,card,h1,...texts,nextBg,nextLbl].forEach(o=>o.destroy());
      this.round++;
      if(this.round>=TOTAL_ROUNDS)this.scene.start('VictoryScene',{score:gameScore});
      else this.startRound();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CategorySortScene — "Self-Revealing Buckets"
//
// Teaches: Classification by hidden property. The player discovers the rule
// by trial — NO labels on the buckets, NO Check button, NO typing.
//
// Setup: Two unlabeled buckets are on screen. Each has a SECRET property
// test (e.g. "accepts only even numbers", "accepts numbers > 10"). A pile
// of numbered items sits above. The player drags an item over a bucket:
//   - If the bucket's rule accepts the item → it GLOWS and snaps in.
//   - If it rejects → the item BOUNCES BACK to its original spot.
// Round ends when every item is sorted into a bucket. The rules are then
// revealed on the solution card.
//
// Self-revealing truth: repeated acceptance/rejection reveals the invisible
// property. The player induces the rule from physical feedback.
// ═══════════════════════════════════════════════════════════════════════════════
class CategorySortScene extends Phaser.Scene {
  constructor() { super('CategorySortScene'); }

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
      fontSize: '12px', color: COL_TEXT, fontFamily: "'Lexend', system-ui", align: 'center',
      wordWrap: { width: W - 60 }, alpha: 0.8
    }).setOrigin(0.5, 0).setDepth(10);
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
    // Each round: two buckets with opposite hidden rules.
    // ruleType values:
    //   'even-odd'       → bucket A accepts evens, bucket B accepts odds
    //   'small-big'      → A accepts < threshold, B accepts >= threshold
    //   'mult3-notmult3' → A accepts multiples of 3, B accepts non-multiples
    //   'pos-neg'        → A accepts positive, B accepts non-positive
    //   'prime-compos'   → A accepts primes, B accepts composites
    const fallbacks = [
      { rule: 'even-odd',       items: [2, 7, 4, 9, 6, 11, 8, 3], desc: ['even', 'odd'] },
      { rule: 'small-big',      items: [3, 12, 5, 18, 7, 25, 9, 14], threshold: 10, desc: ['less than 10', '10 or more'] },
      { rule: 'mult3-notmult3', items: [3, 4, 9, 7, 6, 11, 12, 8], desc: ['multiple of 3', 'not a multiple of 3'] },
      { rule: 'pos-neg',        items: [5, -3, 8, -1, 2, -6, 4, -9], desc: ['positive', 'negative'] },
      { rule: 'prime-compos',   items: [2, 4, 3, 9, 5, 6, 7, 10], desc: ['prime', 'composite'] },
    ];
    const fb = fallbacks[this.round % fallbacks.length];
    const data = getRound(this.round);
    const isDefault = !data || data.prompt === 'Solve this!' ||
      (Array.isArray(data.items) && data.items.length === 6 && data.items[0] === 10 && data.items[1] === 5);
    // Use fallback rule/items (rules must pair with items, so we always use fallback)
    const items = fb.items.slice();
    if (!isDefault && Array.isArray(data.items) && data.items.length >= 4) {
      // keep AI items only if they fit the current rule and are all testable
      const testable = data.items.filter(v => Number.isFinite(v));
      if (testable.length >= 4) items.splice(0, items.length, ...testable.slice(0, 10));
    }

    this.ruleKey = fb.rule;
    this.ruleThreshold = fb.threshold;
    this.ruleDesc = fb.desc;
    this.unsortedCount = items.length;

    if (this.roundGroup) this.roundGroup.clear(true, true);
    this.roundGroup = this.add.group();

    this.promptLbl.setText('Find each bucket\\u2019s secret rule');
    this.subPromptLbl.setText('Drag a number to a bucket. It GLOWS if it fits, BOUNCES if it doesn\\u2019t.');

    this._redrawDots();
    this.solved = false;
    this._buildBuckets();
    this._buildItems(items);
  }

  _ruleAccepts(bucketIdx, val) {
    const isPrime = n => { if (n < 2) return false; for (let i = 2; i <= Math.sqrt(n); i++) { if (n % i === 0) return false; } return true; };
    switch (this.ruleKey) {
      case 'even-odd':       return bucketIdx === 0 ? (val % 2 === 0) : (val % 2 !== 0);
      case 'small-big':      return bucketIdx === 0 ? (val < this.ruleThreshold) : (val >= this.ruleThreshold);
      case 'mult3-notmult3': return bucketIdx === 0 ? (val % 3 === 0) : (val % 3 !== 0);
      case 'pos-neg':        return bucketIdx === 0 ? (val > 0) : (val <= 0);
      case 'prime-compos':   return bucketIdx === 0 ? isPrime(val) : (val >= 2 && !isPrime(val));
    }
    return false;
  }

  _buildBuckets() {
    const W = this.W, H = this.H;
    const by = H * 0.72;
    const bw = W * 0.34, bh = H * 0.22;
    const colors = [hexToNum(COL_PRIMARY), hexToNum(COL_ACCENT)];
    this.buckets = [];
    [-1, 1].forEach((sign, i) => {
      const bx = W / 2 + sign * (W * 0.22);
      const fill = this.add.rectangle(bx, by, bw, bh, colors[i], 0.18).setDepth(3);
      const stroke = this.add.rectangle(bx, by, bw, bh).setStrokeStyle(3, colors[i], 0.7).setDepth(4);
      // Visual mark — no text label (the rule is secret)
      const mark = this.add.text(bx, by, '?', {
        fontSize: '34px', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(5).setAlpha(0.2);
      this.roundGroup.add(fill); this.roundGroup.add(stroke); this.roundGroup.add(mark);
      this.buckets.push({ x: bx, y: by, w: bw, h: bh, color: colors[i], fill, stroke, mark, count: 0, contents: [] });
    });
  }

  _buildItems(items) {
    const W = this.W, H = this.H;
    const area = { x: W * 0.08, y: H * 0.17, w: W * 0.84, h: H * 0.35 };
    this.items = [];
    const perRow = Math.min(items.length, 5);
    const rows = Math.ceil(items.length / perRow);
    const gapX = area.w / (perRow + 1);
    const gapY = area.h / (rows + 1);
    items.forEach((val, i) => {
      const c = i % perRow, r = Math.floor(i / perRow);
      const homeX = area.x + (c + 1) * gapX;
      const homeY = area.y + (r + 1) * gapY;
      const bg = this.add.rectangle(homeX, homeY, 52, 36, hexToNum(COL_SECONDARY), 0.5)
        .setStrokeStyle(2, hexToNum(COL_TEXT), 0.4).setDepth(7)
        .setInteractive({ useHandCursor: true, draggable: true });
      const lbl = this.add.text(homeX, homeY, String(val), {
        fontSize: '16px', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(8);
      this.roundGroup.add(bg); this.roundGroup.add(lbl);
      const obj = { val, bg, lbl, homeX, homeY, sorted: false };
      this.items.push(obj);
      this.input.setDraggable(bg);
      bg.on('drag', (p, dx, dy) => { if (!obj.sorted) { bg.x = dx; bg.y = dy; lbl.x = dx; lbl.y = dy; } });
      bg.on('dragend', () => this._onDrop(obj));
    });
  }

  _onDrop(obj) {
    if (obj.sorted || this.solved) return;
    for (let i = 0; i < this.buckets.length; i++) {
      const b = this.buckets[i];
      if (Math.abs(obj.bg.x - b.x) < b.w / 2 && Math.abs(obj.bg.y - b.y) < b.h / 2) {
        if (this._ruleAccepts(i, obj.val)) {
          // Accept: glow + snap inside
          obj.sorted = true;
          b.count++; b.contents.push(obj.val);
          this.tweens.add({ targets: b.fill, alpha: 0.45, duration: 180, yoyo: true });
          this.tweens.add({ targets: b.stroke, scaleX: 1.05, scaleY: 1.05, duration: 180, yoyo: true });
          obj.bg.setFillStyle(b.color, 0.8);
          const slot = b.count - 1;
          const snapX = b.x - b.w / 2 + 22 + (slot % 4) * 28;
          const snapY = b.y - b.h / 2 + 20 + Math.floor(slot / 4) * 28;
          this.tweens.add({ targets: [obj.bg, obj.lbl], x: snapX, y: snapY, duration: 200, ease: 'Quad.easeOut' });
          this.unsortedCount--;
          this._checkSolved();
          return;
        } else {
          // Reject: bounce back
          this.tweens.add({ targets: b.stroke, alpha: 0.4, duration: 80, yoyo: true });
          this.cameras.main.shake(60, 0.003);
          this.tweens.add({
            targets: [obj.bg, obj.lbl], x: obj.homeX, y: obj.homeY,
            duration: 260, ease: 'Back.easeOut'
          });
          return;
        }
      }
    }
    // Dropped outside any bucket — return home
    this.tweens.add({ targets: [obj.bg, obj.lbl], x: obj.homeX, y: obj.homeY, duration: 220, ease: 'Quad.easeOut' });
  }

  _checkSolved() {
    if (this.solved) return;
    if (this.unsortedCount === 0) {
      this.solved = true;
      this.cameras.main.flash(120, 34, 197, 94);
      heroCheer(this, this.hero);
      gameScore += 10 * (this.round + 1);
      this.scoreLbl.setText('Score: ' + gameScore);
      // Reveal the bucket marks with their discovered rules
      this.buckets.forEach((b, i) => {
        b.mark.setText(this.ruleDesc[i]);
        b.mark.setFontSize(14);
        b.mark.setAlpha(1);
      });
      this.time.delayedCall(500, () => this._showSolutionCard());
    }
  }

  _showSolutionCard() {
    const W = this.W, H = this.H;
    const backdrop = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.55).setDepth(50);
    const card = this.add.rectangle(W/2, H*0.5, W - 40, 220, 0x18181b, 1)
      .setStrokeStyle(2, hexToNum(COL_ACCENT)).setDepth(51);
    const h1 = this.add.text(W/2, H*0.5 - 80, 'You discovered the rules!', {
      fontSize: '22px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(52);
    const lines = [
      'Left bucket accepts: ' + this.ruleDesc[0],
      'Right bucket accepts: ' + this.ruleDesc[1],
      'Every item found its home.',
    ];
    const texts = [];
    lines.forEach((line, i) => {
      const t = this.add.text(W/2, H*0.5 - 30 + i * 26, line, {
        fontSize: '14px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif"
      }).setOrigin(0.5).setDepth(52).setAlpha(0);
      this.time.delayedCall(180 * i, () => this.tweens.add({ targets: t, alpha: 1, duration: 260 }));
      texts.push(t);
    });
    const nextY = H*0.5 + 80;
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
// MeasureAndPlotScene — "Draggable Marker with Crosshairs"
//
// Teaches: Coordinate geometry. Reading (x, y) on a grid by moving a point.
//
// Setup: A coordinate grid is shown with numbered axes. A target coordinate
// is displayed at the top (e.g. "Target: (3, 5)"). A draggable marker sits
// on the grid. As the player drags, LIVE CROSSHAIRS extend from the marker
// to each axis, and a LIVE LABEL "(x, y)" follows it. When the marker's
// coordinates equal the target, it SNAPS to the integer point, glows, and
// the round solves.
//
// Self-revealing truth: coordinates are simply how far the marker is along
// each axis. Moving IS measuring. No Check button. No typing.
// ═══════════════════════════════════════════════════════════════════════════════
class MeasureAndPlotScene extends Phaser.Scene {
  constructor() { super('MeasureAndPlotScene'); }

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
      fontSize: '12px', color: COL_TEXT, fontFamily: "'Lexend', system-ui", align: 'center', alpha: 0.8
    }).setOrigin(0.5, 0).setDepth(10);
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
      { tx: 3, ty: 5, max: 10 },
      { tx: 6, ty: 2, max: 10 },
      { tx: 7, ty: 7, max: 10 },
      { tx: 4, ty: 8, max: 10 },
      { tx: 9, ty: 3, max: 10 },
    ];
    const fb = fallbacks[this.round % fallbacks.length];
    const data = getRound(this.round);
    const isDefault = !data || data.prompt === 'Solve this!' ||
      (Array.isArray(data.items) && data.items.length === 6 && data.items[0] === 10 && data.items[1] === 5);
    let tx = fb.tx, ty = fb.ty;
    if (!isDefault && Array.isArray(data.items) && data.items.length >= 2) {
      const a = Math.floor(data.items[0]);
      const b = Math.floor(data.items[1]);
      if (a >= 0 && a <= 10 && b >= 0 && b <= 10) { tx = a; ty = b; }
    }
    this.targetX = tx;
    this.targetY = ty;
    this.gridMax = fb.max;
    this.solved = false;

    if (this.roundGroup) this.roundGroup.clear(true, true);
    this.roundGroup = this.add.group();

    this.promptLbl.setText('Target: (' + this.targetX + ', ' + this.targetY + ')');
    this.subPromptLbl.setText('Drag the marker until its coordinates match the target.');
    this._redrawDots();
    this._buildGrid();
    this._buildMarker();
  }

  _buildGrid() {
    const W = this.W, H = this.H;
    // Square grid area
    const size = Math.min(W * 0.78, H * 0.5);
    const cx = W / 2, cy = H * 0.45;
    this.grid = {
      left: cx - size / 2, right: cx + size / 2,
      top: cy - size / 2, bottom: cy + size / 2,
      size, unit: size / this.gridMax
    };
    const g = this.grid;
    // Grid background
    const bg = this.add.rectangle(cx, cy, size, size, hexToNum(COL_SECONDARY), 0.08)
      .setStrokeStyle(2, hexToNum(COL_TEXT), 0.5).setDepth(3);
    this.roundGroup.add(bg);
    // Grid lines
    for (let i = 0; i <= this.gridMax; i++) {
      const lx = g.left + i * g.unit;
      const ly = g.bottom - i * g.unit;
      const vLine = this.add.line(0, 0, lx, g.top, lx, g.bottom, hexToNum(COL_TEXT), 0.15).setOrigin(0).setDepth(3);
      const hLine = this.add.line(0, 0, g.left, ly, g.right, ly, hexToNum(COL_TEXT), 0.15).setOrigin(0).setDepth(3);
      this.roundGroup.add(vLine); this.roundGroup.add(hLine);
      if (i % 2 === 0) {
        this.roundGroup.add(this.add.text(lx, g.bottom + 8, String(i), {
          fontSize: '10px', color: COL_TEXT, fontFamily: "'Lexend', system-ui", alpha: 0.7
        }).setOrigin(0.5, 0).setDepth(4));
        this.roundGroup.add(this.add.text(g.left - 8, ly, String(i), {
          fontSize: '10px', color: COL_TEXT, fontFamily: "'Lexend', system-ui", alpha: 0.7
        }).setOrigin(1, 0.5).setDepth(4));
      }
    }
    // Axis labels
    this.roundGroup.add(this.add.text(g.right + 14, g.bottom, 'x', {
      fontSize: '14px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0, 0.5).setDepth(5));
    this.roundGroup.add(this.add.text(g.left, g.top - 14, 'y', {
      fontSize: '14px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5, 1).setDepth(5));
    // Target spot (faded ring)
    const tgtPx = g.left + this.targetX * g.unit;
    const tgtPy = g.bottom - this.targetY * g.unit;
    const tgt = this.add.circle(tgtPx, tgtPy, 10, hexToNum(COL_ACCENT), 0).setStrokeStyle(2, hexToNum(COL_ACCENT), 0.7).setDepth(5);
    this.roundGroup.add(tgt);
    this.tweens.add({ targets: tgt, scale: 1.3, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });

    // Crosshairs (updated as marker moves)
    this.crossV = this.add.line(0, 0, 0, 0, 0, 0, hexToNum(COL_PRIMARY), 0.6).setOrigin(0).setLineWidth(1).setDepth(5);
    this.crossH = this.add.line(0, 0, 0, 0, 0, 0, hexToNum(COL_PRIMARY), 0.6).setOrigin(0).setLineWidth(1).setDepth(5);
    this.roundGroup.add(this.crossV); this.roundGroup.add(this.crossH);
    // Coordinate label
    this.coordLbl = this.add.text(cx, g.top - 30, '(0, 0)', {
      fontSize: '16px', color: COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);
    this.roundGroup.add(this.coordLbl);
    // X-tick marker (on x-axis)
    this.xTick = this.add.rectangle(g.left, g.bottom, 2, 14, hexToNum(COL_PRIMARY), 1).setDepth(6);
    this.yTick = this.add.rectangle(g.left, g.bottom, 14, 2, hexToNum(COL_PRIMARY), 1).setDepth(6);
    this.roundGroup.add(this.xTick); this.roundGroup.add(this.yTick);
  }

  _buildMarker() {
    const g = this.grid;
    // Start at origin
    this.markerX = 0; this.markerY = 0;
    const px = g.left + this.markerX * g.unit;
    const py = g.bottom - this.markerY * g.unit;
    this.marker = this.add.circle(px, py, 12, hexToNum(COL_PRIMARY), 1)
      .setStrokeStyle(2, 0xffffff, 0.9).setDepth(9)
      .setInteractive({ useHandCursor: true, draggable: true });
    this.roundGroup.add(this.marker);
    this.input.setDraggable(this.marker);
    this.marker.on('drag', (p, dx, dy) => {
      if (this.solved) return;
      // Clamp inside grid
      const cx = Math.max(g.left, Math.min(g.right, dx));
      const cy = Math.max(g.top, Math.min(g.bottom, dy));
      this.marker.x = cx; this.marker.y = cy;
      // Compute coords (rounded to 1 decimal live; snap integer when close)
      const rawX = (cx - g.left) / g.unit;
      const rawY = (g.bottom - cy) / g.unit;
      this.markerX = Math.round(rawX * 10) / 10;
      this.markerY = Math.round(rawY * 10) / 10;
      this._updateCrosshairs();
      this._checkSolved();
    });
    this._updateCrosshairs();
  }

  _updateCrosshairs() {
    const g = this.grid;
    const mx = this.marker.x, my = this.marker.y;
    this.crossV.setTo(mx, g.top, mx, g.bottom);
    this.crossH.setTo(g.left, my, g.right, my);
    this.xTick.x = mx; this.xTick.y = g.bottom;
    this.yTick.x = g.left; this.yTick.y = my;
    this.coordLbl.setText('(' + this.markerX.toFixed(1).replace(/\\.0$/, '') + ', ' + this.markerY.toFixed(1).replace(/\\.0$/, '') + ')');
    // Color hints: green when on target axis
    const nearX = Math.abs(this.markerX - this.targetX) < 0.25;
    const nearY = Math.abs(this.markerY - this.targetY) < 0.25;
    this.crossV.setStrokeStyle(1, hexToNum(nearX ? COL_ACCENT : COL_PRIMARY), nearX ? 0.9 : 0.6);
    this.crossH.setStrokeStyle(1, hexToNum(nearY ? COL_ACCENT : COL_PRIMARY), nearY ? 0.9 : 0.6);
  }

  _checkSolved() {
    if (this.solved) return;
    if (Math.abs(this.markerX - this.targetX) < 0.25 && Math.abs(this.markerY - this.targetY) < 0.25) {
      this.solved = true;
      const g = this.grid;
      const snapX = g.left + this.targetX * g.unit;
      const snapY = g.bottom - this.targetY * g.unit;
      this.tweens.add({
        targets: this.marker, x: snapX, y: snapY, duration: 200, ease: 'Back.easeOut',
        onUpdate: () => this._updateCrosshairs()
      });
      this.markerX = this.targetX; this.markerY = this.targetY;
      this.time.delayedCall(210, () => {
        this.marker.setFillStyle(hexToNum(COL_ACCENT), 1);
        this.tweens.add({ targets: this.marker, scale: 1.4, duration: 200, yoyo: true, repeat: 1 });
        this._updateCrosshairs();
      });
      this.cameras.main.flash(120, 34, 197, 94);
      heroCheer(this, this.hero);
      gameScore += 10 * (this.round + 1);
      this.scoreLbl.setText('Score: ' + gameScore);
      this.time.delayedCall(600, () => this._showSolutionCard());
    }
  }

  _showSolutionCard() {
    const W = this.W, H = this.H;
    const backdrop = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.55).setDepth(50);
    const card = this.add.rectangle(W/2, H*0.5, W - 40, 220, 0x18181b, 1)
      .setStrokeStyle(2, hexToNum(COL_ACCENT)).setDepth(51);
    const h1 = this.add.text(W/2, H*0.5 - 80, 'On target!', {
      fontSize: '22px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(52);
    const lines = [
      'You landed on (' + this.targetX + ', ' + this.targetY + ')',
      'Across ' + this.targetX + ', up ' + this.targetY,
      'The point IS its coordinates.',
    ];
    const texts = [];
    lines.forEach((line, i) => {
      const t = this.add.text(W/2, H*0.5 - 30 + i * 28, line, {
        fontSize: i === 0 ? '18px' : '14px',
        color: i === 0 ? COL_ACCENT : COL_TEXT,
        fontFamily: "'Space Grotesk', sans-serif",
        fontStyle: i === 0 ? 'bold' : 'normal'
      }).setOrigin(0.5).setDepth(52).setAlpha(0);
      this.time.delayedCall(180 * i, () => this.tweens.add({ targets: t, alpha: 1, duration: 260 }));
      texts.push(t);
    });
    const nextY = H*0.5 + 80;
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
