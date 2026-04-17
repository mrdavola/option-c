"use client"

import { useState } from "react"
import type { StandardNode } from "@/lib/graph-types"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { sanitizeGameHtml } from "@/lib/html-sanitizer"

interface ImportHtmlProps {
  standard: StandardNode
  onCancel: () => void
  onPass: (params: {
    title: string
    html: string
    visualConcept: string[]
  }) => void
}

function localValidate(html: string): string | null {
  if (html.trim().length < 100) {
    return "That HTML looks too short. Paste a complete HTML file."
  }
  const lower = html.toLowerCase()
  if (!lower.includes("<!doctype html") && !lower.includes("<html")) {
    return "The HTML must start with <!DOCTYPE html> or <html>. Paste a full HTML document."
  }
  return null
}

function ensureGameWin(html: string): string {
  if (/game_win|gameWin\s*\(/.test(html)) return html
  const script = `<script>
window._diag_wins = 0;
document.addEventListener('click', function() {
  window._diag_wins++;
  if (window._diag_wins >= 20) {
    try { window.parent.postMessage({type:'game_win', score: 1}, '*'); } catch(e) {}
  }
});
</script>`
  return html.replace("</body>", script + "</body>")
}

export function ImportHtml({ standard, onCancel, onPass }: ImportHtmlProps) {
  const [title, setTitle] = useState("")
  const [html, setHtml] = useState("")
  const [localError, setLocalError] = useState<string | null>(null)

  const canSubmit = title.trim().length > 0 && html.trim().length > 100

  const handleSubmit = () => {
    setLocalError(null)
    if (!title.trim()) {
      setLocalError("Give your game a title.")
      return
    }
    const v = localValidate(html)
    if (v) {
      setLocalError(v)
      return
    }
    const cleanHtml = ensureGameWin(sanitizeGameHtml(html))
    onPass({
      title: title.trim(),
      html: cleanHtml,
      visualConcept: [`${title.trim()}`, `Imported HTML game`],
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "linear-gradient(135deg, #09090b 0%, #0c1222 50%, #09090b 100%)", fontFamily: "'Lexend', system-ui, sans-serif" }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 shrink-0">
        <button onClick={onCancel} className="flex items-center gap-1.5 text-sm text-zinc-300 hover:text-white transition-colors">
          <ArrowLeft className="size-4" />
          Back
        </button>
        <p className="text-xs text-zinc-400 font-mono">{standard.id}</p>
        <div className="w-16" />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-8 space-y-5">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Paste your game
            </h2>
            <p className="text-sm text-zinc-200">
              Built a game in Google AI Studio or another tool? Paste the HTML here.
            </p>
          </div>

          <div>
            <label className="text-xs text-zinc-300 block mb-1">Game title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your game a name"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="rounded-xl p-3 space-y-1" style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.3)" }}>
            <p className="text-sm font-semibold text-yellow-400">How to get your HTML:</p>
            <ol className="text-xs text-yellow-200/80 space-y-0.5 list-decimal list-inside">
              <li>Build your game in Google AI Studio</li>
              <li>Tell it: <span className="text-yellow-300 font-medium">&quot;Make it a single plain HTML file. No React, no imports. Vanilla JavaScript only. All CSS and JS inline.&quot;</span></li>
              <li>Click the code icon, select all (Ctrl+A), copy (Ctrl+C)</li>
              <li>Paste it below</li>
            </ol>
          </div>

          <div>
            <label className="text-xs text-zinc-300 block mb-1">HTML code</label>
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder="Paste your full HTML file here..."
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-xs font-mono text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 resize-none transition-colors"
              rows={16}
            />
          </div>

          {localError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-300 flex items-start gap-2">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <span>{localError}</span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full py-3 rounded-xl font-semibold text-base transition-all ${
              canSubmit
                ? "text-white active:scale-[0.98]"
                : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
            }`}
            style={canSubmit ? { background: "linear-gradient(135deg, #2563eb, #3b82f6)", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" } : undefined}
          >
            Import game
          </button>
        </div>
      </div>
    </div>
  )
}
