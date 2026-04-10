// One-shot diagnostic + fix: find feedback docs that should belong to
// a learner but have a stale toUid (from before UID migration).
// Matches by game authorUid (already migrated) to find orphaned feedback.

import { getAdminDb } from "@/lib/firebase-admin"

export async function GET() {
  try {
    const adminDb = getAdminDb()

    // Get all feedback docs
    const feedbackSnap = await adminDb.collection("feedback").get()
    const allFeedback = feedbackSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[]

    // Get all users to build a uid → name map
    const usersSnap = await adminDb.collection("users").get()
    const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[]
    const uidToName = new Map(users.map(u => [u.uid || u.id, u.name]))

    // Get all games to map gameId → current authorUid
    const gamesSnap = await adminDb.collection("games").get()
    const gameAuthor = new Map(gamesSnap.docs.map(d => [d.id, d.data().authorUid]))

    // Find feedback docs where toUid doesn't match any current user
    const currentUids = new Set(users.map(u => u.uid || u.id))
    const orphaned = allFeedback.filter(f => f.toUid && !currentUids.has(f.toUid))
    const fixable: any[] = []

    for (const f of orphaned) {
      // Try to find the correct toUid via the game's current authorUid
      if (f.gameId) {
        const correctUid = gameAuthor.get(f.gameId)
        if (correctUid && currentUids.has(correctUid)) {
          fixable.push({ id: f.id, oldToUid: f.toUid, newToUid: correctUid, name: uidToName.get(correctUid), msg: f.message?.slice(0, 60) })
        }
      }
    }

    return Response.json({
      totalFeedback: allFeedback.length,
      orphaned: orphaned.length,
      fixable: fixable.length,
      details: fixable,
      allToUids: allFeedback.map(f => ({ id: f.id, toUid: f.toUid, name: uidToName.get(f.toUid) || "UNKNOWN", msg: f.message?.slice(0, 60) })),
    })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST() {
  try {
    const adminDb = getAdminDb()

    const feedbackSnap = await adminDb.collection("feedback").get()
    const allFeedback = feedbackSnap.docs.map(d => ({ ref: d.ref, ...d.data() })) as any[]

    const usersSnap = await adminDb.collection("users").get()
    const currentUids = new Set(usersSnap.docs.map(d => d.data().uid || d.id))

    const gamesSnap = await adminDb.collection("games").get()
    const gameAuthor = new Map(gamesSnap.docs.map(d => [d.id, d.data().authorUid]))

    let fixed = 0
    for (const f of allFeedback) {
      if (f.toUid && !currentUids.has(f.toUid) && f.gameId) {
        const correctUid = gameAuthor.get(f.gameId)
        if (correctUid && currentUids.has(correctUid)) {
          await f.ref.update({ toUid: correctUid })
          fixed++
        }
      }
    }

    return Response.json({ ok: true, fixed })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
