# When You're Back — Status Summary
**April 13, night**

## What I found while you were away

### The hidden flaw runs deep
We thought we had 87 great intrinsic games. After applying the strict two-test criterion (Discovery + Self-Revealing Truth), we actually have **11 truly intrinsic games** (13%).

Most engines fall into three buckets:
- **11 TRULY INTRINSIC** — all Montessori, partitioning (cut-the-bar, pour-the-liquid), expression-transformer. These are our models.
- **7 FAKE INTRINSIC** — free-balance, mystery-side (v1), chain-scales, free-collect, conveyor-belt, split-the-loot, stack-to-target. These look physical but are disguised counting/selection. Most dangerous category.
- **47 QUIZ-WRAPPER** — explicit text-question → pick-an-answer games.
- **6 PRACTICE-ONLY overlays** (Snake Math etc.) — acceptable as Rapid Fire Practice after mastery.

Full audit: **[docs/intrinsic-audit-strict.md](intrinsic-audit-strict.md)**

## What I rebuilt

### ✅ mystery-side v2 — "Keep the Scale Level"

The old version was fake-intrinsic: drag unit weights to count up to target. Grade-1 skill pretending to be grade-6 algebra.

The new version teaches REAL inverse operations:
- Scale starts **already balanced**: left has `x + p` (mystery box + p blocks), right has `q` blocks
- Equation shown at top: `x + 3 = 10`
- Player's ONLY tool: buttons that remove the SAME amount from BOTH sides
- Can undo mistakes
- When only the mystery box remains on the left, the right side IS the value of x
- Player DISCOVERS that to solve for x, you must do the same to both sides

### ✅ Three major bug fixes earlier today
1. Build NOW (Eureka) now uses per-standard mapping (was offering all options for all standards)
2. AI rounds now receive game theme (so it says "shells" not "apples" in ratio problems)
3. Circuit Board Builder now actually uses the per-standard mapping (render code was ignoring it and doing keyword matching instead — this affected ALL 466 moons!)

## What to test when you're back

1. **Refresh your browser** on http://localhost:3000
2. **Search 6.EE.B.7** → click result → moon card opens
3. **Click Build Your Game** → should see Mystery Side, Free Balance, Chain Scales
4. **Pick Mystery Side** → build game → test the new "remove from both sides" mechanic

Expected experience: equation like "x + 3 = 10". Click "−3" button. Scale still balanced. Left has only x. Right has 7. You see "x = 7" and the mystery box reveals the answer. That's algebra — the math-teacher-approved way.

## Known issues

- **Anthropic API limit reached** until May 1. Games will use fallback math instead of standard-tailored rounds.
- **Hint card is generic** for this standard (fallback). Fixing this is already pending in the roadmap (hardcoded hints for all 466 standards).

## What's next

Still fake-intrinsic and needing rebuilds:
- `free-balance` — same problem as mystery-side v1 (weight selection dressed as physics)
- `chain-scales` — same problem
- `free-collect`, `conveyor-belt`, `split-the-loot` — hide numeric labels, use visual groupings
- `stack-to-target` — drag unlabeled blocks, visual reasoning

Still need deeper review:
- `resize-tool`, `cuisenaire-rods`, `tangram-fill` — might be intrinsic, might not

Not doing:
- 47 quiz-wrappers won't get redesigned until you decide for each: rebuild intrinsically, move to Rapid Fire Practice, or remove.

## Questions for you

1. **For the 47 quiz-wrappers:** Do you want me to try to redesign each intrinsically (huge effort), or mark most as "post-mastery practice only" (smaller effort, more honest)?
2. **For the 7 fake-intrinsic games:** Ready for me to rebuild them all using the same approach as mystery-side v2?
3. **Should we document "the 11 truly intrinsic games" pattern** so future game designers have a template?

I'll wait for your direction when you're back.
