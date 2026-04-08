// Pre-build step: ask Claude to describe the visual concept of the game
// in plain English using emojis. The student approves it (or asks for a
// different one) BEFORE we burn 8000 tokens on actual code generation.
//
// Returns: { concept: string }

import Anthropic from "@anthropic-ai/sdk"

export const maxDuration = 30

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: Request) {
  try {
    const { designDoc } = await req.json()

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 400,
      system: `You describe game visuals for kids in plain English. Be specific and use emoji to name every character, item, and obstacle. Keep it to 3-5 sentences. Sound exciting.`,
      messages: [{
        role: "user",
        content: `A student wants to build this game:
Title: ${designDoc.title}
Concept: ${designDoc.concept}
How it works: ${designDoc.howItWorks}
Rules: ${(designDoc.rules || []).join(". ")}
Win condition: ${designDoc.winCondition}
Math role: ${designDoc.mathRole}

Describe the visual concept of the game so the student can confirm it before we build it. Use emojis to name every visible element. Example format:

"You'll be a 🐉 dragon flying over a 🏰 castle, dragging 🪨 boulders into a 🕳️ pit. Each boulder shows a number — pick the ones that add up to the target on the 🎯 target on the right. Dodge the 🦅 hawks!"

Now do the same for THIS game. One paragraph. End with: "Ready to build?"`,
      }],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : ""
    return Response.json({ concept: text.trim() })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
