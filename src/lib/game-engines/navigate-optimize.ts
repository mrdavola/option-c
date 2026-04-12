// Navigate & Optimize — find the shortest path through nodes.
// Simplified: given distances, pick the route with the shortest total.

import type { ThemeConfig, MathParams, GameVariant } from "./engine-types"
import { baseTemplate } from "./base-template"

export function navigateOptimizeEngine(config: ThemeConfig, math: MathParams, variant: GameVariant = "classic"): string {
  const c = config.colors
  const gameContent = `
<div class="intro-overlay" id="intro"><div class="intro-box"><h2>${config.title}</h2><p>You are a <strong>${config.character}</strong> in a <strong>${config.worldName}</strong>.</p><p>Find the shortest route! Add up the distances and pick the best path.</p><button class="intro-start" onclick="document.getElementById('intro').remove(); startGame()">Play →</button></div></div>
<div id="helpPanel" class="help-panel"><div class="help-content"><h3>How to play</h3><p>Two or three routes are shown with distances. Add up each route's total and click the shortest one.</p><button class="help-close" onclick="document.getElementById('helpPanel').classList.remove('open')">Got it</button></div></div>
<div class="game-header"><div class="game-title">${config.title}</div><div class="game-stats"><span>Score: <strong id="scoreDisplay">0</strong></span><div class="round-dots" id="roundDots"></div></div></div>
<div class="game-area" id="gameArea">
  <div style="text-align: center; width: 90%; max-width: 500px;">
    <div style="font-size: 16px; font-weight: 700; color: ${c.accent}; margin-bottom: 20px;">Which route is shortest?</div>
    <div id="routes" style="display: flex; flex-direction: column; gap: 12px;"></div>
    <div id="feedback" style="margin-top: 16px; font-size: 14px; min-height: 20px;"></div>
  </div>
</div>
<script>
const TOTAL_ROUNDS = 5; let currentRound = 0, correctIdx = 0;
function createRoute(legs, total, idx) {
  const el = document.createElement('button');
  el.style.cssText = 'display: flex; align-items: center; gap: 8px; padding: 16px; border: 2px solid ${c.primary}44; border-radius: 12px; background: ${c.primary}08; cursor: pointer; transition: all 0.2s; font-family: inherit; width: 100%;';
  const label = document.createElement('div'); label.style.cssText = 'font-size: 14px; font-weight: 700; color: ${c.text}; width: 60px; text-align: left;';
  label.textContent = 'Route '+'ABC'[idx];
  const path = document.createElement('div'); path.style.cssText = 'flex: 1; display: flex; align-items: center; gap: 4px; font-size: 16px; color: ${c.text};';
  legs.forEach((leg, i) => {
    if (i > 0) { const arrow = document.createElement('span'); arrow.textContent = '→'; arrow.style.color = '${c.secondary}'; path.appendChild(arrow); }
    const seg = document.createElement('span'); seg.style.cssText = 'background: ${c.accent}22; padding: 2px 8px; border-radius: 4px; font-weight: 700;'; seg.textContent = leg; path.appendChild(seg);
  });
  const totalEl = document.createElement('div'); totalEl.style.cssText = 'font-size: 14px; color: ${c.text}80; width: 60px; text-align: right;';
  totalEl.textContent = '= ' + total;
  el.appendChild(label); el.appendChild(path); el.appendChild(totalEl);
  el.onclick = () => pickRoute(idx, el);
  return el;
}
function pickRoute(idx, el) {
  if (idx === correctIdx) {
    window.gameScore += 10*(currentRound+1); document.getElementById('scoreDisplay').textContent = window.gameScore;
    el.style.borderColor = '${c.accent}'; el.style.background = '${c.accent}22';
    const rect = el.getBoundingClientRect(); spawnParticles(rect.left+rect.width/2, rect.top+30, '${c.accent}', 10); addCombo();
    showScorePopup(rect.left+rect.width/2, rect.top-10, '+'+(10*(currentRound+1)));
    const dots = document.querySelectorAll('.round-dot'); if(dots[currentRound]) dots[currentRound].classList.add('done');
    currentRound++; if(currentRound>=TOTAL_ROUNDS){setTimeout(()=>showVictory('${config.winMessage}'),600);}else{setTimeout(startRound,800);}
  } else { screenShake(); resetCombo(); trackFail(); el.style.borderColor='${c.danger}'; setTimeout(()=>{el.style.borderColor='${c.primary}44';},500);
    document.getElementById('feedback').style.color='${c.danger}'; document.getElementById('feedback').textContent='Not the shortest! Add up the numbers.'; setTimeout(()=>{document.getElementById('feedback').textContent='';},1500); }
}
function startRound() { resetFails();
  const routeCount = currentRound < 2 ? 2 : 3;
  const legCount = currentRound < 2 ? 2 : currentRound < 4 ? 3 : 4;
  const maxLeg = currentRound < 2 ? 10 : currentRound < 4 ? 20 : 30;
  const routes = [];
  for (let r = 0; r < routeCount; r++) {
    const legs = []; let total = 0;
    for (let l = 0; l < legCount; l++) { const v = Math.floor(Math.random()*maxLeg)+1; legs.push(v); total += v; }
    routes.push({ legs, total });
  }
  // Ensure unique totals
  const totals = routes.map(r => r.total);
  correctIdx = totals.indexOf(Math.min(...totals));
  const re = document.getElementById('routes'); re.innerHTML = '';
  routes.forEach((r, i) => re.appendChild(createRoute(r.legs, r.total, i)));
  document.getElementById('feedback').textContent = '';
  const dots = document.querySelectorAll('.round-dot'); dots.forEach((d,i)=>{d.classList.remove('current');if(i===currentRound)d.classList.add('current');});
}
function startGame(){
</script>`
  // VARIANT B: Map Builder — draw a path through nodes under a distance limit
  if (variant === "variantB") {
    const vB = `
<div class="intro-overlay" id="intro"><div class="intro-box"><h2>${config.title} — Map Builder</h2><p>You are a <strong>${config.character}</strong> in <strong>${config.worldName}</strong>. Draw a path visiting all stops. Stay under the distance limit!</p><button class="intro-start" onclick="document.getElementById('intro').remove(); startGame()">Draw! →</button></div></div>
<div id="helpPanel" class="help-panel"><div class="help-content"><h3>How to play</h3><p>Click nodes in order to draw your path. Each connection has a distance. Your total must stay under the limit. Visit all nodes!</p><button class="help-close" onclick="document.getElementById('helpPanel').classList.remove('open')">Got it</button></div></div>
<div class="game-header"><div class="game-title">${config.title} — Map</div><div class="game-stats"><span>Score: <strong id="scoreDisplay">0</strong></span><div class="round-dots" id="roundDots"></div></div></div>
<div class="game-area" id="gameArea"><div style="text-align:center;width:90%;max-width:450px;">
  <div style="display:flex;justify-content:center;gap:16px;margin-bottom:12px;">
    <div><span style="opacity:.6;">Limit: </span><strong id="limit" style="color:${c.danger};font-size:20px;"></strong></div>
    <div><span style="opacity:.6;">Your total: </span><strong id="total" style="color:${c.primary};font-size:20px;">0</strong></div>
    <div><span style="opacity:.6;">Visited: </span><strong id="visited" style="color:${c.accent};font-size:20px;">0</strong>/<strong id="nodeCount"></strong></div>
  </div>
  <canvas id="mapCanvas" width="400" height="280" style="border:2px solid ${c.secondary};border-radius:8px;cursor:pointer;"></canvas>
  <div style="margin-top:12px;display:flex;gap:8px;justify-content:center;">
    <button onclick="undoNode()" style="padding:8px 16px;background:${c.secondary}33;color:${c.text};border:1px solid ${c.secondary};border-radius:8px;font-family:inherit;cursor:pointer;">Undo</button>
    <button onclick="checkPath()" style="padding:8px 24px;background:${c.primary};color:${c.bg};border:none;border-radius:8px;font-family:inherit;font-weight:700;cursor:pointer;">Check path!</button>
  </div>
</div></div>
<script>
const TR=5;let cr=0,nodes=[],edges={},path=[],totalDist=0,distLimit=0;
const cv=document.getElementById('mapCanvas');const cx=cv.getContext('2d');
function dist(a,b){return Math.round(Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2)/10);}
function draw(){cx.clearRect(0,0,400,280);cx.fillStyle='${c.bg}';cx.fillRect(0,0,400,280);
  // Draw all possible edges with distances
  for(let i=0;i<nodes.length;i++){for(let j=i+1;j<nodes.length;j++){const d=dist(nodes[i],nodes[j]);if(d<40){
  cx.strokeStyle='${c.secondary}33';cx.lineWidth=1;cx.beginPath();cx.moveTo(nodes[i].x,nodes[i].y);cx.lineTo(nodes[j].x,nodes[j].y);cx.stroke();
  cx.fillStyle='${c.text}44';cx.font='10px sans-serif';cx.textAlign='center';cx.fillText(d+'',(nodes[i].x+nodes[j].x)/2,(nodes[i].y+nodes[j].y)/2-4);}}}
  // Draw path
  if(path.length>1){cx.strokeStyle='${c.accent}';cx.lineWidth=3;cx.beginPath();cx.moveTo(nodes[path[0]].x,nodes[path[0]].y);
  for(let i=1;i<path.length;i++){cx.lineTo(nodes[path[i]].x,nodes[path[i]].y);}cx.stroke();}
  // Draw nodes
  nodes.forEach((n,i)=>{cx.fillStyle=path.includes(i)?'${c.accent}':'${c.primary}';cx.beginPath();cx.arc(n.x,n.y,12,0,Math.PI*2);cx.fill();
  cx.fillStyle='${c.bg}';cx.font='bold 12px sans-serif';cx.textAlign='center';cx.fillText(String.fromCharCode(65+i),n.x,n.y+4);});}
cv.addEventListener('click',(e)=>{const rect=cv.getBoundingClientRect();const mx=e.clientX-rect.left;const my=e.clientY-rect.top;
  for(let i=0;i<nodes.length;i++){if(Math.sqrt((mx-nodes[i].x)**2+(my-nodes[i].y)**2)<15&&!path.includes(i)){
  if(path.length>0){const d=dist(nodes[path[path.length-1]],nodes[i]);totalDist+=d;}
  path.push(i);document.getElementById('total').textContent=totalDist;document.getElementById('visited').textContent=path.length;
  document.getElementById('total').style.color=totalDist>distLimit?'${c.danger}':'${c.primary}';
  spawnParticles(e.clientX,e.clientY,'${c.primary}',4);draw();break;}}});
function undoNode(){if(path.length>1){const removed=path.pop();const prev=path[path.length-1];totalDist-=dist(nodes[prev],nodes[removed]);}else if(path.length===1){path.pop();totalDist=0;}
  document.getElementById('total').textContent=totalDist;document.getElementById('visited').textContent=path.length;draw();}
function checkPath(){if(path.length===nodes.length&&totalDist<=distLimit){window.gameScore+=Math.max(5,20-Math.floor(totalDist/distLimit*15))*(cr+1);
  document.getElementById('scoreDisplay').textContent=window.gameScore;spawnParticles(window.innerWidth/2,window.innerHeight/2,'${c.accent}',16);addCombo();
  const d=document.querySelectorAll('.round-dot');if(d[cr])d[cr].classList.add('done');cr++;if(cr>=TR){setTimeout(()=>showVictory('${config.winMessage}'),500);}else{setTimeout(sr,800);}}
  else if(path.length<nodes.length){showScorePopup(window.innerWidth/2,window.innerHeight/2,'Visit all '+nodes.length+' nodes!');}
  else{screenShake();resetCombo();trackFail();showScorePopup(window.innerWidth/2,window.innerHeight/2,'Over the limit! Total: '+totalDist+', Limit: '+distLimit);}}
function sr(){resetFails();path=[];totalDist=0;document.getElementById('total').textContent='0';document.getElementById('total').style.color='${c.primary}';
  const numNodes=cr<2?4:cr<4?5:6;nodes=[];
  for(let i=0;i<numNodes;i++){nodes.push({x:Math.floor(Math.random()*340)+30,y:Math.floor(Math.random()*220)+30});}
  document.getElementById('nodeCount').textContent=numNodes;document.getElementById('visited').textContent='0';
  // Calculate optimal path (greedy) for limit
  let optDist=0;const temp=[0];const remaining=new Set(Array.from({length:numNodes},(_,i)=>i));remaining.delete(0);
  while(remaining.size>0){let best=-1,bestD=Infinity;for(const r of remaining){const d=dist(nodes[temp[temp.length-1]],nodes[r]);if(d<bestD){bestD=d;best=r;}}temp.push(best);remaining.delete(best);optDist+=bestD;}
  distLimit=Math.round(optDist*1.3);document.getElementById('limit').textContent=distLimit;draw();
  const d=document.querySelectorAll('.round-dot');d.forEach((x,i)=>{x.classList.remove('current');if(i===cr)x.classList.add('current');});}
function startGame(){const dc=document.getElementById('roundDots');dc.innerHTML='';for(let i=0;i<TR;i++){const d=document.createElement('div');d.className='round-dot';dc.appendChild(d);}sr();}
</script>`
    return baseTemplate(config, vB, variant, 45)
  }

  // VARIANT C: Delivery Run — visit all stops minimizing total distance
  if (variant === "variantC") {
    const vC = `
<div class="intro-overlay" id="intro"><div class="intro-box"><h2>${config.title} — Delivery</h2><p>You are a <strong>${config.character}</strong> in <strong>${config.worldName}</strong>. Deliver to all stops in the order that uses the least distance. Plan your route!</p><button class="intro-start" onclick="document.getElementById('intro').remove(); startGame()">Deliver! →</button></div></div>
<div id="helpPanel" class="help-panel"><div class="help-content"><h3>How to play</h3><p>Stops are shown with distances between them. Pick the order to visit them that gives the SHORTEST total route. Click stops in order.</p><button class="help-close" onclick="document.getElementById('helpPanel').classList.remove('open')">Got it</button></div></div>
<div class="game-header"><div class="game-title">${config.title} — Delivery</div><div class="game-stats"><span>Score: <strong id="scoreDisplay">0</strong></span><div class="round-dots" id="roundDots"></div></div></div>
<div class="game-area" id="gameArea"><div style="text-align:center;width:90%;max-width:400px;">
  <div style="font-size:14px;opacity:.6;margin-bottom:8px;">Click stops in the best order</div>
  <div style="margin-bottom:12px;"><span style="opacity:.6;">Your distance: </span><strong id="myDist" style="color:${c.primary};font-size:20px;">0</strong></div>
  <div id="stops" style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:12px;"></div>
  <div id="route" style="font-size:14px;color:${c.text}80;min-height:20px;margin-bottom:12px;"></div>
  <button onclick="checkRoute()" style="padding:10px 32px;background:${c.primary};color:${c.bg};border:none;border-radius:8px;font-family:inherit;font-size:16px;font-weight:700;cursor:pointer;">Done!</button>
</div></div>
<script>
const TR=5;let cr=0,stopNames=[],dists=[],visitOrder=[],myTotal=0,optimalTotal=0;
function visitStop(idx){if(visitOrder.includes(idx))return;
  if(visitOrder.length>0){const last=visitOrder[visitOrder.length-1];myTotal+=dists[last][idx];}
  visitOrder.push(idx);document.getElementById('myDist').textContent=myTotal;
  document.getElementById('route').textContent='Route: '+visitOrder.map(i=>stopNames[i]).join(' → ');
  const btns=document.querySelectorAll('#stops button');btns[idx].style.background='${c.accent}';btns[idx].style.color='${c.bg}';btns[idx].style.cursor='default';
  spawnParticles(window.innerWidth/2,window.innerHeight/2,'${c.primary}',4);}
function checkRoute(){if(visitOrder.length<stopNames.length){showScorePopup(window.innerWidth/2,window.innerHeight/2,'Visit all stops!');return;}
  const efficiency=optimalTotal/Math.max(1,myTotal);const points=Math.round(efficiency*20)*(cr+1);
  window.gameScore+=points;document.getElementById('scoreDisplay').textContent=window.gameScore;
  if(efficiency>0.8){spawnParticles(window.innerWidth/2,window.innerHeight/2,'${c.accent}',16);addCombo();showScorePopup(window.innerWidth/2,100,efficiency>=0.95?'Optimal route! +'+points:'Good route! +'+points);}
  else{showScorePopup(window.innerWidth/2,100,'Route OK but not optimal. +'+points);}
  const d=document.querySelectorAll('.round-dot');if(d[cr])d[cr].classList.add('done');cr++;if(cr>=TR){setTimeout(()=>showVictory('${config.winMessage}'),600);}else{setTimeout(sr,800);}}
function sr(){resetFails();visitOrder=[];myTotal=0;document.getElementById('myDist').textContent='0';document.getElementById('route').textContent='';
  const n=cr<2?3:cr<4?4:5;stopNames='ABCDEFG'.slice(0,n).split('');
  dists=[];for(let i=0;i<n;i++){dists[i]=[];for(let j=0;j<n;j++){dists[i][j]=i===j?0:Math.floor(Math.random()*15)+3;}}
  // Symmetrize
  for(let i=0;i<n;i++){for(let j=i+1;j<n;j++){dists[j][i]=dists[i][j];}}
  // Calculate optimal (brute force for small n)
  function permute(arr){if(arr.length<=1)return[arr];const result=[];for(let i=0;i<arr.length;i++){const rest=[...arr.slice(0,i),...arr.slice(i+1)];for(const p of permute(rest))result.push([arr[i],...p]);}return result;}
  const perms=permute(Array.from({length:n},(_,i)=>i));let best=Infinity;
  perms.forEach(p=>{let d2=0;for(let i=1;i<p.length;i++)d2+=dists[p[i-1]][p[i]];if(d2<best)best=d2;});optimalTotal=best;
  // Render stops with distance table
  const sc=document.getElementById('stops');sc.innerHTML='';
  stopNames.forEach((name,i)=>{const b=document.createElement('button');b.textContent=name;
  b.style.cssText='width:48px;height:48px;border-radius:50%;font-size:20px;font-weight:700;border:2px solid ${c.primary};background:${c.primary}22;color:${c.text};cursor:pointer;font-family:inherit;transition:all .15s;';
  b.title='Distances: '+stopNames.map((s,j)=>i===j?'':s+'='+dists[i][j]).filter(Boolean).join(', ');
  b.onclick=()=>visitStop(i);sc.appendChild(b);});
  const d=document.querySelectorAll('.round-dot');d.forEach((x,i)=>{x.classList.remove('current');if(i===cr)x.classList.add('current');});}
function startGame(){const dc=document.getElementById('roundDots');dc.innerHTML='';for(let i=0;i<TR;i++){const d=document.createElement('div');d.className='round-dot';dc.appendChild(d);}sr();}
</script>`
    return baseTemplate(config, vC, variant, 45)
  }

  return baseTemplate(config, gameContent, variant, 45)
}
