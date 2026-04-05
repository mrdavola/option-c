# Guide Student Impersonation

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let guides impersonate students from their roster or create demo accounts, seeing and interacting with the galaxy exactly as that student would.

**Architecture:** Profile-level impersonation — guide stays signed in with their own auth. The auth context gains an `impersonating` state. All components read `activeProfile` (impersonated or own). Firestore reads/writes target the impersonated student's uid using the guide's auth token.

**Tech Stack:** Firebase Auth + Firestore, Next.js 16 App Router, React 19, Tailwind CSS, shadcn/ui

---

## Entry Points

1. **Student roster** — each student row gets an "Impersonate" button (eye icon). Loads that student's profile and switches to galaxy view.

2. **Demo account** — "Create Demo Student" button on guide dashboard. Creates a student user doc in the guide's class (name: "Demo Student"). Immediately impersonates it, triggering full onboarding (no grade/interests).

## Auth Context Changes

- New state: `impersonating: UserProfile | null`
- New functions: `startImpersonating(studentUid: string)`, `stopImpersonating()`
- New computed: `activeProfile` — returns `impersonating ?? profile`
- All components switch from `profile` to `activeProfile`
- `saveProgress`, `updateTokens`, `loadProgress` use `impersonating.uid` when active

## UI While Impersonating

- Banner at top of galaxy view: "[Student Name]'s view — Back to Dashboard" button
- Clear, non-floating — guide always knows they're impersonating
- "Back to Dashboard" clears impersonation, navigates to `/guide`

## Data Flow

- Reads: progress/tokens from impersonated student's Firestore docs
- Writes: progress/tokens/games saved under impersonated student's uid
- Auth: guide's own Firebase Auth token for all Firestore operations (rules check `request.auth != null`)
