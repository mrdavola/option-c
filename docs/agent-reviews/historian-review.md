# The Historian's Review — Documentation, Process & Institutional Memory

**Agent:** The Historian (Documentation, Logging & Archive Keeper)
**Date:** April 15, 2026
**Documents reviewed:** `diagonally-blueprint.html`, `project-history-and-lessons.md`, MEMORY.md and linked memory files, existing agent reviews

---

## A. What Went Wrong (Documentation & Process Perspective)

### 1. The Blueprint became a monument, not a living document

The Blueprint's "Latest Update" box says **April 13, 2026** and celebrates the "MASSIVE INTRINSIC REBUILD" of 87 games. But by April 14, the project had pivoted away from those 87 games entirely. The current approach is: one moon at a time, Learning Contracts, plain HTML/CSS/JS (not Phaser), Number Frames as the first verified engine. The Blueprint still describes 24 Phaser engines, 81 game options, and a Phaser shared base as if they are the active architecture. A new team member or agent reading the Blueprint today would build the wrong thing.

**Specific contradictions found:**
- Blueprint Section 7 details 24 Phaser engines and 81 game options as active. `project-history-and-lessons.md` Section 5 says "Legacy games unmapped. The old 87 games exist in code (for reference) but are hidden from learners."
- Blueprint says "81 game options across 24 engines" in at least 6 places. The history doc says we need ~22 games total, and only 2 standards are verified.
- Blueprint's Math Alignment section proudly claims "428/466 moons (92%) have PERFECT matches." The history doc admits only 2 standards (K.OA.A.1 and K.OA.A.3) are actually verified.
- Blueprint says "Plain HTML/CSS/JS for new games (not Phaser)" only in the history doc, never in the main Blueprint sections about engines.
- The "Completed Recently" list (Section 11) includes items that are now considered part of the failed approach (all 24 engines, 81 options, intrinsic rebuild).

### 2. Three audit results exist simultaneously and contradict each other

The Blueprint contains THREE separate intrinsic audit sections layered on top of each other:
1. "Strict Edition" (April 13 night): 11 truly intrinsic (13%)
2. "Deep Re-audit" (April 13 overnight): 20 truly intrinsic (23%)
3. "Final Status" (April 14 post-rebuild): 73 truly intrinsic (84%)

Each subsequent audit paints a more optimistic picture. But the history document then says the whole approach was abandoned. An agent reading the Blueprint would see the "84% truly intrinsic" number and assume the games are ready. They are not. No one went back and marked these sections as superseded.

### 3. Decisions were made without recording reasoning in the Blueprint

The decision to switch from Phaser to plain HTML/CSS/JS is recorded in `project-history-and-lessons.md` but NOT in the Blueprint's engine architecture section. The reasoning (lighter, cleaner, Brilliant-inspired) is mentioned once in passing.

The decision to stop at ~22 games instead of 87 appears in the history doc (Insight 6) but the Blueprint still lists all 87 game option specs in full detail, with no indication they are deprecated.

The Learning Contract workflow is described in the Blueprint (Section 13) and the history doc, but there is no record of WHY specific fields were chosen, what alternatives were considered, or what the first contract (K.OA.A.1) revealed during testing.

### 4. Context was lost between sessions

From the MEMORY.md: Barbara lost important context between sessions (referenced in `feedback_session_saves.md`). The system now has a rule to "Always save session context before ending." But this is reactive — it patches the symptom (lost context) without fixing the cause (no structured handoff protocol).

The project.md memory file is dated April 10 and describes "NEXT: 19 Pre-built Game Engines" as the current state. That was 5 days and multiple pivots ago. Memory files decay unless actively maintained.

### 5. The Change Log stopped being useful

The Change Log (Section 20) has 18 entries, all from April 9-14. Each entry is a wall of text listing dozens of changes. There is no categorization (bug fix vs. feature vs. pivot), no severity marking, and no link to reasoning. The April 14 overnight entry is 15 lines of dense text mixing trivial TypeScript changes with fundamental architectural decisions.

### 6. No failed-approach archive exists

The Historian's instructions specify maintaining a `docs/archive/failed-approaches/` folder. This folder does not exist. The history document captures the 7 failure modes narratively, but there is no structured record per failed approach that agents could query before repeating a mistake.

---

## B. What COULD Still Go Wrong

### 1. An agent reads the Blueprint and builds a Phaser engine

This is the single most likely failure. The Blueprint dedicates ~700 lines to describing the Phaser engine architecture, all 81 game options with detailed specs (gameplay, feel, difficulty scaling, key Phaser features), and the shared base template. An agent given a task like "build a game for K.OA.A.3" would reasonably look at the Blueprint, see the detailed engine specs, and build a Phaser-based game. The correct approach (Learning Contract -> plain HTML/CSS/JS -> Number Frames parameters) is buried in a different document.

### 2. Barbara or an agent can't remember WHY we chose one source per standard

The decision to use ONE primary source (not cross-reference) is recorded, but the painful experience that led to it (confusion from mixing Montessori + Singapore + Progressions) is only in the history doc. If a new agent or team member suggests "let's check three sources for completeness," there's no quick-reference entry in the Blueprint explaining why that was already tried and failed.

### 3. The 92% coverage number gets cited in a pitch or demo

The Blueprint prominently displays "428/466 moons (92%) have PERFECT matches." This number refers to the OLD keyword/domain-based mapping that was the first failure mode. If Barbara references this in a fellowship presentation, it misrepresents the actual state (2 verified standards out of 466, or 0.4% coverage).

### 4. Hardcoded rounds from the old system get reused without validation

`standard-rounds.ts` contains hardcoded rounds for K-5 (~255 standards). These were written for the old engine system. If an agent building a new Learning Contract reuses them without checking, they may not match the new game mechanic design (e.g., the rounds may assume Phaser-style interaction, not Number Frames-style interaction).

### 5. The Pending and Eventually lists become stale

The Pending list (Section 17) contains 14 items. Several reference the old architecture: "Redesign 20 quiz-wrapper game options," "Improve 13 hybrid game options," "Rapid Fire Practice Games." These are artifacts of the 87-game approach. If they stay on the list, an agent could pick one up and start working on it.

### 6. Cost tracking never gets implemented

The Historian's responsibilities include Firebase event logging and cost tracking. None of this appears to be implemented. At scale (1000+ learners), AI costs could grow unpredictably. Without logging, there's no way to detect cost spikes or optimize.

### 7. No learner activity logging means no way to detect if games actually teach

The dream depends on games that teach math. Without logging learner attempts, success rates, time-to-completion, retry patterns, and cross-game performance, there's no data to validate whether the games work. Barbara's manual testing is the only quality signal right now. That doesn't scale.

---

## C. Suggestions for Fixes

### 1. Restructure the Blueprint into "Active" and "Archive" sections

**Active sections** (what we're building NOW):
- Glossary (keep, but mark deprecated terms)
- Learning Contract template and workflow
- Number Frames engine spec (the reference implementation)
- Active contracts list with status
- Coverage dashboard (2/466 verified)
- Pending and Eventually lists (cleaned)
- Tech stack (updated: plain HTML/CSS/JS, not Phaser)
- Data model
- Learning Science principles
- Change Log

**Archive sections** (clearly labeled "LEGACY - NOT ACTIVE"):
- All 24 Phaser engine descriptions
- All 81 game option specs
- The old intrinsic audit results
- The old Math Alignment coverage numbers
- The Mechanic-to-Standards mapping table

Each archived section should have a one-line note: "Superseded on [date] by [what]. See [document] for why."

### 2. Add a "Current State" box at the very top

Right below the title, before anything else:

```
CURRENT STATE (April 15, 2026):
- Approach: Learning Contract workflow, one moon at a time
- Engine: Plain HTML/CSS/JS (NOT Phaser)
- Verified standards: 2 of 466 (K.OA.A.1, K.OA.A.3)
- Reference game: Number Frames
- Next: K.OA.A.3 testing, then more K moons
- Legacy: 87 Phaser-based games exist but are hidden from learners
```

This prevents any agent from misunderstanding what "active" means.

### 3. Create the failed-approaches archive

Each entry should be a short markdown file:

```
docs/archive/failed-approaches/
  2026-04-13-overnight-87-rebuild.md
  2026-04-12-keyword-matching.md
  2026-04-13-ai-invented-mechanics.md
  2026-04-13-cross-referencing-sources.md
  2026-04-13-equations-as-k-prompts.md
```

Each file: Date, What we tried, What happened, Why it failed, What we do instead. One page max.

### 4. Add a "Decisions Register" to the Blueprint

A simple table:

| # | Decision | Date | Why | Alternative considered | Recorded in |
|---|----------|------|-----|----------------------|-------------|
| 1 | Plain HTML/CSS/JS, not Phaser | Apr 14 | Lighter, cleaner, Brilliant-inspired | Phaser (too heavy, too much arcade juice) | history doc S6 |
| 2 | One source per standard | Apr 14 | Cross-referencing caused confusion | Multiple sources per standard | history doc S3 |
| 3 | ~22 games, not 87 | Apr 14 | Quality over quantity; one game = many standards | 87 game options | history doc Insight 6 |

This gives any agent a quick-reference for why things are the way they are.

### 5. Clean the Pending and Eventually lists

Remove items that reference the deprecated Phaser/87-game approach. Add items that reflect the actual current workflow (e.g., "Complete K.OA.A.3 Learning Contract," "Build K.OA.A.3 Number Frames mode," "Test with Barbara").

### 6. Implement a Blueprint update protocol

After every decision or session:
1. Update the "Current State" box
2. Add a Change Log entry (categorized: DECISION / BUG FIX / FEATURE / PIVOT)
3. Check for contradictions with existing sections
4. If a section is now outdated, move it to Archive with a superseded note
5. Update the Decisions Register if a new decision was made

This is what the Historian agent should do after every session. Currently, the Blueprint update rule exists in the Historian's instructions but is not being followed.

### 7. Reconcile the memory files

The project.md memory file is 5 days stale. It should be updated to reflect the Learning Contract approach, the pivot away from Phaser, and the current verified standards count.

---

## D. Ideas for the Dream

The dream: "A platform where learners learn a math concept, build a game that teaches that math concept, and play other learners' games to solidify that concept."

### 1. Learner activity logging schema

Every meaningful learner action should be logged to Firestore (collection: `learner_events`):

```
{
  type: "game_play" | "game_build" | "game_submit" | "hint_used" | "game_approved" | "game_rejected" | "mastery_achieved",
  timestamp: Date,
  learnerId: string,
  standardId: string,
  gameId: string | null,
  gameOwnerId: string | null,  // whose game they played
  duration: number,            // ms
  rounds: {
    total: number,
    correct: number,
    wrongAnswers: number,
    avgTimePerRound: number,   // ms
  },
  outcome: "win" | "lose" | "abandon",
  hintCardUsed: boolean,
  attemptNumber: number,       // nth attempt on this standard
}
```

### 2. Analytics that matter for the dream

**Per-learner signals:**
- Time from first attempt to mastery per standard (learning velocity)
- Number of attempts before first win (difficulty calibration)
- Standards where the learner plays others' games but still fails (concept gap, not just game familiarity)
- Abandonment rate per standard (frustration signal)
- Hint card usage rate (struggle signal)

**Per-game signals:**
- Win rate across all players (if too high: too easy; if too low: too hard or confusing)
- Average time to complete (calibration)
- Rounds where most players fail (identifies which specific sub-skill is hard)
- "Fun" proxy: do players who have already mastered this standard voluntarily replay?

**Per-standard signals:**
- Average attempts to mastery across all learners (standard difficulty ranking)
- Which game options produce fastest mastery (identifies best teaching mechanic)
- Transfer: after mastering standard X, how quickly do learners master prerequisite-dependent standard Y?

**Platform health signals:**
- Games built per day / per learner
- Games approved vs. rejected ratio
- Guide review turnaround time
- Standards with zero games available

### 3. What "institutional memory" looks like for an educational platform

For Diagonally, institutional memory serves three audiences:

**For agents:** The Blueprint must be the single source of truth. An agent should be able to read the Blueprint and know: what to build, how to build it, what NOT to build, and why. The failed-approaches archive prevents repeating mistakes. The Decisions Register prevents relitigating settled questions.

**For Barbara and the team:** The history document captures the narrative: what happened, what we learned, where we're going. The Change Log tracks what changed and when. Session summaries prevent context loss between conversations.

**For the platform itself:** Learner activity data IS institutional memory. Over time, the platform should know: which game mechanics teach which concepts most effectively, which standards are hardest, which learner patterns predict struggle, and which games are most engaging. This data should feed back into game design decisions, difficulty calibration, and content prioritization.

### 4. A feedback loop between learner data and game design

The dream includes learners building games. The platform should track:
- When learner-built games (pasted HTML) are played by others, do those players learn the concept? (Compare mastery rates for learner-built vs. platform-built games)
- Which learner-built games get the highest play counts and win rates?
- Can we identify patterns in successful learner-built games that could inform platform game design?

This creates a virtuous cycle: learners build games, data reveals what works, that knowledge improves the platform's own games, which inspires better learner-built games.

### 5. Coverage dashboard as a living metric

The Historian should maintain a real-time coverage dashboard:

```
Total standards:                466
With Learning Contracts:          1 (K.OA.A.1)
With verified games:              2 (K.OA.A.1, K.OA.A.3)
Barbara-approved:                 1 (K.OA.A.1)
With hardcoded rounds:            2
With learner activity data:       0
Next standard to build:     K.OA.A.3 (awaiting test)
Overall coverage:              0.4%
```

This is honest. It replaces the misleading "92% PERFECT" number with something that reflects actual verified quality.

---

## Summary of Highest-Priority Actions

1. **Add a "Current State" box to the top of the Blueprint** — prevents agents from building the wrong thing. Do this today.
2. **Mark legacy sections as LEGACY/ARCHIVE** — the 700+ lines of Phaser engine specs are actively misleading. Label them clearly.
3. **Create the Decisions Register** — 10 minutes of work, prevents hours of relitigated arguments.
4. **Clean the Pending list** — remove items from the old approach, add items for the current workflow.
5. **Update project.md memory** — it's 5 days stale and describes a state that no longer exists.
6. **Implement learner event logging** — no data means no way to know if games teach. Start with the schema above.

---

*Report filed by The Historian. Blueprint update pending — awaiting Barbara's review of these recommendations before modifying the Blueprint directly.*
