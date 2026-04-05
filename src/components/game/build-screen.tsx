"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { GameDesignDoc } from "@/lib/game-types"
import { MatrixRain } from "./matrix-rain"

interface BuildScreenProps {
  designDoc: GameDesignDoc
  onComplete: (
    html: string,
    designChoices: Record<string, string>
  ) => void
}

interface NarrationItem {
  type: "narration" | "question" | "math"
  text: string
  options?: [string, string]
  choiceKey?: string
}

function buildNarrationSequence(designDoc: GameDesignDoc): NarrationItem[] {
  return [
    { type: "narration", text: `Reading your idea for "${designDoc.title}"...` },
    {
      type: "question",
      text: `Where does "${designDoc.title}" take place?`,
      options: ["Indoors", "Outdoors"],
      choiceKey: "setting",
    },
    { type: "narration", text: "Setting up the game board..." },
    {
      type: "question",
      text: "What's the overall feel of the game?",
      options: ["Bright and fun", "Dark and mysterious"],
      choiceKey: "color",
    },
    { type: "narration", text: "Adding the math mechanics..." },
    {
      type: "question",
      text: "How should players move through the game?",
      options: ["Turn by turn", "All at once"],
      choiceKey: "pacing",
    },
    { type: "narration", text: "Building the win condition..." },
    { type: "narration", text: "Making it look good..." },
    { type: "narration", text: "Testing the math..." },
    { type: "narration", text: "Polishing..." },
    { type: "narration", text: "Almost ready..." },
  ]
}

export function BuildScreen({ designDoc, onComplete }: BuildScreenProps) {
  const narrationSequence = buildNarrationSequence(designDoc)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [designChoices, setDesignChoices] = useState<Record<string, string>>({})
  const [waitingForChoice, setWaitingForChoice] = useState(false)
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null)
  const [generationDone, setGenerationDone] = useState(false)
  const designChoicesRef = useRef<Record<string, string>>({})
  const startTimeRef = useRef(Date.now())
  const hasCalledGenerate = useRef(false)

  const currentItem = narrationSequence[currentIndex] ?? null

  // Start generation after first two design questions are answered (or after 8 seconds)
  const startGeneration = useCallback(() => {
    if (hasCalledGenerate.current) return
    hasCalledGenerate.current = true

    fetch("/api/game/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        designDoc,
        designChoices: designChoicesRef.current,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.html) {
          setGeneratedHtml(data.html)
        }
        setGenerationDone(true)
      })
      .catch(() => {
        setGenerationDone(true)
      })
  }, [designDoc])

  // Progress bar fills over ~25 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      const p = Math.min(elapsed / 25, 0.95)
      setProgress(p)
    }, 200)
    return () => clearInterval(interval)
  }, [])

  // Auto-advance narration items (not questions)
  useEffect(() => {
    if (!currentItem) return
    if (currentItem.type === "question") {
      setWaitingForChoice(true)
      return
    }

    const timer = setTimeout(() => {
      setCurrentIndex((i) => Math.min(i + 1, narrationSequence.length - 1))
    }, 3000)
    return () => clearTimeout(timer)
  }, [currentIndex, currentItem])

  // Start generation after 2 design choices or after 8 seconds
  useEffect(() => {
    const choiceCount = Object.keys(designChoices).length
    if (choiceCount >= 2) {
      startGeneration()
    }
  }, [designChoices, startGeneration])

  useEffect(() => {
    const timer = setTimeout(() => {
      startGeneration()
    }, 8000)
    return () => clearTimeout(timer)
  }, [startGeneration])

  // Complete when generation is done and at least 15 seconds have passed
  useEffect(() => {
    if (!generationDone) return

    const elapsed = (Date.now() - startTimeRef.current) / 1000
    const remaining = Math.max(0, 15 - elapsed)

    const timer = setTimeout(() => {
      setProgress(1)
      setTimeout(() => {
        onComplete(generatedHtml || "", designChoicesRef.current)
      }, 500)
    }, remaining * 1000)

    return () => clearTimeout(timer)
  }, [generationDone, generatedHtml, onComplete])

  const handleChoice = (key: string, value: string) => {
    setDesignChoices((prev) => ({ ...prev, [key]: value }))
    designChoicesRef.current[key] = value
    setWaitingForChoice(false)
    setCurrentIndex((i) => Math.min(i + 1, narrationSequence.length - 1))
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-zinc-950">
      {/* Left: Matrix rain */}
      <div className="hidden md:block md:w-1/2 relative overflow-hidden">
        <MatrixRain className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-950/80" />
      </div>

      {/* Right: Narration + questions */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        {/* Mobile: matrix rain background */}
        <div className="absolute inset-0 md:hidden opacity-20 overflow-hidden">
          <MatrixRain className="absolute inset-0" />
        </div>

        <div className="relative z-10 max-w-md w-full space-y-8">
          {/* Game title */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-1">
              Building your game
            </h2>
            <p className="text-zinc-400 text-sm">{designDoc.title}</p>
          </div>

          {/* Change later message */}
          <p className="text-center text-xs text-zinc-500">
            Don't worry — you can always change anything once the game is built.
          </p>

          {/* Current narration/question */}
          <div className="min-h-[140px] flex flex-col items-center justify-center">
            {currentItem && currentItem.type === "narration" && (
              <div className="text-center animate-fade-in">
                <p className="text-lg text-emerald-400">{currentItem.text}</p>
              </div>
            )}

            {currentItem &&
              currentItem.type === "question" &&
              waitingForChoice && (
                <div className="text-center space-y-4 animate-fade-in">
                  <p className="text-lg text-white">{currentItem.text}</p>
                  <div className="flex gap-3 justify-center">
                    {currentItem.options?.map((option) => (
                      <button
                        key={option}
                        onClick={() =>
                          handleChoice(
                            currentItem.choiceKey!,
                            option.toLowerCase()
                          )
                        }
                        className="px-5 py-2.5 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-emerald-500 hover:text-emerald-400 transition-colors"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Design choices made */}
          {Object.keys(designChoices).length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {Object.entries(designChoices).map(([key, value]) => (
                <span
                  key={key}
                  className="px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400"
                >
                  {value}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Progress bar at bottom */}
        <div className="absolute bottom-8 left-8 right-8">
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500 mt-2 text-center">
            {progress < 0.3
              ? "Designing..."
              : progress < 0.6
                ? "Building..."
                : progress < 0.9
                  ? "Polishing..."
                  : "Finishing up..."}
          </p>
        </div>
      </div>
    </div>
  )
}
