import { generateText } from "ai"

export const maxDuration = 45

export async function POST(req: Request) {
  const { description, grade, interests } = await req.json() as {
    description: string
    grade: string
    interests?: string[]
  }

  const interestContext = interests && interests.length > 0
    ? `The student likes: ${interests.join(", ")}. Make at least one mechanic relate to their interests.`
    : ""

  const { text } = await generateText({
    model: "anthropic/claude-sonnet-4.5",
    system: `You create exactly 3 small SVG animations showing a stick figure demonstrating different game mechanics that use a specific math concept.

${interestContext}

Output EXACTLY a JSON array of 3 objects, no markdown, no code fences:
[{"title":"short name","svg":"<svg>...</svg>"},{"title":"...","svg":"..."},{"title":"...","svg":"..."}]

SVG RULES:
- Each SVG must be exactly 180x120 with viewBox="0 0 180 120"
- Dark background: fill="#18181b" on a rect covering the full area
- Use stick figures: circle head (r=6), line body, line arms, line legs
- Stroke color: #e4e4e7 for figures, #60a5fa for math elements, #f59e0b for highlights
- stroke-width: 2 for figures, 1.5 for details
- Include a simple CSS animation using @keyframes in a <style> tag within EACH SVG
- Animations should show the game mechanic in action (e.g., a stick figure throwing, measuring, sorting, building)
- Add 1-2 word labels in text elements (font-size="8", fill="#a1a1aa")
- Keep it VERY simple: 4-8 elements per SVG max
- Each mechanic should be a DIFFERENT type (e.g., one physical game, one card/board game, one building game)
- The math concept should be visually obvious in the animation
- Target audience: ${grade === "K" ? "kindergarten" : `grade ${grade}`}`,
    prompt: `Create 3 stick-figure SVG animations showing different game mechanics that use this math concept: "${description}"`,
  })

  try {
    const cleaned = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim()
    const parsed = JSON.parse(cleaned)
    if (Array.isArray(parsed) && parsed.length >= 1) {
      // Validate each SVG
      const valid = parsed
        .filter((item: any) => item.svg && item.svg.includes("<svg") && item.title)
        .slice(0, 3)
      return Response.json({ mechanics: valid })
    }
    throw new Error("Invalid format")
  } catch {
    return Response.json({ mechanics: [] })
  }
}
