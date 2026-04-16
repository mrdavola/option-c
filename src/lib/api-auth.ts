// API authentication helper.
// Extracts Firebase ID token from Authorization header, verifies it,
// returns decoded user info. Used by all API routes to reject
// unauthenticated requests.
//
// Usage in a route:
//   const user = await verifyAuth(req)
//   if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

import { getAdminAuth } from "./firebase-admin"

interface AuthUser {
  uid: string
  email?: string
}

export async function verifyAuth(req: Request): Promise<AuthUser | null> {
  try {
    const header = req.headers.get("authorization")
    if (!header || !header.startsWith("Bearer ")) return null

    const token = header.slice(7) // Remove "Bearer "
    if (!token) return null

    const decoded = await getAdminAuth().verifyIdToken(token)
    return { uid: decoded.uid, email: decoded.email }
  } catch {
    return null
  }
}
