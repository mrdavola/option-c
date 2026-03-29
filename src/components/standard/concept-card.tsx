"use client"

import { useState, useEffect, useCallback } from "react"
import type { StandardNode } from "@/lib/graph-types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ReadingLevel = "simpler" | "default" | "challenge"

interface Explanation {
  whatIsThis: string
  commonMistakes: string
  realWorldUse: string
}

interface ConceptCardProps {
  standard: StandardNode
  onReady: () => void
  interests?: string[]
  readOnly?: boolean
}

export function ConceptCard({ standard, onReady, interests, readOnly }: ConceptCardProps) {
  const [readingLevel, setReadingLevel] = useState<ReadingLevel>("default")
  const [explanation, setExplanation] = useState<Explanation | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchExplanation = useCallback(async (level: ReadingLevel) => {
    setLoading(true)
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          standardId: standard.id,
          description: standard.description,
          grade: standard.grade,
          readingLevel: level,
          interests: interests ?? [],
        }),
      })
      const data = await res.json()
      setExplanation(data)
    } catch {
      setExplanation({
        whatIsThis: standard.description,
        commonMistakes: "Take your time with this one — it's worth understanding well.",
        realWorldUse: "You'll use this in real life more than you think!",
      })
    } finally {
      setLoading(false)
    }
  }, [standard.id, standard.description, standard.grade, interests])

  // Fetch on mount and when level changes
  useEffect(() => {
    fetchExplanation(readingLevel)
  }, [readingLevel, fetchExplanation])

  const handleLevelChange = (level: ReadingLevel) => {
    if (level !== readingLevel) {
      setReadingLevel(level)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Badge variant="secondary" className="w-fit text-xs">
        {standard.domain}
      </Badge>

      {loading ? (
        <div className="space-y-3">
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-zinc-400 animate-pulse">
              Writing an explanation just for you...
            </p>
          </div>
          <div className="h-20 bg-zinc-700/30 rounded-lg animate-pulse" />
          <div className="h-14 bg-zinc-700/30 rounded-lg animate-pulse" />
          <div className="h-14 bg-zinc-700/30 rounded-lg animate-pulse" />
        </div>
      ) : explanation ? (
        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">What is this?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {explanation.whatIsThis}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Watch out for</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {explanation.commonMistakes}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Where you'll use this</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {explanation.realWorldUse}
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Reading level adjustment */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => handleLevelChange("simpler")}
          className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
            readingLevel === "simpler"
              ? "bg-blue-500/20 border-blue-500/40 text-blue-400"
              : "border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500"
          }`}
        >
          Simpler
        </button>
        <button
          onClick={() => handleLevelChange("default")}
          className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
            readingLevel === "default"
              ? "bg-zinc-500/20 border-zinc-500/40 text-zinc-300"
              : "border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500"
          }`}
        >
          Just right
        </button>
        <button
          onClick={() => handleLevelChange("challenge")}
          className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
            readingLevel === "challenge"
              ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
              : "border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500"
          }`}
        >
          Challenge me
        </button>
      </div>

      {!readOnly && (
        <Button onClick={onReady} size="lg" className="w-full">
          Next →
        </Button>
      )}
    </div>
  )
}
