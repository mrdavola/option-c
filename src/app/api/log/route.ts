import { NextRequest, NextResponse } from "next/server"
import { logEvent, type SystemEvent } from "@/lib/system-logger"

const ALLOWED_TYPES = new Set([
  "game_play",
  "session_start",
  "session_end",
  "moon_opened",
  "planet_opened",
  "galaxy_search",
  "gate_started",
  "gate_step_completed",
  "gate_passed",
  "game_started",
  "game_abandoned",
  "hint_used",
  "builder_started",
  "builder_scenario_written",
  "builder_game_submitted",
  "builder_game_approved",
  "builder_game_rejected",
])

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.type || !ALLOWED_TYPES.has(body.type)) {
      return NextResponse.json({ error: "invalid event type" }, { status: 400 })
    }
    logEvent(body as SystemEvent)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 })
  }
}
