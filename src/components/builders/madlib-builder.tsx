"use client"

import { useState } from "react"

interface BuilderProps {
  standardId: string
  onGenerate: (scenario: string) => void
  onBack: () => void
}

export function MadlibBuilder({ standardId, onGenerate, onBack }: BuilderProps) {
  const [who, setWho] = useState("")
  const [whatThings, setWhatThings] = useState("")
  const [whoElse, setWhoElse] = useState("")

  const allFilled =
    who.trim().length > 0 &&
    whatThings.trim().length > 0 &&
    whoElse.trim().length > 0

  const preview = allFilled
    ? `A ${who.trim()} has some ${whatThings.trim()}. ${whoElse.trim()} gives them more ${whatThings.trim()}. Now they need to figure out how many ${whatThings.trim()} they have in total.`
    : ""

  function handleSubmit() {
    if (!allFilled) return
    onGenerate(preview)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "linear-gradient(135deg, #09090b 0%, #0c1222 50%, #09090b 100%)", fontFamily: "'Lexend', 'Space Grotesk', system-ui, sans-serif" }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 shrink-0">
        <button onClick={onBack} className="text-sm text-zinc-300 hover:text-white">
          &larr; Back
        </button>
        <div className="text-xs text-zinc-400 font-mono">{standardId}</div>
        <div className="w-12" />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Build your story
            </h2>
            <p className="text-sm text-zinc-200">
              Fill in the blanks to create a real-world addition story. Don&apos;t worry about numbers — we&apos;ll pick those for each round.
            </p>
          </div>

          <div className="rounded-2xl p-4 space-y-3" style={{ background: "rgba(24,24,27,0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(63,63,70,0.5)", borderRadius: "16px" }}>
            <p className="text-sm text-zinc-300 font-medium">Part 1: Who has some things?</p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-200">
              <span>A</span>
              <input
                type="text"
                value={who}
                onChange={(e) => setWho(e.target.value)}
                placeholder="farmer, kid, teacher..."
                className="w-36 rounded-lg border-2 border-zinc-700 focus:border-blue-400 focus:outline-none px-2 py-1.5 text-sm text-white bg-zinc-800 placeholder:text-zinc-500"
                maxLength={30}
              />
              <span>has some</span>
              <input
                type="text"
                value={whatThings}
                onChange={(e) => setWhatThings(e.target.value)}
                placeholder="apples, toys, books..."
                className="w-36 rounded-lg border-2 border-zinc-700 focus:border-blue-400 focus:outline-none px-2 py-1.5 text-sm text-white bg-zinc-800 placeholder:text-zinc-500"
                maxLength={30}
              />
            </div>
          </div>

          <div className="rounded-2xl p-4 space-y-3" style={{ background: "rgba(24,24,27,0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(63,63,70,0.5)", borderRadius: "16px" }}>
            <p className="text-sm text-zinc-300 font-medium">Part 2: Who gives them more?</p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-200">
              <input
                type="text"
                value={whoElse}
                onChange={(e) => setWhoElse(e.target.value)}
                placeholder="a friend, their mom, the store..."
                className="w-48 rounded-lg border-2 border-zinc-700 focus:border-blue-400 focus:outline-none px-2 py-1.5 text-sm text-white bg-zinc-800 placeholder:text-zinc-500"
                maxLength={30}
              />
              <span>gives them more {whatThings.trim() || "___"}.</span>
            </div>
          </div>

          <div className="rounded-2xl p-4" style={{ background: "rgba(24,24,27,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(63,63,70,0.3)", borderRadius: "16px" }}>
            <p className="text-sm text-zinc-300 font-medium mb-2">Part 3 (auto-filled)</p>
            <p className="text-sm text-zinc-400 italic">
              {whatThings.trim()
                ? `Now they need to figure out how many ${whatThings.trim()} they have in total.`
                : "Now they need to figure out how many ___ they have in total."}
            </p>
          </div>

          {allFilled && (
            <div className="rounded-2xl p-4 space-y-1" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "16px" }}>
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide">Your story</p>
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
