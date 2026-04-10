"use client"

import { useState, useEffect, useMemo } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface WeeklyProgressChartProps {
  // UIDs + names of learners to show on the chart
  learners: { uid: string; name: string }[]
  // Optional: highlight one learner (e.g. "you" in the My Stuff view)
  highlightUid?: string
}

interface WeekPoint {
  weekLabel: string   // "Mar 3", "Mar 10", etc.
  weekStart: number   // timestamp
  // Per-learner cumulative count at this week
  values: Map<string, number>
  // Per-learner new-this-week count
  newValues: Map<string, number>
}

const COLORS = [
  "#3b82f6", "#22c55e", "#f59e0b", "#ec4899", "#8b5cf6",
  "#06b6d4", "#ef4444", "#84cc16", "#f97316", "#6366f1",
]

// Returns the Monday of the week containing the given timestamp
function weekStart(ts: number): number {
  const d = new Date(ts)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function formatWeek(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function WeeklyProgressChart({ learners, highlightUid }: WeeklyProgressChartProps) {
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<"cumulative" | "weekly">("cumulative")
  // Raw data: per learner, list of timestamps when skills were demonstrated
  const [rawData, setRawData] = useState<Map<string, number[]>>(new Map())

  useEffect(() => {
    if (learners.length === 0) { setLoading(false); return }
    setLoading(true)

    const fetchAll = async () => {
      const result = new Map<string, number[]>()
      for (const l of learners) {
        const timestamps: number[] = []
        try {
          const snap = await getDocs(collection(db, "progress", l.uid, "standards"))
          snap.forEach(d => {
            const data = d.data() as { status?: string; approvedAt?: number; masteredAt?: number; unlockedAt?: number }
            // Count when a skill was first demonstrated (unlocked or mastered)
            if (data.status === "unlocked" || data.status === "mastered") {
              const ts = data.unlockedAt || data.approvedAt || data.masteredAt || 0
              if (ts) timestamps.push(ts)
            }
          })
        } catch {}
        result.set(l.uid, timestamps.sort((a, b) => a - b))
      }
      setRawData(result)
      setLoading(false)
    }
    fetchAll()
  }, [learners])

  const weeks: WeekPoint[] = useMemo(() => {
    if (rawData.size === 0) return []

    // Find the earliest and latest timestamps across all learners
    let minTs = Infinity, maxTs = 0
    rawData.forEach(timestamps => {
      for (const t of timestamps) {
        if (t < minTs) minTs = t
        if (t > maxTs) maxTs = t
      }
    })

    if (minTs === Infinity) return []

    // Generate week buckets from earliest to now
    const now = Date.now()
    const firstWeek = weekStart(minTs)
    const lastWeek = weekStart(now)
    const weekBuckets: number[] = []
    for (let w = firstWeek; w <= lastWeek; w += 7 * 24 * 60 * 60 * 1000) {
      weekBuckets.push(w)
    }
    // Always include current week
    if (weekBuckets[weekBuckets.length - 1] !== lastWeek) weekBuckets.push(lastWeek)

    // Limit to last 12 weeks
    const recent = weekBuckets.slice(-12)

    return recent.map((ws) => {
      const nextWeek = ws + 7 * 24 * 60 * 60 * 1000
      const values = new Map<string, number>()
      const newValues = new Map<string, number>()
      for (const l of learners) {
        const timestamps = rawData.get(l.uid) || []
        const cumulative = timestamps.filter(t => t < nextWeek).length
        const thisWeek = timestamps.filter(t => t >= ws && t < nextWeek).length
        values.set(l.uid, cumulative)
        newValues.set(l.uid, thisWeek)
      }
      return { weekLabel: formatWeek(ws), weekStart: ws, values, newValues }
    })
  }, [rawData, learners])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (weeks.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
        <p className="text-zinc-500 text-sm">No progress data yet.</p>
      </div>
    )
  }

  // Chart dimensions
  const W = 600, H = 200, padL = 40, padR = 20, padT = 10, padB = 30
  const chartW = W - padL - padR
  const chartH = H - padT - padB

  const dataForMode = (uid: string, week: WeekPoint) =>
    mode === "cumulative" ? (week.values.get(uid) || 0) : (week.newValues.get(uid) || 0)

  const maxVal = Math.max(1, ...weeks.flatMap(w => learners.map(l => dataForMode(l.uid, w))))

  const xScale = (i: number) => padL + (i / Math.max(1, weeks.length - 1)) * chartW
  const yScale = (v: number) => padT + chartH - (v / maxVal) * chartH

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wide">Skills Demonstrated Over Time</p>
        <div className="flex gap-1 bg-zinc-800 rounded-md p-0.5">
          <button onClick={() => setMode("cumulative")}
            className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${mode === "cumulative" ? "bg-zinc-700 text-white" : "text-zinc-400"}`}>
            Cumulative
          </button>
          <button onClick={() => setMode("weekly")}
            className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${mode === "weekly" ? "bg-zinc-700 text-white" : "text-zinc-400"}`}>
            Per Week
          </button>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }}>
        {/* Grid lines */}
        {Array.from({ length: 5 }, (_, i) => {
          const v = (maxVal / 4) * i
          const y = yScale(v)
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#27272a" strokeWidth={1} />
              <text x={padL - 6} y={y + 3} textAnchor="end" fontSize={9} fill="#52525b">{Math.round(v)}</text>
            </g>
          )
        })}

        {/* X labels */}
        {weeks.map((w, i) => (
          <text key={i} x={xScale(i)} y={H - 6} textAnchor="middle" fontSize={8} fill="#52525b">{w.weekLabel}</text>
        ))}

        {/* Lines per learner */}
        {learners.map((l, li) => {
          const color = COLORS[li % COLORS.length]
          const isHighlighted = l.uid === highlightUid
          const opacity = highlightUid && !isHighlighted ? 0.3 : 1
          const strokeW = isHighlighted ? 2.5 : 1.5

          const points = weeks.map((w, i) => `${xScale(i)},${yScale(dataForMode(l.uid, w))}`).join(" ")
          return (
            <g key={l.uid} opacity={opacity}>
              <polyline points={points} fill="none" stroke={color} strokeWidth={strokeW} strokeLinejoin="round" />
              {weeks.map((w, i) => (
                <circle key={i} cx={xScale(i)} cy={yScale(dataForMode(l.uid, w))} r={isHighlighted ? 3 : 2} fill={color} />
              ))}
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {learners.map((l, li) => (
          <div key={l.uid} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[li % COLORS.length] }} />
            <span className={`text-xs ${l.uid === highlightUid ? "text-white font-semibold" : "text-zinc-400"}`}>
              {l.uid === highlightUid ? `${l.name} (you)` : l.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
