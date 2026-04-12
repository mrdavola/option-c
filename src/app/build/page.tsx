"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { SPRITE_CHARACTERS, SPRITE_BACKGROUNDS } from "@/lib/sprite-library"
import { LearnerNav } from "@/components/learner-nav"
import { UserMenu } from "@/components/user-menu"
import { Logo } from "@/components/logo"
import { Loader2, ArrowLeft, Zap } from "lucide-react"

// Eureka / "Build NOW!" page.
// Reverse flow: imagination first, curriculum second.
// 1. Pick background
// 2. Pick character
// 3. Describe your game idea (free text)
// 4. AI matches to a game mechanic + standard
// 5. Show moon card, then build

type Step = "background" | "character" | "describe" | "matching" | "matched" | "building"

interface MatchResult {
  mechanicId: string
  mechanicTitle: string
  optionId: string
  optionName: string
  optionDescription: string
  standardId: string
  standardDescription: string
  moonName: string
  explanation: string
}

export default function BuildPage() {
  const { activeProfile } = useAuth()
  const [step, setStep] = useState<Step>("background")
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null)
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)
  const [gameIdea, setGameIdea] = useState("")
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null)
  const [suggestions, setSuggestions] = useState<Array<{ optionId: string; optionName: string; description: string; mechanicId: string; standardId: string; standardDescription: string }>>([])
  const [allOptions, setAllOptions] = useState<Array<{ optionId: string; optionName: string; description: string; mechanicId: string; standardId: string; standardDescription: string }>>([])
  const [showAllOptions, setShowAllOptions] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDescribeSubmit = async () => {
    if (!gameIdea.trim() || !activeProfile) return
    setStep("matching")
    setError(null)
    try {
      const res = await fetch("/api/game/eureka-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          background: selectedBackground,
          character: selectedCharacter,
          gameIdea: gameIdea.trim(),
          grade: activeProfile.grade || "6",
          uid: activeProfile.uid,
        }),
      })
      const data = await res.json()
      if (data.match) {
        setMatchResult(data.match)
        setStep("matched")
      } else if (data.suggestions) {
        setSuggestions(data.suggestions)
        setAllOptions(data.allOptions || [])
        setStep("matched")
      } else {
        setError(data.error || "Couldn't match your idea. Try describing it differently!")
        setStep("describe")
      }
    } catch {
      setError("Something went wrong. Try again!")
      setStep("describe")
    }
  }

  const handlePickSuggestion = (suggestion: typeof suggestions[0]) => {
    setMatchResult({
      mechanicId: suggestion.mechanicId,
      mechanicTitle: "",
      optionId: suggestion.optionId,
      optionName: suggestion.optionName,
      optionDescription: suggestion.description,
      standardId: suggestion.standardId,
      standardDescription: suggestion.standardDescription,
      moonName: "",
      explanation: "",
    })
    setSuggestions([])
    setShowAllOptions(false)
  }

  const handleBuild = () => {
    if (!matchResult) return
    // Navigate to the galaxy with the standard pre-selected
    window.location.href = `/?moon=${encodeURIComponent(matchResult.standardId)}&mechanic=${encodeURIComponent(matchResult.mechanicId)}&option=${encodeURIComponent(matchResult.optionId)}&bg=${encodeURIComponent(selectedBackground || "")}&char=${encodeURIComponent(selectedCharacter || "")}`
  }

  if (!activeProfile) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400">Sign in to build a game!</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={28} className="text-blue-400" />
            <h1 className="text-lg font-bold">Build NOW!</h1>
            <Zap className="size-4 text-emerald-400" />
          </div>
          <UserMenu />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <LearnerNav />

        <div className="mt-6">
          {/* Step 1: Background */}
          {step === "background" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Where does your game take place?</h2>
              <p className="text-sm text-zinc-400">Pick a world for your game.</p>
              <div className="grid grid-cols-5 gap-3">
                {[...SPRITE_BACKGROUNDS].map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => { setSelectedBackground(bg.id); setStep("character") }}
                    className="p-3 rounded-xl border-2 text-center transition-all hover:scale-105 border-zinc-700 bg-zinc-800/50 hover:border-blue-500"
                  >
                    <img src={`/sprites/backgrounds/${bg.id}.svg`} alt={bg.label} className="w-full h-14 object-cover rounded mb-1" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                    <span className="text-xs text-zinc-300">{bg.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Character */}
          {step === "character" && (
            <div className="space-y-4">
              <button onClick={() => setStep("background")} className="text-sm text-zinc-400 hover:text-white flex items-center gap-1">
                <ArrowLeft className="size-3.5" /> Change background
              </button>
              <h2 className="text-xl font-bold">Who is the player?</h2>
              <p className="text-sm text-zinc-400">Pick your character.</p>
              <div className="grid grid-cols-5 gap-3">
                {[...SPRITE_CHARACTERS].map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => { setSelectedCharacter(ch.id); setStep("describe") }}
                    className="p-3 rounded-xl border-2 text-center transition-all hover:scale-105 border-zinc-700 bg-zinc-800/50 hover:border-blue-500"
                  >
                    <img src={`/sprites/characters/${ch.id}.svg`} alt={ch.label} className="w-12 h-12 mx-auto mb-1" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                    <span className="text-xs text-zinc-300">{ch.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Describe your game */}
          {step === "describe" && (
            <div className="space-y-4">
              <button onClick={() => setStep("character")} className="text-sm text-zinc-400 hover:text-white flex items-center gap-1">
                <ArrowLeft className="size-3.5" /> Change character
              </button>
              <div className="flex items-center gap-3 bg-zinc-900 rounded-xl p-3 border border-zinc-800">
                <img src={`/sprites/backgrounds/${selectedBackground}.svg`} alt="" className="w-16 h-10 rounded object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                <img src={`/sprites/characters/${selectedCharacter}.svg`} alt="" className="w-10 h-10" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                <span className="text-sm text-zinc-300">Your {selectedCharacter} in {selectedBackground}</span>
              </div>
              <h2 className="text-xl font-bold">What happens in your game?</h2>
              <p className="text-sm text-zinc-400">Describe your game idea. What does the player do? What&apos;s the challenge?</p>
              <textarea
                value={gameIdea}
                onChange={(e) => setGameIdea(e.target.value)}
                placeholder="Example: The pirate sails between islands collecting treasure, but has to figure out the shortest route..."
                className="w-full h-28 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none"
                autoFocus
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                onClick={handleDescribeSubmit}
                disabled={!gameIdea.trim()}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white font-bold transition-colors"
              >
                Find the perfect game match!
              </button>
            </div>
          )}

          {/* Step 4: AI matching */}
          {step === "matching" && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="size-8 text-emerald-400 animate-spin" />
              <p className="text-sm text-zinc-400 animate-pulse">Finding the perfect math game for your idea...</p>
            </div>
          )}

          {/* Step 5: Match result */}
          {step === "matched" && matchResult && (
            <div className="space-y-5">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 text-center">
                <p className="text-emerald-300 font-bold text-lg mb-1">Great match!</p>
                <p className="text-sm text-zinc-300">Your idea works with <strong>{matchResult.optionName}</strong></p>
              </div>

              {/* Moon card preview */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
                <p className="text-xs text-blue-400 uppercase tracking-wide font-semibold">The math behind your game</p>
                <p className="text-sm text-zinc-200">{matchResult.standardDescription}</p>
                {matchResult.explanation && (
                  <p className="text-sm text-zinc-400">{matchResult.explanation}</p>
                )}
                <p className="text-[10px] text-zinc-600">{matchResult.standardId}</p>
              </div>

              <button
                onClick={handleBuild}
                className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-base font-bold transition-colors shadow-lg shadow-emerald-900/30"
              >
                Build this game!
              </button>
            </div>
          )}

          {/* Step 5 alt: No direct match — show suggestions */}
          {step === "matched" && !matchResult && suggestions.length > 0 && (
            <div className="space-y-5">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 text-center">
                <p className="text-amber-300 font-bold mb-1">Close, but not an exact match!</p>
                <p className="text-sm text-zinc-300">Your character could do one of these instead:</p>
              </div>

              <div className="space-y-2">
                {suggestions.map((s) => (
                  <button
                    key={s.optionId}
                    onClick={() => handlePickSuggestion(s)}
                    className="w-full text-left p-4 rounded-xl border-2 border-zinc-700 bg-zinc-900 hover:border-emerald-500/50 transition-all"
                  >
                    <p className="text-sm font-bold text-white">{s.optionName}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{s.description}</p>
                  </button>
                ))}
              </div>

              {!showAllOptions && allOptions.length > 0 && (
                <button
                  onClick={() => setShowAllOptions(true)}
                  className="w-full py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  None of these? See all available game options...
                </button>
              )}

              {showAllOptions && (
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide font-semibold">All game options for skills you still need:</p>
                  {allOptions.map((o) => (
                    <button
                      key={o.optionId}
                      onClick={() => handlePickSuggestion(o)}
                      className="w-full text-left p-3 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 transition-all"
                    >
                      <p className="text-sm font-semibold text-zinc-200">{o.optionName}</p>
                      <p className="text-xs text-zinc-500">{o.description}</p>
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={() => { setStep("describe"); setGameIdea(""); setSuggestions([]); setShowAllOptions(false) }}
                className="w-full py-2 text-sm text-zinc-500 hover:text-white transition-colors"
              >
                Start over with a new idea
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
