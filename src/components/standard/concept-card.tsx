"use client"

import type { StandardNode } from "@/lib/graph-types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ConceptCardProps {
  standard: StandardNode
  onReady: () => void
}

export function ConceptCard({ standard, onReady }: ConceptCardProps) {
  return (
    <div className="flex flex-col gap-4">
      <Badge variant="secondary" className="w-fit">
        {standard.domain}
      </Badge>

      <h2 className="text-lg font-semibold">{standard.description}</h2>

      <p className="font-mono text-xs text-muted-foreground">{standard.id}</p>

      <Card>
        <CardHeader>
          <CardTitle>What is this?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {standard.description}
          </p>
        </CardContent>
      </Card>

      <Button onClick={onReady} size="lg" className="w-full">
        I&apos;m ready &mdash; show me examples
      </Button>
    </div>
  )
}
