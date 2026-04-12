"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, Zap, Gamepad2, LayoutDashboard, Search, HelpCircle } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { UserMenu } from "./user-menu"
import { Logo } from "./logo"
import { useState, useEffect, useMemo } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import standardsData from "@/data/standards.json"
import type { StandardsGraph } from "@/lib/graph-types"
import { isClusterNode, buildDuplicateParentSet, isValidMoon } from "@/lib/galaxy-utils"

const STANDARDS = standardsData as StandardsGraph

// Unified header for all learner pages.
// Row 1: Logo + role badge + stats + user menu (never changes)
// Row 2: Navigation tabs + search + how to play

export function UnifiedHeader() {
  const { activeProfile, impersonating } = useAuth()
  const pathname = usePathname()

  // Don't show on guide/admin pages or if no profile
  if (!activeProfile) return null
  if (activeProfile.role === "guide" || activeProfile.role === "admin") return null
  if (pathname.startsWith("/guide") || pathname.startsWith("/admin")) return null

  const isExplore = pathname === "/"
  const isBuild = pathname === "/build"
  const isLibrary = pathname.startsWith("/library")
  const isDashboard = pathname === "/learner" || pathname === "/student"
  const isGalaxy = isExplore // Galaxy page — header overlays the 3D view

  return (
    <div className={isGalaxy ? "absolute top-0 left-0 right-0 z-40" : ""}>
      {impersonating && (
        <div className="bg-amber-500/90 text-black px-4 py-1.5 flex items-center justify-between text-sm">
          <span className="font-medium">Viewing as {impersonating.name}</span>
        </div>
      )}
      {/* Row 1: Logo + stats + user */}
      <div className={`${isGalaxy ? "bg-zinc-950/60" : "bg-zinc-950/90"} backdrop-blur-sm border-b border-zinc-800/50 px-4 py-2`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={24} className="text-blue-400" />
            <span className="text-sm font-bold text-white hidden sm:inline">Diagonally</span>
            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full font-medium">
              Learner
            </span>
          </div>
          <div className="flex items-center gap-4">
            <LearnerStats />
            <UserMenu />
          </div>
        </div>
      </div>

      {/* Row 2: Navigation */}
      <div className={`${isGalaxy ? "bg-zinc-900/40" : "bg-zinc-900/80"} backdrop-blur-sm border-b border-zinc-800/30 px-4 py-1.5`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1">
            <NavLink href="/" active={isExplore} icon={<Compass className="size-3.5" />} label="Explore" />
            <NavLink href="/build" active={isBuild} icon={<Zap className="size-3.5" />} label="Build NOW!" highlight />
            <NavLink href="/library" active={isLibrary} icon={<Gamepad2 className="size-3.5" />} label="Game Library" />
            <NavLink href="/learner" active={isDashboard} icon={<LayoutDashboard className="size-3.5" />} label="My Stuff" />
          </div>
          <div className="flex items-center gap-2">
            <SearchToggle />
            <HowToPlayButton />
          </div>
        </div>
      </div>
    </div>
  )
}

function NavLink({ href, active, icon, label, highlight }: {
  href: string; active: boolean; icon: React.ReactNode; label: string; highlight?: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
        active
          ? highlight ? "bg-emerald-600 text-white" : "bg-zinc-700 text-white"
          : highlight ? "bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30" : "text-zinc-400 hover:text-white"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  )
}

function LearnerStats() {
  const { activeProfile } = useAuth()
  const [skillCount, setSkillCount] = useState(0)

  const dupeParents = useMemo(() => buildDuplicateParentSet(STANDARDS.nodes.map(n => n.id)), [])
  const totalForGrade = useMemo(() => {
    if (!activeProfile?.grade) return 0
    return STANDARDS.nodes.filter(n =>
      n.grade === activeProfile.grade && isValidMoon(n.id, dupeParents)
    ).length
  }, [activeProfile?.grade, dupeParents])

  useEffect(() => {
    if (!activeProfile?.uid) return
    getDocs(collection(db, "progress", activeProfile.uid, "standards"))
      .then(snap => {
        let demonstrated = 0
        snap.forEach(d => {
          const status = d.data().status
          if (status === "unlocked" || status === "mastered") demonstrated++
        })
        setSkillCount(demonstrated)
      })
      .catch(() => {})
  }, [activeProfile?.uid])

  if (!activeProfile) return null

  return (
    <div className="flex items-center gap-3 text-xs text-zinc-400">
      {activeProfile.grade && (
        <span className="font-medium">G{activeProfile.grade}</span>
      )}
      <span>{skillCount}/{totalForGrade} skills</span>
      <span className="text-amber-400 font-mono">⬡ {activeProfile.tokens || 0}</span>
    </div>
  )
}

function SearchToggle() {
  const [open, setOpen] = useState(false)

  if (open) {
    return (
      <div className="flex items-center gap-1">
        <input
          autoFocus
          type="text"
          placeholder="Search moons..."
          className="w-40 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
          onBlur={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false)
            if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
              window.location.href = `/?search=${encodeURIComponent((e.target as HTMLInputElement).value.trim())}`
            }
          }}
        />
      </div>
    )
  }

  return (
    <button
      onClick={() => setOpen(true)}
      className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 transition-colors"
      title="Search"
    >
      <Search className="size-4" />
    </button>
  )
}

function HowToPlayButton() {
  return (
    <Link
      href="/?howtoplay=1"
      className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
    >
      <HelpCircle className="size-3.5" />
      <span className="hidden sm:inline">How to play</span>
    </Link>
  )
}
