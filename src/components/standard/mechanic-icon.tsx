// Simple SVG thumbnails for each game mechanic.
// Shows a geometric representation of what the mechanic looks like.
// Used in the Mechanic Skeleton cards to give learners a visual preview.

interface MechanicIconProps {
  mechanicId: string
  className?: string
}

export function MechanicIcon({ mechanicId, className = "" }: MechanicIconProps) {
  const icon = MECHANIC_ICONS[mechanicId] ?? DEFAULT_ICON
  return (
    <div className={`w-full rounded-lg bg-zinc-950 flex items-center justify-center overflow-hidden ${className}`}
         style={{ aspectRatio: "16/9" }}>
      <svg viewBox="0 0 160 90" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {icon}
      </svg>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────
// Per-mechanic icons (ViewBox 160x90). White stroke/fill on dark bg.
// Kept deliberately simple — these are thumbnails, not full illustrations.
// ────────────────────────────────────────────────────────────────────────

const MECHANIC_ICONS: Record<string, React.ReactNode> = {
  // Balance scale with beam + pivot
  "balance-systems": (
    <g>
      <line x1="80" y1="30" x2="80" y2="65" stroke="white" strokeWidth="2" />
      <polygon points="72,70 88,70 80,62" fill="white" />
      <line x1="30" y1="30" x2="130" y2="30" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <rect x="20" y="32" width="25" height="4" fill="white" />
      <rect x="115" y="32" width="25" height="4" fill="white" />
      <text x="32" y="25" fill="white" fontSize="10" fontFamily="monospace">x</text>
      <text x="122" y="25" fill="white" fontSize="10" fontFamily="monospace">n</text>
    </g>
  ),
  // Conveyor/items with running sum
  "resource-management": (
    <g>
      <line x1="15" y1="65" x2="145" y2="65" stroke="white" strokeWidth="2" />
      <circle cx="30" cy="55" r="6" fill="white" opacity="0.7" />
      <circle cx="55" cy="55" r="6" fill="white" opacity="0.8" />
      <circle cx="80" cy="55" r="6" fill="white" />
      <circle cx="105" cy="55" r="6" fill="white" opacity="0.5" />
      <text x="68" y="35" fill="white" fontSize="14" fontFamily="sans-serif" fontWeight="bold">∑</text>
    </g>
  ),
  // Pie cut into fractions
  "partitioning": (
    <g>
      <circle cx="80" cy="45" r="28" fill="none" stroke="white" strokeWidth="2" />
      <line x1="80" y1="17" x2="80" y2="73" stroke="white" strokeWidth="2" />
      <line x1="52" y1="45" x2="108" y2="45" stroke="white" strokeWidth="2" />
      <path d="M 80 45 L 80 17 A 28 28 0 0 1 108 45 Z" fill="white" opacity="0.4" />
    </g>
  ),
  // Rotating/fitting shapes
  "spatial-puzzles": (
    <g>
      <rect x="55" y="25" width="24" height="24" fill="none" stroke="white" strokeWidth="2" transform="rotate(30 67 37)" />
      <polygon points="95,25 115,25 105,45" fill="none" stroke="white" strokeWidth="2" />
      <rect x="75" y="55" width="14" height="14" fill="white" opacity="0.5" />
    </g>
  ),
  // Histogram / bars
  "probability-systems": (
    <g>
      <rect x="30" y="55" width="14" height="20" fill="white" opacity="0.6" />
      <rect x="50" y="40" width="14" height="35" fill="white" opacity="0.8" />
      <rect x="70" y="30" width="14" height="45" fill="white" />
      <rect x="90" y="45" width="14" height="30" fill="white" opacity="0.7" />
      <rect x="110" y="60" width="14" height="15" fill="white" opacity="0.5" />
      <line x1="25" y1="75" x2="130" y2="75" stroke="white" strokeWidth="1" />
    </g>
  ),
  // Path/network
  "path-optimization": (
    <g>
      <circle cx="30" cy="30" r="5" fill="white" />
      <circle cx="80" cy="50" r="5" fill="white" />
      <circle cx="130" cy="25" r="5" fill="white" />
      <circle cx="110" cy="70" r="5" fill="white" />
      <line x1="30" y1="30" x2="80" y2="50" stroke="white" strokeWidth="1.5" />
      <line x1="80" y1="50" x2="130" y2="25" stroke="white" strokeWidth="1.5" />
      <line x1="80" y1="50" x2="110" y2="70" stroke="white" strokeWidth="1.5" />
      <line x1="130" y1="25" x2="110" y2="70" stroke="white" strokeWidth="1.5" strokeDasharray="3,2" />
    </g>
  ),
  // Stacked blocks
  "construction-systems": (
    <g>
      <rect x="65" y="62" width="30" height="14" fill="white" opacity="0.9" />
      <rect x="70" y="46" width="30" height="14" fill="white" opacity="0.7" />
      <rect x="60" y="30" width="30" height="14" fill="white" opacity="0.5" />
      <line x1="25" y1="20" x2="140" y2="20" stroke="white" strokeWidth="1" strokeDasharray="4,2" />
    </g>
  ),
  // Launch arc
  "motion-simulation": (
    <g>
      <path d="M 25 70 Q 80 15 135 70" fill="none" stroke="white" strokeWidth="2" strokeDasharray="3,2" />
      <circle cx="25" cy="70" r="4" fill="white" />
      <circle cx="135" cy="70" r="5" fill="none" stroke="white" strokeWidth="2" />
    </g>
  ),
  // Grid/elimination
  "constraint-puzzles": (
    <g>
      <rect x="45" y="20" width="70" height="55" fill="none" stroke="white" strokeWidth="1" />
      <line x1="45" y1="38" x2="115" y2="38" stroke="white" strokeWidth="1" />
      <line x1="45" y1="56" x2="115" y2="56" stroke="white" strokeWidth="1" />
      <line x1="68" y1="20" x2="68" y2="75" stroke="white" strokeWidth="1" />
      <line x1="91" y1="20" x2="91" y2="75" stroke="white" strokeWidth="1" />
      <line x1="48" y1="25" x2="65" y2="35" stroke="white" strokeWidth="2" />
      <line x1="65" y1="25" x2="48" y2="35" stroke="white" strokeWidth="2" />
    </g>
  ),
  // Growth / multiplication dots
  "strategy-economy": (
    <g>
      <circle cx="40" cy="60" r="5" fill="white" />
      <circle cx="70" cy="55" r="7" fill="white" />
      <circle cx="100" cy="45" r="10" fill="white" />
      <circle cx="135" cy="30" r="13" fill="white" />
      <text x="35" y="80" fill="white" fontSize="8" fontFamily="monospace">×2</text>
    </g>
  ),
  // Ruler/measurement
  "measurement-challenges": (
    <g>
      <rect x="20" y="40" width="120" height="14" fill="none" stroke="white" strokeWidth="2" />
      <line x1="30" y1="40" x2="30" y2="47" stroke="white" strokeWidth="1" />
      <line x1="50" y1="40" x2="50" y2="47" stroke="white" strokeWidth="1" />
      <line x1="70" y1="40" x2="70" y2="47" stroke="white" strokeWidth="1" />
      <line x1="90" y1="40" x2="90" y2="47" stroke="white" strokeWidth="1" />
      <line x1="110" y1="40" x2="110" y2="47" stroke="white" strokeWidth="1" />
      <line x1="130" y1="40" x2="130" y2="47" stroke="white" strokeWidth="1" />
    </g>
  ),
  // Sorted bars
  "scoring-ranking": (
    <g>
      <rect x="35" y="55" width="14" height="20" fill="white" />
      <rect x="55" y="45" width="14" height="30" fill="white" />
      <rect x="75" y="35" width="14" height="40" fill="white" />
      <rect x="95" y="25" width="14" height="50" fill="white" />
      <rect x="115" y="15" width="14" height="60" fill="white" />
    </g>
  ),
  // Clock face (timing)
  "timing-rhythm": (
    <g>
      <circle cx="80" cy="45" r="28" fill="none" stroke="white" strokeWidth="2" />
      <line x1="80" y1="45" x2="80" y2="25" stroke="white" strokeWidth="2" />
      <line x1="80" y1="45" x2="95" y2="50" stroke="white" strokeWidth="2" />
      <circle cx="80" cy="45" r="2" fill="white" />
    </g>
  ),
  // Resize / scale arrow
  "scaling-resizing": (
    <g>
      <rect x="30" y="40" width="20" height="20" fill="none" stroke="white" strokeWidth="2" />
      <rect x="85" y="25" width="45" height="45" fill="none" stroke="white" strokeWidth="2" />
      <path d="M 55 50 L 80 48 M 76 44 L 82 48 L 76 52" stroke="white" strokeWidth="1.5" fill="none" />
    </g>
  ),
  // Craft / combine
  "inventory-crafting": (
    <g>
      <rect x="30" y="35" width="18" height="18" fill="white" opacity="0.7" />
      <rect x="55" y="35" width="18" height="18" fill="white" opacity="0.7" />
      <text x="78" y="48" fill="white" fontSize="14">+</text>
      <rect x="95" y="30" width="28" height="28" fill="white" />
    </g>
  ),
  // Map grid
  "terrain-generation": (
    <g>
      <rect x="40" y="20" width="80" height="55" fill="none" stroke="white" strokeWidth="1" />
      <line x1="60" y1="20" x2="60" y2="75" stroke="white" strokeWidth="0.5" opacity="0.6" />
      <line x1="80" y1="20" x2="80" y2="75" stroke="white" strokeWidth="0.5" opacity="0.6" />
      <line x1="100" y1="20" x2="100" y2="75" stroke="white" strokeWidth="0.5" opacity="0.6" />
      <line x1="40" y1="38" x2="120" y2="38" stroke="white" strokeWidth="0.5" opacity="0.6" />
      <line x1="40" y1="56" x2="120" y2="56" stroke="white" strokeWidth="0.5" opacity="0.6" />
      <circle cx="90" cy="45" r="4" fill="white" />
    </g>
  ),
  // Auction / estimation
  "bidding-auction": (
    <g>
      <rect x="60" y="45" width="40" height="25" fill="none" stroke="white" strokeWidth="2" />
      <text x="74" y="62" fill="white" fontSize="12" fontFamily="monospace">$?</text>
      <line x1="45" y1="35" x2="115" y2="35" stroke="white" strokeWidth="1" />
    </g>
  ),
  // Number line with negative
  "above-below-zero": (
    <g>
      <line x1="20" y1="45" x2="140" y2="45" stroke="white" strokeWidth="2" />
      <text x="18" y="60" fill="white" fontSize="8">-5</text>
      <line x1="80" y1="40" x2="80" y2="50" stroke="white" strokeWidth="2" />
      <text x="76" y="35" fill="white" fontSize="10" fontFamily="monospace">0</text>
      <text x="130" y="60" fill="white" fontSize="8">+5</text>
      <circle cx="100" cy="45" r="4" fill="white" />
    </g>
  ),
  // Shape building
  "build-structure": (
    <g>
      <polygon points="80,20 100,45 80,70 60,45" fill="none" stroke="white" strokeWidth="2" />
      <rect x="30" y="35" width="20" height="20" fill="none" stroke="white" strokeWidth="1.5" />
      <polygon points="120,25 135,50 110,50" fill="none" stroke="white" strokeWidth="1.5" />
    </g>
  ),
  // Time (clock + schedule)
  "measurement-time": (
    <g>
      <circle cx="55" cy="45" r="20" fill="none" stroke="white" strokeWidth="2" />
      <line x1="55" y1="45" x2="55" y2="30" stroke="white" strokeWidth="2" />
      <line x1="55" y1="45" x2="65" y2="48" stroke="white" strokeWidth="2" />
      <rect x="90" y="30" width="45" height="30" fill="none" stroke="white" strokeWidth="1.5" />
      <line x1="90" y1="40" x2="135" y2="40" stroke="white" strokeWidth="1" />
      <line x1="90" y1="50" x2="135" y2="50" stroke="white" strokeWidth="1" />
    </g>
  ),
  // Montessori beads
  "montessori-materials": (
    <g>
      <circle cx="40" cy="45" r="5" fill="white" opacity="0.8" />
      <circle cx="54" cy="45" r="5" fill="white" opacity="0.8" />
      <circle cx="68" cy="45" r="5" fill="white" opacity="0.8" />
      <rect x="85" y="40" width="40" height="10" fill="white" rx="2" />
      <text x="128" y="48" fill="white" fontSize="10" fontFamily="monospace">×10</text>
    </g>
  ),
  // Singapore bar model
  "singapore-cpa": (
    <g>
      <rect x="30" y="35" width="50" height="18" fill="white" opacity="0.7" />
      <rect x="85" y="35" width="30" height="18" fill="white" opacity="0.4" />
      <rect x="120" y="35" width="15" height="18" fill="none" stroke="white" strokeWidth="2" strokeDasharray="3,2" />
      <text x="124" y="48" fill="white" fontSize="10">?</text>
    </g>
  ),
  // Algebra tiles
  "standard-pedagogy": (
    <g>
      <rect x="30" y="35" width="18" height="18" fill="white" opacity="0.8" />
      <rect x="50" y="35" width="18" height="18" fill="white" opacity="0.8" />
      <rect x="75" y="35" width="25" height="18" fill="none" stroke="white" strokeWidth="2" />
      <text x="83" y="48" fill="white" fontSize="10" fontFamily="monospace">x</text>
      <text x="108" y="48" fill="white" fontSize="12">=</text>
      <rect x="120" y="35" width="18" height="18" fill="white" opacity="0.6" />
    </g>
  ),
  // Middle school gaps
  "middle-school-gaps": (
    <g>
      <line x1="25" y1="45" x2="135" y2="45" stroke="white" strokeWidth="2" />
      <circle cx="80" cy="45" r="5" fill="white" />
      <path d="M 85 45 L 130 45 M 125 40 L 130 45 L 125 50" stroke="white" strokeWidth="1.5" fill="none" />
      <text x="70" y="30" fill="white" fontSize="10" fontFamily="monospace">x &gt; 5</text>
    </g>
  ),
  // Classic arcade
  "classic-overlays": (
    <g>
      <rect x="30" y="25" width="100" height="45" rx="6" fill="none" stroke="white" strokeWidth="2" />
      <circle cx="60" cy="50" r="4" fill="white" />
      <rect x="75" y="46" width="10" height="10" fill="white" />
      <circle cx="105" cy="50" r="4" fill="white" />
      <text x="72" y="80" fill="white" fontSize="8" fontFamily="monospace">ARCADE</text>
    </g>
  ),
  // Race / speed
  "race-calculate": (
    <g>
      <line x1="20" y1="55" x2="140" y2="55" stroke="white" strokeWidth="2" />
      <polygon points="45,55 35,50 35,60" fill="white" />
      <polygon points="95,55 85,50 85,60" fill="white" opacity="0.7" />
      <text x="55" y="75" fill="white" fontSize="8" fontFamily="monospace">SPEED</text>
    </g>
  ),
}

const DEFAULT_ICON = (
  <g>
    <circle cx="80" cy="45" r="22" fill="none" stroke="white" strokeWidth="2" />
    <text x="72" y="52" fill="white" fontSize="20" fontFamily="monospace">?</text>
  </g>
)
