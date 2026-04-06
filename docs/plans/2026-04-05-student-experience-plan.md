# Student Experience — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix broken game saves, add student dashboard with game tracking and notifications, add student navigation, and implement the in_review concept state.

**Architecture:** Replace server-side `fetch("/api/game/save")` with direct client-side Firestore writes. New `/student` page with games list, notifications, and progress stats. Add `in_review` to NodeStatus. Minimal nav component for students. Approve flow updates student progress to `unlocked`.

**Tech Stack:** Firebase Auth + Firestore, Next.js 16 App Router, React 19, Tailwind CSS, shadcn/ui, lucide-react

**Design doc:** `docs/plans/2026-04-05-student-experience-design.md`

---

## Task 1: Fix Game Saves — Client-Side Firestore

**Files:**
- Modify: `src/components/graph/graph-page.tsx`
- Modify: `src/components/game/workshop.tsx`

**Problem:** `fetch("/api/game/save")` calls fail with 500 on Vercel because the API route uses the client Firebase SDK server-side, which has no auth token. Firestore rules (`request.auth != null`) reject it.

**Step 1: Update graph-page.tsx imports**

Add Firestore imports at the top:
```ts
import { doc, setDoc, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"
```

**Step 2: Rewrite handleBackToPlanet in graph-page.tsx**

Replace the `fetch("/api/game/save")` call (lines 331-350) with a direct Firestore write:

```ts
const handleBackToPlanet = useCallback(async (html: string, gameId: string | null) => {
  try {
    const gamesRef = collection(db, "games")
    const id = gameId || doc(gamesRef).id
    await setDoc(doc(db, "games", id), {
      id,
      title: currentDesignDoc?.title || "Untitled",
      designerName: activeProfile?.name || "Student",
      authorUid: activeProfile?.uid || "",
      classId: activeProfile?.classId || "",
      standardId: currentDesignDoc?.standardId || "",
      planetId: currentDesignDoc?.planetId || "",
      gameHtml: html,
      designDoc: currentDesignDoc,
      status: "draft",
      playCount: 0,
      ratingSum: 0,
      ratingCount: 0,
      reviews: [],
      updatedAt: Date.now(),
      createdAt: Date.now(),
    }, { merge: true })
  } catch {
    // Silent fail
  }
  setBuildMode("idle")
  setCurrentDesignDoc(null)
  setCurrentGameHtml("")
  setCurrentGameId(null)
}, [currentDesignDoc, activeProfile])
```

**Step 3: Rewrite handleSendForReview in graph-page.tsx**

Replace the `fetch("/api/game/save")` call (lines 364-382) with a direct Firestore write. Same as above but with `status: "pending_review"`. Also save progress as `in_review`:

```ts
const handleSendForReview = useCallback(async (html: string, gameId: string | null) => {
  try {
    const gamesRef = collection(db, "games")
    const id = gameId || doc(gamesRef).id
    await setDoc(doc(db, "games", id), {
      id,
      title: currentDesignDoc?.title || "Untitled",
      designerName: activeProfile?.name || "Student",
      authorUid: activeProfile?.uid || "",
      classId: activeProfile?.classId || "",
      standardId: currentDesignDoc?.standardId || "",
      planetId: currentDesignDoc?.planetId || "",
      gameHtml: html,
      designDoc: currentDesignDoc,
      status: "pending_review",
      playCount: 0,
      ratingSum: 0,
      ratingCount: 0,
      reviews: [],
      updatedAt: Date.now(),
      createdAt: Date.now(),
    }, { merge: true })

    // Mark this standard as in_review
    if (currentDesignDoc?.standardId) {
      await saveProgress(currentDesignDoc.standardId, { status: "in_review" })
      setProgressMap(prev => {
        const next = new Map(prev)
        next.set(currentDesignDoc.standardId, "in_review")
        return next
      })
    }

    setReviewResult({ pass: true, feedback: "Sent for review! Your classmates will check it out." })
    setTimeout(() => {
      setBuildMode("idle")
      setCurrentDesignDoc(null)
      setCurrentGameHtml("")
      setCurrentGameId(null)
      setReviewResult(null)
    }, 2000)
  } catch {
    setReviewResult({ pass: false, feedback: "Failed to submit. Please try again." })
    setTimeout(() => setReviewResult(null), 4000)
  }
}, [currentDesignDoc, activeProfile, saveProgress])
```

**Step 4: Rewrite saveDraft in workshop.tsx**

Replace the `fetch("/api/game/save")` call (lines 57-79) with a direct Firestore write:

```ts
import { doc, setDoc, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"
```

```ts
const saveDraft = async (gameHtml: string) => {
  try {
    const gamesRef = collection(db, "games")
    const id = currentGameId || doc(gamesRef).id
    await setDoc(doc(db, "games", id), {
      id,
      title: designDoc.title,
      designerName: activeProfile?.name || "Student",
      authorUid: activeProfile?.uid || "",
      classId: activeProfile?.classId || "",
      standardId: designDoc.standardId,
      planetId: designDoc.planetId,
      gameHtml,
      designDoc,
      status: "draft",
      playCount: 0,
      ratingSum: 0,
      ratingCount: 0,
      reviews: [],
      updatedAt: Date.now(),
      createdAt: Date.now(),
    }, { merge: true })
    if (!currentGameId) {
      setCurrentGameId(id)
    }
  } catch {
    // Silent fail
  }
}
```

**Step 5: Commit**

```bash
git add src/components/graph/graph-page.tsx src/components/game/workshop.tsx
git commit -m "fix: move game saves to client-side Firestore, fixing 500 errors on Vercel"
```

---

## Task 2: Add `in_review` to NodeStatus

**Files:**
- Modify: `src/lib/graph-types.ts`
- Modify: `src/lib/galaxy-utils.ts`
- Modify: `src/lib/auth-types.ts`

**Step 1: Update NodeStatus type**

In `src/lib/graph-types.ts` (line 23), add `in_review`:

```ts
export type NodeStatus = "locked" | "available" | "in_progress" | "in_review" | "unlocked" | "mastered"
```

**Step 2: Update ProgressDoc status type**

In `src/lib/auth-types.ts`, update the status union:

```ts
status: "locked" | "available" | "in_progress" | "in_review" | "unlocked" | "mastered"
```

**Step 3: Add in_review color to galaxy-utils.ts**

In `buildMoonData` (around line 327), add a case for `in_review` after `in_progress`:

```ts
case "in_review":
  size = 3.5
  color = "#f59e0b"  // amber — matches pending review badges
  break
```

**Step 4: Commit**

```bash
git add src/lib/graph-types.ts src/lib/galaxy-utils.ts src/lib/auth-types.ts
git commit -m "feat: add in_review status to NodeStatus with amber color"
```

---

## Task 3: Update Approve Flow to Unlock Concept

**Files:**
- Modify: `src/app/guide/page.tsx`

**Problem:** When a guide approves a game, the game status changes to `published` but the student's concept progress doesn't update to `unlocked`. Fix: after approving, also write to the student's progress doc.

**Step 1: Update handleApproveGame**

In `src/app/guide/page.tsx`, the `handleApproveGame` function (around line 206) currently updates the game doc. After updating, also update the student's progress and award tokens:

```ts
async function handleApproveGame(gameId: string) {
  if (!profile) return
  try {
    const gameRef = doc(db, "games", gameId)
    const gameSnap = await getDoc(gameRef)
    if (!gameSnap.exists()) return
    const game = gameSnap.data()

    await updateDoc(gameRef, {
      status: "published",
      approvedBy: profile.uid,
      reviews: [{ reviewerUid: profile.uid, reviewerName: profile.name, approved: true, createdAt: Date.now() }],
    })

    // Unlock the concept for the student
    if (game.authorUid && game.standardId) {
      await setDoc(
        doc(db, "progress", game.authorUid, "standards", game.standardId),
        { status: "unlocked", unlockedAt: Date.now() },
        { merge: true }
      )
      // Award tokens
      await updateDoc(doc(db, "users", game.authorUid), { tokens: increment(5) })
    }

    loadDashboard(classData?.id)
  } catch (err) {
    console.error("Approve error:", err)
  }
}
```

Add `setDoc` to the Firestore imports if not present.

**Step 2: Commit**

```bash
git add src/app/guide/page.tsx
git commit -m "feat: approving a game unlocks the concept and awards tokens"
```

---

## Task 4: Student Navigation Component

**Files:**
- Create: `src/components/student-nav.tsx`
- Modify: `src/components/graph/graph-page.tsx`

**Step 1: Create StudentNav component**

```tsx
// src/components/student-nav.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, LayoutDashboard } from "lucide-react"
import { useAuth } from "@/lib/auth"

export function StudentNav() {
  const { activeProfile, impersonating } = useAuth()
  const pathname = usePathname()

  // Only show for students (or impersonating a student)
  if (!activeProfile || activeProfile.role !== "student") return null
  // Hide on guide/admin pages
  if (pathname.startsWith("/guide") || pathname.startsWith("/admin")) return null

  const isExplore = pathname === "/"
  const isDashboard = pathname === "/student"

  return (
    <nav className="absolute top-4 left-4 z-20 flex gap-1 bg-zinc-900/80 backdrop-blur-sm rounded-lg border border-zinc-800 p-1">
      <Link
        href="/"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
          isExplore ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        <Compass className="size-3.5" />
        Explore
      </Link>
      <Link
        href="/student"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
          isDashboard ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        <LayoutDashboard className="size-3.5" />
        My Stuff
      </Link>
    </nav>
  )
```

**Step 2: Add StudentNav to graph-page.tsx**

Import and render it inside the `buildMode === "idle"` block, before the galaxy/planet view:

```tsx
import { StudentNav } from "@/components/student-nav"
```

Inside the render, right after `{buildMode === "idle" && (`:
```tsx
<StudentNav />
```

**Step 3: Adjust impersonation banner position**

The StudentNav sits at top-left. The impersonation banner is full-width at top. When impersonating, the StudentNav should move down. Add `${impersonating ? "top-14" : "top-4"}` to the nav's className.

**Step 4: Commit**

```bash
git add src/components/student-nav.tsx src/components/graph/graph-page.tsx
git commit -m "feat: student nav with Explore/My Stuff tabs"
```

---

## Task 5: Student Dashboard Page

**Files:**
- Create: `src/app/student/page.tsx`
- Create: `src/app/student/layout.tsx`

**Step 1: Create student layout**

```tsx
// src/app/student/layout.tsx
"use client"

import { useAuth } from "@/lib/auth"
import { StudentNav } from "@/components/student-nav"

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { activeProfile, loading, impersonating } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Impersonation banner */}
      {impersonating && (
        <div className="bg-amber-500/90 text-black px-4 py-2 flex items-center justify-between">
          <span className="text-sm font-medium">Viewing as {impersonating.name}</span>
          <button
            onClick={() => { window.location.href = "/guide" }}
            className="text-sm font-semibold bg-black/20 hover:bg-black/30 rounded-lg px-3 py-1 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      )}
      <div className="p-4 md:p-6">
        <StudentNav />
        <div className="pt-14">
          {children}
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Create student dashboard page**

```tsx
// src/app/student/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import type { Game } from "@/lib/game-types"
import { Gamepad2, Bell, Trophy } from "lucide-react"

export default function StudentDashboard() {
  const { user, activeProfile, loadProgress } = useAuth()
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
      // Load student's games
      const gamesQuery = query(
        collection(db, "games"),
        where("authorUid", "==", activeProfile!.uid)
      )
      const gamesSnap = await getDocs(gamesQuery)
      const gameList = gamesSnap.docs
        .map(d => ({ ...d.data(), id: d.id }) as Game)
        .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0))
      setGames(gameList)

      // Load progress stats
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

  // Compute notifications
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
      <h1 className="text-2xl font-bold text-white">
        Hey {activeProfile.name}
      </h1>

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
                <div
                  key={g.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between"
                >
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
```

**Step 3: Commit**

```bash
git add src/app/student/page.tsx src/app/student/layout.tsx
git commit -m "feat: student dashboard with games list, notifications, and progress stats"
```

---

## Task 6: Show Pending State in Standard Panel

**Files:**
- Modify: `src/components/standard/standard-panel.tsx`

**Step 1: Add in_review handling to standard panel**

Read the file first. Find where it checks `nodeStatus` to determine what to show. Add a case for `"in_review"` that displays:

```tsx
{nodeStatus === "in_review" && (
  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
    <p className="text-amber-300 font-medium">Your game is being reviewed</p>
    <p className="text-zinc-400 text-sm mt-1">You'll unlock this skill when your game is approved.</p>
    <a
      href="/student"
      className="text-sm text-blue-400 hover:text-blue-300 mt-2 inline-block"
    >
      Check status in My Stuff →
    </a>
  </div>
)}
```

**Step 2: Commit**

```bash
git add src/components/standard/standard-panel.tsx
git commit -m "feat: show pending review state in standard panel"
```

---

## Execution Order & Dependencies

```
Task 1 (Fix game saves) — critical fix, do first
Task 2 (in_review status) — needed by Task 1's saveProgress call
Task 3 (Approve unlocks concept) — uses in_review→unlocked flow
Task 4 (Student nav) — independent UI
Task 5 (Student dashboard) — independent page
Task 6 (Standard panel pending state) — uses in_review status
```

**Recommended order:** 2 → 1 → 3 → 4 → 5 → 6

Task 2 first (adds the type), then Task 1 (uses it), then Task 3 (completes the flow). Tasks 4-6 can go in any order after that.
