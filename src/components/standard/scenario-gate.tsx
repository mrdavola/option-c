"use client"

// Scenario Gate — 3-step interactive gate that tests whether the learner
// understands how the math concept is used in the real world.
// Must pass all 3 steps to unlock the game builder.
//
// Step 1: Real or Fake (30 sec) — sort 3 vignettes into Real World vs Made Up
// Step 2: Fix the Comic (45 sec) — find and fix the wrong math in a comic
// Step 3: Prove It (45 sec) — do the math once in a mini sandbox
//
// No chatbot. All visual. Each step is a mini-game.
// Source: Chesure + Critic + Designer agent proposals (April 16, 2026)

import { useState } from "react"

interface ScenarioGateProps {
  standardId: string
  onPass: () => void
  onBack: () => void
}

// ─── K.OA.A.1 Content (hardcoded for first reference implementation) ────────

interface Vignette {
  text: string
  icon: string
  isReal: boolean
}

const VIGNETTES_K_OA_A_1: Vignette[] = [
  {
    text: "A kid has 3 toy cars. His friend gives him 2 more. He counts all his cars.",
    icon: "🚗",
    isReal: true,
  },
  {
    text: "A wizard shoots a number beam and yells '3 + 2!' to defeat the dragon.",
    icon: "🧙",
    isReal: false,
  },
  {
    text: "A baker puts 4 muffins on a tray, then adds 3 more muffins from the oven.",
    icon: "🧁",
    isReal: true,
  },
]

interface ComicPanel {
  text: string
  isBroken: boolean
  fixOptions?: string[]
  correctFix?: number
}

const COMIC_K_OA_A_1: ComicPanel[] = [
  { text: "Mom gives you 5 strawberries.", isBroken: false },
  { text: "Dad gives you 3 more strawberries.", isBroken: false },
  {
    text: "You count them all: 5 × 3 = 15 strawberries!",
    isBroken: true,
    fixOptions: [
      "5 + 3 = 8 strawberries!",
      "5 × 3 = 15 strawberries!",
      "5 - 3 = 2 strawberries!",
    ],
    correctFix: 0,
  },
  { text: "You share some with your sister.", isBroken: false },
]

// ─── Component ──────────────────────────────────────────────────────────────

export function ScenarioGate({ standardId, onPass, onBack }: ScenarioGateProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)

  return (
    <div
      className="fixed inset-0 z-50 bg-white flex flex-col"
      style={{ fontFamily: "'Lexend', system-ui, sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 shrink-0">
        <button
          onClick={onBack}
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          ← Back
        </button>
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-8 h-2 rounded-full ${
                s < step ? "bg-emerald-400" : s === step ? "bg-blue-500" : "bg-zinc-200"
              }`}
            />
          ))}
        </div>
        <div className="w-12" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {step === 1 && (
          <RealOrFake
            vignettes={VIGNETTES_K_OA_A_1}
            onPass={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <FixTheComic
            panels={COMIC_K_OA_A_1}
            onPass={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <ProveIt onPass={onPass} />
        )}
      </div>
    </div>
  )
}

// ─── Step 1: Real or Fake ───────────────────────────────────────────────────

function RealOrFake({
  vignettes,
  onPass,
}: {
  vignettes: Vignette[]
  onPass: () => void
}) {
  const [sorted, setSorted] = useState<Record<number, "real" | "fake" | null>>(
    Object.fromEntries(vignettes.map((_, i) => [i, null]))
  )
  const [checked, setChecked] = useState(false)
  const [allCorrect, setAllCorrect] = useState(false)

  const allSorted = Object.values(sorted).every((v) => v !== null)

  function handleSort(idx: number, choice: "real" | "fake") {
    if (checked) return
    setSorted((prev) => ({ ...prev, [idx]: choice }))
  }

  function handleCheck() {
    const correct = vignettes.every(
      (v, i) => (v.isReal && sorted[i] === "real") || (!v.isReal && sorted[i] === "fake")
    )
    setChecked(true)
    setAllCorrect(correct)
    if (!correct) {
      // Reset after 1.5s so they can try again
      setTimeout(() => {
        setChecked(false)
        setSorted(Object.fromEntries(vignettes.map((_, i) => [i, null])))
      }, 1500)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-zinc-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Real or Made Up?
        </h2>
        <p className="text-sm text-zinc-500">
          Which of these use addition in the REAL WORLD?
        </p>
      </div>

      <div className="space-y-3">
        {vignettes.map((v, i) => (
          <div
            key={i}
            className={`rounded-xl border-2 p-4 transition-all ${
              checked && sorted[i]
                ? (v.isReal && sorted[i] === "real") || (!v.isReal && sorted[i] === "fake")
                  ? "border-emerald-400 bg-emerald-50"
                  : "border-red-300 bg-red-50"
                : sorted[i]
                  ? "border-blue-300 bg-blue-50"
                  : "border-zinc-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{v.icon}</span>
              <p className="text-sm text-zinc-700 flex-1">{v.text}</p>
            </div>
            {!checked && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleSort(i, "real")}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                    sorted[i] === "real"
                      ? "bg-emerald-500 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  Real World
                </button>
                <button
                  onClick={() => handleSort(i, "fake")}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                    sorted[i] === "fake"
                      ? "bg-amber-500 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  Made Up
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {!checked && allSorted && (
        <button
          onClick={handleCheck}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base"
        >
          Check my answers
        </button>
      )}

      {checked && allCorrect && (
        <div className="text-center space-y-3">
          <p className="text-lg font-bold text-emerald-600">You got it!</p>
          <button
            onClick={onPass}
            className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
          >
            Next step →
          </button>
        </div>
      )}

      {checked && !allCorrect && (
        <p className="text-center text-sm text-red-500 font-medium">
          Not quite — think about which ones happen in real life. Try again!
        </p>
      )}
    </div>
  )
}

// ─── Step 2: Fix the Comic ──────────────────────────────────────────────────

function FixTheComic({
  panels,
  onPass,
}: {
  panels: ComicPanel[]
  onPass: () => void
}) {
  const [selectedFix, setSelectedFix] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(false)

  const brokenPanel = panels.find((p) => p.isBroken)!
  const brokenIdx = panels.indexOf(brokenPanel)

  function handleCheck() {
    const isCorrect = selectedFix === brokenPanel.correctFix
    setChecked(true)
    setCorrect(isCorrect)
    if (!isCorrect) {
      setTimeout(() => {
        setChecked(false)
        setSelectedFix(null)
      }, 1500)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-zinc-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Fix the Story!
        </h2>
        <p className="text-sm text-zinc-500">
          One panel has the WRONG math. Find it and fix it!
        </p>
      </div>

      {/* Comic panels */}
      <div className="space-y-2">
        {panels.map((panel, i) => (
          <div
            key={i}
            className={`rounded-xl border-2 p-4 flex items-center gap-3 ${
              panel.isBroken
                ? checked && correct
                  ? "border-emerald-400 bg-emerald-50"
                  : "border-red-300 bg-red-50"
                : "border-zinc-200 bg-white"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-sm font-bold text-zinc-400">
              {i + 1}
            </div>
            <p className={`text-sm flex-1 ${panel.isBroken ? "line-through text-red-400" : "text-zinc-700"}`}>
              {panel.text}
            </p>
            {panel.isBroken && (
              <span className="text-xs font-semibold text-red-500 bg-red-100 px-2 py-1 rounded">
                WRONG!
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Fix options */}
      {!correct && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-zinc-600">Pick the correct version:</p>
          {brokenPanel.fixOptions!.map((opt, i) => (
            <button
              key={i}
              onClick={() => !checked && setSelectedFix(i)}
              className={`w-full text-left rounded-xl border-2 p-3 text-sm transition-all ${
                checked && selectedFix === i
                  ? i === brokenPanel.correctFix
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : "border-red-300 bg-red-50 text-red-500"
                  : selectedFix === i
                    ? "border-blue-400 bg-blue-50 text-blue-700"
                    : "border-zinc-200 hover:border-zinc-300 text-zinc-700"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {!checked && selectedFix !== null && (
        <button
          onClick={handleCheck}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
        >
          Fix it!
        </button>
      )}

      {checked && correct && (
        <div className="text-center space-y-3">
          <p className="text-lg font-bold text-emerald-600">
            Yes! Adding, not multiplying!
          </p>
          <button
            onClick={onPass}
            className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
          >
            One more step →
          </button>
        </div>
      )}

      {checked && !correct && (
        <p className="text-center text-sm text-red-500 font-medium">
          Not that one — what operation do you use when you PUT THINGS TOGETHER? Try again!
        </p>
      )}
    </div>
  )
}

// ─── Step 3: Prove It ───────────────────────────────────────────────────────

function ProveIt({ onPass }: { onPass: () => void }) {
  // Simple: show 3 dots + 2 dots, learner taps to count total, picks from options
  const [tapped, setTapped] = useState<Set<number>>(new Set())
  const [answer, setAnswer] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const total = 5 // 3 + 2
  const dots = [0, 1, 2, 3, 4] // 5 dots total

  function handleTap(idx: number) {
    if (checked) return
    setTapped((prev) => {
      const next = new Set(prev)
      next.add(idx)
      return next
    })
  }

  function handleAnswer(n: number) {
    setAnswer(n)
    setChecked(true)
  }

  const allTapped = tapped.size >= total
  const correct = answer === total

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-zinc-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Try it out!
        </h2>
        <p className="text-sm text-zinc-500">
          A kid has 3 marbles. A friend gives 2 more. Tap each marble, then pick the total.
        </p>
      </div>

      {/* Visual: two groups of dots */}
      <div className="flex items-center justify-center gap-6">
        <div className="flex gap-2 p-4 rounded-xl border-2 border-zinc-200 bg-zinc-50">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => handleTap(i)}
              className={`w-12 h-12 rounded-full transition-all ${
                tapped.has(i)
                  ? "bg-zinc-400 scale-90"
                  : "bg-red-400 hover:bg-red-300 scale-100"
              }`}
            />
          ))}
        </div>
        <span className="text-2xl font-bold text-zinc-400">+</span>
        <div className="flex gap-2 p-4 rounded-xl border-2 border-zinc-200 bg-zinc-50">
          {[3, 4].map((i) => (
            <button
              key={i}
              onClick={() => handleTap(i)}
              className={`w-12 h-12 rounded-full transition-all ${
                tapped.has(i)
                  ? "bg-zinc-400 scale-90"
                  : "bg-red-400 hover:bg-red-300 scale-100"
              }`}
            />
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-zinc-500">
        {allTapped
          ? "Now pick the total!"
          : `Tap each marble to count (${tapped.size} of ${total} tapped)`}
      </p>

      {/* Number options — only show after all tapped */}
      {allTapped && !checked && (
        <div className="flex gap-3 justify-center">
          {[3, 4, 5, 6, 7].map((n) => (
            <button
              key={n}
              onClick={() => handleAnswer(n)}
              className="w-14 h-14 rounded-xl border-2 border-zinc-200 bg-white text-xl font-bold text-zinc-800 hover:border-blue-400 hover:bg-blue-50 transition-all"
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {checked && correct && (
        <div className="text-center space-y-3">
          <p className="text-lg font-bold text-emerald-600">
            3 + 2 = 5. You proved it!
          </p>
          <button
            onClick={onPass}
            className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
          >
            Ready to build your game! →
          </button>
        </div>
      )}

      {checked && !correct && (
        <div className="text-center">
          <p className="text-sm text-red-500 font-medium mb-2">
            Hmm, tap each marble and count carefully. Try again!
          </p>
          <button
            onClick={() => {
              setTapped(new Set())
              setAnswer(null)
              setChecked(false)
            }}
            className="text-sm text-blue-600 underline"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  )
}
