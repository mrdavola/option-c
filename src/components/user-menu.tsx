"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth"
import { LogOut, User, ChevronDown } from "lucide-react"

interface UserMenuProps {
  // Optional className override for positioning. By default the menu is
  // an inline element — the parent decides where to put it.
  className?: string
}

// Top-right name + sign-out dropdown. Used on the galaxy, the student
// dashboard, the guide dashboard, and the admin dashboard so the active
// user is always visible and can sign out.
export function UserMenu({ className }: UserMenuProps) {
  const { activeProfile, signOut, impersonating } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [open])

  if (!activeProfile) return null

  const roleBadge = activeProfile.role === "admin"
    ? "Admin"
    : activeProfile.role === "guide"
      ? "Guide"
      : "Student"

  return (
    <div className={`relative ${className ?? ""}`} ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 bg-zinc-900/85 backdrop-blur-sm hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 rounded-lg px-3 py-2 transition-colors"
      >
        <User className="size-4 text-zinc-400" />
        <span className="text-sm text-white font-medium max-w-[140px] truncate">
          {activeProfile.name}
        </span>
        <ChevronDown className="size-3.5 text-zinc-400" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-zinc-800">
            <p className="text-sm font-semibold text-white truncate">{activeProfile.name}</p>
            <p className="text-xs text-zinc-400 mt-0.5">{roleBadge}</p>
            {impersonating && (
              <p className="text-xs text-amber-400 mt-1">Viewing as student</p>
            )}
          </div>
          <button
            onClick={() => {
              setOpen(false)
              signOut()
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
