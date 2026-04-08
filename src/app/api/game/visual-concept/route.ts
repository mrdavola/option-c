// Pre-build step: ask Claude to summarise the visual concept of the game
// as 3-5 short bullets, each starting with a leading emoji. The student
// approves the bullets BEFORE we burn 8000 tokens on actual code generation.
//
// Returns: { bullets: string[] }

import Anthropic from "@anthropic-ai/sdk"

export const maxDuration = 30

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: Request) {
  try {
    const { designDoc } = await req.json()

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 400,
      system: `You write game visuals for kids as a SHORT bullet list. Strict format:
- Output 3-5 bullets only
- Each bullet starts with a leading emoji that represents the main thing in that bullet
- Each bullet is max 10 words
- No headings, no intro, no outro, no "ready to build" — just the bullets
- Output one bullet per line, starting with the emoji, no leading dashes
- Cover: who you are, the main thing you do, the goal, any obstacles, and how the math fits in`,
      messages: [{
        role: "user",
        content: `A student wants to build this game:
Title: ${designDoc.title}
Concept: ${designDoc.concept}
How it works: ${designDoc.howItWorks}
Rules: ${(designDoc.rules || []).join(". ")}
Win condition: ${designDoc.winCondition}
Math role: ${designDoc.mathRole}

Write the visual concept as 3-5 short bullets. Example:

🐉 You're a dragon flying over a castle
🪨 Drag boulders into the pit on the ground
🔢 Pick boulders whose numbers add to the target
🦅 Dodge hawks that chase you
🏆 Hit the target 3 times to win`,
      }],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : ""
    // Parse: split on newlines, strip leading bullets/dashes, drop empties
    const bullets = text
      .split("\n")
      .map((l) => l.trim().replace(/^[-*•]\s*/, ""))
      .filter((l) => l.length > 0)
      .slice(0, 6)

    return Response.json({ bullets })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
