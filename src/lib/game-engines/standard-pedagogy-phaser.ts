// Standard Pedagogy — Phaser engine with 4 game options.
// Math: Expressions, factors, sorting/classifying, measurement & data.
// Options: expression-transformer, factor-finder, category-sort, measure-and-plot

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
class ExpressionTransformerScene extends Phaser.Scene {
  constructor() { super('ExpressionTransformerScene'); }
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
    const items=data.items;

    // Prompt
    this.rg.add(this.add.text(W/2,H*0.06,data.prompt,{fontSize:'15px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",wordWrap:{width:W-40},align:'center'}).setOrigin(0.5,0).setDepth(6));

    // Algebra tile workspace
    // items array: positive values = green squares (+1), negative = red (-1), values > 10 = x tiles
    // We visually display them as tiles
    const tileArea={x:W*0.08,y:H*0.18,w:W*0.84,h:H*0.3};
    this.rg.add(this.add.rectangle(tileArea.x+tileArea.w/2,tileArea.y+tileArea.h/2,tileArea.w,tileArea.h,hexToNum(COL_SECONDARY),0.1).setDepth(4));
    this.rg.add(this.add.rectangle(tileArea.x+tileArea.w/2,tileArea.y+tileArea.h/2,tileArea.w,tileArea.h).setStrokeStyle(1,hexToNum(COL_SECONDARY),0.3).setDepth(4));

    this.tiles=[];
    this.cancelledPairs=0;

    // Draw tiles from items
    const tileSize=32;const gap=6;
    const maxPerRow=Math.floor(tileArea.w/(tileSize+gap));
    items.forEach((val,i)=>{
      const row=Math.floor(i/maxPerRow);const col=i%maxPerRow;
      const tx=tileArea.x+20+col*(tileSize+gap)+tileSize/2;
      const ty=tileArea.y+20+row*(tileSize+gap+8)+tileSize/2;
      const isX=Math.abs(val)>10;
      const isNeg=val<0;
      const tileW=isX?tileSize*2:tileSize;
      const tileCol=isNeg?hexToNum(COL_DANGER):isX?hexToNum('#4488DD'):hexToNum('#44BB44');
      const tileBg=this.add.rectangle(tx,ty,tileW,tileSize,tileCol,0.6).setInteractive({useHandCursor:true}).setDepth(6);
      this.rg.add(tileBg);
      const label=isX?(isNeg?'-x':'x'):(isNeg?String(val):'+'+val);
      const tileLbl=this.add.text(tx,ty,label,{fontSize:'14px',color:'#fff',fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(7);
      this.rg.add(tileLbl);
      const tileObj={val,bg:tileBg,lbl:tileLbl,cancelled:false};
      this.tiles.push(tileObj);

      // Click to cancel zero pairs
      tileBg.on('pointerdown',()=>{
        if(tileObj.cancelled)return;
        // Find an uncancelled tile with opposite sign
        const opposite=this.tiles.find(t=>!t.cancelled&&t!==tileObj&&((t.val>0&&tileObj.val<0)||(t.val<0&&tileObj.val>0))&&Math.abs(t.val)===Math.abs(tileObj.val));
        if(opposite){
          tileObj.cancelled=true;opposite.cancelled=true;
          this.tweens.add({targets:[tileObj.bg,tileObj.lbl],alpha:0,scaleX:0,scaleY:0,duration:300,ease:'Back.easeIn'});
          this.tweens.add({targets:[opposite.bg,opposite.lbl],alpha:0,scaleX:0,scaleY:0,duration:300,ease:'Back.easeIn'});
          this.cancelledPairs++;
          this._burstParticles(tileObj.bg.x,tileObj.bg.y,8);
        }
      });
    });

    // Hint
    if(data.hint)this.rg.add(this.add.text(W/2,tileArea.y+tileArea.h+10,data.hint,{fontSize:'11px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.4}).setOrigin(0.5).setDepth(5));

    // Number pad for answer
    this._buildNumpad(W/2,H*0.7);
  }

  _buildNumpad(cx,cy) {
    this.inputLbl=this.add.text(cx,cy-40,'Answer: _',{fontSize:'22px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(8);
    this.rg.add(this.inputLbl);
    const keys=['1','2','3','4','5','6','7','8','9','-','0','✓'];
    keys.forEach((k,i)=>{
      const col=i%3;const row=Math.floor(i/3);
      const bx=cx-55+col*55;const by=cy+row*44;
      const isAction=k==='-'||k==='✓';
      const bgCol=k==='✓'?hexToNum(COL_PRIMARY):k==='-'?hexToNum(COL_DANGER):hexToNum(COL_SECONDARY);
      const btn=this.add.rectangle(bx,by,48,38,bgCol,isAction?0.7:0.25).setInteractive({useHandCursor:true}).setDepth(8);
      this.rg.add(btn);
      this.rg.add(this.add.text(bx,by,k,{fontSize:'18px',color:isAction?'#fff':COL_TEXT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(9));
      btn.on('pointerdown',()=>{
        if(k==='✓'){this._check();}
        else if(k==='-'){if(this.inputStr.length===0)this.inputStr='-';else if(this.inputStr==='-')this.inputStr='';}
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
class FactorFinderScene extends Phaser.Scene {
  constructor() { super('FactorFinderScene'); }
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
    const items=data.items;

    // Prompt
    this.rg.add(this.add.text(W/2,H*0.06,data.prompt,{fontSize:'15px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",wordWrap:{width:W-40},align:'center'}).setOrigin(0.5,0).setDepth(6));

    // Build interactive factor tree
    // items contains the number to factor and its prime factors
    // items[0] = number to factor, rest are prime factors
    const rootNum=items[0]||data.target;
    this.treeNodes=[];
    this.selectedPrimes=[];

    // Tree structure: start with root, click to split
    this._buildTreeNode(rootNum,W/2,H*0.2,0);

    // Prime factors selected display
    this.primeLbl=this.add.text(W/2,H*0.7,'Prime factors: (click composites to split)',{fontSize:'12px',color:COL_TEXT,fontFamily:"'Lexend', system-ui"}).setOrigin(0.5).setDepth(6);
    this.rg.add(this.primeLbl);

    // Check button
    const check=this.add.rectangle(W/2,H*0.82,130,42,hexToNum(COL_PRIMARY),1).setInteractive({useHandCursor:true}).setDepth(10);
    this.rg.add(check);this.rg.add(this.add.text(W/2,H*0.82,'Check',{fontSize:'15px',color:'#fff',fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(11));
    check.on('pointerdown',()=>this._check());

    if(data.hint)this.rg.add(this.add.text(W/2,H*0.9,data.hint,{fontSize:'11px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.4}).setOrigin(0.5).setDepth(5));
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

    if(isPrime){
      // Mark as green leaf
      circle.setFillStyle(hexToNum('#44BB44'),0.7);
    }

    if(!isPrime){
      circle.on('pointerdown',()=>{
        if(node.split)return;
        node.split=true;
        circle.setFillStyle(hexToNum(COL_TEXT),0.15);
        circle.removeInteractive();
        // Split into smallest factor and remainder
        const factor=this._findSmallestFactor(num);
        const remainder=num/factor;
        const spread=Math.max(40,60-depth*10);
        const childY=y+55;
        // Draw connecting lines
        this.rg.add(this.add.line(0,0,x,y+nodeR,x-spread,childY-nodeR,hexToNum(COL_TEXT),0.3).setOrigin(0).setDepth(4));
        this.rg.add(this.add.line(0,0,x,y+nodeR,x+spread,childY-nodeR,hexToNum(COL_TEXT),0.3).setOrigin(0).setDepth(4));
        this._buildTreeNode(factor,x-spread,childY,depth+1);
        this._buildTreeNode(remainder,x+spread,childY,depth+1);
        this._updatePrimeDisplay();
      });
    }
  }

  _updatePrimeDisplay() {
    const primes=this.treeNodes.filter(n=>n.isPrime).map(n=>n.num);
    const composites=this.treeNodes.filter(n=>!n.isPrime&&!n.split);
    if(composites.length===0){
      primes.sort((a,b)=>a-b);
      this.primeLbl.setText('Prime factors: '+primes.join(' x '));
      this.primeLbl.setColor(COL_ACCENT);
    }else{
      this.primeLbl.setText('Keep splitting composites...');
      this.primeLbl.setColor(COL_TEXT);
    }
  }

  _check() {
    // Check if all nodes are either prime or split
    const unsplit=this.treeNodes.filter(n=>!n.isPrime&&!n.split);
    if(unsplit.length>0){
      this.cameras.main.shake(200,0.005);
      return;
    }
    const primes=this.treeNodes.filter(n=>n.isPrime).map(n=>n.num);
    const product=primes.reduce((a,b)=>a*b,1);
    // Target should equal product of primes
    if(product===this.treeNodes[0].num){
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
class CategorySortScene extends Phaser.Scene {
  constructor() { super('CategorySortScene'); }
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

    // items array: items to sort. target = count for correct bin.
    // We use items as values to categorize into bins described in the prompt.
    const allItems=data.items.slice();
    const binColors=[hexToNum(COL_PRIMARY),hexToNum(COL_ACCENT),hexToNum('#E8A838'),hexToNum('#C74FE8')];

    // Determine bins: 2 bins (even/odd, positive/negative, etc. — AI decides via prompt)
    const binCount=2;
    this.bins=[];
    this.binCounts=[0,0];
    this.sortedItems=[];

    // Bin labels from prompt — simplified: Bin A and Bin B
    const binLabels=['Bin A','Bin B'];
    const binW=(W-40)/binCount;

    for(let b=0;b<binCount;b++){
      const bx=20+b*binW+binW/2;
      const by=H*0.75;
      this.rg.add(this.add.rectangle(bx,by,binW-10,H*0.18,binColors[b],0.12).setDepth(4));
      this.rg.add(this.add.rectangle(bx,by,binW-10,H*0.18).setStrokeStyle(2,binColors[b],0.4).setDepth(4));
      this.rg.add(this.add.text(bx,by-H*0.08,binLabels[b],{fontSize:'13px',color:'#fff',fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(5));
      const countLbl=this.add.text(bx,by,'0',{fontSize:'24px',color:'#fff',fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6);
      this.rg.add(countLbl);
      this.bins.push({x:bx,y:by,countLbl,w:binW-10});
    }

    // Scatter items in the middle area
    this.itemObjects=[];
    const itemArea={x:W*0.1,y:H*0.18,w:W*0.8,h:H*0.35};

    allItems.forEach((val,i)=>{
      const ix=itemArea.x+30+Math.random()*(itemArea.w-60);
      const iy=itemArea.y+20+Math.random()*(itemArea.h-40);
      const itemBg=this.add.rectangle(ix,iy,56,34,hexToNum(COL_SECONDARY),0.4).setInteractive({useHandCursor:true,draggable:true}).setDepth(7);
      this.rg.add(itemBg);
      const itemLbl=this.add.text(ix,iy,String(val),{fontSize:'15px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(8);
      this.rg.add(itemLbl);
      const itemObj={val,bg:itemBg,lbl:itemLbl,sorted:false,bin:-1};
      this.itemObjects.push(itemObj);

      this.input.setDraggable(itemBg);
      itemBg.on('drag',(pointer,dx,dy)=>{
        itemBg.x=dx;itemBg.y=dy;itemLbl.x=dx;itemLbl.y=dy;
      });
      itemBg.on('dragend',()=>{
        // Check if dropped in a bin
        for(let b=0;b<binCount;b++){
          const bin=this.bins[b];
          if(Math.abs(itemBg.x-bin.x)<bin.w/2&&Math.abs(itemBg.y-bin.y)<H*0.09){
            if(itemObj.bin>=0){this.binCounts[itemObj.bin]--;this.bins[itemObj.bin].countLbl.setText(String(this.binCounts[itemObj.bin]));}
            itemObj.bin=b;itemObj.sorted=true;
            this.binCounts[b]++;bin.countLbl.setText(String(this.binCounts[b]));
            itemBg.setFillStyle(binColors[b],0.5);
            // Snap into bin area
            itemBg.x=bin.x+(Math.random()-0.5)*40;
            itemBg.y=bin.y+(Math.random()-0.5)*20;
            itemLbl.x=itemBg.x;itemLbl.y=itemBg.y;
            return;
          }
        }
      });
    });

    // Answer input for count
    this.rg.add(this.add.text(W/2,H*0.58,'Sort all items, then type the Bin A count:',{fontSize:'12px',color:COL_TEXT,fontFamily:"'Lexend', system-ui"}).setOrigin(0.5).setDepth(6));
    this._buildNumpad(W/2,H*0.92);

    if(data.hint)this.rg.add(this.add.text(W/2,H*0.55,data.hint,{fontSize:'11px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.4}).setOrigin(0.5).setDepth(5));
  }

  _buildNumpad(cx,cy) {
    this.inputLbl=this.add.text(cx,cy-30,'Count: _',{fontSize:'18px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(8);
    this.rg.add(this.inputLbl);
    const keys=['1','2','3','4','5','6','7','8','9','0','⌫','✓'];
    const btnW=36;const btnH=30;const gap=4;
    keys.forEach((k,i)=>{
      const bx=cx-((6*(btnW+gap))/2)+(i*(btnW+gap))+btnW/2;
      const by=cy;
      const isAction=k==='⌫'||k==='✓';
      const bgCol=k==='✓'?hexToNum(COL_PRIMARY):k==='⌫'?hexToNum(COL_DANGER):hexToNum(COL_SECONDARY);
      const btn=this.add.rectangle(bx,by,btnW,btnH,bgCol,isAction?0.7:0.25).setInteractive({useHandCursor:true}).setDepth(8);
      this.rg.add(btn);
      this.rg.add(this.add.text(bx,by,k,{fontSize:'14px',color:isAction?'#fff':COL_TEXT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(9));
      btn.on('pointerdown',()=>{
        if(k==='⌫'){this.inputStr=this.inputStr.slice(0,-1);}
        else if(k==='✓'){this._check();}
        else if(this.inputStr.length<4){this.inputStr+=k;}
        this.inputLbl.setText('Count: '+(this.inputStr||'_'));
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
      this.inputStr='';this.inputLbl.setText('Count: _');
      if(this.lives<=0)this.time.delayedCall(500,()=>this.scene.start('LoseScene',{score:gameScore}));
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
class MeasureAndPlotScene extends Phaser.Scene {
  constructor() { super('MeasureAndPlotScene'); }
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
    const items=data.items;

    // Prompt
    this.rg.add(this.add.text(W/2,H*0.06,data.prompt,{fontSize:'15px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",wordWrap:{width:W-40},align:'center'}).setOrigin(0.5,0).setDepth(6));

    // Ruler visualization
    const rulerLeft=W*0.08,rulerRight=W*0.92,rulerY=H*0.2;
    const rulerW=rulerRight-rulerLeft;
    const maxVal=Math.max(...items,data.target)+2;
    const unitPx=rulerW/maxVal;

    // Ruler background
    this.rg.add(this.add.rectangle(rulerLeft+rulerW/2,rulerY,rulerW,24,hexToNum(COL_SECONDARY),0.15).setDepth(4));
    this.rg.add(this.add.rectangle(rulerLeft+rulerW/2,rulerY,rulerW,24).setStrokeStyle(2,hexToNum(COL_TEXT),0.3).setDepth(4));

    // Ruler ticks and labels
    for(let v=0;v<=maxVal;v++){
      const tx=rulerLeft+v*unitPx;
      const isMajor=v%5===0;
      this.rg.add(this.add.rectangle(tx,rulerY-8,1,isMajor?16:10,hexToNum(COL_TEXT),isMajor?0.6:0.3).setDepth(5));
      if(isMajor)this.rg.add(this.add.text(tx,rulerY+16,String(v),{fontSize:'10px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.6}).setOrigin(0.5,0).setDepth(5));
    }

    // Object to measure — show as a colored bar on the ruler
    const objectLen=items[0]||5;
    const objW=objectLen*unitPx;
    this.rg.add(this.add.rectangle(rulerLeft+objW/2,rulerY-20,objW,14,hexToNum(COL_PRIMARY),0.6).setDepth(6));
    this.rg.add(this.add.rectangle(rulerLeft+objW/2,rulerY-20,objW,14).setStrokeStyle(1,hexToNum(COL_PRIMARY),0.8).setDepth(6));
    this.rg.add(this.add.text(rulerLeft+objW/2,rulerY-20,ITEM_NAME||'Object',{fontSize:'10px',color:'#fff',fontFamily:"'Lexend', system-ui"}).setOrigin(0.5).setDepth(7));

    // Line plot area
    const plotTop=H*0.35,plotH=H*0.25;
    const plotLeft=rulerLeft,plotRight=rulerRight;
    const plotW=plotRight-plotLeft;

    // Plot axis
    this.rg.add(this.add.rectangle(plotLeft+plotW/2,plotTop+plotH,plotW,2,hexToNum(COL_TEXT),0.4).setDepth(5));
    this.rg.add(this.add.text(plotLeft+plotW/2,plotTop+plotH+14,'Measurement values',{fontSize:'10px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.4}).setOrigin(0.5).setDepth(5));

    // Plot ticks
    for(let v=0;v<=maxVal;v++){
      const tx=plotLeft+v*unitPx;
      this.rg.add(this.add.rectangle(tx,plotTop+plotH,1,8,hexToNum(COL_TEXT),0.3).setDepth(5));
      if(v%5===0)this.rg.add(this.add.text(tx,plotTop+plotH+6,String(v),{fontSize:'9px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.5}).setOrigin(0.5,0).setDepth(5));
    }

    // Plot existing data points (items represent previously measured values)
    // Count occurrences for stacking X marks
    const counts={};
    items.forEach(v=>{counts[v]=(counts[v]||0)+1;});
    Object.keys(counts).forEach(v=>{
      const numV=parseInt(v);
      const px=plotLeft+numV*unitPx;
      for(let s=0;s<counts[v];s++){
        const py=plotTop+plotH-12-s*16;
        this.rg.add(this.add.text(px,py,'X',{fontSize:'14px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6));
      }
    });

    // Hint
    if(data.hint)this.rg.add(this.add.text(W/2,plotTop+plotH+28,data.hint,{fontSize:'11px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.4}).setOrigin(0.5).setDepth(5));

    // Number pad for answer
    this._buildNumpad(W/2,H*0.74);
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
`
