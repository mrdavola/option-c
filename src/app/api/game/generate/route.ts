import { GoogleGenAI } from "@google/genai"

export const maxDuration = 60

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export async function POST(req: Request) {
  const { designDoc, designChoices } = await req.json()

  const vibeInstructions = designChoices?.vibe
    ? `Visual theme: ${designChoices.vibe}.`
    : ""
  const colorInstructions = designChoices?.color
    ? `Color scheme: ${designChoices.color}.`
    : ""
  const characterInstructions = designChoices?.characters
    ? `Characters/style: ${designChoices.characters}.`
    : ""

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Generate a complete, self-contained HTML file for a playable browser game.

GAME DESIGN:
- Title: ${designDoc.title}
- Concept: ${designDoc.concept}
- How it works: ${designDoc.howItWorks}
- Rules: ${designDoc.rules.join(". ")}
- Win condition: ${designDoc.winCondition}
- Math role: ${designDoc.mathRole}
${vibeInstructions}
${colorInstructions}
${characterInstructions}

REQUIREMENTS:
- Output ONLY a complete HTML file. No markdown. No code fences. Start with <!DOCTYPE html>.
- All CSS and JavaScript must be inline (in <style> and <script> tags).
- The game must be fully playable with mouse/touch input.
- Use a dark background (#18181b) with light text (#e4e4e7).
- Make it visually appealing with colors, animations, and clear UI.
- Include a title screen, gameplay, and a win/lose state.
- The math concept must be essential to gameplay — not decorative.
- Target audience: elementary/middle school students. Keep it simple and fun.
- The game should work on both desktop and mobile (responsive).
- Include clear instructions on how to play.
- Maximum 500 lines of code. Keep it simple.`,
  })

  const html = response.text
  if (!html || (!html.includes("<!DOCTYPE html>") && !html.includes("<html"))) {
    return Response.json({ error: "Failed to generate game" }, { status: 500 })
  }

  // Clean up any markdown wrappers
  let cleanHtml = html
  if (cleanHtml.startsWith("```")) {
    cleanHtml = cleanHtml.replace(/^```html?\n?/, "").replace(/\n?```$/, "")
  }

  return Response.json({ html: cleanHtml })
}
