// Increment a game's playCount. Called once per session by the game player
// (the client guards against double-counting and skips author's own plays).

import { db } from "@/lib/firebase"
import { doc, updateDoc, increment } from "firebase/firestore"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await updateDoc(doc(db, "games", id), {
      playCount: increment(1),
    })
    return Response.json({ ok: true })
  } catch (err) {
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
