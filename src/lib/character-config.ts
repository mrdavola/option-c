// Character customization types, defaults, validation, and color palette.

export type BodyType = "stick" | "round" | "tall" | "small"

export type HairStyle =
  | "spiky"
  | "long"
  | "curly"
  | "short"
  | "ponytail"
  | "mohawk"
  | "bun"
  | "cap"
  | "crown"
  | "none"

export type Accessory =
  | "glasses"
  | "scarf"
  | "cape"
  | "crown"
  | "headband"
  | "none"

export type Expression = "happy" | "determined" | "cool" | "silly"

export interface CharacterConfig {
  body: BodyType
  color: string // hex from COLOR_PALETTE
  hair: HairStyle
  accessory: Accessory
  expression: Expression
  name: string
}

// Body-friendly colors that read well on dark backgrounds
export const COLOR_PALETTE = [
  "#F4A261", // warm sand
  "#E76F51", // terra cotta
  "#8ECAE6", // sky blue
  "#95D5B2", // sage green
  "#DDA0DD", // soft plum
  "#F7DC6F", // mellow gold
  "#FF8A80", // coral pink
  "#B0BEC5", // cool grey
  "#CE93D8", // lavender
  "#80DEEA", // teal
] as const

export const BODY_TYPES: readonly BodyType[] = [
  "stick",
  "round",
  "tall",
  "small",
]

export const HAIR_STYLES: readonly HairStyle[] = [
  "none",
  "short",
  "spiky",
  "long",
  "curly",
  "ponytail",
  "mohawk",
  "bun",
  "cap",
  "crown",
]

export const ACCESSORIES: readonly Accessory[] = [
  "none",
  "glasses",
  "scarf",
  "cape",
  "crown",
  "headband",
]

export const EXPRESSIONS: readonly Expression[] = [
  "happy",
  "determined",
  "cool",
  "silly",
]

export const DEFAULT_CHARACTER: CharacterConfig = {
  body: "stick",
  color: "#8ECAE6",
  hair: "short",
  accessory: "none",
  expression: "happy",
  name: "",
}

/** Validate and sanitise a CharacterConfig. Returns a valid config (falling back to defaults for invalid fields). */
export function validateCharacterConfig(
  raw: Partial<CharacterConfig> | null | undefined
): CharacterConfig {
  if (!raw) return { ...DEFAULT_CHARACTER }

  const body: BodyType = BODY_TYPES.includes(raw.body as BodyType)
    ? (raw.body as BodyType)
    : DEFAULT_CHARACTER.body

  const color =
    typeof raw.color === "string" &&
    COLOR_PALETTE.includes(raw.color as (typeof COLOR_PALETTE)[number])
      ? raw.color
      : DEFAULT_CHARACTER.color

  const hair: HairStyle = HAIR_STYLES.includes(raw.hair as HairStyle)
    ? (raw.hair as HairStyle)
    : DEFAULT_CHARACTER.hair

  const accessory: Accessory = ACCESSORIES.includes(raw.accessory as Accessory)
    ? (raw.accessory as Accessory)
    : DEFAULT_CHARACTER.accessory

  const expression: Expression = EXPRESSIONS.includes(
    raw.expression as Expression
  )
    ? (raw.expression as Expression)
    : DEFAULT_CHARACTER.expression

  const name =
    typeof raw.name === "string" ? raw.name.slice(0, 24).trim() : ""

  return { body, color, hair, accessory, expression, name }
}
