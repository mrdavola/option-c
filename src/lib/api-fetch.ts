// Authenticated fetch wrapper for API calls.
// Automatically adds the Firebase ID token as Authorization header.
// Use this instead of raw fetch() for all /api/* calls.
//
// Usage:
//   import { apiFetch } from "@/lib/api-fetch"
//   const res = await apiFetch("/api/game/generate-engine", {
//     method: "POST",
//     body: JSON.stringify({ ... }),
//   })

import { auth } from "./firebase"

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers)

  // Add auth token if user is signed in
  const user = auth.currentUser
  if (user) {
    try {
      const token = await user.getIdToken()
      headers.set("Authorization", `Bearer ${token}`)
    } catch {
      // If token fetch fails, proceed without auth
      // (the API route will reject if auth is required)
    }
  }

  // Ensure JSON content type for POST/PUT
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  return fetch(url, { ...options, headers })
}
