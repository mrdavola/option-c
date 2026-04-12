"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, LayoutDashboard, Gamepad2, Zap } from "lucide-react"
import { useAuth } from "@/lib/auth"

export function LearnerNav() {
  const { activeProfile, impersonating } = useAuth()
  const pathname = usePathname()

  // Hide on guide/admin pages — show everywhere else (galaxy, dashboard, library)
  if (!activeProfile) return null
  if (pathname.startsWith("/guide") || pathname.startsWith("/admin")) return null

  const isExplore = pathname === "/"
  const isBuild = pathname === "/build"
  const isDashboard = pathname === "/learner" || pathname === "/student"
  const isLibrary = pathname.startsWith("/library")

  // On pages with their own header (learner, library), render inline instead of floating
  const isOverlay = isExplore

  return (
    <nav className={isOverlay
      ? `absolute left-4 z-20 flex gap-1 bg-zinc-900/85 backdrop-blur-sm rounded-lg border border-zinc-700 p-1 ${impersonating ? "top-14" : "top-4"}`
      : "flex gap-1 bg-zinc-900 rounded-lg border border-zinc-800 p-1 mb-4"
    }>
      <Link
        href="/"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
          isExplore ? "bg-zinc-700 text-white" : "text-zinc-300 hover:text-white"
        }`}
      >
        <Compass className="size-3.5" />
        Explore
      </Link>
      <Link
        href="/build"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
          isBuild ? "bg-emerald-600 text-white" : "bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30"
        }`}
      >
        <Zap className="size-3.5" />
        Build NOW!
      </Link>
      <Link
        href="/library"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
          isLibrary ? "bg-zinc-700 text-white" : "text-zinc-300 hover:text-white"
        }`}
      >
        <Gamepad2 className="size-3.5" />
        Game Library
      </Link>
      <Link
        href="/learner"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
          isDashboard ? "bg-zinc-700 text-white" : "text-zinc-300 hover:text-white"
        }`}
      >
        <LayoutDashboard className="size-3.5" />
        My Stuff
      </Link>
    </nav>
  )
}
