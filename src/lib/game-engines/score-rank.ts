// Score & Rank engine
// Player drags items into the correct order (ascending/descending).
// 5 rounds, progressive difficulty.

import type { ThemeConfig, MathParams, GameVariant } from "./engine-types"
import { baseTemplate } from "./base-template"

export function scoreRankEngine(config: ThemeConfig, math: MathParams, variant: GameVariant = "classic"): string {
  const c = config.colors

  const gameContent = `
<div class="intro-overlay" id="intro">
  <div class="intro-box">
    <h2>${config.title}</h2>
    <p>You are a <strong>${config.character}</strong> in a <strong>${config.worldName}</strong>.</p>
    <p>Drag the ${config.itemName} into the correct order — smallest to largest!</p>
    <button class="intro-start" onclick="document.getElementById('intro').remove(); startGame()">Play →</button>
  </div>
</div>

<div id="helpPanel" class="help-panel">
  <div class="help-content">
    <h3>How to play</h3>
    <p>Each round shows ${config.itemName} with numbers. Drag them into order from smallest (left) to largest (right).</p>
    <h3>Valid moves</h3>
    <p>• Numbers 5, 2, 8 → arrange as 2, 5, 8 ✅</p>
    <p>• Numbers -3, 1, -7 → arrange as -7, -3, 1 ✅</p>
    <h3>Invalid moves</h3>
    <p>• Putting 8 before 2 ❌</p>
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
  <div style="width: 90%; max-width: 600px;">
    <p style="text-align: center; font-size: 14px; opacity: 0.6; margin-bottom: 16px;">
      Drag ${config.itemName} into order: smallest → largest
    </p>
    <!-- Drop zones -->
    <div id="dropZones" style="display: flex; gap: 8px; justify-content: center; margin-bottom: 24px; min-height: 70px;">
    </div>
    <!-- Draggable items -->
    <div id="itemBank" style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; min-height: 70px;">
    </div>
    <div style="text-align: center; margin-top: 16px;">
      <button id="checkBtn" onclick="checkOrder()" style="padding: 10px 32px; background: ${c.primary}; color: ${config.vibe === "kawaii" ? "#fff" : c.bg}; border: none; border-radius: 8px; font-family: inherit; font-size: 16px; font-weight: 700; cursor: pointer;">
        Check Order
      </button>
    </div>
  </div>
</div>

<div class="game-footer">${config.dare || 'Sort them all!'}</div>

<script>
const TOTAL_ROUNDS = 5;
let currentRound = 0;
let correctOrder = [];
let itemCount = 0;
let draggedEl = null;

function createItem(value) {
  const el = document.createElement('div');
  el.style.cssText = 'width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; cursor: grab; transition: transform 0.15s;';
  el.style.background = '${c.primary}';
  el.style.color = '${config.vibe === "kawaii" ? "#fff" : c.bg}';
  el.style.border = '2px solid ${c.primary}';
  el.textContent = value;
  el.dataset.value = value;
  el.draggable = true;

  el.addEventListener('dragstart', (e) => {
    draggedEl = el;
    el.style.opacity = '0.5';
    e.dataTransfer.setData('text/plain', value);
  });
  el.addEventListener('dragend', () => {
    el.style.opacity = '1';
    draggedEl = null;
  });
  // Touch support
  let touchStartX = 0, touchStartY = 0;
  el.addEventListener('touchstart', (e) => {
    draggedEl = el;
    const t = e.touches[0];
    touchStartX = t.clientX; touchStartY = t.clientY;
    el.style.opacity = '0.7';
    el.style.zIndex = '100';
  });
  el.addEventListener('touchmove', (e) => { e.preventDefault(); });
  el.addEventListener('touchend', (e) => {
    el.style.opacity = '1';
    el.style.zIndex = '';
    const touch = e.changedTouches[0];
    const zones = document.querySelectorAll('.drop-zone');
    for (const zone of zones) {
      const rect = zone.getBoundingClientRect();
      if (touch.clientX >= rect.left && touch.clientX <= rect.right && touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        if (!zone.dataset.filled) {
          zone.appendChild(el);
          zone.dataset.filled = 'true';
          zone.style.borderStyle = 'solid';
          zone.style.borderColor = '${c.primary}';
        }
        break;
      }
    }
    draggedEl = null;
  });

  return el;
}

function createDropZone(index) {
  const zone = document.createElement('div');
  zone.className = 'drop-zone';
  zone.style.cssText = 'width: 68px; height: 68px; border: 2px dashed ${c.accent}44; border-radius: 12px; display: flex; align-items: center; justify-content: center; transition: all 0.2s;';
  zone.dataset.index = index;

  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.style.borderColor = '${c.accent}';
    zone.style.background = '${c.accent}11';
  });
  zone.addEventListener('dragleave', () => {
    if (!zone.dataset.filled) {
      zone.style.borderColor = '${c.accent}44';
      zone.style.background = 'transparent';
    }
  });
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    if (draggedEl && !zone.dataset.filled) {
      zone.appendChild(draggedEl);
      zone.dataset.filled = 'true';
      zone.style.borderStyle = 'solid';
      zone.style.borderColor = '${c.primary}';
      zone.style.background = 'transparent';
    }
  });
  // Click to return item to bank
  zone.addEventListener('click', () => {
    if (zone.dataset.filled && zone.firstElementChild) {
      document.getElementById('itemBank').appendChild(zone.firstElementChild);
      zone.dataset.filled = '';
      zone.style.borderStyle = 'dashed';
      zone.style.borderColor = '${c.accent}44';
    }
  });

  return zone;
}

function checkOrder() {
  const zones = document.querySelectorAll('.drop-zone');
  const placed = [];
  let allFilled = true;
  zones.forEach(z => {
    if (z.firstElementChild) {
      placed.push(parseInt(z.firstElementChild.dataset.value));
    } else {
      allFilled = false;
    }
  });

  if (!allFilled) {
    showScorePopup(window.innerWidth/2, window.innerHeight/2, 'Place all items first!');
    return;
  }

  // Check if in correct order
  let correct = true;
  for (let i = 0; i < placed.length; i++) {
    if (placed[i] !== correctOrder[i]) { correct = false; break; }
  }

  if (correct) {
    window.gameScore += 10 * (currentRound + 1);
    document.getElementById('scoreDisplay').textContent = window.gameScore;
    const area = document.getElementById('gameArea');
    const rect = area.getBoundingClientRect();
    spawnParticles(rect.left + rect.width/2, rect.top + rect.height/2, '${c.accent}', 12);
    addCombo();
    showScorePopup(rect.left + rect.width/2, rect.top + 50, '+' + (10 * (currentRound + 1)));
    const dots = document.querySelectorAll('.round-dot');
    if (dots[currentRound]) dots[currentRound].classList.add('done');
    currentRound++;
    if (currentRound >= TOTAL_ROUNDS) {
      setTimeout(() => showVictory('${config.winMessage}'), 500);
    } else {
      setTimeout(startRound, 800);
    }
  } else {
    screenShake();
    resetCombo();
    // Highlight wrong positions
    zones.forEach((z, i) => {
      if (z.firstElementChild && parseInt(z.firstElementChild.dataset.value) !== correctOrder[i]) {
        z.style.borderColor = '${c.danger}';
        setTimeout(() => { z.style.borderColor = '${c.primary}'; }, 600);
      }
    });
    showScorePopup(window.innerWidth/2, window.innerHeight/2, 'Not quite right!');
  }
}

function generateRound(round) {
  let count, range;
  if (round < 2) { count = 4; range = 20; }
  else if (round < 4) { count = 5; range = 50; }
  else { count = 6; range = 100; }

  // Generate unique random numbers
  const nums = new Set();
  while (nums.size < count) {
    const n = Math.floor(Math.random() * range * 2) - range;
    nums.add(n);
  }
  const values = Array.from(nums);
  return { values, sorted: [...values].sort((a, b) => a - b) };
}

function startRound() { resetFails();
  const { values, sorted } = generateRound(currentRound);
  correctOrder = sorted;
  itemCount = values.length;

  // Create drop zones
  const zonesContainer = document.getElementById('dropZones');
  zonesContainer.innerHTML = '';
  for (let i = 0; i < itemCount; i++) {
    zonesContainer.appendChild(createDropZone(i));
  }

  // Create items (shuffled)
  const shuffled = [...values];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const bank = document.getElementById('itemBank');
  bank.innerHTML = '';
  shuffled.forEach(v => bank.appendChild(createItem(v)));

  const dots = document.querySelectorAll('.round-dot');
  dots.forEach((d, i) => {
    d.classList.remove('current');
    if (i === currentRound) d.classList.add('current');
  });
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

  // VARIANT B: Number Line Drop — drop numbers onto correct position on a number line
  if (variant === "variantB") {
    const vB = `
<div class="intro-overlay" id="intro"><div class="intro-box"><h2>${config.title} — Number Line</h2><p>Drop each number onto the correct spot on the number line!</p><button class="intro-start" onclick="document.getElementById('intro').remove(); startGame()">Play →</button></div></div>
<div id="helpPanel" class="help-panel"><div class="help-content"><h3>How to play</h3><p>A number appears. Click where it belongs on the number line. Get close enough to score!</p><button class="help-close" onclick="document.getElementById('helpPanel').classList.remove('open')">Got it</button></div></div>
<div class="game-header"><div class="game-title">${config.title} — Number Line</div><div class="game-stats"><span>Score: <strong id="scoreDisplay">0</strong></span><div class="round-dots" id="roundDots"></div></div></div>
<div class="game-area" id="gameArea">
  <div style="text-align: center; width: 90%; max-width: 500px;">
    <div style="font-size: 14px; opacity: 0.6; margin-bottom: 8px;">Place this number on the line</div>
    <div id="targetNum" style="font-size: 48px; font-weight: 700; color: ${c.accent}; margin-bottom: 20px;"></div>
    <div style="position: relative; height: 60px; margin: 0 auto;">
      <canvas id="numLine" width="460" height="60" style="cursor: crosshair; border-radius: 8px;"></canvas>
    </div>
    <div id="feedback" style="margin-top: 12px; font-size: 14px; min-height: 20px;"></div>
  </div>
</div>
<script>
const TOTAL_ROUNDS = 5; let currentRound = 0, target = 0, rangeMin = 0, rangeMax = 10;
const canvas = document.getElementById('numLine'); const ctx = canvas.getContext('2d');
function drawLine() {
  ctx.clearRect(0,0,460,60); ctx.strokeStyle = '${c.secondary}'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(20,30); ctx.lineTo(440,30); ctx.stroke();
  for (let i = rangeMin; i <= rangeMax; i++) {
    const x = 20 + (i - rangeMin) / (rangeMax - rangeMin) * 420;
    ctx.beginPath(); ctx.moveTo(x,22); ctx.lineTo(x,38); ctx.stroke();
    ctx.fillStyle = '${c.text}'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(i.toString(), x, 52);
  }
}
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect(); const mx = e.clientX - rect.left;
  const clickVal = rangeMin + (mx - 20) / 420 * (rangeMax - rangeMin);
  const rounded = Math.round(clickVal);
  if (rounded === target) {
    window.gameScore += 10*(currentRound+1); document.getElementById('scoreDisplay').textContent = window.gameScore;
    spawnParticles(e.clientX, e.clientY, '${c.accent}', 10); addCombo();
    showScorePopup(e.clientX, e.clientY-20, '+'+(10*(currentRound+1)));
    // Draw marker
    const tx = 20 + (target - rangeMin) / (rangeMax - rangeMin) * 420;
    ctx.fillStyle = '${c.accent}'; ctx.beginPath(); ctx.arc(tx, 30, 8, 0, Math.PI*2); ctx.fill();
    const dots = document.querySelectorAll('.round-dot'); if(dots[currentRound]) dots[currentRound].classList.add('done');
    currentRound++; if(currentRound>=TOTAL_ROUNDS){setTimeout(()=>showVictory('${config.winMessage}'),600);}else{setTimeout(startRound,800);}
  } else { screenShake(); resetCombo(); trackFail();
    document.getElementById('feedback').style.color = '${c.danger}';
    document.getElementById('feedback').textContent = 'You clicked ' + rounded + ' — try again!';
    setTimeout(()=>{document.getElementById('feedback').textContent='';},1200);
  }
});
function startRound() { resetFails();
  if (currentRound < 2) { rangeMin = 0; rangeMax = 10; }
  else if (currentRound < 4) { rangeMin = -10; rangeMax = 10; }
  else { rangeMin = -20; rangeMax = 20; }
  target = rangeMin + Math.floor(Math.random()*(rangeMax-rangeMin+1));
  document.getElementById('targetNum').textContent = target;
  document.getElementById('feedback').textContent = '';
  drawLine();
  const dots = document.querySelectorAll('.round-dot'); dots.forEach((d,i)=>{d.classList.remove('current');if(i===currentRound)d.classList.add('current');});
}
function startGame(){const dc=document.getElementById('roundDots');dc.innerHTML='';for(let i=0;i<TOTAL_ROUNDS;i++){const d=document.createElement('div');d.className='round-dot';dc.appendChild(d);}startRound();}
</script>`
    return baseTemplate(config, vB, variant, 50)
  }

  // VARIANT C: Leaderboard Fix — a scoreboard has errors, drag names to fix the ranking
  if (variant === "variantC") {
    const vC = `
<div class="intro-overlay" id="intro"><div class="intro-box"><h2>${config.title} — Fix the Board</h2><p>The leaderboard is scrambled! Click to swap entries until the ranking is correct.</p><button class="intro-start" onclick="document.getElementById('intro').remove(); startGame()">Play →</button></div></div>
<div id="helpPanel" class="help-panel"><div class="help-content"><h3>How to play</h3><p>Scores should go from highest (top) to lowest (bottom). Click two entries to swap them. Fix the whole board!</p><button class="help-close" onclick="document.getElementById('helpPanel').classList.remove('open')">Got it</button></div></div>
<div class="game-header"><div class="game-title">${config.title} — Fix It</div><div class="game-stats"><span>Score: <strong id="scoreDisplay">0</strong></span><span>Swaps: <strong id="swapCount">0</strong></span><div class="round-dots" id="roundDots"></div></div></div>
<div class="game-area" id="gameArea">
  <div style="text-align: center; width: 90%; max-width: 360px;">
    <div style="font-size: 14px; opacity: 0.6; margin-bottom: 12px;">Fix the leaderboard — highest score on top!</div>
    <div id="board" style="display: flex; flex-direction: column; gap: 4px;"></div>
    <button onclick="checkBoard()" style="margin-top: 16px; padding: 10px 32px; background: ${c.primary}; color: ${config.vibe === "kawaii" ? "#fff" : c.bg}; border: none; border-radius: 8px; font-family: inherit; font-size: 16px; font-weight: 700; cursor: pointer;">Check!</button>
  </div>
</div>
<script>
const TOTAL_ROUNDS = 5; let currentRound = 0, boardData = [], selectedIdx = -1, swaps = 0;
const NAMES = ['Alex','Sam','Jordan','Casey','Riley','Morgan','Taylor','Quinn','Avery','Blake'];
function renderBoard() {
  const board = document.getElementById('board'); board.innerHTML = '';
  boardData.forEach((entry, i) => {
    const row = document.createElement('button');
    row.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; border-radius: 8px; cursor: pointer; transition: all 0.15s; font-family: inherit; width: 100%; border: 2px solid ' + (selectedIdx === i ? '${c.accent}' : '${c.primary}44') + '; background: ' + (selectedIdx === i ? '${c.accent}22' : '${c.primary}08') + ';';
    row.innerHTML = '<span style="font-size: 14px; color: ${c.text};">#' + (i+1) + ' ' + entry.name + '</span><span style="font-size: 18px; font-weight: 700; color: ${c.accent};">' + entry.score + '</span>';
    row.onclick = () => { if (selectedIdx === -1) { selectedIdx = i; renderBoard(); } else if (selectedIdx === i) { selectedIdx = -1; renderBoard(); } else {
      [boardData[selectedIdx], boardData[i]] = [boardData[i], boardData[selectedIdx]];
      selectedIdx = -1; swaps++; document.getElementById('swapCount').textContent = swaps; renderBoard();
    }};
    board.appendChild(row);
  });
}
function checkBoard() {
  let sorted = true;
  for (let i = 1; i < boardData.length; i++) { if (boardData[i].score > boardData[i-1].score) { sorted = false; break; } }
  if (sorted) {
    window.gameScore += Math.max(5, 20 - swaps) * (currentRound+1); document.getElementById('scoreDisplay').textContent = window.gameScore;
    const area = document.getElementById('gameArea'); const rect = area.getBoundingClientRect();
    spawnParticles(rect.left+rect.width/2, rect.top+rect.height/2, '${c.accent}', 12); addCombo();
    showScorePopup(rect.left+rect.width/2, rect.top+50, swaps <= 3 ? 'Perfect!' : 'Fixed!');
    const dots = document.querySelectorAll('.round-dot'); if(dots[currentRound]) dots[currentRound].classList.add('done');
    currentRound++; if(currentRound>=TOTAL_ROUNDS){setTimeout(()=>showVictory('${config.winMessage}'),500);}else{setTimeout(startRound,800);}
  } else { screenShake(); resetCombo(); trackFail(); showScorePopup(window.innerWidth/2, window.innerHeight/2, 'Not in order yet!'); }
}
function startRound() { resetFails(); selectedIdx = -1; swaps = 0; document.getElementById('swapCount').textContent = '0';
  const count = currentRound < 2 ? 4 : currentRound < 4 ? 5 : 6;
  const maxScore = currentRound < 2 ? 50 : 200;
  boardData = [];
  const usedNames = new Set();
  for (let i = 0; i < count; i++) {
    let name; do { name = NAMES[Math.floor(Math.random()*NAMES.length)]; } while (usedNames.has(name));
    usedNames.add(name);
    boardData.push({ name, score: Math.floor(Math.random()*maxScore)+1 });
  }
  // Scramble
  for (let i = boardData.length-1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [boardData[i],boardData[j]] = [boardData[j],boardData[i]]; }
  renderBoard();
  const dots = document.querySelectorAll('.round-dot'); dots.forEach((d,i)=>{d.classList.remove('current');if(i===currentRound)d.classList.add('current');});
}
function startGame(){const dc=document.getElementById('roundDots');dc.innerHTML='';for(let i=0;i<TOTAL_ROUNDS;i++){const d=document.createElement('div');d.className='round-dot';dc.appendChild(d);}startRound();}
</script>`
    return baseTemplate(config, vC, variant, 50)
  }

  return baseTemplate(config, gameContent, variant, 50)
}
