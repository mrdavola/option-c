# Game Generation Pipeline — Architecture Draft

**Status:** DRAFT for Barbara's review. No code until approved.

## Current state (single API call)

```
Learner clicks Build Your Game
    ↓
POST /api/game/generate-engine
    ↓
Returns HTML in one shot
    ↓
Served to learner
```

**Problem:** No quality checks, no evaluation, no logging. Whatever comes out gets served.

## Proposed state (multi-step pipeline)

```
Learner clicks Build Your Game
    ↓
┌──────────────────────────────────────────┐
│ STEP 1: VALIDATE                         │
│ Check: does this standard have a         │
│ verified game in standard-game-options?   │
│ If NO → reject ("Game not ready yet")    │
│ If YES → proceed                         │
│ Log: validation event to Firebase        │
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│ STEP 2: LOAD ROUNDS                      │
│ Priority: hardcoded rounds (verified)    │
│ Fallback: AI-generated (if no hardcoded) │
│ Mr. Chesure check: do rounds match the   │
│   standard? Right grade? Right skill?    │
│ Log: round source + token cost           │
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│ STEP 3: GENERATE GAME HTML               │
│ Call the game engine (e.g. number-frames)│
│ Pass: rounds, config, standard info      │
│ Output: complete HTML document           │
│ Log: generation event + duration         │
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│ STEP 4: INSPECT (The Inspector)          │
│ Read the generated HTML                  │
│ Verify: correct math? Right answers?     │
│ Verify: interaction matches contract?    │
│ Output: ACCURATE / INACCURATE            │
│ If INACCURATE → reject + log reason      │
│ Log: inspection results                  │
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│ STEP 5: SECURITY SCAN (Security Guard)   │
│ Check: CSP present? External scripts?    │
│ Check: dangerous patterns? Phishing?     │
│ Output: SAFE / WARN / BLOCK              │
│ If BLOCK → reject + log reason           │
│ Log: security scan results               │
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│ STEP 6: SERVE                            │
│ All checks passed → serve HTML to iframe │
│ Log: served event with full metadata     │
│ (standard, option, rounds, eval results, │
│  token cost, duration)                   │
└──────────────────────────────────────────┘
```

## For PASTED HTML games (learner-submitted)

Same pipeline but Steps 2-3 are replaced:

```
Learner pastes HTML
    ↓
STEP 1: SANITIZE (strip external scripts, inject CSP)
    ↓
STEP 2: SECURITY SCAN (Security Guard)
    ↓
STEP 3: QUALITY JUDGE (The Critic — 3 criteria check)
    ↓
STEP 4: INSPECT (The Inspector — what does this game do?)
    ↓
If all pass → serve to Workshop for play-test
If any fail → reject with specific feedback
    ↓
Log everything to Firebase
```

## Firebase collections needed

### `system_logs` — every pipeline event
- game_generation, html_paste, hint_used, chat_message
- Includes: timestamp, standardId, learnerId, tokensUsed, cost, result

### `evaluation_results` — per-game quality data
- Inspector report, Critic verdict, Security scan, Chesure review
- Links back to the game ID and standard

### `cost_tracking` — aggregated cost data
- Daily totals, per-learner totals, per-event-type totals
- Used for: billing estimates, optimization decisions

## Cost estimates per event

| Event | Model | Est. tokens | Est. cost |
|---|---|---|---|
| Game generation (with AI rounds) | Haiku | ~2,000 | ~$0.003 |
| Quality judge (pasted HTML) | Haiku | ~3,000 | ~$0.005 |
| Real-world uses generation | Haiku | ~500 | ~$0.001 |
| Inspector analysis | Haiku | ~2,000 | ~$0.003 |
| Hint/chat interaction | Haiku | ~500 | ~$0.001 |
| Total per game generation | | ~4,000 | ~$0.006 |
| Total per pasted game | | ~5,500 | ~$0.009 |

At 100 learners × 5 games/day = 500 generations/day = ~$3/day.
At 1,000 learners = ~$30/day.

## Implementation order (after Barbara approves)

1. Add Firebase logging to existing `/api/game/generate-engine` (Step 6 logging)
2. Add validation gate (Step 1 — reject if no verified game)
3. Add Security Guard scan to generate-engine (Step 5)
4. Add Inspector analysis to generate-engine (Step 4)
5. Refactor into separate middleware functions for clean pipeline
6. Add cost tracking

## Questions for Barbara

1. **Should Steps 4-5 (Inspector + Security) run on EVERY generation or only for pasted HTML?** For our own verified games, the code is already reviewed. Running Inspector on every call adds latency (~2-3 sec) and cost.

2. **Firebase logging — use the existing `option-c-14d3b` project?** Or a separate analytics project?

3. **Should rejected games show a reason to the learner?** ("Your game was rejected because...") Or just "Try again"?

4. **Cost alerts — want a notification if daily cost exceeds a threshold?** (e.g., email if cost > $10/day)
