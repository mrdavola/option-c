export interface StandardNode {
  id: string
  description: string
  domain: string
  domainCode: string
  cluster: string
  grade: string
  classification: "major" | "supporting" | "additional"
  isHub: boolean
}

export interface StandardEdge {
  source: string
  target: string
  type: "prerequisite" | "related"
}

export interface StandardsGraph {
  nodes: StandardNode[]
  edges: StandardEdge[]
}

export type NodeStatus = "locked" | "available" | "in_progress" | "unlocked" | "mastered"
