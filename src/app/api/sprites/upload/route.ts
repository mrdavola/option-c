// Upload a custom sprite (SVG or PNG with transparent background).
// Saves to Firebase Storage and registers in Firestore for community use.

import { getAdminDb } from "@/lib/firebase-admin"
import { getStorage } from "firebase-admin/storage"

export const maxDuration = 15

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const spriteType = formData.get("type") as string // "characters" | "items" | "backgrounds"
    const label = formData.get("label") as string
    const uploaderUid = formData.get("uploaderUid") as string
    const category = formData.get("category") as string || "Community"

    if (!file || !spriteType || !label || !uploaderUid) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate file type
    const validTypes = ["image/svg+xml", "image/png"]
    if (!validTypes.includes(file.type)) {
      return Response.json({ error: "Only SVG and PNG files are accepted. Use images with transparent backgrounds." }, { status: 400 })
    }

    // Max 2MB
    if (file.size > 2 * 1024 * 1024) {
      return Response.json({ error: "File too large (max 2MB)" }, { status: 400 })
    }

    // Upload to Firebase Storage
    const bucket = getStorage().bucket()
    const ext = file.type === "image/svg+xml" ? "svg" : "png"
    const fileName = `sprites/${spriteType}/${uploaderUid}-${Date.now()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const fileRef = bucket.file(fileName)
    await fileRef.save(buffer, {
      metadata: { contentType: file.type },
      public: true,
    })

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`

    // Register in Firestore for community browsing
    const adminDb = getAdminDb()
    const spriteDoc = {
      url: publicUrl,
      type: spriteType,
      label,
      category,
      uploaderUid,
      uploadedAt: Date.now(),
      favorites: 0,
    }
    const ref = await adminDb.collection("communitySprites").add(spriteDoc)

    return Response.json({
      ok: true,
      spriteId: ref.id,
      url: publicUrl,
      label,
    })
  } catch (err) {
    console.error("[sprite-upload]", err)
    return Response.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    )
  }
}
