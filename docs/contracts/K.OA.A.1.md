# Learning Contract — K.OA.A.1

**Status:** Contract filled April 14, 2026. First reference implementation.

---

## 0. Research — how this is traditionally taught

**Montessori:** Golden Beads + Addition Strip Board. Two groups of physical objects. Learner counts each separately, combines physically, counts total. Strip Board: colored strips of length 1–9 placed end-to-end on a numbered grid.

**Singapore Math (CPA):** Ten-frames (2×5 grids). Learner places counters in each frame per addend. Combining fills one frame, spills to next. Two-step counting: each addend, then total.

**Shared principle:** The learner places objects to represent each addend (first counting act), combines physically, then counts the total (second counting act). The system never counts for the learner.

Sources: Montessori Theory on Addition, Singapore Math Coach's Corner, CPA approach research.

---

## 1. Raw description
"Represent addition and subtraction with objects, fingers, mental images, drawings, sounds (e.g., claps), acting out situations, verbal explanations, expressions, or equations."

*(Hidden in learner UI. Shown only when standard ID is explicitly clicked.)*

## 2. Kid-friendly label
**"Add and take away things"**

## 3. Observable learning objective
The learner can combine two groups of objects (sum ≤ 10), count the combined set, and state the total. Also: remove objects from a group and count what's left.

## 4. Prerequisite knowledge
Learner can count objects 1–10 one at a time.

## 5. Misconception / shortcut audit
- Matching numerals visually without combining
- Guessing based on pattern
- Having the system display the running count as they tap (REMOVED)

## 6. Required action
Place correct count of counters for each addend (no number shown). Physically combine. Count the total by tapping each counter. Select answer from number pad.

## 7. Game mechanic — "Ten-Frame Combine"

**Setup:**
- Off-white workspace (#fafafa)
- Prompt at top: e.g., `3 + 4`
- Two empty ten-frames side by side (2×5 grids each)
- Bottom: counter tray

**Phase 1:** Fill left ten-frame to show first addend.
Learner taps cells. **No count shown.** Click "Done" → if correct count, soft green glow. If wrong, wobble, try again.

**Phase 2:** Fill right ten-frame for second addend. Same flow.

**Phase 3:** "Combine!" button. Counters from right frame slide into left, filling and overflowing to second frame. **No number shown.**

**Phase 4:** Count total. Learner taps each counter — tapped ones darken. **No running count.** Once all tapped, number pad appears (5 answer options). Learner picks the total. System verifies AFTER commit.

**Subtraction variant:** Start with total in frames. Prompt: "Take N away." Learner drags N counters off. Then counts remaining.

## 8. Success criteria
Correct placement of each addend + correct total picked from number pad.

## 9. Intervention when stuck
- Wrong addend count → counters wobble. No penalty. Try again.
- Wrong total → number button SHAKES (does not fade — prevents brute force). Counters reset to untapped. Number pad hides. Learner must recount.
- Third failure on total → hint: "Try counting one at a time, point to each counter."

## 10. Real-world scenarios (approved earlier)
- **Penny Jar** (money) — 4 + 3 = 7 pennies. Grandma / kitchen / coin.
- **Fish Tank** (animals) — 6 + 2 = 8 fish. Diver / underwater / shell.
- **School Bus** (transport) — 5 + 1 = 6 kids. Explorer / city / star.

## 11. Hardcoded rounds
1. 2 + 1 = 3
2. 4 + 2 = 6
3. 3 + 3 = 6
4. 7 − 2 = 5
5. 5 + 4 = 9

## 12. Visual spec
- Background: #fafafa
- Counters: navy solid circles (#1e3a8a)
- Ten-frames: light gray outline (#e5e5e5)
- Number pad: soft gray buttons, black digits
- Success: gentle green glow + small checkmark
- No arcade effects, no score, no hearts

## 13. Related standards covered by this mechanic
- K.OA.A.2 (word problems within 10)
- K.OA.A.5 (fluency within 5)
- Partial: K.OA.A.4 (make 10)
- NOT K.OA.A.3 (decomposing pairs — needs number bonds mechanic)

## 14. Test gate
Barbara plays 5 rounds on localhost. Checks: does the experience teach "addition = combining and counting"? If yes, ship. If no, revise and re-test.
