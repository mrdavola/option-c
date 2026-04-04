import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc, increment } from "firebase/firestore"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { rating } = await req.json()

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return Response.json({ error: "Rating must be 1-5" }, { status: 400 })
  }

  const snap = await getDoc(doc(db, "games", id))
  if (!snap.exists()) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  await updateDoc(doc(db, "games", id), {
    ratingSum: increment(rating),
    ratingCount: increment(1),
    playCount: increment(1),
  })

  return Response.json({ success: true })
}
