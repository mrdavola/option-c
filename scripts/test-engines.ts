// Quick test: generate HTML from each engine and check for critical elements
import { generateWithEngine, getAvailableEngines, DEFAULT_PALETTE } from "../src/lib/game-engines/index"
import type { ThemeConfig, MathParams } from "../src/lib/game-engines/engine-types"

const cfg: ThemeConfig = {
  title: "Test Game", character: "test hero", itemName: "test items",
  targetName: "test target", worldName: "test world",
  colors: DEFAULT_PALETTE,
  winMessage: "You won!", loseMessage: "Try again!",
}
const math: MathParams = { grade: "6", standardId: "6.EE.B.7", standardDescription: "Solve equations", difficulty: "medium" }

let pass = 0, fail = 0
for (const id of getAvailableEngines()) {
  const html = generateWithEngine(id, cfg, math)
  if (!html) { console.log("❌", id, "NULL"); fail++; continue }
  const issues: string[] = []
  if (!html.includes("gameWin")) issues.push("noWin")
  if (!html.includes("showVictory")) issues.push("noVictory")
  if (!html.includes("startGame")) issues.push("noStart")
  if (!html.includes("trackFail")) issues.push("noFail")
  if (!html.includes("Test Game")) issues.push("noTitle")
  if (!html.includes("test hero")) issues.push("noChar")
  if (!html.includes("</html>")) issues.push("truncated")
  if (issues.length) { console.log("⚠️", id + ":", issues.join(", ")); fail++ }
  else { console.log("✅", id, `(${Math.round(html.length/1024)}KB)`); pass++ }
}
console.log(`\n${pass} passed, ${fail} failed out of ${getAvailableEngines().length}`)
