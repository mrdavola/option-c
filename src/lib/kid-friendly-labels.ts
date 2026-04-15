// Kid-friendly skill labels per standard.
// The raw standard descriptions include teacher metadata (parenthetical
// notes, "applies wherever X", etc.) that's unreadable for learners.
// We keep the raw description for internal use but show these short
// kid-friendly labels to the learner.

export const KID_FRIENDLY_LABELS: Record<string, string> = {
  // ─── Kindergarten ───────────────────────────────────────────────
  "K.CC.A.1": "Count to 100",
  "K.CC.A.2": "Count up from any number",
  "K.CC.A.3": "Write numbers 0 to 20",
  "K.CC.B.4": "Count things one at a time",
  "K.CC.B.4a": "Match numbers to objects",
  "K.CC.B.4b": "The last number you say is the total",
  "K.CC.B.4c": "Each next number is one more",
  "K.CC.B.5": "Count to find how many",
  "K.CC.C.6": "Compare groups of things",
  "K.CC.C.7": "Compare two numbers",
  "K.OA.A.1": "Add and subtract things together",
  "K.OA.A.2": "Solve add and subtract word problems (to 10)",
  "K.OA.A.3": "Break numbers into smaller parts (to 10)",
  "K.OA.A.4": "Find what makes 10",
  "K.OA.A.5": "Add and subtract really fast (to 5)",
  "K.NBT.A.1": "Numbers 11 to 19 are ten plus some ones",
  "K.MD.A.1": "Describe how big or long something is",
  "K.MD.A.2": "Compare two things by size",
  "K.MD.B.3": "Sort things into groups and count them",
  "K.G.A.1": "Name shapes everywhere you see them",
  "K.G.A.2": "Name shapes no matter how they sit",
  "K.G.A.3": "Flat shapes vs solid shapes",
  "K.G.B.4": "Compare shapes",
  "K.G.B.5": "Draw and build shapes",
  "K.G.B.6": "Make bigger shapes from smaller ones",

  // (Add more grades incrementally as we test them.)
}

export function getKidFriendlyLabel(standardId: string): string | null {
  return KID_FRIENDLY_LABELS[standardId] ?? null
}
