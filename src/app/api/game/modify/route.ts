// Modify an existing game's HTML based on a natural language request.
// Used by the Vibe Coder toolbar — learner clicks "Add celebration" or
// types "make the elephants bigger" and this endpoint rewrites the code.

import { verifyAuth } from "@/lib/api-auth"

export const maxDuration = 60

const MODIFY_PROMPT = (currentHtml: string, modification: string, standardId: string) => `
You are modifying an existing HTML math game. The game is for standard ${standardId} (K.OA.A.1: represent addition with objects within 10).

HERE IS THE CURRENT GAME HTML:
\`\`\`html
${currentHtml}
\`\`\`

REQUESTED MODIFICATION: ${modification}

RULES:
1. Apply the requested modification to the game.
2. Return the COMPLETE modified HTML file — not just the changed parts.
3. Keep ALL existing game logic, rounds, and math mechanics intact. Do NOT break the game.
4. Keep the dark theme (#09090b background, white/light text, bright colored objects).
5. NEVER add running totals, score counters, or any text that reveals the answer during play.
6. NEVER show the equation before the learner answers.
7. The two separate groups of objects must remain visually distinct.
8. All interactive elements must have both click and touch event listeners.
9. Make the modification feel polished — good CSS transitions, satisfying animations.
10. Return ONLY the HTML. No explanation, no markdown fences.
`

export async function POST(req: Request) {
  const user = await verifyAuth(req)
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  let body: { currentHtml?: string; modification?: string; standardId?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { currentHtml, modification, standardId = "K.OA.A.1" } = body
  if (!currentHtml || !modification) {
    return Response.json({ error: "Missing currentHtml or modification" }, { status: 400 })
  }

  const prompt = MODIFY_PROMPT(currentHtml, modification, standardId)

  // Try Gemini first
  const googleKey = process.env.GOOGLE_AI_KEY
  if (googleKey) {
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai")
      const genAI = new GoogleGenerativeAI(googleKey)
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
      const result = await model.generateContent(prompt)
      const text = result.response.text()
      const html = extractHtml(text)
      if (html) return Response.json({ html, model: "gemini" })
    } catch (err) {
      console.error("[modify] Gemini failed:", err)
    }
  }

  // Fallback to Claude
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey) {
    return Response.json({ error: "No AI API key configured" }, { status: 500 })
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 16000,
        messages: [{ role: "user", content: prompt }],
      }),
    })

    if (!response.ok) {
      return Response.json({ error: "AI modification failed" }, { status: 502 })
    }

    const data = await response.json()
    const text = data.content?.[0]?.type === "text" ? data.content[0].text : ""
    const html = extractHtml(text)
    if (!html) {
      return Response.json({ error: "AI returned invalid HTML" }, { status: 502 })
    }
    return Response.json({ html, model: "claude" })
  } catch {
    return Response.json({ error: "AI modification failed" }, { status: 502 })
  }
}

function extractHtml(text: string): string | null {
  if (!text) return null
  let html = text.trim()
  if (html.startsWith("```")) {
    const firstNewline = html.indexOf("\n")
    html = html.slice(firstNewline + 1)
    if (html.endsWith("```")) {
      html = html.slice(0, html.lastIndexOf("```"))
    }
    html = html.trim()
  }
  if (!html.toLowerCase().startsWith("<!doctype html") && !html.toLowerCase().startsWith("<html")) {
    return null
  }
  return html
}
