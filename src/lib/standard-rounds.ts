/**
 * Hardcoded math round data per Common Core standard (K-2).
 *
 * Each standard has 5 rounds with progressive difficulty:
 *   - Rounds 1-2: BASIC
 *   - Rounds 3-4: INTERMEDIATE
 *   - Round 5:    ADVANCED
 *
 * Every round directly tests the standard it belongs to, using numbers
 * appropriate for the grade level. Rounds are used as a reliable fallback
 * so gameplay does not depend on AI generation for correctness.
 */

export interface HardcodedRound {
  /** Short math question (max 80 chars). */
  prompt: string
  /** The correct numerical answer. */
  target: number
  /** Array of 6-8 numbers (correct answer + plausible distractors). */
  items: number[]
  /** One sentence explaining how to solve. */
  hint: string
}

export const STANDARD_ROUNDS: Record<string, HardcodedRound[]> = {
  // ============================================================
  // KINDERGARTEN — Counting & Cardinality
  // ============================================================

  "K.CC.A": [
    { prompt: "What number comes after 3?", target: 4, items: [2, 3, 4, 5, 6, 7], hint: "Count up by one: 3, then 4." },
    { prompt: "What number comes after 7?", target: 8, items: [6, 7, 8, 9, 10, 11], hint: "After 7 comes 8." },
    { prompt: "Count by tens: 10, 20, ___", target: 30, items: [21, 25, 30, 35, 40, 50], hint: "Add 10 to 20 to get 30." },
    { prompt: "What comes after 49?", target: 50, items: [48, 49, 50, 51, 52, 60], hint: "After 49, the next number is 50." },
    { prompt: "Count by tens: 70, 80, 90, ___", target: 100, items: [91, 95, 99, 100, 101, 110], hint: "Add 10 to 90 to get 100." },
  ],

  "K.CC.A.1": [
    { prompt: "Count to 10. What comes after 6?", target: 7, items: [5, 6, 7, 8, 9, 10], hint: "Counting up by one, after 6 is 7." },
    { prompt: "What comes next: 1, 2, 3, ___", target: 4, items: [3, 4, 5, 6, 7, 8], hint: "Count by ones: after 3 is 4." },
    { prompt: "Count by tens: 10, 20, 30, ___", target: 40, items: [25, 35, 40, 45, 50, 60], hint: "Counting by tens, jump up by 10." },
    { prompt: "Count by tens: 50, 60, 70, ___", target: 80, items: [72, 75, 78, 80, 85, 90], hint: "Add 10 to 70 to get 80." },
    { prompt: "What comes after 99?", target: 100, items: [98, 99, 100, 101, 110, 90], hint: "After 99 comes 100." },
  ],

  "K.CC.A.2": [
    { prompt: "Start at 4 and count up one. What is next?", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "After 4 comes 5." },
    { prompt: "Start at 8. What comes next?", target: 9, items: [7, 8, 9, 10, 11, 12], hint: "After 8 is 9." },
    { prompt: "Start at 12. What comes next?", target: 13, items: [11, 12, 13, 14, 15, 20], hint: "After 12 is 13." },
    { prompt: "Start at 17. What comes next?", target: 18, items: [16, 17, 18, 19, 20, 21], hint: "After 17 comes 18." },
    { prompt: "Start at 26. Count up 3. Where do you end?", target: 29, items: [27, 28, 29, 30, 31, 32], hint: "26 then 27, 28, 29." },
  ],

  "K.CC.A.3": [
    { prompt: "How many dots? • •", target: 2, items: [1, 2, 3, 4, 5, 6], hint: "Count each dot: 1, 2." },
    { prompt: "How many stars? ★★★★", target: 4, items: [2, 3, 4, 5, 6, 7], hint: "Count each star: 1, 2, 3, 4." },
    { prompt: "How many hearts? ♥♥♥♥♥♥♥", target: 7, items: [5, 6, 7, 8, 9, 10], hint: "Count each heart one at a time." },
    { prompt: "How many fingers on two hands?", target: 10, items: [8, 9, 10, 11, 12, 15], hint: "Five on each hand makes 10." },
    { prompt: "A box has 0 toys. How many toys?", target: 0, items: [0, 1, 2, 3, 5, 10], hint: "Zero means none." },
  ],

  "K.CC.B": [
    { prompt: "How many apples? 🍎🍎🍎", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "Count each apple one by one." },
    { prompt: "How many cats? 🐱🐱🐱🐱🐱", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "Point and count each cat." },
    { prompt: "6 ducks stand in a line. How many?", target: 6, items: [4, 5, 6, 7, 8, 10], hint: "The last number said tells how many." },
    { prompt: "8 toys in a pile. How many toys?", target: 8, items: [6, 7, 8, 9, 10, 12], hint: "Count each toy: stop at 8." },
    { prompt: "10 blocks in a circle. How many blocks?", target: 10, items: [8, 9, 10, 11, 12, 15], hint: "Count around: the last number is the total." },
  ],

  "K.CC.B.4": [
    { prompt: "Count: 1, 2, 3. How many?", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "The last number you say is how many." },
    { prompt: "Count 5 bears. How many are there?", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "The last count tells you the total." },
    { prompt: "You counted: 1, 2, 3, 4, 5, 6, 7. How many?", target: 7, items: [5, 6, 7, 8, 9, 10], hint: "Stop-number tells the total: 7." },
    { prompt: "9 pennies counted one by one. Total?", target: 9, items: [7, 8, 9, 10, 11, 12], hint: "Each penny gets one number; last is 9." },
    { prompt: "Count to 12: how many did you count?", target: 12, items: [10, 11, 12, 13, 14, 15], hint: "The final number said is the total." },
  ],

  "K.CC.B.4a": [
    { prompt: "Match counts to toys: 3 toys. How many?", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "One number for each toy, in order." },
    { prompt: "You point to each of 4 cookies once. How many?", target: 4, items: [2, 3, 4, 5, 6, 7], hint: "Each cookie gets counted once." },
    { prompt: "Count 6 rocks one at a time. Total?", target: 6, items: [4, 5, 6, 7, 8, 9], hint: "Say one number per rock." },
    { prompt: "Each of 8 pencils gets 1 number. How many?", target: 8, items: [6, 7, 8, 9, 10, 11], hint: "One-to-one: 8 pencils, end on 8." },
    { prompt: "Count 10 toy cars, one number each. Total?", target: 10, items: [8, 9, 10, 11, 12, 15], hint: "Ten cars, so last number is 10." },
  ],

  "K.CC.B.4b": [
    { prompt: "5 toys in a row. Count: how many?", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "Last number said is the total." },
    { prompt: "Same 5 toys in a circle. How many?", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "Arrangement does not change the count." },
    { prompt: "You counted 7 stickers. Total?", target: 7, items: [5, 6, 7, 8, 9, 10], hint: "Final count is the answer." },
    { prompt: "9 coins in a pile. How many coins?", target: 9, items: [7, 8, 9, 10, 11, 12], hint: "Whatever order — total is 9." },
    { prompt: "You counted 10 shells on the beach. How many?", target: 10, items: [8, 9, 10, 11, 12, 15], hint: "The last number said is 10." },
  ],

  "K.CC.B.4c": [
    { prompt: "One more than 3 is?", target: 4, items: [2, 3, 4, 5, 6, 7], hint: "Each next number is one larger." },
    { prompt: "One more than 5 is?", target: 6, items: [4, 5, 6, 7, 8, 9], hint: "Add 1: 5 + 1 = 6." },
    { prompt: "One more than 8 is?", target: 9, items: [7, 8, 9, 10, 11, 12], hint: "Next number after 8 is 9." },
    { prompt: "One more than 12 is?", target: 13, items: [11, 12, 13, 14, 15, 20], hint: "12 + 1 = 13." },
    { prompt: "One more than 19 is?", target: 20, items: [18, 19, 20, 21, 22, 29], hint: "After 19 comes 20." },
  ],

  "K.CC.B.5": [
    { prompt: "How many: 🐶🐶🐶?", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "Count each dog." },
    { prompt: "How many: ⭐⭐⭐⭐⭐⭐?", target: 6, items: [4, 5, 6, 7, 8, 9], hint: "Count each star one time." },
    { prompt: "11 marbles in a line. How many?", target: 11, items: [9, 10, 11, 12, 13, 15], hint: "Count one by one to 11." },
    { prompt: "15 crayons in a box. How many?", target: 15, items: [12, 13, 14, 15, 16, 20], hint: "Count each crayon, stop at 15." },
    { prompt: "20 beads on a string. How many?", target: 20, items: [17, 18, 19, 20, 21, 25], hint: "Count each bead to get 20." },
  ],

  "K.CC.C": [
    { prompt: "Which is more: 3 or 5?", target: 5, items: [1, 2, 3, 4, 5, 6], hint: "5 comes later when counting, so it is more." },
    { prompt: "Which is less: 2 or 6?", target: 2, items: [1, 2, 3, 4, 5, 6], hint: "2 comes first when counting, so it is less." },
    { prompt: "Which is greater: 7 or 4?", target: 7, items: [3, 4, 5, 6, 7, 8], hint: "7 is farther along than 4." },
    { prompt: "Which is less: 8 or 9?", target: 8, items: [6, 7, 8, 9, 10, 11], hint: "8 comes just before 9." },
    { prompt: "Which is greater: 10 or 6?", target: 10, items: [5, 6, 7, 8, 9, 10], hint: "10 is the bigger number." },
  ],

  "K.CC.C.6": [
    { prompt: "Group A has 3 apples, B has 5. Which is more?", target: 5, items: [2, 3, 4, 5, 6, 7], hint: "Match them up; 5 has more." },
    { prompt: "4 cats vs 2 cats. How many is more?", target: 4, items: [1, 2, 3, 4, 5, 6], hint: "4 is greater than 2." },
    { prompt: "6 toys vs 9 toys. Which is more?", target: 9, items: [5, 6, 7, 8, 9, 10], hint: "9 is bigger than 6." },
    { prompt: "10 dots vs 7 dots. Which is less?", target: 7, items: [6, 7, 8, 9, 10, 11], hint: "7 is fewer than 10." },
    { prompt: "Which is more: 8 stars or 10 stars?", target: 10, items: [7, 8, 9, 10, 11, 12], hint: "10 has more than 8." },
  ],

  "K.CC.C.7": [
    { prompt: "Which is greater: 2 or 5?", target: 5, items: [1, 2, 3, 4, 5, 6], hint: "5 is larger than 2." },
    { prompt: "Which is less: 4 or 7?", target: 4, items: [3, 4, 5, 6, 7, 8], hint: "4 comes before 7." },
    { prompt: "Which is greater: 6 or 3?", target: 6, items: [2, 3, 4, 5, 6, 7], hint: "6 is the bigger number." },
    { prompt: "Which is less: 9 or 8?", target: 8, items: [6, 7, 8, 9, 10, 11], hint: "8 is just one less than 9." },
    { prompt: "Which is greater: 10 or 9?", target: 10, items: [7, 8, 9, 10, 11, 12], hint: "10 is more than 9." },
  ],

  // ============================================================
  // K — Operations & Algebraic Thinking
  // ============================================================

  "K.OA.A": [
    { prompt: "2 cats plus 1 more cat is?", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "Put groups together: 2 + 1 = 3." },
    { prompt: "3 apples take away 1 is?", target: 2, items: [1, 2, 3, 4, 5, 6], hint: "Subtract 1: 3 − 1 = 2." },
    { prompt: "4 dogs and 2 more dogs is?", target: 6, items: [4, 5, 6, 7, 8, 9], hint: "Add: 4 + 2 = 6." },
    { prompt: "7 toys take away 3 is?", target: 4, items: [2, 3, 4, 5, 6, 7], hint: "7 − 3 = 4." },
    { prompt: "5 birds plus 4 birds is?", target: 9, items: [7, 8, 9, 10, 11, 12], hint: "Add groups: 5 + 4 = 9." },
  ],

  "K.OA.A.1": [
    { prompt: "Show 2 + 1 with fingers. How many?", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "Hold 2 fingers, add 1 more: 3." },
    { prompt: "4 − 1 = ?", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "Take 1 away from 4." },
    { prompt: "3 + 2 = ?", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "Put 3 and 2 together: 5." },
    { prompt: "6 − 2 = ?", target: 4, items: [2, 3, 4, 5, 6, 7], hint: "6 take away 2 leaves 4." },
    { prompt: "5 + 4 = ?", target: 9, items: [7, 8, 9, 10, 11, 12], hint: "5 and 4 together equal 9." },
  ],

  "K.OA.A.2": [
    { prompt: "Ana has 3 toys. She gets 2 more. Total?", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "3 + 2 = 5." },
    { prompt: "5 birds, 2 fly away. How many left?", target: 3, items: [2, 3, 4, 5, 6, 7], hint: "5 − 2 = 3." },
    { prompt: "4 cookies + 3 more cookies = ?", target: 7, items: [5, 6, 7, 8, 9, 10], hint: "Add: 4 + 3 = 7." },
    { prompt: "8 apples, eat 3. How many left?", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "8 − 3 = 5." },
    { prompt: "6 frogs + 4 frogs = ?", target: 10, items: [8, 9, 10, 11, 12, 14], hint: "6 + 4 = 10." },
  ],

  "K.OA.A.3": [
    { prompt: "5 = 2 + ?", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "2 + 3 = 5." },
    { prompt: "6 = 4 + ?", target: 2, items: [1, 2, 3, 4, 5, 6], hint: "4 + 2 = 6." },
    { prompt: "7 = 3 + ?", target: 4, items: [2, 3, 4, 5, 6, 7], hint: "3 + 4 = 7." },
    { prompt: "9 = 5 + ?", target: 4, items: [2, 3, 4, 5, 6, 7], hint: "5 + 4 = 9." },
    { prompt: "10 = 6 + ?", target: 4, items: [2, 3, 4, 5, 6, 7], hint: "6 + 4 = 10." },
  ],

  "K.OA.A.4": [
    { prompt: "8 + ? = 10", target: 2, items: [1, 2, 3, 4, 5, 6], hint: "8 needs 2 more to make 10." },
    { prompt: "7 + ? = 10", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "7 + 3 = 10." },
    { prompt: "5 + ? = 10", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "5 + 5 = 10." },
    { prompt: "4 + ? = 10", target: 6, items: [4, 5, 6, 7, 8, 9], hint: "4 + 6 = 10." },
    { prompt: "1 + ? = 10", target: 9, items: [7, 8, 9, 10, 11, 12], hint: "1 + 9 = 10." },
  ],

  "K.OA.A.5": [
    { prompt: "2 + 2 = ?", target: 4, items: [2, 3, 4, 5, 6, 7], hint: "Double 2 is 4." },
    { prompt: "3 + 1 = ?", target: 4, items: [2, 3, 4, 5, 6, 7], hint: "3 and 1 more is 4." },
    { prompt: "5 − 2 = ?", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "Take 2 from 5 to get 3." },
    { prompt: "4 − 3 = ?", target: 1, items: [0, 1, 2, 3, 4, 5], hint: "4 − 3 = 1." },
    { prompt: "5 − 4 = ?", target: 1, items: [0, 1, 2, 3, 4, 5], hint: "Only 1 left after taking 4." },
  ],

  // ============================================================
  // K — Number & Operations in Base Ten
  // ============================================================

  "K.NBT.A": [
    { prompt: "11 = 10 + ?", target: 1, items: [1, 2, 3, 4, 5, 6], hint: "10 and 1 more is 11." },
    { prompt: "13 = 10 + ?", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "10 + 3 = 13." },
    { prompt: "15 = 10 + ?", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "10 + 5 = 15." },
    { prompt: "17 = 10 + ?", target: 7, items: [5, 6, 7, 8, 9, 10], hint: "10 + 7 = 17." },
    { prompt: "19 = 10 + ?", target: 9, items: [7, 8, 9, 10, 11, 12], hint: "10 + 9 = 19." },
  ],

  "K.NBT.A.1": [
    { prompt: "12 = 10 + ?", target: 2, items: [1, 2, 3, 4, 5, 6], hint: "Ten plus 2 equals 12." },
    { prompt: "14 = 10 + ?", target: 4, items: [2, 3, 4, 5, 6, 7], hint: "10 + 4 = 14." },
    { prompt: "10 + 6 = ?", target: 16, items: [14, 15, 16, 17, 18, 20], hint: "Ten and 6 ones is 16." },
    { prompt: "18 = 10 + ?", target: 8, items: [6, 7, 8, 9, 10, 11], hint: "10 + 8 = 18." },
    { prompt: "10 + 9 = ?", target: 19, items: [17, 18, 19, 20, 21, 29], hint: "Ten and 9 ones is 19." },
  ],

  // ============================================================
  // K — Measurement & Data
  // ============================================================

  "K.MD.A": [
    { prompt: "Pencil is 5 cubes long. How many?", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "Count the cubes: 5." },
    { prompt: "Crayon is 3 cubes long. Length?", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "3 cubes measure the crayon." },
    { prompt: "Book is 8 cubes long. Length?", target: 8, items: [6, 7, 8, 9, 10, 11], hint: "Count 8 cubes along the book." },
    { prompt: "Shoe is 7 cubes long. Length?", target: 7, items: [5, 6, 7, 8, 9, 10], hint: "7 cubes fit end to end." },
    { prompt: "Rope is 10 cubes long. Length?", target: 10, items: [8, 9, 10, 11, 12, 15], hint: "10 cubes measure the rope." },
  ],

  "K.MD.A.1": [
    { prompt: "A stick is 4 cubes long. Length?", target: 4, items: [2, 3, 4, 5, 6, 7], hint: "Count the cubes along the stick." },
    { prompt: "A box weighs 3 blocks. Weight?", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "It balances 3 blocks." },
    { prompt: "A rope is 6 units long. Length?", target: 6, items: [4, 5, 6, 7, 8, 9], hint: "Count 6 units." },
    { prompt: "A book is 9 cubes long. Length?", target: 9, items: [7, 8, 9, 10, 11, 12], hint: "9 cubes measure the book." },
    { prompt: "A table is 12 hands long. Length?", target: 12, items: [10, 11, 12, 13, 14, 15], hint: "Count 12 hand widths." },
  ],

  "K.MD.A.2": [
    { prompt: "Tall: 5 vs 3 blocks. Taller height?", target: 5, items: [2, 3, 4, 5, 6, 7], hint: "5 blocks is taller than 3." },
    { prompt: "Longer: 4 cubes or 7 cubes?", target: 7, items: [3, 4, 5, 6, 7, 8], hint: "7 is more than 4." },
    { prompt: "Shorter rope: 6 or 9 units?", target: 6, items: [5, 6, 7, 8, 9, 10], hint: "6 is less than 9." },
    { prompt: "Heavier: 8 blocks or 5 blocks?", target: 8, items: [5, 6, 7, 8, 9, 10], hint: "8 weighs more than 5." },
    { prompt: "Taller: 10 cubes or 7 cubes?", target: 10, items: [6, 7, 8, 9, 10, 11], hint: "10 is taller than 7." },
  ],

  "K.MD.B": [
    { prompt: "3 red and 2 blue. Red count?", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "Count the red group: 3." },
    { prompt: "4 cats, 1 dog. How many cats?", target: 4, items: [1, 2, 3, 4, 5, 6], hint: "Cats only: 4." },
    { prompt: "5 circles, 3 squares. Squares?", target: 3, items: [2, 3, 4, 5, 6, 7], hint: "Count only squares." },
    { prompt: "6 red + 4 blue. Total toys?", target: 10, items: [8, 9, 10, 11, 12, 14], hint: "6 + 4 = 10." },
    { prompt: "7 apples, 2 pears, 1 plum. Apples?", target: 7, items: [5, 6, 7, 8, 9, 10], hint: "Count only apples: 7." },
  ],

  "K.MD.B.3": [
    { prompt: "4 big, 3 small. How many big?", target: 4, items: [2, 3, 4, 5, 6, 7], hint: "Count only big items." },
    { prompt: "5 red, 2 blue. Blue count?", target: 2, items: [1, 2, 3, 4, 5, 6], hint: "Blue group has 2." },
    { prompt: "6 cats, 4 dogs. Total pets?", target: 10, items: [8, 9, 10, 11, 12, 14], hint: "6 + 4 = 10." },
    { prompt: "3 apples, 5 bananas. Bananas?", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "Count the banana group." },
    { prompt: "2 triangles, 3 circles, 4 squares. Squares?", target: 4, items: [2, 3, 4, 5, 6, 7], hint: "Squares: 4." },
  ],

  // ============================================================
  // K — Geometry
  // ============================================================

  "K.G.A": [
    { prompt: "Sides on a triangle?", target: 3, items: [2, 3, 4, 5, 6, 8], hint: "Tri means three." },
    { prompt: "Sides on a square?", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "A square has 4 equal sides." },
    { prompt: "Corners on a rectangle?", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "Rectangles have 4 corners." },
    { prompt: "Sides on a hexagon?", target: 6, items: [4, 5, 6, 7, 8, 10], hint: "Hex means six." },
    { prompt: "Sides on a circle?", target: 0, items: [0, 1, 2, 3, 4, 6], hint: "A circle has no straight sides." },
  ],

  "K.G.A.1": [
    { prompt: "How many sides on a triangle?", target: 3, items: [2, 3, 4, 5, 6, 8], hint: "Triangle = 3 sides." },
    { prompt: "How many corners on a square?", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "Square corners: 4." },
    { prompt: "Sides on a rectangle?", target: 4, items: [3, 4, 5, 6, 8, 10], hint: "Rectangles have 4 sides." },
    { prompt: "Sides on a pentagon?", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "Penta = 5." },
    { prompt: "Sides on a hexagon?", target: 6, items: [4, 5, 6, 7, 8, 10], hint: "Hexa = 6." },
  ],

  "K.G.A.2": [
    { prompt: "Big circle has how many sides?", target: 0, items: [0, 1, 2, 3, 4, 6], hint: "Circles have 0 straight sides." },
    { prompt: "Small triangle sides?", target: 3, items: [2, 3, 4, 5, 6, 8], hint: "All triangles have 3 sides." },
    { prompt: "Tilted square sides?", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "Turning does not change sides: 4." },
    { prompt: "Giant rectangle corners?", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "Size does not change corners." },
    { prompt: "Upside-down hexagon sides?", target: 6, items: [4, 5, 6, 7, 8, 10], hint: "Hexagon always has 6 sides." },
  ],

  "K.G.A.3": [
    { prompt: "A flat circle has how many sides?", target: 0, items: [0, 1, 2, 3, 4, 6], hint: "A circle is 2D with no straight sides." },
    { prompt: "Sides on a flat triangle?", target: 3, items: [2, 3, 4, 5, 6, 8], hint: "Flat = 2D triangle has 3 sides." },
    { prompt: "Faces on a cube?", target: 6, items: [4, 5, 6, 7, 8, 12], hint: "A cube has 6 square faces." },
    { prompt: "Edges on a square?", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "A flat square has 4 edges." },
    { prompt: "Flat faces on a cube?", target: 6, items: [4, 5, 6, 7, 8, 12], hint: "A cube is 3D with 6 faces." },
  ],

  "K.G.B": [
    { prompt: "Sides on a triangle?", target: 3, items: [2, 3, 4, 5, 6, 8], hint: "Triangles have 3 sides." },
    { prompt: "Corners on a square?", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "Squares have 4 corners." },
    { prompt: "Sides on a hexagon?", target: 6, items: [4, 5, 6, 7, 8, 10], hint: "Hexagons have 6 sides." },
    { prompt: "Faces on a cube?", target: 6, items: [4, 5, 6, 7, 8, 12], hint: "Cubes have 6 square faces." },
    { prompt: "2 triangles joined make a ___ sided shape", target: 4, items: [3, 4, 5, 6, 7, 8], hint: "Two triangles form a 4-sided shape." },
  ],

  "K.G.B.4": [
    { prompt: "A square has how many sides?", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "4 equal sides." },
    { prompt: "A triangle has how many corners?", target: 3, items: [2, 3, 4, 5, 6, 8], hint: "3 corners." },
    { prompt: "Corners on a rectangle?", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "Rectangles have 4 corners." },
    { prompt: "Sides on a pentagon?", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "Penta = 5 sides." },
    { prompt: "Faces on a cube?", target: 6, items: [4, 5, 6, 7, 8, 12], hint: "A cube has 6 flat square faces." },
  ],

  "K.G.B.5": [
    { prompt: "Sticks for a triangle?", target: 3, items: [2, 3, 4, 5, 6, 8], hint: "3 sticks for 3 sides." },
    { prompt: "Sticks for a square?", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "4 sticks for 4 sides." },
    { prompt: "Sticks for a rectangle?", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "4 sides = 4 sticks." },
    { prompt: "Sticks for a hexagon?", target: 6, items: [4, 5, 6, 7, 8, 10], hint: "6 sides need 6 sticks." },
    { prompt: "Clay balls at each corner of a square?", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "Square has 4 corners." },
  ],

  "K.G.B.6": [
    { prompt: "2 triangles make a shape with ___ sides", target: 4, items: [3, 4, 5, 6, 7, 8], hint: "Joined triangles form a rectangle." },
    { prompt: "2 squares make a shape with ___ sides", target: 4, items: [3, 4, 5, 6, 7, 8], hint: "Side by side = rectangle with 4 sides." },
    { prompt: "4 triangles can make a ___ sided square", target: 4, items: [3, 4, 5, 6, 7, 8], hint: "4 triangles fit to a square." },
    { prompt: "6 triangles can make a shape with ___ sides", target: 6, items: [3, 4, 5, 6, 7, 8], hint: "They form a hexagon (6 sides)." },
    { prompt: "2 rectangles joined: new shape has ___ sides", target: 4, items: [3, 4, 5, 6, 7, 8], hint: "Still 4 sides if joined edge-to-edge." },
  ],

  // ============================================================
  // GRADE 1 — Operations & Algebraic Thinking
  // ============================================================

  "1.OA.A": [
    { prompt: "6 + 3 = ?", target: 9, items: [7, 8, 9, 10, 11, 12], hint: "Add: 6 + 3 = 9." },
    { prompt: "12 − 4 = ?", target: 8, items: [6, 7, 8, 9, 10, 11], hint: "12 − 4 = 8." },
    { prompt: "7 + 5 = ?", target: 12, items: [10, 11, 12, 13, 14, 15], hint: "Make a ten: 7+3=10, +2=12." },
    { prompt: "15 − 7 = ?", target: 8, items: [6, 7, 8, 9, 10, 11], hint: "15 − 7 = 8." },
    { prompt: "9 + 8 = ?", target: 17, items: [15, 16, 17, 18, 19, 20], hint: "Make ten: 9+1=10, +7=17." },
  ],

  "1.OA.A.1": [
    { prompt: "5 + 4 = ?", target: 9, items: [7, 8, 9, 10, 11, 12], hint: "5 + 4 = 9." },
    { prompt: "Sam had 8, lost 3. Has?", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "8 − 3 = 5." },
    { prompt: "7 + ? = 13", target: 6, items: [4, 5, 6, 7, 8, 9], hint: "13 − 7 = 6." },
    { prompt: "14 − 6 = ?", target: 8, items: [6, 7, 8, 9, 10, 12], hint: "14 − 6 = 8." },
    { prompt: "Lina had 9, gave 4, got 7. Has?", target: 12, items: [10, 11, 12, 13, 14, 16], hint: "9 − 4 + 7 = 12." },
  ],

  "1.OA.A.2": [
    { prompt: "2 + 3 + 4 = ?", target: 9, items: [7, 8, 9, 10, 11, 12], hint: "2+3=5, 5+4=9." },
    { prompt: "1 + 5 + 2 = ?", target: 8, items: [6, 7, 8, 9, 10, 11], hint: "1+5=6, 6+2=8." },
    { prompt: "4 + 3 + 6 = ?", target: 13, items: [11, 12, 13, 14, 15, 16], hint: "4+6=10, +3=13." },
    { prompt: "5 + 2 + 7 = ?", target: 14, items: [12, 13, 14, 15, 16, 17], hint: "5+2=7, +7=14." },
    { prompt: "6 + 4 + 8 = ?", target: 18, items: [16, 17, 18, 19, 20, 22], hint: "Make ten: 6+4=10, +8=18." },
  ],

  "1.OA.B": [
    { prompt: "If 3 + 5 = 8, then 5 + 3 = ?", target: 8, items: [6, 7, 8, 9, 10, 11], hint: "Order does not change sum." },
    { prompt: "10 − 6 = ?. So 6 + ? = 10", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "6 + 4 = 10." },
    { prompt: "2 + 6 + 4 = 2 + 10 = ?", target: 12, items: [10, 11, 12, 13, 14, 16], hint: "Group 6+4=10, +2=12." },
    { prompt: "12 − 5 = ?. So 5 + ? = 12", target: 7, items: [5, 6, 7, 8, 9, 10], hint: "5 + 7 = 12." },
    { prompt: "9 + 3 + 7 = 9 + 10 = ?", target: 19, items: [17, 18, 19, 20, 21, 25], hint: "Group 3+7=10, +9=19." },
  ],

  "1.OA.B.3": [
    { prompt: "4 + 2 = 6. So 2 + 4 = ?", target: 6, items: [4, 5, 6, 7, 8, 9], hint: "Swap the order, same sum." },
    { prompt: "7 + 1 = 8. So 1 + 7 = ?", target: 8, items: [6, 7, 8, 9, 10, 11], hint: "1 + 7 = 8." },
    { prompt: "3 + 7 + 3 = 3 + 10 = ?", target: 13, items: [11, 12, 13, 14, 15, 16], hint: "Group to make ten." },
    { prompt: "5 + 5 + 2 = 10 + 2 = ?", target: 12, items: [10, 11, 12, 13, 14, 16], hint: "5+5=10, +2." },
    { prompt: "8 + 2 + 6 = 10 + 6 = ?", target: 16, items: [14, 15, 16, 17, 18, 20], hint: "Make ten with 8+2." },
  ],

  "1.OA.B.4": [
    { prompt: "10 − 8 = ?, since 8 + ? = 10", target: 2, items: [1, 2, 3, 4, 5, 6], hint: "8 + 2 = 10." },
    { prompt: "9 − 4 = ?, since 4 + ? = 9", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "4 + 5 = 9." },
    { prompt: "12 − 7 = ?, since 7 + ? = 12", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "7 + 5 = 12." },
    { prompt: "14 − 6 = ?, since 6 + ? = 14", target: 8, items: [6, 7, 8, 9, 10, 12], hint: "6 + 8 = 14." },
    { prompt: "17 − 9 = ?, since 9 + ? = 17", target: 8, items: [6, 7, 8, 9, 10, 12], hint: "9 + 8 = 17." },
  ],

  "1.OA.C": [
    { prompt: "5 + 2 = ? (count on)", target: 7, items: [5, 6, 7, 8, 9, 10], hint: "Start at 5, count: 6, 7." },
    { prompt: "8 + 2 = ? (count on)", target: 10, items: [8, 9, 10, 11, 12, 14], hint: "Start at 8: 9, 10." },
    { prompt: "7 + 3 = ?", target: 10, items: [8, 9, 10, 11, 12, 14], hint: "Count on from 7: 8, 9, 10." },
    { prompt: "13 − 2 = ?", target: 11, items: [9, 10, 11, 12, 13, 14], hint: "Count back 2 from 13." },
    { prompt: "11 + 5 = ?", target: 16, items: [14, 15, 16, 17, 18, 20], hint: "Count on from 11: 12, 13, 14, 15, 16." },
  ],

  "1.OA.C.5": [
    { prompt: "4 + 2 (count on from 4): ?", target: 6, items: [4, 5, 6, 7, 8, 9], hint: "4, then 5, 6." },
    { prompt: "6 + 3 = ?", target: 9, items: [7, 8, 9, 10, 11, 12], hint: "Count on: 7, 8, 9." },
    { prompt: "8 − 2 = ?", target: 6, items: [4, 5, 6, 7, 8, 9], hint: "Count back: 7, 6." },
    { prompt: "9 + 3 = ?", target: 12, items: [10, 11, 12, 13, 14, 15], hint: "Count on: 10, 11, 12." },
    { prompt: "12 − 4 = ?", target: 8, items: [6, 7, 8, 9, 10, 11], hint: "Count back: 11, 10, 9, 8." },
  ],

  "1.OA.C.6": [
    { prompt: "7 + 3 = ?", target: 10, items: [8, 9, 10, 11, 12, 14], hint: "7 + 3 = 10." },
    { prompt: "9 − 4 = ?", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "9 − 4 = 5." },
    { prompt: "8 + 6 = ?", target: 14, items: [12, 13, 14, 15, 16, 17], hint: "Make ten: 8+2=10, +4=14." },
    { prompt: "13 − 5 = ?", target: 8, items: [6, 7, 8, 9, 10, 11], hint: "13 − 3 = 10, 10 − 2 = 8." },
    { prompt: "9 + 8 = ?", target: 17, items: [15, 16, 17, 18, 19, 20], hint: "Make ten: 9+1=10, +7=17." },
  ],

  "1.OA.D": [
    { prompt: "Is 5 + 2 = 7 true? Answer is value.", target: 7, items: [5, 6, 7, 8, 9, 10], hint: "5 + 2 = 7." },
    { prompt: "8 = 6 + ?", target: 2, items: [1, 2, 3, 4, 5, 6], hint: "6 + 2 = 8." },
    { prompt: "11 = ? + 4", target: 7, items: [5, 6, 7, 8, 9, 10], hint: "7 + 4 = 11." },
    { prompt: "15 − ? = 9", target: 6, items: [4, 5, 6, 7, 8, 9], hint: "15 − 6 = 9." },
    { prompt: "? + 8 = 14", target: 6, items: [4, 5, 6, 7, 8, 9], hint: "14 − 8 = 6." },
  ],

  "1.OA.D.7": [
    { prompt: "7 = ? (which makes it true)", target: 7, items: [5, 6, 7, 8, 9, 10], hint: "7 equals 7." },
    { prompt: "5 + 2 = ? + 5", target: 2, items: [1, 2, 3, 4, 5, 6], hint: "Both sides equal 7." },
    { prompt: "4 + 1 = ?", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "4 + 1 = 5." },
    { prompt: "8 − 3 = ? + 2", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "8-3=5, so 3+2=5." },
    { prompt: "6 + 4 = 2 + ?", target: 8, items: [6, 7, 8, 9, 10, 12], hint: "Both sides = 10; 2 + 8 = 10." },
  ],

  "1.OA.D.8": [
    { prompt: "8 + ? = 11", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "11 − 8 = 3." },
    { prompt: "5 = ? − 3", target: 8, items: [6, 7, 8, 9, 10, 11], hint: "8 − 3 = 5." },
    { prompt: "6 + 6 = ?", target: 12, items: [10, 11, 12, 13, 14, 16], hint: "Doubles: 6+6=12." },
    { prompt: "? + 7 = 13", target: 6, items: [4, 5, 6, 7, 8, 9], hint: "13 − 7 = 6." },
    { prompt: "14 − ? = 9", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "14 − 5 = 9." },
  ],

  // ============================================================
  // GRADE 1 — Number & Operations in Base Ten
  // ============================================================

  "1.NBT.A": [
    { prompt: "What comes after 29?", target: 30, items: [28, 29, 30, 31, 40, 50], hint: "After 29 is 30." },
    { prompt: "What comes after 59?", target: 60, items: [58, 59, 60, 61, 70, 90], hint: "59 + 1 = 60." },
    { prompt: "What comes after 99?", target: 100, items: [98, 99, 100, 101, 110, 90], hint: "After 99 is 100." },
    { prompt: "Start at 98, count up 4. End?", target: 102, items: [100, 101, 102, 103, 104, 110], hint: "98, 99, 100, 101, 102." },
    { prompt: "Start at 116, count up 3. End?", target: 119, items: [117, 118, 119, 120, 121, 125], hint: "116, 117, 118, 119." },
  ],

  "1.NBT.A.1": [
    { prompt: "Number after 39?", target: 40, items: [38, 39, 40, 41, 50, 30], hint: "39 + 1 = 40." },
    { prompt: "Number after 89?", target: 90, items: [88, 89, 90, 91, 100, 80], hint: "After 89 is 90." },
    { prompt: "Count up from 97: 98, 99, ___", target: 100, items: [98, 99, 100, 101, 110, 120], hint: "After 99 is 100." },
    { prompt: "What is 10 more than 110?", target: 120, items: [111, 115, 119, 120, 121, 130], hint: "110 + 10 = 120." },
    { prompt: "What comes after 119?", target: 120, items: [118, 119, 120, 121, 125, 130], hint: "119 + 1 = 120." },
  ],

  "1.NBT.B": [
    { prompt: "23 has how many tens?", target: 2, items: [1, 2, 3, 4, 5, 6], hint: "2 tens in 23." },
    { prompt: "45 has how many ones?", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "The ones digit is 5." },
    { prompt: "70 has how many tens?", target: 7, items: [5, 6, 7, 8, 9, 10], hint: "7 tens, 0 ones." },
    { prompt: "Which is greater: 42 or 35?", target: 42, items: [30, 35, 40, 42, 45, 50], hint: "4 tens beats 3 tens." },
    { prompt: "Which is greater: 67 or 76?", target: 76, items: [60, 67, 70, 76, 77, 80], hint: "7 tens beats 6 tens." },
  ],

  "1.NBT.B.2": [
    { prompt: "Tens in 34?", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "3 tens = 30." },
    { prompt: "Ones in 57?", target: 7, items: [5, 6, 7, 8, 9, 10], hint: "Ones digit is 7." },
    { prompt: "How much is 6 tens?", target: 60, items: [16, 36, 60, 66, 70, 16], hint: "6 × 10 = 60." },
    { prompt: "4 tens + 8 ones = ?", target: 48, items: [40, 44, 48, 52, 80, 84], hint: "40 + 8 = 48." },
    { prompt: "7 tens + 3 ones = ?", target: 73, items: [37, 70, 73, 77, 83, 103], hint: "70 + 3 = 73." },
  ],

  "1.NBT.B.2a": [
    { prompt: "How many ones in one ten?", target: 10, items: [1, 5, 9, 10, 11, 20], hint: "A ten is 10 ones." },
    { prompt: "2 tens = how many ones?", target: 20, items: [12, 18, 20, 22, 25, 30], hint: "2 × 10 = 20." },
    { prompt: "3 tens = ?", target: 30, items: [13, 23, 30, 33, 40, 50], hint: "3 × 10 = 30." },
    { prompt: "5 tens = ?", target: 50, items: [15, 45, 50, 55, 60, 100], hint: "5 × 10 = 50." },
    { prompt: "9 tens = ?", target: 90, items: [19, 89, 90, 91, 99, 100], hint: "9 × 10 = 90." },
  ],

  "1.NBT.B.2b": [
    { prompt: "12 = 10 + ?", target: 2, items: [1, 2, 3, 4, 5, 6], hint: "10 + 2 = 12." },
    { prompt: "15 = 10 + ?", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "10 + 5 = 15." },
    { prompt: "10 + 7 = ?", target: 17, items: [15, 16, 17, 18, 19, 20], hint: "A ten and 7 ones." },
    { prompt: "18 = 10 + ?", target: 8, items: [6, 7, 8, 9, 10, 11], hint: "10 + 8 = 18." },
    { prompt: "10 + 9 = ?", target: 19, items: [17, 18, 19, 20, 21, 29], hint: "Ten and 9 ones." },
  ],

  "1.NBT.B.2c": [
    { prompt: "How many tens in 40?", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "4 tens = 40." },
    { prompt: "How many tens in 60?", target: 6, items: [4, 5, 6, 7, 8, 10], hint: "6 tens = 60." },
    { prompt: "How many tens in 80?", target: 8, items: [6, 7, 8, 9, 10, 12], hint: "8 tens = 80." },
    { prompt: "5 tens = ?", target: 50, items: [15, 45, 50, 55, 60, 100], hint: "5 × 10 = 50." },
    { prompt: "9 tens = ?", target: 90, items: [19, 89, 90, 91, 100, 109], hint: "9 × 10 = 90." },
  ],

  "1.NBT.B.3": [
    { prompt: "Which is greater: 23 or 32?", target: 32, items: [20, 23, 30, 32, 33, 40], hint: "3 tens beats 2 tens." },
    { prompt: "Which is less: 47 or 41?", target: 41, items: [40, 41, 44, 47, 48, 50], hint: "Tens tie; 1 < 7." },
    { prompt: "Which is greater: 58 or 85?", target: 85, items: [55, 58, 80, 85, 88, 95], hint: "8 tens > 5 tens." },
    { prompt: "Which is less: 72 or 27?", target: 27, items: [22, 27, 70, 72, 77, 80], hint: "2 tens < 7 tens." },
    { prompt: "Which is greater: 91 or 89?", target: 91, items: [80, 88, 89, 90, 91, 100], hint: "9 tens > 8 tens." },
  ],

  "1.NBT.C": [
    { prompt: "20 + 30 = ?", target: 50, items: [40, 45, 50, 55, 60, 70], hint: "2 tens + 3 tens = 5 tens." },
    { prompt: "45 + 3 = ?", target: 48, items: [46, 47, 48, 49, 50, 58], hint: "Add 3 to ones." },
    { prompt: "34 + 20 = ?", target: 54, items: [44, 50, 54, 56, 64, 74], hint: "Add 2 tens to 34." },
    { prompt: "10 more than 67 is?", target: 77, items: [57, 68, 70, 77, 78, 87], hint: "67 + 10 = 77." },
    { prompt: "80 − 30 = ?", target: 50, items: [40, 45, 50, 55, 60, 70], hint: "8 tens − 3 tens = 5 tens." },
  ],

  "1.NBT.C.4": [
    { prompt: "23 + 4 = ?", target: 27, items: [25, 26, 27, 28, 29, 30], hint: "Add 4 to ones: 27." },
    { prompt: "45 + 30 = ?", target: 75, items: [65, 70, 72, 75, 78, 80], hint: "Add 3 tens: 75." },
    { prompt: "36 + 7 = ?", target: 43, items: [41, 42, 43, 44, 45, 46], hint: "36+4=40, +3=43." },
    { prompt: "58 + 20 = ?", target: 78, items: [68, 70, 75, 78, 80, 88], hint: "Add 2 tens to 58." },
    { prompt: "47 + 16 = ?", target: 63, items: [53, 60, 62, 63, 64, 73], hint: "47+10=57, +6=63." },
  ],

  "1.NBT.C.5": [
    { prompt: "10 more than 23 is?", target: 33, items: [13, 24, 32, 33, 34, 43], hint: "Tens go from 2 to 3." },
    { prompt: "10 less than 56 is?", target: 46, items: [45, 46, 47, 55, 57, 66], hint: "Drop tens by 1." },
    { prompt: "10 more than 68 is?", target: 78, items: [58, 67, 69, 77, 78, 88], hint: "68 + 10 = 78." },
    { prompt: "10 less than 82 is?", target: 72, items: [71, 72, 73, 81, 83, 92], hint: "82 − 10 = 72." },
    { prompt: "10 more than 90 is?", target: 100, items: [80, 91, 99, 100, 110, 101], hint: "90 + 10 = 100." },
  ],

  "1.NBT.C.6": [
    { prompt: "40 − 10 = ?", target: 30, items: [20, 25, 30, 35, 40, 50], hint: "4 tens − 1 ten = 3 tens." },
    { prompt: "60 − 20 = ?", target: 40, items: [30, 35, 40, 45, 50, 80], hint: "6 tens − 2 tens = 4 tens." },
    { prompt: "80 − 30 = ?", target: 50, items: [40, 45, 50, 55, 60, 110], hint: "8 tens − 3 tens = 5 tens." },
    { prompt: "90 − 40 = ?", target: 50, items: [40, 45, 50, 55, 60, 130], hint: "9 tens − 4 tens = 5 tens." },
    { prompt: "70 − 50 = ?", target: 20, items: [10, 15, 20, 25, 30, 120], hint: "7 tens − 5 tens = 2 tens." },
  ],

  // ============================================================
  // GRADE 1 — Measurement & Data
  // ============================================================

  "1.MD.A": [
    { prompt: "Pencil is 6 cubes, crayon 4. How much longer?", target: 2, items: [1, 2, 3, 4, 5, 10], hint: "6 − 4 = 2." },
    { prompt: "Stick is 9 cubes, rope 5. Longer by?", target: 4, items: [2, 3, 4, 5, 6, 14], hint: "9 − 5 = 4." },
    { prompt: "Book is 8 cubes. How many cubes?", target: 8, items: [6, 7, 8, 9, 10, 12], hint: "Count units end to end." },
    { prompt: "Snake is 12 cubes, worm 7. Longer by?", target: 5, items: [3, 4, 5, 6, 7, 19], hint: "12 − 7 = 5." },
    { prompt: "Rope 15 cubes, string 9. Difference?", target: 6, items: [4, 5, 6, 7, 8, 24], hint: "15 − 9 = 6." },
  ],

  "1.MD.A.1": [
    { prompt: "Shortest: 3, 5, 7 cubes. Pick shortest.", target: 3, items: [1, 2, 3, 4, 5, 7], hint: "Smallest number is shortest." },
    { prompt: "Longest: 4, 9, 6 cubes. Pick longest.", target: 9, items: [4, 5, 6, 7, 8, 9], hint: "Biggest is longest." },
    { prompt: "Order 8, 3, 6. Middle length?", target: 6, items: [3, 4, 5, 6, 7, 8], hint: "Between 3 and 8." },
    { prompt: "Order 12, 7, 10. Shortest?", target: 7, items: [5, 7, 9, 10, 12, 14], hint: "Smallest of three." },
    { prompt: "Order 15, 11, 8. Longest?", target: 15, items: [8, 10, 11, 13, 15, 17], hint: "Biggest is 15." },
  ],

  "1.MD.A.2": [
    { prompt: "Pencil laid with 5 paperclips. Length?", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "Count the units: 5." },
    { prompt: "Book is 7 cubes end to end. Length?", target: 7, items: [5, 6, 7, 8, 9, 10], hint: "Number of units = 7." },
    { prompt: "Desk is 9 hands long. Length?", target: 9, items: [7, 8, 9, 10, 11, 12], hint: "Count each hand unit." },
    { prompt: "Rope is 12 cubes long. Length?", target: 12, items: [10, 11, 12, 13, 14, 15], hint: "12 same-size units." },
    { prompt: "Shelf is 18 cubes long. Length?", target: 18, items: [15, 16, 17, 18, 19, 20], hint: "Count 18 units." },
  ],

  "1.MD.B": [
    { prompt: "Clock shows 3:00. Hour?", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "Short hand on 3." },
    { prompt: "Clock shows 7:00. Hour?", target: 7, items: [5, 6, 7, 8, 9, 10], hint: "Short hand on 7." },
    { prompt: "Clock shows 9:30. Hour?", target: 9, items: [7, 8, 9, 10, 11, 12], hint: "Hour hand just past 9." },
    { prompt: "Half past 5 = 5:?", target: 30, items: [15, 20, 25, 30, 45, 60], hint: "Half hour = 30 min." },
    { prompt: "12:00 is ___ o'clock", target: 12, items: [1, 6, 10, 11, 12, 24], hint: "Noon or midnight." },
  ],

  "1.MD.B.3": [
    { prompt: "Clock shows 2:00. Hour?", target: 2, items: [1, 2, 3, 4, 5, 6], hint: "Short hand points at 2." },
    { prompt: "Clock shows 8:00. Hour?", target: 8, items: [6, 7, 8, 9, 10, 11], hint: "Short hand on 8." },
    { prompt: "Half past 4 = 4:?", target: 30, items: [15, 20, 30, 40, 45, 60], hint: "Half hour = 30." },
    { prompt: "Digital: 11:30. Minutes past hour?", target: 30, items: [15, 20, 30, 45, 60, 11], hint: "Half past 11." },
    { prompt: "6:30 is half past what hour?", target: 6, items: [3, 5, 6, 7, 12, 30], hint: "The hour number is 6." },
  ],

  "1.MD.C": [
    { prompt: "Red: 3, Blue: 4, Green: 2. Total?", target: 9, items: [6, 7, 8, 9, 10, 12], hint: "3 + 4 + 2 = 9." },
    { prompt: "Cats 5, dogs 3. How many more cats?", target: 2, items: [1, 2, 3, 4, 5, 8], hint: "5 − 3 = 2." },
    { prompt: "A:6, B:2, C:4. Most?", target: 6, items: [2, 3, 4, 5, 6, 12], hint: "A has the most." },
    { prompt: "A:7, B:3. Difference?", target: 4, items: [2, 3, 4, 5, 6, 10], hint: "7 − 3 = 4." },
    { prompt: "Apples 6, pears 5, plums 3. Total fruit?", target: 14, items: [11, 12, 13, 14, 15, 18], hint: "6+5+3=14." },
  ],

  "1.MD.C.4": [
    { prompt: "Red 4, blue 3. Total?", target: 7, items: [5, 6, 7, 8, 9, 10], hint: "4 + 3 = 7." },
    { prompt: "Cats 6, dogs 2. More cats by?", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "6 − 2 = 4." },
    { prompt: "Red 5, Blue 4, Green 2. Total?", target: 11, items: [9, 10, 11, 12, 13, 15], hint: "5+4+2=11." },
    { prompt: "Cat 8, dog 3. How many more cats?", target: 5, items: [3, 4, 5, 6, 7, 11], hint: "8 − 3 = 5." },
    { prompt: "A:9, B:6, C:3. A minus C?", target: 6, items: [3, 4, 5, 6, 7, 12], hint: "9 − 3 = 6." },
  ],

  // ============================================================
  // GRADE 1 — Geometry
  // ============================================================

  "1.G.A": [
    { prompt: "Sides on a triangle?", target: 3, items: [2, 3, 4, 5, 6, 8], hint: "Triangle = 3." },
    { prompt: "Corners on a square?", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "Square = 4 corners." },
    { prompt: "Halves in a whole?", target: 2, items: [1, 2, 3, 4, 5, 6], hint: "Two halves make a whole." },
    { prompt: "Fourths in a whole?", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "Four fourths make a whole." },
    { prompt: "A rectangle cut into 4 equal parts. Each is a ___", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "Fourth = 4 equal parts." },
  ],

  "1.G.A.1": [
    { prompt: "Sides on a triangle?", target: 3, items: [2, 3, 4, 5, 6, 8], hint: "Triangle = 3 sides." },
    { prompt: "Sides on a square?", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "Square = 4 sides." },
    { prompt: "Sides on a rectangle?", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "Rectangle = 4 sides." },
    { prompt: "Sides on a hexagon?", target: 6, items: [4, 5, 6, 7, 8, 10], hint: "Hexa = 6." },
    { prompt: "Sides on a pentagon?", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "Penta = 5." },
  ],

  "1.G.A.2": [
    { prompt: "2 triangles joined = ___ sided shape", target: 4, items: [3, 4, 5, 6, 7, 8], hint: "Forms a rectangle." },
    { prompt: "2 squares side by side: sides?", target: 4, items: [3, 4, 5, 6, 7, 8], hint: "Longer rectangle = 4 sides." },
    { prompt: "4 triangles make a square? How many sides?", target: 4, items: [3, 4, 5, 6, 7, 8], hint: "Square has 4." },
    { prompt: "6 triangles can form a hexagon. Sides?", target: 6, items: [3, 4, 5, 6, 7, 8], hint: "Hexagon = 6." },
    { prompt: "Cube has how many square faces?", target: 6, items: [4, 5, 6, 7, 8, 12], hint: "A cube has 6 faces." },
  ],

  "1.G.A.3": [
    { prompt: "Half of 10 apples = ?", target: 5, items: [2, 3, 5, 6, 8, 10], hint: "10 ÷ 2 = 5." },
    { prompt: "Quarter of 8 = ?", target: 2, items: [1, 2, 3, 4, 5, 8], hint: "8 ÷ 4 = 2." },
    { prompt: "Half of 12 = ?", target: 6, items: [3, 4, 5, 6, 7, 12], hint: "12 ÷ 2 = 6." },
    { prompt: "A pizza cut into 4 equal slices. How many slices?", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "4 equal parts." },
    { prompt: "Quarter of 16 = ?", target: 4, items: [2, 3, 4, 5, 8, 16], hint: "16 ÷ 4 = 4." },
  ],

  // ============================================================
  // GRADE 2 — Operations & Algebraic Thinking
  // ============================================================

  "2.OA.A": [
    { prompt: "25 + 14 = ?", target: 39, items: [35, 37, 38, 39, 40, 49], hint: "Add tens and ones: 30+9=39." },
    { prompt: "60 − 25 = ?", target: 35, items: [25, 30, 35, 40, 45, 85], hint: "60 − 25 = 35." },
    { prompt: "34 + 28 = ?", target: 62, items: [52, 56, 60, 62, 64, 72], hint: "30+20=50, 4+8=12, 50+12=62." },
    { prompt: "Jo had 45, gave 18. Has?", target: 27, items: [23, 25, 27, 29, 33, 63], hint: "45 − 18 = 27." },
    { prompt: "18 + 27 + 15 = ?", target: 60, items: [50, 55, 58, 60, 62, 70], hint: "18+27=45, +15=60." },
  ],

  "2.OA.A.1": [
    { prompt: "23 + 15 = ?", target: 38, items: [33, 35, 37, 38, 39, 48], hint: "20+10=30, 3+5=8, total 38." },
    { prompt: "50 − 24 = ?", target: 26, items: [24, 25, 26, 27, 28, 74], hint: "50 − 24 = 26." },
    { prompt: "36 + 27 = ?", target: 63, items: [53, 57, 60, 62, 63, 73], hint: "30+20=50, 6+7=13, 50+13=63." },
    { prompt: "Sue had 52, lost 19, got 8. Has?", target: 41, items: [33, 39, 41, 45, 60, 79], hint: "52-19=33, +8=41." },
    { prompt: "82 − 37 + 15 = ?", target: 60, items: [50, 55, 58, 60, 62, 74], hint: "82-37=45, +15=60." },
  ],

  "2.OA.B": [
    { prompt: "8 + 6 = ?", target: 14, items: [12, 13, 14, 15, 16, 18], hint: "Make ten: 8+2=10, +4=14." },
    { prompt: "15 − 7 = ?", target: 8, items: [6, 7, 8, 9, 10, 11], hint: "15 − 7 = 8." },
    { prompt: "9 + 7 = ?", target: 16, items: [14, 15, 16, 17, 18, 20], hint: "Make ten: 9+1=10, +6=16." },
    { prompt: "17 − 9 = ?", target: 8, items: [6, 7, 8, 9, 10, 12], hint: "17 − 9 = 8." },
    { prompt: "8 + 9 = ?", target: 17, items: [15, 16, 17, 18, 19, 20], hint: "Doubles: 8+8=16, +1=17." },
  ],

  "2.OA.B.2": [
    { prompt: "6 + 7 = ?", target: 13, items: [11, 12, 13, 14, 15, 16], hint: "Doubles+1: 6+6=12, +1=13." },
    { prompt: "14 − 6 = ?", target: 8, items: [6, 7, 8, 9, 10, 12], hint: "14 − 6 = 8." },
    { prompt: "9 + 8 = ?", target: 17, items: [15, 16, 17, 18, 19, 20], hint: "9+1=10, +7=17." },
    { prompt: "16 − 9 = ?", target: 7, items: [5, 6, 7, 8, 9, 10], hint: "16 − 9 = 7." },
    { prompt: "8 + 7 = ?", target: 15, items: [13, 14, 15, 16, 17, 18], hint: "8+2=10, +5=15." },
  ],

  "2.OA.C": [
    { prompt: "Is 8 even? If yes, 8 = 4 + ?", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "Even: pairs up; 4+4=8." },
    { prompt: "Is 7 odd? (1 yes, 0 no)", target: 1, items: [0, 1, 2, 3, 4, 7], hint: "7 does not pair evenly." },
    { prompt: "10 = 5 + ? (equal addends)", target: 5, items: [3, 4, 5, 6, 7, 10], hint: "5 + 5 = 10, so even." },
    { prompt: "Rows 3 × cols 4 = total?", target: 12, items: [7, 10, 11, 12, 13, 16], hint: "3 rows of 4 = 12." },
    { prompt: "Rows 5 × cols 4 = total?", target: 20, items: [15, 18, 20, 22, 24, 25], hint: "5 rows of 4 = 20." },
  ],

  "2.OA.C.3": [
    { prompt: "Is 6 even? 6 = 3 + ?", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "3 + 3 = 6." },
    { prompt: "Is 10 even? 10 = 5 + ?", target: 5, items: [3, 4, 5, 6, 7, 10], hint: "5 + 5 = 10." },
    { prompt: "Is 14 even? 14 = 7 + ?", target: 7, items: [5, 6, 7, 8, 9, 14], hint: "7 + 7 = 14." },
    { prompt: "Is 18 even? 18 = 9 + ?", target: 9, items: [7, 8, 9, 10, 11, 18], hint: "9 + 9 = 18." },
    { prompt: "Is 20 even? 20 = 10 + ?", target: 10, items: [8, 9, 10, 11, 12, 20], hint: "10 + 10 = 20." },
  ],

  "2.OA.C.4": [
    { prompt: "2 rows of 3 = ?", target: 6, items: [4, 5, 6, 7, 8, 9], hint: "3 + 3 = 6." },
    { prompt: "3 rows of 4 = ?", target: 12, items: [8, 10, 11, 12, 13, 16], hint: "4 + 4 + 4 = 12." },
    { prompt: "4 rows of 5 = ?", target: 20, items: [15, 18, 20, 22, 24, 25], hint: "5+5+5+5=20." },
    { prompt: "5 rows of 3 = ?", target: 15, items: [12, 13, 14, 15, 16, 18], hint: "3×5 repeats: 15." },
    { prompt: "5 rows of 5 = ?", target: 25, items: [20, 22, 24, 25, 26, 30], hint: "5+5+5+5+5=25." },
  ],

  // ============================================================
  // GRADE 2 — Number & Operations in Base Ten
  // ============================================================

  "2.NBT.A": [
    { prompt: "Hundreds in 347?", target: 3, items: [1, 2, 3, 4, 5, 7], hint: "First digit = hundreds." },
    { prompt: "Tens in 528?", target: 2, items: [1, 2, 3, 4, 5, 8], hint: "Middle digit = tens." },
    { prompt: "Skip-count by 5s: 15, 20, ___", target: 25, items: [22, 24, 25, 26, 30, 35], hint: "Add 5 to 20." },
    { prompt: "Skip by 100s: 300, 400, ___", target: 500, items: [410, 450, 500, 510, 600, 700], hint: "Add 100 to 400." },
    { prompt: "Which is greater: 504 or 540?", target: 540, items: [450, 500, 504, 540, 544, 550], hint: "4 tens > 0 tens." },
  ],

  "2.NBT.A.1": [
    { prompt: "Hundreds in 237?", target: 2, items: [0, 1, 2, 3, 5, 7], hint: "First digit is 2." },
    { prompt: "Tens in 456?", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "Middle digit is 5." },
    { prompt: "Ones in 389?", target: 9, items: [3, 5, 7, 8, 9, 10], hint: "Last digit is 9." },
    { prompt: "706 = 700 + 0 + ?", target: 6, items: [0, 1, 6, 7, 10, 70], hint: "Ones digit = 6." },
    { prompt: "548 = ___ + 40 + 8", target: 500, items: [5, 40, 50, 500, 540, 548], hint: "Hundreds: 5 × 100 = 500." },
  ],

  "2.NBT.A.1a": [
    { prompt: "How many tens in 100?", target: 10, items: [1, 5, 10, 20, 100, 1000], hint: "10 tens = 100." },
    { prompt: "How many ones in 100?", target: 100, items: [10, 20, 50, 100, 200, 1000], hint: "100 is 100 ones." },
    { prompt: "20 tens = ?", target: 200, items: [20, 100, 200, 210, 220, 2000], hint: "20 × 10 = 200." },
    { prompt: "30 tens = ?", target: 300, items: [30, 100, 200, 300, 310, 3000], hint: "30 × 10 = 300." },
    { prompt: "50 tens = ?", target: 500, items: [50, 100, 450, 500, 550, 5000], hint: "50 × 10 = 500." },
  ],

  "2.NBT.A.1b": [
    { prompt: "3 hundreds = ?", target: 300, items: [30, 33, 300, 303, 330, 3000], hint: "3 × 100 = 300." },
    { prompt: "5 hundreds = ?", target: 500, items: [50, 55, 500, 505, 550, 5000], hint: "5 × 100 = 500." },
    { prompt: "7 hundreds = ?", target: 700, items: [70, 77, 700, 707, 770, 7000], hint: "7 × 100 = 700." },
    { prompt: "9 hundreds = ?", target: 900, items: [90, 99, 900, 909, 990, 9000], hint: "9 × 100 = 900." },
    { prompt: "How many hundreds in 600?", target: 6, items: [2, 4, 6, 8, 60, 600], hint: "600 = 6 × 100." },
  ],

  "2.NBT.A.2": [
    { prompt: "Skip by 5s: 10, 15, ___", target: 20, items: [16, 18, 20, 22, 25, 30], hint: "Add 5 to 15." },
    { prompt: "Skip by 10s: 40, 50, ___", target: 60, items: [51, 55, 60, 65, 70, 80], hint: "Add 10 to 50." },
    { prompt: "Skip by 100s: 200, 300, ___", target: 400, items: [310, 350, 400, 450, 500, 600], hint: "Add 100 to 300." },
    { prompt: "Skip by 5s: 45, 50, ___", target: 55, items: [50, 52, 54, 55, 60, 65], hint: "Add 5 to 50." },
    { prompt: "Skip by 100s: 700, 800, ___", target: 900, items: [810, 850, 880, 900, 1000, 810], hint: "Add 100 to 800." },
  ],

  "2.NBT.A.3": [
    { prompt: "200 + 30 + 4 = ?", target: 234, items: [223, 230, 234, 243, 324, 432], hint: "Hundreds+tens+ones." },
    { prompt: "400 + 50 + 6 = ?", target: 456, items: [445, 450, 456, 465, 546, 654], hint: "4-5-6." },
    { prompt: "700 + 80 + 1 = ?", target: 781, items: [178, 718, 781, 817, 871, 178], hint: "Hundreds 7, tens 8, ones 1." },
    { prompt: "Expanded: 300 + 0 + 5 = ?", target: 305, items: [35, 305, 350, 503, 530, 3005], hint: "0 in tens place." },
    { prompt: "Expanded: 900 + 40 + 0 = ?", target: 940, items: [94, 409, 904, 940, 994, 9400], hint: "0 in ones place." },
  ],

  "2.NBT.A.4": [
    { prompt: "Which is greater: 234 or 243?", target: 243, items: [224, 234, 243, 244, 324, 432], hint: "Tens: 4 > 3." },
    { prompt: "Which is less: 507 or 570?", target: 507, items: [500, 505, 507, 570, 575, 577], hint: "Tens: 0 < 7." },
    { prompt: "Which is greater: 689 or 698?", target: 698, items: [680, 689, 690, 698, 700, 869], hint: "Ones: 8 > 9? wait; 698 has 9 tens vs 8 tens — pick 698." },
    { prompt: "Which is less: 412 or 421?", target: 412, items: [401, 411, 412, 420, 421, 422], hint: "Tens: 1 < 2." },
    { prompt: "Which is greater: 800 or 799?", target: 800, items: [779, 789, 799, 800, 801, 810], hint: "8 hundreds > 7 hundreds." },
  ],

  "2.NBT.B": [
    { prompt: "35 + 27 = ?", target: 62, items: [52, 58, 60, 62, 64, 72], hint: "30+20=50, 5+7=12, total 62." },
    { prompt: "80 − 45 = ?", target: 35, items: [25, 30, 35, 40, 45, 55], hint: "80 − 45 = 35." },
    { prompt: "123 + 145 = ?", target: 268, items: [258, 264, 266, 268, 278, 368], hint: "100+100, 20+40, 3+5." },
    { prompt: "10 more than 347?", target: 357, items: [337, 345, 348, 357, 447, 3470], hint: "Add 1 to tens." },
    { prompt: "100 less than 620?", target: 520, items: [510, 520, 530, 610, 720, 52], hint: "Subtract 1 from hundreds." },
  ],

  "2.NBT.B.5": [
    { prompt: "28 + 36 = ?", target: 64, items: [54, 60, 62, 64, 66, 74], hint: "20+30=50, 8+6=14, 50+14=64." },
    { prompt: "75 − 28 = ?", target: 47, items: [43, 45, 47, 49, 53, 57], hint: "75 − 28 = 47." },
    { prompt: "46 + 37 = ?", target: 83, items: [73, 79, 81, 83, 85, 93], hint: "40+30=70, 6+7=13, 70+13=83." },
    { prompt: "92 − 45 = ?", target: 47, items: [43, 45, 47, 49, 53, 57], hint: "92 − 45 = 47." },
    { prompt: "67 + 29 = ?", target: 96, items: [86, 90, 94, 96, 98, 106], hint: "67+30=97, −1=96." },
  ],

  "2.NBT.B.6": [
    { prompt: "12 + 13 + 14 = ?", target: 39, items: [29, 36, 37, 39, 41, 49], hint: "12+13=25, +14=39." },
    { prompt: "20 + 30 + 10 = ?", target: 60, items: [40, 50, 60, 70, 80, 100], hint: "Add tens." },
    { prompt: "15 + 25 + 10 = ?", target: 50, items: [40, 45, 50, 55, 60, 75], hint: "15+25=40, +10=50." },
    { prompt: "22 + 18 + 20 = ?", target: 60, items: [50, 55, 58, 60, 62, 80], hint: "22+18=40, +20=60." },
    { prompt: "31 + 29 + 14 + 16 = ?", target: 90, items: [70, 80, 85, 88, 90, 100], hint: "31+29=60, 14+16=30, total 90." },
  ],

  "2.NBT.B.7": [
    { prompt: "234 + 125 = ?", target: 359, items: [349, 353, 355, 357, 359, 369], hint: "200+100, 30+20, 4+5 = 359." },
    { prompt: "456 − 123 = ?", target: 333, items: [313, 323, 333, 343, 353, 433], hint: "4-1, 5-2, 6-3 = 333." },
    { prompt: "327 + 246 = ?", target: 573, items: [553, 563, 567, 571, 573, 583], hint: "300+200=500, 20+40=60, 7+6=13, 500+60+13=573." },
    { prompt: "500 − 234 = ?", target: 266, items: [246, 256, 266, 276, 286, 366], hint: "500 − 234 = 266." },
    { prompt: "648 + 275 = ?", target: 923, items: [813, 823, 913, 923, 933, 1023], hint: "600+200=800, 40+70=110, 8+5=13, 800+110+13=923." },
  ],

  "2.NBT.B.8": [
    { prompt: "10 more than 235?", target: 245, items: [225, 236, 245, 335, 236, 250], hint: "Add 1 to tens digit." },
    { prompt: "100 more than 347?", target: 447, items: [337, 357, 447, 547, 357, 348], hint: "Add 1 to hundreds." },
    { prompt: "10 less than 580?", target: 570, items: [480, 569, 570, 579, 581, 590], hint: "Subtract 1 from tens." },
    { prompt: "100 less than 625?", target: 525, items: [515, 525, 535, 615, 725, 515], hint: "Subtract 1 from hundreds." },
    { prompt: "100 more than 817?", target: 917, items: [807, 818, 827, 917, 918, 927], hint: "Add 1 to hundreds digit." },
  ],

  "2.NBT.B.9": [
    { prompt: "47 + 30 = ?", target: 77, items: [67, 72, 75, 77, 80, 87], hint: "Add tens: 4+3=7 tens, 77." },
    { prompt: "85 − 40 = ?", target: 45, items: [35, 40, 45, 50, 55, 125], hint: "8-4=4 tens, ones stay." },
    { prompt: "123 + 200 = ?", target: 323, items: [223, 303, 313, 323, 333, 423], hint: "Add hundreds: 1+2=3 hundreds." },
    { prompt: "560 − 300 = ?", target: 260, items: [160, 230, 260, 290, 360, 860], hint: "5-3=2 hundreds, tens stay." },
    { prompt: "456 + 150 = ?", target: 606, items: [506, 596, 606, 616, 706, 516], hint: "456+150: add 100, then 50." },
  ],

  // ============================================================
  // GRADE 2 — Measurement & Data
  // ============================================================

  "2.MD.A": [
    { prompt: "Pencil 15 cm, crayon 9 cm. Difference?", target: 6, items: [4, 5, 6, 7, 8, 24], hint: "15 − 9 = 6." },
    { prompt: "Rope 30 in, string 18 in. Difference?", target: 12, items: [10, 11, 12, 13, 14, 48], hint: "30 − 18 = 12." },
    { prompt: "Desk is about ___ feet long (likely 3).", target: 3, items: [1, 2, 3, 4, 5, 12], hint: "A desk is a few feet." },
    { prompt: "A pencil in inches ≈ ?", target: 7, items: [1, 3, 5, 7, 12, 36], hint: "About 7 inches." },
    { prompt: "Car is 12 ft, truck 18 ft. Difference?", target: 6, items: [4, 5, 6, 7, 8, 30], hint: "18 − 12 = 6." },
  ],

  "2.MD.A.1": [
    { prompt: "Ruler says 4. Length?", target: 4, items: [2, 3, 4, 5, 6, 7], hint: "Read the number at the end." },
    { prompt: "Ruler says 9. Length?", target: 9, items: [7, 8, 9, 10, 11, 12], hint: "Line up with 0, read 9." },
    { prompt: "Ruler: item is 12 in. Length?", target: 12, items: [10, 11, 12, 13, 14, 15], hint: "12 inches." },
    { prompt: "Yardstick: 24 in. Length?", target: 24, items: [12, 18, 20, 24, 30, 36], hint: "2 feet = 24 in." },
    { prompt: "Meter stick: 36 in. Length?", target: 36, items: [24, 30, 32, 36, 40, 48], hint: "About 3 feet." },
  ],

  "2.MD.A.2": [
    { prompt: "Book: 12 in OR 1 foot. Inches?", target: 12, items: [1, 6, 10, 12, 24, 36], hint: "1 ft = 12 in." },
    { prompt: "Rope: 36 in OR 3 ft. Feet?", target: 3, items: [1, 2, 3, 4, 5, 12], hint: "36 ÷ 12 = 3." },
    { prompt: "Table: 6 ft or 2 yd. Feet?", target: 6, items: [2, 3, 4, 5, 6, 12], hint: "1 yard = 3 feet." },
    { prompt: "String: 100 cm = ? m", target: 1, items: [1, 2, 10, 50, 100, 1000], hint: "100 cm = 1 m." },
    { prompt: "Wall: 200 cm = ? m", target: 2, items: [1, 2, 10, 20, 200, 1000], hint: "200 cm = 2 m." },
  ],

  "2.MD.A.3": [
    { prompt: "A pencil is about ? inches", target: 7, items: [1, 3, 5, 7, 12, 36], hint: "Typical pencil ~ 7 in." },
    { prompt: "A door is about ? feet tall", target: 7, items: [3, 5, 7, 10, 12, 20], hint: "A door is about 7 ft." },
    { prompt: "A room is about ? feet wide", target: 12, items: [3, 6, 12, 20, 50, 100], hint: "Rooms ~10-15 ft." },
    { prompt: "A paperclip is about ? cm", target: 3, items: [1, 3, 5, 10, 25, 100], hint: "Paperclip ~ 3 cm." },
    { prompt: "A car is about ? meters long", target: 4, items: [1, 2, 4, 10, 20, 100], hint: "A car ~ 4 m." },
  ],

  "2.MD.A.4": [
    { prompt: "Rope 12 in, string 8 in. Longer by?", target: 4, items: [2, 3, 4, 5, 6, 20], hint: "12 − 8 = 4." },
    { prompt: "Pencil 7 in, crayon 4 in. Difference?", target: 3, items: [1, 2, 3, 4, 5, 11], hint: "7 − 4 = 3." },
    { prompt: "Table 60 in, bench 45 in. Difference?", target: 15, items: [10, 12, 15, 17, 20, 105], hint: "60 − 45 = 15." },
    { prompt: "Wall 100 in, shelf 72 in. Difference?", target: 28, items: [18, 22, 28, 32, 38, 172], hint: "100 − 72 = 28." },
    { prompt: "Rope 120 cm, string 85 cm. Difference?", target: 35, items: [25, 30, 35, 40, 45, 205], hint: "120 − 85 = 35." },
  ],

  "2.MD.B": [
    { prompt: "Line is 3 in, add 5 in. Total?", target: 8, items: [6, 7, 8, 9, 10, 15], hint: "3 + 5 = 8." },
    { prompt: "Path 12 ft, then 8 ft. Total?", target: 20, items: [16, 18, 20, 22, 24, 96], hint: "12 + 8 = 20." },
    { prompt: "Walk 25 m, then 15 m. Total?", target: 40, items: [30, 35, 40, 45, 50, 10], hint: "25 + 15 = 40." },
    { prompt: "Run 45 m − 18 m run back. End?", target: 27, items: [23, 25, 27, 29, 33, 63], hint: "45 − 18 = 27." },
    { prompt: "Hike 60 ft, then 35 ft more. Total?", target: 95, items: [85, 90, 92, 95, 100, 105], hint: "60 + 35 = 95." },
  ],

  "2.MD.B.5": [
    { prompt: "5 in + 8 in = ?", target: 13, items: [11, 12, 13, 14, 15, 40], hint: "5 + 8 = 13." },
    { prompt: "20 ft − 12 ft = ?", target: 8, items: [6, 7, 8, 9, 10, 32], hint: "20 − 12 = 8." },
    { prompt: "35 cm + 26 cm = ?", target: 61, items: [51, 55, 59, 61, 63, 71], hint: "35 + 26 = 61." },
    { prompt: "80 m − 45 m = ?", target: 35, items: [25, 30, 35, 40, 45, 125], hint: "80 − 45 = 35." },
    { prompt: "48 in + 37 in = ?", target: 85, items: [75, 80, 83, 85, 87, 95], hint: "48 + 37 = 85." },
  ],

  "2.MD.B.6": [
    { prompt: "Start 0, jump to 5, then 3 more. Where?", target: 8, items: [6, 7, 8, 9, 10, 15], hint: "5 + 3 = 8." },
    { prompt: "Start 0, jump 7, then 6 more. Where?", target: 13, items: [11, 12, 13, 14, 15, 42], hint: "7 + 6 = 13." },
    { prompt: "Start 20, jump back 8. Where?", target: 12, items: [10, 11, 12, 13, 14, 28], hint: "20 − 8 = 12." },
    { prompt: "Start 45, jump 30 forward. Where?", target: 75, items: [55, 65, 70, 75, 80, 85], hint: "45 + 30 = 75." },
    { prompt: "Start 80, jump back 25. Where?", target: 55, items: [45, 50, 55, 60, 65, 105], hint: "80 − 25 = 55." },
  ],

  "2.MD.C": [
    { prompt: "Clock shows 3:15. Minutes?", target: 15, items: [5, 10, 15, 20, 30, 45], hint: "Minute hand on 3." },
    { prompt: "Clock shows 4:45. Minutes?", target: 45, items: [15, 25, 30, 40, 45, 60], hint: "Minute hand on 9." },
    { prompt: "1 quarter = ? cents", target: 25, items: [1, 5, 10, 25, 50, 100], hint: "25 cents." },
    { prompt: "3 dimes = ? cents", target: 30, items: [13, 25, 30, 33, 50, 100], hint: "3 × 10 = 30." },
    { prompt: "2 quarters + 3 dimes = ? cents", target: 80, items: [50, 55, 65, 75, 80, 100], hint: "50 + 30 = 80." },
  ],

  "2.MD.C.7": [
    { prompt: "Clock: 2:05. Minutes?", target: 5, items: [1, 5, 10, 15, 20, 25], hint: "Hand on 1 = 5 minutes." },
    { prompt: "Clock: 6:30. Minutes?", target: 30, items: [15, 20, 25, 30, 45, 60], hint: "Hand on 6 = 30." },
    { prompt: "Clock: 9:45. Minutes?", target: 45, items: [15, 25, 30, 40, 45, 60], hint: "Hand on 9 = 45." },
    { prompt: "Clock: 11:20. Minutes?", target: 20, items: [10, 15, 20, 25, 30, 40], hint: "Hand on 4 = 20." },
    { prompt: "Clock: 7:55. Minutes?", target: 55, items: [30, 40, 45, 50, 55, 60], hint: "Hand on 11 = 55." },
  ],

  "2.MD.C.8": [
    { prompt: "1 dime = ? cents", target: 10, items: [1, 5, 10, 25, 50, 100], hint: "Dime = 10." },
    { prompt: "1 quarter = ? cents", target: 25, items: [5, 10, 20, 25, 50, 100], hint: "Quarter = 25." },
    { prompt: "2 dimes + 3 pennies = ? cents", target: 23, items: [13, 20, 23, 25, 30, 32], hint: "20 + 3 = 23." },
    { prompt: "3 quarters = ? cents", target: 75, items: [30, 50, 60, 75, 80, 100], hint: "3 × 25 = 75." },
    { prompt: "1 quarter + 2 dimes + 1 nickel = ?", target: 50, items: [40, 45, 50, 55, 60, 75], hint: "25 + 20 + 5 = 50." },
  ],

  "2.MD.D": [
    { prompt: "Dogs 5, cats 4, birds 3. Total?", target: 12, items: [10, 11, 12, 13, 14, 15], hint: "5+4+3=12." },
    { prompt: "A:7 B:4. A − B = ?", target: 3, items: [1, 2, 3, 4, 5, 11], hint: "7 − 4 = 3." },
    { prompt: "Red 8, blue 6, green 5. Total?", target: 19, items: [15, 17, 18, 19, 20, 21], hint: "8+6+5=19." },
    { prompt: "A:9 B:2 C:4 D:5. Total?", target: 20, items: [16, 18, 19, 20, 22, 25], hint: "9+2+4+5=20." },
    { prompt: "Lengths (in): 4, 5, 5, 6, 6, 6, 7. Most common?", target: 6, items: [4, 5, 6, 7, 8, 21], hint: "6 appears 3 times." },
  ],

  "2.MD.D.9": [
    { prompt: "Lengths: 3, 3, 4, 5. Sum?", target: 15, items: [12, 13, 14, 15, 16, 18], hint: "3+3+4+5=15." },
    { prompt: "Measured 4 times: 6, 6, 7, 7. Sum?", target: 26, items: [22, 24, 26, 28, 30, 32], hint: "6+6+7+7=26." },
    { prompt: "Plot: 2, 3, 3, 4, 4, 4, 5. Most common?", target: 4, items: [2, 3, 4, 5, 6, 21], hint: "4 appears 3 times." },
    { prompt: "Lengths 10, 11, 12, 13. Total?", target: 46, items: [36, 42, 44, 46, 48, 52], hint: "Sum the four numbers." },
    { prompt: "Data 5,6,6,7,8,8,8. Sum?", target: 48, items: [42, 44, 46, 48, 50, 52], hint: "5+6+6+7+8+8+8=48." },
  ],

  "2.MD.D.10": [
    { prompt: "Bar: A=4 B=6. Total?", target: 10, items: [8, 9, 10, 11, 12, 14], hint: "4 + 6 = 10." },
    { prompt: "Bar: A=7 B=5. Difference?", target: 2, items: [1, 2, 3, 4, 5, 12], hint: "7 − 5 = 2." },
    { prompt: "Picture graph: A 3 B 5 C 4. Total?", target: 12, items: [10, 11, 12, 13, 14, 15], hint: "3+5+4=12." },
    { prompt: "A=8 B=3 C=6 D=5. Total?", target: 22, items: [18, 20, 21, 22, 23, 25], hint: "8+3+6+5=22." },
    { prompt: "A=12 B=7. How many more in A?", target: 5, items: [3, 4, 5, 6, 7, 19], hint: "12 − 7 = 5." },
  ],

  // ============================================================
  // GRADE 2 — Geometry
  // ============================================================

  "2.G.A": [
    { prompt: "Sides on a pentagon?", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "Penta = 5." },
    { prompt: "Sides on a hexagon?", target: 6, items: [4, 5, 6, 7, 8, 10], hint: "Hexa = 6." },
    { prompt: "3 rows of 4 squares = ?", target: 12, items: [7, 10, 11, 12, 13, 16], hint: "3 × 4 = 12." },
    { prompt: "Halves in a whole?", target: 2, items: [1, 2, 3, 4, 5, 6], hint: "2 halves make 1 whole." },
    { prompt: "Thirds in a whole?", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "3 thirds make 1 whole." },
  ],

  "2.G.A.1": [
    { prompt: "Angles in a triangle?", target: 3, items: [2, 3, 4, 5, 6, 8], hint: "Triangle = 3 angles." },
    { prompt: "Sides in a quadrilateral?", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "Quad = 4 sides." },
    { prompt: "Sides in a pentagon?", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "Penta = 5." },
    { prompt: "Sides in a hexagon?", target: 6, items: [4, 5, 6, 7, 8, 10], hint: "Hexa = 6." },
    { prompt: "Faces on a cube?", target: 6, items: [4, 5, 6, 7, 8, 12], hint: "Cube = 6 equal faces." },
  ],

  "2.G.A.2": [
    { prompt: "2 rows × 3 cols = ? squares", target: 6, items: [4, 5, 6, 7, 8, 9], hint: "2 × 3 = 6." },
    { prompt: "3 rows × 4 cols = ?", target: 12, items: [7, 10, 11, 12, 13, 16], hint: "3 × 4 = 12." },
    { prompt: "4 rows × 4 cols = ?", target: 16, items: [12, 14, 16, 18, 20, 24], hint: "4 × 4 = 16." },
    { prompt: "5 rows × 3 cols = ?", target: 15, items: [12, 13, 14, 15, 16, 18], hint: "5 × 3 = 15." },
    { prompt: "6 rows × 4 cols = ?", target: 24, items: [18, 20, 22, 24, 26, 30], hint: "6 × 4 = 24." },
  ],

  "2.G.A.3": [
    { prompt: "Halves in a whole pizza?", target: 2, items: [1, 2, 3, 4, 5, 6], hint: "2 halves = whole." },
    { prompt: "Thirds in a whole?", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "3 thirds = whole." },
    { prompt: "Fourths in a whole?", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "4 fourths = whole." },
    { prompt: "Half of 8 = ?", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "8 ÷ 2 = 4." },
    { prompt: "Fourth of 12 = ?", target: 3, items: [2, 3, 4, 5, 6, 12], hint: "12 ÷ 4 = 3." },
  ],

  // ============================================================
  // GRADE 3 — Operations, Fractions, Measurement, Geometry
  // ============================================================

  "3.OA.A": [
    { prompt: "3 groups of 4 equals?", target: 12, items: [7, 10, 12, 14, 15, 16], hint: "3 × 4 means 3 groups of 4." },
    { prompt: "2 rows of 5. How many total?", target: 10, items: [7, 8, 10, 12, 14, 15], hint: "2 × 5 = 5 + 5 = 10." },
    { prompt: "Share 12 cookies among 3 friends:", target: 4, items: [3, 4, 5, 6, 8, 9], hint: "12 ÷ 3 = 4." },
    { prompt: "6 × 7 = ?", target: 42, items: [36, 40, 42, 48, 49, 54], hint: "Six sevens is 42." },
    { prompt: "54 ÷ 9 = ?", target: 6, items: [5, 6, 7, 8, 9, 12], hint: "9 × 6 = 54." },
  ],
  "3.OA.A.1": [
    { prompt: "3 bags with 4 cookies each. Total?", target: 12, items: [7, 10, 12, 15, 16, 20], hint: "3 × 4 = 4 + 4 + 4." },
    { prompt: "5 groups of 2 equals?", target: 10, items: [7, 8, 10, 12, 15, 20], hint: "5 × 2 means 5 groups of 2." },
    { prompt: "What is 6 × 3?", target: 18, items: [15, 18, 21, 24, 27, 30], hint: "6 × 3 = 6 + 6 + 6." },
    { prompt: "7 × 4 = ?", target: 28, items: [24, 28, 32, 35, 36, 42], hint: "Add 7 four times." },
    { prompt: "9 × 8 = ?", target: 72, items: [63, 64, 72, 80, 81, 90], hint: "10 × 8 = 80, then 80 - 8 = 72." },
  ],
  "3.OA.A.2": [
    { prompt: "Share 12 apples among 3 kids:", target: 4, items: [3, 4, 5, 6, 8, 12], hint: "12 ÷ 3 = 4 each." },
    { prompt: "20 ÷ 5 = ?", target: 4, items: [2, 3, 4, 5, 6, 10], hint: "5 × 4 = 20." },
    { prompt: "24 marbles in 4 equal bags. Per bag?", target: 6, items: [4, 5, 6, 7, 8, 12], hint: "24 ÷ 4 = 6." },
    { prompt: "42 ÷ 7 = ?", target: 6, items: [5, 6, 7, 8, 9, 12], hint: "7 × 6 = 42." },
    { prompt: "56 ÷ 8 = ?", target: 7, items: [6, 7, 8, 9, 48, 64], hint: "8 × 7 = 56." },
  ],
  "3.OA.A.3": [
    { prompt: "4 rows of 5 stickers. Total?", target: 20, items: [9, 15, 18, 20, 25, 30], hint: "4 × 5 = 20." },
    { prompt: "18 toys shared by 6 kids. Each gets?", target: 3, items: [2, 3, 4, 5, 6, 9], hint: "18 ÷ 6 = 3." },
    { prompt: "7 boxes with 6 crayons each. Total?", target: 42, items: [36, 42, 48, 49, 54, 56], hint: "7 × 6 = 42." },
    { prompt: "Pack 45 books, 9 per box. Boxes?", target: 5, items: [4, 5, 6, 7, 9, 10], hint: "45 ÷ 9 = 5." },
    { prompt: "8 teams of 9 players. Total?", target: 72, items: [56, 64, 72, 81, 90, 99], hint: "8 × 9 = 72." },
  ],
  "3.OA.A.4": [
    { prompt: "8 × ? = 48. Find ?", target: 6, items: [4, 5, 6, 7, 8, 9], hint: "48 ÷ 8 = 6." },
    { prompt: "5 × ? = 35. Find ?", target: 7, items: [5, 6, 7, 8, 9, 10], hint: "35 ÷ 5 = 7." },
    { prompt: "? ÷ 3 = 5. Find ?", target: 15, items: [8, 12, 15, 18, 20, 25], hint: "5 × 3 = 15." },
    { prompt: "6 × ? = 54. Find ?", target: 9, items: [6, 7, 8, 9, 10, 12], hint: "54 ÷ 6 = 9." },
    { prompt: "? × 8 = 64. Find ?", target: 8, items: [6, 7, 8, 9, 10, 16], hint: "64 ÷ 8 = 8." },
  ],
  "3.OA.B": [
    { prompt: "If 4 × 6 = 24, then 6 × 4 = ?", target: 24, items: [18, 20, 22, 24, 28, 30], hint: "Order doesn't change the product." },
    { prompt: "2 × 3 × 4 = ?", target: 24, items: [12, 18, 20, 24, 30, 36], hint: "First 2 × 3 = 6, then 6 × 4 = 24." },
    { prompt: "8 × 5 = 40 and 8 × 2 = 16. So 8 × 7 = ?", target: 56, items: [48, 54, 56, 58, 64, 72], hint: "40 + 16 = 56." },
    { prompt: "32 ÷ 8 (think 8 × ? = 32):", target: 4, items: [3, 4, 5, 6, 7, 8], hint: "8 × 4 = 32." },
    { prompt: "7 × 6 using 7 × 5 + 7 × 1:", target: 42, items: [35, 40, 42, 45, 48, 49], hint: "35 + 7 = 42." },
  ],
  "3.OA.B.5": [
    { prompt: "If 7 × 3 = 21, then 3 × 7 = ?", target: 21, items: [18, 20, 21, 24, 27, 30], hint: "Commutative — order doesn't matter." },
    { prompt: "4 × 5 × 2 = ?", target: 40, items: [25, 30, 35, 40, 45, 50], hint: "5 × 2 = 10, then 4 × 10 = 40." },
    { prompt: "6 × 8 using 6 × 5 + 6 × 3:", target: 48, items: [42, 45, 48, 54, 56, 60], hint: "30 + 18 = 48." },
    { prompt: "9 × 7 using 9 × 5 + 9 × 2:", target: 63, items: [56, 60, 63, 64, 72, 81], hint: "45 + 18 = 63." },
    { prompt: "2 × 7 × 5 = ?", target: 70, items: [35, 49, 60, 70, 80, 90], hint: "2 × 5 = 10, then 10 × 7 = 70." },
  ],
  "3.OA.B.6": [
    { prompt: "32 ÷ 8 (what times 8 = 32?)", target: 4, items: [3, 4, 5, 6, 7, 8], hint: "8 × 4 = 32." },
    { prompt: "45 ÷ 9 = ?", target: 5, items: [4, 5, 6, 7, 8, 9], hint: "9 × 5 = 45." },
    { prompt: "63 ÷ 7 = ?", target: 9, items: [7, 8, 9, 10, 11, 12], hint: "7 × 9 = 63." },
    { prompt: "48 ÷ 6 = ?", target: 8, items: [6, 7, 8, 9, 10, 12], hint: "6 × 8 = 48." },
    { prompt: "81 ÷ 9 = ?", target: 9, items: [6, 7, 8, 9, 10, 11], hint: "9 × 9 = 81." },
  ],
  "3.OA.C": [
    { prompt: "4 × 6 = ?", target: 24, items: [18, 20, 24, 28, 30, 36], hint: "Four 6s is 24." },
    { prompt: "35 ÷ 5 = ?", target: 7, items: [5, 6, 7, 8, 9, 10], hint: "5 × 7 = 35." },
    { prompt: "7 × 8 = ?", target: 56, items: [48, 54, 56, 63, 64, 72], hint: "Seven 8s is 56." },
    { prompt: "72 ÷ 9 = ?", target: 8, items: [6, 7, 8, 9, 10, 12], hint: "9 × 8 = 72." },
    { prompt: "9 × 9 = ?", target: 81, items: [72, 79, 81, 88, 90, 99], hint: "Nine nines is 81." },
  ],
  "3.OA.C.7": [
    { prompt: "6 × 4 = ?", target: 24, items: [18, 20, 24, 28, 30, 36], hint: "Six 4s is 24." },
    { prompt: "40 ÷ 5 = ?", target: 8, items: [6, 7, 8, 9, 10, 12], hint: "5 × 8 = 40." },
    { prompt: "8 × 7 = ?", target: 56, items: [48, 54, 56, 63, 64, 72], hint: "56 is 8 sevens." },
    { prompt: "63 ÷ 9 = ?", target: 7, items: [5, 6, 7, 8, 9, 10], hint: "9 × 7 = 63." },
    { prompt: "9 × 6 = ?", target: 54, items: [48, 52, 54, 56, 60, 63], hint: "10 × 6 = 60, then 60 - 6 = 54." },
  ],
  "3.OA.D": [
    { prompt: "Buy 3 toys at $4, pay $20. Change?", target: 8, items: [4, 6, 8, 10, 12, 14], hint: "3 × 4 = 12; 20 - 12 = 8." },
    { prompt: "2 boxes of 6 pencils + 5 loose. Total?", target: 17, items: [13, 15, 17, 19, 21, 23], hint: "12 + 5 = 17." },
    { prompt: "Save $6/wk for 4 wks, spend $10. Left?", target: 14, items: [10, 12, 14, 18, 20, 24], hint: "24 - 10 = 14." },
    { prompt: "Pattern 3, 6, 9, 12, __. Next?", target: 15, items: [13, 14, 15, 16, 18, 21], hint: "Add 3 each step." },
    { prompt: "Earn $7/hr for 5 hr, spend $12. Left?", target: 23, items: [18, 20, 23, 28, 30, 35], hint: "35 - 12 = 23." },
  ],
  "3.OA.D.8": [
    { prompt: "Buy 2 shirts at $8, pay $20. Change?", target: 4, items: [2, 4, 6, 8, 12, 16], hint: "2 × 8 = 16; 20 - 16 = 4." },
    { prompt: "3 packs of 5 cards + 4 more. Total?", target: 19, items: [15, 17, 19, 21, 23, 25], hint: "15 + 4 = 19." },
    { prompt: "Read 20 pgs/day for 4 days, then 15 more:", target: 95, items: [75, 85, 90, 95, 100, 115], hint: "80 + 15 = 95." },
    { prompt: "48 marbles shared by 6, then give 2 away. Each has?", target: 6, items: [4, 5, 6, 7, 8, 10], hint: "48 ÷ 6 = 8; 8 - 2 = 6." },
    { prompt: "Earn $9/hr × 6 hr, spend $14. Left?", target: 40, items: [30, 35, 40, 45, 50, 54], hint: "54 - 14 = 40." },
  ],
  "3.OA.D.9": [
    { prompt: "Pattern 2, 4, 6, 8, __. Next?", target: 10, items: [9, 10, 11, 12, 14, 16], hint: "Add 2 each step." },
    { prompt: "Pattern 5, 10, 15, 20, __. Next?", target: 25, items: [21, 23, 25, 28, 30, 35], hint: "Count by 5s." },
    { prompt: "4 × 7 (always even)?", target: 28, items: [24, 26, 28, 30, 32, 36], hint: "4 × 7 = 28." },
    { prompt: "Pattern 3, 6, 9, 12, 15, __. Next?", target: 18, items: [16, 17, 18, 19, 21, 24], hint: "Multiples of 3." },
    { prompt: "Pattern 7, 14, 21, 28, __. Next?", target: 35, items: [30, 32, 35, 36, 42, 49], hint: "Multiples of 7." },
  ],
  "3.NBT.A": [
    { prompt: "Round 47 to nearest 10:", target: 50, items: [30, 40, 45, 50, 60, 70], hint: "7 rounds up." },
    { prompt: "245 + 132 = ?", target: 377, items: [367, 377, 387, 397, 407, 477], hint: "200+100=300; 45+32=77." },
    { prompt: "500 - 175 = ?", target: 325, items: [315, 325, 335, 345, 375, 425], hint: "500 - 175 = 325." },
    { prompt: "Round 168 to nearest 100:", target: 200, items: [100, 150, 160, 170, 200, 300], hint: "168 is closer to 200." },
    { prompt: "7 × 40 = ?", target: 280, items: [240, 270, 280, 320, 340, 350], hint: "7 × 4 = 28; add a 0." },
  ],
  "3.NBT.A.1": [
    { prompt: "Round 38 to nearest 10:", target: 40, items: [20, 30, 35, 40, 50, 60], hint: "8 rounds up." },
    { prompt: "Round 72 to nearest 10:", target: 70, items: [60, 70, 75, 80, 90, 100], hint: "2 rounds down." },
    { prompt: "Round 245 to nearest 100:", target: 200, items: [100, 200, 240, 250, 300, 400], hint: "245 is closer to 200." },
    { prompt: "Round 478 to nearest 100:", target: 500, items: [400, 450, 470, 480, 500, 600], hint: "78 rounds up." },
    { prompt: "Round 653 to nearest 100:", target: 700, items: [600, 650, 660, 700, 750, 800], hint: "53 rounds up." },
  ],
  "3.NBT.A.2": [
    { prompt: "234 + 156 = ?", target: 390, items: [380, 390, 400, 410, 430, 490], hint: "200+100; 34+56=90." },
    { prompt: "500 - 250 = ?", target: 250, items: [200, 225, 250, 275, 300, 350], hint: "Half of 500." },
    { prompt: "467 + 289 = ?", target: 756, items: [646, 746, 756, 766, 776, 856], hint: "400+200=600; 67+89=156." },
    { prompt: "812 - 347 = ?", target: 465, items: [455, 465, 475, 485, 555, 565], hint: "812 - 347 = 465." },
    { prompt: "639 + 278 = ?", target: 917, items: [807, 907, 917, 927, 1007, 1017], hint: "600+200=800; 39+78=117." },
  ],
  "3.NBT.A.3": [
    { prompt: "5 × 60 = ?", target: 300, items: [250, 280, 300, 320, 350, 360], hint: "5 × 6 = 30; add 0." },
    { prompt: "9 × 80 = ?", target: 720, items: [640, 700, 720, 800, 810, 900], hint: "9 × 8 = 72; add 0." },
    { prompt: "7 × 50 = ?", target: 350, items: [300, 330, 350, 370, 400, 450], hint: "7 × 5 = 35; add 0." },
    { prompt: "8 × 70 = ?", target: 560, items: [480, 540, 560, 600, 630, 720], hint: "8 × 7 = 56; add 0." },
    { prompt: "6 × 90 = ?", target: 540, items: [480, 500, 520, 540, 600, 630], hint: "6 × 9 = 54; add 0." },
  ],
  "3.NF.A": [
    { prompt: "Pizza in 4 equal slices. 1 slice is 1/?", target: 4, items: [1, 2, 3, 4, 6, 8], hint: "4 equal parts means 1/4." },
    { prompt: "In 3/6, how many 1/6 parts?", target: 3, items: [1, 2, 3, 4, 6, 9], hint: "Numerator = count of parts." },
    { prompt: "2/4 equals 1/?", target: 2, items: [1, 2, 3, 4, 6, 8], hint: "2/4 = 1/2." },
    { prompt: "4/4 equals what whole number?", target: 1, items: [0, 1, 2, 3, 4, 8], hint: "All 4 of 4 parts = 1 whole." },
    { prompt: "Bigger: 1/2 or 1/4? (denom of bigger)", target: 2, items: [1, 2, 3, 4, 6, 8], hint: "1/2 > 1/4; smaller bottom wins." },
  ],
  "3.NF.A.1": [
    { prompt: "Cake in 4 equal parts. One part = 1/?", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "1/4." },
    { prompt: "6 equal slices. 1 slice is 1/?", target: 6, items: [2, 3, 4, 6, 8, 12], hint: "Denom = total parts." },
    { prompt: "In 3/8, how many 1/8 parts?", target: 3, items: [1, 3, 5, 8, 11, 24], hint: "Numerator = parts." },
    { prompt: "Whole in 5 parts. 3 parts = ?/5", target: 3, items: [1, 2, 3, 4, 5, 8], hint: "3 of 5 parts." },
    { prompt: "Fraction a/b with a=5, b=8 — numerator:", target: 5, items: [3, 5, 8, 13, 40, 58], hint: "Top number is a." },
  ],
  "3.NF.A.2": [
    { prompt: "Number line 0-1 in halves. 1/2 is ? jumps from 0:", target: 1, items: [1, 2, 3, 4, 5, 6], hint: "One jump of 1/2." },
    { prompt: "0-1 in 4ths. 3/4 is ? jumps from 0:", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "Three 1/4 jumps." },
    { prompt: "0-1 in 6ths. 5/6 is ? jumps:", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "Five 1/6 jumps." },
    { prompt: "0-1 in 1/8 marks. 7/8 is ? jumps:", target: 7, items: [5, 6, 7, 8, 9, 10], hint: "Seven 1/8 jumps." },
    { prompt: "How many 1/3s in 2 wholes?", target: 6, items: [2, 3, 4, 5, 6, 9], hint: "2 × 3 = 6." },
  ],
  "3.NF.A.2a": [
    { prompt: "Split 0-1 in 3 parts. First mark at 1/?", target: 3, items: [1, 2, 3, 4, 6, 9], hint: "1/3." },
    { prompt: "Split 0-1 in 4 parts. First mark 1/?", target: 4, items: [2, 3, 4, 6, 8, 12], hint: "1/4." },
    { prompt: "Split 0-1 in 6 parts. First mark 1/?", target: 6, items: [3, 4, 5, 6, 8, 12], hint: "1/6." },
    { prompt: "Split 0-1 in 8 parts. First mark 1/?", target: 8, items: [4, 6, 7, 8, 12, 16], hint: "1/8." },
    { prompt: "Split 0-1 in 10 parts. First mark 1/?", target: 10, items: [5, 8, 9, 10, 15, 20], hint: "1/10." },
  ],
  "3.NF.A.2b": [
    { prompt: "From 0, 3 lengths of 1/4. Land at ?/4", target: 3, items: [1, 2, 3, 4, 6, 12], hint: "3/4." },
    { prompt: "From 0, 2 lengths of 1/3. At ?/3", target: 2, items: [1, 2, 3, 4, 6, 9], hint: "2/3." },
    { prompt: "5 lengths of 1/8 land at ?/8", target: 5, items: [3, 5, 6, 8, 13, 40], hint: "5/8." },
    { prompt: "7 lengths of 1/10 land at ?/10", target: 7, items: [3, 5, 7, 9, 10, 17], hint: "7/10." },
    { prompt: "From 0, 4 lengths of 1/6. ?/6", target: 4, items: [2, 3, 4, 6, 10, 24], hint: "4/6." },
  ],
  "3.NF.A.3": [
    { prompt: "1/2 = ?/4", target: 2, items: [1, 2, 3, 4, 6, 8], hint: "Multiply top and bottom by 2." },
    { prompt: "2/4 = ?/2", target: 1, items: [1, 2, 3, 4, 6, 8], hint: "Divide both by 2." },
    { prompt: "3/6 = ?/2", target: 1, items: [1, 2, 3, 4, 6, 9], hint: "Divide by 3." },
    { prompt: "Bigger: 3/4 or 1/4? (numer of bigger)", target: 3, items: [1, 2, 3, 4, 6, 7], hint: "Same bottom — bigger top wins." },
    { prompt: "Bigger: 1/3 or 1/6? (denom of bigger)", target: 3, items: [1, 2, 3, 6, 9, 12], hint: "Smaller bottom = bigger piece." },
  ],
  "3.NF.A.3a": [
    { prompt: "1/2 and 2/4 same size? (1=yes 0=no)", target: 1, items: [0, 1, 2, 3, 4, 8], hint: "Same point on number line." },
    { prompt: "1/3 and 2/6 same size? (1=yes 0=no)", target: 1, items: [0, 1, 2, 3, 6, 9], hint: "Equivalent." },
    { prompt: "1/4 and 1/2 same size? (1=yes 0=no)", target: 0, items: [0, 1, 2, 3, 4, 8], hint: "1/2 > 1/4." },
    { prompt: "3/4 and 6/8 same size? (1=yes 0=no)", target: 1, items: [0, 1, 2, 3, 4, 8], hint: "Multiply 3/4 by 2/2." },
    { prompt: "2/3 and 4/6 same size? (1=yes 0=no)", target: 1, items: [0, 1, 2, 3, 4, 6], hint: "Equivalent." },
  ],
  "3.NF.A.3b": [
    { prompt: "1/2 = ?/4", target: 2, items: [1, 2, 3, 4, 6, 8], hint: "×2/2." },
    { prompt: "1/3 = ?/6", target: 2, items: [1, 2, 3, 4, 6, 9], hint: "×2/2." },
    { prompt: "2/3 = ?/6", target: 4, items: [2, 3, 4, 5, 6, 9], hint: "×2/2." },
    { prompt: "4/6 = ?/3", target: 2, items: [1, 2, 3, 4, 6, 8], hint: "Divide by 2." },
    { prompt: "6/8 = ?/4", target: 3, items: [2, 3, 4, 5, 6, 8], hint: "Divide by 2." },
  ],
  "3.NF.A.3c": [
    { prompt: "3 = 3/?", target: 1, items: [1, 2, 3, 4, 6, 9], hint: "Whole = whole/1." },
    { prompt: "6/1 = ?", target: 6, items: [1, 2, 3, 6, 9, 12], hint: "Whole over 1 = whole." },
    { prompt: "4/4 = ?", target: 1, items: [0, 1, 2, 4, 8, 16], hint: "All parts = 1 whole." },
    { prompt: "5 = ?/1", target: 5, items: [1, 2, 3, 5, 10, 15], hint: "Denominator 1." },
    { prompt: "8/8 = ?", target: 1, items: [0, 1, 2, 4, 8, 16], hint: "8 of 8 parts = 1." },
  ],
  "3.NF.A.3d": [
    { prompt: "Bigger: 3/4 or 1/4? (numer of bigger)", target: 3, items: [1, 2, 3, 4, 6, 7], hint: "Same bottom, bigger top." },
    { prompt: "Bigger: 1/2 or 1/8? (denom of bigger)", target: 2, items: [1, 2, 4, 6, 8, 10], hint: "Same top, smaller bottom." },
    { prompt: "Bigger: 2/3 or 2/5? (denom of bigger)", target: 3, items: [1, 2, 3, 4, 5, 10], hint: "Smaller bottom = bigger piece." },
    { prompt: "Bigger: 5/6 or 3/6? (numer of bigger)", target: 5, items: [2, 3, 4, 5, 6, 8], hint: "Same bottom." },
    { prompt: "Bigger: 1/4 or 1/3? (denom of bigger)", target: 3, items: [1, 2, 3, 4, 6, 12], hint: "1/3 > 1/4." },
  ],
  "3.MD.A": [
    { prompt: "Start 3:15, end 3:45. Minutes passed?", target: 30, items: [15, 20, 25, 30, 45, 60], hint: "45 - 15 = 30." },
    { prompt: "3 bags × 250 g. Total g?", target: 750, items: [500, 600, 700, 750, 800, 900], hint: "3 × 250 = 750." },
    { prompt: "Juice jug 4 L. Pour out 1 L. Left?", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "4 - 1 = 3." },
    { prompt: "Start 2:10, end 2:55. Minutes?", target: 45, items: [35, 40, 45, 50, 55, 65], hint: "55 - 10 = 45." },
    { prompt: "Movie 90 min, starts 4:20. Ends 5:50. Minutes past 5:", target: 50, items: [30, 40, 45, 50, 60, 90], hint: "4:20 + 90 = 5:50." },
  ],
  "3.MD.A.1": [
    { prompt: "Start 1:20, end 1:45. Minutes?", target: 25, items: [15, 20, 25, 30, 35, 45], hint: "45 - 20 = 25." },
    { prompt: "Start 4:10, end 4:35. Minutes?", target: 25, items: [15, 20, 25, 30, 35, 45], hint: "35 - 10 = 25." },
    { prompt: "Start 2:45, end 3:15. Minutes?", target: 30, items: [15, 20, 25, 30, 45, 60], hint: "15 up to 3:00, + 15 more." },
    { prompt: "Start 10:30, end 11:10. Minutes?", target: 40, items: [30, 35, 40, 45, 50, 60], hint: "30 to 11:00 + 10." },
    { prompt: "Movie 95 min, starts 6:15. End minutes past 7:", target: 50, items: [30, 40, 45, 50, 55, 60], hint: "6:15 + 95 = 7:50." },
  ],
  "3.MD.A.2": [
    { prompt: "2 L + 3 L = ? L", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "Add liters." },
    { prompt: "500 g + 250 g = ? g", target: 750, items: [500, 650, 700, 750, 800, 1000], hint: "Add grams." },
    { prompt: "Pitcher 6 L into 2 equal jugs. Each?", target: 3, items: [2, 3, 4, 5, 6, 8], hint: "6 ÷ 2 = 3." },
    { prompt: "Box 8 kg. Remove 3 kg. Left?", target: 5, items: [3, 4, 5, 6, 8, 11], hint: "8 - 3." },
    { prompt: "4 bottles × 750 ml. Total ml?", target: 3000, items: [2250, 2750, 3000, 3250, 3500, 4000], hint: "4 × 750." },
  ],
  "3.MD.B": [
    { prompt: "Each square = 2 pets, 5 squares. Pets?", target: 10, items: [5, 7, 10, 12, 15, 20], hint: "5 × 2 = 10." },
    { prompt: "Key: 1 pic = 5 kids. 4 pics = ? kids", target: 20, items: [9, 15, 20, 25, 30, 35], hint: "4 × 5." },
    { prompt: "Dogs:8, Cats:5. How many more dogs?", target: 3, items: [2, 3, 5, 8, 10, 13], hint: "8 - 5." },
    { prompt: "Lengths 3,4,4,5,5. Count of 4s:", target: 2, items: [1, 2, 3, 4, 5, 6], hint: "Two 4s." },
    { prompt: "Bar: 6 squares × 5 each. Total?", target: 30, items: [11, 25, 30, 35, 50, 60], hint: "6 × 5." },
  ],
  "3.MD.B.3": [
    { prompt: "Each square = 5 kids. Bar = 6 squares. Kids?", target: 30, items: [11, 25, 30, 35, 50, 60], hint: "6 × 5." },
    { prompt: "Key: 1 pic = 4 books. 3 pics = ?", target: 12, items: [7, 10, 12, 15, 16, 20], hint: "3 × 4." },
    { prompt: "Cats: 7 squares × 2 each. Total?", target: 14, items: [9, 12, 14, 16, 18, 21], hint: "7 × 2." },
    { prompt: "Dogs 20, cats 12. How many more dogs?", target: 8, items: [6, 7, 8, 10, 12, 14], hint: "20 - 12." },
    { prompt: "Birds 15, fish 9, lizards 6. Total?", target: 30, items: [24, 27, 30, 33, 36, 45], hint: "15 + 9 + 6." },
  ],
  "3.MD.B.4": [
    { prompt: "Pencils 2, 3, 3, 4 in. Count of 3s:", target: 2, items: [1, 2, 3, 4, 5, 6], hint: "Two 3s." },
    { prompt: "Values 1, 2, 2, 2, 3. Most common:", target: 2, items: [1, 2, 3, 4, 5, 6], hint: "2 appears most." },
    { prompt: "Counts: 1 in ×4, 2 in ×3. Total measured:", target: 7, items: [5, 6, 7, 8, 10, 12], hint: "4 + 3." },
    { prompt: "Sum: 1+1+2+2+2+3 = ?", target: 11, items: [9, 10, 11, 12, 13, 15], hint: "Add all." },
    { prompt: "Quarters in 2 inches?", target: 8, items: [4, 6, 8, 10, 12, 16], hint: "2 × 4." },
  ],
  "3.MD.C": [
    { prompt: "Rectangle 3 × 4 area:", target: 12, items: [7, 10, 12, 14, 16, 18], hint: "3 × 4." },
    { prompt: "Square side 5 area:", target: 25, items: [10, 20, 25, 30, 50, 55], hint: "5 × 5." },
    { prompt: "6 × 4 rectangle area:", target: 24, items: [10, 20, 24, 28, 30, 36], hint: "6 × 4." },
    { prompt: "8 × 7 rectangle area:", target: 56, items: [42, 48, 54, 56, 63, 64], hint: "8 × 7." },
    { prompt: "9 × 9 square area:", target: 81, items: [72, 79, 81, 88, 90, 99], hint: "9 × 9." },
  ],
  "3.MD.C.5": [
    { prompt: "Unit square side length:", target: 1, items: [1, 2, 3, 4, 5, 10], hint: "1 unit." },
    { prompt: "Unit squares covering 3×2 rect:", target: 6, items: [4, 5, 6, 7, 8, 10], hint: "3 × 2 = 6." },
    { prompt: "Shape covered by 9 unit squares. Area:", target: 9, items: [6, 8, 9, 10, 12, 18], hint: "9 sq units." },
    { prompt: "4×4 square area (unit sq):", target: 16, items: [8, 12, 16, 20, 24, 32], hint: "4 × 4." },
    { prompt: "12 unit squares. Area:", target: 12, items: [10, 11, 12, 13, 14, 16], hint: "12 sq units." },
  ],
  "3.MD.C.5a": [
    { prompt: "Unit square area (sq units):", target: 1, items: [1, 2, 3, 4, 6, 10], hint: "1." },
    { prompt: "Side length of unit square:", target: 1, items: [1, 2, 3, 4, 5, 6], hint: "1 unit." },
    { prompt: "Unit squares in 1 unit square:", target: 1, items: [1, 2, 3, 4, 5, 6], hint: "Itself." },
    { prompt: "Perimeter of unit square:", target: 4, items: [1, 2, 3, 4, 5, 6], hint: "4 sides × 1." },
    { prompt: "2 unit squares side by side. Area:", target: 2, items: [1, 2, 3, 4, 5, 8], hint: "2 sq units." },
  ],
  "3.MD.C.5b": [
    { prompt: "Covered by 5 unit squares. Area:", target: 5, items: [3, 4, 5, 6, 7, 10], hint: "5 sq units." },
    { prompt: "Covered by 8 unit squares. Area:", target: 8, items: [6, 7, 8, 9, 10, 12], hint: "8 sq units." },
    { prompt: "Covered by 12 unit squares:", target: 12, items: [10, 11, 12, 13, 14, 16], hint: "12 sq units." },
    { prompt: "Covered by 15 unit squares:", target: 15, items: [12, 13, 14, 15, 16, 18], hint: "15 sq units." },
    { prompt: "Covered by 20 unit squares:", target: 20, items: [15, 16, 18, 20, 22, 25], hint: "20 sq units." },
  ],
  "3.MD.C.6": [
    { prompt: "Tile a 3×4. Count tiles:", target: 12, items: [7, 10, 12, 14, 16, 18], hint: "3 × 4 = 12." },
    { prompt: "Tile 2×5:", target: 10, items: [7, 8, 10, 12, 14, 15], hint: "2 × 5." },
    { prompt: "Tile 6×3:", target: 18, items: [15, 18, 21, 24, 27, 30], hint: "6 × 3." },
    { prompt: "Tile 7×4:", target: 28, items: [24, 28, 32, 35, 36, 42], hint: "7 × 4." },
    { prompt: "Tile 8×5:", target: 40, items: [30, 35, 40, 45, 48, 50], hint: "8 × 5." },
  ],
  "3.MD.C.7": [
    { prompt: "Area 4×5 rectangle:", target: 20, items: [9, 15, 18, 20, 25, 30], hint: "4 × 5." },
    { prompt: "Area 6×4:", target: 24, items: [10, 20, 24, 28, 30, 36], hint: "6 × 4." },
    { prompt: "Area 7×6:", target: 42, items: [36, 40, 42, 48, 49, 54], hint: "7 × 6." },
    { prompt: "Area 8×9:", target: 72, items: [63, 72, 81, 88, 90, 96], hint: "8 × 9." },
    { prompt: "5×(3+4) = 5×3 + 5×4 = ?", target: 35, items: [20, 25, 30, 35, 40, 45], hint: "5 × 7." },
  ],
  "3.MD.C.7a": [
    { prompt: "Tile 2×3 rect. Area (sq units):", target: 6, items: [4, 5, 6, 7, 8, 10], hint: "2 × 3 = 6." },
    { prompt: "Tile 4×3:", target: 12, items: [7, 10, 12, 14, 16, 18], hint: "4 × 3." },
    { prompt: "Tile 5×4:", target: 20, items: [9, 15, 20, 25, 30, 40], hint: "5 × 4." },
    { prompt: "Tile 6×5:", target: 30, items: [11, 25, 30, 36, 40, 45], hint: "6 × 5." },
    { prompt: "Tile 7×8:", target: 56, items: [48, 54, 56, 63, 64, 72], hint: "7 × 8." },
  ],
  "3.MD.C.7b": [
    { prompt: "Rug 4×6 ft. Area sq ft:", target: 24, items: [10, 20, 24, 28, 30, 36], hint: "4 × 6." },
    { prompt: "Garden 5×7 ft. Area:", target: 35, items: [25, 30, 35, 40, 42, 45], hint: "5 × 7." },
    { prompt: "Room 9×8. Area:", target: 72, items: [63, 72, 81, 88, 90, 96], hint: "9 × 8." },
    { prompt: "Tile 12×5. Area:", target: 60, items: [50, 55, 60, 65, 72, 75], hint: "12 × 5." },
    { prompt: "Floor 11×6. Area:", target: 66, items: [56, 60, 66, 72, 77, 80], hint: "11 × 6." },
  ],
  "3.MD.C.7c": [
    { prompt: "4×(2+3) = 4×2 + 4×3 = ?", target: 20, items: [12, 14, 18, 20, 24, 28], hint: "8 + 12." },
    { prompt: "5×(3+4) = 15 + 20 = ?", target: 35, items: [25, 30, 35, 40, 45, 50], hint: "15 + 20." },
    { prompt: "6×(2+5) = 12 + 30 = ?", target: 42, items: [32, 36, 42, 45, 48, 54], hint: "Sum." },
    { prompt: "7×(3+4) = 21 + 28 = ?", target: 49, items: [42, 45, 49, 56, 63, 70], hint: "Sum." },
    { prompt: "8×(5+4) = 40 + 32 = ?", target: 72, items: [60, 65, 72, 80, 88, 96], hint: "Sum." },
  ],
  "3.MD.C.7d": [
    { prompt: "L-shape: 2×3 + 2×2 = ?", target: 10, items: [6, 8, 10, 12, 14, 16], hint: "6 + 4." },
    { prompt: "3×4 + 2×5 = ?", target: 22, items: [17, 20, 22, 24, 28, 30], hint: "12 + 10." },
    { prompt: "4×4 + 3×2 = ?", target: 22, items: [19, 20, 22, 24, 26, 28], hint: "16 + 6." },
    { prompt: "5×6 + 4×3 = ?", target: 42, items: [36, 40, 42, 45, 48, 50], hint: "30 + 12." },
    { prompt: "7×3 + 5×4 = ?", target: 41, items: [35, 38, 41, 44, 47, 50], hint: "21 + 20." },
  ],
  "3.MD.D": [
    { prompt: "Square side 4. Perimeter:", target: 16, items: [8, 12, 16, 20, 24, 32], hint: "4 × 4." },
    { prompt: "Rectangle 3×5. Perimeter:", target: 16, items: [8, 12, 15, 16, 20, 25], hint: "2(3+5)." },
    { prompt: "Perimeter 6×4:", target: 20, items: [10, 16, 20, 24, 28, 30], hint: "2(6+4)." },
    { prompt: "Perimeter 56, length 18. Width:", target: 10, items: [8, 10, 14, 18, 20, 28], hint: "56/2 - 18." },
    { prompt: "Triangle 5, 6, 7. Perimeter:", target: 18, items: [14, 16, 18, 20, 22, 24], hint: "Add all." },
  ],
  "3.MD.D.8": [
    { prompt: "Perimeter 3×5 rect:", target: 16, items: [8, 14, 15, 16, 20, 24], hint: "2(3)+2(5)." },
    { prompt: "Square side 7. Perimeter:", target: 28, items: [14, 21, 24, 28, 35, 49], hint: "4 × 7." },
    { prompt: "Rect 8×2 perimeter:", target: 20, items: [10, 16, 18, 20, 24, 28], hint: "2(8+2)." },
    { prompt: "Perimeter 30, length 10. Width:", target: 5, items: [3, 5, 10, 15, 20, 25], hint: "30/2 - 10." },
    { prompt: "Triangle 4, 5, 9. Perimeter:", target: 18, items: [13, 16, 18, 20, 22, 24], hint: "Add all." },
  ],
  "3.G.A": [
    { prompt: "Sides on a rhombus:", target: 4, items: [3, 4, 5, 6, 7, 8], hint: "Diamond shape." },
    { prompt: "Quadrilateral sides:", target: 4, items: [3, 4, 5, 6, 7, 8], hint: "Quad = 4." },
    { prompt: "Pentagon sides:", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "Penta = 5." },
    { prompt: "Shape in 4 equal parts. Each = 1/?", target: 4, items: [2, 3, 4, 6, 8, 12], hint: "1/4." },
    { prompt: "Shape in 6 equal parts. Each = 1/?", target: 6, items: [3, 4, 5, 6, 8, 12], hint: "1/6." },
  ],
  "3.G.A.1": [
    { prompt: "Sides on square:", target: 4, items: [3, 4, 5, 6, 7, 8], hint: "4 equal sides." },
    { prompt: "Sides on rectangle:", target: 4, items: [3, 4, 5, 6, 7, 8], hint: "4 sides." },
    { prompt: "Sides on rhombus:", target: 4, items: [3, 4, 5, 6, 7, 8], hint: "4 equal sides." },
    { prompt: "Quadrilateral sides:", target: 4, items: [3, 4, 5, 6, 7, 8], hint: "Quad = 4." },
    { prompt: "Triangle sides:", target: 3, items: [2, 3, 4, 5, 6, 8], hint: "3 sides." },
  ],
  "3.G.A.2": [
    { prompt: "Shape in 4 equal parts. Each = 1/?", target: 4, items: [2, 3, 4, 6, 8, 12], hint: "1/4." },
    { prompt: "Shape in 6 equal parts:", target: 6, items: [3, 4, 5, 6, 8, 12], hint: "1/6." },
    { prompt: "Shape in 8 equal parts:", target: 8, items: [4, 6, 7, 8, 12, 16], hint: "1/8." },
    { prompt: "Shape in 3 equal parts:", target: 3, items: [2, 3, 4, 6, 9, 12], hint: "1/3." },
    { prompt: "Shape in 10 equal parts:", target: 10, items: [5, 8, 9, 10, 15, 20], hint: "1/10." },
  ],

  // ============================================================
  // GRADE 4 — Operations, Place Value, Fractions, Measurement
  // ============================================================

  "4.OA.A": [
    { prompt: "35 is how many times as many as 7?", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "35 ÷ 7 = 5." },
    { prompt: "Tim has 3 apples; Ana has 4 times as many. Ana?", target: 12, items: [7, 10, 12, 14, 16, 18], hint: "3 × 4 = 12." },
    { prompt: "48 ÷ 6 = ?", target: 8, items: [6, 7, 8, 9, 10, 12], hint: "6 × 8 = 48." },
    { prompt: "3 packs of 8 + 2 extra = ?", target: 26, items: [22, 24, 26, 28, 30, 32], hint: "24 + 2." },
    { prompt: "50 pencils in boxes of 8. Leftover?", target: 2, items: [1, 2, 3, 4, 5, 6], hint: "6×8=48; 50-48=2." },
  ],
  "4.OA.A.1": [
    { prompt: "20 is 4 times as many as ?", target: 5, items: [3, 4, 5, 6, 8, 10], hint: "20 ÷ 4 = 5." },
    { prompt: "35 = 5 × 7. 35 is ? times 5.", target: 7, items: [3, 5, 7, 8, 9, 10], hint: "35 ÷ 5 = 7." },
    { prompt: "6 times as many as 8:", target: 48, items: [32, 40, 48, 54, 56, 64], hint: "6 × 8." },
    { prompt: "42 is 7 times as many as ?", target: 6, items: [5, 6, 7, 8, 9, 10], hint: "42 ÷ 7." },
    { prompt: "9 times as many as 7:", target: 63, items: [54, 56, 63, 64, 70, 72], hint: "9 × 7." },
  ],
  "4.OA.A.2": [
    { prompt: "Ana 4. Ben has 3 times as many. Ben:", target: 12, items: [7, 9, 12, 14, 16, 20], hint: "4 × 3." },
    { prompt: "Sam 24, Jo 6. Sam is ? times Jo.", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "24 ÷ 6." },
    { prompt: "56 ft rope is 8 times another. Other:", target: 7, items: [5, 6, 7, 8, 9, 10], hint: "56 ÷ 8." },
    { prompt: "Tim is 9. Dad is 5 times older. Dad:", target: 45, items: [36, 40, 45, 50, 54, 63], hint: "9 × 5." },
    { prompt: "72 is 8 times as many as ?", target: 9, items: [7, 8, 9, 10, 12, 14], hint: "72 ÷ 8." },
  ],
  "4.OA.A.3": [
    { prompt: "6 packs of 4 pens. Total?", target: 24, items: [18, 20, 24, 28, 30, 36], hint: "6 × 4." },
    { prompt: "$50, 3 books at $8. Left?", target: 26, items: [22, 24, 26, 30, 34, 42], hint: "50 - 24." },
    { prompt: "27 kids in 4 vans. Leftover:", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "27 ÷ 4 = 6 r 3." },
    { prompt: "4 boxes of 12 + 8 loose = ?", target: 56, items: [48, 52, 56, 60, 64, 72], hint: "48 + 8." },
    { prompt: "100 ÷ 8 whole quotient:", target: 12, items: [10, 11, 12, 13, 14, 15], hint: "8×12=96." },
  ],
  "4.OA.B": [
    { prompt: "Number of factors of 12:", target: 6, items: [2, 3, 4, 5, 6, 8], hint: "1,2,3,4,6,12." },
    { prompt: "Is 7 prime? (1=yes 0=no)", target: 1, items: [0, 1, 2, 3, 5, 7], hint: "Only 1 and 7 divide." },
    { prompt: "Multiples of 5 under 30 — count:", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "5,10,15,20,25." },
    { prompt: "Is 15 a multiple of 3? (1=yes 0=no)", target: 1, items: [0, 1, 2, 3, 5, 15], hint: "3×5=15." },
    { prompt: "Smallest prime > 10:", target: 11, items: [10, 11, 12, 13, 14, 15], hint: "11." },
  ],
  "4.OA.B.4": [
    { prompt: "Factors of 6:", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "1,2,3,6." },
    { prompt: "Is 9 prime? (1=yes 0=no)", target: 0, items: [0, 1, 2, 3, 5, 9], hint: "9 = 3×3." },
    { prompt: "Is 13 prime? (1=yes 0=no)", target: 1, items: [0, 1, 2, 3, 5, 13], hint: "Only 1,13." },
    { prompt: "Factor pairs of 24:", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "1×24, 2×12, 3×8, 4×6." },
    { prompt: "Is 30 a multiple of 6? (1=yes 0=no)", target: 1, items: [0, 1, 2, 5, 6, 30], hint: "6×5=30." },
  ],
  "4.OA.C": [
    { prompt: "Rule +5 start 2: 2,7,12,17,__", target: 22, items: [19, 20, 21, 22, 24, 27], hint: "+5." },
    { prompt: "Rule ×2 start 3: 3,6,12,24,__", target: 48, items: [30, 36, 42, 48, 50, 60], hint: "Double." },
    { prompt: "Rule +3 start 1: 1,4,7,10,__", target: 13, items: [11, 12, 13, 14, 15, 16], hint: "+3." },
    { prompt: "Start 0, +4: 5th term (0 is 1st):", target: 16, items: [12, 14, 16, 18, 20, 24], hint: "0,4,8,12,16." },
    { prompt: "Start 2, +3: 6th term:", target: 17, items: [14, 15, 17, 20, 22, 23], hint: "2,5,8,11,14,17." },
  ],
  "4.OA.C.5": [
    { prompt: "Rule +3 start 1: 1,4,7,__", target: 10, items: [8, 9, 10, 11, 12, 14], hint: "+3." },
    { prompt: "Rule +7 start 0: 0,7,14,__", target: 21, items: [18, 20, 21, 24, 28, 35], hint: "+7." },
    { prompt: "Rule ×2 start 1: 1,2,4,8,__", target: 16, items: [12, 14, 16, 18, 24, 32], hint: "Double." },
    { prompt: "Rule +6 start 2: 2,8,14,20,__", target: 26, items: [22, 24, 26, 28, 30, 32], hint: "+6." },
    { prompt: "Rule +4 start 3: 8th term:", target: 31, items: [27, 29, 31, 33, 35, 39], hint: "3,7,11,15,19,23,27,31." },
  ],
  "4.NBT.A": [
    { prompt: "The 7 in 700 is ? times the 7 in 70:", target: 10, items: [1, 7, 10, 70, 100, 700], hint: "×10." },
    { prompt: "Bigger: 3452 or 3425? (tens digit of bigger)", target: 5, items: [2, 3, 4, 5, 7, 9], hint: "3452 has 5 tens." },
    { prompt: "Round 6549 to nearest 100:", target: 6500, items: [6400, 6500, 6550, 6600, 6700, 7000], hint: "49 rounds down." },
    { prompt: "Round 2750 to nearest 1000:", target: 3000, items: [2000, 2500, 2700, 3000, 3500, 4000], hint: "750 rounds up." },
    { prompt: "Round 48,725 to nearest 10,000:", target: 50000, items: [40000, 45000, 48000, 50000, 55000, 60000], hint: "8725 rounds up." },
  ],
  "4.NBT.A.1": [
    { prompt: "The 6 in 60 is ? times the 6 in 6:", target: 10, items: [1, 6, 10, 60, 100, 600], hint: "Each place ×10." },
    { prompt: "The 4 in 400 is ? times the 4 in 40:", target: 10, items: [1, 4, 10, 40, 100, 400], hint: "×10." },
    { prompt: "700 ÷ 70 = ?", target: 10, items: [1, 7, 10, 70, 100, 700], hint: "Place shift." },
    { prompt: "8000 ÷ 800 = ?", target: 10, items: [1, 8, 10, 80, 100, 800], hint: "One place." },
    { prompt: "5000 is ? times 500:", target: 10, items: [1, 5, 10, 50, 100, 500], hint: "×10." },
  ],
  "4.NBT.A.2": [
    { prompt: "Bigger: 1234 or 1243? (ones digit of bigger)", target: 3, items: [1, 2, 3, 4, 5, 7], hint: "1243." },
    { prompt: "Bigger: 5678 or 5687? (ones of bigger)", target: 7, items: [3, 6, 7, 8, 9, 10], hint: "5687." },
    { prompt: "Value of 3 in 7352:", target: 300, items: [3, 30, 300, 3000, 30000, 73000], hint: "Hundreds place." },
    { prompt: "Bigger: 9999 or 10000? (thousands digit of bigger)", target: 0, items: [0, 1, 9, 10, 99, 100], hint: "10000 has 0 thousands (and 1 ten-thousand)." },
    { prompt: "Expanded 4000+700+20+9 = ?", target: 4729, items: [4279, 4729, 4792, 4927, 7429, 9274], hint: "4729." },
  ],
  "4.NBT.A.3": [
    { prompt: "Round 3572 to nearest 100:", target: 3600, items: [3500, 3570, 3580, 3600, 3700, 4000], hint: "72 rounds up." },
    { prompt: "Round 8234 to nearest 1000:", target: 8000, items: [7000, 8000, 8200, 8500, 9000, 10000], hint: "234 rounds down." },
    { prompt: "Round 45,678 to nearest 10,000:", target: 50000, items: [40000, 45000, 46000, 50000, 55000, 60000], hint: "5678 rounds up." },
    { prompt: "Round 2849 to nearest 10:", target: 2850, items: [2840, 2845, 2850, 2860, 2900, 3000], hint: "9 rounds up." },
    { prompt: "Round 567,890 to nearest 100,000:", target: 600000, items: [500000, 550000, 570000, 600000, 650000, 700000], hint: "67,890 rounds up." },
  ],
  "4.NBT.B": [
    { prompt: "1234 + 567 = ?", target: 1801, items: [1701, 1791, 1801, 1811, 1901, 2001], hint: "Add columns." },
    { prompt: "2345 - 678 = ?", target: 1667, items: [1567, 1667, 1677, 1767, 1867, 1967], hint: "Borrow." },
    { prompt: "23 × 15 = ?", target: 345, items: [315, 325, 335, 345, 365, 385], hint: "23×10 + 23×5." },
    { prompt: "184 ÷ 8 = ?", target: 23, items: [18, 20, 23, 25, 28, 32], hint: "8×23=184." },
    { prompt: "245 × 6 = ?", target: 1470, items: [1370, 1420, 1440, 1470, 1480, 1570], hint: "240×6 + 5×6." },
  ],
  "4.NBT.B.4": [
    { prompt: "1245 + 678 = ?", target: 1923, items: [1823, 1913, 1923, 2023, 2123, 2223], hint: "Add columns." },
    { prompt: "3456 - 1289 = ?", target: 2167, items: [2067, 2157, 2167, 2177, 2267, 2367], hint: "Borrow." },
    { prompt: "4567 + 2345 = ?", target: 6912, items: [6812, 6902, 6912, 7012, 7112, 7212], hint: "Add." },
    { prompt: "8000 - 3456 = ?", target: 4544, items: [4444, 4544, 4644, 5544, 4546, 4543], hint: "Borrow across zeros." },
    { prompt: "23456 + 17890 = ?", target: 41346, items: [40346, 41246, 41346, 41446, 42346, 43346], hint: "Sum." },
  ],
  "4.NBT.B.5": [
    { prompt: "24 × 3 = ?", target: 72, items: [62, 68, 72, 82, 92, 102], hint: "20×3 + 4×3." },
    { prompt: "12 × 14 = ?", target: 168, items: [148, 158, 168, 178, 188, 198], hint: "12×10+12×4." },
    { prompt: "145 × 6 = ?", target: 870, items: [780, 840, 860, 870, 900, 960], hint: "140×6 + 5×6." },
    { prompt: "23 × 45 = ?", target: 1035, items: [935, 1025, 1035, 1135, 1235, 1335], hint: "20×45 + 3×45." },
    { prompt: "1234 × 5 = ?", target: 6170, items: [5170, 6070, 6170, 6270, 6370, 7170], hint: "1000×5 + 234×5." },
  ],
  "4.NBT.B.6": [
    { prompt: "84 ÷ 4 = ?", target: 21, items: [18, 20, 21, 22, 24, 28], hint: "80÷4 + 4÷4." },
    { prompt: "96 ÷ 8 = ?", target: 12, items: [10, 11, 12, 13, 14, 16], hint: "8×12=96." },
    { prompt: "144 ÷ 6 = ?", target: 24, items: [20, 22, 24, 26, 28, 30], hint: "6×24=144." },
    { prompt: "365 ÷ 5 = ?", target: 73, items: [63, 72, 73, 75, 83, 93], hint: "5×73." },
    { prompt: "1000 ÷ 8 = ?", target: 125, items: [115, 120, 125, 130, 135, 150], hint: "8×125=1000." },
  ],
  "4.NF.A": [
    { prompt: "1/2 = ?/8", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "Multiply by 4/4." },
    { prompt: "2/3 = ?/12", target: 8, items: [4, 6, 8, 10, 12, 16], hint: "Multiply by 4/4." },
    { prompt: "Bigger: 3/4 or 2/3? (denom of bigger)", target: 4, items: [2, 3, 4, 6, 8, 12], hint: "9/12 vs 8/12." },
    { prompt: "3/5 = ?/10", target: 6, items: [3, 5, 6, 8, 10, 15], hint: "×2/2." },
    { prompt: "Bigger: 5/8 or 1/2? (numer of bigger)", target: 5, items: [1, 2, 4, 5, 8, 10], hint: "5/8 > 4/8." },
  ],
  "4.NF.A.1": [
    { prompt: "1/3 = ?/6", target: 2, items: [1, 2, 3, 4, 6, 9], hint: "×2/2." },
    { prompt: "2/5 = ?/10", target: 4, items: [2, 4, 5, 6, 8, 10], hint: "×2/2." },
    { prompt: "3/4 = ?/8", target: 6, items: [3, 4, 6, 7, 8, 12], hint: "×2/2." },
    { prompt: "1/2 = ?/10", target: 5, items: [2, 4, 5, 6, 8, 10], hint: "×5/5." },
    { prompt: "4/6 = ?/12", target: 8, items: [4, 6, 8, 10, 12, 16], hint: "×2/2." },
  ],
  "4.NF.A.2": [
    { prompt: "Bigger: 1/2 or 2/5? (denom of bigger)", target: 2, items: [2, 3, 4, 5, 10, 20], hint: "5/10 vs 4/10." },
    { prompt: "Bigger: 3/4 or 5/8? (numer of bigger)", target: 3, items: [2, 3, 4, 5, 6, 8], hint: "6/8 vs 5/8." },
    { prompt: "Bigger: 2/3 or 3/5? (numer of bigger)", target: 2, items: [2, 3, 5, 10, 15, 20], hint: "10/15 vs 9/15." },
    { prompt: "Bigger: 5/6 or 7/12? (denom of bigger)", target: 6, items: [5, 6, 7, 10, 12, 18], hint: "10/12 vs 7/12." },
    { prompt: "Bigger: 3/8 or 1/2? (denom of bigger)", target: 2, items: [2, 3, 4, 8, 12, 16], hint: "4/8 > 3/8." },
  ],
  "4.NF.B": [
    { prompt: "1/4 + 2/4 = ?/4", target: 3, items: [1, 2, 3, 4, 6, 8], hint: "Add tops." },
    { prompt: "5/8 - 2/8 = ?/8", target: 3, items: [1, 2, 3, 4, 7, 10], hint: "Subtract tops." },
    { prompt: "3 × (2/5) = ?/5", target: 6, items: [3, 5, 6, 8, 10, 15], hint: "3×2." },
    { prompt: "5/4 + 2/4 = ?/4", target: 7, items: [5, 6, 7, 8, 9, 10], hint: "5+2." },
    { prompt: "4 × (3/10) = ?/10", target: 12, items: [7, 10, 12, 14, 30, 40], hint: "4×3." },
  ],
  "4.NF.B.3": [
    { prompt: "3/5 = 1/5 + 1/5 + ?/5", target: 1, items: [1, 2, 3, 4, 5, 6], hint: "Three 1/5s." },
    { prompt: "4/6 = 1/6 + 1/6 + 1/6 + ?/6", target: 1, items: [1, 2, 3, 4, 5, 6], hint: "Four 1/6s." },
    { prompt: "5/8: how many 1/8s?", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "5." },
    { prompt: "7/10: how many 1/10s?", target: 7, items: [5, 6, 7, 8, 9, 10], hint: "7." },
    { prompt: "9/12: how many 1/12s?", target: 9, items: [6, 8, 9, 10, 11, 12], hint: "9." },
  ],
  "4.NF.B.3a": [
    { prompt: "1/5 + 2/5 = ?/5", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "Add tops." },
    { prompt: "4/7 - 2/7 = ?/7", target: 2, items: [1, 2, 3, 4, 5, 6], hint: "Subtract tops." },
    { prompt: "3/8 + 4/8 = ?/8", target: 7, items: [5, 6, 7, 8, 9, 12], hint: "3+4." },
    { prompt: "7/10 - 3/10 = ?/10", target: 4, items: [2, 3, 4, 5, 7, 10], hint: "7-3." },
    { prompt: "5/12 + 6/12 = ?/12", target: 11, items: [9, 10, 11, 12, 13, 17], hint: "5+6." },
  ],
  "4.NF.B.3b": [
    { prompt: "3/8 = 1/8 + ?/8", target: 2, items: [1, 2, 3, 4, 5, 8], hint: "3 - 1." },
    { prompt: "5/6 = 2/6 + ?/6", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "5 - 2." },
    { prompt: "7/10 = 3/10 + ?/10", target: 4, items: [2, 3, 4, 5, 7, 10], hint: "7 - 3." },
    { prompt: "4/5 = 1/5 + 1/5 + ?/5", target: 2, items: [1, 2, 3, 4, 5, 6], hint: "4 - 2." },
    { prompt: "9/12 = 5/12 + ?/12", target: 4, items: [2, 3, 4, 5, 6, 7], hint: "9 - 5." },
  ],
  "4.NF.B.3c": [
    { prompt: "1 1/4 + 1/4 = ?/4 (total fourths)", target: 6, items: [4, 5, 6, 7, 8, 10], hint: "5/4 + 1/4." },
    { prompt: "2 3/5 - 1 1/5 = 1 ?/5", target: 2, items: [1, 2, 3, 4, 5, 6], hint: "1 2/5." },
    { prompt: "3 2/6 + 1 3/6 = 4 ?/6", target: 5, items: [2, 3, 4, 5, 6, 10], hint: "2+3." },
    { prompt: "5 - 2 1/4 = 2 ?/4", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "2 3/4." },
    { prompt: "4 5/8 - 1 3/8 = 3 ?/8", target: 2, items: [1, 2, 3, 5, 6, 8], hint: "5-3." },
  ],
  "4.NF.B.3d": [
    { prompt: "Eat 1/4 then 2/4 of pie. Total /4:", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "1+2." },
    { prompt: "3/8 mi then 2/8 mi. Total /8:", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "3+2." },
    { prompt: "Had 7/10, used 4/10. Left /10:", target: 3, items: [2, 3, 4, 5, 7, 10], hint: "7-4." },
    { prompt: "Run 2/5 then 2/5. Total /5:", target: 4, items: [2, 3, 4, 5, 6, 10], hint: "4/5." },
    { prompt: "5/6 yd cut 2/6. Left /6:", target: 3, items: [1, 2, 3, 4, 5, 7], hint: "5-2." },
  ],
  "4.NF.B.4": [
    { prompt: "3 × (1/5) = ?/5", target: 3, items: [1, 2, 3, 4, 5, 15], hint: "3/5." },
    { prompt: "4 × (2/6) = ?/6", target: 8, items: [4, 6, 8, 10, 12, 24], hint: "4×2." },
    { prompt: "5 × (3/8) = ?/8", target: 15, items: [8, 10, 12, 15, 20, 40], hint: "5×3." },
    { prompt: "6 × (1/4) = ?/4", target: 6, items: [3, 4, 5, 6, 10, 24], hint: "6/4." },
    { prompt: "7 × (2/3) = ?/3", target: 14, items: [9, 12, 14, 15, 21, 42], hint: "7×2." },
  ],
  "4.NF.B.4a": [
    { prompt: "5/4 = 5 × (1/?)", target: 4, items: [2, 3, 4, 5, 10, 20], hint: "1/4." },
    { prompt: "7/8 = 7 × (1/?)", target: 8, items: [4, 6, 7, 8, 14, 56], hint: "1/8." },
    { prompt: "3/10 = 3 × (1/?)", target: 10, items: [3, 5, 10, 30, 100, 300], hint: "1/10." },
    { prompt: "6/5 = n × (1/5). n = ?", target: 6, items: [1, 5, 6, 10, 15, 30], hint: "6." },
    { prompt: "9/12 = 9 × (1/?)", target: 12, items: [3, 4, 6, 9, 12, 108], hint: "12." },
  ],
  "4.NF.B.4b": [
    { prompt: "3 × (2/5) = ?/5", target: 6, items: [3, 5, 6, 8, 10, 15], hint: "6/5." },
    { prompt: "4 × (3/8) = ?/8", target: 12, items: [7, 10, 12, 15, 20, 32], hint: "12/8." },
    { prompt: "5 × (2/3) = ?/3", target: 10, items: [7, 8, 10, 12, 15, 20], hint: "10/3." },
    { prompt: "6 × (3/4) = ?/4", target: 18, items: [12, 15, 18, 20, 24, 30], hint: "18/4." },
    { prompt: "7 × (4/9) = ?/9", target: 28, items: [20, 25, 28, 32, 45, 63], hint: "28/9." },
  ],
  "4.NF.B.4c": [
    { prompt: "5 people eat 1/4 lb each. Total /4:", target: 5, items: [3, 4, 5, 6, 10, 20], hint: "5/4." },
    { prompt: "4 cups of 3/8. Total /8:", target: 12, items: [8, 10, 12, 14, 20, 32], hint: "12/8." },
    { prompt: "3 laps of 2/5 mi. Total /5:", target: 6, items: [3, 5, 6, 8, 10, 15], hint: "6/5." },
    { prompt: "6 jars of 1/3 L. Total /3:", target: 6, items: [2, 3, 6, 9, 12, 18], hint: "6/3." },
    { prompt: "8 servings of 3/4 cup. Total /4:", target: 24, items: [18, 20, 24, 28, 32, 48], hint: "24/4." },
  ],
  "4.NF.C": [
    { prompt: "3/10 = ?/100", target: 30, items: [3, 10, 30, 100, 300, 1000], hint: "×10/10." },
    { prompt: "0.5 = 5/?", target: 10, items: [1, 5, 10, 50, 100, 500], hint: "5 tenths." },
    { prompt: "0.25 = 25/?", target: 100, items: [1, 10, 25, 100, 250, 1000], hint: "Hundredths." },
    { prompt: "Bigger: 0.6 or 0.58? (first decimal digit of bigger)", target: 6, items: [5, 6, 7, 8, 9, 58], hint: "0.60." },
    { prompt: "3/10 + 4/100 = ?/100", target: 34, items: [7, 30, 34, 40, 70, 304], hint: "30+4." },
  ],
  "4.NF.C.5": [
    { prompt: "3/10 = ?/100", target: 30, items: [3, 10, 30, 100, 300, 310], hint: "×10." },
    { prompt: "7/10 = ?/100", target: 70, items: [7, 17, 70, 100, 170, 700], hint: "×10." },
    { prompt: "2/10 + 5/100 = ?/100", target: 25, items: [7, 20, 25, 50, 70, 205], hint: "20+5." },
    { prompt: "4/10 + 23/100 = ?/100", target: 63, items: [27, 43, 63, 73, 234, 423], hint: "40+23." },
    { prompt: "6/10 + 9/100 = ?/100", target: 69, items: [15, 60, 69, 90, 96, 609], hint: "60+9." },
  ],
  "4.NF.C.6": [
    { prompt: "0.5 = 5/?", target: 10, items: [1, 5, 10, 50, 100, 500], hint: "10." },
    { prompt: "0.25 = n/100. n = ?", target: 25, items: [2, 5, 25, 50, 100, 250], hint: "25." },
    { prompt: "0.7 = ?/10", target: 7, items: [1, 7, 10, 70, 100, 700], hint: "7." },
    { prompt: "62/100 written as 0.XX. XX =", target: 62, items: [6, 26, 62, 100, 620, 6200], hint: "0.62." },
    { prompt: "0.4 = ?/10", target: 4, items: [1, 2, 4, 10, 40, 100], hint: "4." },
  ],
  "4.NF.C.7": [
    { prompt: "Bigger: 0.6 or 0.56? (tenths of bigger)", target: 6, items: [0, 5, 6, 7, 56, 60], hint: "0.60." },
    { prompt: "Bigger: 0.3 or 0.03? (tenths of bigger)", target: 3, items: [0, 3, 30, 33, 100, 300], hint: "0.30 > 0.03." },
    { prompt: "Bigger: 0.75 or 0.8? (tenths of bigger)", target: 8, items: [5, 7, 8, 75, 80, 100], hint: "0.80." },
    { prompt: "Bigger: 0.45 or 0.5? (hundredths of bigger)", target: 0, items: [0, 4, 5, 45, 50, 100], hint: "0.50." },
    { prompt: "Bigger: 0.09 or 0.9? (tenths of bigger)", target: 9, items: [0, 1, 9, 90, 99, 900], hint: "0.90." },
  ],
  "4.MD.A": [
    { prompt: "1 ft = ? in", target: 12, items: [10, 12, 16, 24, 36, 48], hint: "12." },
    { prompt: "3 ft = ? in", target: 36, items: [24, 30, 36, 48, 60, 72], hint: "3×12." },
    { prompt: "2 kg = ? g", target: 2000, items: [200, 1000, 2000, 20000, 200000, 2000000], hint: "×1000." },
    { prompt: "5 L = ? ml", target: 5000, items: [500, 1000, 5000, 50000, 500000, 5000000], hint: "×1000." },
    { prompt: "Area 24 sq ft, length 6. Width:", target: 4, items: [3, 4, 5, 6, 8, 12], hint: "24/6." },
  ],
  "4.MD.A.1": [
    { prompt: "1 ft = ? in", target: 12, items: [10, 12, 16, 24, 36, 60], hint: "12." },
    { prompt: "1 kg = ? g", target: 1000, items: [10, 100, 1000, 10000, 100000, 1000000], hint: "1000." },
    { prompt: "4 ft = ? in", target: 48, items: [36, 42, 48, 52, 60, 72], hint: "4×12." },
    { prompt: "1 hr = ? min", target: 60, items: [30, 60, 90, 100, 120, 180], hint: "60." },
    { prompt: "3 m = ? cm", target: 300, items: [30, 100, 300, 3000, 30000, 3000000], hint: "×100." },
  ],
  "4.MD.A.2": [
    { prompt: "1.5 L in ml:", target: 1500, items: [150, 1050, 1500, 1550, 15000, 150000], hint: "1500." },
    { prompt: "2 km 500 m in m:", target: 2500, items: [250, 2050, 2500, 2550, 25000, 250000], hint: "2000+500." },
    { prompt: "$5 - $1.25 in cents:", target: 375, items: [275, 325, 375, 475, 500, 625], hint: "500-125." },
    { prompt: "3 hr 30 min in min:", target: 210, items: [180, 200, 210, 230, 330, 360], hint: "180+30." },
    { prompt: "6 lb 8 oz in oz (1 lb=16 oz):", target: 104, items: [80, 96, 104, 110, 120, 140], hint: "96+8." },
  ],
  "4.MD.A.3": [
    { prompt: "Area 24, length 6. Width:", target: 4, items: [3, 4, 5, 6, 8, 12], hint: "24/6." },
    { prompt: "Perimeter 20, length 6. Width:", target: 4, items: [3, 4, 5, 7, 10, 14], hint: "10-6." },
    { prompt: "Area 35 sq ft, width 5. Length:", target: 7, items: [5, 6, 7, 8, 10, 12], hint: "35/5." },
    { prompt: "Room 12×8 area:", target: 96, items: [80, 88, 96, 100, 108, 120], hint: "12×8." },
    { prompt: "Area 72, length 9. Width:", target: 8, items: [6, 7, 8, 9, 10, 12], hint: "72/9." },
  ],
  "4.MD.B": [
    { prompt: "Values 1/2, 1/2, 1. Sum:", target: 2, items: [1, 2, 3, 4, 5, 6], hint: "2." },
    { prompt: "Longest 3/4, shortest 1/4. Diff /4:", target: 2, items: [1, 2, 3, 4, 5, 6], hint: "3-1." },
    { prompt: "Counts 1/8×3 + 2/8×2 in /8:", target: 7, items: [5, 6, 7, 8, 10, 12], hint: "3+4." },
    { prompt: "At 1/2: 4 entries. At 1: 2 entries. Total entries:", target: 6, items: [3, 5, 6, 7, 8, 10], hint: "4+2." },
    { prompt: "Sum 1/4, 1/4, 1/2 in quarters:", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "1+1+2." },
  ],
  "4.MD.B.4": [
    { prompt: "At 1/4: 2, at 1/2: 3. Total counts:", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "2+3." },
    { prompt: "Longest 7/8, shortest 1/8. Diff /8:", target: 6, items: [4, 5, 6, 7, 8, 10], hint: "7-1." },
    { prompt: "1/2, 1/2, 3/4 sum /4:", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "2+2+3 quarters." },
    { prompt: "3 at 1/4 + 1 at 1/2 sum /4:", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "3+2." },
    { prompt: "5/8 - 2/8 in /8:", target: 3, items: [1, 2, 3, 4, 5, 7], hint: "5-2." },
  ],
  "4.MD.C": [
    { prompt: "Full circle = ? degrees", target: 360, items: [90, 180, 270, 360, 540, 720], hint: "360." },
    { prompt: "Right angle degrees:", target: 90, items: [45, 60, 90, 120, 180, 270], hint: "90." },
    { prompt: "60° + 30° = ?", target: 90, items: [60, 75, 90, 100, 120, 180], hint: "Sum." },
    { prompt: "Straight angle:", target: 180, items: [90, 120, 180, 270, 360, 540], hint: "180." },
    { prompt: "x + 45 = 120. x = ?", target: 75, items: [65, 70, 75, 80, 85, 90], hint: "120-45." },
  ],
  "4.MD.C.5": [
    { prompt: "Full circle:", target: 360, items: [90, 180, 270, 360, 540, 720], hint: "360." },
    { prompt: "Half circle:", target: 180, items: [90, 120, 180, 270, 360, 540], hint: "Half of 360." },
    { prompt: "Quarter circle:", target: 90, items: [45, 60, 90, 120, 180, 270], hint: "Right angle." },
    { prompt: "1/6 of circle:", target: 60, items: [30, 45, 60, 90, 120, 180], hint: "360/6." },
    { prompt: "1/3 of circle:", target: 120, items: [60, 90, 120, 180, 240, 360], hint: "360/3." },
  ],
  "4.MD.C.5a": [
    { prompt: "1-degree = 1/? of circle", target: 360, items: [90, 180, 270, 360, 540, 720], hint: "360." },
    { prompt: "Full rotation degrees:", target: 360, items: [180, 270, 300, 360, 540, 720], hint: "360." },
    { prompt: "Half rotation:", target: 180, items: [90, 120, 180, 270, 360, 540], hint: "180." },
    { prompt: "1/4 turn degrees:", target: 90, items: [45, 60, 90, 120, 180, 270], hint: "90." },
    { prompt: "1/12 turn degrees:", target: 30, items: [15, 30, 45, 60, 90, 120], hint: "360/12." },
  ],
  "4.MD.C.5b": [
    { prompt: "Angle of 45 one-degrees:", target: 45, items: [30, 40, 45, 50, 60, 90], hint: "45°." },
    { prompt: "Angle of 90 one-degrees:", target: 90, items: [60, 75, 90, 120, 180, 270], hint: "Right angle." },
    { prompt: "Angle of 120 one-degrees:", target: 120, items: [90, 100, 120, 150, 180, 270], hint: "120°." },
    { prompt: "Angle of 150 one-degrees:", target: 150, items: [120, 135, 150, 165, 180, 210], hint: "150°." },
    { prompt: "Angle of 60 one-degrees:", target: 60, items: [30, 45, 60, 75, 90, 120], hint: "60°." },
  ],
  "4.MD.C.6": [
    { prompt: "Right angle measure:", target: 90, items: [45, 60, 90, 120, 180, 270], hint: "90°." },
    { prompt: "Acute angle example (<90):", target: 45, items: [45, 90, 120, 180, 270, 360], hint: "<90." },
    { prompt: "Obtuse example (>90 <180):", target: 120, items: [45, 90, 120, 180, 270, 360], hint: "Between 90 and 180." },
    { prompt: "Straight line angle:", target: 180, items: [90, 120, 180, 270, 360, 540], hint: "180." },
    { prompt: "Half of 120°:", target: 60, items: [30, 45, 60, 90, 120, 180], hint: "60." },
  ],
  "4.MD.C.7": [
    { prompt: "40° + 30° = ?", target: 70, items: [60, 65, 70, 75, 80, 90], hint: "Sum." },
    { prompt: "180 - 45 = ?", target: 135, items: [125, 130, 135, 140, 145, 150], hint: "135." },
    { prompt: "90 = 30 + ?", target: 60, items: [45, 50, 60, 70, 80, 90], hint: "60." },
    { prompt: "x + 50 = 180. x = ?", target: 130, items: [120, 125, 130, 140, 150, 160], hint: "180-50." },
    { prompt: "90 - 25 = ?", target: 65, items: [55, 60, 65, 70, 75, 80], hint: "65." },
  ],
  "4.G.A": [
    { prompt: "Right angle degrees:", target: 90, items: [45, 60, 90, 120, 180, 270], hint: "90." },
    { prompt: "Sides on square:", target: 4, items: [3, 4, 5, 6, 7, 8], hint: "4." },
    { prompt: "Lines of symmetry in square:", target: 4, items: [1, 2, 3, 4, 6, 8], hint: "4." },
    { prompt: "Right angles in right triangle:", target: 1, items: [0, 1, 2, 3, 4, 6], hint: "1." },
    { prompt: "Lines of symmetry in non-square rectangle:", target: 2, items: [0, 1, 2, 4, 6, 8], hint: "2." },
  ],
  "4.G.A.1": [
    { prompt: "Right angle degrees:", target: 90, items: [45, 60, 90, 120, 180, 270], hint: "90°." },
    { prompt: "Acute angle is less than ?°", target: 90, items: [45, 60, 90, 120, 180, 360], hint: "<90." },
    { prompt: "Obtuse is between 90 and ?:", target: 180, items: [90, 120, 150, 180, 270, 360], hint: "180." },
    { prompt: "Parallel lines meeting points:", target: 0, items: [0, 1, 2, 4, 10, 100], hint: "0." },
    { prompt: "Perpendicular angle measure:", target: 90, items: [45, 60, 90, 120, 180, 270], hint: "90." },
  ],
  "4.G.A.2": [
    { prompt: "Right angles in rectangle:", target: 4, items: [1, 2, 3, 4, 6, 8], hint: "4." },
    { prompt: "Right angles in right triangle:", target: 1, items: [0, 1, 2, 3, 4, 5], hint: "1." },
    { prompt: "Parallel pairs in parallelogram:", target: 2, items: [0, 1, 2, 3, 4, 6], hint: "2." },
    { prompt: "Right angles in acute triangle:", target: 0, items: [0, 1, 2, 3, 4, 5], hint: "0." },
    { prompt: "Parallel sides in trapezoid:", target: 1, items: [0, 1, 2, 3, 4, 5], hint: "1." },
  ],
  "4.G.A.3": [
    { prompt: "Symmetry lines in square:", target: 4, items: [1, 2, 3, 4, 6, 8], hint: "4." },
    { prompt: "Symmetry lines in equilateral triangle:", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "3." },
    { prompt: "Symmetry lines in regular hexagon:", target: 6, items: [3, 4, 5, 6, 8, 12], hint: "6." },
    { prompt: "Symmetry lines in non-square rectangle:", target: 2, items: [0, 1, 2, 4, 6, 8], hint: "2." },
    { prompt: "Symmetry lines in non-square rhombus:", target: 2, items: [0, 1, 2, 4, 6, 8], hint: "2 (diagonals)." },
  ],

  // ============================================================
  // GRADE 5 — Expressions, Place Value, Fractions, Volume
  // ============================================================

  "5.OA.A": [
    { prompt: "(3+4) × 2 = ?", target: 14, items: [10, 12, 14, 16, 18, 20], hint: "7×2." },
    { prompt: "2 × (5+3) = ?", target: 16, items: [11, 13, 16, 18, 20, 25], hint: "2×8." },
    { prompt: "(10-4) × 5 = ?", target: 30, items: [20, 25, 30, 35, 40, 50], hint: "6×5." },
    { prompt: "3 × (4+6) - 5 = ?", target: 25, items: [20, 23, 25, 28, 30, 35], hint: "30-5." },
    { prompt: "[(2+3)×4] - 8 = ?", target: 12, items: [8, 10, 12, 14, 16, 20], hint: "20-8." },
  ],
  "5.OA.A.1": [
    { prompt: "(2+3) × 4 = ?", target: 20, items: [14, 17, 20, 24, 25, 30], hint: "5×4." },
    { prompt: "3 × (7-2) = ?", target: 15, items: [12, 14, 15, 18, 21, 24], hint: "3×5." },
    { prompt: "(8+2) ÷ 5 = ?", target: 2, items: [1, 2, 3, 4, 5, 10], hint: "10/5." },
    { prompt: "[(6+4)×2] - 5 = ?", target: 15, items: [10, 12, 15, 18, 20, 25], hint: "20-5." },
    { prompt: "{[3+2]×4} + 5 = ?", target: 25, items: [15, 20, 25, 30, 35, 40], hint: "20+5." },
  ],
  "5.OA.A.2": [
    { prompt: "'Add 5 and 3, then times 2' equals:", target: 16, items: [10, 13, 16, 18, 20, 26], hint: "(5+3)×2." },
    { prompt: "3 × (12+7) is ? times (12+7):", target: 3, items: [1, 2, 3, 6, 9, 12], hint: "3 times." },
    { prompt: "'Subtract 4 from 10, times 3' equals:", target: 18, items: [14, 16, 18, 20, 22, 24], hint: "(10-4)×3." },
    { prompt: "2 × (100+50) compared to (100+50): factor:", target: 2, items: [1, 2, 3, 4, 5, 10], hint: "2x." },
    { prompt: "(8+2) × 5 = ?", target: 50, items: [30, 40, 50, 60, 80, 100], hint: "10×5." },
  ],
  "5.OA.B": [
    { prompt: "Rule +3 start 0. 4th term (0 is 1st):", target: 9, items: [6, 7, 9, 12, 15, 18], hint: "0,3,6,9." },
    { prompt: "+6 terms vs +3 terms: ratio:", target: 2, items: [1, 2, 3, 4, 6, 9], hint: "6/3=2." },
    { prompt: "A: 2,4,6. B: 4,8,12. B = ? × A:", target: 2, items: [1, 2, 3, 4, 6, 8], hint: "2x." },
    { prompt: "Rule +5 start 0, term 5:", target: 20, items: [15, 20, 25, 30, 35, 40], hint: "0,5,10,15,20." },
    { prompt: "+2 vs +4 rules: 4th term ratio (B/A):", target: 2, items: [1, 2, 3, 4, 6, 8], hint: "8/4=2." },
  ],
  "5.OA.B.3": [
    { prompt: "A: 0,3,6,9. B: 0,6,12,18. B is ? × A:", target: 2, items: [1, 2, 3, 4, 6, 9], hint: "2x." },
    { prompt: "Rule +4 start 0, 5th term:", target: 16, items: [12, 14, 16, 18, 20, 24], hint: "0,4,8,12,16." },
    { prompt: "A +1, B +3. B:A ratio:", target: 3, items: [1, 2, 3, 4, 6, 9], hint: "3x." },
    { prompt: "Rule +5 start 0, 7th term:", target: 30, items: [25, 28, 30, 32, 35, 40], hint: "0,5,10,15,20,25,30." },
    { prompt: "A +2, B +8. B is ? × A:", target: 4, items: [2, 3, 4, 6, 8, 16], hint: "4x." },
  ],
  "5.NBT.A": [
    { prompt: "In 333, leftmost 3 is ? times middle 3:", target: 10, items: [1, 3, 10, 30, 100, 1000], hint: "×10." },
    { prompt: "10^3 = ?", target: 1000, items: [10, 100, 1000, 10000, 100000, 1000000], hint: "10×10×10." },
    { prompt: "3.45 × 10 (answer in tenths):", target: 345, items: [34, 345, 3450, 34500, 345000, 0], hint: "Shift decimal right." },
    { prompt: "Compare 0.456 vs 0.465 (hundredths of bigger):", target: 6, items: [4, 5, 6, 7, 46, 65], hint: "0.465." },
    { prompt: "0.04 × 1000 = ?", target: 40, items: [4, 40, 400, 4000, 40000, 400000], hint: "Shift right 3." },
  ],
  "5.NBT.A.1": [
    { prompt: "The 5 in 500 is ? times the 5 in 50:", target: 10, items: [1, 5, 10, 50, 100, 500], hint: "×10." },
    { prompt: "The 7 in 700 is ? times the 7 in 7:", target: 100, items: [1, 10, 70, 100, 700, 7000], hint: "Two places." },
    { prompt: "8000 ÷ 800 = ?", target: 10, items: [1, 8, 10, 80, 100, 800], hint: "×10 relation." },
    { prompt: "The 3 in 3000 is ? times the 3 in 30:", target: 100, items: [10, 30, 100, 300, 1000, 3000], hint: "Two places." },
    { prompt: "In 7777, leftmost 7 is ? times rightmost 7:", target: 1000, items: [10, 100, 1000, 7000, 10000, 70000], hint: "3 places left." },
  ],
  "5.NBT.A.2": [
    { prompt: "10^2 = ?", target: 100, items: [10, 100, 1000, 20, 200, 2000], hint: "10×10." },
    { prompt: "10^4 = ?", target: 10000, items: [100, 1000, 10000, 100000, 40, 4000], hint: "Four zeros." },
    { prompt: "3.5 × 100 = ?", target: 350, items: [35, 350, 3500, 305, 3050, 35000], hint: "Shift decimal right 2." },
    { prompt: "6.7 × 10 = ?", target: 67, items: [6, 7, 67, 670, 6700, 70], hint: "Shift 1 place right." },
    { prompt: "0.04 × 1000 = ?", target: 40, items: [4, 40, 400, 4000, 40000, 400000], hint: "Shift 3 places right." },
  ],
  "5.NBT.A.3": [
    { prompt: "0.5 = ?/10", target: 5, items: [1, 5, 10, 50, 100, 500], hint: "5/10." },
    { prompt: "0.25 = ?/100", target: 25, items: [2, 5, 25, 50, 100, 250], hint: "25/100." },
    { prompt: "0.125 = ?/1000", target: 125, items: [12, 25, 125, 250, 1000, 1250], hint: "125/1000." },
    { prompt: "Bigger: 0.345 or 0.354? (hundredths of bigger)", target: 5, items: [3, 4, 5, 45, 54, 345], hint: "0.354." },
    { prompt: "0.5 and 0.50 equal? (1=yes 0=no)", target: 1, items: [0, 1, 2, 5, 50, 500], hint: "Equal." },
  ],
  "5.NBT.A.3a": [
    { prompt: "3×100 + 4×10 + 5 = ?", target: 345, items: [300, 340, 345, 354, 435, 543], hint: "345." },
    { prompt: "0.6 = ?/10", target: 6, items: [1, 6, 10, 60, 100, 600], hint: "6/10." },
    { prompt: "347.392: tenths digit:", target: 3, items: [2, 3, 4, 7, 9, 39], hint: "First after dot." },
    { prompt: "5 + 3/10 + 2/100 = 5.??. ?? =", target: 32, items: [23, 32, 302, 320, 523, 532], hint: "5.32." },
    { prompt: "0.007 = ?/1000", target: 7, items: [1, 7, 10, 70, 100, 700], hint: "7/1000." },
  ],
  "5.NBT.A.3b": [
    { prompt: "Bigger: 0.456 or 0.465? (hundredths of bigger)", target: 6, items: [4, 5, 6, 7, 46, 65], hint: "0.465." },
    { prompt: "Bigger: 0.8 or 0.78? (tenths of bigger)", target: 8, items: [7, 8, 78, 80, 87, 100], hint: "0.8." },
    { prompt: "Bigger: 0.234 or 0.243? (hundredths of bigger)", target: 4, items: [2, 3, 4, 23, 24, 34], hint: "0.243." },
    { prompt: "Bigger: 1.05 or 1.5? (tenths of bigger)", target: 5, items: [0, 1, 5, 15, 50, 150], hint: "1.5." },
    { prompt: "Bigger: 0.999 or 1.0? (ones of bigger)", target: 1, items: [0, 1, 9, 10, 99, 100], hint: "1.0." },
  ],
  "5.NBT.A.4": [
    { prompt: "Round 3.47 to tenths (tenths digit):", target: 5, items: [3, 4, 5, 7, 47, 57], hint: "3.5." },
    { prompt: "Round 2.349 to hundredths (hundredths digit):", target: 5, items: [2, 3, 4, 5, 9, 35], hint: "2.35." },
    { prompt: "Round 7.86 to nearest whole:", target: 8, items: [6, 7, 8, 9, 10, 12], hint: "0.86 rounds up." },
    { prompt: "Round 5.55 to tenths (tenths digit):", target: 6, items: [4, 5, 6, 55, 56, 100], hint: "5.6." },
    { prompt: "Round 12.345 to hundredths (hundredths digit):", target: 5, items: [3, 4, 5, 34, 35, 45], hint: "12.35." },
  ],
  "5.NBT.B": [
    { prompt: "234 × 12 = ?", target: 2808, items: [2608, 2708, 2808, 2908, 3008, 3108], hint: "234×10 + 234×2." },
    { prompt: "1456 ÷ 8 = ?", target: 182, items: [172, 180, 182, 192, 200, 210], hint: "8×182." },
    { prompt: "3.5 + 2.75 (in hundredths):", target: 625, items: [525, 600, 625, 650, 700, 725], hint: "6.25." },
    { prompt: "4.2 × 3 (in tenths):", target: 126, items: [120, 125, 126, 136, 142, 148], hint: "12.6." },
    { prompt: "9.6 ÷ 4 (in tenths):", target: 24, items: [20, 22, 24, 26, 30, 48], hint: "2.4." },
  ],
  "5.NBT.B.5": [
    { prompt: "23 × 12 = ?", target: 276, items: [256, 266, 276, 286, 296, 306], hint: "23×10 + 23×2." },
    { prompt: "145 × 8 = ?", target: 1160, items: [1060, 1120, 1160, 1260, 1360, 1450], hint: "140×8 + 5×8." },
    { prompt: "34 × 25 = ?", target: 850, items: [750, 800, 850, 900, 950, 1000], hint: "34×25." },
    { prompt: "123 × 45 = ?", target: 5535, items: [5335, 5435, 5535, 5635, 5735, 5835], hint: "123×40 + 123×5." },
    { prompt: "234 × 56 = ?", target: 13104, items: [12104, 13004, 13104, 13204, 13304, 14104], hint: "234×50 + 234×6." },
  ],
  "5.NBT.B.6": [
    { prompt: "144 ÷ 12 = ?", target: 12, items: [10, 11, 12, 13, 14, 16], hint: "12×12." },
    { prompt: "288 ÷ 12 = ?", target: 24, items: [20, 22, 24, 26, 28, 32], hint: "12×24." },
    { prompt: "456 ÷ 8 = ?", target: 57, items: [47, 52, 57, 62, 67, 72], hint: "8×57." },
    { prompt: "1800 ÷ 15 = ?", target: 120, items: [100, 110, 120, 130, 150, 180], hint: "15×120." },
    { prompt: "3456 ÷ 12 = ?", target: 288, items: [268, 278, 288, 298, 308, 318], hint: "12×288." },
  ],
  "5.NBT.B.7": [
    { prompt: "2.5 + 1.75 (in hundredths):", target: 425, items: [325, 400, 425, 450, 500, 525], hint: "4.25." },
    { prompt: "5.6 - 2.3 (in tenths):", target: 33, items: [23, 30, 33, 35, 43, 56], hint: "3.3." },
    { prompt: "0.5 × 0.4 (in hundredths):", target: 20, items: [2, 9, 20, 90, 200, 2000], hint: "0.20." },
    { prompt: "3.6 ÷ 3 (in tenths):", target: 12, items: [10, 12, 13, 15, 20, 36], hint: "1.2." },
    { prompt: "4.5 × 2 (in tenths):", target: 90, items: [80, 85, 90, 95, 100, 110], hint: "9.0." },
  ],
  "5.NF.A": [
    { prompt: "1/2 + 1/3 (in 6ths):", target: 5, items: [2, 3, 4, 5, 6, 7], hint: "3/6 + 2/6." },
    { prompt: "3/4 - 1/2 (in 4ths):", target: 1, items: [1, 2, 3, 4, 5, 6], hint: "3/4 - 2/4." },
    { prompt: "2/3 + 1/4 (in 12ths):", target: 11, items: [7, 8, 9, 11, 12, 14], hint: "8+3." },
    { prompt: "5/6 - 1/3 (in 6ths):", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "5-2." },
    { prompt: "1 1/2 + 2/3 (in 6ths):", target: 13, items: [10, 11, 12, 13, 14, 15], hint: "9+4." },
  ],
  "5.NF.A.1": [
    { prompt: "1/2 + 1/4 (in 4ths):", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "2/4 + 1/4." },
    { prompt: "2/3 + 1/6 (in 6ths):", target: 5, items: [2, 3, 4, 5, 6, 8], hint: "4+1." },
    { prompt: "3/4 - 1/3 (in 12ths):", target: 5, items: [2, 3, 4, 5, 6, 7], hint: "9-4." },
    { prompt: "5/8 - 1/4 (in 8ths):", target: 3, items: [1, 2, 3, 4, 5, 7], hint: "5-2." },
    { prompt: "2/3 + 3/5 (in 15ths):", target: 19, items: [15, 17, 19, 21, 23, 25], hint: "10+9." },
  ],
  "5.NF.A.2": [
    { prompt: "Ate 1/2 then 1/4 of pizza. Total /4:", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "2/4 + 1/4." },
    { prompt: "Walk 3/4 mi, run 1/2 mi. Total /4:", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "3/4 + 2/4." },
    { prompt: "Had 5/6, give 1/3. Left /6:", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "5-2." },
    { prompt: "2/3 + 1/6 (in 6ths):", target: 5, items: [2, 3, 4, 5, 6, 7], hint: "4+1." },
    { prompt: "2/5 + 1/2 (in 10ths):", target: 9, items: [6, 7, 8, 9, 10, 11], hint: "4+5." },
  ],
  "5.NF.B": [
    { prompt: "3/4 = 3 ÷ ?", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "3÷4." },
    { prompt: "(1/2) × (1/3) = 1/?", target: 6, items: [3, 4, 5, 6, 9, 12], hint: "1/6." },
    { prompt: "4 ÷ (1/5) = ?", target: 20, items: [4, 5, 9, 16, 20, 25], hint: "4×5." },
    { prompt: "(2/3) × 6 = ?", target: 4, items: [2, 3, 4, 5, 6, 12], hint: "12/3." },
    { prompt: "(1/4) ÷ 2 = 1/?", target: 8, items: [2, 4, 6, 8, 12, 16], hint: "1/8." },
  ],
  "5.NF.B.3": [
    { prompt: "3/4 = 3 ÷ ?", target: 4, items: [2, 3, 4, 6, 8, 12], hint: "4." },
    { prompt: "5/8 = 5 ÷ ?", target: 8, items: [3, 5, 8, 13, 40, 64], hint: "8." },
    { prompt: "9 shared by 4: fraction as n/4. n =", target: 9, items: [2, 4, 8, 9, 36, 45], hint: "9/4." },
    { prompt: "50/9: whole-number part:", target: 5, items: [4, 5, 6, 9, 50, 55], hint: "9×5=45." },
    { prompt: "7/2 lies between 3 and ?", target: 4, items: [2, 3, 4, 7, 14, 15], hint: "3 to 4." },
  ],
  "5.NF.B.4": [
    { prompt: "(1/2) × 4 = ?", target: 2, items: [1, 2, 3, 4, 8, 16], hint: "4/2." },
    { prompt: "(2/3) × 6 = ?", target: 4, items: [2, 3, 4, 5, 6, 12], hint: "12/3." },
    { prompt: "(1/2) × (1/4) = 1/?", target: 8, items: [2, 4, 6, 8, 12, 16], hint: "1/8." },
    { prompt: "(2/3) × (3/4) (in 12ths):", target: 6, items: [3, 4, 6, 8, 10, 12], hint: "6/12." },
    { prompt: "(3/5) × (2/7) (in 35ths):", target: 6, items: [3, 5, 6, 7, 10, 35], hint: "6/35." },
  ],
  "5.NF.B.4a": [
    { prompt: "(2/3) × 4 (in 3rds):", target: 8, items: [4, 6, 8, 10, 12, 24], hint: "8/3." },
    { prompt: "(1/5) × 3 (in 5ths):", target: 3, items: [1, 2, 3, 5, 10, 15], hint: "3/5." },
    { prompt: "(2/3) × (4/5) (in 15ths):", target: 8, items: [6, 7, 8, 10, 12, 15], hint: "8/15." },
    { prompt: "(3/4) × (2/5) (in 20ths):", target: 6, items: [4, 5, 6, 8, 10, 12], hint: "6/20." },
    { prompt: "(5/6) × (3/4) (in 24ths):", target: 15, items: [10, 12, 15, 18, 20, 24], hint: "15/24." },
  ],
  "5.NF.B.4b": [
    { prompt: "Rect 1/2 × 1/3 area (in 6ths):", target: 1, items: [1, 2, 3, 5, 6, 9], hint: "1/6." },
    { prompt: "Rect 2/3 × 3/4 (in 12ths):", target: 6, items: [3, 4, 6, 8, 10, 12], hint: "6/12." },
    { prompt: "Rect 3/5 × 2/3 (in 15ths):", target: 6, items: [3, 5, 6, 10, 12, 15], hint: "6/15." },
    { prompt: "Rect 1/4 × 1/4 (in 16ths):", target: 1, items: [1, 2, 4, 8, 12, 16], hint: "1/16." },
    { prompt: "Rect 5/8 × 2/3 (in 24ths):", target: 10, items: [6, 8, 10, 15, 16, 20], hint: "10/24." },
  ],
  "5.NF.B.5": [
    { prompt: "5 × (1/2) < 5? (1=yes 0=no)", target: 1, items: [0, 1, 2, 5, 10, 15], hint: "×<1 shrinks." },
    { prompt: "5 × 3 > 5? (1=yes 0=no)", target: 1, items: [0, 1, 2, 5, 15, 30], hint: "×>1 grows." },
    { prompt: "8 × (4/4) = ?", target: 8, items: [4, 6, 8, 16, 32, 64], hint: "×1." },
    { prompt: "10 × (3/5) < 10? (1=yes 0=no)", target: 1, items: [0, 1, 2, 5, 6, 10], hint: "3/5 < 1." },
    { prompt: "6 × (7/4) > 6? (1=yes 0=no)", target: 1, items: [0, 1, 2, 6, 10, 14], hint: "7/4 > 1." },
  ],
  "5.NF.B.5a": [
    { prompt: "5 × (1/3) vs 5: bigger(1)/smaller(0)?", target: 0, items: [0, 1, 2, 3, 5, 15], hint: "Shrinks." },
    { prompt: "8 × 2 vs 8: bigger(1)/smaller(0)?", target: 1, items: [0, 1, 2, 8, 16, 32], hint: "Grows." },
    { prompt: "10 × (4/5) vs 10: bigger(1)/smaller(0)?", target: 0, items: [0, 1, 4, 5, 8, 10], hint: "Shrinks." },
    { prompt: "6 × (5/5) vs 6: equal(1)/not(0)?", target: 1, items: [0, 1, 5, 6, 30, 60], hint: "Equal to 1." },
    { prompt: "12 × (3/2) vs 12: bigger(1)/smaller(0)?", target: 1, items: [0, 1, 2, 12, 18, 24], hint: "Grows." },
  ],
  "5.NF.B.5b": [
    { prompt: "8 × 1/2 = ?", target: 4, items: [2, 4, 6, 8, 12, 16], hint: "Half of 8." },
    { prompt: "10 × (2/5) = ?", target: 4, items: [2, 4, 5, 8, 10, 20], hint: "20/5." },
    { prompt: "6 × (3/2) = ?", target: 9, items: [3, 6, 9, 12, 18, 24], hint: "18/2." },
    { prompt: "12 × (4/3) = ?", target: 16, items: [12, 14, 16, 18, 24, 48], hint: "48/3." },
    { prompt: "9 × (2/3) = ?", target: 6, items: [3, 4, 6, 9, 12, 18], hint: "18/3." },
  ],
  "5.NF.B.6": [
    { prompt: "(1/2) × 10 cups flour = ?", target: 5, items: [2, 4, 5, 8, 10, 15], hint: "Half." },
    { prompt: "(2/3) × 9 lb = ? lb", target: 6, items: [3, 5, 6, 9, 12, 18], hint: "18/3." },
    { prompt: "(3/4) of 20 min = ? min", target: 15, items: [10, 12, 15, 18, 20, 25], hint: "60/4." },
    { prompt: "(5/6) × 12 ft = ? ft", target: 10, items: [6, 8, 10, 12, 15, 18], hint: "60/6." },
    { prompt: "2 (1/2) × 4 = ?", target: 10, items: [6, 8, 10, 12, 16, 20], hint: "2.5 × 4." },
  ],
  "5.NF.B.7": [
    { prompt: "(1/4) ÷ 2 = 1/?", target: 8, items: [2, 4, 6, 8, 12, 16], hint: "1/8." },
    { prompt: "4 ÷ (1/2) = ?", target: 8, items: [2, 4, 6, 8, 12, 16], hint: "4×2." },
    { prompt: "(1/3) ÷ 2 = 1/?", target: 6, items: [2, 3, 5, 6, 9, 12], hint: "1/6." },
    { prompt: "5 ÷ (1/3) = ?", target: 15, items: [5, 8, 10, 15, 20, 25], hint: "5×3." },
    { prompt: "(1/5) ÷ 4 = 1/?", target: 20, items: [4, 9, 16, 20, 25, 40], hint: "1/20." },
  ],
  "5.NF.B.7a": [
    { prompt: "(1/2) ÷ 3 = 1/?", target: 6, items: [3, 5, 6, 9, 12, 15], hint: "1/6." },
    { prompt: "(1/3) ÷ 4 = 1/?", target: 12, items: [7, 9, 12, 16, 20, 24], hint: "1/12." },
    { prompt: "(1/4) ÷ 5 = 1/?", target: 20, items: [9, 15, 20, 25, 50, 100], hint: "1/20." },
    { prompt: "(1/5) ÷ 3 = 1/?", target: 15, items: [8, 10, 15, 20, 25, 30], hint: "1/15." },
    { prompt: "(1/6) ÷ 2 = 1/?", target: 12, items: [3, 8, 10, 12, 18, 24], hint: "1/12." },
  ],
  "5.NF.B.7b": [
    { prompt: "3 ÷ (1/4) = ?", target: 12, items: [7, 9, 12, 15, 16, 20], hint: "3×4." },
    { prompt: "5 ÷ (1/2) = ?", target: 10, items: [5, 7, 10, 15, 20, 25], hint: "5×2." },
    { prompt: "4 ÷ (1/5) = ?", target: 20, items: [9, 16, 20, 24, 25, 30], hint: "4×5." },
    { prompt: "6 ÷ (1/3) = ?", target: 18, items: [9, 12, 18, 24, 30, 36], hint: "6×3." },
    { prompt: "2 ÷ (1/8) = ?", target: 16, items: [8, 10, 14, 16, 20, 24], hint: "2×8." },
  ],
  "5.NF.B.7c": [
    { prompt: "Share 1/2 lb chocolate among 3. Each = 1/?", target: 6, items: [2, 3, 5, 6, 9, 12], hint: "1/6." },
    { prompt: "2 cups raisins, 1/3 cup each. Servings:", target: 6, items: [2, 3, 5, 6, 9, 12], hint: "2×3." },
    { prompt: "1/4 pie into 3 slices. Each = 1/?", target: 12, items: [7, 10, 12, 14, 16, 20], hint: "1/12." },
    { prompt: "5 ft rope, 1/2 ft pieces. Pieces:", target: 10, items: [5, 8, 10, 15, 20, 25], hint: "5×2." },
    { prompt: "1/3 gal juice by 4 kids. Each = 1/?", target: 12, items: [4, 7, 10, 12, 15, 18], hint: "1/12." },
  ],
  "5.MD.A": [
    { prompt: "5 m = ? cm", target: 500, items: [50, 100, 500, 5000, 50000, 500000], hint: "×100." },
    { prompt: "2000 ml = ? L", target: 2, items: [1, 2, 5, 10, 20, 200], hint: "/1000." },
    { prompt: "3 kg = ? g", target: 3000, items: [30, 300, 3000, 30000, 300000, 3000000], hint: "×1000." },
    { prompt: "500 cm = ? m", target: 5, items: [1, 5, 50, 500, 5000, 50000], hint: "/100." },
    { prompt: "2 hr = ? min", target: 120, items: [60, 100, 120, 180, 240, 360], hint: "×60." },
  ],
  "5.MD.A.1": [
    { prompt: "5 cm = 0.05 m. Hundredths value:", target: 5, items: [1, 5, 10, 50, 100, 500], hint: "5 hundredths." },
    { prompt: "3000 g = ? kg", target: 3, items: [1, 3, 30, 300, 3000, 30000], hint: "/1000." },
    { prompt: "2.5 km = ? m", target: 2500, items: [250, 2050, 2500, 2550, 25000, 250000], hint: "×1000." },
    { prompt: "4 ft = ? in", target: 48, items: [36, 44, 48, 52, 60, 72], hint: "×12." },
    { prompt: "1 gal = ? qt", target: 4, items: [2, 3, 4, 8, 16, 32], hint: "4." },
  ],
  "5.MD.B": [
    { prompt: "Values 1/4, 1/2, 1/2 sum /4:", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "1+2+2." },
    { prompt: "4 beakers 2, 3, 5, 6 oz. Equal share:", target: 4, items: [3, 4, 5, 6, 7, 8], hint: "16/4." },
    { prompt: "Longest 7/8, shortest 3/8. Diff /8:", target: 4, items: [2, 3, 4, 5, 6, 7], hint: "7-3." },
    { prompt: "Avg of 1/2 four times = 1/?", target: 2, items: [1, 2, 4, 6, 8, 16], hint: "1/2." },
    { prompt: "Sum 1/8 + 3/8 + 4/8 /8:", target: 8, items: [4, 6, 7, 8, 10, 16], hint: "8/8=1." },
  ],
  "5.MD.B.2": [
    { prompt: "Values 1/2, 1/2, 1. Sum:", target: 2, items: [1, 2, 3, 4, 5, 6], hint: "2." },
    { prompt: "Beakers 3, 5, 7, 9 oz. Equal share:", target: 6, items: [4, 5, 6, 7, 8, 10], hint: "24/4." },
    { prompt: "Longest 5/8, shortest 1/8. Diff /8:", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "4." },
    { prompt: "Sum 1/4 + 1/4 + 1/2 /4:", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "1+1+2." },
    { prompt: "Redistribute 1+3+2 oz over 3: each:", target: 2, items: [1, 2, 3, 4, 5, 6], hint: "6/3." },
  ],
  "5.MD.C": [
    { prompt: "Volume 2×3×4:", target: 24, items: [12, 18, 24, 30, 36, 48], hint: "lwh." },
    { prompt: "3×3×3 cube volume:", target: 27, items: [9, 18, 24, 27, 36, 45], hint: "27." },
    { prompt: "5×4×2 volume:", target: 40, items: [20, 30, 40, 50, 60, 80], hint: "40." },
    { prompt: "Pool 10×5×3 volume:", target: 150, items: [100, 125, 150, 175, 200, 300], hint: "150." },
    { prompt: "Compound 2×2×2 + 3×3×3:", target: 35, items: [27, 30, 35, 40, 45, 64], hint: "8+27." },
  ],
  "5.MD.C.3": [
    { prompt: "Unit cube side:", target: 1, items: [1, 2, 3, 4, 5, 6], hint: "1." },
    { prompt: "Unit cube volume:", target: 1, items: [1, 2, 3, 4, 6, 8], hint: "1." },
    { prompt: "Cubes filling 2×2×2:", target: 8, items: [4, 6, 8, 12, 16, 24], hint: "8." },
    { prompt: "Cubes filling 3×3×3:", target: 27, items: [9, 18, 24, 27, 36, 54], hint: "27." },
    { prompt: "Cubes filling 4×2×3:", target: 24, items: [18, 20, 24, 28, 30, 36], hint: "24." },
  ],
  "5.MD.C.3a": [
    { prompt: "Unit cube side length:", target: 1, items: [1, 2, 3, 4, 6, 10], hint: "1." },
    { prompt: "Unit cube volume:", target: 1, items: [1, 2, 3, 4, 6, 8], hint: "1 cu unit." },
    { prompt: "2 unit cubes together volume:", target: 2, items: [1, 2, 3, 4, 6, 8], hint: "2." },
    { prompt: "Unit cube face area:", target: 1, items: [1, 2, 3, 4, 6, 8], hint: "1 sq unit." },
    { prompt: "Faces of a cube:", target: 6, items: [4, 5, 6, 8, 10, 12], hint: "6." },
  ],
  "5.MD.C.3b": [
    { prompt: "Packed by 6 cubes. Volume:", target: 6, items: [4, 5, 6, 7, 8, 10], hint: "6." },
    { prompt: "Packed by 10 cubes:", target: 10, items: [6, 8, 10, 12, 15, 20], hint: "10." },
    { prompt: "Packed by 24 cubes:", target: 24, items: [18, 20, 24, 28, 30, 32], hint: "24." },
    { prompt: "Packed by 60 cubes:", target: 60, items: [40, 50, 60, 70, 80, 100], hint: "60." },
    { prompt: "Packed by 125 cubes:", target: 125, items: [100, 115, 125, 135, 150, 200], hint: "125." },
  ],
  "5.MD.C.4": [
    { prompt: "Cubes in 2×3×4:", target: 24, items: [18, 20, 24, 28, 30, 36], hint: "24." },
    { prompt: "Cubes in 3×4×5:", target: 60, items: [40, 50, 60, 70, 80, 100], hint: "60." },
    { prompt: "Cubes in 1×5×6:", target: 30, items: [20, 25, 30, 35, 40, 50], hint: "30." },
    { prompt: "Cubes in 4×4×4:", target: 64, items: [48, 56, 64, 72, 80, 100], hint: "64." },
    { prompt: "Cubes in 5×5×2:", target: 50, items: [40, 45, 50, 55, 60, 75], hint: "50." },
  ],
  "5.MD.C.5": [
    { prompt: "Box 4×5×2 volume:", target: 40, items: [20, 30, 40, 50, 60, 80], hint: "40." },
    { prompt: "Cube side 4 volume:", target: 64, items: [48, 56, 64, 72, 80, 96], hint: "4^3." },
    { prompt: "Box 6×3×5 volume:", target: 90, items: [70, 80, 90, 100, 120, 150], hint: "90." },
    { prompt: "Compound 2×2×2 + 3×3×3:", target: 35, items: [27, 30, 35, 40, 45, 54], hint: "8+27." },
    { prompt: "Box 10×10×5 volume:", target: 500, items: [300, 400, 500, 600, 800, 1000], hint: "500." },
  ],
  "5.MD.C.5a": [
    { prompt: "Pack 3×4×2 with unit cubes:", target: 24, items: [18, 20, 24, 28, 30, 36], hint: "24." },
    { prompt: "Pack 5×2×3:", target: 30, items: [20, 25, 30, 35, 40, 50], hint: "30." },
    { prompt: "Pack 4×4×2:", target: 32, items: [24, 28, 32, 36, 40, 48], hint: "32." },
    { prompt: "Base area 12, height 5. Volume:", target: 60, items: [40, 50, 60, 70, 80, 100], hint: "12×5." },
    { prompt: "2×3×5 volume:", target: 30, items: [20, 25, 30, 35, 40, 45], hint: "30." },
  ],
  "5.MD.C.5b": [
    { prompt: "V = 3×4×5 =", target: 60, items: [40, 50, 60, 70, 80, 100], hint: "lwh." },
    { prompt: "V = 2×5×6 =", target: 60, items: [40, 50, 60, 70, 80, 100], hint: "60." },
    { prompt: "Base 15, height 4. V:", target: 60, items: [40, 50, 60, 70, 80, 90], hint: "15×4." },
    { prompt: "V = 6×7×2 =", target: 84, items: [72, 78, 84, 90, 96, 102], hint: "84." },
    { prompt: "V = 10×4×3 =", target: 120, items: [100, 110, 120, 130, 140, 150], hint: "120." },
  ],
  "5.MD.C.5c": [
    { prompt: "2×2×2 + 3×3×3:", target: 35, items: [27, 30, 35, 40, 45, 54], hint: "8+27." },
    { prompt: "4×2×3 + 2×2×2:", target: 32, items: [24, 28, 32, 36, 40, 48], hint: "24+8." },
    { prompt: "5×5×1 + 3×2×2:", target: 37, items: [30, 35, 37, 40, 45, 50], hint: "25+12." },
    { prompt: "6×2×2 + 4×3×1:", target: 36, items: [28, 32, 36, 40, 48, 52], hint: "24+12." },
    { prompt: "10×2×3 + 5×2×2:", target: 80, items: [60, 70, 80, 90, 100, 120], hint: "60+20." },
  ],
  "5.G.A": [
    { prompt: "Origin is at (0, ?):", target: 0, items: [0, 1, 2, 5, 10, 100], hint: "0." },
    { prompt: "Point (3,4): x-coord:", target: 3, items: [2, 3, 4, 7, 12, 34], hint: "First." },
    { prompt: "Point (5,2): y-coord:", target: 2, items: [1, 2, 3, 5, 7, 10], hint: "Second." },
    { prompt: "From (0,0) right 4 up 3. y:", target: 3, items: [0, 2, 3, 4, 7, 12], hint: "3." },
    { prompt: "(2,1) to (5,1): x-distance:", target: 3, items: [1, 2, 3, 4, 5, 6], hint: "5-2." },
  ],
  "5.G.A.1": [
    { prompt: "Origin x:", target: 0, items: [0, 1, 2, 5, 10, 100], hint: "(0,0)." },
    { prompt: "Point (2,5): x:", target: 2, items: [2, 3, 5, 7, 10, 25], hint: "First." },
    { prompt: "Point (4,7): y:", target: 7, items: [3, 4, 7, 11, 28, 47], hint: "Second." },
    { prompt: "From origin right 3 up 5. x:", target: 3, items: [2, 3, 5, 8, 15, 35], hint: "3." },
    { prompt: "From origin right 6 up 2. y:", target: 2, items: [0, 2, 4, 6, 8, 12], hint: "2." },
  ],
  "5.G.A.2": [
    { prompt: "Point (3,4) — x travel:", target: 3, items: [1, 3, 4, 7, 12, 34], hint: "3." },
    { prompt: "(1,2) to (1,7) distance:", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "7-2." },
    { prompt: "Plant at (5,0): y-coord:", target: 0, items: [0, 1, 5, 10, 25, 50], hint: "On x-axis." },
    { prompt: "Park (4,3): sum of coords:", target: 7, items: [4, 5, 7, 12, 34, 43], hint: "4+3." },
    { prompt: "(0,0) to (6,8): x-distance:", target: 6, items: [6, 7, 8, 10, 14, 16], hint: "6." },
  ],
  "5.G.B": [
    { prompt: "Square is a rectangle? (1=yes 0=no)", target: 1, items: [0, 1, 2, 4, 10, 100], hint: "Yes." },
    { prompt: "Rectangle right angles:", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "4." },
    { prompt: "Rhombus equal sides:", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "4." },
    { prompt: "Square parallel side pairs:", target: 2, items: [0, 1, 2, 3, 4, 6], hint: "2." },
    { prompt: "All squares are rhombuses? (1=yes 0=no)", target: 1, items: [0, 1, 2, 4, 10, 100], hint: "Yes." },
  ],
  "5.G.B.3": [
    { prompt: "Square has 4 right angles? (1=yes 0=no)", target: 1, items: [0, 1, 2, 4, 10, 90], hint: "Yes." },
    { prompt: "All rectangles have 4 right angles? (1=yes 0=no)", target: 1, items: [0, 1, 2, 4, 10, 90], hint: "Yes." },
    { prompt: "All squares are rectangles? (1=yes 0=no)", target: 1, items: [0, 1, 2, 4, 10, 100], hint: "Yes." },
    { prompt: "All rectangles are squares? (1=yes 0=no)", target: 0, items: [0, 1, 2, 4, 10, 100], hint: "No." },
    { prompt: "All parallelograms are quadrilaterals? (1=yes 0=no)", target: 1, items: [0, 1, 2, 3, 4, 5], hint: "Yes." },
  ],
  "5.G.B.4": [
    { prompt: "Quadrilateral sides:", target: 4, items: [3, 4, 5, 6, 7, 8], hint: "4." },
    { prompt: "Pentagon sides:", target: 5, items: [3, 4, 5, 6, 7, 8], hint: "5." },
    { prompt: "Hexagon sides:", target: 6, items: [4, 5, 6, 7, 8, 10], hint: "6." },
    { prompt: "Square right angles:", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "4." },
    { prompt: "Rhombus equal sides:", target: 4, items: [2, 3, 4, 5, 6, 8], hint: "4." },
  ],
}

/**
 * Look up hardcoded rounds for a standard. Returns null if none exist.
 */
export function getHardcodedRounds(standardId: string): HardcodedRound[] | null {
  return STANDARD_ROUNDS[standardId] ?? null
}
