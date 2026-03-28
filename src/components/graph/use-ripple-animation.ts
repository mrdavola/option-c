"use client"

import { useCallback, useRef } from "react"
import type Sigma from "sigma"
import type Graph from "graphology"
import type { NodeStatus } from "@/lib/graph-types"
import { getNodeColor } from "@/lib/graph-utils"

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function lerpColor(from: string, to: string, t: number): string {
  const f = parseInt(from.slice(1), 16)
  const toVal = parseInt(to.slice(1), 16)
  const r = Math.round(lerp((f >> 16) & 255, (toVal >> 16) & 255, t))
  const g = Math.round(lerp((f >> 8) & 255, (toVal >> 8) & 255, t))
  const b = Math.round(lerp(f & 255, toVal & 255, t))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`
}

export function useRippleAnimation(
  sigma: Sigma | null,
  graph: Graph | null
) {
  const animationRef = useRef<number | null>(null)

  const triggerRipple = useCallback(
    (unlockedNodeId: string, newlyAvailableIds: string[]) => {
      if (!sigma || !graph) return

      // Cancel any in-progress animation
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }

      const DURATION = 1500
      const startTime = performance.now()

      const unlockedFinal = getNodeColor("unlocked") // #22c55e
      const availableFinal = getNodeColor("available") // #4a9eff
      const dimGray = "#333333"
      const flashWhite = "#ffffff"

      function animate(now: number) {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / DURATION, 1)

        // Phase 1 (0-500ms): Ignite — unlocked node flashes white then settles to green
        if (progress <= 1 / 3) {
          const phaseT = progress / (1 / 3) // 0..1 within phase
          if (phaseT < 0.5) {
            // Flash toward white
            const t = phaseT / 0.5
            graph!.setNodeAttribute(unlockedNodeId, "color", lerpColor(dimGray, flashWhite, t))
          } else {
            // Settle from white to green
            const t = (phaseT - 0.5) / 0.5
            graph!.setNodeAttribute(unlockedNodeId, "color", lerpColor(flashWhite, unlockedFinal, t))
          }
        }

        // Phase 2 (500-1000ms): Ripple — newly available nodes dim gray -> blue, size 3 -> 5
        if (progress > 1 / 3 && progress <= 2 / 3) {
          const phaseT = (progress - 1 / 3) / (1 / 3)
          for (const nodeId of newlyAvailableIds) {
            graph!.setNodeAttribute(nodeId, "color", lerpColor(dimGray, availableFinal, phaseT))
            graph!.setNodeAttribute(nodeId, "size", lerp(3, 5, phaseT))
          }
          // Ensure unlocked node is at final color
          graph!.setNodeAttribute(unlockedNodeId, "color", unlockedFinal)
        }

        // Phase 3 (1000-1500ms): Settle — all nodes reach final state
        if (progress > 2 / 3) {
          graph!.setNodeAttribute(unlockedNodeId, "color", unlockedFinal)
          for (const nodeId of newlyAvailableIds) {
            graph!.setNodeAttribute(nodeId, "color", availableFinal)
            graph!.setNodeAttribute(nodeId, "size", 5)
          }
        }

        sigma!.refresh()

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate)
        } else {
          animationRef.current = null
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    },
    [sigma, graph]
  )

  return { triggerRipple }
}
