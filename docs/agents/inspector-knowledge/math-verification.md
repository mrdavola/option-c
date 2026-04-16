# Inspector Knowledge: Math Verification Procedures

---

## How to verify a game's math is correct

### Step 1: Extract the rounds
Read the game's HTML/JS. Find the round data (usually an array of objects with prompt, target, items, answer fields). List each round.

### Step 2: Verify each round's arithmetic
For each round, compute the answer independently:
- Addition: a + b = ? → verify the `answer` field matches a + b
- Subtraction: a - b = ? → verify `answer` = a - b
- Decomposition: total = a + b → verify a + b = total AND both a,b ≥ 1

### Step 3: Check commutativity
If the game validates by checking frameA === r.a AND frameB === r.b, it will REJECT valid commutative answers (e.g., learner puts 4 in left and 2 in right for "2 + 4", which is mathematically correct).

**Known bug (caught April 16, 2026):** Number Frames rejects commutative answers. The fix: accept frameA===r.a && frameB===r.b OR frameA===r.b && frameB===r.a.

### Step 4: Verify distractors are wrong
In the number pad, check that NONE of the distractor values equal the correct answer. All distractors should be plausible (close to the answer) but incorrect.

### Step 5: Check the prompt matches the round
The visual prompt (dot clusters, text, equation) should represent the SAME problem as the round data. If the prompt shows 3 dots + 2 dots but the round data says a=4, b=1, there's a mismatch.

### Step 6: Check the answer is reachable
Given the game mechanic, can the learner actually produce the correct answer? If the target is 11 but the ten-frame only holds 10, the answer is unreachable.

---

## Common math errors in games

1. **Off-by-one:** Answer is 7 but game accepts 8 (or vice versa)
2. **Wrong operation:** Prompt says "subtract" but round data adds
3. **Commutativity rejection:** 3+4 accepted but 4+3 rejected
4. **Distractor = correct answer:** Two buttons show the same number
5. **Unreachable answer:** Game mechanic can't produce the target value
6. **Wrong grade level:** K standard but numbers go above 10
7. **Inconsistent difficulty:** Round 3 is easier than round 1

---

## Verification checklist (run for every game)

- [ ] All rounds' arithmetic is correct
- [ ] Commutative answers are accepted (where applicable)
- [ ] All distractors ≠ correct answer
- [ ] Prompt matches round data
- [ ] Answer is reachable via the game mechanic
- [ ] Numbers are grade-appropriate
- [ ] Difficulty progresses across rounds
- [ ] The standard description matches what the game actually tests
