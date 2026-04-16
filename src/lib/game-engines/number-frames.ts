// Number Frames — K.OA.A.1, K.OA.A.3 (and related: K.OA.A.2, K.OA.A.5, K.CC)
// Visual language adapted from Math Learning Center's free "Number Frames"
// app. Plain HTML/CSS/JS, light aesthetic, no Phaser.
//
// Modes (selected via `option`):
//  - "number-frames" (default) — ADD + SUBTRACT mode
//      Learner fills frames, counts total (add) or removes and counts remaining (sub).
//  - "number-frames-decompose" — DECOMPOSE mode: 5 = ? + ?
//      Learner splits a total into two groups across frames.
//
// Principles:
//  - The LEARNER does the math. No running count displayed while counting.
//  - System reveals correctness only AFTER the learner commits.
//  - Both ten-frames clickable from the start. One "Done" button for both.
//  - EQUATION IS HIDDEN during play. Shown only AFTER correct answer as recording.
//    (Per Progressions: symbolic notation follows concrete experience at K level.)
//  - Prompt uses DOT CLUSTERS (visual objects), not digits.
//
// Fixes applied (April 16, 2026 — from agent cross-check):
//  #1 Subtraction mode added (K.OA.A.1 covers addition AND subtraction)
//  #2 Rounds aligned with Learning Contract [2+1, 4+2, 3+3, 7-2, 5+4]
//  #3 Wrong number-pad answers shake (don't fade — prevents brute force)
//  #4 Equation hidden during play; shown as recording after correct answer

import type { ThemeConfig, MathParams, GameOption } from "./engine-types"

interface AddRound { kind: "add"; a: number; b: number; answer: number }
interface SubRound { kind: "sub"; total: number; remove: number; answer: number }
interface DecomposeRound { kind: "decompose"; total: number }
type Round = AddRound | SubRound | DecomposeRound

// Rounds aligned with Learning Contract (docs/contracts/K.OA.A.1.md)
const ROUNDS_ADD_SUB: Round[] = [
  { kind: "add", a: 2, b: 1, answer: 3 },
  { kind: "add", a: 4, b: 2, answer: 6 },
  { kind: "add", a: 3, b: 3, answer: 6 },
  { kind: "sub", total: 7, remove: 2, answer: 5 },
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
  const rounds = JSON.stringify(mode === "decompose" ? ROUNDS_DECOMPOSE : ROUNDS_ADD_SUB)

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
    gap: 20px;
  }

  /* Progress dots */
  #progress { display: flex; gap: 10px; }
  #progress .dot { width: 10px; height: 10px; border-radius: 50%; background: #e5e7eb; }
  #progress .dot.active { background: #2563eb; }
  #progress .dot.done { background: #10b981; }

  /* Dot cluster prompt — shows objects, not digits */
  #dot-prompt {
    display: flex; align-items: center; gap: 16px; justify-content: center;
    min-height: 60px;
  }
  .dot-cluster {
    display: flex; flex-wrap: wrap; gap: 6px; justify-content: center;
    padding: 8px 14px;
    background: #f8fafc; border: 2px solid #e2e8f0;
    border-radius: 12px; min-width: 50px; min-height: 44px;
    align-items: center;
  }
  .dot-cluster .dot-obj {
    width: 18px; height: 18px; background: #ef4444; border-radius: 50%;
  }
  .prompt-symbol {
    font-size: 32px; font-weight: 700; color: #1f2937;
  }
  .prompt-question {
    font-size: 32px; font-weight: 700; color: #9ca3af;
  }

  /* Instruction text */
  #instruction {
    font-size: 17px; color: #6b7280;
    min-height: 24px; text-align: center;
  }

  /* Equation reveal — hidden until correct answer */
  #equation-reveal {
    display: none; text-align: center;
    font-size: 36px; font-weight: 700; color: #10b981;
  }
  #equation-reveal.visible { display: block; }

  /* Frames area */
  #frames-wrap {
    display: flex; align-items: center; gap: 24px;
  }
  .frame {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 2px; padding: 4px;
    background: #d1d5db; border-radius: 4px;
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
    background: #ffffff; border-radius: 2px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; user-select: none;
    -webkit-tap-highlight-color: transparent;
  }
  .counter {
    width: 40px; height: 40px;
    background: #ef4444; border-radius: 50%;
    transform: scale(0);
    transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.18s, opacity 0.18s;
  }
  .counter.placed { transform: scale(1); }
  .counter.tapped { background: #9ca3af; transform: scale(0.75); }
  .counter.removed { opacity: 0.15; transform: scale(0.6); }

  .operator { font-size: 48px; font-weight: 700; color: #1f2937; }

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

  #number-pad { display: none; gap: 12px; flex-wrap: wrap; justify-content: center; }
  #number-pad.visible { display: flex; }
  .num-btn {
    width: 64px; height: 64px; padding: 0;
    font-size: 28px; font-weight: 700;
    background: white; color: #1f2937;
    border: 2px solid #d1d5db; border-radius: 12px;
  }
  .num-btn:hover { background: #f3f4f6; border-color: #9ca3af; }
  /* Fix #3: wrong answers SHAKE, don't fade. Prevents brute force. */
  .num-btn.wrong { animation: wobble 0.4s ease; border-color: #fca5a5; }

  #success { display: none; text-align: center; }
  #success.visible { display: block; }
  #success p { font-size: 20px; font-weight: 600; color: #10b981; margin-bottom: 16px; }
</style>
</head>
<body>
<div id="app">
  <div id="progress"></div>

  <!-- Dot cluster prompt: shows OBJECTS not digits. Fix #4. -->
  <div id="dot-prompt"></div>

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

  <!-- Equation shown AFTER correct answer only. Fix #4. -->
  <div id="equation-reveal"></div>

  <div id="success">
    <button class="btn-primary" onclick="nextRound()">Next →</button>
  </div>
</div>

<script>
  const ROUNDS = ${rounds};
  let roundIdx = 0;
  let phase = "fill"; // fill | count | subtract_remove | subtract_count | answered
  let frameA = 0;
  let frameB = 0;
  let merged = 0;
  let tapped = 0;
  let removedCount = 0;

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

  // Render a cluster of dots (visual objects, no digits). Fix #4.
  function renderDotCluster(count) {
    let html = '<div class="dot-cluster">';
    for (let i = 0; i < count; i++) html += '<div class="dot-obj"></div>';
    html += '</div>';
    return html;
  }

  function drawFrame(id, count, interactive) {
    const el = $(id);
    el.innerHTML = "";
    for (let i = 0; i < 10; i++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      const counter = document.createElement("div");
      counter.className = "counter";
      if (i < count) counter.classList.add("placed");
      cell.appendChild(counter);
      if (interactive) {
        cell.addEventListener("click", function() { onCellClick(id, i); });
      }
      el.appendChild(cell);
    }
  }

  function onCellClick(frameId, idx) {
    if (phase === "fill") {
      const isA = frameId === "frame-a";
      if (isA) {
        frameA = idx < frameA ? idx : idx + 1;
        drawFrame("frame-a", frameA, true);
      } else {
        frameB = idx < frameB ? idx : idx + 1;
        drawFrame("frame-b", frameB, true);
      }
    } else if (phase === "subtract_remove") {
      // Tap counters to remove them
      const el = $(frameId);
      const cell = el.children[idx];
      if (!cell) return;
      const counter = cell.querySelector(".counter");
      if (!counter || !counter.classList.contains("placed") || counter.classList.contains("removed")) return;
      const r = ROUNDS[roundIdx];
      if (removedCount >= r.remove) return;
      counter.classList.add("removed");
      removedCount++;
      if (removedCount >= r.remove) {
        // Done removing — now count remaining
        phase = "subtract_count";
        tapped = 0;
        $("instruction").textContent = "Now tap each remaining counter to count. Then pick the total.";
        wireCountTaps();
      }
    }
  }

  function onCountCellClick(frameId, idx) {
    if (phase !== "count" && phase !== "subtract_count") return;
    const el = $(frameId);
    const cell = el.children[idx];
    if (!cell) return;
    const counter = cell.querySelector(".counter");
    if (!counter || !counter.classList.contains("placed") || counter.classList.contains("tapped") || counter.classList.contains("removed")) return;
    counter.classList.add("tapped");
    tapped++;
    const target = (phase === "subtract_count") ? ROUNDS[roundIdx].answer : merged;
    if (tapped >= target) {
      showNumberPad();
    }
  }

  function wireCountTaps() {
    for (const fId of ["frame-a", "frame-b"]) {
      const el = $(fId);
      const fresh = el.cloneNode(true);
      el.parentNode.replaceChild(fresh, el);
      for (let i = 0; i < fresh.children.length; i++) {
        const idx = i;
        fresh.children[i].addEventListener("click", function() { onCountCellClick(fId, idx); });
      }
    }
  }

  function startRound() {
    const r = ROUNDS[roundIdx];
    phase = "fill";
    frameA = 0; frameB = 0; merged = 0; tapped = 0; removedCount = 0;
    $("equation-reveal").classList.remove("visible");
    $("equation-reveal").textContent = "";
    $("success").classList.remove("visible");
    $("number-pad").classList.remove("visible");
    $("done-btn").style.display = "inline-block";
    $("done-btn").disabled = false;

    if (r.kind === "add") {
      // Show dot clusters as prompt (no digits). Fix #4.
      $("dot-prompt").innerHTML =
        renderDotCluster(r.a) +
        '<span class="prompt-symbol">+</span>' +
        renderDotCluster(r.b) +
        '<span class="prompt-symbol">=</span>' +
        '<span class="prompt-question">?</span>';
      $("operator").textContent = "+";
      $("instruction").textContent = "Count the dots above. Fill each frame to match, then press Done.";
      $("frame-a").className = "frame active";
      $("frame-b").className = "frame active";
      drawFrame("frame-a", 0, true);
      drawFrame("frame-b", 0, true);
    } else if (r.kind === "sub") {
      // Subtraction: show total dots, then "take away" N dots
      $("dot-prompt").innerHTML =
        renderDotCluster(r.total) +
        '<span class="prompt-symbol">−</span>' +
        renderDotCluster(r.remove) +
        '<span class="prompt-symbol">=</span>' +
        '<span class="prompt-question">?</span>';
      $("operator").textContent = "";
      $("instruction").textContent = "Tap " + r.remove + " counters to take them away.";
      // Pre-fill frame A with the total
      phase = "subtract_remove";
      $("done-btn").style.display = "none";
      $("frame-a").className = "frame";
      $("frame-b").className = "frame";
      // Put ALL counters in frame-a (ten-frame holds 10, our max total is 9).
      // Frame-b stays empty for subtraction — only one group to work with.
      drawFrame("frame-a", Math.min(r.total, 10), true);
      drawFrame("frame-b", 0, false);
      // Wire click handlers for removal
      for (const fId of ["frame-a", "frame-b"]) {
        const el = $(fId);
        const fresh = el.cloneNode(true);
        el.parentNode.replaceChild(fresh, el);
        for (let i = 0; i < fresh.children.length; i++) {
          const idx = i;
          fresh.children[i].addEventListener("click", function() { onCellClick(fId, idx); });
        }
      }
    } else {
      // Decompose: show total as dots
      $("dot-prompt").innerHTML =
        renderDotCluster(r.total) +
        '<span class="prompt-symbol">=</span>' +
        '<span class="prompt-question">? + ?</span>';
      $("operator").textContent = "+";
      $("instruction").textContent = "Split these into two groups. Put some in each frame.";
      $("frame-a").className = "frame active";
      $("frame-b").className = "frame active";
      drawFrame("frame-a", 0, true);
      drawFrame("frame-b", 0, true);
    }
    renderProgress();
  }

  function wobble(id) {
    const el = $(id);
    el.classList.add("wobble");
    setTimeout(function() { el.classList.remove("wobble"); }, 420);
  }

  function onDone() {
    if (phase !== "fill") return;
    const r = ROUNDS[roundIdx];

    if (r.kind === "decompose") {
      const sum = frameA + frameB;
      if (sum !== r.total || frameA < 1 || frameB < 1) {
        wobble("frame-a"); wobble("frame-b");
        if (frameA < 1 || frameB < 1) {
          $("instruction").textContent = "Put at least 1 counter in each frame.";
        } else if (sum < r.total) {
          $("instruction").textContent = "Not enough yet — add more counters.";
        } else {
          $("instruction").textContent = "Too many — take some away.";
        }
        return;
      }
      phase = "answered";
      $("done-btn").style.display = "none";
      $("frame-a").className = "frame";
      $("frame-b").className = "frame";
      $("instruction").textContent = "";
      // Show equation as recording (Fix #4)
      $("equation-reveal").textContent = frameA + " + " + frameB + " = " + r.total;
      $("equation-reveal").classList.add("visible");
      $("success").classList.add("visible");
      return;
    }

    // ADD mode
    // Accept BOTH orderings: 2+4 and 4+2 are equally correct (commutativity).
    const exactMatch = frameA === r.a && frameB === r.b;
    const swapMatch = frameA === r.b && frameB === r.a;
    if (!exactMatch && !swapMatch) {
      // Check if total is right but split is wrong (e.g., 3+3 for 2+4)
      if (frameA + frameB === r.a + r.b) {
        wobble("frame-a"); wobble("frame-b");
        $("instruction").textContent = "Right total, but the two groups don't match the dots above. Try again.";
      } else {
        wobble("frame-a"); wobble("frame-b");
        $("instruction").textContent = "Not quite — check both frames and try again.";
      }
      return;
    }
    // Both correct — count phase
    phase = "count";
    merged = frameA + frameB;
    $("done-btn").style.display = "none";
    $("frame-a").className = "frame";
    $("frame-b").className = "frame";
    wireCountTaps();
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
    const arr = Array.from(opts).sort(function(x, y) { return x - y; });
    const pad = $("number-pad");
    pad.innerHTML = "";
    arr.forEach(function(n) {
      const btn = document.createElement("button");
      btn.className = "num-btn";
      btn.textContent = String(n);
      btn.onclick = function() { onAnswer(n, btn); };
      pad.appendChild(btn);
    });
    pad.classList.add("visible");
    $("instruction").textContent = "Pick the total.";
  }

  function onAnswer(n, btn) {
    const r = ROUNDS[roundIdx];
    if (n === r.answer) {
      $("number-pad").classList.remove("visible");
      $("instruction").textContent = "";
      // Show equation as recording AFTER correct answer (Fix #4)
      if (r.kind === "add") {
        $("equation-reveal").textContent = r.a + " + " + r.b + " = " + r.answer;
      } else if (r.kind === "sub") {
        $("equation-reveal").textContent = r.total + " − " + r.remove + " = " + r.answer;
      }
      $("equation-reveal").classList.add("visible");
      $("success").classList.add("visible");
      phase = "answered";
    } else {
      // Fix #3: SHAKE wrong answer (don't fade). Prevents brute force.
      btn.classList.add("wrong");
      setTimeout(function() { btn.classList.remove("wrong"); }, 420);
      // Reset tapped counters so learner must recount
      document.querySelectorAll(".counter.tapped").forEach(function(c) { c.classList.remove("tapped"); });
      tapped = 0;
      $("number-pad").classList.remove("visible");
      $("instruction").textContent = "Not quite — tap the counters and count again.";
    }
  }

  function nextRound() {
    roundIdx++;
    if (roundIdx >= ROUNDS.length) {
      try { parent.postMessage({ type: "game_win", score: ROUNDS.length }, "*"); } catch(e){}
      $("dot-prompt").innerHTML = "";
      $("instruction").textContent = "You solved " + ROUNDS.length + " problems!";
      $("frames-wrap").style.display = "none";
      $("success").classList.remove("visible");
      $("equation-reveal").classList.remove("visible");
      return;
    }
    startRound();
  }

  startRound();
<\/script>
</body>
</html>`
}
