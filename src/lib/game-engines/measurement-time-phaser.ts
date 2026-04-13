// Clock & Time — Phaser engine with 3 game options.
// Math: Tell time, read clocks, calculate elapsed time.
// Options: clock-reader, time-matcher, time-elapsed

import type { ThemeConfig, MathParams, GameOption } from "./engine-types"
import { phaserGame } from "./base-phaser-template"
import { getOptionDef } from "./game-option-registry"

export function measurementTimePhaserEngine(
  config: ThemeConfig,
  math: MathParams,
  option: GameOption = "clock-reader"
): string {
  const validOptions = ["clock-reader", "time-matcher", "time-elapsed"]
  const activeOption = validOptions.includes(option) ? option : "clock-reader"
  const optDef = getOptionDef(activeOption)
  const sceneMap: Record<string, string> = {
    "clock-reader": "ClockReaderScene",
    "time-matcher": "TimeMatcherScene",
    "time-elapsed": "TimeElapsedScene",
  }
  return phaserGame({
    config, math, option: activeOption,
    sceneName: sceneMap[activeOption],
    introText: optDef?.introText || "Read the clock!",
    helpText: optDef?.helpText || "Tell the time shown on the clock.",
    gameSceneCode: GAME_SCENES,
  })
}

const GAME_SCENES = `
// Draw an analog clock face
function drawClock(scene, x, y, radius, hour, minute) {
  const g = scene.add.graphics();
  // Clock face
  g.fillStyle(hexToNum(COL_SECONDARY), 0.15);
  g.fillCircle(x, y, radius);
  g.lineStyle(3, hexToNum(COL_TEXT), 0.5);
  g.strokeCircle(x, y, radius);
  // Hour marks
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const inner = radius * 0.82;
    const outer = radius * 0.92;
    g.lineStyle(2, hexToNum(COL_TEXT), 0.6);
    g.beginPath();
    g.moveTo(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner);
    g.lineTo(x + Math.cos(angle) * outer, y + Math.sin(angle) * outer);
    g.strokePath();
    // Number
    const nx = x + Math.cos(angle) * (radius * 0.7);
    const ny = y + Math.sin(angle) * (radius * 0.7);
    scene.add.text(nx, ny, String(i === 0 ? 12 : i), {
      fontSize: radius > 60 ? '14px' : '10px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6);
  }
  // Minute hand
  const minAngle = (minute / 60) * Math.PI * 2 - Math.PI / 2;
  g.lineStyle(3, hexToNum(COL_PRIMARY), 1);
  g.beginPath();
  g.moveTo(x, y);
  g.lineTo(x + Math.cos(minAngle) * radius * 0.75, y + Math.sin(minAngle) * radius * 0.75);
  g.strokePath();
  // Hour hand
  const hourAngle = ((hour % 12 + minute / 60) / 12) * Math.PI * 2 - Math.PI / 2;
  g.lineStyle(4, hexToNum(COL_ACCENT), 1);
  g.beginPath();
  g.moveTo(x, y);
  g.lineTo(x + Math.cos(hourAngle) * radius * 0.5, y + Math.sin(hourAngle) * radius * 0.5);
  g.strokePath();
  // Center dot
  g.fillStyle(hexToNum(COL_TEXT), 1);
  g.fillCircle(x, y, 4);
  return g;
}

function generateTimeRound(round) {
  const data = getRound(round);
  // Generate a random time if no AI rounds
  let hour, minute;
  if (round < 2) { hour = Math.floor(Math.random() * 12) + 1; minute = [0, 30][Math.floor(Math.random() * 2)]; }
  else if (round < 4) { hour = Math.floor(Math.random() * 12) + 1; minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)]; }
  else { hour = Math.floor(Math.random() * 12) + 1; minute = Math.floor(Math.random() * 12) * 5; }
  return { hour, minute, prompt: data.prompt, hint: data.hint };
}

// ═══════════════════════════════════════════════════════════════════════════════
class ClockReaderScene extends Phaser.Scene {
  constructor() { super('ClockReaderScene'); }
  create() { this.W=this.scale.width;this.H=this.scale.height;this.round=0;this.lives=MAX_LIVES;this._bg();this._ui();this.hero=addCharacter(this,this.W*0.85,this.H*0.35,0.4);this.startRound(); }
  _bg() { const bg=this.add.image(this.W/2,this.H/2,'bg');bg.setScale(Math.max(this.W/bg.width,this.H/bg.height));this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.65); }
  _ui() { this.scoreLbl=this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);this.hg=this.add.group();this._rh();this.dg=this.add.group();this._rd(); }
  _rh() { this.hg.clear(true,true);for(let i=0;i<this.lives;i++)this.hg.add(this.add.text(14+i*22,14,'♥',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dg.clear(true,true);for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  startRound() {
    if(this.rg)this.rg.clear(true,true);this.rg=this.add.group();
    const data=generateTimeRound(this.round);this.correctHour=data.hour;this.correctMinute=data.minute;this._rd();
    const W=this.W,H=this.H;
    this.rg.add(this.add.text(W/2,30,'What time is it?',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6));
    // Draw clock
    if(this.clockGraphics)this.clockGraphics.destroy();
    this.clockGraphics=drawClock(this,W*0.35,H*0.38,Math.min(W*0.18,80),data.hour,data.minute);
    // Input: hour and minute
    this.hourInput='';this.minInput='';this.editingHour=true;
    this.hourLbl=this.add.text(W*0.65,H*0.3,'_',{fontSize:'36px',color:COL_PRIMARY,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(10);
    this.rg.add(this.hourLbl);
    this.rg.add(this.add.text(W*0.65+25,H*0.3,':',{fontSize:'36px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(10));
    this.minLbl=this.add.text(W*0.65+55,H*0.3,'__',{fontSize:'36px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif"}).setOrigin(0.5).setDepth(10);
    this.rg.add(this.minLbl);
    // Number pad
    for(let i=0;i<=9;i++){const c=i<5?i:i-5;const r=i<5?0:1;const x=W*0.65-80+c*40;const y=H*0.5+r*40;
      const btn=this.add.rectangle(x,y,34,32,hexToNum(COL_SECONDARY),0.4).setInteractive({useHandCursor:true}).setDepth(10);
      this.add.text(x,y,String(i),{fontSize:'16px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(11);
      btn.on('pointerdown',()=>{
        if(this.editingHour){if(this.hourInput.length<2){this.hourInput+=String(i);this.hourLbl.setText(this.hourInput);if(this.hourInput.length===2||parseInt(this.hourInput)>1){this.editingHour=false;this.minLbl.setColor(COL_PRIMARY);this.hourLbl.setColor(COL_TEXT);}}}
        else{if(this.minInput.length<2){this.minInput+=String(i);this.minLbl.setText(this.minInput.padEnd(2,'_'));}}
      });this.rg.add(btn);}
    // Check button
    const sub=this.add.rectangle(W*0.65,H*0.5+95,100,36,hexToNum(COL_PRIMARY),1).setInteractive({useHandCursor:true}).setDepth(10);
    this.add.text(W*0.65,H*0.5+95,'Check',{fontSize:'14px',color:'#fff',fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(11);
    sub.on('pointerdown',()=>this._check());this.rg.add(sub);
  }

  _check() {
    const h=parseInt(this.hourInput);const m=parseInt(this.minInput);
    if(h===this.correctHour&&m===this.correctMinute){
      gameScore+=10*(this.round+1);this.scoreLbl.setText('Score: '+gameScore);this.cameras.main.flash(200,34,197,94);heroCheer(this,this.hero);
      this.round++;if(this.round>=TOTAL_ROUNDS)this.time.delayedCall(600,()=>this.scene.start('VictoryScene',{score:gameScore}));
      else this.time.delayedCall(800,()=>this.startRound());
    }else{this.lives--;this._rh();this.cameras.main.shake(200,0.01);heroShake(this,this.hero);this.hourInput='';this.minInput='';this.editingHour=true;this.hourLbl.setText('_');this.hourLbl.setColor(COL_PRIMARY);this.minLbl.setText('__');this.minLbl.setColor(COL_TEXT);
      if(this.lives<=0)this.time.delayedCall(500,()=>this.scene.start('LoseScene',{score:gameScore}));}
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
class TimeMatcherScene extends Phaser.Scene {
  constructor() { super('TimeMatcherScene'); }
  create() { this.W=this.scale.width;this.H=this.scale.height;this.round=0;this.lives=MAX_LIVES;this._bg();this._ui();this.hero=addCharacter(this,this.W*0.85,this.H*0.35,0.4);this.startRound(); }
  _bg() { const bg=this.add.image(this.W/2,this.H/2,'bg');bg.setScale(Math.max(this.W/bg.width,this.H/bg.height));this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.65); }
  _ui() { this.scoreLbl=this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);this.hg=this.add.group();this._rh();this.dg=this.add.group();this._rd(); }
  _rh() { this.hg.clear(true,true);for(let i=0;i<this.lives;i++)this.hg.add(this.add.text(14+i*22,14,'♥',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dg.clear(true,true);for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  startRound() {
    if(this.rg)this.rg.clear(true,true);this.rg=this.add.group();
    const data=generateTimeRound(this.round);this.correctHour=data.hour;this.correctMinute=data.minute;this._rd();
    const W=this.W,H=this.H;
    this.rg.add(this.add.text(W/2,30,'Match the clock to the digital time',{fontSize:'14px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui"}).setOrigin(0.5).setDepth(6));
    if(this.clockGraphics)this.clockGraphics.destroy();
    this.clockGraphics=drawClock(this,W/2,H*0.32,Math.min(W*0.2,90),data.hour,data.minute);
    // Generate 4 choices (1 correct, 3 wrong)
    const correct=String(data.hour)+':'+(data.minute<10?'0':'')+data.minute;
    const wrongs=new Set();
    while(wrongs.size<3){
      const wh=Math.floor(Math.random()*12)+1;const wm=[0,15,30,45][Math.floor(Math.random()*4)];
      const ws=String(wh)+':'+(wm<10?'0':'')+wm;
      if(ws!==correct)wrongs.add(ws);
    }
    const choices=[correct,...Array.from(wrongs)];
    for(let i=choices.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]];}
    // Display choices
    const gap=Math.min(120,(W*0.8)/4);const sx=W/2-((3)*gap)/2;
    choices.forEach((ch,i)=>{
      const x=sx+i*gap;const y=H*0.65;
      const btn=this.add.rectangle(x,y,90,44,hexToNum(COL_SECONDARY),0.3).setStrokeStyle(2,hexToNum(COL_PRIMARY),0.3).setInteractive({useHandCursor:true}).setDepth(7);
      this.rg.add(btn);
      this.rg.add(this.add.text(x,y,ch,{fontSize:'18px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(8));
      btn.on('pointerdown',()=>{
        if(ch===correct){
          gameScore+=10*(this.round+1);this.scoreLbl.setText('Score: '+gameScore);this.cameras.main.flash(200,34,197,94);heroCheer(this,this.hero);
          this.round++;if(this.round>=TOTAL_ROUNDS)this.time.delayedCall(600,()=>this.scene.start('VictoryScene',{score:gameScore}));
          else this.time.delayedCall(800,()=>this.startRound());
        }else{this.lives--;this._rh();this.cameras.main.shake(200,0.01);heroShake(this,this.hero);
          if(this.lives<=0)this.time.delayedCall(500,()=>this.scene.start('LoseScene',{score:gameScore}));}
      });
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
class TimeElapsedScene extends Phaser.Scene {
  constructor() { super('TimeElapsedScene'); }
  create() { this.W=this.scale.width;this.H=this.scale.height;this.round=0;this.lives=MAX_LIVES;this._bg();this._ui();this.hero=addCharacter(this,this.W*0.85,this.H*0.35,0.4);this.startRound(); }
  _bg() { const bg=this.add.image(this.W/2,this.H/2,'bg');bg.setScale(Math.max(this.W/bg.width,this.H/bg.height));this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.65); }
  _ui() { this.scoreLbl=this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);this.hg=this.add.group();this._rh();this.dg=this.add.group();this._rd(); }
  _rh() { this.hg.clear(true,true);for(let i=0;i<this.lives;i++)this.hg.add(this.add.text(14+i*22,14,'♥',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dg.clear(true,true);for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  startRound() {
    if(this.rg)this.rg.clear(true,true);this.rg=this.add.group();this._rd();
    const W=this.W,H=this.H;
    // Generate start and end times
    const startH=Math.floor(Math.random()*11)+1;const startM=[0,15,30,45][Math.floor(Math.random()*4)];
    const elapsedH=this.round<2?Math.floor(Math.random()*2)+1:Math.floor(Math.random()*3)+1;
    const elapsedM=this.round<2?0:[0,15,30][Math.floor(Math.random()*3)];
    const endM=(startM+elapsedM)%60;const endH=(startH+elapsedH+Math.floor((startM+elapsedM)/60))%12||12;
    this.correctElapsed=elapsedH*60+elapsedM;
    this.rg.add(this.add.text(W/2,25,'How much time passed?',{fontSize:'14px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui"}).setOrigin(0.5).setDepth(6));
    // Draw two clocks
    if(this.cg1)this.cg1.destroy();if(this.cg2)this.cg2.destroy();
    const r=Math.min(W*0.14,65);
    this.cg1=drawClock(this,W*0.25,H*0.32,r,startH,startM);
    this.rg.add(this.add.text(W*0.25,H*0.32+r+15,'Start: '+startH+':'+(startM<10?'0':'')+startM,{fontSize:'12px',color:COL_TEXT,fontFamily:"'Lexend', system-ui"}).setOrigin(0.5).setDepth(6));
    this.cg2=drawClock(this,W*0.75,H*0.32,r,endH,endM);
    this.rg.add(this.add.text(W*0.75,H*0.32+r+15,'End: '+endH+':'+(endM<10?'0':'')+endM,{fontSize:'12px',color:COL_TEXT,fontFamily:"'Lexend', system-ui"}).setOrigin(0.5).setDepth(6));
    this.rg.add(this.add.text(W/2,H*0.32,'→',{fontSize:'28px',color:COL_ACCENT,fontFamily:'sans-serif'}).setOrigin(0.5).setDepth(6));
    // Answer: hours and minutes input
    this.hInput='';this.mInput='';this.editH=true;
    this.hLbl=this.add.text(W/2-20,H*0.62,'_ hr',{fontSize:'24px',color:COL_PRIMARY,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(10);this.rg.add(this.hLbl);
    this.mLbl=this.add.text(W/2+50,H*0.62,'_ min',{fontSize:'24px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif"}).setOrigin(0.5).setDepth(10);this.rg.add(this.mLbl);
    for(let i=0;i<=9;i++){const c=i<5?i:i-5;const row=i<5?0:1;const x=W/2-80+c*40;const y=H*0.74+row*40;
      const btn=this.add.rectangle(x,y,34,32,hexToNum(COL_SECONDARY),0.4).setInteractive({useHandCursor:true}).setDepth(10);
      this.add.text(x,y,String(i),{fontSize:'16px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(11);
      btn.on('pointerdown',()=>{
        if(this.editH){if(this.hInput.length<2){this.hInput+=String(i);this.hLbl.setText(this.hInput+' hr');if(this.hInput.length>=1&&parseInt(this.hInput)<=12){this.editH=false;this.mLbl.setColor(COL_PRIMARY);this.hLbl.setColor(COL_TEXT);}}}
        else{if(this.mInput.length<2){this.mInput+=String(i);this.mLbl.setText(this.mInput+' min');}}
      });this.rg.add(btn);}
    const sub=this.add.rectangle(W/2,H*0.74+95,100,36,hexToNum(COL_PRIMARY),1).setInteractive({useHandCursor:true}).setDepth(10);
    this.add.text(W/2,H*0.74+95,'Check',{fontSize:'14px',color:'#fff',fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(11);
    sub.on('pointerdown',()=>this._check());this.rg.add(sub);
  }

  _check() {
    const h=parseInt(this.hInput)||0;const m=parseInt(this.mInput)||0;
    if(h*60+m===this.correctElapsed){
      gameScore+=10*(this.round+1);this.scoreLbl.setText('Score: '+gameScore);this.cameras.main.flash(200,34,197,94);heroCheer(this,this.hero);
      this.round++;if(this.round>=TOTAL_ROUNDS)this.time.delayedCall(600,()=>this.scene.start('VictoryScene',{score:gameScore}));
      else this.time.delayedCall(800,()=>this.startRound());
    }else{this.lives--;this._rh();this.cameras.main.shake(200,0.01);heroShake(this,this.hero);this.hInput='';this.mInput='';this.editH=true;this.hLbl.setText('_ hr');this.hLbl.setColor(COL_PRIMARY);this.mLbl.setText('_ min');this.mLbl.setColor(COL_TEXT);
      if(this.lives<=0)this.time.delayedCall(500,()=>this.scene.start('LoseScene',{score:gameScore}));}
  }
}
`
