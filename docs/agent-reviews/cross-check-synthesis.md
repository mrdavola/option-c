# Orchestrator Cross-Check Synthesis

**Date:** April 15, 2026
**Input:** All 8 agent reviews (Chesure, Critic, Tester, Inspector, Security, Historian, Janitor, Tracker)
**Purpose:** Find agreement, disagreement, blind spots, and produce a single prioritized action plan.

---

## 1. Where Agents AGREE (Highest-Confidence Findings)

These issues were flagged independently by 3+ agents. Treat them as confirmed.

### 1.1 The 56 "rebuilt" games are NOT verified (6/8 agents)
**Flagged by:** Chesure (B1), Critic (Risk 1), Tester (A6), Inspector (implicit), Historian (A1), Janitor (A1)

Every agent that examined the rebuild reached the same conclusion: the overnight 87-game parallel rebuild produced code that compiled but was never tested against learner experience or Learning Contracts. The Blueprint's "MASSIVE INTRINSIC REBUILD COMPLETE" banner is premature. Only 2 standards (K.OA.A.1 and K.OA.A.3) have verified games. The rest are unverified drafts.

**Confidence:** CERTAIN. This is the single most-agreed-upon finding across all agents.

### 1.2 The Blueprint is dangerously out of date (4/8 agents)
**Flagged by:** Historian (A1, A2, A3), Janitor (B1), Chesure (C1), Tracker (implicit -- dashboard contradicts Blueprint numbers)

The Blueprint still describes 24 Phaser engines, 81 game options, and "92% PERFECT" coverage as if they are the active architecture. The project pivoted away from all of this. Three contradictory audit results coexist (13%, 23%, 84% intrinsic). An agent reading the Blueprint today would build the wrong thing.

**Confidence:** CERTAIN. The Historian documented specific contradictions with line-level evidence.

### 1.3 No automated tests exist (4/8 agents)
**Flagged by:** Tester (A1 -- zero test files found), Inspector (C1, C2), Critic (Fix 2), Janitor (implicit -- no test infrastructure found)

The project has zero unit tests, zero integration tests, zero end-to-end tests. No Jest, Vitest, Playwright, or Cypress configuration exists. Every verification has been manual (Barbara playing the game). This is why the overnight rebuild shipped untested.

**Confidence:** CERTAIN. Tester searched the filesystem and confirmed zero test files.

### 1.4 Pasted HTML games are a high-risk surface (5/8 agents)
**Flagged by:** Tester (B2, B3), Inspector (B4, B5), Security (B1, B2), Chesure (B8), Critic (Risk 5)

The "paste your own HTML" feature is the highest-risk surface in the platform. Agents independently identified: infinite loop vulnerability, regex sanitizer bypasses, no content moderation for children, AI judge prompt injection, trivially spoofable game_win messages, no math correctness verification, and no timeout mechanism. The sanitizer misses on* event handlers. The CSP and sandbox are sound but everything around them has gaps.

**Confidence:** CERTAIN. Five agents independently found different attack vectors on the same feature.

### 1.5 Firestore security rules are MISSING (3/8 agents)
**Flagged by:** Security (A3 -- CRITICAL), Tester (B5), Inspector (implicit via client-side writes)

No `firestore.rules` file exists. Any authenticated user can read/write ANY document in ANY collection. A learner could overwrite another learner's profile, set their own role to "admin," or inflate their token balance via DevTools.

**Confidence:** CERTAIN. Security Guard confirmed no rules file exists in the repository.

### 1.6 API routes lack authentication (3/8 agents)
**Flagged by:** Security (A2 -- CRITICAL), Tester (implicit), Janitor (B1 item 3 -- live AI routes)

Four mutation routes (`save`, `judge-html`, `generate`, `topup-tokens`) accept POST requests with zero authentication. Anyone on the internet can burn Anthropic API credits or award tokens to all students. The admin `topup-tokens` route is the worst -- it sits next to a route that DOES verify auth, but it does not.

**Confidence:** CERTAIN. Security Guard listed specific routes with evidence.

### 1.7 The "build your game" step is cosmetic, not pedagogical (3/8 agents)
**Flagged by:** Chesure (B2), Critic (D -- Core Problem), Inspector (implicit)

The learner picks from pre-built engines and applies sprites. They make zero mathematical decisions. The platform's value proposition ("learners teach each other through game creation") is not actually happening. The "build" step is a menu selection, not a design act.

**Confidence:** HIGH. This is a design gap, not a bug -- but all three agents independently identified it as the biggest threat to the Dream.

### 1.8 AI-generated rounds produce wrong-standard content (4/8 agents)
**Flagged by:** Chesure (A4), Tester (A3), Inspector (A1, B1), Critic (Pattern 5)

K.OA.A.1 (addition with objects) generated ratio language. Theme words leak into math generation. The validation layer uses keyword matching with a 10% threshold -- nearly useless. 464 standards still rely on AI generation with no math correctness check.

**Confidence:** CERTAIN. Multiple agents cited the same specific example (ratio language for K addition).

### 1.9 Fake intrinsic games are the most dangerous failure mode (3/8 agents)
**Flagged by:** Chesure (A2 -- detailed analysis), Critic (Pattern 1 -- "pedagogical fraud"), Inspector (A3)

Seven games were identified as "fake intrinsic" -- they LOOK like they teach the target standard but actually require a lower-grade skill (usually counting). The mystery-side v1 example (scale balance that looks like algebra but is counting) was cited by all three agents as the canonical example.

**Confidence:** CERTAIN. All three agents independently analyzed the same games and reached the same conclusion.

### 1.10 Hardcoded rounds are not randomized (3/8 agents)
**Flagged by:** Tester (B7), Inspector (B6), Chesure (implicit via mastery concerns)

The 5 hardcoded rounds in Number Frames are a static array. Every learner sees the same rounds in the same order. A second playthrough allows memorization. This violates the Blueprint's own "randomized values every playthrough" principle.

**Confidence:** CERTAIN. Tester confirmed in code (`ROUNDS_ADD_SUB` is a static array).

---

## 2. Where Agents DISAGREE

### 2.1 How many verified games exist: 1 or 2?

- **Critic says 1:** "Only K.OA.A.1 has been Barbara-tested and approved. That means 1 out of 466 standards is verified."
- **Chesure says 2:** K.OA.A.1 PASS, K.OA.A.3 PENDING.
- **Tracker says 2:** "1 fully approved, 1 awaiting final sign-off."

**Verdict:** Tracker is the most precise. K.OA.A.1 is fully approved. K.OA.A.3 is verified by agents but awaiting Barbara's sign-off. The Critic is being maximally conservative (only counting Barbara-approved), which is the right instinct for quality claims but slightly understates progress. **Use "2 verified, 1 Barbara-approved" as the canonical count.**

### 2.2 Standards count: 466 or 517?

- **Most agents say 466** (from the Blueprint and history docs).
- **Tracker says 517** (from the actual `standards.json` file).

**Verdict:** Tracker is right -- the data file has 517 entries including sub-standards (e.g., K.CC.B.4a/4b/4c). The 466 figure appears to be the count of parent standards only. **Reconcile this immediately. Decide whether sub-standards are separate moons or grouped, and update the Blueprint.**

### 2.3 Severity of the sanitizer issue

- **Security Guard rates it HIGH:** Lists 6 specific bypass vectors (on* handlers, SVG injection, CSS tracking, tag splitting, etc.)
- **Tester rates it P2 (Low):** "CSP + sandbox mitigate"

**Verdict:** Both are partially right, but Security Guard has the stronger argument for a platform serving children. The CSP and sandbox ARE strong second layers -- but defense-in-depth requires fixing the sanitizer too, especially the on* event handler gap. **Rate this HIGH for a pre-pilot fix, because children are the users.** The cost of fixing it is low (1 day), so there is no reason to accept the risk.

### 2.4 How to handle the 56 rebuilt games

- **Chesure:** Reclassify as "Rebuilt, awaiting validation." Do not count them.
- **Critic:** "Treat as drafts. Go back and fill out Learning Contracts for each."
- **Janitor:** Archive or move to a `_legacy/` directory. Remove from registries.

**Verdict:** Janitor's approach is the most practical. The rebuilt games should NOT be visible to learners or callable by code. Move them to a legacy directory, remove them from ENGINE_REGISTRY, and don't touch them again until (if ever) a Learning Contract calls for one of those mechanics. The Critic's suggestion to backfill Learning Contracts for all 56 is correct in principle but unrealistic at current pace. **Janitor wins: archive them, gate the registry.**

### 2.5 Can agents draft Learning Contracts reliably?

- **Chesure:** Skeptical. "Agents can write code but can't judge pedagogy."
- **Tracker:** Optimistic. "Agents can research and draft contracts. Barbara reviews (30 min) instead of writing from scratch (2+ hours)."

**Verdict:** Both are right, and the positions are compatible. Agents should DRAFT contracts (research phase), but Barbara must APPROVE them before any code is written. The Tracker's pipeline model (agents draft while Barbara tests) is the correct workflow. Chesure's concern is addressed by making the contract a gate, not documentation. **Use Tracker's pipeline with Chesure's gate.**

---

## 3. What Agents MISSED (Blind Spots)

### 3.1 Accessibility
No agent reviewed accessibility. The platform serves children, including children with disabilities. Questions unasked:
- Do games work with screen readers?
- Is there keyboard navigation for learners who cannot use a mouse?
- Are colors distinguishable for color-blind learners?
- Do animations respect `prefers-reduced-motion`?
- Is text large enough for young learners (K-2)?

**This is a gap for a children's platform and should be audited before any pilot.**

### 3.2 Mobile/tablet support
No agent tested or mentioned mobile devices. Schools increasingly use tablets (iPads, Chromebooks). Questions unasked:
- Does the 3D galaxy render on a Chromebook?
- Do drag interactions work on touchscreens?
- What is performance like on a low-end tablet?
- Does the game iframe resize correctly on small screens?

### 3.3 Offline behavior
Schools often have unreliable internet. No agent asked:
- What happens when the connection drops mid-game?
- Is learner progress lost?
- Do games that load Google Fonts fail gracefully? (Tester mentioned font fallback, but not the broader offline story.)

### 3.4 Guide experience
All agents focused on the learner and the platform. No one reviewed the GUIDE (teacher) experience:
- How does a guide monitor a class of 25 learners?
- How does a guide review submitted games efficiently?
- What does the guide dashboard look like? Is it usable?
- Can a guide intervene when a learner is stuck?

### 3.5 Onboarding / first-time experience
No agent asked what happens when a learner logs in for the first time:
- Do they understand the galaxy metaphor?
- Do they know how to find a game?
- Is there a tutorial or walkthrough?
- What happens when they click a moon with no verified game?

### 3.6 COPPA / data privacy compliance
The Security Guard covered technical security but did not mention COPPA (Children's Online Privacy Protection Act). The platform collects children's data (names, personal codes, game activity). Questions unasked:
- Is there a privacy policy?
- Is parental consent obtained?
- What data is stored and for how long?
- Is data shared with third parties (Anthropic API sends game HTML to Claude)?

**For a US school deployment, COPPA compliance is legally required.**

### 3.7 Cost projections at scale
The Historian and Tracker flagged cost as a concern but no agent modeled it:
- What does it cost per learner per month in AI API calls?
- How many AI calls does the generate-engine route make per game?
- At 100 learners, 1000 learners, 10000 learners?
- What is the Firestore read/write cost at scale?

---

## 4. CRITICAL Issues (Fix Before Any Pilot With Children)

Ordered by severity. Items marked with asterisks (*) were flagged by 3+ agents.

| # | Issue | Severity | Flagged by | Fix effort |
|---|---|---|---|---|
| **1** | **Firestore security rules MISSING*** | CRITICAL | Security, Tester, Inspector | 1-2 days |
| **2** | **API routes have no authentication*** | CRITICAL | Security, Tester, Janitor | 1-2 days |
| **3** | **Pasted games can infinite-loop/crash browser*** | HIGH | Tester, Security, Inspector | 1 day |
| **4** | **HTML sanitizer misses on* event handlers*** | HIGH | Security, Tester | 0.5 day |
| **5** | **No content moderation for pasted HTML (children's platform)** | HIGH | Security | 1 day (extend AI judge) |
| **6** | **Blueprint is dangerously misleading*** | HIGH | Historian, Janitor, Chesure, Tracker | 1 day |
| **7** | **56 unverified games still callable from code*** | HIGH | Chesure, Critic, Janitor | 0.5 day (gate registry) |
| **8** | **game_win messages trivially spoofable*** | MEDIUM | Tester, Inspector, Security | 0.5 day (nonce) |
| **9** | **Client-side Firestore writes bypass sanitizer** | MEDIUM | Security, Tester | 2 days |
| **10** | **No automated tests of any kind*** | HIGH (systemic) | Tester, Inspector, Critic | 2-3 days for baseline |
| **11** | **Hardcoded rounds not randomized*** | MEDIUM | Tester, Inspector, Chesure | 1 day |
| **12** | **Number Frames rejects commutative answers** | MEDIUM | Inspector | 0.5 day |
| **13** | **No error boundary around game iframe** | MEDIUM | Tester | 0.5 day |
| **14** | **Personal codes have weak keyspace** | LOW-MEDIUM | Security | 0.5 day |

**The first 5 items are non-negotiable before any pilot with children.** Items 1-2 are security fundamentals. Items 3-5 protect children from harmful content in pasted games. Item 6 protects the team from building the wrong thing. Item 7 prevents learners from playing unverified games.

---

## 5. Top 10 Recommendations (Synthesized Across All Agents)

### 1. Add Firestore security rules and API authentication TODAY
**Source:** Security Guard (C1, C2)
Write `firestore.rules` that locks each user to their own data. Add Firebase ID token verification to every API route. The `topup-tokens` route is the most urgent -- anyone on the internet can inflate every student's token balance right now. This is the only item where "before the next git push" is the correct deadline.

### 2. Restructure the Blueprint with a "Current State" box and archive legacy sections
**Source:** Historian (C1, C2), Janitor (C -- P3 items 12-13)
Add a block at the very top: "2 verified standards, 1 engine, plain HTML/CSS/JS, NOT Phaser." Move the 700+ lines of Phaser engine specs to a clearly labeled LEGACY section. Add a Decisions Register. This prevents any agent from building the wrong thing tomorrow.

### 3. Gate the Circuit Board Builder to show only verified games
**Source:** Janitor (P2 item 10), Chesure (C1), Critic (Fix 1)
The game option registry advertises 65 options but only 1 is verified. The builder UI should only show options that exist in `standard-game-options.ts`. Move legacy engines out of ENGINE_REGISTRY or add a verified flag. A learner should never be able to reach an unverified game.

### 4. Set up a baseline automated test suite
**Source:** Tester (C1, C2), Inspector (C1, C2)
Install Vitest. Write tests for: `getGameOptionsForStandard()` returns correct options, sanitizer strips known attack vectors, hardcoded rounds have correct answers and valid items arrays, Number Frames generates valid HTML. Add a Playwright smoke test that loads each verified game in a headless browser and simulates a win. Run on CI before every merge to main.

### 5. Add timeout and content safety for pasted HTML games
**Source:** Tester (C3), Security (C3, C6), Inspector (D1)
Inject a timeout guard into pasted game scripts (kill after 10 seconds of loop). Strip all on* event handlers in the sanitizer. Extend the AI judge prompt to scan for profanity, phishing, and inappropriate content. Add a `contentSafe` boolean to the judge response. Block unsafe games with child-friendly feedback.

### 6. Fix Number Frames commutativity bug
**Source:** Inspector (B8, C5)
The game rejects `4+2` when the prompt says `2+4`. Addition is commutative. Accept both orderings. This is a pedagogically harmful bug -- it teaches children that order matters when it does not.

### 7. Randomize hardcoded rounds from a larger pool
**Source:** Tester (C7), Inspector (B6)
Expand from 5 fixed rounds to a pool of 15-20 verified rounds per standard. Randomly select 5 each playthrough. This prevents memorization while maintaining the quality guarantee of hardcoded content.

### 8. Make Learning Contracts the GATE, not the documentation
**Source:** Chesure (C3), Critic (Fix 5), Tracker (D3)
Flip the workflow: no game code is written until the Learning Contract is complete and Barbara-approved. Agents draft contracts; Barbara approves. The contract IS the specification. Pipeline the work: while Barbara tests Standard N, agents draft contracts for N+1 through N+5.

### 9. Batch standards by engine for faster coverage
**Source:** Tracker (D2, D4), Chesure (C2)
Map all 25 K standards to their likely engines before building more. Finish all Number Frames standards first (probably 8-12 standards). Then build the next engine and batch its standards. Barbara tests 5-8 standards in one focused session. Target: all K standards verified by May 19.

### 10. Implement learner event logging
**Source:** Historian (D1, D2), Chesure (C8)
Log every game play, win, loss, hint usage, wrong answers, and time-to-completion. Without this data, there is no way to know if games actually teach. Start with the Historian's schema (type, timestamp, learnerId, standardId, rounds, outcome). The wrong-answer data specifically enables misconception detection (Chesure C8) -- knowing WHICH wrong answer a learner chose reveals what they misunderstand.

---

## 6. The Dream -- Best Ideas Across All Agents

The Dream: "Learners learn a math concept, build a game that teaches it, play others' games to solidify understanding."

### Which agent had the strongest vision?

**Mr. Chesure** had the deepest pedagogical vision (the 4-phase ideal with research citations). **The Critic** had the most practical builder design (constrained builder with tiered permissions). **The Inspector** had the strongest technical safety net (three-layer math verification). The best plan combines all three.

### The Synthesized Dream Plan

**Phase 1: Guided Discovery (current approach, refined)**

The learner plays a verified intrinsic game for their standard. The game uses CPA progression (concrete objects first, then pictorial, then symbolic -- Chesure C4). The learner demonstrates understanding by winning without hints. This phase exists today for 2 standards.

**Phase 2: Design Challenge (the missing piece -- from Chesure D3 + Critic D Idea 1)**

After mastering a standard, the learner enters "Design Mode." They do NOT build from scratch (Critic: "they will make quiz-wrappers every time"). Instead:

1. **Play the verified game** -- experience what intrinsic integration feels like.
2. **Make mathematical decisions** (Chesure C5):
   - Choose 5 round problems from a grade-appropriate range
   - Choose the number range ("sums up to 10" vs "sums up to 20")
   - Write a one-sentence hint for stuck players
   - Predict what mistake players will make (misconception awareness)
3. **Customize within constraints** (Critic Idea 1): Pick a real-world scenario, choose visuals, write the story. But the MECHANIC is locked to the verified engine. They cannot build a quiz-wrapper because the engine does not allow it.
4. **Self-evaluate** against the 3 criteria in kid-friendly language (Critic Idea 2):
   - "Would someone really do this math in real life?"
   - "Is the math the main thing you DO, or just a question you answer?"
   - "Could someone who does not know the math still win by guessing?"

This is the smallest viable version of the Dream (Chesure D4). It is achievable with the current architecture. The Circuit Board Builder already exists. Adding a "choose your rounds" step and a "write your hint" step transforms the builder from cosmetic to pedagogical.

**Phase 3: Peer Play and Quality (from Chesure D3 + Critic Idea 4 + Inspector D6)**

Other learners play the designed game. After playing:
- Rate: "Did this game help you understand the concept?" (Chesure Phase 3)
- Challenge: try to "Break My Game" against the 3 criteria (Critic Idea 4) -- "I won without doing math" earns the reviewer tokens
- Report: "Was the math right?" per round (Inspector D6) -- community self-correction
- The designer sees aggregate feedback and can redesign

**Phase 4: Tiered Advancement (from Critic Idea 3)**

- **Level 1 (new):** Customize theme only on verified engines. Mechanic locked.
- **Level 2 (5+ standards mastered):** Adjust parameters (number ranges, difficulty, round count).
- **Level 3 (15+ standards):** HTML Modding Lab. CSS/HTML edits, scripts locked.
- **Level 4 (25+ standards):** Paste external HTML games. Full evaluation pipeline.

This progression means only learners who have internalized good game design earn unconstrained building. By Level 4, they know what intrinsic means because they have PLAYED dozens of intrinsic games.

**Phase 5: Game Design AS Assessment (long-term, from Chesure D5)**

The design choices themselves reveal understanding. Mr. Chesure analyzes:
- Did the learner use appropriate number ranges?
- Did they identify a real misconception in their hint?
- Did they create a valid difficulty progression?

Game design becomes a formative assessment that does not feel like a test. This is the holy grail of educational technology.

**Technical Safety Net for Pasted Games (from Inspector D2 + Security D + Tester D1)**

Four-layer defense for Level 4 pasted games:
1. **Sanitization** (instant): DOMPurify (not regex), CSP injection, strip on* handlers and external URLs (Security)
2. **Automated checks** (5 seconds): Headless sandbox execution, infinite-loop detection, math extraction and arithmetic verification, postMessage integration check (Tester + Inspector)
3. **AI judge** (10 seconds): 3-criteria evaluation + content safety scan + prompt injection resistance (Security + Inspector)
4. **Human review**: Guide approval required before publication. Peer reporting after publication. Auto-hide after 3 reports. (Security Layer 4-5)

**The key insight across all agents:** The Dream is pedagogically sound (Chesure cites Kafai 1995, Harel & Papert 1991, Chi 2009). But the current "build" step is cosmetic. The fix is not to give learners more freedom -- it is to make the constrained building process force mathematical thinking. The learner who chooses round problems, writes hints, and predicts misconceptions is doing deeper math than the learner who solves the problems.

---

## Appendix: Agent Quality Assessment

| Agent | Strongest contribution | Missed anything? |
|---|---|---|
| **Chesure** | Research-backed pedagogy vision. 4-phase ideal. CPA gap analysis. | Could have been more specific about WHICH 56 games to test first. |
| **Critic** | Tiered builder permissions. "Break My Game" challenge. Checklist-based quality gate. | Counted only 1 verified game (should be 2 with K.OA.A.3 pending). |
| **Tester** | Zero-tests finding. Specific code-level bugs (B7 static rounds, B8 font loading). Playwright smoke test plan. | Did not flag the commutativity bug (Inspector caught it). |
| **Inspector** | Commutativity bug. Silent fallback round danger. Math extraction for pasted games. | Could have tested whether fallbacks actually fire in practice. |
| **Security** | Firestore rules gap. Unauthenticated API routes. on* handler bypass. Content moderation for children. | Did not mention COPPA compliance. |
| **Historian** | Blueprint contradictions. Decisions Register idea. Learner event logging schema. | Did not connect stale docs to agent failure risk with specific scenarios. |
| **Janitor** | Precise dead-code inventory (line counts, file lists). Three-generation architecture map. Registry gating. | Could have flagged bundle size impact of legacy code. |
| **Tracker** | Honest numbers. Pace projections. Pipeline parallelization strategy. Celebration milestones. | Did not address what happens if the fellowship pilot needs more than K standards. |

**Overall assessment:** The 8-agent model works. Each agent found issues the others missed. The highest-value findings came from convergence (issues flagged by 3+ agents). The biggest collective blind spot was non-functional requirements (accessibility, mobile, COPPA, guide experience).

---

*Filed by the Orchestrator. This report synthesizes all 8 agent reviews into a single action plan. The top 5 critical items (Firestore rules, API auth, pasted game safety, sanitizer fix, content moderation) must be resolved before any child uses this platform.*
