# The Tester -- QA Verification Report

**Agent:** The Tester (QA Verification)
**Date:** April 15, 2026
**Scope:** Full technical/QA analysis of Diagonally platform based on project history, blueprint, and codebase inspection.

---

## A. What Went Wrong (Technical/QA Perspective)

### A1. No automated test suite exists

The project has **zero project-level test files**. No Jest, Vitest, Playwright, or Cypress configuration. No unit tests, no integration tests, no end-to-end tests. Every test was manual (Barbara playing the game). This is the single biggest technical failure -- it meant that the overnight 87-game rebuild produced code that "compiled" but was never verified against actual behavior.

**Evidence:** Searched for `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx` in `src/` -- zero results. No test runner config exists at the project root.

### A2. Per-standard mapping was silently wrong in production

The Circuit Board Builder render code was using keyword-based mechanic matching **instead of** the per-standard mapping from `standard-game-options.ts`. This means every moon was showing wrong game options (e.g., 6.EE.B.7 showed RISE & FALL instead of Balance & Equalize). This bug shipped and was only caught when Barbara manually tested a specific moon.

**Root cause:** The render code used `mechanics.map()` instead of `gameOptions.map()`. No test verified that the UI was reading from the correct data source.

### A3. AI round generation produced off-standard content

Games for K.OA.A.1 (addition with objects) generated ratio language ("3 apples for every 2 oranges"). The AI prompt was insufficiently constrained, and the `worldName: "skeleton"` value (from skeleton mode) caused the AI to generate violent/spooky content.

**Root cause:** No automated validation that AI-generated round content actually matches the target standard. The validation layer (keyword match check) only catches gross mismatches (match score < 10%), not subtle standard-level drift.

### A4. Games did math for the learner

Running totals, animated counting, and live sum displays were present in multiple game engines. The learner could tap and watch numbers go up without ever doing arithmetic. The number pad allowed brute force -- wrong answers faded out, leaving fewer options each attempt.

**Root cause:** No QA checklist enforced the rule "system never displays running count during learner interaction." Each engine was built independently and reviewed only after deployment.

### A5. 54% of games were quiz-wrappers masquerading as intrinsic games

The strict audit found only 11 of 87 game options (13%) were truly intrinsic. 47 were quiz-wrappers. 7 were "fake intrinsic" -- the most dangerous category, because they created the illusion of teaching. This was not caught until April 13 because there was no systematic classification test.

### A6. Overnight parallel rebuild produced untested code

13+ agents rebuilt 56 games in one session. The code compiled (TypeScript clean) but was never tested against real learner experience. Barbara found fundamental UX and pedagogy problems on manual review. Agents optimized for "looks different" not "actually works."

**Root cause:** No smoke test or integration test ran after each agent's rebuild. The definition of "done" was "TypeScript compiles," not "game is playable and teaches math."

### A7. Theme layer generated incoherent combinations

AI-generated theme names had zero connection to game mechanics. A scale game themed as "Desert Athlete in Scorching Desert" showed blocks on a scale -- nothing to do with deserts or athletes. The theme generation prompt did not cross-reference the visual output of the engine.

---

## B. What COULD Still Go Wrong

### B1. The 464 unmapped standards have no games

`standard-game-options.ts` currently contains exactly 2 verified entries: `K.OA.A.1` and `K.OA.A.3`. The function `getGameOptionsForStandard()` returns `null` for all other 464 standards. If a learner navigates to any of these moons and clicks "Build Your Game," the system must handle the null case gracefully. **Not tested.**

### B2. HTML paste (learner-imported games) is the highest-risk surface

The `judge-html` API route truncates HTML at 16,000 characters and sends it to Claude Sonnet for evaluation. Risks:

- **Infinite loops:** A pasted game with `while(true){}` will lock the browser tab. The sandbox iframe (`allow-scripts`) does not have a timeout mechanism. There is no `setTimeout` kill switch injected into pasted HTML.
- **Memory bombs:** A game that allocates massive arrays or creates thousands of DOM nodes can crash the tab. No memory budget is enforced.
- **CPU-intensive rendering:** Canvas games with unthrottled `requestAnimationFrame` loops can drain battery on mobile devices. No frame budget.
- **AI judge reliability:** The judge is non-deterministic. A game could pass on one evaluation and fail on another. No consistency check (e.g., run the judge 3 times, require 3/3 pass).
- **HTML truncation at 16,000 chars:** If the critical game logic is past character 16,000, the judge evaluates an incomplete game and may pass it incorrectly.

### B3. Sanitizer can be bypassed

The HTML sanitizer in `html-sanitizer.ts` uses regex-based stripping. Known bypass vectors:

- **Obfuscated `javascript:` URLs:** The regex checks for `javascript:` literally, but URL-encoded variants (`java&#115;cript:`, `&#106;avascript:`) or mixed-case with whitespace could bypass it.
- **Event handler exfiltration:** The sanitizer does not strip `on*` event handlers (e.g., `onerror="fetch('evil.com')"` on an `<img>` tag). The CSP blocks `connect-src`, but the CSP is injected by the sanitizer itself -- if a pasted game already has a `<head>` with its own CSP that is more permissive, the injected CSP may not take precedence (browsers use the most restrictive of multiple CSPs, but edge cases exist).
- **`<link rel="preload">` or `<link rel="dns-prefetch">`:** The sanitizer strips `<link>` tags, but only with a single regex. Complex multi-line or attribute-spread link tags could survive.

The iframe `sandbox="allow-scripts"` provides a strong second layer (blocks `allow-same-origin`, `allow-forms`, `allow-top-navigation`), which mitigates most of these. But `allow-scripts` still permits arbitrary JS execution within the sandbox, including crypto mining.

### B4. postMessage origin check is loose

In `game-iframe.tsx`, line 26: `if (e.origin !== "null" && e.origin !== window.location.origin) return`. The origin `"null"` is accepted because sandboxed iframes have a null origin. However, any sandboxed iframe on the page (including potential attacker-injected ones) also sends messages with origin `"null"`. If a second sandbox exists on the page, it could spoof `game_win` messages.

Current risk is low because the app only renders one game iframe at a time, but this should be hardened with a message nonce or iframe-specific identifier.

### B5. Firestore writes are not validated server-side

The Workshop component writes game data directly to Firestore from the client (`setDoc` in `workshop.tsx`). Fields like `authorUid`, `classId`, and `standardId` are set from the client. A malicious user could modify these to claim authorship of another user's game or assign a game to a different standard.

### B6. No load testing has been done

The 3D galaxy uses `react-force-graph-3d` + Three.js rendering 466+ nodes. At scale:
- What happens with 50+ learners viewing the galaxy simultaneously?
- What happens when the game library contains 10,000+ games?
- What happens when Firestore queries for "games by standard" return hundreds of results?

None of these scenarios have been tested.

### B7. Hardcoded rounds create predictable gameplay

`ROUNDS_ADD_SUB` in `number-frames.ts` is a static array of 5 rounds. Every learner sees the same 5 rounds in the same order. A learner who plays twice can memorize answers without doing math. This violates the randomization principle stated in the blueprint ("Randomized values every playthrough").

### B8. Font loading failure degrades UX

Games load Lexend via Google Fonts CDN (`@import url('https://fonts.googleapis.com/...')`). The CSP allows `style-src 'unsafe-inline' https://fonts.googleapis.com` and `font-src https://fonts.gstatic.com`. If Google Fonts is slow or blocked (school networks often block external CDNs), the game falls back to `system-ui` with a flash of unstyled text. For pasted HTML games, the CSP injected by the sanitizer blocks all font loading (`style-src 'unsafe-inline'` only -- no Google Fonts allowlisted), so pasted games that rely on web fonts will render incorrectly.

### B9. No error boundary around game iframe

If a game crashes with an unhandled JS error, there is no mechanism to:
1. Detect the crash from the parent app
2. Show the learner a recovery message
3. Log the crash for debugging
4. Offer a "reload" or "try different game" option

The game just silently breaks inside the iframe.

---

## C. Suggestions for Fixes

### C1. Establish an automated test suite immediately

**Framework:** Vitest (already compatible with Next.js, fast, TypeScript-native).

**Minimum test coverage before any deployment:**

| Layer | What to test | Example |
|---|---|---|
| Unit | `getGameOptionsForStandard()` returns correct options for every verified standard | `expect(getGameOptionsForStandard("K.OA.A.1")).toEqual(["number-frames"])` |
| Unit | `sanitizeGameHtml()` strips all known attack vectors | Test each bypass vector from B3 |
| Unit | `findSecurityIssues()` detects all dangerous patterns | Feed it crafted malicious HTML |
| Unit | Number Frames engine generates valid HTML with CSP | Call `numberFramesEngine()`, parse output, check structure |
| Unit | Round data matches Learning Contract | Verify each round's `answer` equals the correct computation |
| Integration | `generate-engine` API returns valid game HTML | POST with known inputs, verify HTML output |
| Integration | `judge-html` API correctly rejects non-games | POST a `<p>hello</p>`, verify `playable: false` |
| Integration | `judge-html` API correctly rejects off-standard games | POST a multiplication game for a counting standard |
| Snapshot | Each engine's HTML output does not change unexpectedly | Snapshot test per engine per game option |

### C2. Add a game smoke test that runs in a headless browser

Use Playwright to:
1. Load each verified game's HTML in a headless browser
2. Verify no JS console errors on load
3. Verify the game renders elements (frames, buttons, counters)
4. Simulate a click sequence that wins the game
5. Verify `postMessage({type: 'game_win'})` fires

This catches the class of bugs where "TypeScript compiles but the game doesn't actually work in a browser."

### C3. Add an infinite-loop kill switch for pasted games

Before injecting pasted HTML into the iframe, wrap all inline `<script>` content with a timeout guard:

```javascript
// Inject at the top of every <script> block
const __startTime = Date.now();
const __checkTimeout = () => {
  if (Date.now() - __startTime > 10000) throw new Error("Game timed out");
};
// Then instrument while/for loops to call __checkTimeout()
```

Alternatively, use a Web Worker with `terminate()` as a hard kill, or set a parent-level timer that reloads the iframe if no `game_win` or `game_lose` message arrives within 60 seconds.

### C4. Pre-deployment checklist (run before every `git push` to main)

1. `npm run typecheck` -- TypeScript compiles
2. `npm run test` -- All unit + integration tests pass
3. `npm run test:smoke` -- Headless browser smoke test for all verified games
4. `npm run lint` -- No lint errors
5. Manual gate: Barbara plays any newly added/modified game

This should be enforced via a GitHub Actions workflow on the `main` branch.

### C5. Add a message nonce to postMessage protocol

When creating the game iframe, generate a random nonce and inject it into the game HTML. The game must include this nonce in its `postMessage` payload. The parent verifies the nonce before accepting `game_win` or `game_lose`. This prevents spoofing from other iframes.

### C6. Move Firestore writes behind server-side API routes

Replace direct client-side `setDoc` calls with POST requests to API routes that validate the user's auth token, verify they own the game, and sanitize all fields before writing to Firestore.

### C7. Randomize hardcoded rounds

Instead of a fixed 5-round array, store a pool of 15-20 verified rounds per standard and randomly select 5 each playthrough. This prevents memorization while maintaining the quality guarantee of hardcoded rounds.

---

## D. Ideas for the Dream

### D1. Technical guardrails for learner-pasted HTML games

When a learner pastes an HTML game (from Gemini or elsewhere), the system should run a multi-layer check:

**Layer 1 -- Static analysis (instant, before iframe load):**
- Check HTML length is between 200 and 100,000 characters
- Check for `<script>` presence (game needs JS to be interactive)
- Check for dangerous patterns (external scripts, iframes, fetch calls)
- Check for `postMessage` call with `game_win` (required for integration)
- Warn if no `game_lose` handler exists

**Layer 2 -- Sandbox execution (5-second test):**
- Load the HTML in a headless sandboxed iframe
- Wait 5 seconds
- Check for JS console errors
- Check that the DOM contains interactive elements (buttons, canvas, clickable divs)
- Check that the page is not blank or showing only text
- Kill if CPU usage exceeds threshold (infinite loop detection)

**Layer 3 -- AI judge (current `judge-html` route):**
- Evaluate against the 3 criteria (playable, authentic math, math essential)
- Return specific, actionable feedback

**Layer 4 -- Peer + guide review (human layer):**
- Other learners play the game and rate it
- Guide approves or sends back with feedback

### D2. Feedback for learners when their pasted game has bugs

The system should provide specific, friendly, actionable messages:

| Problem detected | Message to learner |
|---|---|
| No `<script>` tag found | "Your game needs JavaScript to be interactive. Ask your AI to add game logic with a `<script>` tag." |
| JS error on load | "Your game has a code error: [error message]. Copy this message and ask your AI to fix it." |
| No win condition detected | "Your game needs a way to win! Ask your AI to add `parent.postMessage({type: 'game_win'}, '*')` when the player wins." |
| Page is blank after 3 seconds | "Your game isn't showing anything on screen. Ask your AI to check that the HTML has visible elements." |
| Infinite loop detected (tab freezes) | "Your game got stuck in an infinite loop. Ask your AI to check all `while` and `for` loops." |
| Math doesn't match standard | "Your game is about [detected topic] but this moon is about [standard description]. Ask your AI to make the game about [standard description] instead." |
| Game works but is too easy (no fail state) | "Your game lets the player win without doing math. Ask your AI to add wrong-answer consequences." |

### D3. Crash recovery for games

Wrap the game iframe in an error boundary component that:

1. Monitors for `game_win` or `game_lose` within 120 seconds of load
2. If neither arrives, shows: "This game seems stuck. [Reload] [Try a different game] [Report bug]"
3. Catches iframe `error` events and displays a recovery UI
4. Logs crash data (game ID, standard ID, browser info, time to crash) to Firestore for debugging

### D4. HTML game template for learners

Provide a starter template that learners can give to Gemini:

```
"Make me an HTML game that teaches [standard description].
Requirements:
- Must have 5 rounds of increasing difficulty
- Must call parent.postMessage({type: 'game_win'}, '*') when the player wins all rounds
- Must call parent.postMessage({type: 'game_lose'}, '*') when the player fails
- Must work without any external scripts or stylesheets
- The player must DO math to win, not just click randomly
- Use only inline CSS and inline JavaScript"
```

This template prevents the most common integration failures (missing postMessage, external dependencies, no win condition).

### D5. Game validation score displayed to learner

Show the learner a visual scorecard after pasting:

```
Security check:      PASS (no external scripts)
Game loads:          PASS (no errors)
Win condition:       PASS (game_win detected)
Math matches moon:   PASS (addition with objects)
Math is essential:   FAIL -- "The game lets you skip the math by clicking randomly"
```

Each item links to a help article explaining what it means and how to fix it.

### D6. Rate-limit game submissions

A learner should not be able to submit more than 5 games per hour per standard. This prevents brute-force submission (paste, fail judge, tweak, paste again in rapid succession) which would incur AI API costs at scale.

---

## Summary of Critical Findings

| Priority | Issue | Risk | Fix effort |
|---|---|---|---|
| P0 | No automated tests exist | High -- bugs ship to production undetected | 2-3 days for baseline suite |
| P0 | Pasted games can infinite-loop the browser | High -- learner loses their tab | 1 day for timeout guard |
| P1 | Hardcoded rounds are not randomized | Medium -- learners memorize answers | 1 day to add round pools |
| P1 | Firestore writes are client-side and unvalidated | Medium -- data integrity risk | 2 days to move to API routes |
| P1 | No error boundary around game iframe | Medium -- crashes show blank screen | 0.5 day |
| P2 | Sanitizer regex bypasses possible | Low (CSP + sandbox mitigate) | 1 day to harden |
| P2 | postMessage origin check is loose | Low (single iframe context) | 0.5 day for nonce |
| P2 | Font loading blocked on school networks | Low (falls back to system font) | 0.5 day to self-host fonts |
| P2 | 464 standards return null from getGameOptionsForStandard | Medium -- unknown UI behavior | 0.5 day to add null handling + test |
