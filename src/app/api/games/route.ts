import { getAdminDb } from "@/lib/firebase-admin"

// NOTE: deliberately no orderBy in the Firestore query — combining
// where(...) + orderBy(...) requires a Firestore composite index, and
// if the index hasn't been deployed for a project the query silently
// returns nothing. We sort client-side instead. Costs nothing for
// list sizes < a few hundred.

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const classId = url.searchParams.get("classId")
    const status = url.searchParams.get("status") || "published"

    const adminDb = getAdminDb()
    let q: FirebaseFirestore.Query = adminDb.collection("games").where("status", "==", status)
    if (classId) {
      q = q.where("classId", "==", classId)
    }

    // Debug: also count ALL games in the collection regardless of status,
    // so we can tell whether the admin SDK is talking to an empty
    // database (wrong project) or a populated one with no published
    // games (status filter issue).
    const allSnap = await adminDb.collection("games").get()
    const statusCounts: Record<string, number> = {}
    allSnap.docs.forEach((d) => {
      const s = (d.data().status as string) || "(no status)"
      statusCounts[s] = (statusCounts[s] ?? 0) + 1
    })

    const snap = await q.get()
    const games = snap.docs.map((d) => {
      const data = d.data()
      const { gameHtml: _gameHtml, ...meta } = data
      return meta as Record<string, unknown>
    })

    console.log(
      `[/api/games] status=${status} classId=${classId ?? "any"} ` +
      `→ ${games.length} games | total in collection: ${allSnap.size} | ` +
      `status breakdown: ${JSON.stringify(statusCounts)}`
    )

    // Sort newest first by createdAt
    games.sort((a, b) => {
      const ta = typeof a.createdAt === "number" ? a.createdAt : 0
      const tb = typeof b.createdAt === "number" ? b.createdAt : 0
      return tb - ta
    })

    return Response.json(games)
  } catch (err) {
    console.error("[/api/games] failed:", err)
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
