"use client"

// Scenario Gate — 3-step interactive gate before building.
// Dark space station theme with subtle star particles, glow effects,
// and satisfying animations. Same wording and logic as before.

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { logFromClient } from "@/lib/log-client"

interface ScenarioGateProps {
  standardId: string
  onPass: () => void
  onBack: () => void
}

// ─── K.OA.A.1 Content ────────────────────────────────────────────────────────

interface Vignette {
  text: string
  icon: string
  isReal: boolean
}

const VIGNETTES_K_OA_A_1: Vignette[] = [
  {
    text: "A kid has 3 toy cars. His friend gives him 2 more. He counts all his cars to see how many he has now.",
    icon: "",
    isReal: true,
  },
  {
    text: "A wizard shoots a number beam and yells '3 + 2!' to defeat the dragon.",
    icon: "",
    isReal: false,
  },
  {
    text: "A baker puts 4 muffins on a tray, then adds 3 more from the oven. She counts them all to know how many to sell.",
    icon: "",
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
    text: "You count them all: 5 \u00d7 3 = 15 strawberries!",
    isBroken: true,
    fixOptions: [
      "5 + 3 = 8 strawberries!",
      "3 + 5 = 9 strawberries!",
      "5 - 3 = 2 strawberries!",
    ],
    correctFix: 0,
  },
  { text: "You share some with your sister.", isBroken: false },
]

// ─── Shared Styles ───────────────────────────────────────────────────────────

const GATE_STYLES = `
  @keyframes gate-pop { 0% { transform: scale(1); } 40% { transform: scale(1.06); } 100% { transform: scale(1); } }
  @keyframes gate-glow { 0%, 100% { box-shadow: 0 0 8px rgba(96,165,250,0.3); } 50% { box-shadow: 0 0 20px rgba(96,165,250,0.6); } }
  @keyframes gate-slide-in { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes gate-fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes star-drift {
    0% { transform: translateY(0) translateX(0); opacity: 0.3; }
    50% { opacity: 0.7; }
    100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
  }
  @keyframes marble-snap { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(0.85); } }
  .gate-card { background: rgba(24,24,27,0.8); backdrop-filter: blur(12px); border: 1px solid rgba(63,63,70,0.5); border-radius: 16px; transition: all 0.25s ease; }
  .gate-card:hover { border-color: rgba(96,165,250,0.4); }
  .gate-card.selected-real { border-color: #10b981; background: rgba(16,185,129,0.1); box-shadow: 0 0 12px rgba(16,185,129,0.2); }
  .gate-card.selected-fake { border-color: #f59e0b; background: rgba(245,158,11,0.1); box-shadow: 0 0 12px rgba(245,158,11,0.2); }
  .gate-card.success { border-color: #10b981; background: rgba(16,185,129,0.15); box-shadow: 0 0 16px rgba(16,185,129,0.3); }
  .gate-card.neutral-done { border-color: rgba(63,63,70,0.3); background: rgba(24,24,27,0.5); }
  .gate-btn { font-family: 'Lexend', system-ui, sans-serif; font-weight: 600; border: none; border-radius: 12px; cursor: pointer; transition: all 0.2s ease; }
  .gate-btn:active { transform: scale(0.97); }
  .gate-btn-primary { background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
  .gate-btn-primary:hover { box-shadow: 0 4px 20px rgba(37,99,235,0.5); }
  .gate-btn-success { background: linear-gradient(135deg, #059669, #10b981); color: white; box-shadow: 0 4px 12px rgba(16,185,129,0.3); }
  .gate-btn-success:hover { box-shadow: 0 4px 20px rgba(16,185,129,0.5); }
  .gate-btn-retry { background: rgba(39,39,42,0.8); color: #a1a1aa; border: 1px solid rgba(63,63,70,0.5); }
  .gate-btn-retry:hover { background: rgba(63,63,70,0.8); color: #e4e4e7; }
`

function StarField() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.5 + 0.1,
            animation: `star-drift ${Math.random() * 40 + 30}s linear infinite`,
            animationDelay: `${Math.random() * -40}s`,
          }}
        />
      ))}
    </div>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ScenarioGate({ standardId, onPass, onBack }: ScenarioGateProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [stepKey, setStepKey] = useState(0)
  const { activeProfile } = useAuth()
  const gateStartRef = useRef(Date.now())
  const stepStartRef = useRef(Date.now())
  const stepAttemptsRef = useRef(0)
  const uid = activeProfile?.uid || ""

  useEffect(() => {
    logFromClient({ type: "gate_started", learnerId: uid, standardId })
  }, [uid, standardId])

  function advanceStep(nextStep: 2 | 3 | "pass") {
    const timeMs = Date.now() - stepStartRef.current
    logFromClient({
      type: "gate_step_completed",
      learnerId: uid,
      standardId,
      gateStep: step,
      gateStepName: step === 1 ? "real_or_fake" : step === 2 ? "fix_the_comic" : "prove_it",
      timeMs,
      attempts: stepAttemptsRef.current,
    })
    stepStartRef.current = Date.now()
    stepAttemptsRef.current = 0
    setStepKey((k) => k + 1)
    if (nextStep === "pass") {
      logFromClient({
        type: "gate_passed",
        learnerId: uid,
        standardId,
        timeMs: Date.now() - gateStartRef.current,
      })
      onPass()
    } else {
      setStep(nextStep)
    }
  }

  function trackAttempt() { stepAttemptsRef.current++ }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "linear-gradient(135deg, #09090b 0%, #0c1222 50%, #09090b 100%)", fontFamily: "'Lexend', system-ui, sans-serif" }}
    >
      <style>{GATE_STYLES}</style>
      <StarField />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 shrink-0 relative z-10">
        <button onClick={onBack} className="text-sm text-zinc-300 hover:text-white transition-colors">
          &larr; Back
        </button>
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="w-8 h-2 rounded-full transition-all duration-500"
              style={{
                background: s < step ? "#10b981" : s === step ? "#3b82f6" : "rgba(63,63,70,0.5)",
                boxShadow: s === step ? "0 0 8px rgba(59,130,246,0.5)" : "none",
              }}
            />
          ))}
        </div>
        <div className="w-12" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div style={{ animation: "gate-slide-in 0.4s ease" }} key={`${step}-${stepKey}`}>
          {step === 1 && (
            <RealOrFake key={`s1-${stepKey}`} vignettes={VIGNETTES_K_OA_A_1} onPass={() => advanceStep(2)} onAttempt={trackAttempt} />
          )}
          {step === 2 && (
            <FixTheComic key={`s2-${stepKey}`} panels={COMIC_K_OA_A_1} onPass={() => advanceStep(3)} onAttempt={trackAttempt} />
          )}
          {step === 3 && (
            <ProveIt key={`s3-${stepKey}`} onPass={() => advanceStep("pass")} onAttempt={trackAttempt} />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Step 1: Real math or math sprinkles? ─────────────────────────────────

function RealOrFake({ vignettes, onPass, onAttempt }: { vignettes: Vignette[]; onPass: () => void; onAttempt: () => void }) {
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
    onAttempt()
  }

  function handleRetry() {
    setChecked(false)
    setAllCorrect(false)
    setSorted(Object.fromEntries(vignettes.map((_, i) => [i, null])))
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Real math, or math sprinkles?
        </h2>
        <p className="text-sm text-zinc-200">
          You&apos;ll need to add math in your game the way people use it in real life — to figure something out. If the math is just sprinkled on top and doesn&apos;t really do anything, that&apos;s not a real math game and it won&apos;t pass the test.
        </p>
        <p className="text-sm text-zinc-300 font-medium">
          Which of these actually need addition?
        </p>
      </div>

      <div className="space-y-3">
        {vignettes.map((v, i) => (
          <div
            key={i}
            className={`gate-card p-4 ${
              checked && allCorrect && v.isReal ? "success" :
              checked && allCorrect && !v.isReal ? "neutral-done" :
              sorted[i] === "real" ? "selected-real" :
              sorted[i] === "fake" ? "selected-fake" : ""
            }`}
            style={{ animation: `gate-fade-in 0.3s ease ${i * 0.1}s both` }}
          >
            <p className="text-sm text-white leading-relaxed">{v.text}</p>
            {!checked && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleSort(i, "real")}
                  className={`gate-btn flex-1 py-2 text-sm ${
                    sorted[i] === "real"
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  Real math
                </button>
                <button
                  onClick={() => handleSort(i, "fake")}
                  className={`gate-btn flex-1 py-2 text-sm ${
                    sorted[i] === "fake"
                      ? "bg-amber-600 text-white"
                      : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  Math sprinkles
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {!checked && allSorted && (
        <button onClick={handleCheck} className="gate-btn gate-btn-primary w-full py-3 text-base">
          Check!
        </button>
      )}

      {checked && allCorrect && (
        <div className="text-center space-y-3" style={{ animation: "gate-pop 0.5s ease" }}>
          <p className="text-lg font-bold text-emerald-400">You got it!</p>
          <button onClick={onPass} className="gate-btn gate-btn-success px-8 py-3">
            Next step &rarr;
          </button>
        </div>
      )}

      {checked && !allCorrect && (
        <div className="text-center space-y-3">
          <p className="text-sm text-red-400 font-medium">
            Not quite — think about where someone actually NEEDS to add to figure something out.
          </p>
          <button onClick={handleRetry} className="gate-btn gate-btn-retry px-6 py-2.5 text-sm">
            Try again
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Step 2: Fix the Story ─────────────────────────────────────────────────

function FixTheComic({ panels, onPass, onAttempt }: { panels: ComicPanel[]; onPass: () => void; onAttempt: () => void }) {
  const [selectedFix, setSelectedFix] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [celebrating, setCelebrating] = useState(false)

  const brokenPanel = panels.find((p) => p.isBroken)!

  function handleCheck() {
    const isCorrect = selectedFix === brokenPanel.correctFix
    setChecked(true)
    setCorrect(isCorrect)
    onAttempt()
    if (isCorrect) {
      setCelebrating(true)
      setTimeout(() => setCelebrating(false), 1200)
    }
  }

  function handleRetry() {
    setChecked(false)
    setCorrect(false)
    setSelectedFix(null)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Fix the Story!
        </h2>
        <p className="text-sm text-zinc-200">
          When you build a game, you need to use the RIGHT math for what&apos;s happening in the story. If someone is putting things together, that&apos;s addition — not multiplication, not subtraction.
        </p>
        <p className="text-sm text-zinc-300 font-medium">
          One part of this story has the wrong math. Find it and fix it!
        </p>
      </div>

      {/* Comic panels — dark glassmorphism style */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(63,63,70,0.6)", background: "rgba(15,15,20,0.7)", backdropFilter: "blur(8px)" }}
      >
        {panels.map((panel, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-4 py-3.5 ${
              i < panels.length - 1 ? "border-b border-zinc-800/50" : ""
            }`}
            style={{
              background: panel.isBroken && !correct ? "rgba(245,158,11,0.08)" :
                          panel.isBroken && correct ? "rgba(16,185,129,0.1)" : "transparent",
              animation: celebrating && panel.isBroken ? "gate-pop 0.5s ease" : undefined,
            }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: "rgba(39,39,42,0.8)", color: panel.isBroken && !correct ? "#f59e0b" : "#71717a" }}
            >
              {i + 1}
            </div>
            <div className="flex-1">
              {panel.isBroken && !correct ? (
                <p className="text-sm text-amber-300 font-medium">
                  <span style={{ background: "rgba(245,158,11,0.15)", padding: "1px 6px", borderRadius: 4 }}>
                    {panel.text}
                  </span>
                  <span className="ml-2 text-xs font-bold text-amber-500/70">&larr; hmm...</span>
                </p>
              ) : panel.isBroken && correct ? (
                <p className="text-sm text-emerald-400 font-semibold">
                  {brokenPanel.fixOptions![brokenPanel.correctFix!]}
                </p>
              ) : (
                <p className="text-sm text-zinc-200">{panel.text}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Fix options */}
      {!correct && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-zinc-300">Which version is correct?</p>
          {brokenPanel.fixOptions!.map((opt, i) => (
            <button
              key={i}
              onClick={() => !checked && setSelectedFix(i)}
              className={`gate-card w-full text-left p-3 text-sm transition-all cursor-pointer ${
                selectedFix === i
                  ? "border-blue-500 bg-blue-500/10 text-blue-300 font-medium"
                  : "text-zinc-200 hover:text-zinc-200"
              }`}
              style={selectedFix === i ? { boxShadow: "0 0 12px rgba(59,130,246,0.2)" } : undefined}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {!checked && selectedFix !== null && (
        <button onClick={handleCheck} className="gate-btn gate-btn-primary w-full py-3 text-base">
          Check!
        </button>
      )}

      {checked && correct && (
        <div className="text-center space-y-3" style={celebrating ? { animation: "gate-pop 0.5s ease" } : undefined}>
          <p className="text-lg font-bold text-emerald-400">{celebrating ? "Nice!" : "Correct"}</p>
          <p className="text-base font-bold text-emerald-300">
            Yes! Adding, not multiplying!
          </p>
          <button onClick={onPass} className="gate-btn gate-btn-success px-8 py-3">
            One more step &rarr;
          </button>
        </div>
      )}

      {checked && !correct && (
        <div className="text-center space-y-3">
          <p className="text-sm text-red-400 font-medium">
            Not that one — what operation do you use when you PUT THINGS TOGETHER?
          </p>
          <button onClick={handleRetry} className="gate-btn gate-btn-retry px-6 py-2.5 text-sm">
            Try again
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Step 3: Now you do it! ─────────────────────────────────────────────────

function ProveIt({ onPass, onAttempt }: { onPass: () => void; onAttempt: () => void }) {
  const [tapped, setTapped] = useState<Set<number>>(new Set())
  const [answer, setAnswer] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const total = 5

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
    onAttempt()
  }

  const allTapped = tapped.size >= total
  const correct = answer === total

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Now you do it!
        </h2>
        <p className="text-sm text-zinc-200">
          Your game will need players to actually do the math — not just watch it happen. Show that you can do it yourself.
        </p>
        <p className="text-sm text-zinc-300 font-medium">
          A kid has 3 marbles. A friend gives 2 more. Tap each marble, then pick the total.
        </p>
      </div>

      {/* Two groups of marbles with glow effect */}
      <div className="flex items-center justify-center gap-6">
        <div className="flex gap-3 p-5 rounded-xl" style={{ background: "rgba(30,30,35,0.9)", border: "1px solid rgba(96,165,250,0.2)" }}>
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => handleTap(i)}
              className="w-14 h-14 rounded-full transition-all duration-200"
              style={tapped.has(i) ? {
                background: "linear-gradient(135deg, #6366f1, #818cf8)",
                transform: "scale(0.85)",
                boxShadow: "0 0 16px rgba(99,102,241,0.5)",
                animation: "marble-snap 0.3s ease",
              } : {
                background: "linear-gradient(135deg, #f43f5e, #fb7185)",
                boxShadow: "0 4px 16px rgba(244,63,94,0.5)",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
        <span className="text-2xl font-bold text-zinc-300">+</span>
        <div className="flex gap-3 p-5 rounded-xl" style={{ background: "rgba(30,30,35,0.9)", border: "1px solid rgba(96,165,250,0.2)" }}>
          {[3, 4].map((i) => (
            <button
              key={i}
              onClick={() => handleTap(i)}
              className="w-14 h-14 rounded-full transition-all duration-200"
              style={tapped.has(i) ? {
                background: "linear-gradient(135deg, #6366f1, #818cf8)",
                transform: "scale(0.85)",
                boxShadow: "0 0 16px rgba(99,102,241,0.5)",
                animation: "marble-snap 0.3s ease",
              } : {
                background: "linear-gradient(135deg, #f43f5e, #fb7185)",
                boxShadow: "0 4px 16px rgba(244,63,94,0.5)",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-zinc-300">
        {allTapped ? "How many marbles are there now?" : "Tap each marble to count them."}
      </p>

      {/* Number options with glow */}
      {allTapped && !checked && (
        <div className="flex gap-3 justify-center" style={{ animation: "gate-fade-in 0.3s ease" }}>
          {[3, 4, 5, 6, 7].map((n) => (
            <button
              key={n}
              onClick={() => handleAnswer(n)}
              className="gate-btn w-14 h-14 text-xl font-bold text-zinc-300 hover:text-white"
              style={{
                background: "rgba(24,24,27,0.8)",
                border: "1px solid rgba(63,63,70,0.5)",
                borderRadius: 12,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(96,165,250,0.6)"; e.currentTarget.style.boxShadow = "0 0 12px rgba(96,165,250,0.3)" }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(63,63,70,0.5)"; e.currentTarget.style.boxShadow = "none" }}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {checked && correct && (
        <div className="text-center space-y-3" style={{ animation: "gate-pop 0.5s ease" }}>
          <p className="text-lg font-bold text-emerald-400">
            3 + 2 = 5. You proved it!
          </p>
          <button onClick={onPass} className="gate-btn gate-btn-success px-8 py-3">
            Build a game now! &rarr;
          </button>
        </div>
      )}

      {checked && !correct && (
        <div className="text-center space-y-3">
          <p className="text-sm text-red-400 font-medium">
            Hmm, tap each marble and count carefully.
          </p>
          <button
            onClick={() => { setTapped(new Set()); setAnswer(null); setChecked(false) }}
            className="gate-btn gate-btn-retry px-6 py-2.5 text-sm"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
