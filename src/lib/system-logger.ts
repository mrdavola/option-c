// System Logger — writes events to Firestore for analytics, cost tracking,
// and debugging. Used by API routes and the Historian agent.
//
// Collections:
//   system_logs    — every game generation, paste, hint event
//   cost_tracking  — daily aggregated API costs
//
// All logging is fire-and-forget (non-blocking). Failures are caught
// and logged to console, never thrown to the caller.

import { getAdminDb } from "./firebase-admin"

// ─── Event Types ──────────────────────────────────────────────────────

export interface GameGenerationEvent {
  type: "game_generation"
  standardId: string
  gameOption: string
  mechanicId: string
  skeletonMode: boolean
  roundSource: "hardcoded" | "ai" | "fallback"
  roundCount: number
  durationMs: number
  tokensUsed?: number
  estimatedCost?: number
  result: "served" | "rejected" | "error"
  errorMessage?: string
}

export interface HtmlPasteEvent {
  type: "html_paste"
  standardId: string
  learnerId: string
  htmlSizeBytes: number
  securityFlags: string[]
  contentFlags: string[]
  qualityJudge?: {
    playable: boolean
    authentic: boolean
    essential: boolean
  }
  result: "passed" | "rejected" | "error"
  tokensUsed?: number
  estimatedCost?: number
}

export interface HintEvent {
  type: "hint_used"
  standardId: string
  learnerId: string
  gameId?: string
}

export interface GamePlayEvent {
  type: "game_play"
  standardId: string
  learnerId: string
  gameId: string
  outcome: "win" | "lose"
  hintUsed: boolean
  score?: number
}

export type SystemEvent = GameGenerationEvent | HtmlPasteEvent | HintEvent | GamePlayEvent

// ─── Cost Estimation ──────────────────────────────────────────────────

// Haiku pricing (per million tokens, as of April 2026)
const HAIKU_INPUT_PER_M = 0.25
const HAIKU_OUTPUT_PER_M = 1.25

export function estimateCost(inputTokens: number, outputTokens: number): number {
  return (inputTokens / 1_000_000) * HAIKU_INPUT_PER_M +
         (outputTokens / 1_000_000) * HAIKU_OUTPUT_PER_M
}

// ─── Logging ──────────────────────────────────────────────────────────

export async function logEvent(event: SystemEvent): Promise<void> {
  try {
    const adminDb = getAdminDb()
    await adminDb.collection("system_logs").add({
      ...event,
      timestamp: Date.now(),
      date: new Date().toISOString().split("T")[0], // YYYY-MM-DD for aggregation
    })
  } catch (err) {
    // Fire-and-forget — never block the caller
    console.warn("[system-logger] Failed to log event:", err)
  }
}

// ─── Convenience Wrappers ─────────────────────────────────────────────

export function logGameGeneration(params: Omit<GameGenerationEvent, "type">): void {
  logEvent({ type: "game_generation", ...params })
}

export function logHtmlPaste(params: Omit<HtmlPasteEvent, "type">): void {
  logEvent({ type: "html_paste", ...params })
}

export function logHintUsed(params: Omit<HintEvent, "type">): void {
  logEvent({ type: "hint_used", ...params })
}

export function logGamePlay(params: Omit<GamePlayEvent, "type">): void {
  logEvent({ type: "game_play", ...params })
}
