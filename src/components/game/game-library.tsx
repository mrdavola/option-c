"use client"

import { useState, useEffect, useCallback } from "react"
import type { Game } from "@/lib/game-types"
import { useAuth } from "@/lib/auth"
import { GameCard } from "./game-card"
import { GamePlayer } from "./game-player"

interface GameLibraryProps {
  games: Omit<Game, "gameHtml">[]
}

export function GameLibrary({ games }: GameLibraryProps) {
  const { user, profile, activeProfile } = useAuth()
  const [playingGame, setPlayingGame] = useState<{
    id: string
    title: string
    html: string
    concept?: string
    isPendingReview?: boolean
    authorName?: string
  } | null>(null)
  const [gradeFilter, setGradeFilter] = useState<string>("all")
  const [loading, setLoading] = useState<string | null>(null)
  const [pendingGames, setPendingGames] = useState<Omit<Game, "gameHtml">[]>([])

  const fetchPendingGames = useCallback(async () => {
    if (!activeProfile?.classId) return
    try {
      const res = await fetch(`/api/games?classId=${activeProfile.classId}&status=pending_review`)
      if (!res.ok) return
      const data = await res.json()
      // Filter out user's own games
      setPendingGames(data.filter((g: Omit<Game, "gameHtml">) => g.authorUid !== user?.uid))
    } catch {
      // Silent fail
    }
  }, [activeProfile?.classId, user?.uid])

  useEffect(() => {
    fetchPendingGames()
  }, [fetchPendingGames])

  // Extract unique grades from games
  const grades = Array.from(new Set(games.map((g) => {
    const parts = g.planetId?.split(".") || []
    return parts[0] || ""
  }).filter(Boolean))).sort()

  const filtered = gradeFilter === "all"
    ? games
    : games.filter((g) => g.planetId?.startsWith(gradeFilter + "."))

  const handlePlay = async (gameId: string, isPending = false) => {
    setLoading(gameId)
    try {
      const res = await fetch(`/api/game/${gameId}/html`)
      if (!res.ok) throw new Error("Failed to load game")
      const html = await res.text()
      const allGames = isPending ? pendingGames : games
      const game = allGames.find((g) => g.id === gameId)
      setPlayingGame({
        id: gameId,
        title: game?.title || "Game",
        html,
        concept: game?.designDoc?.concept,
        isPendingReview: isPending,
        authorName: game?.designerName,
      })
    } catch {
      // Silent fail
    } finally {
      setLoading(null)
    }
  }

  const handleReviewComplete = (approved: boolean) => {
    setPlayingGame(null)
    fetchPendingGames()
    // If approved, the game will appear in the published list on next page load
    if (approved) {
      // Could trigger a refresh of published games here if needed
    }
  }

  return (
    <div>
      {/* Needs Review section */}
      {pendingGames.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-medium text-amber-400 mb-3 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Needs Review ({pendingGames.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pendingGames.map((game) => (
              <div key={game.id} className="relative">
                <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-medium">
                  Needs Review
                </div>
                <GameCard game={game} onPlay={(id) => handlePlay(id, true)} />
                {loading === game.id && (
                  <div className="absolute inset-0 bg-zinc-950/50 rounded-xl flex items-center justify-center">
                    <div className="text-sm text-zinc-300">Loading...</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter controls */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setGradeFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            gradeFilter === "all"
              ? "bg-zinc-700 text-white"
              : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
          }`}
        >
          All Grades
        </button>
        {grades.map((grade) => (
          <button
            key={grade}
            onClick={() => setGradeFilter(grade)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              gradeFilter === grade
                ? "bg-zinc-700 text-white"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
            }`}
          >
            Grade {grade}
          </button>
        ))}
      </div>

      {/* Game grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-zinc-500 text-sm">No games published yet. Be the first!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((game) => (
            <div key={game.id} className="relative">
              <GameCard game={game} onPlay={handlePlay} />
              {loading === game.id && (
                <div className="absolute inset-0 bg-zinc-950/50 rounded-xl flex items-center justify-center">
                  <div className="text-sm text-zinc-300">Loading...</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Game player modal */}
      {playingGame && (
        <GamePlayer
          gameId={playingGame.id}
          title={playingGame.title}
          html={playingGame.html}
          concept={playingGame.concept}
          onClose={() => setPlayingGame(null)}
          isPendingReview={playingGame.isPendingReview}
          authorName={playingGame.authorName}
          reviewerUid={user?.uid}
          reviewerName={activeProfile?.name}
          onReviewComplete={playingGame.isPendingReview ? handleReviewComplete : undefined}
        />
      )}
    </div>
  )
}
