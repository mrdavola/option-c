// Singapore CPA — Phaser engine with 4 game options.
// Math: Bar models, place value discs, number bonds, Cuisenaire rods.
// Options: bar-model, place-value-discs, number-bonds, cuisenaire-rods

import type { ThemeConfig, MathParams, GameOption } from "./engine-types"
import { phaserGame } from "./base-phaser-template"
import { getOptionDef } from "./game-option-registry"

export function singaporeCpaPhaserEngine(
  config: ThemeConfig,
  math: MathParams,
  option: GameOption = "bar-model"
): string {
  const validOptions = ["bar-model", "place-value-discs", "number-bonds", "cuisenaire-rods"]
  const activeOption = validOptions.includes(option) ? option : "bar-model"
  const optDef = getOptionDef(activeOption)
  const sceneMap: Record<string, string> = {
    "bar-model": "BarModelScene",
    "place-value-discs": "PlaceValueDiscsScene",
    "number-bonds": "NumberBondsScene",
    "cuisenaire-rods": "CuisenaireRodsScene",
  }
  return phaserGame({
    config, math, option: activeOption,
    sceneName: sceneMap[activeOption],
    introText: optDef?.introText || "Solve problems with Singapore Math models!",
    helpText: optDef?.helpText || "Use visual models to understand math relationships.",
    gameSceneCode: GAME_SCENES,
  })
}

const GAME_SCENES = `
// ═══════════════════════════════════════════════════════════════════════════════
class BarModelScene extends Phaser.Scene {
  constructor() { super('BarModelScene'); }
  create() { this.W=this.scale.width;this.H=this.scale.height;this.round=0;this.lives=MAX_LIVES;this.inputStr='';this._bg();this._ui();this.hero=addCharacter(this,this.W*0.88,this.H*0.85,0.45);this.startRound(); }
  _bg() { const bg=this.add.image(this.W/2,this.H/2,'bg');bg.setScale(Math.max(this.W/bg.width,this.H/bg.height));this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.65); }
  _ui() { this.scoreLbl=this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);this.hg=this.add.group();this._rh();this.dg=this.add.group();this._rd(); }
  _rh() { this.hg.clear(true,true);for(let i=0;i<this.lives;i++)this.hg.add(this.add.text(14+i*22,14,'♥',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dg.clear(true,true);for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  startRound() {
    if(this.rg)this.rg.clear(true,true);this.rg=this.add.group();
    this.inputStr='';this._rd();
    const data=getRound(this.round);
    const W=this.W,H=this.H;
    const target=data.target;this.answer=target;
    const items=data.items;

    // Word problem prompt
    this.rg.add(this.add.text(W/2,H*0.08,data.prompt,{fontSize:'15px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",wordWrap:{width:W-40},align:'center'}).setOrigin(0.5,0).setDepth(6));

    // Bar model area
    const barTop=H*0.22,barH=50,barLeft=W*0.08,barRight=W*0.72;
    const totalW=barRight-barLeft;

    // Whole bar outline
    this.rg.add(this.add.rectangle(barLeft+totalW/2,barTop+barH/2,totalW,barH,hexToNum(COL_SECONDARY),0.15).setDepth(5));
    this.rg.add(this.add.rectangle(barLeft+totalW/2,barTop+barH/2,totalW,barH).setStrokeStyle(2,hexToNum(COL_TEXT),0.4).setDepth(5));
    this.rg.add(this.add.text(barLeft+totalW+10,barTop+barH/2,'Whole',{fontSize:'11px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.5}).setOrigin(0,0.5).setDepth(5));

    // Parts bar — draw known parts as colored bars, gap for unknown
    const partColors=[hexToNum(COL_PRIMARY),hexToNum(COL_ACCENT),hexToNum('#E8A838'),hexToNum('#C74FE8')];
    const knownParts=items.slice();
    const totalKnown=knownParts.reduce((a,b)=>a+b,0);
    const totalValue=totalKnown+target;
    let cx=barLeft;
    const partBarTop=barTop+barH+14;

    // Draw known parts
    knownParts.forEach((val,i)=>{
      const pw=Math.max(30,(val/totalValue)*totalW);
      const col=partColors[i%partColors.length];
      this.rg.add(this.add.rectangle(cx+pw/2,partBarTop+barH/2,pw,barH,col,0.5).setDepth(5));
      this.rg.add(this.add.rectangle(cx+pw/2,partBarTop+barH/2,pw,barH).setStrokeStyle(2,col,0.8).setDepth(5));
      this.rg.add(this.add.text(cx+pw/2,partBarTop+barH/2,String(val),{fontSize:'16px',color:'#fff',fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6));
      cx+=pw;
    });

    // Gap for unknown
    const gapW=Math.max(40,(target/totalValue)*totalW);
    this.rg.add(this.add.rectangle(cx+gapW/2,partBarTop+barH/2,gapW,barH,hexToNum(COL_DANGER),0.15).setDepth(5));
    this.rg.add(this.add.rectangle(cx+gapW/2,partBarTop+barH/2,gapW,barH).setStrokeStyle(2,hexToNum(COL_DANGER),0.6).setDepth(5));
    this.rg.add(this.add.text(cx+gapW/2,partBarTop+barH/2,'?',{fontSize:'22px',color:COL_DANGER,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6));

    // Bracket for whole
    const wholeW=cx+gapW-barLeft;
    this.rg.add(this.add.rectangle(barLeft+wholeW/2,partBarTop-6,wholeW,2,hexToNum(COL_TEXT),0.3).setDepth(5));

    // Hint
    if(data.hint)this.rg.add(this.add.text(W/2,partBarTop+barH+20,data.hint,{fontSize:'11px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.4}).setOrigin(0.5).setDepth(5));

    // Number pad
    this._buildNumpad(W/2,H*0.68);
  }

  _buildNumpad(cx,cy) {
    const W=this.W;
    this.inputLbl=this.add.text(cx,cy-40,'Answer: _',{fontSize:'22px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(8);
    this.rg.add(this.inputLbl);
    const keys=['1','2','3','4','5','6','7','8','9','0','⌫','✓'];
    keys.forEach((k,i)=>{
      const col=i%3;const row=Math.floor(i/3);
      const bx=cx-55+col*55;const by=cy+row*44;
      const isAction=k==='⌫'||k==='✓';
      const bgCol=k==='✓'?hexToNum(COL_PRIMARY):k==='⌫'?hexToNum(COL_DANGER):hexToNum(COL_SECONDARY);
      const btn=this.add.rectangle(bx,by,48,38,bgCol,isAction?0.7:0.25).setInteractive({useHandCursor:true}).setDepth(8);
      this.rg.add(btn);
      this.rg.add(this.add.text(bx,by,k,{fontSize:'18px',color:isAction?'#fff':COL_TEXT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(9));
      btn.on('pointerdown',()=>{
        if(k==='⌫'){this.inputStr=this.inputStr.slice(0,-1);}
        else if(k==='✓'){this._check();}
        else if(this.inputStr.length<6){this.inputStr+=k;}
        this.inputLbl.setText('Answer: '+(this.inputStr||'_'));
      });
    });
  }

  _check() {
    const val=parseInt(this.inputStr,10);
    if(val===this.answer){
      gameScore+=10*(this.round+1);this.scoreLbl.setText('Score: '+gameScore);
      this.cameras.main.flash(200,34,197,94);heroCheer(this,this.hero);
      this.round++;
      if(this.round>=TOTAL_ROUNDS)this.time.delayedCall(600,()=>this.scene.start('VictoryScene',{score:gameScore}));
      else this.time.delayedCall(800,()=>this.startRound());
    }else{
      this.lives--;this._rh();this.cameras.main.shake(200,0.01);heroShake(this,this.hero);
      this.inputStr='';this.inputLbl.setText('Answer: _');
      if(this.lives<=0)this.time.delayedCall(500,()=>this.scene.start('LoseScene',{score:gameScore}));
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
class PlaceValueDiscsScene extends Phaser.Scene {
  constructor() { super('PlaceValueDiscsScene'); }
  create() { this.W=this.scale.width;this.H=this.scale.height;this.round=0;this.lives=MAX_LIVES;this._bg();this._ui();this.hero=addCharacter(this,this.W*0.88,this.H*0.85,0.45);this.startRound(); }
  _bg() { const bg=this.add.image(this.W/2,this.H/2,'bg');bg.setScale(Math.max(this.W/bg.width,this.H/bg.height));this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.65); }
  _ui() { this.scoreLbl=this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);this.hg=this.add.group();this._rh();this.dg=this.add.group();this._rd(); }
  _rh() { this.hg.clear(true,true);for(let i=0;i<this.lives;i++)this.hg.add(this.add.text(14+i*22,14,'♥',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dg.clear(true,true);for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  startRound() {
    if(this.rg)this.rg.clear(true,true);this.rg=this.add.group();
    this._rd();
    const data=getRound(this.round);
    const W=this.W,H=this.H;
    this.answer=data.target;

    // Prompt
    this.rg.add(this.add.text(W/2,H*0.06,data.prompt,{fontSize:'15px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",wordWrap:{width:W-40},align:'center'}).setOrigin(0.5,0).setDepth(6));

    // Place value mat columns
    const cols=[{label:'Hundreds',value:100,color:'#E84040'},{label:'Tens',value:10,color:'#4080E8'},{label:'Ones',value:1,color:'#40C840'}];
    const colW=(W-60)/3;
    this.discCounts={100:0,10:0,1:0};
    this.colObjects=[];

    cols.forEach((col,ci)=>{
      const cx=30+ci*colW+colW/2;
      // Column background
      this.rg.add(this.add.rectangle(cx,H*0.42,colW-8,H*0.45,hexToNum(col.color),0.08).setDepth(4));
      this.rg.add(this.add.rectangle(cx,H*0.42,colW-8,H*0.45).setStrokeStyle(2,hexToNum(col.color),0.3).setDepth(4));
      this.rg.add(this.add.text(cx,H*0.17,col.label,{fontSize:'13px',color:col.color,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(6));

      // Disc count label
      const countLbl=this.add.text(cx,H*0.22,'0',{fontSize:'20px',color:'#fff',fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6);
      this.rg.add(countLbl);

      // Add disc button
      const addBtn=this.add.rectangle(cx-20,H*0.64,36,30,hexToNum(col.color),0.5).setInteractive({useHandCursor:true}).setDepth(7);
      this.rg.add(addBtn);
      this.rg.add(this.add.text(cx-20,H*0.64,'+',{fontSize:'20px',color:'#fff',fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(8));

      // Remove disc button
      const remBtn=this.add.rectangle(cx+20,H*0.64,36,30,hexToNum(col.color),0.25).setInteractive({useHandCursor:true}).setDepth(7);
      this.rg.add(remBtn);
      this.rg.add(this.add.text(cx+20,H*0.64,'−',{fontSize:'20px',color:'#fff',fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(8));

      this.colObjects.push({col,cx,countLbl,discGroup:this.add.group()});

      addBtn.on('pointerdown',()=>{
        this.discCounts[col.value]++;
        this._updateCol(ci);
        // Auto-trade: 10 in a column → trade up
        if(col.value<100&&this.discCounts[col.value]>=10){
          this.discCounts[col.value]-=10;
          this.discCounts[col.value*10]++;
          this._updateCol(ci);
          if(col.value===1)this._updateCol(1);
          if(col.value===10)this._updateCol(0);
          this.cameras.main.flash(150,255,200,50);
          this._showTrade(cx,H*0.4);
        }
      });
      remBtn.on('pointerdown',()=>{
        if(this.discCounts[col.value]>0){this.discCounts[col.value]--;this._updateCol(ci);}
      });
    });

    // Total display
    this.totalLbl=this.add.text(W/2,H*0.72,'Total: 0',{fontSize:'20px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6);
    this.rg.add(this.totalLbl);

    // Check button
    const check=this.add.rectangle(W/2,H*0.80,130,42,hexToNum(COL_PRIMARY),1).setInteractive({useHandCursor:true}).setDepth(10);
    this.rg.add(check);this.rg.add(this.add.text(W/2,H*0.80,'Check',{fontSize:'15px',color:'#fff',fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(11));
    check.on('pointerdown',()=>this._check());

    if(data.hint)this.rg.add(this.add.text(W/2,H*0.87,data.hint,{fontSize:'11px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.4}).setOrigin(0.5).setDepth(5));
  }

  _showTrade(x,y){
    const pop=this.add.text(x,y,'Trade! 10→1',{fontSize:'14px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(20);
    this.tweens.add({targets:pop,y:y-30,alpha:0,duration:800,ease:'Cubic.easeOut',onComplete:()=>pop.destroy()});
  }

  _updateCol(ci) {
    const obj=this.colObjects[ci];
    const val=this.discCounts[obj.col.value];
    obj.countLbl.setText(String(val));
    // Draw discs
    obj.discGroup.clear(true,true);
    const maxShow=Math.min(val,9);
    for(let d=0;d<maxShow;d++){
      const dy=obj.countLbl.y+24+d*16;
      const disc=this.add.circle(obj.cx,dy,10,hexToNum(obj.col.color),0.7).setDepth(6);
      obj.discGroup.add(disc);
      this.rg.add(disc);
    }
    if(val>9){
      const extra=this.add.text(obj.cx,obj.countLbl.y+24+9*16,'+'+(val-9),{fontSize:'10px',color:obj.col.color,fontFamily:"'Lexend', system-ui"}).setOrigin(0.5).setDepth(6);
      obj.discGroup.add(extra);this.rg.add(extra);
    }
    // Update total
    const total=this.discCounts[100]*100+this.discCounts[10]*10+this.discCounts[1];
    if(this.totalLbl)this.totalLbl.setText('Total: '+total);
  }

  _check() {
    const total=this.discCounts[100]*100+this.discCounts[10]*10+this.discCounts[1];
    if(total===this.answer){
      gameScore+=10*(this.round+1);this.scoreLbl.setText('Score: '+gameScore);
      this.cameras.main.flash(200,34,197,94);heroCheer(this,this.hero);
      this.round++;
      if(this.round>=TOTAL_ROUNDS)this.time.delayedCall(600,()=>this.scene.start('VictoryScene',{score:gameScore}));
      else this.time.delayedCall(800,()=>this.startRound());
    }else{
      this.lives--;this._rh();this.cameras.main.shake(200,0.01);heroShake(this,this.hero);
      if(this.lives<=0)this.time.delayedCall(500,()=>this.scene.start('LoseScene',{score:gameScore}));
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
class NumberBondsScene extends Phaser.Scene {
  constructor() { super('NumberBondsScene'); }
  create() { this.W=this.scale.width;this.H=this.scale.height;this.round=0;this.lives=MAX_LIVES;this.inputStr='';this._bg();this._ui();this.hero=addCharacter(this,this.W*0.88,this.H*0.85,0.45);this.startRound(); }
  _bg() { const bg=this.add.image(this.W/2,this.H/2,'bg');bg.setScale(Math.max(this.W/bg.width,this.H/bg.height));this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.65); }
  _ui() { this.scoreLbl=this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);this.hg=this.add.group();this._rh();this.dg=this.add.group();this._rd(); }
  _rh() { this.hg.clear(true,true);for(let i=0;i<this.lives;i++)this.hg.add(this.add.text(14+i*22,14,'♥',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dg.clear(true,true);for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  startRound() {
    if(this.rg)this.rg.clear(true,true);this.rg=this.add.group();
    this.inputStr='';this._rd();
    const data=getRound(this.round);
    const W=this.W,H=this.H;
    this.answer=data.target;

    // Prompt
    this.rg.add(this.add.text(W/2,H*0.06,data.prompt,{fontSize:'15px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",wordWrap:{width:W-40},align:'center'}).setOrigin(0.5,0).setDepth(6));

    // Number bond diagram: whole at top, two parts at bottom
    const items=data.items;
    const wholeVal=items[0];
    const partAVal=items[1];
    const partBVal=items[2]; // -1 means this is the unknown
    const wholeCx=W/2,wholeCy=H*0.25;
    const partACx=W*0.3,partBCx=W*0.7,partCy=H*0.42;
    const circR=30;

    // Connecting lines
    this.rg.add(this.add.line(0,0,wholeCx,wholeCy+circR,partACx,partCy-circR,hexToNum(COL_TEXT),0.3).setOrigin(0).setDepth(4));
    this.rg.add(this.add.line(0,0,wholeCx,wholeCy+circR,partBCx,partCy-circR,hexToNum(COL_TEXT),0.3).setOrigin(0).setDepth(4));

    // Whole circle
    const wholeIsUnknown=wholeVal===-1;
    this.rg.add(this.add.circle(wholeCx,wholeCy,circR,hexToNum(COL_PRIMARY),wholeIsUnknown?0.2:0.5).setDepth(5));
    this.rg.add(this.add.circle(wholeCx,wholeCy,circR).setStrokeStyle(2,hexToNum(COL_PRIMARY),0.8).setDepth(5));
    this.rg.add(this.add.text(wholeCx,wholeCy-circR-10,'Whole',{fontSize:'10px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.5}).setOrigin(0.5).setDepth(5));
    this.rg.add(this.add.text(wholeCx,wholeCy,wholeIsUnknown?'?':String(wholeVal),{fontSize:'22px',color:wholeIsUnknown?COL_DANGER:'#fff',fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6));

    // Part A circle
    const partAUnknown=partAVal===-1;
    this.rg.add(this.add.circle(partACx,partCy,circR,hexToNum(COL_ACCENT),partAUnknown?0.2:0.5).setDepth(5));
    this.rg.add(this.add.circle(partACx,partCy,circR).setStrokeStyle(2,hexToNum(COL_ACCENT),0.8).setDepth(5));
    this.rg.add(this.add.text(partACx,partCy-circR-10,'Part',{fontSize:'10px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.5}).setOrigin(0.5).setDepth(5));
    this.rg.add(this.add.text(partACx,partCy,partAUnknown?'?':String(partAVal),{fontSize:'22px',color:partAUnknown?COL_DANGER:'#fff',fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6));

    // Part B circle
    const partBUnknown=partBVal===-1;
    this.rg.add(this.add.circle(partBCx,partCy,circR,hexToNum(COL_ACCENT),partBUnknown?0.2:0.5).setDepth(5));
    this.rg.add(this.add.circle(partBCx,partCy,circR).setStrokeStyle(2,hexToNum(COL_ACCENT),0.8).setDepth(5));
    this.rg.add(this.add.text(partBCx,partCy-circR-10,'Part',{fontSize:'10px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.5}).setOrigin(0.5).setDepth(5));
    this.rg.add(this.add.text(partBCx,partCy,partBUnknown?'?':String(partBVal),{fontSize:'22px',color:partBUnknown?COL_DANGER:'#fff',fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6));

    // Hint
    if(data.hint)this.rg.add(this.add.text(W/2,partCy+circR+16,data.hint,{fontSize:'11px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.4}).setOrigin(0.5).setDepth(5));

    // Number pad
    this._buildNumpad(W/2,H*0.68);
  }

  _buildNumpad(cx,cy) {
    this.inputLbl=this.add.text(cx,cy-40,'Answer: _',{fontSize:'22px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(8);
    this.rg.add(this.inputLbl);
    const keys=['1','2','3','4','5','6','7','8','9','0','⌫','✓'];
    keys.forEach((k,i)=>{
      const col=i%3;const row=Math.floor(i/3);
      const bx=cx-55+col*55;const by=cy+row*44;
      const isAction=k==='⌫'||k==='✓';
      const bgCol=k==='✓'?hexToNum(COL_PRIMARY):k==='⌫'?hexToNum(COL_DANGER):hexToNum(COL_SECONDARY);
      const btn=this.add.rectangle(bx,by,48,38,bgCol,isAction?0.7:0.25).setInteractive({useHandCursor:true}).setDepth(8);
      this.rg.add(btn);
      this.rg.add(this.add.text(bx,by,k,{fontSize:'18px',color:isAction?'#fff':COL_TEXT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(9));
      btn.on('pointerdown',()=>{
        if(k==='⌫'){this.inputStr=this.inputStr.slice(0,-1);}
        else if(k==='✓'){this._check();}
        else if(this.inputStr.length<6){this.inputStr+=k;}
        this.inputLbl.setText('Answer: '+(this.inputStr||'_'));
      });
    });
  }

  _check() {
    const val=parseInt(this.inputStr,10);
    if(val===this.answer){
      gameScore+=10*(this.round+1);this.scoreLbl.setText('Score: '+gameScore);
      this.cameras.main.flash(200,34,197,94);heroCheer(this,this.hero);
      this.round++;
      if(this.round>=TOTAL_ROUNDS)this.time.delayedCall(600,()=>this.scene.start('VictoryScene',{score:gameScore}));
      else this.time.delayedCall(800,()=>this.startRound());
    }else{
      this.lives--;this._rh();this.cameras.main.shake(200,0.01);heroShake(this,this.hero);
      this.inputStr='';this.inputLbl.setText('Answer: _');
      if(this.lives<=0)this.time.delayedCall(500,()=>this.scene.start('LoseScene',{score:gameScore}));
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
class CuisenaireRodsScene extends Phaser.Scene {
  constructor() { super('CuisenaireRodsScene'); }
  create() { this.W=this.scale.width;this.H=this.scale.height;this.round=0;this.lives=MAX_LIVES;this._bg();this._ui();this.hero=addCharacter(this,this.W*0.88,this.H*0.85,0.45);this.startRound(); }
  _bg() { const bg=this.add.image(this.W/2,this.H/2,'bg');bg.setScale(Math.max(this.W/bg.width,this.H/bg.height));this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.65); }
  _ui() { this.scoreLbl=this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);this.hg=this.add.group();this._rh();this.dg=this.add.group();this._rd(); }
  _rh() { this.hg.clear(true,true);for(let i=0;i<this.lives;i++)this.hg.add(this.add.text(14+i*22,14,'♥',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dg.clear(true,true);for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  startRound() {
    if(this.rg)this.rg.clear(true,true);this.rg=this.add.group();
    this._rd();
    const data=getRound(this.round);
    const W=this.W,H=this.H;
    this.answer=data.target;
    const maxRods=data.items[0]||3;

    // Cuisenaire rod colors by length
    const rodColors=['#FFFFFF','#E84040','#40C840','#C74FE8','#E8E840','#40C8C8','#222222','#E8A040','#4040E8','#E88040'];

    // Prompt
    this.rg.add(this.add.text(W/2,H*0.06,data.prompt||('Make '+this.answer+' using exactly '+maxRods+' rods'),{fontSize:'15px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",wordWrap:{width:W-40},align:'center'}).setOrigin(0.5,0).setDepth(6));

    // Target bar
    const targetW=Math.min(W*0.8,this.answer*28);
    const targetLeft=(W-targetW)/2;
    this.rg.add(this.add.rectangle(W/2,H*0.16,targetW,20,hexToNum(COL_TEXT),0.15).setDepth(4));
    this.rg.add(this.add.rectangle(W/2,H*0.16,targetW,20).setStrokeStyle(2,hexToNum(COL_ACCENT),0.5).setDepth(4));
    this.rg.add(this.add.text(W/2,H*0.16,'Target: '+this.answer,{fontSize:'12px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui"}).setOrigin(0.5).setDepth(5));

    // Selected rods area
    this.selectedRods=[];
    this.rodSlotY=H*0.26;
    this.sumLbl=this.add.text(W/2,H*0.34,'Sum: 0 / '+this.answer,{fontSize:'16px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6);
    this.rg.add(this.sumLbl);
    this.countLbl=this.add.text(W/2,H*0.39,'Rods: 0 / '+maxRods,{fontSize:'13px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.6}).setOrigin(0.5).setDepth(6);
    this.rg.add(this.countLbl);
    this.maxRods=maxRods;

    // Rod palette (1-10)
    const paletteTop=H*0.46;
    const unitW=Math.min(28,(W-60)/10);
    for(let len=1;len<=10;len++){
      const rw=len*unitW;
      const rx=W/2-(5*unitW)+((len-1)*unitW/2);
      const ry=paletteTop+(len-1)*26;
      const rodBg=this.add.rectangle(rx+rw/2,ry,rw,20,hexToNum(rodColors[len-1]),0.6).setInteractive({useHandCursor:true}).setDepth(6);
      this.rg.add(rodBg);
      this.rg.add(this.add.rectangle(rx+rw/2,ry,rw,20).setStrokeStyle(1,hexToNum('#ffffff'),0.3).setDepth(6));
      this.rg.add(this.add.text(rx+rw/2,ry,String(len),{fontSize:'12px',color:'#fff',fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(7));
      rodBg.on('pointerdown',()=>{
        if(this.selectedRods.length<this.maxRods){
          this.selectedRods.push(len);
          this._updateSelected();
        }
      });
    }

    // Undo button
    const undo=this.add.rectangle(W*0.2,H*0.88,80,34,hexToNum(COL_DANGER),0.5).setInteractive({useHandCursor:true}).setDepth(8);
    this.rg.add(undo);this.rg.add(this.add.text(W*0.2,H*0.88,'Undo',{fontSize:'13px',color:'#fff',fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(9));
    undo.on('pointerdown',()=>{this.selectedRods.pop();this._updateSelected();});

    // Check button
    const check=this.add.rectangle(W*0.65,H*0.88,100,38,hexToNum(COL_PRIMARY),1).setInteractive({useHandCursor:true}).setDepth(10);
    this.rg.add(check);this.rg.add(this.add.text(W*0.65,H*0.88,'Check',{fontSize:'14px',color:'#fff',fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(11));
    check.on('pointerdown',()=>this._check());

    if(data.hint)this.rg.add(this.add.text(W/2,H*0.94,data.hint,{fontSize:'10px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.4}).setOrigin(0.5).setDepth(5));
  }

  _updateSelected() {
    const rodColors=['#FFFFFF','#E84040','#40C840','#C74FE8','#E8E840','#40C8C8','#222222','#E8A040','#4040E8','#E88040'];
    const unitW=Math.min(28,(this.W-60)/10);
    // Clear old display
    if(this.selGroup)this.selGroup.clear(true,true);
    this.selGroup=this.add.group();
    let cx=(this.W-this.selectedRods.reduce((a,b)=>a+b*unitW,0))/2;
    this.selectedRods.forEach((len)=>{
      const rw=len*unitW;
      const r=this.add.rectangle(cx+rw/2,this.rodSlotY,rw,22,hexToNum(rodColors[len-1]),0.7).setDepth(6);
      this.selGroup.add(r);this.rg.add(r);
      const rl=this.add.text(cx+rw/2,this.rodSlotY,String(len),{fontSize:'11px',color:'#fff',fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(7);
      this.selGroup.add(rl);this.rg.add(rl);
      cx+=rw;
    });
    const sum=this.selectedRods.reduce((a,b)=>a+b,0);
    this.sumLbl.setText('Sum: '+sum+' / '+this.answer);
    this.countLbl.setText('Rods: '+this.selectedRods.length+' / '+this.maxRods);
    this.sumLbl.setColor(sum===this.answer?COL_ACCENT:COL_TEXT);
  }

  _check() {
    const sum=this.selectedRods.reduce((a,b)=>a+b,0);
    if(sum===this.answer&&this.selectedRods.length===this.maxRods){
      gameScore+=10*(this.round+1);this.scoreLbl.setText('Score: '+gameScore);
      this.cameras.main.flash(200,34,197,94);heroCheer(this,this.hero);
      this.round++;
      if(this.round>=TOTAL_ROUNDS)this.time.delayedCall(600,()=>this.scene.start('VictoryScene',{score:gameScore}));
      else this.time.delayedCall(800,()=>this.startRound());
    }else{
      this.lives--;this._rh();this.cameras.main.shake(200,0.01);heroShake(this,this.hero);
      if(this.lives<=0)this.time.delayedCall(500,()=>this.scene.start('LoseScene',{score:gameScore}));
    }
  }
}
`
