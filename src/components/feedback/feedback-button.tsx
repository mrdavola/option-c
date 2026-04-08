"use client"

import { useState } from "react"
import { MessageSquarePlus, X, Send } from "lucide-react"
import { collection, doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth"
import type { FeedbackType, FeedbackDoc } from "@/lib/feedback-types"

interface FeedbackButtonProps {
  // If set, the message goes to this game's author instead of the admin
  targetGame?: { id: string; title: string; authorUid: string }
}

export function FeedbackButton({ targetGame }: FeedbackButtonProps) {
  const { activeProfile } = useAuth()
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<FeedbackType>("improvement")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!activeProfile) return null

  const isGameMessage = !!targetGame

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setSending(true)
    setError(null)
    try {
      const id = doc(collection(db, "feedback")).id
      const now = Date.now()
      // Build the doc — strip undefined fields, Firestore rejects them
      const docData: Record<string, unknown> = {
        id,
        fromUid: activeProfile.uid,
        fromName: activeProfile.name,
        fromRole: activeProfile.role,
        target: isGameMessage ? "game" : "admin",
        type,
        message: message.trim(),
        status: "open",
        replies: [],
        unreadForRecipient: true,
        unreadForSender: false,
        createdAt: now,
        updatedAt: now,
      }
      if (targetGame?.id) docData.gameId = targetGame.id
      if (targetGame?.title) docData.gameTitle = targetGame.title
      if (targetGame?.authorUid) docData.toUid = targetGame.authorUid

      await setDoc(doc(db, "feedback", id), docData)

      // Best-effort: ping the admin email API (only for admin-targeted feedback)
      if (!isGameMessage) {
        fetch("/api/feedback/notify-admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromName: activeProfile.name,
            type,
            message: message.trim(),
          }),
        }).catch(() => {})
      }

      setSent(true)
      setMessage("")
      setTimeout(() => {
        setSent(false)
        setOpen(false)
      }, 5000)
    } catch (err) {
      console.error("[feedback] send failed:", err)
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg || "Couldn't send. Try again.")
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-900/40 px-4 py-3 text-sm font-medium transition-colors"
          aria-label={isGameMessage ? "Message the game creator" : "Suggest a fix or idea"}
        >
          <MessageSquarePlus className="size-4" />
          {isGameMessage ? "Message creator" : "Suggest a fix or idea"}
        </button>
      )}

      {/* Popup */}
      {open && (
        <div className="fixed bottom-6 right-6 z-40 w-[360px] max-w-[calc(100vw-3rem)] bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl">
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <h3 className="text-sm font-semibold text-white">
              {isGameMessage ? `Message ${targetGame?.title}` : "Suggest a fix or idea"}
            </h3>
            <button
              onClick={() => setOpen(false)}
              className="text-zinc-400 hover:text-white transition-colors p-1"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>

          {sent ? (
            <div className="p-6 text-center">
              <p className="text-emerald-400 text-sm font-medium">Sent! Thanks.</p>
              <p className="text-zinc-400 text-xs mt-1">
                {isGameMessage
                  ? "The creator will see this in their inbox."
                  : "The team will see this and reply in your inbox."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              {/* Type selector */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType("improvement")}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    type === "improvement"
                      ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  💡 Suggest improvement
                </button>
                <button
                  type="button"
                  onClick={() => setType("bug")}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    type === "bug"
                      ? "bg-red-500/20 border-red-500/50 text-red-300"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  🐛 Report a fix
                </button>
              </div>

              {/* Message */}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  isGameMessage
                    ? "Tell the creator what you think..."
                    : type === "improvement"
                      ? "What could be better?"
                      : "What's broken?"
                }
                rows={4}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none"
                required
              />

              <button
                type="submit"
                disabled={!message.trim() || sending}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg py-2 text-sm font-medium transition-colors"
              >
                <Send className="size-4" />
                {sending ? "Sending..." : "Send"}
              </button>
              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
            </form>
          )}
        </div>
      )}
    </>
  )
}
