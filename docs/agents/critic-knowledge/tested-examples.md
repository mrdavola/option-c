# The Critic — Real Tested Examples

These are games Barbara actually tested and judged. NOT invented.
Use these as reference when evaluating new games.

---

## FAIL Examples

### FAIL 1: Mystery-Side v1 (Balance Systems)
**Standard:** 6.EE.B.7 (Solve x + p = q)
**What it did:** Scale with two pans. Learner dragged unit weights onto the left pan until the scale balanced.
**Why it failed:**
- Criterion 2 FAIL: The action (adding unit weights) = counting to a target. Grade-1 skill disguised as grade-6 algebra. The actual math operation (inverse operations — subtract from both sides) was not present.
- Classified as: FAKE INTRINSIC. Looked physical but was just counting.
**Barbara's words:** "How does this teach you a math concept? I have the number 10 on one side and I need to put weights until I see that it reaches 10."

### FAIL 2: Recipe Mixer for Cube Volume
**Standard:** 6.EE.A.2c (Evaluate expressions with exponents)
**What it did:** Showed "A skeleton's bone chest is a cube-shaped relic box with sides 2 feet. Using the formula V=s³, calculate the volume." Then had buttons for flour and sugar.
**Why it failed:**
- Criterion 1 FAIL: Flour and sugar have nothing to do with volume formulas.
- Criterion 2 FAIL: The game mechanic (clicking flour/sugar amounts) doesn't connect to the math (V=s³).
- Wrong game for the standard entirely.
**Barbara's words:** "What is V and what is s?? And then it had a button for flour and sugar."

### FAIL 3: Free Collect with Target 3
**Standard:** K.OA.A.1 (Represent addition)
**What it did:** Target shown as "3". Tray had tiles labeled [4, 6, 3, 7, 2]. Learner clicked the "3" tile.
**Why it failed:**
- Criterion 3 FAIL: Learner just matched the number "3" visually. No addition happened. No combining of groups.
- Numbers on tiles let learner match without counting.
**Barbara identified:** "The game doesn't require addition. Just picking the matching number."

### FAIL 4: Conveyor Belt with Apples/Oranges
**Standard:** Ratios (6.RP)
**What it did:** Underwater theme with shells and seahorses. But math prompt said "3 apples for every 2 oranges."
**Why it failed:**
- Criterion 1 FAIL: The themed world (underwater, shells) had nothing to do with the math prompt (apples, oranges). The math wasn't used like in the real world — it was disconnected from the game world.
- AI-generated rounds used generic objects instead of themed objects.

### FAIL 5: Desert Runner (Mystery-Side themed)
**Standard:** 6.EE.B.7 (Solve equations x + p = q)
**What it did:** Game was called "Desert Run." Character was "Desert Athlete in Scorching Desert." But the actual game showed a scale with blocks — a math manipulative that has nothing to do with running in a desert.
**Why it failed:**
- Criterion 1 FAIL: The backstory (athlete in desert) has zero connection to equation solving. A real scenario would be: "You have $3 and need $10 total — how much more do you need?"
- The theme was cosmetic decoration. The math mechanic (scale with blocks) was completely disconnected from the story.
**Barbara's words:** "The scale and the boxes have nothing to do with the athlete in the scorching desert I chose."
**Key lesson:** This is what happens when AI generates themes without understanding the math. The theme must REQUIRE the math, not just decorate it.

### FAIL 6: Elevator Operator for Equations
**Standard:** 6.EE.B.7 (Solve equations x + p = q)
**What it did:** Up/down elevator buttons, picking up passengers at floors.
**Why it failed:**
- Wrong game for the standard. Elevator operator teaches integer number lines and floor arithmetic, not equation solving.
- The per-standard mapping had offered the wrong game options (keyword matching, not pedagogy matching).

### FAIL 7: Scenario Gate — Red/green answer reveal
**Component:** ScenarioGate Step 1 ("Real or Made Up?")
**What it did:** When learner submitted wrong answers, the UI highlighted each card in red (wrong) or green (right), showing EXACTLY which ones they got wrong before resetting.
**Why it failed:**
- Criterion 3 FAIL: Learner can learn the answer from UI colors instead of thinking. Just memorize which were red, flip those on retry.
- Violates Mr. Chesure's Self-Revealing Truth: correctness should come from understanding, not from the UI telling you.
**Fix:** Reset ALL cards to neutral on wrong answer. No per-card feedback. Just "not quite — try again."
**Barbara's words:** "When I click one wrong, it then shows me in red the one that was wrong, which it should never do."

**Rule for all future gates/games:** NEVER show which specific answers were right or wrong on a retry. Just indicate the overall attempt failed and reset. The learner figures out their mistake by thinking, not by reading colors.

### FAIL 9: Auto-reset timer on wrong answers
**Component:** ScenarioGate Steps 1 and 2
**What it did:** Wrong answer message appeared for 1.5-3.5 seconds then auto-reset. Learners couldn't read the message at their own pace.
**Why it failed:** Different learners read at different speeds. Auto-timers either disappear too fast (can't read) or too slow (confusing wait). The learner should control the pace.
**Fix:** Replace all auto-reset timers with a "Try again" button. Message stays until learner clicks.
**Barbara's words:** "Have a button that says 'Try again' so the message can be read at whatever speed the learner needs."

**Rule:** NEVER use auto-reset timers after wrong answers. Always use a manual "Try again" button so the learner controls the pace.

### FAIL 10: Fix options duplicate the wrong answer
**Component:** ScenarioGate Step 2 fix options
**What it did:** The broken panel said "5 × 3 = 15 strawberries!" and one of the fix options was identically "5 × 3 = 15 strawberries!"
**Why it failed:** Why would the correct fix be the same as the broken text? It's confusing and makes no sense. All options must be DIFFERENT from each other AND different from the broken text.
**Fix:** Changed duplicate option to "3 + 5 = 9 strawberries!" (wrong answer but different from the original).

### FAIL 8: Scenario Gate — "Real or Made Up?" framing
**Component:** ScenarioGate Step 1 title
**What it did:** Asked learners to sort vignettes into "Real World" vs "Made Up."
**Why it failed:**
- "Made Up" implies fiction. A wizard CAN use real math. A fictional baker CAN use real addition. The question isn't whether the character is real — it's whether the math is NEEDED.
**Fix:** Changed to "Is the math actually needed?" with buttons: "Yes, math is needed" / "No, math isn't really used."
**Barbara's words:** "A wizard can use real math and then it would be Real, even though the wizard is a made up character."

---

## PASS Examples

### PASS 1: Number Frames — Add Mode (K.OA.A.1)
**Standard:** K.OA.A.1 (Represent addition with objects)
**What it does:** Two ten-frames. Dot cluster prompt (no digits). Learner places counters in each frame. Presses Done. Taps each counter to count (no running total). Picks answer from number pad. Equation shown only AFTER correct answer.
**Why it passes:**
- Criterion 1: Ten-frames are a real-world classroom manipulative (Singapore Math standard).
- Criterion 2: Every action IS math — placing counters = constructing quantities, tapping = counting, combining = addition.
- Criterion 3: No digits shown during play. No running count. Wrong answers shake (don't fade). Must actually count.
**Barbara's words:** "Ok that was perfect."

### PASS 2: Number Frames — Decompose Mode (K.OA.A.3)
**Standard:** K.OA.A.3 (Decompose numbers ≤10 into pairs)
**What it does:** Total shown as dot cluster. Learner splits into two groups across two frames. Any valid split accepted (3+2, 4+1, etc.).
**Why it passes:**
- Multiple valid answers = genuine mathematical thinking, not pattern matching.
- Learner decides the decomposition — the game doesn't suggest it.
- Equation shown after: "3 + 2 = 5" records what THEY chose.
