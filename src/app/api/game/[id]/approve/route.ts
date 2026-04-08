import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc, setDoc, arrayUnion, increment } from "firebase/firestore"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { reviewerUid, reviewerName, approved, comment } = await req.json()

    if (!reviewerUid || !id) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const gameRef = doc(db, "games", id)
    const gameSnap = await getDoc(gameRef)
    if (!gameSnap.exists()) {
      return Response.json({ error: "Game not found" }, { status: 404 })
    }

    const game = gameSnap.data()

    // Can't review your own game
    if (game.authorUid === reviewerUid) {
      return Response.json({ error: "You can't review your own game" }, { status: 403 })
    }

    const review = {
      reviewerUid,
      reviewerName,
      approved,
      comment: comment || null,
      createdAt: Date.now(),
    }

    const updates: Record<string, unknown> = {
      reviews: arrayUnion(review),
    }

    if (approved) {
      updates.status = "published"
      updates.approvedBy = reviewerUid
    }

    await updateDoc(gameRef, updates)

    // If approved, award +2000 tokens AND move the standard to
    // "approved_unplayed" — student still needs to win 3 in a row on
    // their own game to flip it to fully unlocked (green).
    if (approved && game.authorUid && game.standardId) {
      const authorRef = doc(db, "users", game.authorUid)
      await updateDoc(authorRef, { tokens: increment(2000) })
      await setDoc(
        doc(db, "progress", game.authorUid, "standards", game.standardId),
        { status: "approved_unplayed", approvedAt: Date.now() },
        { merge: true }
      )
    }

    return Response.json({
      status: approved ? "published" : "pending_review",
      review,
    })
  } catch (error: unknown) {
    console.error("Approve error:", error)
    return Response.json({ error: "Review failed" }, { status: 500 })
  }
}
