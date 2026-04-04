"use client"

interface GameIframeProps {
  html: string
  className?: string
}

export function GameIframe({ html, className }: GameIframeProps) {
  return (
    <iframe
      srcDoc={html}
      sandbox="allow-scripts"
      className={className}
      style={{ border: "none", width: "100%", height: "100%" }}
      title="Game"
    />
  )
}
