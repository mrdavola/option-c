import { generateText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const { standardId, description, grade, readingLevel, interests } = await req.json() as {
    standardId: string
    description: string
    grade: string
    readingLevel: "simpler" | "default" | "challenge"
    interests?: string[]
  }

  const interestPhrase = interests && interests.length > 0
    ? `The student is into: ${interests.join(", ")}.`
    : ""

  const levelInstruction = {
    simpler: `Explain at a 2nd-grade reading level. Use very short sentences. Simple words only. Use "you" a lot.`,
    default: `Explain at a ${grade === "K" ? "kindergarten" : `grade ${grade}`} reading level. Use age-appropriate language. Be clear and direct. ${interestPhrase ? `The student is into ${interests!.join(", ")} — weave their interests into every example naturally.` : "Give relatable real-world examples."}`,
    challenge: `Explain at a ${grade === "K" ? "kindergarten" : `grade ${grade}`} reading level. ${interestPhrase} Make EVERY example connect directly to their interests. Make it feel personal.`,
  }[readingLevel]

  try {
    const { text } = await generateText({
      model: "anthropic/claude-sonnet-4.5",
      system: `You explain math concepts to students. ${levelInstruction} Be warm and calm. Never use the word "standard". At most one exclamation mark total.

You MUST respond with ONLY a valid JSON object — no markdown, no code fences, no extra text before or after.
The JSON must have exactly these four keys:
- "whatIsThis": string — 2-3 sentences explaining the concept at the right reading level
- "commonMistakes": array of strings — 2-4 items, each a specific concrete mistake students make with THIS concept (one sentence each)
- "realWorldUse": string — 2-3 sentences showing where this math shows up in real life (tie to student interests if any)
- "formula": string — the key formula for this concept in plain text, or "" if none applies

Example of correct format:
{"whatIsThis":"Fractions show a part of a whole...","commonMistakes":["Students add the denominators instead of keeping them the same.","They forget to simplify at the end."],"realWorldUse":"You use fractions when splitting a pizza or measuring ingredients.","formula":"part/whole"}`,
      prompt: `Explain this math concept: "${description}" (Standard ${standardId}, Grade ${grade})`,
    })

    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    const start = cleaned.indexOf("{")
    const end = cleaned.lastIndexOf("}")
    if (start === -1 || end === -1) {
      console.error("[explain] No JSON in response:", cleaned.slice(0, 200))
      return fallback(description)
    }

    const parsed = JSON.parse(cleaned.slice(start, end + 1))
    if (typeof parsed.commonMistakes === "string") {
      parsed.commonMistakes = parsed.commonMistakes
        .split("|")
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0)
    }
    return Response.json(parsed)
  } catch (e) {
    console.error("[explain] Error:", e)
    return fallback(description)
  }
}

function fallback(description: string) {
  return Response.json({
    whatIsThis: description,
    commonMistakes: [
      "Rushing through the steps without checking each one.",
      "Mixing up this concept with a similar one.",
      "Forgetting to apply the rule consistently.",
    ],
    realWorldUse: "This math concept comes up in everyday situations like shopping, cooking, sports, and building things.",
    formula: "",
  })
}
