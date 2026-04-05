"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import {
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  linkWithRedirect,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth"
import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  increment,
} from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import type { UserProfile, ProgressDoc } from "@/lib/auth-types"

interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  impersonating: UserProfile | null
  activeProfile: UserProfile | null
  signInStudent: (classCode: string, name: string) => Promise<void>
  signInGuide: (email: string, password: string) => Promise<void>
  signInGuideWithGoogle: () => Promise<void>
  linkGoogleAccount: () => Promise<void>
  signOut: () => Promise<void>
  updateTokens: (delta: number) => Promise<number>
  saveProgress: (standardId: string, data: Partial<ProgressDoc>) => Promise<void>
  loadProgress: () => Promise<Map<string, ProgressDoc>>
  startImpersonating: (studentUid: string) => Promise<void>
  stopImpersonating: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const googleProvider = new GoogleAuthProvider()

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [impersonating, setImpersonating] = useState<UserProfile | null>(null)

  const activeProfile = impersonating ?? profile

  // Load user profile from Firestore (with retry and error handling)
  const loadProfile = useCallback(async (uid: string) => {
    try {
      const snap = await getDoc(doc(db, "users", uid))
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile)
      } else {
        setProfile(null)
      }
    } catch (err) {
      console.warn("Failed to load profile, will retry:", err)
      setProfile(null)
    }
  }, [])

  // Handle Google redirect result on page load
  useEffect(() => {
    getRedirectResult(auth).catch((err) => { console.error("[Auth] Redirect error:", err) })
  }, [])

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        await loadProfile(firebaseUser.uid)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [loadProfile])

  const signInStudent = useCallback(async (classCode: string, name: string) => {
    // 1. Sign in anonymously first (needed for Firestore access)
    let currentUser = auth.currentUser
    if (!currentUser) {
      const cred = await signInAnonymously(auth)
      currentUser = cred.user
    }

    // 2. Find the class by code
    const classQuery = query(
      collection(db, "classes"),
      where("code", "==", classCode.toUpperCase())
    )
    const classSnap = await getDocs(classQuery)
    if (classSnap.empty) throw new Error("Class not found. Check your code.")
    const classDoc = classSnap.docs[0]
    const classId = classDoc.id

    // 3. Check if this student already exists in this class
    const studentsQuery = query(
      collection(db, "users"),
      where("classId", "==", classId),
      where("name", "==", name.trim())
    )
    const studentSnap = await getDocs(studentsQuery)

    if (!studentSnap.empty) {
      // Returning student — update their uid to current auth uid and lastLoginAt
      const existingDoc = studentSnap.docs[0]
      const existingData = existingDoc.data()
      await setDoc(doc(db, "users", currentUser.uid), {
        ...existingData,
        uid: currentUser.uid,
        lastLoginAt: Date.now(),
      })
    } else {
      // New student
      await setDoc(doc(db, "users", currentUser.uid), {
        uid: currentUser.uid,
        name: name.trim(),
        role: "student",
        grade: "",
        interests: [],
        classId,
        tokens: 0,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
      } satisfies UserProfile)
    }

    // Reload profile
    await loadProfile(currentUser.uid)
  }, [loadProfile])

  const signInGuide = useCallback(async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    await loadProfile(cred.user.uid)
  }, [loadProfile])

  const signInGuideWithGoogle = useCallback(async () => {
    await signInWithRedirect(auth, googleProvider)
  }, [])

  const linkGoogleAccount = useCallback(async () => {
    if (!user) throw new Error("Must be signed in to link accounts.")
    await linkWithRedirect(user, googleProvider)
  }, [user])

  const handleSignOut = useCallback(async () => {
    await firebaseSignOut(auth)
    setProfile(null)
  }, [])

  const startImpersonating = useCallback(async (studentUid: string) => {
    const snap = await getDoc(doc(db, "users", studentUid))
    if (!snap.exists()) throw new Error("Student not found.")
    setImpersonating(snap.data() as UserProfile)
  }, [])

  const stopImpersonating = useCallback(() => {
    setImpersonating(null)
  }, [])

  const updateTokens = useCallback(async (delta: number): Promise<number> => {
    if (!user) throw new Error("Must be signed in to update tokens.")
    const targetUid = impersonating?.uid ?? user.uid
    const userRef = doc(db, "users", targetUid)
    await updateDoc(userRef, { tokens: increment(delta) })
    const snap = await getDoc(userRef)
    const newTotal = (snap.data() as UserProfile).tokens
    if (impersonating) {
      setImpersonating((prev) => (prev ? { ...prev, tokens: newTotal } : prev))
    } else {
      setProfile((prev) => (prev ? { ...prev, tokens: newTotal } : prev))
    }
    return newTotal
  }, [user, impersonating])

  const saveProgress = useCallback(
    async (standardId: string, data: Partial<ProgressDoc>) => {
      if (!user) throw new Error("Must be signed in to save progress.")
      const targetUid = impersonating?.uid ?? user.uid
      await setDoc(
        doc(db, "progress", targetUid, "standards", standardId),
        data,
        { merge: true }
      )
    },
    [user, impersonating]
  )

  const loadProgressFn = useCallback(async (): Promise<Map<string, ProgressDoc>> => {
    if (!user) throw new Error("Must be signed in to load progress.")
    const targetUid = impersonating?.uid ?? user.uid
    const snap = await getDocs(
      collection(db, "progress", targetUid, "standards")
    )
    const result = new Map<string, ProgressDoc>()
    snap.forEach((d) => {
      result.set(d.id, d.data() as ProgressDoc)
    })
    return result
  }, [user, impersonating])

  return (
    <AuthContext value={{
      user,
      profile,
      loading,
      impersonating,
      activeProfile,
      signInStudent,
      signInGuide,
      signInGuideWithGoogle,
      linkGoogleAccount,
      signOut: handleSignOut,
      updateTokens,
      saveProgress,
      loadProgress: loadProgressFn,
      startImpersonating,
      stopImpersonating,
    }}>
      {children}
    </AuthContext>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}
