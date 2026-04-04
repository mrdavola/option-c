# Game Builder Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the game builder pipeline — students design a game via the Genie, AI generates a playable HTML game, students refine it, then share it in a community library.

**Architecture:** Gemini API generates single-file HTML games from structured design docs extracted from Genie chat. Games are stored in Firebase Firestore. Rendered in sandboxed iframes. Community library on planets and a central `/library` page.

**Tech Stack:** Next.js 16 (App Router), Gemini API (`@google/genai`), Firebase Firestore (`firebase`), existing AI SDK for chat, existing shadcn/ui components.

**Design Doc:** `docs/plans/2026-04-04-game-builder-design.md`

---

## Task 1: Install Dependencies + Firebase Setup

**Files:**
- Create: `src/lib/firebase.ts`
- Modify: `package.json`

**Step 1: Install Firebase and Gemini SDK**

```bash
cd "/Users/md/Option C"
npm install firebase @google/genai
```

**Step 2: Create Firebase config**

Create `src/lib/firebase.ts`:

```ts
import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const db = getFirestore(app)
```

**Step 3: Add env var placeholders to `.env.local`**

Append Firebase config + Gemini API key placeholders. The user will fill these in from their Firebase console and Google AI Studio.

```
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Gemini API
GEMINI_API_KEY=
```

**Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

**Step 5: Commit**

```bash
git add src/lib/firebase.ts package.json package-lock.json
git commit -m "feat: add Firebase + Gemini SDK, Firebase client config"
```

---

## Task 2: Game Types + Design Doc Extraction

**Files:**
- Create: `src/lib/game-types.ts`
- Create: `src/app/api/game/design-doc/route.ts`

**Step 1: Create game types**

Create `src/lib/game-types.ts`:

```ts
export interface GameDesignDoc {
  title: string
  concept: string
  standardId: string
  planetId: string
  howItWorks: string
  rules: string[]
  winCondition: string
  mathRole: string
  designChoices: {
    vibe?: string
    color?: string
    characters?: string
    [key: string]: string | undefined
  }
}

export interface Game {
  id: string
  designerName: string
  standardId: string
  planetId: string
  title: string
  gameHtml: string
  designDoc: GameDesignDoc
  status: "draft" | "in_review" | "published"
  playCount: number
  ratingSum: number
  ratingCount: number
  createdAt: number
  updatedAt: number
}

export type GameStatus = Game["status"]
```

**Step 2: Create design doc extraction route**

Create `src/app/api/game/design-doc/route.ts`. This takes the Genie chat history and extracts a structured design doc using the existing AI SDK (not Gemini — use the same model as the Genie for consistency).

```ts
import { generateText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const { chatHistory, standardId, standardDescription, planetId } = await req.json()

  const { text } = await generateText({
    model: "anthropic/claude-sonnet-4.5",
    system: `Extract a structured game design document from this conversation between a student and a game design mentor. The student was designing a game that uses a math concept.

Respond in EXACTLY this JSON format, no markdown, no code fences:
{"title":"Short catchy game name","concept":"The math concept in plain language","howItWorks":"1-2 sentences describing the game","rules":["rule 1","rule 2","rule 3"],"winCondition":"How you win","mathRole":"How math is essential to the game"}

Rules:
- The title should be fun and short (2-4 words)
- Extract actual details from the conversation, don't make things up
- If something wasn't discussed, make a reasonable inference from context
- Keep language at the student's reading level`,
    prompt: `Chat history:\n${chatHistory}\n\nMath concept: ${standardDescription}\nStandard: ${standardId}`,
  })

  try {
    const cleaned = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim()
    const parsed = JSON.parse(cleaned)
    return Response.json({
      ...parsed,
      standardId,
      planetId,
      designChoices: {},
    })
  } catch {
    return Response.json({
      title: "My Math Game",
      concept: standardDescription,
      standardId,
      planetId,
      howItWorks: "A game that uses math",
      rules: ["Play and have fun"],
      winCondition: "Use math to win",
      mathRole: "Math is part of the gameplay",
      designChoices: {},
    })
  }
}
```

**Step 3: Commit**

```bash
git add src/lib/game-types.ts src/app/api/game/design-doc/route.ts
git commit -m "feat: game types and design doc extraction from Genie chat"
```

---

## Task 3: Gemini Game Generation API

**Files:**
- Create: `src/app/api/game/generate/route.ts`
- Create: `src/app/api/game/refine/route.ts`

**Step 1: Create game generation route**

Create `src/app/api/game/generate/route.ts`. This calls Gemini API to generate a complete HTML game.

```ts
import { GoogleGenAI } from "@google/genai"

export const maxDuration = 60

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export async function POST(req: Request) {
  const { designDoc, designChoices } = await req.json()

  const vibeInstructions = designChoices?.vibe ? `Visual theme: ${designChoices.vibe}.` : ""
  const colorInstructions = designChoices?.color ? `Color scheme: ${designChoices.color}.` : ""
  const characterInstructions = designChoices?.characters ? `Characters/style: ${designChoices.characters}.` : ""

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Generate a complete, self-contained HTML file for a playable browser game.

GAME DESIGN:
- Title: ${designDoc.title}
- Concept: ${designDoc.concept}
- How it works: ${designDoc.howItWorks}
- Rules: ${designDoc.rules.join(". ")}
- Win condition: ${designDoc.winCondition}
- Math role: ${designDoc.mathRole}
${vibeInstructions}
${colorInstructions}
${characterInstructions}

REQUIREMENTS:
- Output ONLY a complete HTML file. No markdown. No code fences. Start with <!DOCTYPE html>.
- All CSS and JavaScript must be inline (in <style> and <script> tags).
- The game must be fully playable with mouse/touch input.
- Use a dark background (#18181b) with light text (#e4e4e7).
- Make it visually appealing with colors, animations, and clear UI.
- Include a title screen, gameplay, and a win/lose state.
- The math concept must be essential to gameplay — not decorative.
- Target audience: elementary/middle school students. Keep it simple and fun.
- The game should work on both desktop and mobile (responsive).
- Include clear instructions on how to play.
- Maximum 500 lines of code. Keep it simple.`,
  })

  const html = response.text
  if (!html || !html.includes("<!DOCTYPE html>") && !html.includes("<html")) {
    return Response.json({ error: "Failed to generate game" }, { status: 500 })
  }

  // Clean up any markdown wrappers
  let cleanHtml = html
  if (cleanHtml.startsWith("```")) {
    cleanHtml = cleanHtml.replace(/^```html?\n?/, "").replace(/\n?```$/, "")
  }

  return Response.json({ html: cleanHtml })
}
```

**Step 2: Create game refinement route**

Create `src/app/api/game/refine/route.ts`. Takes existing HTML + student's feedback, generates improved version.

```ts
import { GoogleGenAI } from "@google/genai"

export const maxDuration = 60

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export async function POST(req: Request) {
  const { currentHtml, feedback, designDoc } = await req.json()

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Here is an existing HTML game:

${currentHtml}

The student who designed this game wants the following changes:
"${feedback}"

Original game design:
- Title: ${designDoc.title}
- Math concept: ${designDoc.concept}
- How it works: ${designDoc.howItWorks}

Please generate an updated complete HTML file incorporating the requested changes.
Output ONLY the complete HTML file. No markdown. No code fences. Start with <!DOCTYPE html>.
Keep all existing functionality that wasn't mentioned in the feedback.
All CSS and JavaScript must remain inline.`,
  })

  const html = response.text
  let cleanHtml = html || ""
  if (cleanHtml.startsWith("```")) {
    cleanHtml = cleanHtml.replace(/^```html?\n?/, "").replace(/\n?```$/, "")
  }

  return Response.json({ html: cleanHtml })
}
```

**Step 3: Commit**

```bash
git add src/app/api/game/generate/route.ts src/app/api/game/refine/route.ts
git commit -m "feat: Gemini API routes for game generation and refinement"
```

---

## Task 4: Firebase Game Storage API

**Files:**
- Create: `src/app/api/game/save/route.ts`
- Create: `src/app/api/game/[id]/route.ts`
- Create: `src/app/api/game/[id]/html/route.ts`
- Create: `src/app/api/game/[id]/rate/route.ts`
- Create: `src/app/api/game/[id]/review/route.ts`
- Create: `src/app/api/games/route.ts`
- Create: `src/app/api/games/planet/[planetId]/route.ts`

**Step 1: Create save route**

`POST /api/game/save` — creates or updates a game in Firestore.

```ts
import { db } from "@/lib/firebase"
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore"

export async function POST(req: Request) {
  const game = await req.json()
  const gamesRef = collection(db, "games")
  const gameId = game.id || doc(gamesRef).id

  await setDoc(doc(db, "games", gameId), {
    ...game,
    id: gameId,
    updatedAt: Date.now(),
    createdAt: game.createdAt || Date.now(),
  })

  return Response.json({ id: gameId })
}
```

**Step 2: Create get game route**

`GET /api/game/[id]` — returns game metadata.

**Step 3: Create HTML serve route**

`GET /api/game/[id]/html` — returns raw HTML for iframe src.

```ts
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const snap = await getDoc(doc(db, "games", id))
  if (!snap.exists()) return new Response("Not found", { status: 404 })
  const game = snap.data()
  return new Response(game.gameHtml, {
    headers: { "Content-Type": "text/html" },
  })
}
```

**Step 4: Create AI review route**

`POST /api/game/[id]/review` — reads the game HTML, uses AI to check quality, updates status.

**Step 5: Create rating route**

`POST /api/game/[id]/rate` — increments ratingSum and ratingCount.

**Step 6: Create list routes**

`GET /api/games` — list all published games.
`GET /api/games/planet/[planetId]` — list published games for a specific planet.

**Step 7: Commit**

```bash
git add src/app/api/game/ src/app/api/games/
git commit -m "feat: Firebase game storage, serving, review, and listing API routes"
```

---

## Task 5: Matrix Rain Component

**Files:**
- Create: `src/components/game/matrix-rain.tsx`

**Step 1: Create the Matrix rain canvas component**

A "use client" component that renders green falling characters on a canvas. Full Matrix effect — columns of random characters falling at different speeds. Green color (#22c55e). Dark background. Runs via requestAnimationFrame.

```tsx
"use client"

import { useEffect, useRef } from "react"

export function MatrixRain({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!

    // Resize to parent
    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const fontSize = 14
    const columns = Math.floor(canvas.width / fontSize)
    const drops: number[] = Array(columns).fill(1)
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789<>{}[]()=/+*-&|!@#$%^~"

    function draw() {
      ctx.fillStyle = "rgba(24, 24, 27, 0.05)"
      ctx.fillRect(0, 0, canvas!.width, canvas!.height)
      ctx.fillStyle = "#22c55e"
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        ctx.fillText(char, i * fontSize, drops[i] * fontSize)
        if (drops[i] * fontSize > canvas!.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }
    }

    const interval = setInterval(draw, 35)
    return () => {
      clearInterval(interval)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return <canvas ref={canvasRef} className={className} />
}
```

**Step 2: Commit**

```bash
git add src/components/game/matrix-rain.tsx
git commit -m "feat: Matrix rain canvas component"
```

---

## Task 6: Active Build Screen

**Files:**
- Create: `src/components/game/build-screen.tsx`

**Step 1: Create the Active Build Screen**

Full-screen component shown during game generation. Layout:
- Left: MatrixRain canvas
- Right: Genie narration messages + math micro-prompts + design questions
- Bottom: progress bar

The component:
1. Receives the design doc and a callback for when the build is complete
2. Calls `POST /api/game/generate` with the design doc
3. While waiting, cycles through narration messages, asks design questions, and shows math prompts
4. When generation completes, calls `onComplete(html, designChoices)` with the game HTML and any design choices the student made

Narration messages are pre-written and cycle every 3-4 seconds:
- "Setting up the game board..."
- "Adding the scoring system..."
- "Creating the rules..."
- "Making it look good..."
- "Testing the win condition..."
- "Almost done..."

Design questions appear between narration (student picks from 2 options):
- "What vibe? Jungle / Outer Space"
- "What colors? Bright and fun / Dark and mysterious"
- "Characters? Stick figures / Animals"

Student's answers are collected and sent with the generation request.

Math micro-prompts appear between narration:
- Generated based on the design doc's math concept (can be hardcoded for MVP)

Progress bar fills linearly over 20 seconds (or until the API returns, whichever is longer).

**Step 2: Commit**

```bash
git add src/components/game/build-screen.tsx
git commit -m "feat: Active Build Screen with Matrix rain, narration, and design questions"
```

---

## Task 7: Game Workshop

**Files:**
- Create: `src/components/game/workshop.tsx`
- Create: `src/components/game/game-iframe.tsx`

**Step 1: Create the game iframe component**

A sandboxed iframe that renders game HTML.

```tsx
"use client"

interface GameIframeProps {
  html: string
  className?: string
}

export function GameIframe({ html, className }: GameIframeProps) {
  // Use srcdoc to render HTML directly in the iframe
  return (
    <iframe
      srcDoc={html}
      sandbox="allow-scripts"
      className={className}
      style={{ border: "none", width: "100%", height: "100%" }}
      title="Game"
    />
  )
}
```

**Step 2: Create the Workshop component**

Split-screen: game iframe on left (~65%), Genie refinement chat on right (~35%).

The Workshop component:
- Receives game HTML, design doc, game ID
- Renders GameIframe with the HTML
- Renders a chat interface (similar to genie-chat but for refinements)
- On each refinement message: calls `POST /api/game/refine` → updates HTML → iframe reloads
- "Send for Review" button at bottom (disabled until student has interacted)
- "Back to Planet" button in top bar
- Auto-saves draft to Firebase on every refinement
- Mobile: game fullscreen + floating chat button

**Step 3: Commit**

```bash
git add src/components/game/workshop.tsx src/components/game/game-iframe.tsx
git commit -m "feat: Game Workshop with iframe and refinement chat"
```

---

## Task 8: Wire into Genie Chat + Graph Page

**Files:**
- Modify: `src/components/standard/genie-chat.tsx`
- Modify: `src/components/graph/graph-page.tsx`

**Step 1: Update Genie chat**

Change "Launch my game" button to "Build my Game". When clicked:
1. Extract chat history as text
2. Call `POST /api/game/design-doc` to get structured design doc
3. Call `onBuildGame(designDoc, chatHistory)` callback (new prop)

**Step 2: Update graph-page.tsx**

Add new state:
- `buildMode: "idle" | "building" | "workshop"`
- `currentGame: { html: string, designDoc: GameDesignDoc, gameId: string } | null`

Add new flow:
- When `onBuildGame` is called from Genie chat → close panel → set buildMode to "building" → show Active Build Screen
- When build completes → set buildMode to "workshop" → show Workshop
- When "Back to Planet" → save draft → set buildMode to "idle" → return to planet view
- When "Send for Review" → call review API → if pass, save as published → show success → return to planet

Render conditionally:
```tsx
{buildMode === "building" && <BuildScreen ... />}
{buildMode === "workshop" && <Workshop ... />}
{buildMode === "idle" && (viewMode === "galaxy" ? <GalaxyView ... /> : <PlanetView ... />)}
```

**Step 3: Commit**

```bash
git add src/components/standard/genie-chat.tsx src/components/graph/graph-page.tsx
git commit -m "feat: wire Build my Game button through to build screen and workshop"
```

---

## Task 9: Community Library Components

**Files:**
- Create: `src/components/game/game-card.tsx`
- Create: `src/components/game/game-player.tsx`
- Create: `src/components/game/game-library.tsx`

**Step 1: Create game card**

A card component showing: title, designer name, math concept, star rating, play count, "Play" button. Uses shadcn Card.

**Step 2: Create game player modal**

A full-screen modal that renders a game in an iframe. Shows the game title, a close button, and after playing for 30+ seconds, a rating prompt (1-5 stars). Calls `POST /api/game/[id]/rate` on rating.

**Step 3: Create game library grid**

A grid of game cards. Accepts a list of games and renders them. Includes filter controls for grade and domain.

**Step 4: Commit**

```bash
git add src/components/game/
git commit -m "feat: game card, player modal, and library grid components"
```

---

## Task 10: Library Page + Planet Integration

**Files:**
- Create: `src/app/library/page.tsx`
- Modify: `src/components/graph/planet-view.tsx`

**Step 1: Create central library page**

`src/app/library/page.tsx` — a Server Component that fetches all published games and renders the GameLibrary grid. Filterable by grade and domain.

**Step 2: Add community games to planet view**

In `planet-view.tsx`, add a "Community Games" section below the moons. Fetches games for the current planet's standards from `/api/games/planet/[planetId]`. Shows game cards. If no games yet, shows "No games built for this planet yet — be the first."

**Step 3: Add navigation to library**

Add a small "Library" button/link somewhere accessible — perhaps in the mini-map area or the top-right controls.

**Step 4: Commit**

```bash
git add src/app/library/ src/components/graph/planet-view.tsx
git commit -m "feat: community library page and planet-level game section"
```

---

## Task Summary

| Task | What | Depends On |
|------|------|-----------|
| 1 | Firebase + Gemini setup | — |
| 2 | Game types + design doc extraction | 1 |
| 3 | Gemini game generation + refinement | 1 |
| 4 | Firebase game storage API routes | 1 |
| 5 | Matrix rain component | — |
| 6 | Active Build Screen | 2, 3, 5 |
| 7 | Game Workshop | 3, 4 |
| 8 | Wire into Genie + graph page | 2, 6, 7 |
| 9 | Community library components | 4 |
| 10 | Library page + planet integration | 4, 9 |

**Parallelizable:** Tasks 1-5 can mostly run in parallel. Tasks 6-8 are sequential (build screen → workshop → wiring). Tasks 9-10 can run after Task 4.

```
Task 1 (Firebase/Gemini) ──┬── Task 2 (Types + Design Doc) ──┐
                           ├── Task 3 (Generation API) ───────┤
                           ├── Task 4 (Storage API) ──────────┤
                           └── Task 5 (Matrix Rain) ──────────┤
                                                              ├── Task 6 (Build Screen)
                                                              ├── Task 7 (Workshop)
                                                              ├── Task 8 (Wire it all)
                                                              ├── Task 9 (Library components)
                                                              └── Task 10 (Library page)
```
