"use client"

import { useState } from "react"

interface BuilderProps {
  standardId: string
  onGenerate: (scenario: string) => void
  onBack: () => void
}

export function ComicBuilder({ standardId, onGenerate, onBack }: BuilderProps) {
  const [panel1, setPanel1] = useState("")
  const [panel2, setPanel2] = useState("")
  const [panel3, setPanel3] = useState("")

  const allFilled =
    panel1.trim().length > 0 &&
    panel2.trim().length > 0 &&
    panel3.trim().length > 0

  const preview = allFilled
    ? `${panel1.trim()} ${panel2.trim()} ${panel3.trim()}`
    : ""

  function handleSubmit() {
    if (!allFilled) return
    onGenerate(preview)
  }

  const panels = [
    {
      number: 1,
      label: "What's happening?",
      placeholder: "A kid is at the toy store",
      value: panel1,
      onChange: setPanel1,
    },
    {
      number: 2,
      label: "Then what?",
      placeholder: "Her mom buys her some more toys",
      value: panel2,
      onChange: setPanel2,
    },
    {
      number: 3,
      label: "What do they need to figure out?",
      placeholder: "How many toys does she have now?",
      value: panel3,
      onChange: setPanel3,
    },
  ]

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
              Create your math comic
            </h2>
            <p className="text-sm text-zinc-200">
              Tell a 3-part story where someone needs to add. Your game will
              bring it to life.
            </p>
          </div>

          {/* Comic panels */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(24,24,27,0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(63,63,70,0.5)" }}
          >
            {panels.map((p, i) => (
              <div
                key={p.number}
                className={`px-4 py-5 ${
                  i < panels.length - 1 ? "border-b border-zinc-800/50" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-400 shrink-0 mt-0.5">
                    {p.number}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-semibold text-zinc-300">
                      {p.label}
                    </p>
                    <input
                      type="text"
                      value={p.value}
                      onChange={(e) => p.onChange(e.target.value)}
                      placeholder={p.placeholder}
                      className="w-full rounded-lg border-2 border-zinc-700 focus:border-blue-400 focus:outline-none px-3 py-2 text-sm text-white bg-zinc-800 placeholder:text-zinc-500 transition-colors"
                      maxLength={100}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Preview */}
          {allFilled && (
            <div className="rounded-2xl p-4 space-y-1" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "16px" }}>
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
                Your story
              </p>
              <p className="text-sm text-zinc-200">{preview}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!allFilled}
            className={`w-full py-3 rounded-xl font-semibold text-base transition-all ${
              allFilled
                ? "text-white active:scale-[0.98]"
                : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
            }`}
            style={allFilled ? { background: "linear-gradient(135deg, #2563eb, #3b82f6)", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" } : undefined}
          >
            Generate my game!
          </button>
        </div>
      </div>
    </div>
  )
}
