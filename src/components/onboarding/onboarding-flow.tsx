"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface OnboardingData {
  name: string
  grade: string
  interests: string[]
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void
}

const GRADES = ["K", "1", "2", "3", "4", "5", "6", "7", "8", "HS"]
const INTERESTS = [
  "Games",
  "Sports",
  "Art",
  "Music",
  "Science",
  "Building",
  "Animals",
  "Food",
  "Cooking",
  "Space",
]

function StepWrapper({
  children,
  visible,
}: {
  children: React.ReactNode
  visible: boolean
}) {
  return (
    <div
      className={`transition-all duration-500 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none absolute inset-0"
      }`}
    >
      {children}
    </div>
  )
}

function NameStep({
  value,
  onChange,
  onNext,
}: {
  value: string
  onChange: (v: string) => void
  onNext: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-3xl font-bold text-white text-center">
        What should we call you?
      </h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (value.trim()) onNext()
        }}
        className="w-full flex gap-3"
      >
        <input
          autoFocus
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your name..."
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="bg-blue-500 hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 transition-colors"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 10h10M11 6l4 4-4 4" />
          </svg>
        </button>
      </form>
    </div>
  )
}

function GradeStep({
  name,
  onSelect,
}: {
  name: string
  onSelect: (grade: string) => void
}) {
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = (grade: string) => {
    setSelected(grade)
    setTimeout(() => onSelect(grade), 200)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-3xl font-bold text-white text-center">
        Nice, {name}! What grade are you in?
      </h1>
      <div className="grid grid-cols-5 gap-3 w-full">
        {GRADES.map((grade) => (
          <button
            key={grade}
            onClick={() => handleSelect(grade)}
            className={`rounded-xl py-3 text-lg font-semibold transition-all duration-200 ${
              selected === grade
                ? "bg-blue-500 text-white scale-95"
                : "bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-700"
            }`}
          >
            {grade}
          </button>
        ))}
      </div>
    </div>
  )
}

function InterestsStep({
  selected,
  onToggle,
  onAddCustom,
  onNext,
}: {
  selected: string[]
  onToggle: (interest: string) => void
  onAddCustom: (interests: string[]) => void
  onNext: () => void
}) {
  const [showCustom, setShowCustom] = useState(false)
  const [customText, setCustomText] = useState("")

  const handleCustomSubmit = () => {
    if (!customText.trim()) return
    // Parse by commas, "and", or just whitespace-separated phrases
    const parsed = customText
      .split(/[,\n]+/)
      .map(s => s.replace(/^\s*(and|&)\s*/i, "").trim())
      .filter(s => s.length > 0 && s.length < 30)
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    if (parsed.length > 0) {
      onAddCustom(parsed)
      setCustomText("")
      setShowCustom(false)
    }
  }

  // Separate preset vs custom interests for display
  const customSelected = selected.filter(s => !INTERESTS.includes(s))

  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-3xl font-bold text-white text-center">
        What are you into? Pick a few.
      </h1>
      <div className="flex flex-wrap justify-center gap-2 w-full">
        {INTERESTS.map((interest) => {
          const isSelected = selected.includes(interest)
          return (
            <button
              key={interest}
              onClick={() => onToggle(interest)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                isSelected
                  ? "bg-blue-500/20 border-blue-500/50 text-blue-300 border"
                  : "bg-zinc-800 border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300"
              }`}
            >
              {interest}
            </button>
          )
        })}
        {customSelected.map((interest) => (
          <button
            key={interest}
            onClick={() => onToggle(interest)}
            className="rounded-full px-4 py-2 text-sm font-medium bg-blue-500/20 border-blue-500/50 text-blue-300 border transition-all duration-200"
          >
            {interest} ×
          </button>
        ))}
        {!showCustom && (
          <button
            onClick={() => setShowCustom(true)}
            className="rounded-full px-4 py-2 text-sm font-medium border border-dashed border-zinc-600 text-zinc-500 hover:text-zinc-300 hover:border-zinc-400 transition-all duration-200"
          >
            + Other...
          </button>
        )}
      </div>
      {showCustom && (
        <form
          onSubmit={(e) => { e.preventDefault(); handleCustomSubmit() }}
          className="w-full flex gap-2"
        >
          <input
            autoFocus
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="skateboarding, Roblox, dinosaurs..."
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <button
            type="submit"
            disabled={!customText.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-30 text-white rounded-xl px-4 py-2.5 text-sm transition-colors"
          >
            Add
          </button>
        </form>
      )}
      <Button
        onClick={onNext}
        size="lg"
        className="w-full"
        disabled={selected.length === 0}
      >
        Continue &rarr;
      </Button>
    </div>
  )
}

function WelcomeStep({
  name,
  conceptCount,
  onGo,
}: {
  name: string
  conceptCount: number
  onGo: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <h1 className="text-3xl font-bold text-white">
        Let&apos;s go, {name}!
      </h1>
      <p className="text-zinc-400 leading-relaxed">
        You&apos;re about to explore{" "}
        <span className="text-white font-semibold">{conceptCount}</span> math
        concepts. The glowing ones are ready for you — pick one, learn it, then
        design a game to prove you get it.
      </p>
      <Button onClick={onGo} size="lg" className="w-full text-base">
        Let&apos;s go &rarr;
      </Button>
    </div>
  )
}

export type { OnboardingData }

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    name: "",
    grade: "",
    interests: [],
  })

  const toggleInterest = (interest: string) => {
    setData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex items-center justify-center">
      <div className="max-w-md w-full px-6 relative">
        <StepWrapper visible={step === 0}>
          <NameStep
            value={data.name}
            onChange={(name) => setData((prev) => ({ ...prev, name }))}
            onNext={() => setStep(1)}
          />
        </StepWrapper>
        <StepWrapper visible={step === 1}>
          <GradeStep
            name={data.name}
            onSelect={(grade) => {
              setData((prev) => ({ ...prev, grade }))
              setStep(2)
            }}
          />
        </StepWrapper>
        <StepWrapper visible={step === 2}>
          <InterestsStep
            selected={data.interests}
            onToggle={toggleInterest}
            onAddCustom={(newInterests) => {
              setData((prev) => ({
                ...prev,
                interests: [...prev.interests, ...newInterests.filter(i => !prev.interests.includes(i))],
              }))
            }}
            onNext={() => setStep(3)}
          />
        </StepWrapper>
        <StepWrapper visible={step === 3}>
          <WelcomeStep
            name={data.name}
            conceptCount={42}
            onGo={() => onComplete(data)}
          />
        </StepWrapper>
      </div>
    </div>
  )
}
