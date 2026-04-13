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
class GoldenBeadsScene extends Phaser.Scene {
  constructor() { super('GoldenBeadsScene'); }
  create() { this.W=this.scale.width;this.H=this.scale.height;this.round=0;this.lives=MAX_LIVES;this._bg();this._ui();this.hero=addCharacter(this,this.W*0.88,this.H*0.85,0.45);this.startRound(); }
  _bg() { const bg=this.add.image(this.W/2,this.H/2,'bg');bg.setScale(Math.max(this.W/bg.width,this.H/bg.height));this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.65); }
  _ui() { this.scoreLbl=this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);this.hg=this.add.group();this._rh();this.dg=this.add.group();this._rd(); }
  _rh() { this.hg.clear(true,true);for(let i=0;i<this.lives;i++)this.hg.add(this.add.text(14+i*22,14,'♥',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dg.clear(true,true);for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  startRound() {
    if(this.rg)this.rg.clear(true,true);this.rg=this.add.group();
    const data=getRound(this.round);this.target=data.target;this._rd();
    const W=this.W,H=this.H;
    this.inputVal='';
    this.beadCount=0;
    this.tenBarCount=0;

    // Prompt
    this.rg.add(this.add.text(W/2,H*0.08,data.prompt,{fontSize:'18px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold',wordWrap:{width:W-40}}).setOrigin(0.5).setDepth(6));

    // Ten-frame (2x5 grid) on the left
    const tfX=W*0.15,tfY=H*0.3,cellSize=28;
    this.rg.add(this.add.text(tfX+cellSize*2.5,tfY-20,'Ten-Frame',{fontSize:'12px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.6}).setOrigin(0.5).setDepth(5));
    this.tenFrameCells=[];
    for(let r=0;r<2;r++){for(let c=0;c<5;c++){
      const cx=tfX+c*cellSize+cellSize/2,cy=tfY+r*cellSize+cellSize/2;
      const cell=this.add.rectangle(cx,cy,cellSize-2,cellSize-2,hexToNum(COL_SECONDARY),0.15).setStrokeStyle(1,hexToNum(COL_TEXT),0.3).setDepth(5);
      this.rg.add(cell);this.tenFrameCells.push({rect:cell,filled:false,x:cx,y:cy});
    }}

    // Hundred-square outline on the right of ten-frame
    const hsX=W*0.15,hsY=H*0.48;
    const hsCellSize=12;
    this.rg.add(this.add.text(hsX+hsCellSize*5,hsY-14,'Hundred-Square',{fontSize:'11px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.6}).setOrigin(0.5).setDepth(5));
    this.rg.add(this.add.rectangle(hsX+hsCellSize*5,hsY+hsCellSize*5,hsCellSize*10,hsCellSize*10,hexToNum(COL_SECONDARY),0.08).setStrokeStyle(1,hexToNum(COL_ACCENT),0.3).setDepth(5));
    for(let r=0;r<10;r++){for(let c=0;c<10;c++){
      this.rg.add(this.add.rectangle(hsX+c*hsCellSize+hsCellSize/2,hsY+r*hsCellSize+hsCellSize/2,hsCellSize-1,hsCellSize-1,0x000000,0).setStrokeStyle(0.5,hexToNum(COL_TEXT),0.1).setDepth(5));
    }}

    // Loose unit beads scattered
    const beadArea={x:W*0.45,y:H*0.22,w:W*0.48,h:H*0.28};
    this.rg.add(this.add.text(beadArea.x+beadArea.w/2,beadArea.y-14,'Loose Beads (click to count)',{fontSize:'11px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.6}).setOrigin(0.5).setDepth(5));
    const numBeads=Math.min(this.target+5,30);
    this.beads=[];
    for(let i=0;i<numBeads;i++){
      const bx=beadArea.x+20+Math.random()*(beadArea.w-40);
      const by=beadArea.y+10+Math.random()*(beadArea.h-20);
      const bead=this.add.circle(bx,by,8,hexToNum(COL_PRIMARY),0.7).setInteractive({useHandCursor:true}).setDepth(6);
      this.rg.add(bead);this.beads.push({circle:bead,counted:false});
      bead.on('pointerdown',()=>{
        const idx=this.beads.indexOf(this.beads.find(b=>b.circle===bead));
        if(idx>=0&&!this.beads[idx].counted){
          this.beads[idx].counted=true;
          bead.setFillStyle(hexToNum(COL_ACCENT),1);
          this.beadCount++;
          // Fill ten-frame
          if(this.beadCount<=10){
            const ci=this.beadCount-1;
            if(this.tenFrameCells[ci]){
              this.tenFrameCells[ci].filled=true;
              this.add.circle(this.tenFrameCells[ci].x,this.tenFrameCells[ci].y,10,hexToNum(COL_ACCENT),0.8).setDepth(6);
            }
          }
          // Auto-bundle at 10
          if(this.beadCount===10){
            this.tenBarCount++;
            this.beadCount=0;
            this.tenFrameCells.forEach(tc=>{tc.filled=false;});
            this.time.delayedCall(300,()=>{
              if(this.tenBarLbl)this.tenBarLbl.setText('Ten-bars: '+this.tenBarCount);
            });
          }
          if(this.beadCountLbl)this.beadCountLbl.setText('Units: '+this.beadCount);
        }
      });
    }

    // Counters
    this.tenBarLbl=this.add.text(W*0.5,H*0.55,'Ten-bars: 0',{fontSize:'14px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setDepth(6);
    this.rg.add(this.tenBarLbl);
    this.beadCountLbl=this.add.text(W*0.5,H*0.6,'Units: 0',{fontSize:'14px',color:COL_PRIMARY,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setDepth(6);
    this.rg.add(this.beadCountLbl);

    // Number pad for final answer
    this.rg.add(this.add.text(W*0.5,H*0.68,'Type your answer:',{fontSize:'13px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.6}).setDepth(6));
    this.answerLbl=this.add.text(W*0.5,H*0.73,'_',{fontSize:'28px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0,0.5).setDepth(6);
    this.rg.add(this.answerLbl);
    this._numpad(W*0.38,H*0.79);

    // Check button
    const check=this.add.rectangle(W*0.75,H*0.9,110,38,hexToNum(COL_PRIMARY),1).setInteractive({useHandCursor:true}).setDepth(10);
    this.rg.add(check);this.rg.add(this.add.text(W*0.75,H*0.9,'Check',{fontSize:'14px',color:'#fff',fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(11));
    check.on('pointerdown',()=>this._check());
  }

  _numpad(sx,sy) {
    const keys=['1','2','3','4','5','6','7','8','9','0','⌫'];
    keys.forEach((k,i)=>{
      const col=Math.floor(i%4),row=Math.floor(i/4);
      const bx=sx+col*52,by=sy+row*38;
      const btn=this.add.rectangle(bx,by,46,32,hexToNum(COL_SECONDARY),0.3).setInteractive({useHandCursor:true}).setDepth(8);
      this.rg.add(btn);this.rg.add(this.add.text(bx,by,k,{fontSize:'16px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(9));
      btn.on('pointerdown',()=>{
        if(k==='⌫'){this.inputVal=this.inputVal.slice(0,-1);}
        else if(this.inputVal.length<6){this.inputVal+=k;}
        this.answerLbl.setText(this.inputVal||'_');
      });
    });
  }

  _check() {
    const answer=parseInt(this.inputVal,10);
    if(answer===this.target){
      gameScore+=10*(this.round+1);this.scoreLbl.setText('Score: '+gameScore);this.cameras.main.flash(200,34,197,94);heroCheer(this,this.hero);
      this.round++;if(this.round>=TOTAL_ROUNDS)this.time.delayedCall(600,()=>this.scene.start('VictoryScene',{score:gameScore}));
      else this.time.delayedCall(800,()=>this.startRound());
    }else{this.lives--;this._rh();this.cameras.main.shake(200,0.01);heroShake(this,this.hero);
      if(this.lives<=0)this.time.delayedCall(500,()=>this.scene.start('LoseScene',{score:gameScore}));}
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
class StampGameScene extends Phaser.Scene {
  constructor() { super('StampGameScene'); }
  create() { this.W=this.scale.width;this.H=this.scale.height;this.round=0;this.lives=MAX_LIVES;this._bg();this._ui();this.hero=addCharacter(this,this.W*0.88,this.H*0.85,0.45);this.startRound(); }
  _bg() { const bg=this.add.image(this.W/2,this.H/2,'bg');bg.setScale(Math.max(this.W/bg.width,this.H/bg.height));this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.65); }
  _ui() { this.scoreLbl=this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);this.hg=this.add.group();this._rh();this.dg=this.add.group();this._rd(); }
  _rh() { this.hg.clear(true,true);for(let i=0;i<this.lives;i++)this.hg.add(this.add.text(14+i*22,14,'♥',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dg.clear(true,true);for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  startRound() {
    if(this.rg)this.rg.clear(true,true);this.rg=this.add.group();
    const data=getRound(this.round);this.target=data.target;this._rd();
    const W=this.W,H=this.H;

    // Stamp counts
    this.stamps={1000:0,100:0,10:0,1:0};

    // Prompt
    this.rg.add(this.add.text(W/2,H*0.06,data.prompt,{fontSize:'18px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold',wordWrap:{width:W-40}}).setOrigin(0.5).setDepth(6));
    this.rg.add(this.add.text(W/2,H*0.13,'Target: '+this.target,{fontSize:'16px',color:COL_TEXT,fontFamily:"'Lexend', system-ui"}).setOrigin(0.5).setDepth(6));

    // Stamp tiles
    const stampDefs=[
      {val:1000,color:'#22c55e',label:'1000',name:'Thousands'},
      {val:100,color:'#ef4444',label:'100',name:'Hundreds'},
      {val:10,color:'#3b82f6',label:'10',name:'Tens'},
      {val:1,color:'#4ade80',label:'1',name:'Ones'}
    ];

    const tileW=70,tileH=50,startX=W*0.12,startY=H*0.25;
    stampDefs.forEach((sd,i)=>{
      const tx=startX+i*(tileW+12),ty=startY;
      const tile=this.add.rectangle(tx,ty,tileW,tileH,parseInt(sd.color.replace('#',''),16),0.8).setInteractive({useHandCursor:true}).setDepth(6);
      this.rg.add(tile);
      this.rg.add(this.add.text(tx,ty-8,sd.label,{fontSize:'16px',color:'#fff',fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(7));
      this.rg.add(this.add.text(tx,ty+12,sd.name,{fontSize:'9px',color:'#fff',fontFamily:"'Lexend', system-ui",alpha:0.7}).setOrigin(0.5).setDepth(7));
      tile.on('pointerdown',()=>{
        this.stamps[sd.val]++;
        this._updateStampDisplay();
      });
    });

    // Running total display
    this.stampDisplayY=H*0.42;
    this.totalLbl=this.add.text(W/2,this.stampDisplayY,'Total: 0',{fontSize:'24px',color:COL_PRIMARY,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6);
    this.rg.add(this.totalLbl);

    this.breakdownLbl=this.add.text(W/2,this.stampDisplayY+30,'',{fontSize:'13px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.7}).setOrigin(0.5).setDepth(6);
    this.rg.add(this.breakdownLbl);

    // Stamp visual area — shows placed stamps
    this.stampVisuals=this.add.group();

    // Clear button
    const clearBtn=this.add.rectangle(W*0.25,H*0.62,90,34,hexToNum(COL_DANGER),0.7).setInteractive({useHandCursor:true}).setDepth(8);
    this.rg.add(clearBtn);this.rg.add(this.add.text(W*0.25,H*0.62,'Clear',{fontSize:'13px',color:'#fff',fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(9));
    clearBtn.on('pointerdown',()=>{
      this.stamps={1000:0,100:0,10:0,1:0};
      this._updateStampDisplay();
      this.stampVisuals.clear(true,true);
    });

    // Check button
    const check=this.add.rectangle(W*0.75,H*0.62,110,38,hexToNum(COL_PRIMARY),1).setInteractive({useHandCursor:true}).setDepth(10);
    this.rg.add(check);this.rg.add(this.add.text(W*0.75,H*0.62,'Check',{fontSize:'14px',color:'#fff',fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(11));
    check.on('pointerdown',()=>this._check());
  }

  _updateStampDisplay() {
    const total=this.stamps[1000]*1000+this.stamps[100]*100+this.stamps[10]*10+this.stamps[1]*1;
    this.totalLbl.setText('Total: '+total);
    const parts=[];
    if(this.stamps[1000])parts.push(this.stamps[1000]+'×1000');
    if(this.stamps[100])parts.push(this.stamps[100]+'×100');
    if(this.stamps[10])parts.push(this.stamps[10]+'×10');
    if(this.stamps[1])parts.push(this.stamps[1]+'×1');
    this.breakdownLbl.setText(parts.join(' + ')||'Click stamps to add');

    // Visual stamps
    this.stampVisuals.clear(true,true);
    const colors={1000:0x22c55e,100:0xef4444,10:0x3b82f6,1:0x4ade80};
    let vx=this.W*0.1,vy=this.H*0.72;
    [1000,100,10,1].forEach(val=>{
      for(let i=0;i<Math.min(this.stamps[val],9);i++){
        const s=this.add.rectangle(vx,vy,22,22,colors[val],0.7).setDepth(6);
        this.stampVisuals.add(s);
        this.stampVisuals.add(this.add.text(vx,vy,val>=100?String(val).charAt(0):String(val),{fontSize:'10px',color:'#fff',fontFamily:"'Lexend', system-ui"}).setOrigin(0.5).setDepth(7));
        vx+=26;
      }
      if(this.stamps[val]>9){
        this.stampVisuals.add(this.add.text(vx,vy,'+' +(this.stamps[val]-9),{fontSize:'10px',color:COL_TEXT,fontFamily:"'Lexend', system-ui"}).setOrigin(0,0.5).setDepth(7));
        vx+=30;
      }
      vx+=8;
    });
  }

  _check() {
    const total=this.stamps[1000]*1000+this.stamps[100]*100+this.stamps[10]*10+this.stamps[1]*1;
    if(total===this.target){
      gameScore+=10*(this.round+1);this.scoreLbl.setText('Score: '+gameScore);this.cameras.main.flash(200,34,197,94);heroCheer(this,this.hero);
      this.round++;if(this.round>=TOTAL_ROUNDS)this.time.delayedCall(600,()=>this.scene.start('VictoryScene',{score:gameScore}));
      else this.time.delayedCall(800,()=>this.startRound());
    }else{this.lives--;this._rh();this.cameras.main.shake(200,0.01);heroShake(this,this.hero);
      if(this.lives<=0)this.time.delayedCall(500,()=>this.scene.start('LoseScene',{score:gameScore}));}
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

    // Fraction label
    this.fractionLbl=this.add.text(W/2,H*0.72,'0/'+this.denominator,{fontSize:'28px',color:COL_PRIMARY,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6);
    this.rg.add(this.fractionLbl);

    // Check button
    const check=this.add.rectangle(W/2,H*0.82,120,40,hexToNum(COL_PRIMARY),1).setInteractive({useHandCursor:true}).setDepth(10);
    this.rg.add(check);this.rg.add(this.add.text(W/2,H*0.82,'Check',{fontSize:'14px',color:'#fff',fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(11));
    check.on('pointerdown',()=>this._check());
  }

  _updateFractionLabel() {
    this.fractionLbl.setText(this.coloredCount+'/'+this.denominator);
  }

  _check() {
    if(this.coloredCount===this.numerator){
      gameScore+=10*(this.round+1);this.scoreLbl.setText('Score: '+gameScore);this.cameras.main.flash(200,34,197,94);heroCheer(this,this.hero);
      this.round++;if(this.round>=TOTAL_ROUNDS)this.time.delayedCall(600,()=>this.scene.start('VictoryScene',{score:gameScore}));
      else this.time.delayedCall(800,()=>this.startRound());
    }else{this.lives--;this._rh();this.cameras.main.shake(200,0.01);heroShake(this,this.hero);
      if(this.lives<=0)this.time.delayedCall(500,()=>this.scene.start('LoseScene',{score:gameScore}));}
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
class BeadChainScene extends Phaser.Scene {
  constructor() { super('BeadChainScene'); }
  create() { this.W=this.scale.width;this.H=this.scale.height;this.round=0;this.lives=MAX_LIVES;this._bg();this._ui();this.hero=addCharacter(this,this.W*0.88,this.H*0.85,0.45);this.startRound(); }
  _bg() { const bg=this.add.image(this.W/2,this.H/2,'bg');bg.setScale(Math.max(this.W/bg.width,this.H/bg.height));this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.65); }
  _ui() { this.scoreLbl=this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);this.hg=this.add.group();this._rh();this.dg=this.add.group();this._rd(); }
  _rh() { this.hg.clear(true,true);for(let i=0;i<this.lives;i++)this.hg.add(this.add.text(14+i*22,14,'♥',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dg.clear(true,true);for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  startRound() {
    if(this.rg)this.rg.clear(true,true);this.rg=this.add.group();
    const data=getRound(this.round);this.target=data.target;this._rd();
    const W=this.W,H=this.H;
    this.inputVal='';
    this.clickCount=0;
    this.runningCount=0;

    // Extract skip-count value from items or default
    this.skipN=(data.items&&data.items[0])?data.items[0]:2;
    // Total beads in chain
    const totalBeads=Math.min(Math.max(this.target/this.skipN+4,8),20);

    // Prompt
    this.rg.add(this.add.text(W/2,H*0.07,data.prompt,{fontSize:'18px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold',wordWrap:{width:W-40}}).setOrigin(0.5).setDepth(6));

    // Horizontal bead chain
    const chainY=H*0.3;
    const beadR=14;
    const spacing=beadR*2+6;
    const chainW=totalBeads*spacing;
    const startX=Math.max(20,(W-chainW)/2);

    // Chain line
    this.rg.add(this.add.rectangle(W/2,chainY,Math.min(chainW,W-40),3,hexToNum(COL_TEXT),0.2).setDepth(4));

    // Color pattern for beads (alternating by skip group)
    const colors=[hexToNum(COL_PRIMARY),hexToNum(COL_ACCENT),hexToNum('#a855f7'),hexToNum(COL_SECONDARY)];
    this.chainBeads=[];
    for(let i=0;i<totalBeads;i++){
      const bx=startX+i*spacing+beadR;
      const by=chainY;
      const colorIdx=Math.floor(i/this.skipN)%colors.length;
      const bead=this.add.circle(bx,by,beadR,colors[colorIdx],0.5).setStrokeStyle(2,hexToNum(COL_TEXT),0.3).setInteractive({useHandCursor:true}).setDepth(6);
      this.rg.add(bead);
      const numLbl=this.add.text(bx,by,'',{fontSize:'11px',color:'#fff',fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(7);
      this.rg.add(numLbl);
      this.chainBeads.push({circle:bead,label:numLbl,highlighted:false,index:i});

      bead.on('pointerdown',()=>{
        const b=this.chainBeads[i];
        if(!b.highlighted){
          b.highlighted=true;
          b.circle.setFillStyle(hexToNum(COL_ACCENT),1);
          this.clickCount++;
          this.runningCount=this.clickCount*this.skipN;
          b.label.setText(String(this.runningCount));
          this.countLbl.setText('Count: '+this.runningCount);
        }
      });
    }

    // Running count display
    this.countLbl=this.add.text(W/2,H*0.45,'Count: 0',{fontSize:'20px',color:COL_PRIMARY,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6);
    this.rg.add(this.countLbl);

    this.rg.add(this.add.text(W/2,H*0.52,'Skip counting by '+this.skipN,{fontSize:'12px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.5}).setOrigin(0.5).setDepth(6));

    // Number pad for final answer
    this.rg.add(this.add.text(W*0.35,H*0.58,'Type your answer:',{fontSize:'13px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.6}).setDepth(6));
    this.answerLbl=this.add.text(W*0.35,H*0.63,'_',{fontSize:'28px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0,0.5).setDepth(6);
    this.rg.add(this.answerLbl);
    this._numpad(W*0.25,H*0.7);

    // Check button
    const check=this.add.rectangle(W*0.75,H*0.82,110,38,hexToNum(COL_PRIMARY),1).setInteractive({useHandCursor:true}).setDepth(10);
    this.rg.add(check);this.rg.add(this.add.text(W*0.75,H*0.82,'Check',{fontSize:'14px',color:'#fff',fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(11));
    check.on('pointerdown',()=>this._check());
  }

  _numpad(sx,sy) {
    const keys=['1','2','3','4','5','6','7','8','9','0','⌫'];
    keys.forEach((k,i)=>{
      const col=Math.floor(i%4),row=Math.floor(i/4);
      const bx=sx+col*52,by=sy+row*38;
      const btn=this.add.rectangle(bx,by,46,32,hexToNum(COL_SECONDARY),0.3).setInteractive({useHandCursor:true}).setDepth(8);
      this.rg.add(btn);this.rg.add(this.add.text(bx,by,k,{fontSize:'16px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(9));
      btn.on('pointerdown',()=>{
        if(k==='⌫'){this.inputVal=this.inputVal.slice(0,-1);}
        else if(this.inputVal.length<6){this.inputVal+=k;}
        this.answerLbl.setText(this.inputVal||'_');
      });
    });
  }

  _check() {
    const answer=parseInt(this.inputVal,10);
    if(answer===this.target){
      gameScore+=10*(this.round+1);this.scoreLbl.setText('Score: '+gameScore);this.cameras.main.flash(200,34,197,94);heroCheer(this,this.hero);
      this.round++;if(this.round>=TOTAL_ROUNDS)this.time.delayedCall(600,()=>this.scene.start('VictoryScene',{score:gameScore}));
      else this.time.delayedCall(800,()=>this.startRound());
    }else{this.lives--;this._rh();this.cameras.main.shake(200,0.01);heroShake(this,this.hero);
      if(this.lives<=0)this.time.delayedCall(500,()=>this.scene.start('LoseScene',{score:gameScore}));}
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
class CheckerboardMultiplyScene extends Phaser.Scene {
  constructor() { super('CheckerboardMultiplyScene'); }
  create() { this.W=this.scale.width;this.H=this.scale.height;this.round=0;this.lives=MAX_LIVES;this._bg();this._ui();this.hero=addCharacter(this,this.W*0.88,this.H*0.85,0.45);this.startRound(); }
  _bg() { const bg=this.add.image(this.W/2,this.H/2,'bg');bg.setScale(Math.max(this.W/bg.width,this.H/bg.height));this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.65); }
  _ui() { this.scoreLbl=this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);this.hg=this.add.group();this._rh();this.dg=this.add.group();this._rd(); }
  _rh() { this.hg.clear(true,true);for(let i=0;i<this.lives;i++)this.hg.add(this.add.text(14+i*22,14,'♥',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dg.clear(true,true);for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  startRound() {
    if(this.rg)this.rg.clear(true,true);this.rg=this.add.group();
    const data=getRound(this.round);this.target=data.target;this._rd();
    const W=this.W,H=this.H;
    this.inputVal='';
    this.beadCount=0;

    // Extract factors from items
    this.factorA=(data.items&&data.items[0])?data.items[0]:3;
    this.factorB=(data.items&&data.items[1])?data.items[1]:4;

    // Prompt
    this.rg.add(this.add.text(W/2,H*0.06,data.prompt,{fontSize:'18px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold',wordWrap:{width:W-40}}).setOrigin(0.5).setDepth(6));

    // Checkerboard grid
    const rows=this.factorB,cols=this.factorA;
    const maxCells=Math.max(rows,cols);
    const cellSize=Math.min(Math.floor((W*0.6)/cols),Math.floor((H*0.4)/rows),50);
    const gridW=cols*cellSize,gridH=rows*cellSize;
    const gridX=(W-gridW)/2,gridY=H*0.2;

    // Montessori checkerboard colors (place value alternating)
    const boardColors=[
      [0x22c55e,0x3b82f6,0xef4444,0x22c55e],  // row pattern 1
      [0x3b82f6,0xef4444,0x22c55e,0x3b82f6],  // row pattern 2
    ];

    // Factor labels across top
    for(let c=0;c<cols;c++){
      this.rg.add(this.add.text(gridX+c*cellSize+cellSize/2,gridY-14,String(c+1),{fontSize:'12px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6));
    }
    // Factor labels down side
    for(let r=0;r<rows;r++){
      this.rg.add(this.add.text(gridX-14,gridY+r*cellSize+cellSize/2,String(r+1),{fontSize:'12px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6));
    }

    // A across top label
    this.rg.add(this.add.text(gridX+gridW/2,gridY-28,this.factorA+' across',{fontSize:'11px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.5}).setOrigin(0.5).setDepth(5));
    // B down side label
    this.rg.add(this.add.text(gridX-30,gridY+gridH/2,this.factorB+' down',{fontSize:'11px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.5,angle:-90}).setOrigin(0.5).setDepth(5));

    this.gridCells=[];
    for(let r=0;r<rows;r++){for(let c=0;c<cols;c++){
      const cx=gridX+c*cellSize+cellSize/2;
      const cy=gridY+r*cellSize+cellSize/2;
      const colorRow=boardColors[r%2];
      const color=colorRow[c%colorRow.length];
      const cell=this.add.rectangle(cx,cy,cellSize-2,cellSize-2,color,0.25).setStrokeStyle(1,hexToNum(COL_TEXT),0.2).setInteractive({useHandCursor:true}).setDepth(5);
      this.rg.add(cell);
      const bead={cell,hasBead:false,x:cx,y:cy};
      this.gridCells.push(bead);
      cell.on('pointerdown',()=>{
        if(!bead.hasBead){
          bead.hasBead=true;
          this.beadCount++;
          this.add.circle(cx,cy,cellSize*0.3,hexToNum(COL_ACCENT),0.85).setDepth(6);
          cell.setFillStyle(color,0.5);
        }
        this.beadCountLbl.setText('Beads placed: '+this.beadCount);
      });
    }}

    // Bead count
    this.beadCountLbl=this.add.text(W/2,gridY+gridH+18,'Beads placed: 0',{fontSize:'13px',color:COL_TEXT,fontFamily:"'Lexend', system-ui"}).setOrigin(0.5).setDepth(6);
    this.rg.add(this.beadCountLbl);

    // Number pad for final answer
    this.rg.add(this.add.text(W*0.35,H*0.7,'Type the product:',{fontSize:'13px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.6}).setDepth(6));
    this.answerLbl=this.add.text(W*0.35,H*0.75,'_',{fontSize:'28px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0,0.5).setDepth(6);
    this.rg.add(this.answerLbl);
    this._numpad(W*0.25,H*0.82);

    // Check button
    const check=this.add.rectangle(W*0.78,H*0.82,110,38,hexToNum(COL_PRIMARY),1).setInteractive({useHandCursor:true}).setDepth(10);
    this.rg.add(check);this.rg.add(this.add.text(W*0.78,H*0.82,'Check',{fontSize:'14px',color:'#fff',fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(11));
    check.on('pointerdown',()=>this._check());
  }

  _numpad(sx,sy) {
    const keys=['1','2','3','4','5','6','7','8','9','0','⌫'];
    keys.forEach((k,i)=>{
      const col=Math.floor(i%4),row=Math.floor(i/4);
      const bx=sx+col*52,by=sy+row*38;
      const btn=this.add.rectangle(bx,by,46,32,hexToNum(COL_SECONDARY),0.3).setInteractive({useHandCursor:true}).setDepth(8);
      this.rg.add(btn);this.rg.add(this.add.text(bx,by,k,{fontSize:'16px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(9));
      btn.on('pointerdown',()=>{
        if(k==='⌫'){this.inputVal=this.inputVal.slice(0,-1);}
        else if(this.inputVal.length<6){this.inputVal+=k;}
        this.answerLbl.setText(this.inputVal||'_');
      });
    });
  }

  _check() {
    const answer=parseInt(this.inputVal,10);
    if(answer===this.target){
      gameScore+=10*(this.round+1);this.scoreLbl.setText('Score: '+gameScore);this.cameras.main.flash(200,34,197,94);heroCheer(this,this.hero);
      this.round++;if(this.round>=TOTAL_ROUNDS)this.time.delayedCall(600,()=>this.scene.start('VictoryScene',{score:gameScore}));
      else this.time.delayedCall(800,()=>this.startRound());
    }else{this.lives--;this._rh();this.cameras.main.shake(200,0.01);heroShake(this,this.hero);
      if(this.lives<=0)this.time.delayedCall(500,()=>this.scene.start('LoseScene',{score:gameScore}));}
  }
}
`
