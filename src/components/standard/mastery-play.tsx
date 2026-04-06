"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import { GameIframe } from "@/components/game/game-iframe"
import { Trophy, Play, Star } from "lucide-react"
import type { Game } from "@/lib/game-types"

interface MasteryPlayProps {
  standardId: string
  planetId: string
  onMastered: () => void
}

export function MasteryPlay({ standardId, planetId, onMastered }: MasteryPlayProps) {
  const { activeProfile, saveProgress, updateTokens } = useAuth()
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [wins, setWins] = useState(0)
  const [mastered, setMastered] = useState(false)

  // Load approved games for this skill
  useEffect(() => {
    if (!activeProfile?.classId) return
    const q = query(
      collection(db, "games"),
      where("classId", "==", activeProfile.classId),
      where("status", "==", "published")
    )
    getDocs(q)
      .then(snap => {
        const all = snap.docs.map(d => ({ ...d.data(), id: d.id }) as Game)
        const relevant = all.filter(g => g.planetId === planetId || g.standardId === standardId)
        setGames(relevant)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [activeProfile?.classId, planetId, standardId])

  const handleWin = async () => {
    const newWins = wins + 1
    setWins(newWins)

    if (newWins >= 3) {
      // Mastered!
      setMastered(true)
      setSelectedGame(null)
      await saveProgress(standardId, {
        status: "mastered",
        masteredAt: Date.now(),
        masteryWins: 3,
      })
      await updateTokens(5)
      // Delay then notify parent
      setTimeout(() => onMastered(), 2000)
    } else {
      // Save partial progress
      await saveProgress(standardId, { masteryWins: newWins })
    }
  }

  if (mastered) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <Trophy className="size-12 text-amber-400" />
        <h3 className="text-xl font-bold text-white">Mastered!</h3>
        <p className="text-zinc-400 text-sm">+5 tokens earned</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-zinc-400 text-sm">No approved games for this skill yet.</p>
        <p className="text-zinc-500 text-xs mt-1">Build one and get it approved!</p>
      </div>
    )
  }

  if (selectedGame) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedGame(null)}
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            &larr; Back to games
          </button>
          <div className="flex items-center gap-1">
            {[0, 1, 2].map(i => (
              <Star
                key={i}
                className={`size-5 ${i < wins ? "text-amber-400 fill-amber-400" : "text-zinc-600"}`}
              />
            ))}
          </div>
        </div>
        <p className="text-xs text-zinc-400 text-center">
          Win {3 - wins} more round{3 - wins !== 1 ? "s" : ""} to master this skill
        </p>
        <div className="h-[400px] rounded-lg overflow-hidden border border-zinc-800">
          <GameIframe
            html={selectedGame.gameHtml}
            className="w-full h-full"
            onWin={handleWin}
            onLose={() => {}}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-300 font-medium">Play to prove mastery</p>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map(i => (
            <Star
              key={i}
              className={`size-4 ${i < wins ? "text-amber-400 fill-amber-400" : "text-zinc-600"}`}
            />
          ))}
        </div>
      </div>
      <p className="text-xs text-zinc-400">Win 3 rounds of any approved game to master this skill</p>
      <div className="grid gap-2">
        {games.map(game => (
          <button
            key={game.id}
            onClick={() => setSelectedGame(game)}
            className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-zinc-600 transition-colors text-left"
          >
            <Play className="size-4 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-white truncate">{game.title}</p>
              <p className="text-xs text-zinc-400">by {game.designerName}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
