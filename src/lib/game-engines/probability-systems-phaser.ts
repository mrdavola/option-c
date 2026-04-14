// Roll & Predict — Phaser engine with 3 game options.
// Math: Probability, statistics, mode, median, mean, spinners, data analysis.
// Options: find-the-stat, bet-the-spinner, build-the-chart

import type { ThemeConfig, MathParams, GameOption } from "./engine-types"
import { phaserGame } from "./base-phaser-template"
import { getOptionDef } from "./game-option-registry"

export function probabilitySystemsPhaserEngine(
  config: ThemeConfig,
  math: MathParams,
  option: GameOption = "find-the-stat"
): string {
  const validOptions = ["find-the-stat", "bet-the-spinner", "build-the-chart"]
  const activeOption = validOptions.includes(option) ? option : "find-the-stat"
  const optDef = getOptionDef(activeOption)
  const sceneMap: Record<string, string> = {
    "find-the-stat": "FindTheStatScene",
    "bet-the-spinner": "BetTheSpinnerScene",
    "build-the-chart": "BuildTheChartScene",
  }
  return phaserGame({
    config, math, option: activeOption,
    sceneName: sceneMap[activeOption],
    introText: optDef?.introText || "Analyze data and predict outcomes!",
    helpText: optDef?.helpText || "Use statistics and probability to win.",
    gameSceneCode: GAME_SCENES,
  })
}

const GAME_SCENES = `
// ═══════════════════════════════════════════════════════════════════════════════
// INTRINSIC DESIGN NOTES
// Every scene uses physical manipulation — no Check buttons, no typed answers.
// Statistics EMERGE from the interaction. Player DISCOVERS, not computes.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Shared fallback generators ─────────────────────────────────────────────
function fbStatRound(round) {
  var types = ['mean','median','mode'];
  var t = types[round % 3];
  if (t === 'mode') {
    var m = 3 + (round % 5);
    return { items: [m, m, m, m+2, m-1, m+1, m].sort(function(a,b){return a-b;}), target: m, prompt: 'Find the MODE' };
  } else if (t === 'median') {
    var base = [2, 4, 5, 7, 9, 10, 12];
    var start = round % 3;
    var arr = base.slice(start, start+5);
    return { items: arr, target: arr[2], prompt: 'Find the MEDIAN' };
  } else {
    var pool = [[2,4,6,8,10],[3,5,5,7,10],[1,3,5,7,9],[4,4,6,8,8],[2,6,6,6,10]];
    var arr2 = pool[round % pool.length];
    var s = 0; arr2.forEach(function(v){s+=v;});
    return { items: arr2, target: Math.round(s/arr2.length), prompt: 'Find the MEAN' };
  }
}

function fbSpinnerRound(round) {
  var setups = [
    { pcts:[55,25,20], names:['Red','Blue','Green'], hexes:['#ef4444','#3b82f6','#22c55e'] },
    { pcts:[45,35,20], names:['Red','Blue','Green'], hexes:['#ef4444','#3b82f6','#22c55e'] },
    { pcts:[40,30,20,10], names:['Red','Blue','Green','Yellow'], hexes:['#ef4444','#3b82f6','#22c55e','#eab308'] },
    { pcts:[35,30,20,15], names:['Red','Blue','Green','Yellow'], hexes:['#ef4444','#3b82f6','#22c55e','#eab308'] },
    { pcts:[30,25,20,15,10], names:['Red','Blue','Green','Yellow','Purple'], hexes:['#ef4444','#3b82f6','#22c55e','#eab308','#a855f7'] }
  ];
  var cfg = setups[round % setups.length];
  return cfg;
}

function fbChartRound(round) {
  var targets = [5, 6, 4, 7, 5];
  var starts  = [[2,3,8,7,5],[3,4,9,6,8],[1,2,6,7,4],[4,8,9,5,9],[3,2,4,6,10]];
  return { target: targets[round % targets.length], items: starts[round % starts.length] };
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTRINSIC: Seesaw with Weighted Dots
// Player drags dots along a number line. A SEESAW below automatically finds its
// balance point — that IS the MEAN. For median, dots queue in order and the
// middle glows. For mode, stacks of equal values form; tallest wins.
// The physics IS the statistical measure. No buttons — watch it emerge.
// ═══════════════════════════════════════════════════════════════════════════════
class FindTheStatScene extends Phaser.Scene {
  constructor() { super('FindTheStatScene'); }
  create() {
    this.W=this.scale.width;this.H=this.scale.height;this.round=0;this.lives=MAX_LIVES;
    this._bg();this._ui();
    this.hero = addCharacter(this, this.W*0.88, this.H*0.55, 0.8);
    this.startRound();
  }
  _bg() { const bg=this.add.image(this.W/2,this.H/2,'bg');bg.setScale(Math.max(this.W/bg.width,this.H/bg.height));this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.7); }
  _ui() {
    this.scoreLbl=this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);
    this.add.text(this.W/2,16,(MATH && MATH.standardDescription) || 'Statistics',{fontSize:'11px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.55,align:'center',wordWrap:{width:this.W*0.6}}).setOrigin(0.5,0).setDepth(10);
    this.hg=this.add.group();this._rh();this.dg=this.add.group();this._rd();
  }
  _rh() { this.hg.clear(true,true);for(let i=0;i<this.lives;i++)this.hg.add(this.add.text(14+i*22,14,'\\u2665',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dg.clear(true,true);for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  startRound() {
    if(this.rg)this.rg.clear(true,true);this.rg=this.add.group();
    var raw = getRound(this.round);
    var fb = fbStatRound(this.round);
    // If AI_ROUNDS supplied usable data, respect it; else fallback.
    var items = (Array.isArray(raw.items) && raw.items.length >= 3) ? raw.items.slice() : fb.items.slice();
    var prompt = raw.prompt || fb.prompt;
    var p = (prompt||'').toLowerCase();
    var statType = p.indexOf('mode')>=0 ? 'mode' : (p.indexOf('median')>=0 ? 'median' : 'mean');
    // Compute target from items so it is always consistent with shown data
    var target;
    items.sort(function(a,b){return a-b;});
    if (statType === 'mode') {
      var counts = {}; var best = items[0]; var bestC = 0;
      items.forEach(function(v){counts[v]=(counts[v]||0)+1; if(counts[v]>bestC){bestC=counts[v];best=v;}});
      target = best;
    } else if (statType === 'median') {
      target = items[Math.floor(items.length/2)];
    } else {
      var s=0; items.forEach(function(v){s+=v;});
      target = Math.round(s/items.length);
    }
    this.items = items; this.statType = statType; this.target = target;
    this._rd();
    this._buildScene();
  }

  _buildScene() {
    var W = this.W, H = this.H;
    var statType = this.statType;
    var items = this.items;
    var target = this.target;

    // Header
    this.rg.add(this.add.text(W/2, 48, 'Find the ' + statType.toUpperCase(), {
      fontSize:'22px', color:COL_ACCENT, fontFamily:"'Space Grotesk', sans-serif", fontStyle:'bold'
    }).setOrigin(0.5).setDepth(6));
    this.rg.add(this.add.text(W/2, 78, 'Drag each dot onto the number line. Watch the ' + statType + ' appear.', {
      fontSize:'12px', color:COL_TEXT, fontFamily:"'Lexend', system-ui", alpha:0.7
    }).setOrigin(0.5).setDepth(6));

    // Number line
    var minV = 0, maxV = Math.max.apply(null, items) + 2;
    this.minV = minV; this.maxV = maxV;
    var lineY = H * 0.40;
    var lineL = W * 0.12, lineR = W * 0.75;
    this.lineL = lineL; this.lineR = lineR; this.lineY = lineY;
    var lineG = this.add.graphics().setDepth(4);
    lineG.lineStyle(3, hexToNum(COL_TEXT), 0.7);
    lineG.lineBetween(lineL, lineY, lineR, lineY);
    this.rg.add(lineG);
    // Ticks
    for (var v = minV; v <= maxV; v++) {
      var tx = lineL + (v - minV)/(maxV - minV) * (lineR - lineL);
      var tick = this.add.rectangle(tx, lineY, 2, 10, hexToNum(COL_TEXT), 0.5).setDepth(4);
      this.rg.add(tick);
      this.rg.add(this.add.text(tx, lineY + 12, String(v), {
        fontSize:'10px', color:COL_TEXT, fontFamily:"'Lexend', system-ui", alpha:0.5
      }).setOrigin(0.5, 0).setDepth(4));
    }

    // Dots — start below the line, unplaced. Player drags to correct values.
    this.dots = [];
    var dotStartY = H * 0.26;
    var dotSpacing = Math.min(60, (W * 0.75) / items.length);
    var startX = W/2 - (items.length - 1) * dotSpacing / 2;
    for (var i = 0; i < items.length; i++) {
      var dx = startX + i * dotSpacing;
      var dy = dotStartY;
      var value = items[i];
      var dot = this.add.circle(dx, dy, 16, hexToNum(COL_PRIMARY), 0.9).setDepth(7)
        .setStrokeStyle(2, hexToNum(COL_ACCENT));
      dot.setInteractive({ useHandCursor:true, draggable:true });
      this.input.setDraggable(dot);
      var lbl = this.add.text(dx, dy, String(value), {
        fontSize:'13px', color:'#fff', fontFamily:"'Space Grotesk', sans-serif", fontStyle:'bold'
      }).setOrigin(0.5).setDepth(8);
      dot._value = value; dot._lbl = lbl; dot._placed = false;
      this.rg.add(dot); this.rg.add(lbl);
      this.dots.push(dot);
    }

    var scene = this;
    this.input.on('drag', function(pointer, obj, dragX, dragY){
      if (!obj._value && obj._value !== 0) return;
      obj.x = dragX; obj.y = dragY;
      obj._lbl.x = dragX; obj._lbl.y = dragY;
      scene._checkPlacement(obj);
      scene._updateEmergence();
    });

    // Emergence zones depending on stat type
    if (statType === 'mean') {
      this._buildSeesaw();
    } else if (statType === 'median') {
      this._buildMedianBand();
    } else {
      this._buildModeStacks();
    }
    this._updateEmergence();
  }

  _xForValue(v) {
    return this.lineL + (v - this.minV)/(this.maxV - this.minV) * (this.lineR - this.lineL);
  }
  _valueForX(x) {
    var raw = (x - this.lineL) / (this.lineR - this.lineL) * (this.maxV - this.minV) + this.minV;
    return Math.round(raw);
  }

  _checkPlacement(dot) {
    // Snap to correct tick when dot is near line
    var dy = dot.y - this.lineY;
    if (Math.abs(dy) < 28) {
      var snappedV = this._valueForX(dot.x);
      snappedV = Math.max(this.minV, Math.min(this.maxV, snappedV));
      // Only count as placed when snapped to the dot's actual value
      if (snappedV === dot._value) {
        var sx = this._xForValue(dot._value);
        dot.x = sx; dot.y = this.lineY;
        dot._lbl.x = sx; dot._lbl.y = this.lineY;
        if (!dot._placed) {
          dot._placed = true;
          dot.setFillStyle(hexToNum(COL_ACCENT), 1);
        }
      } else {
        dot._placed = false;
        dot.setFillStyle(hexToNum(COL_PRIMARY), 0.9);
      }
    } else {
      dot._placed = false;
      dot.setFillStyle(hexToNum(COL_PRIMARY), 0.9);
    }
  }

  _allPlaced() {
    for (var i = 0; i < this.dots.length; i++) if (!this.dots[i]._placed) return false;
    return true;
  }

  _buildSeesaw() {
    var W = this.W, H = this.H;
    var y = this.lineY + 110;
    // Seesaw beam
    this.seesawY = y;
    this.seesawBeam = this.add.rectangle(W/2, y, this.lineR - this.lineL, 8, hexToNum(COL_PRIMARY), 1).setDepth(5);
    this.rg.add(this.seesawBeam);
    // Fulcrum (the balance point — moves to show mean)
    this.seesawFulcrum = this.add.triangle(W/2, y + 22, 0, 22, 16, 0, 32, 22, hexToNum(COL_ACCENT), 1).setDepth(6);
    this.rg.add(this.seesawFulcrum);
    this.balanceLbl = this.add.text(W/2, y + 52, '', {
      fontSize:'14px', color:COL_ACCENT, fontFamily:"'Space Grotesk', sans-serif", fontStyle:'bold'
    }).setOrigin(0.5).setDepth(6);
    this.rg.add(this.balanceLbl);
  }

  _buildMedianBand() {
    var H = this.H;
    this.medianBand = this.add.rectangle(0, this.lineY, 4, 60, hexToNum(COL_ACCENT), 0).setDepth(3);
    this.rg.add(this.medianBand);
    this.medianLbl = this.add.text(this.W/2, this.lineY + 80, '', {
      fontSize:'14px', color:COL_ACCENT, fontFamily:"'Space Grotesk', sans-serif", fontStyle:'bold'
    }).setOrigin(0.5).setDepth(6);
    this.rg.add(this.medianLbl);
  }

  _buildModeStacks() {
    this.modeLbl = this.add.text(this.W/2, this.lineY + 80, '', {
      fontSize:'14px', color:COL_ACCENT, fontFamily:"'Space Grotesk', sans-serif", fontStyle:'bold'
    }).setOrigin(0.5).setDepth(6);
    this.rg.add(this.modeLbl);
    this._modeStackVisuals = [];
  }

  _updateEmergence() {
    var placed = this.dots.filter(function(d){return d._placed;});
    if (this.statType === 'mean') {
      // Balance point = mean of placed values
      if (placed.length === 0) {
        this.seesawFulcrum.x = this.W/2;
        this.balanceLbl.setText('');
      } else {
        var s = 0; placed.forEach(function(d){s+=d._value;});
        var m = s/placed.length;
        var fx = this._xForValue(m);
        this.tweens.add({ targets: this.seesawFulcrum, x: fx, duration: 220, ease:'Sine.easeOut' });
        // Tilt seesaw based on how far fulcrum is from beam center only visually when incomplete
        if (placed.length === this.dots.length) {
          this.seesawBeam.rotation = 0;
          this.balanceLbl.setText('Balance point = ' + (Math.round(m*10)/10));
        } else {
          this.seesawBeam.rotation = 0;
          this.balanceLbl.setText('Mean so far = ' + (Math.round(m*10)/10));
        }
      }
    } else if (this.statType === 'median') {
      if (placed.length === this.dots.length) {
        // Sort by value, pick middle
        var sorted = placed.slice().sort(function(a,b){return a._value-b._value;});
        var midIdx = Math.floor(sorted.length/2);
        var midDot = sorted[midIdx];
        // Glow middle
        this.dots.forEach(function(d){ d.setScale(1); });
        midDot.setScale(1.35);
        this.medianBand.x = midDot.x;
        this.medianBand.setFillStyle(hexToNum(COL_ACCENT), 0.35);
        this.medianLbl.setText('Middle value = ' + midDot._value);
      } else {
        this.medianBand.setFillStyle(hexToNum(COL_ACCENT), 0);
        this.medianLbl.setText('Place all dots to find the middle');
      }
    } else {
      // mode: stack placed dots at same value visually; tallest wins
      if (this._modeStackVisuals) this._modeStackVisuals.forEach(function(v){v.destroy();});
      this._modeStackVisuals = [];
      var counts = {};
      placed.forEach(function(d){ counts[d._value] = (counts[d._value]||0) + 1; });
      var bestV = null, bestC = 0;
      for (var k in counts) { if (counts[k] > bestC) { bestC = counts[k]; bestV = Number(k); } }
      // Render counter bars below each value
      var self = this;
      for (var val in counts) {
        var c = counts[val];
        var bx = self._xForValue(Number(val));
        var barH = 14 * c;
        var colh = (c === bestC && c >= 2) ? COL_ACCENT : COL_PRIMARY;
        var bar = self.add.rectangle(bx, self.lineY + 40 + barH/2, 18, barH, hexToNum(colh), 0.7).setDepth(4);
        self._modeStackVisuals.push(bar);
        self.rg.add(bar);
      }
      if (placed.length === this.dots.length && bestC >= 2) {
        this.modeLbl.setText('Tallest stack = ' + bestV);
      } else {
        this.modeLbl.setText('Stack matching values');
      }
    }
    // Auto-detect success
    if (this._allPlaced() && !this._solved) {
      this._solved = true;
      this.time.delayedCall(600, () => this._win());
    }
  }

  _win() {
    gameScore += 10 * (this.round + 1);
    this.scoreLbl.setText('Score: ' + gameScore);
    this.cameras.main.flash(140, 34, 197, 94);
    heroCheer(this, this.hero);
    this._showSolutionCard();
  }

  _showSolutionCard() {
    var W=this.W,H=this.H;
    var backdrop = this.add.rectangle(W/2,H/2,W,H,0x000000,0.55).setDepth(50);
    var card = this.add.rectangle(W/2,H*0.5,W-40,220,0x18181b,1).setStrokeStyle(2,hexToNum(COL_ACCENT)).setDepth(51);
    var h1 = this.add.text(W/2,H*0.5-75,'Discovered!',{fontSize:'22px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(52);
    var explain;
    if (this.statType === 'mean') explain = 'The seesaw balanced at ' + this.target + ' — that IS the mean.';
    else if (this.statType === 'median') explain = 'When sorted, the middle dot was ' + this.target + ' — that IS the median.';
    else explain = 'Tallest stack was at ' + this.target + ' — that IS the mode.';
    var t1 = this.add.text(W/2,H*0.5-30,explain,{fontSize:'14px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",wordWrap:{width:W-80},align:'center'}).setOrigin(0.5).setDepth(52);
    var t2 = this.add.text(W/2,H*0.5+10,this.statType.toUpperCase() + ' = ' + this.target,{fontSize:'22px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(52);
    var btn = this.add.rectangle(W/2,H*0.5+70,200,44,hexToNum(COL_ACCENT),1).setInteractive({useHandCursor:true}).setDepth(52);
    var isLast = this.round + 1 >= TOTAL_ROUNDS;
    var btnLbl = this.add.text(W/2,H*0.5+70,isLast?'Finish!':'Got it! Next round \\u2192',{fontSize:'14px',color:'#000',fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(53);
    btn.on('pointerdown',()=>{
      [backdrop,card,h1,t1,t2,btn,btnLbl].forEach(o=>o.destroy());
      this._solved = false;
      this.round++;
      if (this.round >= TOTAL_ROUNDS) this.scene.start('VictoryScene',{score:gameScore});
      else this.startRound();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTRINSIC: Law of Large Numbers Spinner
// Player clicks "Spin 100x", sees automated spins and bars fill in real time.
// Distribution emerges physically. Then drag a likelihood slider to rank colors.
// The OBSERVATION of many trials IS the probability lesson.
// ═══════════════════════════════════════════════════════════════════════════════
class BetTheSpinnerScene extends Phaser.Scene {
  constructor() { super('BetTheSpinnerScene'); }
  create() {
    this.W=this.scale.width;this.H=this.scale.height;this.round=0;this.lives=MAX_LIVES;
    this._bg();this._ui();
    this.hero = addCharacter(this, this.W*0.88, this.H*0.55, 0.8);
    this.startRound();
  }
  _bg() { const bg=this.add.image(this.W/2,this.H/2,'bg');bg.setScale(Math.max(this.W/bg.width,this.H/bg.height));this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.7); }
  _ui() {
    this.scoreLbl=this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);
    this.add.text(this.W/2,16,(MATH && MATH.standardDescription) || 'Probability',{fontSize:'11px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.55,align:'center',wordWrap:{width:this.W*0.6}}).setOrigin(0.5,0).setDepth(10);
    this.hg=this.add.group();this._rh();this.dg=this.add.group();this._rd();
  }
  _rh() { this.hg.clear(true,true);for(let i=0;i<this.lives;i++)this.hg.add(this.add.text(14+i*22,14,'\\u2665',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dg.clear(true,true);for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  startRound() {
    if (this.rg) this.rg.clear(true,true);
    this.rg = this.add.group();
    this.spun = false; this.counts = null; this.solved = false;
    var cfg = fbSpinnerRound(this.round);
    this.sections = cfg.pcts.map(function(p,i){ return { name: cfg.names[i], hex: cfg.hexes[i], pct: p }; });
    this.counts = this.sections.map(function(){ return 0; });
    this._rd();
    this._buildScene();
  }

  _buildScene() {
    var W=this.W,H=this.H;
    this.rg.add(this.add.text(W/2,40,'Spin many times. Watch what appears.',{fontSize:'20px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6));
    this.rg.add(this.add.text(W/2,66,'Then order colors from MOST to LEAST likely.',{fontSize:'12px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.7}).setOrigin(0.5).setDepth(6));

    // Draw spinner
    var cx = W*0.28, cy = H*0.42;
    var r = Math.min(W,H)*0.16;
    this.spinnerCenter = { x: cx, y: cy, r: r };
    var gfx = this.add.graphics().setDepth(5);
    var startAngle = -Math.PI/2;
    var self = this;
    this.sections.forEach(function(s){
      var sweep = s.pct/100 * Math.PI*2;
      gfx.fillStyle(hexToNum(s.hex), 0.9);
      gfx.beginPath(); gfx.moveTo(cx, cy);
      var steps = Math.max(16, Math.floor(sweep/(Math.PI/32)));
      for (var j = 0; j <= steps; j++) {
        var a = startAngle + sweep * j/steps;
        gfx.lineTo(cx+Math.cos(a)*r, cy+Math.sin(a)*r);
      }
      gfx.closePath(); gfx.fillPath();
      startAngle += sweep;
    });
    gfx.lineStyle(2, hexToNum(COL_TEXT), 0.6);
    gfx.strokeCircle(cx, cy, r);
    this.rg.add(gfx);
    // Pointer
    this.pointer = this.add.triangle(cx, cy - r - 10, 0, 10, 16, 10, 8, 0, hexToNum(COL_ACCENT), 1).setDepth(7);
    this.rg.add(this.pointer);
    // Spinner arrow that rotates
    this.arrow = this.add.rectangle(cx, cy, 4, r*0.85, hexToNum(COL_TEXT), 1).setOrigin(0.5, 1).setDepth(6);
    this.rg.add(this.arrow);

    // Bars area on right side
    var barsX = W*0.55;
    var barsY = H*0.22;
    var barsH = H*0.40;
    var barW = Math.min(46, (W*0.38) / this.sections.length - 8);
    this.barTopY = barsY;
    this.barBotY = barsY + barsH;
    this.barW = barW;
    this.barsX = barsX;
    this.barVisuals = [];
    this.rg.add(this.add.text(barsX + (this.sections.length * (barW+8))/2 - (barW+8)/2, barsY - 18, 'Counts', {
      fontSize:'12px', color:COL_TEXT, fontFamily:"'Lexend', system-ui", alpha:0.6
    }).setOrigin(0.5).setDepth(6));
    var self2 = this;
    this.sections.forEach(function(s, i){
      var bx = barsX + i*(barW+8);
      var bg = self2.add.rectangle(bx, self2.barBotY - 1, barW, barsH, hexToNum(COL_SECONDARY), 0.15).setOrigin(0.5, 1).setDepth(4);
      self2.rg.add(bg);
      var bar = self2.add.rectangle(bx, self2.barBotY - 1, barW, 2, hexToNum(s.hex), 0.85).setOrigin(0.5, 1).setDepth(5);
      self2.rg.add(bar);
      var lbl = self2.add.text(bx, self2.barBotY + 8, s.name, { fontSize:'11px', color:s.hex, fontFamily:"'Lexend', system-ui", fontStyle:'bold' }).setOrigin(0.5, 0).setDepth(6);
      self2.rg.add(lbl);
      var cntLbl = self2.add.text(bx, self2.barBotY + 24, '0', { fontSize:'11px', color:COL_TEXT, fontFamily:"'Space Grotesk', sans-serif", alpha:0.7 }).setOrigin(0.5, 0).setDepth(6);
      self2.rg.add(cntLbl);
      self2.barVisuals.push({ bar: bar, cntLbl: cntLbl });
    });

    // Spin button
    var spinBtn = this.add.rectangle(W*0.28, H*0.72, 180, 44, hexToNum(COL_PRIMARY), 1).setInteractive({useHandCursor:true}).setDepth(7);
    var spinLbl = this.add.text(W*0.28, H*0.72, 'Spin 100x', {fontSize:'16px', color:'#fff', fontFamily:"'Lexend', system-ui", fontStyle:'bold'}).setOrigin(0.5).setDepth(8);
    this.rg.add(spinBtn); this.rg.add(spinLbl);
    this.spinBtn = spinBtn; this.spinLbl = spinLbl;
    spinBtn.on('pointerdown', () => this._runSpins());

    // Ranking slots (built after spins complete)
    this.rankingGroup = this.add.group();
  }

  _runSpins() {
    if (this.spun || this.spinning) return;
    this.spinning = true;
    this.spinBtn.setFillStyle(hexToNum(COL_SECONDARY), 0.4);
    this.spinLbl.setText('Spinning...');
    // Simulate 100 spins weighted by section pct; stagger visuals
    var totalSpins = 100;
    var done = 0;
    var self = this;
    var doSpin = function() {
      if (done >= totalSpins) { self._spinsComplete(); return; }
      var r = Math.random()*100, acc = 0, idx = 0;
      for (var i = 0; i < self.sections.length; i++) { acc += self.sections[i].pct; if (r <= acc) { idx = i; break; } }
      self.counts[idx]++;
      // Update bar
      var maxCount = Math.max.apply(null, self.counts);
      var barsHpx = self.barBotY - self.barTopY;
      self.barVisuals.forEach(function(bv, i){
        var h = Math.max(2, (self.counts[i] / Math.max(1, maxCount)) * (barsHpx - 10));
        bv.bar.height = h;
        bv.cntLbl.setText(String(self.counts[i]));
      });
      // Spin arrow to random angle (visual)
      self.arrow.rotation = Math.random() * Math.PI * 2;
      done++;
      var delay = done < 10 ? 80 : done < 30 ? 40 : done < 60 ? 20 : 10;
      self.time.delayedCall(delay, doSpin);
    };
    doSpin();
  }

  _spinsComplete() {
    this.spun = true; this.spinning = false;
    this.spinBtn.setVisible(false); this.spinLbl.setVisible(false);
    this._buildRanking();
  }

  _buildRanking() {
    var W=this.W,H=this.H;
    // True order: by counts descending
    var order = this.sections.map(function(s,i){ return { s:s, i:i, c:0 }; });
    var self = this;
    order.forEach(function(o){ o.c = self.counts[o.i]; });
    this.trueOrder = order.slice().sort(function(a,b){return b.c - a.c;}).map(function(o){return o.i;});

    // Header
    this.rg.add(this.add.text(W/2, H*0.70, 'Drag tiles into slots: MOST  \\u2192  LEAST likely', {
      fontSize:'13px', color:COL_ACCENT, fontFamily:"'Lexend', system-ui", fontStyle:'bold'
    }).setOrigin(0.5).setDepth(6));

    // Slots
    var n = this.sections.length;
    var slotW = Math.min(86, (W*0.9)/n - 10);
    var slotH = 44;
    var slotsY = H*0.80;
    var totalW = n * slotW + (n-1) * 10;
    var startX = W/2 - totalW/2 + slotW/2;
    this.slots = [];
    for (var i = 0; i < n; i++) {
      var sx = startX + i*(slotW+10);
      var slot = this.add.rectangle(sx, slotsY, slotW, slotH, hexToNum(COL_SECONDARY), 0.2).setStrokeStyle(2, hexToNum(COL_ACCENT), 0.5).setDepth(4);
      this.rg.add(slot);
      var lbl = this.add.text(sx, slotsY - slotH/2 - 10, (i===0?'MOST':i===n-1?'LEAST':'#'+(i+1)), {
        fontSize:'10px', color:COL_TEXT, fontFamily:"'Lexend', system-ui", alpha:0.6
      }).setOrigin(0.5).setDepth(5);
      this.rg.add(lbl);
      this.slots.push({ x:sx, y:slotsY, w:slotW, h:slotH, occupant:null, idx:i });
    }

    // Tiles — one per color, draggable
    this.tiles = [];
    var tileY = H*0.92;
    var tileTotalW = n * slotW + (n-1) * 10;
    var tileStartX = W/2 - tileTotalW/2 + slotW/2;
    for (var j = 0; j < n; j++) {
      var s = this.sections[j];
      var tx = tileStartX + j*(slotW+10);
      var tile = this.add.rectangle(tx, tileY, slotW-4, slotH-4, hexToNum(s.hex), 0.9).setDepth(7).setInteractive({useHandCursor:true, draggable:true});
      this.input.setDraggable(tile);
      var tlbl = this.add.text(tx, tileY, s.name, { fontSize:'12px', color:'#fff', fontFamily:"'Space Grotesk', sans-serif", fontStyle:'bold', stroke:'#000', strokeThickness:2 }).setOrigin(0.5).setDepth(8);
      tile._colorIdx = j; tile._lbl = tlbl; tile._homeX = tx; tile._homeY = tileY; tile._slot = null;
      this.rg.add(tile); this.rg.add(tlbl);
      this.tiles.push(tile);
    }

    var scene = this;
    this.input.on('drag', function(pointer, obj, dragX, dragY){
      if (obj._colorIdx === undefined) return;
      obj.x = dragX; obj.y = dragY;
      obj._lbl.x = dragX; obj._lbl.y = dragY;
    });
    this.input.on('dragend', function(pointer, obj){
      if (obj._colorIdx === undefined) return;
      // Find nearest slot within reach
      var best = null, bestD = 9999;
      for (var k = 0; k < scene.slots.length; k++) {
        var sl = scene.slots[k];
        var d = Math.abs(obj.x - sl.x) + Math.abs(obj.y - sl.y);
        if (d < bestD) { bestD = d; best = sl; }
      }
      if (best && bestD < 80 && !best.occupant) {
        // free previous slot
        if (obj._slot) obj._slot.occupant = null;
        best.occupant = obj;
        obj._slot = best;
        obj.x = best.x; obj.y = best.y;
        obj._lbl.x = best.x; obj._lbl.y = best.y;
      } else {
        if (obj._slot) { obj._slot.occupant = null; obj._slot = null; }
        obj.x = obj._homeX; obj.y = obj._homeY;
        obj._lbl.x = obj._homeX; obj._lbl.y = obj._homeY;
      }
      scene._checkRanking();
    });
  }

  _checkRanking() {
    if (this.solved) return;
    // All slots must be filled
    for (var i = 0; i < this.slots.length; i++) if (!this.slots[i].occupant) return;
    // Verify order matches trueOrder
    for (var j = 0; j < this.slots.length; j++) {
      if (this.slots[j].occupant._colorIdx !== this.trueOrder[j]) {
        // Flash wrong — shake the mismatched
        this.slots[j].occupant.setStrokeStyle(3, hexToNum(COL_DANGER));
        var tile = this.slots[j].occupant;
        this.tweens.add({ targets: tile, x: tile.x + 6, duration: 60, yoyo: true, repeat: 2 });
        this.time.delayedCall(350, () => tile.setStrokeStyle && tile.setStrokeStyle(0));
        return;
      }
    }
    this.solved = true;
    this.cameras.main.flash(140, 34, 197, 94);
    heroCheer(this, this.hero);
    gameScore += 10 * (this.round + 1);
    this.scoreLbl.setText('Score: ' + gameScore);
    this.time.delayedCall(400, () => this._showSolutionCard());
  }

  _showSolutionCard() {
    var W=this.W,H=this.H;
    var backdrop = this.add.rectangle(W/2,H/2,W,H,0x000000,0.55).setDepth(50);
    var card = this.add.rectangle(W/2,H*0.5,W-40,220,0x18181b,1).setStrokeStyle(2,hexToNum(COL_ACCENT)).setDepth(51);
    var h1 = this.add.text(W/2,H*0.5-75,'Probability in action!',{fontSize:'22px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(52);
    var self = this;
    var parts = this.trueOrder.map(function(i){ return self.sections[i].name + ' (' + self.counts[i] + ')'; }).join('  >  ');
    var t1 = this.add.text(W/2,H*0.5-30,'Across 100 spins, bigger sections landed more often. That IS probability.',{fontSize:'13px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",wordWrap:{width:W-80},align:'center'}).setOrigin(0.5).setDepth(52);
    var t2 = this.add.text(W/2,H*0.5+10,parts,{fontSize:'15px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(52);
    var btn = this.add.rectangle(W/2,H*0.5+70,200,44,hexToNum(COL_ACCENT),1).setInteractive({useHandCursor:true}).setDepth(52);
    var isLast = this.round + 1 >= TOTAL_ROUNDS;
    var btnLbl = this.add.text(W/2,H*0.5+70,isLast?'Finish!':'Got it! Next round \\u2192',{fontSize:'14px',color:'#000',fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(53);
    btn.on('pointerdown',()=>{
      [backdrop,card,h1,t1,t2,btn,btnLbl].forEach(o=>o.destroy());
      this.round++;
      if (this.round >= TOTAL_ROUNDS) this.scene.start('VictoryScene',{score:gameScore});
      else this.startRound();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTRINSIC: Balance Scale Mean
// Player drags bar heights to match a target MEAN. Below the bars, a balance
// scale's fulcrum continuously shows the mean position. When fulcrum matches
// the target line, bars lock. The MEAN IS THE BALANCE POINT OF THE DATA.
// ═══════════════════════════════════════════════════════════════════════════════
class BuildTheChartScene extends Phaser.Scene {
  constructor() { super('BuildTheChartScene'); }
  create() {
    this.W=this.scale.width;this.H=this.scale.height;this.round=0;this.lives=MAX_LIVES;
    this._bg();this._ui();
    this.hero = addCharacter(this, this.W*0.88, this.H*0.55, 0.8);
    this.startRound();
  }
  _bg() { const bg=this.add.image(this.W/2,this.H/2,'bg');bg.setScale(Math.max(this.W/bg.width,this.H/bg.height));this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.7); }
  _ui() {
    this.scoreLbl=this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);
    this.add.text(this.W/2,16,(MATH && MATH.standardDescription) || 'Mean / data',{fontSize:'11px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.55,align:'center',wordWrap:{width:this.W*0.6}}).setOrigin(0.5,0).setDepth(10);
    this.hg=this.add.group();this._rh();this.dg=this.add.group();this._rd();
  }
  _rh() { this.hg.clear(true,true);for(let i=0;i<this.lives;i++)this.hg.add(this.add.text(14+i*22,14,'\\u2665',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dg.clear(true,true);for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  startRound() {
    if (this.rg) this.rg.clear(true,true);
    this.rg = this.add.group();
    this.solved = false;
    var raw = getRound(this.round);
    var fb = fbChartRound(this.round);
    var target = (typeof raw.target === 'number' && raw.target > 0 && raw.target < 15) ? raw.target : fb.target;
    var items = (Array.isArray(raw.items) && raw.items.length >= 3) ? raw.items.slice(0, 5) : fb.items.slice();
    // Ensure items are in [1..10]
    items = items.map(function(v){ return Math.max(1, Math.min(10, Math.round(v))); });
    this.target = target;
    this.values = items;
    this._rd();
    this._buildScene();
  }

  _buildScene() {
    var W=this.W,H=this.H;
    this.rg.add(this.add.text(W/2,42,'Drag bars to build mean = ' + this.target,{
      fontSize:'22px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'
    }).setOrigin(0.5).setDepth(6));
    this.rg.add(this.add.text(W/2,72,'The scale balances at the MEAN. Match the target line.',{
      fontSize:'12px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.7
    }).setOrigin(0.5).setDepth(6));

    // Bar chart area
    var chartL = W*0.14, chartR = W*0.72;
    var chartTop = H*0.17, chartBot = H*0.55;
    this.chartL = chartL; this.chartR = chartR;
    this.chartTop = chartTop; this.chartBot = chartBot;
    this.maxBar = 10;
    // Gridlines for values
    for (var g = 0; g <= this.maxBar; g += 2) {
      var gy = chartBot - (g/this.maxBar)*(chartBot - chartTop);
      var line = this.add.rectangle(W/2, gy, chartR - chartL, 1, hexToNum(COL_TEXT), 0.12).setDepth(3);
      this.rg.add(line);
    }

    // Bars — draggable vertically
    var n = this.values.length;
    var barSpace = (chartR - chartL) / n;
    var barW = barSpace * 0.55;
    this.bars = [];
    var scene = this;
    for (var i = 0; i < n; i++) {
      var bx = chartL + barSpace * (i + 0.5);
      var val = this.values[i];
      var h = (val/this.maxBar) * (chartBot - chartTop);
      var bar = this.add.rectangle(bx, chartBot, barW, h, hexToNum(COL_PRIMARY), 0.85).setOrigin(0.5, 1).setDepth(5);
      bar.setInteractive({useHandCursor:true, draggable:true});
      this.input.setDraggable(bar);
      var vlbl = this.add.text(bx, chartBot - h - 14, String(val), { fontSize:'13px', color:COL_TEXT, fontFamily:"'Space Grotesk', sans-serif", fontStyle:'bold' }).setOrigin(0.5).setDepth(6);
      var handle = this.add.rectangle(bx, chartBot - h, barW + 6, 6, hexToNum(COL_ACCENT), 1).setDepth(6);
      bar._idx = i; bar._valLbl = vlbl; bar._handle = handle; bar._x = bx;
      this.rg.add(bar); this.rg.add(vlbl); this.rg.add(handle);
      this.bars.push(bar);
    }

    this.input.on('drag', function(pointer, obj, dragX, dragY){
      if (obj._idx === undefined) return;
      var newY = Math.max(scene.chartTop, Math.min(scene.chartBot, dragY));
      var newH = scene.chartBot - newY;
      var val = Math.round((newH / (scene.chartBot - scene.chartTop)) * scene.maxBar);
      val = Math.max(0, Math.min(scene.maxBar, val));
      var snapH = (val/scene.maxBar) * (scene.chartBot - scene.chartTop);
      obj.height = snapH;
      obj._handle.y = scene.chartBot - snapH;
      obj._valLbl.y = scene.chartBot - snapH - 14;
      obj._valLbl.setText(String(val));
      scene.values[obj._idx] = val;
      scene._updateBalance();
    });

    // Target line across chart
    this.rg.add(this.add.text(chartR + 16, chartTop + (this.maxBar - this.target)/this.maxBar * 0, '', {}));

    // Balance scale below
    var seeY = H*0.72;
    this.seeY = seeY;
    this.rg.add(this.add.text(W/2, seeY - 40, 'Balance point (the mean)', {
      fontSize:'12px', color:COL_TEXT, fontFamily:"'Lexend', system-ui", alpha:0.6
    }).setOrigin(0.5).setDepth(4));
    // The scale's beam runs along the same horizontal range as the chart
    this.seeBeam = this.add.rectangle((chartL+chartR)/2, seeY, chartR - chartL, 6, hexToNum(COL_PRIMARY), 1).setDepth(4);
    this.rg.add(this.seeBeam);
    // Target marker on scale
    var targetX = chartL + (this.target / this.maxBar) * (chartR - chartL);
    this.targetMark = this.add.triangle(targetX, seeY - 18, 0, -14, 10, 0, -10, 0, hexToNum(COL_ACCENT), 1).setDepth(5);
    this.rg.add(this.targetMark);
    this.rg.add(this.add.text(targetX, seeY - 34, 'target ' + this.target, {
      fontSize:'11px', color:COL_ACCENT, fontFamily:"'Lexend', system-ui", fontStyle:'bold'
    }).setOrigin(0.5).setDepth(5));
    // Actual fulcrum (moves with mean of bars)
    this.fulcrum = this.add.triangle((chartL+chartR)/2, seeY + 22, 0, 22, 16, 0, 32, 22, hexToNum(COL_PRIMARY), 1).setDepth(5);
    this.rg.add(this.fulcrum);
    this.meanLbl = this.add.text((chartL+chartR)/2, seeY + 54, '', {
      fontSize:'14px', color:COL_PRIMARY, fontFamily:"'Space Grotesk', sans-serif", fontStyle:'bold'
    }).setOrigin(0.5).setDepth(5);
    this.rg.add(this.meanLbl);

    this._updateBalance();
  }

  _updateBalance() {
    var sum = 0; this.values.forEach(function(v){sum+=v;});
    var mean = sum / this.values.length;
    // Map mean (in bar-value space) to x position along the chart width
    var mx = this.chartL + (mean/this.maxBar) * (this.chartR - this.chartL);
    this.tweens.add({ targets: this.fulcrum, x: mx, duration: 180, ease:'Sine.easeOut' });
    this.meanLbl.x = mx;
    var meanRound = Math.round(mean * 10)/10;
    this.meanLbl.setText('mean = ' + meanRound);
    // Tilt beam proportional to distance from target
    var err = mean - this.target;
    var tilt = Math.max(-0.15, Math.min(0.15, err * 0.04));
    this.seeBeam.rotation = tilt;
    // Match?
    if (Math.abs(mean - this.target) < 0.05 && !this.solved) {
      this.solved = true;
      this.bars.forEach(b => { b.setFillStyle(hexToNum(COL_ACCENT), 0.9); });
      this.seeBeam.setFillStyle(hexToNum(COL_ACCENT), 1);
      this.seeBeam.rotation = 0;
      this.time.delayedCall(500, () => this._win());
    }
  }

  _win() {
    gameScore += 10 * (this.round + 1);
    this.scoreLbl.setText('Score: ' + gameScore);
    this.cameras.main.flash(140, 34, 197, 94);
    heroCheer(this, this.hero);
    this._showSolutionCard();
  }

  _showSolutionCard() {
    var W=this.W,H=this.H;
    var backdrop = this.add.rectangle(W/2,H/2,W,H,0x000000,0.55).setDepth(50);
    var card = this.add.rectangle(W/2,H*0.5,W-40,220,0x18181b,1).setStrokeStyle(2,hexToNum(COL_ACCENT)).setDepth(51);
    var h1 = this.add.text(W/2,H*0.5-75,'The mean is the balance point!',{fontSize:'20px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(52);
    var sum = 0; this.values.forEach(function(v){sum+=v;});
    var line1 = this.values.join(' + ') + ' = ' + sum;
    var line2 = sum + ' / ' + this.values.length + ' = ' + this.target;
    var t1 = this.add.text(W/2,H*0.5-30,line1,{fontSize:'14px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif"}).setOrigin(0.5).setDepth(52);
    var t2 = this.add.text(W/2,H*0.5,line2,{fontSize:'14px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif"}).setOrigin(0.5).setDepth(52);
    var t3 = this.add.text(W/2,H*0.5+30,'mean = ' + this.target,{fontSize:'22px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(52);
    var btn = this.add.rectangle(W/2,H*0.5+80,200,44,hexToNum(COL_ACCENT),1).setInteractive({useHandCursor:true}).setDepth(52);
    var isLast = this.round + 1 >= TOTAL_ROUNDS;
    var btnLbl = this.add.text(W/2,H*0.5+80,isLast?'Finish!':'Got it! Next round \\u2192',{fontSize:'14px',color:'#000',fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(53);
    btn.on('pointerdown',()=>{
      [backdrop,card,h1,t1,t2,t3,btn,btnLbl].forEach(o=>o.destroy());
      this.round++;
      if (this.round >= TOTAL_ROUNDS) this.scene.start('VictoryScene',{score:gameScore});
      else this.startRound();
    });
  }
}
`
