"use client"

import { useEffect, useState } from "react"
import { X, Sparkles } from "lucide-react"

interface MathMoment {
  heading: string
  problem: string
  steps: string[]
  encouragement: string
}

interface MathMomentOverlayProps {
  concept: string
  interests?: string[]
  onDismiss: () => void
}

export function MathMomentOverlay({ concept, interests, onDismiss }: MathMomentOverlayProps) {
  const [moment, setMoment] = useState<MathMoment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/game/math-moment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concept, interests }),
    })
      .then((r) => r.json())
      .then(setMoment)
      .catch(() =>
        setMoment({
          heading: "Here's how it works",
          problem: `Let's look at ${concept} with fresh numbers.`,
          steps: ["Read the problem carefully.", "Apply the math concept.", "Check your answer."],
          encouragement: "You've got this — give it another shot!",
        })
      )
      .finally(() => setLoading(false))
  }, [concept, interests])

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-amber-400 shrink-0" />
            <span className="text-xs font-medium text-amber-400 uppercase tracking-wide">
              Hint Card
            </span>
          </div>
          <button
            onClick={onDismiss}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-5 bg-zinc-800 rounded w-3/4" />
            <div className="h-4 bg-zinc-800 rounded w-full" />
            <div className="h-4 bg-zinc-800 rounded w-5/6" />
            <div className="h-4 bg-zinc-800 rounded w-4/6" />
          </div>
        ) : moment ? (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-white">{moment.heading}</h3>
            <p className="text-sm text-zinc-300">{moment.problem}</p>
            <ol className="space-y-2">
              {moment.steps.map((step, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-zinc-300">
                  <span className="shrink-0 size-5 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center text-xs font-medium">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <p className="text-sm text-emerald-400 font-medium">{moment.encouragement}</p>
          </div>
        ) : null}

        <button
          onClick={onDismiss}
          className="mt-5 w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2 transition-colors"
        >
          Got it — play again!
        </button>
      </div>
    </div>
  )
}
