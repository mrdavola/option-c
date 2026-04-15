// Game engine registry — all 21 engines.

import type { ThemeConfig, MathParams, GameEngine, GameOption, RoundData } from "./engine-types"
import { balanceSystemsPhaserEngine } from "./balance-systems-phaser"
import { aboveBelowZeroPhaserEngine } from "./above-below-zero-phaser"
import { scoringRankingPhaserEngine } from "./scoring-ranking-phaser"
import { collectManagePhaserEngine } from "./collect-manage-phaser"
import { terrainGenerationPhaserEngine } from "./terrain-generation-phaser"
import { scalingResizingPhaserEngine } from "./scaling-resizing-phaser"
import { constructionSystemsPhaserEngine } from "./construction-systems-phaser"
import { timingRhythmPhaserEngine } from "./timing-rhythm-phaser"
import { inventoryCraftingPhaserEngine } from "./inventory-crafting-phaser"
import { biddingAuctionPhaserEngine } from "./bidding-auction-phaser"
import { measurementChallengesPhaserEngine } from "./measurement-challenges-phaser"
import { strategyEconomyPhaserEngine } from "./strategy-economy-phaser"
import { constraintPuzzlesPhaserEngine } from "./constraint-puzzles-phaser"
import { partitioningPhaserEngine } from "./partitioning-phaser"
import { probabilitySystemsPhaserEngine } from "./probability-systems-phaser"
import { spatialPuzzlesPhaserEngine } from "./spatial-puzzles-phaser"
import { pathOptimizationPhaserEngine } from "./path-optimization-phaser"
import { raceCalculateEngine } from "./race-calculate"
import { motionSimulationPhaserEngine } from "./motion-simulation-phaser"
import { buildStructurePhaserEngine } from "./build-structure-phaser"
import { measurementTimePhaserEngine } from "./measurement-time-phaser"
import { montessoriPhaserEngine } from "./montessori-phaser"
import { singaporeCpaPhaserEngine } from "./singapore-cpa-phaser"
import { standardPedagogyPhaserEngine } from "./standard-pedagogy-phaser"
import { middleSchoolGapsPhaserEngine } from "./middle-school-gaps-phaser"
import { classicOverlaysPhaserEngine } from "./classic-overlays-phaser"
import { numberFramesEngine } from "./number-frames"

const ENGINE_REGISTRY: Record<string, GameEngine> = {
  "resource-management": collectManagePhaserEngine,
  "partitioning": partitioningPhaserEngine,
  "balance-systems": balanceSystemsPhaserEngine,
  "spatial-puzzles": spatialPuzzlesPhaserEngine,
  "probability-systems": probabilitySystemsPhaserEngine,
  "path-optimization": pathOptimizationPhaserEngine,
  "construction-systems": constructionSystemsPhaserEngine,
  "motion-simulation": motionSimulationPhaserEngine,
  "constraint-puzzles": constraintPuzzlesPhaserEngine,
  "strategy-economy": strategyEconomyPhaserEngine,
  "measurement-challenges": measurementChallengesPhaserEngine,
  "scoring-ranking": scoringRankingPhaserEngine,
  "timing-rhythm": timingRhythmPhaserEngine,
  "scaling-resizing": scalingResizingPhaserEngine,
  "inventory-crafting": inventoryCraftingPhaserEngine,
  "terrain-generation": terrainGenerationPhaserEngine,
  "bidding-auction": biddingAuctionPhaserEngine,
  "above-below-zero": aboveBelowZeroPhaserEngine,
  "build-structure": buildStructurePhaserEngine,
  "measurement-time": measurementTimePhaserEngine,
  "montessori-materials": montessoriPhaserEngine,
  "singapore-cpa": singaporeCpaPhaserEngine,
  "standard-pedagogy": standardPedagogyPhaserEngine,
  "middle-school-gaps": middleSchoolGapsPhaserEngine,
  "classic-overlays": classicOverlaysPhaserEngine,
  "number-frames": numberFramesEngine,
}

export function hasEngine(mechanicId: string): boolean {
  return mechanicId in ENGINE_REGISTRY
}

export function generateWithEngine(
  mechanicId: string,
  config: ThemeConfig,
  mathParams: MathParams,
  option?: GameOption
): string | null {
  const engine = ENGINE_REGISTRY[mechanicId]
  if (!engine) return null
  return engine(config, mathParams, option)
}

export function getAvailableEngines(): string[] {
  return Object.keys(ENGINE_REGISTRY)
}

export type { ThemeConfig, MathParams, GameEngine, GameOption, RoundData }
export { DEFAULT_PALETTE } from "./engine-types"
