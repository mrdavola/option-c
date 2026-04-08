"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth"
import { collection, getDocs, query, where, doc, updateDoc, setDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  Gamepad2,
  MessageCircle,
  Plus,
  X,
  Check,
  Copy,
  RefreshCw,
  Trash2,
} from "lucide-react"
import { FeedbackInbox } from "@/components/feedback/feedback-inbox"
import { UserMenu } from "@/components/user-menu"

type Tab = "overview" | "guides" | "classes" | "students" | "games" | "feedback"

interface GuideRow {
  uid: string
  name: string
  email: string
  className: string
  classCode: string
  studentCount: number
}

interface ClassRow {
  id: string
  name: string
  code: string
  guideName: string
  studentCount: number
  gameCount: number
}

interface StudentRow {
  uid: string
  name: string
  className: string
  grade: string
  tokens: number
  lastLoginAt: number
}

interface GameRow {
  id: string
  title: string
  authorName: string
  className: string
  status: string
  plays: number
  rating: number
}

export default function AdminDashboardPage() {
  const { profile } = useAuth()
  const [tab, setTab] = useState<Tab>("overview")
  const [loading, setLoading] = useState(true)

  // Data
  const [guides, setGuides] = useState<GuideRow[]>([])
  const [classes, setClasses] = useState<ClassRow[]>([])
  const [students, setStudents] = useState<StudentRow[]>([])
  const [games, setGames] = useState<GameRow[]>([])

  // Invite form
  const [showInvite, setShowInvite] = useState(false)
  const [inviteName, setInviteName] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteClassName, setInviteClassName] = useState("")
  const [inviting, setInviting] = useState(false)
  const [inviteResult, setInviteResult] = useState<{ code: string; message: string } | null>(null)
  const [inviteError, setInviteError] = useState<string | null>(null)

  // Copied state
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Guide deletion confirmation state
  const [deletingGuide, setDeletingGuide] = useState<GuideRow | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch all users
      const usersSnap = await getDocs(collection(db, "users"))
      const allUsers = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[]

      // Fetch all classes
      const classesSnap = await getDocs(collection(db, "classes"))
      const allClasses = classesSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[]

      // Fetch all games
      const gamesSnap = await getDocs(collection(db, "games"))
      const allGames = gamesSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[]

      // Build lookup maps
      const classMap = new Map(allClasses.map((c) => [c.id, c]))
      const userMap = new Map(allUsers.map((u) => [u.uid || u.id, u]))

      // Guides
      const guideUsers = allUsers.filter((u) => u.role === "guide")
      const guideRows: GuideRow[] = guideUsers.map((g) => {
        const cls = classMap.get(g.classId)
        const studentCount = allUsers.filter(
          (u) => u.role === "student" && u.classId === g.classId
        ).length
        return {
          uid: g.uid || g.id,
          name: g.name || "Unknown",
          email: g.email || "",
          className: cls?.name || "No class",
          classCode: cls?.code || "",
          studentCount,
        }
      })
      setGuides(guideRows)

      // Classes
      const classRows: ClassRow[] = allClasses.map((c) => {
        const guide = userMap.get(c.guideUid)
        const studentCount = allUsers.filter(
          (u) => u.role === "student" && u.classId === c.id
        ).length
        const gameCount = allGames.filter((g) => g.classId === c.id).length
        return {
          id: c.id,
          name: c.name,
          code: c.code,
          guideName: guide?.name || "Unknown",
          studentCount,
          gameCount,
        }
      })
      setClasses(classRows)

      // Students
      const studentUsers = allUsers.filter((u) => u.role === "student")
      const studentRows: StudentRow[] = studentUsers.map((s) => {
        const cls = classMap.get(s.classId)
        return {
          uid: s.uid || s.id,
          name: s.name || "Unknown",
          className: cls?.name || "No class",
          grade: s.grade || "",
          tokens: s.tokens || 0,
          lastLoginAt: s.lastLoginAt || 0,
        }
      })
      setStudents(studentRows)

      // Games
      const gameRows: GameRow[] = allGames.map((g) => {
        const author = userMap.get(g.authorUid)
        const cls = classMap.get(g.classId)
        return {
          id: g.id,
          title: g.title || "Untitled",
          authorName: author?.name || g.authorName || "Unknown",
          className: cls?.name || "No class",
          status: g.status || "draft",
          plays: g.plays || 0,
          rating: g.rating || 0,
        }
      })
      setGames(gameRows)
    } catch (err) {
      console.error("Failed to fetch admin data:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviting(true)
    setInviteError(null)
    setInviteResult(null)
    try {
      // Generate invite code
      const inviteId = Array.from({ length: 12 }, () =>
        "abcdefghjkmnpqrstuvwxyz23456789"[Math.floor(Math.random() * 32)]
      ).join("")

      // Save invite to Firestore
      await setDoc(doc(db, "invites", inviteId), {
        createdAt: Date.now(),
        createdBy: profile?.uid || "",
        used: false,
      })

      const link = `${window.location.origin}/guide/signup?invite=${inviteId}`
      setInviteResult({
        code: link,
        message: `Send this link to the guide. They'll create their own account and class.`,
      })
      setInviteName("")
      setInviteEmail("")
      setInviteClassName("")
    } catch (err: any) {
      setInviteError(err.message)
    } finally {
      setInviting(false)
    }
  }

  const handleDeleteGuide = async () => {
    if (!deletingGuide) return
    if (deleteConfirmText.trim() !== deletingGuide.name) return
    setDeleting(true)
    try {
      // Just delete the guide's user doc. Classes / students / games stay
      // in place (orphaned but recoverable). The admin can re-invite later
      // and reassign if needed.
      await deleteDoc(doc(db, "users", deletingGuide.uid))
      setDeletingGuide(null)
      setDeleteConfirmText("")
      fetchData()
    } catch (err) {
      console.error("Delete guide failed:", err)
    } finally {
      setDeleting(false)
    }
  }

  const handleApproveGame = async (gameId: string) => {
    try {
      await updateDoc(doc(db, "games", gameId), { status: "approved" })
      setGames((prev) =>
        prev.map((g) => (g.id === gameId ? { ...g, status: "approved" } : g))
      )
    } catch (err) {
      console.error("Failed to approve game:", err)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const formatDate = (ts: number) => {
    if (!ts) return "Never"
    return new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <LayoutDashboard className="size-4" /> },
    { key: "guides", label: "Guides", icon: <Users className="size-4" /> },
    { key: "classes", label: "Classes", icon: <School className="size-4" /> },
    { key: "students", label: "Learners", icon: <GraduationCap className="size-4" /> },
    { key: "games", label: "Games", icon: <Gamepad2 className="size-4" /> },
    { key: "feedback", label: "Feedback", icon: <MessageCircle className="size-4" /> },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold">Option C</h1>
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-medium">
              Admin
            </span>
          </div>
          <UserMenu />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-zinc-900 rounded-xl p-1 w-fit">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.key
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
          <button
            onClick={fetchData}
            className="ml-2 p-2 text-zinc-400 hover:text-white transition-colors"
            title="Refresh data"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {tab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="Learners" value={students.length} icon={<GraduationCap className="size-5" />} />
                  <StatCard label="Guides" value={guides.length} icon={<Users className="size-5" />} />
                  <StatCard label="Classes" value={classes.length} icon={<School className="size-5" />} />
                  <StatCard label="Games" value={games.length} icon={<Gamepad2 className="size-5" />} />
                </div>

                {/* One-time token migration */}
                <TokenTopupCard />
              </div>
            )}

            {/* Guides Tab */}
            {tab === "guides" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Guides ({guides.length})</h2>
                  <Button
                    size="sm"
                    onClick={() => {
                      setShowInvite(!showInvite)
                      setInviteResult(null)
                      setInviteError(null)
                    }}
                  >
                    {showInvite ? (
                      <>
                        <X className="size-4" data-icon="inline-start" /> Cancel
                      </>
                    ) : (
                      <>
                        <Plus className="size-4" data-icon="inline-start" /> Invite New Guide
                      </>
                    )}
                  </Button>
                </div>

                {/* Invite Form */}
                {showInvite && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
                    <h3 className="font-medium text-sm text-zinc-300">Generate an invite link</h3>
                    <p className="text-zinc-500 text-xs">The guide will use this link to create their own account and class.</p>
                    <form onSubmit={handleInvite}>
                      <Button type="submit" size="sm" disabled={inviting}>
                        {inviting ? "Generating..." : "Generate Invite Link"}
                      </Button>
                    </form>
                    {inviteResult && (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 space-y-2">
                        <p className="text-emerald-400 text-sm font-medium">Invite link ready</p>
                        <p className="text-emerald-300/70 text-xs">{inviteResult.message}</p>
                        <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2">
                          <code className="text-xs text-white flex-1 break-all">{inviteResult.code}</code>
                          <button
                            onClick={() => copyCode(inviteResult.code)}
                            className="text-emerald-400 hover:text-emerald-300 p-1 shrink-0"
                          >
                            {copiedCode === inviteResult.code ? (
                              <Check className="size-4" />
                            ) : (
                              <Copy className="size-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                    {inviteError && (
                      <p className="text-red-400 text-sm">{inviteError}</p>
                    )}
                  </div>
                )}

                {/* Guides Table */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400">
                        <th className="text-left px-4 py-3 font-medium">Name</th>
                        <th className="text-left px-4 py-3 font-medium">Email</th>
                        <th className="text-left px-4 py-3 font-medium">Class</th>
                        <th className="text-left px-4 py-3 font-medium">Code</th>
                        <th className="text-right px-4 py-3 font-medium">Learners</th>
                        <th className="text-right px-4 py-3 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {guides.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                            No guides yet. Invite one above.
                          </td>
                        </tr>
                      ) : (
                        guides.map((g) => (
                          <tr key={g.uid} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                            <td className="px-4 py-3 text-white">{g.name}</td>
                            <td className="px-4 py-3 text-zinc-400">{g.email}</td>
                            <td className="px-4 py-3 text-zinc-300">{g.className}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => copyCode(g.classCode)}
                                className="font-mono text-xs bg-zinc-800 px-2 py-1 rounded hover:bg-zinc-700 transition-colors flex items-center gap-1"
                              >
                                {g.classCode}
                                {copiedCode === g.classCode ? (
                                  <Check className="size-3 text-emerald-400" />
                                ) : (
                                  <Copy className="size-3 text-zinc-500" />
                                )}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-right text-zinc-300">{g.studentCount}</td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => { setDeletingGuide(g); setDeleteConfirmText("") }}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded p-1.5 transition-colors"
                                title="Delete guide"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Classes Tab */}
            {tab === "classes" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Classes ({classes.length})</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400">
                        <th className="text-left px-4 py-3 font-medium">Name</th>
                        <th className="text-left px-4 py-3 font-medium">Code</th>
                        <th className="text-left px-4 py-3 font-medium">Guide</th>
                        <th className="text-right px-4 py-3 font-medium">Learners</th>
                        <th className="text-right px-4 py-3 font-medium">Games</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classes.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                            No classes yet.
                          </td>
                        </tr>
                      ) : (
                        classes.map((c) => (
                          <tr key={c.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                            <td className="px-4 py-3 text-white">{c.name}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => copyCode(c.code)}
                                className="font-mono text-xs bg-zinc-800 px-2 py-1 rounded hover:bg-zinc-700 transition-colors flex items-center gap-1"
                              >
                                {c.code}
                                {copiedCode === c.code ? (
                                  <Check className="size-3 text-emerald-400" />
                                ) : (
                                  <Copy className="size-3 text-zinc-500" />
                                )}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-zinc-300">{c.guideName}</td>
                            <td className="px-4 py-3 text-right text-zinc-300">{c.studentCount}</td>
                            <td className="px-4 py-3 text-right text-zinc-300">{c.gameCount}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Students Tab */}
            {tab === "students" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Learners ({students.length})</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400">
                        <th className="text-left px-4 py-3 font-medium">Name</th>
                        <th className="text-left px-4 py-3 font-medium">Class</th>
                        <th className="text-left px-4 py-3 font-medium">Grade</th>
                        <th className="text-right px-4 py-3 font-medium">Tokens</th>
                        <th className="text-right px-4 py-3 font-medium">Last Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                            No learners yet.
                          </td>
                        </tr>
                      ) : (
                        students.map((s) => (
                          <tr key={s.uid} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                            <td className="px-4 py-3 text-white">{s.name}</td>
                            <td className="px-4 py-3 text-zinc-300">{s.className}</td>
                            <td className="px-4 py-3 text-zinc-400">{s.grade || "-"}</td>
                            <td className="px-4 py-3 text-right text-zinc-300">{s.tokens}</td>
                            <td className="px-4 py-3 text-right text-zinc-400">{formatDate(s.lastLoginAt)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Feedback Tab */}
            {tab === "feedback" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">User Feedback</h2>
                <p className="text-sm text-zinc-400">
                  Messages from users. Reply directly — they&apos;ll see your reply in their inbox.
                </p>
                <FeedbackInbox mode="received" />
              </div>
            )}

            {/* Games Tab */}
            {tab === "games" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Games ({games.length})</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400">
                        <th className="text-left px-4 py-3 font-medium">Title</th>
                        <th className="text-left px-4 py-3 font-medium">Author</th>
                        <th className="text-left px-4 py-3 font-medium">Class</th>
                        <th className="text-left px-4 py-3 font-medium">Status</th>
                        <th className="text-right px-4 py-3 font-medium">Plays</th>
                        <th className="text-right px-4 py-3 font-medium">Rating</th>
                        <th className="text-right px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {games.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                            No games yet.
                          </td>
                        </tr>
                      ) : (
                        games.map((g) => (
                          <tr key={g.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                            <td className="px-4 py-3 text-white">{g.title}</td>
                            <td className="px-4 py-3 text-zinc-300">{g.authorName}</td>
                            <td className="px-4 py-3 text-zinc-400">{g.className}</td>
                            <td className="px-4 py-3">
                              <StatusBadge status={g.status} />
                            </td>
                            <td className="px-4 py-3 text-right text-zinc-300">{g.plays}</td>
                            <td className="px-4 py-3 text-right text-zinc-300">
                              {g.rating ? g.rating.toFixed(1) : "-"}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {g.status === "pending" && (
                                <Button
                                  size="xs"
                                  onClick={() => handleApproveGame(g.id)}
                                >
                                  <Check className="size-3" data-icon="inline-start" /> Approve
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete guide confirmation modal */}
      {deletingGuide && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-500/30 rounded-xl max-w-md w-full p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white">Delete this guide?</h3>
              <p className="text-sm text-zinc-300 mt-2">
                You&apos;re about to delete <span className="font-semibold text-white">{deletingGuide.name}</span>.
              </p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-200">
              <p className="font-medium mb-1">What happens:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Their guide account is removed (they can&apos;t sign in)</li>
                <li>Their class &quot;{deletingGuide.className}&quot; stays but becomes orphaned</li>
                <li>{deletingGuide.studentCount} student{deletingGuide.studentCount === 1 ? "" : "s"} stay in that class</li>
                <li>Existing games are not deleted</li>
              </ul>
              <p className="mt-2">You can re-invite them later if needed.</p>
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">
                Type <span className="text-white font-semibold">{deletingGuide.name}</span> to confirm:
              </label>
              <input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={deletingGuide.name}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                autoFocus
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => { setDeletingGuide(null); setDeleteConfirmText("") }}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-500"
                disabled={deleteConfirmText.trim() !== deletingGuide.name || deleting}
                onClick={handleDeleteGuide}
              >
                {deleting ? "Deleting..." : "Delete guide"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-zinc-400 text-sm">{label}</span>
        <span className="text-zinc-500">{icon}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}

function TokenTopupCard() {
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<{ topped: number; skipped: number; totalAwarded: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleRun = async () => {
    setRunning(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/topup-tokens", { method: "POST" })
      const data = await res.json()
      if (data.ok) {
        setResult({ topped: data.topped, skipped: data.skipped, totalAwarded: data.totalAwarded })
      } else {
        setError(data.error || "Failed")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <h3 className="text-base font-semibold text-white">Token migration</h3>
      <p className="text-sm text-zinc-400 mt-1">
        New token economy: <span className="text-amber-300">+2000</span> per approved game,{" "}
        <span className="text-amber-300">+100</span> per mastered skill.
      </p>
      <p className="text-xs text-zinc-500 mt-2">
        Run this once to retroactively credit existing learners for games they&apos;ve already had approved
        and skills they&apos;ve already mastered. Idempotent — safe to run multiple times.
      </p>
      <div className="mt-3">
        <Button onClick={handleRun} disabled={running} size="sm">
          {running ? "Running..." : "Top up existing learners"}
        </Button>
      </div>
      {result && (
        <div className="mt-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-sm">
          <p className="text-emerald-300">
            Topped up {result.topped} student{result.topped === 1 ? "" : "s"} ·{" "}
            Skipped {result.skipped} (already topped up) ·{" "}
            Total awarded: {result.totalAwarded.toLocaleString()} tokens
          </p>
        </div>
      )}
      {error && (
        <p className="mt-3 text-red-400 text-sm">{error}</p>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    approved: "bg-emerald-500/20 text-emerald-400",
    pending: "bg-amber-500/20 text-amber-400",
    draft: "bg-zinc-700/50 text-zinc-400",
    published: "bg-blue-500/20 text-blue-400",
  }
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        styles[status] || styles.draft
      }`}
    >
      {status}
    </span>
  )
}
