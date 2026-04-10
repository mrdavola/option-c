"use client"

import { useEffect, useRef } from "react"

interface GameIframeProps {
  html: string
  className?: string
  onWin?: () => void
  onLose?: () => void
}

export function GameIframe({ html, className, onWin, onLose }: GameIframeProps) {
  const onWinRef = useRef(onWin)
  onWinRef.current = onWin
  const onLoseRef = useRef(onLose)
  onLoseRef.current = onLose

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      // Only accept messages from sandboxed iframes (origin is "null")
      // or from our own domain
      if (e.origin !== "null" && e.origin !== window.location.origin) return
      if (e.data?.type === "game_win") {
        onWinRef.current?.()
      }
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
