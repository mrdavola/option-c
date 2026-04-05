import { db } from "@/lib/firebase"
import { collection, doc, setDoc } from "firebase/firestore"

export async function POST(req: Request) {
  const game = await req.json()
  const gamesRef = collection(db, "games")
  const gameId = game.id || doc(gamesRef).id

  await setDoc(doc(db, "games", gameId), {
    ...game,
    id: gameId,
    reviews: game.reviews || [],
    updatedAt: Date.now(),
    createdAt: game.createdAt || Date.now(),
  })

  return Response.json({ id: gameId })
}
