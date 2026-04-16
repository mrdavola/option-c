// Per-standard mapping: standard ID → verified game option IDs.
//
// JANITOR CLEANUP (April 16, 2026):
// Removed all 464 legacy mappings that pointed to broken/unverified games.
// Only verified, Chesure-approved games remain. New games are added here
// one at a time as they pass the full quality gate (Mr. Chesure + Critic + Tester + Barbara).
//
// Legacy mappings are preserved in git history (commit before this one)
// in case we need to reference what was there.

export const STANDARD_GAME_OPTIONS: Record<string, string[]> = {
  // ═══════════════════════════════════════════════════════════════
  // VERIFIED GAMES (Chesure-approved, tested, signed off by Barbara)
  // ═══════════════════════════════════════════════════════════════

  // K.OA.A.1 — Add and take away things
  // Game: Number Frames (add mode) — Math Learning Center-inspired
  // Contract: docs/contracts/K.OA.A.1.md
  // Approved: April 14, 2026
  "K.OA.A.1": ["number-frames"],

  // K.OA.A.3 — Decompose numbers ≤10 into pairs
  // Game: Number Frames (decompose mode) — split a total into two groups
  // Approved: April 14, 2026 (awaiting final Barbara sign-off)
  "K.OA.A.3": ["number-frames-decompose"],
}

/**
 * Returns the game option IDs mapped to a given standard,
 * or null if the standard has no verified game yet.
 */
export function getGameOptionsForStandard(standardId: string): string[] | null {
  return STANDARD_GAME_OPTIONS[standardId] ?? null
}
