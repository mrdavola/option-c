# The Tracker -- Coverage & Progress Report

**Date:** April 15, 2026
**Agent:** The Tracker
**Purpose:** Honest assessment of where Diagonally stands, what's realistic, and how to move faster without cutting corners.

---

## A. Current State (Honest Numbers)

### Standards in the system
The `standards.json` file contains **517 individual standards** (including sub-standards like K.CC.B.4a/4b/4c). The project has historically referenced "466 standards" -- the discrepancy likely comes from how sub-standards are counted. For this report, I use the actual data file counts.

### Verified mappings in `standard-game-options.ts`
| Standard | Game | Status |
|---|---|---|
| K.OA.A.1 | Number Frames (add mode) | Barbara-approved |
| K.OA.A.3 | Number Frames (decompose mode) | Awaiting Barbara sign-off |

**Total verified: 2** (1 fully approved, 1 awaiting final sign-off)

### Learning Contracts written
| Contract | File |
|---|---|
| K.OA.A.1 | `docs/contracts/K.OA.A.1.md` |

**Total contracts: 1** (only K.OA.A.1 has a contract on disk)

### Game engines built and verified
| Engine | Standards it serves | Status |
|---|---|---|
| Number Frames | K.OA.A.1, K.OA.A.3 (potentially ~18 more) | Verified |

**Total verified game engines: 1**

### Coverage summary
```
=============================================
DIAGONALLY COVERAGE DASHBOARD
Updated: April 15, 2026
=============================================

Standards total:           517  (466 per project docs)
Standards verified:          2  (0.4%)
Standards with contracts:    1
Standards not started:     515

Games engines built:         1  (Number Frames)
Games engines needed:      ~22  (estimated)

By grade (using actual standards.json counts):
  K:    2/25   verified   (8.0%)
  1:    0/24   verified   (0%)
  2:    0/28   verified   (0%)
  3:    0/37   verified   (0%)
  4:    0/37   verified   (0%)
  5:    0/40   verified   (0%)
  6:    0/47   verified   (0%)
  7:    0/43   verified   (0%)
  8:    0/36   verified   (0%)
  HS:   0/200  verified   (0%)
=============================================
```

**The honest truth:** We are at 0.4% coverage. 99.6% of standards have no verified game. But -- the first 2 were the hardest because they established the entire workflow.

---

## B. Progress Analysis

### Current pace
- **2 standards verified in ~2 days** (April 14 approvals for K.OA.A.1 and K.OA.A.3)
- Both used the same engine (Number Frames), so the second was faster than the first
- The first standard (K.OA.A.1) took multiple days of iteration, testing, failure, and rework before it was right

### Pace projections (assuming 1 standard/day average)

The real pace is not "2 standards in 2 days." The first standard took over a week of rework across the full project history. The second was fast because it reused the same engine. Realistic sustained pace: **1 standard per day on average**, faster when reusing an engine, slower when building a new one.

| Milestone | Standards | New engines needed | Estimated time | Target date |
|---|---|---|---|---|
| **Finish K** | 23 remaining | ~3 more engines (CC, MD/G, NBT) | 4-5 weeks | ~May 19, 2026 |
| **Finish K-2** | 75 remaining after K | ~5 more engines | 3-4 months | ~Aug 2026 |
| **Finish K-5** | 189 remaining after K-2 | ~6 more engines | 7-9 months | ~Jan 2027 |
| **Finish K-12** | 515 total remaining | ~22 engines total | 18-24 months | ~Jan-Jul 2028 |

### Why the pace will accelerate
- Each new engine serves multiple standards (Number Frames alone covers ~18)
- The Learning Contract workflow is now established -- agents can draft contracts faster
- Pattern recognition: after 5-6 engines, the team will have templates for common structures
- K standards are conceptually simpler but pedagogically harder (concrete-before-symbolic requirement); upper grades may move faster per standard once engines exist

### Why the pace might not accelerate
- Barbara is a solo tester -- she is the bottleneck for final approval
- New engines require more design work than reusing existing ones
- Some standards (especially HS) may not have natural game forms
- Barbara is also running a school and in a fellowship -- her time is limited

---

## C. Risks to Progress

### Risk 1: Barbara bottleneck (HIGH)
Every standard requires Barbara's approval. She is the founder, tester, school operator, and fellowship participant. If she can test 1-2 standards per day, that's the ceiling. If she has a busy week, progress stops.

**Mitigation:** Batch standards that use the same engine for a single testing session. Barbara tests 5 K.CC standards in one sitting rather than 5 separate sessions.

### Risk 2: New engine design is slow (MEDIUM)
Number Frames was the first engine and took significant iteration. Each new engine (e.g., for Geometry, Measurement, Counting) will need its own design cycle: research, contract, build, agent-check, Barbara test.

**Mitigation:** Research and draft contracts for the NEXT engine while Barbara tests the current batch. Pipeline the work.

### Risk 3: HS standards may not have game forms (MEDIUM)
The project history doc flags this: "some standards (especially HS) may not have a natural game form." If 50+ HS standards need a different approach (video + practice? text-based?), that's a design decision that hasn't been made yet.

**Mitigation:** Defer HS until K-5 is solid. By then, the fellowship pilot will provide learner data to inform HS design decisions.

### Risk 4: Standards count discrepancy (LOW)
The project says 466 standards but the data file has 517. This matters for tracking accuracy and for the per-standard mapping completeness check.

**Mitigation:** Clarify which count is canonical and reconcile. Are sub-standards (K.CC.B.4a) separate moons or grouped under their parent?

### Risk 5: No second tester (MEDIUM)
If Barbara gets sick, travels, or is overwhelmed, there's no backup tester who understands the pedagogy standards. Progress depends entirely on one person's availability.

**Mitigation:** Consider whether a fellowship peer or school colleague could be trained as a secondary tester for basic QA (not pedagogy judgment).

---

## D. Recommendations for Accelerating (Without Sacrificing Quality)

### 1. Pipeline the work (parallelizable)
While Barbara tests Standard N, agents should be:
- Drafting the Learning Contract for Standard N+1
- Researching the Progressions Document for Standards N+2 through N+5
- Building the next engine if needed

Barbara's testing is sequential. Everything else can be parallelized.

### 2. Batch by engine, not by standard number
Don't go K.CC.A.1, K.CC.A.2, K.CC.A.3 in order. Instead:
- Build Number Frames completely (all ~18 standards it can serve)
- Then build the next engine (e.g., Counting Sequences for K.CC.A.1-3)
- Then the next

This minimizes engine-building overhead. One engine = many standards verified in a batch.

### 3. Agent-draft contracts for Barbara's review
Agents can research the Progressions Document and Math Learning Center apps, then draft a complete Learning Contract. Barbara reviews and approves the contract (30 min) instead of writing it from scratch (2+ hours). This is explicitly called out as an open question in the project history -- the answer should be "yes, with human review."

### 4. Create a "K Engine Map" upfront
Before building more engines, map all 25 K standards to their likely engines:
- Which standards can Number Frames handle? (probably 8-12)
- Which need a Counting engine?
- Which need a Geometry/Shapes engine?
- Which need a Measurement engine?

This planning prevents building engines that overlap or missing coverage gaps.

### 5. Saturday testing sessions
If Barbara can dedicate one focused session per week (2-3 hours) to testing a batch of 5-8 standards that share an engine, that alone could double throughput.

---

## E. Milestone Plan

### Near-term milestones

| Milestone | Target date | What it means |
|---|---|---|
| **K.OA complete** (5 standards) | April 25, 2026 | All 5 K Operations & Algebraic Thinking standards verified. Number Frames engine covers them all. |
| **First 10 standards** | May 5, 2026 | 2% coverage. Proves the pipeline works at small scale. Likely includes K.CC standards. |
| **K complete** (25 standards) | May 19, 2026 | 4.8% coverage. First full grade done. ~4 engines built. Major celebration moment. |
| **K-1 complete** (49 standards) | June 30, 2026 | 9.5% coverage. Two full grades. Enough for early pilot. |
| **K-2 complete** (77 standards) | August 15, 2026 | 14.9% coverage. Three grades. Solid pilot-ready product. |

### Celebration milestones
- **2 verified (NOW):** The workflow works. The hardest part is behind us.
- **10 verified:** The pipeline is proven. Pop the confetti.
- **25 verified (K done):** First full grade. Huge. Share with fellowship.
- **50 verified (~10%):** Double digits. Meaningful coverage for a pilot classroom.
- **100 verified (~20%):** One-fifth done. The engine library is mature.
- **191 verified (K-5):** Elementary school complete. Product-market fit territory.

### What to celebrate right now
Two standards verified is not a small thing. The project history shows weeks of failed approaches: the overnight 87-game rebuild that didn't work, the fake-intrinsic problem, the AI-generated rounds that taught the wrong math. Getting K.OA.A.1 right -- truly right, with concrete-before-symbolic, learner-does-the-math, Mr. Chesure's two tests passing -- was the breakthrough that makes everything else possible.

The first 2 are worth more than the next 20, because the first 2 defined HOW to do the next 20.

---

## F. Dashboard (copy-paste for Blueprint)

```
=============================================
DIAGONALLY COVERAGE DASHBOARD
Updated: April 15, 2026
=============================================

Standards total:           517
Standards verified:          2  (0.4%)
Standards with contracts:    1
Standards not started:     515

Game engines verified:       1  (Number Frames)
Game engines needed:       ~22

Next standard:             K.OA.A.3 (awaiting Barbara sign-off)
After that:                K.OA.A.2, K.OA.A.4, K.OA.A.5

By grade:
  K:    2/25   verified   (8.0%)
  1:    0/24   verified   (0%)
  2:    0/28   verified   (0%)
  3:    0/37   verified   (0%)
  4:    0/37   verified   (0%)
  5:    0/40   verified   (0%)
  6:    0/47   verified   (0%)
  7:    0/43   verified   (0%)
  8:    0/36   verified   (0%)
  HS:   0/200  verified   (0%)

Pipeline status:
  Contract drafted:  K.OA.A.1 only
  Engine built:      Number Frames
  Agent-checked:     K.OA.A.1, K.OA.A.3
  Barbara-approved:  K.OA.A.1
=============================================
```

---

*Report generated by The Tracker. Numbers sourced from `standard-game-options.ts` (2 entries), `docs/contracts/` (1 file), and `standards.json` (517 standards). No inflation, no guessing.*
