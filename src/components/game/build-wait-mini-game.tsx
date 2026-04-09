"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "@/lib/auth"
import { Coins } from "lucide-react"

// Mini-game shown next to the funny stick figure during the
// "generating" phase of the BuildScreen, while the AI is taking its
// time to build the kid's actual game.
//
// Goal: turn the wait time into productive practice. Kids do simple
// math facts (addition, subtraction, multiplication depending on
// grade) and earn 1 token per correct answer. No time limit, no
// session cap. They can do as many or as few as they want.
//
// The math difficulty is chosen by grade:
//   K, 1, 2     → simple addition + subtraction (sums up to 20)
//   3, 4        → addition + subtraction up to 100, simple multiplication tables (×1-10)
//   5, 6, 7     → multiplication (×2-12), simple division
//   8, HS       → multiplication (×2-15), 2-digit addition
//
// We persist the per-session correct count in component state only.
// Tokens go to Firestore via the existing updateTokens auth method,
// same one used by the +2000 game-approved bonus.

interface BuildWaitMiniGameProps {
  grade?: string
}

interface Problem {
  question: string
  answer: number
  // The choices the learner picks from. 4 options, one is correct.
  choices: number[]
}

export function BuildWaitMiniGame({ grade }: BuildWaitMiniGameProps) {
  const { updateTokens } = useAuth()
  const [problem, setProblem] = useState<Problem | null>(null)
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionTotal, setSessionTotal] = useState(0)
  const [savingToken, setSavingToken] = useState(false)
  // Track whether the kid has actually started playing — we don't
  // award tokens until they make their first attempt, to avoid
  // accidentally awarding tokens just for opening the screen.
  const hasStartedRef = useRef(false)

  // Generate a fresh problem matching the learner's grade.
  const newProblem = useCallback((): Problem => {
    const g = (grade ?? "").toUpperCase()
    const isEarly = ["K", "1", "2"].includes(g)
    const isMid = ["3", "4"].includes(g)
    const isUpper = ["5", "6", "7"].includes(g)
    const isHigh = ["8", "HS"].includes(g)

    let a: number, b: number, op: "+" | "-" | "×", answer: number

    if (isEarly) {
      // Sums up to 20
      a = Math.floor(Math.random() * 11) + 1 // 1-11
      b = Math.floor(Math.random() * 9) + 1  // 1-9
      op = Math.random() < 0.5 ? "+" : "-"
      // For subtraction, ensure a >= b so result is non-negative
      if (op === "-" && a < b) [a, b] = [b, a]
      answer = op === "+" ? a + b : a - b
    } else if (isMid) {
      // Addition/subtraction up to 100, OR small multiplication tables
      const choice = Math.random()
      if (choice < 0.4) {
        a = Math.floor(Math.random() * 90) + 10 // 10-99
        b = Math.floor(Math.random() * 90) + 10
        op = "+"
        answer = a + b
      } else if (choice < 0.7) {
        a = Math.floor(Math.random() * 90) + 10
        b = Math.floor(Math.random() * a) + 1 // ensure non-negative
        op = "-"
        answer = a - b
      } else {
        // Small multiplication table
        a = Math.floor(Math.random() * 9) + 2 // 2-10
        b = Math.floor(Math.random() * 9) + 2 // 2-10
        op = "×"
        answer = a * b
      }
    } else if (isUpper) {
      // Multiplication tables 2-12
      a = Math.floor(Math.random() * 11) + 2 // 2-12
      b = Math.floor(Math.random() * 11) + 2 // 2-12
      op = "×"
      answer = a * b
    } else if (isHigh) {
      // Multiplication tables 2-15 OR larger addition
      const choice = Math.random()
      if (choice < 0.7) {
        a = Math.floor(Math.random() * 14) + 2 // 2-15
        b = Math.floor(Math.random() * 14) + 2 // 2-15
        op = "×"
        answer = a * b
      } else {
        a = Math.floor(Math.random() * 900) + 100 // 100-999
        b = Math.floor(Math.random() * 900) + 100
        op = "+"
        answer = a + b
      }
    } else {
      // No grade set — default to easy addition
      a = Math.floor(Math.random() * 10) + 1
      b = Math.floor(Math.random() * 10) + 1
      op = "+"
      answer = a + b
    }

    // Generate 3 wrong choices that are plausible distractors:
    // close to the right answer but not equal. Avoid duplicates.
    const wrongs = new Set<number>()
    while (wrongs.size < 3) {
      const offset = Math.floor(Math.random() * 8) - 4 // -4 to +4
      const candidate = answer + offset
      if (candidate !== answer && candidate > 0) wrongs.add(candidate)
    }
    const choices = [answer, ...Array.from(wrongs)]
    // Shuffle
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[choices[i], choices[j]] = [choices[j], choices[i]]
    }

    return {
      question: `${a} ${op} ${b} = ?`,
      answer,
      choices,
    }
  }, [grade])

  // Initialize first problem on mount.
  useEffect(() => {
    setProblem(newProblem())
  }, [newProblem])

  const handleAnswer = async (choice: number) => {
    if (!problem || feedback !== null) return
    hasStartedRef.current = true
    setSessionTotal((n) => n + 1)
    if (choice === problem.answer) {
      setFeedback("correct")
      setSessionCorrect((n) => n + 1)
      // Award 1 token. updateTokens persists to Firestore + updates
      // the auth-provider's local state so other components reflect
      // the new total. Don't block the UI on the network roundtrip.
      setSavingToken(true)
      updateTokens(1)
        .catch(() => {
          // Silent fail — kid still sees the visual feedback
        })
        .finally(() => setSavingToken(false))
    } else {
      setFeedback("wrong")
    }
    // Move to next problem after a beat
    setTimeout(() => {
      setFeedback(null)
      setProblem(newProblem())
    }, 1100)
  }

  if (!problem) return null

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-400 uppercase tracking-wide font-medium">
          Math practice while you wait
        </p>
        <div className="flex items-center gap-1.5 text-amber-400 text-xs font-mono">
          <Coins className="size-3.5" />
          <span>+{sessionCorrect}</span>
          {savingToken && (
            <span className="text-zinc-500 text-[10px]">saving...</span>
          )}
        </div>
      </div>

      {/* Problem */}
      <div className="text-center py-3">
        <p className="text-3xl font-mono font-bold text-white">
          {problem.question}
        </p>
      </div>

      {/* Choices */}
      <div className="grid grid-cols-2 gap-2">
        {problem.choices.map((c) => {
          const isCorrect = c === problem.answer
          let btnClass =
            "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
          if (feedback === "correct" && isCorrect) {
            btnClass = "bg-emerald-600 text-white border border-emerald-400"
          } else if (feedback === "wrong" && isCorrect) {
            btnClass = "bg-emerald-600/40 text-white border border-emerald-400/60"
          } else if (feedback === "wrong" && !isCorrect) {
            btnClass = "bg-zinc-800/50 text-zinc-500 border border-zinc-800"
          }
          return (
            <button
              key={c}
              onClick={() => handleAnswer(c)}
              disabled={feedback !== null}
              className={`rounded-lg py-2.5 text-lg font-mono font-semibold transition-colors disabled:cursor-not-allowed ${btnClass}`}
            >
              {c}
            </button>
          )
        })}
      </div>

      {/* Session score */}
      {sessionTotal > 0 && (
        <p className="text-[11px] text-zinc-500 text-center">
          {sessionCorrect}/{sessionTotal} correct this session
        </p>
      )}
    </div>
  )
}
