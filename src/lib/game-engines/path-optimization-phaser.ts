// Path Optimization — Phaser engine with 3 game options.
// Math: Addition, comparison, optimization, graph traversal.
// Options: shortest-route, map-builder, delivery-run
//
// INTRINSIC REDESIGN v2 (April 13, 2026)
// All three scenes teach through direct manipulation. The ACT of clicking nodes
// IS the path construction; the running-total meter IS the addition. Nothing is
// a quiz-wrapper — learners discover shortest/cheapest by experimenting, not by
// being told an answer and asked to confirm it.

import type { ThemeConfig, MathParams, GameOption } from "./engine-types"
import { phaserGame } from "./base-phaser-template"
import { getOptionDef } from "./game-option-registry"

export function pathOptimizationPhaserEngine(
  config: ThemeConfig,
  math: MathParams,
  option: GameOption = "shortest-route"
): string {
  const validOptions = ["shortest-route", "map-builder", "delivery-run"]
  const activeOption = validOptions.includes(option) ? option : "shortest-route"
  const optDef = getOptionDef(activeOption)
  const sceneMap: Record<string, string> = {
    "shortest-route": "ShortestRouteScene",
    "map-builder": "MapBuilderScene",
    "delivery-run": "DeliveryRunScene",
  }
  return phaserGame({
    config, math, option: activeOption,
    sceneName: sceneMap[activeOption],
    introText: optDef?.introText || "Find the best path!",
    helpText: optDef?.helpText || "Draw routes to minimize distance.",
    gameSceneCode: GAME_SCENES,
  })
}

const GAME_SCENES = `
// ─── Round generators — produce node layouts with labeled distances.
// Edges have explicit numeric costs so adding them is the math operation.
function genGraph(round, nodeCount) {
  const nodes = [];
  // Arrange nodes roughly on a rough grid for readability
  const cols = Math.ceil(Math.sqrt(nodeCount));
  for (let i = 0; i < nodeCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const jitterX = (Math.random() - 0.5) * 0.08;
    const jitterY = (Math.random() - 0.5) * 0.08;
    nodes.push({
      x: 0.18 + (col / (cols - 1 || 1)) * 0.64 + jitterX,
      y: 0.22 + (row / Math.max(1, Math.ceil(nodeCount / cols) - 1)) * 0.38 + jitterY,
    });
  }
  // Edges: connect each node to 2-3 nearest neighbors so multiple paths exist.
  const edges = [];
  const seen = {};
  for (let i = 0; i < nodeCount; i++) {
    const dists = [];
    for (let j = 0; j < nodeCount; j++) {
      if (i === j) continue;
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      dists.push({ j, d: Math.sqrt(dx*dx + dy*dy) });
    }
    dists.sort(function(a,b){return a.d-b.d;});
    const connect = Math.min(dists.length, 2 + (round >= 3 ? 1 : 0));
    for (let k = 0; k < connect; k++) {
      const j = dists[k].j;
      const key = i < j ? i + '-' + j : j + '-' + i;
      if (seen[key]) continue;
      seen[key] = true;
      // Cost proportional to screen distance, rounded to integers 3..18
      const cost = Math.max(3, Math.min(18, Math.round(dists[k].d * 40)));
      edges.push({ from: Math.min(i,j), to: Math.max(i,j), cost });
    }
  }
  return { nodes, edges };
}

function generateShortestRouteRound(round) {
  if (AI_ROUNDS && AI_ROUNDS[round] && AI_ROUNDS[round].nodes) {
    return AI_ROUNDS[round];
  }
  const nodeCount = round < 2 ? 4 : round < 4 ? 5 : 6;
  const g = genGraph(round, nodeCount);
  return { nodes: g.nodes, edges: g.edges, startNode: 0, endNode: nodeCount - 1 };
}

function generateMapBuilderRound(round) {
  if (AI_ROUNDS && AI_ROUNDS[round] && AI_ROUNDS[round].nodes) {
    return AI_ROUNDS[round];
  }
  const nodeCount = round < 2 ? 4 : round < 4 ? 5 : 6;
  const g = genGraph(round, nodeCount);
  // Find cheapest path start→end via BFS over edges summing cost (Dijkstra-lite)
  const best = cheapestPath(g.nodes, g.edges, 0, nodeCount - 1);
  const budget = Math.round(best.cost * 1.4);
  // Required node: pick one not on the best path, if possible
  let required = 1;
  for (let i = 1; i < nodeCount - 1; i++) {
    if (best.path.indexOf(i) < 0) { required = i; break; }
  }
  return { nodes: g.nodes, edges: g.edges, budget, startNode: 0, endNode: nodeCount - 1, requiredNode: required };
}

function generateDeliveryRound(round) {
  if (AI_ROUNDS && AI_ROUNDS[round] && AI_ROUNDS[round].positions) {
    return AI_ROUNDS[round];
  }
  const stops = round < 2 ? 4 : round < 4 ? 5 : 6;
  const positions = [];
  for (let i = 0; i < stops; i++) {
    positions.push({
      x: 0.12 + Math.random() * 0.76,
      y: 0.20 + Math.random() * 0.42,
      label: String.fromCharCode(65 + i),
    });
  }
  return { positions };
}

// Screen-space distance between two normalized points × 100 (integer units)
function dist2d(a, b) {
  const dx = a.x - b.x; const dy = a.y - b.y;
  return Math.round(Math.sqrt(dx*dx + dy*dy) * 100);
}

// Cheapest path from s to t using simple Dijkstra
function cheapestPath(nodes, edges, s, t) {
  const adj = {};
  for (let i = 0; i < nodes.length; i++) adj[i] = [];
  for (let i = 0; i < edges.length; i++) {
    const e = edges[i];
    adj[e.from].push({ to: e.to, cost: e.cost });
    adj[e.to].push({ to: e.from, cost: e.cost });
  }
  const dist = {}; const prev = {};
  for (let i = 0; i < nodes.length; i++) dist[i] = Infinity;
  dist[s] = 0;
  const visited = {};
  while (true) {
    let u = -1; let best = Infinity;
    for (let i = 0; i < nodes.length; i++) {
      if (!visited[i] && dist[i] < best) { best = dist[i]; u = i; }
    }
    if (u === -1) break;
    visited[u] = true;
    if (u === t) break;
    for (let k = 0; k < adj[u].length; k++) {
      const v = adj[u][k].to; const nd = dist[u] + adj[u][k].cost;
      if (nd < dist[v]) { dist[v] = nd; prev[v] = u; }
    }
  }
  const path = [];
  let cur = t;
  while (cur !== undefined && cur !== s) { path.unshift(cur); cur = prev[cur]; }
  if (cur === s) path.unshift(s);
  return { cost: dist[t], path };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ShortestRouteScene — INTRINSIC
// Learner sees a map with nodes + labeled edge distances. They click nodes in
// sequence to DRAW a path from Start to End. Running total updates as they click.
// "Best known" distance is shown; beating it wins the round. The act of
// clicking IS the addition. Try, Reset, try again.
// ═══════════════════════════════════════════════════════════════════════════════
class ShortestRouteScene extends Phaser.Scene {
  constructor() { super('ShortestRouteScene'); }
  create() {
    this.W = this.scale.width; this.H = this.scale.height;
    this.round = 0; this.lives = MAX_LIVES;
    this._bg(); this._ui();
    this.hero = addCharacter(this, this.W * 0.88, this.H * 0.55, 0.8);
    this.startRound();
  }
  _bg() { const bg=this.add.image(this.W/2,this.H/2,'bg');bg.setScale(Math.max(this.W/bg.width,this.H/bg.height));this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.65); }
  _ui() {
    this.scoreLbl = this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);
    this.hg = this.add.group(); this._rh();
    this.dg = this.add.group(); this._rd();
  }
  _rh() { this.hg.clear(true,true);for(let i=0;i<this.lives;i++)this.hg.add(this.add.text(14+i*22,14,'\\u2665',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dg.clear(true,true);for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  startRound() {
    if(this.rg)this.rg.clear(true,true); this.rg=this.add.group();
    const data = generateShortestRouteRound(this.round);
    this.nodes = data.nodes; this.edges = data.edges;
    this.startNode = data.startNode; this.endNode = data.endNode;
    this.currentPath = [this.startNode];
    this.currentTotal = 0;
    // Best-known for this round: start at the actual cheapest path cost × 1.5
    // so learners can beat it easily first try, and the target improves as
    // they replay. We show the true cheapest for the leaderboard feel.
    const cheapest = cheapestPath(this.nodes, this.edges, this.startNode, this.endNode).cost;
    this.bestKnown = Math.round(cheapest * 1.4);
    this.trueCheapest = cheapest;
    this._rd();

    const W = this.W, H = this.H;
    // Prompt at top
    this.rg.add(this.add.text(W/2, H*0.05,
      'Click nodes to draw a path from Start to End. Beat the best!',
      {fontSize:'14px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}
    ).setOrigin(0.5).setDepth(6));

    // Running total + best-known display
    this.totalLbl = this.add.text(W * 0.20, H * 0.93, 'Your total: 0',
      {fontSize:'16px',color:COL_PRIMARY,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}
    ).setOrigin(0, 0.5).setDepth(10);
    this.rg.add(this.totalLbl);
    this.bestLbl = this.add.text(W * 0.55, H * 0.93, 'Best to beat: ' + this.bestKnown,
      {fontSize:'14px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui"}
    ).setOrigin(0, 0.5).setDepth(10);
    this.rg.add(this.bestLbl);

    // Reset button
    const self = this;
    const rst = this.add.rectangle(W * 0.15, H * 0.10, 70, 28, hexToNum(COL_DANGER), 0.3)
      .setInteractive({useHandCursor:true}).setDepth(9);
    this.rg.add(rst);
    this.rg.add(this.add.text(W * 0.15, H * 0.10, 'Reset',
      {fontSize:'11px',color:COL_DANGER,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}
    ).setOrigin(0.5).setDepth(10));
    rst.on('pointerdown', function(){ self._reset(); });

    // Draw edges first (under nodes)
    this.edgeGfx = [];
    this.edges.forEach(function(e, idx) {
      const a = self.nodes[e.from]; const b = self.nodes[e.to];
      const ax = a.x * W, ay = a.y * H, bx = b.x * W, by = b.y * H;
      const mx = (ax+bx)/2, my = (ay+by)/2;
      const len = Math.sqrt((bx-ax)*(bx-ax)+(by-ay)*(by-ay));
      const angle = Math.atan2(by-ay, bx-ax);
      const line = self.add.rectangle(mx, my, len, 3, hexToNum(COL_SECONDARY), 0.35)
        .setDepth(4).setRotation(angle);
      self.rg.add(line);
      // Cost label — always visible, that's the whole point
      const lbl = self.add.text(mx, my - 12, String(e.cost),
        {fontSize:'12px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold',backgroundColor:'#00000088',padding:{x:3,y:1}}
      ).setOrigin(0.5).setDepth(5);
      self.rg.add(lbl);
      self.edgeGfx.push({ line: line, idx: idx, highlighted: false });
    });

    // Draw nodes as clickable
    this.nodeGfx = [];
    this.nodes.forEach(function(n, i) {
      const x = n.x * W, y = n.y * H;
      const isStart = i === self.startNode, isEnd = i === self.endNode;
      const col = isStart ? COL_ACCENT : isEnd ? COL_DANGER : COL_PRIMARY;
      const circle = self.add.circle(x, y, 16, hexToNum(col))
        .setInteractive({useHandCursor:true}).setDepth(7);
      const label = isStart ? 'S' : isEnd ? 'E' : String(i);
      const lbl = self.add.text(x, y, label,
        {fontSize:'13px',color:'#fff',fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}
      ).setOrigin(0.5).setDepth(8);
      self.rg.add(circle); self.rg.add(lbl);
      self.nodeGfx.push({ circle: circle, idx: i });
      circle.on('pointerdown', function(){ self._clickNode(i); });
    });
    // Highlight the start node as already in path
    this.nodeGfx[this.startNode].circle.setStrokeStyle(3, hexToNum('#ffffff'));
    // Live path-draw graphics
    this.pathLines = [];
  }

  _reset() {
    this.currentPath = [this.startNode];
    this.currentTotal = 0;
    this.totalLbl.setText('Your total: 0').setColor(COL_PRIMARY);
    if (this.pathLines) { this.pathLines.forEach(function(l){l.destroy();}); this.pathLines = []; }
    // Clear stroke from nodes, re-highlight start
    const self = this;
    this.nodeGfx.forEach(function(ng){ ng.circle.setStrokeStyle(0); });
    this.nodeGfx[this.startNode].circle.setStrokeStyle(3, hexToNum('#ffffff'));
  }

  _clickNode(i) {
    const last = this.currentPath[this.currentPath.length - 1];
    if (i === last) return;
    // Find an edge between last and i
    const edge = this.edges.find(function(e){
      return (e.from === last && e.to === i) || (e.from === i && e.to === last);
    });
    if (!edge) {
      // No direct edge — brief visual feedback
      this.cameras.main.shake(80, 0.003);
      return;
    }
    // Draw the segment
    const a = this.nodes[last], b = this.nodes[i];
    const ax = a.x * this.W, ay = a.y * this.H, bx = b.x * this.W, by = b.y * this.H;
    const mx = (ax+bx)/2, my = (ay+by)/2;
    const len = Math.sqrt((bx-ax)*(bx-ax)+(by-ay)*(by-ay));
    const angle = Math.atan2(by-ay, bx-ax);
    const line = this.add.rectangle(mx, my, len, 5, hexToNum(COL_ACCENT), 0.85)
      .setDepth(6).setRotation(angle);
    this.rg.add(line); this.pathLines.push(line);
    this.currentPath.push(i);
    this.currentTotal += edge.cost;
    this.totalLbl.setText('Your total: ' + this.currentTotal);
    this.nodeGfx[i].circle.setStrokeStyle(3, hexToNum('#ffffff'));
    // Auto-detect: reached end?
    if (i === this.endNode) this._onComplete();
  }

  _onComplete() {
    const W = this.W, H = this.H;
    const beat = this.currentTotal <= this.bestKnown;
    const msg = beat
      ? 'You beat the best! ' + this.currentTotal + ' ≤ ' + this.bestKnown
      : 'Reached End at ' + this.currentTotal + '. Try shorter — best is ' + this.bestKnown;
    if (beat) {
      this.totalLbl.setColor(COL_ACCENT);
      this.cameras.main.flash(150, 34, 197, 94);
      heroCheer(this, this.hero);
      gameScore += 10 * (this.round + 1);
      this.scoreLbl.setText('Score: ' + gameScore);
      this._showSolutionCard(msg, true);
    } else {
      this.totalLbl.setColor(COL_DANGER);
      heroShake(this, this.hero);
      this.lives--; this._rh();
      if (this.lives <= 0) {
        this.time.delayedCall(700, () => this.scene.start('LoseScene', {score: gameScore}));
      } else {
        // Let them try again — reset, don't advance round
        const self = this;
        this.time.delayedCall(1200, function(){ self._reset(); self.totalLbl.setColor(COL_PRIMARY); });
      }
    }
  }

  _showSolutionCard(msg, advance) {
    const W = this.W, H = this.H;
    const backdrop = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.6).setDepth(50);
    const card = this.add.rectangle(W/2, H*0.5, W - 60, 220, 0x18181b, 1)
      .setStrokeStyle(2, hexToNum(COL_ACCENT)).setDepth(51);
    const h1 = this.add.text(W/2, H*0.5 - 70, 'Path complete!',
      {fontSize:'20px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}
    ).setOrigin(0.5).setDepth(52);
    const body = this.add.text(W/2, H*0.5 - 20, msg,
      {fontSize:'14px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",align:'center',wordWrap:{width: W-120}}
    ).setOrigin(0.5).setDepth(52);
    const cheapestMsg = 'True shortest on this map: ' + this.trueCheapest;
    const body2 = this.add.text(W/2, H*0.5 + 20, cheapestMsg,
      {fontSize:'12px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.6}
    ).setOrigin(0.5).setDepth(52);
    const nextLabel = this.round + 1 >= TOTAL_ROUNDS ? 'Finish!' : 'Got it! Next round →';
    const nextBg = this.add.rectangle(W/2, H*0.5 + 70, 220, 42, hexToNum(COL_ACCENT), 1)
      .setInteractive({useHandCursor:true}).setDepth(52);
    const nextLbl = this.add.text(W/2, H*0.5 + 70, nextLabel,
      {fontSize:'14px',color:'#000',fontFamily:"'Lexend', system-ui",fontStyle:'bold'}
    ).setOrigin(0.5).setDepth(53);
    const self = this;
    nextBg.on('pointerdown', function(){
      [backdrop, card, h1, body, body2, nextBg, nextLbl].forEach(function(o){o.destroy();});
      if (advance) {
        self.round++;
        if (self.round >= TOTAL_ROUNDS) self.scene.start('VictoryScene', {score: gameScore});
        else self.startRound();
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MapBuilderScene — INTRINSIC
// Same clickable map. A budget is set. A required waypoint is marked. Running
// total meter: green under budget, red over. When the learner reaches End
// with a valid path (includes waypoint, under budget), the path locks.
// ═══════════════════════════════════════════════════════════════════════════════
class MapBuilderScene extends Phaser.Scene {
  constructor() { super('MapBuilderScene'); }
  create() {
    this.W = this.scale.width; this.H = this.scale.height;
    this.round = 0; this.lives = MAX_LIVES;
    this._bg(); this._ui();
    this.hero = addCharacter(this, this.W * 0.88, this.H * 0.55, 0.8);
    this.startRound();
  }
  _bg() { const bg=this.add.image(this.W/2,this.H/2,'bg');bg.setScale(Math.max(this.W/bg.width,this.H/bg.height));this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.65); }
  _ui() {
    this.scoreLbl = this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);
    this.hg = this.add.group(); this._rh();
    this.dg = this.add.group(); this._rd();
  }
  _rh() { this.hg.clear(true,true);for(let i=0;i<this.lives;i++)this.hg.add(this.add.text(14+i*22,14,'\\u2665',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dg.clear(true,true);for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  startRound() {
    if(this.rg)this.rg.clear(true,true); this.rg=this.add.group();
    const data = generateMapBuilderRound(this.round);
    this.nodes = data.nodes; this.edges = data.edges;
    this.startNode = data.startNode; this.endNode = data.endNode;
    this.requiredNode = data.requiredNode;
    this.budget = data.budget;
    this.currentPath = [this.startNode];
    this.currentTotal = 0;
    this.locked = false;
    this._rd();

    const W = this.W, H = this.H;
    this.rg.add(this.add.text(W/2, H*0.05,
      'Reach End via the star node. Stay under budget: ' + this.budget,
      {fontSize:'14px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}
    ).setOrigin(0.5).setDepth(6));

    // Budget meter (live)
    this.meterBg = this.add.rectangle(W/2, H*0.90, W*0.5, 14, hexToNum(COL_SECONDARY), 0.3).setDepth(9);
    this.rg.add(this.meterBg);
    this.meterFill = this.add.rectangle(W/2 - (W*0.5)/2, H*0.90, 1, 14, hexToNum(COL_ACCENT), 0.9)
      .setOrigin(0, 0.5).setDepth(10);
    this.rg.add(this.meterFill);
    this.costLbl = this.add.text(W/2, H*0.95, '0 / ' + this.budget,
      {fontSize:'13px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}
    ).setOrigin(0.5).setDepth(11);
    this.rg.add(this.costLbl);

    // Reset
    const self = this;
    const rst = this.add.rectangle(W * 0.15, H * 0.10, 70, 28, hexToNum(COL_DANGER), 0.3)
      .setInteractive({useHandCursor:true}).setDepth(9);
    this.rg.add(rst);
    this.rg.add(this.add.text(W * 0.15, H * 0.10, 'Reset',
      {fontSize:'11px',color:COL_DANGER,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}
    ).setOrigin(0.5).setDepth(10));
    rst.on('pointerdown', function(){ self._reset(); });

    // Edges
    this.edges.forEach(function(e) {
      const a = self.nodes[e.from], b = self.nodes[e.to];
      const ax = a.x * W, ay = a.y * H, bx = b.x * W, by = b.y * H;
      const mx = (ax+bx)/2, my = (ay+by)/2;
      const len = Math.sqrt((bx-ax)*(bx-ax)+(by-ay)*(by-ay));
      const angle = Math.atan2(by-ay, bx-ax);
      self.rg.add(self.add.rectangle(mx, my, len, 3, hexToNum(COL_SECONDARY), 0.35)
        .setDepth(4).setRotation(angle));
      self.rg.add(self.add.text(mx, my - 12, String(e.cost),
        {fontSize:'12px',color:COL_TEXT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold',backgroundColor:'#00000088',padding:{x:3,y:1}}
      ).setOrigin(0.5).setDepth(5));
    });

    // Nodes
    this.nodeGfx = [];
    this.nodes.forEach(function(n, i) {
      const x = n.x * W, y = n.y * H;
      const isStart = i === self.startNode, isEnd = i === self.endNode, isReq = i === self.requiredNode;
      const col = isStart ? COL_ACCENT : isEnd ? COL_DANGER : isReq ? '#fbbf24' : COL_PRIMARY;
      const circle = self.add.circle(x, y, 16, hexToNum(col))
        .setInteractive({useHandCursor:true}).setDepth(7);
      const label = isStart ? 'S' : isEnd ? 'E' : isReq ? '★' : String(i);
      const lbl = self.add.text(x, y, label,
        {fontSize:'13px',color:'#fff',fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}
      ).setOrigin(0.5).setDepth(8);
      self.rg.add(circle); self.rg.add(lbl);
      self.nodeGfx.push({ circle: circle, idx: i });
      circle.on('pointerdown', function(){ self._clickNode(i); });
    });
    this.nodeGfx[this.startNode].circle.setStrokeStyle(3, hexToNum('#ffffff'));
    this.pathLines = [];
  }

  _reset() {
    if (this.locked) return;
    this.currentPath = [this.startNode];
    this.currentTotal = 0;
    this._updateMeter();
    if (this.pathLines) { this.pathLines.forEach(function(l){l.destroy();}); this.pathLines = []; }
    this.nodeGfx.forEach(function(ng){ ng.circle.setStrokeStyle(0); });
    this.nodeGfx[this.startNode].circle.setStrokeStyle(3, hexToNum('#ffffff'));
  }

  _updateMeter() {
    const W = this.W;
    const meterW = W * 0.5;
    const pct = Math.min(this.currentTotal / this.budget, 1);
    const over = this.currentTotal > this.budget;
    this.meterFill.width = Math.max(1, meterW * pct);
    this.meterFill.x = W/2 - meterW/2;
    this.meterFill.fillColor = hexToNum(over ? COL_DANGER : COL_ACCENT);
    this.costLbl.setText(this.currentTotal + ' / ' + this.budget);
    this.costLbl.setColor(over ? COL_DANGER : COL_TEXT);
  }

  _clickNode(i) {
    if (this.locked) return;
    const last = this.currentPath[this.currentPath.length - 1];
    if (i === last) return;
    const edge = this.edges.find(function(e){
      return (e.from === last && e.to === i) || (e.from === i && e.to === last);
    });
    if (!edge) { this.cameras.main.shake(80, 0.003); return; }
    const a = this.nodes[last], b = this.nodes[i];
    const ax = a.x * this.W, ay = a.y * this.H, bx = b.x * this.W, by = b.y * this.H;
    const mx = (ax+bx)/2, my = (ay+by)/2;
    const len = Math.sqrt((bx-ax)*(bx-ax)+(by-ay)*(by-ay));
    const angle = Math.atan2(by-ay, bx-ax);
    const line = this.add.rectangle(mx, my, len, 5, hexToNum(COL_ACCENT), 0.85)
      .setDepth(6).setRotation(angle);
    this.rg.add(line); this.pathLines.push(line);
    this.currentPath.push(i);
    this.currentTotal += edge.cost;
    this.nodeGfx[i].circle.setStrokeStyle(3, hexToNum('#ffffff'));
    this._updateMeter();
    // Reached end?
    if (i === this.endNode) this._checkLock();
  }

  _checkLock() {
    const includesReq = this.currentPath.indexOf(this.requiredNode) >= 0;
    const underBudget = this.currentTotal <= this.budget;
    if (includesReq && underBudget) {
      this.locked = true;
      this.pathLines.forEach(function(l){ l.fillColor = hexToNum(COL_ACCENT); });
      this.cameras.main.flash(150, 34, 197, 94);
      heroCheer(this, this.hero);
      gameScore += 10 * (this.round + 1);
      this.scoreLbl.setText('Score: ' + gameScore);
      this._showSolutionCard('Locked! Total: ' + this.currentTotal + ' / ' + this.budget + (includesReq ? ' (★ included)' : ''));
    } else {
      heroShake(this, this.hero);
      this.lives--; this._rh();
      const reason = !includesReq ? 'Missed the ★ waypoint!' : 'Over budget: ' + this.currentTotal + ' > ' + this.budget;
      if (this.lives <= 0) {
        this.time.delayedCall(700, () => this.scene.start('LoseScene', {score: gameScore}));
      } else {
        const self = this;
        const msg = this.add.text(this.W/2, this.H * 0.85, reason,
          {fontSize:'13px',color:COL_DANGER,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}
        ).setOrigin(0.5).setDepth(20);
        this.rg.add(msg);
        this.time.delayedCall(1400, function(){ msg.destroy(); self._reset(); });
      }
    }
  }

  _showSolutionCard(msg) {
    const W = this.W, H = this.H;
    const backdrop = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.6).setDepth(50);
    const card = this.add.rectangle(W/2, H*0.5, W - 60, 200, 0x18181b, 1)
      .setStrokeStyle(2, hexToNum(COL_ACCENT)).setDepth(51);
    const h1 = this.add.text(W/2, H*0.5 - 60, 'Path valid!',
      {fontSize:'20px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}
    ).setOrigin(0.5).setDepth(52);
    const body = this.add.text(W/2, H*0.5 - 10, msg,
      {fontSize:'14px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",align:'center',wordWrap:{width: W-120}}
    ).setOrigin(0.5).setDepth(52);
    const nextLabel = this.round + 1 >= TOTAL_ROUNDS ? 'Finish!' : 'Got it! Next round →';
    const nextBg = this.add.rectangle(W/2, H*0.5 + 60, 220, 42, hexToNum(COL_ACCENT), 1)
      .setInteractive({useHandCursor:true}).setDepth(52);
    const nextLbl = this.add.text(W/2, H*0.5 + 60, nextLabel,
      {fontSize:'14px',color:'#000',fontFamily:"'Lexend', system-ui",fontStyle:'bold'}
    ).setOrigin(0.5).setDepth(53);
    const self = this;
    nextBg.on('pointerdown', function(){
      [backdrop, card, h1, body, nextBg, nextLbl].forEach(function(o){o.destroy();});
      self.round++;
      if (self.round >= TOTAL_ROUNDS) self.scene.start('VictoryScene', {score: gameScore});
      else self.startRound();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DeliveryRunScene — INTRINSIC
// All stops shown. Player clicks stops in chosen order. A line draws as they
// go and the running total distance updates live. Personal best is tracked
// across attempts within the round. Completing a route that beats the TSP-ish
// threshold wins. Discovery through trying different orders.
// ═══════════════════════════════════════════════════════════════════════════════
class DeliveryRunScene extends Phaser.Scene {
  constructor() { super('DeliveryRunScene'); }
  create() {
    this.W = this.scale.width; this.H = this.scale.height;
    this.round = 0; this.lives = MAX_LIVES;
    this._bg(); this._ui();
    this.hero = addCharacter(this, this.W * 0.88, this.H * 0.55, 0.8);
    this.startRound();
  }
  _bg() { const bg=this.add.image(this.W/2,this.H/2,'bg');bg.setScale(Math.max(this.W/bg.width,this.H/bg.height));this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.65); }
  _ui() {
    this.scoreLbl = this.add.text(this.W-14,14,'Score: 0',{fontSize:'16px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}).setOrigin(1,0).setDepth(10);
    this.hg = this.add.group(); this._rh();
    this.dg = this.add.group(); this._rd();
  }
  _rh() { this.hg.clear(true,true);for(let i=0;i<this.lives;i++)this.hg.add(this.add.text(14+i*22,14,'\\u2665',{fontSize:'18px',color:COL_DANGER}).setDepth(10)); }
  _rd() { this.dg.clear(true,true);for(let i=0;i<TOTAL_ROUNDS;i++){const c=i<this.round?COL_ACCENT:i===this.round?COL_PRIMARY:'#555555';this.dg.add(this.add.circle(this.W/2-40+i*20,this.H-16,5,hexToNum(c)).setDepth(10));} }

  startRound() {
    if(this.rg)this.rg.clear(true,true); this.rg=this.add.group();
    const data = generateDeliveryRound(this.round);
    this.positions = data.positions;
    this.visitOrder = [];
    this.totalDist = 0;
    if (this.personalBest === undefined) this.personalBest = null;
    // Per-round personal best resets
    this.personalBest = null;
    // Compute optimal (brute force ok for N<=7)
    this.optDist = this._bruteForceOptimal(this.positions);
    this._rd();

    const W = this.W, H = this.H;
    this.rg.add(this.add.text(W/2, H*0.05,
      'Visit every stop. Try different orders to shrink the total!',
      {fontSize:'14px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}
    ).setOrigin(0.5).setDepth(6));

    // Running total
    this.distLbl = this.add.text(W * 0.20, H * 0.93, 'Your total: 0',
      {fontSize:'16px',color:COL_PRIMARY,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}
    ).setOrigin(0, 0.5).setDepth(10);
    this.rg.add(this.distLbl);
    this.bestLbl = this.add.text(W * 0.55, H * 0.93, 'Personal best: —',
      {fontSize:'14px',color:COL_ACCENT,fontFamily:"'Lexend', system-ui"}
    ).setOrigin(0, 0.5).setDepth(10);
    this.rg.add(this.bestLbl);
    this.orderLbl = this.add.text(W/2, H * 0.11, 'Order: —',
      {fontSize:'11px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",alpha:0.6}
    ).setOrigin(0.5).setDepth(6);
    this.rg.add(this.orderLbl);

    // Reset
    const self = this;
    const rst = this.add.rectangle(W * 0.15, H * 0.11, 70, 28, hexToNum(COL_DANGER), 0.3)
      .setInteractive({useHandCursor:true}).setDepth(9);
    this.rg.add(rst);
    this.rg.add(this.add.text(W * 0.15, H * 0.11, 'Reset',
      {fontSize:'11px',color:COL_DANGER,fontFamily:"'Lexend', system-ui",fontStyle:'bold'}
    ).setOrigin(0.5).setDepth(10));
    rst.on('pointerdown', function(){ self._reset(); });

    // Stops
    this.stopBtns = [];
    this.positions.forEach(function(p, i) {
      const x = p.x * W, y = p.y * H;
      const circle = self.add.circle(x, y, 18, hexToNum(COL_PRIMARY))
        .setInteractive({useHandCursor:true}).setDepth(7);
      const lbl = self.add.text(x, y, p.label,
        {fontSize:'14px',color:'#fff',fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}
      ).setOrigin(0.5).setDepth(8);
      self.rg.add(circle); self.rg.add(lbl);
      self.stopBtns.push({ circle: circle, visited: false, idx: i });
      circle.on('pointerdown', function(){ self._visitStop(i); });
    });
    this.lines = [];
  }

  _reset() {
    this.visitOrder = [];
    this.totalDist = 0;
    this.distLbl.setText('Your total: 0').setColor(COL_PRIMARY);
    this.orderLbl.setText('Order: —');
    this.stopBtns.forEach(function(s){ s.visited = false; s.circle.setFillStyle(hexToNum(COL_PRIMARY)); });
    if (this.lines) { this.lines.forEach(function(l){l.destroy();}); this.lines = []; }
  }

  _visitStop(idx) {
    const btn = this.stopBtns[idx];
    if (btn.visited) return;
    btn.visited = true;
    btn.circle.setFillStyle(hexToNum(COL_ACCENT));
    if (this.visitOrder.length > 0) {
      const prev = this.positions[this.visitOrder[this.visitOrder.length - 1]];
      const cur = this.positions[idx];
      const d = dist2d(prev, cur);
      this.totalDist += d;
      const ax = prev.x * this.W, ay = prev.y * this.H;
      const bx = cur.x * this.W, by = cur.y * this.H;
      const mx = (ax+bx)/2, my = (ay+by)/2;
      const len = Math.sqrt((bx-ax)*(bx-ax)+(by-ay)*(by-ay));
      const angle = Math.atan2(by-ay, bx-ax);
      const line = this.add.rectangle(mx, my, len, 3, hexToNum(COL_ACCENT), 0.7).setDepth(5).setRotation(angle);
      this.rg.add(line); this.lines.push(line);
    }
    this.visitOrder.push(idx);
    this.distLbl.setText('Your total: ' + this.totalDist);
    const self = this;
    this.orderLbl.setText('Order: ' + this.visitOrder.map(function(i){return self.positions[i].label;}).join(' → '));
    if (this.visitOrder.length >= this.positions.length) this._onComplete();
  }

  _onComplete() {
    // Update personal best
    const firstAttempt = this.personalBest === null;
    const improved = firstAttempt || this.totalDist < this.personalBest;
    if (improved) {
      this.personalBest = this.totalDist;
      this.bestLbl.setText('Personal best: ' + this.personalBest);
    }
    // Win condition: within 1.3× optimal OR beats previous best on a retry
    const withinThreshold = this.totalDist <= Math.round(this.optDist * 1.3);
    if (withinThreshold) {
      this.cameras.main.flash(150, 34, 197, 94);
      heroCheer(this, this.hero);
      gameScore += 10 * (this.round + 1);
      this.scoreLbl.setText('Score: ' + gameScore);
      const msg = 'Total: ' + this.totalDist + '   Best possible: ' + this.optDist;
      this._showSolutionCard(msg, true);
    } else {
      heroShake(this, this.hero);
      this.lives--; this._rh();
      if (this.lives <= 0) {
        this.time.delayedCall(700, () => this.scene.start('LoseScene', {score: gameScore}));
      } else {
        const self = this;
        const msg = this.add.text(this.W/2, this.H * 0.85,
          'Too long (' + this.totalDist + '). Best possible: ' + this.optDist + '. Try another order!',
          {fontSize:'12px',color:COL_DANGER,fontFamily:"'Lexend', system-ui",fontStyle:'bold',align:'center',wordWrap:{width:self.W-80}}
        ).setOrigin(0.5).setDepth(20);
        this.rg.add(msg);
        this.time.delayedCall(1600, function(){ msg.destroy(); self._reset(); });
      }
    }
  }

  _showSolutionCard(msg, advance) {
    const W = this.W, H = this.H;
    const backdrop = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.6).setDepth(50);
    const card = this.add.rectangle(W/2, H*0.5, W - 60, 200, 0x18181b, 1)
      .setStrokeStyle(2, hexToNum(COL_ACCENT)).setDepth(51);
    const h1 = this.add.text(W/2, H*0.5 - 60, 'Delivery complete!',
      {fontSize:'20px',color:COL_ACCENT,fontFamily:"'Space Grotesk', sans-serif",fontStyle:'bold'}
    ).setOrigin(0.5).setDepth(52);
    const body = this.add.text(W/2, H*0.5 - 10, msg,
      {fontSize:'14px',color:COL_TEXT,fontFamily:"'Lexend', system-ui",align:'center',wordWrap:{width: W-120}}
    ).setOrigin(0.5).setDepth(52);
    const nextLabel = this.round + 1 >= TOTAL_ROUNDS ? 'Finish!' : 'Got it! Next round →';
    const nextBg = this.add.rectangle(W/2, H*0.5 + 60, 220, 42, hexToNum(COL_ACCENT), 1)
      .setInteractive({useHandCursor:true}).setDepth(52);
    const nextLbl = this.add.text(W/2, H*0.5 + 60, nextLabel,
      {fontSize:'14px',color:'#000',fontFamily:"'Lexend', system-ui",fontStyle:'bold'}
    ).setOrigin(0.5).setDepth(53);
    const self = this;
    nextBg.on('pointerdown', function(){
      [backdrop, card, h1, body, nextBg, nextLbl].forEach(function(o){o.destroy();});
      if (advance) {
        self.round++;
        if (self.round >= TOTAL_ROUNDS) self.scene.start('VictoryScene', {score: gameScore});
        else self.startRound();
      }
    });
  }

  _bruteForceOptimal(positions) {
    const n = positions.length;
    if (n <= 1) return 0;
    const arr = [];
    for (let i = 0; i < n; i++) arr.push(i);
    let best = Infinity;
    const permute = function(a, l, r) {
      if (l === r) {
        let d = 0;
        for (let i = 1; i < a.length; i++) d += dist2d(positions[a[i-1]], positions[a[i]]);
        if (d < best) best = d;
        return;
      }
      for (let i = l; i <= r; i++) {
        const t = a[l]; a[l] = a[i]; a[i] = t;
        permute(a, l + 1, r);
        const t2 = a[l]; a[l] = a[i]; a[i] = t2;
      }
    };
    permute(arr, 0, n - 1);
    return best;
  }
}
`
