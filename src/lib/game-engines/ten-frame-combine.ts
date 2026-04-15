// Ten-Frame Combine — first reference implementation following the
// Learning Contract workflow (see docs/contracts/K.OA.A.1.md).
//
// Standard: K.OA.A.1 (Represent addition and subtraction).
// Adapted from Singapore Math's ten-frame pedagogy + Montessori concrete
// manipulation. The LEARNER does the math — the system never displays
// a running count while the learner is counting.
//
// Built as plain HTML/CSS/JS, NOT Phaser. Brilliant.org-inspired light
// aesthetic: off-white background, navy counters, generous whitespace.

import type { ThemeConfig, MathParams, GameOption } from "./engine-types"

// Hardcoded rounds from the contract. 5 progressive rounds for K.
interface Round {
  op: "add" | "sub"
  a: number
  b: number
  answer: number
}

const ROUNDS: Round[] = [
  { op: "add", a: 2, b: 1, answer: 3 },
  { op: "add", a: 4, b: 2, answer: 6 },
  { op: "add", a: 3, b: 3, answer: 6 },
  { op: "sub", a: 7, b: 2, answer: 5 },
  { op: "add", a: 5, b: 4, answer: 9 },
]

export function tenFrameCombineEngine(
  config: ThemeConfig,
  _math: MathParams,
  _option: GameOption = "ten-frame-combine",
): string {
  const skeleton = config.skeletonMode === true
  const bg = skeleton ? "#fafafa" : "#fafafa"
  const rounds = JSON.stringify(ROUNDS)
  const backstory = (config.backstory || "").trim()

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${config.title || "Add and take away things"}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: 100%; height: 100%;
    background: ${bg};
    font-family: 'Lexend', system-ui, sans-serif;
    color: #18181b;
    overflow: hidden;
  }
  #app {
    width: 100%; height: 100%;
    display: flex; flex-direction: column;
    padding: 24px 20px;
    max-width: 720px; margin: 0 auto;
    gap: 24px;
  }

  /* Optional backstory (hidden in skeleton mode) */
  #backstory { display: none; font-size: 13px; color: #52525b; padding: 8px 12px; background: rgba(0,0,0,0.02); border-left: 2px solid #a1a1aa; border-radius: 2px; }
  #backstory.visible { display: block; }

  /* Progress dots — minimal chrome */
  #progress { display: flex; gap: 8px; justify-content: center; }
  #progress .dot { width: 8px; height: 8px; border-radius: 50%; background: #e4e4e7; transition: background 0.3s; }
  #progress .dot.active { background: #1e3a8a; }
  #progress .dot.done { background: #a3e635; }

  /* Prompt */
  #prompt {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 48px; font-weight: 700;
    text-align: center; color: #18181b;
    letter-spacing: 0.02em;
  }
  #instruction {
    text-align: center; font-size: 16px; color: #52525b;
    min-height: 24px;
  }

  /* Ten-frames */
  #frames-area {
    display: flex; gap: 20px; justify-content: center; align-items: center;
  }
  .frame {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 4px;
    padding: 8px;
    background: white;
    border: 2px solid #e4e4e7;
    border-radius: 8px;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .frame.active { border-color: #1e3a8a; box-shadow: 0 0 0 4px rgba(30,58,138,0.1); }
  .frame.locked { border-color: #86efac; box-shadow: 0 0 0 4px rgba(134,239,172,0.2); }
  .frame.wobble { animation: wobble 0.4s ease; }
  @keyframes wobble {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-6px); }
    75% { transform: translateX(6px); }
  }
  .cell {
    width: 48px; height: 48px;
    background: #fafafa;
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: background 0.15s;
  }
  .cell:hover { background: #f1f5f9; }
  .cell.has-counter { cursor: pointer; }
  .cell.has-counter:hover { background: #fafafa; }
  .counter {
    width: 36px; height: 36px;
    background: #1e3a8a;
    border-radius: 50%;
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s, opacity 0.2s;
    transform: scale(0);
  }
  .counter.placed { transform: scale(1); }
  .counter.tapped { background: #a1a1aa; transform: scale(0.75); }

  /* Operator / plus sign between frames */
  .operator {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 40px; font-weight: 700;
    color: #1e3a8a;
  }

  /* Buttons */
  .button-row { display: flex; gap: 12px; justify-content: center; }
  button {
    font-family: 'Lexend', sans-serif;
    font-size: 16px; font-weight: 600;
    padding: 12px 28px;
    border: none; border-radius: 10px;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
  }
  button:active { transform: scale(0.96); }
  .btn-primary { background: #1e3a8a; color: white; }
  .btn-primary:hover { background: #1e40af; }
  .btn-primary:disabled { background: #cbd5e1; cursor: not-allowed; }
  .btn-secondary { background: transparent; color: #52525b; border: 1.5px solid #cbd5e1; }
  .btn-secondary:hover { background: #f1f5f9; }

  /* Number pad for final answer */
  #number-pad {
    display: none; gap: 10px; justify-content: center; flex-wrap: wrap;
  }
  #number-pad.visible { display: flex; }
  .num-btn {
    width: 56px; height: 56px; padding: 0;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 24px; font-weight: 700;
    background: white; color: #18181b;
    border: 2px solid #e4e4e7;
    border-radius: 10px;
  }
  .num-btn:hover { background: #f1f5f9; border-color: #cbd5e1; }
  .num-btn.fade { opacity: 0.3; transition: opacity 0.3s; }

  /* Success state */
  #success-msg {
    display: none; text-align: center; font-size: 20px;
    font-family: 'Space Grotesk', sans-serif; font-weight: 700;
    color: #16a34a;
  }
  #success-msg.visible { display: block; }
  #next-btn { display: none; }
  #next-btn.visible { display: inline-block; }

  /* Hint */
  #hint-btn {
    position: fixed; top: 12px; right: 12px;
    background: transparent; color: #a1a1aa;
    font-size: 13px; padding: 6px 12px;
    border: 1px solid #e4e4e7; border-radius: 8px;
  }
  #hint-btn:hover { color: #18181b; border-color: #cbd5e1; }
  #hint-overlay {
    display: none; position: fixed; inset: 0;
    background: rgba(255,255,255,0.92);
    align-items: center; justify-content: center;
    z-index: 100;
  }
  #hint-overlay.visible { display: flex; }
  .hint-card {
    background: white; border: 1px solid #e4e4e7;
    border-radius: 14px; padding: 24px; max-width: 380px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.08);
  }
  .hint-card h3 { font-family: 'Space Grotesk', sans-serif; font-size: 18px; margin-bottom: 10px; }
  .hint-card p { font-size: 14px; color: #52525b; line-height: 1.6; margin-bottom: 14px; }
</style>
</head>
<body>
<button id="hint-btn" onclick="showHint()">Hint</button>

<div id="app">
  <div id="progress"></div>
  ${backstory ? `<div id="backstory" class="visible">${escapeHtml(backstory)}</div>` : `<div id="backstory"></div>`}
  <div id="prompt"></div>
  <div id="instruction"></div>

  <div id="frames-area">
    <div class="frame" id="frame-a"></div>
    <div class="operator" id="operator"></div>
    <div class="frame" id="frame-b"></div>
  </div>

  <div class="button-row">
    <button id="done-btn" class="btn-primary" onclick="onDone()">Done</button>
    <button id="combine-btn" class="btn-primary" onclick="onCombine()" style="display:none">Combine!</button>
  </div>

  <div id="number-pad"></div>

  <div id="success-msg"></div>
  <div class="button-row">
    <button id="next-btn" class="btn-primary" onclick="nextRound()">Next →</button>
  </div>
</div>

<div id="hint-overlay" onclick="closeHint()">
  <div class="hint-card" onclick="event.stopPropagation()">
    <h3>Hint</h3>
    <p>Try counting one at a time. Point to each counter as you say the next number. When you finish counting, that's your total.</p>
    <button class="btn-primary" onclick="closeHint()">Got it</button>
  </div>
</div>

<script>
  const ROUNDS = ${rounds};
  let roundIdx = 0;
  let phase = "fill_a"; // fill_a | fill_b | combine | count_total | done
  let frameACounters = 0;
  let frameBCounters = 0;
  let mergedCounters = 0;  // after combine, total in the merged area
  let tappedCount = 0;
  let hintUsed = false;

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

  function buildFrame(id, count, interactive) {
    const el = $(id);
    el.innerHTML = "";
    for (let i = 0; i < 10; i++) {
      const cell = document.createElement("div");
      cell.className = "cell" + (i < count ? " has-counter" : "");
      const counter = document.createElement("div");
      counter.className = "counter" + (i < count ? " placed" : "");
      cell.appendChild(counter);
      if (interactive) {
        cell.onclick = () => onCellClick(id, i);
      }
      el.appendChild(cell);
    }
  }

  function onCellClick(frameId, idx) {
    const isA = frameId === "frame-a";
    if (phase === "fill_a" && isA) {
      frameACounters = idx < frameACounters ? idx : idx + 1;
      buildFrame("frame-a", frameACounters, true);
    } else if (phase === "fill_b" && !isA) {
      frameBCounters = idx < frameBCounters ? idx : idx + 1;
      buildFrame("frame-b", frameBCounters, true);
    }
  }

  function startRound() {
    const r = ROUNDS[roundIdx];
    if (!r) return;
    phase = r.op === "add" ? "fill_a" : "count_total_sub";
    frameACounters = 0;
    frameBCounters = 0;
    mergedCounters = 0;
    tappedCount = 0;
    $("prompt").textContent = r.op === "add" ? \`\${r.a} + \${r.b}\` : \`\${r.a} − \${r.b}\`;
    $("operator").textContent = r.op === "add" ? "+" : "−";
    $("success-msg").classList.remove("visible");
    $("next-btn").classList.remove("visible");
    $("number-pad").classList.remove("visible");
    $("combine-btn").style.display = "none";
    $("done-btn").style.display = "inline-block";

    if (r.op === "add") {
      $("instruction").textContent = \`Fill the left frame to show \${r.a}\`;
      buildFrame("frame-a", 0, true);
      buildFrame("frame-b", 0, false);
      $("frame-a").classList.add("active");
      $("frame-b").classList.remove("active", "locked");
    } else {
      // Subtraction: start with 'a' counters in combined frames
      $("instruction").textContent = \`Tap \${r.b} counters to take them away\`;
      buildFrame("frame-a", Math.min(r.a, 5), false);
      buildFrame("frame-b", Math.max(0, r.a - 5), false);
      $("frame-a").classList.remove("active", "locked");
      $("frame-b").classList.remove("active", "locked");
      $("done-btn").style.display = "none";
      // Wire up cells for removal
      for (const frameId of ["frame-a", "frame-b"]) {
        const cells = $(frameId).querySelectorAll(".cell");
        cells.forEach((cell, idx) => {
          cell.onclick = () => onSubTap(frameId, idx);
        });
      }
      phase = "remove";
      mergedCounters = r.a;
    }
    renderProgress();
  }

  function onSubTap(frameId, idx) {
    if (phase !== "remove") return;
    const cells = $(frameId).querySelectorAll(".cell");
    const cell = cells[idx];
    if (!cell.classList.contains("has-counter") || cell.classList.contains("removed")) return;
    const r = ROUNDS[roundIdx];
    const alreadyRemoved = countRemoved();
    if (alreadyRemoved >= r.b) {
      // already removed required count; prompt for answer
      return;
    }
    cell.classList.add("removed");
    cell.querySelector(".counter").classList.add("tapped");
    cell.querySelector(".counter").style.opacity = "0.2";
    const removed = countRemoved();
    if (removed === r.b) {
      $("instruction").textContent = "Now count what's left. Tap each one.";
      phase = "count_after_sub";
      for (const fId of ["frame-a", "frame-b"]) {
        const cells2 = $(fId).querySelectorAll(".cell");
        cells2.forEach((c, i) => {
          c.onclick = () => onCountTap(fId, i);
        });
      }
    }
  }

  function countRemoved() {
    let n = 0;
    for (const fId of ["frame-a", "frame-b"]) {
      $(fId).querySelectorAll(".cell.removed").forEach(() => n++);
    }
    return n;
  }

  function onCountTap(frameId, idx) {
    if (phase !== "count_total" && phase !== "count_after_sub") return;
    const cells = $(frameId).querySelectorAll(".cell");
    const cell = cells[idx];
    if (!cell.classList.contains("has-counter")) return;
    if (cell.classList.contains("removed")) return;
    const counter = cell.querySelector(".counter");
    if (counter.classList.contains("tapped")) return;
    counter.classList.add("tapped");
    tappedCount++;

    // Check if all non-removed counters are tapped
    const totalRemaining = mergedCounters - countRemoved();
    if (tappedCount >= totalRemaining) {
      showNumberPad();
    }
  }

  function onDone() {
    const r = ROUNDS[roundIdx];
    if (phase === "fill_a") {
      if (frameACounters === r.a) {
        $("frame-a").classList.remove("active");
        $("frame-a").classList.add("locked");
        $("frame-b").classList.add("active");
        phase = "fill_b";
        $("instruction").textContent = \`Now fill the right frame to show \${r.b}\`;
      } else {
        $("frame-a").classList.add("wobble");
        setTimeout(() => $("frame-a").classList.remove("wobble"), 400);
      }
    } else if (phase === "fill_b") {
      if (frameBCounters === r.b) {
        $("frame-b").classList.remove("active");
        $("frame-b").classList.add("locked");
        phase = "combine";
        $("done-btn").style.display = "none";
        $("combine-btn").style.display = "inline-block";
        $("instruction").textContent = "Now combine them together";
      } else {
        $("frame-b").classList.add("wobble");
        setTimeout(() => $("frame-b").classList.remove("wobble"), 400);
      }
    }
  }

  function onCombine() {
    const r = ROUNDS[roundIdx];
    mergedCounters = frameACounters + frameBCounters;
    // Visually: all counters in merged frames. Rebuild both frames to show the full combined count.
    buildFrame("frame-a", Math.min(mergedCounters, 5), false);
    buildFrame("frame-b", Math.max(0, mergedCounters - 5), false);
    $("frame-a").classList.remove("locked");
    $("frame-b").classList.remove("locked");
    $("combine-btn").style.display = "none";
    $("instruction").textContent = "How many now? Tap each one to count.";
    phase = "count_total";
    tappedCount = 0;
    // Wire click handlers on each counter cell
    for (const fId of ["frame-a", "frame-b"]) {
      const cells = $(fId).querySelectorAll(".cell");
      cells.forEach((cell, idx) => {
        cell.onclick = () => onCountTap(fId, idx);
      });
    }
  }

  function showNumberPad() {
    const r = ROUNDS[roundIdx];
    const correct = r.answer;
    // Build 5 options around the correct answer
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
      const b = document.createElement("button");
      b.className = "num-btn";
      b.textContent = n;
      b.onclick = () => onAnswer(n, b);
      pad.appendChild(b);
    });
    pad.classList.add("visible");
    $("instruction").textContent = "Pick the total";
  }

  function onAnswer(n, btn) {
    const r = ROUNDS[roundIdx];
    if (n === r.answer) {
      $("number-pad").classList.remove("visible");
      $("instruction").textContent = "";
      const opText = r.op === "add" ? "+" : "−";
      $("success-msg").textContent = \`\${r.a} \${opText} \${r.b} = \${r.answer}\`;
      $("success-msg").classList.add("visible");
      $("next-btn").classList.add("visible");
      phase = "done";
    } else {
      btn.classList.add("fade");
      btn.disabled = true;
      // Reset tapped state so they can recount
      document.querySelectorAll(".counter.tapped").forEach(c => c.classList.remove("tapped"));
      tappedCount = 0;
      $("instruction").textContent = "Not quite — try counting again";
    }
  }

  function nextRound() {
    roundIdx++;
    if (roundIdx >= ROUNDS.length) {
      // All rounds done — send win message
      try { parent.postMessage({ type: "game_win", hintUsed, score: ROUNDS.length }, "*"); } catch(e){}
      $("prompt").textContent = "Great work!";
      $("instruction").textContent = "You added and subtracted through " + ROUNDS.length + " problems.";
      $("frames-area").style.display = "none";
      document.querySelector(".button-row").style.display = "none";
      return;
    }
    startRound();
  }

  function showHint() {
    hintUsed = true;
    $("hint-overlay").classList.add("visible");
  }
  function closeHint() {
    $("hint-overlay").classList.remove("visible");
  }

  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m])); }

  startRound();
</script>
</body>
</html>`
}

function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m] as string),
  )
}
