"use client"

import { useState, useMemo } from "react"
import { Loader2 } from "lucide-react"
import type { MechanicAnimation } from "@/lib/mechanic-animations"
import { matchMechanics } from "@/lib/mechanic-animations"
import { MECHANIC_OPTIONS_MAP } from "@/lib/mechanic-card-options"
import { SPRITE_CHARACTERS, SPRITE_ITEMS, SPRITE_BACKGROUNDS, CHARACTER_CATEGORIES, BACKGROUND_CATEGORIES, ITEM_CATEGORIES } from "@/lib/sprite-library"
import { SpritePicker } from "@/components/sprite-picker"
import { getGameOptions, getOptionDef } from "@/lib/game-engines/game-option-registry"
import { getGameOptionsForStandard } from "@/lib/standard-game-options"
import { getRecommendedItems } from "@/lib/item-recommendations"
import { ConsoleAnimation } from "@/components/game/console-animation"
import { MechanicSkeleton, type SkeletonCustomCard } from "@/components/standard/mechanic-skeleton"
import type { GameDesignDoc } from "@/lib/game-types"

// The circuit board game builder.
// Replaces the old card builder + mechanic selection.
// Learner drags components into slots on a circuit board visual.

interface CircuitBoardBuilderProps {
  // Moon mode (standard known)
  standardId?: string
  standardDescription?: string
  standardGrade?: string
  standardDomainCode?: string
  planetId?: string
  // Eureka mode (standard unknown — AI will match)
  mode?: "moon" | "eureka"
  learnerGrade?: string
  learnerUid?: string
  // Optional pre-fill from a scenario picked on the mechanic skeleton celebration screen.
  // When present, auto-selects background/character/item and fills backstory.
  // Learner can still change any of them.
  prefilledScenario?: import("@/lib/standard-scenarios").StandardScenario
  // Callbacks
  onBuildGame: (designDoc: GameDesignDoc, summary: string, vibe: string, mechanicId: string) => void
  onBack: () => void
}


interface GameOptionInfo {
  mechanicId: string
  mechanicTitle: string
  mechanicDescription: string
  optionId: string           // game option ID from registry, e.g. "free-collect"
  optionName: string
  optionDescription: string
}

export function CircuitBoardBuilder({
  standardId = "",
  standardDescription = "",
  standardGrade = "",
  standardDomainCode = "",
  planetId = "",
  mode = "moon",
  learnerGrade,
  learnerUid,
  prefilledScenario,
  onBuildGame,
  onBack,
}: CircuitBoardBuilderProps) {
  const isEureka = mode === "eureka"

  // Get matching mechanics (used for math role display)
  const mechanics = useMemo(
    () => isEureka ? [] : matchMechanics(standardDescription, standardDomainCode),
    [standardDescription, standardDomainCode, isEureka]
  )

  // Get game options — per-standard hardcoded mapping (most accurate)
  const gameOptions: GameOptionInfo[] = useMemo(() => {
    if (isEureka) return []
    // Try per-standard mapping first (466 moons individually mapped)
    const standardOptions = standardId ? getGameOptionsForStandard(standardId) : null
    if (standardOptions && standardOptions.length > 0) {
      return standardOptions.map(optId => {
        const opt = getOptionDef(optId)
        if (!opt) return null
        return {
          mechanicId: opt.mechanicId,
          mechanicTitle: "",
          mechanicDescription: "",
          optionId: opt.id,
          optionName: opt.name,
          optionDescription: opt.description,
        }
      }).filter(Boolean) as GameOptionInfo[]
    }
    // Fallback: mechanic-based matching
    const options: GameOptionInfo[] = []
    for (const m of mechanics) {
      const regOptions = getGameOptions(m.id)
      for (const opt of regOptions) {
        options.push({
          mechanicId: m.id,
          mechanicTitle: m.title,
          mechanicDescription: m.description,
          optionId: opt.id,
          optionName: opt.name,
          optionDescription: opt.description,
        })
      }
    }
    return options
  }, [isEureka, standardId, mechanics])

  // Selected components — initialize from prefilled scenario when present
  const [selectedBackground, setSelectedBackground] = useState<string | null>(
    prefilledScenario?.gameIdea.background ?? null,
  )
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(
    prefilledScenario?.gameIdea.character ?? null,
  )
  const [selectedGameOption, setSelectedGameOption] = useState<GameOptionInfo | null>(null)
  const [selectedItem, setSelectedItem] = useState<string | null>(
    prefilledScenario?.gameIdea.item ?? null,
  )
  const [backstory, setBackstory] = useState<string>(
    prefilledScenario?.gameIdea.backstory ?? "",
  )
  const [building, setBuilding] = useState(false)

  // Eureka mode state
  // Phases: "idea" → learner types idea · "skeleton" → plays mechanic skeleton ·
  // "build" → full themed builder (sprite grids + backstory).
  type EurekaPhase = "idea" | "skeleton" | "build"
  const [eurekaPhase, setEurekaPhase] = useState<EurekaPhase>("idea")
  const [eurekaIdea, setEurekaIdea] = useState("")
  const [eurekaMatching, setEurekaMatching] = useState(false)
  const [eurekaMatchError, setEurekaMatchError] = useState<string | null>(null)
  const [eurekaSuggestions, setEurekaSuggestions] = useState<Array<{ optionId: string; optionName: string; description: string; mechanicId: string; standardId: string; standardDescription: string; standardGrade?: string }>>([])
  const [eurekaStandardId, setEurekaStandardId] = useState("")
  const [eurekaStandardDesc, setEurekaStandardDesc] = useState("")
  const [eurekaStandardGrade, setEurekaStandardGrade] = useState("")

  const allFilled = selectedBackground && selectedCharacter && selectedGameOption && selectedItem
  const filledCount = [selectedBackground, selectedCharacter, selectedGameOption, selectedItem].filter(Boolean).length

  // Eureka: submit idea to AI for matching. Always expects 3 suggestions now.
  const handleEurekaMatch = async () => {
    if (!eurekaIdea.trim() || eurekaMatching) return
    setEurekaMatching(true)
    setEurekaMatchError(null)
    try {
      const res = await fetch("/api/game/eureka-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Sprites aren't picked yet in the new flow; send nulls so the AI
          // focuses purely on the written game idea.
          background: null,
          character: null,
          item: null,
          gameIdea: eurekaIdea.trim(),
          grade: learnerGrade || "6",
          uid: learnerUid || "",
        }),
      })
      const data = await res.json()
      const suggestions = (data.suggestions || []) as typeof eurekaSuggestions
      if (suggestions.length === 0) {
        setEurekaMatchError("We couldn't match that idea. Try describing what the player DOES in the game.")
      } else {
        setEurekaSuggestions(suggestions)
        setEurekaPhase("skeleton")
      }
    } catch {
      setEurekaMatchError("Network error — please try again.")
    }
    setEurekaMatching(false)
  }

  // Called when the learner wins a skeleton round and clicks "Ready to build".
  // The `card` arg tells us which option+standard they chose.
  const handleSkeletonReadyToBuild = (card?: SkeletonCustomCard) => {
    if (!card) return
    setSelectedGameOption({
      mechanicId: card.option.mechanicId,
      mechanicTitle: "",
      mechanicDescription: "",
      optionId: card.option.id,
      optionName: card.option.name,
      optionDescription: card.option.description,
    })
    setEurekaStandardId(card.standardId)
    setEurekaStandardDesc(card.standardDescription)
    setEurekaStandardGrade(card.standardGrade)
    setEurekaPhase("build")
  }

  // Build the skeleton cards from suggestions.
  const eurekaSkeletonCards: SkeletonCustomCard[] = useMemo(() => {
    return eurekaSuggestions
      .map((s, idx): SkeletonCustomCard | null => {
        const opt = getOptionDef(s.optionId)
        if (!opt) return null
        return {
          option: opt,
          standardId: s.standardId,
          standardDescription: s.standardDescription,
          standardGrade: s.standardGrade || learnerGrade || "6",
          badge: idx === 0 ? "Best match" : undefined,
        }
      })
      .filter((c): c is SkeletonCustomCard => c !== null)
  }, [eurekaSuggestions, learnerGrade])

  // Game Criteria lights
  const criteriaWellApplied = !!selectedGameOption  // Math Well Applied: game option selected
  const criteriaEssential = !!selectedGameOption  // Math Essential: game option selected (win condition is always "complete 5 rounds")
  const criteriaPlayable = !!selectedBackground && !!selectedCharacter && !!selectedGameOption && !!selectedItem  // Playable: all 4 slots filled

  const handleBuild = async () => {
    if (!allFilled || !selectedGameOption) return
    setBuilding(true)
    try {
      const effectiveStandardId = isEureka ? eurekaStandardId : standardId
      const effectiveStandardDesc = isEureka ? eurekaStandardDesc : standardDescription
      const effectivePlanetId = isEureka ? "" : planetId

      const summary = `Game Option: ${selectedGameOption.optionName}
Mechanic: ${selectedGameOption.mechanicTitle}
Background: ${selectedBackground}
Character: ${selectedCharacter}
Item: ${selectedItem}
Math: ${effectiveStandardDesc}`

      const res = await fetch("/api/game/design-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatHistory: summary,
          standardId: effectiveStandardId,
          standardDescription: effectiveStandardDesc,
          planetId: effectivePlanetId,
        }),
      })
      const designDoc = (await res.json()) as GameDesignDoc
      ;(designDoc as any).cardChoices = {
        theme: selectedBackground,
        character: selectedCharacter,
        action: selectedGameOption.optionDescription,
        win: "Complete all 5 rounds",
        backstory: backstory.trim() || undefined,
      }
      ;(designDoc as any).backstory = backstory.trim() || undefined
      ;(designDoc as any).sprites = {
        characterSprite: selectedCharacter,
        itemSprite: selectedItem,
        backgroundImage: selectedBackground,
      }
      ;(designDoc as any).gameOption = selectedGameOption.optionId

      onBuildGame(designDoc, summary, "default", selectedGameOption.mechanicId)
    } catch {
      // Fallback
    } finally {
      setBuilding(false)
    }
  }

  // ─── Eureka phase 1: idea entry ────────────────────────────────────────────
  if (isEureka && eurekaPhase === "idea") {
    return (
      <div className="flex flex-col gap-4 py-4">
        <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">💡</span>
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              What&apos;s your game idea?
            </h2>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Describe what happens in your game — what the player DOES. The AI will
            suggest 3 math mechanics that fit your idea. You&apos;ll play a quick
            preview of each before picking one to theme and build.
          </p>
          <textarea
            value={eurekaIdea}
            onChange={(e) => setEurekaIdea(e.target.value)}
            placeholder="Example: I want to make a game about rockets flying between planets, and you have to figure out how much fuel you need for each trip."
            className="w-full h-28 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none"
          />
          <button
            onClick={handleEurekaMatch}
            disabled={!eurekaIdea.trim() || eurekaMatching}
            className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white text-base font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {eurekaMatching ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Finding 3 mechanics that fit your idea…
              </>
            ) : (
              "Find matching mechanics →"
            )}
          </button>
          {eurekaMatchError && (
            <p className="text-sm text-red-300 text-center">{eurekaMatchError}</p>
          )}
        </div>
        <button onClick={onBack} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors self-start">
          ← Back
        </button>
      </div>
    )
  }

  // ─── Eureka phase 2: play the mechanic skeleton ────────────────────────────
  if (isEureka && eurekaPhase === "skeleton") {
    return (
      <MechanicSkeleton
        // These props are only used when no customCards are passed — we pass
        // harmless defaults so TS stays happy.
        standardId=""
        standardDescription=""
        standardGrade={learnerGrade || "6"}
        customCards={eurekaSkeletonCards}
        title="Preview a mechanic for your idea"
        subtitle="The AI matched your idea to these math mechanics. Play one round of the pure gameplay (no theme yet), then pick it to build your themed game."
        mathSkillLabel={`Your idea: "${eurekaIdea.trim().slice(0, 80)}${eurekaIdea.trim().length > 80 ? "…" : ""}"`}
        onReadyToBuild={handleSkeletonReadyToBuild}
        onBack={() => { setEurekaPhase("idea"); setEurekaSuggestions([]) }}
      />
    )
  }

  // ─── Default / Eureka phase 3 (build) / Moon mode ──────────────────────────
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <ConsoleAnimation
        hasBackground={!!selectedBackground}
        hasCharacter={!!selectedCharacter}
        hasGameOption={!!selectedGameOption}
        hasItem={!!selectedItem}
        allFilled={!!allFilled}
        onBuildStart={handleBuild}
      >
      {/* Circuit board layout inside console */}
      <div className="space-y-4">
        {/* Math Role — static, already filled */}
        <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">🧮</span>
            <span className="text-xs text-zinc-500 uppercase tracking-wide font-semibold">Math Role</span>
            <span className="text-[9px] text-emerald-300/80 uppercase bg-emerald-500/15 px-1.5 py-0.5 rounded font-semibold">auto</span>
          </div>
          <p className="text-sm text-zinc-200">{isEureka ? (eurekaStandardDesc || "Will be matched from your game idea") : (mechanics[0]?.mathDomain || standardDescription)}</p>
        </div>

        {/* SLOT 1: Background */}
        <SlotSection
          icon="🌍"
          label="Background"
          selected={selectedBackground}
          onClear={() => setSelectedBackground(null)}
        >
          <SpritePicker
            type="backgrounds"
            libraryItems={SPRITE_BACKGROUNDS}
            categories={BACKGROUND_CATEGORIES}
            selected={selectedBackground}
            onSelect={setSelectedBackground}
          />
        </SlotSection>

        {/* SLOT 2: Character */}
        <SlotSection
          icon="🧑"
          label="Character"
          selected={selectedCharacter}
          onClear={() => setSelectedCharacter(null)}
        >
          <SpritePicker
            type="characters"
            libraryItems={SPRITE_CHARACTERS}
            categories={CHARACTER_CATEGORIES}
            selected={selectedCharacter}
            onSelect={setSelectedCharacter}
          />
        </SlotSection>

        {/* In Eureka mode: Items come BEFORE Game Option (learner picks items first, then describes idea) */}
        {isEureka && (
          <SlotSection
            icon="⭐"
            label="Item"
            selected={selectedItem}
            onClear={() => setSelectedItem(null)}
          >
            <SpritePicker
              type="items"
              libraryItems={SPRITE_ITEMS}
              categories={ITEM_CATEGORIES}
              selected={selectedItem}
              onSelect={setSelectedItem}
              recommended={[]}
            />
          </SlotSection>
        )}

        {/* SLOT 3: Game Option */}
        <SlotSection
          icon="🎮"
          label={isEureka ? "What does your character do?" : "Game Option"}
          selected={selectedGameOption ? selectedGameOption.optionName : null}
          onClear={() => { setSelectedGameOption(null); setEurekaSuggestions([]) }}
        >
          {isEureka ? (
            /* EUREKA MODE: by the time we're here the learner already picked
               a mechanic via the skeleton preview. Show a summary + option to
               try a different mechanic. */
            <div className="space-y-3">
              {selectedGameOption && eurekaStandardDesc && (
                <>
                  <div className="bg-emerald-500/5 rounded-lg p-3 border border-emerald-500/20">
                    <p className="text-xs text-emerald-400 uppercase tracking-wide font-semibold mb-1">You picked</p>
                    <p className="text-sm text-white font-semibold">{selectedGameOption.optionName}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{selectedGameOption.optionDescription}</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                    <p className="text-xs text-blue-400 uppercase tracking-wide font-semibold mb-1">The math behind this</p>
                    <p className="text-sm text-zinc-200">{eurekaStandardDesc.split(".")[0]}.</p>
                  </div>
                  {eurekaIdea && (
                    <div className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-800">
                      <p className="text-xs text-zinc-500 uppercase tracking-wide font-semibold mb-1">Your idea</p>
                      <p className="text-sm text-zinc-400 italic">&ldquo;{eurekaIdea}&rdquo;</p>
                    </div>
                  )}
                  <button
                    onClick={() => setEurekaPhase("skeleton")}
                    className="w-full py-2 rounded-lg border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-sm font-medium transition-colors"
                  >
                    ← Try a different mechanic
                  </button>
                </>
              )}
            </div>
          ) : (
            /* MOON MODE: pick from per-standard mapped game options */
            gameOptions.length === 0 ? (
              <p className="text-sm text-zinc-500">No game options available for this standard.</p>
            ) : (
              <div className="space-y-1.5">
                {gameOptions.map((opt) => {
                  const isSelected = selectedGameOption?.optionId === opt.optionId
                  return (
                    <button
                      key={opt.optionId}
                      onClick={() => setSelectedGameOption(opt)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all border-2 ${
                        isSelected
                          ? "border-emerald-500/60 bg-emerald-500/10"
                          : "border-zinc-700 hover:bg-zinc-800"
                      }`}
                    >
                      <span className={`text-sm font-semibold ${isSelected ? "text-emerald-300" : "text-white"}`}>{opt.optionName}</span>
                      <p className="text-xs text-zinc-400 mt-0.5">{opt.optionDescription}</p>
                    </button>
                  )
                })}
              </div>
            )
          )}
        </SlotSection>

        {/* SLOT 4: Items (moon mode only — in Eureka, items are above game option) */}
        {!isEureka && (
          <SlotSection
            icon="⭐"
            label="Item"
            selected={selectedItem}
            onClear={() => setSelectedItem(null)}
          >
            <SpritePicker
              type="items"
              libraryItems={SPRITE_ITEMS}
              categories={ITEM_CATEGORIES}
              selected={selectedItem}
              onSelect={setSelectedItem}
              recommended={[]}
            />
          </SlotSection>
        )}

        {/* SLOT 5: Backstory — optional, shown in both modes */}
        <SlotSection
          icon="📖"
          label="Backstory"
          selected={backstory.trim() ? (backstory.length > 28 ? backstory.slice(0, 28) + "…" : backstory) : null}
          onClear={() => setBackstory("")}
        >
          <textarea
            value={backstory}
            onChange={(e) => setBackstory(e.target.value.slice(0, 300))}
            maxLength={300}
            placeholder="What is your character doing? Why are they doing this math? (e.g., 'A wizard is measuring magical crystals for a potion and running out of time')"
            className="w-full h-24 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none"
          />
          <div className="mt-1 text-right text-[10px] text-zinc-500">{backstory.length}/300</div>
        </SlotSection>

      </div>

      </ConsoleAnimation>

      <button onClick={onBack} className="mt-3 px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
        ← Back
      </button>
    </div>
  )
}

function SlotSection({
  icon, label, selected, onClear, children,
}: {
  icon: string; label: string; selected: string | null; onClear: () => void; children: React.ReactNode
}) {
  const [expanded, setExpanded] = useState(!selected)

  return (
    <div className={`rounded-xl border-2 transition-all ${selected ? "border-emerald-500/40 bg-emerald-500/5" : "border-zinc-700 bg-zinc-900"}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2.5"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">{icon}</span>
          <span className="text-xs text-zinc-400 uppercase tracking-wide font-semibold">{label}</span>
          {selected && <span className="text-emerald-400 text-xs">✓ {selected}</span>}
        </div>
        <div className="flex items-center gap-2">
          {selected && (
            <button onClick={(e) => { e.stopPropagation(); onClear(); setExpanded(true); }} className="text-xs text-zinc-500 hover:text-zinc-300">Change</button>
          )}
          <svg className={`size-4 text-zinc-500 transition-transform ${expanded ? "rotate-180" : ""}`} viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>
      {expanded && <div className="px-3 pb-3">{children}</div>}
    </div>
  )
}

function CriteriaLight({ lit, label, icon }: { lit: boolean; label: string; icon: string }) {
  return (
    <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
      lit
        ? "border-emerald-500/40 bg-emerald-500/10"
        : "border-zinc-800 bg-zinc-900/50"
    }`}>
      <div className={`w-3 h-3 rounded-full transition-all ${
        lit ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-zinc-700"
      }`} />
      <span className="text-sm">{icon}</span>
      <span className={`text-[10px] font-semibold uppercase tracking-wide ${lit ? "text-emerald-300" : "text-zinc-600"}`}>
        {label}
      </span>
    </div>
  )
}

