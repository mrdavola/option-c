// Real-world scenarios per standard. Shown on the mechanic skeleton
// celebration screen to spark game ideas. Each scenario suggests a
// complete game setup (character/background/item/backstory).
//
// Curriculum engine format: 3 scenarios per standard across 3 domains
// (money / animals / transport). Kids pick one to auto-fill the builder.

export interface StandardScenario {
  domain: "money" | "animals" | "transport" | "other"
  icon: string              // single emoji for visual pop
  title: string             // short label (e.g. "Penny Jar")
  story: string             // 2–3 sentences, kid-friendly
  math: string              // the equation, e.g. "4 + 3 = 7"
  howToSolve: string[]      // 3–4 steps in simple language
  meaning: string           // what the answer means in context
  gameIdea: {
    character: string       // sprite ID from sprite-library
    background: string      // sprite ID from sprite-library
    item: string            // sprite ID from sprite-library
    backstory: string       // prefilled challenge/backstory for the game banner
  }
}

export const STANDARD_SCENARIOS: Record<string, StandardScenario[]> = {
  // ═══════════════════════════════════════════════════════════════
  // KINDERGARTEN
  // ═══════════════════════════════════════════════════════════════

  "K.OA.A.1": [
    {
      domain: "money",
      icon: "💰",
      title: "Penny Jar",
      story:
        "You have 4 pennies in your jar. Grandma gives you 3 more pennies for helping her. You count all the pennies in your jar.",
      math: "4 + 3 = 7",
      howToSolve: [
        "Start with the 4 pennies you already have",
        "Add the 3 pennies Grandma gave you",
        "Count them all together",
        "You have 7 pennies",
      ],
      meaning: "7 is the total number of pennies in your jar.",
      gameIdea: {
        character: "chef",
        background: "kitchen",
        item: "coin",
        backstory: "Grandma is helping you count the pennies you saved!",
      },
    },
    {
      domain: "animals",
      icon: "🐟",
      title: "Fish Tank",
      story:
        "Your fish tank has 6 goldfish swimming around. Today Mom takes you to the pet store and you bring home 2 new fish. Your tank is fuller now.",
      math: "6 + 2 = 8",
      howToSolve: [
        "Start with the 6 fish already in the tank",
        "Add the 2 new fish from the store",
        "Count all the fish",
        "You have 8 fish",
      ],
      meaning: "8 is the total number of fish in your tank.",
      gameIdea: {
        character: "diver",
        background: "underwater",
        item: "shell",
        backstory: "Catch fish to bring home to your aquarium!",
      },
    },
    {
      domain: "transport",
      icon: "🚌",
      title: "School Bus",
      story:
        "The school bus picks up 5 kids at your stop. At the next stop, 1 more kid hops on. The bus driver counts everyone on the bus.",
      math: "5 + 1 = 6",
      howToSolve: [
        "Start with the 5 kids already on the bus",
        "Add the 1 new kid from the next stop",
        "Count all the kids on the bus",
        "There are 6 kids",
      ],
      meaning: "6 is the total number of kids on the bus.",
      gameIdea: {
        character: "explorer",
        background: "city",
        item: "star",
        backstory: "Drive the bus and pick up all the kids for school!",
      },
    },
  ],
}

export function getScenarios(standardId: string): StandardScenario[] | null {
  return STANDARD_SCENARIOS[standardId] ?? null
}
