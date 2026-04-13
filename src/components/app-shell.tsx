"use client"

import { UnifiedHeader } from "./unified-header"
import { FeedbackButton } from "./feedback/feedback-button"
import { useAuth } from "@/lib/auth"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { activeProfile } = useAuth()

  return (
    <>
      <UnifiedHeader />
      {children}
      {/* Feedback button on every page */}
      {activeProfile && <FeedbackButton />}
    </>
  )
}
