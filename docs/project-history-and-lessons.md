# Diagonally — Project History & Lessons Learned

**Written:** April 16, 2026
**Purpose:** Institutional memory for agents and team members. Captures what we built, what went wrong, what we learned, and why we changed direction. Any agent reading this should understand the full context without needing to read conversation transcripts.

---

## 1. What We Built (March–April 2026)

### The Galaxy
Diagonally is an educational math platform where K-12 learners explore a 3D galaxy of 466 Common Core math standards (called "moons") across 65 planets (grade-level domains). The galaxy is built with `react-force-graph-3d` and Three.js.

### The Game System (Phaser-based)
We built **87 game options** across **25 game engines** using the Phaser.js game framework. Each engine was a TypeScript file that generated a complete HTML document with embedded Phaser game code. A shared `base-phaser-template.ts` provided common infrastructure (BootScene, VictoryScene, LoseScene, HUD, character sprites, game juice effects).

The architecture was:
- **Game Mechanic** (25 categories like "Balance & Equalize", "Collect & Manage")
- **Game Option** (87 specific variants like "mystery-side", "free-collect", "conveyor-belt")
- **Per-standard mapping** (`standard-game-options.ts`) — each of 466 standards mapped to 1-4 game options
- **AI round generation** — Claude Haiku generated math problems per standard at build time
- **Theme layer** — learner picked background, character, item sprites; AI generated themed names/colors

### The Builder Flow
Learner's flow was: Galaxy → click moon → moon card → "Build Your Game" → Mechanic Skeleton preview → Circuit Board Builder (pick sprites, backstory) → AI generates themed game → Play in Workshop → Submit for guide review.

### Additional Features Built
- Character customization system (persistent avatar)
- HTML paste feature (learners paste Gemini-generated games)
- Classic arcade overlays (Snake Math, Pac-Man Math, etc.)
- Montessori engine (Golden Beads, Hundred Board, etc.)
- Singapore CPA engine (Bar Model, Place Value Discs, etc.)
- 8 funny stickman animations for loading screens
- Hardcoded rounds for K-5 (~255 standards)
- Real-world use scenarios (Penny Jar, Fish Tank, School Bus)
- Hint system, token system, leaderboard, mastery flow

---

## 2. What Went Wrong — The 7 Failure Modes

### Failure 1: Games didn't teach the right math
**Discovery:** Barbara tested a "ratio" moon and got a game about volume. A statistics moon got an area game. The per-standard mapping used keyword matching that was hopelessly imprecise.

**Root cause:** We mapped standards to game options based on keyword overlap in descriptions, not on whether the game actually taught the standard's skill. "Ratio" appeared in both ratio and geometry descriptions.

**Fix attempted:** Replaced keyword matching with hardcoded per-standard mapping (466 individual entries). This fixed the MAPPING but not the games themselves.

### Failure 2: The "fake intrinsic" problem
**Discovery:** Barbara tested mystery-side (equation solving, 6.EE.B.7). The game had a scale where you drag unit weights until it balances. Looked intrinsic. But Barbara asked: "How does this teach algebra?" Answer: it doesn't. The learner was just COUNTING weights to reach a target — a grade-1 skill disguised as grade-6 algebra.

**Root cause:** We confused "interactive" with "intrinsic." Dragging, clicking, and physical interaction doesn't make a game teach math. The question is: does the player's ACTION map to the MATHEMATICAL OPERATION? Adding unit weights = counting. Real algebra = applying inverse operations to both sides.

**Key insight:** "If you can remove the game and the learning doesn't change, the game isn't teaching." (Mr. Chesure's test)

**Deeper insight:** The input method (drag vs click vs type) is IRRELEVANT. What matters is whether the player DISCOVERS the answer through the interaction or ALREADY KNOWS it and just delivers it.

### Failure 3: AI-generated rounds didn't match the standard
**Discovery:** A game for K.OA.A.1 (addition with objects) generated round prompts about "3 apples for every 2 oranges" — ratio language, not addition. The AI was generating generic math, not standard-specific math.

**Root cause:** The AI round generation prompt didn't enforce standard-specificity strongly enough. Also, "skeleton mode" set `worldName: "skeleton"` which the AI interpreted as literal skeletons, generating violent/spooky content.

**Fix:** Strengthened the AI prompt. Also started using hardcoded rounds (verified quality) instead of AI-generated ones.

### Failure 4: Theme layer fought the math
**Discovery:** A game themed as "Desert Athlete in Scorching Desert" showed a scale with blocks — nothing to do with deserts or athletes. The theme (background, character, items) had zero connection to the math mechanic. The game felt schizophrenic.

**Root cause:** The theme was a cosmetic layer applied AFTER the math mechanic was chosen. AI generated theme names without understanding what the game actually looked like. A scale game in a desert made no sense.

**Key decision:** Split into two layers: (1) Math Mechanic = theme-less, pure math, proven by research. (2) Theme = cosmetic wrapper applied later. We muted the theme layer entirely to focus on getting the math right first.

### Failure 5: The system did the math, not the learner
**Discovery:** In multiple games, running totals were displayed as the learner clicked. The learner could just tap and watch the number go up — they never had to count themselves. In the hint system, the system showed step-by-step solutions during play.

**Root cause:** Helpful UI features (running counts, live totals, animated counting) actually REMOVED the need for the learner to do math. The system was doing the work.

**Key principle established:** "The LEARNER does the math, not the system. No running count displayed while the learner is counting. Numbers appear only in (a) prompts, (b) answer choices, and (c) verification AFTER the learner commits."

**Further refinement from Mr. Chesure:** Even showing the EQUATION as a prompt (e.g., "2 + 1 = ?") lets the learner match digits without understanding addition. Per the Common Core Progressions Document, K students should work with concrete objects BEFORE symbolic notation. Fix: show DOT CLUSTERS as prompts, reveal the equation only AFTER the correct answer, as a recording of what the learner just did.

### Failure 6: Number pad allowed brute force
**Discovery:** The number pad showed 5 answer options. Wrong answers faded out, leaving fewer options each attempt. A learner could tap randomly until they won — no math required.

**Fix:** Wrong answers now SHAKE (don't fade). Number pad HIDES on wrong answer. Counters reset to untapped. Learner must recount from scratch. No trial-and-error path.

### Failure 7: Too many games, too little quality
**Discovery:** We tried to rebuild all 87 games overnight using parallel agents. Agents produced code that compiled but wasn't tested against real learner experience. Barbara would test and find fundamental problems (game doesn't make sense, wrong interaction, confusing UX).

**Root cause:** Prioritizing COVERAGE (87 games, 466 standards) over DEPTH (one game, done perfectly). Parallel agents can write code but can't judge pedagogy.

**Key decision:** Stop building in bulk. Start with ONE moon (K.OA.A.1), build it perfectly using proven sources, test it with Barbara, then move to the next. Quality over quantity. This led to the Learning Contract workflow.

---

## 3. What We Tried That Didn't Work

### Attempt: Overnight rebuild of 87 games (April 13-14)
**What:** Launched 13+ parallel agents to rebuild all game options as "truly intrinsic." Each agent got a spec and rebuilt 3-6 scenes.
**Result:** Code compiled. Many games were "rebuilt" on paper. But when Barbara tested, fundamental UX and pedagogy problems remained. The agents had optimized for "looks like a different game" not "actually teaches math."
**Lesson:** Parallel agents are good for mechanical tasks (formatting, renaming) but BAD for design judgment. Pedagogy requires human review at every step.

### Attempt: Using AI to invent game mechanics
**What:** I (Claude) designed game mechanics from scratch: "seesaw balance for statistics," "rolling balls for patterns," etc.
**Result:** Creative but pedagogically unsound. Barbara caught that my mystery-side prototype taught counting, not algebra. My "find the stat" seesaw design was never validated against how statistics is actually taught.
**Lesson:** AI is bad at inventing pedagogy from scratch. AI is good at ADAPTING proven approaches. Never invent a teaching method — always start from an authoritative source.

### Attempt: Cross-referencing multiple pedagogical sources
**What:** Proposed checking Open Up Resources + Math Learning Center + Montessori + Singapore Math + Progressions Documents for each standard.
**Result:** Too many sources = confusion. Each source had slightly different approaches. Mixing them produced inconsistency.
**Lesson:** Use ONE primary source per need. Common Core Progressions Documents for WHAT to teach (pedagogy). Math Learning Center apps for HOW to show it on screen (digital UX). Don't cross-reference — trust one source per domain.

### Attempt: Showing equations as prompts for K students
**What:** Game showed "2 + 1 = ?" as the prompt. Learner fills frames to match.
**Result:** Learner could match the digits "2" and "1" by clicking that many times, without understanding what addition means. Symbolic before concrete — backwards for K.
**Lesson:** Per the Progressions Document, K students should work with objects BEFORE equations. Show dot clusters, not digits. Reveal the equation only after the learner answers correctly, as a recording of what they did.

---

## 4. Key Insights (Lessons for All Agents)

### Insight 1: Mr. Chesure's Two Tests
Every game must pass BOTH:
1. **Discovery:** A learner who doesn't know the math can LEARN it by playing.
2. **Self-Revealing Truth:** Correctness is shown by the physics/behavior of the game world, not a popup.

### Insight 2: The 3 Criteria (for all games, including pasted HTML)
1. The math is used like in the real world (realistic scenario).
2. The math IS the main gameplay (not a sprinkle on top).
3. You must know the math to win (no random clicking, no trial-and-error).

### Insight 3: Fake Intrinsic > Quiz-Wrapper (in danger)
A quiz-wrapper (text question + select answer) is bad but HONEST — the learner knows they're answering a quiz. A fake-intrinsic game (dragging, clicking, physical interaction that's really just answer selection) is WORSE because it creates the ILLUSION of learning. The learner and teacher both think math is happening when it isn't.

### Insight 4: The Learner Does the Math
The system NEVER counts, sums, or computes on behalf of the learner. No running totals during interaction. No animated counting. Numbers appear only in prompts, answer choices, and post-answer verification.

### Insight 5: Concrete Before Symbolic
For K-2 especially: show objects (dots, counters, blocks) BEFORE showing equations. The equation is a RECORDING of what the learner just did, not an INSTRUCTION for what to do.

### Insight 6: One Well-Built Game = Many Standards
A single game (like Number Frames) can teach ~18 standards by changing parameters (number ranges, operation types, frame counts). We need ~22 games total for 466 standards, not 87. Quality over variety.

### Insight 7: Don't Invent Pedagogy — Adapt It
Two authoritative sources:
- **Common Core Progressions Documents** (University of Arizona) — what to teach and why, based on cognitive research.
- **Math Learning Center free apps** (Number Frames, Number Pieces, etc.) — how to show math on a screen, industry-standard digital manipulatives.

### Insight 8: Test One Moon Perfectly Before Scaling
The "build 87 games overnight" approach produced bulk with uneven quality. The "build K.OA.A.1 perfectly, then K.OA.A.3, then the next" approach produces verified quality that scales through reuse.

### Insight 9: Cross-Checking Prevents Errors
Every agent's work must be verified by at least one other agent. Mr. Chesure checks pedagogy, The Critic checks quality, The Tester checks bugs. When agents DISAGREED on K.OA.A.1 (Chesure said Criterion 1 PASS, Critic said FAIL), the disagreement itself was valuable — it surfaced a real tension we needed to resolve.

### Insight 10: The Learner as Builder
Diagonally's unique value is that learners BUILD games, not just play them. The "paste your own HTML" feature lets learners create games with AI (Gemini) and submit them for peer critique. Security is handled by sandboxed iframes + CSP. Quality is handled by AI judge (3 criteria) + peer review + guide approval.

---

## 5. What We're Doing Now (April 16, 2026)

### Current approach
- **Learning Contract workflow:** For each standard, fill a 14-step contract before writing code. Research-backed (Progressions Docs + Math Learning Center). Barbara approves before building.
- **One moon at a time:** Currently on K.OA.A.1. Next: K.OA.A.3. Then more K moons.
- **Number Frames game:** First reference implementation. Plain HTML/CSS/JS (no Phaser). Light aesthetic (Brilliant.org-inspired). Dot-cluster prompts (no digits during play). Equation revealed after correct answer.
- **Agent team:** 9 agents (Orchestrator, Mr. Chesure, Critic, Tester, Inspector, Security Guard, Historian, Janitor, Tracker) with cross-checking. Superpowers framework for workflow discipline.
- **Legacy games unmapped:** 464 standards have no game options mapped. The old 87 games exist in code (for reference) but are hidden from learners.

### Verified standards
- K.OA.A.1 — Number Frames (add mode) ✅ Barbara-approved
- K.OA.A.3 — Number Frames (decompose mode) — awaiting test

### Target
- ~22 games for 466 standards (K-12)
- K first (4 games, ~23 standards)
- Then grade by grade

---

## 6. Architecture Decisions Still in Effect

- **Two-layer design:** Math Mechanic (pure, theme-less) + Theme (cosmetic wrapper, muted for now)
- **Plain HTML/CSS/JS for new games** (not Phaser — lighter, cleaner, Brilliant-inspired)
- **Hardcoded rounds** (5 per standard, not AI-generated — verified quality)
- **CSP on all games** (Content-Security-Policy blocks external scripts, fetch, forms)
- **Sandboxed iframes** (`sandbox="allow-scripts"` — game can't access parent)
- **Firebase for persistence** (Firestore for progress, games, logs)
- **Vercel for deployment** (auto-deploy from main branch)

---

## 7. Open Questions

1. **How to handle subtraction UX at K level** — current subtraction mode (tap counters to remove) needs more testing. Is it intuitive for 5-year-olds?
2. **When to re-enable the theme layer** — the "build your own game" flow requires theming. Currently muted while we focus on math mechanics.
3. **How to handle standards where no intrinsic game exists** — some standards (especially HS) may not have a natural game form. Practice-only? Video + practice?
4. **Scaling content creation** — 466 Learning Contracts × 14 steps each is a lot. Can agents draft them reliably with human review?
5. **The fellowship pilot** — learners at Barbara's school will paste AI-generated games. How does this interact with our verified-game approach?
6. **Cost at scale** — currently near-zero (hardcoded content, no AI per play). At 1000+ learners with AI features, costs grow. When to optimize?

---

## 8. Key People & Roles

- **Barbara** — founder, tester, decision-maker. Runs the school where learners pilot. In the Worldwide Venture Fellowship.
- **Mike (mrdavola)** — repo owner, built the original sprite library and early engines.
- **Dylan** — builder expert from fellowship, security advisor.
- **Michael** — fellowship leader, advised on agent frameworks.
- **Claude (Orchestrator)** — AI project manager, code builder, agent dispatcher.

---

## 9. Files That Matter

| File | What it is |
|---|---|
| `docs/diagonally-blueprint.html` | Living spec document (THE source of truth) |
| `docs/contracts/K.OA.A.1.md` | First Learning Contract (reference implementation) |
| `docs/agents/*.md` | Agent definitions (9 agents) |
| `docs/pipeline-architecture-draft.md` | Multi-step generation pipeline (draft, not yet coded) |
| `docs/architecture-visual.md` | How standards → games → engines fit together |
| `docs/agent-team-visual.html` | Beautiful visual of agent team (for Slack sharing) |
| `src/lib/game-engines/number-frames.ts` | First verified game engine (K.OA.A.1 + K.OA.A.3) |
| `src/lib/standard-game-options.ts` | Per-standard mapping (only 2 verified entries) |
| `src/lib/standard-rounds.ts` | Hardcoded round data (K-5) |
| `src/lib/standard-scenarios.ts` | Real-world scenario data (K.OA.A.1 only) |
| `src/data/standards.json` | All 466 CCSS math standards |
