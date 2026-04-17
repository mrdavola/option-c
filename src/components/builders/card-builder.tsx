"use client"

import { useState } from "react"

interface BuilderProps {
  standardId: string
  onGenerate: (scenario: string) => void
  onBack: () => void
}

interface ScenarioCard {
  title: string
  description: string
  scenario: string
  icon: React.ReactNode
}

const SCENARIOS: ScenarioCard[] = [
  {
    title: "Bakery",
    description: "A baker counts pastries on the shelf",
    scenario: "A baker has some pastries on the shelf. A fresh batch comes out of the oven. Now the baker needs to count how many pastries there are to sell.",
    icon: (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <rect x="10" y="24" width="28" height="16" rx="3" />
        <path d="M14 24c0-6 4-12 10-12s10 6 10 12" />
        <circle cx="20" cy="32" r="2" fill="currentColor" />
        <circle cx="28" cy="30" r="2" fill="currentColor" />
        <circle cx="24" cy="35" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Toy Store",
    description: "A kid picks out toys from the shelves",
    scenario: "A kid already has some toys in their basket. They pick more off the shelf. How many toys are in the basket now?",
    icon: (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <rect x="12" y="20" width="24" height="18" rx="2" />
        <path d="M18 20V14a6 6 0 0 1 12 0v6" />
        <circle cx="24" cy="30" r="4" />
      </svg>
    ),
  },
  {
    title: "Farm",
    description: "A farmer gathers eggs from the chickens",
    scenario: "A farmer already collected some eggs this morning. The chickens laid more. How many eggs does the farmer have now?",
    icon: (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <ellipse cx="24" cy="30" rx="10" ry="12" />
        <path d="M24 18c-2-4-6-8-4-12 1 3 4 4 4 4s3-1 4-4c2 4-2 8-4 12Z" />
      </svg>
    ),
  },
  {
    title: "Sports",
    description: "A team scores points during a game",
    scenario: "A basketball team scored some points in the first half. They scored more in the second half. How many points did they score in total?",
    icon: (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <circle cx="24" cy="24" r="14" />
        <path d="M10 24h28M24 10v28" />
        <path d="M14 14c4 4 4 16 0 20M34 14c-4 4-4 16 0 20" />
      </svg>
    ),
  },
  {
    title: "Party",
    description: "Friends arrive at a birthday party",
    scenario: "There are some kids at the birthday party. Then more friends show up. How many kids are at the party now?",
    icon: (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <rect x="16" y="22" width="16" height="18" rx="2" />
        <path d="M14 40h20" />
        <path d="M24 22v-6" />
        <path d="M22 10l2-4 2 4" />
        <path d="M20 28h8M20 33h8" />
      </svg>
    ),
  },
  {
    title: "Classroom",
    description: "A teacher hands out supplies to students",
    scenario: "A teacher has some pencils on her desk. She gets more from the supply closet. How many pencils does she have now?",
    icon: (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path d="M12 38l20-24 6 5-20 24-7 1 1-6Z" />
        <path d="M30 16l4-4 6 5-4 4" />
      </svg>
    ),
  },
]

export function CardBuilder({ standardId, onGenerate, onBack }: BuilderProps) {
  const [selected, setSelected] = useState<number | null>(null)

  function handleSubmit() {
    if (selected === null) return
    onGenerate(SCENARIOS[selected].scenario)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "linear-gradient(135deg, #09090b 0%, #0c1222 50%, #09090b 100%)", fontFamily: "'Lexend', 'Space Grotesk', system-ui, sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 shrink-0">
        <button
          onClick={onBack}
          className="text-sm text-zinc-300 hover:text-white"
        >
          &larr; Back
        </button>
        <div className="text-xs text-zinc-400 font-mono">{standardId}</div>
        <div className="w-12" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
          <div className="text-center space-y-2">
            <h2
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Pick your scenario
            </h2>
            <p className="text-sm text-zinc-200">
              Choose a real-world situation. Your game will be built around it.
            </p>
          </div>

          {/* Card grid */}
          <div className="grid grid-cols-2 gap-3">
            {SCENARIOS.map((card, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`rounded-xl p-4 text-left transition-all ${
                  selected === i
                    ? "border-blue-500 bg-blue-500/10"
                    : "hover:border-zinc-600"
                }`}
                style={selected === i
                  ? { background: "rgba(59,130,246,0.1)", border: "2px solid #3b82f6", boxShadow: "0 0 16px rgba(59,130,246,0.2)", borderRadius: "12px" }
                  : { background: "rgba(24,24,27,0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(63,63,70,0.5)", borderRadius: "12px" }
                }
              >
                <div
                  className={`mb-2 ${
                    selected === i ? "text-blue-400" : "text-zinc-400"
                  }`}
                >
                  {card.icon}
                </div>
                <p className="text-sm font-semibold text-white">{card.title}</p>
                <p className="text-xs text-zinc-300 mt-0.5">{card.description}</p>
              </button>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={selected === null}
            className={`w-full py-3 rounded-xl font-semibold text-base transition-all ${
              selected !== null
                ? "text-white active:scale-[0.98]"
                : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
            }`}
            style={selected !== null ? { background: "linear-gradient(135deg, #2563eb, #3b82f6)", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" } : undefined}
          >
            Generate my game!
          </button>
        </div>
      </div>
    </div>
  )
}
