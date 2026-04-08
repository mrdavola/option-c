import { GameLibrary } from "@/components/game/game-library"
import type { Game } from "@/lib/game-types"
import Link from "next/link"
import moonNames from "@/data/moon-names.json"
import { LearnerNav } from "@/components/learner-nav"
import { UserMenu } from "@/components/user-menu"

const MOON_NAMES = moonNames as Record<string, string>

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

interface LibraryPageProps {
  searchParams: Promise<{ skill?: string }>
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const { skill } = await searchParams
  const allGames = await getPublishedGames()
  const games = skill ? allGames.filter((g) => g.standardId === skill) : allGames
  const skillName = skill ? (MOON_NAMES[skill] ?? skill) : null

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative">
      <LearnerNav />
      <div className="absolute top-4 right-4 z-20">
        <UserMenu />
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            {skillName ? (
              <>
                <p className="text-xs text-blue-400 font-medium uppercase tracking-wide">
                  Games for skill · {skill}
                </p>
                <h1 className="text-2xl font-bold">Play to Master: {skillName}</h1>
                <p className="text-zinc-400 text-sm mt-1">
                  Every game below is about this specific skill. Win a few to show you&apos;ve got it.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold">Game Library</h1>
                <p className="text-zinc-400 text-sm mt-1">
                  Games built by learners, for learners
                </p>
              </>
            )}
          </div>
          <Link
            href="/"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Back to Galaxy
          </Link>
        </div>

        {/* Library grid */}
        {games.length === 0 && skillName ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center">
            <p className="text-zinc-400">No approved games for this skill yet.</p>
            <p className="text-zinc-500 text-sm mt-1">Be the first — go back and build one!</p>
          </div>
        ) : (
          <GameLibrary games={games} />
        )}
      </div>
    </div>
  )
}
