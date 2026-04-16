# Mr. Chesure's Pedagogy Review

**Agent:** Mr. Chesure -- Pedagogy Guardian
**Date:** April 15, 2026
**Scope:** Full project history, blueprint, and current approach
**Verdict:** The team has learned the right lessons. The foundation is now sound. But the hardest pedagogical work is ahead, not behind.

---

## A. What Went Wrong (Pedagogy Perspective)

### A1. The original sin: coverage before correctness

The team built 87 game options across 25 engines before verifying that a SINGLE game actually taught its math standard. This is backwards. In curriculum design, you validate one lesson exhaustively before scaling. The overnight 87-game rebuild (April 13-14) is the predictable consequence: parallel agents produced code that compiled but could not pass a pedagogical smell test.

**Root cause:** The project optimized for the demo ("look at our 466 moons with games!") instead of the learner ("does this one game actually teach addition?"). This is a common startup trap -- breadth impresses investors, depth serves learners, and the two are in tension.

### A2. Confusing interaction with instruction

The mystery-side v1 failure is the most important pedagogical lesson in this project's history. A learner dragging unit weights onto a scale LOOKS like algebra. It FEELS intrinsic. Barbara had to ask the hard question -- "How does this teach algebra?" -- and the answer was: it does not. The learner was counting to a target. That is K.CC.B.5 dressed up as 6.EE.B.7.

This is not a one-off mistake. The project history reveals it happened systematically:
- **free-collect:** Clicking items to hit a sum = selecting, not adding
- **stack-to-target:** Clicking blocks to reach a height = counting, not measuring
- **conveyor-belt:** Grabbing items on a belt = selecting under time pressure, not computing

The pattern: dragging/clicking/tapping OBJECTS feels mathematical to designers but the learner is performing a SELECTION action, not a MATHEMATICAL OPERATION. The physical action must map to the mathematical operation. Dragging a weight is not the same as applying an inverse operation.

### A3. The system did the math

Multiple games displayed running totals as the learner clicked. This is pedagogically devastating for early grades. Per the Common Core Progressions Document (K-2), the entire point of addition at the K level is that the learner COUNTS -- the counting IS the math. When the system counts for them, the learner is reduced to a clicker.

The related error: showing equations as prompts to K students ("2 + 1 = ?"). This violates CPA sequencing. At the concrete stage, learners should see OBJECTS, not symbols. The equation is a recording of what the learner did, not an instruction for what to do. The K.OA.A.1 contract now correctly uses dot clusters, but this error likely persists in the 56 "rebuilt" games that have not gone through a Learning Contract.

### A4. AI-generated rounds were pedagogically uncontrolled

A game for K.OA.A.1 (addition with objects) generated round prompts about "3 apples for every 2 oranges" -- ratio language. The AI prompt was not specific enough, and AI models generate "generic math" unless heavily constrained. The team moved to hardcoded rounds for verified standards, which is correct -- but only 2 standards (K.OA.A.1 and K.OA.A.3) currently have hardcoded rounds. The other 464 standards still rely on AI generation.

### A5. Theme layer as pedagogical noise

The "Desert Athlete in Scorching Desert" playing a scale balance game is a textbook example of extraneous cognitive load (Sweller, 1988). Theming a math game with an unrelated narrative actively HURTS learning by splitting attention between the story context and the mathematical context. Habgood & Ainsworth (2011) specifically found that extrinsic decoration produces no learning gains over worksheets.

The decision to mute the theme layer was correct. The decision to eventually re-enable it needs careful thought (see Section B).

### A6. No CPA progression within games

The blueprint references CPA (Concrete, Pictorial, Abstract) extensively, but the games themselves implement only ONE stage. The ten-frame game for K.OA.A.1 is concrete. The hint card is abstract. There is no pictorial bridge. Research (Bruner 1966, confirmed 2025) says learners should be able to move BETWEEN stages, not be locked into one. A learner who masters the concrete stage has no in-game path to the pictorial or abstract representation.

---

## B. What COULD Still Go Wrong

### B1. The 56 "rebuilt" games have NOT been validated

The blueprint proudly reports "56 games fully rebuilt" in the overnight session. But the project history itself contains the lesson: "Parallel agents can write code but can't judge pedagogy." These 56 games were rebuilt by agents, not validated by Barbara or by a Learning Contract process. The blueprint even states only 2 standards have completed contracts (K.OA.A.1 and K.OA.A.3).

**Risk:** The team believes it has 73 truly intrinsic games. It likely has 2 validated ones and 71 untested ones. The overnight rebuild may have produced a second generation of "fake intrinsic" games that look better on paper but have not been tested with a learner.

**My rating: HIGH risk.** This is the single biggest pedagogical risk in the project right now.

### B2. The "learn, build, play" loop has a pedagogy gap

The DREAM says: learners learn a concept, build a game that teaches it, play others' games. But the current build flow is:

1. Click moon
2. Pick from pre-built game options
3. Pick sprites (cosmetic)
4. AI generates themed names
5. Play

The learner is NOT building a game that teaches math. They are selecting from a menu of pre-built engines and applying a skin. The mathematical design decisions -- what interaction maps to what operation, what numbers to use, what constitutes a correct answer -- are all made by the system.

**Risk:** The platform's unique value proposition ("learners teach each other through game creation") is not actually happening. The learner is a customer of the game system, not a designer. The "build" step is cosmetic, not pedagogical.

### B3. Scaling Learning Contracts is a bottleneck

466 standards x 14 steps each = 6,524 research-backed decisions. At the current pace (2 standards completed in ~2 days), completing all contracts would take approximately 466 days. Even if agents can draft contracts reliably, Barbara must review each one. She is one person.

**Risk:** The quality-over-quantity approach is correct but may not reach critical mass before the fellowship pilot needs real content.

### B4. The number pad still enables shortcut thinking

Even with the improved number pad (wrong answers shake instead of fading, pad hides on wrong answer, counters reset), the fundamental issue remains: selecting from 5 options is a RECOGNITION task, not a PRODUCTION task. A learner who cannot produce "7" from counting can still recognize "7" as the right option from a set of 5. This is well-established in cognitive psychology -- recognition is easier than recall.

For K-2, a more rigorous approach would be to have the learner TAP each counter and then TYPE or SPEAK the total, not select from options. The current approach is a compromise with UX, and it is an acceptable one at K level where motor skills limit typing -- but it should be noted as a known pedagogical weakness.

### B5. The "mastery" flow tests game-playing, not math understanding

Current mastery flow: win own game 3x, then win 3 games by other learners. But if all games for a standard use the same engine with the same mechanic, the learner is demonstrating mastery of ONE GAME INTERACTION, not mastery of the mathematical concept across representations.

Research on transfer (Bransford et al., 2000) shows that mathematical understanding is demonstrated when learners can apply a concept in a NOVEL context. Playing three versions of the same ten-frame game with different sprites is not a novel context.

### B6. High school standards may not have intrinsic game forms

The project openly acknowledges 38 HS standards as gaps. But the problem is deeper: many high school math concepts (limits, proofs, abstract algebra) may not have natural intrinsic game representations. The blueprint says "waiting on engineer input" -- but engineering applications of math are not the same as intrinsic game mechanics. Calculating beam loads uses trigonometry, but a beam-loading simulation is still a "use math to solve problem" game, not a "discover math through play" game.

**Risk:** The project may need to accept that some standards cannot fulfill the three criteria, and design an alternative learning path for them.

### B7. The theme layer will reintroduce cognitive load

The theme layer is "muted for now" but planned to return. When it does, every theme must be checked for pedagogical coherence. A desert theme on a fraction game is not just ugly -- it is actively harmful because it forces the learner to reconcile two unrelated mental models (desert survival + fraction partitioning). The theme should REINFORCE the math, not distract from it.

**Example of good theming:** A pizza theme on share-the-pizza (fractions). The theme IS the math context.
**Example of bad theming:** A space theme on a ten-frame (addition). Space has nothing to do with combining groups.

### B8. The "paste your own HTML" feature is a pedagogical wildcard

The blueprint mentions learners pasting AI-generated games (from Gemini). These games bypass the entire quality control pipeline: no Learning Contract, no Mr. Chesure review, no intrinsic integration guarantee. They go through an "AI judge" for the 3 criteria + peer review + guide approval. But can a guide reliably evaluate whether a pasted game actually teaches the math? Most teachers cannot -- this requires deep pedagogical content knowledge.

**Risk:** Pasted games become the dominant content, and quality regresses to quiz-wrappers with pretty graphics.

---

## C. Suggestions for Fixes

### C1. Stop claiming 73 intrinsic games. You have 2.

Rename the categories honestly:
- **Validated:** Games with completed Learning Contracts, Barbara-tested (currently 2)
- **Rebuilt:** Games redesigned by agents, awaiting validation (currently ~71)
- **Legacy:** Everything else

Do NOT count rebuilt games as "truly intrinsic" until a human has played them and confirmed they pass both tests. Update the blueprint to reflect this.

### C2. Validate 5 more games this week, not 50

Pick the 5 most commonly needed standards (suggestion: K.OA.A.2, K.OA.A.5, K.CC.B.4, K.CC.B.5, 1.OA.A.1). Write Learning Contracts for each. Barbara tests each. Ship only what passes.

This gives you 7 verified games -- enough for the fellowship pilot with K students. Do not try to validate all 466 by then.

### C3. Make the Learning Contract the GATE, not the DOCUMENTATION

Currently, contracts are written AFTER games are designed. Flip it: no game code is written or modified until the contract is complete and Barbara-approved. The contract should be the specification, not the post-hoc justification.

Enforce this in the agent workflow: Mr. Chesure must PASS the contract before any other agent touches code.

### C4. Add a CPA progression WITHIN each game

For each game, design three modes:
1. **Concrete:** Manipulate objects (current ten-frame approach)
2. **Pictorial:** See dot arrangements, drag grouped representations
3. **Abstract:** See equations, solve symbolically

The learner progresses through these within the same game, not across different tools. This is what Math Learning Center apps do: Number Frames starts with physical counters, then shows grouped representations, then notation.

### C5. Redesign "Build Your Game" to include mathematical decisions

The current build flow is cosmetic. To fulfill the DREAM, the learner must make MATH decisions when building:
- Choose the number range (e.g., "sums up to 10" vs "sums up to 20")
- Choose the representation (counters vs dots vs fingers)
- Write the hint text that will help other players
- Decide the difficulty curve across 5 rounds

This makes the "build" step a teaching act: the learner must understand the math well enough to set appropriate parameters for others.

### C6. Establish a validation protocol for pasted HTML games

For the fellowship pilot:
1. Guide plays the game and checks the 3 criteria (as currently planned)
2. Mr. Chesure agent reviews the game HTML against the standard (automated check)
3. If the game passes, it enters the library with a "Community" badge (distinct from "Verified")
4. Track completion rates: if community games have significantly lower win rates or higher skip rates than verified games, flag them

### C7. Create a "standards without games" pathway

For HS standards that cannot support intrinsic games, design an alternative:
- Video explanation + worked examples (pictorial/abstract CPA stages)
- Practice problems with self-revealing feedback (not quiz-wrapper -- show WHY the answer is correct through visual proof)
- Peer explanation requirement (learner records a 60-second explanation of the concept)

Do not force every standard into a game. That path leads to fake-intrinsic games for complex topics.

### C8. Add a misconception detector to the number pad

When a learner selects a wrong answer, log WHICH wrong answer they chose. Common errors reveal specific misconceptions:
- Selecting "5" for "3 + 4" suggests the learner counted one addend only
- Selecting "8" suggests the learner overcounted by one
- Selecting "1" suggests random guessing

Use this data to provide targeted intervention, not generic "try again" messages.

---

## D. Ideas for Fulfilling the Dream

### D1. What the research says about learners teaching through game creation

The DREAM -- "learn a concept, build a game that teaches it, play others' games" -- aligns with a well-studied pedagogical approach called **Learning by Teaching** (LbT) or **Learning by Designing** (LbD).

Key findings:
- **Papert (1980), Constructionism:** Learners understand concepts most deeply when they build external artifacts that embody those concepts. Building a game that teaches fractions forces deeper processing than solving fraction problems.
- **Kafai (1995, 2006), Game Design as Learning:** Elementary students who designed math games showed deeper mathematical understanding than students who played equivalent math games. The design process forces learners to confront their own misconceptions.
- **Schwartz & Martin (2004), Preparation for Future Learning:** Teaching others (or designing for others) creates "knowledge gaps" that make subsequent instruction more effective. A learner who struggles to design a fraction game is primed to learn fraction concepts more deeply.
- **Chi (2009), Active-Constructive-Interactive Framework:** Constructive activities (generating, designing) produce better learning than active activities (manipulating, solving). Designing a game is constructive; playing a game is active.
- **Harel & Papert (1991), Instructional Design Project:** Fourth graders who designed fraction software for third graders showed the deepest fraction understanding of any group studied.

**The research is clear: the DREAM is pedagogically sound.** The challenge is implementation.

### D2. What must change for the Dream to work

The current system has a gap: the learner makes COSMETIC decisions (sprites, theme) but not MATHEMATICAL decisions. For the learn-build-play loop to work pedagogically, the learner must:

1. **Understand the concept** well enough to identify what makes it hard
2. **Design the challenge** by choosing numbers, representations, and difficulty
3. **Anticipate misconceptions** by writing hints for other players
4. **Test their design** by watching others play (or by playing others' designs)

This transforms "building a game" from a reward into the primary learning mechanism.

### D3. Mr. Chesure's ideal version of the platform

**Phase 1: Guided Discovery (the current approach, refined)**
- Learner plays a verified intrinsic game for the standard
- Game uses CPA progression: concrete manipulation, then pictorial, then symbolic
- Learner demonstrates understanding by winning 3 times without hints

**Phase 2: Design Challenge (the missing piece)**
- Learner enters the "Design Lab" for that standard
- System shows: "You mastered [Adding within 10]. Now design a game that teaches it to someone who doesn't know it yet."
- Learner makes MATHEMATICAL decisions:
  - What numbers should the rounds use? (Must be within standard range)
  - What objects best represent the concept? (Learner picks from themed options that all map to the math)
  - What hint would you give a stuck player? (Learner writes in their own words)
  - What mistake do you think players will make? (Misconception awareness)
- System validates: Mr. Chesure checks that the learner's design choices stay within the standard's parameters
- The resulting game is the learner's "teaching artifact"

**Phase 3: Peer Play and Critique (the social learning layer)**
- Other learners play the designed game
- After playing, the player rates: "Did this game help you understand [concept]?" (thumbs up/down + optional text)
- The designer sees aggregate feedback: "8 of 10 players said your game helped them"
- Cycle: if feedback is poor, redesign. If feedback is strong, the game rises in the library.

**Phase 4: Mastery Through Variety**
- To fully master a standard, the learner must play 3 games designed by OTHER learners
- Each game uses slightly different numbers, representations, or scenarios
- This forces transfer: the learner must apply the concept in novel contexts, not just replay the same interaction

### D4. The smallest viable version of the Dream

For the fellowship pilot, you do not need all four phases. The smallest version that fulfills the Dream:

1. Learner plays verified intrinsic game (Phase 1 -- you have this for 2 standards)
2. After winning, learner enters "Design Mode" where they:
   - Choose 5 round problems from a range (e.g., "pick addition problems with sums up to 10")
   - Write a one-sentence hint for stuck players
   - Name and theme the game (cosmetic, as current)
3. Other learners play the designed game
4. Designer sees "X players played your game"

This is achievable with the current architecture. The Circuit Board Builder already exists. Adding a "choose your rounds" step and a "write your hint" step turns the builder from cosmetic to pedagogical.

### D5. Long-term vision: the game design IS the assessment

The most powerful implication of Learning by Designing research is that the DESIGN itself reveals understanding. A learner who designs a fraction game with only unit fractions (1/2, 1/3, 1/4) shows different understanding than one who includes non-unit fractions (2/3, 3/5, 7/8).

In the long term, Mr. Chesure should analyze the learner's design choices as a formative assessment:
- Did the learner use appropriate number ranges?
- Did the learner identify a real misconception in their hint?
- Did the learner create a valid difficulty progression?

This turns game design into an assessment that does not feel like a test -- which is the holy grail of educational technology.

---

## Summary Verdicts

| Area | Rating | Notes |
|---|---|---|
| K.OA.A.1 Learning Contract | **PASS** | Well-researched, Barbara-tested, concrete-first. Reference implementation. |
| K.OA.A.3 Learning Contract | **PENDING** | Awaiting test. |
| 56 rebuilt games | **UNVALIDATED** | No contracts, no human testing. Do not count as intrinsic. |
| Three-layer guarantee | **PARTIAL** | Layer 1 (mapping) is sound. Layer 2 (AI rounds) is risky for untested standards. Layer 3 (validation) is keyword-matching, not pedagogical. |
| Dream fulfillment | **NOT YET** | The build step is cosmetic. Needs mathematical decision-making by the learner. |
| Agent team cross-checking | **PASS** | The disagreement-surfacing model works. Keep it. |
| Research foundation | **PASS** | CPA, productive struggle, intrinsic integration all correctly cited and applied. |
| Scaling plan | **AT RISK** | 466 contracts at current pace = years. Need a faster validation pipeline. |

---

*Filed by Mr. Chesure, Pedagogy Guardian. This report should be cross-checked by The Critic (quality) and The Tester (implementation). Disagreements are welcome -- they surface real tensions.*
