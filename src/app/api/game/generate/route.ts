import Anthropic from "@anthropic-ai/sdk"

export const maxDuration = 60

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: Request) {
  try {
  const { designDoc, designChoices, visualConcept } = await req.json()

  const vibeInstructions = designChoices?.vibe ? `Visual theme: ${designChoices.vibe}.` : ""
  const colorInstructions = designChoices?.color ? `Color scheme: ${designChoices.color}.` : ""
  const characterInstructions = designChoices?.characters ? `Characters/style: ${designChoices.characters}.` : ""
  const visualConceptBlock = visualConcept
    ? `\n\nVISUAL CONCEPT (the student already approved this — match it):\n${visualConcept}\n`
    : ""

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 8000,
    system: `You generate complete, self-contained HTML files for playable browser games for kids.
Output ONLY the HTML. No markdown. No code fences. Start with <!DOCTYPE html>.

CRITICAL VISUAL RULES — read these twice:
- Every moving entity (player, enemy, item, obstacle) MUST be a recognizable real thing.
- NEVER use a plain colored circle or rectangle as a character or item. Forbidden.
- Use big emoji as game characters: 🐉 dragon, 🪨 boulder, 🏰 castle, 🦊 fox, 🌲 tree, 🐱 cat, 🐶 dog, ⚔️ sword, 🛡️ shield, 🍎 apple, 🐟 fish, 🐝 bee, 🪐 planet, ⭐ star, 🔥 fire, 💧 water, 🎈 balloon, 🚀 rocket, 🍕 pizza, 🎯 target, etc.
- Render emoji at LARGE font sizes (60px+ for main characters, 40px+ for items).
- Use CSS transforms (translate, rotate, scale) to animate them — don't just have them sit still.
- The background can be a gradient, simple shapes, or another emoji scene.
- Score and HUD text are exempt from the no-primitives rule (use plain text/numbers).

CRITICAL GAMEPLAY RULES:
- The math concept must be ESSENTIAL — the player cannot win without using it.
- Every round must use different numbers so memorizing doesn't work.
- The game must end after 3-5 rounds with a clear win/lose screen.
- Use mouse/touch input. Include keyboard as a bonus.
- Include a brief 1-sentence "how to play" before the game starts.
- When the player loses, post a message via window.parent.postMessage({type:'game_lose'}, '*').
- When the player wins a round, post a message via window.parent.postMessage({type:'game_win'}, '*').`,
    messages: [{
      role: "user",
      content: `Generate a complete, self-contained HTML file for a playable browser game.

GAME DESIGN:
- Title: ${designDoc.title}
- Concept: ${designDoc.concept}
- How it works: ${designDoc.howItWorks}
- Rules: ${(designDoc.rules || []).join(". ")}
- Win condition: ${designDoc.winCondition}
- Math role: ${designDoc.mathRole}
${vibeInstructions}
${colorInstructions}
${characterInstructions}${visualConceptBlock}

REQUIREMENTS:
- All CSS and JavaScript must be inline (in <style> and <script> tags).
- Use a dark background (#0f1117 or a themed gradient) with light text (#e4e4e7).
- Make it visually appealing with motion, colors, particles, glow effects.
- Responsive — works on desktop and mobile.
- NEVER use overflow:hidden on the body. Game must be scrollable if needed.
- Maximum 500 lines of code. Polished, not bloated.

REMEMBER: every character/item is a recognizable EMOJI rendered LARGE, never a plain shape. If the design says "dragon," use 🐉 — do not draw a circle and call it a dragon.`,
    }],
  })

  const text = message.content[0].type === "text" ? message.content[0].text : ""

  if (!text || (!text.includes("<!DOCTYPE html>") && !text.includes("<html"))) {
    return Response.json({ error: "Failed to generate game" }, { status: 500 })
  }

  let cleanHtml = text
  if (cleanHtml.startsWith("```")) {
    cleanHtml = cleanHtml.replace(/^```html?\n?/, "").replace(/\n?```$/, "")
  }

  return Response.json({ html: cleanHtml })
  } catch (error) {
    console.error("Generate API error:", error)
    return Response.json(
      { error: "Failed to generate game. Please try again." },
      { status: 500 }
    )
  }
}
