"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import type { Game } from "@/lib/game-types"
import { Gamepad2, Bell, Play, X, MessageCircle } from "lucide-react"
import { GameIframe } from "@/components/game/game-iframe"
import { FeedbackInbox } from "@/components/feedback/feedback-inbox"
import { UserMenu } from "@/components/user-menu"

export default function LearnerDashboard() {
  const { activeProfile, loadProgress } = useAuth()
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [progressStats, setProgressStats] = useState({ unlocked: 0, mastered: 0, inReview: 0 })
  const [progressByStandard, setProgressByStandard] = useState<Map<string, string>>(new Map())
  const [previewGame, setPreviewGame] = useState<Game | null>(null)

  useEffect(() => {
    if (!activeProfile?.uid) return
    loadData()
  }, [activeProfile?.uid])

  async function loadData() {
    setLoading(true)
    try {
      const gamesQuery = query(
        collection(db, "games"),
        where("authorUid", "==", activeProfile!.uid)
      )
      const gamesSnap = await getDocs(gamesQuery)
      const allGames = gamesSnap.docs
        .map(d => ({ ...d.data(), id: d.id }) as Game)
        .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0))

      // Deduplicate: if there are multiple docs for the same standard
      // (a known bug from earlier versions), keep the most "advanced"
      // one (published > pending_review > needs_work > draft) and break
      // ties by most recently updated.
      const statusRank: Record<string, number> = {
        published: 4,
        pending_review: 3,
        needs_work: 2,
        draft: 1,
      }
      const bestByStandard = new Map<string, Game>()
      for (const g of allGames) {
        const existing = bestByStandard.get(g.standardId)
        if (!existing) {
          bestByStandard.set(g.standardId, g)
          continue
        }
        const newRank = statusRank[g.status] ?? 0
        const existingRank = statusRank[existing.status] ?? 0
        if (newRank > existingRank) {
          bestByStandard.set(g.standardId, g)
        } else if (newRank === existingRank) {
          const newTs = g.updatedAt || g.createdAt || 0
          const existingTs = existing.updatedAt || existing.createdAt || 0
          if (newTs > existingTs) bestByStandard.set(g.standardId, g)
        }
      }
      const gameList = Array.from(bestByStandard.values()).sort(
        (a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0)
      )
      setGames(gameList)

      const progress = await loadProgress()
      // "Demonstrated" = green moon. Both "unlocked" and "mastered" count.
      let demonstrated = 0, mastered = 0, inProgress = 0
      const standardStatusMap = new Map<string, string>()
      progress.forEach((p, id) => {
        standardStatusMap.set(id, p.status)
        if (p.status === "unlocked" || p.status === "mastered") demonstrated++
        if (p.status === "mastered") mastered++
        if (p.status === "in_review" || p.status === "approved_unplayed" || p.status === "in_progress") inProgress++
      })
      setProgressStats({ unlocked: demonstrated, mastered, inReview: inProgress })
      setProgressByStandard(standardStatusMap)
    } catch (err) {
      console.error("Learner dashboard load error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (!activeProfile) return null

  const notifications: { text: string; type: "success" | "info" }[] = []
  const approvedGames = games.filter(g => g.status === "published")
  for (const g of approvedGames) {
    notifications.push({ text: `Your game "${g.title}" was approved!`, type: "success" })
  }
  const pendingCount = games.filter(g => g.status === "pending_review").length
  if (pendingCount > 0) {
    notifications.push({
      text: `${pendingCount} game${pendingCount > 1 ? "s" : ""} waiting for review`,
      type: "info",
    })
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case "draft": return { text: "Draft", className: "bg-zinc-700 text-zinc-300" }
      case "pending_review": return { text: "Pending Review", className: "bg-amber-500/20 text-amber-400" }
      case "published": return { text: "Approved", className: "bg-emerald-500/20 text-emerald-400" }
      case "needs_work": return { text: "Needs Work", className: "bg-red-500/20 text-red-400" }
      default: return { text: status, className: "bg-zinc-700 text-zinc-300" }
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Hey {activeProfile.name}</h1>
        <UserMenu />
      </div>

      {/* Personal code — so the learner can write it down if they forgot */}
      {activeProfile.personalCode && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <p className="text-xs text-amber-300 font-medium uppercase tracking-wide">
            Your personal code
          </p>
          <p className="text-2xl font-mono font-bold text-white tracking-widest mt-1">
            {activeProfile.personalCode}
          </p>
          <p className="text-xs text-zinc-400 mt-2">
            Write this down. Next time you sign in, use your name + this code to come back to your progress.
          </p>
        </div>
      )}

      {/* Progress Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-mono font-bold text-blue-400">{progressStats.unlocked}</p>
          <p className="text-xs text-zinc-400 mt-1">Skills Demonstrated</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-mono font-bold text-emerald-400">{progressStats.mastered}</p>
          <p className="text-xs text-zinc-400 mt-1">Skills Mastered</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-mono font-bold text-amber-400">{activeProfile.tokens}</p>
          <p className="text-xs text-zinc-400 mt-1">Tokens</p>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <Bell className="size-4" /> Notifications
          </h2>
          {notifications.map((n, i) => (
            <div
              key={i}
              className={`rounded-lg px-4 py-3 text-sm ${
                n.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                  : "bg-blue-500/10 border border-blue-500/20 text-blue-300"
              }`}
            >
              {n.text}
            </div>
          ))}
        </div>
      )}

      {/* My Games */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
          <Gamepad2 className="size-4" /> My Games ({games.length})
        </h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : games.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
            <p className="text-zinc-400 text-sm">No games yet. Go explore a concept and build one!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {games.map(g => {
              const badge = statusLabel(g.status)
              const bullets = g.designDoc?.visualConcept ?? []
              const standardStatus = progressByStandard.get(g.standardId)
              const needsDemonstration = g.status === "published" && standardStatus === "approved_unplayed"
              return (
                <div key={g.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setPreviewGame(g)}
                    className="w-full p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors text-left"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Play className="size-4 text-zinc-500 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium">{g.title}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{g.standardId}</p>
                        {bullets.length > 0 && (
                          <div className="mt-2 space-y-0.5">
                            {bullets.slice(0, 4).map((b, i) => (
                              <p key={i} className="text-xs text-zinc-400 leading-snug">{b}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${badge.className}`}>
                      {badge.text}
                    </span>
                  </button>
                  {needsDemonstration && (
                    <div className="px-4 pb-3 border-t border-zinc-800 pt-3">
                      <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
                        ⭐ Next step: open this skill from the galaxy and win your own game <strong>3 times in a row</strong> to turn the moon green.
                      </p>
                    </div>
                  )}
                  {g.status === "needs_work" && g.reviews?.length > 0 && (
                    <div className="px-4 pb-3 border-t border-zinc-800 pt-3">
                      <p className="text-xs text-zinc-400 mb-1">Feedback from your guide:</p>
                      <p className="text-sm text-red-300 bg-red-500/10 rounded-lg px-3 py-2">
                        {g.reviews[g.reviews.length - 1].comment || "Needs improvement"}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
      {/* Inbox: messages from other players, plus replies to my own feedback */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
          <MessageCircle className="size-4" /> Inbox
        </h2>
        <FeedbackInbox mode="received" />
      </div>

      {/* Sent messages (with admin/peer replies) */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
          <MessageCircle className="size-4" /> Sent
        </h2>
        <FeedbackInbox mode="sent" />
      </div>

      {/* Game preview — full screen so the whole game is playable */}
      {previewGame && (
        <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col">
          <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-800 bg-zinc-900">
            <div>
              <h3 className="text-white font-semibold">{previewGame.title}</h3>
              <p className="text-xs text-zinc-400">{previewGame.standardId}</p>
            </div>
            <button
              onClick={() => setPreviewGame(null)}
              className="text-zinc-400 hover:text-white transition-colors p-2"
              aria-label="Close"
            >
              <X className="size-6" />
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <GameIframe html={previewGame.gameHtml} className="w-full h-full" />
          </div>
        </div>
      )}
    </div>
  )
}
