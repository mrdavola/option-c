// Classic Game Overlays — Phaser engine with 6 game options.
// Math: AI_ROUNDS provide prompts + answers. Classic arcade mechanics as interaction shells.
// Options: snake-math, maze-runner-math, falling-blocks-math, dot-eater-math, launcher-math, breakout-math

import type { ThemeConfig, MathParams, GameOption } from "./engine-types"
import { phaserGame } from "./base-phaser-template"
import { getOptionDef } from "./game-option-registry"

export function classicOverlaysPhaserEngine(
  config: ThemeConfig,
  math: MathParams,
  option: GameOption = "snake-math"
): string {
  const validOptions = [
    "snake-math", "maze-runner-math", "falling-blocks-math",
    "dot-eater-math", "launcher-math", "breakout-math"
  ]
  const activeOption = validOptions.includes(option) ? option : "snake-math"

  const optDef = getOptionDef(activeOption)

  const sceneMap: Record<string, string> = {
    "snake-math": "SnakeMathScene",
    "maze-runner-math": "MazeRunnerScene",
    "falling-blocks-math": "FallingBlocksScene",
    "dot-eater-math": "DotEaterScene",
    "launcher-math": "LauncherMathScene",
    "breakout-math": "BreakoutMathScene",
  }

  return phaserGame({
    config,
    math,
    option: activeOption,
    sceneName: sceneMap[activeOption],
    introText: optDef?.introText || "Use classic arcade skills to solve math!",
    helpText: optDef?.helpText || "Solve math problems using arcade mechanics.",
    gameSceneCode: GAME_SCENES,
  })
}

// ─── All 6 Game Scenes ──────────────────────────────────────────────────────
const GAME_SCENES = `

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function buildBg(scene) {
  const W = scene.scale.width, H = scene.scale.height;
  const bg = scene.add.image(W / 2, H / 2, 'bg');
  bg.setScale(Math.max(W / bg.width, H / bg.height));
  scene.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.65);
}

function buildHUD(scene) {
  const W = scene.scale.width, pad = 14;
  scene.scoreLbl = scene.add.text(W - pad, pad, 'Score: 0', {
    fontSize: '16px', color: COL_ACCENT, fontFamily: "'Lexend', system-ui", fontStyle: 'bold'
  }).setOrigin(1, 0).setDepth(50);
  scene.heartsGroup = scene.add.group();
  redrawHearts(scene);
  scene.dotGroup = scene.add.group();
  redrawDots(scene);
}

function redrawHearts(scene) {
  scene.heartsGroup.clear(true, true);
  for (var i = 0; i < MAX_LIVES; i++) {
    var col = i < scene.lives ? COL_DANGER : '#444';
    scene.heartsGroup.add(scene.add.text(14 + i * 22, 14, '\\u2665', {
      fontSize: '18px', color: col, fontFamily: 'system-ui'
    }).setDepth(50));
  }
}

function redrawDots(scene) {
  if (!scene.dotGroup) return;
  scene.dotGroup.clear(true, true);
  var dotW = 12, gap = 6;
  var total = (dotW + gap) * TOTAL_ROUNDS - gap;
  var startX = scene.scale.width / 2 - total / 2;
  for (var i = 0; i < TOTAL_ROUNDS; i++) {
    var c = i < scene.round ? hexToNum(COL_ACCENT) : i === scene.round ? hexToNum(COL_PRIMARY) : 0x444444;
    scene.dotGroup.add(scene.add.circle(startX + i * (dotW + gap), scene.scale.height - 18, dotW / 2, c, 1).setDepth(50));
  }
}

function showPrompt(scene, text) {
  if (scene.promptLbl) scene.promptLbl.destroy();
  scene.promptLbl = scene.add.text(scene.scale.width / 2, 46, text, {
    fontSize: '16px', color: COL_ACCENT, fontFamily: "'Lexend', system-ui", fontStyle: 'bold',
    align: 'center', wordWrap: { width: scene.scale.width - 100 },
    stroke: '#000', strokeThickness: 3
  }).setOrigin(0.5, 0).setDepth(50);
  scene.promptLbl.setScale(0.5).setAlpha(0);
  scene.tweens.add({ targets: scene.promptLbl, scale: 1, alpha: 1, duration: 300, ease: 'Back.easeOut' });
}

function loseLife(scene) {
  scene.lives--;
  redrawHearts(scene);
  scene._screenShake(0.02);
  heroShake(scene, scene.hero);
  if (scene.lives <= 0) {
    scene.time.delayedCall(600, function() {
      scene.scene.start('LoseScene', { score: gameScore });
    });
    return true;
  }
  return false;
}

function winRound(scene) {
  gameScore += 100;
  scene.scoreLbl.setText('Score: ' + gameScore);
  heroCheer(scene, scene.hero);
  scene._burstParticles(scene.hero ? scene.hero.x : scene.scale.width / 2, scene.hero ? scene.hero.y : scene.scale.height / 2, 20);
  scene._showScorePop('+100');
  scene.round++;
  redrawDots(scene);
  if (scene.round >= TOTAL_ROUNDS) {
    scene.time.delayedCall(800, function() {
      scene.scene.start('VictoryScene', { score: gameScore });
    });
    return true;
  }
  return false;
}


// ═══════════════════════════════════════════════════════════════════════════════
// OPTION 1: SNAKE MATH
// Grid crawler moves continuously. Steer to eat the correct answer.
// ═══════════════════════════════════════════════════════════════════════════════
class SnakeMathScene extends Phaser.Scene {
  constructor() { super('SnakeMathScene'); }

  create() {
    var W = this.scale.width, H = this.scale.height;
    this.W = W; this.H = H;
    this.round = 0; this.lives = MAX_LIVES;
    gameScore = 0;

    buildBg(this);
    buildHUD(this);

    // Grid setup
    this.cellSize = Math.floor(Math.min(W, H - 120) / 18);
    this.gridCols = Math.floor((W - 20) / this.cellSize);
    this.gridRows = Math.floor((H - 120) / this.cellSize);
    this.offsetX = Math.floor((W - this.gridCols * this.cellSize) / 2);
    this.offsetY = 75;

    // Draw grid border
    var gfx = this.add.graphics().setDepth(1);
    gfx.lineStyle(2, hexToNum(COL_PRIMARY), 0.4);
    gfx.strokeRect(this.offsetX, this.offsetY, this.gridCols * this.cellSize, this.gridRows * this.cellSize);

    // Snake state
    this.snake = [];
    this.direction = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };
    this.snakeGraphics = [];
    this.foodSprites = [];
    this.moveTimer = 0;
    this.moveInterval = 160;
    this.paused = false;

    // Hero (small, follows head)
    this.hero = this.add.image(0, 0, 'character').setScale(0.25).setDepth(25).setAlpha(0);

    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();

    // Touch / mouse swipe
    this.input.on('pointerdown', function(p) { this._swipeStart = { x: p.x, y: p.y }; }, this);
    this.input.on('pointerup', function(p) {
      if (!this._swipeStart) return;
      var dx = p.x - this._swipeStart.x, dy = p.y - this._swipeStart.y;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        this.nextDir = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
      } else {
        this.nextDir = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
      }
    }, this);

    // Touch buttons for mobile
    this._buildTouchControls();

    this.startRound();
  }

  _buildTouchControls() {
    var W = this.W, H = this.H;
    var btnSize = 44, pad = 6;
    var cx = W / 2, cy = H - 50;
    var self = this;
    var arrows = [
      { label: '\\u25B2', dx: 0, dy: -1, x: cx, y: cy - btnSize - pad },
      { label: '\\u25BC', dx: 0, dy: 1, x: cx, y: cy + pad },
      { label: '\\u25C0', dx: -1, dy: 0, x: cx - btnSize - pad, y: cy - btnSize / 2 },
      { label: '\\u25B6', dx: 1, dy: 0, x: cx + btnSize + pad, y: cy - btnSize / 2 },
    ];
    arrows.forEach(function(a) {
      var bg = self.add.rectangle(a.x, a.y, btnSize, btnSize, hexToNum(COL_PRIMARY), 0.4)
        .setDepth(60).setInteractive({ cursor: 'pointer' });
      self.add.text(a.x, a.y, a.label, {
        fontSize: '20px', color: COL_TEXT, fontFamily: 'system-ui'
      }).setOrigin(0.5).setDepth(61);
      bg.on('pointerdown', function() {
        // Don't allow 180-degree reversal
        if (!(self.direction.x === -a.dx && self.direction.y === -a.dy)) {
          self.nextDir = { x: a.dx, y: a.dy };
        }
      });
    });
  }

  startRound() {
    this.paused = true;
    // Clear old food
    this.foodSprites.forEach(function(f) { f.bg.destroy(); f.lbl.destroy(); });
    this.foodSprites = [];
    // Clear old snake graphics
    this.snakeGraphics.forEach(function(g) { g.destroy(); });
    this.snakeGraphics = [];

    // Init snake at center
    var cx = Math.floor(this.gridCols / 2), cy = Math.floor(this.gridRows / 2);
    this.snake = [{ x: cx, y: cy }, { x: cx - 1, y: cy }, { x: cx - 2, y: cy }];
    this.direction = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };

    var data = getRound(this.round);
    this.roundData = data;
    showPrompt(this, data.prompt);

    // Spawn food items
    this._spawnFood(data);
    this._drawSnake();
    this.moveTimer = 0;

    this.time.delayedCall(500, function() { this.paused = false; }, [], this);
  }

  _spawnFood(data) {
    var self = this;
    var occupied = {};
    this.snake.forEach(function(s) { occupied[s.x + ',' + s.y] = true; });

    var items = data.items.slice();
    items.forEach(function(val) {
      var tries = 0, gx, gy;
      do {
        gx = 1 + Math.floor(Math.random() * (self.gridCols - 2));
        gy = 1 + Math.floor(Math.random() * (self.gridRows - 2));
        tries++;
      } while (occupied[gx + ',' + gy] && tries < 100);
      occupied[gx + ',' + gy] = true;

      var px = self.offsetX + gx * self.cellSize + self.cellSize / 2;
      var py = self.offsetY + gy * self.cellSize + self.cellSize / 2;
      var r = self.cellSize * 0.4;

      var bg = self.add.circle(px, py, r, hexToNum(COL_SECONDARY), 0.9).setDepth(10);
      var lbl = self.add.text(px, py, '' + val, {
        fontSize: Math.max(10, r) + 'px', color: COL_BG, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(11);

      // Spawn animation
      bg.setScale(0); lbl.setScale(0);
      self.tweens.add({ targets: [bg, lbl], scale: 1, duration: 300, ease: 'Back.easeOut', delay: Math.random() * 200 });

      self.foodSprites.push({ gx: gx, gy: gy, val: val, bg: bg, lbl: lbl });
    });
  }

  _drawSnake() {
    this.snakeGraphics.forEach(function(g) { g.destroy(); });
    this.snakeGraphics = [];
    var self = this;
    this.snake.forEach(function(seg, i) {
      var px = self.offsetX + seg.x * self.cellSize + self.cellSize / 2;
      var py = self.offsetY + seg.y * self.cellSize + self.cellSize / 2;
      var r = self.cellSize * 0.4;
      var alpha = 1 - i * 0.08;
      var col = i === 0 ? hexToNum(COL_ACCENT) : hexToNum(COL_PRIMARY);
      var c = self.add.circle(px, py, r, col, Math.max(0.3, alpha)).setDepth(15);
      self.snakeGraphics.push(c);
      if (i === 0) {
        self.hero.setPosition(px, py).setAlpha(0.9);
      }
    });
  }

  update(time, delta) {
    if (this.paused) return;

    // Keyboard input
    if (this.cursors.left.isDown && this.direction.x !== 1) this.nextDir = { x: -1, y: 0 };
    else if (this.cursors.right.isDown && this.direction.x !== -1) this.nextDir = { x: 1, y: 0 };
    else if (this.cursors.up.isDown && this.direction.y !== 1) this.nextDir = { x: 0, y: -1 };
    else if (this.cursors.down.isDown && this.direction.y !== -1) this.nextDir = { x: 0, y: 1 };

    this.moveTimer += delta;
    if (this.moveTimer < this.moveInterval) return;
    this.moveTimer = 0;

    this.direction = { x: this.nextDir.x, y: this.nextDir.y };
    var head = this.snake[0];
    var nx = head.x + this.direction.x;
    var ny = head.y + this.direction.y;

    // Wall collision
    if (nx < 0 || nx >= this.gridCols || ny < 0 || ny >= this.gridRows) {
      this.paused = true;
      if (!loseLife(this)) {
        this.time.delayedCall(800, function() { this.startRound(); }, [], this);
      }
      return;
    }

    // Self collision
    for (var i = 0; i < this.snake.length; i++) {
      if (this.snake[i].x === nx && this.snake[i].y === ny) {
        this.paused = true;
        if (!loseLife(this)) {
          this.time.delayedCall(800, function() { this.startRound(); }, [], this);
        }
        return;
      }
    }

    // Move snake
    this.snake.unshift({ x: nx, y: ny });

    // Check food collision
    var ate = false;
    for (var fi = this.foodSprites.length - 1; fi >= 0; fi--) {
      var food = this.foodSprites[fi];
      if (food.gx === nx && food.gy === ny) {
        ate = true;
        food.bg.destroy(); food.lbl.destroy();
        this.foodSprites.splice(fi, 1);

        if (food.val === this.roundData.target) {
          // Correct answer!
          this.paused = true;
          this._burstParticles(
            this.offsetX + nx * this.cellSize + this.cellSize / 2,
            this.offsetY + ny * this.cellSize + this.cellSize / 2, 15
          );
          var won = winRound(this);
          if (!won) {
            this.time.delayedCall(800, function() { this.startRound(); }, [], this);
          }
        } else {
          // Wrong answer — shrink
          this._screenShake(0.015);
          this._showScorePop('Wrong!', COL_DANGER);
          heroShake(this, this.hero);
          if (this.snake.length > 2) {
            this.snake.pop();
          }
          if (!loseLife(this)) {
            // Continue playing this round
          } else {
            return;
          }
        }
        break;
      }
    }

    if (!ate) {
      this.snake.pop(); // Normal move — remove tail
    }

    this._drawSnake();
  }
}


// ═══════════════════════════════════════════════════════════════════════════════
// OPTION 2: MAZE RUNNER MATH
// Top-down maze. At intersections, paths labeled with values. Pick correct path.
// ═══════════════════════════════════════════════════════════════════════════════
class MazeRunnerScene extends Phaser.Scene {
  constructor() { super('MazeRunnerScene'); }

  create() {
    var W = this.scale.width, H = this.scale.height;
    this.W = W; this.H = H;
    this.round = 0; this.lives = MAX_LIVES;
    gameScore = 0;

    buildBg(this);
    buildHUD(this);

    this.hero = this.add.image(0, 0, 'character').setScale(0.35).setDepth(30);

    this.startRound();
  }

  startRound() {
    // Clean up previous
    if (this.mazeGroup) this.mazeGroup.destroy(true);
    this.mazeGroup = this.add.group();

    var data = getRound(this.round);
    this.roundData = data;
    showPrompt(this, data.prompt);

    // Build a simple branching maze — 3 to 4 decision points leading to exit
    this._buildMaze(data);
  }

  _buildMaze(data) {
    var W = this.W, H = this.H;
    var self = this;
    var target = data.target;
    var items = data.items.slice();

    // Ensure target is in items
    if (items.indexOf(target) === -1) items[0] = target;
    // Shuffle
    for (var i = items.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = items[i]; items[i] = items[j]; items[j] = tmp;
    }

    // Create path layout — player starts at left, exits at right
    // 3 rows of paths with intersections
    var startX = 50, startY = H / 2;
    var endX = W - 50;
    var pathCount = Math.min(items.length, 4);
    var spacing = (H - 200) / (pathCount + 1);
    var segWidth = (endX - startX) / 3;

    // Draw starting corridor
    var corridorY = H / 2;
    this._drawCorridor(startX, corridorY, startX + segWidth * 0.6, corridorY);

    // Place hero at start
    this.hero.setPosition(startX + 20, corridorY);

    // Create junction point
    var junctionX = startX + segWidth * 0.7;

    // Draw paths from junction, each with a value label
    var pathYs = [];
    var usedItems = items.slice(0, pathCount);
    var correctIndex = usedItems.indexOf(target);
    if (correctIndex === -1) {
      usedItems[0] = target;
      correctIndex = 0;
    }

    for (var pi = 0; pi < pathCount; pi++) {
      var py = 120 + spacing * (pi + 0.5);
      pathYs.push(py);

      // Draw vertical connector from junction to this path
      this._drawCorridor(junctionX, corridorY, junctionX, py);
      // Draw horizontal path
      var pathEndX = endX - 30;
      this._drawCorridor(junctionX, py, pathEndX, py);

      // Value label on path
      var labelX = junctionX + (pathEndX - junctionX) * 0.3;
      var isCorrect = (pi === correctIndex);
      var val = usedItems[pi];

      var btnBg = this.add.rectangle(labelX, py, 70, 36, hexToNum(isCorrect ? COL_PRIMARY : COL_SECONDARY), 0.9)
        .setDepth(20).setInteractive({ cursor: 'pointer' });
      var btnLbl = this.add.text(labelX, py, '' + val, {
        fontSize: '18px', color: isCorrect ? '#fff' : COL_BG, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(21);

      self.mazeGroup.add(btnBg);
      self.mazeGroup.add(btnLbl);

      // Entrance animation
      btnBg.setScale(0); btnLbl.setScale(0);
      this.tweens.add({ targets: [btnBg, btnLbl], scale: 1, duration: 400, ease: 'Back.easeOut', delay: 100 * pi });

      if (isCorrect) {
        // Draw exit door at end
        var door = this.add.rectangle(pathEndX + 15, py, 20, 36, hexToNum(COL_ACCENT), 0.8).setDepth(19);
        this.add.text(pathEndX + 15, py, '\\u2714', { fontSize: '16px', color: '#fff' }).setOrigin(0.5).setDepth(20);
        self.mazeGroup.add(door);
      } else {
        // Dead end wall
        var wall = this.add.rectangle(pathEndX + 15, py, 20, 36, hexToNum(COL_DANGER), 0.5).setDepth(19);
        self.mazeGroup.add(wall);
      }

      // Click handler
      (function(pathY, correct, value, bg) {
        bg.on('pointerdown', function() {
          self._choosePath(pathY, correct, value);
        });
        bg.on('pointerover', function() { bg.setAlpha(0.7); });
        bg.on('pointerout', function() { bg.setAlpha(1); });
      })(py, isCorrect, val, btnBg);
    }
  }

  _drawCorridor(x1, y1, x2, y2) {
    var gfx = this.add.graphics().setDepth(5);
    gfx.lineStyle(24, hexToNum(COL_PRIMARY), 0.2);
    gfx.lineBetween(x1, y1, x2, y2);
    gfx.lineStyle(18, hexToNum(COL_PRIMARY), 0.1);
    gfx.lineBetween(x1, y1, x2, y2);
    this.mazeGroup.add(gfx);
  }

  _choosePath(pathY, correct, value) {
    var self = this;
    // Animate hero moving to path
    this.tweens.add({
      targets: this.hero,
      y: pathY, duration: 300, ease: 'Quad.easeInOut',
      onComplete: function() {
        if (correct) {
          self.tweens.add({
            targets: self.hero,
            x: self.W - 50, duration: 400, ease: 'Quad.easeIn',
            onComplete: function() {
              var won = winRound(self);
              if (!won) {
                self.time.delayedCall(600, function() { self.startRound(); }, [], self);
              }
            }
          });
        } else {
          // Dead end — shake and bounce back
          self._screenShake(0.02);
          self._showScorePop('Dead end!', COL_DANGER);
          if (!loseLife(self)) {
            self.tweens.add({
              targets: self.hero,
              x: 70, y: self.H / 2, duration: 400, ease: 'Quad.easeOut'
            });
          }
        }
      }
    });
  }
}


// ═══════════════════════════════════════════════════════════════════════════════
// OPTION 3: FALLING BLOCKS MATH
// Blocks fall with numbers. Position so rows sum to target. Row clears on match.
// ═══════════════════════════════════════════════════════════════════════════════
class FallingBlocksScene extends Phaser.Scene {
  constructor() { super('FallingBlocksScene'); }

  create() {
    var W = this.scale.width, H = this.scale.height;
    this.W = W; this.H = H;
    this.round = 0; this.lives = MAX_LIVES;
    gameScore = 0;

    buildBg(this);
    buildHUD(this);

    // Grid setup
    this.gridCols = 5;
    this.gridRows = 8;
    this.cellSize = Math.min(Math.floor((W - 60) / this.gridCols), Math.floor((H - 180) / this.gridRows));
    this.gridOffX = Math.floor((W - this.gridCols * this.cellSize) / 2);
    this.gridOffY = 90;
    this.grid = []; // grid[row][col] = { val, bg, lbl } or null
    for (var r = 0; r < this.gridRows; r++) {
      this.grid[r] = [];
      for (var c = 0; c < this.gridCols; c++) this.grid[r][c] = null;
    }

    // Draw grid outline
    var gfx = this.add.graphics().setDepth(1);
    gfx.lineStyle(2, hexToNum(COL_PRIMARY), 0.3);
    for (var r = 0; r <= this.gridRows; r++) {
      gfx.lineBetween(this.gridOffX, this.gridOffY + r * this.cellSize, this.gridOffX + this.gridCols * this.cellSize, this.gridOffY + r * this.cellSize);
    }
    for (var c = 0; c <= this.gridCols; c++) {
      gfx.lineBetween(this.gridOffX + c * this.cellSize, this.gridOffY, this.gridOffX + c * this.cellSize, this.gridOffY + this.gridRows * this.cellSize);
    }

    // Hero
    this.hero = this.add.image(W - 50, H - 60, 'character').setScale(0.35).setDepth(30);

    // Active falling block
    this.activeBlock = null;
    this.fallTimer = 0;
    this.fallSpeed = 800;
    this.blockCol = 2;
    this.roundCleared = 0;

    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();

    // Touch controls — left/right/down areas
    var self = this;
    this.input.on('pointerdown', function(p) {
      if (!self.activeBlock) return;
      var relX = p.x - self.gridOffX;
      var clickCol = Math.floor(relX / self.cellSize);
      if (clickCol >= 0 && clickCol < self.gridCols) {
        self.blockCol = clickCol;
        self._updateActivePosition();
      }
    });

    this.startRound();
  }

  startRound() {
    // Clear grid
    for (var r = 0; r < this.gridRows; r++) {
      for (var c = 0; c < this.gridCols; c++) {
        if (this.grid[r][c]) {
          this.grid[r][c].bg.destroy();
          this.grid[r][c].lbl.destroy();
          this.grid[r][c] = null;
        }
      }
    }

    var data = getRound(this.round);
    this.roundData = data;
    this.targetSum = data.target;
    this.remainingItems = data.items.slice();
    this.roundCleared = 0;

    showPrompt(this, data.prompt + ' (Target row sum: ' + data.target + ')');

    // Show target on side
    if (this.targetLbl) this.targetLbl.destroy();
    this.targetLbl = this.add.text(this.W - 20, 90, 'Target:\\n' + data.target, {
      fontSize: '14px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold',
      align: 'center'
    }).setOrigin(1, 0).setDepth(50);

    this._spawnBlock();
  }

  _spawnBlock() {
    if (this.remainingItems.length === 0) {
      // Generate more items from round data pattern
      var data = getRound(this.round);
      this.remainingItems = data.items.slice();
    }
    var val = this.remainingItems.shift();
    this.blockCol = Math.floor(this.gridCols / 2);
    this.blockRow = 0;
    this.fallTimer = 0;

    var px = this.gridOffX + this.blockCol * this.cellSize + this.cellSize / 2;
    var py = this.gridOffY + this.cellSize / 2;

    if (this.activeBlock) {
      this.activeBlock.bg.destroy();
      this.activeBlock.lbl.destroy();
    }

    var bg = this.add.rectangle(px, py, this.cellSize - 4, this.cellSize - 4, hexToNum(COL_ACCENT), 0.9).setDepth(20);
    var lbl = this.add.text(px, py, '' + val, {
      fontSize: Math.max(12, this.cellSize * 0.4) + 'px', color: COL_BG,
      fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(21);

    this.activeBlock = { val: val, bg: bg, lbl: lbl };

    // Check if top row is blocked
    if (this.grid[0][this.blockCol]) {
      // Stack reached top!
      this._screenShake(0.03);
      if (!loseLife(this)) {
        // Clear grid and continue round
        for (var r = 0; r < this.gridRows; r++) {
          for (var c = 0; c < this.gridCols; c++) {
            if (this.grid[r][c]) {
              this.grid[r][c].bg.destroy();
              this.grid[r][c].lbl.destroy();
              this.grid[r][c] = null;
            }
          }
        }
      }
    }
  }

  _updateActivePosition() {
    if (!this.activeBlock) return;
    var px = this.gridOffX + this.blockCol * this.cellSize + this.cellSize / 2;
    var py = this.gridOffY + this.blockRow * this.cellSize + this.cellSize / 2;
    this.activeBlock.bg.setPosition(px, py);
    this.activeBlock.lbl.setPosition(px, py);
  }

  _landBlock() {
    // Find landing row
    var landRow = this.gridRows - 1;
    for (var r = 0; r < this.gridRows; r++) {
      if (this.grid[r][this.blockCol]) {
        landRow = r - 1;
        break;
      }
    }
    if (landRow < 0) {
      // Column full — lose life
      if (this.activeBlock) { this.activeBlock.bg.destroy(); this.activeBlock.lbl.destroy(); }
      this.activeBlock = null;
      if (!loseLife(this)) {
        for (var r2 = 0; r2 < this.gridRows; r2++) for (var c2 = 0; c2 < this.gridCols; c2++) {
          if (this.grid[r2][c2]) { this.grid[r2][c2].bg.destroy(); this.grid[r2][c2].lbl.destroy(); this.grid[r2][c2] = null; }
        }
        this._spawnBlock();
      }
      return;
    }

    var px = this.gridOffX + this.blockCol * this.cellSize + this.cellSize / 2;
    var py = this.gridOffY + landRow * this.cellSize + this.cellSize / 2;

    var bg = this.add.rectangle(px, py, this.cellSize - 4, this.cellSize - 4, hexToNum(COL_PRIMARY), 0.8).setDepth(10);
    var lbl = this.add.text(px, py, '' + this.activeBlock.val, {
      fontSize: Math.max(12, this.cellSize * 0.4) + 'px', color: '#fff',
      fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);

    this.grid[landRow][this.blockCol] = { val: this.activeBlock.val, bg: bg, lbl: lbl };
    this.activeBlock.bg.destroy(); this.activeBlock.lbl.destroy();
    this.activeBlock = null;

    // Check row sums
    this._checkRows();

    // Spawn next
    if (this.activeBlock === null) {
      this._spawnBlock();
    }
  }

  _checkRows() {
    var self = this;
    for (var r = this.gridRows - 1; r >= 0; r--) {
      var rowSum = 0, filled = 0;
      for (var c = 0; c < this.gridCols; c++) {
        if (this.grid[r][c]) { rowSum += this.grid[r][c].val; filled++; }
      }
      if (filled > 0 && rowSum === this.targetSum) {
        // Clear this row!
        for (var c2 = 0; c2 < this.gridCols; c2++) {
          if (this.grid[r][c2]) {
            var cell = this.grid[r][c2];
            self._burstParticles(cell.bg.x, cell.bg.y, 8);
            cell.bg.destroy(); cell.lbl.destroy();
            this.grid[r][c2] = null;
          }
        }
        self._screenShake(0.01);
        self._showScorePop('Row cleared!');
        this.roundCleared++;

        // Drop blocks above
        for (var row = r - 1; row >= 0; row--) {
          for (var col = 0; col < this.gridCols; col++) {
            if (this.grid[row][col] && !this.grid[row + 1][col]) {
              this.grid[row + 1][col] = this.grid[row][col];
              this.grid[row][col] = null;
              var npx = this.gridOffX + col * this.cellSize + this.cellSize / 2;
              var npy = this.gridOffY + (row + 1) * this.cellSize + this.cellSize / 2;
              this.grid[row + 1][col].bg.setPosition(npx, npy);
              this.grid[row + 1][col].lbl.setPosition(npx, npy);
            }
          }
        }

        // Win condition: clear 2 rows per round
        if (this.roundCleared >= 2) {
          var won = winRound(self);
          if (!won) {
            self.time.delayedCall(600, function() { self.startRound(); }, [], self);
          }
        }
        break; // Re-check after gravity
      }
    }
  }

  update(time, delta) {
    if (!this.activeBlock) return;

    // Keyboard
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      if (this.blockCol > 0) { this.blockCol--; this._updateActivePosition(); }
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      if (this.blockCol < this.gridCols - 1) { this.blockCol++; this._updateActivePosition(); }
    }
    if (this.cursors.down.isDown) {
      this.fallTimer += delta * 3; // Fast drop
    }

    this.fallTimer += delta;
    if (this.fallTimer >= this.fallSpeed) {
      this.fallTimer = 0;
      this.blockRow++;

      // Check if we hit bottom or another block
      var nextRow = this.blockRow;
      if (nextRow >= this.gridRows || (nextRow < this.gridRows && this.grid[nextRow] && this.grid[nextRow][this.blockCol])) {
        this.blockRow = nextRow - 1;
        this._landBlock();
        return;
      }

      this._updateActivePosition();
    }
  }
}


// ═══════════════════════════════════════════════════════════════════════════════
// OPTION 4: DOT EATER MATH
// Pac-Man style maze. Collect correct dots based on math rule. Enemies chase.
// ═══════════════════════════════════════════════════════════════════════════════
class DotEaterScene extends Phaser.Scene {
  constructor() { super('DotEaterScene'); }

  create() {
    var W = this.scale.width, H = this.scale.height;
    this.W = W; this.H = H;
    this.round = 0; this.lives = MAX_LIVES;
    gameScore = 0;
    this.correctCollected = 0;

    buildBg(this);
    buildHUD(this);

    // Maze grid
    this.cellSize = Math.floor(Math.min(W, H - 100) / 14);
    this.mazeCols = Math.floor((W - 20) / this.cellSize);
    this.mazeRows = Math.floor((H - 120) / this.cellSize);
    this.offsetX = Math.floor((W - this.mazeCols * this.cellSize) / 2);
    this.offsetY = 80;

    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.playerDir = { x: 0, y: 0 };
    this.moveTimer = 0;
    this.moveSpeed = 180;

    // Swipe input
    this.input.on('pointerdown', function(p) { this._swStart = { x: p.x, y: p.y }; }, this);
    this.input.on('pointerup', function(p) {
      if (!this._swStart) return;
      var dx = p.x - this._swStart.x, dy = p.y - this._swStart.y;
      if (Math.abs(dx) < 15 && Math.abs(dy) < 15) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        this.playerDir = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
      } else {
        this.playerDir = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
      }
    }, this);

    this.dots = [];
    this.enemies = [];
    this.walls = [];
    this.wallSet = {};

    this.startRound();
  }

  startRound() {
    // Clean up
    this.dots.forEach(function(d) { if (d.bg) d.bg.destroy(); if (d.lbl) d.lbl.destroy(); });
    this.dots = [];
    this.enemies.forEach(function(e) { if (e.sprite) e.sprite.destroy(); });
    this.enemies = [];
    this.walls.forEach(function(w) { w.destroy(); });
    this.walls = [];
    this.wallSet = {};
    this.correctCollected = 0;

    var data = getRound(this.round);
    this.roundData = data;
    showPrompt(this, data.prompt);

    // Generate simple maze walls
    this._generateMaze();

    // Place player
    this.playerGX = 1; this.playerGY = 1;
    this.playerDir = { x: 0, y: 0 };
    if (this.playerSprite) this.playerSprite.destroy();
    var ppx = this.offsetX + this.cellSize / 2 + this.cellSize;
    var ppy = this.offsetY + this.cellSize / 2 + this.cellSize;
    this.playerSprite = this.add.circle(ppx, ppy, this.cellSize * 0.35, hexToNum(COL_ACCENT), 1).setDepth(25);
    this.hero = this.add.image(ppx, ppy, 'character').setScale(0.2).setDepth(26);

    // Place dots with values
    this._placeDots(data);

    // Place enemies
    this._placeEnemies();
  }

  _generateMaze() {
    var self = this;
    // Create border walls and some inner walls
    for (var r = 0; r < this.mazeRows; r++) {
      for (var c = 0; c < this.mazeCols; c++) {
        var isWall = false;
        if (r === 0 || r === this.mazeRows - 1 || c === 0 || c === this.mazeCols - 1) {
          isWall = true;
        }
        // Inner wall pattern — create corridors
        else if (r % 3 === 0 && c % 3 === 0 && !(r === 0 && c <= 2)) {
          isWall = true;
        }
        else if (r % 3 === 0 && c % 2 === 0 && Math.random() < 0.3 && r > 1 && c > 1) {
          isWall = true;
        }

        if (isWall) {
          // Don't wall off player start
          if (r <= 2 && c <= 2) continue;
          var px = self.offsetX + c * self.cellSize + self.cellSize / 2;
          var py = self.offsetY + r * self.cellSize + self.cellSize / 2;
          var wall = self.add.rectangle(px, py, self.cellSize - 1, self.cellSize - 1, hexToNum(COL_PRIMARY), 0.25).setDepth(3);
          self.walls.push(wall);
          self.wallSet[c + ',' + r] = true;
        }
      }
    }
  }

  _placeDots(data) {
    var self = this;
    var items = data.items.slice();
    var target = data.target;

    // Place dots at random free cells
    var freeCells = [];
    for (var r = 1; r < this.mazeRows - 1; r++) {
      for (var c = 1; c < this.mazeCols - 1; c++) {
        if (!this.wallSet[c + ',' + r] && !(r <= 2 && c <= 2)) {
          freeCells.push({ x: c, y: r });
        }
      }
    }
    // Shuffle free cells
    for (var i = freeCells.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = freeCells[i]; freeCells[i] = freeCells[j]; freeCells[j] = tmp;
    }

    items.forEach(function(val, idx) {
      if (idx >= freeCells.length) return;
      var cell = freeCells[idx];
      var px = self.offsetX + cell.x * self.cellSize + self.cellSize / 2;
      var py = self.offsetY + cell.y * self.cellSize + self.cellSize / 2;
      var isCorrect = (val === target);
      var dotCol = hexToNum(isCorrect ? COL_ACCENT : COL_SECONDARY);
      var bg = self.add.circle(px, py, self.cellSize * 0.25, dotCol, 0.8).setDepth(8);
      var fontSize = Math.max(8, self.cellSize * 0.3);
      var lbl = self.add.text(px, py, '' + val, {
        fontSize: fontSize + 'px', color: COL_BG, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(9);

      self.dots.push({ gx: cell.x, gy: cell.y, val: val, isCorrect: isCorrect, bg: bg, lbl: lbl, eaten: false });
    });
  }

  _placeEnemies() {
    var self = this;
    var enemyCount = Math.min(2, 1 + Math.floor(this.round / 2));
    for (var i = 0; i < enemyCount; i++) {
      var ex = this.mazeCols - 3;
      var ey = this.mazeRows - 3 - i;
      while (this.wallSet[ex + ',' + ey] && ex > 3) ex--;
      var px = self.offsetX + ex * self.cellSize + self.cellSize / 2;
      var py = self.offsetY + ey * self.cellSize + self.cellSize / 2;
      var sprite = self.add.circle(px, py, self.cellSize * 0.3, hexToNum(COL_DANGER), 0.9).setDepth(22);
      self.enemies.push({ gx: ex, gy: ey, sprite: sprite, moveTimer: 0 });
    }
  }

  update(time, delta) {
    // Keyboard
    if (this.cursors.left.isDown) this.playerDir = { x: -1, y: 0 };
    else if (this.cursors.right.isDown) this.playerDir = { x: 1, y: 0 };
    else if (this.cursors.up.isDown) this.playerDir = { x: 0, y: -1 };
    else if (this.cursors.down.isDown) this.playerDir = { x: 0, y: 1 };

    this.moveTimer += delta;
    if (this.moveTimer >= this.moveSpeed) {
      this.moveTimer = 0;
      this._movePlayer();
      this._moveEnemies();
      this._checkEnemyCollision();
    }
  }

  _movePlayer() {
    var nx = this.playerGX + this.playerDir.x;
    var ny = this.playerGY + this.playerDir.y;
    if (nx < 0 || nx >= this.mazeCols || ny < 0 || ny >= this.mazeRows) return;
    if (this.wallSet[nx + ',' + ny]) return;

    this.playerGX = nx; this.playerGY = ny;
    var px = this.offsetX + nx * this.cellSize + this.cellSize / 2;
    var py = this.offsetY + ny * this.cellSize + this.cellSize / 2;
    this.tweens.add({ targets: [this.playerSprite, this.hero], x: px, y: py, duration: 100, ease: 'Linear' });

    // Check dot collision
    var self = this;
    this.dots.forEach(function(dot) {
      if (!dot.eaten && dot.gx === nx && dot.gy === ny) {
        dot.eaten = true;
        dot.bg.destroy(); dot.lbl.destroy();
        if (dot.val === self.roundData.target) {
          // Correct!
          self.correctCollected++;
          self._burstParticles(px, py, 10);
          self._showScorePop('+' + dot.val);
          heroCheer(self, self.hero);

          // Need to collect at least 1 correct to win
          if (self.correctCollected >= 1) {
            var won = winRound(self);
            if (!won) {
              self.time.delayedCall(600, function() { self.startRound(); }, [], self);
            }
          }
        } else {
          // Wrong dot
          self._screenShake(0.015);
          self._showScorePop('Wrong!', COL_DANGER);
          loseLife(self);
        }
      }
    });
  }

  _moveEnemies() {
    var self = this;
    this.enemies.forEach(function(enemy) {
      // Simple chase AI — move toward player
      var dx = self.playerGX - enemy.gx;
      var dy = self.playerGY - enemy.gy;
      var moves = [];
      if (dx > 0) moves.push({ x: 1, y: 0 });
      if (dx < 0) moves.push({ x: -1, y: 0 });
      if (dy > 0) moves.push({ x: 0, y: 1 });
      if (dy < 0) moves.push({ x: 0, y: -1 });
      // Add random move for unpredictability
      var allDirs = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
      if (Math.random() < 0.3) moves = allDirs;
      // Shuffle
      for (var i = moves.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = moves[i]; moves[i] = moves[j]; moves[j] = tmp;
      }

      for (var m = 0; m < moves.length; m++) {
        var nx = enemy.gx + moves[m].x;
        var ny = enemy.gy + moves[m].y;
        if (nx >= 0 && nx < self.mazeCols && ny >= 0 && ny < self.mazeRows && !self.wallSet[nx + ',' + ny]) {
          enemy.gx = nx; enemy.gy = ny;
          var px = self.offsetX + nx * self.cellSize + self.cellSize / 2;
          var py = self.offsetY + ny * self.cellSize + self.cellSize / 2;
          self.tweens.add({ targets: enemy.sprite, x: px, y: py, duration: 150, ease: 'Linear' });
          break;
        }
      }
    });
  }

  _checkEnemyCollision() {
    var self = this;
    this.enemies.forEach(function(enemy) {
      if (enemy.gx === self.playerGX && enemy.gy === self.playerGY) {
        self._screenShake(0.025);
        self._showScorePop('Caught!', COL_DANGER);
        if (!loseLife(self)) {
          // Reset player position
          self.playerGX = 1; self.playerGY = 1;
          var px = self.offsetX + self.cellSize / 2 + self.cellSize;
          var py = self.offsetY + self.cellSize / 2 + self.cellSize;
          self.playerSprite.setPosition(px, py);
          self.hero.setPosition(px, py);
        }
      }
    });
  }
}


// ═══════════════════════════════════════════════════════════════════════════════
// OPTION 5: LAUNCHER MATH (Flappy Bird style)
// Character moves up/down. Gates appear with numbers. Fly through correct gate.
// ═══════════════════════════════════════════════════════════════════════════════
class LauncherMathScene extends Phaser.Scene {
  constructor() { super('LauncherMathScene'); }

  create() {
    var W = this.scale.width, H = this.scale.height;
    this.W = W; this.H = H;
    this.round = 0; this.lives = MAX_LIVES;
    gameScore = 0;

    buildBg(this);
    buildHUD(this);

    // Player
    this.playerY = H / 2;
    this.playerX = 80;
    this.velocity = 0;
    this.gravity = 0.4;
    this.flapForce = -6;

    this.hero = this.add.image(this.playerX, this.playerY, 'character').setScale(0.35).setDepth(30);
    this.playerCircle = this.add.circle(this.playerX, this.playerY, 16, hexToNum(COL_ACCENT), 0.5).setDepth(29);

    // Tap/click to flap
    this.input.on('pointerdown', function() { this.velocity = this.flapForce; }, this);
    this.cursors = this.input.keyboard.createCursorKeys();

    this.gates = [];
    this.gateSpeed = 2.5;
    this.gateTimer = 0;
    this.gateInterval = 2200;
    this.roundGatesPassed = 0;
    this.gatesSpawned = 0;
    this.waitingForRound = false;

    this.startRound();
  }

  startRound() {
    // Clear gates
    this.gates.forEach(function(g) {
      g.pipes.forEach(function(p) { p.destroy(); });
      g.labels.forEach(function(l) { l.destroy(); });
    });
    this.gates = [];
    this.gateTimer = 0;
    this.gatesSpawned = 0;
    this.roundGatesPassed = 0;
    this.waitingForRound = false;

    this.playerY = this.H / 2;
    this.velocity = 0;

    var data = getRound(this.round);
    this.roundData = data;
    showPrompt(this, data.prompt);
  }

  _spawnGateSet() {
    var W = this.W, H = this.H;
    var data = this.roundData;
    var items = data.items.slice();
    var target = data.target;

    // Pick 3 values — one correct, two wrong
    if (items.indexOf(target) === -1) items[0] = target;
    // Shuffle and pick 3
    for (var i = items.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = items[i]; items[i] = items[j]; items[j] = tmp;
    }
    var gateValues = [];
    gateValues.push(target);
    var added = 1;
    for (var k = 0; k < items.length && added < 3; k++) {
      if (items[k] !== target) { gateValues.push(items[k]); added++; }
    }
    while (gateValues.length < 3) gateValues.push(target + Math.floor(Math.random() * 5) + 1);
    // Shuffle gate positions
    for (var i2 = gateValues.length - 1; i2 > 0; i2--) {
      var j2 = Math.floor(Math.random() * (i2 + 1));
      var tmp2 = gateValues[i2]; gateValues[i2] = gateValues[j2]; gateValues[j2] = tmp2;
    }

    var gateX = W + 60;
    var gateH = Math.floor((H - 140) / 3);
    var startY = 80;
    var gapSize = 12;

    var pipes = [];
    var labels = [];
    var gateData = [];

    for (var gi = 0; gi < 3; gi++) {
      var gy = startY + gi * gateH + gateH / 2;
      var val = gateValues[gi];
      var isCorrect = (val === target);

      // Gate opening
      var pipeTop = this.add.rectangle(gateX, gy - gateH / 2 + gapSize, 40, gapSize * 2, hexToNum(COL_PRIMARY), 0.6).setDepth(15);
      var pipeBot = this.add.rectangle(gateX, gy + gateH / 2 - gapSize, 40, gapSize * 2, hexToNum(COL_PRIMARY), 0.6).setDepth(15);
      var opening = this.add.rectangle(gateX, gy, 40, gateH - gapSize * 4, hexToNum(isCorrect ? COL_ACCENT : COL_SECONDARY), 0.15).setDepth(14);
      var lbl = this.add.text(gateX, gy, '' + val, {
        fontSize: '18px', color: isCorrect ? COL_ACCENT : COL_TEXT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold',
        stroke: '#000', strokeThickness: 3
      }).setOrigin(0.5).setDepth(16);

      pipes.push(pipeTop, pipeBot, opening);
      labels.push(lbl);
      gateData.push({ y: gy, h: gateH - gapSize * 4, val: val, correct: isCorrect });
    }

    this.gates.push({ x: gateX, pipes: pipes, labels: labels, gateData: gateData, passed: false });
    this.gatesSpawned++;
  }

  update(time, delta) {
    if (this.waitingForRound) return;

    // Flap with up/space
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
      this.velocity = this.flapForce;
    }

    // Gravity
    this.velocity += this.gravity;
    this.playerY += this.velocity;

    // Clamp
    if (this.playerY < 30) { this.playerY = 30; this.velocity = 0; }
    if (this.playerY > this.H - 40) { this.playerY = this.H - 40; this.velocity = 0; }

    this.hero.setPosition(this.playerX, this.playerY);
    this.playerCircle.setPosition(this.playerX, this.playerY);

    // Slight rotation based on velocity
    this.hero.setRotation(Phaser.Math.Clamp(this.velocity * 0.04, -0.4, 0.4));

    // Spawn gates
    this.gateTimer += delta;
    if (this.gateTimer >= this.gateInterval && this.gatesSpawned < 3) {
      this.gateTimer = 0;
      this._spawnGateSet();
    }

    // Move gates
    var self = this;
    for (var gi = this.gates.length - 1; gi >= 0; gi--) {
      var gate = this.gates[gi];
      gate.x -= this.gateSpeed;
      gate.pipes.forEach(function(p) { p.x -= self.gateSpeed; });
      gate.labels.forEach(function(l) { l.x -= self.gateSpeed; });

      // Check if player passes through gate
      if (!gate.passed && gate.x < this.playerX + 20 && gate.x > this.playerX - 30) {
        gate.passed = true;
        // Which gate is player in?
        var hitGate = null;
        for (var g = 0; g < gate.gateData.length; g++) {
          var gd = gate.gateData[g];
          if (Math.abs(this.playerY - gd.y) < gd.h / 2) {
            hitGate = gd;
            break;
          }
        }

        if (hitGate) {
          if (hitGate.correct) {
            this._burstParticles(this.playerX, this.playerY, 15);
            this.roundGatesPassed++;
            // Win after passing 1 correct gate per round
            this.waitingForRound = true;
            var won = winRound(self);
            if (!won) {
              self.time.delayedCall(700, function() { self.startRound(); }, [], self);
            }
          } else {
            this._screenShake(0.02);
            this._showScorePop('Wrong gate!', COL_DANGER);
            if (loseLife(self)) return;
          }
        } else {
          // Hit pipe wall
          this._screenShake(0.02);
          this._showScorePop('Crash!', COL_DANGER);
          if (loseLife(self)) return;
        }
      }

      // Remove off-screen gates
      if (gate.x < -80) {
        gate.pipes.forEach(function(p) { p.destroy(); });
        gate.labels.forEach(function(l) { l.destroy(); });
        this.gates.splice(gi, 1);
      }
    }
  }
}


// ═══════════════════════════════════════════════════════════════════════════════
// OPTION 6: BREAKOUT MATH
// Paddle + ball. Bricks have numbers. Break bricks summing to target.
// ═══════════════════════════════════════════════════════════════════════════════
class BreakoutMathScene extends Phaser.Scene {
  constructor() { super('BreakoutMathScene'); }

  create() {
    var W = this.scale.width, H = this.scale.height;
    this.W = W; this.H = H;
    this.round = 0; this.lives = MAX_LIVES;
    gameScore = 0;

    buildBg(this);
    buildHUD(this);

    // Paddle
    this.paddleW = 100; this.paddleH = 14;
    this.paddleX = W / 2;
    this.paddleY = H - 50;
    this.paddle = this.add.rectangle(this.paddleX, this.paddleY, this.paddleW, this.paddleH, hexToNum(COL_PRIMARY), 1).setDepth(20);

    // Ball
    this.ballR = 8;
    this.ballX = W / 2; this.ballY = H - 80;
    this.ballVX = 3; this.ballVY = -4;
    this.ball = this.add.circle(this.ballX, this.ballY, this.ballR, hexToNum(COL_ACCENT), 1).setDepth(20);
    this.ballTrail = [];

    // Hero
    this.hero = this.add.image(W / 2, H - 30, 'character').setScale(0.25).setDepth(25);

    // Bricks
    this.bricks = [];
    this.brokenSum = 0;

    // Mouse/touch controls paddle
    this.input.on('pointermove', function(p) {
      this.paddleX = Phaser.Math.Clamp(p.x, this.paddleW / 2, W - this.paddleW / 2);
    }, this);

    // Keyboard
    this.cursors = this.input.keyboard.createCursorKeys();

    this.paused = false;

    this.startRound();
  }

  startRound() {
    this.paused = true;
    // Clear bricks
    this.bricks.forEach(function(b) { b.bg.destroy(); b.lbl.destroy(); });
    this.bricks = [];
    this.brokenSum = 0;

    var data = getRound(this.round);
    this.roundData = data;
    this.targetSum = data.target;

    showPrompt(this, data.prompt + ' (Break bricks summing to ' + data.target + ')');

    // Show target
    if (this.targetLbl) this.targetLbl.destroy();
    if (this.sumLbl) this.sumLbl.destroy();
    this.targetLbl = this.add.text(this.W - 14, 90, 'Target: ' + data.target, {
      fontSize: '14px', color: COL_ACCENT, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
    }).setOrigin(1, 0).setDepth(50);
    this.sumLbl = this.add.text(this.W - 14, 110, 'Broken: 0', {
      fontSize: '13px', color: COL_TEXT, fontFamily: "'Lexend', system-ui"
    }).setOrigin(1, 0).setDepth(50);

    // Build bricks
    this._buildBricks(data);

    // Reset ball
    this.ballX = this.W / 2;
    this.ballY = this.H - 80;
    this.ballVX = (Math.random() > 0.5 ? 1 : -1) * (3 + Math.random());
    this.ballVY = -4;
    this.ball.setPosition(this.ballX, this.ballY);

    this.time.delayedCall(500, function() { this.paused = false; }, [], this);
  }

  _buildBricks(data) {
    var items = data.items.slice();
    var cols = Math.min(items.length, 5);
    var rows = Math.ceil(items.length / cols);
    var brickW = Math.floor((this.W - 40) / cols);
    var brickH = 30;
    var startX = 20;
    var startY = 130;

    var self = this;
    items.forEach(function(val, idx) {
      var col = idx % cols, row = Math.floor(idx / cols);
      var bx = startX + col * brickW + brickW / 2;
      var by = startY + row * (brickH + 4) + brickH / 2;

      var bg = self.add.rectangle(bx, by, brickW - 4, brickH - 2, hexToNum(COL_SECONDARY), 0.9).setDepth(10);
      var lbl = self.add.text(bx, by, '' + val, {
        fontSize: '14px', color: COL_BG, fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(11);

      // Pop-in animation
      bg.setScale(0); lbl.setScale(0);
      self.tweens.add({ targets: [bg, lbl], scale: 1, duration: 300, ease: 'Back.easeOut', delay: idx * 50 });

      self.bricks.push({
        x: bx, y: by, w: brickW - 4, h: brickH - 2, val: val,
        bg: bg, lbl: lbl, alive: true
      });
    });
  }

  update(time, delta) {
    if (this.paused) return;

    // Keyboard paddle
    if (this.cursors.left.isDown) this.paddleX -= 6;
    if (this.cursors.right.isDown) this.paddleX += 6;
    this.paddleX = Phaser.Math.Clamp(this.paddleX, this.paddleW / 2, this.W - this.paddleW / 2);
    this.paddle.setPosition(this.paddleX, this.paddleY);
    this.hero.setPosition(this.paddleX, this.paddleY + 18);

    // Move ball
    this.ballX += this.ballVX;
    this.ballY += this.ballVY;

    // Wall bounces
    if (this.ballX <= this.ballR || this.ballX >= this.W - this.ballR) {
      this.ballVX *= -1;
      this.ballX = Phaser.Math.Clamp(this.ballX, this.ballR, this.W - this.ballR);
    }
    if (this.ballY <= this.ballR + 40) {
      this.ballVY *= -1;
      this.ballY = this.ballR + 40;
    }

    // Ball falls below paddle
    if (this.ballY > this.H + 20) {
      this.paused = true;
      this._screenShake(0.02);
      if (!loseLife(this)) {
        // Reset ball, keep bricks
        this.ballX = this.W / 2; this.ballY = this.H - 80;
        this.ballVX = (Math.random() > 0.5 ? 1 : -1) * (3 + Math.random());
        this.ballVY = -4;
        this.ball.setPosition(this.ballX, this.ballY);
        this.time.delayedCall(500, function() { this.paused = false; }, [], this);
      }
      return;
    }

    // Paddle collision
    if (this.ballVY > 0 &&
        this.ballY + this.ballR >= this.paddleY - this.paddleH / 2 &&
        this.ballY - this.ballR <= this.paddleY + this.paddleH / 2 &&
        this.ballX >= this.paddleX - this.paddleW / 2 - 5 &&
        this.ballX <= this.paddleX + this.paddleW / 2 + 5) {
      this.ballVY = -Math.abs(this.ballVY) - 0.2;
      // Angle based on hit position
      var hitPos = (this.ballX - this.paddleX) / (this.paddleW / 2);
      this.ballVX = hitPos * 5;
      this.ballY = this.paddleY - this.paddleH / 2 - this.ballR;
    }

    // Brick collision
    var self = this;
    for (var bi = 0; bi < this.bricks.length; bi++) {
      var brick = this.bricks[bi];
      if (!brick.alive) continue;
      if (this.ballX + this.ballR > brick.x - brick.w / 2 &&
          this.ballX - this.ballR < brick.x + brick.w / 2 &&
          this.ballY + this.ballR > brick.y - brick.h / 2 &&
          this.ballY - this.ballR < brick.y + brick.h / 2) {
        // Hit brick!
        brick.alive = false;
        this.ballVY *= -1;

        this.brokenSum += brick.val;
        this.sumLbl.setText('Broken: ' + this.brokenSum);

        // Destroy animation
        self._burstParticles(brick.x, brick.y, 8);
        self.tweens.add({
          targets: [brick.bg, brick.lbl], scale: 0, alpha: 0, duration: 200,
          onComplete: function() { brick.bg.destroy(); brick.lbl.destroy(); }
        });

        // Check if sum matches target
        if (this.brokenSum === this.targetSum) {
          this.paused = true;
          var won = winRound(self);
          if (!won) {
            self.time.delayedCall(700, function() { self.startRound(); }, [], self);
          }
        }
        // Penalty: if sum exceeds target, add penalty bricks
        else if (this.brokenSum > this.targetSum) {
          self._screenShake(0.015);
          self._showScorePop('Over target!', COL_DANGER);
          this.brokenSum = 0;
          this.sumLbl.setText('Broken: 0');
          // Reset all brick visibility
          this.bricks.forEach(function(b) {
            if (!b.alive) {
              // Re-add destroyed bricks as penalty
              b.alive = true;
              b.bg = self.add.rectangle(b.x, b.y, b.w, b.h, hexToNum(COL_DANGER), 0.8).setDepth(10);
              b.lbl = self.add.text(b.x, b.y, '' + b.val, {
                fontSize: '14px', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'bold'
              }).setOrigin(0.5).setDepth(11);
            }
          });
          if (!loseLife(self)) {
            // Continue
          }
        }

        break; // Only hit one brick per frame
      }
    }

    // Ball trail
    var trail = this.add.circle(this.ballX, this.ballY, 4, hexToNum(COL_ACCENT), 0.3).setDepth(18);
    this.ballTrail.push(trail);
    if (this.ballTrail.length > 8) {
      var old = this.ballTrail.shift();
      old.destroy();
    }
    this.ballTrail.forEach(function(t, i) { t.setAlpha(i * 0.03); });

    this.ball.setPosition(this.ballX, this.ballY);
  }
}

`;
