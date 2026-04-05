import Anthropic from "@anthropic-ai/sdk"

export const maxDuration = 60

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: Request) {
  try {
    const { currentHtml, message, designDoc, chatHistory } = await req.json()

    const historyText = (chatHistory as { role: string; text: string }[])
      .map((m) => `${m.role}: ${m.text}`)
      .join("\n")

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 8000,
      system: "You are a game refinement assistant. Output ONLY the complete HTML file. No markdown. No code fences. Start with <!DOCTYPE html>.",
      messages: [{
        role: "user",
        content: `A student built a browser game and wants to improve it.

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
      }],
    })

    const text = response.content[0].type === "text" ? response.content[0].text : ""

    let cleanHtml = text
    if (cleanHtml.startsWith("```")) {
      cleanHtml = cleanHtml.replace(/^```html?\n?/, "").replace(/\n?```$/, "")
    }

    return Response.json({ html: cleanHtml })
  } catch (error) {
    console.error("Chat API error:", error)
    return Response.json(
      { error: "Failed to refine game. Please try again." },
      { status: 500 }
    )
  }
}
