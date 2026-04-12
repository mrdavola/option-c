// Item recommendations per game mechanic.
// Suggests 2-3 sprite items that thematically fit the gameplay.
// The learner sees these first but can browse all items.

export const ITEM_RECOMMENDATIONS: Record<string, string[]> = {
  "resource-management": ["coin", "gem", "treasure-chest"],       // collecting items
  "partitioning": ["fruit", "potion", "crystal"],                 // splitting/sharing things
  "balance-systems": ["crystal", "gem", "star"],                  // weights/values on scales
  "spatial-puzzles": ["key", "crystal", "gem"],                   // fitting/rotating pieces
  "probability-systems": ["star", "coin", "gem"],                 // dice/spinners/stats
  "path-optimization": ["key", "treasure-chest", "star"],         // navigating to treasure
  "construction-systems": ["mushroom", "crystal", "shell"],       // building blocks
  "motion-simulation": ["star", "coin", "potion"],                // speed/distance targets
  "constraint-puzzles": ["key", "potion", "crystal"],             // unlocking answers
  "strategy-economy": ["coin", "gem", "treasure-chest"],          // investment/growth
  "measurement-challenges": ["fruit", "shell", "mushroom"],       // measuring objects
  "scoring-ranking": ["star", "gem", "coin"],                     // sorting/ordering
  "timing-rhythm": ["star", "crystal", "potion"],                 // patterns/sequences
  "scaling-resizing": ["fruit", "potion", "mushroom"],            // scaling recipes/items
  "inventory-crafting": ["potion", "crystal", "fruit"],           // mixing/crafting
  "terrain-generation": ["treasure-chest", "key", "star"],        // finding on coordinate grid
  "bidding-auction": ["coin", "gem", "treasure-chest"],           // estimating value
  "above-below-zero": ["crystal", "star", "potion"],              // positive/negative
  "build-structure": ["mushroom", "shell", "crystal"],            // building with shapes
}

// Get recommended items for a mechanic, falling back to generic picks
export function getRecommendedItems(mechanicId: string): string[] {
  return ITEM_RECOMMENDATIONS[mechanicId] || ["coin", "star", "gem"]
}
