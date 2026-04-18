// Generate a complete HTML game using Gemini (primary) or Claude (fallback).
// Accepts a math standard, scenario, and builder type, returns self-contained HTML.

import { GoogleGenerativeAI } from "@google/generative-ai"
import { verifyAuth } from "@/lib/api-auth"

export const maxDuration = 60

const GAME_PROMPT = (standardId: string, scenario: string, builderType: string) => `
You are a game developer building an educational math game for young learners.

MATH STANDARD: ${standardId} — K.OA.A.1: Represent ADDITION with objects. ADDITION ONLY — do NOT include any subtraction rounds.

SCENARIO/THEME: ${scenario}
BUILDER TYPE: ${builderType}

Generate a COMPLETE, SELF-CONTAINED HTML file (single file, no external dependencies except Google Fonts) that is a playable math game.

REQUIREMENTS:
1. The game must have exactly 5 rounds of increasing difficulty, all testing ADDITION ONLY within 10. No subtraction. Every round is: here is group A, here is group B, how many total?
2. The math IS the gameplay — the learner must actually count, add, or subtract objects to progress. No shortcuts, no multiple-choice guessing. The learner interacts with visual objects to solve each problem.
3. Use the scenario "${scenario}" as the game's story and visual theme. Objects, characters, and narrative should match.
4. DARK THEME: Use a dark background (#09090b or similar very dark color). All text must be WHITE or very light (#e4e4e7 minimum). Never use grey text on dark backgrounds — everything must be high contrast and easy to read. Interactive objects should be bright and colorful (use vivid colors like #ef4444, #3b82f6, #10b981, #f59e0b) with subtle glow effects (box-shadow with color). Buttons should have visible borders or bright backgrounds. Clean layout, no arcade effects. The game should look polished and modern on a dark background.
5. Use the Lexend font from Google Fonts: <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap" rel="stylesheet">
6. Must work on mobile AND desktop: use BOTH click and touch events on every interactive element. Add event listeners with addEventListener('click') and addEventListener('touchstart') — do NOT rely on onclick attributes alone. All interactive elements must be at least 44px x 44px. Test that every button and clickable object actually responds. The game runs inside a sandboxed iframe with only allow-scripts — do NOT use any features that require allow-same-origin, allow-popups, or allow-forms.
7. Include this exact Content-Security-Policy meta tag in the <head>:
   <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src data: blob:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none';">
8. Track timing per round (time from round start to answer submission) and total session duration.
9. After each round completes, send a postMessage to the parent:
   window.parent.postMessage({ type: 'round_complete', round: { roundIndex: <0-based>, correct: <boolean>, learnerAnswer: <number>, correctAnswer: <number>, timeMs: <ms for this round>, attempts: <number of attempts>, kind: 'addition' or 'subtraction', problem: '<e.g. 3 + 4>' } }, '*');
10. When all 5 rounds are complete, send:
    window.parent.postMessage({ type: 'game_win', score: <number of rounds answered correctly on first attempt> }, '*');
11. All CSS must be inline in a <style> tag. All JS must be inline in a <script> tag. No external scripts or stylesheets (except the Google Fonts link).
12. The HTML must be valid and complete (<!DOCTYPE html> through </html>).

CRITICAL RULES — ADDITION MEANS COMBINING TWO GROUPS:
A0. Addition at K level means TWO SEPARATE GROUPS are shown, and the learner COMBINES them. NEVER show all objects in a single row or pile — that's just counting, not addition. Always visually separate the two groups (left side / right side, or two containers, or two areas) so the learner sees the two addends as distinct groups before combining.
A1. The learner may count ALL objects from 1 to find the total (this is "counting all" — a valid K-level strategy). But they must see the two groups separately first. Example: 3 adult elephants on the left, 6 baby elephants on the right. Learner taps each one to count, then picks the total.
A2. ADDITION ONLY for this standard. Do NOT include any subtraction, taking away, or removing. Every round is: two groups, combine, count total.
A3. Objects must visually match what the learner described. If they said elephants, show elephants — not chicks, not eggs, not random animals. Use simple CSS shapes (circles, rounded rectangles) with a text label underneath if you cannot draw the exact object. NEVER use an emoji or symbol that represents a DIFFERENT thing than what was described.

CRITICAL RULES — THE LEARNER DOES THE MATH, NOT THE SYSTEM:
13. NEVER display the answer, the total, a running count, or the sum anywhere on screen while the learner is working. No labels like "Total: 5", no counters that update as objects are added, no text showing the equation with the answer. The learner must COUNT the objects themselves.
14. NEVER show numbers ON the objects (no "3" on a group of dots). Show the OBJECTS only. The learner counts them.
15. NEVER show the equation (e.g., "3 + 2 = 5") UNTIL AFTER the learner has submitted the correct answer. The equation is a RECORDING of what they did, not a prompt.
16. When the learner answers wrong, do NOT reveal the correct answer. Just say "Not quite" and let them try again. Wrong answers shake — they do not fade, disappear, or get crossed out (that would narrow the options).
17. The learner must COMMIT to an answer before getting feedback. No hover previews, no live validation, no "getting warmer" hints.
18. Do NOT display "Round 1 of 5" or "3 correct" or any score counter during play. The learner focuses on the math, not on tracking progress.
19. Answer options MUST be generated dynamically for each round based on that round's correct answer. Show 5 options: the correct total plus 4 wrong numbers close to it (within +/- 2). The options must be DIFFERENT each round because the numbers in each round are different. NEVER hardcode the same set of answer options (like 3,4,5,6,7) for every round.

VISUAL QUALITY — MAKE IT LOOK LIKE AN EXPENSIVE GAME:
V1. Use CSS animations extensively: objects should bounce in when appearing, pulse when interactive, scale up on hover, glow when tapped. Every interaction needs visual feedback.
V2. Use CSS gradients on objects (not flat colors). Example: background: linear-gradient(135deg, #ef4444, #f87171) with box-shadow: 0 4px 16px rgba(239,68,68,0.4).
V3. Add a subtle particle or glow effect in the background. Use CSS-only animations (floating dots, pulsing circles, gradient shifts).
V4. Transitions between rounds should be smooth — fade out old content, fade in new content. Use CSS transition and animation properties.
V5. The success state should feel AMAZING — large animation, color burst, text that scales up with a spring effect.
V6. Wrong answer feedback should feel firm but not punishing — a quick shake animation, then reset smoothly.
V7. Objects should have a DEPTH feel: shadows, slight 3D transforms (translateZ, rotateX), layering.
V8. The overall feel should be: "this looks like it was made by a professional game studio, not a student project."

Return ONLY the HTML. No markdown fences, no explanation, no commentary. Just the raw HTML starting with <!DOCTYPE html>.
`

export async function POST(req: Request) {
  const user = await verifyAuth(req)
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  let body: { standardId?: string; scenario?: string; builderType?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { standardId = "K.OA.A.1", scenario = "a fun adventure", builderType = "explorer" } = body

  const prompt = GAME_PROMPT(standardId, scenario, builderType)
  const googleKey = process.env.GOOGLE_AI_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY

  // --- Try Gemini first (re-enabled for Sandpack which can handle React output) ---
  if (googleKey) {
    try {
      const genAI = new GoogleGenerativeAI(googleKey!)
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
      const result = await model.generateContent(prompt)
      const text = result.response.text()
      const html = extractHtml(text)
      if (html) {
        const warnings = scanForAnswerReveals(html!)
        if (warnings.length > 0) {
          console.warn("[generate-gemini] Answer-reveal warnings:", warnings)
        }
        return Response.json({ html, model: "gemini", warnings })
      }
      // If we got a response but couldn't extract HTML, fall through to Anthropic
      console.warn("[generate-gemini] Gemini returned non-HTML response, falling back to Anthropic")
    } catch (err) {
      console.error("[generate-gemini] Gemini call failed:", err)
      // Fall through to Anthropic
    }
  }

  // --- Fallback: Anthropic via fetch ---
  if (!anthropicKey) {
    return Response.json(
      { error: "No AI API key configured (GOOGLE_AI_KEY or ANTHROPIC_API_KEY)" },
      { status: 500 }
    )
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 16000,
        messages: [{ role: "user", content: prompt }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error("[generate-gemini] Anthropic fallback failed:", response.status, errText)
      return Response.json({ error: "AI generation failed" }, { status: 502 })
    }

    const data = await response.json()
    const text = data.content?.[0]?.type === "text" ? data.content[0].text : ""
    const html = extractHtml(text)
    if (!html) {
      return Response.json({ error: "AI returned invalid HTML" }, { status: 502 })
    }

    const warnings = scanForAnswerReveals(html)
    if (warnings.length > 0) {
      console.warn("[generate-gemini] Answer-reveal warnings:", warnings)
    }
    return Response.json({ html, model: "claude", warnings })
  } catch (err) {
    console.error("[generate-gemini] Anthropic fallback error:", err)
    return Response.json({ error: "AI generation failed" }, { status: 502 })
  }
}

/** Extract HTML from AI response, stripping markdown fences if present. */
function extractHtml(text: string): string | null {
  if (!text) return null

  let html = text.trim()

  // Strip markdown code fences if present
  if (html.startsWith("```")) {
    const firstNewline = html.indexOf("\n")
    html = html.slice(firstNewline + 1)
    if (html.endsWith("```")) {
      html = html.slice(0, html.lastIndexOf("```"))
    }
    html = html.trim()
  }

  // Validate it looks like HTML
  if (!html.toLowerCase().startsWith("<!doctype html") && !html.toLowerCase().startsWith("<html")) {
    return null
  }

  return html
}

/** Scan generated HTML for patterns that reveal the answer to the learner. */
function scanForAnswerReveals(html: string): string[] {
  const warnings: string[] = []
  const lower = html.toLowerCase()

  // Running totals / score counters visible during play
  if (/total\s*[:=]\s*<?\s*(span|div|p)/i.test(html)) {
    warnings.push("Possible running total display found")
  }
  if (/score\s*[:=]|correct\s*[:=]|count\s*[:=]/i.test(html) && /innertext|textcontent|innerhtml/i.test(html)) {
    warnings.push("Score/count updated in DOM during play")
  }

  // Numbers displayed on objects
  if (/>\s*\d+\s*<\/(?:span|div|button)/i.test(html) && /object|item|dot|circle|counter/i.test(lower)) {
    // Only flag if objects also have numbers inside them — common false positive
  }

  // Equation shown before answer
  if (/\d+\s*[\+\-]\s*\d+\s*=\s*\d+/.test(html)) {
    // Check if it's inside a template literal or JS string (ok) vs visible HTML (not ok)
    const visibleEquations = html.match(/<(?:p|span|div|h\d)[^>]*>[^<]*\d+\s*[\+\-]\s*\d+\s*=\s*\d+[^<]*</g)
    if (visibleEquations && visibleEquations.length > 0) {
      warnings.push("Equation with answer may be visible in HTML: " + visibleEquations[0].slice(0, 60))
    }
  }

  // "Round X of Y" or progress counters
  if (/round\s*\d+\s*(of|\/)\s*\d+/i.test(html)) {
    warnings.push("Round counter visible during play")
  }

  return warnings
}
