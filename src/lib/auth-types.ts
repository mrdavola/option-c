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
  // Mastery state machine (Z model):
  //   locked            – prerequisites not met
  //   available         – ready to start (blue moon)
  //   in_progress       – student opened the moon (yellow moon)
  //   in_review         – student submitted a game, waiting for guide (yellow)
  //   approved_unplayed – guide approved (+2000 tokens) but student hasn't won
  //                       their own game 3 in a row yet (still yellow)
  //   unlocked          – guide approved AND student won their own game 3 in a
  //                       row. Moon turns green. Planet supernovas if last moon.
  //   mastered          – student also won 3 total times on others' approved
  //                       games for this skill. Doesn't change moon color
  //                       (stays green); planet gets gold ring if every moon
  //                       on it is mastered.
  status: "locked" | "available" | "in_progress" | "in_review" | "approved_unplayed" | "unlocked" | "mastered"
  unlockedAt?: number
  approvedAt?: number
  masteredAt?: number
  // Win streak on the student's OWN game (resets on loss). Reach 3 → unlocked.
  ownGameWinStreak?: number
  // Total wins on OTHER students' games for this skill (cumulative, not streak).
  // Reach 3 → mastered.
  othersGameWins?: number
}
