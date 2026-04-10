// Judge a learner-imported HTML game against the same 3 criteria the
// chat uses (Playable / Authentic math / Math is essential).
// Used by the HTML import flow before the game is allowed into the
// Workshop preview.
//
// Returns: { playable, authentic, essential, feedback }
// where `feedback` is a 1-2 sentence message that:
//   - if all 3 are met → congratulates and tells the learner to continue
//   - if any are missing → tells them exactly what's missing and how to fix it

import Anthropic from "@anthropic-ai/sdk"
import { sanitizeGameHtml, findSecurityIssues } from "@/lib/html-sanitizer"

export const maxDuration = 60

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: Request) {
  try {
    const { html, standardDescription, standardId } = await req.json()

    if (typeof html !== "string" || html.length < 50) {
      return Response.json(
        { error: "HTML is too short or missing." },
        { status: 400 }
      )
    }
    if (typeof standardDescription !== "string") {
      return Response.json(
        { error: "Missing standardDescription." },
        { status: 400 }
      )
    }

    // Check for security issues before judging
    const issues = findSecurityIssues(html)

    // Sanitize and truncate
    const sanitized = sanitizeGameHtml(html)
    const truncated = sanitized.length > 16000 ? sanitized.slice(0, 16000) + "\n\n<!-- ... truncated ... -->" : sanitized

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 600,
      system: `You are a math game design judge. A learner has pasted an HTML game and wants to use it to demonstrate this math concept:

"${standardDescription}"
(Standard ID: ${standardId})

Read the HTML carefully and judge whether the game meets ALL THREE criteria:

1. PLAYABLE: A reasonable person could open this HTML and figure out how to play it. There's a clear interaction (click, drag, type, key press), a clear goal, and a clear win/lose condition. NOT just a static page or a broken stub.

2. AUTHENTIC: The math concept is applied the way it's actually used in real life — not as decorative arithmetic, not as a vague "use numbers somewhere" gesture. The game must genuinely exercise the specific concept "${standardDescription}".

3. ESSENTIAL: The math is REQUIRED to win. The player must compute, decide, optimize, or reason mathematically — they can't just click randomly and win. If you can win without doing the math, this criterion fails.

🚨 STRICT RULES:
- Judge ONLY from what's in the HTML. Don't assume features that aren't there.
- A criterion is FALSE unless you can point to specific code that proves it's met.
- If the math concept doesn't match the standard's grade level (e.g. the standard is about counting to 100 but the game does multiplication), authentic is FALSE.
- If the game doesn't post game_win/game_lose messages OR has no detectable win condition, playable is FALSE.
- Be honest. The learner needs accurate feedback to fix it.

You MUST respond with a JSON object in this exact format and nothing else:
{
  "playable": true|false,
  "authentic": true|false,
  "essential": true|false,
  "feedback": "1-2 sentence message — if all true, congratulate and tell them to click Continue. If any false, tell them exactly what's missing and one concrete way to fix it."
}`,
      messages: [{
        role: "user",
        content: `Here is the HTML the learner pasted:\n\n\`\`\`html\n${truncated}\n\`\`\``,
      }],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : ""
    // Parse the JSON. Be defensive — strip code fences if Claude added them.
    let cleaned = text.trim()
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim()
    }
    let parsed: { playable?: boolean; authentic?: boolean; essential?: boolean; feedback?: string }
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      return Response.json(
        { error: "Couldn't read the AI's response. Try again.", raw: text },
        { status: 500 }
      )
    }

    return Response.json({
      playable: !!parsed.playable,
      authentic: !!parsed.authentic,
      essential: !!parsed.essential,
      feedback: typeof parsed.feedback === "string" ? parsed.feedback : "",
    })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
