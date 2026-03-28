import { generateText } from "ai"
import { z } from "zod"

export const maxDuration = 30

export async function POST(req: Request) {
  const { standardId, description, grade, readingLevel } = await req.json() as {
    standardId: string
    description: string
    grade: string
    readingLevel: "simpler" | "default" | "challenge"
  }

  const levelInstruction = {
    simpler: `Explain at a 2nd-grade reading level. Use very short sentences. Simple words only. Use "you" a lot. Give a concrete everyday example a young kid would understand.`,
    default: `Explain at a ${grade === "K" ? "kindergarten" : `grade ${grade}`} reading level. Use age-appropriate language. Be clear and direct. Give a relatable real-world example.`,
    challenge: `Explain at a level 2 grades above ${grade === "K" ? "kindergarten" : `grade ${grade}`}. Use precise math vocabulary. Connect to broader math concepts. Give a more complex real-world application.`,
  }[readingLevel]

  const { text } = await generateText({
    model: "anthropic/claude-sonnet-4.5",
    system: `You explain math concepts to students. ${levelInstruction}

Respond in EXACTLY this JSON format, no markdown, no code fences:
{"whatIsThis":"...","commonMistakes":"...","realWorldUse":"..."}

Each field should be 1-3 sentences. Be warm and encouraging. Never use the word "standard" — just explain the concept.`,
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
