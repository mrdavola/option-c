// Montessori Materials — Phaser engine with 6 game options.
// Math: Place value, fractions, skip counting, multiplication via Montessori manipulatives.
// Options: golden-beads, hundred-board, stamp-game, fraction-circles, bead-chain, checkerboard-multiply

import type { ThemeConfig, MathParams, GameOption } from "./engine-types"
import { phaserGame } from "./base-phaser-template"
import { getOptionDef } from "./game-option-registry"

export function montessoriPhaserEngine(
  config: ThemeConfig,
  math: MathParams,
  option: GameOption = "golden-beads"
): string {
  const validOptions = ["golden-beads", "hundred-board", "stamp-game", "fraction-circles", "bead-chain", "checkerboard-multiply"]
  const activeOption = validOptions.includes(option) ? option : "golden-beads"
  const optDef = getOptionDef(activeOption)
  const sceneMap: Record<string, string> = {
    "golden-beads": "GoldenBeadsScene",
    "hundred-board": "HundredBoardScene",
    "stamp-game": "StampGameScene",
    "fraction-circles": "FractionCirclesScene",
    "bead-chain": "BeadChainScene",
    "checkerboard-multiply": "CheckerboardMultiplyScene",
  }
  return phaserGame({
    config, math, option: activeOption,
    sceneName: sceneMap[activeOption],
    introText: optDef?.introText || "Explore math with Montessori materials!",
    helpText: optDef?.helpText || "Use hands-on manipulatives to solve math problems.",
    gameSceneCode: GAME_SCENES,
  })
}

const GAME_SCENES = `
// ═══════════════════════════════════════════════════════════════════════════════
// GoldenBeadsScene — INTRINSIC REBUILD (April 13 night)
// Teaches: place value composition (hundreds, tens, ones) — CCSS 2.NBT.A.1
// Discovery: dragging a hundred-square, ten-bar, or unit into its column makes
//   the digital readout tick up by 100, 10, or 1 — the learner SEES that a
//   ten-bar IS ten ones because the readout jumps by 10. The target is reached
//   only when the composition is physically correct.
// Self-revealing truth: the digital number at the bottom is a direct mirror of
//   what's on the mat. When it matches the target, the round auto-completes.
//   No "Check" — the math is visible in the arrangement itself.
// ═══════════════════════════════════════════════════════════════════════════════
class GoldenBeadsScene extends Phaser.Scene {
  constructor() { super('GoldenBeadsScene'); }
  create() { this.W=this.scale.width;this.H=this.scale.height;this.round=0;this.lives=MAX_LIVES;this._bg();this._ui();this.hero=addCharacter(this,this.W*0.88,this.H*0.55,0.8);this.startRound(); }
  _bg() { const bg=this.add.image(this.W/2,this.H/2,'bg');bg.setScale(Math.max(this.W/bg.width,this.H/bg.height));this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.7); }
  _ui() { this.scoreLbl=this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);this.hg=this.add.group();this._rh();this.dg=this.add.group();this._rd(); }
  _rh() { this.hg.clear(true,true);for(let i=0;i<this.lives;i++)this.hg.add(this.add.text(14+i*22,14,'♥',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dg.clear(true,true);for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  startRound() {
    if(this.rg){this.rg.destroy(true);}this.rg=this.add.group();
    const data=getRound(this.round);
    // roundVariation fallback — intrinsic, no AI dependency required
    const roundVariation=[
      {target:23},
      {target:47},
      {target:152},
      {target:308},
      {target:426},
    ];
    const isDefault=!data||data.prompt==='Solve this!'||!data.target||data.target<10;
    const fallback=roundVariation[this.round%roundVariation.length];
    this.target=isDefault?fallback.target:data.target;
    if(this.target>999)this.target=this.target%1000;
    this._rd();
    const W=this.W,H=this.H;

    // Top: operation / target number
    this.rg.add(this.add.text(W/2,H*0.06,'Build this number with beads',{fontSize:'14px',color:COL_TEXT,fontFamily:"'Lexend', system-ui"}).setOrigin(0.5).setDepth(6));
    this.rg.add(this.add.text(W/2,H*0.11,String(this.target),{fontSize:'30px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6));

    // State: how many pieces dropped per column
    this.columnCounts={H:0,T:0,O:0};
    this.placedPieces=[]; // {sprite, val}

    // Place-value columns (drop zones)
    const colY=H*0.22,colH=H*0.38,colW=W*0.18;
    const colXH=W*0.12,colXT=W*0.32,colXO=W*0.52;
    const mkCol=(x,label,key,tint)=>{
      const rect=this.add.rectangle(x+colW/2,colY+colH/2,colW,colH,hexToNum(tint),0.08).setStrokeStyle(2,hexToNum(tint),0.6).setDepth(4);
      this.rg.add(rect);
      this.rg.add(this.add.text(x+colW/2,colY+12,label,{fontSize:'13px',color:tint,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(5));
      return {x,y:colY,w:colW,h:colH,key,tint};
    };
    this.columns={
      H:mkCol(colXH,'Hundreds','H','#ef4444'),
      T:mkCol(colXT,'Tens','T','#3b82f6'),
      O:mkCol(colXO,'Ones','O','#22c55e'),
    };

    // Bead tray (source) on the right
    const trayX=W*0.72,trayY=H*0.22,trayW=W*0.24,trayH=H*0.38;
    this.rg.add(this.add.rectangle(trayX+trayW/2,trayY+trayH/2,trayW,trayH,hexToNum(COL_SECONDARY),0.08).setStrokeStyle(1,hexToNum(COL_TEXT),0.3).setDepth(3));
    this.rg.add(this.add.text(trayX+trayW/2,trayY+10,'Bead Tray',{fontSize:'11px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.6}).setOrigin(0.5).setDepth(4));

    // Spawn one reusable "source" of each piece type. Dragging CLONES.
    // Hundred-square source
    this._makeSource(trayX+trayW*0.25,trayY+trayH*0.35,'H',100,'#ef4444');
    // Ten-bar source
    this._makeSource(trayX+trayW*0.55,trayY+trayH*0.35,'T',10,'#3b82f6');
    // Unit-bead source
    this._makeSource(trayX+trayW*0.85,trayY+trayH*0.35,'O',1,'#22c55e');

    this.rg.add(this.add.text(trayX+trayW*0.25,trayY+trayH*0.65,'100',{fontSize:'10px',color:'#ef4444',fontFamily:"'Lexend', system-ui"}).setOrigin(0.5).setDepth(4));
    this.rg.add(this.add.text(trayX+trayW*0.55,trayY+trayH*0.65,'10',{fontSize:'10px',color:'#3b82f6',fontFamily:"'Lexend', system-ui"}).setOrigin(0.5).setDepth(4));
    this.rg.add(this.add.text(trayX+trayW*0.85,trayY+trayH*0.65,'1',{fontSize:'10px',color:'#22c55e',fontFamily:"'Lexend', system-ui"}).setOrigin(0.5).setDepth(4));

    // Undo button (return last piece)
    const undoBtn=this.add.rectangle(W*0.85,H*0.66,100,30,hexToNum(COL_DANGER),0.55).setInteractive({useHandCursor:true}).setDepth(10);
    this.rg.add(undoBtn);
    this.rg.add(this.add.text(W*0.85,H*0.66,'Undo',{fontSize:'12px',color:'#fff',fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(11));
    undoBtn.on('pointerdown',()=>this._undo());

    // Digital readout (auto-forms from columns)
    this.rg.add(this.add.text(W/2,H*0.7,'Your number:',{fontSize:'12px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.6}).setOrigin(0.5).setDepth(6));
    this.readoutLbl=this.add.text(W/2,H*0.76,'0',{fontSize:'34px',color:COL_PRIMARY,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6);
    this.rg.add(this.readoutLbl);

    this.breakdownLbl=this.add.text(W/2,H*0.82,'',{fontSize:'12px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.6}).setOrigin(0.5).setDepth(6);
    this.rg.add(this.breakdownLbl);
    this._updateReadout();
  }

  _makeSource(x,y,key,val,tint) {
    const color=hexToNum(tint);
    const src=this._drawPiece(x,y,val,color);
    src.setInteractive({draggable:true,useHandCursor:true});
    this.input.setDraggable(src);
    this.rg.add(src);
    let ghost=null;
    src.on('dragstart',()=>{
      ghost=this._drawPiece(x,y,val,color).setAlpha(0.85).setDepth(20);
      this.rg.add(ghost);
    });
    src.on('drag',(_p,dx,dy)=>{
      if(ghost){ghost.x=dx;ghost.y=dy;}
    });
    src.on('dragend',(p)=>{
      if(!ghost)return;
      const zone=this._zoneAt(ghost.x,ghost.y);
      if(zone===key){
        // Correct column — stick the piece where dropped (inside column)
        const col=this.columns[key];
        const n=this.columnCounts[key];
        // Grid positions within column
        const px=col.x+12+(n%3)*((col.w-24)/3);
        const py=col.y+40+Math.floor(n/3)*22;
        ghost.x=px;ghost.y=py;ghost.setAlpha(1);
        this.placedPieces.push({sprite:ghost,val,key});
        this.columnCounts[key]++;
        this._updateReadout();
        this._checkSolved();
        ghost=null;
      }else{
        // Wrong column or nowhere — flash + return
        this.cameras.main.shake(80,0.003);
        if(ghost){ghost.destroy();ghost=null;}
      }
    });
  }

  _drawPiece(x,y,val,color) {
    if(val===100){
      const c=this.add.container(x,y);
      const bg=this.add.rectangle(0,0,40,40,color,0.75).setStrokeStyle(1,0xffffff,0.4);
      c.add(bg);
      for(let r=0;r<3;r++)for(let k=0;k<3;k++){
        c.add(this.add.circle(-12+k*12,-12+r*12,2.5,0xffffff,0.6));
      }
      c.setSize(40,40);
      return c;
    }
    if(val===10){
      const c=this.add.container(x,y);
      const bg=this.add.rectangle(0,0,14,46,color,0.8).setStrokeStyle(1,0xffffff,0.4);
      c.add(bg);
      for(let i=0;i<5;i++)c.add(this.add.circle(0,-18+i*9,2.5,0xffffff,0.7));
      c.setSize(14,46);
      return c;
    }
    const c=this.add.container(x,y);
    c.add(this.add.circle(0,0,9,color,0.85).setStrokeStyle(1,0xffffff,0.4));
    c.setSize(18,18);
    return c;
  }

  _zoneAt(x,y) {
    for(const k of ['H','T','O']){
      const c=this.columns[k];
      if(x>=c.x&&x<=c.x+c.w&&y>=c.y&&y<=c.y+c.h)return k;
    }
    return null;
  }

  _undo() {
    if(this.solved)return;
    const last=this.placedPieces.pop();
    if(!last)return;
    this.columnCounts[last.key]--;
    last.sprite.destroy();
    this._updateReadout();
  }

  _updateReadout() {
    const n=this.columnCounts.H*100+this.columnCounts.T*10+this.columnCounts.O;
    this.readoutLbl.setText(String(n));
    const parts=[];
    if(this.columnCounts.H)parts.push(this.columnCounts.H+' hundred'+(this.columnCounts.H>1?'s':''));
    if(this.columnCounts.T)parts.push(this.columnCounts.T+' ten'+(this.columnCounts.T>1?'s':''));
    if(this.columnCounts.O)parts.push(this.columnCounts.O+' one'+(this.columnCounts.O>1?'s':''));
    this.breakdownLbl.setText(parts.join(' + '));
    this.readoutLbl.setColor(n===this.target?COL_ACCENT:COL_PRIMARY);
  }

  _checkSolved() {
    const n=this.columnCounts.H*100+this.columnCounts.T*10+this.columnCounts.O;
    // Correct composition means correct column placements (no spillover between columns).
    // Because the ONLY way to get H*100+T*10+O==target is via target's actual digit composition
    // when each column holds 0-9 items, require each column 0-9.
    if(n===this.target&&this.columnCounts.H<=9&&this.columnCounts.T<=9&&this.columnCounts.O<=9){
      this.solved=true;
      gameScore+=10*(this.round+1);this.scoreLbl.setText('Score: '+gameScore);
      this.cameras.main.flash(140,34,197,94);heroCheer(this,this.hero);
      this._showSolutionCard();
    }
  }

  _showSolutionCard() {
    const W=this.W,H=this.H;
    const backdrop=this.add.rectangle(W/2,H/2,W,H,0x000000,0.6).setDepth(50);
    const card=this.add.rectangle(W/2,H*0.5,W-60,220,0x18181b,1).setStrokeStyle(2,hexToNum(COL_ACCENT)).setDepth(51);
    const h1=this.add.text(W/2,H*0.5-85,'Got it!',{fontSize:'22px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(52);
    const h=this.columnCounts.H,t=this.columnCounts.T,o=this.columnCounts.O;
    const parts=[];
    if(h)parts.push(h+'×100');
    if(t)parts.push(t+'×10');
    if(o)parts.push(o+'×1');
    const l1=this.add.text(W/2,H*0.5-40,parts.join(' + ')+' = '+this.target,{fontSize:'18px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif"}).setOrigin(0.5).setDepth(52);
    const l2=this.add.text(W/2,H*0.5-10,'Each column holds one place value.',{fontSize:'12px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.7}).setOrigin(0.5).setDepth(52);
    const nextY=H*0.5+60;
    const nextBg=this.add.rectangle(W/2,nextY,220,42,hexToNum(COL_ACCENT),1).setInteractive({useHandCursor:true}).setDepth(52);
    const nextLbl=this.add.text(W/2,nextY,this.round+1>=TOTAL_ROUNDS?'Finish!':'Next round →',{fontSize:'14px',color:'#000',fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(53);
    nextBg.on('pointerdown',()=>{
      [backdrop,card,h1,l1,l2,nextBg,nextLbl].forEach(o=>o.destroy());
      this.solved=false;
      this.round++;
      if(this.round>=TOTAL_ROUNDS)this.scene.start('VictoryScene',{score:gameScore});
      else this.startRound();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
class HundredBoardScene extends Phaser.Scene {
  constructor() { super('HundredBoardScene'); }
  create() { this.W=this.scale.width;this.H=this.scale.height;this.round=0;this.lives=MAX_LIVES;this._bg();this._ui();this.hero=addCharacter(this,this.W*0.88,this.H*0.85,0.45);this.startRound(); }
  _bg() { const bg=this.add.image(this.W/2,this.H/2,'bg');bg.setScale(Math.max(this.W/bg.width,this.H/bg.height));this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.65); }
  _ui() { this.scoreLbl=this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);this.hg=this.add.group();this._rh();this.dg=this.add.group();this._rd(); }
  _rh() { this.hg.clear(true,true);for(let i=0;i<this.lives;i++)this.hg.add(this.add.text(14+i*22,14,'♥',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dg.clear(true,true);for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  startRound() {
    if(this.rg)this.rg.clear(true,true);this.rg=this.add.group();
    const data=getRound(this.round);this.target=data.target;this._rd();
    const W=this.W,H=this.H;

    // Target number to place
    const targetNum=this.target;

    // Prompt
    this.rg.add(this.add.text(W/2,H*0.06,data.prompt,{fontSize:'18px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold',wordWrap:{width:W-40}}).setOrigin(0.5).setDepth(6));

    // Number to place shown prominently
    this.rg.add(this.add.text(W/2,H*0.13,'Place: '+targetNum,{fontSize:'22px',color:COL_PRIMARY,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6));

    // 10x10 grid
    const gridSize=Math.min((W-40)/10,(H-H*0.22-40)/10);
    const gridX=(W-gridSize*10)/2;
    const gridY=H*0.2;

    // Progressive guides: show some numbers already placed (more in early rounds)
    const guidesCount=this.round<2?15:this.round<4?8:3;
    const guideNums=new Set();
    while(guideNums.size<guidesCount){
      const n=Math.floor(Math.random()*100)+1;
      if(n!==targetNum)guideNums.add(n);
    }

    for(let r=0;r<10;r++){for(let c=0;c<10;c++){
      const num=r*10+c+1;
      const cx=gridX+c*gridSize+gridSize/2;
      const cy=gridY+r*gridSize+gridSize/2;
      const cell=this.add.rectangle(cx,cy,gridSize-2,gridSize-2,hexToNum(COL_SECONDARY),0.12).setStrokeStyle(1,hexToNum(COL_TEXT),0.2).setInteractive({useHandCursor:true}).setDepth(5);
      this.rg.add(cell);

      // Show guide numbers
      if(guideNums.has(num)){
        this.rg.add(this.add.text(cx,cy,String(num),{fontSize:Math.max(9,gridSize*0.4)+'px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.4}).setOrigin(0.5).setDepth(6));
      }

      cell.on('pointerdown',()=>{
        if(num===targetNum){
          // Correct cell
          this.add.text(cx,cy,String(num),{fontSize:Math.max(10,gridSize*0.45)+'px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(7);
          cell.setFillStyle(hexToNum(COL_ACCENT),0.3);
          gameScore+=10*(this.round+1);this.scoreLbl.setText('Score: '+gameScore);this.cameras.main.flash(200,34,197,94);heroCheer(this,this.hero);
          this.round++;if(this.round>=TOTAL_ROUNDS)this.time.delayedCall(600,()=>this.scene.start('VictoryScene',{score:gameScore}));
          else this.time.delayedCall(800,()=>this.startRound());
        }else{
          // Wrong cell
          cell.setFillStyle(hexToNum(COL_DANGER),0.3);
          this.time.delayedCall(300,()=>cell.setFillStyle(hexToNum(COL_SECONDARY),0.12));
          this.lives--;this._rh();this.cameras.main.shake(200,0.01);heroShake(this,this.hero);
          if(this.lives<=0)this.time.delayedCall(500,()=>this.scene.start('LoseScene',{score:gameScore}));
        }
      });
    }}
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// StampGameScene — INTRINSIC REBUILD (April 13 night)
// Teaches: expanded form & 4-digit place value — CCSS 3.NBT.A.1 / 4.NBT.A.2
// Discovery: the stamp the learner drops into the "Hundreds" region adds 100
//   to the readout — the learner sees, not tells, that a red "100" stamp IS
//   one hundred ones. Wrong-column drops bounce back: the mat itself enforces
//   the place-value rule.
// Self-revealing truth: the digital readout is a live sum of the mat.
//   Target match auto-completes the round; no "Check" is needed.
// ═══════════════════════════════════════════════════════════════════════════════
class StampGameScene extends Phaser.Scene {
  constructor() { super('StampGameScene'); }
  create() { this.W=this.scale.width;this.H=this.scale.height;this.round=0;this.lives=MAX_LIVES;this._bg();this._ui();this.hero=addCharacter(this,this.W*0.88,this.H*0.55,0.8);this.startRound(); }
  _bg() { const bg=this.add.image(this.W/2,this.H/2,'bg');bg.setScale(Math.max(this.W/bg.width,this.H/bg.height));this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.7); }
  _ui() { this.scoreLbl=this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);this.hg=this.add.group();this._rh();this.dg=this.add.group();this._rd(); }
  _rh() { this.hg.clear(true,true);for(let i=0;i<this.lives;i++)this.hg.add(this.add.text(14+i*22,14,'♥',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dg.clear(true,true);for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  startRound() {
    if(this.rg){this.rg.destroy(true);}this.rg=this.add.group();
    const data=getRound(this.round);
    const roundVariation=[
      {target:132},
      {target:1205},
      {target:2340},
      {target:3452},
      {target:5678},
    ];
    const isDefault=!data||data.prompt==='Solve this!'||!data.target||data.target<10;
    const fallback=roundVariation[this.round%roundVariation.length];
    this.target=isDefault?fallback.target:data.target;
    if(this.target>9999)this.target=this.target%10000;
    this._rd();
    const W=this.W,H=this.H;

    // Top: operation + target
    this.rg.add(this.add.text(W/2,H*0.06,'Build this number with place-value stamps',{fontSize:'13px',color:COL_TEXT,fontFamily:"'Lexend', system-ui"}).setOrigin(0.5).setDepth(6));
    this.rg.add(this.add.text(W/2,H*0.11,String(this.target),{fontSize:'30px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6));

    // Place value mat — 4 labeled regions
    this.stampCounts={1000:0,100:0,10:0,1:0};
    this.placed=[]; // {sprite, val}

    const matY=H*0.19,matH=H*0.34;
    const matX=W*0.05,matW=W*0.6;
    const regionW=matW/4;
    const tints={1000:'#22c55e',100:'#ef4444',10:'#3b82f6',1:'#fbbf24'};
    const labels={1000:'Thousands',100:'Hundreds',10:'Tens',1:'Ones'};
    const valsOrder=[1000,100,10,1];
    this.regions={};
    valsOrder.forEach((v,i)=>{
      const x=matX+i*regionW;
      const rect=this.add.rectangle(x+regionW/2,matY+matH/2,regionW-4,matH,hexToNum(tints[v]),0.08).setStrokeStyle(2,hexToNum(tints[v]),0.6).setDepth(4);
      this.rg.add(rect);
      this.rg.add(this.add.text(x+regionW/2,matY+14,labels[v],{fontSize:'12px',color:tints[v],fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(5));
      this.rg.add(this.add.text(x+regionW/2,matY+30,String(v),{fontSize:'10px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.6}).setOrigin(0.5).setDepth(5));
      this.regions[v]={x,y:matY,w:regionW,h:matH,val:v};
    });

    // Stamp tray (source)
    const trayX=W*0.68,trayW=W*0.28;
    this.rg.add(this.add.rectangle(trayX+trayW/2,matY+matH/2,trayW,matH,hexToNum(COL_SECONDARY),0.08).setStrokeStyle(1,hexToNum(COL_TEXT),0.3).setDepth(3));
    this.rg.add(this.add.text(trayX+trayW/2,matY+12,'Stamp Tray',{fontSize:'11px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.6}).setOrigin(0.5).setDepth(4));
    valsOrder.forEach((v,i)=>{
      const sx=trayX+trayW*0.15+(i%4)*(trayW*0.22);
      const sy=matY+matH*0.55;
      this._makeStampSource(sx,sy,v,tints[v]);
    });

    // Undo
    const undoBtn=this.add.rectangle(W*0.82,H*0.58,100,30,hexToNum(COL_DANGER),0.55).setInteractive({useHandCursor:true}).setDepth(10);
    this.rg.add(undoBtn);
    this.rg.add(this.add.text(W*0.82,H*0.58,'Undo',{fontSize:'12px',color:'#fff',fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(11));
    undoBtn.on('pointerdown',()=>this._undo());

    // Digital readout
    this.rg.add(this.add.text(W/2,H*0.68,'Your number:',{fontSize:'12px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.6}).setOrigin(0.5).setDepth(6));
    this.readoutLbl=this.add.text(W/2,H*0.75,'0',{fontSize:'34px',color:COL_PRIMARY,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6);
    this.rg.add(this.readoutLbl);
    this.breakdownLbl=this.add.text(W/2,H*0.82,'',{fontSize:'12px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.6}).setOrigin(0.5).setDepth(6);
    this.rg.add(this.breakdownLbl);
    this._updateReadout();
  }

  _makeStampSource(x,y,val,tint) {
    const color=hexToNum(tint);
    const src=this._drawStamp(x,y,val,color);
    src.setInteractive({draggable:true,useHandCursor:true});
    this.input.setDraggable(src);
    this.rg.add(src);
    let ghost=null;
    src.on('dragstart',()=>{ghost=this._drawStamp(x,y,val,color).setAlpha(0.85).setDepth(20);this.rg.add(ghost);});
    src.on('drag',(_p,dx,dy)=>{if(ghost){ghost.x=dx;ghost.y=dy;}});
    src.on('dragend',()=>{
      if(!ghost)return;
      const region=this._regionAt(ghost.x,ghost.y);
      if(region===val){
        const n=this.stampCounts[val];
        const r=this.regions[val];
        ghost.x=r.x+12+(n%3)*((r.w-24)/3);
        ghost.y=r.y+48+Math.floor(n/3)*18;
        ghost.setAlpha(1);
        this.placed.push({sprite:ghost,val});
        this.stampCounts[val]++;
        this._updateReadout();
        this._checkSolved();
        ghost=null;
      }else{
        this.cameras.main.shake(80,0.003);
        ghost.destroy();ghost=null;
      }
    });
  }

  _drawStamp(x,y,val,color) {
    const c=this.add.container(x,y);
    c.add(this.add.rectangle(0,0,36,24,color,0.85).setStrokeStyle(1,0xffffff,0.5));
    c.add(this.add.text(0,0,String(val),{fontSize:'12px',color:'#fff',fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5));
    c.setSize(36,24);
    return c;
  }

  _regionAt(x,y) {
    for(const k of [1000,100,10,1]){
      const r=this.regions[k];
      if(x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h)return k;
    }
    return null;
  }

  _undo() {
    if(this.solved)return;
    const last=this.placed.pop();
    if(!last)return;
    this.stampCounts[last.val]--;
    last.sprite.destroy();
    this._updateReadout();
  }

  _updateReadout() {
    const total=this.stampCounts[1000]*1000+this.stampCounts[100]*100+this.stampCounts[10]*10+this.stampCounts[1];
    this.readoutLbl.setText(String(total));
    const parts=[];
    if(this.stampCounts[1000])parts.push(this.stampCounts[1000]+' thousand'+(this.stampCounts[1000]>1?'s':''));
    if(this.stampCounts[100])parts.push(this.stampCounts[100]+' hundred'+(this.stampCounts[100]>1?'s':''));
    if(this.stampCounts[10])parts.push(this.stampCounts[10]+' ten'+(this.stampCounts[10]>1?'s':''));
    if(this.stampCounts[1])parts.push(this.stampCounts[1]+' one'+(this.stampCounts[1]>1?'s':''));
    this.breakdownLbl.setText(parts.join(' + '));
    this.readoutLbl.setColor(total===this.target?COL_ACCENT:COL_PRIMARY);
  }

  _checkSolved() {
    const total=this.stampCounts[1000]*1000+this.stampCounts[100]*100+this.stampCounts[10]*10+this.stampCounts[1];
    if(total===this.target&&this.stampCounts[1000]<=9&&this.stampCounts[100]<=9&&this.stampCounts[10]<=9&&this.stampCounts[1]<=9){
      this.solved=true;
      gameScore+=10*(this.round+1);this.scoreLbl.setText('Score: '+gameScore);
      this.cameras.main.flash(140,34,197,94);heroCheer(this,this.hero);
      this._showSolutionCard();
    }
  }

  _showSolutionCard() {
    const W=this.W,H=this.H;
    const backdrop=this.add.rectangle(W/2,H/2,W,H,0x000000,0.6).setDepth(50);
    const card=this.add.rectangle(W/2,H*0.5,W-60,220,0x18181b,1).setStrokeStyle(2,hexToNum(COL_ACCENT)).setDepth(51);
    const h1=this.add.text(W/2,H*0.5-85,'Got it!',{fontSize:'22px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(52);
    const th=this.stampCounts[1000],h=this.stampCounts[100],t=this.stampCounts[10],o=this.stampCounts[1];
    const parts=[];
    if(th)parts.push(th+' thousand'+(th>1?'s':''));
    if(h)parts.push(h+' hundred'+(h>1?'s':''));
    if(t)parts.push(t+' ten'+(t>1?'s':''));
    if(o)parts.push(o+' one'+(o>1?'s':''));
    const l1=this.add.text(W/2,H*0.5-40,parts.join(' + ')+' = '+this.target,{fontSize:'16px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif",wordWrap:{width:W-100}}).setOrigin(0.5).setDepth(52);
    const l2=this.add.text(W/2,H*0.5-5,'Each place is 10× bigger than the one to its right.',{fontSize:'12px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.7}).setOrigin(0.5).setDepth(52);
    const nextY=H*0.5+60;
    const nextBg=this.add.rectangle(W/2,nextY,220,42,hexToNum(COL_ACCENT),1).setInteractive({useHandCursor:true}).setDepth(52);
    const nextLbl=this.add.text(W/2,nextY,this.round+1>=TOTAL_ROUNDS?'Finish!':'Next round →',{fontSize:'14px',color:'#000',fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(53);
    nextBg.on('pointerdown',()=>{
      [backdrop,card,h1,l1,l2,nextBg,nextLbl].forEach(o=>o.destroy());
      this.solved=false;
      this.round++;
      if(this.round>=TOTAL_ROUNDS)this.scene.start('VictoryScene',{score:gameScore});
      else this.startRound();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
class FractionCirclesScene extends Phaser.Scene {
  constructor() { super('FractionCirclesScene'); }
  create() { this.W=this.scale.width;this.H=this.scale.height;this.round=0;this.lives=MAX_LIVES;this._bg();this._ui();this.hero=addCharacter(this,this.W*0.88,this.H*0.85,0.45);this.startRound(); }
  _bg() { const bg=this.add.image(this.W/2,this.H/2,'bg');bg.setScale(Math.max(this.W/bg.width,this.H/bg.height));this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.65); }
  _ui() { this.scoreLbl=this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);this.hg=this.add.group();this._rh();this.dg=this.add.group();this._rd(); }
  _rh() { this.hg.clear(true,true);for(let i=0;i<this.lives;i++)this.hg.add(this.add.text(14+i*22,14,'♥',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dg.clear(true,true);for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  startRound() {
    if(this.rg)this.rg.clear(true,true);this.rg=this.add.group();
    const data=getRound(this.round);this._rd();
    const W=this.W,H=this.H;

    // Extract numerator/denominator from target and items
    // target = numerator, items[0] = denominator (convention)
    this.numerator=data.target;
    this.denominator=(data.items&&data.items[0])?data.items[0]:4;
    if(this.numerator>this.denominator)this.numerator=this.denominator;
    this.coloredCount=0;

    // Prompt
    this.rg.add(this.add.text(W/2,H*0.07,data.prompt,{fontSize:'18px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold',wordWrap:{width:W-40}}).setOrigin(0.5).setDepth(6));

    // Circle with wedges
    const cx=W/2,cy=H*0.42,radius=Math.min(W,H)*0.22;
    const N=this.denominator;
    this.wedges=[];

    // Draw circle outline
    this.rg.add(this.add.circle(cx,cy,radius+2,hexToNum(COL_TEXT),0.2).setDepth(4));

    for(let i=0;i<N;i++){
      const startAngle=(Math.PI*2/N)*i-Math.PI/2;
      const endAngle=(Math.PI*2/N)*(i+1)-Math.PI/2;
      const midAngle=(startAngle+endAngle)/2;

      // Draw wedge as a triangle approximation using graphics
      const g=this.add.graphics().setDepth(5);
      g.fillStyle(hexToNum(COL_SECONDARY),0.2);
      g.beginPath();
      g.moveTo(cx,cy);
      // Arc approximation with line segments
      const steps=12;
      for(let s=0;s<=steps;s++){
        const a=startAngle+(endAngle-startAngle)*(s/steps);
        g.lineTo(cx+Math.cos(a)*radius,cy+Math.sin(a)*radius);
      }
      g.closePath();
      g.fillPath();
      // Outline
      g.lineStyle(2,hexToNum(COL_TEXT),0.4);
      g.beginPath();
      g.moveTo(cx,cy);
      g.lineTo(cx+Math.cos(startAngle)*radius,cy+Math.sin(startAngle)*radius);
      for(let s=0;s<=steps;s++){
        const a=startAngle+(endAngle-startAngle)*(s/steps);
        g.lineTo(cx+Math.cos(a)*radius,cy+Math.sin(a)*radius);
      }
      g.closePath();
      g.strokePath();
      this.rg.add(g);

      // Invisible hit zone for the wedge
      const hitX=cx+Math.cos(midAngle)*radius*0.5;
      const hitY=cy+Math.sin(midAngle)*radius*0.5;
      const hitR=radius*0.3;
      const hitZone=this.add.circle(hitX,hitY,hitR,0xffffff,0.001).setInteractive({useHandCursor:true}).setDepth(7);
      this.rg.add(hitZone);

      const wedge={graphics:g,colored:false,index:i,startAngle,endAngle,hitZone};
      this.wedges.push(wedge);

      hitZone.on('pointerdown',()=>{
        if(!wedge.colored){
          wedge.colored=true;
          this.coloredCount++;
          // Redraw as colored
          g.clear();
          g.fillStyle(hexToNum(COL_ACCENT),0.7);
          g.beginPath();g.moveTo(cx,cy);
          for(let s=0;s<=steps;s++){
            const a=startAngle+(endAngle-startAngle)*(s/steps);
            g.lineTo(cx+Math.cos(a)*radius,cy+Math.sin(a)*radius);
          }
          g.closePath();g.fillPath();
          g.lineStyle(2,hexToNum(COL_TEXT),0.5);
          g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(startAngle)*radius,cy+Math.sin(startAngle)*radius);
          for(let s=0;s<=steps;s++){
            const a=startAngle+(endAngle-startAngle)*(s/steps);
            g.lineTo(cx+Math.cos(a)*radius,cy+Math.sin(a)*radius);
          }
          g.closePath();g.strokePath();
          this._updateFractionLabel();
        }else{
          wedge.colored=false;
          this.coloredCount--;
          g.clear();
          g.fillStyle(hexToNum(COL_SECONDARY),0.2);
          g.beginPath();g.moveTo(cx,cy);
          for(let s=0;s<=steps;s++){
            const a=startAngle+(endAngle-startAngle)*(s/steps);
            g.lineTo(cx+Math.cos(a)*radius,cy+Math.sin(a)*radius);
          }
          g.closePath();g.fillPath();
          g.lineStyle(2,hexToNum(COL_TEXT),0.4);
          g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(startAngle)*radius,cy+Math.sin(startAngle)*radius);
          for(let s=0;s<=steps;s++){
            const a=startAngle+(endAngle-startAngle)*(s/steps);
            g.lineTo(cx+Math.cos(a)*radius,cy+Math.sin(a)*radius);
          }
          g.closePath();g.strokePath();
          this._updateFractionLabel();
        }
      });
    }

    // Fraction label — auto-updates as wedges are shaded
    this.fractionLbl=this.add.text(W/2,H*0.72,'0/'+this.denominator,{fontSize:'28px',color:COL_PRIMARY,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6);
    this.rg.add(this.fractionLbl);
    // Target label — what to make (e.g. "Make 3/4")
    this.targetLbl=this.add.text(W/2,H*0.78,'Make '+this.numerator+'/'+this.denominator,{fontSize:'14px',color:COL_TEXT,fontFamily:"'Lexend', system-ui"}).setOrigin(0.5).setDepth(6);
    this.rg.add(this.targetLbl);
  }

  _updateFractionLabel() {
    this.fractionLbl.setText(this.coloredCount+'/'+this.denominator);
    // Auto-detect success: when shaded count matches target, the circle IS the fraction
    if(this.coloredCount===this.numerator){
      gameScore+=10*(this.round+1);this.scoreLbl.setText('Score: '+gameScore);
      this.cameras.main.flash(150,34,197,94);heroCheer(this,this.hero);
      this.round++;
      if(this.round>=TOTAL_ROUNDS) this.time.delayedCall(900,()=>this.scene.start('VictoryScene',{score:gameScore}));
      else this.time.delayedCall(900,()=>this.startRound());
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BeadChainScene — INTRINSIC REBUILD (April 13 night)
// Teaches: skip counting & multiplication as repeated groups — CCSS 3.OA.A.1
// Discovery: the chain is physically grouped into colored segments of N beads.
//   As the learner drags the marker, the live readout shows "3 × 7 = 21" —
//   the learner sees that the "answer" is literally the count of beads the
//   marker has passed. Target M × N = product is aligned with the Mth segment
//   boundary — NOT a number to memorize.
// Self-revealing truth: when the marker snaps to the target segment, the chain
//   visually reads as a product. No typing.
// ═══════════════════════════════════════════════════════════════════════════════
class BeadChainScene extends Phaser.Scene {
  constructor() { super('BeadChainScene'); }
  create() { this.W=this.scale.width;this.H=this.scale.height;this.round=0;this.lives=MAX_LIVES;this._bg();this._ui();this.hero=addCharacter(this,this.W*0.88,this.H*0.55,0.8);this.startRound(); }
  _bg() { const bg=this.add.image(this.W/2,this.H/2,'bg');bg.setScale(Math.max(this.W/bg.width,this.H/bg.height));this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.7); }
  _ui() { this.scoreLbl=this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);this.hg=this.add.group();this._rh();this.dg=this.add.group();this._rd(); }
  _rh() { this.hg.clear(true,true);for(let i=0;i<this.lives;i++)this.hg.add(this.add.text(14+i*22,14,'♥',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dg.clear(true,true);for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  startRound() {
    if(this.rg){this.rg.destroy(true);}this.rg=this.add.group();
    const data=getRound(this.round);
    const roundVariation=[
      {skipN:2,mult:4},  // 2 × 4 = 8
      {skipN:3,mult:5},  // 3 × 5 = 15
      {skipN:5,mult:4},  // 5 × 4 = 20
      {skipN:7,mult:5},  // 7 × 5 = 35
      {skipN:6,mult:6},  // 6 × 6 = 36
    ];
    const isDefault=!data||data.prompt==='Solve this!'||!data.target||!data.items;
    const fallback=roundVariation[this.round%roundVariation.length];
    this.skipN=isDefault?fallback.skipN:((data.items&&data.items[0])?data.items[0]:fallback.skipN);
    this.targetMult=isDefault?fallback.mult:Math.max(2,Math.round(data.target/this.skipN));
    if(this.targetMult<2)this.targetMult=fallback.mult;
    if(this.targetMult>9)this.targetMult=9;
    this.target=this.skipN*this.targetMult;
    this._rd();
    const W=this.W,H=this.H;

    // Top: operation
    this.rg.add(this.add.text(W/2,H*0.06,'Slide the marker to solve',{fontSize:'13px',color:COL_TEXT,fontFamily:"'Lexend', system-ui"}).setOrigin(0.5).setDepth(6));
    this.rg.add(this.add.text(W/2,H*0.12,this.skipN+' × '+this.targetMult+' = ?',{fontSize:'28px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6));

    // Build chain: targetMult+2 segments (so target is not at the very end), each segment skipN beads
    const totalSegments=Math.min(this.targetMult+2,9);
    const totalBeads=totalSegments*this.skipN;
    const chainY=H*0.28;
    const beadR=Math.max(6,Math.min(12,Math.floor((W*0.86)/totalBeads/2.4)));
    const spacing=beadR*2+3;
    const chainW=totalBeads*spacing;
    const startX=(W-chainW)/2+beadR;

    // Chain line
    this.rg.add(this.add.rectangle(W/2,chainY,chainW,2,hexToNum(COL_TEXT),0.25).setDepth(3));

    // Alternate segment colors
    const segColors=[hexToNum(COL_PRIMARY),hexToNum('#a855f7')];
    this.beadPositions=[];
    for(let s=0;s<totalSegments;s++){
      const segColor=segColors[s%2];
      for(let b=0;b<this.skipN;b++){
        const i=s*this.skipN+b;
        const bx=startX+i*spacing;
        const bead=this.add.circle(bx,chainY,beadR,segColor,0.75).setStrokeStyle(1,hexToNum(COL_TEXT),0.4).setDepth(5);
        this.rg.add(bead);
        this.beadPositions.push(bx);
      }
      // Segment-end tick with running total
      const endX=startX+((s+1)*this.skipN-1)*spacing+beadR+1;
      this.rg.add(this.add.rectangle(endX,chainY,1,beadR*2+10,hexToNum(COL_TEXT),0.4).setDepth(4));
      this.rg.add(this.add.text(endX,chainY+beadR+14,String((s+1)*this.skipN),{fontSize:'10px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.6}).setOrigin(0.5).setDepth(4));
    }

    // Snap positions: end of each segment (1-indexed)
    this.snapPositions=[startX-beadR-1]; // 0×N position (start)
    for(let s=0;s<totalSegments;s++){
      this.snapPositions.push(startX+((s+1)*this.skipN-1)*spacing+beadR+1);
    }

    // Target flag (shown above the target segment end) — subtle hint
    const targetX=this.snapPositions[this.targetMult];
    const flagY=chainY-beadR-22;
    this.rg.add(this.add.text(targetX,flagY,'▼',{fontSize:'14px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui"}).setOrigin(0.5).setDepth(5));
    this.rg.add(this.add.text(targetX,flagY-12,'target',{fontSize:'9px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui"}).setOrigin(0.5).setDepth(5));

    // Marker (draggable)
    this.currentMult=0;
    const markerY=chainY+beadR+32;
    this.markerBase=this.add.triangle(this.snapPositions[0],markerY,0,14,7,0,14,14,hexToNum(COL_ACCENT)).setDepth(7);
    this.rg.add(this.markerBase);
    this.markerHandle=this.add.circle(this.snapPositions[0],markerY+10,10,hexToNum(COL_ACCENT),0.85).setStrokeStyle(2,0xffffff,0.7).setInteractive({draggable:true,useHandCursor:true}).setDepth(8);
    this.input.setDraggable(this.markerHandle);
    this.rg.add(this.markerHandle);

    this.markerHandle.on('drag',(_p,dx)=>{
      const minX=this.snapPositions[0];
      const maxX=this.snapPositions[this.snapPositions.length-1];
      const x=Math.max(minX,Math.min(maxX,dx));
      // Snap to nearest segment end
      let bestIdx=0,bestD=Infinity;
      this.snapPositions.forEach((sx,idx)=>{const d=Math.abs(sx-x);if(d<bestD){bestD=d;bestIdx=idx;}});
      const snappedX=this.snapPositions[bestIdx];
      this.markerHandle.x=snappedX;
      this.markerBase.x=snappedX;
      if(this.currentMult!==bestIdx){
        this.currentMult=bestIdx;
        this._updateReadout();
        if(bestIdx===this.targetMult&&!this.solved)this._checkSolved();
      }
    });

    // Live readout
    this.rg.add(this.add.text(W/2,H*0.56,'Where the marker lands:',{fontSize:'12px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.6}).setOrigin(0.5).setDepth(6));
    this.readoutLbl=this.add.text(W/2,H*0.63,'',{fontSize:'26px',color:COL_PRIMARY,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6);
    this.rg.add(this.readoutLbl);
    this.hintLbl=this.add.text(W/2,H*0.7,'Drag the marker to the ▼ target.',{fontSize:'12px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.55}).setOrigin(0.5).setDepth(6);
    this.rg.add(this.hintLbl);
    this._updateReadout();
  }

  _updateReadout() {
    const product=this.currentMult*this.skipN;
    this.readoutLbl.setText(this.skipN+' × '+this.currentMult+' = '+product);
    this.readoutLbl.setColor(this.currentMult===this.targetMult?COL_ACCENT:COL_PRIMARY);
  }

  _checkSolved() {
    this.solved=true;
    gameScore+=10*(this.round+1);this.scoreLbl.setText('Score: '+gameScore);
    this.cameras.main.flash(140,34,197,94);heroCheer(this,this.hero);
    this._showSolutionCard();
  }

  _showSolutionCard() {
    const W=this.W,H=this.H;
    const backdrop=this.add.rectangle(W/2,H/2,W,H,0x000000,0.6).setDepth(50);
    const card=this.add.rectangle(W/2,H*0.5,W-60,220,0x18181b,1).setStrokeStyle(2,hexToNum(COL_ACCENT)).setDepth(51);
    const h1=this.add.text(W/2,H*0.5-85,'Got it!',{fontSize:'22px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(52);
    const l1=this.add.text(W/2,H*0.5-40,this.skipN+' × '+this.targetMult+' = '+this.target,{fontSize:'22px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(52);
    const l2=this.add.text(W/2,H*0.5-5,this.targetMult+' groups of '+this.skipN+' beads = '+this.target+' beads total.',{fontSize:'12px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.7,wordWrap:{width:W-100},align:'center'}).setOrigin(0.5).setDepth(52);
    const nextY=H*0.5+60;
    const nextBg=this.add.rectangle(W/2,nextY,220,42,hexToNum(COL_ACCENT),1).setInteractive({useHandCursor:true}).setDepth(52);
    const nextLbl=this.add.text(W/2,nextY,this.round+1>=TOTAL_ROUNDS?'Finish!':'Next round →',{fontSize:'14px',color:'#000',fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(53);
    nextBg.on('pointerdown',()=>{
      [backdrop,card,h1,l1,l2,nextBg,nextLbl].forEach(o=>o.destroy());
      this.solved=false;
      this.round++;
      if(this.round>=TOTAL_ROUNDS)this.scene.start('VictoryScene',{score:gameScore});
      else this.startRound();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CheckerboardMultiplyScene — INTRINSIC REBUILD (April 13 night)
// Teaches: multiplication as rectangular area (rows × columns) — CCSS 3.OA.A.1
// Discovery: every bead the learner places adds 1 to the running count while
//   the display also reads "A × (columns filled per row) = count". The
//   learner SEES that filling 3 rows of 4 is the same as counting to 12.
// Self-revealing truth: when the grid is full, the count on-screen IS the
//   product. No typing, no Check button — the filled rectangle is the proof.
// ═══════════════════════════════════════════════════════════════════════════════
class CheckerboardMultiplyScene extends Phaser.Scene {
  constructor() { super('CheckerboardMultiplyScene'); }
  create() { this.W=this.scale.width;this.H=this.scale.height;this.round=0;this.lives=MAX_LIVES;this._bg();this._ui();this.hero=addCharacter(this,this.W*0.88,this.H*0.55,0.8);this.startRound(); }
  _bg() { const bg=this.add.image(this.W/2,this.H/2,'bg');bg.setScale(Math.max(this.W/bg.width,this.H/bg.height));this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.7); }
  _ui() { this.scoreLbl=this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);this.hg=this.add.group();this._rh();this.dg=this.add.group();this._rd(); }
  _rh() { this.hg.clear(true,true);for(let i=0;i<this.lives;i++)this.hg.add(this.add.text(14+i*22,14,'♥',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dg.clear(true,true);for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  startRound() {
    if(this.rg){this.rg.destroy(true);}this.rg=this.add.group();
    const data=getRound(this.round);
    const roundVariation=[
      {A:3,B:4},
      {A:4,B:5},
      {A:5,B:6},
      {A:6,B:7},
      {A:7,B:8},
    ];
    const isDefault=!data||data.prompt==='Solve this!'||!data.items;
    const fallback=roundVariation[this.round%roundVariation.length];
    this.factorA=isDefault?fallback.A:((data.items&&data.items[0])?data.items[0]:fallback.A);
    this.factorB=isDefault?fallback.B:((data.items&&data.items[1])?data.items[1]:fallback.B);
    this.factorA=Math.max(2,Math.min(9,this.factorA));
    this.factorB=Math.max(2,Math.min(9,this.factorB));
    this.target=this.factorA*this.factorB;
    this._rd();
    const W=this.W,H=this.H;

    // Top: operation
    this.rg.add(this.add.text(W/2,H*0.06,'Fill every cell to find the product',{fontSize:'13px',color:COL_TEXT,fontFamily:"'Lexend', system-ui"}).setOrigin(0.5).setDepth(6));
    this.rg.add(this.add.text(W/2,H*0.12,this.factorB+' rows × '+this.factorA+' columns = ?',{fontSize:'24px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6));

    // Grid
    const rows=this.factorB,cols=this.factorA;
    const cellSize=Math.min(Math.floor((W*0.55)/cols),Math.floor((H*0.42)/rows),52);
    const gridW=cols*cellSize,gridH=rows*cellSize;
    const gridX=(W-gridW)/2-W*0.05,gridY=H*0.22;
    this.gridX=gridX;this.gridY=gridY;this.cellSize=cellSize;this.rows=rows;this.cols=cols;

    const boardColors=[
      [0x22c55e,0x3b82f6,0xef4444,0xfbbf24],
      [0x3b82f6,0xef4444,0xfbbf24,0x22c55e],
    ];

    // Column labels (top)
    for(let c=0;c<cols;c++){
      this.rg.add(this.add.text(gridX+c*cellSize+cellSize/2,gridY-14,String(c+1),{fontSize:'11px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6));
    }
    // Row labels (side)
    for(let r=0;r<rows;r++){
      this.rg.add(this.add.text(gridX-14,gridY+r*cellSize+cellSize/2,String(r+1),{fontSize:'11px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6));
    }

    this.beadCount=0;
    this.cellsFilled=new Array(rows*cols).fill(false);
    this.gridCells=[];
    for(let r=0;r<rows;r++){for(let c=0;c<cols;c++){
      const cx=gridX+c*cellSize+cellSize/2;
      const cy=gridY+r*cellSize+cellSize/2;
      const color=boardColors[r%2][c%4];
      const cell=this.add.rectangle(cx,cy,cellSize-2,cellSize-2,color,0.2).setStrokeStyle(1,hexToNum(COL_TEXT),0.25).setInteractive({useHandCursor:true}).setDepth(5);
      this.rg.add(cell);
      const idx=r*cols+c;
      this.gridCells.push({cell,x:cx,y:cy,color,idx,r,c});
      cell.on('pointerdown',()=>{
        if(this.cellsFilled[idx]||this.solved)return;
        this.cellsFilled[idx]=true;
        this.beadCount++;
        const bead=this.add.circle(cx,cy,cellSize*0.28,hexToNum(COL_ACCENT),0.9).setStrokeStyle(1,0xffffff,0.5).setDepth(6);
        this.rg.add(bead);
        cell.setFillStyle(color,0.45);
        this._updateReadout();
        if(this.beadCount===this.target)this._checkSolved();
      });
    }}

    // Bead tray (source — drag alternative)
    const trayX=W*0.78,trayY=gridY+20;
    this.rg.add(this.add.rectangle(trayX,trayY+70,W*0.15,160,hexToNum(COL_SECONDARY),0.08).setStrokeStyle(1,hexToNum(COL_TEXT),0.3).setDepth(3));
    this.rg.add(this.add.text(trayX,trayY,'Bead',{fontSize:'11px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.6}).setOrigin(0.5).setDepth(4));
    this.rg.add(this.add.text(trayX,trayY+14,'(click cells)',{fontSize:'9px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.5}).setOrigin(0.5).setDepth(4));
    this.rg.add(this.add.circle(trayX,trayY+70,14,hexToNum(COL_ACCENT),0.85).setStrokeStyle(1,0xffffff,0.5).setDepth(4));

    // Running readout
    this.readoutY=gridY+gridH+40;
    this.rg.add(this.add.text(W/2,this.readoutY-16,'Cells filled:',{fontSize:'12px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.6}).setOrigin(0.5).setDepth(6));
    this.readoutLbl=this.add.text(W/2,this.readoutY+10,'',{fontSize:'22px',color:COL_PRIMARY,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6);
    this.rg.add(this.readoutLbl);
    this._updateReadout();
  }

  _updateReadout() {
    // Show how many complete rows and partial
    const full=Math.floor(this.beadCount/this.cols);
    const partial=this.beadCount%this.cols;
    let txt;
    if(partial===0&&this.beadCount>0)txt=this.cols+' × '+full+' = '+this.beadCount;
    else if(this.beadCount===0)txt=this.cols+' × 0 = 0';
    else txt=this.cols+' × '+full+' + '+partial+' = '+this.beadCount;
    this.readoutLbl.setText(txt);
    this.readoutLbl.setColor(this.beadCount===this.target?COL_ACCENT:COL_PRIMARY);
  }

  _checkSolved() {
    this.solved=true;
    gameScore+=10*(this.round+1);this.scoreLbl.setText('Score: '+gameScore);
    this.cameras.main.flash(140,34,197,94);heroCheer(this,this.hero);
    this._showSolutionCard();
  }

  _showSolutionCard() {
    const W=this.W,H=this.H;
    const backdrop=this.add.rectangle(W/2,H/2,W,H,0x000000,0.6).setDepth(50);
    const card=this.add.rectangle(W/2,H*0.5,W-60,220,0x18181b,1).setStrokeStyle(2,hexToNum(COL_ACCENT)).setDepth(51);
    const h1=this.add.text(W/2,H*0.5-85,'Got it!',{fontSize:'22px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(52);
    const l1=this.add.text(W/2,H*0.5-40,this.factorB+' rows × '+this.factorA+' columns = '+this.target,{fontSize:'20px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(52);
    const l2=this.add.text(W/2,H*0.5-5,this.factorB+' groups of '+this.factorA+' beads gives '+this.target+' beads in all.',{fontSize:'12px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.7,wordWrap:{width:W-100},align:'center'}).setOrigin(0.5).setDepth(52);
    const nextY=H*0.5+60;
    const nextBg=this.add.rectangle(W/2,nextY,220,42,hexToNum(COL_ACCENT),1).setInteractive({useHandCursor:true}).setDepth(52);
    const nextLbl=this.add.text(W/2,nextY,this.round+1>=TOTAL_ROUNDS?'Finish!':'Next round →',{fontSize:'14px',color:'#000',fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(53);
    nextBg.on('pointerdown',()=>{
      [backdrop,card,h1,l1,l2,nextBg,nextLbl].forEach(o=>o.destroy());
      this.solved=false;
      this.round++;
      if(this.round>=TOTAL_ROUNDS)this.scene.start('VictoryScene',{score:gameScore});
      else this.startRound();
    });
  }
}
`
