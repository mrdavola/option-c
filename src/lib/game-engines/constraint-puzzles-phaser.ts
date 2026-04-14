// Constraint Puzzles — Phaser engine with 3 game options.
// Math: Logic, elimination, deduction, number properties.
// Options: elimination-grid, twenty-questions, logic-chain

import type { ThemeConfig, MathParams, GameOption } from "./engine-types"
import { phaserGame } from "./base-phaser-template"
import { getOptionDef } from "./game-option-registry"

export function constraintPuzzlesPhaserEngine(
  config: ThemeConfig,
  math: MathParams,
  option: GameOption = "elimination-grid"
): string {
  const validOptions = ["elimination-grid", "twenty-questions", "logic-chain"]
  const activeOption = validOptions.includes(option) ? option : "elimination-grid"
  const optDef = getOptionDef(activeOption)
  const sceneMap: Record<string, string> = {
    "elimination-grid": "EliminationGridScene",
    "twenty-questions": "TwentyQuestionsScene",
    "logic-chain": "LogicChainScene",
  }
  return phaserGame({
    config, math, option: activeOption,
    sceneName: sceneMap[activeOption],
    introText: optDef?.introText || "Use clues to find the answer!",
    helpText: optDef?.helpText || "Eliminate wrong answers using logic.",
    gameSceneCode: GAME_SCENES,
  })
}

const GAME_SCENES = `
function generateEliminationRound(round) {
  if (AI_ROUNDS && AI_ROUNDS[round]) { const r=AI_ROUNDS[round]; return { prompt: r.prompt, target: r.target, hint: r.hint }; }
  const count = 6;
  const nums = [];
  const range = round < 2 ? 20 : round < 4 ? 50 : 100;
  while (nums.length < count) { const n = Math.floor(Math.random() * range) + 1; if (!nums.includes(n)) nums.push(n); }
  const answer = nums[Math.floor(Math.random() * nums.length)];
  const clues = [];
  if (answer % 2 === 0) clues.push({text: 'It is even', test: function(n){return n%2===0;}});
  else clues.push({text: 'It is odd', test: function(n){return n%2!==0;}});
  if (answer > range / 2) clues.push({text: 'It is greater than ' + Math.floor(range/2), test: function(n){return n>Math.floor(range/2);}});
  else clues.push({text: 'It is ' + Math.floor(range/2) + ' or less', test: function(n){return n<=Math.floor(range/2);}});
  if (answer > 10) clues.push({text: 'It is greater than 10', test: function(n){return n>10;}});
  else clues.push({text: 'It is 10 or less', test: function(n){return n<=10;}});
  const numClues = round < 2 ? 2 : 3;
  return { nums, answer, clues: clues.slice(0, numClues) };
}

function generateTwentyQRound(round) {
  const max = round < 2 ? 20 : round < 4 ? 35 : 50;
  const hidden = Math.floor(Math.random() * max) + 1;
  const mid = Math.floor(max / 2);
  const questions = [
    {text: 'Is it greater than ' + mid + '?', answer: hidden > mid},
    {text: 'Is it even?', answer: hidden % 2 === 0},
    {text: 'Is it greater than ' + Math.floor(max/4) + '?', answer: hidden > Math.floor(max/4)},
    {text: 'Is it less than ' + Math.floor(max*3/4) + '?', answer: hidden < Math.floor(max*3/4)},
    {text: 'Is it a multiple of 5?', answer: hidden % 5 === 0},
    {text: 'Is it a multiple of 3?', answer: hidden % 3 === 0},
  ];
  return { hidden, max, questions };
}

function generateLogicChainRound(round) {
  const range = round < 2 ? 20 : round < 4 ? 40 : 60;
  const answer = Math.floor(Math.random() * range) + 1;
  const chain = [];
  if (answer % 2 === 0) chain.push({clue: 'The number is even.', narrowed: 'Even numbers only.'});
  else chain.push({clue: 'The number is odd.', narrowed: 'Odd numbers only.'});
  const decade = Math.floor(answer / 10) * 10;
  chain.push({clue: 'It is between ' + decade + ' and ' + (decade + 10) + '.', narrowed: 'Range: ' + decade + '-' + (decade+10)});
  chain.push({clue: 'The ones digit is ' + (answer % 10) + '.', narrowed: 'Final digit revealed!'});
  return { answer, chain, range };
}

// ═══════════════════════════════════════════════════════════════════════════════
class EliminationGridScene extends Phaser.Scene {
  constructor() { super('EliminationGridScene'); }
  create() { this.W=this.scale.width;this.H=this.scale.height;this.round=0;this.lives=MAX_LIVES;this._bg();this._ui();this.startRound(); }
  _bg() { const bg=this.add.image(this.W/2,this.H/2,'bg');bg.setScale(Math.max(this.W/bg.width,this.H/bg.height));this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.65); }
  _ui() { this.scoreLbl=this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);this.hg=this.add.group();this._rh();this.dg=this.add.group();this._rd(); }
  _rh() { this.hg.clear(true,true);for(let i=0;i<this.lives;i++)this.hg.add(this.add.text(14+i*22,14,'\\u2665',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dg.clear(true,true);for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  startRound() {
    if(this.rg)this.rg.clear(true,true);this.rg=this.add.group();
    const data=getRound(this.round);this.answer=data.target;this.clueIdx=0;
    // Build elimination data: items = number pool, target = answer
    data.nums = data.items.slice();
    // Build clues from the answer
    const answer = data.target;
    const clues = [];
    if (answer % 2 === 0) clues.push({text: 'It is even', test: function(n){return n%2===0;}});
    else clues.push({text: 'It is odd', test: function(n){return n%2!==0;}});
    if (answer > 10) clues.push({text: 'It is greater than 10', test: function(n){return n>10;}});
    else clues.push({text: 'It is 10 or less', test: function(n){return n<=10;}});
    this.clues=clues;this._rd();
    const W=this.W,H=this.H;
    this.rg.add(this.add.text(W/2,H*0.06,'Find the number! Use clues to eliminate.',{fontSize:'13px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui"}).setOrigin(0.5).setDepth(6));
    // Clue display
    this.clueLbl=this.add.text(W/2,H*0.15,'Clue: '+this.clues[0].text,{fontSize:'14px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(6);
    this.rg.add(this.clueLbl);
    // Number grid (2 rows of 3)
    this.numBtns = [];
    data.nums.forEach((n, i) => {
      const col = i % 3; const row = Math.floor(i / 3);
      const x = W * 0.25 + col * (W * 0.25);
      const y = H * 0.35 + row * 70;
      const bg = this.add.rectangle(x, y, 70, 50, hexToNum(COL_SECONDARY), 0.3).setInteractive({useHandCursor:true}).setDepth(7);
      const lbl = this.add.text(x, y, String(n), {fontSize:'20px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(8);
      this.rg.add(bg); this.rg.add(lbl);
      this.numBtns.push({bg, lbl, val: n, eliminated: false});
      bg.on('pointerdown', () => this._pickNumber(i));
    });
    // Next clue button
    if (this.clues.length > 1) {
      const nxt = this.add.rectangle(W/2, H*0.78, 120, 36, hexToNum(COL_PRIMARY), 0.5).setInteractive({useHandCursor:true}).setDepth(9);
      this.rg.add(nxt);
      this.rg.add(this.add.text(W/2, H*0.78, 'Next clue', {fontSize:'13px',color:'#fff',fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(10));
      nxt.on('pointerdown', () => {
        if (this.clueIdx < this.clues.length - 1) {
          this.clueIdx++;
          this.clueLbl.setText('Clue: ' + this.clues[this.clueIdx].text);
        }
      });
    }
  }

  _pickNumber(idx) {
    const btn = this.numBtns[idx];
    if (btn.eliminated) return;
    if (btn.val === this.answer) {
      gameScore += 10 * (this.round + 1); this.scoreLbl.setText('Score: ' + gameScore); this.cameras.main.flash(200, 34, 197, 94); heroCheer(this, this.hero);
      this.round++; if (this.round >= TOTAL_ROUNDS) this.time.delayedCall(600, () => this.scene.start('VictoryScene', {score: gameScore}));
      else this.time.delayedCall(800, () => this.startRound());
    } else {
      this.lives--; this._rh(); this.cameras.main.shake(200, 0.01); heroShake(this, this.hero);
      btn.bg.setFillStyle(hexToNum(COL_DANGER), 0.3); btn.lbl.setColor(COL_DANGER); btn.eliminated = true;
      if (this.lives <= 0) this.time.delayedCall(500, () => this.scene.start('LoseScene', {score: gameScore}));
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
class TwentyQuestionsScene extends Phaser.Scene {
  constructor() { super('TwentyQuestionsScene'); }
  create() { this.W=this.scale.width;this.H=this.scale.height;this.round=0;this.lives=MAX_LIVES;this._bg();this._ui();this.startRound(); }
  _bg() { const bg=this.add.image(this.W/2,this.H/2,'bg');bg.setScale(Math.max(this.W/bg.width,this.H/bg.height));this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.65); }
  _ui() { this.scoreLbl=this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);this.hg=this.add.group();this._rh();this.dg=this.add.group();this._rd(); }
  _rh() { this.hg.clear(true,true);for(let i=0;i<this.lives;i++)this.hg.add(this.add.text(14+i*22,14,'\\u2665',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dg.clear(true,true);for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  startRound() {
    if(this.rg)this.rg.clear(true,true);this.rg=this.add.group();
    const data=getRound(this.round);this.hidden=data.target;
    // Derive questions from target
    const max = Math.max(...data.items, data.target) + 5;
    data.max = max;
    const hidden = data.target;
    const mid = Math.floor(max / 2);
    data.questions = [
      {text: 'Is it greater than ' + mid + '?', answer: hidden > mid},
      {text: 'Is it even?', answer: hidden % 2 === 0},
      {text: 'Is it greater than ' + Math.floor(max/4) + '?', answer: hidden > Math.floor(max/4)},
      {text: 'Is it less than ' + Math.floor(max*3/4) + '?', answer: hidden < Math.floor(max*3/4)},
      {text: 'Is it a multiple of 5?', answer: hidden % 5 === 0},
      {text: 'Is it a multiple of 3?', answer: hidden % 3 === 0},
    ];this.questionsAsked=0;this._rd();
    const W=this.W,H=this.H;
    this.rg.add(this.add.text(W/2,H*0.06,'Hidden number: 1 to '+data.max,{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(6));
    this.rg.add(this.add.text(W/2,H*0.13,'Ask questions, then guess!',{fontSize:'11px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.5}).setOrigin(0.5).setDepth(6));
    this.qCountLbl=this.add.text(W/2,H*0.18,'Questions asked: 0',{fontSize:'12px',color:COL_TEXT,fontFamily:"'Lexend', system-ui"}).setOrigin(0.5).setDepth(6);
    this.rg.add(this.qCountLbl);
    this.answerLbl=this.add.text(W/2,H*0.24,'',{fontSize:'13px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(6);
    this.rg.add(this.answerLbl);
    // Question buttons
    data.questions.forEach((q, i) => {
      const y = H * 0.34 + i * 36;
      const btn = this.add.rectangle(W/2, y, W * 0.7, 28, hexToNum(COL_SECONDARY), 0.25).setInteractive({useHandCursor:true}).setDepth(7);
      this.rg.add(btn);
      this.rg.add(this.add.text(W/2, y, q.text, {fontSize:'12px',color:COL_TEXT,fontFamily:"'Lexend', system-ui"}).setOrigin(0.5).setDepth(8));
      btn.on('pointerdown', () => {
        this.questionsAsked++;
        this.qCountLbl.setText('Questions asked: ' + this.questionsAsked);
        this.answerLbl.setText(q.text + ' -> ' + (q.answer ? 'YES' : 'NO'));
        btn.setFillStyle(hexToNum(q.answer ? COL_ACCENT : COL_DANGER), 0.3);
      });
    });
    // Guess input area — number pad
    this.guess = '';
    this.guessLbl = this.add.text(W/2, H*0.72, 'Guess: _', {fontSize:'20px',color:COL_PRIMARY,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(8);
    this.rg.add(this.guessLbl);
    // Number pad (0-9)
    for (let d = 0; d <= 9; d++) {
      const px = W * 0.18 + (d % 5) * (W * 0.16);
      const py = H * 0.80 + Math.floor(d / 5) * 34;
      const db = this.add.rectangle(px, py, 36, 28, hexToNum(COL_SECONDARY), 0.3).setInteractive({useHandCursor:true}).setDepth(9);
      this.rg.add(db);
      this.rg.add(this.add.text(px, py, String(d), {fontSize:'14px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}).setOrigin(0.5).setDepth(10));
      db.on('pointerdown', () => { if(this.guess.length<3){this.guess+=String(d);this.guessLbl.setText('Guess: '+this.guess);} });
    }
    // Submit guess
    const sub = this.add.rectangle(W*0.82, H*0.80, 60, 28, hexToNum(COL_PRIMARY), 1).setInteractive({useHandCursor:true}).setDepth(9);
    this.rg.add(sub);
    this.rg.add(this.add.text(W*0.82, H*0.80, 'Go', {fontSize:'13px',color:'#fff',fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(10));
    sub.on('pointerdown', () => this._submitGuess());
    // Clear
    const clr = this.add.rectangle(W*0.82, H*0.814+34, 60, 28, hexToNum(COL_DANGER), 0.4).setInteractive({useHandCursor:true}).setDepth(9);
    this.rg.add(clr);
    this.rg.add(this.add.text(W*0.82, H*0.814+34, 'C', {fontSize:'13px',color:COL_DANGER,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(0.5).setDepth(10));
    clr.on('pointerdown', () => { this.guess=''; this.guessLbl.setText('Guess: _'); });
  }

  _submitGuess() {
    const g = parseInt(this.guess);
    if (isNaN(g)) return;
    if (g === this.hidden) {
      const bonus = Math.max(1, 6 - this.questionsAsked);
      gameScore += bonus * (this.round + 1); this.scoreLbl.setText('Score: ' + gameScore); this.cameras.main.flash(200, 34, 197, 94); heroCheer(this, this.hero);
      this.round++; if (this.round >= TOTAL_ROUNDS) this.time.delayedCall(600, () => this.scene.start('VictoryScene', {score: gameScore}));
      else this.time.delayedCall(800, () => this.startRound());
    } else {
      this.lives--; this._rh(); this.cameras.main.shake(200, 0.01); heroShake(this, this.hero);
      this.guess = ''; this.guessLbl.setText('Guess: _');
      if (this.lives <= 0) this.time.delayedCall(500, () => this.scene.start('LoseScene', {score: gameScore}));
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LogicChainScene — INTRINSIC REDESIGN
//
// Teaches: narrowing a number range by applying clues (each clue eliminates
// numbers that don't satisfy it). No silent judgment; the grid IS the game.
//
// Setup: A grid of numbers is shown. Clues appear one at a time. Each clue
// visually ELIMINATES (grays + fades) numbers that fail that clue. The player
// reveals the next clue when ready. When only one number remains, it glows;
// player clicks it to confirm. The elimination process IS the math.
//
// Player never needs to know the answer — they watch numbers disappear until
// exactly one is left. Correctness emerges from the visible last-standing.
// ═══════════════════════════════════════════════════════════════════════════════
class LogicChainScene extends Phaser.Scene {
  constructor() { super('LogicChainScene'); }
  create() {
    this.W=this.scale.width;this.H=this.scale.height;this.round=0;this.lives=MAX_LIVES;
    this._bg();this._ui();
    this.hero = addCharacter(this, this.W * 0.88, this.H * 0.55, 0.8);
    this.startRound();
  }
  _bg() { const bg=this.add.image(this.W/2,this.H/2,'bg');bg.setScale(Math.max(this.W/bg.width,this.H/bg.height));this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.7); }
  _ui() {
    this.scoreLbl=this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);
    this.hg=this.add.group();this._rh();this.dg=this.add.group();this._rd();
    this.promptLbl=this.add.text(this.W/2, 44, 'Follow the clues', {
      fontSize:'18px', color: COL_PRIMARY, fontFamily:"'Space Grotesk', sans-serif", fontStyle:'bold'
    }).setOrigin(0.5,0).setDepth(10);
    this.subPromptLbl=this.add.text(this.W/2, 72, 'Each clue fades out numbers that don\\'t fit.', {
      fontSize:'12px', color: COL_TEXT, fontFamily:"'Lexend', system-ui"
    }).setOrigin(0.5,0).setDepth(10);
  }
  _rh() { this.hg.clear(true,true);for(let i=0;i<this.lives;i++)this.hg.add(this.add.text(14+i*22,14,'\\u2665',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dg.clear(true,true);for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  _fallback(round) {
    // answers chosen so clues produce unique elimination
    const v = [
      { answer: 14, range: [1, 20] },
      { answer: 23, range: [10, 30] },
      { answer: 35, range: [20, 50] },
      { answer: 47, range: [30, 60] },
      { answer: 58, range: [40, 70] },
    ];
    return v[round % v.length];
  }

  startRound() {
    if(this.rg)this.rg.destroy(true);
    this.rg=this.add.container(0,0).setDepth(6);

    const data=getRound(this.round);
    const isDefault = !data || data.prompt === 'Solve this!' ||
      (Array.isArray(data.items) && data.items.length === 6 &&
       data.items[0] === 10 && data.items[1] === 5 && data.items[2] === 8);
    const fb = this._fallback(this.round);
    const ans = (!isDefault && typeof data.target === 'number' && data.target >= 2 && data.target <= 99)
      ? data.target : fb.answer;
    this.answer = ans;

    // Build a grid of 20 numbers that INCLUDES the answer
    // Range picks so answer is inside
    let lo, hi;
    if (ans <= 15) { lo = 1; hi = 20; }
    else if (ans <= 30) { lo = Math.max(1, ans - 12); hi = lo + 19; }
    else { lo = Math.max(1, ans - 10); hi = lo + 19; }

    const nums = [];
    for (let n = lo; n <= hi; n++) nums.push(n);

    // Build clues that whittle the grid down to exactly ans
    const clues = this._buildClues(ans, nums);

    this.clueList = clues;
    this.clueIdx = 0;
    this.numbers = nums.map(n => ({ val: n, eliminated: false }));

    this._rd();
    this._drawGrid();
    this._drawClueArea();
    this._updateClueDisplay();
  }

  _buildClues(ans, nums) {
    // Produce clues in order; each reduces the surviving set; stop when only ans remains.
    const candidates = [];
    candidates.push({
      text: ans % 2 === 0 ? 'It is an even number.' : 'It is an odd number.',
      test: ans % 2 === 0 ? (n => n % 2 === 0) : (n => n % 2 !== 0),
    });
    const mid = Math.floor((nums[0] + nums[nums.length - 1]) / 2);
    candidates.push({
      text: ans > mid ? 'It is greater than ' + mid + '.' : 'It is ' + mid + ' or less.',
      test: ans > mid ? (n => n > mid) : (n => n <= mid),
    });
    if (ans % 5 === 0) candidates.push({ text: 'It is a multiple of 5.', test: n => n % 5 === 0 });
    else candidates.push({ text: 'It is NOT a multiple of 5.', test: n => n % 5 !== 0 });
    if (ans % 3 === 0) candidates.push({ text: 'It is a multiple of 3.', test: n => n % 3 === 0 });
    else candidates.push({ text: 'It is NOT a multiple of 3.', test: n => n % 3 !== 0 });
    candidates.push({
      text: 'Its ones digit is ' + (ans % 10) + '.',
      test: n => n % 10 === ans % 10,
    });

    // Apply in order; add clues until only ans survives OR we exhaust
    const chosen = [];
    let surviving = nums.slice();
    for (const c of candidates) {
      const next = surviving.filter(c.test);
      // Only keep clues that do USEFUL work (actually eliminate) and keep ans
      if (next.includes(ans) && next.length < surviving.length) {
        chosen.push(c);
        surviving = next;
      }
      if (surviving.length === 1) break;
    }
    // If still multiple survivors, add a discriminating final clue
    if (surviving.length > 1) {
      chosen.push({ text: 'The number is ' + ans + '.', test: n => n === ans });
    }
    return chosen;
  }

  _drawGrid() {
    const W = this.W, H = this.H;
    const cols = 5;
    const rows = Math.ceil(this.numbers.length / cols);
    const cellW = 56, cellH = 38;
    const gridW = cols * cellW;
    const startX = W/2 - gridW/2 + cellW/2;
    const startY = H * 0.22;
    this.cells = [];
    this.numbers.forEach((entry, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const x = startX + col * cellW;
      const y = startY + row * cellH;
      const bg = this.add.rectangle(x, y, cellW - 4, cellH - 4, hexToNum(COL_SECONDARY), 0.35)
        .setStrokeStyle(1, hexToNum(COL_TEXT), 0.4).setDepth(7);
      const lbl = this.add.text(x, y, String(entry.val), {
        fontSize:'18px', color: COL_TEXT, fontFamily:"'Space Grotesk', sans-serif", fontStyle:'bold'
      }).setOrigin(0.5).setDepth(8);
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerdown', () => this._pickCell(i));
      this.rg.add(bg); this.rg.add(lbl);
      this.cells.push({ bg, lbl, entry });
    });
  }

  _drawClueArea() {
    const W = this.W, H = this.H;
    const y = H * 0.68;
    const panel = this.add.rectangle(W/2, y, W - 60, 70, 0x000000, 0.35)
      .setStrokeStyle(2, hexToNum(COL_PRIMARY), 0.6).setDepth(7);
    this.rg.add(panel);
    this.clueLbl = this.add.text(W/2, y - 10, '', {
      fontSize:'15px', color: COL_ACCENT, fontFamily:"'Space Grotesk', sans-serif", fontStyle:'bold',
      align:'center', wordWrap:{ width: W - 100 }
    }).setOrigin(0.5).setDepth(8);
    this.rg.add(this.clueLbl);
    this.clueProgressLbl = this.add.text(W/2, y + 14, '', {
      fontSize:'11px', color: COL_TEXT, fontFamily:"'Lexend', system-ui"
    }).setOrigin(0.5).setDepth(8);
    this.rg.add(this.clueProgressLbl);

    // Next clue button
    this.nextBtn = this.add.rectangle(W/2, H - 72, 180, 40, hexToNum(COL_PRIMARY), 1)
      .setInteractive({ useHandCursor: true }).setDepth(9);
    this.nextLbl = this.add.text(W/2, H - 72, 'Apply next clue', {
      fontSize:'13px', color:'#fff', fontFamily:"'Lexend', system-ui", fontStyle:'bold'
    }).setOrigin(0.5).setDepth(10);
    this.rg.add(this.nextBtn); this.rg.add(this.nextLbl);
    this.nextBtn.on('pointerdown', () => this._applyNextClue());
  }

  _updateClueDisplay() {
    const c = this.clueList[this.clueIdx];
    if (!c) return;
    this.clueLbl.setText('Clue ' + (this.clueIdx + 1) + ': ' + c.text);
    this.clueProgressLbl.setText((this.clueIdx) + ' of ' + this.clueList.length + ' clues applied');
  }

  _applyNextClue() {
    const c = this.clueList[this.clueIdx];
    if (!c) return;
    // Fade out failing numbers
    let eliminatedThis = 0;
    this.cells.forEach(cell => {
      if (cell.entry.eliminated) return;
      if (!c.test(cell.entry.val)) {
        cell.entry.eliminated = true;
        eliminatedThis++;
        this.tweens.add({
          targets: [cell.bg, cell.lbl],
          alpha: 0.18,
          duration: 350,
          ease: 'Cubic.easeOut',
        });
        cell.lbl.setColor('#555555');
        cell.bg.setStrokeStyle(1, hexToNum(COL_DANGER), 0.25);
      }
    });
    this.cameras.main.flash(100, 96, 165, 250);
    this.clueIdx++;
    this.clueProgressLbl.setText(this.clueIdx + ' of ' + this.clueList.length + ' clues applied');

    // Count survivors
    const survivors = this.cells.filter(c => !c.entry.eliminated);
    if (survivors.length === 1) {
      // Glow the remaining
      const winner = survivors[0];
      this.tweens.add({
        targets: winner.bg,
        alpha: { from: 1, to: 0.4 },
        duration: 400, yoyo: true, repeat: -1
      });
      winner.bg.setStrokeStyle(3, hexToNum(COL_ACCENT), 1);
      winner.lbl.setColor(COL_ACCENT);
      this.clueLbl.setText('Only one number left! Click it to confirm.');
      this.nextBtn.setVisible(false);
      this.nextLbl.setVisible(false);
    } else if (this.clueIdx >= this.clueList.length) {
      // No more clues — should not happen if clues built correctly
      this.clueLbl.setText('All clues applied. Pick the answer!');
      this.nextBtn.setVisible(false);
      this.nextLbl.setVisible(false);
    } else {
      this._updateClueDisplay();
    }
  }

  _pickCell(idx) {
    const cell = this.cells[idx];
    if (cell.entry.eliminated) return;
    if (cell.entry.val === this.answer) {
      this.cameras.main.flash(200, 34, 197, 94);
      heroCheer(this, this.hero);
      gameScore += 10 * (this.round + 1);
      this.scoreLbl.setText('Score: ' + gameScore);
      this.time.delayedCall(400, () => this._showSolutionCard());
    } else {
      this.lives--; this._rh(); this.cameras.main.shake(200, 0.01);
      heroShake(this, this.hero);
      cell.entry.eliminated = true;
      cell.bg.setAlpha(0.18);
      cell.lbl.setAlpha(0.18).setColor(COL_DANGER);
      if (this.lives <= 0) this.time.delayedCall(500, () => this.scene.start('LoseScene', {score: gameScore}));
    }
  }

  _showSolutionCard() {
    const W = this.W, H = this.H;
    const backdrop = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.55).setDepth(50);
    const card = this.add.rectangle(W/2, H * 0.5, W - 60, 240, 0x18181b, 1)
      .setStrokeStyle(2, hexToNum(COL_ACCENT)).setDepth(51);
    const h1 = this.add.text(W/2, H * 0.5 - 90, 'You found it!', {
      fontSize: '22px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(52);
    const lines = [
      'The answer is ' + this.answer + '.',
      'Clues applied: ' + this.clueIdx + ' of ' + this.clueList.length,
      'Every other number was eliminated.',
    ];
    const textObjs = [];
    lines.forEach((line, i) => {
      const t = this.add.text(W/2, H * 0.5 - 50 + i * 28, line, {
        fontSize: i === 0 ? '20px' : '14px',
        color: i === 0 ? COL_ACCENT : COL_TEXT,
        fontFamily: "'Space Grotesk', sans-serif",
        fontStyle: i === 0 ? 'bold' : 'normal'
      }).setOrigin(0.5).setDepth(52).setAlpha(0);
      textObjs.push(t);
      this.time.delayedCall(150 * i, () => {
        this.tweens.add({ targets: t, alpha: 1, duration: 300 });
      });
    });
    const nextY = H * 0.5 + 85;
    const isLast = (this.round + 1) >= TOTAL_ROUNDS;
    const nextBg = this.add.rectangle(W/2, nextY, 220, 44, hexToNum(COL_ACCENT), 1)
      .setInteractive({ useHandCursor: true }).setDepth(52).setAlpha(0);
    const nextLbl = this.add.text(W/2, nextY, isLast ? 'Finish!' : 'Got it! Next round \\u2192', {
      fontSize: '14px', color: '#000', fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(53).setAlpha(0);
    this.time.delayedCall(150 * lines.length + 200, () => {
      this.tweens.add({ targets: [nextBg, nextLbl], alpha: 1, duration: 300 });
    });
    nextBg.on('pointerdown', () => {
      [backdrop, card, h1, ...textObjs, nextBg, nextLbl].forEach(o => o.destroy());
      this.round++;
      if (this.round >= TOTAL_ROUNDS) this.scene.start('VictoryScene', { score: gameScore });
      else this.startRound();
    });
  }
}
`
