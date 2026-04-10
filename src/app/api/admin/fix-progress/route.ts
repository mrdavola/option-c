// One-shot fix: revert in_progress standards back to available if
// the learner never actually started building a game for them.
// These were incorrectly marked in_progress just by opening the moon.

import { getAdminDb } from "@/lib/firebase-admin"

export async function GET() {
  try {
    const adminDb = getAdminDb()
    const usersSnap = await adminDb.collection("users").where("role", "==", "student").get()

    let checked = 0
    let reverted = 0

    for (const userDoc of usersSnap.docs) {
      const uid = userDoc.data().uid || userDoc.id

      // Get all games by this user
      const gamesSnap = await adminDb.collection("games").where("authorUid", "==", uid).get()
      const gameStandards = new Set(gamesSnap.docs.map(d => d.data().standardId))

      // Get all progress docs
      const progressSnap = await adminDb.collection("progress").doc(uid).collection("standards").get()

      for (const pDoc of progressSnap.docs) {
        const data = pDoc.data() as { status?: string }
        checked++
        if (data.status === "in_progress" && !gameStandards.has(pDoc.id)) {
          // No game exists — revert to available
          await pDoc.ref.update({ status: "available" })
          reverted++
        }
      }
    }

    return Response.json({ ok: true, checked, reverted })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
