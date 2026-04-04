import { db } from "@/lib/firebase"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"

export async function GET() {
  const gamesRef = collection(db, "games")
  const q = query(
    gamesRef,
    where("status", "==", "published"),
    orderBy("createdAt", "desc")
  )

  const snap = await getDocs(q)
  const games = snap.docs.map((d) => {
    const data = d.data()
    // Don't send full HTML in list response
    const { gameHtml: _, ...meta } = data
    return meta
  })

  return Response.json(games)
}
