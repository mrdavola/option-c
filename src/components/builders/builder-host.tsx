"use client"

import { useState } from "react"
import { BuilderPicker } from "./builder-picker"
import { SentenceBuilder } from "./sentence-builder"
import { MadlibBuilder } from "./madlib-builder"
import { CardBuilder } from "./card-builder"
import { ComicBuilder } from "./comic-builder"
import { GameIframe } from "@/components/game/game-iframe"
import { logFromClient } from "@/lib/log-client"
import { apiFetch } from "@/lib/api-fetch"
import { useAuth } from "@/lib/auth"
import { ArrowLeft, RotateCcw, Library } from "lucide-react"

type BuilderType = "sentence" | "madlib" | "cards" | "comic" | "paste"
type Step = "pick" | "build" | "generating" | "play"

interface BuilderHostProps {
  standardId: string
  onBack: () => void
  onImportHtml?: () => void
}

export function BuilderHost({ standardId, onBack, onImportHtml }: BuilderHostProps) {
  const { activeProfile } = useAuth()
  const [step, setStep] = useState<Step>("pick")
  const [builderType, setBuilderType] = useState<BuilderType | null>(null)
  const [gameHtml, setGameHtml] = useState<string | null>(null)
  const [scenario, setScenario] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [model, setModel] = useState<string>("")
  const [hasWon, setHasWon] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function handlePick(type: BuilderType) {
    if (type === "paste") {
      onImportHtml?.()
      return
    }
    setBuilderType(type)
    setStep("build")
    logFromClient({
      type: "builder_started",
      learnerId: activeProfile?.uid || "",
      standardId,
      gameId: type,
    })
  }

  async function handleGenerate(scenarioText: string) {
    setScenario(scenarioText)
    setStep("generating")
    setError(null)

    logFromClient({
      type: "builder_scenario_written",
      learnerId: activeProfile?.uid || "",
      standardId,
      scenarioText,
    })

    try {
      const res = await apiFetch("/api/game/generate-gemini", {
        method: "POST",
        body: JSON.stringify({
          standardId,
          scenario: scenarioText,
          builderType: builderType || "sentence",
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `Generation failed (${res.status})`)
      }

      const data = await res.json()
      setGameHtml(data.html)
      setModel(data.model || "unknown")
      setStep("play")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.")
      setStep("build")
    }
  }

  function handleTryAgain() {
    setGameHtml(null)
    setHasWon(false)
    setSaved(false)
    setStep("build")
  }

  async function handleAddToLibrary() {
    if (!gameHtml || !activeProfile) return
    setSaving(true)
    try {
      const res = await apiFetch("/api/game/save", {
        method: "POST",
        body: JSON.stringify({
          title: `${scenario.slice(0, 40)}...`,
          authorUid: activeProfile.uid,
          authorName: activeProfile.name || "Anonymous",
          designerName: activeProfile.name || "Anonymous",
          standardId,
          gameHtml,
          status: "published",
          designDoc: scenario,
          playCount: 0,
          ratingSum: 0,
          ratingCount: 0,
        }),
      })
      if (res.ok) {
        setSaved(true)
      }
    } catch {
      // silent fail for pilot
    } finally {
      setSaving(false)
    }
  }

  function handlePickDifferent() {
    setGameHtml(null)
    setBuilderType(null)
    setStep("pick")
  }

  if (step === "pick") {
    return (
      <BuilderPicker
        standardId={standardId}
        onPick={handlePick}
        onPickScenario={(scenario) => { setBuilderType("cards"); handleGenerate(scenario) }}
        onBack={onBack}
      />
    )
  }

  if (step === "build" && builderType) {
    const builderProps = {
      standardId,
      onGenerate: handleGenerate,
      onBack: () => setStep("pick"),
    }

    return (
      <>
        {error && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-2 text-sm max-w-md text-center">
            {error}
          </div>
        )}
        {builderType === "sentence" && <SentenceBuilder {...builderProps} />}
        {builderType === "madlib" && <MadlibBuilder {...builderProps} />}
        {builderType === "cards" && <CardBuilder {...builderProps} />}
        {builderType === "comic" && <ComicBuilder {...builderProps} />}
      </>
    )
  }

  if (step === "generating") {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4"
        style={{ background: "linear-gradient(135deg, #09090b 0%, #0c1222 50%, #09090b 100%)", fontFamily: "'Lexend', system-ui, sans-serif" }}
      >
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-base font-semibold text-zinc-200">Building your game...</p>
        <p className="text-sm text-zinc-400">This usually takes 10-20 seconds</p>
      </div>
    )
  }

  if (step === "play" && gameHtml) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col"
        style={{ background: "linear-gradient(135deg, #09090b 0%, #0c1222 50%, #09090b 100%)", fontFamily: "'Lexend', system-ui, sans-serif" }}
      >
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/50 shrink-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-zinc-300 hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Done
          </button>
          <div className="flex items-center gap-2">
            {hasWon && !saved && (
              <button
                onClick={handleAddToLibrary}
                disabled={saving}
                className="flex items-center gap-1 text-xs font-semibold rounded-md px-3 py-1.5 transition-all active:scale-[0.97]"
                style={{ background: "linear-gradient(135deg, #059669, #10b981)", color: "white", boxShadow: "0 2px 8px rgba(16,185,129,0.3)" }}
              >
                <Library className="size-3.5" />
                {saving ? "Saving..." : "Add to library"}
              </button>
            )}
            {saved && (
              <span className="text-xs text-emerald-400 font-semibold px-3 py-1.5">Added!</span>
            )}
            <button
              onClick={handleTryAgain}
              className="flex items-center gap-1 text-xs text-zinc-400 border border-zinc-700 hover:text-white hover:border-zinc-500 rounded-md px-2.5 py-1 transition-colors"
            >
              <RotateCcw className="size-3.5" />
              Try different
            </button>
          </div>
        </div>

        {/* Win banner */}
        {hasWon && !saved && (
          <div className="px-4 py-2 text-center text-sm font-semibold text-emerald-300" style={{ background: "rgba(16,185,129,0.1)", borderBottom: "1px solid rgba(16,185,129,0.2)" }}>
            You won! Add your game to the library so others can play it.
          </div>
        )}

        <div className="flex-1">
          <GameIframe
            html={gameHtml}
            className="w-full h-full"
            onWin={(data) => {
              setHasWon(true)
              logFromClient({
                type: "game_play",
                standardId,
                learnerId: activeProfile?.uid || "",
                gameId: `builder-${builderType}`,
                outcome: "win",
                hintUsed: false,
                score: data?.score,
                rounds: data?.rounds,
                sessionDurationMs: data?.sessionDurationMs,
              })
            }}
          />
        </div>
      </div>
    )
  }

  return null
}
