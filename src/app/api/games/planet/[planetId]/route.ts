import { db } from "@/lib/firebase"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ planetId: string }> }
) {
  const { planetId } = await params

  const gamesRef = collection(db, "games")
  const q = query(
    gamesRef,
    where("planetId", "==", planetId),
    where("status", "==", "published"),
    orderBy("createdAt", "desc")
  )

  const snap = await getDocs(q)
  const games = snap.docs.map((d) => {
    const data = d.data()
    const { gameHtml: _, ...meta } = data
    return meta
  })

  return Response.json(games)
}
