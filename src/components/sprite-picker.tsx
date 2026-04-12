"use client"

import { useState, useEffect, useRef } from "react"
import { Heart, Upload, ChevronDown } from "lucide-react"
import { collection, getDocs, query, where, doc, updateDoc, arrayUnion, arrayRemove, increment } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth"

interface SpriteItem {
  id: string
  label: string
  url?: string // community uploads have URLs, library sprites use /sprites/...
  category?: string
  isCommunity?: boolean
  favoriteCount?: number
}

interface SpritePickerProps {
  type: "characters" | "items" | "backgrounds"
  libraryItems: ReadonlyArray<{ id: string; label: string; keywords?: readonly string[] }>
  categories: Record<string, string[]>
  selected: string | null
  onSelect: (id: string) => void
  recommended?: string[]
}

export function SpritePicker({ type, libraryItems, categories, selected, onSelect, recommended = [] }: SpritePickerProps) {
  const { activeProfile } = useAuth()
  const [communitySprites, setCommunitySprites] = useState<SpriteItem[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [activeCategory, setActiveCategory] = useState<string>("All")
  const [uploading, setUploading] = useState(false)
  const [uploadLabel, setUploadLabel] = useState("")
  const [showUpload, setShowUpload] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Load community sprites and user favorites
  useEffect(() => {
    getDocs(query(collection(db, "communitySprites"), where("type", "==", type)))
      .then((snap) => {
        const sprites: SpriteItem[] = snap.docs.map((d) => ({
          id: d.id,
          label: d.data().label,
          url: d.data().url,
          category: d.data().category || "Community",
          isCommunity: true,
          favoriteCount: d.data().favorites || 0,
        }))
        setCommunitySprites(sprites)
      })
      .catch(() => {})

    // Load user's favorites
    if (activeProfile?.uid) {
      getDocs(query(collection(db, "communitySprites"), where("favoritedBy", "array-contains", activeProfile.uid)))
        .then((snap) => {
          setFavorites(new Set(snap.docs.map(d => d.id)))
        })
        .catch(() => {})
    }
  }, [type, activeProfile?.uid])

  const toggleFavorite = async (spriteId: string) => {
    if (!activeProfile?.uid) return
    const ref = doc(db, "communitySprites", spriteId)
    const isFav = favorites.has(spriteId)
    try {
      if (isFav) {
        await updateDoc(ref, { favoritedBy: arrayRemove(activeProfile.uid), favorites: increment(-1) })
        setFavorites(prev => { const n = new Set(prev); n.delete(spriteId); return n })
      } else {
        await updateDoc(ref, { favoritedBy: arrayUnion(activeProfile.uid), favorites: increment(1) })
        setFavorites(prev => new Set(prev).add(spriteId))
      }
    } catch {}
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeProfile?.uid || !uploadLabel.trim()) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)
      formData.append("label", uploadLabel.trim())
      formData.append("uploaderUid", activeProfile.uid)
      formData.append("category", "Community")

      const res = await fetch("/api/sprites/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (data.ok) {
        setCommunitySprites(prev => [...prev, {
          id: data.spriteId,
          label: data.label,
          url: data.url,
          category: "Community",
          isCommunity: true,
        }])
        setShowUpload(false)
        setUploadLabel("")
        onSelect(data.url) // Select the uploaded sprite
      }
    } catch {}
    setUploading(false)
  }

  // Build all items: library + community
  const allItems: SpriteItem[] = [
    ...libraryItems.map(s => ({
      id: s.id,
      label: s.label,
      category: Object.entries(categories).find(([, ids]) => ids.includes(s.id))?.[0] || "Other",
    })),
    ...communitySprites,
  ]

  // Filter by category
  const categoryNames = ["All", ...Object.keys(categories), ...(communitySprites.length > 0 ? ["Community"] : []), ...(favorites.size > 0 ? ["Favorites"] : [])]
  const filtered = activeCategory === "All" ? allItems
    : activeCategory === "Favorites" ? allItems.filter(s => s.isCommunity && favorites.has(s.id))
    : allItems.filter(s => s.category === activeCategory)

  // Sort: recommended first
  const sorted = [...filtered].sort((a, b) => {
    const aRec = recommended.includes(a.id) ? 0 : 1
    const bRec = recommended.includes(b.id) ? 0 : 1
    return aRec - bRec
  })

  const spriteUrl = (item: SpriteItem) =>
    item.url || `/sprites/${type}/${item.id}.svg`

  return (
    <div className="space-y-2">
      {/* Category tabs */}
      <div className="flex gap-1 flex-wrap">
        {categoryNames.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-[10px] px-2 py-1 rounded-full font-medium transition-colors ${
              activeCategory === cat
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {cat === "Favorites" ? `${cat}` : cat}
          </button>
        ))}
      </div>

      {recommended.length > 0 && activeCategory === "All" && (
        <p className="text-[10px] text-emerald-400/70">Recommended items highlighted:</p>
      )}

      {/* Sprite grid */}
      <div className="grid grid-cols-5 gap-2">
        {sorted.map((item) => {
          const isRec = recommended.includes(item.id)
          const isSelected = selected === item.id || selected === item.url
          return (
            <div key={item.id} className="relative">
              <button
                onClick={() => onSelect(item.url || item.id)}
                className={`w-full p-2 rounded-lg border-2 text-center transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-500/10"
                    : isRec
                      ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50"
                      : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                }`}
              >
                <img src={spriteUrl(item)} alt={item.label} className={type === "backgrounds" ? "w-full h-12 object-cover rounded mb-1" : "w-10 h-10 mx-auto mb-1"} onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                <span className="text-[10px] text-zinc-300 block truncate">{item.label}</span>
              </button>
              {item.isCommunity && (
                <button
                  onClick={() => toggleFavorite(item.id)}
                  className={`absolute top-1 right-1 p-0.5 rounded-full ${favorites.has(item.id) ? "text-red-400" : "text-zinc-600 hover:text-zinc-400"}`}
                >
                  <Heart className="size-3" fill={favorites.has(item.id) ? "currentColor" : "none"} />
                </button>
              )}
            </div>
          )
        })}

        {/* Upload button */}
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="p-2 rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900/50 hover:border-zinc-500 text-center transition-all flex flex-col items-center justify-center gap-1"
        >
          <Upload className="size-5 text-zinc-500" />
          <span className="text-[10px] text-zinc-500">Upload</span>
        </button>
      </div>

      {/* Upload form */}
      {showUpload && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 space-y-2">
          <p className="text-xs text-zinc-400">Upload SVG or PNG (transparent background)</p>
          <input
            type="text"
            value={uploadLabel}
            onChange={(e) => setUploadLabel(e.target.value)}
            placeholder="Name your sprite..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none"
          />
          <input
            ref={fileRef}
            type="file"
            accept=".svg,.png,image/svg+xml,image/png"
            onChange={handleUpload}
            disabled={uploading || !uploadLabel.trim()}
            className="text-xs text-zinc-400 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700 disabled:opacity-30"
          />
          {uploading && <p className="text-xs text-emerald-400">Uploading...</p>}
        </div>
      )}
    </div>
  )
}
