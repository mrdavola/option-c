"use client"

import { useAuth } from "@/lib/auth"
import { LearnerNav } from "@/components/learner-nav"

export default function LearnerLayout({ children }: { children: React.ReactNode }) {
  const { loading, impersonating, stopImpersonating } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {impersonating && (
        <div className="bg-amber-500/90 text-black px-4 py-2 flex items-center justify-between">
          <span className="text-sm font-medium">Viewing as {impersonating.name}</span>
          <button
            onClick={() => { stopImpersonating(); window.location.href = "/guide" }}
            className="text-sm font-semibold bg-black/20 hover:bg-black/30 rounded-lg px-3 py-1 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      )}
      <div className="p-4 md:p-6 relative">
        <LearnerNav />
        <div className="pt-14">
          {children}
        </div>
      </div>
    </div>
  )
}
