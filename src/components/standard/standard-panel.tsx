"use client"

import { useState, useEffect } from "react"
import type { StandardNode } from "@/lib/graph-types"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Lock, CheckCircle, ChevronLeft, Trophy } from "lucide-react"
import { ConceptCard } from "./concept-card"
import { GenieChat } from "./genie-chat"
import { MasteryPlay } from "./mastery-play"

function getShortTitle(standard: StandardNode): string {
  const id = standard.id.toUpperCase()
  const domain = standard.domainCode?.toUpperCase() ?? ""

  // Map domain codes and ID patterns to short descriptors
  if (domain === "CC") return "Counting"
  if (domain === "OA") {
    if (/ADD|SUM|PLUS/i.test(standard.description)) return "Addition"
    if (/SUBTRACT|MINUS|DIFFER/i.test(standard.description)) return "Subtraction"
    if (/MULTIPLY|FACTOR|PRODUCT/i.test(standard.description)) return "Multiplication"
    if (/DIVIDE|DIVISOR|QUOTIENT/i.test(standard.description)) return "Division"
    return "Algebra"
  }
  if (domain === "NBT") return "Base Ten"
  if (domain === "NF") return "Fractions"
  if (domain === "MD") {
    if (/AREA/i.test(standard.description)) return "Area"
    if (/VOLUME/i.test(standard.description)) return "Volume"
    if (/TIME|CLOCK|HOUR/i.test(standard.description)) return "Time"
    if (/MEASURE|LENGTH|INCH|METER/i.test(standard.description)) return "Measurement"
    return "Measurement"
  }
  if (domain === "G") return "Geometry"
  if (domain === "RP") return "Ratios"
  if (domain === "NS") return "Numbers"
  if (domain === "EE") return "Equations"
  if (domain === "SP") return "Statistics"
  if (domain === "F") return "Functions"

  // HS domains
  if (id.includes("A-")) return "Algebra"
  if (id.includes("F-")) return "Functions"
  if (id.includes("G-")) return "Geometry"
  if (id.includes("N-")) return "Numbers"
  if (id.includes("S-")) return "Statistics"

  // Fallback: first 4 words of description
  const words = standard.description.split(/\s+/)
  return words.slice(0, 4).join(" ")
}

type FlowStep = "learn" | "earn" | "unlocked" | "master"

interface StandardPanelProps {
  standard: StandardNode | null
  open: boolean
  onClose: () => void
  onUnlock: (standardId: string) => void
  onMastered?: (standardId: string) => void
  onBuildGame?: (designDoc: import("@/lib/game-types").GameDesignDoc, chatHistory: string) => void
  interests?: string[]
  nodeStatus?: "locked" | "available" | "in_progress" | "unlocked" | "mastered"
}

export function StandardPanel({
  standard,
  open,
  onClose,
  onUnlock,
  onMastered,
  onBuildGame,
  interests,
  nodeStatus,
}: StandardPanelProps) {
  const [step, setStep] = useState<FlowStep>("learn")

  // Reset step when standard changes
  useEffect(() => {
    setStep("learn")
  }, [standard?.id])

  if (!standard) return null

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <SheetContent
        side="right"
        className="w-full sm:w-[75vw] lg:w-[60vw] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="text-lg">{getShortTitle(standard)}</SheetTitle>
          <SheetDescription>
            {standard.description}
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-4">
          {(step === "earn" || step === "master") && nodeStatus !== "locked" && nodeStatus !== "mastered" && (
            <button
              onClick={() => setStep("learn")}
              className="flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200 mb-3 transition-colors"
            >
              <ChevronLeft className="size-4" />
              Back
            </button>
          )}

          {nodeStatus === "locked" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-400 text-sm">
                <Lock className="size-4 shrink-0" />
                <span>You haven't started this one yet — complete its prerequisites first.</span>
              </div>
              <ConceptCard
                standard={standard}
                onReady={() => {}}
                interests={interests}
                readOnly
              />
            </div>
          ) : nodeStatus === "unlocked" ? (
            step === "master" ? (
              <MasteryPlay
                standardId={standard.id}
                planetId={`${standard.grade}.${standard.domainCode}`}
                onMastered={() => onMastered?.(standard.id)}
              />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 text-sm">
                  <CheckCircle className="size-4 shrink-0" />
                  <span>You've demonstrated this concept — nice work.</span>
                </div>
                <button
                  onClick={() => setStep("master")}
                  className="w-full py-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Trophy className="size-4" /> Play to Master
                </button>
                <ConceptCard
                  standard={standard}
                  onReady={() => {}}
                  interests={interests}
                  readOnly
                />
              </div>
            )
          ) : nodeStatus === "mastered" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-400 text-sm">
                <Trophy className="size-4 shrink-0" />
                <span>You've mastered this skill!</span>
              </div>
              <ConceptCard
                standard={standard}
                onReady={() => {}}
                interests={interests}
                readOnly
              />
            </div>
          ) : (
            <>
              {step === "learn" && (
                <ConceptCard
                  standard={standard}
                  onReady={() => setStep("earn")}
                  interests={interests}
                />
              )}

              {step === "earn" && (
                <GenieChat
                  standardDescription={standard.description}
                  standardId={standard.id}
                  planetId={`${standard.grade}.${standard.domainCode}`}
                  onUnlock={() => {
                    setStep("unlocked")
                    onUnlock(standard.id)
                  }}
                  onBuildGame={onBuildGame}
                />
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
