import { generateText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const { description, grade } = await req.json() as {
    description: string
    grade: string
  }

  const { text } = await generateText({
    model: "anthropic/claude-sonnet-4.5",
    system: `You create simple, charming SVG illustrations in a retro stick-figure style to explain math concepts to students.

RULES:
- Output ONLY valid SVG code. No markdown, no explanation, no code fences.
- The SVG must be exactly 400x250 pixels with viewBox="0 0 400 250".
- Use a hand-drawn/doodle style: stick figures, simple shapes, wobbly lines.
- Use a dark background color (#18181b) with light strokes (#e4e4e7) and accent colors (#60a5fa for blue, #f59e0b for amber, #22c55e for green, #fb7185 for pink).
- Include simple CSS animations where they help explain (e.g., an arrow moving, a shape splitting, a number counting up). Use @keyframes inside a <style> tag within the SVG.
- Add short text labels (1-3 words max) to clarify what's happening.
- The illustration should be immediately understandable by a ${grade === "K" ? "kindergarten" : `grade ${grade}`} student.
- Keep it SIMPLE. 3-5 elements max. Stick figures have circle heads, line bodies, line arms/legs.
- Make it fun and slightly silly — a stick figure reacting to the math concept.`,
    prompt: `Create a stick-figure SVG illustration showing this math concept: "${description}"`,
  })

  // Extract SVG from response (in case there's any wrapper text)
  const svgMatch = text.match(/<svg[\s\S]*<\/svg>/)
  if (svgMatch) {
    return new Response(svgMatch[0], {
      headers: { "Content-Type": "image/svg+xml" },
    })
  }

  return Response.json({ error: "Failed to generate illustration" }, { status: 500 })
}
