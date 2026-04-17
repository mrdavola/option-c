"use client"

import { useEffect, useRef, useState } from "react"

export interface RoundData {
  roundIndex: number
  correct: boolean
  learnerAnswer: number | string | null
  correctAnswer: number | string
  timeMs: number
  attempts: number
  hintUsed: boolean
  kind?: string
  problem?: string
}

export interface GameWinData {
  hintUsed?: boolean
  score?: number
  rounds?: RoundData[]
  sessionDurationMs?: number
}

interface GameIframeProps {
  html: string
  className?: string
  onWin?: (data?: GameWinData) => void
  onLose?: () => void
  onRoundComplete?: (round: RoundData) => void
  /** Max time in seconds before the game is considered crashed. Default: 120 (2 min). */
  timeoutSeconds?: number
}

export function GameIframe({ html, className, onWin, onLose, onRoundComplete, timeoutSeconds = 120 }: GameIframeProps) {
  const onWinRef = useRef(onWin)
  onWinRef.current = onWin
  const onLoseRef = useRef(onLose)
  onLoseRef.current = onLose
  const onRoundRef = useRef(onRoundComplete)
  onRoundRef.current = onRoundComplete
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [crashed, setCrashed] = useState(false)

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.origin !== "null" && e.origin !== window.location.origin) return
      if (e.data?.type === "game_win") {
        onWinRef.current?.({
          hintUsed: !!e.data.hintUsed,
          score: typeof e.data.score === "number" ? e.data.score : undefined,
          rounds: Array.isArray(e.data.rounds) ? e.data.rounds : undefined,
          sessionDurationMs: typeof e.data.sessionDurationMs === "number" ? e.data.sessionDurationMs : undefined,
        })
      }
      if (e.data?.type === "game_lose") {
        onLoseRef.current?.()
      }
      if (e.data?.type === "round_complete") {
        onRoundRef.current?.(e.data.round)
      }
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [])

  // Crash protection: if no game_win or game_lose received within timeout,
  // show a "game may have crashed" overlay with a reload button.
  useEffect(() => {
    let resolved = false
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "game_win" || e.data?.type === "game_lose") {
        resolved = true
      }
    }
    window.addEventListener("message", handler)

    const timer = setTimeout(() => {
      if (!resolved) setCrashed(true)
    }, timeoutSeconds * 1000)

    return () => {
      window.removeEventListener("message", handler)
      clearTimeout(timer)
    }
  }, [html, timeoutSeconds])

  const handleReload = () => {
    setCrashed(false)
    // Force iframe reload by briefly clearing and restoring srcDoc
    if (iframeRef.current) {
      iframeRef.current.srcdoc = ""
      setTimeout(() => {
        if (iframeRef.current) iframeRef.current.srcdoc = html
      }, 100)
    }
  }

  const handleKill = () => {
    // Remove the iframe content entirely
    if (iframeRef.current) {
      iframeRef.current.srcdoc = "<html><body style='background:#fafafa;display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui;color:#71717a;'>Game stopped.</body></html>"
    }
    setCrashed(false)
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <iframe
        ref={iframeRef}
        srcDoc={html}
        sandbox="allow-scripts"
        className={className}
        style={{ border: "none", width: "100%", height: "100%", overflow: "auto" }}
        scrolling="yes"
        title="Game"
      />
      {crashed && (
        <div style={{
          position: "absolute", inset: 0, background: "rgba(250,250,250,0.95)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 12, fontFamily: "'Lexend', system-ui, sans-serif", zIndex: 10,
        }}>
          <p style={{ fontSize: 16, color: "#71717a" }}>This game seems stuck or frozen.</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleReload}
              style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #d1d5db", background: "white", cursor: "pointer", fontSize: 14, fontWeight: 600 }}
            >
              Reload game
            </button>
            <button
              onClick={handleKill}
              style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#ef4444", color: "white", cursor: "pointer", fontSize: 14, fontWeight: 600 }}
            >
              Stop game
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
