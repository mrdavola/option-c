/**
 * Extract math standards and coherence edges from the ATC Coherence Map repo.
 *
 * Source: https://github.com/achievethecore/atc-coherence-map
 *
 * Usage: npx tsx scripts/extract-standards.ts
 */

import { execSync } from "node:child_process"
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"

import type { StandardNode, StandardEdge, StandardsGraph } from "../src/lib/graph-types"

// ---------------------------------------------------------------------------
// 1. Clone the ATC repo (if not already present)
// ---------------------------------------------------------------------------

const REPO_URL = "https://github.com/achievethecore/atc-coherence-map.git"
const CLONE_DIR = "/tmp/atc-coherence-map"

if (!existsSync(CLONE_DIR)) {
  console.log("Cloning ATC coherence map repo...")
  execSync(`git clone --depth 1 ${REPO_URL} ${CLONE_DIR}`, { stdio: "inherit" })
} else {
  console.log("ATC repo already cloned at", CLONE_DIR)
}

// ---------------------------------------------------------------------------
// 2. Read & parse standards.js
// ---------------------------------------------------------------------------

const standardsRaw = readFileSync(resolve(CLONE_DIR, "standards.js"), "utf8")

// The file is `export default { ... }` — strip the prefix and eval.
// We use Function() instead of eval() for slightly better scoping.
const standardsObj: Record<string, unknown> = new Function(
  `return (${standardsRaw.replace(/^export\s+default\s+/, "")})`
)()

interface RawStandard {
  id: string
  description: string
}

const mathArray = standardsObj.math as RawStandard[]
const majorSet = new Set((standardsObj.major as string).split(",").map((s) => s.trim()))
const supportingSet = new Set((standardsObj.supporting as string).split(",").map((s) => s.trim()))
const additionalSet = new Set((standardsObj.additional as string).split(",").map((s) => s.trim()))

// ---------------------------------------------------------------------------
// 3. Read & parse spreadsheet.js (Google Sheets Atom feed JSON)
// ---------------------------------------------------------------------------

const spreadsheetRaw = readFileSync(resolve(CLONE_DIR, "spreadsheet.js"), "utf8")
const spreadsheetObj = JSON.parse(spreadsheetRaw.replace(/^export\s+default\s+/, ""))

interface FeedEntry {
  "gsx$edgedesc": { $t: string }
  "gsx$begin": { $t: string }
  "gsx$end": { $t: string }
}

const entries: FeedEntry[] = spreadsheetObj.feed.entry

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip HTML tags from a string. */
function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
}

/** Domain name lookup keyed by domain code. */
const DOMAIN_NAMES: Record<string, string> = {
  CC: "Counting & Cardinality",
  OA: "Operations & Algebraic Thinking",
  NBT: "Number & Operations in Base Ten",
  NF: "Number & Operations — Fractions",
  MD: "Measurement & Data",
  G: "Geometry",
  RP: "Ratios & Proportional Relationships",
  NS: "The Number System",
  EE: "Expressions & Equations",
  F: "Functions",
  SP: "Statistics & Probability",
  // High school conceptual categories
  "N-RN": "The Real Number System",
  "N-Q": "Quantities",
  "N-CN": "The Complex Number System",
  "N-VM": "Vector & Matrix Quantities",
  "A-SSE": "Seeing Structure in Expressions",
  "A-APR": "Arithmetic with Polynomials & Rational Expressions",
  "A-CED": "Creating Equations",
  "A-REI": "Reasoning with Equations & Inequalities",
  "F-IF": "Interpreting Functions",
  "F-BF": "Building Functions",
  "F-LE": "Linear, Quadratic, & Exponential Models",
  "F-TF": "Trigonometric Functions",
  "G-CO": "Congruence",
  "G-SRT": "Similarity, Right Triangles, & Trigonometry",
  "G-C": "Circles",
  "G-GPE": "Expressing Geometric Properties with Equations",
  "G-GMD": "Geometric Measurement & Dimension",
  "G-MG": "Modeling with Geometry",
  "S-ID": "Interpreting Categorical & Quantitative Data",
  "S-IC": "Making Inferences & Justifying Conclusions",
  "S-CP": "Conditional Probability & the Rules of Probability",
  "S-MD": "Using Probability to Make Decisions",
  MP: "Mathematical Practices",
}

/**
 * Parse a standard ID into its components.
 *
 * K-8 format:  grade.domain.cluster.standard[sub]
 *   e.g. K.CC.A.1, 3.NF.A.2b, K.CC.A
 *
 * HS format:   category-domain.cluster.standard[sub]
 *   e.g. N-RN.A.1, A-SSE.B.3a
 */
function parseStandardId(id: string): {
  grade: string
  domainCode: string
  domain: string
  cluster: string
} {
  // High school: starts with a letter and contains a dash before first dot
  const hsDash = id.indexOf("-")
  const firstDot = id.indexOf(".")
  if (hsDash !== -1 && (firstDot === -1 || hsDash < firstDot)) {
    // HS: e.g. N-RN.A.1 or A-SSE.B.3a
    const parts = id.split(".")
    const domainCode = parts[0] // e.g. "N-RN"
    const cluster = parts[1] ?? "" // e.g. "A"
    return {
      grade: "HS",
      domainCode,
      domain: DOMAIN_NAMES[domainCode] ?? domainCode,
      cluster,
    }
  }

  // MP (Mathematical Practices): e.g. MP.1
  if (id.startsWith("MP")) {
    return {
      grade: "HS",
      domainCode: "MP",
      domain: DOMAIN_NAMES["MP"] ?? "MP",
      cluster: "",
    }
  }

  // K-8: e.g. K.CC.A.1 or 3.NF.A.2b
  const parts = id.split(".")
  const grade = parts[0] // "K", "1", etc.
  const domainCode = parts[1] ?? "" // "CC", "OA", etc.
  const cluster = parts[2] ?? "" // "A", "B", etc.

  return {
    grade,
    domainCode,
    domain: DOMAIN_NAMES[domainCode] ?? domainCode,
    cluster,
  }
}

function classify(id: string): "major" | "supporting" | "additional" {
  if (majorSet.has(id)) return "major"
  if (supportingSet.has(id)) return "supporting"
  if (additionalSet.has(id)) return "additional"

  // If the exact ID isn't classified, walk up (e.g., K.CC.A.1 -> K.CC.A -> K.CC)
  const parts = id.split(".")
  while (parts.length > 1) {
    parts.pop()
    const parent = parts.join(".")
    if (majorSet.has(parent)) return "major"
    if (supportingSet.has(parent)) return "supporting"
    if (additionalSet.has(parent)) return "additional"
  }

  // Default for HS standards that may not appear in the classification lists
  return "additional"
}

// ---------------------------------------------------------------------------
// 4. Build nodes
// ---------------------------------------------------------------------------

const nodeMap = new Map<string, StandardNode>()

for (const std of mathArray) {
  const { grade, domainCode, domain, cluster } = parseStandardId(std.id)
  const node: StandardNode = {
    id: std.id,
    description: stripHtml(std.description),
    domain,
    domainCode,
    cluster,
    grade,
    classification: classify(std.id),
    isHub: false, // computed after edges
  }
  nodeMap.set(std.id, node)
}

// ---------------------------------------------------------------------------
// 5. Build edges
// ---------------------------------------------------------------------------

/**
 * Clean an edge endpoint ID:
 *  - Strip "||..." annotations
 *  - Replace grade "0" with "K"
 *  - Convert shortened edge format (grade.domain.num) to full standard ID
 *
 * Edge format: 0.CC.1  ->  K.CC.B.5 (need to find matching standard)
 * We build a lookup from (grade, domain, stdNum+sub) -> full ID.
 */

// Build reverse lookup: simplified ID -> full standard ID
// Simplified = grade.domain.stdNum[.sub] (without cluster letter)
function simplifyStandardId(id: string): string {
  const parsed = parseStandardId(id)
  if (parsed.grade === "HS") return id // HS IDs don't simplify the same way

  const parts = id.split(".")
  // parts = [grade, domain, cluster, stdNum] or [grade, domain, cluster]
  // Simplified = grade.domain.stdNum (dropping cluster)
  if (parts.length >= 4) {
    // e.g. K.CC.A.1 -> K.CC.1, K.CC.B.4a -> K.CC.4a
    // But stdNum might be "4a" (letter suffix attached)
    return `${parts[0]}.${parts[1]}.${parts.slice(3).join(".")}`
  }
  if (parts.length === 3) {
    // Cluster-level: K.CC.A -> K.CC (but edges don't typically reference these)
    // Could also be K.CC.A where A is the cluster, or 3.OA.7 (edge format: grade.domain.num)
    // We'll keep as-is for now; these are cluster-level nodes
    return id
  }
  return id
}

const simplifiedToFull = new Map<string, string>()
for (const std of mathArray) {
  const simplified = simplifyStandardId(std.id)
  // Only map leaf standards (those with actual standard numbers, not cluster headers)
  const parts = std.id.split(".")
  if (parts.length >= 4 || parseStandardId(std.id).grade === "HS") {
    simplifiedToFull.set(simplified, std.id)
  }
}

/**
 * Resolve an edge endpoint ID to a full standard ID.
 */
function resolveEdgeId(raw: string): string[] {
  // Strip || annotations
  let id = raw.replace(/\|\|.*/, "").trim()
  if (!id) return []

  // Handle comma-separated composite IDs like "0.G.1,2" or "3.OA.1,2;4.OA.1,2"
  // First split by semicolons
  const semiParts = id.split(";")
  const results: string[] = []

  for (const semiPart of semiParts) {
    const trimmed = semiPart.trim()
    if (!trimmed) continue

    // Check for comma patterns like "0.G.1,2" meaning 0.G.1 and 0.G.2
    // or "4.NF.3.a,b,c" meaning 4.NF.3.a, 4.NF.3.b, 4.NF.3.c
    const commaMatch = trimmed.match(/^(.+?)\.(\w+(?:\.\w+)?),([\w,]+)$/)
    if (commaMatch) {
      const prefix = commaMatch[1]
      const firstVal = commaMatch[2]
      const restVals = commaMatch[3].split(",")

      // Check if firstVal contains a dot (e.g., "3.a" in "4.NF.3.a,b,c")
      if (firstVal.includes(".")) {
        const subParts = firstVal.split(".")
        const num = subParts[0]
        const firstSub = subParts[1]
        results.push(...resolveOneEdgeId(`${prefix}.${num}.${firstSub}`))
        for (const v of restVals) {
          results.push(...resolveOneEdgeId(`${prefix}.${num}.${v.trim()}`))
        }
      } else {
        results.push(...resolveOneEdgeId(`${prefix}.${firstVal}`))
        for (const v of restVals) {
          results.push(...resolveOneEdgeId(`${prefix}.${v.trim()}`))
        }
      }
    } else {
      results.push(...resolveOneEdgeId(trimmed))
    }
  }

  return results
}

function resolveOneEdgeId(id: string): string[] {
  // Replace leading "0." with "K." for kindergarten
  if (id.startsWith("0.")) {
    id = "K." + id.slice(2)
  }

  // Convert sub-standard dots to letters: K.CC.4.a -> K.CC.4a
  // Edge format uses dots: 0.CC.4.a, standard format uses: K.CC.B.4a
  // So we need: K.CC.4.a -> lookup K.CC.4a in simplified map
  const parts = id.split(".")
  if (parts.length >= 4 && /^\d/.test(parts[0]) || parts[0] === "K") {
    // Could be grade.domain.num.sub format
    // Try combining last parts: K.CC.4.a -> K.CC.4a
    const grade = parts[0]
    const domain = parts[1]
    const num = parts[2]
    const sub = parts.slice(3).join("")
    const simplified = `${grade}.${domain}.${num}${sub}`

    // Try the simplified lookup
    const full = simplifiedToFull.get(simplified)
    if (full) return [full]

    // Try direct match
    if (nodeMap.has(simplified)) return [simplified]
  }

  // Direct lookup in simplified map
  const full = simplifiedToFull.get(id)
  if (full) return [full]

  // Direct match in node map
  if (nodeMap.has(id)) return [id]

  return []
}

// Collect edges and count outgoing prerequisites for hub detection
const edgeSet = new Set<string>() // "source->target" for dedup
const edges: StandardEdge[] = []
const outgoingPrereqCount = new Map<string, number>()

for (const entry of entries) {
  const edgeType = entry["gsx$edgedesc"].$t.trim()
  const type: "prerequisite" | "related" =
    edgeType === "Arrow" ? "prerequisite" : "related"

  const sourceIds = resolveEdgeId(entry["gsx$begin"].$t)
  const targetIds = resolveEdgeId(entry["gsx$end"].$t)

  for (const source of sourceIds) {
    for (const target of targetIds) {
      if (source === target) continue
      const key = `${source}->${target}`
      if (edgeSet.has(key)) continue
      edgeSet.add(key)

      edges.push({ source, target, type })

      if (type === "prerequisite") {
        outgoingPrereqCount.set(source, (outgoingPrereqCount.get(source) ?? 0) + 1)
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 6. Mark hub nodes (6+ outgoing prerequisite edges)
// ---------------------------------------------------------------------------

for (const [id, count] of outgoingPrereqCount) {
  if (count >= 6 && nodeMap.has(id)) {
    nodeMap.get(id)!.isHub = true
  }
}

// ---------------------------------------------------------------------------
// 7. Filter to only nodes that are leaf standards (have a standard number)
//    Cluster-level nodes (e.g. K.CC.A) are structural, not actionable
// ---------------------------------------------------------------------------

const nodes = Array.from(nodeMap.values())

// ---------------------------------------------------------------------------
// 8. Write output
// ---------------------------------------------------------------------------

const graph: StandardsGraph = { nodes, edges }

const outPath = resolve(import.meta.dirname ?? __dirname, "../src/data/standards.json")
writeFileSync(outPath, JSON.stringify(graph, null, 2))

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

const hubNodes = nodes.filter((n) => n.isHub)
const unmatchedBegin = entries.flatMap((e) => {
  const resolved = resolveEdgeId(e["gsx$begin"].$t)
  return resolved.length === 0 ? [e["gsx$begin"].$t] : []
})
const unmatchedEnd = entries.flatMap((e) => {
  const resolved = resolveEdgeId(e["gsx$end"].$t)
  return resolved.length === 0 ? [e["gsx$end"].$t] : []
})

console.log("\n=== Extraction Summary ===")
console.log(`Nodes: ${nodes.length}`)
console.log(`Edges: ${edges.length} (deduplicated)`)
console.log(`Hub nodes (6+ outgoing prereqs): ${hubNodes.length}`)
console.log(`Hub IDs: ${hubNodes.map((n) => n.id).join(", ")}`)
console.log(`Unmatched begin IDs: ${unmatchedBegin.length}`)
if (unmatchedBegin.length > 0) console.log(`  Samples: ${[...new Set(unmatchedBegin)].slice(0, 10).join(", ")}`)
console.log(`Unmatched end IDs: ${unmatchedEnd.length}`)
if (unmatchedEnd.length > 0) console.log(`  Samples: ${[...new Set(unmatchedEnd)].slice(0, 10).join(", ")}`)
console.log(`\nWritten to: ${outPath}`)

// Grade distribution
const gradeCount = new Map<string, number>()
for (const n of nodes) {
  gradeCount.set(n.grade, (gradeCount.get(n.grade) ?? 0) + 1)
}
console.log("\nNodes by grade:")
for (const [grade, count] of [...gradeCount.entries()].sort()) {
  console.log(`  ${grade}: ${count}`)
}

// Classification distribution
const classCount = { major: 0, supporting: 0, additional: 0 }
for (const n of nodes) classCount[n.classification]++
console.log("\nNodes by classification:")
console.log(`  major: ${classCount.major}`)
console.log(`  supporting: ${classCount.supporting}`)
console.log(`  additional: ${classCount.additional}`)
