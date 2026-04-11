// Game engine registry.
// Maps mechanic IDs to their pre-built game engines.

import type { ThemeConfig, MathParams, GameEngine } from "./engine-types"
import { balanceEqualizeEngine } from "./balance-equalize"
import { riseFallEngine } from "./rise-fall"

// Registry of all available engines
const ENGINE_REGISTRY: Record<string, GameEngine> = {
  "balance-systems": balanceEqualizeEngine,
  "above-below-zero": riseFallEngine,
}

// Check if a mechanic has a pre-built engine
export function hasEngine(mechanicId: string): boolean {
  return mechanicId in ENGINE_REGISTRY
}

// Generate a game using a pre-built engine
export function generateWithEngine(
  mechanicId: string,
  config: ThemeConfig,
  mathParams: MathParams
): string | null {
  const engine = ENGINE_REGISTRY[mechanicId]
  if (!engine) return null
  return engine(config, mathParams)
}

// Get list of all available engine IDs
export function getAvailableEngines(): string[] {
  return Object.keys(ENGINE_REGISTRY)
}

export type { ThemeConfig, MathParams, GameEngine }
export { VIBE_PALETTES } from "./engine-types"
