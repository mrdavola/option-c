export interface UserProfile {
  uid: string
  name: string
  role: "student" | "guide" | "admin"
  grade: string
  interests: string[]
  classId: string
  classIds?: string[] // All classes a guide owns (guides only)
  tokens: number
  linkedGoogleUid?: string
  // Short personal code (e.g. "STAR-742") used by students to sign back in.
  // Generated on first sign-up. Combined with the student's name on returning
  // login so a lost code alone can't impersonate.
  personalCode?: string
  createdAt: number
  lastLoginAt: number
}

export interface ClassDoc {
  name: string
  code: string
  guideUid: string
  createdAt: number
}

export interface ProgressDoc {
  status: "locked" | "available" | "in_progress" | "in_review" | "unlocked" | "mastered"
  unlockedAt?: number
  masteredAt?: number
  masteryWins?: number
}
