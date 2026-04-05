import { GoogleGenAI } from "@google/genai"

export const maxDuration = 60

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export async function POST(req: Request) {
  const { currentHtml, message, designDoc, chatHistory } = await req.json()

  const historyText = (chatHistory as { role: string; text: string }[])
    .map((m) => `${m.role}: ${m.text}`)
    .join("\n")

  // Detect if this is a question vs a change request
  const isQuestion = /^(what|why|how|can you explain|does|is|are|tell me|what is|what does|help me understand)/i.test(message.trim())

  if (isQuestion) {
    // Answer the question without modifying the game
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a helpful math and game design tutor. A student is building a game about "${designDoc.concept}" and asked you a question.

Do NOT give away the answer to the current round of the game. Instead, explain the concept or mechanics clearly so they understand it better and can figure it out themselves.

Game: ${designDoc.title}
Math concept: ${designDoc.concept}

Student's question: "${message}"

Respond in 2-4 sentences. Be clear, warm, and age-appropriate.`,
    })
    return Response.json({ reply: response.text?.trim() || "Great question! Think about how the math concept works in the game and try again." })
  }

  // Game change request
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `You are a game refinement assistant. A student built a browser game and wants to improve it.

Previous conversation:
${historyText}

Current game HTML:
${currentHtml}

Original design:
- Title: ${designDoc.title}
- Math concept: ${designDoc.concept}
- How it works: ${designDoc.howItWorks}

Student's request: "${message}"

CRITICAL RULES — never break these:
1. The math concept (${designDoc.concept}) must remain essential — players must use it to make decisions or win.
2. The math must be applied realistically, not decoratively.
3. The game must remain understandable and playable by others.
4. The game must have a clear end (win/lose screen after completing rounds or reaching a goal).
5. Never use overflow:hidden on body or main container — the game must be scrollable.

If the request would break a rule, make the closest version that still follows them.

Output ONLY the complete updated HTML file. No markdown. No code fences. Start with <!DOCTYPE html>. All CSS and JS inline.`,
  })

  const html = response.text
  let cleanHtml = html || ""
  if (cleanHtml.startsWith("```")) {
    cleanHtml = cleanHtml.replace(/^```html?\n?/, "").replace(/\n?```$/, "")
  }

  return Response.json({ html: cleanHtml, reply: "Done! I updated the game. Take a look." })
}
