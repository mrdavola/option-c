import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc, arrayUnion, increment } from "firebase/firestore"

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

    // If approved, add +1 token to the author
    if (approved && game.authorUid) {
      const authorRef = doc(db, "users", game.authorUid)
      await updateDoc(authorRef, { tokens: increment(1) })
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
