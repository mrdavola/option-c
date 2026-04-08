// One-shot script: generates a 4-6 word, capitalized "moon name" for every
// math standard. Outputs src/data/moon-names.json — a flat { id: shortName }
// map that the app reads at runtime.
//
// Run:
//   node scripts/generate-moon-names.js          (resumes if run twice)
//   node scripts/generate-moon-names.js --force  (regenerates everything)

require("dotenv").config({ path: ".env.local" })
const fs = require("fs")
const path = require("path")
const Anthropic = require("@anthropic-ai/sdk")

const FORCE = process.argv.includes("--force")
const STANDARDS_PATH = path.join(__dirname, "..", "src", "data", "standards.json")
const OUT_PATH = path.join(__dirname, "..", "src", "data", "moon-names.json")
const BATCH_SIZE = 25 // standards per Claude call

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY missing from .env.local")
  process.exit(1)
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function isClusterNode(id) {
  const parts = id.split(".")
  return parts.length === 3 && /^[A-Z]$/.test(parts[2])
}

const data = JSON.parse(fs.readFileSync(STANDARDS_PATH, "utf8"))
const moons = data.nodes.filter((n) => !isClusterNode(n.id))
console.log(`Total moons: ${moons.length}`)

// Resume support: load existing names so we only generate the missing ones
let existing = {}
if (!FORCE && fs.existsSync(OUT_PATH)) {
  existing = JSON.parse(fs.readFileSync(OUT_PATH, "utf8"))
  console.log(`Resuming — already have ${Object.keys(existing).length} names`)
}

const todo = moons.filter((m) => !existing[m.id])
console.log(`To generate: ${todo.length}`)

async function generateBatch(batch) {
  const list = batch
    .map((m, i) => `${i + 1}. [${m.id}] ${m.description || ""}`)
    .join("\n")

  const prompt = `For each Common Core math standard below, write a SHORT 4-6 word title that:
- Names the specific math skill (not the topic area)
- Starts with a Capital letter
- Is plain student-friendly English (not academic)
- Fits in a small bubble (max ~35 characters)
- Uses no quotes, no period at the end

Standards:
${list}

Reply with EXACTLY one line per standard in this format:
1. <Title>
2. <Title>
...

No other text. No explanations.`

  const message = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  })

  const text = message.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean)
  const out = {}
  for (const line of lines) {
    const m = line.match(/^(\d+)\.\s*(.+)$/)
    if (!m) continue
    const idx = parseInt(m[1], 10) - 1
    if (idx < 0 || idx >= batch.length) continue
    let name = m[2].trim().replace(/[."'`]+$/g, "").replace(/^["'`]+/, "")
    if (name.length > 50) name = name.slice(0, 50).trim()
    out[batch[idx].id] = name
  }
  return out
}

async function main() {
  let done = Object.keys(existing).length
  for (let i = 0; i < todo.length; i += BATCH_SIZE) {
    const batch = todo.slice(i, i + BATCH_SIZE)
    process.stdout.write(`Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(todo.length / BATCH_SIZE)} (${batch.length} items)... `)
    try {
      const result = await generateBatch(batch)
      Object.assign(existing, result)
      done += Object.keys(result).length
      // Persist after every batch in case the script dies halfway
      fs.writeFileSync(OUT_PATH, JSON.stringify(existing, null, 2))
      console.log(`OK (${done}/${moons.length})`)
    } catch (err) {
      console.log(`FAIL: ${err.message || err}`)
      // Save what we have and continue
      fs.writeFileSync(OUT_PATH, JSON.stringify(existing, null, 2))
    }
  }
  console.log(`\nDone — ${Object.keys(existing).length} names written to ${OUT_PATH}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
