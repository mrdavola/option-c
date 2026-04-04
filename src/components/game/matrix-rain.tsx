"use client"

import { useEffect, useRef } from "react"

export function MatrixRain({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const fontSize = 14
    let columns = Math.floor(canvas.width / fontSize)
    let drops: number[] = Array(columns)
      .fill(0)
      .map(() => Math.random() * -50)
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789<>{}[]()=/+*-&|!@#$%^~"

    const handleResize = () => {
      resize()
      columns = Math.floor(canvas.width / fontSize)
      drops = Array(columns)
        .fill(0)
        .map(() => Math.random() * -50)
    }
    window.addEventListener("resize", handleResize)

    function draw() {
      ctx.fillStyle = "rgba(24, 24, 27, 0.05)"
      ctx.fillRect(0, 0, canvas!.width, canvas!.height)
      ctx.fillStyle = "#22c55e"
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        // Vary brightness for depth effect
        const brightness = Math.random() > 0.9 ? "#4ade80" : "#22c55e"
        ctx.fillStyle = brightness
        ctx.fillText(char, i * fontSize, drops[i] * fontSize)

        if (drops[i] * fontSize > canvas!.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }
    }

    const interval = setInterval(draw, 35)
    return () => {
      clearInterval(interval)
      window.removeEventListener("resize", resize)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className={className} />
}
