// Enhances a game card slot after the learner makes a pick.
// Takes the current picks + mechanic and returns:
//   - enhanced: the picked value rewritten to match theme/character
//   - nextOptions: 3 themed options for the next slot
//   - summary: progressive game description sentence

import Anthropic from "@anthropic-ai/sdk"

export const maxDuration = 15

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

interface EnhanceRequest {
  mechanic: string        // e.g. "Build & Measure — area and volume"
  mathSkill: string       // the standard description
  slot: "theme" | "character" | "action" | "win"
  picked: string          // what the learner just picked
  theme?: string          // current theme (if already picked)
  character?: string      // current character (if already picked)
  action?: string         // current action (if already picked)
}

export async function POST(req: Request) {
  const body = await req.json() as EnhanceRequest

  const currentState = [
    body.theme ? `Theme: ${body.theme}` : null,
    body.character ? `Character: ${body.character}` : null,
    body.action ? `Action: ${body.action}` : null,
    body.slot === "win" ? `Win: ${body.picked}` : null,
  ].filter(Boolean).join("\n")

  // Determine what the next slot is
  const nextSlot = body.slot === "theme" ? "character"
    : body.slot === "character" ? "action"
    : body.slot === "action" ? "win"
    : null

  const nextSlotPrompt = nextSlot ? `
Also generate 3 options for the NEXT slot (${nextSlot}). MAX 6 WORDS EACH:
${nextSlot === "character" ? "3 characters for this world. Short names only (2-4 words). Example: 'ghost hunter', 'lava diver', 'ice wizard'" :
  nextSlot === "action" ? "3 player actions for this math mechanic + theme. Max 6 words each. Example: 'stack blocks to match height', 'drag tiles to fill shape'" :
  nextSlot === "win" ? "3 win conditions with round count or timer. Max 8 words each. Example: 'complete 5 rounds before time runs out', 'score 100 with zero mistakes'" : ""}
` : ""

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: `You enhance game card slots for a kids' math game builder. Keep ALL text SHORT and SIMPLE — these are for 8-14 year olds. Every response must be valid JSON, no markdown.

STRICT LENGTH RULES:
- "enhanced": max 8 words. Keep it punchy.
- "nextOptions": each option max 6 words. Simple, fun, easy to read.
- "summary": max 20 words. Plain English a kid can understand.
- NO jargon, NO dashes, NO semicolons. Short words only.`,
      messages: [{
        role: "user",
        content: `Math mechanic: ${body.mechanic}
Math skill: ${body.mathSkill}

Current card state:
${currentState || "(empty)"}

The learner just picked "${body.picked}" for the ${body.slot} slot.

Return JSON:
{
  "enhanced": "picked value with theme flavor, MAX 8 WORDS",
  "summary": "You are a [character] in a [theme]. You [action] to [win]. MAX 20 WORDS. Only include what's been picked so far.",
  ${nextSlot ? `"nextOptions": ["short option 1", "short option 2", "short option 3"]` : `"nextOptions": []`}
}
${nextSlotPrompt}

REMEMBER: Keep every option under 6 words. Kids need to read these fast.`,
      }],
    })

    const text = response.content[0].type === "text" ? response.content[0].text : ""
    const cleaned = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim()
    const start = cleaned.indexOf("{")
    const end = cleaned.lastIndexOf("}")
    if (start === -1 || end === -1) {
      return Response.json({ enhanced: body.picked, summary: "", nextOptions: [] })
    }
    const parsed = JSON.parse(cleaned.slice(start, end + 1))
    return Response.json({
      enhanced: parsed.enhanced || body.picked,
      summary: parsed.summary || "",
      nextOptions: Array.isArray(parsed.nextOptions) ? parsed.nextOptions.slice(0, 3) : [],
    })
  } catch {
    return Response.json({ enhanced: body.picked, summary: "", nextOptions: [] })
  }
}
