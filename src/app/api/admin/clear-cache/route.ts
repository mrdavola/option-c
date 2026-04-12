// Clear cached explanations so they regenerate with new format
import { getAdminDb } from "@/lib/firebase-admin"

export async function POST() {
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
