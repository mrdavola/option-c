"use client"

import { useState, useCallback, useMemo } from "react"
import type { StandardsGraph, StandardNode, NodeStatus } from "@/lib/graph-types"
import { KnowledgeGraph } from "./knowledge-graph"
import { StandardPanel } from "@/components/standard/standard-panel"

interface GraphPageProps {
  data: StandardsGraph
}

function computeInitialProgress(data: StandardsGraph): Map<string, NodeStatus> {
  const incomingPrereqs = new Set<string>()

  for (const edge of data.edges) {
    if (edge.type === "prerequisite") {
      incomingPrereqs.add(edge.target)
    }
  }

  const progressMap = new Map<string, NodeStatus>()
  for (const node of data.nodes) {
    if (incomingPrereqs.has(node.id)) {
      progressMap.set(node.id, "locked")
    } else {
      progressMap.set(node.id, "available")
    }
  }

  return progressMap
}

export function GraphPage({ data }: GraphPageProps) {
  const initialProgress = useMemo(() => computeInitialProgress(data), [data])
  const [progressMap, setProgressMap] = useState<Map<string, NodeStatus>>(initialProgress)
  const [selectedStandard, setSelectedStandard] = useState<StandardNode | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  const handleNodeClick = useCallback((nodeId: string) => {
    const status = progressMap.get(nodeId)
    if (status === "available" || status === "in_progress") {
      const node = data.nodes.find((n) => n.id === nodeId)
      if (node) {
        setSelectedStandard(node)
        setPanelOpen(true)
      }
    } else if (status === "locked") {
      console.log("Locked — need prerequisites")
    } else if (status === "unlocked") {
      console.log("Already unlocked")
    }
  }, [progressMap, data.nodes])

  return (
    <div className="h-screen w-screen">
      <KnowledgeGraph
        data={data}
        progressMap={progressMap}
        onNodeClick={handleNodeClick}
      />
      <StandardPanel
        standard={selectedStandard}
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onUnlock={(id) => { /* Task 9 will wire this */ console.log("Unlock:", id) }}
      />
    </div>
  )
}
