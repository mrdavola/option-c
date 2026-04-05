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

export interface GameReview {
  reviewerUid: string
  reviewerName: string
  approved: boolean
  comment?: string
  createdAt: number
}

export interface Game {
  id: string
  designerName: string
  authorUid: string
  classId: string
  standardId: string
  planetId: string
  title: string
  gameHtml: string
  designDoc: GameDesignDoc
  status: "draft" | "pending_review" | "published"
  playCount: number
  ratingSum: number
  ratingCount: number
  reviews: GameReview[]
  approvedBy?: string
  createdAt: number
  updatedAt: number
}

export type GameStatus = Game["status"]
