"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "@/lib/auth"
import { Coins } from "lucide-react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Multiplication tables trainer (2-12) shown during the build wait.
// Tracks which facts the learner gets wrong and repeats those.
// Progress is saved to Firestore so guides can see mastery detail.
//
// Firestore path: multiplicationProgress/{uid}
// Fields: mastered (array of "AxB" strings), struggles (array of "AxB" strings),
//         totalCorrect, totalAttempts, lastPracticed

interface BuildWaitMiniGameProps {
  grade?: string
}

interface Problem {
  question: string
  answer: number
  a: number
  b: number
  choices: number[]
}

// All multiplication facts from 2x2 to 12x12
function allFacts(): Array<[number, number]> {
  const facts: Array<[number, number]> = []
  for (let a = 2; a <= 12; a++) {
    for (let b = 2; b <= 12; b++) {
      facts.push([a, b])
    }
  }
  return facts
}

export function BuildWaitMiniGame({ grade }: BuildWaitMiniGameProps) {
  const { activeProfile, updateTokens } = useAuth()
  const [problem, setProblem] = useState<Problem | null>(null)
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionTotal, setSessionTotal] = useState(0)
  const [savingToken, setSavingToken] = useState(false)
  // Track struggles this session to prioritize them
  const strugglesRef = useRef<Set<string>>(new Set())
  const masteredRef = useRef<Set<string>>(new Set())
  const loadedRef = useRef(false)

  // Load progress from Firestore
  useEffect(() => {
    if (!activeProfile?.uid || loadedRef.current) return
    loadedRef.current = true
    getDoc(doc(db, "multiplicationProgress", activeProfile.uid))
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data()
          if (Array.isArray(data.struggles)) {
            data.struggles.forEach((s: string) => strugglesRef.current.add(s))
          }
          if (Array.isArray(data.mastered)) {
            data.mastered.forEach((s: string) => masteredRef.current.add(s))
          }
        }
      })
      .catch(() => {})
  }, [activeProfile?.uid])

  // Generate a problem, prioritizing facts the learner struggles with
  const newProblem = useCallback((): Problem => {
    let a: number, b: number

    // 40% chance: pick from struggles if any
    const struggles = Array.from(strugglesRef.current)
    if (struggles.length > 0 && Math.random() < 0.4) {
      const pick = struggles[Math.floor(Math.random() * struggles.length)]
      const [pa, pb] = pick.split("x").map(Number)
      a = pa
      b = pb
    } else {
      // Pick a random fact from 2-12, avoiding mastered ones when possible
      const facts = allFacts()
      const unmastered = facts.filter(([fa, fb]) => !masteredRef.current.has(`${fa}x${fb}`))
      const pool = unmastered.length > 0 ? unmastered : facts
      const [pa, pb] = pool[Math.floor(Math.random() * pool.length)]
      a = pa
      b = pb
    }

    const answer = a * b

    // Generate wrong choices from nearby products
    const wrongs = new Set<number>()
    while (wrongs.size < 3) {
      const altB = Math.floor(Math.random() * 11) + 2
      const candidate = a * altB
      if (candidate !== answer && candidate > 0) wrongs.add(candidate)
      if (wrongs.size < 3) {
        const altA = Math.floor(Math.random() * 11) + 2
        const candidate2 = altA * b
        if (candidate2 !== answer && candidate2 > 0) wrongs.add(candidate2)
      }
    }
    const choices = [answer, ...Array.from(wrongs)]
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[choices[i], choices[j]] = [choices[j], choices[i]]
    }

    return { question: `${a} \u00d7 ${b} = ?`, answer, a, b, choices }
  }, [])

  useEffect(() => {
    setProblem(newProblem())
  }, [newProblem])

  // Save progress to Firestore (debounced — save on unmount or every 5 answers)
  const saveProgressRef = useRef<(() => void) | undefined>(undefined)
  saveProgressRef.current = () => {
    if (!activeProfile?.uid) return
    setDoc(doc(db, "multiplicationProgress", activeProfile.uid), {
      struggles: Array.from(strugglesRef.current),
      mastered: Array.from(masteredRef.current),
      totalCorrect: sessionCorrect,
      totalAttempts: sessionTotal,
      lastPracticed: Date.now(),
    }, { merge: true }).catch(() => {})
  }

  // Save on unmount
  useEffect(() => {
    return () => { saveProgressRef.current?.() }
  }, [])

  const handleAnswer = async (choice: number) => {
    if (!problem || feedback !== null) return
    const factKey = `${problem.a}x${problem.b}`
    setSessionTotal((n) => n + 1)

    if (choice === problem.answer) {
      setFeedback("correct")
      setSessionCorrect((n) => n + 1)
      // Remove from struggles, add to mastered after 3 correct in a row
      // (simplified: remove from struggles on correct)
      strugglesRef.current.delete(factKey)
      masteredRef.current.add(factKey)

      setSavingToken(true)
      updateTokens(1).catch(() => {}).finally(() => setSavingToken(false))
    } else {
      setFeedback("wrong")
      // Add to struggles, remove from mastered
      strugglesRef.current.add(factKey)
      masteredRef.current.delete(factKey)
    }

    // Save every 5 attempts
    if ((sessionTotal + 1) % 5 === 0) {
      saveProgressRef.current?.()
    }

    setTimeout(() => {
      setFeedback(null)
      setProblem(newProblem())
    }, 1100)
  }

  if (!problem) return null

  const totalFacts = 11 * 11 // 2-12 = 11 values, 11x11 = 121 facts
  const masteredCount = masteredRef.current.size

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-400 uppercase tracking-wide font-medium">
          Times Tables (2-12)
        </p>
        <div className="flex items-center gap-1.5 text-amber-400 text-xs font-mono">
          <Coins className="size-3.5" />
          <span>+{sessionCorrect}</span>
          {savingToken && (
            <span className="text-zinc-500 text-[10px]">saving...</span>
          )}
        </div>
      </div>

      <div className="text-center py-3">
        <p className="text-3xl font-mono font-bold text-white">
          {problem.question}
        </p>
      </div>

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

      {sessionTotal > 0 && (
        <div className="flex items-center justify-between text-[11px] text-zinc-500">
          <span>{sessionCorrect}/{sessionTotal} correct</span>
          <span>{masteredCount}/{totalFacts} facts mastered</span>
        </div>
      )}
    </div>
  )
}
