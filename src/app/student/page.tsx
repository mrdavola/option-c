"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import type { Game } from "@/lib/game-types"
import { Gamepad2, Bell } from "lucide-react"

export default function StudentDashboard() {
  const { activeProfile, loadProgress } = useAuth()
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [progressStats, setProgressStats] = useState({ unlocked: 0, mastered: 0, inReview: 0 })

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
      const gameList = gamesSnap.docs
        .map(d => ({ ...d.data(), id: d.id }) as Game)
        .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0))
      setGames(gameList)

      const progress = await loadProgress()
      let unlocked = 0, mastered = 0, inReview = 0
      progress.forEach(p => {
        if (p.status === "unlocked") unlocked++
        if (p.status === "mastered") mastered++
        if (p.status === "in_review") inReview++
      })
      setProgressStats({ unlocked, mastered, inReview })
    } catch (err) {
      console.error("Student dashboard load error:", err)
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
      default: return { text: status, className: "bg-zinc-700 text-zinc-300" }
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Hey {activeProfile.name}</h1>

      {/* Progress Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-mono font-bold text-blue-400">{progressStats.unlocked}</p>
          <p className="text-xs text-zinc-400 mt-1">Skills Unlocked</p>
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
              return (
                <div key={g.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white font-medium">{g.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{g.standardId}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badge.className}`}>
                    {badge.text}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
