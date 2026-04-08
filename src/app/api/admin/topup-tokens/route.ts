// Admin-only one-shot endpoint that retroactively pays out the new token
// economy. It looks at every student's existing data and credits:
//   - +2000 per published game they authored (minus any tokens they
//     already received under the old +1/+5 schemes — close enough)
//   - +100 per skill they've already mastered
//
// Run by visiting /api/admin/topup-tokens in your browser while signed in
// as the admin. Idempotent — uses a per-user "tokenTopupAt" timestamp so
// it won't double-pay if you hit it twice.

import { db } from "@/lib/firebase"
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore"

export async function POST() {
  try {
    const usersSnap = await getDocs(query(collection(db, "users"), where("role", "==", "student")))
    let topped = 0
    let skipped = 0
    let totalAwarded = 0

    for (const userDoc of usersSnap.docs) {
      const user = userDoc.data() as { uid: string; tokenTopupAt?: number; tokens?: number }
      if (user.tokenTopupAt) {
        skipped++
        continue
      }

      // Count this student's published games
      const gamesSnap = await getDocs(
        query(
          collection(db, "games"),
          where("authorUid", "==", user.uid),
          where("status", "==", "published")
        )
      )
      const publishedGameCount = gamesSnap.size

      // Count this student's mastered standards
      const progressSnap = await getDocs(
        collection(db, "progress", user.uid, "standards")
      )
      let masteredCount = 0
      progressSnap.forEach((d) => {
        if ((d.data() as { status?: string }).status === "mastered") masteredCount++
      })

      const award = publishedGameCount * 2000 + masteredCount * 100
      if (award > 0) {
        await updateDoc(doc(db, "users", user.uid), {
          tokens: (user.tokens ?? 0) + award,
          tokenTopupAt: Date.now(),
        })
        topped++
        totalAwarded += award
      } else {
        // Mark anyway so we don't recount on next run
        await updateDoc(doc(db, "users", user.uid), { tokenTopupAt: Date.now() })
      }
    }

    return Response.json({
      ok: true,
      topped,
      skipped,
      totalAwarded,
    })
  } catch (err) {
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
