"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, Zap, Gamepad2, LayoutDashboard, Search, HelpCircle, Menu, X } from "lucide-react"
import { RulesPopover } from "./rules-popover"
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

  if (!activeProfile) return null

  // Guide/Admin pages use their own built-in headers
  if (pathname.startsWith("/guide") || pathname.startsWith("/admin")) return null

  // Hide for non-learner roles on learner pages
  if (activeProfile.role === "guide" || activeProfile.role === "admin") {
    // Show header if guide is impersonating a learner
    if (!impersonating) return null
  }

  const isExplore = pathname === "/"
  const isBuild = pathname === "/build"
  const isLibrary = pathname.startsWith("/library")
  const isDashboard = pathname === "/learner" || pathname === "/student"
  const isGalaxy = isExplore // Galaxy page — header overlays the 3D view

  return (
    <MobileMenuWrapper isGalaxy={isGalaxy} impersonating={impersonating}>
      {(mobileOpen, setMobileOpen) => (
        <>
          {/* Single row: Logo + Nav + Stats + Search + User */}
          <div className={`${isGalaxy ? "bg-zinc-950/60" : "bg-zinc-950/90"} backdrop-blur-sm border-b border-zinc-800/50 px-4 py-1.5`}>
            <div className="max-w-7xl mx-auto flex items-center gap-3">
              {/* Left: Logo + name */}
              <Link href="/" className="flex items-center gap-2 shrink-0">
                <Logo size={22} className="text-blue-400" />
                <span className="text-sm font-bold text-white hidden md:inline">Diagonally</span>
              </Link>

              {/* Center: Nav tabs — hidden below 768px, shown in hamburger menu */}
              <div className="hidden md:flex items-center gap-0.5 overflow-x-auto scrollbar-hide flex-1 min-w-0">
                <NavLink href="/" active={isExplore} icon={<Compass className="size-3.5" />} label="Explore" />
                <NavLink href="/build" active={isBuild} icon={<Zap className="size-3.5" />} label="Build NOW!" highlight />
                <NavLink href="/library" active={isLibrary} icon={<Gamepad2 className="size-3.5" />} label="Library" />
                <NavLink href="/learner" active={isDashboard} icon={<LayoutDashboard className="size-3.5" />} label="My Stuff" />
              </div>

              {/* Spacer on mobile to push right items */}
              <div className="flex-1 md:hidden" />

              {/* Right: Stats (hidden on mobile) + Search + Help + User + Hamburger */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden md:flex items-center">
                  <LearnerStats />
                </div>
                <SearchToggle />
                <RulesPopover />
                <UserMenu />
                {/* Hamburger — visible below 768px */}
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="md:hidden p-1.5 rounded-md text-zinc-400 hover:text-white transition-colors"
                  aria-label="Toggle menu"
                >
                  {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile dropdown menu — slides down below 768px */}
          {mobileOpen && (
            <div className="md:hidden bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800/50 px-4 py-3 space-y-2">
              <div className="flex flex-col gap-1">
                <MobileNavLink href="/" active={isExplore} icon={<Compass className="size-4" />} label="Explore" onClick={() => setMobileOpen(false)} />
                <MobileNavLink href="/build" active={isBuild} icon={<Zap className="size-4" />} label="Build NOW!" onClick={() => setMobileOpen(false)} highlight />
                <MobileNavLink href="/library" active={isLibrary} icon={<Gamepad2 className="size-4" />} label="Library" onClick={() => setMobileOpen(false)} />
                <MobileNavLink href="/learner" active={isDashboard} icon={<LayoutDashboard className="size-4" />} label="My Stuff" onClick={() => setMobileOpen(false)} />
              </div>
              {/* Stats shown in mobile menu */}
              <div className="border-t border-zinc-800 pt-2">
                <LearnerStats />
              </div>
            </div>
          )}
        </>
      )}
    </MobileMenuWrapper>
  )
}

function NavLink({ href, active, icon, label, highlight }: {
  href: string; active: boolean; icon: React.ReactNode; label: string; highlight?: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        active
          ? "text-white border-b-2 border-blue-400 rounded-b-none"
          : highlight ? "text-emerald-400 hover:text-emerald-300" : "text-zinc-400 hover:text-white"
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
      <span className="text-amber-400 font-mono">🪙 {activeProfile.tokens || 0}</span>
    </div>
  )
}

function SearchToggle() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Array<{ id: string; description: string; grade: string; domainCode: string }>>([])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const q = query.trim().toLowerCase()
    const dupeParents = buildDuplicateParentSet((standardsData as any).nodes.map((n: any) => n.id))
    const matches = (standardsData as any).nodes
      .filter((n: any) => {
        if (!isValidMoon(n.id, dupeParents)) return false
        return n.id.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q) ||
          n.domain.toLowerCase().includes(q)
      })
      .slice(0, 8)
      .map((n: any) => ({ id: n.id, description: n.description, grade: n.grade, domainCode: n.domainCode }))
    setResults(matches)
  }, [query])

  if (open) {
    return (
      <div className="relative">
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search moons..."
          className="w-48 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
          onKeyDown={(e) => {
            if (e.key === "Escape") { setOpen(false); setQuery(""); setResults([]) }
          }}
        />
        {results.length > 0 && (
          <div className="absolute top-8 right-0 w-72 bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-lg overflow-hidden max-h-64 overflow-y-auto z-50 shadow-xl">
            {results.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setOpen(false); setQuery(""); setResults([])
                  window.location.href = `/?moon=${encodeURIComponent(r.id)}`
                }}
                className="w-full text-left px-3 py-2 hover:bg-zinc-800 transition-colors border-b border-zinc-800/50 last:border-0"
              >
                <p className="text-sm text-white truncate">{r.description}</p>
                <p className="text-[10px] text-zinc-500">{r.id} · Grade {r.grade}</p>
              </button>
            ))}
          </div>
        )}
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

// Wrapper that provides mobile menu state and the outer container markup
function MobileMenuWrapper({
  isGalaxy,
  impersonating,
  children,
}: {
  isGalaxy: boolean
  impersonating: { name: string } | null
  children: (mobileOpen: boolean, setMobileOpen: (v: boolean) => void) => React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className={isGalaxy ? "absolute top-0 left-0 right-0 z-40" : ""}>
      {impersonating && (
        <div className="bg-amber-500/90 text-black px-4 py-1.5 flex items-center justify-between text-sm">
          <span className="font-medium">Viewing as {impersonating.name}</span>
        </div>
      )}
      {children(mobileOpen, setMobileOpen)}
    </div>
  )
}

function MobileNavLink({ href, active, icon, label, highlight, onClick }: {
  href: string; active: boolean; icon: React.ReactNode; label: string; highlight?: boolean; onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-blue-500/10 text-white"
          : highlight ? "text-emerald-400 hover:bg-emerald-500/10" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </Link>
  )
}

