// Eureka match — AI analyzes a learner's game idea and matches it to
// a game mechanic + standard they still need to demonstrate.

import Anthropic from "@anthropic-ai/sdk"
import { getAdminDb } from "@/lib/firebase-admin"
import { GAME_OPTIONS, type GameOptionDef } from "@/lib/game-engines/game-option-registry"
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

  // Build a compact list of available game options with their standards
  const availableOptions: Array<{
    optionId: string; optionName: string; description: string;
    mechanicId: string; standardId: string; standardDescription: string
  }> = []

  for (const standard of gradeStandards) {
    // Find mechanics that match this standard (simplified keyword matching)
    for (const opt of GAME_OPTIONS) {
      // Basic check: does this mechanic's game option already have an entry for this standard?
      // We allow all options for all grade-level standards for now
      if (!availableOptions.some(a => a.optionId === opt.id && a.standardId === standard.id)) {
        availableOptions.push({
          optionId: opt.id,
          optionName: opt.name,
          description: opt.description,
          mechanicId: opt.mechanicId,
          standardId: standard.id,
          standardDescription: standard.description,
        })
      }
    }
  }

  // Build a compact summary of game options for the AI
  const uniqueOptions = GAME_OPTIONS.map(o => `- ${o.name} (${o.id}): ${o.description}`).join("\n")

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system: `You match a kid's game idea to one of our pre-built game options. Return ONLY JSON, no markdown.

Available game options:
${uniqueOptions}

If the idea clearly matches one option, return:
{"match": true, "optionId": "<id>", "reason": "one sentence why this fits"}

If no option fits well, return:
{"match": false, "closest": ["<id1>", "<id2>", "<id3>"], "reason": "one sentence explaining why these are close"}

Pick options where the GAMEPLAY (what the player does) matches, not just the theme.`,
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

    if (parsed.match && parsed.optionId) {
      // Direct match — find the option and a standard for it
      const opt = GAME_OPTIONS.find(o => o.id === parsed.optionId)
      if (opt) {
        // Find a standard at the learner's grade that they still need
        const matchingStandard = gradeStandards[0] // Simple: pick first undemonstrated
        return Response.json({
          match: {
            mechanicId: opt.mechanicId,
            mechanicTitle: "",
            optionId: opt.id,
            optionName: opt.name,
            optionDescription: opt.description,
            standardId: matchingStandard?.id || "",
            standardDescription: matchingStandard?.description || "",
            moonName: "",
            explanation: parsed.reason || "",
          },
        })
      }
    }

    // No direct match — return 3 closest suggestions
    const closestIds: string[] = parsed.closest || []
    const suggestions = closestIds
      .map(id => {
        const opt = GAME_OPTIONS.find(o => o.id === id)
        if (!opt) return null
        const std = gradeStandards[0]
        return {
          optionId: opt.id,
          optionName: opt.name,
          description: opt.description,
          mechanicId: opt.mechanicId,
          standardId: std?.id || "",
          standardDescription: std?.description || "",
        }
      })
      .filter(Boolean)

    // Also build a full list of all options for "see all"
    const allOpts = GAME_OPTIONS.slice(0, 30).map(o => ({
      optionId: o.id,
      optionName: o.name,
      description: o.description,
      mechanicId: o.mechanicId,
      standardId: gradeStandards[0]?.id || "",
      standardDescription: gradeStandards[0]?.description || "",
    }))

    return Response.json({ suggestions, allOptions: allOpts, reason: parsed.reason })
  } catch (err) {
    console.error("[eureka-match] AI matching failed:", err)
    // Fallback: just return all options
    const fallback = GAME_OPTIONS.slice(0, 9).map(o => ({
      optionId: o.id,
      optionName: o.name,
      description: o.description,
      mechanicId: o.mechanicId,
      standardId: gradeStandards[0]?.id || "",
      standardDescription: gradeStandards[0]?.description || "",
    }))
    return Response.json({ suggestions: fallback.slice(0, 3), allOptions: fallback })
  }
}
