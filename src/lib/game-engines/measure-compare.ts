// Measure & Compare engine
// Two objects shown with measurements. Compare and pick the right one.
// 5 rounds, progressive difficulty.

import type { ThemeConfig, MathParams, GameVariant } from "./engine-types"
import { baseTemplate } from "./base-template"

export function measureCompareEngine(config: ThemeConfig, math: MathParams, variant: GameVariant = "classic"): string {
  const c = config.colors

  const gameContent = `
<div class="intro-overlay" id="intro">
  <div class="intro-box">
    <h2>${config.title}</h2>
    <p>You are a <strong>${config.character}</strong> in a <strong>${config.worldName}</strong>.</p>
    <p>Compare the ${config.itemName} and pick the one that matches the question!</p>
    <button class="intro-start" onclick="document.getElementById('intro').remove(); startGame()">Play →</button>
  </div>
</div>
<div id="helpPanel" class="help-panel">
  <div class="help-content">
    <h3>How to play</h3>
    <p>Two items appear with measurements. Read the question and click the correct one.</p>
    <h3>Valid moves</h3><p>• "Which is longer?" → click the one with the bigger measurement ✅</p>
    <h3>Invalid moves</h3><p>• Clicking the shorter one when asked "Which is longer?" ❌</p>
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
  <div style="text-align: center; width: 90%; max-width: 500px;">
    <div id="question" style="font-size: 18px; font-weight: 700; color: ${c.accent}; margin-bottom: 24px;"></div>
    <div style="display: flex; gap: 24px; justify-content: center;">
      <button id="optA" onclick="pickOption('A')" style="flex: 1; max-width: 200px; padding: 24px 16px; background: ${c.primary}11; border: 3px solid ${c.primary}44; border-radius: 16px; cursor: pointer; transition: all 0.2s; font-family: inherit;">
        <div style="font-size: 14px; color: ${c.text}; opacity: 0.6; margin-bottom: 4px;">Item A</div>
        <div id="valA" style="font-size: 32px; font-weight: 700; color: ${c.primary};"></div>
        <div id="barA" style="height: 8px; background: ${c.primary}; border-radius: 4px; margin-top: 12px; transition: width 0.5s;"></div>
      </button>
      <button id="optB" onclick="pickOption('B')" style="flex: 1; max-width: 200px; padding: 24px 16px; background: ${c.accent}11; border: 3px solid ${c.accent}44; border-radius: 16px; cursor: pointer; transition: all 0.2s; font-family: inherit;">
        <div style="font-size: 14px; color: ${c.text}; opacity: 0.6; margin-bottom: 4px;">Item B</div>
        <div id="valB" style="font-size: 32px; font-weight: 700; color: ${c.accent};"></div>
        <div id="barB" style="height: 8px; background: ${c.accent}; border-radius: 4px; margin-top: 12px; transition: width 0.5s;"></div>
      </button>
    </div>
    <div id="feedback" style="margin-top: 20px; font-size: 14px; min-height: 20px;"></div>
  </div>
</div>
<script>
const TOTAL_ROUNDS = 5;
let currentRound = 0, correctOption = '';
const UNITS = ['cm', 'inches', 'kg', 'lbs', 'liters', 'cups', 'meters', 'feet'];
const QUESTIONS = ['Which is bigger?', 'Which is smaller?', 'Which weighs more?', 'Which holds more?', 'Which is longer?', 'Which is shorter?'];

function pickOption(opt) {
  if (opt === correctOption) {
    window.gameScore += 10 * (currentRound + 1);
    document.getElementById('scoreDisplay').textContent = window.gameScore;
    const btn = document.getElementById('opt' + opt);
    const rect = btn.getBoundingClientRect();
    spawnParticles(rect.left + rect.width/2, rect.top + rect.height/2, '${c.accent}', 10);
    addCombo();
    showScorePopup(rect.left + rect.width/2, rect.top - 10, '+' + (10 * (currentRound + 1)));
    btn.style.borderColor = '${c.accent}';
    btn.style.background = '${c.accent}22';
    const dots = document.querySelectorAll('.round-dot');
    if (dots[currentRound]) dots[currentRound].classList.add('done');
    currentRound++;
    if (currentRound >= TOTAL_ROUNDS) { setTimeout(() => showVictory('${config.winMessage}'), 600); }
    else { setTimeout(startRound, 800); }
  } else {
    screenShake(); resetCombo(); trackFail();
    const btn = document.getElementById('opt' + opt);
    btn.style.borderColor = '${c.danger}';
    setTimeout(() => { btn.style.borderColor = opt === 'A' ? '${c.primary}44' : '${c.accent}44'; }, 500);
    document.getElementById('feedback').style.color = '${c.danger}';
    document.getElementById('feedback').textContent = 'Wrong one! Look at the numbers again.';
    setTimeout(() => { document.getElementById('feedback').textContent = ''; }, 1500);
  }
}

function startRound() { resetFails();
  let maxVal;
  if (currentRound < 2) maxVal = 20;
  else if (currentRound < 4) maxVal = 100;
  else maxVal = 500;
  const valA = Math.floor(Math.random() * maxVal) + 1;
  let valB = Math.floor(Math.random() * maxVal) + 1;
  while (valB === valA) valB = Math.floor(Math.random() * maxVal) + 1;
  const unit = UNITS[Math.floor(Math.random() * UNITS.length)];
  const askBigger = Math.random() < 0.5;
  const qIdx = askBigger ? Math.floor(Math.random() * 3) * 2 : Math.floor(Math.random() * 3) * 2 + 1;
  document.getElementById('question').textContent = QUESTIONS[qIdx % QUESTIONS.length];
  document.getElementById('valA').textContent = valA + ' ' + unit;
  document.getElementById('valB').textContent = valB + ' ' + unit;
  const maxV = Math.max(valA, valB);
  document.getElementById('barA').style.width = Math.round((valA / maxV) * 100) + '%';
  document.getElementById('barB').style.width = Math.round((valB / maxV) * 100) + '%';
  if (askBigger) correctOption = valA > valB ? 'A' : 'B';
  else correctOption = valA < valB ? 'A' : 'B';
  document.getElementById('optA').style.borderColor = '${c.primary}44';
  document.getElementById('optA').style.background = '${c.primary}11';
  document.getElementById('optB').style.borderColor = '${c.accent}44';
  document.getElementById('optB').style.background = '${c.accent}11';
  document.getElementById('feedback').textContent = '';
  const dots = document.querySelectorAll('.round-dot');
  dots.forEach((d, i) => { d.classList.remove('current'); if (i === currentRound) d.classList.add('current'); });
}
function startGame() {
  const dc = document.getElementById('roundDots'); dc.innerHTML = '';
  for (let i = 0; i < TOTAL_ROUNDS; i++) { const d = document.createElement('div'); d.className = 'round-dot'; dc.appendChild(d); }
  startRound();
}
</script>`

  // VARIANT B: Ruler Race — measure objects with a ruler
  if (variant === "variantB") {
    const vB = `
<div class="intro-overlay" id="intro">
  <div class="intro-box">
    <h2>${config.title} — Ruler Race</h2>
    <p>You are a <strong>${config.character}</strong> in <strong>${config.worldName}</strong>.</p>
    <p>Each ${config.itemName} sits next to a ruler. Read the measurement and type it in!
    The faster you measure, the more bonus points you earn.</p>
    <button class="intro-start" onclick="document.getElementById('intro').remove(); startGame()">Measure up! →</button>
  </div>
</div>

<div id="helpPanel" class="help-panel">
  <div class="help-content">
    <h3>How to play</h3>
    <p>An object appears next to a ruler with markings. Count the marks carefully
    and type the measurement. Watch for half-marks (0.5)!</p>
    <h3>Examples</h3>
    <p>• Object ends at the 7th mark → type 7 ✅</p>
    <p>• Object ends between 4 and 5 → type 4.5 ✅</p>
    <button class="help-close" onclick="document.getElementById('helpPanel').classList.remove('open')">Got it</button>
  </div>
</div>

<div class="game-header">
  <div class="game-title">${config.title} — Ruler</div>
  <div class="game-stats">
    <span>Score: <strong id="scoreDisplay">0</strong></span>
    <div class="round-dots" id="roundDots"></div>
  </div>
</div>

<div class="game-area" id="gameArea">
  <div style="text-align: center; width: 90%; max-width: 450px;">
    <div style="font-size: 14px; opacity: 0.6; margin-bottom: 16px;">How long is this ${config.itemName}?</div>

    <!-- Ruler visualization -->
    <div style="position: relative; margin: 0 auto; margin-bottom: 24px;">
      <canvas id="rulerCanvas" width="400" height="100" style="border-radius: 8px;"></canvas>
    </div>

    <!-- Input -->
    <div style="display: flex; align-items: center; gap: 8px; justify-content: center; margin-bottom: 16px;">
      <input type="number" id="measureInput" step="0.5"
        style="width: 100px; font-size: 28px; font-weight: 700; text-align: center; background: ${c.bg}; color: ${c.text}; border: 3px solid ${c.primary}; border-radius: 12px; padding: 8px; font-family: inherit; outline: none;"
        placeholder="?">
      <span style="font-size: 16px; color: ${c.text}80;">cm</span>
    </div>

    <button onclick="checkMeasure()" style="padding: 12px 36px; background: ${c.primary}; color: ${config.vibe === "kawaii" ? "#fff" : c.bg}; border: none; border-radius: 8px; font-family: inherit; font-size: 16px; font-weight: 700; cursor: pointer;">
      Check ✓
    </button>
    <div id="feedback" style="margin-top: 12px; font-size: 14px; min-height: 20px;"></div>
  </div>
</div>

<script>
const TOTAL_ROUNDS = 5;
let currentRound = 0;
let correctLength = 0;
const canvas = document.getElementById('rulerCanvas');
const ctx = canvas.getContext('2d');

function drawRuler(objectLength) {
  const W = 400, H = 100;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '${c.bg}';
  ctx.fillRect(0, 0, W, H);

  // Ruler body
  ctx.fillStyle = '${c.secondary}22';
  ctx.fillRect(20, 50, 360, 30);
  ctx.strokeStyle = '${c.secondary}';
  ctx.lineWidth = 1;
  ctx.strokeRect(20, 50, 360, 30);

  // Ruler marks
  const pxPerUnit = 30;
  const maxUnits = 12;
  ctx.strokeStyle = '${c.text}';
  ctx.fillStyle = '${c.text}';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';

  for (let i = 0; i <= maxUnits; i++) {
    const x = 20 + i * pxPerUnit;
    ctx.lineWidth = i % 5 === 0 ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(x, 50);
    ctx.lineTo(x, 50 + (i % 5 === 0 ? 20 : 12));
    ctx.stroke();
    ctx.fillText(i.toString(), x, 48);
    if (i < maxUnits) {
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(x + pxPerUnit / 2, 50);
      ctx.lineTo(x + pxPerUnit / 2, 58);
      ctx.stroke();
    }
  }

  // Object being measured
  const objWidth = objectLength * pxPerUnit;
  ctx.fillStyle = '${c.primary}44';
  ctx.strokeStyle = '${c.primary}';
  ctx.lineWidth = 2;
  ctx.fillRect(20, 10, objWidth, 30);
  ctx.strokeRect(20, 10, objWidth, 30);

  // End arrows
  ctx.fillStyle = '${c.accent}';
  ctx.beginPath(); ctx.moveTo(20, 25); ctx.lineTo(14, 20); ctx.lineTo(14, 30); ctx.fill();
  ctx.beginPath(); ctx.moveTo(20 + objWidth, 25); ctx.lineTo(26 + objWidth, 20); ctx.lineTo(26 + objWidth, 30); ctx.fill();
}

function checkMeasure() {
  const input = parseFloat(document.getElementById('measureInput').value);
  if (isNaN(input)) { showScorePopup(window.innerWidth / 2, window.innerHeight / 2, 'Enter a number!'); return; }

  const feedback = document.getElementById('feedback');
  if (Math.abs(input - correctLength) <= 0.1) {
    window.gameScore += 10 * (currentRound + 1);
    document.getElementById('scoreDisplay').textContent = window.gameScore;
    spawnParticles(window.innerWidth / 2, window.innerHeight / 2, '${c.accent}', 12);
    addCombo();
    showScorePopup(window.innerWidth / 2, 100, '+' + (10 * (currentRound + 1)));
    feedback.style.color = '${c.accent}';
    feedback.textContent = 'Correct! It was ' + correctLength + ' cm';
    const dots = document.querySelectorAll('.round-dot');
    if (dots[currentRound]) dots[currentRound].classList.add('done');
    currentRound++;
    if (currentRound >= TOTAL_ROUNDS) { setTimeout(() => showVictory('${config.winMessage}'), 600); }
    else { setTimeout(startRound, 800); }
  } else {
    screenShake(); resetCombo(); trackFail();
    feedback.style.color = '${c.danger}';
    feedback.textContent = 'Not quite! Count the marks again.';
    setTimeout(() => { feedback.textContent = ''; }, 1500);
  }
}

function startRound() {
  resetFails();
  document.getElementById('measureInput').value = '';
  document.getElementById('feedback').textContent = '';

  // Progressive: whole numbers → halves → bigger numbers
  if (currentRound < 2) {
    correctLength = Math.floor(Math.random() * 8) + 2;
  } else if (currentRound < 4) {
    correctLength = Math.floor(Math.random() * 16) / 2 + 1;
    correctLength = Math.round(correctLength * 2) / 2;
  } else {
    correctLength = Math.floor(Math.random() * 20) / 2 + 2;
    correctLength = Math.round(correctLength * 2) / 2;
  }

  drawRuler(correctLength);
  document.getElementById('measureInput').focus();
  const dots = document.querySelectorAll('.round-dot');
  dots.forEach((d, i) => { d.classList.remove('current'); if (i === currentRound) d.classList.add('current'); });
}

function startGame() {
  const dc = document.getElementById('roundDots'); dc.innerHTML = '';
  for (let i = 0; i < TOTAL_ROUNDS; i++) { const d = document.createElement('div'); d.className = 'round-dot'; dc.appendChild(d); }
  startRound();
}

document.addEventListener('keydown', (e) => { if (e.key === 'Enter') checkMeasure(); });
</script>
`
    return baseTemplate(config, vB, variant, 30)
  }

  // VARIANT C: Unit Converter — convert between units to compare
  if (variant === "variantC") {
    const vC = `
<div class="intro-overlay" id="intro">
  <div class="intro-box">
    <h2>${config.title} — Unit Converter</h2>
    <p>You are a <strong>${config.character}</strong> in <strong>${config.worldName}</strong>.</p>
    <p>Two ${config.itemName} are measured in different units. Convert one to match
    the other, then pick which is actually bigger!</p>
    <button class="intro-start" onclick="document.getElementById('intro').remove(); startGame()">Convert! →</button>
  </div>
</div>

<div id="helpPanel" class="help-panel">
  <div class="help-content">
    <h3>How to play</h3>
    <p>Two values appear in different units. Convert one to the other unit,
    then click the one that's actually bigger.</p>
    <h3>Conversions to remember</h3>
    <p>• 1 foot = 12 inches</p>
    <p>• 1 meter = 100 cm</p>
    <p>• 1 kg = 1000 grams</p>
    <p>• 1 liter = 1000 ml</p>
    <button class="help-close" onclick="document.getElementById('helpPanel').classList.remove('open')">Got it</button>
  </div>
</div>

<div class="game-header">
  <div class="game-title">${config.title} — Convert</div>
  <div class="game-stats">
    <span>Score: <strong id="scoreDisplay">0</strong></span>
    <div class="round-dots" id="roundDots"></div>
  </div>
</div>

<div class="game-area" id="gameArea">
  <div style="text-align: center; width: 90%; max-width: 450px;">
    <div style="font-size: 18px; font-weight: 700; color: ${c.accent}; margin-bottom: 8px;">
      Which is bigger?
    </div>
    <div style="font-size: 13px; opacity: 0.6; margin-bottom: 16px;" id="convHint"></div>

    <div style="display: flex; gap: 20px; justify-content: center;">
      <button id="optA" onclick="pickOpt('A')"
        style="flex: 1; max-width: 180px; padding: 28px 16px; border: 3px solid ${c.primary}44; border-radius: 16px; background: ${c.primary}08; cursor: pointer; transition: all 0.2s; font-family: inherit;">
        <div id="valA" style="font-size: 28px; font-weight: 700; color: ${c.primary};"></div>
      </button>

      <div style="font-size: 28px; color: ${c.text}22; align-self: center; font-weight: 700;">VS</div>

      <button id="optB" onclick="pickOpt('B')"
        style="flex: 1; max-width: 180px; padding: 28px 16px; border: 3px solid ${c.accent}44; border-radius: 16px; background: ${c.accent}08; cursor: pointer; transition: all 0.2s; font-family: inherit;">
        <div id="valB" style="font-size: 28px; font-weight: 700; color: ${c.accent};"></div>
      </button>
    </div>

    <div id="feedback" style="margin-top: 20px; font-size: 15px; min-height: 24px;"></div>
  </div>
</div>

<script>
const TOTAL_ROUNDS = 5;
let currentRound = 0;
let correctOpt = '';

const CONVERSIONS = [
  { unitA: 'cm', unitB: 'mm', factor: 10, hint: '1 cm = 10 mm' },
  { unitA: 'm', unitB: 'cm', factor: 100, hint: '1 m = 100 cm' },
  { unitA: 'kg', unitB: 'g', factor: 1000, hint: '1 kg = 1000 g' },
  { unitA: 'feet', unitB: 'inches', factor: 12, hint: '1 foot = 12 inches' },
  { unitA: 'liters', unitB: 'ml', factor: 1000, hint: '1 liter = 1000 ml' },
];

function pickOpt(opt) {
  const feedback = document.getElementById('feedback');

  if (opt === correctOpt) {
    window.gameScore += 10 * (currentRound + 1);
    document.getElementById('scoreDisplay').textContent = window.gameScore;
    const btn = document.getElementById('opt' + opt);
    btn.style.borderColor = '${c.accent}';
    btn.style.background = '${c.accent}22';
    spawnParticles(window.innerWidth / 2, window.innerHeight / 2, '${c.accent}', 12);
    addCombo();
    showScorePopup(window.innerWidth / 2, 100, '+' + (10 * (currentRound + 1)));
    feedback.style.color = '${c.accent}';
    feedback.textContent = 'Correct! Great conversion!';

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
    const btn = document.getElementById('opt' + opt);
    btn.style.borderColor = '${c.danger}';
    setTimeout(() => {
      btn.style.borderColor = opt === 'A' ? '${c.primary}44' : '${c.accent}44';
    }, 500);
    feedback.style.color = '${c.danger}';
    feedback.textContent = 'Convert and compare again!';
    setTimeout(() => { feedback.textContent = ''; }, 1500);
  }
}

function startRound() {
  resetFails();
  document.getElementById('feedback').textContent = '';
  document.getElementById('optA').style.borderColor = '${c.primary}44';
  document.getElementById('optA').style.background = '${c.primary}08';
  document.getElementById('optB').style.borderColor = '${c.accent}44';
  document.getElementById('optB').style.background = '${c.accent}08';

  const conv = CONVERSIONS[currentRound % CONVERSIONS.length];
  document.getElementById('convHint').textContent = 'Remember: ' + conv.hint;

  // Generate two values in different units
  const valSmallUnit = Math.floor(Math.random() * 50) + 10;
  const valBigUnit = Math.floor(Math.random() * 5) + 1;
  const bigUnitInSmall = valBigUnit * conv.factor;

  // Randomly assign to A and B
  if (Math.random() < 0.5) {
    document.getElementById('valA').textContent = valSmallUnit + ' ' + conv.unitB;
    document.getElementById('valB').textContent = valBigUnit + ' ' + conv.unitA;
    correctOpt = bigUnitInSmall > valSmallUnit ? 'B' : 'A';
  } else {
    document.getElementById('valA').textContent = valBigUnit + ' ' + conv.unitA;
    document.getElementById('valB').textContent = valSmallUnit + ' ' + conv.unitB;
    correctOpt = bigUnitInSmall > valSmallUnit ? 'A' : 'B';
  }

  const dots = document.querySelectorAll('.round-dot');
  dots.forEach((d, i) => { d.classList.remove('current'); if (i === currentRound) d.classList.add('current'); });
}

function startGame() {
  const dc = document.getElementById('roundDots'); dc.innerHTML = '';
  for (let i = 0; i < TOTAL_ROUNDS; i++) { const d = document.createElement('div'); d.className = 'round-dot'; dc.appendChild(d); }
  startRound();
}
</script>
`
    return baseTemplate(config, vC, variant, 30)
  }

  return baseTemplate(config, gameContent, variant, 30)
}
