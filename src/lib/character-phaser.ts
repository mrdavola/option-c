// Generates Phaser-compatible character drawing code from a CharacterConfig.
// Replaces the default addCharacter() sprite-based approach with procedural
// graphics that match the SVG renderer output.

import type { CharacterConfig } from "./character-config"

/**
 * Returns a JS code string that, when injected into the Phaser HTML template,
 * defines a `drawCustomCharacter(scene, x, y, scale)` function.
 * This function uses Phaser Graphics to draw the character and returns a
 * Phaser.GameObjects.Container positioned at (x, y) with the idle bob tween.
 *
 * Usage in game scene code:
 *   `this.hero = drawCustomCharacter(this, x, y, 0.5);`
 */
export function generatePhaserCharacterCode(config: CharacterConfig): string {
  const { body, color, hair, accessory, expression } = config
  const colorNum = hexToNumStr(color)
  const darkColor = darkenHex(color, 0.1)
  const darkColorNum = hexToNumStr(darkColor)
  const hairColorNum = hexToNumStr(darkenHex(color, 0.25))

  // Body geometry (matches character-svg.ts dimensions)
  const dims = getDims(body)

  return `
// ─── Custom Character Drawing ─────────────────────────────────────────
function drawCustomCharacter(scene, x, y, scale) {
  scale = scale || 0.5;
  var g = scene.add.graphics();

  // Body
  ${renderPhaserBody(body, colorNum, dims)}

  // Head
  g.fillStyle(${colorNum}, 1);
  g.fillCircle(${dims.headCx}, ${dims.headCy}, ${dims.headR});

  // Expression
  ${renderPhaserExpression(expression, dims)}

  // Hair
  ${renderPhaserHair(hair, hairColorNum, dims)}

  // Accessory
  ${renderPhaserAccessory(accessory, dims)}

  // Limbs
  g.lineStyle(${body === "stick" ? 2.5 : 3}, ${darkColorNum}, 1);
  ${renderPhaserLimbs(body, dims)}

  // Wrap in container
  var container = scene.add.container(x, y, [g]);
  container.setScale(scale);
  container.setDepth(20);
  container.setAlpha(0.9);

  // Idle bob
  scene.tweens.add({
    targets: container,
    y: y - 4,
    duration: 1200,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });

  return container;
}

// Override heroCheer / heroShake to work with containers
var _origHeroCheer = typeof heroCheer !== 'undefined' ? heroCheer : null;
function heroCheer(scene, hero) {
  if (!hero) return;
  scene.tweens.add({
    targets: hero,
    y: hero.y - 20,
    scaleX: hero.scaleX * 1.1,
    scaleY: hero.scaleY * 1.1,
    duration: 200,
    yoyo: true,
    ease: 'Back.easeOut'
  });
}

var _origHeroShake = typeof heroShake !== 'undefined' ? heroShake : null;
function heroShake(scene, hero) {
  if (!hero) return;
  var ox = hero.x;
  scene.tweens.add({
    targets: hero,
    x: ox - 8,
    duration: 60,
    yoyo: true,
    repeat: 3,
    ease: 'Sine.easeInOut',
    onComplete: function() { hero.x = ox; }
  });
}
`
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface Dims {
  headCx: number
  headCy: number
  headR: number
  bodyCx: number
  bodyTop: number
  bodyBottom: number
  bodyWidth: number
}

function getDims(body: string): Dims {
  switch (body) {
    case "stick":
      return { headCx: 60, headCy: 28, headR: 14, bodyCx: 60, bodyTop: 44, bodyBottom: 90, bodyWidth: 2 }
    case "round":
      return { headCx: 60, headCy: 28, headR: 16, bodyCx: 60, bodyTop: 46, bodyBottom: 88, bodyWidth: 24 }
    case "tall":
      return { headCx: 60, headCy: 22, headR: 13, bodyCx: 60, bodyTop: 37, bodyBottom: 94, bodyWidth: 14 }
    case "small":
      return { headCx: 60, headCy: 38, headR: 16, bodyCx: 60, bodyTop: 56, bodyBottom: 90, bodyWidth: 18 }
    default:
      return { headCx: 60, headCy: 28, headR: 14, bodyCx: 60, bodyTop: 44, bodyBottom: 90, bodyWidth: 2 }
  }
}

function renderPhaserBody(body: string, colorNum: string, d: Dims): string {
  if (body === "stick") {
    return `g.lineStyle(3, ${colorNum}, 1);
  g.lineBetween(${d.bodyCx}, ${d.bodyTop}, ${d.bodyCx}, ${d.bodyBottom});`
  }
  if (body === "round") {
    const ry = (d.bodyBottom - d.bodyTop) / 2
    const cy = (d.bodyTop + d.bodyBottom) / 2
    return `g.fillStyle(${colorNum}, 0.85);
  g.fillEllipse(${d.bodyCx}, ${cy}, ${d.bodyWidth * 2}, ${ry * 2});`
  }
  if (body === "tall") {
    const halfW = d.bodyWidth / 2
    return `g.fillStyle(${colorNum}, 0.85);
  g.fillRoundedRect(${d.bodyCx - halfW}, ${d.bodyTop}, ${d.bodyWidth}, ${d.bodyBottom - d.bodyTop}, 6);`
  }
  // small
  const ry = (d.bodyBottom - d.bodyTop) / 2
  const cy = (d.bodyTop + d.bodyBottom) / 2
  return `g.fillStyle(${colorNum}, 0.85);
  g.fillEllipse(${d.bodyCx}, ${cy}, ${d.bodyWidth * 2}, ${ry * 2});`
}

function renderPhaserExpression(expr: string, d: Dims): string {
  const cx = d.headCx
  const cy = d.headCy
  const eyeY = cy - 2
  const eyeSpacing = 6

  switch (expr) {
    case "happy":
      return `g.fillStyle(0x1a1a2e, 1);
  g.fillCircle(${cx - eyeSpacing}, ${eyeY}, 2);
  g.fillCircle(${cx + eyeSpacing}, ${eyeY}, 2);
  g.lineStyle(1.5, 0x1a1a2e, 1);
  g.beginPath();
  g.arc(${cx}, ${cy + 6}, 5, 0, Math.PI, false);
  g.strokePath();`

    case "determined":
      return `g.fillStyle(0x1a1a2e, 1);
  g.fillEllipse(${cx - eyeSpacing}, ${eyeY}, 5, 3);
  g.fillEllipse(${cx + eyeSpacing}, ${eyeY}, 5, 3);
  g.lineStyle(1.5, 0x1a1a2e, 1);
  g.lineBetween(${cx - 4}, ${cy + 5}, ${cx + 4}, ${cy + 5});`

    case "cool":
      return `g.lineStyle(2, 0x1a1a2e, 1);
  g.lineBetween(${cx - eyeSpacing - 2}, ${eyeY}, ${cx - eyeSpacing + 2}, ${eyeY});
  g.lineBetween(${cx + eyeSpacing - 2}, ${eyeY}, ${cx + eyeSpacing + 2}, ${eyeY});
  g.lineStyle(1.5, 0x1a1a2e, 1);
  g.beginPath();
  g.arc(${cx + 1}, ${cy + 5}, 4, Math.PI * 0.1, Math.PI * 0.7, false);
  g.strokePath();`

    case "silly":
      return `g.fillStyle(0x1a1a2e, 1);
  g.fillCircle(${cx - eyeSpacing}, ${eyeY}, 2.5);
  g.fillCircle(${cx + eyeSpacing}, ${eyeY}, 2.5);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(${cx - eyeSpacing}, ${eyeY}, 1);
  g.fillCircle(${cx + eyeSpacing}, ${eyeY}, 1);
  g.lineStyle(1.5, 0x1a1a2e, 1);
  g.beginPath();
  g.arc(${cx}, ${cy + 6}, 4, 0, Math.PI, false);
  g.strokePath();
  g.fillStyle(0xe76f51, 0.7);
  g.fillEllipse(${cx + 2}, ${cy + 8}, 4, 6);`

    default:
      return ""
  }
}

function renderPhaserHair(hair: string, hairColorNum: string, d: Dims): string {
  if (hair === "none") return "// no hair"

  const cx = d.headCx
  const cy = d.headCy
  const r = d.headR

  switch (hair) {
    case "short":
      return `g.fillStyle(${hairColorNum}, 1);
  g.beginPath();
  g.arc(${cx}, ${cy - 2}, ${r + 1}, Math.PI, 0, false);
  g.closePath();
  g.fillPath();`

    case "spiky":
      return `g.fillStyle(${hairColorNum}, 1);
  g.fillTriangle(${cx - r}, ${cy - 4}, ${cx - r + 4}, ${cy - r - 10}, ${cx - 4}, ${cy - r - 2});
  g.fillTriangle(${cx - 5}, ${cy - r - 1}, ${cx}, ${cy - r - 14}, ${cx + 5}, ${cy - r - 1});
  g.fillTriangle(${cx + 4}, ${cy - r - 2}, ${cx + r - 4}, ${cy - r - 10}, ${cx + r}, ${cy - 4});`

    case "long":
      return `g.fillStyle(${hairColorNum}, 1);
  g.beginPath();
  g.arc(${cx}, ${cy - 2}, ${r + 2}, Math.PI, 0, false);
  g.closePath();
  g.fillPath();
  g.fillRoundedRect(${cx - r - 2}, ${cy}, 4, ${d.bodyTop - cy + 14}, 2);
  g.fillRoundedRect(${cx + r - 2}, ${cy}, 4, ${d.bodyTop - cy + 14}, 2);`

    case "curly":
      return `g.fillStyle(${hairColorNum}, 1);
  g.fillCircle(${cx - r + 3}, ${cy - r + 2}, 5);
  g.fillCircle(${cx}, ${cy - r - 1}, 5);
  g.fillCircle(${cx + r - 3}, ${cy - r + 2}, 5);
  g.fillCircle(${cx - r + 1}, ${cy - r + 7}, 4);
  g.fillCircle(${cx + r - 1}, ${cy - r + 7}, 4);`

    case "ponytail":
      return `g.fillStyle(${hairColorNum}, 1);
  g.beginPath();
  g.arc(${cx}, ${cy - 2}, ${r + 1}, Math.PI, 0, false);
  g.closePath();
  g.fillPath();
  g.lineStyle(5, parseInt(${hairColorNum}), 1);
  g.beginPath();
  g.moveTo(${cx + r - 2}, ${cy - 4});
  g.lineTo(${cx + r + 10}, ${cy - 6});
  g.lineTo(${cx + r + 8}, ${cy + 10});
  g.strokePath();`

    case "mohawk":
      return `g.fillStyle(${hairColorNum}, 1);
  g.fillRoundedRect(${cx - 3}, ${cy - r - 12}, 6, ${r + 8}, 3);`

    case "bun":
      return `g.fillStyle(${hairColorNum}, 1);
  g.beginPath();
  g.arc(${cx}, ${cy - 2}, ${r + 1}, Math.PI, 0, false);
  g.closePath();
  g.fillPath();
  g.fillCircle(${cx}, ${cy - r - 5}, 7);`

    case "cap":
      return `g.fillStyle(${hairColorNum}, 1);
  g.beginPath();
  g.arc(${cx}, ${cy - 2}, ${r + 3}, Math.PI, 0, false);
  g.closePath();
  g.fillPath();
  g.fillRoundedRect(${cx - r - 6}, ${cy - 5}, ${r * 2 + 12}, 3, 1.5);
  g.fillRoundedRect(${cx + r}, ${cy - 7}, 10, 3, 1.5);`

    case "crown":
      return `g.fillStyle(0xf7dc6f, 1);
  g.fillTriangle(${cx - 8}, ${cy - r + 1}, ${cx - 5}, ${cy - r - 8}, ${cx - 1}, ${cy - r - 2});
  g.fillTriangle(${cx - 1}, ${cy - r - 2}, ${cx}, ${cy - r - 10}, ${cx + 1}, ${cy - r - 2});
  g.fillTriangle(${cx + 1}, ${cy - r - 2}, ${cx + 5}, ${cy - r - 8}, ${cx + 8}, ${cy - r + 1});
  g.fillStyle(0xe76f51, 1);
  g.fillCircle(${cx - 5}, ${cy - r - 7}, 1.5);
  g.fillStyle(0x8ecae6, 1);
  g.fillCircle(${cx}, ${cy - r - 9}, 1.5);
  g.fillStyle(0xce93d8, 1);
  g.fillCircle(${cx + 5}, ${cy - r - 7}, 1.5);`

    default:
      return "// no hair"
  }
}

function renderPhaserAccessory(acc: string, d: Dims): string {
  if (acc === "none") return "// no accessory"
  const cx = d.headCx
  const cy = d.headCy
  const r = d.headR

  switch (acc) {
    case "glasses":
      return `g.lineStyle(1.5, 0x555555, 1);
  g.strokeCircle(${cx - 6}, ${cy - 2}, 4);
  g.strokeCircle(${cx + 6}, ${cy - 2}, 4);
  g.lineBetween(${cx - 2}, ${cy - 2}, ${cx + 2}, ${cy - 2});
  g.lineStyle(1, 0x555555, 1);
  g.lineBetween(${cx - 10}, ${cy - 2}, ${cx - r}, ${cy - 4});
  g.lineBetween(${cx + 10}, ${cy - 2}, ${cx + r}, ${cy - 4});`

    case "scarf":
      return `g.lineStyle(4, 0xe76f51, 1);
  g.beginPath();
  g.arc(${cx}, ${cy + r - 1}, ${r - 2}, 0.2, Math.PI - 0.2, false);
  g.strokePath();
  g.fillStyle(0xe76f51, 1);
  g.fillRoundedRect(${cx + 4}, ${cy + r - 2}, 4, 10, 2);`

    case "cape":
      return `g.fillStyle(0x7b68ee, 0.6);
  g.fillTriangle(${cx - 8}, ${d.bodyTop + 2}, ${cx - 14}, ${d.bodyBottom + 12}, ${cx}, ${d.bodyBottom + 8});
  g.fillTriangle(${cx + 8}, ${d.bodyTop + 2}, ${cx + 14}, ${d.bodyBottom + 12}, ${cx}, ${d.bodyBottom + 8});`

    case "crown":
      return `g.fillStyle(0xf7dc6f, 1);
  g.fillTriangle(${cx - 8}, ${cy - r + 1}, ${cx - 5}, ${cy - r - 8}, ${cx}, ${cy - r - 2});
  g.fillTriangle(${cx}, ${cy - r - 2}, ${cx}, ${cy - r - 10}, ${cx}, ${cy - r - 2});
  g.fillTriangle(${cx}, ${cy - r - 2}, ${cx + 5}, ${cy - r - 8}, ${cx + 8}, ${cy - r + 1});`

    case "headband":
      return `g.lineStyle(2.5, 0xff8a80, 1);
  g.beginPath();
  g.arc(${cx}, ${cy - 2}, ${r}, Math.PI + 0.3, -0.3, false);
  g.strokePath();`

    default:
      return "// no accessory"
  }
}

function renderPhaserLimbs(body: string, d: Dims): string {
  const cx = d.bodyCx
  const armY = d.bodyTop + 6
  const armLen = body === "small" ? 12 : 16
  const armOffset = body === "stick" ? 0 : d.bodyWidth
  const armHalf = body === "stick" ? 0 : d.bodyWidth / 2

  const legTop = d.bodyBottom
  const legLen = body === "small" ? 14 : 18
  const legSpread = body === "stick" ? 8 : d.bodyWidth * 0.6
  const legInner = body === "stick" ? 0 : legSpread * 0.3

  return `// Arms
  g.lineBetween(${cx - armOffset}, ${armY}, ${cx - armLen - armHalf}, ${armY + 14});
  g.lineBetween(${cx + armOffset}, ${armY}, ${cx + armLen + armHalf}, ${armY + 14});
  // Legs
  g.lineBetween(${cx - legInner}, ${legTop}, ${cx - legSpread}, ${legTop + legLen});
  g.lineBetween(${cx + legInner}, ${legTop}, ${cx + legSpread}, ${legTop + legLen});`
}

// ---------------------------------------------------------------------------
// Hex utilities
// ---------------------------------------------------------------------------

function hexToNumStr(hex: string): string {
  return "0x" + hex.replace("#", "")
}

function darkenHex(hex: string, amount: number): string {
  const c = hex.replace("#", "")
  const r = Math.max(0, Math.round(parseInt(c.substring(0, 2), 16) * (1 - amount)))
  const g = Math.max(0, Math.round(parseInt(c.substring(2, 4), 16) * (1 - amount)))
  const b = Math.max(0, Math.round(parseInt(c.substring(4, 6), 16) * (1 - amount)))
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}
