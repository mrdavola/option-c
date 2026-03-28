"use client"

interface TutorialHintProps {
  message: string
  visible: boolean
  position?: "center" | "top"
}

export function TutorialHint({
  message,
  visible,
  position = "center",
}: TutorialHintProps) {
  if (!visible) return null

  return (
    <div
      className={`absolute z-10 ${
        position === "center"
          ? "top-1/3 left-1/2 -translate-x-1/2"
          : "top-20 left-1/2 -translate-x-1/2"
      }`}
    >
      <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-xl px-5 py-3 text-sm text-blue-200 animate-bounce-slow max-w-xs text-center">
        {message}
      </div>
    </div>
  )
}
