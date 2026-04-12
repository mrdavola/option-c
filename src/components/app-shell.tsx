"use client"

import { UnifiedHeader } from "./unified-header"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <UnifiedHeader />
      {children}
    </>
  )
}
