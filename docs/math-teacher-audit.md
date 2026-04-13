# Math Teacher Audit: Standard-to-Game-Option Mappings

**Date:** 2026-04-11
**Auditor:** Expert math teacher (Common Core specialist)
**File audited:** `src/lib/standard-game-options.ts`
**Total standards mapped:** 466

## Evaluation Criteria

- **PERFECT** -- The game option's interaction directly and intrinsically requires the math skill. A student CANNOT win without understanding and applying the exact concept.
- **SO-SO** -- The game option somewhat relates to the math but the connection is indirect or the gameplay could be won without deeply understanding the concept.
- **WRONG** -- The game option does NOT test the math concept. The player could win without knowing the math at all.

---

## 1. Summary Counts

| Rating  | Count | Percentage |
|---------|-------|------------|
| PERFECT | 262   | 56.2%      |
| SO-SO   | 175   | 37.6%      |
| WRONG   | 29    | 6.2%       |

---

## 2. ALL WRONG Matches

### K.CC.A.1 -- "Count to 100 by ones and tens" -> sorting-lane, number-line-drop
**WRONG for sorting-lane:** Sorting items into ascending order does not require counting to 100 by ones and tens. Sorting tests comparison/ordering, not the counting sequence itself. A student could sort 5 numbers without knowing how to count to 100.

### K.CC.A.2 -- "Count forward from a given number" -> sorting-lane, number-line-drop
**WRONG for sorting-lane:** Same issue as K.CC.A.1. Sorting does not require counting forward from a given number.

### K.CC.A.3 -- "Write numbers 0-20" -> number-line-drop, sorting-lane
**WRONG for both:** Neither game involves writing numbers. Number-line-drop is about placing numbers at positions, and sorting-lane is about ordering. Writing numerals is a motor/notation skill these games don't test.

### 1.MD.B.3 -- "Tell time in hours and half-hours" -> number-line-drop, sorting-lane
**WRONG for both:** Neither game involves reading a clock or understanding time. Number-line-drop places numbers on a line. Sorting-lane orders values. Neither presents clock faces or time concepts.

### 2.MD.C.7 -- "Tell time to nearest 5 min" -> number-line-drop, sorting-lane
**WRONG for both:** Same issue as 1.MD.B.3. These games have nothing to do with reading analog/digital clocks.

### 2.MD.C.8 -- "Word problems with coins/bills" -> free-collect, recipe-mixer
**WRONG for recipe-mixer:** Recipe-mixer sets ingredient amounts. It does not involve money, coins, or bills. The connection to monetary word problems is absent.

### 3.MD.A.1 -- "Tell time to nearest minute" -> number-line-drop, ruler-race
**WRONG for both:** Neither game involves clock-reading. Ruler-race measures lengths with a ruler. Number-line-drop places numbers. Time-telling requires reading clock faces, which neither game provides.

### 4.NBT.A.1 -- "Digit represents 10x place to right" -> investment-sim, potion-lab
**WRONG for both:** Investment-sim involves picking multipliers to reach a target. Potion-lab combines ingredients with multiplied factors. Neither specifically tests understanding that a digit in one place represents ten times what it represents in the place to its right. This is a place-value comprehension standard, not a multiplication standard.

### 5.NBT.A.1 -- "Digit = 10x place to right, 1/10 place to left" -> investment-sim, potion-lab
**WRONG for both:** Same issue as 4.NBT.A.1. These games involve multiplication/growth, not place-value structure understanding.

### N-CN.A.1 -- "Complex number i; a+bi" -> depth-navigator, number-line-drop
**WRONG for both:** Depth-navigator uses a vertical number line with positive/negative integers (sea level context). Number-line-drop places numbers on a line. Neither game introduces or requires understanding of the imaginary unit i or complex numbers a+bi. Negative numbers are not complex numbers.

### N-CN.A.2 -- "Add/subtract/multiply complex numbers" -> potion-lab, recipe-mixer
**WRONG for both:** These games combine ingredients via real-number arithmetic. Neither involves complex number operations (no imaginary components).

### N-CN.A.3 -- "Conjugate; moduli; quotients of complex numbers" -> potion-lab, elimination-grid
**WRONG for both:** Neither game involves complex conjugates, moduli, or division of complex numbers.

### N-CN.B.4 -- "Complex plane, rectangular/polar" -> coordinate-hunter, number-line-drop
**WRONG for both:** Coordinate-hunter uses a standard real coordinate plane. Number-line-drop uses a real number line. Neither introduces the complex plane or polar form.

### N-CN.B.5 -- "Complex operations geometrically" -> coordinate-hunter, rotate-to-match
**WRONG for both:** Neither game represents complex number operations geometrically. Rotate-to-match rotates shapes in 2D space but not in the context of complex multiplication.

### N-CN.B.6 -- "Distance/midpoint in complex plane" -> coordinate-hunter, map-distance
**WRONG for coordinate-hunter:** While coordinate-hunter involves clicking coordinates, it operates on the real coordinate plane, not the complex plane. The concept of complex-number distance/midpoint is not tested.

### N-CN.C.8 -- "Polynomial identities -> complex" -> pattern-machine, mystery-side
**WRONG for both:** Pattern-machine finds input-output rules. Mystery-side finds hidden values on a scale. Neither involves extending polynomial identities to complex numbers.

### N-CN.C.9 -- "Fundamental Theorem of Algebra" -> elimination-grid, logic-chain
**WRONG for both:** The Fundamental Theorem of Algebra states every non-constant polynomial has a complex root. Elimination-grid eliminates wrong answers via clues. Logic-chain follows chained clues. Neither game tests this theorem.

### N-VM.C.9 -- "Matrix multiplication not commutative" -> logic-chain, elimination-grid
**WRONG for both:** Neither game involves matrix operations. Logic-chain follows clue chains. Elimination-grid eliminates options. Neither tests the non-commutativity of matrix multiplication.

### N-VM.C.10 -- "Zero/identity matrices, determinant" -> logic-chain, elimination-grid
**WRONG for both:** Neither game involves matrices, identity matrices, or determinants.

### A-APR.D.6 -- "Rewrite rational expressions" -> share-the-pizza, pattern-machine
**WRONG for share-the-pizza:** Sharing pizza equally tests division/fractions in a concrete sense, not rewriting rational expressions (polynomial long division, a(x)/b(x) form). This is a symbolic algebra skill.

### A-APR.D.7 -- "Operations on rational expressions" -> cut-the-bar, potion-lab
**WRONG for cut-the-bar:** Cutting a bar into equal parts tests concrete fraction understanding, not algebraic operations on rational expressions like (x+1)/(x-2) + (x-3)/(x+4).

---

## 3. ALL SO-SO Matches

### K.CC.A.1 -- "Count to 100 by ones and tens"
- **number-line-drop (SO-SO):** Placing numbers on a number line relates to number sense but doesn't specifically practice counting sequences by ones and tens. Better: a game that requires reciting or producing the count sequence.

### K.CC.A.2 -- "Count forward from a given number"
- **number-line-drop (SO-SO):** Somewhat related but doesn't specifically require counting forward from a given starting point.

### K.CC.B.4a -- "Counting objects one-to-one"
- **sorting-lane (SO-SO):** Sorting involves comparing values, not one-to-one correspondence counting. **Better: free-collect or assembly-line.**

### K.CC.B.4c -- "Each successive number is one larger"
- **number-line-drop (SO-SO):** Placing numbers on a line involves understanding positions but doesn't specifically test the "+1" relationship.
- **sorting-lane (SO-SO):** Ordering numbers doesn't specifically test the successor concept.

### K.MD.B.3 -- "Classify and count by category"
- **sorting-lane (SO-SO):** Sorting into order is not the same as classifying into categories and counting each.
- **build-the-chart (SO-SO):** Building a chart from given stats is related but the standard is about classifying objects into categories and counting, not building histograms from statistics.

### K.G.A.1 -- "Describe shapes and positions"
- **coordinate-hunter (SO-SO):** Clicking coordinates is too advanced for this kindergarten standard about describing positions using "above, below, beside."

### K.G.A.3 -- "Identify 2D vs 3D shapes"
- **shape-decomposer (SO-SO):** Decomposing complex shapes into basic shapes doesn't specifically test distinguishing 2D from 3D.

### K.G.B.4 -- "Analyze/compare 2D and 3D shapes"
- **sorting-lane (SO-SO):** Sorting numbers into order doesn't test comparing shape attributes like sides and vertices.

### K.NBT.A.1 -- "Compose/decompose 11-19 into ten ones + more"
- **free-collect (SO-SO):** Collecting items to hit a target sum involves addition but not specifically decomposing teen numbers into tens and ones.
- **split-the-loot (SO-SO):** Splitting items into two bins could model decomposition, but the gameplay doesn't inherently require understanding the tens-and-ones structure.

### 1.NBT.B.2a -- "10 as a bundle of ten ones"
- **free-collect (SO-SO):** Generic sum-collection doesn't specifically test understanding 10 as a bundle.
- **split-the-loot (SO-SO):** Same issue -- generic splitting, not specifically tens-based decomposition.

### 1.NBT.B.2b -- "11-19 = ten + ones"
- **free-collect (SO-SO):** Same issue as above.
- **split-the-loot (SO-SO):** Same issue.

### 1.NBT.B.2c -- "Multiples of 10"
- **number-line-drop (SO-SO):** Placing numbers on a line doesn't specifically test understanding multiples of 10 as groups of tens.
- **sorting-lane (SO-SO):** Ordering doesn't specifically test place value of multiples of 10.

### 1.NBT.C.5 -- "Mentally find 10 more/less"
- **number-line-drop (SO-SO):** Placing numbers on a line is related but doesn't specifically test the mental operation of adding/subtracting 10.

### 1.OA.C.5 -- "Relate counting to addition/subtraction"
- **number-line-drop (SO-SO):** Placing numbers on a line doesn't specifically test counting on/counting back as strategies for addition/subtraction.

### 2.NBT.A.1a -- "100 = bundle of ten tens"
- **free-collect (SO-SO):** Generic sum-targeting, not specifically place-value bundles.
- **split-the-loot (SO-SO):** Same issue.

### 2.NBT.A.1b -- "Hundreds (100-900)"
- **number-line-drop (SO-SO):** Placing numbers doesn't specifically test understanding hundreds as groups of ten tens.
- **sorting-lane (SO-SO):** Ordering doesn't test place-value understanding.

### 2.NBT.A.3 -- "Read/write numbers to 1000"
- **number-line-drop (SO-SO):** Placing on a number line doesn't test reading/writing in expanded form or number names.
- **sorting-lane (SO-SO):** Ordering numbers doesn't test reading/writing them.

### 2.NBT.B.8 -- "Mentally add/subtract 10 or 100"
- **number-line-drop (SO-SO):** Related to number sense but doesn't specifically test mental +/- 10 or 100.
- **free-collect (SO-SO):** Generic arithmetic, not specifically mental strategies with 10/100.

### 2.NBT.B.9 -- "Explain add/subtract strategies"
- **free-balance (SO-SO):** Balancing a scale models equality but doesn't test explaining strategies using place value.
- **free-collect (SO-SO):** Collecting to a sum doesn't test explaining why strategies work.

### 2.OA.C.3 -- "Odd/even"
- **sorting-lane (SO-SO):** Sorting numbers into order doesn't test determining odd/even. **Better: elimination-grid (which is also mapped and is better).**
- **elimination-grid (PERFECT):** Clues like "it's even" directly test odd/even classification.

### 2.MD.A.3 -- "Estimate lengths"
- **auction-house (SO-SO):** Estimating value and bidding within 20% tests estimation broadly but not specifically length estimation.
- **price-is-right (SO-SO):** Guessing without going over tests estimation but not specifically length estimation.

### 2.MD.D.9 -- "Measurement data -> line plot"
- **build-the-chart (SO-SO):** Building a histogram from stats is related but line plots from measurement data are more specific.
- **ruler-race (SO-SO):** Measuring objects with a ruler is the data-collection step but not the plotting step.

### 3.OA.B.5 -- "Properties of operations for multiplication/division"
- **free-collect (SO-SO):** Free-collect tests addition to a target, not multiplication/division properties like commutative/associative/distributive.

### 3.MD.B.4 -- "Measure lengths with fractions -> line plot"
- **ruler-race (SO-SO):** Ruler-race measures objects but doesn't create line plots from the data.
- **build-the-chart (SO-SO):** Building charts from stats is related but doesn't specifically involve measuring lengths with fractional units.

### 3.MD.C.5a -- "Unit square = one square unit"
- **stack-to-target (SO-SO):** Stacking blocks to a height is a linear (1D) concept, not an area (2D) concept.

### 3.MD.C.5b -- "Area = n unit squares"
- **stack-to-target (SO-SO):** Same issue -- height stacking is 1D, not 2D area.

### 3.MD.C.6 -- "Measure areas by counting unit squares"
- **stack-to-target (SO-SO):** Stacking to a height doesn't test counting unit squares for area.

### 3.MD.C.7b -- "Multiply side lengths for area"
- **potion-lab (SO-SO):** Potion-lab multiplies ingredient factors but not in the geometric context of area = length x width.

### 3.MD.D.8 -- "Perimeters of polygons"
- **ruler-race (SO-SO):** Measuring a single object's length with a ruler is different from calculating perimeter (sum of all sides).
- **fill-the-floor (SO-SO):** Fill-the-floor tests area (covering surface), not perimeter.

### 3.G.A.1 -- "Shapes share attributes; quadrilaterals"
- **sorting-lane (SO-SO):** Sorting numbers into order is unrelated to classifying quadrilaterals by shared attributes.
- **elimination-grid (SO-SO):** Eliminating by clues could work for shape classification but the game uses number clues, not shape-attribute clues.

### 4.OA.B.4 -- "Factor pairs, prime/composite"
- **elimination-grid (SO-SO):** Eliminating numbers by clues could test factor knowledge but depends entirely on the clue content, not intrinsic gameplay.
- **logic-chain (SO-SO):** Same issue -- depends on clue content.

### 4.NBT.A.2 -- "Read/write/compare multi-digit numbers"
- **sorting-lane (SO-SO):** Ordering numbers tests comparison but not reading/writing.
- **leaderboard-fix (SO-SO):** Fixing a scoreboard tests comparison but not reading/writing numbers.

### 4.NBT.B.6 -- "Divide with up to 4-digit dividends"
- **share-the-pizza (SO-SO):** Sharing pizza slices equally models basic division but doesn't scale to 4-digit dividends. The gameplay is too concrete for this standard's complexity.
- **split-the-loot (SO-SO):** Splitting loot into bins doesn't specifically model long division.
- **mystery-side (SO-SO):** Finding a hidden value on a scale could model unknown-factor problems but isn't specifically division of large numbers.

### 4.NF.C.5 -- "Denominator 10 -> equivalent 100"
- **cut-the-bar (SO-SO):** Cutting a bar shows fractions generally but doesn't specifically test converting tenths to hundredths.
- **pour-the-liquid (SO-SO):** Pouring to a fraction level is general fraction work, not specifically 10ths-to-100ths conversion.

### 4.MD.B.4 -- "Line plot with fractional measurements"
- **build-the-chart (SO-SO):** Building charts from stats is related to data display but not specifically line plots.
- **ruler-race (SO-SO):** Measuring objects is the data-gathering step, not the plotting step.

### 4.MD.C.5a -- "Angle measure as fraction of circle"
- **ruler-race (SO-SO):** Ruler-race measures linear lengths, not angles. Unrelated to understanding angle as a fraction of a circle.

### 4.MD.C.5b -- "Angle = n one-degree angles"
- **ruler-race (SO-SO):** Same issue -- ruler measures length, not angles.

### 4.MD.C.6 -- "Measure/sketch angles with protractor"
- **ruler-race (SO-SO):** A ruler is not a protractor. Measuring linear length doesn't test angle measurement.

### 5.OA.A.1 -- "Parentheses/brackets in expressions"
- **free-collect (SO-SO):** Collecting items to a sum doesn't specifically test order of operations with parentheses.

### 5.OA.A.2 -- "Write/interpret expressions"
- **potion-lab (SO-SO):** Combining ingredients with multiplied factors involves computation but not writing/interpreting algebraic expressions.

### 5.OA.B.3 -- "Two numerical patterns -> coordinate plane"
- **coordinate-hunter (SO-SO):** Clicking coordinates tests coordinate reading but not generating patterns and plotting their relationship.

### 5.NBT.A.2 -- "Powers of 10, zeros in products"
- **investment-sim (SO-SO):** Picking multipliers doesn't specifically test powers of 10 and the pattern of zeros.
- **population-boom (SO-SO):** Growth rate doesn't specifically test powers of 10.
- **potion-lab (SO-SO):** Multiplied ingredients don't specifically test powers of 10.

### 5.NBT.A.3a -- "Read/write decimals to thousandths"
- **number-line-drop (SO-SO):** Placing on a number line tests position sense but not reading/writing in expanded form or number names.
- **sorting-lane (SO-SO):** Ordering doesn't test reading/writing.

### 5.NBT.B.6 -- "Divide with up to 4-digit / 2-digit"
- **share-the-pizza (SO-SO):** Pizza sharing is too concrete for 4-digit by 2-digit division.
- **split-the-loot (SO-SO):** Splitting loot doesn't specifically model multi-digit long division.

### 5.NF.A.2 -- "Word problems: add/subtract fractions"
- **auction-house (SO-SO):** Estimating value within 20% doesn't specifically test fraction addition/subtraction word problems.

### 5.NF.B.4b -- "Area of rectangle with fractional sides"
- **fill-the-floor (SO-SO):** Tiling a floor tests area but the game uses whole tiles, not fractional side lengths.

### 5.MD.B.2 -- "Line plot with fraction measurements"
- **build-the-chart (SO-SO):** Building charts from stats is related but not specifically line plots.
- **ruler-race (SO-SO):** Measuring is the data-gathering step.
- **cut-the-bar (SO-SO):** Cutting a bar into fractions doesn't create line plots.

### 6.RP.A.3a -- "Tables of equivalent ratios"
- **coordinate-hunter (SO-SO):** Clicking coordinates doesn't specifically test building or completing tables of equivalent ratios.

### 6.RP.A.3c -- "Percent as rate per 100"
- **investment-sim (SO-SO):** Investment-sim uses multipliers (x1.5, x2), not percentages as rates per 100.

### 6.NS.B.4 -- "GCF, LCM, distributive property"
- **elimination-grid (SO-SO):** Depends on clue content to test GCF/LCM. Not intrinsic to the gameplay.
- **logic-chain (SO-SO):** Same issue.

### 6.EE.A.2a -- "Write expressions with variables"
- **pattern-machine (SO-SO):** Pattern-machine finds rules (like x2+1) which is interpreting, not writing from a verbal description.
- **mystery-side (SO-SO):** Finding a hidden value tests solving, not writing expressions.

### 6.EE.A.2b -- "Identify expression parts"
- **elimination-grid (SO-SO):** Eliminating by clues doesn't specifically test identifying terms, factors, coefficients in an expression.
- **pattern-machine (SO-SO):** Finding the rule is computational, not about identifying structural parts of an expression.

### 6.EE.A.3 -- "Generate equivalent expressions"
- **pattern-machine (SO-SO):** Finding input-output rules is related but doesn't specifically test applying distributive property to generate equivalent forms.
- **free-balance (SO-SO):** Balancing scales tests equality but not expression transformation.

### 6.EE.A.4 -- "Identify equivalent expressions"
- **elimination-grid (SO-SO):** Depends on clue content.

### 6.EE.B.8 -- "Write inequalities x>c, x<c"
- **number-line-drop (SO-SO):** Placing numbers on a line doesn't test writing inequalities.
- **elimination-grid (SO-SO):** Using clues like "greater than 20" is related but the student doesn't write the inequality themselves.

### 6.SP.B.4 -- "Dot plots, histograms, box plots"
- **number-line-drop (SO-SO):** Placing numbers on a number line is not the same as constructing statistical displays.

### 7.RP.A.2a -- "Proportional relationship"
- **coordinate-hunter (SO-SO):** Clicking coordinates doesn't test determining whether a proportional relationship exists.

### 7.RP.A.2c -- "Proportional equations t=pn"
- **free-balance (SO-SO):** Balancing scales models equality but not specifically proportional equations.

### 7.RP.A.2d -- "Point (x,y) on proportional graph"
- **coordinate-hunter (SO-SO):** Clicking coordinates is related but doesn't specifically test interpreting points on a proportional graph, especially (0,0) and (1,r).

### 7.NS.A.2a -- "Multiply signed numbers"
- **potion-lab (SO-SO):** Potion-lab multiplies ingredient factors but doesn't inherently involve signed (negative) number multiplication.

### 7.NS.A.2b -- "Divide integers"
- **share-the-pizza (SO-SO):** Sharing pizza models division with positive numbers, not specifically integer division with negatives.
- **depth-navigator (SO-SO):** Moving on a number line with negatives tests integer movement but not specifically division.

### 7.NS.A.2d -- "Convert rational -> decimal"
- **number-line-drop (SO-SO):** Placing numbers on a line doesn't specifically test converting fractions to repeating/terminating decimals.
- **sorting-lane (SO-SO):** Ordering doesn't test the conversion process.

### 7.EE.A.1 -- "Add/subtract/factor linear expressions"
- **free-balance (SO-SO):** Balancing tests equality but not specifically factoring or combining like terms in linear expressions.
- **pattern-machine (SO-SO):** Finding rules doesn't specifically test factoring expressions.

### 7.EE.A.2 -- "Rewrite expressions (a+0.05a=1.05a)"
- **pattern-machine (SO-SO):** Finding input-output rules is related but doesn't test recognizing equivalent expression forms.
- **investment-sim (SO-SO):** Picking multipliers is related to growth factors but doesn't test rewriting expressions symbolically.

### 7.EE.B.3 -- "Multi-step problems, estimation"
- **auction-house (SO-SO):** Estimation within 20% is partially related but not specifically multi-step rational number computation with estimation checks.

### 7.EE.B.4b -- "Solve px+q>r, graph solution"
- **number-line-drop (SO-SO):** Placing numbers on a line doesn't test graphing inequality solution sets.

### 7.G.B.4 -- "Area/circumference of circle"
- **fill-the-floor (SO-SO):** Tiling rectangular areas doesn't test circle area/circumference formulas.
- **ruler-race (SO-SO):** Measuring linear lengths doesn't test circle formulas.

### 7.SP.A.1 -- "Sampling and population"
- **bet-the-spinner (SO-SO):** Betting on spinner outcomes tests probability, not sampling methodology.

### 7.SP.C.8b -- "Sample spaces: lists, tables, trees"
- **elimination-grid (SO-SO):** Eliminating options by clues is related to systematic listing but doesn't specifically test constructing organized sample spaces.

### 8.NS.A.1 -- "Rational vs irrational; repeating decimals"
- **number-line-drop (SO-SO):** Placing numbers on a line doesn't test understanding what makes a number irrational or converting repeating decimals.
- **sorting-lane (SO-SO):** Ordering doesn't test rational vs irrational distinction.

### 8.NS.A.2 -- "Approximate irrationals on number line"
- **auction-house (SO-SO):** Estimation in bidding is generic, not specifically approximating irrational numbers.
- **sorting-lane (SO-SO):** Ordering doesn't specifically test irrational number approximation.

### 8.EE.A.3 -- "Scientific notation estimation"
- **auction-house (SO-SO):** General estimation, not specifically scientific notation.

### 8.EE.A.4 -- "Operations with scientific notation"
- **investment-sim (SO-SO):** Multiplier games don't specifically use scientific notation.
- **population-boom (SO-SO):** Growth rates don't specifically use scientific notation.

### 8.EE.B.6 -- "Similar triangles -> slope; y=mx+b"
- **resize-tool (SO-SO):** Resizing tests scaling but not specifically using similar triangles to derive slope.

### 8.F.A.2 -- "Compare functions"
- **find-the-stat (SO-SO):** Finding statistics doesn't test comparing function representations.

### 8.G.A.5 -- "Angle sum, transversals, AA similarity"
- **elimination-grid (SO-SO):** Depends on clue content. Not intrinsically about angle theorems.

### 8.G.B.6 -- "Pythagorean Theorem proof"
- **mystery-side (SO-SO):** Finding a hidden value on a scale doesn't test explaining a proof of the Pythagorean Theorem.
- **free-balance (SO-SO):** Balancing doesn't test geometric proof.

### 8.G.C.9 -- "Volume: cones, cylinders, spheres"
- **stack-to-target (SO-SO):** Stacking blocks to a height is linear, not about computing volume of curved 3D shapes.

### 8.SP.A.3 -- "Linear model: slope/intercept"
- **speed-trap (SO-SO):** Speed = distance/time tests rate but not specifically interpreting slope and intercept of a linear model in bivariate data context.

### N-RN.A.1 -- "Rational exponents extend integer exponents"
- **investment-sim (SO-SO):** Picking multipliers doesn't specifically test understanding rational exponents like 5^(1/3).
- **population-boom (SO-SO):** Growth rate doesn't specifically use rational exponents.
- **doubling-maze (SO-SO):** Doubling/tripling doesn't test fractional exponents.

### N-RN.A.2 -- "Rewrite radicals <-> rational exponents"
- **investment-sim (SO-SO):** Growth multipliers don't involve rewriting radical expressions.
- **population-boom (SO-SO):** Same issue.

### N-RN.B.3 -- "Sum/product of rationals/irrationals"
- **elimination-grid (SO-SO):** Depends on clue content, not intrinsically about rational/irrational closure properties.
- **sorting-lane (SO-SO):** Ordering doesn't test these algebraic properties.

### N-Q.A.2 -- "Define quantities for modeling"
- **auction-house (SO-SO):** Estimating value is loosely related to modeling but doesn't specifically test defining appropriate quantities.
- **recipe-scaler (SO-SO):** Scaling recipes is related but the standard is about defining quantities, a more abstract modeling skill.

### N-Q.A.3 -- "Level of accuracy in measurement"
- **ruler-race (SO-SO):** Measuring with a ruler tests precision but not choosing an appropriate level of accuracy based on context.

### N-VM.A.1 -- "Vector magnitude/direction"
- **coordinate-hunter (SO-SO):** Clicking coordinates doesn't specifically test vector concepts.
- **treasure-trail (SO-SO):** Following coordinate instructions involves displacement but doesn't specifically test magnitude/direction notation.

### N-VM.A.2 -- "Vector components"
- **coordinate-hunter (SO-SO):** Same issue as above.
- **treasure-trail (SO-SO):** Following instructions like "move right 4, up 2" is related to components but doesn't test formal vector subtraction of coordinates.

### N-VM.B.4a -- "Add vectors"
- **free-collect (SO-SO):** Collecting numbers to a sum is scalar addition, not vector addition.

### N-VM.B.4b -- "Sum magnitude/direction"
- **coordinate-hunter (SO-SO):** Not specifically about vector sum magnitude/direction.
- **treasure-trail (SO-SO):** Following trails doesn't compute resultant vectors.

### N-VM.B.4c -- "Vector subtraction"
- **depth-navigator (SO-SO):** Moving on a number line with negatives is scalar, not vector subtraction.

### N-VM.B.5a -- "Scalar multiplication of vectors"
- **resize-tool (SO-SO):** Resizing shapes is related to scaling but not specifically scalar multiplication of vectors.
- **coordinate-hunter (SO-SO):** Clicking coordinates doesn't test scalar-vector multiplication.

### N-VM.B.5b -- "Magnitude of scalar multiple"
- **resize-tool (SO-SO):** Resizing tests scaling visually but not computing ||cv|| = |c| * ||v||.
- **coordinate-hunter (SO-SO):** Same issue.

### N-VM.C.6 -- "Matrices for data"
- **build-the-chart (SO-SO):** Building charts from data is related to data representation but not specifically matrix representation.
- **coordinate-hunter (SO-SO):** Coordinate clicking doesn't test matrix data representation.

### N-VM.C.7 -- "Scalar x matrix"
- **resize-tool (SO-SO):** Resizing tests visual scaling but not scalar-matrix multiplication.
- **potion-lab (SO-SO):** Ingredient multipliers are scalar-number operations, not matrix operations.

### N-VM.C.8 -- "Add/subtract/multiply matrices"
- **potion-lab (SO-SO):** Ingredient combination is real-number arithmetic, not matrix arithmetic.
- **recipe-mixer (SO-SO):** Same issue.

### N-VM.C.11 -- "Matrix x vector"
- **coordinate-hunter (SO-SO):** Not about matrix-vector multiplication.
- **rotate-to-match (SO-SO):** Rotation is conceptually a matrix transformation but the game doesn't require matrix computation.

### N-VM.C.12 -- "2x2 matrix transformations, determinant area"
- **rotate-to-match (SO-SO):** Rotation gameplay doesn't require understanding 2x2 matrix representation.
- **resize-tool (SO-SO):** Resizing doesn't test determinant as area scaling factor.
- **coordinate-hunter (SO-SO):** Same issue.

### A-SSE.A.1a -- "Interpret terms, factors, coefficients"
- **pattern-machine (SO-SO):** Finding rules tests computational pattern recognition but not specifically interpreting expression structure.
- **free-balance (SO-SO):** Balancing tests equality, not expression interpretation.

### A-SSE.A.1b -- "Interpret P(1+r)^n"
- **investment-sim (SO-SO):** Picking multipliers to reach a target is related to compound growth but doesn't test interpreting the symbolic form P(1+r)^n.
- **pattern-machine (SO-SO):** Finding rules doesn't test interpreting compound interest expressions.

### A-SSE.A.2 -- "Rewrite expressions (factor)"
- **pattern-machine (SO-SO):** Finding rules doesn't test factoring x^4 - y^4 as difference of squares.
- **elimination-grid (SO-SO):** Depends on clue content.

### A-APR.A.1 -- "Add/subtract/multiply polynomials"
- **potion-lab (SO-SO):** Combining ingredients with multiplied factors involves multiplication but not polynomial algebra.
- **recipe-mixer (SO-SO):** Setting amounts doesn't test polynomial operations.
- **pattern-machine (SO-SO):** Finding rules is related but doesn't specifically test polynomial arithmetic.

### A-APR.B.2 -- "Remainder Theorem"
- **pattern-machine (SO-SO):** Finding input-output rules doesn't test the Remainder Theorem.
- **elimination-grid (SO-SO):** Depends on clue content.

### A-APR.B.3 -- "Zeros of polynomials -> graph"
- **coordinate-hunter (SO-SO):** Clicking coordinates doesn't specifically test identifying polynomial zeros and sketching graphs.
- **elimination-grid (SO-SO):** Depends on clue content.
- **mystery-side (SO-SO):** Finding hidden values doesn't specifically test polynomial zeros.

### A-APR.C.4 -- "Polynomial identities"
- **pattern-machine (SO-SO):** Finding rules doesn't test proving polynomial identities.
- **logic-chain (SO-SO):** Following clue chains doesn't test polynomial identity proofs.

### A-APR.C.5 -- "Binomial Theorem"
- **sequence-builder (SO-SO):** Finding the next number in a pattern doesn't test the Binomial Theorem.
- **pattern-machine (SO-SO):** Same issue.
- **investment-sim (SO-SO):** Growth multipliers don't test binomial expansion.

### A-CED.A.3 -- "Constraints as equations/inequalities"
- **elimination-grid (SO-SO):** Eliminating by clues is loosely related to constraints but doesn't test writing systems of equations/inequalities.

### A-REI.A.1 -- "Explain steps in solving equations"
- **free-balance (SO-SO):** The balance metaphor shows equality but doesn't require explaining solution steps.
- **chain-scales (SO-SO):** Same issue.

### A-REI.B.4a -- "Completing the square"
- **mystery-side (SO-SO):** Finding hidden values on a scale doesn't specifically test the completing-the-square technique.
- **free-balance (SO-SO):** Same issue.

### A-REI.C.8 -- "System as matrix equation"
- **chain-scales (SO-SO):** Connected scales model systems but not matrix representation.
- **free-balance (SO-SO):** Same issue.

### A-REI.C.9 -- "Matrix inverse to solve systems"
- **chain-scales (SO-SO):** Connected scales model systems but don't involve matrix inverses.
- **free-balance (SO-SO):** Same issue.

### A-REI.D.10 -- "Graph of equation = solution set"
- **battleship (SO-SO):** Calling coordinates to find ships doesn't test understanding that a graph represents all solutions of an equation.

### A-REI.D.11 -- "Intersection of graphs = solutions"
- **elimination-grid (SO-SO):** Eliminating options doesn't test finding graph intersections.

### A-REI.D.12 -- "Graph linear inequalities"
- **elimination-grid (SO-SO):** Eliminating options doesn't test graphing half-planes.

### F-IF.A.1 -- "Function: domain -> range"
- **coordinate-hunter (SO-SO):** Clicking coordinates doesn't specifically test understanding domain/range function definition.

### F-IF.A.2 -- "Evaluate functions; notation"
- **coordinate-hunter (SO-SO):** Clicking coordinates doesn't test f(x) notation and evaluation.

### F-IF.B.5 -- "Domain from graph/context"
- **coordinate-hunter (SO-SO):** Clicking coordinates doesn't test determining appropriate domain.
- **pattern-machine (SO-SO):** Finding rules doesn't test domain analysis.

### F-IF.C.7a through F-IF.C.7e -- "Graph various function types"
- **coordinate-hunter (SO-SO for all):** Coordinate-hunter tests clicking at given coordinates, not graphing functions. The student isn't plotting function curves.

### F-IF.C.7d -- "Graph rational functions"
- **elimination-grid (SO-SO):** Eliminating options doesn't test graphing rational functions.

### F-IF.C.9 -- "Compare functions in different forms"
- **find-the-stat (SO-SO):** Finding statistics doesn't test function comparison.

### F-BF.A.1b -- "Combine function types"
- **potion-lab (SO-SO):** Combining ingredients tests arithmetic but not combining function types (e.g., constant + decaying exponential).

### F-BF.A.1c -- "Compose functions"
- **potion-lab (SO-SO):** Same issue.

### F-BF.B.3 -- "f(x)+k, kf(x), f(kx), f(x+k)"
- **coordinate-hunter (SO-SO):** Clicking coordinates doesn't test graph transformations.
- **resize-tool (SO-SO):** Resizing relates to scaling but doesn't test function transformation notation.

### F-BF.B.4a -- "Inverse: solve f(x)=c"
- **mystery-side (SO-SO):** Finding a hidden value is solving for an unknown but not specifically inverting a function.

### F-BF.B.4b -- "Verify inverse by composition"
- **pattern-machine (SO-SO):** Finding rules doesn't test verifying inverses by composition.
- **logic-chain (SO-SO):** Following clue chains doesn't test function composition verification.

### F-BF.B.4c -- "Read inverse from graph/table"
- **coordinate-hunter (SO-SO):** Clicking coordinates doesn't test reading inverse values.
- **pattern-machine (SO-SO):** Finding rules doesn't test reading inverse from graphs.

### F-BF.B.4d -- "Restrict domain for invertibility"
- **pattern-machine (SO-SO):** Finding rules doesn't test domain restriction concepts.
- **elimination-grid (SO-SO):** Eliminating options doesn't test invertibility.

### F-TF.A.1 -- "Radian measure"
- **ruler-race (SO-SO):** Measuring linear length with a ruler is not measuring angles in radians.

### F-TF.A.2 -- "Unit circle -> trig functions"
- **coordinate-hunter (SO-SO):** General coordinate clicking doesn't specifically test the unit circle or trig function definitions.

### F-TF.A.3 -- "Special triangle trig values"
- **coordinate-hunter (SO-SO):** Same issue.

### F-TF.B.5 -- "Model periodic phenomena"
- **coordinate-hunter (SO-SO):** Clicking coordinates doesn't test modeling periodic phenomena with trig functions.

### F-TF.B.6 -- "Restrict domain -> inverse trig"
- **coordinate-hunter (SO-SO):** Same issue.

### F-TF.B.7 -- "Solve trig equations"
- **coordinate-hunter (SO-SO):** Clicking coordinates doesn't test solving trig equations.

### F-TF.C.8 -- "Pythagorean identity"
- **mystery-side (SO-SO):** Finding hidden values on a scale doesn't test sin^2 + cos^2 = 1.
- **free-balance (SO-SO):** Balancing doesn't test trig identities.

### F-TF.C.9 -- "Addition/subtraction formulas"
- **pattern-machine (SO-SO):** Finding rules doesn't test proving trig addition formulas.
- **free-balance (SO-SO):** Balancing doesn't test trig formulas.

### G-CO.C.9 -- "Prove theorems about lines/angles"
- **elimination-grid (SO-SO):** Eliminating by clues doesn't test geometric proof.

### G-CO.C.10 -- "Prove theorems about triangles"
- **free-balance (SO-SO):** Balancing doesn't test geometric proof about triangles.

### G-CO.C.11 -- "Prove theorems about parallelograms"
- **free-balance (SO-SO):** Same issue.

### G-CO.D.12 -- "Geometric constructions"
- **ruler-race (SO-SO):** Measuring with a ruler is not compass-and-straightedge construction.

### G-SRT.C.6 -- "Trig ratios from similar triangles"
- **recipe-scaler (SO-SO):** Scaling recipes involves proportional reasoning but not specifically trig ratios from similar triangles.

### G-SRT.D.9 -- "Triangle area = 1/2 ab sin(C)"
- **fill-the-floor (SO-SO):** Tiling rectangular areas doesn't test the trig area formula for triangles.

### G-SRT.D.10 -- "Laws of Sines and Cosines"
- **launch-to-target (SO-SO):** Setting speed to hit a target distance tests rate, not specifically the Law of Sines/Cosines.

### G-SRT.D.11 -- "Apply Law of Sines/Cosines"
- **launch-to-target (SO-SO):** Same issue.
- **map-distance (SO-SO):** Using map scale tests proportional reasoning, not trig laws.

### G-C.A.1 -- "All circles are similar"
- **resize-tool (SO-SO):** Resizing tests scaling but doesn't specifically test proving circle similarity.
- **rotate-to-match (SO-SO):** Rotating shapes doesn't test circle similarity proofs.

### G-C.A.2 -- "Inscribed angles, radii, chords"
- **ruler-race (SO-SO):** Measuring linear lengths doesn't test circle geometry theorems.

### G-C.A.3 -- "Inscribed/circumscribed circles"
- **free-build (SO-SO):** Building shapes doesn't specifically test inscribed/circumscribed circle construction.
- **rotate-to-match (SO-SO):** Rotating shapes doesn't test circle constructions.

### G-C.A.4 -- "Tangent line construction"
- **free-build (SO-SO):** Building shapes doesn't specifically test tangent line construction.
- **rotate-to-match (SO-SO):** Same issue.

### G-C.B.5 -- "Arc length, radian, sector area"
- **ruler-race (SO-SO):** Linear measurement doesn't test arc length or sector area.

### G-GPE.A.1 -- "Equation of circle (Pythagorean)"
- **coordinate-hunter (SO-SO):** General coordinate clicking doesn't test deriving circle equations.
- **mystery-side (SO-SO):** Finding hidden values doesn't test circle equation derivation.

### G-GPE.A.2 -- "Equation of parabola"
- **coordinate-hunter (SO-SO):** Same issue for parabola equations.
- **mystery-side (SO-SO):** Same issue.

### G-GPE.A.3 -- "Equations of ellipses/hyperbolas"
- **coordinate-hunter (SO-SO):** Same issue.
- **mystery-side (SO-SO):** Same issue.

### G-GPE.B.4 -- "Coordinate proofs"
- **logic-chain (SO-SO):** Following clue chains doesn't test coordinate geometry proofs.

### G-GMD.A.2 -- "Cavalieri's principle -> volume of sphere"
- **box-packer (SO-SO):** Packing boxes tests volume of rectangular prisms, not Cavalieri's principle for spheres.
- **stack-to-target (SO-SO):** Stacking blocks to a height is 1D, not about Cavalieri's principle.

### G-MG.A.2 -- "Density based on area/volume"
- **recipe-scaler (SO-SO):** Scaling recipes tests proportional reasoning but not density (mass/volume or population/area).

### G-MG.A.3 -- "Design problems with geometric methods"
- **shortest-route (SO-SO):** Route optimization is graph theory, not geometric design.

### S-ID.A.4 -- "Normal distribution, mean/SD"
- **bet-the-spinner (SO-SO):** Spinner probability doesn't test normal distribution or standard deviation analysis.

### S-ID.B.6a -- "Fit function to data"
- **pattern-machine (SO-SO):** Finding rules from input-output pairs is related but doesn't specifically test fitting functions to scatter plot data.

### S-ID.C.9 -- "Correlation != causation"
- **logic-chain (SO-SO):** Following clue chains is about logical deduction, not distinguishing correlation from causation in data.
- **elimination-grid (SO-SO):** Same issue.

### S-IC.A.1 -- "Inference from random sample"
- **bet-the-spinner (SO-SO):** Spinner probability tests likelihood, not sampling inference.

### S-IC.A.2 -- "Model vs data-generating process"
- **bet-the-spinner (SO-SO):** Related to probability models but doesn't test comparing model predictions to actual data generation.

### S-IC.B.3 -- "Surveys vs experiments vs observational"
- **logic-chain (SO-SO):** Following clue chains doesn't test understanding study design types.

### S-IC.B.6 -- "Evaluate data reports"
- **logic-chain (SO-SO):** Following clue chains doesn't test evaluating data-based reports.
- **elimination-grid (SO-SO):** Same issue.

### S-CP.A.5 -- "Conditional probability in everyday language"
- **logic-chain (SO-SO):** Following clue chains tests deduction but not conditional probability language.

### S-CP.B.9 -- "Permutations/combinations"
- **elimination-grid (SO-SO):** Eliminating by clues doesn't test counting permutations and combinations.
- **logic-chain (SO-SO):** Same issue.

### S-MD.B.5a -- "Expected payoff"
- **auction-house (SO-SO):** Bidding within 20% tests estimation, not computing expected payoff from a probability distribution.

### S-MD.B.5b -- "Compare strategies by expected value"
- **auction-house (SO-SO):** Same issue.

### S-MD.B.7 -- "Analyze decisions with probability"
- **logic-chain (SO-SO):** Following clue chains is about deduction, not probabilistic decision analysis.
- **elimination-grid (SO-SO):** Same issue.

---

## 4. Better Game Options for SO-SO Matches (where alternatives exist)

| Standard | Current SO-SO Option | Suggested Better Option | Why |
|----------|---------------------|------------------------|-----|
| K.CC.B.4a | sorting-lane | free-collect | Collecting items requires one-to-one counting |
| K.G.B.4 | sorting-lane | shape-matcher | Shape-matcher directly tests shape comparison |
| 2.OA.C.3 | sorting-lane | elimination-grid | Clues like "it's even" directly test odd/even |
| 3.MD.C.5a,5b,C.6 | stack-to-target | fill-the-floor | fill-the-floor directly tests area with unit squares |
| 3.MD.C.7b | potion-lab | fill-the-floor | fill-the-floor tests area = length x width |
| 3.MD.D.8 | ruler-race, fill-the-floor | free-build | free-build specifically targets perimeter |
| 4.MD.C.5a,5b,C.6 | ruler-race | rotate-to-match | rotate-to-match works with angles |
| 7.G.B.4 | fill-the-floor, ruler-race | (no perfect option exists) | Need a circle-specific game |
| F-TF.A.1 | ruler-race | rotate-to-match | Rotation is closer to angle measure |

---

## 5. Standards with NO Perfect Match Among the 57 Game Options

These standards have no game option that intrinsically requires the exact math skill. They represent gaps requiring new game options or significant game modifications.

### Time-Telling Standards (3 standards)
- **1.MD.B.3** -- Tell and write time in hours and half-hours
- **2.MD.C.7** -- Tell and write time to nearest 5 minutes
- **3.MD.A.1** -- Tell and write time to nearest minute
- **Gap:** No clock-reading game exists. Need a "clock-reader" game option.

### Writing Numbers (1 standard)
- **K.CC.A.3** -- Write numbers from 0 to 20
- **Gap:** No game requires handwriting/typing numerals as a representational skill.

### Place Value Understanding (4 standards)
- **4.NBT.A.1** -- A digit represents 10x what it represents in the place to its right
- **5.NBT.A.1** -- A digit represents 10x to right, 1/10 to left
- **1.NBT.B.2a** -- 10 as a bundle of ten ones
- **1.NBT.B.2b** -- 11-19 composed of a ten and ones
- **Gap:** No game intrinsically requires place-value decomposition (e.g., "place-value-breaker" where you must decompose numbers into hundreds, tens, ones).

### Money (1 standard)
- **2.MD.C.8** -- Word problems with coins/bills (partial gap -- free-collect works for the arithmetic but not the money context)
- **Gap:** No game specifically uses coin/bill denominations.

### Complex Numbers (9 standards)
- **N-CN.A.1** through **N-CN.C.9** -- All complex number standards
- **Gap:** No game operates on the complex plane or with imaginary numbers. Need a "complex-plane-navigator" or similar.

### Matrix Operations (5 standards)
- **N-VM.C.6** through **N-VM.C.12** (excluding N-VM.C.11) -- Matrix standards
- **Gap:** No game involves matrix arithmetic. Need a "matrix-lab" game option.

### Vector Operations (6 standards)
- **N-VM.A.1** through **N-VM.B.5b** -- Vector standards
- **Gap:** While coordinate-hunter and treasure-trail are mapped, they don't specifically require vector notation, magnitude computation, or formal vector operations. Need a "vector-builder" game option.

### Polynomial Algebra (5 standards)
- **A-APR.A.1** -- Add/subtract/multiply polynomials
- **A-APR.B.2** -- Remainder Theorem
- **A-APR.C.4** -- Polynomial identities
- **A-APR.C.5** -- Binomial Theorem
- **A-APR.D.6** -- Rewrite rational expressions
- **Gap:** No game intrinsically requires symbolic polynomial manipulation. Need an "expression-builder" game option.

### Circle Geometry (5 standards)
- **G-C.A.1** through **G-C.B.5** -- Circle theorems, constructions, arc length
- **Gap:** No game specifically handles circle geometry. Need a "circle-explorer" game option.

### Trigonometry (9 standards)
- **F-TF.A.1** through **F-TF.C.9** -- Trig functions, identities, equations
- **Gap:** rotate-to-match handles rotation but doesn't test trig ratios, unit circle, or trig identities. Need a "trig-explorer" or "unit-circle" game option.

### Function Graphing (5 standards)
- **F-IF.C.7a** through **F-IF.C.7e** -- Graph linear, quadratic, polynomial, rational, exponential, trig
- **Gap:** coordinate-hunter tests clicking at coordinates but doesn't test plotting function graphs. Need a "graph-plotter" game option.

### Geometric Proof (3 standards)
- **G-CO.C.9** -- Prove theorems about lines/angles
- **G-CO.C.10** -- Prove theorems about triangles
- **G-CO.C.11** -- Prove theorems about parallelograms
- **Gap:** No game tests deductive proof. Need a "proof-builder" game option.

### Conic Sections (3 standards)
- **G-GPE.A.1** -- Equation of circle
- **G-GPE.A.2** -- Equation of parabola
- **G-GPE.A.3** -- Equations of ellipses/hyperbolas
- **Gap:** No game tests deriving conic section equations.

### Statistical Study Design (2 standards)
- **S-IC.B.3** -- Surveys vs experiments vs observational studies
- **S-IC.B.6** -- Evaluate data reports
- **Gap:** No game tests understanding of study design methodology.

### Normal Distribution (1 standard)
- **S-ID.A.4** -- Normal distribution, mean/SD
- **Gap:** No game specifically handles normal curves and standard deviation analysis.

### Line Plots (4 standards)
- **2.MD.D.9**, **3.MD.B.4**, **4.MD.B.4**, **5.MD.B.2** -- Creating line plots from measurement data
- **Gap:** build-the-chart builds histograms from target stats, not line plots from raw measurement data.

---

## Summary of Gaps Requiring New Game Options

| Gap Category | Standards Affected | Suggested New Game |
|-------------|-------------------|-------------------|
| Time/Clocks | 3 | clock-reader |
| Place Value | 4 | place-value-breaker |
| Complex Numbers | 9 | complex-plane-navigator |
| Matrix Operations | 5 | matrix-lab |
| Vector Operations | 6 | vector-builder |
| Polynomial Algebra | 5 | expression-builder |
| Circle Geometry | 5 | circle-explorer |
| Trigonometry | 9 | trig-explorer / unit-circle |
| Function Graphing | 5 | graph-plotter |
| Geometric Proof | 3 | proof-builder |
| Conic Sections | 3 | conic-plotter |
| Study Design | 2 | study-designer |
| Normal Distribution | 1 | distribution-explorer |
| Line Plots | 4 | line-plot-maker |
| Money | 1 | coin-counter |
| Writing Numbers | 1 | number-writer |

**Total new game options suggested:** 16
**Total standards with no perfect match:** ~76 (16.3% of 466)
