import { generateText } from "ai"

export const maxDuration = 60

export async function POST(req: Request) {
  const { currentHtml, feedback, designDoc } = await req.json()

  const { text } = await generateText({
    model: "anthropic/claude-sonnet-4.5",
    system: `You modify existing HTML games based on student feedback. Output ONLY the complete updated HTML file. No markdown. No code fences. Start with <!DOCTYPE html>.`,
    prompt: `Here is an existing HTML game:

${currentHtml}

The student who designed this game wants the following changes:
"${feedback}"

Original game design:
- Title: ${designDoc?.title || "Math Game"}
- Math concept: ${designDoc?.concept || "math"}
- How it works: ${designDoc?.howItWorks || ""}

Generate the updated complete HTML file incorporating the requested changes.
Keep all existing functionality that wasn't mentioned in the feedback.
All CSS and JavaScript must remain inline.`,
  })

  let cleanHtml = text || ""
  if (cleanHtml.startsWith("```")) {
    cleanHtml = cleanHtml.replace(/^```html?\n?/, "").replace(/\n?```$/, "")
  }

  return Response.json({ html: cleanHtml })
}
