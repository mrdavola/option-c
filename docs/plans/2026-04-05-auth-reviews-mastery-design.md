# Option C2 — Auth, Peer Reviews, Mastery & UX Fixes

**Date:** 2026-04-05
**Based on:** Barbara's daughter's testing feedback (April 4, 2026)

---

## 1. Authentication & User Model

### Two login paths

**Students:**
- Enter class code + name → persistent browser session (Firebase anonymous auth + stored token)
- On return: auto-login from stored token
- If cookie lost: re-enter class code + name → match existing user in that class → restore session
- Optional Google link for cross-device access (merges anonymous auth with Google credentials)

**Guides (Teachers):**
- Invite-only accounts (admin creates them or sends invite links)
- Email/password or Google sign-in
- Separate login screen with "Guide" entry point

### Firestore structure

```
users/{uid}
  name: string
  role: "student" | "guide" | "admin"
  grade: string
  interests: string[]
  classId: string
  tokens: number
  linkedGoogleUid?: string
  createdAt: timestamp
  lastLoginAt: timestamp

classes/{classId}
  name: string
  code: string (e.g. "MATH-7B")
  guideUid: string
  createdAt: timestamp

progress/{uid}/standards/{standardId}
  status: "locked" | "available" | "in_progress" | "unlocked" | "mastered"
  unlockedAt?: timestamp
  masteredAt?: timestamp
  masteryWins?: number (0-3, tracks wins toward mastery)

games/{gameId}
  ...existing fields
  authorUid: string
  classId: string
  status: "draft" | "pending_review" | "published"
  reviews: [{ reviewerUid, approved: bool, comment?: string, createdAt }]
  approvedBy?: string (uid of approver)
```

### Migration from current state
- Everything in localStorage (tokens, progress, onboarding data) moves to Firestore
- Games get linked to authorUid and classId
- Progress becomes server-authoritative (not fire-and-forget)

---

## 2. Teacher/Guide Dashboard

### What guides see
- **Class overview** — class name, join code (copyable), student count
- **Student roster** — name, last active, tokens earned, skills unlocked/mastered counts
- **Student detail** (click into) — galaxy progress, games built + status
- **Pending reviews** — games awaiting approval, guide can play then approve or comment
- **Class game library** — all published games, filterable by skill/planet

### What guides can do
- View all student progress
- Approve or comment on pending games
- Regenerate class join code
- Share the code to invite students

### What guides cannot do
- Assign specific skills/planets (student-driven exploration)
- Edit student games
- Delete student accounts (admin only)

---

## 3. Peer Review & Approval Flow

### The loop
1. Student finishes game in Workshop → clicks "Send for Review"
2. Game saves with status `pending_review`
3. Classmates see pending games in class library (tagged "Needs Review")
4. Reviewer plays the game → taps "Approve" or "Needs Work" + optional comment
5. **One approval** (peer or guide) → `published`, author earns +1 token, gets notified
6. "Needs Work" → author sees comment, can revise and resubmit

### Guard rails
- Can't review your own game
- Guide can always approve
- Only classmates (same classId) see pending games

---

## 4. Mastery-Through-Play

### Flow
1. On a moon's panel, after "Learn" and "Earn" stages, a new **"Master"** stage appears
2. Shows approved games for that skill (yours or classmates')
3. Student plays a game → must **win 3 rounds**
4. Each win tracked in `progress/{uid}/standards/{id}.masteryWins`
5. After 3 wins → status becomes `mastered`, student earns +5 tokens
6. Moon visually changes (full glow), planet checks all moons → mastery animation if complete

### Token economy
| Action | Tokens |
|--------|--------|
| Skill unlocked (3 criteria met in chat) | +5 |
| Game published (approved by peer/guide) | +1 |
| Skill mastered (win 3 rounds of an approved game) | +5 |

---

## 5. UX Fixes (from testing feedback)

### Galaxy/Map
- **Zoom control** — vertical slider (bottom-right) for zoom, pinch-to-zoom hint on mobile
- **Mini-map redesign** — hidden by default, small icon in bottom-left, expands on hover/tap, drop the progress bar (numbers are enough)

### Game creation
- **AI chat guardrails** — update game/chat prompt to enforce: math stays essential, game stays playable, math stays realistic. Refuse changes that break criteria.
- **Clear game endings** — update generate prompt: "Game must end after 3-5 rounds. Show clear win/lose screen."
- **Scrolling fix** — add to generate prompt: "Never use overflow:hidden on body. Game must scroll if taller than viewport."
- **"Send for Review" placement** — move from top bar to below the chat panel as a distinct action, separated from chat input
- **Question vs change detection** — update chat route to detect questions → answer without modifying HTML. Only return new HTML for change requests.
- **Connection error recovery** — retry logic + friendlier error message

### Concept card
- **Auto-use interests** — start explanations using the student's saved interests from onboarding (challenge mode by default)
- **Criteria wording** — rename "authentic" → "Is the math applied like real life?", add short descriptions to each criterion badge

---

## 6. Out of scope (for now)
- Admin dashboard UI (admin manages via Firebase console or CLI)
- Cross-class game library
- Leaderboards
- Cosmetic unlocks from tokens
- Analytics/learning analytics
- Multiplayer games
