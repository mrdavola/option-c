// Balance & Equalize engine
// Player drags tokens onto a two-sided scale to make both sides equal.
// 5 rounds, progressive difficulty.

import type { ThemeConfig, MathParams, GameVariant } from "./engine-types"
import { baseTemplate } from "./base-template"

export function balanceEqualizeEngine(config: ThemeConfig, math: MathParams, variant: GameVariant = "classic"): string {
  const c = config.colors

  const gameContent = `
<div class="intro-overlay" id="intro">
  <div class="intro-box">
    <h2>${config.title}</h2>
    <p>You are a <strong>${config.character}</strong> in a <strong>${config.worldName}</strong>.</p>
    <p>Drag ${config.itemName} onto the right side of the scale to match the left side. Make both sides equal!</p>
    <button class="intro-start" onclick="document.getElementById('intro').remove(); startGame()">Play →</button>
  </div>
</div>

<div id="helpPanel" class="help-panel">
  <div class="help-content">
    <h3>How to play</h3>
    <p>Each round, the left side of the scale has a value. Drag ${config.itemName} from the bank onto the right side until both sides are equal.</p>
    <h3>Valid moves</h3>
    <p>• If left side = 12, drag a 7 and a 5 to the right (7 + 5 = 12) ✅</p>
    <p>• If left side = 8, drag an 8 to the right ✅</p>
    <h3>Invalid moves</h3>
    <p>• If left side = 12, putting 15 on the right (too much!) ❌</p>
    <p>• Leaving the right side empty ❌</p>
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
  <!-- Scale -->
  <div id="scaleContainer" style="position: relative; width: 500px; height: 320px;">
    <!-- Fulcrum -->
    <div style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 30px solid transparent; border-right: 30px solid transparent; border-bottom: 40px solid ${c.secondary};"></div>
    <!-- Beam -->
    <div id="beam" style="position: absolute; bottom: 38px; left: 50%; width: 400px; height: 6px; background: ${c.secondary}; transform: translateX(-50%); transition: transform 0.3s; transform-origin: center center; border-radius: 3px;"></div>
    <!-- Left pan -->
    <div id="leftPan" style="position: absolute; bottom: 42px; left: 50px; width: 150px; min-height: 80px; background: ${c.primary}22; border: 2px solid ${c.primary}; border-radius: 12px; display: flex; flex-wrap: wrap; gap: 4px; padding: 8px; align-content: flex-start; justify-content: center;">
      <div style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 12px; color: ${c.text}; opacity: 0.6;">LEFT</div>
    </div>
    <!-- Right pan (drop target) -->
    <div id="rightPan" style="position: absolute; bottom: 42px; right: 50px; width: 150px; min-height: 80px; background: ${c.accent}11; border: 2px dashed ${c.accent}; border-radius: 12px; display: flex; flex-wrap: wrap; gap: 4px; padding: 8px; align-content: flex-start; justify-content: center;"
      ondragover="event.preventDefault(); this.style.borderColor='${c.accent}'; this.style.background='${c.accent}22'"
      ondragleave="this.style.borderColor='${c.accent}'; this.style.background='${c.accent}11'"
      ondrop="handleDrop(event)">
      <div style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 12px; color: ${c.text}; opacity: 0.6;">DROP HERE</div>
    </div>
    <!-- Totals -->
    <div style="position: absolute; bottom: 130px; left: 75px; text-align: center; width: 100px;">
      <div style="font-size: 28px; font-weight: 700; color: ${c.primary};" id="leftTotal">0</div>
    </div>
    <div style="position: absolute; bottom: 130px; right: 75px; text-align: center; width: 100px;">
      <div style="font-size: 28px; font-weight: 700; color: ${c.accent};" id="rightTotal">0</div>
    </div>
    <!-- Equals sign -->
    <div style="position: absolute; bottom: 150px; left: 50%; transform: translateX(-50%); font-size: 24px; color: ${c.text}; opacity: 0.3;" id="equalsSign">=?</div>
  </div>
</div>

<!-- Token bank -->
<div style="padding: 12px 16px; border-top: 2px solid ${c.primary}22;">
  <div style="font-size: 12px; color: ${c.text}; opacity: 0.5; margin-bottom: 8px; text-align: center;">
    Drag ${config.itemName} to the right side ↑
  </div>
  <div id="tokenBank" style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; min-height: 50px;">
  </div>
</div>

<!-- Check button -->
<div style="padding: 8px 16px; text-align: center;">
  <button id="checkBtn" onclick="checkBalance()" style="padding: 10px 32px; background: ${c.primary}; color: ${c.bg}; border: none; border-radius: 8px; font-family: inherit; font-size: 16px; font-weight: 700; cursor: pointer;">
    Check Balance
  </button>
</div>

<script>
const TOTAL_ROUNDS = 5;
let currentRound = 0;
let leftValue = 0;
let rightValue = 0;
let draggedValue = 0;
let rightTokens = [];

function createToken(value, draggable) {
  const el = document.createElement('div');
  el.style.cssText = 'width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; cursor: ' + (draggable ? 'grab' : 'default') + ';';
  el.style.background = draggable ? '${c.accent}' : '${c.primary}';
  el.style.color = '${config.vibe === "kawaii" ? "#fff" : c.bg}';
  el.textContent = value;
  if (draggable) {
    el.draggable = true;
    el.dataset.value = value;
    el.addEventListener('dragstart', (e) => {
      draggedValue = parseInt(el.dataset.value);
      e.dataTransfer.setData('text/plain', el.dataset.value);
      el.style.opacity = '0.5';
    });
    el.addEventListener('dragend', () => {
      el.style.opacity = '1';
    });
    // Touch support
    el.addEventListener('touchstart', (e) => {
      draggedValue = parseInt(el.dataset.value);
      el.style.opacity = '0.5';
    });
    el.addEventListener('touchend', (e) => {
      el.style.opacity = '1';
      const touch = e.changedTouches[0];
      const dropTarget = document.getElementById('rightPan');
      const rect = dropTarget.getBoundingClientRect();
      if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
          touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        addToRight(draggedValue);
        el.remove();
      }
    });
  }
  return el;
}

function handleDrop(e) {
  e.preventDefault();
  const val = parseInt(e.dataTransfer.getData('text/plain'));
  if (isNaN(val)) return;
  addToRight(val);
  // Remove from bank
  const bank = document.getElementById('tokenBank');
  const tokens = bank.querySelectorAll('[data-value]');
  for (const t of tokens) {
    if (parseInt(t.dataset.value) === val) {
      t.remove();
      break;
    }
  }
  document.getElementById('rightPan').style.borderColor = '${c.accent}';
  document.getElementById('rightPan').style.background = '${c.accent}11';
}

function addToRight(val) {
  rightTokens.push(val);
  rightValue += val;
  document.getElementById('rightTotal').textContent = rightValue;
  // Add visual token to right pan
  const pan = document.getElementById('rightPan');
  const token = createToken(val, false);
  token.style.background = '${c.accent}';
  token.style.cursor = 'pointer';
  token.title = 'Click to remove';
  token.addEventListener('click', () => {
    const idx = rightTokens.indexOf(val);
    if (idx !== -1) {
      rightTokens.splice(idx, 1);
      rightValue -= val;
      document.getElementById('rightTotal').textContent = rightValue;
      token.remove();
      // Return to bank
      const bank = document.getElementById('tokenBank');
      bank.appendChild(createToken(val, true));
    }
  });
  pan.appendChild(token);
  // Tilt beam
  updateBeam();
}

function updateBeam() {
  const beam = document.getElementById('beam');
  const diff = rightValue - leftValue;
  const tilt = Math.max(-15, Math.min(15, diff * 2));
  beam.style.transform = 'translateX(-50%) rotate(' + tilt + 'deg)';
  const eq = document.getElementById('equalsSign');
  if (rightValue === leftValue && rightValue > 0) {
    eq.textContent = '= ✓';
    eq.style.color = '${c.accent}';
  } else {
    eq.textContent = '=?';
    eq.style.color = '${c.text}';
    eq.style.opacity = '0.3';
  }
}

function checkBalance() {
  if (rightValue === leftValue && rightValue > 0) {
    // Correct!
    window.gameScore += 10 * (currentRound + 1);
    document.getElementById('scoreDisplay').textContent = window.gameScore;
    const area = document.getElementById('gameArea');
    const rect = area.getBoundingClientRect();
    spawnParticles(rect.left + rect.width/2, rect.top + rect.height/2, '${c.accent}', 12);
    addCombo();
    showScorePopup(rect.left + rect.width/2, rect.top + 50, '+' + (10 * (currentRound + 1)));
    // Mark round
    const dots = document.querySelectorAll('.round-dot');
    if (dots[currentRound]) dots[currentRound].classList.add('done');
    currentRound++;
    if (currentRound >= TOTAL_ROUNDS) {
      setTimeout(() => showVictory('${config.winMessage}'), 500);
    } else {
      setTimeout(startRound, 800);
    }
  } else {
    // Wrong
    screenShake();
    resetCombo();
    if (rightValue > leftValue) {
      showScorePopup(window.innerWidth/2, window.innerHeight/2, 'Too much!');
    } else {
      showScorePopup(window.innerWidth/2, window.innerHeight/2, 'Not enough!');
    }
  }
}

function generateRound(round) {
  // Progressive difficulty
  let maxVal, tokenCount;
  if (round < 2) { maxVal = 10; tokenCount = 4; }
  else if (round < 4) { maxVal = 20; tokenCount = 5; }
  else { maxVal = 30; tokenCount = 6; }

  // Generate target (left side)
  const target = Math.floor(Math.random() * (maxVal - 3)) + 4;

  // Generate tokens that can sum to target (at least one valid combination)
  const tokens = [];
  // Ensure at least one pair that sums to target
  const a = Math.floor(Math.random() * (target - 1)) + 1;
  const b = target - a;
  tokens.push(a, b);
  // Add distractors
  while (tokens.length < tokenCount) {
    tokens.push(Math.floor(Math.random() * maxVal) + 1);
  }
  // Shuffle
  for (let i = tokens.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tokens[i], tokens[j]] = [tokens[j], tokens[i]];
  }

  return { target, tokens };
}

function startRound() { resetFails();
  rightValue = 0;
  rightTokens = [];
  document.getElementById('rightTotal').textContent = '0';
  document.getElementById('rightPan').innerHTML = '<div style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 12px; color: ${c.text}; opacity: 0.6;">DROP HERE</div>';

  const { target, tokens } = generateRound(currentRound);
  leftValue = target;
  document.getElementById('leftTotal').textContent = ${variant === "challenge" ? "'?'" : "target"};

  // Set left pan
  const leftPan = document.getElementById('leftPan');
  leftPan.innerHTML = '<div style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 12px; color: ${c.text}; opacity: 0.6;">LEFT</div>';
  leftPan.appendChild(createToken(target, false));

  // Set bank
  const bank = document.getElementById('tokenBank');
  bank.innerHTML = '';
  tokens.forEach(v => bank.appendChild(createToken(v, true)));

  updateBeam();

  // Update round dots
  const dots = document.querySelectorAll('.round-dot');
  dots.forEach((d, i) => {
    d.classList.remove('current');
    if (i === currentRound) d.classList.add('current');
  });
}

function startGame() {
  // Create round dots
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

  // VARIANT B: Mystery Side — one side hidden, figure out its value
  if (variant === "variantB") {
    const variantBContent = `
<div class="intro-overlay" id="intro"><div class="intro-box">
  <h2>${config.title} — Mystery Mode</h2>
  <p>One side of the scale is hidden! Figure out the mystery value by looking at the tokens available, then balance it.</p>
  <button class="intro-start" onclick="document.getElementById('intro').remove(); startGame()">Play →</button>
</div></div>
<div id="helpPanel" class="help-panel"><div class="help-content">
  <h3>How to play</h3><p>The left side shows "?" — you need to figure out what it is. Use the available tokens as clues. Once you know the value, drag tokens to match it on the right side.</p>
  <button class="help-close" onclick="document.getElementById('helpPanel').classList.remove('open')">Got it</button>
</div></div>
<div class="game-header"><div class="game-title">${config.title} — Mystery</div>
  <div class="game-stats"><span>Score: <strong id="scoreDisplay">0</strong></span><div class="round-dots" id="roundDots"></div></div>
</div>
<div class="game-area" id="gameArea">
  <div style="text-align: center; width: 90%; max-width: 500px;">
    <div style="display: flex; justify-content: center; gap: 40px; margin-bottom: 20px;">
      <div><div style="font-size: 14px; opacity: 0.6;">Left side</div><div id="leftVal" style="font-size: 48px; font-weight: 700; color: ${c.danger};">?</div></div>
      <div style="font-size: 36px; color: ${c.text}33; align-self: center;">=</div>
      <div><div style="font-size: 14px; opacity: 0.6;">Your side</div><div id="rightVal" style="font-size: 48px; font-weight: 700; color: ${c.primary};">0</div></div>
    </div>
    <div style="font-size: 13px; opacity: 0.5; margin-bottom: 12px;">Click ${config.itemName} to add to your side. Click again to remove.</div>
    <div id="tokenBank" style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; min-height: 60px; margin-bottom: 16px;"></div>
    <button id="checkBtn" onclick="checkMystery()" style="padding: 10px 32px; background: ${c.primary}; color: ${config.vibe === "kawaii" ? "#fff" : c.bg}; border: none; border-radius: 8px; font-family: inherit; font-size: 16px; font-weight: 700; cursor: pointer;">Check Balance</button>
    <button onclick="revealHint()" style="margin-left: 8px; padding: 10px 16px; background: ${c.secondary}33; color: ${c.text}; border: 1px solid ${c.secondary}; border-radius: 8px; font-family: inherit; cursor: pointer;">Hint</button>
    <div id="hintArea" style="margin-top: 8px; font-size: 13px; color: ${c.accent}; min-height: 20px;"></div>
  </div>
</div>
<script>
const TOTAL_ROUNDS = 5; let currentRound = 0, mysteryVal = 0, rightTotal = 0, selected = new Set();
function createToken(val, idx) {
  const el = document.createElement('div');
  el.style.cssText = 'width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; cursor: pointer; transition: all 0.15s; border: 2px solid ${c.primary}44; background: ${c.primary}11; color: ${c.text};';
  el.textContent = val; el.dataset.val = val; el.dataset.idx = idx;
  el.onclick = () => toggleToken(el, parseInt(el.dataset.val), parseInt(el.dataset.idx));
  return el;
}
function toggleToken(el, val, idx) {
  if (selected.has(idx)) { selected.delete(idx); rightTotal -= val; el.style.background = '${c.primary}11'; el.style.borderColor = '${c.primary}44'; }
  else { selected.add(idx); rightTotal += val; el.style.background = '${c.accent}'; el.style.borderColor = '${c.accent}'; el.style.color = '${config.vibe === "kawaii" ? "#fff" : c.bg}'; }
  document.getElementById('rightVal').textContent = rightTotal;
}
function revealHint() {
  const hints = ['The mystery number is ' + (mysteryVal > 15 ? 'more than 15' : 'less than 15'), 'It is ' + (mysteryVal % 2 === 0 ? 'even' : 'odd'), 'It is between ' + (mysteryVal - 3) + ' and ' + (mysteryVal + 3)];
  document.getElementById('hintArea').textContent = hints[Math.floor(Math.random() * hints.length)];
}
function checkMystery() {
  if (rightTotal === mysteryVal) {
    document.getElementById('leftVal').textContent = mysteryVal; document.getElementById('leftVal').style.color = '${c.accent}';
    window.gameScore += 10*(currentRound+1); document.getElementById('scoreDisplay').textContent = window.gameScore;
    const area = document.getElementById('gameArea'); const rect = area.getBoundingClientRect();
    spawnParticles(rect.left+rect.width/2, rect.top+rect.height/2, '${c.accent}', 12); addCombo();
    showScorePopup(rect.left+rect.width/2, rect.top+50, '+'+(10*(currentRound+1)));
    const dots = document.querySelectorAll('.round-dot'); if(dots[currentRound]) dots[currentRound].classList.add('done');
    currentRound++; if(currentRound>=TOTAL_ROUNDS){setTimeout(()=>showVictory('${config.winMessage}'),500);}else{setTimeout(startRound,800);}
  } else { screenShake(); resetCombo(); trackFail();
    showScorePopup(window.innerWidth/2, window.innerHeight/2, rightTotal > mysteryVal ? 'Too much!' : 'Not enough!');
  }
}
function startRound() { resetFails(); rightTotal = 0; selected = new Set();
  document.getElementById('rightVal').textContent = '0';
  document.getElementById('leftVal').textContent = '?'; document.getElementById('leftVal').style.color = '${c.danger}';
  document.getElementById('hintArea').textContent = '';
  const maxVal = currentRound < 2 ? 12 : currentRound < 4 ? 20 : 30;
  mysteryVal = Math.floor(Math.random()*(maxVal-3))+4;
  const tokens = []; const a = Math.floor(Math.random()*(mysteryVal-1))+1; tokens.push(a, mysteryVal-a);
  while(tokens.length < (currentRound < 2 ? 5 : 7)) tokens.push(Math.floor(Math.random()*maxVal)+1);
  for(let i=tokens.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[tokens[i],tokens[j]]=[tokens[j],tokens[i]];}
  const bank = document.getElementById('tokenBank'); bank.innerHTML = '';
  tokens.forEach((v,i) => bank.appendChild(createToken(v,i)));
  const dots = document.querySelectorAll('.round-dot'); dots.forEach((d,i)=>{d.classList.remove('current');if(i===currentRound)d.classList.add('current');});
}
function startGame(){const dc=document.getElementById('roundDots');dc.innerHTML='';for(let i=0;i<TOTAL_ROUNDS;i++){const d=document.createElement('div');d.className='round-dot';dc.appendChild(d);}startRound();}
</script>`
    return baseTemplate(config, variantBContent, variant, 60)
  }

  // VARIANT C: Chain Scales — balance 3 connected scales
  if (variant === "variantC") {
    const variantCContent = `
<div class="intro-overlay" id="intro"><div class="intro-box">
  <h2>${config.title} — Chain Mode</h2>
  <p>Balance 3 connected scales! The result of each scale feeds into the next one.</p>
  <button class="intro-start" onclick="document.getElementById('intro').remove(); startGame()">Play →</button>
</div></div>
<div id="helpPanel" class="help-panel"><div class="help-content">
  <h3>How to play</h3><p>Three scales appear in a chain. Balance the first, its result becomes one side of the second, and so on. Get all 3 balanced to win the round!</p>
  <button class="help-close" onclick="document.getElementById('helpPanel').classList.remove('open')">Got it</button>
</div></div>
<div class="game-header"><div class="game-title">${config.title} — Chain</div>
  <div class="game-stats"><span>Score: <strong id="scoreDisplay">0</strong></span><span>Round: <strong id="roundDisplay">1</strong>/3</span></div>
</div>
<div class="game-area" id="gameArea">
  <div style="text-align: center; width: 90%; max-width: 500px;">
    <div style="font-size: 14px; opacity: 0.6; margin-bottom: 8px;">Scale <span id="scaleNum">1</span> of 3</div>
    <div style="display: flex; justify-content: center; gap: 40px; margin-bottom: 16px;">
      <div><div style="font-size: 12px; opacity: 0.5;">Left</div><div id="leftVal" style="font-size: 40px; font-weight: 700; color: ${c.primary};"></div></div>
      <div style="font-size: 28px; color: ${c.text}33; align-self: center;">=</div>
      <div><div style="font-size: 12px; opacity: 0.5;">Right</div><div id="rightVal" style="font-size: 40px; font-weight: 700; color: ${c.accent};">0</div></div>
    </div>
    <div id="tokenBank" style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 16px;"></div>
    <button onclick="checkChain()" style="padding: 10px 32px; background: ${c.primary}; color: ${config.vibe === "kawaii" ? "#fff" : c.bg}; border: none; border-radius: 8px; font-family: inherit; font-size: 16px; font-weight: 700; cursor: pointer;">Balance!</button>
  </div>
</div>
<script>
let currentScale = 0, currentRound = 0, leftVal = 0, rightTotal = 0, selected = new Set(), chainValues = [];
function createToken(val, idx) {
  const el = document.createElement('div');
  el.style.cssText = 'width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.15s; border: 2px solid ${c.primary}44; background: ${c.primary}11; color: ${c.text};';
  el.textContent = val; el.dataset.val = val; el.dataset.idx = idx;
  el.onclick = () => { if(selected.has(idx)){selected.delete(idx);rightTotal-=val;el.style.background='${c.primary}11';el.style.borderColor='${c.primary}44';el.style.color='${c.text}';}else{selected.add(idx);rightTotal+=val;el.style.background='${c.accent}';el.style.borderColor='${c.accent}';el.style.color='${config.vibe === "kawaii" ? "#fff" : c.bg}';} document.getElementById('rightVal').textContent=rightTotal; };
  return el;
}
function checkChain() {
  if (rightTotal === leftVal) {
    spawnParticles(window.innerWidth/2, window.innerHeight/2, '${c.accent}', 8); addCombo();
    currentScale++;
    if (currentScale >= 3) {
      window.gameScore += 30*(currentRound+1); document.getElementById('scoreDisplay').textContent = window.gameScore;
      showScorePopup(window.innerWidth/2, 100, 'Chain complete! +'+(30*(currentRound+1)));
      currentRound++; document.getElementById('roundDisplay').textContent = currentRound+1;
      if (currentRound >= 3) { setTimeout(()=>showVictory('${config.winMessage}'),500); }
      else { setTimeout(startRound, 800); }
    } else { setTimeout(startScale, 500); }
  } else { screenShake(); resetCombo(); trackFail();
    showScorePopup(window.innerWidth/2, window.innerHeight/2, rightTotal>leftVal?'Too much!':'Not enough!');
  }
}
function startScale() {
  rightTotal = 0; selected = new Set();
  document.getElementById('scaleNum').textContent = currentScale+1;
  leftVal = currentScale === 0 ? chainValues[0] : chainValues[currentScale];
  document.getElementById('leftVal').textContent = leftVal;
  document.getElementById('rightVal').textContent = '0';
  const tokens = []; const a = Math.floor(Math.random()*(leftVal-1))+1; tokens.push(a, leftVal-a);
  while(tokens.length < 5) tokens.push(Math.floor(Math.random()*15)+1);
  for(let i=tokens.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[tokens[i],tokens[j]]=[tokens[j],tokens[i]];}
  const bank = document.getElementById('tokenBank'); bank.innerHTML = '';
  tokens.forEach((v,i) => bank.appendChild(createToken(v,i)));
}
function startRound() { resetFails(); currentScale = 0;
  const base = Math.floor(Math.random()*8)+4;
  chainValues = [base, base + Math.floor(Math.random()*5)+2, base + Math.floor(Math.random()*8)+5];
  startScale();
}
function startGame() { startRound(); }
</script>`
    return baseTemplate(config, variantCContent, variant, 60)
  }

  return baseTemplate(config, gameContent, variant, 60)
}
