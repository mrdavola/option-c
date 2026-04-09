// Shared types for the feedback / messaging system.

export type FeedbackType = "improvement" | "bug"
export type FeedbackTarget = "admin" | "game"
export type FeedbackStatus = "open" | "answered" | "closed"

export interface FeedbackReply {
  fromUid: string
  fromName: string
  fromRole: "admin" | "guide" | "student"
  text: string
  createdAt: number
}

export interface FeedbackDoc {
  id: string
  // Who sent it
  fromUid: string
  fromName: string
  fromRole: "admin" | "guide" | "student"
  // Who's it for: "admin" or "game" (a specific game's author)
  target: FeedbackTarget
  // For target="game": the game id and the author uid
  gameId?: string
  gameTitle?: string
  toUid?: string
  // The message
  type: FeedbackType
  message: string
  // State
  status: FeedbackStatus
  replies: FeedbackReply[]
  // Has the recipient seen the latest reply?
  unreadForRecipient: boolean
  unreadForSender: boolean
  // Inbox-management flags (added for the inbox-filters feature). Both
  // optional so older docs without these fields still load.
  // archived = hidden from the default inbox view, only visible in the
  //   "Archived" filter tab. Admin-only toggle.
  // actionFlagged = manually flagged as needing follow-up. Surfaces in
  //   the "Action needed" filter tab.
  archived?: boolean
  actionFlagged?: boolean
  createdAt: number
  updatedAt: number
}
