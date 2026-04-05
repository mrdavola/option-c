"use client"

import { useState, useEffect, useRef } from "react"
import { GameIframe } from "./game-iframe"
import { MathMomentOverlay } from "./math-moment-overlay"
import { ReviewPanel } from "./review-panel"
import { X } from "lucide-react"

interface GamePlayerProps {
  gameId: string
  title: string
  html: string
  concept?: string
  onClose: () => void
  isPendingReview?: boolean
  authorName?: string
  reviewerUid?: string
  reviewerName?: string
  onReviewComplete?: (approved: boolean) => void
}

export function GamePlayer({ gameId, title, html, concept, onClose, isPendingReview, authorName, reviewerUid, reviewerName, onReviewComplete }: GamePlayerProps) {
  const [showRating, setShowRating] = useState(false)
  const [showMathMoment, setShowMathMoment] = useState(false)
  const [selectedRating, setSelectedRating] = useState(0)
  const [hasRated, setHasRated] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  // Show rating prompt after 30 seconds
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setShowRating(true)
    }, 30000)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleRate = async (rating: number) => {
    setSelectedRating(rating)
    setHasRated(true)
    try {
      await fetch(`/api/game/${gameId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      })
    } catch {
      // Silent fail
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/80">
        <h2 className="text-sm font-medium text-white truncate">{title}</h2>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Game */}
      <div className="flex-1 relative">
        <GameIframe html={html} className="w-full h-full" onLose={concept ? () => setShowMathMoment(true) : undefined} />
        {showMathMoment && concept && (
          <MathMomentOverlay concept={concept} onDismiss={() => setShowMathMoment(false)} />
        )}

        {/* Rating prompt */}
        {showRating && !hasRated && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-xl px-5 py-3 flex items-center gap-3">
            <span className="text-sm text-zinc-300">Rate this game:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  className="text-zinc-500 hover:text-amber-400 transition-colors"
                >
                  <svg className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowRating(false)}
              className="text-xs text-zinc-500 hover:text-zinc-300 ml-2"
            >
              Later
            </button>
          </div>
        )}

        {/* Rated confirmation */}
        {hasRated && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-emerald-900/90 border border-emerald-500/30 rounded-xl px-5 py-2 text-sm text-emerald-300">
            Thanks! You rated {selectedRating}/5
          </div>
        )}

        {/* Peer review panel */}
        {isPendingReview && reviewerUid && reviewerName && onReviewComplete && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
            <ReviewPanel
              gameId={gameId}
              gameName={title}
              authorName={authorName || "Unknown"}
              reviewerUid={reviewerUid}
              reviewerName={reviewerName}
              onReviewComplete={onReviewComplete}
            />
          </div>
        )}
      </div>
    </div>
  )
}
