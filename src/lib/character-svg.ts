// SVG renderer for CharacterConfig.
// Returns an SVG string that can be used as an inline image, data-url, etc.

import type {
  CharacterConfig,
  BodyType,
  HairStyle,
  Accessory,
  Expression,
} from "./character-config"

/** Render a full character SVG string (120x120 viewBox). */
export function renderCharacterSvg(config: CharacterConfig): string {
  const { body, color, hair, accessory, expression } = config
  const dims = bodyDimensions(body)

  const parts: string[] = []

  // Body
  parts.push(renderBody(body, color, dims))
  // Head
  parts.push(renderHead(color, dims))
  // Expression (face)
  parts.push(renderExpression(expression, dims))
  // Hair
  parts.push(renderHair(hair, color, dims))
  // Accessory
  parts.push(renderAccessory(accessory, dims))
  // Limbs
  parts.push(renderLimbs(body, color, dims))

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">`,
    ...parts,
    `</svg>`,
  ].join("\n")
}

/** Returns a data: URL for embedding. */
export function characterSvgDataUrl(config: CharacterConfig): string {
  const svg = renderCharacterSvg(config)
  return `data:image/svg+xml;base64,${typeof btoa !== "undefined" ? btoa(unescape(encodeURIComponent(svg))) : Buffer.from(svg).toString("base64")}`
}

// ---------------------------------------------------------------------------
// Internal geometry helpers
// ---------------------------------------------------------------------------

interface BodyDims {
  headCx: number
  headCy: number
  headR: number
  bodyCx: number
  bodyTop: number
  bodyBottom: number
  bodyWidth: number
}

function bodyDimensions(body: BodyType): BodyDims {
  switch (body) {
    case "stick":
      return {
        headCx: 60,
        headCy: 28,
        headR: 14,
        bodyCx: 60,
        bodyTop: 44,
        bodyBottom: 90,
        bodyWidth: 2,
      }
    case "round":
      return {
        headCx: 60,
        headCy: 28,
        headR: 16,
        bodyCx: 60,
        bodyTop: 46,
        bodyBottom: 88,
        bodyWidth: 24,
      }
    case "tall":
      return {
        headCx: 60,
        headCy: 22,
        headR: 13,
        bodyCx: 60,
        bodyTop: 37,
        bodyBottom: 94,
        bodyWidth: 14,
      }
    case "small":
      return {
        headCx: 60,
        headCy: 38,
        headR: 16,
        bodyCx: 60,
        bodyTop: 56,
        bodyBottom: 90,
        bodyWidth: 18,
      }
  }
}

// ---------------------------------------------------------------------------
// Renderers
// ---------------------------------------------------------------------------

function renderBody(body: BodyType, color: string, d: BodyDims): string {
  if (body === "stick") {
    // Simple vertical line
    return `<line x1="${d.bodyCx}" y1="${d.bodyTop}" x2="${d.bodyCx}" y2="${d.bodyBottom}" stroke="${color}" stroke-width="3" stroke-linecap="round"/>`
  }
  if (body === "round") {
    return `<ellipse cx="${d.bodyCx}" cy="${(d.bodyTop + d.bodyBottom) / 2}" rx="${d.bodyWidth}" ry="${(d.bodyBottom - d.bodyTop) / 2}" fill="${color}" opacity="0.85"/>`
  }
  if (body === "tall") {
    const halfW = d.bodyWidth / 2
    return `<rect x="${d.bodyCx - halfW}" y="${d.bodyTop}" width="${d.bodyWidth}" height="${d.bodyBottom - d.bodyTop}" rx="6" fill="${color}" opacity="0.85"/>`
  }
  // small — compact oval
  return `<ellipse cx="${d.bodyCx}" cy="${(d.bodyTop + d.bodyBottom) / 2}" rx="${d.bodyWidth}" ry="${(d.bodyBottom - d.bodyTop) / 2}" fill="${color}" opacity="0.85"/>`
}

function renderHead(color: string, d: BodyDims): string {
  return `<circle cx="${d.headCx}" cy="${d.headCy}" r="${d.headR}" fill="${color}"/>`
}

function renderExpression(expr: Expression, d: BodyDims): string {
  const cx = d.headCx
  const cy = d.headCy
  const parts: string[] = []

  // Eyes
  const eyeSpacing = 6
  const eyeY = cy - 2

  switch (expr) {
    case "happy":
      parts.push(
        `<circle cx="${cx - eyeSpacing}" cy="${eyeY}" r="2" fill="#1a1a2e"/>`,
        `<circle cx="${cx + eyeSpacing}" cy="${eyeY}" r="2" fill="#1a1a2e"/>`,
        `<path d="M${cx - 5} ${cy + 4} Q${cx} ${cy + 9} ${cx + 5} ${cy + 4}" stroke="#1a1a2e" stroke-width="1.5" fill="none" stroke-linecap="round"/>`
      )
      break
    case "determined":
      // Slightly narrowed eyes + straight mouth
      parts.push(
        `<ellipse cx="${cx - eyeSpacing}" cy="${eyeY}" rx="2.5" ry="1.5" fill="#1a1a2e"/>`,
        `<ellipse cx="${cx + eyeSpacing}" cy="${eyeY}" rx="2.5" ry="1.5" fill="#1a1a2e"/>`,
        `<line x1="${cx - 4}" y1="${cy + 5}" x2="${cx + 4}" y2="${cy + 5}" stroke="#1a1a2e" stroke-width="1.5" stroke-linecap="round"/>`
      )
      break
    case "cool":
      // Dash eyes + slight smirk
      parts.push(
        `<line x1="${cx - eyeSpacing - 2}" y1="${eyeY}" x2="${cx - eyeSpacing + 2}" y2="${eyeY}" stroke="#1a1a2e" stroke-width="2" stroke-linecap="round"/>`,
        `<line x1="${cx + eyeSpacing - 2}" y1="${eyeY}" x2="${cx + eyeSpacing + 2}" y2="${eyeY}" stroke="#1a1a2e" stroke-width="2" stroke-linecap="round"/>`,
        `<path d="M${cx - 4} ${cy + 5} Q${cx + 2} ${cy + 7} ${cx + 5} ${cy + 4}" stroke="#1a1a2e" stroke-width="1.5" fill="none" stroke-linecap="round"/>`
      )
      break
    case "silly":
      // Wide eyes + tongue out
      parts.push(
        `<circle cx="${cx - eyeSpacing}" cy="${eyeY}" r="2.5" fill="#1a1a2e"/>`,
        `<circle cx="${cx + eyeSpacing}" cy="${eyeY}" r="2.5" fill="#1a1a2e"/>`,
        `<circle cx="${cx - eyeSpacing}" cy="${eyeY}" r="1" fill="#fff"/>`,
        `<circle cx="${cx + eyeSpacing}" cy="${eyeY}" r="1" fill="#fff"/>`,
        `<path d="M${cx - 4} ${cy + 4} Q${cx} ${cy + 8} ${cx + 4} ${cy + 4}" stroke="#1a1a2e" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
        `<ellipse cx="${cx + 2}" cy="${cy + 8}" rx="2" ry="3" fill="#E76F51" opacity="0.7"/>`
      )
      break
  }

  return parts.join("\n")
}

function renderHair(hair: HairStyle, color: string, d: BodyDims): string {
  if (hair === "none") return ""

  const cx = d.headCx
  const cy = d.headCy
  const r = d.headR
  // Hair is a darker shade of the body color
  const hairColor = darken(color, 0.25)

  switch (hair) {
    case "short":
      return `<path d="M${cx - r} ${cy - 2} Q${cx - r} ${cy - r - 4} ${cx} ${cy - r - 3} Q${cx + r} ${cy - r - 4} ${cx + r} ${cy - 2}" fill="${hairColor}"/>`
    case "spiky":
      return [
        `<polygon points="${cx - r},${cy - 4} ${cx - r + 4},${cy - r - 10} ${cx - 4},${cy - r - 2}" fill="${hairColor}"/>`,
        `<polygon points="${cx - 5},${cy - r - 1} ${cx},${cy - r - 14} ${cx + 5},${cy - r - 1}" fill="${hairColor}"/>`,
        `<polygon points="${cx + 4},${cy - r - 2} ${cx + r - 4},${cy - r - 10} ${cx + r},${cy - 4}" fill="${hairColor}"/>`,
      ].join("\n")
    case "long":
      return [
        `<path d="M${cx - r - 2} ${cy} Q${cx - r - 2} ${cy - r - 6} ${cx} ${cy - r - 4} Q${cx + r + 2} ${cy - r - 6} ${cx + r + 2} ${cy}" fill="${hairColor}"/>`,
        `<rect x="${cx - r - 2}" y="${cy}" width="4" height="${d.bodyTop - cy + 14}" rx="2" fill="${hairColor}"/>`,
        `<rect x="${cx + r - 2}" y="${cy}" width="4" height="${d.bodyTop - cy + 14}" rx="2" fill="${hairColor}"/>`,
      ].join("\n")
    case "curly":
      return [
        `<circle cx="${cx - r + 3}" cy="${cy - r + 2}" r="5" fill="${hairColor}"/>`,
        `<circle cx="${cx}" cy="${cy - r - 1}" r="5" fill="${hairColor}"/>`,
        `<circle cx="${cx + r - 3}" cy="${cy - r + 2}" r="5" fill="${hairColor}"/>`,
        `<circle cx="${cx - r + 1}" cy="${cy - r + 7}" r="4" fill="${hairColor}"/>`,
        `<circle cx="${cx + r - 1}" cy="${cy - r + 7}" r="4" fill="${hairColor}"/>`,
      ].join("\n")
    case "ponytail":
      return [
        `<path d="M${cx - r} ${cy - 2} Q${cx} ${cy - r - 6} ${cx + r} ${cy - 2}" fill="${hairColor}"/>`,
        `<path d="M${cx + r - 2} ${cy - 4} Q${cx + r + 12} ${cy - 8} ${cx + r + 8} ${cy + 10}" stroke="${hairColor}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
      ].join("\n")
    case "mohawk":
      return [
        `<rect x="${cx - 3}" y="${cy - r - 12}" width="6" height="${r + 8}" rx="3" fill="${hairColor}"/>`,
      ].join("\n")
    case "bun":
      return [
        `<path d="M${cx - r} ${cy - 3} Q${cx} ${cy - r - 5} ${cx + r} ${cy - 3}" fill="${hairColor}"/>`,
        `<circle cx="${cx}" cy="${cy - r - 5}" r="7" fill="${hairColor}"/>`,
      ].join("\n")
    case "cap":
      return [
        `<path d="M${cx - r - 3} ${cy - 3} Q${cx - r - 3} ${cy - r - 5} ${cx} ${cy - r - 4} Q${cx + r + 3} ${cy - r - 5} ${cx + r + 3} ${cy - 3}" fill="${hairColor}"/>`,
        `<rect x="${cx - r - 6}" y="${cy - 5}" width="${r * 2 + 12}" height="3" rx="1.5" fill="${hairColor}"/>`,
        `<rect x="${cx + r}" y="${cy - 7}" width="10" height="3" rx="1.5" fill="${hairColor}"/>`,
      ].join("\n")
    case "crown":
      return [
        `<polygon points="${cx - r + 2},${cy - r} ${cx - r + 6},${cy - r - 10} ${cx - 2},${cy - r - 3} ${cx},${cy - r - 12} ${cx + 2},${cy - r - 3} ${cx + r - 6},${cy - r - 10} ${cx + r - 2},${cy - r}" fill="#F7DC6F"/>`,
        `<circle cx="${cx - r + 6}" cy="${cy - r - 9}" r="1.5" fill="#E76F51"/>`,
        `<circle cx="${cx}" cy="${cy - r - 11}" r="1.5" fill="#8ECAE6"/>`,
        `<circle cx="${cx + r - 6}" cy="${cy - r - 9}" r="1.5" fill="#CE93D8"/>`,
      ].join("\n")
    default:
      return ""
  }
}

function renderAccessory(acc: Accessory, d: BodyDims): string {
  if (acc === "none") return ""
  const cx = d.headCx
  const cy = d.headCy
  const r = d.headR

  switch (acc) {
    case "glasses":
      return [
        `<circle cx="${cx - 6}" cy="${cy - 2}" r="4" fill="none" stroke="#555" stroke-width="1.5"/>`,
        `<circle cx="${cx + 6}" cy="${cy - 2}" r="4" fill="none" stroke="#555" stroke-width="1.5"/>`,
        `<line x1="${cx - 2}" y1="${cy - 2}" x2="${cx + 2}" y2="${cy - 2}" stroke="#555" stroke-width="1.5"/>`,
        `<line x1="${cx - 10}" y1="${cy - 2}" x2="${cx - r}" y2="${cy - 4}" stroke="#555" stroke-width="1"/>`,
        `<line x1="${cx + 10}" y1="${cy - 2}" x2="${cx + r}" y2="${cy - 4}" stroke="#555" stroke-width="1"/>`,
      ].join("\n")
    case "scarf":
      return [
        `<path d="M${cx - r + 2} ${cy + r - 4} Q${cx} ${cy + r + 2} ${cx + r - 2} ${cy + r - 4}" stroke="#E76F51" stroke-width="4" fill="none" stroke-linecap="round"/>`,
        `<rect x="${cx + 4}" y="${cy + r - 2}" width="4" height="10" rx="2" fill="#E76F51"/>`,
      ].join("\n")
    case "cape":
      return [
        `<path d="M${cx - 8} ${d.bodyTop + 2} Q${cx - 20} ${d.bodyBottom + 5} ${cx - 14} ${d.bodyBottom + 12} L${cx + 14} ${d.bodyBottom + 12} Q${cx + 20} ${d.bodyBottom + 5} ${cx + 8} ${d.bodyTop + 2}" fill="#7B68EE" opacity="0.6"/>`,
      ].join("\n")
    case "crown":
      return [
        `<polygon points="${cx - 8},${cy - r + 1} ${cx - 5},${cy - r - 8} ${cx - 1},${cy - r - 2} ${cx},${cy - r - 10} ${cx + 1},${cy - r - 2} ${cx + 5},${cy - r - 8} ${cx + 8},${cy - r + 1}" fill="#F7DC6F"/>`,
      ].join("\n")
    case "headband":
      return [
        `<path d="M${cx - r} ${cy - 4} Q${cx} ${cy - r - 2} ${cx + r} ${cy - 4}" stroke="#FF8A80" stroke-width="2.5" fill="none"/>`,
      ].join("\n")
    default:
      return ""
  }
}

function renderLimbs(body: BodyType, color: string, d: BodyDims): string {
  const cx = d.bodyCx
  const limbColor = darken(color, 0.1)
  const sw = body === "stick" ? "2.5" : "3"

  // Arms
  const armY = d.bodyTop + 6
  const armLen = body === "small" ? 12 : 16
  const arms = [
    `<line x1="${cx - (body === "stick" ? 0 : d.bodyWidth)}" y1="${armY}" x2="${cx - armLen - (body === "stick" ? 0 : d.bodyWidth / 2)}" y2="${armY + 14}" stroke="${limbColor}" stroke-width="${sw}" stroke-linecap="round"/>`,
    `<line x1="${cx + (body === "stick" ? 0 : d.bodyWidth)}" y1="${armY}" x2="${cx + armLen + (body === "stick" ? 0 : d.bodyWidth / 2)}" y2="${armY + 14}" stroke="${limbColor}" stroke-width="${sw}" stroke-linecap="round"/>`,
  ]

  // Legs
  const legTop = d.bodyBottom
  const legLen = body === "small" ? 14 : 18
  const legSpread = body === "stick" ? 8 : d.bodyWidth * 0.6
  const legs = [
    `<line x1="${cx - (body === "stick" ? 0 : legSpread * 0.3)}" y1="${legTop}" x2="${cx - legSpread}" y2="${legTop + legLen}" stroke="${limbColor}" stroke-width="${sw}" stroke-linecap="round"/>`,
    `<line x1="${cx + (body === "stick" ? 0 : legSpread * 0.3)}" y1="${legTop}" x2="${cx + legSpread}" y2="${legTop + legLen}" stroke="${limbColor}" stroke-width="${sw}" stroke-linecap="round"/>`,
  ]

  return [...arms, ...legs].join("\n")
}

// ---------------------------------------------------------------------------
// Color utility
// ---------------------------------------------------------------------------

function darken(hex: string, amount: number): string {
  const c = hex.replace("#", "")
  const r = Math.max(0, Math.round(parseInt(c.substring(0, 2), 16) * (1 - amount)))
  const g = Math.max(0, Math.round(parseInt(c.substring(2, 4), 16) * (1 - amount)))
  const b = Math.max(0, Math.round(parseInt(c.substring(4, 6), 16) * (1 - amount)))
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}
