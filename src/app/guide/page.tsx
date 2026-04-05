"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Copy, Check, Users, GamepadIcon, Clock } from "lucide-react"
import type { Game } from "@/lib/game-types"

interface StudentSummary {
  uid: string
  name: string
  tokens: number
  lastLoginAt: number
  skillsUnlocked: number
  skillsMastered: number
}

export default function GuideDashboard() {
  const { profile, signOut } = useAuth()
  const [tab, setTab] = useState<"students" | "reviews" | "games">("students")
  const [classData, setClassData] = useState<{ name: string; code: string } | null>(null)
  const [students, setStudents] = useState<StudentSummary[]>([])
  const [pendingGames, setPendingGames] = useState<Game[]>([])
  const [publishedGames, setPublishedGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(null)
  const [studentGames, setStudentGames] = useState<Game[]>([])

  useEffect(() => {
    if (!profile?.classId) return
    loadDashboard()
  }, [profile?.classId])

  async function loadDashboard() {
    if (!profile?.classId) return
    setLoading(true)
    try {
      // Load class
      const classSnap = await getDoc(doc(db, "classes", profile.classId))
      if (classSnap.exists()) {
        const d = classSnap.data()
        setClassData({ name: d.name, code: d.code })
      }

      // Load students
      const studentsQuery = query(
        collection(db, "users"),
        where("classId", "==", profile.classId),
        where("role", "==", "student")
      )
      const studentsSnap = await getDocs(studentsQuery)
      const studentList: StudentSummary[] = []

      for (const studentDoc of studentsSnap.docs) {
        const s = studentDoc.data()
        // Count progress
        const progressSnap = await getDocs(collection(db, "progress", studentDoc.id, "standards"))
        let unlocked = 0, mastered = 0
        progressSnap.forEach(p => {
          const status = p.data().status
          if (status === "unlocked" || status === "mastered") unlocked++
          if (status === "mastered") mastered++
        })
        studentList.push({
          uid: studentDoc.id,
          name: s.name || "Unknown",
          tokens: s.tokens || 0,
          lastLoginAt: s.lastLoginAt || 0,
          skillsUnlocked: unlocked,
          skillsMastered: mastered,
        })
      }
      studentList.sort((a, b) => b.lastLoginAt - a.lastLoginAt)
      setStudents(studentList)

      // Load games
      const gamesQuery = query(
        collection(db, "games"),
        where("classId", "==", profile.classId)
      )
      const gamesSnap = await getDocs(gamesQuery)
      const pending: Game[] = []
      const published: Game[] = []
      gamesSnap.forEach(g => {
        const game = { ...g.data(), id: g.id } as Game
        if (game.status === "pending_review") pending.push(game)
        else if (game.status === "published") published.push(game)
      })
      setPendingGames(pending)
      setPublishedGames(published)
    } catch (err) {
      console.error("Dashboard load error:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleStudentClick(student: StudentSummary) {
    setSelectedStudent(student)
    // Load this student's games
    const q = query(collection(db, "games"), where("authorUid", "==", student.uid))
    const snap = await getDocs(q)
    setStudentGames(snap.docs.map(d => ({ ...d.data(), id: d.id }) as Game))
  }

  async function handleApproveGame(gameId: string) {
    if (!profile) return
    try {
      const gameRef = doc(db, "games", gameId)
      await updateDoc(gameRef, {
        status: "published",
        approvedBy: profile.uid,
        reviews: [{ reviewerUid: profile.uid, reviewerName: profile.name, approved: true, createdAt: Date.now() }],
      })
      // Reload
      loadDashboard()
    } catch (err) {
      console.error("Approve error:", err)
    }
  }

  function copyCode() {
    if (classData?.code) {
      navigator.clipboard.writeText(classData.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function formatTime(ts: number) {
    if (!ts) return "Never"
    const diff = Date.now() - ts
    if (diff < 60000) return "Just now"
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return `${Math.floor(diff / 86400000)}d ago`
  }

  if (!profile) return null

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {classData?.name || "Your Class"}
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              {students.length} student{students.length !== 1 ? "s" : ""} enrolled
            </p>
          </div>
          <div className="flex items-center gap-3">
            {classData && (
              <button
                onClick={copyCode}
                className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors"
              >
                <span className="font-mono font-bold tracking-wider">{classData.code}</span>
                {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
              </button>
            )}
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
          {([
            { key: "students", label: "Students", icon: Users },
            { key: "reviews", label: `Reviews${pendingGames.length > 0 ? ` (${pendingGames.length})` : ""}`, icon: Clock },
            { key: "games", label: "Games", icon: GamepadIcon },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setSelectedStudent(null) }}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                tab === key
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Students Tab */}
            {tab === "students" && !selectedStudent && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800 text-left">
                      <th className="px-4 py-3 text-xs text-zinc-400 font-medium">Name</th>
                      <th className="px-4 py-3 text-xs text-zinc-400 font-medium">Last Active</th>
                      <th className="px-4 py-3 text-xs text-zinc-400 font-medium text-center">Tokens</th>
                      <th className="px-4 py-3 text-xs text-zinc-400 font-medium text-center">Unlocked</th>
                      <th className="px-4 py-3 text-xs text-zinc-400 font-medium text-center">Mastered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => (
                      <tr
                        key={s.uid}
                        onClick={() => handleStudentClick(s)}
                        className="border-b border-zinc-800/50 hover:bg-zinc-800/30 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-white font-medium">{s.name}</td>
                        <td className="px-4 py-3 text-sm text-zinc-400">{formatTime(s.lastLoginAt)}</td>
                        <td className="px-4 py-3 text-sm text-amber-400 text-center font-mono">{s.tokens}</td>
                        <td className="px-4 py-3 text-sm text-blue-400 text-center">{s.skillsUnlocked}</td>
                        <td className="px-4 py-3 text-sm text-emerald-400 text-center">{s.skillsMastered}</td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-zinc-500 text-sm">
                          No students yet. Share the class code to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Student Detail */}
            {tab === "students" && selectedStudent && (
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  ← Back to roster
                </button>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <h2 className="text-lg font-bold text-white">{selectedStudent.name}</h2>
                  <div className="flex gap-6 mt-3">
                    <div>
                      <p className="text-xs text-zinc-500">Tokens</p>
                      <p className="text-lg font-mono text-amber-400">{selectedStudent.tokens}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Skills Unlocked</p>
                      <p className="text-lg font-mono text-blue-400">{selectedStudent.skillsUnlocked}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Skills Mastered</p>
                      <p className="text-lg font-mono text-emerald-400">{selectedStudent.skillsMastered}</p>
                    </div>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-zinc-300">Games Built</h3>
                {studentGames.length === 0 ? (
                  <p className="text-sm text-zinc-500">No games yet.</p>
                ) : (
                  <div className="grid gap-2">
                    {studentGames.map(g => (
                      <div key={g.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-white">{g.title}</p>
                          <p className="text-xs text-zinc-500">{g.standardId}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          g.status === "published" ? "bg-emerald-500/20 text-emerald-400" :
                          g.status === "pending_review" ? "bg-amber-500/20 text-amber-400" :
                          "bg-zinc-700 text-zinc-400"
                        }`}>
                          {g.status === "pending_review" ? "Pending Review" : g.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {tab === "reviews" && (
              <div className="space-y-3">
                {pendingGames.length === 0 ? (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
                    <p className="text-zinc-400 text-sm">No games waiting for review.</p>
                  </div>
                ) : (
                  pendingGames.map(g => (
                    <div key={g.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white font-medium">{g.title}</p>
                        <p className="text-xs text-zinc-400">by {g.designerName} · {g.standardId}</p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-500"
                        onClick={() => handleApproveGame(g.id)}
                      >
                        Approve
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Games Tab */}
            {tab === "games" && (
              <div className="space-y-3">
                {publishedGames.length === 0 ? (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
                    <p className="text-zinc-400 text-sm">No published games yet.</p>
                  </div>
                ) : (
                  publishedGames.map(g => (
                    <div key={g.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-white font-medium">{g.title}</p>
                          <p className="text-xs text-zinc-400">by {g.designerName} · {g.standardId}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-400">
                          <span>{g.playCount || 0} plays</span>
                          {g.ratingCount > 0 && (
                            <span>{(g.ratingSum / g.ratingCount).toFixed(1)} ★</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
