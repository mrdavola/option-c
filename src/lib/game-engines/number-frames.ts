// Number Frames — K.OA.A.1, K.OA.A.3 (and related: K.OA.A.2, K.OA.A.5, K.CC)
// Visual language adapted from Math Learning Center's free "Number Frames"
// app. Plain HTML/CSS/JS, light aesthetic, no Phaser.
//
// Modes (selected via `option`):
//  - "number-frames" (default) — ADD mode: 2 + 1 = ?
//      Learner fills each frame with the addends, counts total.
//  - "number-frames-decompose" — DECOMPOSE mode: 5 = ? + ?
//      Learner splits a total into two groups across frames.
//
// Principles:
//  - The LEARNER does the math. No running count displayed while counting.
//  - System reveals correctness only AFTER the learner commits.
//  - Both ten-frames clickable from the start. One "Done" button for both.

import type { ThemeConfig, MathParams, GameOption } from "./engine-types"

interface AddRound { kind: "add"; a: number; b: number; answer: number }
interface DecomposeRound { kind: "decompose"; total: number }
type Round = AddRound | DecomposeRound

const ROUNDS_ADD: Round[] = [
  { kind: "add", a: 2, b: 1, answer: 3 },
  { kind: "add", a: 3, b: 2, answer: 5 },
  { kind: "add", a: 4, b: 3, answer: 7 },
  { kind: "add", a: 6, b: 2, answer: 8 },
  { kind: "add", a: 5, b: 4, answer: 9 },
]

// K.OA.A.3 — decompose numbers ≤ 10 into pairs (each piece ≥ 1)
const ROUNDS_DECOMPOSE: Round[] = [
  { kind: "decompose", total: 3 },
  { kind: "decompose", total: 5 },
  { kind: "decompose", total: 6 },
  { kind: "decompose", total: 8 },
  { kind: "decompose", total: 10 },
]

export function numberFramesEngine(
  _config: ThemeConfig,
  _math: MathParams,
  option: GameOption = "number-frames",
): string {
  const mode: "add" | "decompose" = option === "number-frames-decompose" ? "decompose" : "add"
  const rounds = JSON.stringify(mode === "decompose" ? ROUNDS_DECOMPOSE : ROUNDS_ADD)

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src data: blob:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none';">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Add and take away</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: 100%; height: 100%;
    background: #ffffff;
    font-family: 'Lexend', system-ui, sans-serif;
    color: #1f2937;
    overflow: hidden;
  }
  #app {
    width: 100%; height: 100%;
    display: flex; flex-direction: column; align-items: center;
    padding: 32px 24px;
    max-width: 720px; margin: 0 auto;
    gap: 28px;
  }

  /* Progress dots */
  #progress { display: flex; gap: 10px; }
  #progress .dot { width: 10px; height: 10px; border-radius: 50%; background: #e5e7eb; }
  #progress .dot.active { background: #2563eb; }
  #progress .dot.done { background: #10b981; }

  /* Equation prompt */
  #prompt {
    font-size: 64px; font-weight: 700;
    color: #1f2937;
    letter-spacing: 0.02em;
    font-variant-numeric: tabular-nums;
  }
  #instruction {
    font-size: 17px; color: #6b7280;
    min-height: 24px; text-align: center;
  }

  /* Frames area */
  #frames-wrap {
    display: flex; align-items: center; gap: 24px;
  }
  .frame {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 2px;
    padding: 4px;
    background: #d1d5db;
    border-radius: 4px;
  }
  .frame.locked { background: #86efac; }
  .frame.active { background: #93c5fd; }
  .frame.wobble { animation: wobble 0.4s ease; }
  @keyframes wobble {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-8px); }
    75% { transform: translateX(8px); }
  }
  .cell {
    width: 54px; height: 54px;
    background: #ffffff;
    border-radius: 2px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }
  .counter {
    width: 40px; height: 40px;
    background: #ef4444;
    border-radius: 50%;
    transform: scale(0);
    transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.18s, opacity 0.18s;
  }
  .counter.placed { transform: scale(1); }
  .counter.tapped { background: #9ca3af; transform: scale(0.75); }

  .operator {
    font-size: 48px; font-weight: 700; color: #1f2937;
  }

  /* Buttons */
  .btn-row { display: flex; gap: 14px; }
  button {
    font-family: 'Lexend', sans-serif;
    font-size: 18px; font-weight: 600;
    padding: 14px 34px;
    border: none; border-radius: 12px;
    cursor: pointer;
    transition: background 0.14s, transform 0.08s, opacity 0.2s;
  }
  button:active { transform: scale(0.97); }
  .btn-primary { background: #2563eb; color: white; }
  .btn-primary:hover { background: #1d4ed8; }
  .btn-primary:disabled { background: #cbd5e1; cursor: not-allowed; }

  #number-pad {
    display: none; gap: 12px; flex-wrap: wrap; justify-content: center;
  }
  #number-pad.visible { display: flex; }
  .num-btn {
    width: 64px; height: 64px; padding: 0;
    font-size: 28px; font-weight: 700;
    background: white; color: #1f2937;
    border: 2px solid #d1d5db; border-radius: 12px;
  }
  .num-btn:hover { background: #f3f4f6; border-color: #9ca3af; }
  .num-btn.fade { opacity: 0.25; transition: opacity 0.3s; pointer-events: none; }

  #success {
    display: none; text-align: center;
  }
  #success.visible { display: block; }
  #success p { font-size: 24px; font-weight: 700; color: #10b981; margin-bottom: 16px; }
</style>
</head>
<body>
<div id="app">
  <div id="progress"></div>
  <div id="prompt"></div>
  <div id="instruction"></div>

  <div id="frames-wrap">
    <div class="frame active" id="frame-a"></div>
    <div class="operator" id="operator">+</div>
    <div class="frame active" id="frame-b"></div>
  </div>

  <div class="btn-row">
    <button id="done-btn" class="btn-primary" onclick="onDone()">Done</button>
  </div>

  <div id="number-pad"></div>

  <div id="success">
    <p id="success-msg"></p>
    <button class="btn-primary" onclick="nextRound()">Next →</button>
  </div>
</div>

<script>
  const ROUNDS = ${rounds};
  let roundIdx = 0;
  let phase = "fill"; // fill | combine | count | answered
  let frameA = 0;   // counters in frame A
  let frameB = 0;   // counters in frame B
  let merged = 0;   // total counters in combined area
  let tapped = 0;   // counters tapped during counting

  function $(id) { return document.getElementById(id); }

  function renderProgress() {
    const p = $("progress");
    p.innerHTML = "";
    for (let i = 0; i < ROUNDS.length; i++) {
      const d = document.createElement("div");
      d.className = "dot" + (i < roundIdx ? " done" : i === roundIdx ? " active" : "");
      p.appendChild(d);
    }
  }

  function drawFrame(id, count, interactive, tappedCount) {
    const el = $(id);
    el.innerHTML = "";
    for (let i = 0; i < 10; i++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      const counter = document.createElement("div");
      counter.className = "counter";
      if (i < count) counter.classList.add("placed");
      if (tappedCount && i < tappedCount) counter.classList.add("tapped");
      cell.appendChild(counter);
      if (interactive) {
        cell.dataset.idx = String(i);
        cell.addEventListener("click", () => onCellClick(id, i));
      }
      el.appendChild(cell);
    }
  }

  function onCellClick(frameId, idx) {
    if (phase !== "fill") return;
    const isA = frameId === "frame-a";
    if (isA) {
      // If clicking a filled cell or beyond, adjust count
      frameA = idx < frameA ? idx : idx + 1;
      drawFrame("frame-a", frameA, true);
    } else {
      frameB = idx < frameB ? idx : idx + 1;
      drawFrame("frame-b", frameB, true);
    }
  }

  function onCountCellClick(frameId, idx) {
    if (phase !== "count") return;
    const el = $(frameId);
    const cell = el.children[idx];
    if (!cell) return;
    const counter = cell.querySelector(".counter");
    if (!counter || !counter.classList.contains("placed") || counter.classList.contains("tapped")) return;
    counter.classList.add("tapped");
    tapped++;
    // Once all merged counters are tapped, show number pad
    if (tapped >= merged) {
      showNumberPad();
    }
  }

  function startRound() {
    const r = ROUNDS[roundIdx];
    phase = "fill";
    frameA = 0; frameB = 0; merged = 0; tapped = 0;
    if (r.kind === "add") {
      $("prompt").textContent = r.a + " + " + r.b + " = ?";
      $("operator").textContent = "+";
      $("instruction").textContent = "Fill each frame with counters to show the numbers, then press Done.";
    } else {
      // decompose: 5 = ? + ?
      $("prompt").textContent = r.total + " = ? + ?";
      $("operator").textContent = "+";
      $("instruction").textContent = "Split " + r.total + " into two groups. Put some counters in each frame.";
    }
    $("success").classList.remove("visible");
    $("number-pad").classList.remove("visible");
    $("done-btn").style.display = "inline-block";
    $("done-btn").disabled = false;
    $("frame-a").className = "frame active";
    $("frame-b").className = "frame active";
    drawFrame("frame-a", 0, true);
    drawFrame("frame-b", 0, true);
    renderProgress();
  }

  function wobble(id) {
    const el = $(id);
    el.classList.add("wobble");
    setTimeout(() => el.classList.remove("wobble"), 420);
  }

  function onDone() {
    if (phase !== "fill") return;
    const r = ROUNDS[roundIdx];

    if (r.kind === "decompose") {
      const sum = frameA + frameB;
      if (sum !== r.total || frameA < 1 || frameB < 1) {
        wobble("frame-a");
        wobble("frame-b");
        if (frameA < 1 || frameB < 1) {
          $("instruction").textContent = "Put at least 1 counter in each frame.";
        } else if (sum < r.total) {
          $("instruction").textContent = "Not enough yet — add more counters.";
        } else {
          $("instruction").textContent = "Too many — try again.";
        }
        return;
      }
      // Valid decomposition — celebrate
      phase = "answered";
      $("done-btn").disabled = true;
      $("done-btn").style.display = "none";
      $("frame-a").className = "frame";
      $("frame-b").className = "frame";
      $("instruction").textContent = "";
      $("success-msg").textContent = frameA + " + " + frameB + " = " + r.total;
      $("success").classList.add("visible");
      return;
    }

    // ADD mode
    const aOK = frameA === r.a;
    const bOK = frameB === r.b;
    if (!aOK && !bOK) { wobble("frame-a"); wobble("frame-b"); $("instruction").textContent = "Not quite — check both frames and try again."; return; }
    if (!aOK) { wobble("frame-a"); $("instruction").textContent = "Check the left frame."; return; }
    if (!bOK) { wobble("frame-b"); $("instruction").textContent = "Check the right frame."; return; }
    // Both correct — switch to count phase. Dots stay where they are;
    // learner counts across both frames.
    phase = "count";
    merged = frameA + frameB;
    $("done-btn").disabled = true;
    $("done-btn").style.display = "none";
    $("frame-a").className = "frame";
    $("frame-b").className = "frame";
    const wireCountTaps = (id) => {
      const el = $(id);
      const fresh = el.cloneNode(true);
      el.parentNode.replaceChild(fresh, el);
      for (let i = 0; i < fresh.children.length; i++) {
        const idx = i;
        fresh.children[i].addEventListener("click", () => onCountCellClick(id, idx));
      }
    };
    wireCountTaps("frame-a");
    wireCountTaps("frame-b");
    $("instruction").textContent = "Now tap each counter to count how many. Then pick the total.";
  }

  function showNumberPad() {
    const r = ROUNDS[roundIdx];
    const correct = r.answer;
    const opts = new Set([correct]);
    while (opts.size < 5) {
      const offset = Math.floor(Math.random() * 5) - 2;
      const cand = correct + offset;
      if (cand >= 0 && cand <= 12 && cand !== correct) opts.add(cand);
    }
    const arr = [...opts].sort((x, y) => x - y);
    const pad = $("number-pad");
    pad.innerHTML = "";
    arr.forEach(n => {
      const btn = document.createElement("button");
      btn.className = "num-btn";
      btn.textContent = String(n);
      btn.onclick = () => onAnswer(n, btn);
      pad.appendChild(btn);
    });
    pad.classList.add("visible");
    $("instruction").textContent = "Pick the total";
  }

  function onAnswer(n, btn) {
    const r = ROUNDS[roundIdx];
    if (n === r.answer) {
      $("number-pad").classList.remove("visible");
      $("instruction").textContent = "";
      $("success-msg").textContent = r.a + " + " + r.b + " = " + r.answer;
      $("success").classList.add("visible");
      phase = "answered";
    } else {
      btn.classList.add("fade");
      // Reset tapped state so they can recount
      document.querySelectorAll(".counter.tapped").forEach(c => c.classList.remove("tapped"));
      tapped = 0;
      $("instruction").textContent = "Not quite — tap the counters and count again.";
    }
  }

  function nextRound() {
    roundIdx++;
    if (roundIdx >= ROUNDS.length) {
      try { parent.postMessage({ type: "game_win", score: ROUNDS.length }, "*"); } catch(e){}
      $("prompt").textContent = "Great work!";
      $("instruction").textContent = \`You solved \${ROUNDS.length} problems.\`;
      $("frames-wrap").style.display = "none";
      $("success").classList.remove("visible");
      return;
    }
    startRound();
  }

  startRound();
</script>
</body>
</html>`
}
