export interface GameDesignDoc {
  title: string
  concept: string
  standardId: string
  planetId: string
  howItWorks: string
  rules: string[]
  winCondition: string
  mathRole: string
  designChoices: {
    vibe?: string
    color?: string
    characters?: string
    [key: string]: string | undefined
  }
}

export interface Game {
  id: string
  designerName: string
  standardId: string
  planetId: string
  title: string
  gameHtml: string
  designDoc: GameDesignDoc
  status: "draft" | "in_review" | "published"
  playCount: number
  ratingSum: number
  ratingCount: number
  createdAt: number
  updatedAt: number
}

export type GameStatus = Game["status"]
