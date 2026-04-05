"use client"

import { useEffect, useRef } from "react"

interface GameIframeProps {
  html: string
  className?: string
  onLose?: () => void
}

export function GameIframe({ html, className, onLose }: GameIframeProps) {
  const onLoseRef = useRef(onLose)
  onLoseRef.current = onLose

  useEffect(() => {
    if (!onLoseRef.current) return
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "game_lose") {
        onLoseRef.current?.()
      }
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [])

  return (
    <iframe
      srcDoc={html}
      sandbox="allow-scripts"
      className={className}
      style={{ border: "none", width: "100%", height: "100%", overflow: "auto" }}
      scrolling="yes"
      title="Game"
    />
  )
}
