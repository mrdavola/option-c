// Fit & Rotate engine — click to rotate shapes and drag to fit them into an outline.
// Simplified: choose the correct rotation to match the target.

import type { ThemeConfig, MathParams, GameVariant } from "./engine-types"
import { baseTemplate } from "./base-template"

export function fitRotateEngine(config: ThemeConfig, math: MathParams, variant: GameVariant = "classic"): string {
  const c = config.colors
  const gameContent = `
<div class="intro-overlay" id="intro"><div class="intro-box">
  <h2>${config.title}</h2><p>You are a <strong>${config.character}</strong> in a <strong>${config.worldName}</strong>.</p>
  <p>Rotate the ${config.itemName} to match the target shape!</p>
  <button class="intro-start" onclick="document.getElementById('intro').remove(); startGame()">Play →</button>
</div></div>
<div id="helpPanel" class="help-panel"><div class="help-content"><h3>How to play</h3><p>A target shape is shown. Click the rotate button to turn the shape until it matches, then click Lock In.</p><button class="help-close" onclick="document.getElementById('helpPanel').classList.remove('open')">Got it</button></div></div>
<div class="game-header"><div class="game-title">${config.title}</div><div class="game-stats"><span>Score: <strong id="scoreDisplay">0</strong></span><div class="round-dots" id="roundDots"></div></div></div>
<div class="game-area" id="gameArea">
  <div style="display: flex; gap: 60px; align-items: center;">
    <div style="text-align: center;"><div style="font-size: 12px; opacity: 0.5; margin-bottom: 8px;">TARGET</div>
      <svg id="targetSvg" width="120" height="120" viewBox="0 0 120 120"></svg></div>
    <div style="text-align: center;"><div style="font-size: 12px; opacity: 0.5; margin-bottom: 8px;">YOUR SHAPE</div>
      <svg id="playerSvg" width="120" height="120" viewBox="0 0 120 120" style="transition: transform 0.3s;"></svg>
      <div style="margin-top: 12px; display: flex; gap: 8px; justify-content: center;">
        <button onclick="rotateShape()" style="padding: 8px 20px; background: ${c.primary}; color: ${config.vibe === "kawaii" ? "#fff" : c.bg}; border: none; border-radius: 8px; font-family: inherit; font-weight: 700; cursor: pointer;">↻ Rotate 90°</button>
        <button onclick="checkRotation()" style="padding: 8px 20px; background: ${c.accent}; color: ${config.vibe === "kawaii" ? "#fff" : c.bg}; border: none; border-radius: 8px; font-family: inherit; font-weight: 700; cursor: pointer;">Lock In</button>
      </div>
    </div>
  </div>
</div>
<script>
const TOTAL_ROUNDS = 5; let currentRound = 0, targetRotation = 0, playerRotation = 0;
const SHAPES = [
  'M20,100 L60,20 L100,100 Z', // triangle
  'M20,20 L100,20 L100,80 L20,80 Z', // rectangle
  'M60,10 L100,40 L85,90 L35,90 L20,40 Z', // pentagon
  'M20,60 L60,20 L100,60 L60,100 Z', // diamond
  'M30,20 L90,20 L100,60 L70,100 L20,80 Z', // irregular
];
function drawShape(svgId, path, rotation, color) {
  const svg = document.getElementById(svgId);
  svg.innerHTML = '<g transform="rotate('+rotation+' 60 60)"><path d="'+path+'" fill="'+color+'22" stroke="'+color+'" stroke-width="3"/></g>';
}
function rotateShape() { playerRotation = (playerRotation + 90) % 360; drawShape('playerSvg', SHAPES[currentRound % SHAPES.length], playerRotation, '${c.primary}'); }
function checkRotation() {
  if (playerRotation === targetRotation) {
    window.gameScore += 10*(currentRound+1); document.getElementById('scoreDisplay').textContent = window.gameScore;
    const area = document.getElementById('gameArea'); const rect = area.getBoundingClientRect();
    spawnParticles(rect.left+rect.width/2, rect.top+rect.height/2, '${c.accent}', 12); addCombo();
    showScorePopup(rect.left+rect.width/2, rect.top+50, '+'+(10*(currentRound+1)));
    const dots = document.querySelectorAll('.round-dot'); if(dots[currentRound]) dots[currentRound].classList.add('done');
    currentRound++; if(currentRound>=TOTAL_ROUNDS){setTimeout(()=>showVictory('${config.winMessage}'),500);}else{setTimeout(startRound,800);}
  } else { screenShake(); resetCombo(); trackFail(); showScorePopup(window.innerWidth/2, window.innerHeight/2, 'Not matching yet!'); }
}
function startRound() { resetFails();
  playerRotation = 0; targetRotation = [90, 180, 270][Math.floor(Math.random()*3)];
  const shape = SHAPES[currentRound % SHAPES.length];
  drawShape('targetSvg', shape, targetRotation, '${c.accent}');
  drawShape('playerSvg', shape, 0, '${c.primary}');
  const dots = document.querySelectorAll('.round-dot'); dots.forEach((d,i)=>{d.classList.remove('current');if(i===currentRound)d.classList.add('current');});
}
function startGame(){
</script>`
  // VARIANT B: Tangram Fill — drag and rotate pieces to fill an outline
  if (variant === "variantB") {
    const vB = `
<div class="intro-overlay" id="intro"><div class="intro-box"><h2>${config.title} — Tangram</h2><p>You are a <strong>${config.character}</strong> in <strong>${config.worldName}</strong>. Fit the shape pieces into the outline! Pick the right pieces that fill it completely.</p><button class="intro-start" onclick="document.getElementById('intro').remove(); startGame()">Fill it! →</button></div></div>
<div id="helpPanel" class="help-panel"><div class="help-content"><h3>How to play</h3><p>An outline is shown. Click shapes from the bank to place them inside. The shapes must fill the outline exactly — no gaps, no overlap!</p><button class="help-close" onclick="document.getElementById('helpPanel').classList.remove('open')">Got it</button></div></div>
<div class="game-header"><div class="game-title">${config.title} — Tangram</div><div class="game-stats"><span>Score: <strong id="scoreDisplay">0</strong></span><div class="round-dots" id="roundDots"></div></div></div>
<div class="game-area" id="gameArea"><div style="text-align:center;width:90%;max-width:450px;">
  <div style="font-size:14px;opacity:.6;margin-bottom:12px;">Fill the shape using the right number of pieces</div>
  <div style="display:flex;justify-content:center;gap:24px;margin-bottom:16px;">
    <div><div style="font-size:12px;opacity:.5;margin-bottom:4px;">Target area</div><div id="targetArea" style="font-size:32px;font-weight:700;color:${c.accent};"></div></div>
    <div><div style="font-size:12px;opacity:.5;margin-bottom:4px;">Your total</div><div id="yourArea" style="font-size:32px;font-weight:700;color:${c.primary};">0</div></div>
  </div>
  <div style="font-size:12px;opacity:.5;margin-bottom:8px;">Click pieces to add to your shape</div>
  <div id="pieces" style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:16px;"></div>
  <div style="display:flex;gap:8px;justify-content:center;">
    <button onclick="undoPiece()" style="padding:8px 16px;background:${c.secondary}33;color:${c.text};border:1px solid ${c.secondary};border-radius:8px;font-family:inherit;cursor:pointer;">Undo</button>
    <button onclick="checkFill()" style="padding:8px 24px;background:${c.primary};color:${config.vibe === "kawaii" ? "#fff" : c.bg};border:none;border-radius:8px;font-family:inherit;font-weight:700;cursor:pointer;">Check!</button>
  </div>
</div></div>
<script>
const TR=5;let cr=0,targetA=0,placed=0,stack=[];
function addPiece(v){stack.push(v);placed+=v;document.getElementById('yourArea').textContent=placed;}
function undoPiece(){if(stack.length){placed-=stack.pop();document.getElementById('yourArea').textContent=placed;}}
function checkFill(){if(placed===targetA){window.gameScore+=10*(cr+1);document.getElementById('scoreDisplay').textContent=window.gameScore;spawnParticles(window.innerWidth/2,window.innerHeight/2,'${c.accent}',12);addCombo();
  const d=document.querySelectorAll('.round-dot');if(d[cr])d[cr].classList.add('done');cr++;if(cr>=TR){setTimeout(()=>showVictory('${config.winMessage}'),500);}else{setTimeout(sr,800);}}
  else{screenShake();resetCombo();trackFail();showScorePopup(window.innerWidth/2,window.innerHeight/2,placed>targetA?'Too much!':'Not enough!');}}
function sr(){resetFails();placed=0;stack=[];document.getElementById('yourArea').textContent='0';
  targetA=cr<2?Math.floor(Math.random()*6)+6:cr<4?Math.floor(Math.random()*10)+8:Math.floor(Math.random()*15)+12;
  document.getElementById('targetArea').textContent=targetA+' sq';
  const sizes=cr<2?[1,2,3,4]:[1,2,3,4,5,6];const pc=document.getElementById('pieces');pc.innerHTML='';
  sizes.forEach(s=>{const b=document.createElement('button');b.textContent=s+' sq';
  b.style.cssText='width:'+(30+s*10)+'px;height:44px;border-radius:8px;border:2px solid ${c.primary};background:${c.primary}22;color:${c.text};font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;';
  b.onclick=()=>addPiece(s);pc.appendChild(b);});
  const d=document.querySelectorAll('.round-dot');d.forEach((x,i)=>{x.classList.remove('current');if(i===cr)x.classList.add('current');});}
function startGame(){const dc=document.getElementById('roundDots');dc.innerHTML='';for(let i=0;i<TR;i++){const d=document.createElement('div');d.className='round-dot';dc.appendChild(d);}sr();}
</script>`
    return baseTemplate(config, vB, variant, 30)
  }

  // VARIANT C: Mirror Puzzle — place shape so it mirrors across a line
  if (variant === "variantC") {
    const vC = `
<div class="intro-overlay" id="intro"><div class="intro-box"><h2>${config.title} — Mirror</h2><p>You are a <strong>${config.character}</strong> in <strong>${config.worldName}</strong>. A shape appears on one side of the mirror line. Click to place its reflection on the other side!</p><button class="intro-start" onclick="document.getElementById('intro').remove(); startGame()">Reflect! →</button></div></div>
<div id="helpPanel" class="help-panel"><div class="help-content"><h3>How to play</h3><p>A shape is on the left side of a vertical line. Click the correct position on the right side to place its mirror reflection. The reflection should be the same distance from the line.</p><button class="help-close" onclick="document.getElementById('helpPanel').classList.remove('open')">Got it</button></div></div>
<div class="game-header"><div class="game-title">${config.title} — Mirror</div><div class="game-stats"><span>Score: <strong id="scoreDisplay">0</strong></span><div class="round-dots" id="roundDots"></div></div></div>
<div class="game-area" id="gameArea"><div style="text-align:center;">
  <div style="font-size:14px;opacity:.6;margin-bottom:12px;">Click where the mirror reflection goes</div>
  <canvas id="mirrorCanvas" width="360" height="280" style="border:2px solid ${c.secondary};border-radius:8px;cursor:crosshair;"></canvas>
</div></div>
<script>
const TR=5;let cr=0,targetX=0,targetY=0;const W=360,H=280,MID=W/2;
const cv=document.getElementById('mirrorCanvas');const cx=cv.getContext('2d');
function drawScene(shapeX,shapeY){cx.clearRect(0,0,W,H);cx.fillStyle='${c.bg}';cx.fillRect(0,0,W,H);
  // Mirror line
  cx.strokeStyle='${c.accent}';cx.lineWidth=2;cx.setLineDash([6,4]);cx.beginPath();cx.moveTo(MID,0);cx.lineTo(MID,H);cx.stroke();cx.setLineDash([]);
  cx.fillStyle='${c.accent}44';cx.font='12px sans-serif';cx.textAlign='center';cx.fillText('MIRROR',MID,H-8);
  // Shape on left
  cx.fillStyle='${c.primary}';cx.strokeStyle='${c.primary}';cx.lineWidth=2;
  cx.beginPath();cx.arc(shapeX,shapeY,15,0,Math.PI*2);cx.fill();
  // Target position (invisible) — mirror of shape across MID
  targetX=MID+(MID-shapeX);targetY=shapeY;
  // Light guide dots on right side
  cx.fillStyle='${c.secondary}22';
  for(let x=MID+20;x<W-10;x+=30){for(let y=20;y<H-10;y+=30){cx.beginPath();cx.arc(x,y,3,0,Math.PI*2);cx.fill();}}}
cv.addEventListener('click',(e)=>{const rect=cv.getBoundingClientRect();const mx=e.clientX-rect.left;const my=e.clientY-rect.top;
  const dist=Math.sqrt((mx-targetX)**2+(my-targetY)**2);
  if(dist<25){window.gameScore+=10*(cr+1);document.getElementById('scoreDisplay').textContent=window.gameScore;
  // Draw correct reflection
  cx.fillStyle='${c.accent}';cx.beginPath();cx.arc(targetX,targetY,15,0,Math.PI*2);cx.fill();
  spawnParticles(e.clientX,e.clientY,'${c.accent}',10);addCombo();showScorePopup(e.clientX,e.clientY-20,'+'+(10*(cr+1)));
  const d=document.querySelectorAll('.round-dot');if(d[cr])d[cr].classList.add('done');cr++;if(cr>=TR){setTimeout(()=>showVictory('${config.winMessage}'),600);}else{setTimeout(sr,800);}}
  else{screenShake();resetCombo();trackFail();
  // Show where they clicked
  cx.strokeStyle='${c.danger}';cx.lineWidth=2;cx.beginPath();cx.arc(mx,my,12,0,Math.PI*2);cx.stroke();}});
function sr(){resetFails();const shapeX=Math.floor(Math.random()*(MID-60))+30;const shapeY=Math.floor(Math.random()*(H-60))+30;drawScene(shapeX,shapeY);
  const d=document.querySelectorAll('.round-dot');d.forEach((x,i)=>{x.classList.remove('current');if(i===cr)x.classList.add('current');});}
function startGame(){const dc=document.getElementById('roundDots');dc.innerHTML='';for(let i=0;i<TR;i++){const d=document.createElement('div');d.className='round-dot';dc.appendChild(d);}sr();}
</script>`
    return baseTemplate(config, vC, variant, 30)
  }

  return baseTemplate(config, gameContent, variant, 30)
}
