import Anthropic from "@anthropic-ai/sdk"
import { getAdminDb } from "@/lib/firebase-admin"

export const maxDuration = 30

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: Request) {
  const { concept } = await req.json() as { concept: string }

  // Check cache first
  const cacheKey = concept.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 100)
  try {
    const adminDb = getAdminDb()
    const cached = await adminDb.collection("hintCards").doc(cacheKey).get()
    if (cached.exists) {
      return Response.json(cached.data())
    }
  } catch {}

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: `You help students understand math after they lose a game. Give a short, encouraging worked example using DIFFERENT numbers than the game would have used. Keep it simple, warm, and brief.

Respond with ONLY a valid JSON object, no markdown, no code fences:
{"heading":"short heading like 'Here\\'s how it works'","problem":"one short example problem sentence","steps":["step 1","step 2","step 3"],"encouragement":"one short encouraging sentence to try again"}

Steps: 2-3 items max, each under 10 words. The heading must be under 6 words.`,
      messages: [{
        role: "user",
        content: `Math concept: ${concept}`,
      }],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : ""
    const start = text.indexOf("{")
    const end = text.lastIndexOf("}")
    if (start === -1 || end === -1) throw new Error("no JSON")
    const result = JSON.parse(text.slice(start, end + 1))

    // Cache for next time
    try {
      const adminDb = getAdminDb()
      await adminDb.collection("hintCards").doc(cacheKey).set(result)
    } catch {}

    return Response.json(result)
  } catch {
    return Response.json({
      heading: "Here's how it works",
      problem: `Let's look at ${concept} with fresh numbers.`,
      steps: ["Read the problem carefully.", "Apply the math concept.", "Check your answer."],
      encouragement: "You've got this — give it another shot!",
    })
  }
}
