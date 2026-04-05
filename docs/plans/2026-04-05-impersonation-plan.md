# Guide Student Impersonation — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let guides impersonate students from their roster (or create demo accounts), seeing and interacting with the full student galaxy experience.

**Architecture:** Profile-level impersonation. The auth context gains an `impersonating: UserProfile | null` state and exposes `activeProfile` (impersonated or own profile). All student-facing components read `activeProfile` instead of `profile`. Firestore reads/writes target the impersonated student's uid while using the guide's auth token. Guide dashboard gets "Impersonate" buttons on roster and a "Create Demo Student" action.

**Tech Stack:** Firebase Auth + Firestore, Next.js 16 App Router, React 19, Tailwind CSS, shadcn/ui

**Design doc:** `docs/plans/2026-04-05-impersonation-design.md`

---

## Task 1: Add Impersonation State to Auth Context

**Files:**
- Modify: `src/lib/auth.tsx`

**Step 1: Add impersonation state and functions**

In `AuthProvider`, add after the existing state declarations (line 57):

```ts
const [impersonating, setImpersonating] = useState<UserProfile | null>(null)
```

Add two new callbacks after `loadProgressFn`:

```ts
const startImpersonating = useCallback(async (studentUid: string) => {
  const snap = await getDoc(doc(db, "users", studentUid))
  if (snap.exists()) {
    setImpersonating(snap.data() as UserProfile)
  }
}, [])

const stopImpersonating = useCallback(() => {
  setImpersonating(null)
}, [])
```

**Step 2: Add `activeProfile` computed value**

After the impersonation state:

```ts
const activeProfile = impersonating ?? profile
```

**Step 3: Update `updateTokens`, `saveProgress`, `loadProgress` to use impersonated uid**

Change `updateTokens`:
```ts
const updateTokens = useCallback(async (delta: number): Promise<number> => {
  if (!user) throw new Error("Must be signed in to update tokens.")
  const targetUid = impersonating?.uid ?? user.uid
  const userRef = doc(db, "users", targetUid)
  await updateDoc(userRef, { tokens: increment(delta) })
  const snap = await getDoc(userRef)
  const newTotal = (snap.data() as UserProfile).tokens
  if (impersonating) {
    setImpersonating(prev => prev ? { ...prev, tokens: newTotal } : prev)
  } else {
    setProfile(prev => prev ? { ...prev, tokens: newTotal } : prev)
  }
  return newTotal
}, [user, impersonating])
```

Change `saveProgress`:
```ts
const saveProgress = useCallback(
  async (standardId: string, data: Partial<ProgressDoc>) => {
    if (!user) throw new Error("Must be signed in to save progress.")
    const targetUid = impersonating?.uid ?? user.uid
    await setDoc(
      doc(db, "progress", targetUid, "standards", standardId),
      data,
      { merge: true }
    )
  },
  [user, impersonating]
)
```

Change `loadProgressFn`:
```ts
const loadProgressFn = useCallback(async (): Promise<Map<string, ProgressDoc>> => {
  if (!user) throw new Error("Must be signed in to load progress.")
  const targetUid = impersonating?.uid ?? user.uid
  const snap = await getDocs(
    collection(db, "progress", targetUid, "standards")
  )
  const result = new Map<string, ProgressDoc>()
  snap.forEach((d) => {
    result.set(d.id, d.data() as ProgressDoc)
  })
  return result
}, [user, impersonating])
```

**Step 4: Update AuthContextValue interface and provider value**

Add to `AuthContextValue`:
```ts
impersonating: UserProfile | null
activeProfile: UserProfile | null
startImpersonating: (studentUid: string) => Promise<void>
stopImpersonating: () => void
```

Add to the `AuthContext` value object:
```ts
impersonating,
activeProfile,
startImpersonating,
stopImpersonating,
```

**Step 5: Commit**

```bash
git add src/lib/auth.tsx
git commit -m "feat: add impersonation state to auth context"
```

---

## Task 2: Update Student-Facing Components to Use `activeProfile`

**Files:**
- Modify: `src/components/graph/graph-page.tsx`
- Modify: `src/components/game/workshop.tsx`
- Modify: `src/components/game/game-library.tsx`
- Modify: `src/components/standard/mastery-play.tsx`
- Modify: `src/components/onboarding/onboarding-flow.tsx`

**Step 1: Update graph-page.tsx**

Change the destructured auth (line 58):
```ts
const { user, profile, activeProfile, loading: authLoading, updateTokens, saveProgress, loadProgress, impersonating, stopImpersonating } = useAuth()
```

Replace every `profile` reference in this file with `activeProfile`, EXCEPT:
- The `!onboardingComplete` check should use `activeProfile`
- The `useEffect` that loads from auth profile should use `activeProfile`
- Lines 326-328, 358-360: `profile?.name` → `activeProfile?.name`, `profile?.uid` → `activeProfile?.uid`, `profile?.classId` → `activeProfile?.classId`

In the profile-loading `useEffect` (around line 79), change `if (profile)` to `if (activeProfile)` and all `profile.X` references inside to `activeProfile.X`.

**Step 2: Update workshop.tsx**

Change destructure to include `activeProfile`:
```ts
const { profile, activeProfile } = useAuth()
```

Replace `profile?.name`, `profile?.uid`, `profile?.classId` with `activeProfile?.name`, `activeProfile?.uid`, `activeProfile?.classId` (lines 63-65).

**Step 3: Update game-library.tsx**

Change destructure to include `activeProfile`:
```ts
const { user, profile, activeProfile } = useAuth()
```

Replace `profile?.classId` with `activeProfile?.classId` (lines 28, 30, 37).
Replace `profile?.name` with `activeProfile?.name` (line 171).

**Step 4: Update mastery-play.tsx**

Change destructure to include `activeProfile`:
```ts
const { profile, activeProfile } = useAuth()
```

Replace `profile?.classId` with `activeProfile?.classId` (lines 25, 26, 37).

**Step 5: Update onboarding-flow.tsx**

Change destructure:
```ts
const { user, profile, activeProfile, signInStudent } = useAuth()
```

Replace all `profile` references with `activeProfile` (lines 385-391) — this controls whether onboarding shows for the impersonated student (it should, if demo student has no grade).

**Step 6: Commit**

```bash
git add src/components/graph/graph-page.tsx src/components/game/workshop.tsx src/components/game/game-library.tsx src/components/standard/mastery-play.tsx src/components/onboarding/onboarding-flow.tsx
git commit -m "feat: switch student-facing components to activeProfile"
```

---

## Task 3: Add Impersonation Banner to Galaxy View

**Files:**
- Modify: `src/components/graph/graph-page.tsx`

**Step 1: Add impersonation banner**

In graph-page.tsx, after the `{buildMode === "idle" && viewMode === "planet" && (` back-to-galaxy button block (around line 468), add:

```tsx
{/* Impersonation banner */}
{impersonating && buildMode === "idle" && (
  <div className="absolute top-0 left-0 right-0 z-30 bg-amber-500/90 text-black px-4 py-2 flex items-center justify-between">
    <span className="text-sm font-medium">
      Viewing as {impersonating.name}
    </span>
    <button
      onClick={() => {
        stopImpersonating()
        window.location.href = "/guide"
      }}
      className="text-sm font-semibold bg-black/20 hover:bg-black/30 rounded-lg px-3 py-1 transition-colors"
    >
      Back to Dashboard
    </button>
  </div>
)}
```

**Step 2: Offset top-right controls when impersonating**

The top-right controls div (around line 481) — add conditional top offset:

Change `className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end"` to:
```tsx
className={`absolute right-4 z-10 flex flex-col gap-2 items-end ${impersonating ? "top-14" : "top-4"}`}
```

Do the same for the tutorial hint (around line 554) and back-to-galaxy button (around line 469) — add `${impersonating ? "top-14" : "top-4"}` to their top positioning.

**Step 3: Commit**

```bash
git add src/components/graph/graph-page.tsx
git commit -m "feat: impersonation banner in galaxy view"
```

---

## Task 4: Add Impersonate Buttons to Guide Dashboard

**Files:**
- Modify: `src/app/guide/page.tsx`

**Step 1: Add impersonation imports and state**

In the guide dashboard, destructure `startImpersonating` from auth:
```ts
const { profile, signOut, startImpersonating } = useAuth()
```

Import `useRouter`:
```ts
import { useRouter } from "next/navigation"
```

Add router:
```ts
const router = useRouter()
```

**Step 2: Add impersonate handler**

```ts
async function handleImpersonate(studentUid: string) {
  await startImpersonating(studentUid)
  router.push("/")
}
```

**Step 3: Add impersonate button to student roster rows**

In the student table row (around line 216), add a new column with an eye icon button. Add a `<th>` for the column header and a `<td>` with:

```tsx
<td className="px-4 py-3 text-right">
  <button
    onClick={(e) => { e.stopPropagation(); handleImpersonate(s.uid) }}
    title="View as this student"
    className="text-zinc-500 hover:text-white transition-colors p-1"
  >
    <Eye className="size-4" />
  </button>
</td>
```

Import `Eye` from lucide-react.

**Step 4: Add "Create Demo Student" button**

Above the tabs section (after the "Share with students" card), add:

```tsx
<div className="flex gap-3">
  <button
    onClick={async () => {
      if (!profile?.classId) return
      const demoRef = doc(collection(db, "users"))
      await setDoc(demoRef, {
        uid: demoRef.id,
        name: "Demo Student",
        role: "student",
        grade: "",
        interests: [],
        classId: profile.classId,
        tokens: 0,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
      })
      await startImpersonating(demoRef.id)
      router.push("/")
    }}
    className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5"
  >
    <Plus className="size-4" />
    Create Demo Student
  </button>
</div>
```

**Step 5: Commit**

```bash
git add src/app/guide/page.tsx
git commit -m "feat: impersonate buttons and demo student on guide dashboard"
```

---

## Task 5: Handle Onboarding for Demo Students

**Files:**
- Modify: `src/components/graph/graph-page.tsx`

**Step 1: Ensure demo students trigger onboarding**

The existing logic in graph-page.tsx already handles this — when `activeProfile` has empty grade/interests, `onboardingComplete` stays false and the onboarding flow shows. But we need to make sure the onboarding flow saves to the impersonated student's doc, not the guide's.

Check that `onboarding-flow.tsx`'s `handleInterestsComplete` uses `user.uid` for the Firestore write. It currently does:
```ts
await updateDoc(doc(db, "users", user.uid), { grade, interests })
```

This would write to the GUIDE's doc. Fix it to use the impersonated uid:

In `onboarding-flow.tsx`, update the destructure:
```ts
const { user, profile, activeProfile, signInStudent, impersonating } = useAuth()
```

Update `handleInterestsComplete`:
```ts
const handleInterestsComplete = async () => {
  const targetUid = impersonating?.uid ?? user?.uid
  if (targetUid) {
    try {
      await updateDoc(doc(db, "users", targetUid), {
        grade: data.grade,
        interests: data.interests,
      })
    } catch {
      // Silent fail
    }
  }
  onComplete(data)
}
```

Also skip the class code and name steps when impersonating (the student already has a class and name). Update `initialStep`:
```ts
const initialStep = impersonating
  ? (!impersonating.grade ? 2 : impersonating.interests.length === 0 ? 4 : 0)
  : activeProfile
    ? (!activeProfile.grade ? 2 : activeProfile.interests.length === 0 ? 4 : 0)
    : 0
```

And pre-fill the name from impersonated profile:
```ts
const [data, setData] = useState<OnboardingData>({
  name: (impersonating ?? activeProfile)?.name || "",
  grade: (impersonating ?? activeProfile)?.grade || "",
  interests: (impersonating ?? activeProfile)?.interests || [],
})
```

**Step 2: Commit**

```bash
git add src/components/onboarding/onboarding-flow.tsx
git commit -m "feat: onboarding writes to impersonated student, skips auth steps"
```

---

## Task 6: Reset Galaxy State on Impersonation Change

**Files:**
- Modify: `src/components/graph/graph-page.tsx`

**Step 1: Reset state when activeProfile changes**

When the guide starts or stops impersonating, the galaxy needs to reload progress for the new profile. Add a `useEffect` that resets state when `activeProfile?.uid` changes:

```ts
// Reset galaxy state when switching profiles (impersonation)
useEffect(() => {
  setOnboardingComplete(false)
  setProgressMap(initialProgress)
  setTokens(0)
  setStudentData(null)
  setViewMode("galaxy")
  setCurrentPlanetId(null)
  setPanelOpen(false)
  setBuildMode("idle")
}, [activeProfile?.uid, initialProgress])
```

Place this BEFORE the existing profile-loading useEffect. The profile-loading useEffect will then fire and repopulate everything from the new activeProfile.

**Step 2: Commit**

```bash
git add src/components/graph/graph-page.tsx
git commit -m "feat: reset galaxy state on impersonation change"
```

---

## Execution Order & Dependencies

```
Task 1 (Auth context) — foundation
  └→ Task 2 (Switch components to activeProfile)
  └→ Task 3 (Impersonation banner)
  └→ Task 4 (Dashboard buttons)
  └→ Task 5 (Onboarding for demo students)
  └→ Task 6 (Reset state on switch)
```

All tasks are sequential — each depends on Task 1, and Tasks 3-6 depend on Task 2.
