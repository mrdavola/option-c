"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"

type BuilderChoice =
  | { type: "scenario"; scenario: string }
  | { type: "madlib" }
  | { type: "comic" }
  | { type: "sentence" }
  | { type: "paste" }

interface BuilderPickerProps {
  standardId: string
  onPick: (builderType: "sentence" | "madlib" | "cards" | "comic" | "paste") => void
  onPickScenario: (scenario: string) => void
  onBack: () => void
}

const SCENARIOS = [
  { title: "Bakery", desc: "A baker has pastries on the shelf. More come out of the oven.", scenario: "A baker has some pastries on the shelf. A fresh batch comes out of the oven. Now the baker needs to count how many pastries there are to sell." },
  { title: "Toy Store", desc: "A kid has toys in a basket and picks more off the shelf.", scenario: "A kid already has some toys in their basket. They pick more off the shelf. How many toys are in the basket now?" },
  { title: "Farm", desc: "A farmer collects eggs. The chickens lay more.", scenario: "A farmer already collected some eggs this morning. The chickens laid more. How many eggs does the farmer have now?" },
  { title: "Sports", desc: "A team scores points in the first half, then more in the second.", scenario: "A basketball team scored some points in the first half. They scored more in the second half. How many points did they score in total?" },
  { title: "Party", desc: "Kids are at a party. More friends show up.", scenario: "There are some kids at the birthday party. Then more friends show up. How many kids are at the party now?" },
  { title: "Classroom", desc: "A teacher has pencils. She gets more from the closet.", scenario: "A teacher has some pencils on her desk. She gets more from the supply closet. How many pencils does she have now?" },
]

const BUILD_METHODS = [
  { id: "madlib" as const, title: "Fill in the blanks", desc: "Complete a story template with your own characters and things." },
  { id: "comic" as const, title: "Create a comic", desc: "Tell a 3-part story where someone needs to add." },
  { id: "sentence" as const, title: "Write your own", desc: "Describe any real-life addition situation in one sentence." },
]

export function BuilderPicker({ standardId, onPick, onPickScenario, onBack }: BuilderPickerProps) {
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null)

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "linear-gradient(135deg, #09090b 0%, #0c1222 50%, #09090b 100%)", fontFamily: "'Lexend', system-ui, sans-serif" }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 shrink-0">
        <button onClick={onBack} className="text-sm text-zinc-300 hover:text-white">
          <ArrowLeft className="size-4 inline mr-1" />
          Back
        </button>
        <div className="w-12" />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Build your game
            </h2>
            <p className="text-sm text-zinc-200">
              Your game needs a real-world situation where someone actually uses addition. Pick one below for inspiration, or create your own.
            </p>
          </div>

          {/* Section 1: Scenario inspiration */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Quick start — pick a scenario</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SCENARIOS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedScenario(selectedScenario === i ? null : i)}
                  className="text-left rounded-xl p-3 transition-all"
                  style={selectedScenario === i
                    ? { background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.5)", boxShadow: "0 0 12px rgba(59,130,246,0.2)" }
                    : { background: "rgba(24,24,27,0.7)", border: "1px solid rgba(63,63,70,0.4)" }
                  }
                >
                  <p className="text-sm font-semibold text-white">{s.title}</p>
                  <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">{s.desc}</p>
                </button>
              ))}
            </div>
            {selectedScenario !== null && (
              <button
                onClick={() => onPickScenario(SCENARIOS[selectedScenario].scenario)}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-transform active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #2563eb, #3b82f6)", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}
              >
                Build game with this scenario
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-zinc-700" />
            <span className="text-base font-bold text-zinc-200" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Or create your own</span>
            <div className="flex-1 h-px bg-zinc-700" />
          </div>

          {/* Section 2: Build methods */}
          <div className="grid grid-cols-3 gap-2">
            {BUILD_METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => onPick(m.id)}
                className="text-left rounded-xl p-3 transition-all hover:border-zinc-500"
                style={{ background: "rgba(24,24,27,0.7)", border: "1px solid rgba(63,63,70,0.4)" }}
              >
                <p className="text-sm font-semibold text-white">{m.title}</p>
                <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">{m.desc}</p>
              </button>
            ))}
          </div>

          {/* Paste HTML — subtle at bottom */}
          <button
            onClick={() => onPick("paste")}
            className="w-full text-center py-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Already have code? Paste your HTML game
          </button>

        </div>
      </div>
    </div>
  )
}
