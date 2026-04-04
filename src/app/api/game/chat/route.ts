import { GoogleGenAI } from "@google/genai"

export const maxDuration = 60

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export async function POST(req: Request) {
  const { currentHtml, message, designDoc, chatHistory } = await req.json()

  const historyText = (chatHistory as { role: string; text: string }[])
    .map((m) => `${m.role}: ${m.text}`)
    .join("\n")

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `You are a game refinement assistant. A student built a browser game and wants to improve it.

Previous refinement conversation:
${historyText}

Current game HTML:
${currentHtml}

Original design:
- Title: ${designDoc.title}
- Math concept: ${designDoc.concept}
- How it works: ${designDoc.howItWorks}

Student's latest request: "${message}"

Generate an updated complete HTML file incorporating the requested changes.
Output ONLY the complete HTML file. No markdown. No code fences. Start with <!DOCTYPE html>.
Keep all existing functionality that wasn't mentioned in the request.
All CSS and JavaScript must remain inline.`,
  })

  const html = response.text
  let cleanHtml = html || ""
  if (cleanHtml.startsWith("```")) {
    cleanHtml = cleanHtml.replace(/^```html?\n?/, "").replace(/\n?```$/, "")
  }

  return Response.json({ html: cleanHtml })
}
