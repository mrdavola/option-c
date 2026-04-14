// Eureka match — AI analyzes a learner's game idea and matches it to
// a game mechanic + standard they still need to demonstrate.

import Anthropic from "@anthropic-ai/sdk"
import { getAdminDb } from "@/lib/firebase-admin"
import { GAME_OPTIONS, type GameOptionDef } from "@/lib/game-engines/game-option-registry"
import { STANDARD_GAME_OPTIONS } from "@/lib/standard-game-options"
import standardsData from "@/data/standards.json"

export const maxDuration = 15

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: Request) {
  const { background, character, gameIdea, grade, uid } = await req.json()

  // Get the learner's progress to find standards they still need
  const adminDb = getAdminDb()
  const demonstratedStandards = new Set<string>()
  try {
    const progressSnap = await adminDb.collection("progress").doc(uid).collection("standards").get()
    progressSnap.forEach((doc) => {
      const data = doc.data()
      if (data.status === "unlocked" || data.status === "mastered" || data.status === "in_review" || data.status === "approved_unplayed") {
        demonstratedStandards.add(doc.id)
      }
    })
  } catch {
    // If progress fetch fails, show all options
  }

  // Filter standards to the learner's grade that they still need
  const gradeStandards = (standardsData as any).nodes.filter((s: any) =>
    s.grade === grade &&
    !demonstratedStandards.has(s.id) &&
    !s.id.startsWith("MP.") &&
    // Skip cluster headers (no numeric suffix)
    /\d$|[a-z]$/.test(s.id)
  )

  // Build valid option-standard pairs using the per-standard mapping
  // This is the ONLY source of truth for which game options work with which standards
  const validPairs: Array<{
    optionId: string; optionName: string; description: string;
    mechanicId: string; standardId: string; standardDescription: string;
    standardGrade: string
  }> = []

  for (const standard of gradeStandards) {
    const allowedOptionIds = STANDARD_GAME_OPTIONS[standard.id]
    if (!allowedOptionIds) continue
    for (const optId of allowedOptionIds) {
      const opt = GAME_OPTIONS.find(o => o.id === optId)
      if (!opt) continue
      validPairs.push({
        optionId: opt.id,
        optionName: opt.name,
        description: opt.description,
        mechanicId: opt.mechanicId,
        standardId: standard.id,
        standardDescription: standard.description,
        standardGrade: standard.grade,
      })
    }
  }

  if (validPairs.length === 0) {
    return Response.json({ suggestions: [], allOptions: [], reason: "No matching standards found for this grade." })
  }

  // Build a compact summary of ONLY valid pairs for the AI
  const pairSummary = validPairs.map(p =>
    `- ${p.optionName} (${p.optionId}) for "${p.standardDescription}" [${p.standardId}]`
  ).join("\n")

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: `You match a kid's game idea to the best game option + math standard pair. Return ONLY JSON, no markdown.

IMPORTANT: You may ONLY pick from the pairs listed below. Each pair is a game option matched to a specific math standard. Do NOT suggest options or standards outside this list.

Available game option + standard pairs:
${pairSummary}

Return:
{"matches": [{"optionId": "<id>", "standardId": "<id>", "reason": "why this fits the idea"}], "count": N}

Return exactly 3 best-matching pairs, ordered from best to third-best. Pick pairs where the GAMEPLAY matches the idea AND the math standard makes sense. If the idea is vague, pick the most fun/engaging options. Return DIFFERENT game options when possible (don't return the same optionId 3 times).`,
      messages: [{
        role: "user",
        content: `Background: ${background}
Character: ${character}
Game idea: ${gameIdea}`,
      }],
    })

    const text = response.content[0].type === "text" ? response.content[0].text : ""
    const cleaned = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim()
    const parsed = JSON.parse(cleaned)

    const matches: Array<typeof parsed.matches[0]> = parsed.matches || []
    const suggestions = matches
      .map((m: any) => {
        const pair = validPairs.find(p => p.optionId === m.optionId && p.standardId === m.standardId)
        if (!pair) return null
        return { ...pair, reason: m.reason }
      })
      .filter(Boolean)
      .slice(0, 3)

    // Always return top-3 suggestions. Top one is the "best match".
    // If the AI only produced fewer, pad from validPairs so we always have 3.
    let finalSuggestions = suggestions.slice(0, 3)
    if (finalSuggestions.length < 3) {
      for (const pair of validPairs) {
        if (finalSuggestions.length >= 3) break
        const already = finalSuggestions.find((s: any) => s.optionId === pair.optionId && s.standardId === pair.standardId)
        if (!already) finalSuggestions.push(pair as any)
      }
    }

    const allOpts = validPairs.slice(0, 30).map(p => ({
      optionId: p.optionId,
      optionName: p.optionName,
      description: p.description,
      mechanicId: p.mechanicId,
      standardId: p.standardId,
      standardDescription: p.standardDescription,
      standardGrade: p.standardGrade,
    }))

    return Response.json({
      suggestions: finalSuggestions,
      bestMatchIndex: 0,
      allOptions: allOpts,
      reason: parsed.reason || matches[0]?.reason || "",
    })
  } catch (err) {
    console.error("[eureka-match] AI matching failed:", err)
    // Fallback: return first 3 valid pairs (guaranteed correct mapping)
    return Response.json({
      suggestions: validPairs.slice(0, 3),
      bestMatchIndex: 0,
      allOptions: validPairs.slice(0, 9),
    })
  }
}
