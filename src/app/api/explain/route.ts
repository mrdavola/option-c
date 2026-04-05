import { generateText } from "ai"
import { z } from "zod"

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
    simpler: `Explain at a 2nd-grade reading level. Use very short sentences. Simple words only. Use "you" a lot. Give a concrete everyday example a young kid would understand.`,
    default: `Explain at a ${grade === "K" ? "kindergarten" : `grade ${grade}`} reading level. Use age-appropriate language. Be clear and direct. ${interestPhrase ? `The student is into ${interests!.join(", ")} — weave their interests into EVERY example naturally.` : "Give a relatable real-world example."}`,
    challenge: `Explain at a ${grade === "K" ? "kindergarten" : `grade ${grade}`} reading level. ${interestPhrase} Make EVERY example and explanation connect directly to their interests. Make it feel personal — like this concept was made for them.`,
  }[readingLevel]

  const { text } = await generateText({
    model: "anthropic/claude-sonnet-4.5",
    system: `You explain math concepts to students. ${levelInstruction}

Respond in EXACTLY this JSON format, no markdown, no code fences:
{"whatIsThis":"...","commonMistakes":"...","realWorldUse":"...","formula":"..."}

Rules:
- "whatIsThis": 1-3 sentences explaining the concept clearly.
- "commonMistakes": 2-4 bullet points of common mistakes, each starting with "• ". No paragraph text.
- "realWorldUse": 1-2 sentences showing where this math appears in real life. If the student has interests, tie it to those.
- "formula": If this concept has a specific formula (e.g. Area = l × w, a² + b² = c²), write it here. Use plain text math notation. If there is no specific formula for this concept, return an empty string "".
Be warm and calm. Never use the word "standard". At most one exclamation mark per response.`,
    prompt: `Explain this math concept: "${description}" (Standard ${standardId}, Grade ${grade})`,
  })

  // Parse the JSON response
  try {
    const cleaned = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim()
    const parsed = JSON.parse(cleaned)
    return Response.json(parsed)
  } catch {
    // Fallback if JSON parsing fails
    return Response.json({
      whatIsThis: description,
      commonMistakes: "Watch out for rushing — take your time to understand each part.",
      realWorldUse: "You'll use this concept in real life more than you think!",
    })
  }
}
