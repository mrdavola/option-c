// Grow & Compound engine
// Start with a number. Each round choose how to reinvest. Reach the target.
// 5 rounds of investment decisions.

import type { ThemeConfig, MathParams, GameVariant } from "./engine-types"
import { baseTemplate } from "./base-template"

export function growCompoundEngine(config: ThemeConfig, math: MathParams, variant: GameVariant = "classic"): string {
  const c = config.colors

  const gameContent = `
<div class="intro-overlay" id="intro">
  <div class="intro-box">
    <h2>${config.title}</h2>
    <p>You are a <strong>${config.character}</strong> in a <strong>${config.worldName}</strong>.</p>
    <p>Grow your ${config.itemName} as fast as you can! Pick the best multiplier each round to reach the target.</p>
    <button class="intro-start" onclick="document.getElementById('intro').remove(); startGame()">Play →</button>
  </div>
</div>
<div id="helpPanel" class="help-panel">
  <div class="help-content">
    <h3>How to play</h3>
    <p>You start with a small number. Each round, pick a multiplier (×2, ×3, etc.) to grow. Reach the target number!</p>
    <h3>Valid moves</h3><p>• Start with 2, pick ×3 = 6, then ×2 = 12 ✅</p>
    <h3>Warning</h3><p>• If you overshoot the target, you lose! ❌</p>
    <button class="help-close" onclick="document.getElementById('helpPanel').classList.remove('open')">Got it</button>
  </div>
</div>
<div class="game-header">
  <div class="game-title">${config.title}</div>
  <div class="game-stats">
    <span>Round: <strong id="roundDisplay">1</strong>/8</span>
  </div>
</div>
<div class="game-area" id="gameArea">
  <div style="text-align: center; width: 90%; max-width: 400px;">
    <!-- Target -->
    <div style="margin-bottom: 16px;">
      <div style="font-size: 14px; opacity: 0.6;">Reach this target</div>
      <div id="target" style="font-size: 32px; font-weight: 700; color: ${c.accent};"></div>
    </div>
    <!-- Current value (big) -->
    <div style="margin-bottom: 24px;">
      <div style="font-size: 14px; opacity: 0.6;">Your ${config.itemName}</div>
      <div id="currentVal" style="font-size: 64px; font-weight: 700; color: ${c.primary}; transition: all 0.3s;"></div>
    </div>
    <!-- Progress bar -->
    <div style="width: 100%; height: 12px; background: ${c.secondary}22; border-radius: 6px; margin-bottom: 20px; overflow: hidden;">
      <div id="progressBar" style="height: 100%; background: ${c.accent}; border-radius: 6px; transition: width 0.5s; width: 0;"></div>
    </div>
    <!-- Multiplier choices -->
    <div style="font-size: 14px; opacity: 0.6; margin-bottom: 8px;">Pick your multiplier</div>
    <div id="multipliers" style="display: flex; gap: 12px; justify-content: center;"></div>
    <!-- History -->
    <div id="history" style="margin-top: 20px; font-size: 12px; color: ${c.text}80; min-height: 20px;"></div>
  </div>
</div>
<script>
let currentVal = 0, targetVal = 0, roundNum = 0;
const MAX_ROUNDS = 8;
let historyStr = '';

function pickMultiplier(mult) {
  const newVal = currentVal * mult;
  historyStr += currentVal + ' × ' + mult + ' = ' + newVal + '\\n';
  currentVal = newVal;
  roundNum++;
  document.getElementById('currentVal').textContent = currentVal;
  document.getElementById('roundDisplay').textContent = roundNum;
  document.getElementById('history').textContent = historyStr.split('\\n').slice(-3).join(' → ');
  // Update progress bar
  const pct = Math.min(100, (currentVal / targetVal) * 100);
  document.getElementById('progressBar').style.width = pct + '%';

  if (currentVal === targetVal) {
    // Win!
    window.gameScore = (MAX_ROUNDS - roundNum + 1) * 20;
    const area = document.getElementById('gameArea');
    const rect = area.getBoundingClientRect();
    spawnParticles(rect.left + rect.width/2, rect.top + rect.height/2, '${c.accent}', 16);
    showScorePopup(rect.left + rect.width/2, rect.top + 50, 'Done in ' + roundNum + ' rounds!');
    setTimeout(() => showVictory('${config.winMessage}'), 600);
  } else if (currentVal > targetVal) {
    // Overshoot!
    screenShake();
    document.getElementById('currentVal').style.color = '${c.danger}';
    showScorePopup(window.innerWidth/2, window.innerHeight/2, 'Too much! You overshot by ' + (currentVal - targetVal));
    setTimeout(() => showDefeat('${config.loseMessage}'), 800);
  } else if (roundNum >= MAX_ROUNDS) {
    // Out of rounds
    showScorePopup(window.innerWidth/2, window.innerHeight/2, 'Out of rounds! Needed ' + (targetVal - currentVal) + ' more.');
    setTimeout(() => showDefeat('${config.loseMessage}'), 800);
  } else {
    // Continue — generate new multipliers
    generateMultipliers();
  }
}

function generateMultipliers() {
  const choices = document.getElementById('multipliers');
  choices.innerHTML = '';
  // Always offer ×2, and then 1-2 other options
  const mults = [2];
  if (currentVal * 3 <= targetVal * 1.5) mults.push(3);
  if (currentVal * 4 <= targetVal * 1.5) mults.push(4);
  if (currentVal * 5 <= targetVal * 1.5) mults.push(5);
  // Keep max 4 options
  const shown = mults.slice(0, 4);
  shown.forEach(m => {
    const btn = document.createElement('button');
    btn.textContent = '×' + m;
    btn.style.cssText = 'width: 64px; height: 64px; border-radius: 50%; font-size: 22px; font-weight: 700; cursor: pointer; transition: all 0.15s; border: 3px solid ${c.primary}; background: ${c.primary}22; color: ${c.text}; font-family: inherit;';
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'scale(1.1)';
      btn.style.background = '${c.primary}44';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'scale(1)';
      btn.style.background = '${c.primary}22';
    });
    btn.onclick = () => pickMultiplier(m);
    // Show preview
    const preview = document.createElement('div');
    preview.style.cssText = 'font-size: 10px; color: ${c.text}80; margin-top: 2px;';
    preview.textContent = '= ' + (currentVal * m);
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: flex; flex-direction: column; align-items: center;';
    wrapper.appendChild(btn);
    wrapper.appendChild(preview);
    choices.appendChild(wrapper);
  });
}

function startGame() {
  // Pick a target that's achievable through multiplication
  const base = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
  const steps = Math.floor(Math.random() * 3) + 3; // 3-5 multiplications
  let target = base;
  for (let i = 0; i < steps; i++) {
    target *= [2, 3, 2, 4, 2][Math.floor(Math.random() * 5)];
  }
  currentVal = base;
  targetVal = target;
  roundNum = 0;
  historyStr = '';
  document.getElementById('currentVal').textContent = currentVal;
  document.getElementById('currentVal').style.color = '${c.primary}';
  document.getElementById('target').textContent = targetVal;
  document.getElementById('roundDisplay').textContent = '1';
  document.getElementById('history').textContent = '';
  document.getElementById('progressBar').style.width = Math.round((currentVal / targetVal) * 100) + '%';
  generateMultipliers();
}
</script>`

  // VARIANT B: Population Boom
  if (variant === "variantB") {
    const vB = `
<div class="intro-overlay" id="intro"><div class="intro-box"><h2>${config.title} — Population</h2><p>Grow your colony! Pick multiply or add each generation. Reach the target WITHOUT overshooting!</p><button class="intro-start" onclick="document.getElementById('intro').remove(); startGame()">Grow! →</button></div></div>
<div id="helpPanel" class="help-panel"><div class="help-content"><h3>How to play</h3><p>Each generation, choose ×2, ×3, or +N. Reach the target exactly. Going over = colony collapse!</p><button class="help-close" onclick="document.getElementById('helpPanel').classList.remove('open')">Got it</button></div></div>
<div class="game-header"><div class="game-title">${config.title} — Population</div><div class="game-stats"><span>Gen: <strong id="genD">0</strong></span><span>Score: <strong id="scoreDisplay">0</strong></span></div></div>
<div class="game-area" id="gameArea"><div style="text-align:center;width:90%;max-width:420px;">
  <div style="margin-bottom:12px;"><div style="font-size:14px;opacity:.6;">Target</div><div id="tgt" style="font-size:36px;font-weight:700;color:${c.accent};"></div></div>
  <div style="margin-bottom:16px;"><div style="font-size:14px;opacity:.6;">Population</div><div id="pop" style="font-size:56px;font-weight:700;color:${c.primary};transition:all .3s;"></div></div>
  <div style="width:100%;height:14px;background:${c.secondary}22;border-radius:8px;margin-bottom:20px;overflow:hidden;"><div id="bar" style="height:100%;background:${c.accent};border-radius:8px;transition:width .5s;width:0;"></div></div>
  <div id="opts" style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;"></div>
  <div id="hist" style="margin-top:16px;font-size:12px;color:${c.text}60;min-height:20px;"></div>
</div></div>
<script>
let p=0,tgt=0,gen=0,rn=0,ht='';
function gr(type,v){const old=p;if(type==='m')p*=v;else p+=v;gen++;document.getElementById('genD').textContent=gen;document.getElementById('pop').textContent=p;
ht+=(type==='m'?old+'×'+v:old+'+'+v)+'='+p+' → ';document.getElementById('hist').textContent=ht.slice(-50);
document.getElementById('bar').style.width=Math.min(100,p/tgt*100)+'%';document.getElementById('bar').style.background=p>tgt?'${c.danger}':'${c.accent}';
if(p===tgt){window.gameScore+=Math.max(10,(10-gen+1)*15);document.getElementById('scoreDisplay').textContent=window.gameScore;spawnParticles(window.innerWidth/2,window.innerHeight/2,'${c.accent}',20);rn++;if(rn>=3){setTimeout(()=>showVictory('${config.winMessage}'),600);}else{setTimeout(sr,1000);}}
else if(p>tgt){screenShake();document.getElementById('pop').style.color='${c.danger}';showScorePopup(window.innerWidth/2,window.innerHeight/2,'Overshot by '+(p-tgt)+'!');setTimeout(()=>showDefeat('${config.loseMessage}'),800);}
else if(gen>=10){showDefeat('${config.loseMessage}');}else{genOpts();}}
function genOpts(){const o=document.getElementById('opts');o.innerHTML='';
[2,3].forEach(m=>{if(p*m<=tgt*1.5){const b=document.createElement('button');b.innerHTML='<span style="font-size:22px;font-weight:700;">×'+m+'</span><br><span style="font-size:10px;opacity:.5;">='+p*m+'</span>';
b.style.cssText='width:72px;height:72px;border-radius:50%;border:3px solid ${c.primary};background:${c.primary}22;color:${c.text};cursor:pointer;font-family:inherit;transition:all .15s;';
b.onmouseenter=()=>{b.style.transform='scale(1.1)';};b.onmouseleave=()=>{b.style.transform='scale(1)';};b.onclick=()=>gr('m',m);o.appendChild(b);}});
const rem=tgt-p;if(rem>0){[Math.max(1,Math.floor(rem/4)),Math.max(1,Math.floor(rem/2)),rem].filter((v,i,a)=>a.indexOf(v)===i).slice(0,3).forEach(a=>{
const b=document.createElement('button');b.innerHTML='<span style="font-size:22px;font-weight:700;">+'+a+'</span><br><span style="font-size:10px;opacity:.5;">='+( p+a)+'</span>';
b.style.cssText='width:72px;height:72px;border-radius:50%;border:3px solid ${c.accent};background:${c.accent}22;color:${c.text};cursor:pointer;font-family:inherit;transition:all .15s;';
b.onmouseenter=()=>{b.style.transform='scale(1.1)';};b.onmouseleave=()=>{b.style.transform='scale(1)';};b.onclick=()=>gr('a',a);o.appendChild(b);});}}
function sr(){gen=0;ht='';document.getElementById('hist').textContent='';document.getElementById('genD').textContent='0';document.getElementById('pop').style.color='${c.primary}';
const bases=[2,3,4,5];p=bases[rn%4];let t=p;for(let i=0;i<(rn<1?3:4);i++)t*=[2,3,2][i%3];tgt=t;
document.getElementById('pop').textContent=p;document.getElementById('tgt').textContent=tgt;document.getElementById('bar').style.width=Math.round(p/tgt*100)+'%';genOpts();}
function startGame(){sr();}
</script>`
    return baseTemplate(config, vB, variant, 60)
  }

  // VARIANT C: Doubling Maze
  if (variant === "variantC") {
    const vC = `
<div class="intro-overlay" id="intro"><div class="intro-box"><h2>${config.title} — Maze</h2><p>Navigate the maze! At each fork, pick a multiplier. Reach the target at the end!</p><button class="intro-start" onclick="document.getElementById('intro').remove(); startGame()">Enter! →</button></div></div>
<div id="helpPanel" class="help-panel"><div class="help-content"><h3>How to play</h3><p>Start with a number. At each fork choose ×2, ×3, or ×4. After all steps your value must equal the target.</p><h3>Think ahead!</h3><p>3 × 4 = 12, then 12 × 4 = 48. Plan your path!</p><button class="help-close" onclick="document.getElementById('helpPanel').classList.remove('open')">Got it</button></div></div>
<div class="game-header"><div class="game-title">${config.title} — Maze</div><div class="game-stats"><span>Score: <strong id="scoreDisplay">0</strong></span><span>Step: <strong id="stepD">1</strong>/<strong id="totalS">3</strong></span></div></div>
<div class="game-area" id="gameArea"><div style="text-align:center;width:90%;max-width:420px;">
  <div style="margin-bottom:12px;"><div style="font-size:14px;opacity:.6;">Target</div><div id="mTgt" style="font-size:36px;font-weight:700;color:${c.accent};"></div></div>
  <div style="margin-bottom:20px;"><div style="font-size:14px;opacity:.6;">Your value</div><div id="mVal" style="font-size:56px;font-weight:700;color:${c.primary};transition:all .3s;"></div></div>
  <div id="pathD" style="display:flex;align-items:center;justify-content:center;gap:4px;margin-bottom:20px;font-size:14px;color:${c.text}80;flex-wrap:wrap;min-height:24px;"></div>
  <div style="font-size:13px;opacity:.5;margin-bottom:8px;">Choose your path</div>
  <div id="forks" style="display:flex;gap:16px;justify-content:center;"></div>
</div></div>
<script>
let val=0,tgt2=0,step=0,ts=0,rn2=0,cp=[];
function choose(m){const old=val;val*=m;step++;document.getElementById('mVal').textContent=val;document.getElementById('stepD').textContent=Math.min(step+1,ts);
const pd=document.getElementById('pathD');const s=document.createElement('span');s.innerHTML=old+' <span style="color:${c.accent}">×'+m+'</span> → <strong style="color:${c.primary}">'+val+'</strong>';
if(pd.childElementCount>0){const a=document.createElement('span');a.textContent=' then ';a.style.color='${c.text}44';pd.appendChild(a);}pd.appendChild(s);
spawnParticles(window.innerWidth/2,window.innerHeight/2,'${c.primary}',6);
if(step>=ts){if(val===tgt2){window.gameScore+=20*(rn2+1);document.getElementById('scoreDisplay').textContent=window.gameScore;spawnParticles(window.innerWidth/2,window.innerHeight/2,'${c.accent}',20);addCombo();
rn2++;if(rn2>=3){setTimeout(()=>showVictory('${config.winMessage}'),600);}else{setTimeout(sr2,1000);}}
else{screenShake();resetCombo();document.getElementById('mVal').style.color='${c.danger}';showScorePopup(window.innerWidth/2,window.innerHeight/2,val>tgt2?'Overshot!':'Fell short!');setTimeout(()=>showDefeat('${config.loseMessage}'),800);}}
else{genFork();}}
function genFork(){const fk=document.getElementById('forks');fk.innerHTML='';const cm=cp[step];const ms=new Set([cm]);
while(ms.size<3){ms.add([2,3,4,5][Math.floor(Math.random()*4)]);}
const sh=[...ms];for(let i=sh.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[sh[i],sh[j]]=[sh[j],sh[i]];}
sh.forEach(m=>{const b=document.createElement('button');b.innerHTML='<span style="font-size:28px;font-weight:700;">×'+m+'</span><br><span style="font-size:11px;opacity:.5;">= '+(val*m)+'</span>';
b.style.cssText='width:80px;height:80px;border-radius:16px;border:3px solid ${c.primary};background:${c.primary}11;color:${c.text};cursor:pointer;font-family:inherit;transition:all .2s;';
b.onmouseenter=()=>{b.style.transform='scale(1.1)';b.style.background='${c.primary}33';};b.onmouseleave=()=>{b.style.transform='scale(1)';b.style.background='${c.primary}11';};
b.onclick=()=>choose(m);fk.appendChild(b);});}
function sr2(){step=0;document.getElementById('pathD').innerHTML='';document.getElementById('mVal').style.color='${c.primary}';
const sv=[2,3,4,5];val=sv[rn2%4];ts=rn2<1?2:rn2<2?3:4;document.getElementById('totalS').textContent=ts;document.getElementById('stepD').textContent='1';
cp=[];let t=val;for(let i=0;i<ts;i++){const m=[2,3,2,4][i%4];cp.push(m);t*=m;}tgt2=t;
document.getElementById('mVal').textContent=val;document.getElementById('mTgt').textContent=tgt2;genFork();}
function startGame(){sr2();}
</script>`
    return baseTemplate(config, vC, variant, 60)
  }

  return baseTemplate(config, gameContent, variant, 60)
}
