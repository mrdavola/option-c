# Math Content Flow Review — Failure Point Analysis

## The Flow (happy path)

1. **Learner clicks moon** → standard ID + description loaded
2. **Game Assembler opens** → `getGameOptionsForStandard(id)` returns valid game options
3. **Learner picks game option** → option ID + mechanic ID determined
4. **Learner picks background, character, item** → theme choices set
5. **Learner clicks Build** → design doc created, sent to `/api/game/generate-engine`
6. **API generates theme config** → AI (Haiku) creates names/colors from choices
7. **API generates AI rounds** → AI (Haiku) creates 5 math problems for THIS standard
8. **Engine generates HTML** → Phaser game with AI rounds embedded as `AI_ROUNDS`
9. **Game plays** → each round shows AI prompt, player interacts via game mechanic
10. **Hint card** → shows math explanation specific to this standard (cached)

## Failure Points Identified

### FP-1: Wrong game option offered
- **Where:** Step 2, `getGameOptionsForStandard()`
- **Risk:** Mapping file has wrong entries
- **Fix applied:** Per-standard mapping (466 entries), math teacher audit running
- **Remaining risk:** LOW — hardcoded, audited

### FP-2: AI rounds don't match standard
- **Where:** Step 7, `/api/game/generate-engine`
- **Risk:** Haiku generates generic math instead of standard-specific
- **Fix applied:** Prompt says "CRITICAL: test THIS EXACT standard". Validation retries once.
- **Remaining risk:** MEDIUM — AI is not 100% reliable. Could generate "add 3+5" for a ratios standard.
- **Mitigation:** Validation checks keyword overlap. Could add stricter validation.

### FP-3: Engine ignores AI rounds
- **Where:** Step 9, each Phaser engine's `startRound()`
- **Risk:** Engine uses its own `generateXRound()` instead of AI_ROUNDS
- **Fix applied:** `getRound()` in base template. Engine update agent converting all 54 scenes.
- **Remaining risk:** LOW after update — getRound() has fallback but prioritizes AI_ROUNDS

### FP-4: Gameplay doesn't match the prompt
- **Where:** Step 9, the interaction
- **Risk:** Prompt says "What is 3/4?" but the game mechanic is stacking blocks
- **Root cause:** The per-standard mapping should prevent this (e.g., fractions → cut-the-bar)
- **Remaining risk:** LOW if mapping is correct. Math teacher audit will catch mismatches.

### FP-5: Help text doesn't match
- **Where:** The ? button in-game
- **Risk:** Shows generic "How to play" text that contradicts the actual math
- **Fix applied:** `showHelp()` now uses AI_ROUNDS hints when available
- **Remaining risk:** LOW — falls back to generic only if no AI rounds

### FP-6: Hint card doesn't match
- **Where:** Left panel in practice mode
- **Risk:** Hint card shows wrong concept explanation
- **Fix applied:** Hint card fetches from `/api/game/math-moment` with the standard's concept
- **Remaining risk:** LOW — concept comes from designDoc, tied to the standard

### FP-7: Moon card explanation wrong
- **Where:** "This is about..." on the moon card
- **Risk:** AI generates wrong explanation for the standard
- **Fix applied:** AI prompt includes standard ID, grade, description
- **Remaining risk:** LOW — AI is good at explaining known standards

### FP-8: Eureka matches wrong standard
- **Where:** Build NOW → AI matching
- **Risk:** Learner describes a game, AI matches to wrong standard
- **Fix applied:** AI picks from learner's grade-level undemonstrated standards
- **Remaining risk:** MEDIUM — AI matching is fuzzy by nature
- **Mitigation:** Shows the standard to the learner before building, learner can reject

### FP-9: Multiple choice items too obvious
- **Where:** AI round's `items` array
- **Risk:** Distractors are too far from the answer, making it guessable
- **Remaining risk:** MEDIUM — depends on Haiku's generation quality
- **Mitigation:** Could add distractor quality check

### FP-10: Difficulty doesn't progress
- **Where:** AI rounds 1-5
- **Risk:** All 5 rounds are the same difficulty
- **Fix applied:** Prompt asks for "increasing difficulty"
- **Remaining risk:** LOW — Haiku usually follows this instruction

## Standards with No Perfect Game Option

Some standards describe concepts that don't map perfectly to ANY of our 57 game options:
- Proof-based standards (e.g., "Prove the Pythagorean theorem")
- Reading/writing standards (e.g., "Write numbers 0-20")
- Classification standards (e.g., "Classify shapes by attributes")
- Definition standards (e.g., "Know precise definitions of angle, circle...")

For these, the best available option is used (e.g., elimination-grid for proof/logic).
These are the SO-SO matches the math teacher audit will identify.

## Recommendations

1. **Strict validation:** After AI rounds are generated, verify EVERY prompt contains at least one key term from the standard description
2. **Fallback prevention:** If AI rounds fail validation twice, show error instead of wrong game
3. **Teacher review flag:** Add a field in Firestore games collection: `mathAligned: true/false` — guides can flag games where the math doesn't match
4. **Periodic audit:** Run the math teacher audit monthly as standards and engines evolve
