import { db } from "@/lib/firebase"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const classId = url.searchParams.get("classId")
  const status = url.searchParams.get("status") || "published"

  let q
  if (classId) {
    q = query(
      collection(db, "games"),
      where("status", "==", status),
      where("classId", "==", classId),
      orderBy("createdAt", "desc")
    )
  } else {
    q = query(
      collection(db, "games"),
      where("status", "==", status),
      orderBy("createdAt", "desc")
    )
  }

  const snap = await getDocs(q)
  const games = snap.docs.map((d) => {
    const data = d.data()
    // Don't send full HTML in list response
    const { gameHtml: _, ...meta } = data
    return meta
  })

  return Response.json(games)
}
