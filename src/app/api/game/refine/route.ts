import { GoogleGenAI } from "@google/genai"

export const maxDuration = 60

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export async function POST(req: Request) {
  const { currentHtml, feedback, designDoc } = await req.json()

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Here is an existing HTML game:

${currentHtml}

The student who designed this game wants the following changes:
"${feedback}"

Original game design:
- Title: ${designDoc.title}
- Math concept: ${designDoc.concept}
- How it works: ${designDoc.howItWorks}

Please generate an updated complete HTML file incorporating the requested changes.
Output ONLY the complete HTML file. No markdown. No code fences. Start with <!DOCTYPE html>.
Keep all existing functionality that wasn't mentioned in the feedback.
All CSS and JavaScript must remain inline.`,
  })

  const html = response.text
  let cleanHtml = html || ""
  if (cleanHtml.startsWith("```")) {
    cleanHtml = cleanHtml.replace(/^```html?\n?/, "").replace(/\n?```$/, "")
  }

  return Response.json({ html: cleanHtml })
}
