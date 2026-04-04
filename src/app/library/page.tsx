import { GameLibrary } from "@/components/game/game-library"
import type { Game } from "@/lib/game-types"
import Link from "next/link"

async function getPublishedGames(): Promise<Omit<Game, "gameHtml">[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const res = await fetch(`${baseUrl}/api/games`, {
      cache: "no-store",
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function LibraryPage() {
  const games = await getPublishedGames()

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Game Library</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Games built by students, for students
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Back to Galaxy
          </Link>
        </div>

        {/* Library grid */}
        <GameLibrary games={games} />
      </div>
    </div>
  )
}
