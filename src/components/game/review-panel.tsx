"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, X, MessageSquare } from "lucide-react"

interface ReviewPanelProps {
  gameId: string
  gameName: string
  authorName: string
  reviewerUid: string
  reviewerName: string
  onReviewComplete: (approved: boolean) => void
}

export function ReviewPanel({
  gameId,
  gameName,
  authorName,
  reviewerUid,
  reviewerName,
  onReviewComplete,
}: ReviewPanelProps) {
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [showComment, setShowComment] = useState(false)

  const handleReview = async (approved: boolean) => {
    setSubmitting(true)
    try {
      await fetch(`/api/game/${gameId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewerUid,
          reviewerName,
          approved,
          comment: comment.trim() || undefined,
        }),
      })
      onReviewComplete(approved)
    } catch {
      // Silent fail
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
      <div className="text-center">
        <p className="text-sm text-zinc-300">
          Review <span className="text-white font-medium">{gameName}</span> by {authorName}
        </p>
      </div>

      {showComment ? (
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Leave feedback for the developer..."
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-none"
          rows={3}
        />
      ) : (
        <button
          onClick={() => setShowComment(true)}
          className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <MessageSquare className="size-3" />
          Add a comment
        </button>
      )}

      <div className="flex gap-2">
        <Button
          onClick={() => handleReview(true)}
          disabled={submitting}
          className="flex-1 bg-emerald-600 hover:bg-emerald-500"
        >
          <Check className="size-4 mr-1" />
          Approve
        </Button>
        <Button
          onClick={() => handleReview(false)}
          disabled={submitting}
          variant="outline"
          className="flex-1"
        >
          <X className="size-4 mr-1" />
          Needs Work
        </Button>
      </div>
    </div>
  )
}
