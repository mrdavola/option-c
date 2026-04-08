"use client"

import { useState, useRef, useEffect } from "react"
import { Settings } from "lucide-react"
import type { ColorMode } from "@/lib/galaxy-utils"
import { CONCEPT_LEGEND } from "@/lib/galaxy-utils"

interface GalaxySettingsPopoverProps {
  colorMode: ColorMode
  onColorModeChange: (mode: ColorMode) => void
  gradeFilter: "all" | "myGrade"
  onGradeFilterChange: (filter: "all" | "myGrade") => void
  // If true, the grade filter row is hidden (no grade picked yet)
  showGradeFilter: boolean
  // True when the legend swatch for "Available, not your grade" should appear
  showOtherGradeSwatch: boolean
}

// Single popover that bundles every "view setting" the student might want
// to flip — by progress / by concept, my grade / all grades, plus the
// mastery legend. Default-collapsed so the galaxy stays clean.
export function GalaxySettingsPopover({
  colorMode,
  onColorModeChange,
  gradeFilter,
  onGradeFilterChange,
  showGradeFilter,
  showOtherGradeSwatch,
}: GalaxySettingsPopoverProps) {
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

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-2 backdrop-blur-sm border rounded-lg px-3 py-2 text-sm transition-colors ${
          open
            ? "bg-zinc-800 border-zinc-600 text-white"
            : "bg-zinc-900/85 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600"
        }`}
        title="View settings"
      >
        <Settings className="size-4" />
        <span>View</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-50">
          {/* Color mode */}
          <div className="p-4 border-b border-zinc-800 space-y-2">
            <p className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wide">
              Color planets
            </p>
            <div className="bg-zinc-800 rounded-lg flex overflow-hidden border border-zinc-700">
              <button
                onClick={() => onColorModeChange("mastery")}
                className={`flex-1 px-3 py-1.5 text-sm transition-colors ${
                  colorMode === "mastery"
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                By progress
              </button>
              <button
                onClick={() => onColorModeChange("domain")}
                className={`flex-1 px-3 py-1.5 text-sm transition-colors ${
                  colorMode === "domain"
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                By concept
              </button>
            </div>
          </div>

          {/* Grade filter — only meaningful in "By progress" mode.
              In "By concept" mode the colors aren't grade-aware, so the
              toggle would be confusing. */}
          {showGradeFilter && colorMode === "mastery" && (
            <div className="p-4 border-b border-zinc-800 space-y-2">
              <p className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wide">
                Show
              </p>
              <div className="bg-zinc-800 rounded-lg flex overflow-hidden border border-zinc-700">
                <button
                  onClick={() => onGradeFilterChange("myGrade")}
                  className={`flex-1 px-3 py-1.5 text-sm transition-colors ${
                    gradeFilter === "myGrade"
                      ? "bg-zinc-700 text-white"
                      : "text-zinc-300 hover:text-white"
                  }`}
                >
                  My grade
                </button>
                <button
                  onClick={() => onGradeFilterChange("all")}
                  className={`flex-1 px-3 py-1.5 text-sm transition-colors ${
                    gradeFilter === "all"
                      ? "bg-zinc-700 text-white"
                      : "text-zinc-300 hover:text-white"
                  }`}
                >
                  All grades
                </button>
              </div>
            </div>
          )}

          {/* Legend — by progress */}
          {colorMode === "mastery" && (
            <div className="p-4 space-y-2">
              <p className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wide">
                What the colors mean
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                <LegendRow color="bg-blue-500" label="My grade level" />
                <LegendRow color="bg-yellow-500" label="Progressing" />
                <LegendRow color="bg-emerald-500" label="Demonstrated" />
                <LegendRow color="bg-amber-500" label="Mastered" />
                {showOtherGradeSwatch && (
                  <LegendRow color="bg-purple-600" label="Available, not your grade" />
                )}
                <LegendRow color="bg-zinc-500" label="Locked" />
              </div>
            </div>
          )}

          {/* Legend — by concept (math domain colors) */}
          {colorMode === "domain" && (
            <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
              <p className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wide">
                What the colors mean
              </p>
              <div className="grid grid-cols-2 gap-y-1.5 gap-x-3">
                {CONCEPT_LEGEND.map((c) => (
                  <div key={c.name} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="text-xs text-zinc-200">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2.5 h-2.5 rounded-full ${color} shrink-0`} />
      <span className="text-xs text-zinc-200">{label}</span>
    </div>
  )
}
