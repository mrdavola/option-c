// Clock & Time — Phaser engine with 3 game options.
// Math: Tell time, read clocks, calculate elapsed time.
// Options: clock-reader (intrinsic), time-matcher (practice), time-elapsed (intrinsic)

import type { ThemeConfig, MathParams, GameOption } from "./engine-types"
import { phaserGame } from "./base-phaser-template"
import { getOptionDef } from "./game-option-registry"

export function measurementTimePhaserEngine(
  config: ThemeConfig,
  math: MathParams,
  option: GameOption = "clock-reader"
): string {
  const validOptions = ["clock-reader", "time-matcher", "time-elapsed"]
  const activeOption = validOptions.includes(option) ? option : "clock-reader"
  const optDef = getOptionDef(activeOption)
  const sceneMap: Record<string, string> = {
    "clock-reader": "ClockReaderScene",
    "time-matcher": "TimeMatcherScene",
    "time-elapsed": "TimeElapsedScene",
  }
  return phaserGame({
    config, math, option: activeOption,
    sceneName: sceneMap[activeOption],
    introText: optDef?.introText || "Read the clock!",
    helpText: optDef?.helpText || "Tell the time shown on the clock.",
    gameSceneCode: GAME_SCENES,
  })
}

const GAME_SCENES = `
// ─── Shared helper: solution reveal card with "Got it! Next round →" ─────────
function showSolutionCard(scene, lines, onNext) {
  const W = scene.W, H = scene.H;
  const backdrop = scene.add.rectangle(W/2, H/2, W, H, 0x000000, 0.6).setDepth(80);
  const card = scene.add.rectangle(W/2, H*0.5, W - 48, 240, 0x18181b, 1)
    .setStrokeStyle(2, hexToNum(COL_ACCENT)).setDepth(81);
  const h1 = scene.add.text(W/2, H*0.5 - 95, 'You did it!', {
    fontSize: '22px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
  }).setOrigin(0.5).setDepth(82);
  const textObjs = [backdrop, card, h1];
  lines.forEach((line, i) => {
    const t = scene.add.text(W/2, H*0.5 - 55 + i*26, line, {
      fontSize: i === lines.length - 1 ? '20px' : '14px',
      color: i === lines.length - 1 ? COL_ACCENT : COL_TEXT,
      fontFamily: "'Space Grotesk', sans-serif",
      fontStyle: i === lines.length - 1 ? 'bold' : 'normal',
      wordWrap: { width: W - 80 }, align: 'center'
    }).setOrigin(0.5).setDepth(82);
    t.setAlpha(0);
    scene.time.delayedCall(160 * i, () => scene.tweens.add({ targets: t, alpha: 1, duration: 260 }));
    textObjs.push(t);
  });
  const btnY = H*0.5 + 90;
  const btnBg = scene.add.rectangle(W/2, btnY, 220, 44, hexToNum(COL_ACCENT), 1)
    .setInteractive({ useHandCursor: true }).setDepth(82);
  const btnLbl = scene.add.text(W/2, btnY, 'Got it! Next round →', {
    fontSize: '14px', color: '#000', fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
  }).setOrigin(0.5).setDepth(83);
  btnBg.setAlpha(0); btnLbl.setAlpha(0);
  scene.time.delayedCall(160 * lines.length + 180, () => {
    scene.tweens.add({ targets: [btnBg, btnLbl], alpha: 1, duration: 260 });
  });
  textObjs.push(btnBg, btnLbl);
  btnBg.on('pointerdown', () => {
    textObjs.forEach(o => o.destroy && o.destroy());
    onNext();
  });
}

// Parse target time from AI round data. Prefer items[0]=hour, items[1]=minute;
// fall back to parsing prompt like "8:45"; then to target (as minutes since 12:00).
function parseTargetTime(data, round) {
  let hour, minute;
  if (Array.isArray(data.items) && data.items.length >= 2 &&
      typeof data.items[0] === 'number' && typeof data.items[1] === 'number') {
    hour = data.items[0]; minute = data.items[1];
  } else if (typeof data.prompt === 'string') {
    const m = data.prompt.match(/(\\d{1,2})\\s*:\\s*(\\d{2})/);
    if (m) { hour = parseInt(m[1]); minute = parseInt(m[2]); }
  }
  if (typeof hour !== 'number' || typeof minute !== 'number' || isNaN(hour) || isNaN(minute)) {
    // Fallback variation based on round index
    const fallbacks = [
      { h: 3, m: 0 }, { h: 6, m: 30 }, { h: 9, m: 15 }, { h: 2, m: 45 }, { h: 11, m: 20 }
    ];
    const f = fallbacks[round % fallbacks.length];
    hour = f.h; minute = f.m;
  }
  hour = ((hour - 1) % 12 + 12) % 12 + 1; // clamp 1..12
  minute = Math.max(0, Math.min(59, Math.round(minute)));
  return { hour, minute };
}

// Parse elapsed target (hours, minutes). Prefer items[0]=elapsedHours,
// items[1]=elapsedMinutes, items[2]=startHour, items[3]=startMinute.
function parseElapsedTarget(data, round) {
  let eh, em, sh, sm;
  if (Array.isArray(data.items) && data.items.length >= 2 &&
      typeof data.items[0] === 'number' && typeof data.items[1] === 'number') {
    eh = data.items[0]; em = data.items[1];
    sh = (typeof data.items[2] === 'number') ? data.items[2] : null;
    sm = (typeof data.items[3] === 'number') ? data.items[3] : null;
  }
  if (typeof eh !== 'number' || typeof em !== 'number' || isNaN(eh) || isNaN(em)) {
    const fallbacks = [
      { eh: 1, em: 0, sh: 2, sm: 0 },
      { eh: 2, em: 30, sh: 9, sm: 0 },
      { eh: 3, em: 15, sh: 4, sm: 30 },
      { eh: 1, em: 45, sh: 7, sm: 15 },
      { eh: 4, em: 0, sh: 10, sm: 0 }
    ];
    const f = fallbacks[round % fallbacks.length];
    eh = f.eh; em = f.em; sh = f.sh; sm = f.sm;
  }
  if (typeof sh !== 'number' || typeof sm !== 'number') {
    const starts = [{h:2,m:0},{h:9,m:0},{h:4,m:30},{h:7,m:15},{h:10,m:0}];
    const s = starts[round % starts.length];
    sh = s.h; sm = s.m;
  }
  eh = Math.max(0, Math.min(11, Math.round(eh)));
  em = Math.max(0, Math.min(59, Math.round(em)));
  sh = ((sh - 1) % 12 + 12) % 12 + 1;
  sm = Math.max(0, Math.min(59, Math.round(sm)));
  return { elapsedHours: eh, elapsedMinutes: em, startHour: sh, startMinute: sm };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ClockReaderScene — DISCOVERY CLOCK (intrinsic redesign)
//
// Teaches: Read analog clocks by embodying the hand rotation.
//
// Setup: A blank analog clock face with hour and minute hands at 12:00.
// A target DIGITAL time is shown at top (e.g. "8:45"). A live digital
// readout under the clock shows the current hand position.
//
// Player's tools: Drag the hour hand. Drag the minute hand. That's it.
// As they rotate, the live digital readout updates continuously. When the
// live reading matches the target exactly (snapped to 5-min marks), the
// clock locks, chimes, and the solution card appears.
//
// Self-revealing truth: the hands ARE the time. The rotation IS the math.
// No typing, no Check button.
// ═══════════════════════════════════════════════════════════════════════════════
class ClockReaderScene extends Phaser.Scene {
  constructor() { super('ClockReaderScene'); }

  create() {
    this.W = this.scale.width; this.H = this.scale.height;
    this.round = 0; this.lives = MAX_LIVES;
    this._bg(); this._ui();
    this.hero = addCharacter(this, this.W * 0.88, this.H * 0.55, 0.8);
    this.startRound();
  }

  _bg() {
    const bg = this.add.image(this.W/2, this.H/2, 'bg');
    bg.setScale(Math.max(this.W/bg.width, this.H/bg.height));
    this.add.rectangle(this.W/2, this.H/2, this.W, this.H, 0x000000, 0.7);
  }

  _ui() {
    this.scoreLbl = this.add.text(this.W - 14, 14, 'Score: 0', {
      fontSize: '16px', color: COL_ACCENT, fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(1, 0).setDepth(10);
    this.hg = this.add.group(); this._rh();
    this.dg = this.add.group(); this._rd();
    // Math operation at top
    this.mathLbl = this.add.text(this.W/2, 16, '', {
      fontSize: '14px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5, 0).setDepth(10);
    this.targetLbl = this.add.text(this.W/2, 40, '', {
      fontSize: '30px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(10);
  }
  _rh() {
    this.hg.clear(true, true);
    for (let i = 0; i < this.lives; i++) {
      this.hg.add(this.add.text(14 + i*22, 14, '♥', { fontSize: '18px', color: COL_DANGER }).setDepth(10));
    }
  }
  _rd() {
    this.dg.clear(true, true);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      const col = i < this.round ? COL_ACCENT : (i === this.round ? COL_PRIMARY : '#555555');
      this.dg.add(this.add.circle(this.W/2 - 40 + i*20, this.H - 16, 5, hexToNum(col)).setDepth(10));
    }
  }

  startRound() {
    if (this.rg) this.rg.clear(true, true);
    this.rg = this.add.group();
    this._rd();
    this.locked = false;

    const data = getRound(this.round);
    const { hour, minute } = parseTargetTime(data, this.round);
    this.targetHour = hour;
    this.targetMinute = minute;

    // Math operation at top
    this.mathLbl.setText('Make the clock show:');
    const pad2 = (n) => (n < 10 ? '0' + n : '' + n);
    this.targetLbl.setText(this.targetHour + ':' + pad2(this.targetMinute));

    const W = this.W, H = this.H;
    const cx = W * 0.38, cy = H * 0.48;
    const radius = Math.min(W * 0.22, H * 0.28, 120);
    this.clockCX = cx; this.clockCY = cy; this.clockR = radius;

    // Start hands at 12:00
    this.currentHour = 12;
    this.currentMinute = 0;

    this._drawClockFace();
    this._drawHands();

    // Live digital readout
    this.liveLbl = this.add.text(cx, cy + radius + 28, '12:00', {
      fontSize: '28px', color: COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);
    this.rg.add(this.liveLbl);

    this.hintLbl = this.add.text(cx, cy + radius + 58, 'Drag the hands to set the time', {
      fontSize: '12px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5).setDepth(10);
    this.rg.add(this.hintLbl);

    this._setupHandDragging();
  }

  _drawClockFace() {
    const g = this.add.graphics().setDepth(4);
    this.rg.add(g);
    const cx = this.clockCX, cy = this.clockCY, r = this.clockR;
    g.fillStyle(hexToNum(COL_SECONDARY), 0.18);
    g.fillCircle(cx, cy, r);
    g.lineStyle(3, hexToNum(COL_TEXT), 0.6);
    g.strokeCircle(cx, cy, r);
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const inner = r * 0.84, outer = r * 0.94;
      g.lineStyle(2, hexToNum(COL_TEXT), 0.7);
      g.beginPath();
      g.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
      g.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
      g.strokePath();
      const nx = cx + Math.cos(angle) * (r * 0.72);
      const ny = cy + Math.sin(angle) * (r * 0.72);
      const num = i === 0 ? 12 : i;
      this.rg.add(this.add.text(nx, ny, String(num), {
        fontSize: r > 90 ? '16px' : '12px', color: COL_TEXT,
        fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(5));
    }
    // Center dot
    const dot = this.add.circle(cx, cy, 5, hexToNum(COL_TEXT), 1).setDepth(9);
    this.rg.add(dot);
  }

  _drawHands() {
    if (this.hourHand) this.hourHand.destroy();
    if (this.minuteHand) this.minuteHand.destroy();
    const cx = this.clockCX, cy = this.clockCY, r = this.clockR;

    // Minute hand angle
    const minAngle = (this.currentMinute / 60) * Math.PI * 2 - Math.PI / 2;
    const mx = cx + Math.cos(minAngle) * r * 0.8;
    const my = cy + Math.sin(minAngle) * r * 0.8;
    this.minuteHand = this.add.line(0, 0, cx, cy, mx, my, hexToNum(COL_PRIMARY), 1)
      .setOrigin(0, 0).setLineWidth(4).setDepth(7);
    this.rg.add(this.minuteHand);

    // Hour hand angle — moves with minutes
    const hNormalized = (this.currentHour % 12) + this.currentMinute / 60;
    const hourAngle = (hNormalized / 12) * Math.PI * 2 - Math.PI / 2;
    const hx = cx + Math.cos(hourAngle) * r * 0.5;
    const hy = cy + Math.sin(hourAngle) * r * 0.5;
    this.hourHand = this.add.line(0, 0, cx, cy, hx, hy, hexToNum(COL_ACCENT), 1)
      .setOrigin(0, 0).setLineWidth(6).setDepth(8);
    this.rg.add(this.hourHand);

    // Draggable tip handles (invisible hit zones)
    if (this.minuteHandle) this.minuteHandle.destroy();
    if (this.hourHandle) this.hourHandle.destroy();
    this.minuteHandle = this.add.circle(mx, my, 22, 0xffffff, 0.001).setDepth(12).setInteractive({ useHandCursor: true, draggable: true });
    this.hourHandle = this.add.circle(hx, hy, 22, 0xffffff, 0.001).setDepth(12).setInteractive({ useHandCursor: true, draggable: true });
    this.rg.add(this.minuteHandle);
    this.rg.add(this.hourHandle);
  }

  _setupHandDragging() {
    // Clear previous listeners to avoid duplicates
    this.input.off('drag', this._onDrag, this);
    this.input.on('drag', this._onDrag, this);
  }

  _onDrag(pointer, obj, dragX, dragY) {
    if (this.locked) return;
    const cx = this.clockCX, cy = this.clockCY;
    const angle = Math.atan2(dragY - cy, dragX - cx) + Math.PI / 2;
    let deg = (angle * 180 / Math.PI + 360) % 360;

    if (obj === this.minuteHandle) {
      // Snap minutes to 5-min increments (0..55)
      const rawMin = (deg / 360) * 60;
      this.currentMinute = (Math.round(rawMin / 5) * 5) % 60;
    } else if (obj === this.hourHandle) {
      // Hour is continuous; snap to whole hour 1..12 for readability
      const rawHour = (deg / 360) * 12;
      let h = Math.round(rawHour) % 12;
      if (h === 0) h = 12;
      this.currentHour = h;
    }
    this._drawHands();
    this._updateLive();
    this._checkMatch();
  }

  _updateLive() {
    const pad2 = (n) => (n < 10 ? '0' + n : '' + n);
    this.liveLbl.setText(this.currentHour + ':' + pad2(this.currentMinute));
    const match = (this.currentHour === this.targetHour && this.currentMinute === this.targetMinute);
    this.liveLbl.setColor(match ? COL_ACCENT : COL_PRIMARY);
  }

  _checkMatch() {
    if (this.currentHour === this.targetHour && this.currentMinute === this.targetMinute) {
      this._onSolved();
    }
  }

  _onSolved() {
    if (this.locked) return;
    this.locked = true;
    gameScore += 10 * (this.round + 1);
    this.scoreLbl.setText('Score: ' + gameScore);
    this.cameras.main.flash(200, 34, 197, 94);
    heroCheer(this, this.hero);
    const pad2 = (n) => (n < 10 ? '0' + n : '' + n);
    const lines = [
      'The clock reads',
      this.targetHour + ':' + pad2(this.targetMinute),
      'Hour hand on ' + this.targetHour + ', minute hand on ' + (this.targetMinute/5) + ' (=' + this.targetMinute + ' min)'
    ];
    this.time.delayedCall(400, () => {
      showSolutionCard(this, lines, () => {
        this.round++;
        if (this.round >= TOTAL_ROUNDS) {
          this.scene.start('VictoryScene', { score: gameScore });
        } else {
          this.startRound();
        }
      });
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TimeMatcherScene — practice-only (unchanged, visual polish only)
// ═══════════════════════════════════════════════════════════════════════════════
function drawStaticClock(scene, x, y, radius, hour, minute) {
  const g = scene.add.graphics();
  g.fillStyle(hexToNum(COL_SECONDARY), 0.15);
  g.fillCircle(x, y, radius);
  g.lineStyle(3, hexToNum(COL_TEXT), 0.5);
  g.strokeCircle(x, y, radius);
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const inner = radius * 0.82, outer = radius * 0.92;
    g.lineStyle(2, hexToNum(COL_TEXT), 0.6);
    g.beginPath();
    g.moveTo(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner);
    g.lineTo(x + Math.cos(angle) * outer, y + Math.sin(angle) * outer);
    g.strokePath();
    const nx = x + Math.cos(angle) * (radius * 0.7);
    const ny = y + Math.sin(angle) * (radius * 0.7);
    scene.add.text(nx, ny, String(i === 0 ? 12 : i), {
      fontSize: radius > 60 ? '14px' : '10px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6);
  }
  const minAngle = (minute / 60) * Math.PI * 2 - Math.PI / 2;
  g.lineStyle(3, hexToNum(COL_PRIMARY), 1);
  g.beginPath(); g.moveTo(x, y);
  g.lineTo(x + Math.cos(minAngle) * radius * 0.75, y + Math.sin(minAngle) * radius * 0.75);
  g.strokePath();
  const hourAngle = ((hour % 12 + minute / 60) / 12) * Math.PI * 2 - Math.PI / 2;
  g.lineStyle(4, hexToNum(COL_ACCENT), 1);
  g.beginPath(); g.moveTo(x, y);
  g.lineTo(x + Math.cos(hourAngle) * radius * 0.5, y + Math.sin(hourAngle) * radius * 0.5);
  g.strokePath();
  g.fillStyle(hexToNum(COL_TEXT), 1);
  g.fillCircle(x, y, 4);
  return g;
}

class TimeMatcherScene extends Phaser.Scene {
  constructor() { super('TimeMatcherScene'); }
  create() {
    this.W = this.scale.width; this.H = this.scale.height;
    this.round = 0; this.lives = MAX_LIVES;
    this._bg(); this._ui();
    this.hero = addCharacter(this, this.W * 0.85, this.H * 0.35, 0.4);
    this.startRound();
  }
  _bg() { const bg=this.add.image(this.W/2,this.H/2,'bg');bg.setScale(Math.max(this.W/bg.width,this.H/bg.height));this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.65); }
  _ui() { this.scoreLbl=this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);this.hg=this.add.group();this._rh();this.dg=this.add.group();this._rd(); }
  _rh() { this.hg.clear(true,true);for(let i=0;i<this.lives;i++)this.hg.add(this.add.text(14+i*22,14,'♥',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dg.clear(true,true);for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  startRound() {
    if(this.rg)this.rg.clear(true,true);this.rg=this.add.group();
    const data = getRound(this.round);
    const { hour, minute } = parseTargetTime(data, this.round);
    this.correctHour = hour; this.correctMinute = minute;
    this._rd();
    const W=this.W,H=this.H;
    this.rg.add(this.add.text(W/2,30,'Match the clock to the digital time',{fontSize:'14px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui"}).setOrigin(0.5).setDepth(6));
    if(this.clockGraphics)this.clockGraphics.destroy();
    this.clockGraphics = drawStaticClock(this, W/2, H*0.32, Math.min(W*0.2, 90), hour, minute);
    const pad2 = (n) => (n < 10 ? '0' + n : '' + n);
    const correct = hour + ':' + pad2(minute);
    const wrongs = new Set();
    while (wrongs.size < 3) {
      const wh = Math.floor(Math.random()*12) + 1;
      const wm = [0,15,30,45][Math.floor(Math.random()*4)];
      const ws = wh + ':' + pad2(wm);
      if (ws !== correct) wrongs.add(ws);
    }
    const choices = [correct, ...Array.from(wrongs)];
    for (let i = choices.length-1; i > 0; i--) {
      const j = Math.floor(Math.random()*(i+1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    const gap = Math.min(120, (W*0.8)/4);
    const sx = W/2 - (3 * gap)/2;
    choices.forEach((ch, i) => {
      const x = sx + i*gap; const y = H*0.65;
      const btn = this.add.rectangle(x, y, 90, 44, hexToNum(COL_SECONDARY), 0.3)
        .setStrokeStyle(2, hexToNum(COL_PRIMARY), 0.3)
        .setInteractive({ useHandCursor: true }).setDepth(7);
      this.rg.add(btn);
      this.rg.add(this.add.text(x, y, ch, {
        fontSize: '18px', color: COL_TEXT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(8));
      btn.on('pointerdown', () => {
        if (ch === correct) {
          gameScore += 10 * (this.round + 1);
          this.scoreLbl.setText('Score: ' + gameScore);
          this.cameras.main.flash(200, 34, 197, 94);
          heroCheer(this, this.hero);
          this.round++;
          if (this.round >= TOTAL_ROUNDS) this.time.delayedCall(600, () => this.scene.start('VictoryScene', { score: gameScore }));
          else this.time.delayedCall(800, () => this.startRound());
        } else {
          this.lives--; this._rh();
          this.cameras.main.shake(200, 0.01); heroShake(this, this.hero);
          if (this.lives <= 0) this.time.delayedCall(500, () => this.scene.start('LoseScene', { score: gameScore }));
        }
      });
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TimeElapsedScene — TIMELINE WITH INTERVAL BAR (intrinsic redesign)
//
// Teaches: Elapsed time as a measurable duration along a timeline.
//
// Setup: A horizontal timeline spans the play area, marked in hours from
// the start time. The start time label sits on the left. A draggable
// INTERVAL BAR begins with zero length, anchored at the start. As the
// player drags its right edge, the bar stretches along the timeline and
// a live readout shows "X hr Y min" elapsed. A target elapsed time is
// shown above.
//
// Player's tools: Drag the right edge of the interval bar.
//
// Self-revealing truth: the bar's LENGTH is the elapsed time. When the
// length matches the target, the bar locks and glows.
// ═══════════════════════════════════════════════════════════════════════════════
class TimeElapsedScene extends Phaser.Scene {
  constructor() { super('TimeElapsedScene'); }

  create() {
    this.W = this.scale.width; this.H = this.scale.height;
    this.round = 0; this.lives = MAX_LIVES;
    this._bg(); this._ui();
    this.hero = addCharacter(this, this.W * 0.88, this.H * 0.55, 0.8);
    this.startRound();
  }

  _bg() {
    const bg = this.add.image(this.W/2, this.H/2, 'bg');
    bg.setScale(Math.max(this.W/bg.width, this.H/bg.height));
    this.add.rectangle(this.W/2, this.H/2, this.W, this.H, 0x000000, 0.7);
  }
  _ui() {
    this.scoreLbl = this.add.text(this.W - 14, 14, 'Score: 0', {
      fontSize: '16px', color: COL_ACCENT, fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
    }).setOrigin(1, 0).setDepth(10);
    this.hg = this.add.group(); this._rh();
    this.dg = this.add.group(); this._rd();
    this.mathLbl = this.add.text(this.W/2, 16, '', {
      fontSize: '14px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5, 0).setDepth(10);
    this.targetLbl = this.add.text(this.W/2, 40, '', {
      fontSize: '26px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(10);
  }
  _rh() {
    this.hg.clear(true, true);
    for (let i = 0; i < this.lives; i++) {
      this.hg.add(this.add.text(14 + i*22, 14, '♥', { fontSize: '18px', color: COL_DANGER }).setDepth(10));
    }
  }
  _rd() {
    this.dg.clear(true, true);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      const col = i < this.round ? COL_ACCENT : (i === this.round ? COL_PRIMARY : '#555555');
      this.dg.add(this.add.circle(this.W/2 - 40 + i*20, this.H - 16, 5, hexToNum(col)).setDepth(10));
    }
  }

  startRound() {
    if (this.rg) this.rg.clear(true, true);
    this.rg = this.add.group();
    this._rd();
    this.locked = false;

    const data = getRound(this.round);
    const { elapsedHours, elapsedMinutes, startHour, startMinute } = parseElapsedTarget(data, this.round);
    this.targetMinutesTotal = elapsedHours * 60 + elapsedMinutes;
    this.startHour = startHour;
    this.startMinute = startMinute;

    // Math operation at top
    this.mathLbl.setText('Stretch the interval to:');
    this.targetLbl.setText(elapsedHours + ' hr ' + elapsedMinutes + ' min');

    const W = this.W, H = this.H;
    // Timeline geometry
    const tlLeft = W * 0.08;
    const tlRight = W * 0.72;
    const tlY = H * 0.48;
    this.tlLeft = tlLeft; this.tlRight = tlRight; this.tlY = tlY;

    // Hours span the timeline: show enough hours that target fits with slack
    const hoursSpan = Math.max(6, elapsedHours + 3);
    this.hoursSpan = hoursSpan;
    this.pxPerMinute = (tlRight - tlLeft) / (hoursSpan * 60);

    // Timeline base
    const tlG = this.add.graphics().setDepth(4);
    this.rg.add(tlG);
    tlG.lineStyle(3, hexToNum(COL_TEXT), 0.6);
    tlG.beginPath();
    tlG.moveTo(tlLeft, tlY);
    tlG.lineTo(tlRight, tlY);
    tlG.strokePath();

    // Hour ticks + labels
    const pad2 = (n) => (n < 10 ? '0' + n : '' + n);
    for (let i = 0; i <= hoursSpan; i++) {
      const x = tlLeft + (i * 60) * this.pxPerMinute;
      const h = i === 0 || i === hoursSpan ? 14 : 10;
      tlG.lineStyle(2, hexToNum(COL_TEXT), 0.7);
      tlG.beginPath();
      tlG.moveTo(x, tlY - h);
      tlG.lineTo(x, tlY + h);
      tlG.strokePath();
      const labelH = ((startHour - 1 + i) % 12 + 12) % 12 + 1;
      const labelTxt = labelH + ':' + pad2(startMinute);
      this.rg.add(this.add.text(x, tlY + 22, labelTxt, {
        fontSize: '11px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
      }).setOrigin(0.5, 0).setDepth(5));
    }

    // Start marker
    this.rg.add(this.add.text(tlLeft, tlY - 36, 'Start', {
      fontSize: '12px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(6));

    // Interval bar — starts with small length
    this.currentMinutes = 0;
    this.barH = 22;
    this.intervalBar = this.add.rectangle(tlLeft, tlY, 2, this.barH, hexToNum(COL_PRIMARY), 0.55)
      .setOrigin(0, 0.5).setDepth(6);
    this.rg.add(this.intervalBar);

    // Live readout above the bar's right edge
    this.liveLbl = this.add.text(tlLeft, tlY - 18, '0 hr 0 min', {
      fontSize: '14px', color: COL_PRIMARY, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5, 1).setDepth(10);
    this.rg.add(this.liveLbl);

    // Drag handle at the right edge
    this.dragHandle = this.add.circle(tlLeft, tlY, 16, hexToNum(COL_ACCENT), 1)
      .setStrokeStyle(2, 0xffffff, 0.9)
      .setDepth(12)
      .setInteractive({ useHandCursor: true, draggable: true });
    this.rg.add(this.dragHandle);

    this.rg.add(this.add.text(this.W/2, tlY + 60, 'Drag the handle to stretch the interval', {
      fontSize: '11px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(0.5, 0).setDepth(10));

    this.input.off('drag', this._onDrag, this);
    this.input.on('drag', this._onDrag, this);
  }

  _onDrag(pointer, obj, dragX, dragY) {
    if (this.locked || obj !== this.dragHandle) return;
    const clampedX = Math.max(this.tlLeft, Math.min(this.tlRight, dragX));
    const rawMinutes = (clampedX - this.tlLeft) / this.pxPerMinute;
    // Snap to 5-min increments
    const snapped = Math.round(rawMinutes / 5) * 5;
    this.currentMinutes = Math.max(0, Math.min(this.hoursSpan * 60, snapped));
    const snappedX = this.tlLeft + this.currentMinutes * this.pxPerMinute;
    this.dragHandle.x = snappedX;
    this.intervalBar.width = Math.max(2, snappedX - this.tlLeft);
    const hrs = Math.floor(this.currentMinutes / 60);
    const mins = this.currentMinutes % 60;
    this.liveLbl.setText(hrs + ' hr ' + mins + ' min');
    this.liveLbl.x = (this.tlLeft + snappedX) / 2;
    const match = (this.currentMinutes === this.targetMinutesTotal);
    this.liveLbl.setColor(match ? COL_ACCENT : COL_PRIMARY);
    this.intervalBar.fillColor = match ? hexToNum(COL_ACCENT) : hexToNum(COL_PRIMARY);
    if (match) this._onSolved();
  }

  _onSolved() {
    if (this.locked) return;
    this.locked = true;
    gameScore += 10 * (this.round + 1);
    this.scoreLbl.setText('Score: ' + gameScore);
    this.cameras.main.flash(200, 34, 197, 94);
    heroCheer(this, this.hero);
    const hrs = Math.floor(this.targetMinutesTotal / 60);
    const mins = this.targetMinutesTotal % 60;
    const pad2 = (n) => (n < 10 ? '0' + n : '' + n);
    const endMin = (this.startMinute + mins) % 60;
    const carry = Math.floor((this.startMinute + mins) / 60);
    const endH = ((this.startHour - 1 + hrs + carry) % 12 + 12) % 12 + 1;
    const lines = [
      'Elapsed time',
      hrs + ' hr ' + mins + ' min',
      'From ' + this.startHour + ':' + pad2(this.startMinute) + ' to ' + endH + ':' + pad2(endMin)
    ];
    this.time.delayedCall(400, () => {
      showSolutionCard(this, lines, () => {
        this.round++;
        if (this.round >= TOTAL_ROUNDS) {
          this.scene.start('VictoryScene', { score: gameScore });
        } else {
          this.startRound();
        }
      });
    });
  }
}
`
