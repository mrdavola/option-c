/**
 * Stickman Pose Library — Phaser-drawable version.
 *
 * The React component in `src/components/game/funny-stick-figure.tsx`
 * animates the stick figure with CSS keyframes, which only works in the
 * DOM. For in-game (Phaser Canvas/WebGL) use, we need the same poses as
 * plain data: angles for each limb at each keyframe, plus optional
 * per-pose props (ruler, board, block, etc.).
 *
 * A Phaser scene can use this by:
 *   1. Drawing line segments from the joint positions in `skeleton`.
 *   2. Interpolating `keyframes` at each frame using the pose's `duration`.
 *   3. Rendering any listed `props` at the pose's hand/reference points.
 *
 * Phase 2.1 scope: DATA ONLY. No rendering code here — that is future work.
 *
 * All angles are in DEGREES, consistent with the CSS `rotate(Xdeg)` values
 * in funny-stick-figure.tsx. Positive rotation = clockwise (CSS/SVG convention).
 * Joints are specified in SVG-style coordinates where +Y points DOWN, so
 * a Phaser renderer should negate Y or flip the coordinate system as needed.
 */

// ---------- Types ----------

/** Identifier of a body part that can be rotated / translated. */
export type Joint =
  | "body"      // torso line (hip -> shoulder), pivot at shoulder
  | "armA"      // right arm, pivot at shoulder (100, 68)
  | "armB"      // left arm, pivot at shoulder (100, 68)
  | "thighA"    // right leg, pivot at hip (100, 92)
  | "thighB"    // left leg, pivot at hip (100, 92)
  | "head"      // head circle, pivot at neck (100, 66)
  | "figure"    // whole-figure rotation (for spinning), pivot at hip

/** A single keyframe: time 0..1 and joint rotations at that time. */
export interface PoseKeyframe {
  t: number                          // normalized time 0..1 within one loop
  rotations: Partial<Record<Joint, number>>  // degrees per joint
  translate?: { x?: number; y?: number }     // whole-figure offset (px)
}

/** Optional prop drawn alongside the pose (ruler, hammer, etc.). */
export interface PoseProp {
  id: string                         // unique prop id within the pose
  kind: "line" | "rect" | "circle" | "text" | "star"
  // Prop is attached to one of these reference points. The Phaser renderer
  // should compute the prop's world position from the attachment point
  // after the stickman's current transforms are applied.
  attach: "handA" | "handB" | "head" | "feet" | "world"
  // Geometry (units = px in the 240x180 reference viewbox). All fields
  // optional; the consumer picks what applies to `kind`.
  x?: number; y?: number
  x2?: number; y2?: number           // for line
  w?: number; h?: number             // for rect
  r?: number                          // for circle/star
  text?: string                      // for text
  color?: string                     // stroke/fill color (hex)
  fill?: boolean                     // circle/rect solid vs. outline
}

/** A full animated pose. */
export interface StickmanPose {
  id: string
  label: string
  duration: number                   // seconds for one full loop
  loop: boolean
  /** The static skeleton (used as the 0-degree baseline). */
  skeleton: {
    head: { cx: number; cy: number; r: number }
    neck: { x: number; y: number }
    shoulder: { x: number; y: number }
    hip: { x: number; y: number }
    footDefault: { y: number }
  }
  /** Time-ordered keyframes for one loop. */
  keyframes: PoseKeyframe[]
  /** Optional props that render with the stickman. */
  props?: PoseProp[]
  /** Intended game genre (for picking a pose from gameplay context). */
  gameContext?: string[]
}

// ---------- Shared skeleton (matches the SVG component) ----------

const SKELETON: StickmanPose["skeleton"] = {
  head: { cx: 100, cy: 52, r: 12 },
  neck: { x: 100, y: 66 },
  shoulder: { x: 100, y: 68 },
  hip: { x: 100, y: 92 },
  footDefault: { y: 132 },
}

// Two simple walking keyframes reused by "traveling" poses. Individual
// poses can override/extend these before returning.
const WALK_KEYS: Pick<PoseKeyframe, "rotations">[] = [
  { rotations: { thighA: -28, thighB: 28 } },
  { rotations: { thighA: 28, thighB: -28 } },
]

// ---------- Pose library ----------

export const STICKMAN_POSES: Record<string, StickmanPose> = {
  // --- Original 8 (mirrored from the CSS component) ---

  walking: {
    id: "walking",
    label: "walking",
    duration: 1.1,
    loop: true,
    skeleton: SKELETON,
    keyframes: [
      { t: 0, rotations: { thighA: -28, thighB: 28 } },
      { t: 0.5, rotations: { thighA: 28, thighB: -28 } },
      { t: 1, rotations: { thighA: -28, thighB: 28 } },
    ],
    gameContext: ["race-calculate", "travel"],
  },

  dancing: {
    id: "dancing",
    label: "dancing",
    duration: 0.6,
    loop: true,
    skeleton: SKELETON,
    keyframes: [
      { t: 0, rotations: { armA: -30, armB: 60, body: -3 } },
      { t: 0.5, rotations: { armA: 60, armB: -30, body: 3 } },
      { t: 1, rotations: { armA: -30, armB: 60, body: -3 } },
    ],
    gameContext: ["celebrate", "correct-answer"],
  },

  juggling: {
    id: "juggling",
    label: "juggling",
    duration: 0.5,
    loop: true,
    skeleton: SKELETON,
    keyframes: [
      { t: 0, rotations: { armA: -50, armB: 50 } },
      { t: 0.5, rotations: { armA: -90, armB: 90 } },
      { t: 1, rotations: { armA: -50, armB: 50 } },
    ],
    props: [
      { id: "ball1", kind: "circle", attach: "world", x: 95, y: 50, r: 4, color: "#f59e0b", fill: true },
      { id: "ball2", kind: "circle", attach: "world", x: 100, y: 50, r: 4, color: "#60a5fa", fill: true },
      { id: "ball3", kind: "circle", attach: "world", x: 105, y: 50, r: 4, color: "#22c55e", fill: true },
    ],
    gameContext: ["collect-manage", "inventory"],
  },

  hammering: {
    id: "hammering",
    label: "hammering",
    duration: 0.7,
    loop: true,
    skeleton: SKELETON,
    keyframes: [
      { t: 0, rotations: { armA: -90 } },
      { t: 0.5, rotations: { armA: 0 } },
      { t: 1, rotations: { armA: -90 } },
    ],
    props: [
      { id: "hammer", kind: "rect", attach: "handA", x: -5, y: 10, w: 14, h: 6, color: "#a1a1aa", fill: true },
      { id: "anvil", kind: "rect", attach: "world", x: 62, y: 118, w: 22, h: 6, color: "#52525b", fill: true },
    ],
    gameContext: ["build-structure", "construction"],
  },

  sweeping: {
    id: "sweeping",
    label: "sweeping",
    duration: 1.0,
    loop: true,
    skeleton: SKELETON,
    keyframes: [
      { t: 0, rotations: { armA: -20 } },
      { t: 0.5, rotations: { armA: 50 } },
      { t: 1, rotations: { armA: -20 } },
    ],
    props: [
      { id: "broom", kind: "line", attach: "handA", x: 0, y: 0, x2: 25, y2: 30, color: "#a16207" },
    ],
    gameContext: ["cleanup", "wrong-answer"],
  },

  magicTrick: {
    id: "magicTrick",
    label: "magicTrick",
    duration: 1.5,
    loop: true,
    skeleton: SKELETON,
    keyframes: [
      { t: 0, rotations: { armA: -130, armB: 20 } },
      { t: 0.5, rotations: { armA: -140, armB: 0 } },
      { t: 1, rotations: { armA: -130, armB: 20 } },
    ],
    props: [
      { id: "wand", kind: "line", attach: "handA", x: 0, y: 0, x2: 0, y2: 18, color: "#71717a" },
      { id: "star", kind: "star", attach: "world", x: 125, y: 30, r: 8, color: "#fbbf24", fill: true },
    ],
    gameContext: ["reveal", "correct-answer"],
  },

  weightlifting: {
    id: "weightlifting",
    label: "weightlifting",
    duration: 1.4,
    loop: true,
    skeleton: SKELETON,
    keyframes: [
      { t: 0, rotations: { armA: -90, armB: 90 } },
      { t: 0.5, rotations: { armA: -95, armB: 95 } },
      { t: 1, rotations: { armA: -90, armB: 90 } },
    ],
    props: [
      { id: "bar", kind: "line", attach: "world", x: 75, y: 32, x2: 125, y2: 32, color: "#a1a1aa" },
    ],
    gameContext: ["strength", "levelup"],
  },

  yoga: {
    id: "yoga",
    label: "yoga",
    duration: 3.0,
    loop: true,
    skeleton: SKELETON,
    keyframes: [
      { t: 0, rotations: {} },
      { t: 0.5, rotations: {} },
      { t: 1, rotations: {} },
    ],
    gameContext: ["calm", "idle"],
  },

  // --- New math-game poses (Phase 2.1) ---

  cutting: {
    id: "cutting",
    label: "cutting",
    duration: 0.7,
    loop: true,
    skeleton: SKELETON,
    keyframes: [
      { t: 0, rotations: { armA: -80, ...rotObj(WALK_KEYS[0]) } },
      { t: 0.4, rotations: { armA: -80 } },
      { t: 0.55, rotations: { armA: 20 } },
      { t: 1, rotations: { armA: -80, ...rotObj(WALK_KEYS[1]) } },
    ],
    props: [
      { id: "knife", kind: "line", attach: "handA", x: 0, y: 0, x2: 0, y2: 14, color: "#a1a1aa" },
      { id: "board", kind: "rect", attach: "world", x: 62, y: 126, w: 40, h: 3, color: "#52525b", fill: true },
      { id: "pie", kind: "circle", attach: "world", x: 82, y: 126, r: 10, color: "#fbbf24", fill: false },
    ],
    gameContext: ["fractions", "partitioning", "split-share"],
  },

  measuring: {
    id: "measuring",
    label: "measuring",
    duration: 1.4,
    loop: true,
    skeleton: SKELETON,
    keyframes: [
      { t: 0, rotations: { armA: -70, armB: 70 } },
      { t: 0.5, rotations: { armA: -85, armB: 85 } },
      { t: 1, rotations: { armA: -70, armB: 70 } },
    ],
    props: [
      { id: "ruler", kind: "rect", attach: "world", x: 70, y: 96, w: 60, h: 6, color: "#fbbf24", fill: false },
    ],
    gameContext: ["measurement", "measure-compare", "build-measure"],
  },

  thinking: {
    id: "thinking",
    label: "thinking",
    duration: 1.6,
    loop: true,
    skeleton: SKELETON,
    keyframes: [
      { t: 0, rotations: { armA: -150, head: -4 } },
      { t: 0.5, rotations: { armA: -155, head: 4 } },
      { t: 1, rotations: { armA: -150, head: -4 } },
    ],
    props: [
      { id: "bubble", kind: "circle", attach: "world", x: 118, y: 32, r: 9, color: "#a78bfa", fill: false },
      { id: "q", kind: "text", attach: "world", x: 118, y: 36, text: "?", color: "#a78bfa" },
    ],
    gameContext: ["puzzle", "spatial-puzzles", "solve-eliminate"],
  },

  writing: {
    id: "writing",
    label: "writing",
    duration: 0.6,
    loop: true,
    skeleton: SKELETON,
    keyframes: [
      { t: 0, rotations: { armA: -55 } },
      { t: 0.25, rotations: { armA: -45 } },
      { t: 0.5, rotations: { armA: -65 } },
      { t: 0.75, rotations: { armA: -40 } },
      { t: 1, rotations: { armA: -55 } },
    ],
    props: [
      { id: "marker", kind: "line", attach: "handA", x: 0, y: 0, x2: 0, y2: 8, color: "#fbbf24" },
      { id: "board", kind: "rect", attach: "world", x: 118, y: 60, w: 40, h: 30, color: "#e4e4e7", fill: false },
    ],
    gameContext: ["calculation", "race-calculate", "arithmetic"],
  },

  stacking: {
    id: "stacking",
    label: "stacking",
    duration: 1.6,
    loop: true,
    skeleton: SKELETON,
    keyframes: [
      // reach down, grab, lift, place
      { t: 0, rotations: { armA: 70, armB: -70 } },
      { t: 0.25, rotations: { armA: 70, armB: -70 } },
      { t: 0.5, rotations: { armA: -10, armB: 10 } },
      { t: 0.75, rotations: { armA: -30, armB: 30 } },
      { t: 1, rotations: { armA: 70, armB: -70 } },
    ],
    props: [
      { id: "block", kind: "rect", attach: "handA", x: -8, y: 0, w: 16, h: 12, color: "#fbbf24", fill: false },
      { id: "stack1", kind: "rect", attach: "world", x: 118, y: 136, w: 16, h: 12, color: "#e4e4e7", fill: false },
      { id: "stack2", kind: "rect", attach: "world", x: 118, y: 124, w: 16, h: 12, color: "#e4e4e7", fill: false },
    ],
    gameContext: ["construction", "build-structure", "stacking"],
  },

  climbing: {
    id: "climbing",
    label: "climbing",
    duration: 1.2,
    loop: true,
    skeleton: SKELETON,
    keyframes: [
      { t: 0, rotations: { thighA: -35, thighB: -10, armA: -40, armB: -70 }, translate: { y: 6 } },
      { t: 0.5, rotations: { thighA: -10, thighB: -35, armA: -70, armB: -40 }, translate: { y: 0 } },
      { t: 1, rotations: { thighA: -35, thighB: -10, armA: -40, armB: -70 }, translate: { y: -6 } },
    ],
    props: [
      // Stairs drawn in world coordinates
      { id: "stair1", kind: "line", attach: "world", x: 40, y: 148, x2: 70, y2: 148, color: "#3f3f46" },
      { id: "stair2", kind: "line", attach: "world", x: 70, y: 132, x2: 110, y2: 132, color: "#3f3f46" },
      { id: "stair3", kind: "line", attach: "world", x: 110, y: 116, x2: 150, y2: 116, color: "#3f3f46" },
      { id: "stair4", kind: "line", attach: "world", x: 150, y: 100, x2: 190, y2: 100, color: "#3f3f46" },
    ],
    gameContext: ["number-line", "rise-fall", "level-up"],
  },

  spinning: {
    id: "spinning",
    label: "spinning",
    duration: 1.4,
    loop: true,
    skeleton: SKELETON,
    keyframes: [
      { t: 0, rotations: { figure: 0, armA: -90, armB: 90 } },
      { t: 0.5, rotations: { figure: 180, armA: -90, armB: 90 } },
      { t: 1, rotations: { figure: 360, armA: -90, armB: 90 } },
    ],
    gameContext: ["probability", "roll-predict", "rotation"],
  },

  shrugging: {
    id: "shrugging",
    label: "shrugging",
    duration: 0.9,
    loop: true,
    skeleton: SKELETON,
    keyframes: [
      { t: 0, rotations: { armA: -40, armB: 40 }, translate: { y: 0 } },
      { t: 0.5, rotations: { armA: -120, armB: 120 }, translate: { y: -3 } },
      { t: 1, rotations: { armA: -40, armB: 40 }, translate: { y: 0 } },
    ],
    props: [
      { id: "idk1", kind: "circle", attach: "world", x: 82, y: 48, r: 1.5, color: "#a78bfa", fill: true },
      { id: "idk2", kind: "circle", attach: "world", x: 118, y: 48, r: 1.5, color: "#a78bfa", fill: true },
    ],
    gameContext: ["wrong-answer", "confused", "idle"],
  },
}

// Utility — convert a WALK_KEYS entry to a plain rotations object. Wrapped
// so we keep that helper strictly typed even though it's just a spread.
function rotObj(k: Pick<PoseKeyframe, "rotations">): Partial<Record<Joint, number>> {
  return k.rotations
}

/** Convenience: list of all pose ids in insertion order. */
export const STICKMAN_POSE_IDS = Object.keys(STICKMAN_POSES) as Array<keyof typeof STICKMAN_POSES>

/** Convenience: look up poses that declare a given gameContext tag. */
export function posesForContext(tag: string): StickmanPose[] {
  return Object.values(STICKMAN_POSES).filter((p) => p.gameContext?.includes(tag))
}
