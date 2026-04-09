"use client"

import { useState } from "react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { X, Save } from "lucide-react"

// Modal that lets a guide or admin edit a learner's name and grade.
// Used by both the guide dashboard and the admin dashboard.
//
// Doesn't touch the personalCode (kid keeps the same one) or any
// other profile field. Just name + grade. Saves directly to the
// users/{uid} doc — no API roundtrip.

const GRADES = ["K", "1", "2", "3", "4", "5", "6", "7", "8", "HS"]

interface LearnerEditModalProps {
  open: boolean
  uid: string
  currentName: string
  currentGrade: string
  onClose: () => void
  // Called after a successful save with the new values, so the parent
  // can update its local state without refetching.
  onSaved: (newName: string, newGrade: string) => void
}

export function LearnerEditModal({
  open,
  uid,
  currentName,
  currentGrade,
  onClose,
  onSaved,
}: LearnerEditModalProps) {
  const [name, setName] = useState(currentName)
  const [grade, setGrade] = useState(currentGrade)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const handleSave = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setError("Name can't be empty.")
      return
    }
    setSaving(true)
    setError(null)
    try {
      await updateDoc(doc(db, "users", uid), {
        name: trimmed,
        grade,
      })
      onSaved(trimmed, grade)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save changes.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Edit learner</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-xs text-zinc-400 uppercase tracking-wide font-medium">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          />
          <p className="text-[11px] text-zinc-500">
            The learner uses this to sign in. Avoid spaces and special characters
            (Pepito, not Pepito Sanchez).
          </p>
        </div>

        {/* Grade */}
        <div className="space-y-1.5">
          <label className="text-xs text-zinc-400 uppercase tracking-wide font-medium">
            Grade
          </label>
          <div className="flex flex-wrap gap-1.5">
            {GRADES.map((g) => (
              <button
                key={g}
                onClick={() => setGrade(g)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  grade === g
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <div className="flex gap-2 justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            <Save className="size-4" />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  )
}
