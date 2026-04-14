export const SPRITE_CHARACTERS = [
  { id: "pirate", label: "Pirate", keywords: ["ocean", "ship", "treasure", "sea", "water"] },
  { id: "robot", label: "Robot", keywords: ["tech", "space", "factory", "machine", "cyber"] },
  { id: "astronaut", label: "Astronaut", keywords: ["space", "moon", "planet", "star", "galaxy"] },
  { id: "knight", label: "Knight", keywords: ["castle", "medieval", "dragon", "kingdom", "sword"] },
  { id: "chef", label: "Chef", keywords: ["kitchen", "food", "cook", "restaurant", "recipe"] },
  { id: "diver", label: "Diver", keywords: ["ocean", "underwater", "sea", "shipwreck", "coral"] },
  { id: "ghost", label: "Ghost", keywords: ["haunted", "spooky", "castle", "night", "dark"] },
  { id: "ninja", label: "Ninja", keywords: ["stealth", "temple", "shadow", "warrior", "dojo"] },
  { id: "wizard", label: "Wizard", keywords: ["magic", "spell", "tower", "enchanted", "potion"] },
  { id: "explorer", label: "Explorer", keywords: ["jungle", "cave", "forest", "adventure", "map"] },
  { id: "dancer", label: "Dancer", keywords: ["dance", "ballet", "stage", "performance", "music"] },
  { id: "scientist", label: "Scientist", keywords: ["lab", "experiment", "research", "beaker", "chemistry"] },
  { id: "athlete", label: "Athlete", keywords: ["sport", "run", "race", "gym", "compete"] },
  { id: "musician", label: "Musician", keywords: ["music", "guitar", "band", "concert", "song"] },
  { id: "artist", label: "Artist", keywords: ["paint", "canvas", "brush", "creative", "gallery"] },
] as const

export const SPRITE_ITEMS = [
  { id: "coin", label: "Coins", keywords: ["treasure", "gold", "pirate", "money", "rich"] },
  { id: "gem", label: "Gems", keywords: ["crystal", "jewel", "cave", "mine", "sparkle"] },
  { id: "treasure-chest", label: "Treasure Chests", keywords: ["pirate", "gold", "ship", "loot", "hidden"] },
  { id: "crystal", label: "Crystals", keywords: ["magic", "cave", "glow", "enchanted", "power"] },
  { id: "potion", label: "Potions", keywords: ["magic", "wizard", "spell", "brew", "alchemy"] },
  { id: "fruit", label: "Fruit", keywords: ["kitchen", "food", "nature", "garden", "fresh"] },
  { id: "star", label: "Stars", keywords: ["space", "sky", "night", "galaxy", "cosmic"] },
  { id: "shell", label: "Shells", keywords: ["ocean", "beach", "sea", "underwater", "coral"] },
  { id: "mushroom", label: "Mushrooms", keywords: ["forest", "nature", "magic", "enchanted", "fairy"] },
  { id: "key", label: "Keys", keywords: ["lock", "door", "treasure", "secret", "dungeon"] },
  { id: "trophy", label: "Trophies", keywords: ["win", "award", "champion", "gold", "victory"] },
  { id: "lightning-bolt", label: "Lightning Bolts", keywords: ["power", "energy", "electric", "speed", "storm"] },
  { id: "pizza-slice", label: "Pizza Slices", keywords: ["food", "party", "snack", "cheese", "fun"] },
  { id: "rocket", label: "Rockets", keywords: ["space", "launch", "fly", "blast", "speed"] },
  { id: "diamond", label: "Diamonds", keywords: ["gem", "jewel", "sparkle", "precious", "luxury"] },
] as const

export const SPRITE_BACKGROUNDS = [
  { id: "underwater", label: "Underwater", keywords: ["ocean", "sea", "dive", "coral", "fish"] },
  { id: "space", label: "Outer Space", keywords: ["star", "planet", "galaxy", "cosmic", "moon"] },
  { id: "forest", label: "Enchanted Forest", keywords: ["tree", "nature", "magic", "fairy", "mushroom"] },
  { id: "castle", label: "Castle", keywords: ["medieval", "knight", "kingdom", "stone", "tower"] },
  { id: "kitchen", label: "Kitchen", keywords: ["food", "cook", "chef", "recipe", "restaurant"] },
  { id: "cave", label: "Crystal Cave", keywords: ["dark", "gem", "crystal", "mine", "underground"] },
  { id: "city", label: "Neon City", keywords: ["urban", "cyber", "tech", "robot", "night"] },
  { id: "volcano", label: "Volcano", keywords: ["lava", "fire", "hot", "mountain", "dragon"] },
  { id: "arctic", label: "Arctic", keywords: ["ice", "snow", "cold", "polar", "frozen"] },
  { id: "jungle", label: "Jungle", keywords: ["tropical", "vine", "explorer", "adventure", "wild"] },
  { id: "desert", label: "Desert", keywords: ["sand", "dune", "cactus", "hot", "dry"] },
  { id: "ocean-floor", label: "Ocean Floor", keywords: ["deep", "sea", "coral", "fish", "abyss"] },
  { id: "laboratory", label: "Laboratory", keywords: ["lab", "science", "experiment", "beaker", "research"] },
  { id: "candy-land", label: "Candy Land", keywords: ["sweet", "candy", "lollipop", "sugar", "fun"] },
  { id: "cyberpunk", label: "Cyberpunk", keywords: ["neon", "future", "city", "tech", "cyber"] },
] as const

// Categories for organizing sprites (including community uploads)
export const CHARACTER_CATEGORIES: Record<string, string[]> = {
  "Adventurers": ["pirate", "astronaut", "explorer", "diver"],
  "Warriors": ["knight", "ninja"],
  "Magic": ["wizard", "ghost"],
  "Professionals": ["chef", "robot", "scientist"],
  "Creative": ["dancer", "musician", "artist"],
  "Sports": ["athlete"],
}

export const BACKGROUND_CATEGORIES: Record<string, string[]> = {
  "Nature": ["forest", "jungle", "arctic", "desert"],
  "Water": ["underwater", "ocean-floor"],
  "Built": ["castle", "kitchen", "city", "laboratory"],
  "Extreme": ["volcano", "cave", "space"],
  "Fantasy": ["candy-land", "cyberpunk"],
}

export const ITEM_CATEGORIES: Record<string, string[]> = {
  "Treasure": ["coin", "gem", "treasure-chest", "key", "diamond"],
  "Magic": ["crystal", "potion", "star", "lightning-bolt"],
  "Nature": ["fruit", "shell", "mushroom"],
  "Fun": ["trophy", "pizza-slice", "rocket"],
}

export type SpriteId = typeof SPRITE_CHARACTERS[number]["id"]
export type ItemSpriteId = typeof SPRITE_ITEMS[number]["id"]
export type BackgroundId = typeof SPRITE_BACKGROUNDS[number]["id"]

// Resolve a sprite ID (or upload URL) to a full URL
export function resolveSpriteUrl(
  type: "characters" | "items" | "backgrounds",
  idOrUrl: string
): string {
  if (idOrUrl.startsWith("http") || idOrUrl.startsWith("data:")) return idOrUrl
  return `/sprites/${type}/${idOrUrl}.svg`
}
