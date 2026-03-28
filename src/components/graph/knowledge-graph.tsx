"use client"

import { useCallback, useState, useEffect } from "react"
import type { StandardsGraph, NodeStatus } from "@/lib/graph-types"
import type Sigma from "sigma"
import type Graph from "graphology"
import { useGraph } from "./use-graph"

interface KnowledgeGraphProps {
  data: StandardsGraph
  progressMap: Map<string, NodeStatus>
  onNodeClick?: (nodeId: string) => void
  onGraphReady?: (sigma: Sigma, graph: Graph) => void
}

export function KnowledgeGraph({ data, progressMap, onNodeClick, onGraphReady }: KnowledgeGraphProps) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    setContainer(node)
  }, [])

  const { sigma, graph } = useGraph(container, data, progressMap, onNodeClick)

  useEffect(() => {
    if (sigma.current && graph.current && onGraphReady) {
      onGraphReady(sigma.current, graph.current)
    }
  }, [sigma.current, graph.current, onGraphReady])

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-zinc-950"
    />
  )
}
