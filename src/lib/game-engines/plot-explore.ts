// Plot & Explore engine
// Coordinate grid. Click the right (x,y) position to find targets.
// 5 rounds, progressive difficulty.

import type { ThemeConfig, MathParams, GameVariant } from "./engine-types"
import { baseTemplate } from "./base-template"

export function plotExploreEngine(config: ThemeConfig, math: MathParams, variant: GameVariant = "classic"): string {
  const c = config.colors

  const gameContent = `
<div class="intro-overlay" id="intro">
  <div class="intro-box">
    <h2>${config.title}</h2>
    <p>You are a <strong>${config.character}</strong> in a <strong>${config.worldName}</strong>.</p>
    <p>Find ${config.itemName} by clicking on the correct coordinates!</p>
    <button class="intro-start" onclick="document.getElementById('intro').remove(); startGame()">Play →</button>
  </div>
</div>

<div id="helpPanel" class="help-panel">
  <div class="help-content">
    <h3>How to play</h3>
    <p>A coordinate like (3, 4) appears. Click that spot on the grid. X goes right, Y goes up.</p>
    <h3>Valid moves</h3>
    <p>• Target (2, 3) → click where x=2 and y=3 meet ✅</p>
    <h3>Invalid moves</h3>
    <p>• Clicking (3, 2) when target is (2, 3) — x and y are swapped ❌</p>
    <button class="help-close" onclick="document.getElementById('helpPanel').classList.remove('open')">Got it</button>
  </div>
</div>

<div class="game-header">
  <div class="game-title">${config.title}</div>
  <div class="game-stats">
    <span>Score: <strong id="scoreDisplay">0</strong></span>
    <div class="round-dots" id="roundDots"></div>
  </div>
</div>

<div class="game-area" id="gameArea">
  <div style="display: flex; align-items: center; gap: 32px;">
    <!-- Grid -->
    <div style="position: relative;">
      <canvas id="grid" width="320" height="320" style="border: 2px solid ${c.secondary}; border-radius: 8px; cursor: crosshair;"></canvas>
    </div>
    <!-- Target info -->
    <div style="text-align: center;">
      <div style="font-size: 14px; opacity: 0.6;">Find the ${config.itemName} at</div>
      <div id="targetCoord" style="font-size: 42px; font-weight: 700; color: ${c.accent}; margin: 8px 0;">(?, ?)</div>
      <div style="font-size: 12px; opacity: 0.4;">Click the right spot on the grid</div>
      <div id="feedback" style="font-size: 14px; margin-top: 12px; min-height: 20px;"></div>
    </div>
  </div>
</div>

<div class="game-footer">${config.dare || 'Plot the coordinates!'}</div>

<script>
const TOTAL_ROUNDS = 5;
let currentRound = 0;
let targetX = 0, targetY = 0;
let gridSize = 6; // 0 to gridSize
const canvas = document.getElementById('grid');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

function drawGrid() {
  ctx.clearRect(0, 0, W, H);
  const cellW = W / (gridSize + 1);
  const cellH = H / (gridSize + 1);

  // Background
  ctx.fillStyle = '${c.bg}';
  ctx.fillRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = '${c.secondary}44';
  ctx.lineWidth = 1;
  for (let i = 0; i <= gridSize; i++) {
    const x = (i + 0.5) * cellW;
    const y = H - (i + 0.5) * cellH;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Axes (thicker)
  ctx.strokeStyle = '${c.secondary}';
  ctx.lineWidth = 2;
  const originX = 0.5 * cellW;
  const originY = H - 0.5 * cellH;
  ctx.beginPath(); ctx.moveTo(originX, 0); ctx.lineTo(originX, H); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, originY); ctx.lineTo(W, originY); ctx.stroke();

  // Labels
  ctx.fillStyle = '${c.text}';
  ctx.font = '11px Lexend, sans-serif';
  ctx.textAlign = 'center';
  for (let i = 0; i <= gridSize; i++) {
    // X labels (bottom)
    ctx.fillText(i.toString(), (i + 0.5) * cellW, H - 4);
    // Y labels (left)
    ctx.textAlign = 'right';
    ctx.fillText(i.toString(), 0.5 * cellW - 4, H - (i + 0.5) * cellH + 4);
    ctx.textAlign = 'center';
  }

  // Target marker (star)
  const tx = (targetX + 0.5) * cellW;
  const ty = H - (targetY + 0.5) * cellH;
  ctx.fillStyle = '${c.accent}33';
  ctx.beginPath();
  ctx.arc(tx, ty, 14, 0, Math.PI * 2);
  ctx.fill();
}

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const cellW = W / (gridSize + 1);
  const cellH = H / (gridSize + 1);

  const clickX = Math.round(mx / cellW - 0.5);
  const clickY = Math.round((H - my) / cellH - 0.5);

  if (clickX === targetX && clickY === targetY) {
    // Correct!
    window.gameScore += 10 * (currentRound + 1);
    document.getElementById('scoreDisplay').textContent = window.gameScore;
    spawnParticles(e.clientX, e.clientY, '${c.accent}', 10);
    addCombo();
    showScorePopup(e.clientX, e.clientY - 20, '+' + (10 * (currentRound + 1)));
    document.getElementById('feedback').textContent = '';

    const dots = document.querySelectorAll('.round-dot');
    if (dots[currentRound]) dots[currentRound].classList.add('done');
    currentRound++;
    if (currentRound >= TOTAL_ROUNDS) {
      setTimeout(() => showVictory('${config.winMessage}'), 500);
    } else {
      setTimeout(startRound, 600);
    }
  } else {
    screenShake(); resetCombo(); trackFail();
    const fb = document.getElementById('feedback');
    fb.style.color = '${c.danger}';
    fb.textContent = 'You clicked (' + clickX + ', ' + clickY + ') — try again!';
  }
});

function startRound() { resetFails();
  if (currentRound < 2) gridSize = 5;
  else if (currentRound < 4) gridSize = 7;
  else gridSize = 10;

  targetX = Math.floor(Math.random() * gridSize) + 1;
  targetY = Math.floor(Math.random() * gridSize) + 1;

  document.getElementById('targetCoord').textContent = '(' + targetX + ', ' + targetY + ')';
  document.getElementById('feedback').textContent = '';
  drawGrid();

  const dots = document.querySelectorAll('.round-dot');
  dots.forEach((d, i) => { d.classList.remove('current'); if (i === currentRound) d.classList.add('current'); });
}

function startGame() {
  const dotsContainer = document.getElementById('roundDots');
  dotsContainer.innerHTML = '';
  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const dot = document.createElement('div');
    dot.className = 'round-dot';
    dotsContainer.appendChild(dot);
  }
  startRound();
}
</script>
`

  // VARIANT B: Battleship — call coordinates to sink hidden items
  if (variant === "variantB") {
    const vB = `
<div class="intro-overlay" id="intro"><div class="intro-box"><h2>${config.title} — Battleship</h2><p>Hidden ${config.itemName} are on the grid! Call coordinates to find them.</p><button class="intro-start" onclick="document.getElementById('intro').remove(); startGame()">Play →</button></div></div>
<div id="helpPanel" class="help-panel"><div class="help-content"><h3>How to play</h3><p>Click grid squares to search. Green = hit, red = miss. Find all 5!</p><button class="help-close" onclick="document.getElementById('helpPanel').classList.remove('open')">Got it</button></div></div>
<div class="game-header"><div class="game-title">${config.title} — Battleship</div><div class="game-stats"><span>Shots: <strong id="shotCount">0</strong></span><span>Found: <strong id="hitCount">0</strong>/5</span></div></div>
<div class="game-area" id="gameArea">
  <div style="text-align: center;"><div id="grid" style="display: inline-grid; gap: 2px;"></div></div>
</div>
<script>
let gSize=6,ships=new Set(),revealed=new Set(),shots=0,hits=0;
function cid(x,y){return x+','+y}
function render(){const g=document.getElementById('grid');g.style.gridTemplateColumns='repeat('+(gSize+1)+',34px)';g.innerHTML='';
const c0=document.createElement('div');c0.style.cssText='width:34px;height:34px;';g.appendChild(c0);
for(let x=0;x<gSize;x++){const h=document.createElement('div');h.style.cssText='width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:11px;color:${c.text}80;';h.textContent=x;g.appendChild(h);}
for(let y=0;y<gSize;y++){const l=document.createElement('div');l.style.cssText='width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:11px;color:${c.text}80;';l.textContent=y;g.appendChild(l);
for(let x=0;x<gSize;x++){const cell=document.createElement('button');const id=cid(x,y);
let bg=revealed.has(id)?(ships.has(id)?'${c.accent}44':'${c.danger}22'):'${c.primary}11';
cell.style.cssText='width:34px;height:34px;border-radius:4px;border:1px solid ${c.primary}33;background:'+bg+';cursor:'+(revealed.has(id)?'default':'pointer')+';font-size:14px;';
if(revealed.has(id))cell.textContent=ships.has(id)?'✓':'·';
if(!revealed.has(id))cell.onclick=()=>{revealed.add(id);shots++;document.getElementById('shotCount').textContent=shots;
if(ships.has(id)){hits++;document.getElementById('hitCount').textContent=hits;spawnParticles(window.innerWidth/2,window.innerHeight/2,'${c.accent}',8);addCombo();
if(hits>=5){window.gameScore=Math.max(10,100-shots*5);setTimeout(()=>showVictory('${config.winMessage}'),500);}}else{resetCombo();}render();};
g.appendChild(cell);}}}
function startGame(){ships=new Set();revealed=new Set();shots=0;hits=0;document.getElementById('hitCount').textContent='0';document.getElementById('shotCount').textContent='0';
while(ships.size<5)ships.add(cid(Math.floor(Math.random()*gSize),Math.floor(Math.random()*gSize)));render();}
</script>`
    return baseTemplate(config, vB, variant, 40)
  }

  // VARIANT C: Treasure Trail — follow coordinate clues
  if (variant === "variantC") {
    const vC = `
<div class="intro-overlay" id="intro"><div class="intro-box"><h2>${config.title} — Trail</h2><p>Follow the clues! Each one gives you coordinates to click.</p><button class="intro-start" onclick="document.getElementById('intro').remove(); startGame()">Play →</button></div></div>
<div id="helpPanel" class="help-panel"><div class="help-content"><h3>How to play</h3><p>A clue says "Go to (3,4)". Click that spot on the grid. 5 correct clicks = treasure found!</p><button class="help-close" onclick="document.getElementById('helpPanel').classList.remove('open')">Got it</button></div></div>
<div class="game-header"><div class="game-title">${config.title} — Trail</div><div class="game-stats"><span>Score: <strong id="scoreDisplay">0</strong></span><span>Step: <strong id="stepD">1</strong>/5</span></div></div>
<div class="game-area" id="gameArea">
  <div style="display:flex;gap:24px;align-items:center;">
    <canvas id="tg" width="260" height="260" style="border:2px solid ${c.secondary};border-radius:8px;cursor:crosshair;"></canvas>
    <div style="text-align:center;"><div style="font-size:12px;opacity:.5;">CLUE</div><div id="clue" style="font-size:20px;font-weight:700;color:${c.accent};margin:8px 0;"></div><div id="trail" style="font-size:11px;color:${c.text}80;text-align:left;"></div></div>
  </div>
</div>
<script>
let step=0,tgts=[],gS=7;const cv=document.getElementById('tg'),cx=cv.getContext('2d');
function draw(){cx.clearRect(0,0,260,260);const cl=260/(gS+1);cx.strokeStyle='${c.secondary}33';cx.lineWidth=1;
for(let i=0;i<=gS;i++){const p=(i+.5)*cl;cx.beginPath();cx.moveTo(p,0);cx.lineTo(p,260);cx.stroke();cx.beginPath();cx.moveTo(0,p);cx.lineTo(260,p);cx.stroke();}
cx.fillStyle='${c.text}';cx.font='10px sans-serif';cx.textAlign='center';
for(let i=0;i<=gS;i++){cx.fillText(i+'',(i+.5)*cl,256);cx.fillText(i+'',8,260-(i+.5)*cl+3);}
for(let i=0;i<step;i++){const t=tgts[i];cx.fillStyle='${c.accent}44';cx.beginPath();cx.arc((t.x+.5)*cl,260-(t.y+.5)*cl,7,0,Math.PI*2);cx.fill();}}
cv.addEventListener('click',(e)=>{const r=cv.getBoundingClientRect(),cl=260/(gS+1);const mx=e.clientX-r.left,my=e.clientY-r.top;
const x=Math.round(mx/cl-.5),y=Math.round((260-my)/cl-.5);const t=tgts[step];
if(x===t.x&&y===t.y){step++;document.getElementById('stepD').textContent=Math.min(step+1,5);window.gameScore+=10;document.getElementById('scoreDisplay').textContent=window.gameScore;
spawnParticles(e.clientX,e.clientY,'${c.accent}',8);addCombo();draw();
if(step>=5){setTimeout(()=>showVictory('${config.winMessage}'),500);}
else{document.getElementById('clue').textContent='Go to ('+tgts[step].x+', '+tgts[step].y+')';}}
else{screenShake();resetCombo();trackFail();}});
function startGame(){step=0;tgts=[];for(let i=0;i<5;i++)tgts.push({x:Math.floor(Math.random()*gS),y:Math.floor(Math.random()*gS)});
document.getElementById('clue').textContent='Go to ('+tgts[0].x+', '+tgts[0].y+')';document.getElementById('stepD').textContent='1';draw();}
</script>`
    return baseTemplate(config, vC, variant, 40)
  }

  return baseTemplate(config, gameContent, variant, 40)
}
