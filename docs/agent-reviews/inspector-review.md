# The Inspector -- Code Explainer & Math Verifier Review

**Date:** April 15, 2026
**Scope:** Full codebase review from a math accuracy and verification perspective. Covers generated games, pasted HTML flow, round data, validation logic, and the dream of learner-built games.

---

## A. What Went Wrong (Code Accuracy / Math Verification Failures)

### A1. AI rounds generated math for the WRONG standard
**Where:** `src/app/api/game/generate-engine/route.ts` lines 152-207
**What happened:** Haiku generated round prompts about ratios for a K.OA.A.1 (addition with objects) standard. The AI prompt says "CRITICAL: Every round MUST directly test [standard description]" but the AI ignored it, producing generic or thematically confused math.
**Root cause:** LLM text instructions are not deterministic constraints. Telling Haiku "test THIS standard" does not guarantee it will. The word "ratio" appearing in a theme description was enough to derail generation.

### A2. Skeleton mode caused literal skeleton content
**Where:** `generate-engine/route.ts` line 33 -- `worldName: "skeleton"` was used before the fix.
**What happened:** AI interpreted "skeleton" literally, generating violent/spooky round prompts instead of neutral math.
**Fix applied:** Changed to `worldName: "the classroom"` in skeleton mode. This is a band-aid; the deeper issue is that theme words leak into math generation.

### A3. Fake intrinsic games taught the WRONG grade-level math
**Where:** All 7 "fake intrinsic" games identified in the strict audit (free-balance, mystery-side v1, chain-scales, free-collect, conveyor-belt, split-the-loot, stack-to-target).
**What happened:** A 6th-grade algebra game (mystery-side) actually required counting (a K/1 skill). The game interaction physically embodied addition-by-ones, not inverse algebraic operations. A learner could "pass" a 6.EE.B.7 standard by counting to 10.
**Verification missing:** No automated check existed to compare the COGNITIVE OPERATION required by the game mechanic against the cognitive operation described by the standard. The per-standard mapping only checked that the right game option was offered, not that the game option actually exercised the right skill.

### A4. System displayed running counts, doing the math FOR the learner
**Where:** Multiple Phaser engines (pre-rebuild). Running totals updated in real-time as learners clicked items.
**What happened:** The "Collect" games showed a live counter incrementing as items were tapped. The learner never had to count -- they just watched the number and stopped when it matched. The system performed the addition.
**Verification missing:** No check for whether the game UI reveals intermediate mathematical results during play.

### A5. Number pad allowed brute force (pre-fix)
**Where:** Number Frames engine (`number-frames.ts`) -- original version before Fix #3.
**What happened:** Wrong answers faded out, reducing options each attempt. A learner could tap randomly through 5 choices in at most 5 tries, never doing math.
**Fix applied:** Wrong answers now shake (don't fade), number pad hides, counters reset. Learner must recount from scratch. Verified in current code at line 487-494.

### A6. Validation uses keyword overlap -- not math verification
**Where:** `generate-engine/route.ts` lines 224-265
**What happened:** The "validation" step checks whether AI round prompt text shares words (>4 chars) with the standard description. A round about "adding fractions" would pass validation for a standard about "subtracting fractions" because they share the words "fractions." This is keyword matching, not math correctness checking.
**Threshold is dangerously low:** Match ratio < 0.1 triggers a retry. That means 90% keyword MISMATCH is considered acceptable. Only total disconnect (< 10% match) triggers a flag.

---

## B. What COULD Still Go Wrong

### B1. AI-generated rounds for 464 unmapped standards
Only 2 standards (K.OA.A.1, K.OA.A.3) have verified games with hardcoded rounds. The remaining 464 standards will fall through to AI round generation (`generate-engine/route.ts` lines 152-207). Every one of those games could have:
- Wrong math (2+3=6 style errors in AI output)
- Right math, wrong standard (addition questions for a multiplication standard)
- Right standard, wrong grade level (grade-6 problems for a grade-2 standard)
- Correct answer not in the items array
- No valid solution path in the items array

**Risk:** HIGH for any standard without hardcoded rounds.

### B2. getRound() fallback is generic and standard-agnostic
**Where:** `base-phaser-template.ts` lines 246-257
When AI rounds are null or missing an index, `getRound()` returns `{ prompt: 'Solve this!', target: 10, items: [10, 5, 8, 3, 12, 7] }`. This is a generic fallback with no connection to ANY standard. A learner could play a "geometry" game and get "Solve this! Target: 10" with random numbers.

### B3. Phaser engine fallback rounds bypass standard alignment
**Where:** Multiple engines have their own internal fallback round data:
- `balance-systems-phaser.ts` line 765: `roundVariation` fallback
- `build-structure-phaser.ts` line 196-203: `fallbacks` array
- `measurement-time-phaser.ts` lines 84-87, 106-113: time fallbacks
- `middle-school-gaps-phaser.ts` lines 151, 367, 567: per-scene fallbacks
- `inventory-crafting-phaser.ts` lines 140-163: recipe fallbacks
- `constraint-puzzles-phaser.ts` line 267: `_fallback()` method

These fallbacks are hardcoded per-engine, not per-standard. If AI round generation fails silently, the engine falls back to generic rounds that may not test the learner's target standard at all. The learner and guide would never know.

### B4. Pasted HTML judge has no MATH CORRECTNESS check
**Where:** `src/app/api/game/judge-html/route.ts`
The judge checks 3 criteria (playable, authentic, essential) via an LLM prompt. It does NOT:
- Verify that math equations in the HTML are correct (e.g., "2+3=6" would not be caught)
- Check that answer arrays contain the correct answer
- Verify that difficulty is appropriate for the standard's grade level
- Run the game to test that the correct answer is actually reachable
The judge reads truncated HTML (16KB max) and makes a subjective LLM judgment. A game with plausible-looking but wrong math would pass.

### B5. No runtime verification that a learner actually did math
Nothing in the system verifies that the learner's win was earned through mathematical reasoning. The `game_win` postMessage is sent by the game itself (inside a sandboxed iframe), and the parent app trusts it unconditionally. A pasted HTML game could send `game_win` immediately on load.

### B6. Hardcoded rounds could contain errors undetected
**Where:** `src/lib/standard-rounds.ts`
The hardcoded rounds file contains hundreds of manually written rounds. There is no automated test that verifies:
- `target` matches the actual answer to the math described in `prompt`
- `target` appears in the `items` array
- `items` are plausible distractors (not obviously wrong)
- Difficulty actually progresses across rounds 1-5
Example: `K.CC.A` round 1 says "What number comes after 3?" with target 4. Correct. But if someone edited this file and changed target to 5, nothing would catch it.

### B7. Theme leaking into math content
**Where:** `generate-engine/route.ts` lines 166-177
The AI round generation prompt includes theme words (`worldName`, `character`, `itemName`, `targetName`). The AI is asked to use these in prompts. If the theme is "Pirate Treasure," the AI writes "3 gold coins for every 2 silver coins" -- but the standard might be about addition, not ratios. Theme vocabulary can steer the AI toward the wrong mathematical operation.

### B8. Number Frames ADD mode requires exact frame match
**Where:** `number-frames.ts` lines 434-438
In ADD mode, the learner must put EXACTLY `r.a` counters in frame A and `r.b` in frame B. But addition is commutative: 2+4 = 4+2. A learner who puts 2 in frame B and 4 in frame A gets "Not quite -- check both frames." This penalizes correct mathematical reasoning (commutativity) because the code checks `frameA === r.a && frameB === r.b` with fixed positions.

---

## C. Suggestions for Fixes

### C1. Automated round verification (run BEFORE serving games)
Build a `verifyRounds(standardId, rounds)` function that checks:
1. **Answer correctness:** Parse the prompt, compute the answer, compare to `target`. For simple arithmetic this is deterministic.
2. **Target in items:** `rounds[i].items.includes(rounds[i].target)` -- trivial check, catches data entry errors.
3. **Grade-level appropriateness:** Numbers in prompts should be within grade-level range (K: 0-10, Grade 1: 0-20, Grade 2: 0-100, etc.).
4. **Difficulty progression:** `rounds[i].target <= rounds[i+1].target` (or complexity measure).
5. **Standard keyword match:** At least basic semantic overlap between prompt and standard description.

This should run on every game generation and block serving if verification fails.

### C2. Hardcoded round unit tests
Write a test file that iterates every entry in `STANDARD_ROUNDS` and checks:
- `target` is in `items`
- `items` has 6-8 entries
- `prompt` is non-empty and under 80 chars
- `hint` is non-empty
- For arithmetic prompts, parse and verify the answer matches `target`

This catches data entry errors in the verified rounds file. Run on CI.

### C3. Replace keyword validation with LLM verification
The current validation (lines 224-265 of `generate-engine/route.ts`) uses keyword overlap, which is nearly useless. Replace with a focused LLM call:
```
"Does this math problem test [standard description]? Answer YES or NO with one sentence explaining why."
```
This is a classification task, not generation -- cheaper and more reliable than keyword matching. Reject rounds where any single round gets NO.

### C4. Pasted HTML math extraction and verification
For the `judge-html` flow, add a second pass:
1. Extract all math expressions from the HTML (regex for patterns like `N op N = N`, answer arrays, target values).
2. Verify each expression is arithmetically correct.
3. Check that every answer array contains the correct answer.
4. Flag games where math is wrong with specific line references.

This catches "2+3=6" errors that the LLM judge might miss.

### C5. Fix commutativity in Number Frames ADD mode
**Where:** `number-frames.ts` lines 434-438
Change the validation from:
```js
const aOK = frameA === r.a;
const bOK = frameB === r.b;
```
To:
```js
const aOK = (frameA === r.a && frameB === r.b) || (frameA === r.b && frameB === r.a);
```
This accepts both orderings. Addition is commutative; penalizing `4+2` when the prompt shows `2+4` teaches the WRONG lesson.

### C6. Anti-cheat for game_win messages
Add a minimum play time check in the parent app. If `game_win` arrives within 2 seconds of iframe load, reject it. This prevents pasted games from auto-winning. Also consider requiring the game to send intermediate signals (round completions) before accepting a win.

### C7. Fallback round audit
Every engine's internal fallback rounds should be reviewed. Each fallback should either:
- Map to a specific standard (tagged with `standardId`), or
- Be removed entirely, forcing the game to show an error state rather than serving wrong-standard math silently.

Silent fallbacks are the most dangerous failure mode because nobody knows the game is teaching the wrong thing.

---

## D. Ideas for the Dream (Learner-Built Games)

### D1. The core challenge: learner-pasted HTML with wrong math

When learners build games with Gemini and paste HTML, the math inside could be wrong in ways that are hard to detect:
- Arithmetic errors: `7 x 8 = 54` (should be 56)
- Wrong answers in arrays: correct answer missing from options
- Grade-level mismatch: multiplication in a K standard game
- Correct math but wrong standard: addition game for a geometry standard
- Math that is technically correct but pedagogically backwards (symbolic before concrete for K)

### D2. Three-layer inspection for pasted games

**Layer 1 -- Automated math extraction (instant, runs on paste)**
- Regex scan for all number patterns, equations, answer arrays, target values
- Verify arithmetic correctness of every equation found
- Check that correct answers appear in corresponding answer arrays
- Flag any equation where the stated answer does not match computed answer
- Display to learner: "We found 5 math problems in your game. 4 are correct. Problem 3 says 7+8=14, but 7+8=15. Fix it before submitting."

**Layer 2 -- LLM standard alignment (runs on submit)**
- Send extracted math problems + standard description to LLM
- Ask: "Do these problems test [standard]? Are they at grade [N] level?"
- Return specific feedback: "Your game has addition problems, but this standard is about comparing fractions. The game needs fraction comparison to count."

**Layer 3 -- Peer play testing (runs after guide approval)**
- Other learners play the game. If 3+ learners report "math doesn't make sense," auto-flag for review.
- Guide can mark specific problems as wrong.

### D3. Making inspection educational

The inspection should TEACH, not just reject. When a learner pastes a game with `2+3=6`:

**Bad feedback:** "Error: incorrect math detected. Please fix."

**Good feedback:** "Almost! Your game says 2 + 3 = 6. Let's check: if you have 2 apples and get 3 more, count them: 1, 2... 3, 4, 5. So 2 + 3 = 5. Can you fix this in your code?"

This turns the error into a teaching moment. The inspector becomes a tutor, not a gatekeeper.

### D4. Inspector as a visible agent in the UI

Show the learner that "The Inspector" is checking their game:
- Animated character reviewing the code (stick figure with magnifying glass)
- Progress messages: "Checking your math problems..." / "Verifying answers..." / "Making sure the game tests [standard]..."
- Results displayed as a checklist the learner can see and act on
- Each failed check links to the specific place in their HTML where the error is

### D5. Pre-submit math sandbox

Before the learner submits, run their game in a headless evaluation:
- Play through all rounds programmatically
- Record what math problems appear, what answers are accepted
- Compare accepted answers against computed correct answers
- Report: "Round 3 accepts 14 as correct for 7+8, but the answer is 15"

This catches runtime bugs that static HTML analysis misses (e.g., answer computed by JavaScript, not hardcoded).

### D6. Community verification layer

When learners PLAY other learners' games:
- After each round, ask "Was the math right?" (optional, small button)
- If 5+ players flag a specific round, auto-notify the game creator
- Creator sees: "3 players think Round 2 has wrong math. Check it?"
- This makes the community self-correcting and teaches critical evaluation

### D7. Verified math problem bank for learner games

Provide a library of verified math problems per standard that learners can import into their games. Instead of writing `3+4=8` by hand, they pull from a bank of correct problems. The bank is the `standard-rounds.ts` file, exposed via an API. This reduces errors at the source while still letting learners build creative game wrappers.

---

## Summary of Risk Levels

| Area | Risk | Why |
|---|---|---|
| Verified games (K.OA.A.1, K.OA.A.3) | LOW | Hardcoded rounds, tested by Barbara, contract-backed |
| AI-generated rounds (464 standards) | HIGH | No math correctness check, keyword-only validation |
| Phaser engine fallbacks | HIGH | Silent, standard-agnostic, no one knows they fired |
| Pasted HTML games | HIGH | LLM judge only, no arithmetic verification |
| Number Frames commutativity | MEDIUM | Correct math rejected, teaches wrong lesson |
| game_win trust | MEDIUM | Trivially spoofable from pasted games |
| Hardcoded rounds data integrity | LOW-MEDIUM | No automated tests, manual errors possible |

**Bottom line:** The two verified games (K.OA.A.1 and K.OA.A.3) are solid. Everything else has math verification gaps. The most urgent fix is automated round verification (C1) and hardcoded round tests (C2) -- these are low-effort, high-impact. The pasted HTML math extraction (D2, Layer 1) is critical before the fellowship pilot.
