// Returns 3 real-world uses of a math standard, one each for:
// fun, career, practical. Used by the Mechanic Skeleton celebration screen
// (src/components/standard/mechanic-skeleton.tsx).
//
// If the LLM call fails, returns a generic three-bullet fallback so the UI
// never blocks. Phase 2: replace AI call with a hardcoded per-standard map.

import Anthropic from "@anthropic-ai/sdk"

export const maxDuration = 20

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

interface RealWorldUsesResponse {
  fun: string
  career: string
  practical: string
}

function fallback(description: string): RealWorldUsesResponse {
  return {
    fun: `You can use ${description.toLowerCase()} in games and puzzles you play with friends.`,
    career: `People like engineers, chefs, and designers use this kind of math every day at work.`,
    practical: `It shows up when you budget money, cook, or plan trips in real life.`,
  }
}

export async function POST(req: Request) {
  const body = await req.json() as {
    standardId?: string
    standardDescription?: string
    grade?: string
  }
  const { standardId = "", standardDescription = "", grade = "" } = body

  if (!standardDescription) {
    return Response.json(fallback("this math"))
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 350,
      system: `You write 3 real-world uses of a specific math skill for a student. Tone: warm, concrete, kid-friendly. Each bullet is ONE sentence, max 20 words. Return ONLY valid JSON with keys "fun", "career", "practical" — no markdown, no extra text.

- "fun": a playful / hobby / game use (e.g. video games, sports, baking a cake)
- "career": a specific job that uses this skill (name the job)
- "practical": an everyday-life use (shopping, cooking, travel, home)

Do NOT use the word "standard". Do NOT reference grade levels. Speak directly to the student ("you").`,
      messages: [{
        role: "user",
        content: `Math skill: ${standardDescription}${standardId ? ` (${standardId})` : ""}${grade ? ` — grade ${grade}` : ""}

Return JSON: {"fun":"...","career":"...","practical":"..."}`,
      }],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : ""
    const cleaned = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim()
    const start = cleaned.indexOf("{")
    const end = cleaned.lastIndexOf("}")
    if (start === -1 || end === -1) return Response.json(fallback(standardDescription))

    const parsed = JSON.parse(cleaned.slice(start, end + 1)) as Partial<RealWorldUsesResponse>
    const result: RealWorldUsesResponse = {
      fun: typeof parsed.fun === "string" && parsed.fun.trim() ? parsed.fun.trim() : fallback(standardDescription).fun,
      career: typeof parsed.career === "string" && parsed.career.trim() ? parsed.career.trim() : fallback(standardDescription).career,
      practical: typeof parsed.practical === "string" && parsed.practical.trim() ? parsed.practical.trim() : fallback(standardDescription).practical,
    }
    return Response.json(result)
  } catch (err) {
    console.warn("[real-world-uses] LLM failed, using fallback:", err)
    return Response.json(fallback(standardDescription))
  }
}
