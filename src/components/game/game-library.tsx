"use client"

import { useState } from "react"
import type { Game } from "@/lib/game-types"
import { GameCard } from "./game-card"
import { GamePlayer } from "./game-player"

interface GameLibraryProps {
  games: Omit<Game, "gameHtml">[]
}

export function GameLibrary({ games }: GameLibraryProps) {
  const [playingGame, setPlayingGame] = useState<{
    id: string
    title: string
    html: string
    concept?: string
  } | null>(null)
  const [gradeFilter, setGradeFilter] = useState<string>("all")
  const [loading, setLoading] = useState<string | null>(null)

  // Extract unique grades from games
  const grades = Array.from(new Set(games.map((g) => {
    const parts = g.planetId?.split(".") || []
    return parts[0] || ""
  }).filter(Boolean))).sort()

  const filtered = gradeFilter === "all"
    ? games
    : games.filter((g) => g.planetId?.startsWith(gradeFilter + "."))

  const handlePlay = async (gameId: string) => {
    setLoading(gameId)
    try {
      const res = await fetch(`/api/game/${gameId}/html`)
      if (!res.ok) throw new Error("Failed to load game")
      const html = await res.text()
      const game = games.find((g) => g.id === gameId)
      setPlayingGame({
        id: gameId,
        title: game?.title || "Game",
        html,
        concept: game?.designDoc?.concept,
      })
    } catch {
      // Silent fail
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
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
        />
      )}
    </div>
  )
}
