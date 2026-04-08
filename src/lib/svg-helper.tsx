// Wraps a raw SVG string in a div that React can render via
// dangerouslySetInnerHTML. Used by mechanic-animations.tsx so we don't
// have to maintain JSX copies of every SVG separately.

import type { ReactNode } from "react"

export function dangerousSvg(svgString: string): ReactNode {
  return (
    <div
      className="w-full h-full"
      style={{ width: "100%", height: "100%" }}
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  )
}
