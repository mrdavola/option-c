// Clear cached explanations so they regenerate with new format
import { getAdminDb } from "@/lib/firebase-admin"
import { verifyAuth } from "@/lib/api-auth"

export async function POST(req: Request) {
  const user = await verifyAuth(req)
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const adminDb = getAdminDb()
    const snap = await adminDb.collection("explanations").get()
    const batch = adminDb.batch()
    snap.docs.forEach(doc => batch.delete(doc.ref))
    await batch.commit()
    return Response.json({ ok: true, deleted: snap.size })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
