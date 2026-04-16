# How It All Fits Together

## Top-down flow (what happens when a learner clicks a moon)

```
┌─────────────────────────────────────────────────┐
│   LEARNER CLICKS A MOON (e.g., K.OA.A.1)        │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│   Moon Card opens → "Build Your Game" button    │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│   Look up the standard's mapped Game Option     │
│   (from standard-game-options.ts)               │
│   K.OA.A.1 → "number-frames"                    │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│   Call /api/game/generate-engine                │
│   passing: standardId, option, mechanicId       │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│   Engine runs → returns HTML                    │
│   (number-frames.ts generates the game HTML)    │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│   HTML renders in an iframe (light theme,       │
│   clean, Brilliant-style)                       │
│   → LEARNER PLAYS                               │
└─────────────────────────────────────────────────┘
```

---

## The layered architecture

```
┌────────────────────────────────────────────────────────────────┐
│  LAYER 1 — CURRICULUM (what to teach)                          │
├────────────────────────────────────────────────────────────────┤
│  466 Math Standards (from CCSS)                                │
│  e.g., K.OA.A.1, 6.EE.B.7, 8.G.B.6                             │
│                                                                 │
│  Source of truth: Common Core Progressions Documents           │
│  (University of Arizona, cognitive-research-backed)            │
└────────────────────────────────┬───────────────────────────────┘
                                 │
                                 │ each standard has...
                                 ▼
┌────────────────────────────────────────────────────────────────┐
│  LAYER 2 — CONTENT (the specific math problems)                │
├────────────────────────────────────────────────────────────────┤
│  Per-Standard Data (~5 items per standard):                    │
│  • Kid-friendly label — "Add and take away things"             │
│  • 5 Hardcoded Rounds — (2+1=3, 3+2=5, ...)                    │
│  • 3 Scenarios (currently muted) — Penny Jar, Fish Tank, Bus   │
│  • Learning Contract — the 14-step design spec                 │
│                                                                 │
│  Source of truth: we write these per standard (learning        │
│  contract), based on Progressions Documents                    │
└────────────────────────────────┬───────────────────────────────┘
                                 │
                                 │ points to...
                                 ▼
┌────────────────────────────────────────────────────────────────┐
│  LAYER 3 — GAMEPLAY (how to show the math on screen)           │
├────────────────────────────────────────────────────────────────┤
│  Game Option — a specific interaction design                   │
│  e.g., "number-frames", "number-frames-decompose"              │
│                                                                 │
│  Source of truth: Math Learning Center's free apps             │
│  (industry-standard digital manipulatives)                     │
└────────────────────────────────┬───────────────────────────────┘
                                 │
                                 │ powered by...
                                 ▼
┌────────────────────────────────────────────────────────────────┐
│  LAYER 4 — ENGINE (the code that runs it)                      │
├────────────────────────────────────────────────────────────────┤
│  Game Engine — TypeScript/HTML code                            │
│  e.g., number-frames.ts returns a full HTML document           │
│                                                                 │
│  One engine handles its game option(s) (one engine may have    │
│  multiple modes, like number-frames: add + decompose)          │
└────────────────────────────────┬───────────────────────────────┘
                                 │
                                 │ generates...
                                 ▼
┌────────────────────────────────────────────────────────────────┐
│  LAYER 5 — THE GAME (what the learner sees and plays)          │
├────────────────────────────────────────────────────────────────┤
│  Full HTML document with:                                      │
│  • Ten-frames, counters, prompts                               │
│  • Interaction logic (click, drag, count)                      │
│  • Win detection + next-round flow                             │
└────────────────────────────────────────────────────────────────┘
```

---

## Counts at each layer

| Layer | What | Current count | Target count (post-rebuild) |
|-------|------|---------------|------------------------------|
| 1. Curriculum | Math Standards | **466** | 466 (unchanged) |
| 2. Content | Hardcoded Rounds (5 per standard) | ~2,330 | 2,330 |
| 2. Content | Scenarios (3 per standard — muted) | 3 (just K.OA.A.1) | 1,398 |
| 2. Content | Learning Contracts | 1 (K.OA.A.1) | 466 |
| 3. Gameplay | Game Options | **87 legacy, 2 new** | ~22 new |
| 4. Engine | Game Engines | **26 legacy, 1 new** | ~22 new |
| 5. Rendered Games | Playable games per standard | up to 3 options | 1 (the right one) |

**Post-rebuild goal: 22 engines × ~21 standards each = 466 standards covered.**

---

## Extra parts (currently active or muted)

### Currently ACTIVE (in the direct-play flow)
- **Moon card** — entry point with title and Build Your Game button
- **Number Frames engine** — covers K.OA.A.1 (add mode) and K.OA.A.3 (decompose mode)
- **Direct-play step** — moon → game, no intermediates

### Currently MUTED (code preserved for later)
- **Mechanic Skeleton page** — the "preview before build" step (was between moon and game)
- **Circuit Board Builder** — customization UI (pick background, character, item, write backstory)
- **Scenarios celebration** — 3 real-world scenario cards (Penny Jar, Fish Tank, School Bus)
- **Theme layer** — applying sprites, characters, colors to the game
- **Backstory banner** — top-of-game text from learner's story
- **Character customization** — persistent learner avatar
- **Modding Lab** — HTML/CSS editor for learners to style their games
- **Tokens, leaderboard, mastery flow** — reward layer
- **87 legacy game options** — old games mapped to most moons (still there, will be retired)

---

## Pipeline for building a new moon (Learning Contract workflow)

```
1. Pick a standard (e.g., K.OA.A.5)
        │
        ▼
2. Open Progressions Doc → understand pedagogy
        │
        ▼
3. Open Math Learning Center app → understand gameplay pattern
        │
        ▼
4. Fill Learning Contract (14 steps)
        │
        ▼
5. Does an existing Game Option cover this?
        │
        ├── YES → reuse it (just update mapping)
        │         Example: K.OA.A.3 → number-frames-decompose (reused mode)
        │
        └── NO → build new Game Option + Engine
                  Example: K.G.A.1 would need a "shape-names" engine
        │
        ▼
6. Test with Barbara
        │
        ▼
7. Sign off → commit → move to next moon
```

---

## Current rebuild progress (April 14, 2026)

| Moon | Status | Game Option |
|------|--------|-------------|
| K.OA.A.1 | ✅ Done, Chesure-approved | number-frames (add mode) |
| K.OA.A.3 | 🔨 Built, awaiting test | number-frames-decompose |
| All other 464 | Using legacy broken games (will migrate gradually) | various |

---

## Why 22 games for 466 standards?

Because related standards share math. A single good tool (like Number Frames) teaches many related skills through parameter changes:

- K.OA.A.1 (add within 10) → Number Frames, add mode
- K.OA.A.3 (decompose) → Number Frames, decompose mode
- K.OA.A.4 (make 10) → Number Frames, "fill to 10" mode
- K.OA.A.5 (fluency within 5) → Number Frames, quick-mode
- 1.OA.A.1 (add within 20) → Number Frames, double-frame
- ... and so on

One engine, many modes, dozens of standards.
