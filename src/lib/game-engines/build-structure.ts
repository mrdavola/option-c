// Build a Structure — drag shapes to match a blueprint.

import type { ThemeConfig, MathParams, GameVariant } from "./engine-types"
import { baseTemplate } from "./base-template"

export function buildStructureEngine(config: ThemeConfig, math: MathParams, variant: GameVariant = "classic"): string {
  const c = config.colors
  const gameContent = `
<div class="intro-overlay" id="intro"><div class="intro-box"><h2>${config.title}</h2><p>You are a <strong>${config.character}</strong> in a <strong>${config.worldName}</strong>.</p><p>Pick the right shapes to build the ${config.targetName}!</p><button class="intro-start" onclick="document.getElementById('intro').remove(); startGame()">Play →</button></div></div>
<div id="helpPanel" class="help-panel"><div class="help-content"><h3>How to play</h3><p>A blueprint shows which shapes you need. Click the matching shapes from the bank to build it. Get all the shapes right!</p><button class="help-close" onclick="document.getElementById('helpPanel').classList.remove('open')">Got it</button></div></div>
<div class="game-header"><div class="game-title">${config.title}</div><div class="game-stats"><span>Score: <strong id="scoreDisplay">0</strong></span><div class="round-dots" id="roundDots"></div></div></div>
<div class="game-area" id="gameArea">
  <div style="display: flex; gap: 40px; align-items: flex-start;">
    <!-- Blueprint -->
    <div style="text-align: center;">
      <div style="font-size: 12px; opacity: 0.5; margin-bottom: 8px;">BLUEPRINT</div>
      <div id="blueprint" style="display: flex; flex-wrap: wrap; gap: 4px; width: 160px; padding: 12px; border: 2px dashed ${c.accent}; border-radius: 12px; min-height: 100px; justify-content: center;"></div>
    </div>
    <!-- Your build -->
    <div style="text-align: center;">
      <div style="font-size: 12px; opacity: 0.5; margin-bottom: 8px;">YOUR BUILD</div>
      <div id="build" style="display: flex; flex-wrap: wrap; gap: 4px; width: 160px; padding: 12px; border: 2px solid ${c.primary}; border-radius: 12px; min-height: 100px; justify-content: center;"></div>
      <div style="margin-top: 8px; font-size: 13px;"><span id="buildCount">0</span>/<span id="needCount">0</span> pieces</div>
    </div>
  </div>
  <!-- Shape bank -->
  <div style="margin-top: 20px; text-align: center;">
    <div style="font-size: 12px; opacity: 0.5; margin-bottom: 8px;">Click shapes to add them</div>
    <div id="bank" style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;"></div>
    <div style="margin-top: 12px; display: flex; gap: 8px; justify-content: center;">
      <button onclick="undoBuild()" style="padding: 8px 16px; background: ${c.secondary}33; color: ${c.text}; border: 1px solid ${c.secondary}; border-radius: 8px; font-family: inherit; cursor: pointer;">Undo</button>
      <button onclick="checkBuild()" style="padding: 8px 24px; background: ${c.primary}; color: ${config.vibe === "kawaii" ? "#fff" : c.bg}; border: none; border-radius: 8px; font-family: inherit; font-weight: 700; cursor: pointer;">Check!</button>
    </div>
  </div>
</div>
<script>
const TOTAL_ROUNDS = 5; let currentRound = 0;
const SHAPES = [
  { name: 'square', svg: '<rect x="5" y="5" width="30" height="30" rx="3"/>', color: '${c.primary}' },
  { name: 'triangle', svg: '<polygon points="20,5 35,35 5,35"/>', color: '${c.accent}' },
  { name: 'circle', svg: '<circle cx="20" cy="20" r="15"/>', color: '#22c55e' },
  { name: 'rectangle', svg: '<rect x="2" y="10" width="36" height="20" rx="3"/>', color: '#f97316' },
  { name: 'diamond', svg: '<polygon points="20,2 38,20 20,38 2,20"/>', color: '#a855f7' },
];
let targetPieces = [], builtPieces = [];

function shapeSvg(shape, size) {
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 40 40"><g fill="'+shape.color+'44" stroke="'+shape.color+'" stroke-width="2">'+shape.svg+'</g></svg>';
}
function addPiece(shapeIdx) {
  builtPieces.push(shapeIdx);
  renderBuild();
}
function undoBuild() { if (builtPieces.length > 0) { builtPieces.pop(); renderBuild(); } }
function renderBuild() {
  const build = document.getElementById('build'); build.innerHTML = '';
  builtPieces.forEach(idx => { const d = document.createElement('div'); d.innerHTML = shapeSvg(SHAPES[idx], 36); build.appendChild(d); });
  document.getElementById('buildCount').textContent = builtPieces.length;
}
function checkBuild() {
  if (builtPieces.length !== targetPieces.length) { showScorePopup(window.innerWidth/2, window.innerHeight/2, 'Need '+targetPieces.length+' pieces!'); return; }
  const targetSorted = [...targetPieces].sort(); const builtSorted = [...builtPieces].sort();
  let match = true;
  for (let i = 0; i < targetSorted.length; i++) { if (targetSorted[i] !== builtSorted[i]) { match = false; break; } }
  if (match) {
    window.gameScore += 10*(currentRound+1); document.getElementById('scoreDisplay').textContent = window.gameScore;
    const area = document.getElementById('gameArea'); const rect = area.getBoundingClientRect();
    spawnParticles(rect.left+rect.width/2, rect.top+rect.height/2, '${c.accent}', 12); addCombo();
    showScorePopup(rect.left+rect.width/2, rect.top+50, '+'+(10*(currentRound+1)));
    const dots = document.querySelectorAll('.round-dot'); if(dots[currentRound]) dots[currentRound].classList.add('done');
    currentRound++; if(currentRound>=TOTAL_ROUNDS){setTimeout(()=>showVictory('${config.winMessage}'),500);}else{setTimeout(startRound,800);}
  } else { screenShake(); resetCombo(); trackFail(); showScorePopup(window.innerWidth/2, window.innerHeight/2, 'Wrong shapes! Check the blueprint.'); }
}
function startRound() { resetFails();
  const pieceCount = currentRound < 2 ? 3 : currentRound < 4 ? 4 : 5;
  targetPieces = []; builtPieces = [];
  for (let i = 0; i < pieceCount; i++) targetPieces.push(Math.floor(Math.random() * SHAPES.length));
  const bp = document.getElementById('blueprint'); bp.innerHTML = '';
  targetPieces.forEach(idx => { const d = document.createElement('div'); d.innerHTML = shapeSvg(SHAPES[idx], 36); bp.appendChild(d); });
  document.getElementById('needCount').textContent = pieceCount;
  renderBuild();
  const bank = document.getElementById('bank'); bank.innerHTML = '';
  SHAPES.forEach((s, i) => {
    const btn = document.createElement('button');
    btn.style.cssText = 'padding: 8px; border: 2px solid ${c.secondary}44; border-radius: 8px; background: transparent; cursor: pointer; transition: all 0.15s;';
    btn.innerHTML = shapeSvg(s, 40);
    btn.onclick = () => addPiece(i);
    bank.appendChild(btn);
  });
  const dots = document.querySelectorAll('.round-dot'); dots.forEach((d,i)=>{d.classList.remove('current');if(i===currentRound)d.classList.add('current');});
}
function startGame(){
</script>`
  // VARIANT B: Free Build — build using exactly N shapes, match target perimeter
  if (variant === "variantB") {
    const vB = `
<div class="intro-overlay" id="intro"><div class="intro-box"><h2>${config.title} — Free Build</h2><p>You are a <strong>${config.character}</strong> in <strong>${config.worldName}</strong>. Build a structure using exactly the right number of shapes to match the target count!</p><button class="intro-start" onclick="document.getElementById('intro').remove(); startGame()">Build! →</button></div></div>
<div id="helpPanel" class="help-panel"><div class="help-content"><h3>How to play</h3><p>You need exactly N shapes. Pick from the available shapes. The total sides of all your shapes must match the target. Think about how many sides each shape has!</p><button class="help-close" onclick="document.getElementById('helpPanel').classList.remove('open')">Got it</button></div></div>
<div class="game-header"><div class="game-title">${config.title} — Free Build</div><div class="game-stats"><span>Score: <strong id="scoreDisplay">0</strong></span><div class="round-dots" id="roundDots"></div></div></div>
<div class="game-area" id="gameArea"><div style="text-align:center;width:90%;max-width:450px;">
  <div style="font-size:14px;opacity:.6;margin-bottom:8px;">Build with the right shapes</div>
  <div style="display:flex;justify-content:center;gap:24px;margin-bottom:16px;">
    <div><div style="font-size:11px;opacity:.5;">Target total sides</div><div id="targetSides" style="font-size:32px;font-weight:700;color:${c.accent};"></div></div>
    <div><div style="font-size:11px;opacity:.5;">Your total</div><div id="yourSides" style="font-size:32px;font-weight:700;color:${c.primary};">0</div></div>
  </div>
  <div style="font-size:12px;opacity:.5;margin-bottom:8px;">Click shapes to add</div>
  <div id="shapeBank" style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:16px;"></div>
  <div style="font-size:12px;opacity:.5;margin-bottom:4px;">Your structure</div>
  <div id="built" style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;min-height:40px;margin-bottom:16px;"></div>
  <div style="display:flex;gap:8px;justify-content:center;">
    <button onclick="undoShape()" style="padding:8px 16px;background:${c.secondary}33;color:${c.text};border:1px solid ${c.secondary};border-radius:8px;font-family:inherit;cursor:pointer;">Undo</button>
    <button onclick="checkBuild()" style="padding:8px 24px;background:${c.primary};color:${config.vibe === "kawaii" ? "#fff" : c.bg};border:none;border-radius:8px;font-family:inherit;font-weight:700;cursor:pointer;">Check!</button>
  </div>
</div></div>
<script>
const TR=5;let cr=0,targetS=0,myS=0,stack=[];
const SHAPES=[{name:'Triangle',sides:3,svg:'<polygon points="20,5 35,35 5,35" fill="COLOR44" stroke="COLOR" stroke-width="2"/>'},
{name:'Square',sides:4,svg:'<rect x="5" y="5" width="30" height="30" fill="COLOR44" stroke="COLOR" stroke-width="2" rx="2"/>'},
{name:'Pentagon',sides:5,svg:'<polygon points="20,3 35,15 30,35 10,35 5,15" fill="COLOR44" stroke="COLOR" stroke-width="2"/>'},
{name:'Hexagon',sides:6,svg:'<polygon points="20,3 35,10 35,28 20,35 5,28 5,10" fill="COLOR44" stroke="COLOR" stroke-width="2"/>'}];
function addShape(idx){const s=SHAPES[idx];stack.push(idx);myS+=s.sides;document.getElementById('yourSides').textContent=myS;
  const chip=document.createElement('div');chip.innerHTML='<svg width="30" height="30" viewBox="0 0 40 40">'+s.svg.replace(/COLOR/g,'${c.accent}')+'</svg>';
  chip.style.cssText='cursor:pointer;';chip.title='Click to remove';chip.onclick=()=>{const i=stack.lastIndexOf(idx);if(i!==-1){stack.splice(i,1);myS-=s.sides;document.getElementById('yourSides').textContent=myS;chip.remove();}};
  document.getElementById('built').appendChild(chip);}
function undoShape(){if(stack.length){const idx=stack.pop();myS-=SHAPES[idx].sides;document.getElementById('yourSides').textContent=myS;const built=document.getElementById('built');if(built.lastChild)built.lastChild.remove();}}
function checkBuild(){if(myS===targetS){window.gameScore+=10*(cr+1);document.getElementById('scoreDisplay').textContent=window.gameScore;spawnParticles(window.innerWidth/2,window.innerHeight/2,'${c.accent}',12);addCombo();
  const d=document.querySelectorAll('.round-dot');if(d[cr])d[cr].classList.add('done');cr++;if(cr>=TR){setTimeout(()=>showVictory('${config.winMessage}'),500);}else{setTimeout(sr,800);}}
  else{screenShake();resetCombo();trackFail();showScorePopup(window.innerWidth/2,window.innerHeight/2,myS>targetS?'Too many sides!':'Need more sides!');}}
function sr(){resetFails();stack=[];myS=0;document.getElementById('yourSides').textContent='0';document.getElementById('built').innerHTML='';
  targetS=cr<2?Math.floor(Math.random()*6)+9:cr<4?Math.floor(Math.random()*10)+12:Math.floor(Math.random()*12)+15;
  document.getElementById('targetSides').textContent=targetS;
  const bank=document.getElementById('shapeBank');bank.innerHTML='';
  SHAPES.forEach((s,i)=>{const b=document.createElement('button');
  b.innerHTML='<svg width="36" height="36" viewBox="0 0 40 40">'+s.svg.replace(/COLOR/g,'${c.primary}')+'</svg><div style="font-size:10px;margin-top:2px;">'+s.name+' ('+s.sides+')</div>';
  b.style.cssText='padding:8px;border:2px solid ${c.primary}44;border-radius:8px;background:transparent;cursor:pointer;font-family:inherit;color:${c.text};transition:all .15s;';
  b.onmouseenter=()=>{b.style.borderColor='${c.primary}';};b.onmouseleave=()=>{b.style.borderColor='${c.primary}44';};
  b.onclick=()=>addShape(i);bank.appendChild(b);});
  const d=document.querySelectorAll('.round-dot');d.forEach((x,i)=>{x.classList.remove('current');if(i===cr)x.classList.add('current');});}
function startGame(){const dc=document.getElementById('roundDots');dc.innerHTML='';for(let i=0;i<TR;i++){const d=document.createElement('div');d.className='round-dot';dc.appendChild(d);}sr();}
</script>`
    return baseTemplate(config, vB, variant, 40)
  }

  // VARIANT C: Shape Decomposer — break a complex shape into basic shapes
  if (variant === "variantC") {
    const vC = `
<div class="intro-overlay" id="intro"><div class="intro-box"><h2>${config.title} — Decompose</h2><p>You are a <strong>${config.character}</strong> in <strong>${config.worldName}</strong>. A complex shape is shown with a total area. Break it down into basic shapes!</p><button class="intro-start" onclick="document.getElementById('intro').remove(); startGame()">Break it down! →</button></div></div>
<div id="helpPanel" class="help-panel"><div class="help-content"><h3>How to play</h3><p>A shape has a total area. Pick basic shapes (triangles, squares, etc.) whose areas add up to the total. Each basic shape has a known area.</p><button class="help-close" onclick="document.getElementById('helpPanel').classList.remove('open')">Got it</button></div></div>
<div class="game-header"><div class="game-title">${config.title} — Decompose</div><div class="game-stats"><span>Score: <strong id="scoreDisplay">0</strong></span><div class="round-dots" id="roundDots"></div></div></div>
<div class="game-area" id="gameArea"><div style="text-align:center;width:90%;max-width:400px;">
  <div style="font-size:14px;opacity:.6;margin-bottom:8px;">Break down the total area</div>
  <div style="display:flex;justify-content:center;gap:24px;margin-bottom:16px;">
    <div><div style="font-size:11px;opacity:.5;">Total area</div><div id="totalArea" style="font-size:36px;font-weight:700;color:${c.accent};"></div></div>
    <div><div style="font-size:11px;opacity:.5;">Your pieces</div><div id="pieceArea" style="font-size:36px;font-weight:700;color:${c.primary};">0</div></div>
  </div>
  <div style="font-size:12px;opacity:.5;margin-bottom:8px;">Click shapes to add (each has a fixed area)</div>
  <div id="shapeChoices" style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:16px;"></div>
  <div style="display:flex;gap:8px;justify-content:center;">
    <button onclick="undoP()" style="padding:8px 16px;background:${c.secondary}33;color:${c.text};border:1px solid ${c.secondary};border-radius:8px;font-family:inherit;cursor:pointer;">Undo</button>
    <button onclick="checkD()" style="padding:8px 24px;background:${c.primary};color:${config.vibe === "kawaii" ? "#fff" : c.bg};border:none;border-radius:8px;font-family:inherit;font-weight:700;cursor:pointer;">Check!</button>
  </div>
</div></div>
<script>
const TR=5;let cr=0,totalA=0,pieceTotal=0,pStack=[];
const PIECES=[{name:'Small ▲',area:1},{name:'Medium ■',area:2},{name:'Large ■',area:4},{name:'Big ▲',area:3},{name:'Rect',area:6}];
function addP(idx){pStack.push(idx);pieceTotal+=PIECES[idx].area;document.getElementById('pieceArea').textContent=pieceTotal;}
function undoP(){if(pStack.length){pieceTotal-=PIECES[pStack.pop()].area;document.getElementById('pieceArea').textContent=pieceTotal;}}
function checkD(){if(pieceTotal===totalA){window.gameScore+=10*(cr+1);document.getElementById('scoreDisplay').textContent=window.gameScore;spawnParticles(window.innerWidth/2,window.innerHeight/2,'${c.accent}',12);addCombo();
  const d=document.querySelectorAll('.round-dot');if(d[cr])d[cr].classList.add('done');cr++;if(cr>=TR){setTimeout(()=>showVictory('${config.winMessage}'),500);}else{setTimeout(sr,800);}}
  else{screenShake();resetCombo();trackFail();showScorePopup(window.innerWidth/2,window.innerHeight/2,pieceTotal>totalA?'Too much area!':'Need more!');}}
function sr(){resetFails();pStack=[];pieceTotal=0;document.getElementById('pieceArea').textContent='0';
  totalA=cr<2?Math.floor(Math.random()*8)+6:cr<4?Math.floor(Math.random()*12)+10:Math.floor(Math.random()*16)+14;
  document.getElementById('totalArea').textContent=totalA+' sq';
  const ch=document.getElementById('shapeChoices');ch.innerHTML='';
  PIECES.forEach((p,i)=>{const b=document.createElement('button');b.textContent=p.name+' ('+p.area+')';
  b.style.cssText='padding:10px 14px;border-radius:8px;border:2px solid ${c.primary};background:${c.primary}22;color:${c.text};font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s;';
  b.onclick=()=>addP(i);ch.appendChild(b);});
  const d=document.querySelectorAll('.round-dot');d.forEach((x,i)=>{x.classList.remove('current');if(i===cr)x.classList.add('current');});}
function startGame(){const dc=document.getElementById('roundDots');dc.innerHTML='';for(let i=0;i<TR;i++){const d=document.createElement('div');d.className='round-dot';dc.appendChild(d);}sr();}
</script>`
    return baseTemplate(config, vC, variant, 40)
  }

  return baseTemplate(config, gameContent, variant, 40)
}
