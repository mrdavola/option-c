"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Check, Circle, HelpCircle } from "lucide-react"
import { useState } from "react"

interface CriteriaProgressProps {
  criteria: {
    playable: boolean
    authentic: boolean
    essential: boolean
  }
  // Criteria that are pre-checked because the learner picked from a
  // verified template (not from a free-form game idea). These render
  // with a small "auto" caption so the learner knows they didn't have
  // to do anything to earn them — they came with the template.
  preChecked?: ("playable" | "authentic" | "essential")[]
}

const criteriaLabels: Array<{
  key: "playable" | "authentic" | "essential"
  label: string
  shortLabel: string
  tooltip: string
}> = [
  {
    key: "playable",
    label: "Playable Game",
    shortLabel: "Playable",
    tooltip:
      "Clear idea, clear goal, clear win/lose. A kid can open this, understand the rules in 10 seconds, and know if they won or lost.",
  },
  {
    key: "authentic",
    label: "Math Well Applied",
    shortLabel: "Math Applied",
    tooltip:
      "The math skill is used like in the real world — not simplified, not faked, not just numbers sprinkled on top.",
  },
  {
    key: "essential",
    label: "Math Essential",
    shortLabel: "Math Essential",
    tooltip:
      "Knowing the math skill is essential to win. Remove the math and the game breaks — the math IS the game.",
  },
]

export function CriteriaProgress({ criteria, preChecked }: CriteriaProgressProps) {
  const [openTooltip, setOpenTooltip] = useState<string | null>(null)
  const metCount = [criteria.playable, criteria.authentic, criteria.essential].filter(Boolean).length
  const preSet = new Set(preChecked ?? [])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {criteriaLabels.map(({ key, label, tooltip }) => {
          const met = criteria[key]
          const isPre = preSet.has(key)
          const tooltipOpen = openTooltip === key
          return (
            <div key={key} className="relative">
              <Badge
                variant={met ? "default" : "outline"}
                className={cn(
                  "transition-all duration-500 flex items-center gap-1",
                  met
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                    : "border-zinc-700 text-zinc-400"
                )}
              >
                {met ? (
                  <Check className="size-3" />
                ) : (
                  <Circle className="size-3" />
                )}
                {label}
                {isPre && (
                  <span className="ml-1 text-[10px] text-emerald-300/80 uppercase tracking-wide">
                    auto
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setOpenTooltip(tooltipOpen ? null : key)}
                  className="ml-1 text-current opacity-60 hover:opacity-100 transition-opacity"
                  aria-label={`What does ${key} mean?`}
                >
                  <HelpCircle className="size-3" />
                </button>
              </Badge>
              {tooltipOpen && (
                <div
                  className="absolute z-30 top-full left-0 mt-1 w-64 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 shadow-xl"
                  role="tooltip"
                >
                  {tooltip}
                  <button
                    type="button"
                    onClick={() => setOpenTooltip(null)}
                    className="absolute top-1 right-2 text-zinc-500 hover:text-white text-sm"
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <p className="text-sm text-zinc-300">
        {metCount}/3 criteria passed — {metCount === 3 ? "You did it!" : metCount === 0 ? "Tell me your game idea" : "Keep going!"}
      </p>
    </div>
  )
}
