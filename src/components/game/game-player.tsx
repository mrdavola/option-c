"use client"

import { useState, useEffect, useRef } from "react"
import { GameIframe } from "./game-iframe"
import { MathMomentOverlay } from "./math-moment-overlay"
import { ReviewPanel } from "./review-panel"
import { X, Flag, Star } from "lucide-react"
import { FeedbackButton } from "@/components/feedback/feedback-button"
import { useAuth } from "@/lib/auth"
import { collection, doc, setDoc, updateDoc, arrayUnion } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { FeedbackDoc } from "@/lib/feedback-types"

interface GamePlayerProps {
  gameId: string
  title: string
  html: string
  concept?: string
  onClose: () => void
  isPendingReview?: boolean
  // Currently published — guide may revoke (un-approve) it
  isPublished?: boolean
  // Standard ID this game was built for (so we can revert progress on un-approve)
  standardId?: string
  authorUid?: string
  authorName?: string
  reviewerUid?: string
  reviewerName?: string
  onReviewComplete?: (approved: boolean) => void
  // Called after a successful un-approve so the parent can refresh
  onUnapproved?: () => void
}

export function GamePlayer({ gameId, title, html, concept, onClose, isPendingReview, isPublished, standardId, authorUid, authorName, reviewerUid, reviewerName, onReviewComplete, onUnapproved }: GamePlayerProps) {
  const { activeProfile } = useAuth()
  const [showRating, setShowRating] = useState(false)
  const [showMathMoment, setShowMathMoment] = useState(false)
  const [selectedRating, setSelectedRating] = useState(0)
  const [ratingComment, setRatingComment] = useState("")
  const [hoverRating, setHoverRating] = useState(0)
  const [hasRated, setHasRated] = useState(false)
  const [submittingRating, setSubmittingRating] = useState(false)
  // Report-this-game state
  const [showReport, setShowReport] = useState(false)
  const [reportText, setReportText] = useState("")
  const [reportSent, setReportSent] = useState(false)
  const [reportSending, setReportSending] = useState(false)
  // Guide-only un-approve state
  const [showUnapprove, setShowUnapprove] = useState(false)
  const [unapproveText, setUnapproveText] = useState("")
  const [unapproving, setUnapproving] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  const isGuide = activeProfile?.role === "guide" || activeProfile?.role === "admin"

  const handleUnapprove = async () => {
    if (!activeProfile) return
    if (unapproveText.trim().length < 5) return
    setUnapproving(true)
    try {
      // 1. Flip the game back to needs_work and append a review note
      await updateDoc(doc(db, "games", gameId), {
        status: "needs_work",
        reviews: arrayUnion({
          reviewerUid: activeProfile.uid,
          reviewerName: activeProfile.name,
          approved: false,
          comment: unapproveText.trim(),
          createdAt: Date.now(),
          unapproved: true,
        }),
        updatedAt: Date.now(),
      })

      // 2. Revert the student's progress for that standard from
      //    "unlocked" back to "in_progress" so they know they need to fix it
      if (authorUid && standardId) {
        await setDoc(
          doc(db, "progress", authorUid, "standards", standardId),
          { status: "in_progress" },
          { merge: true }
        )
      }

      // 3. Drop a feedback message into the student's inbox so they
      //    know why and can reply.
      if (authorUid) {
        const id = doc(collection(db, "feedback")).id
        const now = Date.now()
        const fb: FeedbackDoc = {
          id,
          fromUid: activeProfile.uid,
          fromName: activeProfile.name,
          fromRole: activeProfile.role,
          target: "game",
          gameId,
          gameTitle: title,
          toUid: authorUid,
          type: "improvement",
          message: `Your game "${title}" was un-approved. Reason: ${unapproveText.trim()}`,
          status: "open",
          replies: [],
          unreadForRecipient: true,
          unreadForSender: false,
          createdAt: now,
          updatedAt: now,
        }
        await setDoc(doc(db, "feedback", id), fb)
      }

      onUnapproved?.()
      onClose()
    } catch (err) {
      console.error("Un-approve failed:", err)
    } finally {
      setUnapproving(false)
    }
  }

  // Show rating prompt after 30 seconds
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setShowRating(true)
    }, 30000)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleSubmitRating = async () => {
    if (selectedRating === 0) return
    if (ratingComment.trim().length < 5) return
    setSubmittingRating(true)
    try {
      await fetch(`/api/game/${gameId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: selectedRating,
          comment: ratingComment.trim(),
          raterUid: activeProfile?.uid || "",
          raterName: activeProfile?.name || "Anonymous",
        }),
      })
      setHasRated(true)
    } catch {
      // Keep the form open so they can retry
    } finally {
      setSubmittingRating(false)
    }
  }

  const handleSendReport = async () => {
    if (!activeProfile) return
    if (reportText.trim().length < 5) return
    setReportSending(true)
    try {
      const id = doc(collection(db, "feedback")).id
      const now = Date.now()
      // The report goes to BOTH admin and the game author's guide.
      // Easiest way: send a single doc with target="admin" so admin sees it,
      // plus a second doc with target="game" pointing at the author so the
      // author's guide sees it on their dashboard's reports tab.
      const adminDoc: FeedbackDoc = {
        id,
        fromUid: activeProfile.uid,
        fromName: activeProfile.name,
        fromRole: activeProfile.role,
        target: "admin",
        gameId,
        gameTitle: title,
        type: "bug",
        message: `🚩 REPORT for game "${title}": ${reportText.trim()}`,
        status: "open",
        replies: [],
        unreadForRecipient: true,
        unreadForSender: false,
        createdAt: now,
        updatedAt: now,
      }
      await setDoc(doc(db, "feedback", id), adminDoc)
      // Second copy targeted at the game author so their guide can see
      // it in the author's inbox / report list.
      if (authorUid) {
        const id2 = doc(collection(db, "feedback")).id
        const gameDoc: FeedbackDoc = {
          id: id2,
          fromUid: activeProfile.uid,
          fromName: activeProfile.name,
          fromRole: activeProfile.role,
          target: "game",
          gameId,
          gameTitle: title,
          toUid: authorUid,
          type: "bug",
          message: `🚩 REPORT: ${reportText.trim()}`,
          status: "open",
          replies: [],
          unreadForRecipient: true,
          unreadForSender: false,
          createdAt: now,
          updatedAt: now,
        }
        await setDoc(doc(db, "feedback", id2), gameDoc)
      }
      setReportSent(true)
      setReportText("")
      setTimeout(() => {
        setShowReport(false)
        setReportSent(false)
      }, 3500)
    } catch {
      // ignore
    } finally {
      setReportSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/80 gap-2">
        <h2 className="text-sm font-medium text-white truncate">{title}</h2>
        <div className="flex items-center gap-2">
          {isGuide && isPublished && !isPendingReview && (
            <button
              onClick={() => setShowUnapprove(true)}
              className="text-xs text-amber-400 border border-amber-500/40 hover:bg-amber-500/10 rounded-md px-2.5 py-1 transition-colors"
            >
              Un-approve
            </button>
          )}
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* Un-approve modal — guides only */}
      {showUnapprove && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-zinc-900 border border-amber-500/30 rounded-xl max-w-md w-full p-5 space-y-4">
            <h3 className="text-base font-semibold text-white">Un-approve this game</h3>
            <p className="text-xs text-zinc-400">
              The student&apos;s skill will revert to &quot;in progress&quot; and they&apos;ll see your reason in their inbox. Their tokens are kept.
            </p>
            <textarea
              value={unapproveText}
              onChange={(e) => setUnapproveText(e.target.value)}
              placeholder="Why are you un-approving this? (required)"
              rows={4}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowUnapprove(false); setUnapproveText("") }}
                className="px-3 py-1.5 text-sm text-zinc-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleUnapprove}
                disabled={unapproveText.trim().length < 5 || unapproving}
                className="bg-amber-600 hover:bg-amber-500 disabled:opacity-30 text-white rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
              >
                {unapproving ? "Sending..." : "Un-approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game */}
      <div className="flex-1 relative">
        <GameIframe html={html} className="w-full h-full" onLose={concept ? () => setShowMathMoment(true) : undefined} />
        {showMathMoment && concept && (
          <MathMomentOverlay concept={concept} onDismiss={() => setShowMathMoment(false)} />
        )}

        {/* Rating prompt — stars + mandatory comment */}
        {showRating && !hasRated && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
            <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-white font-medium">Rate this game</p>
                <button
                  onClick={() => setShowRating(false)}
                  className="text-xs text-zinc-500 hover:text-zinc-300"
                >
                  Later
                </button>
              </div>
              <div className="flex gap-1 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setSelectedRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`size-8 ${
                        star <= (hoverRating || selectedRating)
                          ? "text-amber-400 fill-amber-400"
                          : "text-zinc-600"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Tell the creator why you gave that rating (required)..."
                rows={2}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-none"
              />
              <button
                onClick={handleSubmitRating}
                disabled={selectedRating === 0 || ratingComment.trim().length < 5 || submittingRating}
                className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
              >
                {submittingRating ? "Sending..." : "Submit rating"}
              </button>
              <p className="text-[11px] text-zinc-500 text-center">
                Your comment is only visible to the creator, your guide, and admins.
              </p>
            </div>
          </div>
        )}

        {/* Rated confirmation */}
        {hasRated && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-emerald-900/90 border border-emerald-500/30 rounded-xl px-5 py-2 text-sm text-emerald-300">
            Thanks! You rated {selectedRating}/5
          </div>
        )}

        {/* Report this game — top-right corner of the play area */}
        {!isPendingReview && activeProfile && (
          <button
            onClick={() => setShowReport(true)}
            className="absolute top-4 right-4 z-30 flex items-center gap-1.5 bg-zinc-900/85 hover:bg-zinc-800 border border-zinc-700 hover:border-red-500/50 text-zinc-300 hover:text-red-300 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
            title="Report a problem with this game"
          >
            <Flag className="size-3.5" />
            Report
          </button>
        )}

        {/* Report modal */}
        {showReport && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-md w-full p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Flag className="size-4 text-red-400" />
                  Report this game
                </h3>
                <button
                  onClick={() => setShowReport(false)}
                  className="text-zinc-400 hover:text-white p-1"
                >
                  <X className="size-4" />
                </button>
              </div>
              {reportSent ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-sm text-emerald-300 text-center">
                  Report sent. The team and the creator&apos;s guide will see it in their inboxes.
                </div>
              ) : (
                <>
                  <p className="text-xs text-zinc-400">
                    What&apos;s wrong? Your message goes to your guide and the team.
                  </p>
                  <textarea
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    placeholder="The game is broken / inappropriate / cheats / etc."
                    rows={4}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-500/50 resize-none"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setShowReport(false)}
                      className="px-3 py-1.5 text-sm text-zinc-300 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendReport}
                      disabled={reportText.trim().length < 5 || reportSending}
                      className="bg-red-600 hover:bg-red-500 disabled:opacity-30 text-white rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                    >
                      {reportSending ? "Sending..." : "Send report"}
                    </button>
                  </div>
                </>
              )}
            </div>
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

        {/* Message the creator (only for published games where we know the author) */}
        {!isPendingReview && authorUid && (
          <FeedbackButton targetGame={{ id: gameId, title, authorUid }} />
        )}
      </div>
    </div>
  )
}
