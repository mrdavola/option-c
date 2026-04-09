"use client"

import { useState } from "react"
import type { StandardNode } from "@/lib/graph-types"
import { ArrowLeft, Check, X, AlertTriangle, Sparkles } from "lucide-react"

interface ImportHtmlProps {
  standard: StandardNode
  onCancel: () => void
  // Called when the imported HTML passes the AI judge AND is ready for the
  // workshop. The parent should switch into Workshop mode with this HTML
  // and a synthesised design doc.
  onPass: (params: {
    title: string
    html: string
    visualConcept: string[]
  }) => void
}

interface JudgeResult {
  playable: boolean
  authentic: boolean
  essential: boolean
  feedback: string
}

// Local-only validation before we even talk to the AI. Cheap and fast.
function localValidate(html: string): string | null {
  if (html.trim().length < 100) {
    return "That HTML looks too short. Paste a complete HTML file."
  }
  const lower = html.toLowerCase()
  if (!lower.includes("<!doctype html") && !lower.includes("<html")) {
    return "The HTML must start with <!DOCTYPE html> or <html>. Paste a full HTML document."
  }
  // We REQUIRE the game to post game_win at some point, otherwise the
  // workshop can never unlock the Send-for-Review button.
  const hasGameWin = /game_win|gameWin\s*\(/.test(html)
  if (!hasGameWin) {
    return "The game must signal a win. Add: function gameWin() { window.parent.postMessage({type:'game_win'}, '*'); } and call gameWin() when the player wins."
  }
  return null
}

// Full-screen overlay for importing a learner's own HTML game.
// Layout: title + textarea on the left, AI judge feedback on the right.
export function ImportHtml({ standard, onCancel, onPass }: ImportHtmlProps) {
  const [title, setTitle] = useState("")
  const [html, setHtml] = useState("")
  const [busy, setBusy] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null)
  const [judgeError, setJudgeError] = useState<string | null>(null)

  const allMet = judgeResult && judgeResult.playable && judgeResult.authentic && judgeResult.essential

  const handleCheck = async () => {
    setLocalError(null)
    setJudgeError(null)
    setJudgeResult(null)
    if (!title.trim()) {
      setLocalError("Give your game a title.")
      return
    }
    const v = localValidate(html)
    if (v) {
      setLocalError(v)
      return
    }
    setBusy(true)
    try {
      const res = await fetch("/api/game/judge-html", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html,
          standardDescription: standard.description,
          standardId: standard.id,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setJudgeError(data.error || "The AI couldn't judge your game. Try again.")
      } else {
        setJudgeResult(data)
      }
    } catch (err) {
      setJudgeError(err instanceof Error ? err.message : "Network error")
    } finally {
      setBusy(false)
    }
  }

  const handleContinue = () => {
    if (!allMet) return
    // Build a tiny visual concept from the title — the parent will
    // attach this to the design doc so My Stuff and the library card
    // have something to show.
    onPass({
      title: title.trim(),
      html,
      visualConcept: [`🎮 ${title.trim()}`, `📥 Imported HTML game`],
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/90 gap-3">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-sm text-zinc-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="size-4" />
          Cancel
        </button>
        <h2 className="text-sm font-semibold text-white truncate">
          Paste your own HTML game · {standard.description.slice(0, 60)}
        </h2>
        <div className="w-16" />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: paste form */}
        <div className="flex-1 md:w-[60%] md:flex-none p-4 space-y-3 overflow-y-auto border-r border-zinc-800">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your game a name"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">
              HTML (paste a complete HTML file)
            </label>
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder={`<!DOCTYPE html>\n<html>\n<head>...</head>\n<body>\n  ...\n  <script>\n    function gameWin() {\n      window.parent.postMessage({type:'game_win'}, '*')\n    }\n    function gameLose() {\n      window.parent.postMessage({type:'game_lose'}, '*')\n    }\n    // call gameWin() when the player wins\n  </script>\n</body>\n</html>`}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-none"
              rows={22}
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              The game must call <code className="text-zinc-300">gameWin()</code> when the player wins.
              The parent app uses that to know you played and won.
            </p>
          </div>

          {localError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-300 flex items-start gap-2">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <span>{localError}</span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleCheck}
              disabled={busy || !html.trim() || !title.trim()}
              className="flex-1 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="size-4" />
              {busy ? "Checking..." : judgeResult ? "Check again" : "Check it"}
            </button>
            {allMet && (
              <button
                onClick={handleContinue}
                className="flex-1 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
              >
                Continue →
              </button>
            )}
          </div>
        </div>

        {/* Right: AI feedback panel */}
        <div className="hidden md:flex md:w-[40%] flex-col bg-zinc-925">
          <div className="px-4 py-3 border-b border-zinc-800">
            <p className="text-sm text-white font-semibold">AI feedback</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Check that your game meets all 3 criteria before submitting.
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {!judgeResult && !busy && !judgeError && (
              <div className="text-center text-zinc-500 text-sm py-8">
                Paste your HTML on the left and click <strong>Check it</strong>.
              </div>
            )}
            {busy && (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-zinc-300">Reading your game...</p>
              </div>
            )}
            {judgeError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-300">
                {judgeError}
              </div>
            )}
            {judgeResult && (
              <div className="space-y-3">
                <CriteriaRow met={judgeResult.playable} label="Playable" hint="Others can understand and play it" />
                <CriteriaRow met={judgeResult.authentic} label="Authentic math" hint="The concept is applied like in real life" />
                <CriteriaRow met={judgeResult.essential} label="Math is essential" hint="You can't win without using the math" />
                <div className={`rounded-lg p-3 text-sm ${
                  allMet
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                    : "bg-amber-500/10 border border-amber-500/30 text-amber-200"
                }`}>
                  {judgeResult.feedback}
                </div>
                {allMet && (
                  <p className="text-xs text-zinc-400 text-center">
                    Click <strong>Continue →</strong> to test your game and win it before submitting for review.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function CriteriaRow({ met, label, hint }: { met: boolean; label: string; hint: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className={`mt-0.5 size-5 rounded-full flex items-center justify-center ${
        met ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-700 text-zinc-500"
      }`}>
        {met ? <Check className="size-3.5" /> : <X className="size-3.5" />}
      </div>
      <div>
        <p className={`text-sm font-medium ${met ? "text-emerald-300" : "text-zinc-400"}`}>
          {label}
        </p>
        <p className="text-[11px] text-zinc-500">{hint}</p>
      </div>
    </div>
  )
}
