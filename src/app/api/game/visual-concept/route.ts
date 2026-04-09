// Pre-build step: ask Claude to fill in a STANDARDIZED game card
// before we burn ~10k tokens on actual HTML generation. The student
// approves the card BEFORE we generate.
//
// Old behavior: returned 3-5 free-form bullets, each with a random
// emoji. Visually noisy and inconsistent across games.
//
// New behavior: returns a fixed structure with 5 named fields. The
// UI renders the same labels and icons every time. The result feels
// like a consistent "Game Card" template, not a random pile of
// bullets.
//
// Returns: { gameCard: {playAs, goal, action, mathRole, watchOut}, bullets: string[] }
//
// `bullets` is the legacy free-form list (kept for backward compat
// with anything that still consumes it — currently the build prompt's
// visual concept block). The UI uses `gameCard` for rendering.

import Anthropic from "@anthropic-ai/sdk"

export const maxDuration = 30

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

interface GameCard {
  playAs: string     // who the player is
  goal: string       // win condition in plain language
  action: string     // core verb / what you do
  mathRole: string   // how the math is essential
  watchOut: string   // obstacles / losing conditions
}

function fallbackCard(designDoc: { title?: string; concept?: string; howItWorks?: string; mathRole?: string }): GameCard {
  return {
    playAs: "the main character of your game",
    goal: "win all rounds without losing",
    action: designDoc.howItWorks || "play the game and use the math",
    mathRole: designDoc.mathRole || "the math you've been learning",
    watchOut: "running out of time or making the wrong move",
  }
}

export async function POST(req: Request) {
  try {
    const { designDoc } = await req.json()

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 600,
      system: `You fill in a structured Game Card for a kid's math game. The card has 5 named fields. Each field gets ONE short phrase (max 12 words). No emojis. No prefixes. No labels in your answer — just the values.

Output JSON ONLY, no markdown, no code fences. Format:

{
  "playAs": "<who the player is — short noun phrase, max 8 words>",
  "goal": "<the win condition in one sentence, max 12 words>",
  "action": "<what the player physically does on screen, starts with a verb, max 12 words>",
  "mathRole": "<how the math is the REASON to act, max 12 words>",
  "watchOut": "<one obstacle or losing condition, max 10 words>"
}

Rules for each field:
- playAs: a vivid noun describing the role. "A dragon flying over a castle" not "the player".
- goal: concrete and achievable. "Hit the target 3 times to win" not "win the game".
- action: starts with a verb. "Drag boulders into a pit" not "the player drags boulders".
- mathRole: explains how the math is essential to winning. "Pick boulders whose numbers add to the target" not "uses addition".
- watchOut: one specific challenge. "Hawks steal boulders if you don't dodge" not "be careful".`,
      messages: [{
        role: "user",
        content: `Fill in the Game Card for this game:
Title: ${designDoc.title}
Concept: ${designDoc.concept}
How it works: ${designDoc.howItWorks}
Rules: ${(designDoc.rules || []).join(". ")}
Win condition: ${designDoc.winCondition}
Math role: ${designDoc.mathRole}

Return JSON only.`,
      }],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : ""
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    const start = cleaned.indexOf("{")
    const end = cleaned.lastIndexOf("}")
    if (start === -1 || end === -1) {
      const card = fallbackCard(designDoc)
      return Response.json({ gameCard: card, bullets: cardToBullets(card) })
    }

    let card: GameCard
    try {
      const parsed = JSON.parse(cleaned.slice(start, end + 1)) as Partial<GameCard>
      card = {
        playAs: parsed.playAs || fallbackCard(designDoc).playAs,
        goal: parsed.goal || fallbackCard(designDoc).goal,
        action: parsed.action || fallbackCard(designDoc).action,
        mathRole: parsed.mathRole || fallbackCard(designDoc).mathRole,
        watchOut: parsed.watchOut || fallbackCard(designDoc).watchOut,
      }
    } catch {
      card = fallbackCard(designDoc)
    }

    // Also return a `bullets` array for backward compat with the
    // generate route (which embeds the visual concept block in its
    // prompt). The bullets are derived from the card so the AI sees
    // the same content in both shapes.
    return Response.json({ gameCard: card, bullets: cardToBullets(card) })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}

// Converts the structured card to a flat bullet list. Used to feed
// the existing generate-route prompt which expects a `visualConcept`
// string. We label each line so the generator still has all the info.
function cardToBullets(card: GameCard): string[] {
  return [
    `You play as: ${card.playAs}`,
    `Your goal: ${card.goal}`,
    `What you do: ${card.action}`,
    `How math fits: ${card.mathRole}`,
    `Watch out for: ${card.watchOut}`,
  ]
}
