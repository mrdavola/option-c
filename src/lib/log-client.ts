// Client-side logging — sends events to /api/log which writes to Firestore.
// This file is safe to import from "use client" components.
// NEVER import firebase-admin or system-logger.ts from client code.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function logFromClient(event: Record<string, any> & { type: string }): Promise<void> {
  try {
    await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    })
  } catch {
    // Fire-and-forget
  }
}
