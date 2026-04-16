# The Critic -- Game Quality Review

**Date:** April 15, 2026
**Role:** Game Quality Judge
**Documents reviewed:** project-history-and-lessons.md, diagonally-blueprint.html, the-critic.md

---

## A. What Went Wrong (Game Quality Perspective)

### Pattern 1: Fake Intrinsic -- The Most Dangerous Failure

The single worst quality failure was the "fake intrinsic" pattern. Games LOOKED physical and interactive but the player's action did not map to the mathematical operation.

**Specific example:** mystery-side v1 (6.EE.B.7 -- solving equations). The game had a scale. The learner dragged unit weights onto a pan until it balanced. This LOOKS like algebra. It is counting. A first-grader could play it successfully by counting to a target number. The actual skill -- applying inverse operations to both sides of an equation -- was nowhere in the interaction.

**Why this is worse than a quiz-wrapper:** A quiz-wrapper is honest. Everyone knows it is a quiz. A fake intrinsic game creates the illusion of learning. The teacher sees a child dragging weights and thinks algebra is happening. The child feels like they are doing something sophisticated. Neither is true. This is pedagogical fraud.

**Other confirmed fake intrinsic games (7 total):** free-balance, mystery-side v1, chain-scales, free-collect, conveyor-belt, split-the-loot, stack-to-target. All used physical interaction (drag, click, tap) that reduced to counting or selection -- grade-1 skills dressed up as higher-grade concepts.

### Pattern 2: Quiz-Wrappers Dominated the Library

The strict audit found 47 of 87 game options (54%) were quiz-wrappers. The math appeared as a text question. The game mechanic was decoration. You could replace the entire game with a multiple-choice worksheet and the learning would be identical.

**Example:** Speed Trap asks the player to watch an object pass checkpoints, then TYPE the speed. The watching is passive. The typing is a text input. This is a word problem with an animation in front of it.

**Example:** Find the Stat shows a dataset and asks the player to identify the mode, median, or mean. This is literally a quiz question with cards instead of paper.

### Pattern 3: The System Did the Math

Multiple games displayed running totals, animated counting, or live sums as the learner clicked. The learner's job was reduced to tapping. The system performed the actual mathematical operation.

**Specific example:** Collect & Manage games showed a running total as items were clicked. The learner could tap and watch the number climb toward the target. No mental addition required. The UI did the addition.

### Pattern 4: Brute Force Was Possible

The number pad showed 5 options. Wrong answers faded out. A learner could tap randomly, eliminating options until the correct one remained. Zero math required. This is a direct Criterion 3 failure -- you do NOT need to know the math to win.

### Pattern 5: Wrong Math Entirely

A ratio moon (6.RP.A.1) got a Box Packer game that tested volume. A K.OA.A.1 game generated round prompts about "3 apples for every 2 oranges" -- ratio language for a kindergarten addition standard. The per-standard mapping used keyword matching, which is fundamentally broken because keywords overlap across domains.

### Pattern 6: Theme Fighting the Math

"Desert Athlete in Scorching Desert" showed a scale with blocks. The theme (desert, athlete) had zero connection to the mechanic (balance, weights). This does not violate the 3 criteria directly, but it creates cognitive dissonance that undermines the learning experience. The learner is trying to make sense of why an athlete in a desert is weighing blocks.

### Summary Scorecard (Pre-Rebuild)

| Classification | Count | % |
|---|---|---|
| Truly Intrinsic | 11 | 13% |
| Fake Intrinsic | 7 | 8% |
| Quiz-Wrapper | 47 | 54% |
| Practice-Only (by design) | 6 | 7% |
| Uncertain | 16 | 18% |

**Only 13% of games passed the strict intrinsic test.** For a platform whose entire value proposition is "math IS the gameplay," this was a crisis.

---

## B. What COULD Still Go Wrong

Even with the Learning Contract workflow, Number Frames, and the new approach, here are the quality risks I see:

### Risk 1: The Rebuild Was Done by Parallel Agents Overnight -- And Was Not Tested

The blueprint proudly states "56 games fully rebuilt" on April 14. The project history states that the parallel agent approach "produced code that compiled but wasn't tested against real learner experience." These two facts are in direct contradiction. The 56 rebuilt games were produced by the SAME methodology that the project history identifies as a failure mode (Failure 7, Attempt 1).

**Criterion risk:** All three criteria are at risk for the 56 rebuilt games. Code that compiles is not code that teaches.

**Current verified count:** Only K.OA.A.1 has been Barbara-tested and approved. That means 1 out of 466 standards is verified. The 56 "rebuilt" games are unverified claims.

### Risk 2: Hardcoded Rounds Can Still Miss the Standard

The new approach uses 5 hardcoded rounds per standard instead of AI-generated rounds. This is better. But who wrote those hardcoded rounds? If agents wrote them, the same "agents can write code but can't judge pedagogy" problem applies. Each set of 5 rounds needs human verification that every single round tests the exact standard, at the exact grade-appropriate difficulty, using the exact representation the Learning Contract specifies (e.g., dot clusters not digits for K).

**Criterion risk:** Criterion 1 (real-world application) and Criterion 2 (math IS gameplay) if rounds test adjacent skills instead of the target skill.

### Risk 3: The "One Game = Many Standards" Assumption Is Untested

The blueprint claims Number Frames can cover ~18 standards by changing parameters. This is a strong claim. Changing the number range from 1-5 to 1-20 does not automatically mean the game teaches a different standard. The interaction pattern, the representation, the error feedback -- all may need to change between standards. K.OA.A.1 (represent addition) and K.OA.A.2 (solve addition word problems) are different skills even though both involve addition with small numbers.

**Criterion risk:** Criterion 2 -- the math IS the gameplay may hold for the primary standard but degrade as the same game is stretched across 17 adjacent standards.

### Risk 4: No Automated Quality Gate Exists

The Learning Contract is a document. Barbara is the test gate. This does not scale. When the team moves to grade 1, grade 2, grade 3 and beyond, Barbara cannot personally play every game for every standard. The blueprint mentions 466 Learning Contracts x 14 steps each as an open question. There is no automated system that enforces the 3 criteria.

**Criterion risk:** All three criteria degrade as scale increases and human review becomes the bottleneck.

### Risk 5: The Learner-Built Game Path Has No Quality Mechanism

The "paste your own HTML" feature lets learners paste Gemini-generated games. The blueprint mentions "AI judge (3 criteria) + peer review + guide approval" but none of this is built. A learner could paste a quiz-wrapper from Gemini and submit it. The guide may not know what intrinsic integration means. Peer reviewers are 10-year-olds.

**Criterion risk:** The entire Game Library could fill with quiz-wrappers from Gemini, drowning the verified games.

### Risk 6: The 38 HS Standards Have No Path

38 high school standards are marked "waiting on engineer input." No timeline. No fallback. These standards exist in the galaxy as moons learners can see but cannot play. If a high school learner clicks one and finds nothing, trust in the platform erodes.

### Risk 7: Concrete-Before-Symbolic May Not Be Enforced Across All Games

The K.OA.A.1 implementation correctly uses dot clusters before digits. But the 56 overnight-rebuilt games were built BEFORE this principle was established (or at least before it was codified in the Learning Contract). Do all K-2 rebuilt games use concrete representations? Or do some still show equations as prompts?

### Risk 8: Self-Revealing Truth Is Hard to Build

The requirement that "correctness is shown by game-world physics, not a popup" is extremely demanding. A scale tipping is self-revealing. But what about category-sort? How does dropping an object into a bin reveal correctness through physics? If the bin glows green, that is a popup judgment with better graphics. Most of the 56 "rebuilt" games likely still use color-change feedback (green = correct) rather than true self-revealing physics.

---

## C. Suggestions for Fixes

### Fix 1: Stop Counting the 56 Rebuilt Games as Done

They are not done. They are drafts. Reclassify them as "rebuilt, awaiting test." Only games that pass Barbara's play-test AND the Learning Contract's 14 steps should be marked as verified. The blueprint's "MASSIVE INTRINSIC REBUILD COMPLETE" banner is premature.

### Fix 2: Build a Checklist-Based Quality Gate

Before any game is marked "verified," it must pass ALL of these checks:

**Criterion 1 check (real-world scenario):**
- [ ] The scenario describes a situation where a real person would use this math
- [ ] The scenario is not fantasy/abstract ("defeat the wizard")
- [ ] A non-math person would agree this is how that math is used

**Criterion 2 check (math IS gameplay):**
- [ ] Describe the gameplay without mentioning math. If you can, FAIL.
- [ ] Remove the math. Does the game still exist? If yes, FAIL.
- [ ] Is the math a popup/overlay interrupting other gameplay? If yes, FAIL.
- [ ] Does the player's physical action map to the mathematical operation? If not, FAIL.

**Criterion 3 check (must know math to win):**
- [ ] Can a random-clicker win? Test by clicking randomly for 2 minutes.
- [ ] Can a pattern-matcher win? Look for visual shortcuts.
- [ ] Can a trial-and-error player win? Try all options systematically.
- [ ] Does wrong-answer feedback preserve difficulty (shake, not fade)?

**Mr. Chesure's tests:**
- [ ] Discovery: Can someone who does NOT know this math learn it by playing?
- [ ] Self-Revealing Truth: Is correctness shown by game physics, not a judgment popup?

**Fake-intrinsic detector:**
- [ ] Does the player's action map to the ACTUAL mathematical operation for this grade level? (Not counting when the standard is algebra. Not matching when the standard is comparison.)
- [ ] Does the system count or compute on behalf of the learner at any point?
- [ ] Are numbers displayed on objects in a way that allows visual matching without mathematical thinking?

### Fix 3: Build the Evaluation Pipeline for Learner-Submitted Games

This is critical for the dream. The pipeline should be:

1. **Automated structural check** -- Does the game have interactive elements? Does it have a win condition? Does it load? Does it have math content?
2. **AI judge (3 criteria)** -- Claude reviews the game HTML against the 3 criteria for the specific standard. Produces a PASS/FAIL per criterion with reasoning.
3. **Red-flag detection** -- Does the game show text questions with answer selection? (quiz-wrapper flag). Does it have running totals displayed during play? (system-does-math flag). Can you win by clicking the same spot repeatedly? (brute-force flag).
4. **Guide review** -- Guide plays the game. Sees the AI judge's report. Approves or sends back with specific feedback referencing the criteria.
5. **Peer play** -- Three other learners play and rate. Not for quality gate purposes (kids cannot judge pedagogy), but for engagement and fun feedback.

### Fix 4: Create a "Model Game" Gallery

For each game type that has been verified, create an annotated example showing WHY it passes each criterion. When agents build new games, they reference these models. When learners build games, they see these as inspiration. Currently the only model is K.OA.A.1 Number Frames. You need at least one model per game type (fractions, geometry, algebra, statistics, etc.) before scaling.

### Fix 5: Test Every Rebuilt Game Against Its Standard's Learning Contract

Go back to the 56 rebuilt games. For each one, fill out the Learning Contract. If the game does not match what the contract says it should do, the game is wrong, not the contract. This is the slow path. It is the only path that works.

---

## D. Ideas for the Dream -- Learners Building Games

This is where Diagonally either becomes transformative or becomes another game platform. The dream is that a 10-year-old builds a game that teaches math to other 10-year-olds. Here is how to make that work without sacrificing the 3 criteria.

### The Core Problem

A 10-year-old does not know what intrinsic integration is. They do not know the difference between a quiz-wrapper and a genuinely intrinsic game. If you give them Gemini and say "make a math game about fractions," they will make a quiz-wrapper every single time. "Answer the fraction question to save the princess" is the default mental model of what a "math game" is.

### Idea 1: The Builder IS the Learning

Do not let the learner build a game from scratch. Instead, make the building process a structured experience that teaches both the math AND game design principles.

**Step 1: Play a verified game.** The learner plays the platform's verified game for that standard. They experience what intrinsic integration feels like.

**Step 2: Identify the math-gameplay connection.** Ask: "In that game, what did your hands do? What math were you doing while your hands did that?" The learner must articulate the connection. This is metacognition -- thinking about their own learning.

**Step 3: Design a new scenario.** The learner picks a real-world scenario where the same math applies. They do not change the mechanic. They change the context. "Instead of filling a number frame, you are loading crates onto a truck." The math stays the same. The story changes.

**Step 4: Customize within constraints.** The learner picks visuals, writes the story, sets the difficulty. But the MECHANIC is locked to the verified engine. They cannot build a quiz-wrapper because the engine does not allow quiz-wrapper interactions.

**Step 5: Test and submit.** The learner plays their own game. The 3-criteria check runs. Guide reviews.

This approach means the "build a game" process is really "redesign a scenario for a verified mechanic." The learner is creative within safe constraints. The math integrity is maintained by the engine.

### Idea 2: The Criteria Checklist as a Learning Tool

Show learners the 3 criteria in kid-friendly language:

1. **"Would someone really do this math in real life?"** -- Real-world check
2. **"Is the math the main thing you DO, or just a question you answer?"** -- Intrinsic check
3. **"Could someone who does not know the math still win by guessing?"** -- Knowledge check

When a learner submits a game, they self-evaluate against these three questions. When they review a peer's game, they evaluate using the same three questions. This teaches critical thinking about educational games -- a skill that is arguably as valuable as the math itself.

### Idea 3: Tiered Builder Permissions

- **Level 1 (new learner):** Can only customize theme (sprites, story, colors) on verified engines. Mechanic is locked. This is the current Circuit Board Builder.
- **Level 2 (demonstrated 5+ standards):** Can adjust parameters (number ranges, difficulty curves, number of rounds). Must still use verified engines.
- **Level 3 (demonstrated 15+ standards):** Can use the HTML Modding Lab. Can edit CSS/HTML but not script blocks. Visual customization only.
- **Level 4 (mastered 25+ standards):** Can paste external HTML games (from Gemini or hand-built). Goes through the full evaluation pipeline (AI judge + guide review).

This progression means only learners who have EXPERIENCED enough good games earn the right to build unconstrained games. By the time they reach Level 4, they have internalized what good math games look like.

### Idea 4: The "Break My Game" Challenge

After a learner submits a game, other learners try to BREAK it against the 3 criteria:
- "I won without doing math" (Criterion 3 violation)
- "The math is not the main thing" (Criterion 2 violation)
- "Nobody would do this math in real life" (Criterion 1 violation)

If a reviewer successfully demonstrates a violation (e.g., wins by random clicking), the game goes back for revision. The original builder learns WHY their game failed. The reviewer earns tokens for quality-catching. This is peer review that teaches both parties.

### Idea 5: Make the Building Process Match the Math

The most powerful version of the dream is when building the game IS doing the math. Example for fractions: the learner must divide the game screen into equal sections to create the play area. They literally use fractions to build the layout. The game-building interface forces the target skill.

This is extremely hard to implement but represents the true north star -- the building IS the learning, not just a creative wrapper around it.

### What Will NOT Work

- **Giving learners a blank canvas and hoping for quality.** They will make quiz-wrappers.
- **Relying on guides to catch bad games.** Most teachers do not know what intrinsic integration is either.
- **Using AI to judge games without human review.** AI can flag structural issues (quiz-wrapper patterns, brute-force vulnerability) but cannot judge whether a game teaches the right skill at the right level.
- **Letting peer review replace expert review.** 10-year-olds rate games on fun, not pedagogy. Their reviews are valuable for engagement data, not quality assurance.

---

## Summary Verdict

**Current state (honest):** 1 verified game out of 466 standards. 56 unverified rebuilds. A solid Learning Contract framework that has not yet been tested at scale. Good principles discovered through painful failure. No automated quality gate.

**Biggest risk:** Declaring victory on the overnight rebuild and moving forward with 56 untested games in the library. The history shows this exact pattern: build fast, declare done, discover fundamental problems when Barbara tests.

**Strongest asset:** The 7 failure modes are well-documented and genuinely understood. The team knows what bad looks like. The Learning Contract is the right framework. The decision to go one moon at a time is correct.

**My recommendation:** Treat the current state as "foundations laid, nothing shipped." Every game that reaches a learner must pass the full quality gate. No exceptions. No shortcuts. The dream depends on it.
