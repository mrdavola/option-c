// System Logger — writes events to Firestore for analytics, cost tracking,
// and the PROPRIETARY DATASET of how learners learn.
//
// Collections:
//   system_logs    — every game generation, paste, hint event
//   learning_data  — per-round performance, misconceptions, timing (THE DATASET)
//   sessions       — login/logout, session duration, navigation
//   cost_tracking  — daily aggregated API costs
//
// All logging is fire-and-forget (non-blocking). Failures are caught
// and logged to console, never thrown to the caller.
//
// THIS DATA IS NEVER OPEN SOURCED. It is our competitive advantage.

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
  sessionDurationMs?: number
  roundsCompleted?: number
  roundsTotal?: number
  rounds?: RoundResult[]
}

// ─── PROPRIETARY DATASET: Per-Round Learning Data ─────────────────────

export interface RoundResult {
  roundIndex: number
  correct: boolean
  learnerAnswer: number | string | null
  correctAnswer: number | string
  timeMs: number
  attempts: number
  hintUsed: boolean
  kind?: string  // "add" | "sub" | "decompose" etc.
  problem?: string  // human-readable: "2 + 1 = ?"
}

// ─── Session & Navigation Events ──────────────────────────────────────

export interface SessionEvent {
  type: "session_start" | "session_end"
  learnerId: string
  grade?: string
  device?: string
  screenWidth?: number
  screenHeight?: number
  sessionDurationMs?: number
}

export interface NavigationEvent {
  type: "moon_opened" | "planet_opened" | "galaxy_search" | "gate_started" | "gate_step_completed" | "gate_passed" | "game_started" | "game_abandoned"
  learnerId: string
  standardId?: string
  planetId?: string
  searchQuery?: string
  gateStep?: number
  gateStepName?: string
  timeMs?: number
  attempts?: number
}

export interface BuilderEvent {
  type: "builder_started" | "builder_scenario_written" | "builder_game_submitted" | "builder_game_approved" | "builder_game_rejected"
  learnerId: string
  standardId: string
  gameId?: string
  scenarioText?: string
  criteriaResults?: { criterion1: boolean; criterion2: boolean; criterion3: boolean }
  iterationCount?: number
  timeMs?: number
}

export type SystemEvent =
  | GameGenerationEvent
  | HtmlPasteEvent
  | HintEvent
  | GamePlayEvent
  | SessionEvent
  | NavigationEvent
  | BuilderEvent

// ─── Cost Estimation ──────────────────────────────────────────────────

// Haiku pricing (per million tokens, as of April 2026)
const HAIKU_INPUT_PER_M = 0.25
const HAIKU_OUTPUT_PER_M = 1.25

export function estimateCost(inputTokens: number, outputTokens: number): number {
  return (inputTokens / 1_000_000) * HAIKU_INPUT_PER_M +
         (outputTokens / 1_000_000) * HAIKU_OUTPUT_PER_M
}

// ─── Logging ──────────────────────────────────────────────────────────

function collectionForEvent(type: string): string {
  if (type === "session_start" || type === "session_end") return "sessions"
  if (type === "game_play") return "learning_data"
  return "system_logs"
}

export async function logEvent(event: SystemEvent): Promise<void> {
  try {
    const adminDb = getAdminDb()
    const col = collectionForEvent(event.type)
    await adminDb.collection(col).add({
      ...event,
      timestamp: Date.now(),
      date: new Date().toISOString().split("T")[0],
    })
  } catch (err) {
    console.warn("[system-logger] Failed to log event:", err)
  }
}

// ─── Convenience Wrappers (server-side) ───────────────────────────────
// For client-side logging, use @/lib/log-client (browser-safe, no firebase-admin).

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

export function logSession(params: Omit<SessionEvent, "type"> & { type: SessionEvent["type"] }): void {
  logEvent(params)
}

export function logNavigation(params: Omit<NavigationEvent, "type"> & { type: NavigationEvent["type"] }): void {
  logEvent(params)
}

export function logBuilder(params: Omit<BuilderEvent, "type"> & { type: BuilderEvent["type"] }): void {
  logEvent(params)
}
