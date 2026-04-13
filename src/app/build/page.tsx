"use client"

import { useState, useCallback } from "react"
import { useAuth } from "@/lib/auth"
import { CircuitBoardBuilder } from "@/components/standard/circuit-board-builder"
import { BuildScreen } from "@/components/game/build-screen"
import { Workshop } from "@/components/game/workshop"
import type { GameDesignDoc } from "@/lib/game-types"
import { doc, setDoc, collection, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Eureka / "Build NOW!" page.
// Uses the same Game Assembler as the moon pathway, but in eureka mode.

type BuildMode = "assembler" | "building" | "workshop"

export default function BuildPage() {
  const { activeProfile } = useAuth()
  const [buildMode, setBuildMode] = useState<BuildMode>("assembler")
  const [currentDesignDoc, setCurrentDesignDoc] = useState<GameDesignDoc | null>(null)
  const [currentGameHtml, setCurrentGameHtml] = useState("")
  const [currentGameId, setCurrentGameId] = useState<string | null>(null)
  const [selectedMechanicId, setSelectedMechanicId] = useState<string | null>(null)

  if (!activeProfile) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400">Sign in to build a game!</p>
      </div>
    )
  }

  const handleBuildGame = (designDoc: GameDesignDoc, summary: string, vibe: string, mechanicId: string) => {
    setCurrentDesignDoc(designDoc)
    setSelectedMechanicId(mechanicId)
    setBuildMode("building")
  }

  const handleBuildComplete = (html: string) => {
    setCurrentGameHtml(html)
    setCurrentGameId(null)
    setBuildMode("workshop")
  }

  const handleBackToPlanet = async (html: string, gameId: string | null) => {
    // Save draft
    try {
      const gamesRef = collection(db, "games")
      const id = gameId || doc(gamesRef).id
      const ref = doc(db, "games", id)
      const safeDoc = currentDesignDoc ? JSON.parse(JSON.stringify(currentDesignDoc)) : {}
      await setDoc(ref, {
        id,
        title: currentDesignDoc?.title || "Untitled",
        designerName: activeProfile?.name || "Learner",
        authorUid: activeProfile?.uid || "",
        classId: activeProfile?.classId || "",
        standardId: currentDesignDoc?.standardId || "",
        gameHtml: html,
        designDoc: safeDoc,
        status: "draft",
        updatedAt: Date.now(),
      }, { merge: true })
    } catch {}
    setBuildMode("assembler")
  }

  const handleSendForReview = async (html: string, gameId: string | null) => {
    try {
      const gamesRef = collection(db, "games")
      const id = gameId || doc(gamesRef).id
      const ref = doc(db, "games", id)
      const safeDoc = currentDesignDoc ? JSON.parse(JSON.stringify(currentDesignDoc)) : {}
      await setDoc(ref, {
        id,
        title: currentDesignDoc?.title || "Untitled",
        designerName: activeProfile?.name || "Learner",
        authorUid: activeProfile?.uid || "",
        classId: activeProfile?.classId || "",
        standardId: currentDesignDoc?.standardId || "",
        gameHtml: html,
        designDoc: safeDoc,
        status: "pending_review",
        updatedAt: Date.now(),
      }, { merge: true })
    } catch {}
    // Go back to assembler after submit
    setBuildMode("assembler")
  }

  // Building phase
  if (buildMode === "building" && currentDesignDoc) {
    return (
      <BuildScreen
        designDoc={currentDesignDoc}
        onComplete={(html) => handleBuildComplete(html)}
        preSelectedVibe="default"
        mechanicId={selectedMechanicId || undefined}
      />
    )
  }

  // Workshop/testing phase
  if (buildMode === "workshop" && currentDesignDoc) {
    return (
      <Workshop
        initialHtml={currentGameHtml}
        designDoc={currentDesignDoc}
        gameId={currentGameId}
        onBackToPlanet={handleBackToPlanet}
        onSendForReview={handleSendForReview}
      />
    )
  }

  // Assembler
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-2xl mx-auto px-6 py-4">
        <div className="pb-8">
          <CircuitBoardBuilder
            mode="eureka"
            learnerGrade={activeProfile.grade || "6"}
            learnerUid={activeProfile.uid}
            onBuildGame={handleBuildGame}
            onBack={() => window.history.back()}
          />
        </div>
      </div>
    </div>
  )
}
