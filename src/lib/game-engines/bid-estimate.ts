// Bid & Estimate engine
// Items shown with clues. Estimate the value. Bid. See if you're close enough.
// 5 rounds, progressive difficulty.

import type { ThemeConfig, MathParams, GameVariant } from "./engine-types"
import { baseTemplate } from "./base-template"

export function bidEstimateEngine(config: ThemeConfig, math: MathParams, variant: GameVariant = "classic"): string {
  const c = config.colors

  const gameContent = `
<div class="intro-overlay" id="intro">
  <div class="intro-box">
    <h2>${config.title}</h2>
    <p>You are a <strong>${config.character}</strong> in a <strong>${config.worldName}</strong>.</p>
    <p>Estimate the value of each ${config.itemName} and place your bid. Get within 20% to win!</p>
    <button class="intro-start" onclick="document.getElementById('intro').remove(); startGame()">Play →</button>
  </div>
</div>
<div id="helpPanel" class="help-panel">
  <div class="help-content">
    <h3>How to play</h3>
    <p>An item appears with clues about its value. Type your estimate and bid. If you're within 20% of the real value, you win the round.</p>
    <h3>Valid bids</h3><p>• Real value is 50. Bidding 45 (within 20%) ✅</p>
    <h3>Invalid bids</h3><p>• Real value is 50. Bidding 30 (too far off) ❌</p>
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
  <div style="text-align: center; width: 90%; max-width: 400px;">
    <!-- Item display -->
    <div style="background: ${c.primary}11; border: 2px solid ${c.primary}; border-radius: 16px; padding: 24px; margin-bottom: 20px;">
      <div style="font-size: 40px; margin-bottom: 8px;" id="itemIcon">🎁</div>
      <div id="clue1" style="font-size: 16px; color: ${c.text}; margin-bottom: 4px;"></div>
      <div id="clue2" style="font-size: 14px; color: ${c.text}; opacity: 0.7;"></div>
    </div>
    <!-- Bid input -->
    <div style="margin-bottom: 16px;">
      <div style="font-size: 14px; opacity: 0.6; margin-bottom: 8px;">Your estimate</div>
      <input type="number" id="bidInput" style="width: 160px; text-align: center; font-size: 32px; font-weight: 700; background: ${c.bg}; color: ${c.text}; border: 3px solid ${c.primary}; border-radius: 12px; padding: 8px; font-family: inherit; outline: none;" placeholder="?">
    </div>
    <button onclick="placeBid()" style="padding: 12px 40px; background: ${c.accent}; color: ${c.bg}; border: none; border-radius: 8px; font-family: inherit; font-size: 18px; font-weight: 700; cursor: pointer;">
      Bid!
    </button>
    <div id="result" style="margin-top: 16px; font-size: 16px; min-height: 24px;"></div>
  </div>
</div>
<script>
const TOTAL_ROUNDS = 5;
let currentRound = 0, realValue = 0;
const ICONS = ['💎', '🏺', '⚗️', '🗝️', '🎭'];

function placeBid() {
  const bid = parseInt(document.getElementById('bidInput').value);
  if (isNaN(bid) || bid <= 0) { showScorePopup(window.innerWidth/2, window.innerHeight/2, 'Enter a number!'); return; }
  const diff = Math.abs(bid - realValue);
  const pct = diff / realValue;
  const result = document.getElementById('result');
  if (pct <= 0.2) {
    const points = Math.round((1 - pct) * 20) * (currentRound + 1);
    window.gameScore += points;
    document.getElementById('scoreDisplay').textContent = window.gameScore;
    const area = document.getElementById('gameArea');
    const rect = area.getBoundingClientRect();
    spawnParticles(rect.left + rect.width/2, rect.top + rect.height/2, '${c.accent}', 12);
    addCombo();
    result.style.color = '${c.accent}';
    result.textContent = pct === 0 ? 'Perfect! It was ' + realValue : 'Close! It was ' + realValue + '. You were ' + Math.round(pct * 100) + '% off.';
    showScorePopup(rect.left + rect.width/2, rect.top + 50, '+' + points);
    const dots = document.querySelectorAll('.round-dot');
    if (dots[currentRound]) dots[currentRound].classList.add('done');
    currentRound++;
    if (currentRound >= TOTAL_ROUNDS) { setTimeout(() => showVictory('${config.winMessage}'), 800); }
    else { setTimeout(startRound, 1200); }
  } else {
    screenShake(); resetCombo();
    result.style.color = '${c.danger}';
    result.textContent = 'Too far! It was ' + realValue + '. You were ' + Math.round(pct * 100) + '% off.';
    const dots = document.querySelectorAll('.round-dot');
    if (dots[currentRound]) dots[currentRound].className = 'round-dot';
    currentRound++;
    if (currentRound >= TOTAL_ROUNDS) { setTimeout(() => showDefeat('${config.loseMessage}'), 800); }
    else { setTimeout(startRound, 1200); }
  }
}

function generateClues(value, round) {
  const lower = Math.floor(value * 0.6 / 10) * 10;
  const upper = Math.ceil(value * 1.4 / 10) * 10;
  const near = Math.round(value / 10) * 10;
  const clues = [
    'Worth between ' + lower + ' and ' + upper,
    'Closer to ' + near + ' than to ' + (near + (value > near ? -20 : 20)),
    'More than ' + (value - Math.floor(Math.random() * 15) - 5),
    'Less than ' + (value + Math.floor(Math.random() * 15) + 5),
    'Round it to the nearest 10: ' + near,
  ];
  return { clue1: clues[Math.floor(Math.random() * 3)], clue2: clues[3 + Math.floor(Math.random() * 2)] };
}

function startRound() {
  let maxVal;
  if (currentRound < 2) maxVal = 50;
  else if (currentRound < 4) maxVal = 200;
  else maxVal = 500;
  realValue = Math.floor(Math.random() * (maxVal - 10)) + 10;
  const { clue1, clue2 } = generateClues(realValue, currentRound);
  document.getElementById('clue1').textContent = clue1;
  document.getElementById('clue2').textContent = clue2;
  document.getElementById('itemIcon').textContent = ICONS[currentRound % ICONS.length];
  document.getElementById('bidInput').value = '';
  document.getElementById('result').textContent = '';
  document.getElementById('bidInput').focus();
  const dots = document.querySelectorAll('.round-dot');
  dots.forEach((d, i) => { d.classList.remove('current'); if (i === currentRound) d.classList.add('current'); });
}
function startGame() {
  const dc = document.getElementById('roundDots'); dc.innerHTML = '';
  for (let i = 0; i < TOTAL_ROUNDS; i++) { const d = document.createElement('div'); d.className = 'round-dot'; dc.appendChild(d); }
  startRound();
}
document.addEventListener('keydown', (e) => { if (e.key === 'Enter') placeBid(); });
</script>`

  // VARIANT B: Price is Right — guess without going over
  if (variant === "variantB") {
    const vB = `
<div class="intro-overlay" id="intro">
  <div class="intro-box">
    <h2>${config.title} — Price is Right!</h2>
    <p>You are a <strong>${config.character}</strong> in <strong>${config.worldName}</strong>.</p>
    <p>Guess the value of each ${config.itemName} — but DON'T go over!
    The closest guess without exceeding the real value wins big points.</p>
    <button class="intro-start" onclick="document.getElementById('intro').remove(); startGame()">Let's play! →</button>
  </div>
</div>

<div id="helpPanel" class="help-panel">
  <div class="help-content">
    <h3>How to play</h3>
    <p>An item appears. You see one clue. Guess its value — but if you go
    OVER the real value, you get zero points for that round!</p>
    <h3>Scoring</h3>
    <p>• Exact guess = 50 points!</p>
    <p>• Within 5 = 30 points</p>
    <p>• Within 20% without going over = 20 points</p>
    <p>• Going over = 0 points 😬</p>
    <button class="help-close" onclick="document.getElementById('helpPanel').classList.remove('open')">Got it</button>
  </div>
</div>

<div class="game-header">
  <div class="game-title">${config.title} — Price is Right</div>
  <div class="game-stats">
    <span>Score: <strong id="scoreDisplay">0</strong></span>
    <div class="round-dots" id="roundDots"></div>
  </div>
</div>

<div class="game-area" id="gameArea">
  <div style="text-align: center; width: 90%; max-width: 400px;">
    <div style="font-size: 48px; margin-bottom: 8px;" id="itemEmoji">🎁</div>
    <div id="clueText" style="font-size: 16px; color: ${c.text}; background: ${c.primary}11; border: 2px solid ${c.primary}44; border-radius: 12px; padding: 12px; margin-bottom: 16px;"></div>

    <div style="font-size: 14px; opacity: 0.6; margin-bottom: 8px;">Your guess (don't go over!)</div>
    <input type="number" id="guessInput" style="width: 160px; text-align: center; font-size: 36px; font-weight: 700; background: ${c.bg}; color: ${c.text}; border: 3px solid ${c.accent}; border-radius: 12px; padding: 8px; font-family: inherit; outline: none;" placeholder="?">

    <div style="margin-top: 16px;">
      <button onclick="makeGuess()" style="padding: 12px 40px; background: ${c.accent}; color: ${c.bg}; border: none; border-radius: 8px; font-family: inherit; font-size: 18px; font-weight: 700; cursor: pointer;">
        Lock it in!
      </button>
    </div>
    <div id="result" style="margin-top: 16px; font-size: 16px; min-height: 24px;"></div>
  </div>
</div>

<script>
const TOTAL_ROUNDS = 5;
let currentRound = 0;
let realValue = 0;

function makeGuess() {
  const guess = parseInt(document.getElementById('guessInput').value);
  if (isNaN(guess) || guess <= 0) {
    showScorePopup(window.innerWidth / 2, window.innerHeight / 2, 'Enter a number!');
    return;
  }

  const result = document.getElementById('result');

  if (guess > realValue) {
    // Over! Zero points
    screenShake();
    resetCombo();
    result.style.color = '${c.danger}';
    result.textContent = 'Over! It was ' + realValue + '. You guessed ' + guess + ' 😬';
  } else {
    // Under or exact
    const diff = realValue - guess;
    let points = 0;
    if (diff === 0) { points = 50; result.textContent = 'EXACT! 🎯 It was ' + realValue + '!'; }
    else if (diff <= 5) { points = 30; result.textContent = 'So close! It was ' + realValue + '. Only ' + diff + ' away!'; }
    else if (diff <= realValue * 0.2) { points = 20; result.textContent = 'Good! It was ' + realValue + '.'; }
    else { points = 10; result.textContent = 'It was ' + realValue + '. You were ' + diff + ' away.'; }

    points *= (currentRound + 1);
    window.gameScore += points;
    document.getElementById('scoreDisplay').textContent = window.gameScore;
    result.style.color = '${c.accent}';
    addCombo();
    spawnParticles(window.innerWidth / 2, window.innerHeight / 2, '${c.accent}', 12);
    showScorePopup(window.innerWidth / 2, 100, '+' + points);
  }

  const dots = document.querySelectorAll('.round-dot');
  if (dots[currentRound]) dots[currentRound].classList.add('done');
  currentRound++;

  if (currentRound >= TOTAL_ROUNDS) {
    setTimeout(() => showVictory('${config.winMessage}'), 1000);
  } else {
    setTimeout(startRound, 1200);
  }
}

function startRound() {
  resetFails();
  document.getElementById('guessInput').value = '';
  document.getElementById('result').textContent = '';

  const maxVal = currentRound < 2 ? 50 : currentRound < 4 ? 200 : 500;
  realValue = Math.floor(Math.random() * (maxVal - 10)) + 10;

  // Generate a clue
  const clues = [
    'It\\'s worth between ' + Math.floor(realValue * 0.6) + ' and ' + Math.ceil(realValue * 1.4),
    'It\\'s ' + (realValue > maxVal / 2 ? 'more' : 'less') + ' than ' + Math.floor(maxVal / 2),
    'Round it to the nearest ' + (maxVal <= 50 ? '5' : '10') + ': about ' + (Math.round(realValue / (maxVal <= 50 ? 5 : 10)) * (maxVal <= 50 ? 5 : 10)),
  ];
  document.getElementById('clueText').textContent = clues[Math.floor(Math.random() * clues.length)];
  document.getElementById('itemEmoji').textContent = ['🎁', '💎', '🏺', '🗝️', '⚗️'][currentRound % 5];
  document.getElementById('guessInput').focus();

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

document.addEventListener('keydown', (e) => { if (e.key === 'Enter') makeGuess(); });
</script>
`
    return baseTemplate(config, vB, variant, 40)
  }

  // VARIANT C: Round and Win — round numbers to nearest 10/100
  if (variant === "variantC") {
    const vC = `
<div class="intro-overlay" id="intro">
  <div class="intro-box">
    <h2>${config.title} — Round It!</h2>
    <p>You are a <strong>${config.character}</strong> in <strong>${config.worldName}</strong>.</p>
    <p>Numbers flash on screen. Round them to the nearest 10 or 100 as fast as you can!
    The faster you round, the more points you earn.</p>
    <button class="intro-start" onclick="document.getElementById('intro').remove(); startGame()">Go! →</button>
  </div>
</div>

<div id="helpPanel" class="help-panel">
  <div class="help-content">
    <h3>How to play</h3>
    <p>A number appears with "Round to nearest 10" or "Round to nearest 100".
    Pick the correct rounded value from 4 choices.</p>
    <h3>Examples</h3>
    <p>• 37 rounded to nearest 10 = 40 ✅</p>
    <p>• 849 rounded to nearest 100 = 800 ✅</p>
    <button class="help-close" onclick="document.getElementById('helpPanel').classList.remove('open')">Got it</button>
  </div>
</div>

<div class="game-header">
  <div class="game-title">${config.title} — Round It!</div>
  <div class="game-stats">
    <span>Score: <strong id="scoreDisplay">0</strong></span>
    <div class="round-dots" id="roundDots"></div>
  </div>
</div>

<div class="game-area" id="gameArea">
  <div style="text-align: center; width: 90%; max-width: 400px;">
    <div id="instruction" style="font-size: 16px; color: ${c.accent}; margin-bottom: 8px;"></div>
    <div id="numberDisplay" style="font-size: 64px; font-weight: 700; color: ${c.text}; margin-bottom: 24px;"></div>
    <div id="choices" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;"></div>
  </div>
</div>

<script>
const TOTAL_ROUNDS = 5;
let currentRound = 0;
let correctAnswer = 0;

function pickAnswer(value, el) {
  if (value === correctAnswer) {
    window.gameScore += 10 * (currentRound + 1);
    document.getElementById('scoreDisplay').textContent = window.gameScore;
    el.style.background = '${c.accent}';
    el.style.color = '${c.bg}';
    el.style.borderColor = '${c.accent}';
    spawnParticles(window.innerWidth / 2, window.innerHeight / 2, '${c.accent}', 12);
    addCombo();
    showScorePopup(window.innerWidth / 2, 100, '+' + (10 * (currentRound + 1)));

    const dots = document.querySelectorAll('.round-dot');
    if (dots[currentRound]) dots[currentRound].classList.add('done');
    currentRound++;

    if (currentRound >= TOTAL_ROUNDS) {
      setTimeout(() => showVictory('${config.winMessage}'), 600);
    } else {
      setTimeout(startRound, 800);
    }
  } else {
    screenShake();
    resetCombo();
    trackFail();
    el.style.borderColor = '${c.danger}';
    el.style.background = '${c.danger}22';
    setTimeout(() => {
      el.style.borderColor = '${c.secondary}';
      el.style.background = '${c.secondary}11';
    }, 500);
  }
}

function startRound() {
  resetFails();

  // Progressive: round to 10, then to 100
  const roundTo = currentRound < 3 ? 10 : 100;
  const maxNum = roundTo === 10 ? 99 : 999;
  const number = Math.floor(Math.random() * maxNum) + 1;
  correctAnswer = Math.round(number / roundTo) * roundTo;

  document.getElementById('instruction').textContent = 'Round to the nearest ' + roundTo;
  document.getElementById('numberDisplay').textContent = number;

  // Generate choices
  const choices = new Set([correctAnswer]);
  while (choices.size < 4) {
    const offset = (Math.floor(Math.random() * 3) + 1) * roundTo * (Math.random() < 0.5 ? 1 : -1);
    const candidate = correctAnswer + offset;
    if (candidate >= 0) choices.add(candidate);
  }
  const shuffled = Array.from(choices);
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const container = document.getElementById('choices');
  container.innerHTML = '';
  shuffled.forEach(val => {
    const btn = document.createElement('button');
    btn.textContent = val;
    btn.style.cssText = 'padding: 16px; border-radius: 12px; font-size: 24px; font-weight: 700; cursor: pointer; border: 3px solid ${c.secondary}; background: ${c.secondary}11; color: ${c.text}; font-family: inherit; transition: all 0.15s;';
    btn.addEventListener('mouseenter', () => { btn.style.transform = 'scale(1.05)'; });
    btn.addEventListener('mouseleave', () => { btn.style.transform = 'scale(1)'; });
    btn.addEventListener('click', () => pickAnswer(val, btn));
    container.appendChild(btn);
  });

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
    return baseTemplate(config, vC, variant, 40)
  }

  return baseTemplate(config, gameContent, variant, 40)
}
