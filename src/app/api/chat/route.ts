import { convertToModelMessages, streamText, UIMessage } from "ai"
import { z } from "zod"

export const maxDuration = 30

export async function POST(req: Request) {
  const {
    messages,
    standardDescription,
  }: { messages: UIMessage[]; standardDescription: string } = await req.json()

  const result = streamText({
    model: "anthropic/claude-sonnet-4.5",
    system: `You are a game design mentor evaluating whether a student's game idea meaningfully applies this math concept: "${standardDescription}"

CRITERIA (evaluate each independently):
1. Playable: Can others understand and play it?
2. Authentic math: Is the concept applied as it would be in real life?
3. Math is essential: Does math help the player decide, optimize, or win?

RULES:
- Keep responses to 1-2 sentences. Be direct.
- Don't ask Socratic questions. Give specific, actionable feedback.
- If an idea meets a criterion, say so explicitly.
- If it doesn't, tell them exactly what's missing and suggest one concrete fix.
- After 5 exchanges, make a final pass/fail decision with clear reasoning.
- Be encouraging but honest.
- Match your language to the student's writing level. If they write simply, respond simply. If they use advanced vocabulary, you can too.
- Use exclamation marks sparingly — at most one per response. Be warm and encouraging but calm, not over-the-top enthusiastic.
- When all 3 criteria are met, congratulate the student calmly and tell them they can launch their game when ready. Do NOT end the conversation — let them keep refining if they want.

After EVERY response, you MUST call the evaluate_criteria tool to report which criteria are currently met.`,
    messages: await convertToModelMessages(messages),
    tools: {
      evaluate_criteria: {
        description:
          "Evaluate which criteria the student's game idea currently meets. Call this after every response.",
        inputSchema: z.object({
          playable: z
            .boolean()
            .describe("Can others understand and play the game?"),
          authentic: z
            .boolean()
            .describe(
              "Is the math concept applied as it would be in real life?"
            ),
          essential: z
            .boolean()
            .describe("Does math help the player decide, optimize, or win?"),
        }),
        execute: async (criteria: {
          playable: boolean
          authentic: boolean
          essential: boolean
        }) => {
          return {
            criteria,
            allMet:
              criteria.playable && criteria.authentic && criteria.essential,
          }
        },
      },
    },
  })

  return result.toUIMessageStreamResponse()
}
