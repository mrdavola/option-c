import Anthropic from "@anthropic-ai/sdk"

export const maxDuration = 30

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

// POST /api/templates
//
// Generates 2-3 generic game-mechanic TEMPLATES for a math standard.
// A template describes the game shape in practical terms — what the
// player does with the math — WITHOUT prescribing a setting or theme.
// Each template now ALSO includes 3 chip menus that drive the
// chip-based chat flow:
//   - themeChips:     "what world should this happen in?"
//   - actionChips:    "what does the player physically do on screen?"
//   - winChips:       "how does the player know they won?"
//
// The first chip menu (themeChips) reuses the template's `examples`
// list — the kid sees the same examples in the template card AND in
// the chat, which is consistent and reassuring.
//
// All chips are generated in the SAME AI call as the templates so
// the options stay coherent across the template + the 3 chip menus.
//
// Request body:
//   { standardId, description, grade }
//
// Response:
//   { templates: [{title, description, examples, themeChips, actionChips, winChips}, ...] }

interface Template {
  title: string
  description: string
  examples: string[]
  themeChips?: string[]
  actionChips?: string[]
  winChips?: string[]
}

export async function POST(req: Request) {
  const { standardId, description, grade } = (await req.json()) as {
    standardId: string
    description: string
    grade: string
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: `You generate game-mechanic TEMPLATES for a math game builder app. A kid (grade ${grade}) is about to build a browser game that teaches a specific math concept. You give them 2-3 template options that describe the GAME SHAPE in practical terms, without prescribing a specific theme.

Each template is a generic player-action blueprint. The kid fills in what world it lives in — their imagination, not yours.

🧠 INTRINSIC INTEGRATION RULE (most important):
The math concept must BE the core player action, not a multiple-choice quiz. The player VERB must equal the math operation. If you can't find a verb where doing the math IS playing the game, start over.

❌ FORBIDDEN template patterns:
- "Answer questions about..."
- "Pick the right answer..."
- "Type the number..."
- Anything that's a quiz wearing a costume

✅ REQUIRED: pick the verb from this table that matches the math concept:

| Math concept           | Core player verb                              |
|------------------------|-----------------------------------------------|
| Number line / ordering | Dive/jump/fly to a position on a line         |
| Counting / cardinality | Collect a specific count of objects           |
| Place value            | Stack, load, pack into fixed containers       |
| Addition / subtraction | Combine or separate physical groups           |
| Multiplication / array | Build a rectangle of rows × columns           |
| Division / factoring   | Split an object into equal groups             |
| Fractions (cut)        | Cut, slice, share a whole into equal parts    |
| Fractions (equivalent) | Mix or stretch parts until two amounts match  |
| Ratio / proportion     | Mix, pour, balance two quantities             |
| Percent / scaling      | Resize, fill a meter to a target proportion   |
| Decimals               | Aim, launch with magnitude                    |
| Measurement length     | Stretch, drag, compare, fit shapes            |
| Money / time           | Spend, schedule, exchange tokens              |
| Geometry shapes        | Build, fold, rotate, fit shapes               |
| Shape composition      | Snap pieces together to match a target shape  |
| Coordinate plane       | Navigate, aim, defend by (x,y)                |
| Equations / algebra    | Move, balance tokens across a divide          |
| Patterns / functions   | Predict the next step, tune a transformer     |
| Statistics / data      | Sort, group, build a chart                    |
| Probability            | Bet, spin, weight outcomes                    |
| Negative numbers       | Climb above and below zero                    |

TEMPLATE FORMAT:
- "title": 2-4 words, generic, describes the VERB. NOT theme-specific.
- "description": 1-2 sentences, plain English, what the player DOES with the math. Starts with a verb. No specific settings or characters. Max 30 words.
- "examples": array of 3-4 short phrases showing different WORLDS this mechanic could live in. Mix realistic + fun + diverse domains. Each example 3-6 words.
- "themeChips": EXACTLY 4 chip strings the kid can click to pick a theme/world. THESE MUST BE THE SAME AS the "examples" array (just copy them — don't generate different ones). Reusing the examples keeps the kid's experience consistent: they see the same options on the template card AND when they start the chat. Each chip is a short noun phrase (3-6 words).
- "actionChips": EXACTLY 3 chip strings describing concrete on-screen actions the player could perform with this verb. Each chip is a short phrase starting with a verb (e.g. "Drag pieces from a tray", "Tap the right block in order", "Use arrow keys to aim and shoot"). They should be visibly DIFFERENT mechanically — not three variations of the same thing.
- "winChips": EXACTLY 3 chip strings describing how the player wins. Each chip is a short sentence starting with a noun or verb (e.g. "Build the shape exactly", "Beat the timer", "Score 10 points without missing"). They should describe DIFFERENT win conditions, not three flavors of the same one.

You MUST respond with ONLY a valid JSON object — no markdown, no code fences. The JSON has exactly one key "templates" — an array of 2-3 objects.

Example for K.G.B.5 (Kindergarten — Model shapes in the world by building shapes from components):
{"templates":[
  {
    "title":"Build a Structure",
    "description":"Snap together sticks and corner pieces to build the exact shape shown on the screen.",
    "examples":["build a house","build a rocket","sculpt a trophy","make a robot"],
    "themeChips":["build a house","build a rocket","sculpt a trophy","make a robot"],
    "actionChips":[
      "Drag pieces from a tray onto the frame",
      "Click two dots to draw an edge between them",
      "Tap the next correct piece in the right order"
    ],
    "winChips":[
      "Build the target shape exactly",
      "Build it before the timer runs out",
      "Build 3 different shapes in a row"
    ]
  },
  {
    "title":"Copy the Shape",
    "description":"Look at a target shape and place matching pieces on a blank board until it's identical.",
    "examples":["copy a window","copy a snowflake","copy a dinosaur","copy a crown"],
    "themeChips":["copy a window","copy a snowflake","copy a dinosaur","copy a crown"],
    "actionChips":[
      "Drag pieces onto the grid",
      "Click empty cells to fill them in",
      "Place pieces by typing coordinates"
    ],
    "winChips":[
      "Match the target perfectly",
      "Match it using the fewest pieces",
      "Match 3 different targets in a row"
    ]
  }
]}

The 2-3 templates should differ from each other in verb or feel. If the math concept only realistically supports 2 good templates, return 2. Never return 4 or more. Return 3 whenever reasonable.`,
      messages: [
        {
          role: "user",
          content: `Generate 2-3 game-mechanic templates with chips for this math standard:
- Standard ID: ${standardId}
- Description: ${description}
- Grade: ${grade}

Pick the right player verb. Describe the shape generically. Give 3-4 example worlds + matching themeChips, then 3 actionChips, then 3 winChips per template. Return JSON only.`,
        },
      ],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : ""
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    const start = cleaned.indexOf("{")
    const end = cleaned.lastIndexOf("}")
    if (start === -1 || end === -1) {
      console.error("[templates] no JSON in response:", cleaned.slice(0, 200))
      return Response.json({ templates: fallbackTemplates(description) })
    }

    const parsed = JSON.parse(cleaned.slice(start, end + 1)) as { templates?: Template[] }
    if (!Array.isArray(parsed.templates) || parsed.templates.length === 0) {
      return Response.json({ templates: fallbackTemplates(description) })
    }

    // Clip to 3 and ensure every template has the chip arrays.
    // If the AI forgot a chip array, fall back to sensible defaults
    // so the chat flow doesn't break.
    const cleaned_templates = parsed.templates.slice(0, 3).map((t) => ({
      title: t.title ?? "Game Idea",
      description: t.description ?? "",
      examples: Array.isArray(t.examples) ? t.examples.slice(0, 4) : [],
      themeChips: Array.isArray(t.themeChips) && t.themeChips.length > 0
        ? t.themeChips.slice(0, 4)
        : (Array.isArray(t.examples) ? t.examples.slice(0, 4) : []),
      actionChips: Array.isArray(t.actionChips) && t.actionChips.length > 0
        ? t.actionChips.slice(0, 3)
        : ["Drag pieces", "Click in the right order", "Tap to select"],
      winChips: Array.isArray(t.winChips) && t.winChips.length > 0
        ? t.winChips.slice(0, 3)
        : ["Match the target", "Beat the timer", "Score the most points"],
    }))

    return Response.json({ templates: cleaned_templates })
  } catch (e) {
    console.error("[templates] error:", String(e))
    return Response.json({ templates: fallbackTemplates(description) })
  }
}

function fallbackTemplates(description: string): Template[] {
  return [
    {
      title: "Build Your Own",
      description: `Design a small game where the player has to use ${description.toLowerCase()} to win.`,
      examples: ["build anything you like"],
      themeChips: ["build anything you like"],
      actionChips: ["Drag pieces", "Click in the right order", "Tap to select"],
      winChips: ["Match the target", "Beat the timer", "Score the most points"],
    },
  ]
}
