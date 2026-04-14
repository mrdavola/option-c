// Simple SVG background patterns for use as alternatives to photo backgrounds.
// Each is a subtle, low-opacity pattern encoded as a data URI.
// Usage: pass a pattern's `dataUri` as a CSS background-image.

export interface SimpleBackground {
  id: string
  label: string
  dataUri: string
}

const svgToDataUri = (svg: string): string =>
  `data:image/svg+xml,${encodeURIComponent(svg.trim())}`

// Subtle grid pattern
const gridSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
  <rect width="40" height="40" fill="none"/>
  <path d="M40 0H0v40" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>
</svg>`

// Dot pattern
const dotsSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
  <circle cx="12" cy="12" r="1.2" fill="rgba(255,255,255,0.07)"/>
</svg>`

// Diagonal lines pattern
const diagonalLinesSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">
  <path d="M0 20L20 0" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.7"/>
</svg>`

// Hexagon pattern
const hexagonsSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="48">
  <path d="M14 0L28 8L28 24L14 32L0 24L0 8Z" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/>
  <path d="M42 16L56 24L56 40L42 48L28 40L28 24Z" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/>
</svg>`

// Circles pattern
const circlesSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48">
  <circle cx="24" cy="24" r="10" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/>
</svg>`

// Waves pattern
const wavesSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="20">
  <path d="M0 10 Q20 0 40 10 Q60 20 80 10" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.7"/>
</svg>`

export const SIMPLE_BACKGROUNDS: SimpleBackground[] = [
  { id: "grid", label: "Grid", dataUri: svgToDataUri(gridSvg) },
  { id: "dots", label: "Dots", dataUri: svgToDataUri(dotsSvg) },
  { id: "diagonal-lines", label: "Diagonal Lines", dataUri: svgToDataUri(diagonalLinesSvg) },
  { id: "hexagons", label: "Hexagons", dataUri: svgToDataUri(hexagonsSvg) },
  { id: "circles", label: "Circles", dataUri: svgToDataUri(circlesSvg) },
  { id: "waves", label: "Waves", dataUri: svgToDataUri(wavesSvg) },
]

/** Look up a simple background by ID. Returns undefined if not found. */
export function getSimpleBackground(id: string): SimpleBackground | undefined {
  return SIMPLE_BACKGROUNDS.find((b) => b.id === id)
}
