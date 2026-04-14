// Fit & Rotate — Phaser engine with 3 game options.
// Math: Spatial reasoning, rotation, symmetry, area composition.
// Options: rotate-to-match, tangram-fill, mirror-puzzle

import type { ThemeConfig, MathParams, GameOption } from "./engine-types"
import { phaserGame } from "./base-phaser-template"
import { getOptionDef } from "./game-option-registry"

export function spatialPuzzlesPhaserEngine(
  config: ThemeConfig,
  math: MathParams,
  option: GameOption = "rotate-to-match"
): string {
  const validOptions = ["rotate-to-match", "tangram-fill", "mirror-puzzle"]
  const activeOption = validOptions.includes(option) ? option : "rotate-to-match"
  const optDef = getOptionDef(activeOption)
  const sceneMap: Record<string, string> = {
    "rotate-to-match": "RotateToMatchScene",
    "tangram-fill": "TangramFillScene",
    "mirror-puzzle": "MirrorPuzzleScene",
  }
  return phaserGame({
    config, math, option: activeOption,
    sceneName: sceneMap[activeOption],
    introText: optDef?.introText || "Solve spatial puzzles!",
    helpText: optDef?.helpText || "Rotate, fill, and mirror shapes.",
    gameSceneCode: GAME_SCENES,
  })
}

const GAME_SCENES = `
// ─── Shape path data (used by RotateToMatch and MirrorPuzzle) ──────────────
var SHAPE_PATHS = [
  { name:'triangle', pts:function(cx,cy,s){ return [{x:cx,y:cy-s},{x:cx-s*0.87,y:cy+s*0.5},{x:cx+s*0.87,y:cy+s*0.5}]; } },
  { name:'rectangle', pts:function(cx,cy,s){ return [{x:cx-s,y:cy-s*0.6},{x:cx+s,y:cy-s*0.6},{x:cx+s,y:cy+s*0.6},{x:cx-s,y:cy+s*0.6}]; } },
  { name:'pentagon', pts:function(cx,cy,s){ var p=[];for(var i=0;i<5;i++){var a=Math.PI*2/5*i-Math.PI/2;p.push({x:cx+Math.cos(a)*s,y:cy+Math.sin(a)*s});}return p; } },
  { name:'diamond', pts:function(cx,cy,s){ return [{x:cx,y:cy-s},{x:cx+s*0.6,y:cy},{x:cx,y:cy+s},{x:cx-s*0.6,y:cy}]; } },
  { name:'irregular', pts:function(cx,cy,s){ return [{x:cx-s,y:cy-s*0.4},{x:cx-s*0.2,y:cy-s},{x:cx+s*0.8,y:cy-s*0.3},{x:cx+s,y:cy+s*0.5},{x:cx-s*0.3,y:cy+s*0.7}]; } }
];

function rotatePoints(pts, cx, cy, angleDeg) {
  var rad = angleDeg * Math.PI / 180;
  return pts.map(function(p) {
    var dx = p.x - cx, dy = p.y - cy;
    return { x: cx + dx * Math.cos(rad) - dy * Math.sin(rad), y: cy + dx * Math.sin(rad) + dy * Math.cos(rad) };
  });
}

function drawShapePoly(scene, grp, pts, color, alpha, lineW) {
  var g = scene.add.graphics().setDepth(6);
  g.lineStyle(lineW || 3, hexToNum(color), alpha || 1);
  g.beginPath();
  g.moveTo(pts[0].x, pts[0].y);
  for (var i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
  g.closePath();
  g.strokePath();
  grp.add(g);
  return g;
}

function drawShapePolyFilled(scene, grp, pts, fillColor, fillAlpha, strokeColor, lineW) {
  var g = scene.add.graphics().setDepth(6);
  g.fillStyle(hexToNum(fillColor), fillAlpha || 0.3);
  g.lineStyle(lineW || 3, hexToNum(strokeColor), 1);
  g.beginPath();
  g.moveTo(pts[0].x, pts[0].y);
  for (var i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
  g.closePath();
  g.fillPath();
  g.strokePath();
  grp.add(g);
  return g;
}

// ─── Round generators ───────────────────────────────────────────────────────

function generateRotateRound(round) {
  var angles = [90, 180, 270];
  var targetAngle = angles[Math.floor(Math.random() * angles.length)];
  var shapeIdx = round < SHAPE_PATHS.length ? round : Math.floor(Math.random() * SHAPE_PATHS.length);
  return { shapeIdx: shapeIdx, targetAngle: targetAngle };
}

function generateTangramRound(round) {
  // Progressive difficulty: larger targets, more piece options
  var basePieces, target;
  if (round < 2) {
    // Easy: target 5-10, pieces 1-4
    basePieces = [1, 2, 3, 4, 1, 2, 3];
    target = 5 + Math.floor(Math.random() * 6);
  } else if (round < 4) {
    // Medium: target 10-18, pieces 1-6
    basePieces = [1, 2, 3, 4, 5, 6, 2, 3, 4];
    target = 10 + Math.floor(Math.random() * 9);
  } else {
    // Hard: target 18-30, pieces 1-6
    basePieces = [1, 2, 3, 4, 5, 6, 3, 4, 5, 6, 2];
    target = 18 + Math.floor(Math.random() * 13);
  }
  // Shuffle pieces
  for (var i = basePieces.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = basePieces[i]; basePieces[i] = basePieces[j]; basePieces[j] = tmp;
  }
  return { target: target, pieces: basePieces };
}

function generateMirrorRound(round) {
  // Dot on the left side of mirror line at center
  var offsetRange = round < 2 ? 60 : round < 4 ? 100 : 140;
  var dotX = -(20 + Math.floor(Math.random() * offsetRange));
  var dotY = -80 + Math.floor(Math.random() * 160);
  var tolerance = round < 2 ? 30 : round < 4 ? 22 : 15;
  var shapeIdx = Math.floor(Math.random() * SHAPE_PATHS.length);
  return { dotX: dotX, dotY: dotY, tolerance: tolerance, shapeIdx: shapeIdx };
}

// ═══════════════════════════════════════════════════════════════════════════════
// RotateToMatchScene — INTRINSIC REBUILD
//
// Math: rotation as a continuous transformation; angle of rotation.
// Player drags a rotation handle around the shape's centre. The shape rotates
// CONTINUOUSLY following the pointer (no discrete buttons, no Check). A
// translucent GHOST of the target overlays the same position. As the player
// approaches the target angle, the shape glows; when within a small tolerance
// it SNAPS into the ghost and locks. Self-revealing truth: alignment IS the
// answer. No typed input. Auto-detect success by angular proximity.
// ═══════════════════════════════════════════════════════════════════════════════
class RotateToMatchScene extends Phaser.Scene {
  constructor() { super('RotateToMatchScene'); }
  create() {
    this.W=this.scale.width;this.H=this.scale.height;this.round=0;this.lives=MAX_LIVES;
    this._bg();this._ui();
    this.hero = addCharacter(this, this.W*0.88, this.H*0.55, 0.8);
    this.startRound();
  }
  _bg() { const bg=this.add.image(this.W/2,this.H/2,'bg');bg.setScale(Math.max(this.W/bg.width,this.H/bg.height));this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.7); }
  _ui() {
    this.scoreLbl=this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);
    this.add.text(this.W/2,16,(MATH && MATH.standardDescription) || 'Rotation',{fontSize:'11px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.55,align:'center',wordWrap:{width:this.W*0.6}}).setOrigin(0.5,0).setDepth(10);
    this.hg=this.add.group();this._rh();this.dg=this.add.group();this._rd();
  }
  _rh() { this.hg.clear(true,true);for(let i=0;i<this.lives;i++)this.hg.add(this.add.text(14+i*22,14,'\\u2665',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dg.clear(true,true);for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  startRound() {
    if(this.rg)this.rg.clear(true,true);this.rg=this.add.group();
    this.solved = false;
    var data=getRound(this.round);
    // Fallback variation per round (5 rounds)
    var fbAngles=[90,180,270,90,180];
    var fbShapes=[0,1,2,3,4];
    var rawAngle = (typeof data.target === 'number' && [90,180,270].indexOf(data.target)>=0) ? data.target : fbAngles[this.round % fbAngles.length];
    var rawShape = (Array.isArray(data.items) && typeof data.items[0] === 'number' && data.items[0]>=0 && data.items[0]<SHAPE_PATHS.length) ? data.items[0] : fbShapes[this.round % fbShapes.length];
    this.targetAngle = rawAngle;
    this.shapeIdx = rawShape;
    // Player begins at a different angle than the target
    var startOffsets = [45, 30, 60, 120, 200];
    this.currentAngle = (this.targetAngle + startOffsets[this.round % startOffsets.length]) % 360;
    this._rd();

    var W=this.W,H=this.H;
    var shapeSize=Math.min(W,H)*0.14;
    this.shapeSize = shapeSize;
    this.cx = W*0.42; this.cy = H*0.45;

    // Header
    this.rg.add(this.add.text(W/2,52,'Rotate to align with the ghost',{fontSize:'18px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6));
    this.rg.add(this.add.text(W/2,78,'Drag the handle around the centre. Shape snaps when aligned.',{fontSize:'12px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.7,align:'center',wordWrap:{width:W-60}}).setOrigin(0.5).setDepth(6));

    // Centre marker
    this.rg.add(this.add.circle(this.cx,this.cy,4,hexToNum(COL_TEXT),0.5).setDepth(4));
    // Faint orbit guide for the handle
    var orbitG = this.add.graphics().setDepth(3);
    orbitG.lineStyle(1, hexToNum(COL_TEXT), 0.18);
    orbitG.strokeCircle(this.cx, this.cy, shapeSize + 28);
    this.rg.add(orbitG);

    // Ghost target shape (overlay at same centre, rotated to target angle)
    this._drawGhost();
    // Player shape
    this._drawPlayerShape();

    // Angle readout
    this.angleLbl=this.add.text(this.cx, this.cy + shapeSize + 60, '', {fontSize:'13px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif"}).setOrigin(0.5).setDepth(6);
    this.rg.add(this.angleLbl);
    this.targetLbl=this.add.text(this.cx, this.cy - shapeSize - 22, 'target = ' + this.targetAngle + '\\u00b0', {fontSize:'12px',color:COL_DANGER,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(6);
    this.rg.add(this.targetLbl);

    // Rotation handle — draggable around the orbit
    var hx = this.cx + Math.cos((this.currentAngle - 90) * Math.PI/180) * (shapeSize + 28);
    var hy = this.cy + Math.sin((this.currentAngle - 90) * Math.PI/180) * (shapeSize + 28);
    this.handle = this.add.circle(hx, hy, 14, hexToNum(COL_ACCENT), 1).setStrokeStyle(2, hexToNum(COL_TEXT)).setDepth(9);
    this.handle.setInteractive({ useHandCursor:true, draggable:true });
    this.input.setDraggable(this.handle);
    this.rg.add(this.handle);

    var scene = this;
    this.input.removeAllListeners('drag');
    this.input.on('drag', function(pointer, obj, dragX, dragY){
      if (obj !== scene.handle || scene.solved) return;
      var dx = dragX - scene.cx, dy = dragY - scene.cy;
      var ang = Math.atan2(dy, dx) * 180 / Math.PI + 90;
      while (ang < 0) ang += 360;
      while (ang >= 360) ang -= 360;
      scene.currentAngle = ang;
      // Snap handle onto orbit
      var rad = (ang - 90) * Math.PI/180;
      scene.handle.x = scene.cx + Math.cos(rad) * (scene.shapeSize + 28);
      scene.handle.y = scene.cy + Math.sin(rad) * (scene.shapeSize + 28);
      scene._drawPlayerShape();
      scene._checkAlignment();
    });

    this._updateAngleLabel();
  }

  _drawGhost() {
    if (this.ghostGfx) this.ghostGfx.destroy();
    var pts = SHAPE_PATHS[this.shapeIdx].pts(this.cx, this.cy, this.shapeSize);
    var rotated = rotatePoints(pts, this.cx, this.cy, this.targetAngle);
    var g = this.add.graphics().setDepth(5);
    g.fillStyle(hexToNum(COL_DANGER), 0.12);
    g.lineStyle(2, hexToNum(COL_DANGER), 0.55);
    g.beginPath(); g.moveTo(rotated[0].x, rotated[0].y);
    for (var i = 1; i < rotated.length; i++) g.lineTo(rotated[i].x, rotated[i].y);
    g.closePath(); g.fillPath(); g.strokePath();
    this.ghostGfx = g; this.rg.add(g);
  }

  _drawPlayerShape() {
    if (this.playerGfx) this.playerGfx.destroy();
    var pts = SHAPE_PATHS[this.shapeIdx].pts(this.cx, this.cy, this.shapeSize);
    var rotated = rotatePoints(pts, this.cx, this.cy, this.currentAngle);
    var g = this.add.graphics().setDepth(7);
    var diff = this._angleDiff();
    var glow = diff < 12;
    g.fillStyle(hexToNum(glow ? COL_ACCENT : COL_PRIMARY), glow ? 0.5 : 0.35);
    g.lineStyle(3, hexToNum(glow ? COL_ACCENT : COL_PRIMARY), 1);
    g.beginPath(); g.moveTo(rotated[0].x, rotated[0].y);
    for (var i = 1; i < rotated.length; i++) g.lineTo(rotated[i].x, rotated[i].y);
    g.closePath(); g.fillPath(); g.strokePath();
    this.playerGfx = g; this.rg.add(g);
  }

  _angleDiff() {
    var d = Math.abs(((this.currentAngle - this.targetAngle) % 360 + 540) % 360 - 180);
    return d;
  }

  _updateAngleLabel() {
    if (!this.angleLbl) return;
    this.angleLbl.setText('rotation = ' + Math.round(this.currentAngle) + '\\u00b0');
  }

  _checkAlignment() {
    this._updateAngleLabel();
    if (this.solved) return;
    var diff = this._angleDiff();
    if (diff < 7) {
      // Snap and lock
      this.solved = true;
      this.currentAngle = this.targetAngle;
      this._drawPlayerShape();
      // Move handle to snap position
      var rad = (this.targetAngle - 90) * Math.PI/180;
      this.handle.x = this.cx + Math.cos(rad) * (this.shapeSize + 28);
      this.handle.y = this.cy + Math.sin(rad) * (this.shapeSize + 28);
      this.handle.setFillStyle(hexToNum(COL_ACCENT), 1);
      this._updateAngleLabel();
      this.cameras.main.flash(140, 34, 197, 94);
      heroCheer(this, this.hero);
      gameScore += 10 * (this.round + 1);
      this.scoreLbl.setText('Score: ' + gameScore);
      this.time.delayedCall(450, () => this._showSolutionCard());
    }
  }

  _showSolutionCard() {
    var W=this.W,H=this.H;
    var backdrop = this.add.rectangle(W/2,H/2,W,H,0x000000,0.55).setDepth(50);
    var card = this.add.rectangle(W/2,H*0.5,W-40,220,0x18181b,1).setStrokeStyle(2,hexToNum(COL_ACCENT)).setDepth(51);
    var h1 = this.add.text(W/2,H*0.5-75,'Aligned!',{fontSize:'22px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(52);
    var t1 = this.add.text(W/2,H*0.5-30,'You rotated the ' + SHAPE_PATHS[this.shapeIdx].name + ' until it matched the ghost.',{fontSize:'13px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",align:'center',wordWrap:{width:W-80}}).setOrigin(0.5).setDepth(52);
    var t2 = this.add.text(W/2,H*0.5+10,'rotation = ' + this.targetAngle + '\\u00b0',{fontSize:'22px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(52);
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
class TangramFillScene extends Phaser.Scene {
  constructor() { super('TangramFillScene'); }
  create() { this.W=this.scale.width;this.H=this.scale.height;this.round=0;this.lives=MAX_LIVES;this._bg();this._ui();this.startRound(); }
  _bg() { const bg=this.add.image(this.W/2,this.H/2,'bg');bg.setScale(Math.max(this.W/bg.width,this.H/bg.height));this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.65); }
  _ui() { this.scoreLbl=this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);this.hg=this.add.group();this._rh();this.dg=this.add.group();this._rd(); }
  _rh() { this.hg.clear(true,true);for(let i=0;i<this.lives;i++)this.hg.add(this.add.text(14+i*22,14,'\\u2665',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dg.clear(true,true);for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  startRound() {
    if(this.rg)this.rg.clear(true,true);this.rg=this.add.group();
    const data=getRound(this.round);this.target=data.target;this.pieces=data.items;this.currentTotal=0;this.selectedPieces=[];this._rd();
    const W=this.W,H=this.H;

    // Title
    this.rg.add(this.add.text(W/2,H*0.07,'Fill the Area!',{fontSize:'18px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6));

    // Target area display
    this.rg.add(this.add.text(W/2,H*0.16,'Target Area:',{fontSize:'13px',color:COL_TEXT,fontFamily:"'Lexend', system-ui"}).setOrigin(0.5).setDepth(6));
    this.rg.add(this.add.text(W/2,H*0.23,this.target+' sq',{fontSize:'36px',color:COL_DANGER,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6));

    // Visual fill bar
    this.fillBarBg=this.add.rectangle(W/2,H*0.32,W*0.6,20,hexToNum(COL_SECONDARY),0.2).setDepth(5);
    this.rg.add(this.fillBarBg);
    this.fillBar=this.add.rectangle(W/2-W*0.3,H*0.32,2,16,hexToNum(COL_PRIMARY),0.8).setOrigin(0,0.5).setDepth(6);
    this.rg.add(this.fillBar);
    // Target line on fill bar
    this.rg.add(this.add.rectangle(W/2-W*0.3+W*0.6,H*0.32,2,24,hexToNum(COL_DANGER),0.8).setOrigin(0.5).setDepth(7));

    // Current total label
    this.totalLbl=this.add.text(W/2,H*0.39,'Your total: 0 sq',{fontSize:'16px',color:COL_PRIMARY,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(6);
    this.rg.add(this.totalLbl);

    // Piece buttons — arranged in a grid
    var cols=Math.min(this.pieces.length,4);
    var rows=Math.ceil(this.pieces.length/cols);
    var btnW=60,btnH=50,gapX=10,gapY=8;
    var gridW=cols*btnW+(cols-1)*gapX;
    var startX=W/2-gridW/2+btnW/2;
    var startY=H*0.48;

    this.pieceBtns=[];
    for(var i=0;i<this.pieces.length;i++){
      var col=i%cols,row=Math.floor(i/cols);
      var px=startX+col*(btnW+gapX);
      var py=startY+row*(btnH+gapY);
      var val=this.pieces[i];
      (function(scene,idx,v,bx,by){
        var btn=scene.add.rectangle(bx,by,btnW-4,btnH-4,hexToNum(COL_SECONDARY),0.3).setInteractive({useHandCursor:true}).setDepth(7);
        scene.rg.add(btn);
        var txt=scene.add.text(bx,by-6,v+' sq',{fontSize:'14px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(8);
        scene.rg.add(txt);
        // Draw small squares to visualize size
        var sqSize=6,sqGap=2;
        var sqTotalW=v*(sqSize+sqGap)-sqGap;
        for(var s=0;s<v;s++){
          var sx=bx-sqTotalW/2+s*(sqSize+sqGap)+sqSize/2;
          var sq=scene.add.rectangle(sx,by+12,sqSize,sqSize,hexToNum(COL_ACCENT),0.5).setDepth(8);
          scene.rg.add(sq);
        }
        scene.pieceBtns.push({btn:btn,txt:txt,val:v,used:false,idx:idx});
        btn.on('pointerdown',function(){
          if(scene.pieceBtns[idx].used)return;
          scene.pieceBtns[idx].used=true;
          btn.setFillStyle(hexToNum(COL_PRIMARY),0.5);
          scene.currentTotal+=v;
          scene.selectedPieces.push(idx);
          scene._updateTotal();
        });
      })(this,i,val,px,py);
    }

    // Undo button
    var undoBtn=this.add.rectangle(W*0.3,H*0.85,100,38,hexToNum(COL_SECONDARY),0.3).setInteractive({useHandCursor:true}).setDepth(7);
    this.rg.add(undoBtn);this.rg.add(this.add.text(W*0.3,H*0.85,'Undo',{fontSize:'14px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(8));
    undoBtn.on('pointerdown',()=>{
      if(this.selectedPieces.length===0)return;
      var lastIdx=this.selectedPieces.pop();
      var pb=this.pieceBtns[lastIdx];
      pb.used=false;pb.btn.setFillStyle(hexToNum(COL_SECONDARY),0.3);
      this.currentTotal-=pb.val;
      this._updateTotal();
    });

    // Lock In button
    var lockBtn=this.add.rectangle(W*0.7,H*0.85,120,38,hexToNum(COL_PRIMARY),1).setInteractive({useHandCursor:true}).setDepth(10);
    this.rg.add(lockBtn);this.rg.add(this.add.text(W*0.7,H*0.85,'Lock In',{fontSize:'14px',color:'#fff',fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(11));
    lockBtn.on('pointerdown',()=>this._check());
  }

  _updateTotal() {
    this.totalLbl.setText('Your total: '+this.currentTotal+' sq');
    var pct=Math.min(this.currentTotal/this.target,1.2);
    this.fillBar.width=Math.max(2,pct*this.W*0.6);
    if(this.currentTotal===this.target){this.totalLbl.setColor(COL_ACCENT);this.fillBar.setFillStyle(hexToNum(COL_ACCENT),0.8);}
    else if(this.currentTotal>this.target){this.totalLbl.setColor(COL_DANGER);this.fillBar.setFillStyle(hexToNum(COL_DANGER),0.8);}
    else{this.totalLbl.setColor(COL_PRIMARY);this.fillBar.setFillStyle(hexToNum(COL_PRIMARY),0.8);}
  }

  _check() {
    if(this.currentTotal===this.target){
      gameScore+=10*(this.round+1);this.scoreLbl.setText('Score: '+gameScore);this.cameras.main.flash(200,34,197,94);
      this.round++;if(this.round>=TOTAL_ROUNDS)this.time.delayedCall(600,()=>this.scene.start('VictoryScene',{score:gameScore}));
      else this.time.delayedCall(800,()=>this.startRound());
    }else{this.lives--;this._rh();this.cameras.main.shake(200,0.01);
      if(this.lives<=0)this.time.delayedCall(500,()=>this.scene.start('LoseScene',{score:gameScore}));}
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MirrorPuzzleScene — INTRINSIC REBUILD
//
// Math: line of symmetry / reflection across a vertical axis.
// The mirror line is fixed at the centre. Original shape sits on the left.
// A translucent GHOST OVERLAY shows the correct reflected shape on the right
// (always visible — the answer is right there as a guide). Player drags a
// shape token from the bank to anywhere on the right; it snaps into the
// ghost when placed correctly. Self-revealing truth: the placement IS the
// reflection. No Check button. Auto-detect by distance to ghost centre.
// ═══════════════════════════════════════════════════════════════════════════════
class MirrorPuzzleScene extends Phaser.Scene {
  constructor() { super('MirrorPuzzleScene'); }
  create() {
    this.W=this.scale.width;this.H=this.scale.height;this.round=0;this.lives=MAX_LIVES;
    this._bg();this._ui();
    this.hero = addCharacter(this, this.W*0.88, this.H*0.55, 0.8);
    this.startRound();
  }
  _bg() { const bg=this.add.image(this.W/2,this.H/2,'bg');bg.setScale(Math.max(this.W/bg.width,this.H/bg.height));this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.7); }
  _ui() {
    this.scoreLbl=this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);
    this.add.text(this.W/2,16,(MATH && MATH.standardDescription) || 'Reflection symmetry',{fontSize:'11px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.55,align:'center',wordWrap:{width:this.W*0.6}}).setOrigin(0.5,0).setDepth(10);
    this.hg=this.add.group();this._rh();this.dg=this.add.group();this._rd();
  }
  _rh() { this.hg.clear(true,true);for(let i=0;i<this.lives;i++)this.hg.add(this.add.text(14+i*22,14,'\\u2665',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dg.clear(true,true);for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  startRound() {
    if(this.rg)this.rg.clear(true,true);this.rg=this.add.group();
    this.solved = false; this.placedX = null; this.placedY = null;
    var data = getRound(this.round);
    var fbVar = [
      { dx:-90, dy:-30, shape:0 },
      { dx:-130, dy:20, shape:1 },
      { dx:-70, dy:50, shape:2 },
      { dx:-110, dy:-40, shape:3 },
      { dx:-150, dy:0, shape:4 },
    ];
    var fb = fbVar[this.round % fbVar.length];
    this.dotOffsetX = (Array.isArray(data.items) && typeof data.items[0] === 'number' && data.items[0] < 0) ? data.items[0] : fb.dx;
    this.dotOffsetY = (Array.isArray(data.items) && typeof data.items[1] === 'number') ? data.items[1] : fb.dy;
    this.shapeIdx = (Array.isArray(data.items) && typeof data.items[2] === 'number' && data.items[2] >= 0 && data.items[2] < SHAPE_PATHS.length) ? data.items[2] : fb.shape;
    this._rd();

    var W=this.W,H=this.H;
    var mirrorX = W*0.45;
    var areaTop = H*0.18, areaBot = H*0.72;
    var areaCy = (areaTop + areaBot) / 2;
    this.mirrorX = mirrorX;

    // Title
    this.rg.add(this.add.text(W/2,52,'Place the mirror image',{fontSize:'18px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6));
    this.rg.add(this.add.text(W/2,78,'Drag the shape into the ghost on the other side of the mirror.',{fontSize:'12px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.7,align:'center',wordWrap:{width:W-60}}).setOrigin(0.5).setDepth(6));

    // Mirror line (dashed vertical)
    for (var ly = areaTop; ly < areaBot; ly += 12) {
      this.rg.add(this.add.rectangle(mirrorX, ly, 2, 8, hexToNum(COL_ACCENT), 0.65).setDepth(5));
    }
    this.rg.add(this.add.text(mirrorX, areaTop - 12, 'MIRROR', {fontSize:'10px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",alpha:0.7}).setOrigin(0.5).setDepth(5));

    // Light side backgrounds
    this.rg.add(this.add.rectangle(mirrorX - (mirrorX - 20)/2 - 10, areaCy, mirrorX - 20, areaBot - areaTop, hexToNum(COL_SECONDARY), 0.06).setDepth(3));
    var rightW = (W - mirrorX) - 20;
    this.rg.add(this.add.rectangle(mirrorX + rightW/2 + 10, areaCy, rightW, areaBot - areaTop, hexToNum(COL_PRIMARY), 0.04).setDepth(3));

    // Original on left
    var origX = mirrorX + this.dotOffsetX;
    var origY = areaCy + this.dotOffsetY;
    this.correctX = mirrorX - this.dotOffsetX;
    this.correctY = origY;
    var shapeSize = Math.min(W, H) * 0.06;
    this.shapeSize = shapeSize;

    var origPts = SHAPE_PATHS[this.shapeIdx].pts(origX, origY, shapeSize);
    drawShapePolyFilled(this, this.rg, origPts, COL_DANGER, 0.45, COL_DANGER, 2);

    // Ghost reflection — visible guide on the right
    // Build mirrored points (reflect each point across mirrorX)
    var ghostPts = origPts.map(function(p){ return { x: 2*mirrorX - p.x, y: p.y }; });
    var gg = this.add.graphics().setDepth(4);
    gg.fillStyle(hexToNum(COL_ACCENT), 0.10);
    gg.lineStyle(2, hexToNum(COL_ACCENT), 0.55);
    gg.beginPath(); gg.moveTo(ghostPts[0].x, ghostPts[0].y);
    for (var i = 1; i < ghostPts.length; i++) gg.lineTo(ghostPts[i].x, ghostPts[i].y);
    gg.closePath(); gg.fillPath(); gg.strokePath();
    this.rg.add(gg);

    // Distance indicator on left
    this.rg.add(this.add.text(origX, origY - shapeSize - 14, Math.abs(this.dotOffsetX) + 'px from mirror', {fontSize:'10px',color:COL_DANGER,fontFamily:"'Lexend', system-ui",alpha:0.7}).setOrigin(0.5).setDepth(6));

    // Draggable token in the bank below
    var tokenY = H * 0.86;
    var tokenX = W * 0.45;
    this.tokenStartX = tokenX; this.tokenStartY = tokenY;
    this.token = this.add.container(tokenX, tokenY).setDepth(9);
    var tg = this.add.graphics();
    var localPts = SHAPE_PATHS[this.shapeIdx].pts(0, 0, shapeSize);
    tg.fillStyle(hexToNum(COL_PRIMARY), 0.55);
    tg.lineStyle(2, hexToNum(COL_PRIMARY), 1);
    tg.beginPath(); tg.moveTo(localPts[0].x, localPts[0].y);
    for (var j = 1; j < localPts.length; j++) tg.lineTo(localPts[j].x, localPts[j].y);
    tg.closePath(); tg.fillPath(); tg.strokePath();
    this.token.add(tg);
    // Reflected token (same as ghost shape) — token visually shows the orientation
    this.token.setSize(shapeSize * 2, shapeSize * 2);
    this.token.setInteractive(new Phaser.Geom.Rectangle(-shapeSize, -shapeSize, shapeSize*2, shapeSize*2), Phaser.Geom.Rectangle.Contains);
    this.input.setDraggable(this.token);
    this.rg.add(this.token);

    // Drag handler
    var scene = this;
    this.input.removeAllListeners('drag');
    this.input.removeAllListeners('dragend');
    this.input.on('drag', function(pointer, obj, dragX, dragY){
      if (obj !== scene.token || scene.solved) return;
      obj.x = dragX; obj.y = dragY;
      scene._checkSnap();
    });
    this.input.on('dragend', function(pointer, obj){
      if (obj !== scene.token || scene.solved) return;
      // If not snapped (still active), return to start
      if (!scene.solved) {
        scene.tweens.add({ targets: scene.token, x: scene.tokenStartX, y: scene.tokenStartY, duration: 220, ease:'Sine.easeOut' });
      }
    });
  }

  _checkSnap() {
    if (this.solved) return;
    var dx = this.token.x - this.correctX;
    var dy = this.token.y - this.correctY;
    var dist = Math.sqrt(dx*dx + dy*dy);
    var tol = 26;
    if (dist <= tol) {
      this.solved = true;
      // Snap into ghost
      this.tweens.add({ targets: this.token, x: this.correctX, y: this.correctY, duration: 160, ease:'Sine.easeOut' });
      this.cameras.main.flash(140, 34, 197, 94);
      heroCheer(this, this.hero);
      gameScore += 10 * (this.round + 1);
      this.scoreLbl.setText('Score: ' + gameScore);
      this.time.delayedCall(450, () => this._showSolutionCard());
    }
  }

  _showSolutionCard() {
    var W=this.W,H=this.H;
    var backdrop = this.add.rectangle(W/2,H/2,W,H,0x000000,0.55).setDepth(50);
    var card = this.add.rectangle(W/2,H*0.5,W-40,220,0x18181b,1).setStrokeStyle(2,hexToNum(COL_ACCENT)).setDepth(51);
    var h1 = this.add.text(W/2,H*0.5-75,'Reflected!',{fontSize:'22px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(52);
    var dist = Math.abs(this.dotOffsetX);
    var t1 = this.add.text(W/2,H*0.5-30,'A reflection has the same distance from the mirror on both sides.',{fontSize:'13px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",align:'center',wordWrap:{width:W-80}}).setOrigin(0.5).setDepth(52);
    var t2 = this.add.text(W/2,H*0.5+10,dist + 'px left  =  ' + dist + 'px right',{fontSize:'18px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(52);
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
`
