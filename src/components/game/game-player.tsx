"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { GameIframe } from "./game-iframe"
import { MathMomentOverlay } from "./math-moment-overlay"
import { ReviewPanel } from "./review-panel"
import { X, Flag, Star, RotateCcw, ArrowLeft } from "lucide-react"
import { FeedbackButton } from "@/components/feedback/feedback-button"
import { useAuth } from "@/lib/auth"
import { collection, doc, setDoc, updateDoc, arrayUnion } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { FeedbackDoc } from "@/lib/feedback-types"

// Play mode controls what happens when the student wins/loses a round.
//   "casual"        – just play, no progress tracking
//   "demonstrate"   – student is playing their OWN approved game and needs
//                     3 wins in a row to flip the moon to green
//   "master"        – student is playing someone ELSE's approved game on
//                     a skill they want to master (3 wins on any games for
//                     that skill, not necessarily in a row)
export type GamePlayMode = "casual" | "demonstrate" | "master"

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
  // What kind of play session this is. Defaults to casual.
  playMode?: GamePlayMode
  // Called every time the student wins a round in this session
  onWin?: () => void
  // Called every time the student loses a round
  onLose?: () => void
  // Optional UI element shown over the game (e.g. streak counter)
  playModeHud?: React.ReactNode
}

export function GamePlayer({ gameId, title, html, concept, onClose, isPendingReview, isPublished, standardId, authorUid, authorName, reviewerUid, reviewerName, onReviewComplete, onUnapproved, playMode = "casual", onWin, onLose, playModeHud }: GamePlayerProps) {
  const { activeProfile } = useAuth()
  const [showRating, setShowRating] = useState(false)
  // True when the rating modal is mandatory (game just ended). Cannot be
  // dismissed without rating + comment.
  const [ratingMandatory, setRatingMandatory] = useState(false)
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
  // Iframe key — bumping it forces a fresh mount, restarting the game
  const [iframeKey, setIframeKey] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)
  // Track whether we've already incremented playCount for this session
  const playCountedRef = useRef(false)

  const isGuide = activeProfile?.role === "guide" || activeProfile?.role === "admin"
  const isAuthor = !!authorUid && activeProfile?.uid === authorUid

  // Increment playCount once per session (not for the author's own plays)
  useEffect(() => {
    if (playCountedRef.current) return
    if (isPendingReview) return // peer reviews don't count
    if (isAuthor) return // author's own plays don't count
    if (!gameId) return
    playCountedRef.current = true
    fetch(`/api/game/${gameId}/play`, { method: "POST" }).catch(() => {})
  }, [gameId, isAuthor, isPendingReview])

  // Game-end handler — fired when the iframe posts game_win or game_lose.
  // Forwards to the parent's onWin/onLose callbacks (for mastery state
  // tracking) AND triggers the mandatory rating modal (unless the player
  // is the author or this is a peer-review session).
  const handleGameEnd = useCallback((kind: "win" | "lose") => {
    if (kind === "win") {
      onWin?.()
    } else {
      onLose?.()
      if (concept) setShowMathMoment(true)
    }
    // Force the rating modal — but only for plays that aren't the author's own
    // and aren't a peer review session
    if (!isAuthor && !isPendingReview) {
      setShowRating(true)
      setRatingMandatory(true)
    }
  }, [onWin, onLose, concept, isAuthor, isPendingReview])

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

  // We no longer pop the rating prompt on a 30-second timer.
  // Instead, the rating modal opens when the game ends (handleGameEnd).
  // Reference timerRef to silence unused warning if needed in future.
  void timerRef

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
        <button
          onClick={() => {
            if (ratingMandatory && !hasRated) return
            onClose()
          }}
          disabled={ratingMandatory && !hasRated}
          className="flex items-center gap-1.5 text-sm text-zinc-300 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title={ratingMandatory && !hasRated ? "Submit your rating first" : "Back"}
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <h2 className="text-sm font-medium text-white truncate flex-1 text-center px-3">{title}</h2>
        <div className="flex items-center gap-2">
          {/* Play again — restarts the game by remounting the iframe */}
          <button
            onClick={() => {
              setIframeKey(k => k + 1)
              setShowMathMoment(false)
            }}
            className="flex items-center gap-1 text-xs text-zinc-300 border border-zinc-700 hover:text-white hover:border-zinc-500 rounded-md px-2.5 py-1 transition-colors"
            title="Play again"
          >
            <RotateCcw className="size-3.5" />
            Play again
          </button>
          {/* Manual rating trigger — for games that don't post game_win/game_lose */}
          {!isAuthor && !isPendingReview && !hasRated && (
            <button
              onClick={() => { setShowRating(true); setRatingMandatory(false) }}
              className="flex items-center gap-1 text-xs text-blue-300 border border-blue-500/40 hover:text-white hover:bg-blue-500/10 rounded-md px-2.5 py-1 transition-colors"
              title="Rate this game"
            >
              <Star className="size-3.5" />
              Rate
            </button>
          )}
          {isGuide && isPublished && !isPendingReview && (
            <button
              onClick={() => setShowUnapprove(true)}
              className="text-xs text-amber-400 border border-amber-500/40 hover:bg-amber-500/10 rounded-md px-2.5 py-1 transition-colors"
            >
              Un-approve
            </button>
          )}
          <button
            onClick={() => {
              if (ratingMandatory && !hasRated) return // blocked
              onClose()
            }}
            disabled={ratingMandatory && !hasRated}
            className="text-zinc-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title={ratingMandatory && !hasRated ? "Submit your rating first" : "Close"}
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
        <GameIframe
          key={iframeKey}
          html={html}
          className="w-full h-full"
          onWin={() => handleGameEnd("win")}
          onLose={() => handleGameEnd("lose")}
        />
        {showMathMoment && concept && (
          <MathMomentOverlay concept={concept} onDismiss={() => setShowMathMoment(false)} />
        )}

        {/* Play-mode HUD — shows demonstrate/master streak progress.
            Rendered by the parent via `playModeHud` slot prop, since the
            parent owns the streak state. */}
        {playModeHud}

        {/* Rating modal — mandatory when triggered by game end. Covers the
            entire play area so the student can't dodge it. */}
        {showRating && !hasRated && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border-2 border-blue-500/40 rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl">
              <div className="text-center">
                <p className="text-lg text-white font-semibold">How was this game?</p>
                <p className="text-xs text-zinc-400 mt-1">Rate it before you leave.</p>
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
                      className={`size-10 ${
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
                placeholder="Tell the creator why you gave that rating (required, 5+ chars)"
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-none"
              />
              <button
                onClick={handleSubmitRating}
                disabled={selectedRating === 0 || ratingComment.trim().length < 5 || submittingRating}
                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
              >
                {submittingRating ? "Sending..." : "Submit rating"}
              </button>
              {!ratingMandatory && (
                <button
                  onClick={() => setShowRating(false)}
                  className="w-full text-xs text-zinc-500 hover:text-zinc-300"
                >
                  Skip for now
                </button>
              )}
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
