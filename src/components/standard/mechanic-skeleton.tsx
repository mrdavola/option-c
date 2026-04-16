"use client"

// Mechanic Skeleton — shown between the Learn card and the Circuit Board Builder.
// The learner meets the MATH MECHANIC first (no background, no character art,
// no item sprites) so they can understand the gameplay before picking a theme.
//
// Flow:
//   1. Skeleton cards appear (one per game option mapped to this standard).
//   2. Learner clicks a card → playable skeleton game loads (skeletonMode: true).
//   3. Learner wins 1 round → celebration + 3 real-world uses → Ready to build.
//
// Integrated in standard-panel.tsx as a new "skeleton" step between
// "learn" and "earn".

import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, Loader2, Play, Sparkles } from "lucide-react"
import { GameIframe } from "@/components/game/game-iframe"
import { getGameOptionsForStandard } from "@/lib/standard-game-options"
import { getOptionDef } from "@/lib/game-engines/game-option-registry"
import { apiFetch } from "@/lib/api-fetch"
import type { GameOptionDef } from "@/lib/game-engines/game-option-registry"
import { getScenarios, type StandardScenario } from "@/lib/standard-scenarios"

// A custom card lets callers (like the Eureka/Build NOW flow) provide
// an explicit list of option+standard pairs instead of deriving them
// from a single standardId. Each card carries its own standard context
// so the generated skeleton game targets the right math.
export interface SkeletonCustomCard {
  option: GameOptionDef
  standardId: string
  standardDescription: string
  standardGrade: string
  badge?: string            // optional tag, e.g. "Best match"
  reason?: string           // optional AI-provided explanation
}

interface MechanicSkeletonProps {
  standardId: string
  standardDescription: string
  standardGrade: string
  mathSkillLabel?: string
  onReadyToBuild: (card?: SkeletonCustomCard, scenario?: StandardScenario) => void
  onBack: () => void
  // When provided, the skeleton page shows these cards instead of the
  // per-standard option list. Used by the Eureka flow to offer 3
  // cross-standard suggestions.
  customCards?: SkeletonCustomCard[]
  // Optional custom title for the banner.
  title?: string
  // Optional subtitle shown above the card grid.
  subtitle?: string
}

interface RealWorldUses {
  fun: string
  career: string
  practical: string
}

type Phase = "pick" | "playing" | "won"

// Decorative corner bones — pure SVG so no emojis.
function CornerBones({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 18 L46 50" />
      <circle cx="12" cy="16" r="5" fill="currentColor" stroke="none" />
      <circle cx="16" cy="12" r="5" fill="currentColor" stroke="none" />
      <circle cx="48" cy="52" r="5" fill="currentColor" stroke="none" />
      <circle cx="52" cy="48" r="5" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function MechanicSkeleton({
  standardId,
  standardDescription,
  standardGrade,
  mathSkillLabel,
  onReadyToBuild,
  onBack,
  customCards,
  title,
  subtitle,
}: MechanicSkeletonProps) {
  const [phase, setPhase] = useState<Phase>("pick")
  const [selectedOption, setSelectedOption] = useState<GameOptionDef | null>(null)
  const [selectedCard, setSelectedCard] = useState<SkeletonCustomCard | null>(null)
  const [gameHtml, setGameHtml] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uses, setUses] = useState<RealWorldUses | null>(null)
  const [usesLoading, setUsesLoading] = useState(false)

  // Resolve the 1-4 game option cards for this moon (moon-mode only).
  const optionCards: GameOptionDef[] = useMemo(() => {
    if (customCards && customCards.length > 0) return []
    const ids = getGameOptionsForStandard(standardId) ?? []
    return ids
      .map((id) => getOptionDef(id))
      .filter((o): o is GameOptionDef => Boolean(o))
  }, [standardId, customCards])

  // The active standard context for API calls — depends on whether we're
  // in per-standard moon mode or custom-card Eureka mode.
  const activeStandard = selectedCard
    ? { id: selectedCard.standardId, description: selectedCard.standardDescription, grade: selectedCard.standardGrade }
    : { id: standardId, description: standardDescription, grade: standardGrade }

  // Fetch real-world uses as soon as the learner wins a round.
  useEffect(() => {
    if (phase !== "won" || uses || usesLoading) return
    let cancelled = false
    setUsesLoading(true)
    fetch("/api/game/real-world-uses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ standardId, standardDescription, grade: standardGrade }),
    })
      .then((r) => r.json())
      .then((data: RealWorldUses) => { if (!cancelled) setUses(data) })
      .catch(() => {
        if (!cancelled) {
          setUses({
            fun: "You can use this math in games and puzzles you play with friends.",
            career: "Engineers, chefs, and designers use this kind of math at work.",
            practical: "It shows up when you budget money, cook, or plan a trip.",
          })
        }
      })
      .finally(() => { if (!cancelled) setUsesLoading(false) })
    return () => { cancelled = true }
  }, [phase, uses, usesLoading, activeStandard.id, activeStandard.description, activeStandard.grade])

  async function startSkeleton(option: GameOptionDef, card?: SkeletonCustomCard) {
    setSelectedOption(option)
    setSelectedCard(card ?? null)
    setLoading(true)
    setError(null)
    setGameHtml(null)
    const effectiveStandardId = card?.standardId ?? standardId
    const effectiveStandardDesc = card?.standardDescription ?? standardDescription
    const effectiveStandardGrade = card?.standardGrade ?? standardGrade
    try {
      const res = await apiFetch("/api/game/generate-engine", {
        method: "POST",
        body: JSON.stringify({
          mechanicId: option.mechanicId,
          gameOption: option.id,
          standardId: effectiveStandardId,
          standardDescription: effectiveStandardDesc,
          grade: effectiveStandardGrade,
          skeletonMode: true,
          designDoc: { title: "Mechanic Skeleton" },
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.html) {
        setError(data.error || "Could not build the skeleton game.")
        setLoading(false)
        return
      }
      setGameHtml(data.html)
      setPhase("playing")
    } catch {
      setError("Network error — try again.")
    } finally {
      setLoading(false)
    }
  }

  function resetToPick() {
    setPhase("pick")
    setSelectedOption(null)
    setSelectedCard(null)
    setGameHtml(null)
    setUses(null)
  }

  const skillLabel = mathSkillLabel || activeStandard.description

  return (
    <div className="fixed inset-0 z-50 bg-[#fafafa] flex flex-col text-zinc-900" style={{ fontFamily: "'Lexend', system-ui, sans-serif" }}>
      {/* Top banner — light mode (Brilliant-inspired aesthetic) */}
      <div className="relative flex items-center justify-between px-4 sm:px-6 py-3 border-b border-zinc-200 bg-white shrink-0">
        <button
          onClick={phase === "playing" || phase === "won" ? resetToPick : onBack}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ChevronLeft className="size-4" />
          Back
        </button>
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-none absolute left-1/2 -translate-x-1/2">
          <h1
            className="text-sm sm:text-base font-semibold tracking-tight text-zinc-900 whitespace-nowrap"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {title ?? "Try the mechanic"}
          </h1>
        </div>
        <div className="w-10" aria-hidden />
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {phase === "pick" && (
          <PickPhase
            optionCards={optionCards}
            customCards={customCards}
            skillLabel={skillLabel}
            subtitle={subtitle}
            onPick={startSkeleton}
            loading={loading}
            loadingOptionId={selectedOption?.id ?? null}
            error={error}
            onReadyToBuild={() => onReadyToBuild(selectedCard ?? undefined)}
          />
        )}

        {phase === "playing" && gameHtml && (
          <PlayingPhase
            html={gameHtml}
            skillLabel={skillLabel}
            optionName={selectedOption?.name ?? ""}
            onWin={() => setPhase("won")}
          />
        )}

        {phase === "won" && (
          <WonPhase
            optionName={selectedOption?.name ?? ""}
            uses={uses}
            usesLoading={usesLoading}
            scenarios={getScenarios(activeStandard.id)}
            onUseScenario={(scenario) => onReadyToBuild(selectedCard ?? undefined, scenario)}
            onReadyToBuild={() => onReadyToBuild(selectedCard ?? undefined)}
            onTryAnother={resetToPick}
          />
        )}
      </div>
    </div>
  )
}

// ─── Phase: Pick a mechanic ───────────────────────────────────────────────────
function PickPhase({
  optionCards,
  customCards,
  skillLabel,
  subtitle,
  onPick,
  loading,
  loadingOptionId,
  error,
  onReadyToBuild,
}: {
  optionCards: GameOptionDef[]
  customCards?: SkeletonCustomCard[]
  skillLabel: string
  subtitle?: string
  onPick: (opt: GameOptionDef, card?: SkeletonCustomCard) => void
  loading: boolean
  loadingOptionId: string | null
  error: string | null
  onReadyToBuild: () => void
}) {
  const usingCustom = !!(customCards && customCards.length > 0)
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-400 font-semibold">
          {usingCustom ? "Your idea matched 3 mechanics" : "Skill"}
        </p>
        <h2
          className="text-xl sm:text-2xl font-bold text-white"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {skillLabel}
        </h2>
        <p className="text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          {subtitle ?? "Meet the math mechanic first. No theme, no characters — just the pure gameplay. Win one round, then build your own themed version."}
        </p>
      </div>

      {usingCustom ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {customCards!.map((card, idx) => {
            const isLoading = loading && loadingOptionId === card.option.id
            const badge = card.badge ?? (idx === 0 ? "Best match" : undefined)
            return (
              <button
                key={`${card.option.id}-${card.standardId}`}
                onClick={() => !loading && onPick(card.option, card)}
                disabled={loading}
                className="group text-left rounded-2xl border-2 border-zinc-800 bg-zinc-900 hover:border-blue-500 hover:bg-zinc-900/80 p-5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col gap-3 min-h-[240px]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                    {card.option.mechanicId}
                  </span>
                  {badge ? (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded">
                      {badge}
                    </span>
                  ) : (
                    <CornerBones className="size-4 text-zinc-700 group-hover:text-blue-400 transition-colors" />
                  )}
                </div>
                <h3
                  className="text-lg font-bold text-white"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {card.option.name}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {card.option.description}
                </p>
                <div className="mt-auto space-y-2">
                  <div className="rounded-lg bg-zinc-800/70 border border-zinc-700 px-2.5 py-1.5">
                    <p className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold">The math</p>
                    <p className="text-xs text-zinc-300 leading-snug line-clamp-2">{card.standardDescription}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 group-hover:bg-blue-500 text-white text-sm font-semibold transition-colors">
                    {isLoading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Loading…
                      </>
                    ) : (
                      <>
                        <Play className="size-4" />
                        Play this mechanic
                      </>
                    )}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      ) : optionCards.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center text-sm text-zinc-400">
          No skeleton mechanics mapped for this moon yet.
          <div className="mt-4">
            <button
              onClick={onReadyToBuild}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
            >
              Skip to the builder →
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {optionCards.map((opt) => {
            const isLoading = loading && loadingOptionId === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => !loading && onPick(opt)}
                disabled={loading}
                className="group text-left rounded-2xl border-2 border-zinc-800 bg-zinc-900 hover:border-blue-500 hover:bg-zinc-900/80 p-5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col gap-3 min-h-[200px]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                    {opt.mechanicId}
                  </span>
                  <CornerBones className="size-4 text-zinc-700 group-hover:text-blue-400 transition-colors" />
                </div>
                <h3
                  className="text-lg font-bold text-white"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {opt.name}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed flex-1">
                  {opt.description}
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 group-hover:bg-blue-500 text-white text-sm font-semibold transition-colors">
                    {isLoading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Loading…
                      </>
                    ) : (
                      <>
                        <Play className="size-4" />
                        Play this mechanic
                      </>
                    )}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {error && (
        <div className="max-w-xl mx-auto rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300 text-center">
          {error}
        </div>
      )}
    </div>
  )
}

// ─── Phase: Playing ──────────────────────────────────────────────────────────
function PlayingPhase({
  html,
  skillLabel,
  optionName,
  onWin,
}: {
  html: string
  skillLabel: string
  optionName: string
  onWin: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Skill banner */}
      <div className="px-4 sm:px-6 py-2 bg-zinc-900/70 border-b border-zinc-800 shrink-0 flex items-center justify-between gap-3">
        <p className="text-xs sm:text-sm text-zinc-300">
          <span className="text-blue-400 font-semibold">Skill:</span>{" "}
          <span className="text-white">{skillLabel}</span>
        </p>
        <p className="text-[10px] sm:text-xs text-zinc-500 font-mono uppercase tracking-wider hidden sm:block">
          {optionName}
        </p>
      </div>

      {/* Persistent story-prompt banner */}
      <div className="px-4 sm:px-6 py-2 bg-amber-500/10 border-b border-amber-500/20 shrink-0">
        <p className="text-xs sm:text-sm text-amber-200 leading-relaxed">
          <span className="font-semibold">As you play, think about the back-story of your game</span>
          {" — "}who the character could be and what they would be doing this for.
          Come up with something that makes sense so the math is used like in the real world.
        </p>
      </div>

      {/* The skeleton game */}
      <div className="flex-1 min-h-0 bg-[#0a0a0a]">
        <GameIframe html={html} className="w-full h-full" onWin={onWin} />
      </div>
    </div>
  )
}

// ─── Phase: Won (celebration + real-world uses) ──────────────────────────────
function WonPhase({
  optionName,
  uses,
  usesLoading,
  scenarios,
  onUseScenario,
  onReadyToBuild,
  onTryAnother,
}: {
  optionName: string
  uses: RealWorldUses | null
  usesLoading: boolean
  scenarios: StandardScenario[] | null
  onUseScenario: (scenario: StandardScenario) => void
  onReadyToBuild: () => void
  onTryAnother: () => void
}) {
  const hasScenarios = scenarios && scenarios.length > 0
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center size-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400/50">
          <Sparkles className="size-10 text-emerald-300" />
        </div>
        <h2
          className="text-3xl font-bold text-white"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          You got it! <span aria-hidden>🎉</span>
        </h2>
        {optionName && (
          <p className="text-sm text-zinc-400">
            You cleared a round of{" "}
            <span className="text-blue-300 font-semibold">{optionName}</span>.
          </p>
        )}
      </div>

      {hasScenarios ? (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h3
              className="text-xl font-bold text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Pick an idea for your game
            </h3>
            <p className="text-sm text-zinc-400">
              Here are real-world stories where this math is used. Click one and we&apos;ll set up your game!
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {scenarios!.map((s, i) => (
              <ScenarioCard key={i} scenario={s} onPick={() => onUseScenario(s)} />
            ))}
          </div>

          <div className="text-center pt-2">
            <button
              onClick={onReadyToBuild}
              className="text-sm text-zinc-400 hover:text-white underline underline-offset-4"
            >
              Or come up with your own idea →
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6 space-y-4">
          <h3
            className="text-sm font-bold uppercase tracking-wider text-zinc-300"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Real-world uses of this math skill
          </h3>
          {usesLoading || !uses ? (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Loader2 className="size-4 animate-spin" />
              Finding real-world examples…
            </div>
          ) : (
            <ul className="space-y-3">
              <UseBullet label="For fun" color="text-fuchsia-300" text={uses.fun} />
              <UseBullet label="As a career" color="text-blue-300" text={uses.career} />
              <UseBullet label="Every day" color="text-emerald-300" text={uses.practical} />
            </ul>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {!hasScenarios && (
          <button
            onClick={onReadyToBuild}
            className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-base font-bold transition-colors shadow-lg shadow-emerald-900/30"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Ready to build your game! →
          </button>
        )}
        <button
          onClick={onTryAnother}
          className="flex-1 py-3.5 rounded-xl border-2 border-zinc-700 hover:border-zinc-500 text-zinc-200 text-base font-semibold transition-colors"
        >
          Try another mechanic
        </button>
      </div>
    </div>
  )
}

function ScenarioCard({ scenario, onPick }: { scenario: StandardScenario; onPick: () => void }) {
  return (
    <button
      onClick={onPick}
      className="group text-left rounded-2xl border-2 border-zinc-800 bg-zinc-900 hover:border-emerald-500 hover:bg-zinc-900/80 p-5 transition-all flex flex-col gap-3 min-h-[280px]"
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl" aria-hidden>{scenario.icon}</span>
        <h4
          className="text-lg font-bold text-white"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {scenario.title}
        </h4>
      </div>
      <p className="text-sm text-zinc-300 leading-relaxed flex-1">{scenario.story}</p>
      <div className="rounded-lg bg-zinc-800/70 border border-zinc-700 px-3 py-2">
        <p className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold mb-0.5">The math</p>
        <p className="text-lg text-white font-mono font-bold text-center">{scenario.math}</p>
      </div>
      <span className="mt-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 group-hover:bg-emerald-500 text-white text-sm font-bold transition-colors">
        Use this idea! →
      </span>
    </button>
  )
}

function UseBullet({ label, color, text }: { label: string; color: string; text: string }) {
  return (
    <li className="flex gap-3">
      <span className={`shrink-0 text-xs font-bold uppercase tracking-wide ${color} mt-0.5 w-20`}>
        {label}
      </span>
      <span className="text-sm text-zinc-200 leading-relaxed">{text}</span>
    </li>
  )
}
