"use client"

import { useState } from "react"

interface BuilderProps {
  standardId: string
  onGenerate: (scenario: string) => void
  onBack: () => void
}

const BAD_WORDS = [
  "kill", "die", "dead", "murder", "blood", "hate", "stupid", "dumb",
  "idiot", "gun", "shoot", "bomb", "drug", "sex", "porn", "nude",
  "damn", "hell", "ass", "crap", "shit", "fuck", "bitch",
]

function hasBadWords(text: string): boolean {
  const lower = text.toLowerCase()
  return BAD_WORDS.some((w) => lower.includes(w))
}

export function SentenceBuilder({ standardId, onGenerate, onBack }: BuilderProps) {
  const [sentence, setSentence] = useState("")
  const [error, setError] = useState("")

  const trimmed = sentence.trim()
  const canSubmit = trimmed.length >= 10

  function handleSubmit() {
    if (!canSubmit) return
    if (hasBadWords(trimmed)) {
      setError("That sentence contains words that aren't allowed. Try describing a different situation.")
      return
    }
    setError("")
    onGenerate(trimmed)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "linear-gradient(135deg, #09090b 0%, #0c1222 50%, #09090b 100%)", fontFamily: "'Lexend', 'Space Grotesk', system-ui, sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 shrink-0">
        <button
          onClick={onBack}
          className="text-sm text-zinc-300 hover:text-white"
        >
          &larr; Back
        </button>
        <div className="text-xs text-zinc-400 font-mono">{standardId}</div>
        <div className="w-12" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
          <div className="text-center space-y-2">
            <h2
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Describe your game
            </h2>
            <p className="text-sm text-zinc-200">
              Write one sentence about a real-life situation where someone needs
              to add things together. Describe the situation, not the numbers — we&apos;ll handle those.
            </p>
          </div>

          <div className="space-y-3">
            <textarea
              value={sentence}
              onChange={(e) => {
                setSentence(e.target.value)
                if (error) setError("")
              }}
              rows={2}
              placeholder="A farmer has some chickens and gets more from the market"
              className="w-full rounded-xl border-2 border-zinc-700 focus:border-blue-400 focus:outline-none p-4 text-sm text-white bg-zinc-800 resize-none placeholder:text-zinc-500 transition-colors"
              maxLength={200}
            />
            <div className="flex justify-between text-xs text-zinc-300">
              <span>{trimmed.length < 10 ? `${10 - trimmed.length} more characters needed` : "Looks good!"}</span>
              <span>{sentence.length}/200</span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 font-medium text-center">{error}</p>
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
            Generate my game!
          </button>
        </div>
      </div>
    </div>
  )
}
