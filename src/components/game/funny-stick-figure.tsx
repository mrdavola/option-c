"use client"

import { useEffect, useState } from "react"

// A small animated stick figure that does a different funny thing
// every few seconds. Used in the BuildScreen "generating" phase so
// learners have something playful to watch while their game compiles.
//
// The figure walks across the floor while doing each action — legs
// swing in a steady gait and the whole body translates left/right.
// Yoga is the only sit-still pose.

const ACTIONS = [
  "dancing",
  "juggling",
  "hammering",
  "sweeping",
  "magicTrick",
  "weightlifting",
  "yoga",
  // --- Math-game poses (Phase 2.1) ---
  "cutting",
  "measuring",
  "thinking",
  "writing",
  "stacking",
  "climbing",
  "spinning",
  "shrugging",
] as const

type Action = (typeof ACTIONS)[number]

export function FunnyStickFigure() {
  const [action, setAction] = useState<Action>(ACTIONS[0])

  useEffect(() => {
    const interval = setInterval(() => {
      setAction((prev) => {
        const idx = ACTIONS.indexOf(prev)
        return ACTIONS[(idx + 1) % ACTIONS.length]
      })
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 240 180" width="240" height="180" xmlns="http://www.w3.org/2000/svg">
        <style>{`
          /* === Floating walk (shared by every action except yoga) ===
             Hip pivot is at (100, 92). Legs are straight — no knee bend
             — and swing in wide arcs like the figure is drifting rather
             than stepping. A slower bob adds the "floaty" feel. */
          @keyframes fsf_walk_thighA { 0%,100% { transform: rotate(-28deg); } 50% { transform: rotate(28deg); } }
          @keyframes fsf_walk_thighB { 0%,100% { transform: rotate(28deg); } 50% { transform: rotate(-28deg); } }
          @keyframes fsf_walk_bob    { 0%,100% { transform: translateY(-2px); } 50% { transform: translateY(2px); } }

          /* Whole-figure horizontal travel — bounces between two ends of
             the floor. Wider range and faster cycle so the walking
             motion is clearly visible (not just leg-waving in place). */
          @keyframes fsf_travel { 0%,100% { transform: translateX(-55px); } 50% { transform: translateX(55px); } }

          /* === Per-action arm/prop animations (overlaid on top of the walk) === */
          @keyframes fsf_dance_armA { 0%,100% { transform: rotate(-30deg); } 50% { transform: rotate(60deg); } }
          @keyframes fsf_dance_armB { 0%,100% { transform: rotate(60deg); } 50% { transform: rotate(-30deg); } }
          @keyframes fsf_dance_body { 0%,100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-2px) rotate(3deg); } }

          @keyframes fsf_juggle_armA { 0%,100% { transform: rotate(-50deg); } 50% { transform: rotate(-90deg); } }
          @keyframes fsf_juggle_armB { 0%,100% { transform: rotate(50deg); } 50% { transform: rotate(90deg); } }
          @keyframes fsf_juggle_b1 { 0%,100% { transform: translate(-15px, 0); } 50% { transform: translate(0, -30px); } }
          @keyframes fsf_juggle_b2 { 0%,100% { transform: translate(15px, 0); } 50% { transform: translate(0, -30px); } }
          @keyframes fsf_juggle_b3 { 0%,100% { transform: translate(0, -15px); } 50% { transform: translate(0, -45px); } }

          @keyframes fsf_hammer_arm  { 0%,30% { transform: rotate(-90deg); } 50%,100% { transform: rotate(0deg); } }
          @keyframes fsf_hammer_pulse { 0%,30%,100% { opacity: 0; transform: scale(0.5); } 40% { opacity: 1; transform: scale(1.4); } }

          @keyframes fsf_sweep_armA { 0%,100% { transform: rotate(-20deg); } 50% { transform: rotate(50deg); } }
          @keyframes fsf_sweep_dust { 0%,100% { transform: translateX(0); opacity: 0; } 30% { opacity: 1; } 70%,100% { transform: translateX(20px); opacity: 0; } }

          /* Magic trick: right arm raised diagonally up so the wand and
             star are clearly above and away from the body, not popping
             out of the chest. Arm pivots at shoulder (100, 68); a small
             wave between -130deg and -140deg. */
          @keyframes fsf_magic_armA { 0%,100% { transform: rotate(-130deg); } 50% { transform: rotate(-140deg); } }
          @keyframes fsf_magic_armB { 0%,100% { transform: rotate(20deg); } 50% { transform: rotate(0deg); } }
          @keyframes fsf_magic_star { 0%,100% { opacity: 0; transform: scale(0); } 50% { opacity: 1; transform: scale(1.2) rotate(180deg); } }

          @keyframes fsf_lift_armA { 0%,100% { transform: rotate(-90deg); } 50% { transform: rotate(-95deg); } }
          @keyframes fsf_lift_armB { 0%,100% { transform: rotate(90deg); } 50% { transform: rotate(95deg); } }
          @keyframes fsf_lift_bar  { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }

          @keyframes fsf_yoga_body { 0%,100% { transform: scale(1); } 50% { transform: scale(1.02); } }

          /* === New math-game poses === */

          /* cutting — right arm swings down like a chef's knife */
          @keyframes fsf_cut_arm { 0%,40% { transform: rotate(-80deg); } 55%,100% { transform: rotate(20deg); } }
          @keyframes fsf_cut_puff { 0%,40%,100% { opacity: 0; transform: scale(0.4); } 60% { opacity: 1; transform: scale(1.2); } }

          /* measuring — both arms spread wide, ruler stretches */
          @keyframes fsf_measure_armA { 0%,100% { transform: rotate(-70deg); } 50% { transform: rotate(-85deg); } }
          @keyframes fsf_measure_armB { 0%,100% { transform: rotate(70deg); } 50% { transform: rotate(85deg); } }
          @keyframes fsf_measure_ruler { 0%,100% { transform: scaleX(1); } 50% { transform: scaleX(1.1); } }

          /* thinking — hand on chin, question mark pulses */
          @keyframes fsf_think_arm { 0%,100% { transform: rotate(-150deg); } 50% { transform: rotate(-155deg); } }
          @keyframes fsf_think_q { 0%,100% { opacity: 0.4; transform: translateY(0) scale(0.9); } 50% { opacity: 1; transform: translateY(-3px) scale(1.1); } }
          @keyframes fsf_think_head { 0%,100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }

          /* writing — right arm scribbles back and forth on a board */
          @keyframes fsf_write_arm { 0%,100% { transform: rotate(-55deg); } 25% { transform: rotate(-45deg); } 50% { transform: rotate(-65deg); } 75% { transform: rotate(-40deg); } }
          @keyframes fsf_write_trail { 0%,100% { opacity: 0; transform: translateX(-4px); } 50% { opacity: 1; transform: translateX(4px); } }

          /* stacking — both arms pick up & place a block */
          @keyframes fsf_stack_armA { 0% { transform: rotate(70deg); } 25% { transform: rotate(70deg); } 50% { transform: rotate(-10deg); } 75% { transform: rotate(-30deg); } 100% { transform: rotate(70deg); } }
          @keyframes fsf_stack_armB { 0% { transform: rotate(-70deg); } 25% { transform: rotate(-70deg); } 50% { transform: rotate(10deg); } 75% { transform: rotate(30deg); } 100% { transform: rotate(-70deg); } }
          @keyframes fsf_stack_block { 0% { transform: translate(0, 28px); opacity: 1; } 25% { transform: translate(0, 28px); opacity: 1; } 50% { transform: translate(0, -6px); opacity: 1; } 75% { transform: translate(20px, 14px); opacity: 1; } 100% { transform: translate(0, 28px); opacity: 1; } }

          /* climbing — alternating leg lifts and whole-body rise */
          @keyframes fsf_climb_thighA { 0%,100% { transform: rotate(-35deg) translateY(0); } 50% { transform: rotate(-10deg) translateY(-6px); } }
          @keyframes fsf_climb_thighB { 0%,100% { transform: rotate(-10deg) translateY(-6px); } 50% { transform: rotate(-35deg) translateY(0); } }
          @keyframes fsf_climb_rise { 0% { transform: translateY(6px); } 100% { transform: translateY(-6px); } }
          @keyframes fsf_climb_armA { 0%,100% { transform: rotate(-40deg); } 50% { transform: rotate(-70deg); } }
          @keyframes fsf_climb_armB { 0%,100% { transform: rotate(-70deg); } 50% { transform: rotate(-40deg); } }

          /* spinning — pirouette, arms out */
          @keyframes fsf_spin_body { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(360deg); } }
          @keyframes fsf_spin_fig  { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          @keyframes fsf_spin_armA { 0%,100% { transform: rotate(-90deg); } }
          @keyframes fsf_spin_armB { 0%,100% { transform: rotate(90deg); } }

          /* shrugging — shoulders hop, arms flex up in "IDK" */
          @keyframes fsf_shrug_armA { 0%,100% { transform: rotate(-40deg); } 50% { transform: rotate(-120deg); } }
          @keyframes fsf_shrug_armB { 0%,100% { transform: rotate(40deg); } 50% { transform: rotate(120deg); } }
          @keyframes fsf_shrug_body { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }

          /* === Walking + travel applied on every non-yoga action === */
          .traveler { animation: fsf_travel 4s ease-in-out infinite; }
          .traveler.a-yoga, .traveler.a-spinning, .traveler.a-thinking, .traveler.a-climbing { animation: none; }

          .a-dancing .fig-thighA, .a-juggling .fig-thighA, .a-hammering .fig-thighA,
          .a-sweeping .fig-thighA, .a-magicTrick .fig-thighA, .a-weightlifting .fig-thighA,
          .a-cutting .fig-thighA, .a-measuring .fig-thighA, .a-writing .fig-thighA,
          .a-stacking .fig-thighA, .a-shrugging .fig-thighA {
            animation: fsf_walk_thighA 1.1s ease-in-out infinite; transform-origin: 100px 92px;
          }
          .a-dancing .fig-thighB, .a-juggling .fig-thighB, .a-hammering .fig-thighB,
          .a-sweeping .fig-thighB, .a-magicTrick .fig-thighB, .a-weightlifting .fig-thighB,
          .a-cutting .fig-thighB, .a-measuring .fig-thighB, .a-writing .fig-thighB,
          .a-stacking .fig-thighB, .a-shrugging .fig-thighB {
            animation: fsf_walk_thighB 1.1s ease-in-out infinite; transform-origin: 100px 92px;
          }
          .a-dancing .fig-bob, .a-juggling .fig-bob, .a-hammering .fig-bob,
          .a-sweeping .fig-bob, .a-magicTrick .fig-bob, .a-weightlifting .fig-bob,
          .a-cutting .fig-bob, .a-measuring .fig-bob, .a-writing .fig-bob,
          .a-stacking .fig-bob, .a-shrugging .fig-bob {
            animation: fsf_walk_bob 1.1s ease-in-out infinite;
          }

          /* dancing — extra body sway on top of the walk */
          .a-dancing .fig-armA { animation: fsf_dance_armA 0.6s ease-in-out infinite; transform-origin: 100px 68px; }
          .a-dancing .fig-armB { animation: fsf_dance_armB 0.6s ease-in-out infinite; transform-origin: 100px 68px; }
          .a-dancing .fig-body { animation: fsf_dance_body 0.6s ease-in-out infinite; transform-origin: 100px 80px; }

          /* juggling */
          .a-juggling .fig-armA { animation: fsf_juggle_armA 0.5s ease-in-out infinite; transform-origin: 100px 68px; }
          .a-juggling .fig-armB { animation: fsf_juggle_armB 0.5s ease-in-out infinite; transform-origin: 100px 68px; }
          .a-juggling .ball1 { animation: fsf_juggle_b1 0.8s ease-in-out infinite; }
          .a-juggling .ball2 { animation: fsf_juggle_b2 0.8s ease-in-out 0.27s infinite; }
          .a-juggling .ball3 { animation: fsf_juggle_b3 0.8s ease-in-out 0.53s infinite; }

          /* hammering */
          .a-hammering .fig-armA { animation: fsf_hammer_arm 0.7s ease-in-out infinite; transform-origin: 100px 68px; }
          .a-hammering .pulse { animation: fsf_hammer_pulse 0.7s ease-in-out infinite; transform-origin: 75px 110px; }

          /* sweeping */
          .a-sweeping .fig-armA { animation: fsf_sweep_armA 1s ease-in-out infinite; transform-origin: 100px 68px; }
          .a-sweeping .dust { animation: fsf_sweep_dust 1s ease-in-out infinite; }

          /* magicTrick */
          .a-magicTrick .fig-armA { animation: fsf_magic_armA 1.5s ease-in-out infinite; transform-origin: 100px 68px; }
          .a-magicTrick .fig-armB { animation: fsf_magic_armB 1.5s ease-in-out infinite; transform-origin: 100px 68px; }
          .a-magicTrick .star { animation: fsf_magic_star 1.5s ease-in-out infinite; transform-origin: center; }

          /* weightlifting */
          .a-weightlifting .fig-armA { animation: fsf_lift_armA 1.4s ease-in-out infinite; transform-origin: 100px 68px; }
          .a-weightlifting .fig-armB { animation: fsf_lift_armB 1.4s ease-in-out infinite; transform-origin: 100px 68px; }
          .a-weightlifting .barbell { animation: fsf_lift_bar 1.4s ease-in-out infinite; }

          /* yoga — sit still (legs are folded, no gait) */
          .a-yoga .fig-body { animation: fsf_yoga_body 3s ease-in-out infinite; transform-origin: 100px 80px; }

          /* cutting */
          .a-cutting .fig-armA { animation: fsf_cut_arm 0.7s ease-in-out infinite; transform-origin: 100px 68px; }
          .a-cutting .puff { animation: fsf_cut_puff 0.7s ease-in-out infinite; transform-origin: 80px 120px; }

          /* measuring */
          .a-measuring .fig-armA { animation: fsf_measure_armA 1.4s ease-in-out infinite; transform-origin: 100px 68px; }
          .a-measuring .fig-armB { animation: fsf_measure_armB 1.4s ease-in-out infinite; transform-origin: 100px 68px; }
          .a-measuring .ruler { animation: fsf_measure_ruler 1.4s ease-in-out infinite; transform-origin: center; }

          /* thinking */
          .a-thinking .fig-armA { animation: fsf_think_arm 1.6s ease-in-out infinite; transform-origin: 100px 68px; }
          .a-thinking .qbubble { animation: fsf_think_q 1.2s ease-in-out infinite; transform-origin: center; }
          .a-thinking .fig-body { animation: fsf_think_head 2.4s ease-in-out infinite; transform-origin: 100px 80px; }

          /* writing */
          .a-writing .fig-armA { animation: fsf_write_arm 0.6s ease-in-out infinite; transform-origin: 100px 68px; }
          .a-writing .trail { animation: fsf_write_trail 0.6s ease-in-out infinite; }

          /* stacking */
          .a-stacking .fig-armA { animation: fsf_stack_armA 1.6s ease-in-out infinite; transform-origin: 100px 68px; }
          .a-stacking .fig-armB { animation: fsf_stack_armB 1.6s ease-in-out infinite; transform-origin: 100px 68px; }
          .a-stacking .block-moving { animation: fsf_stack_block 1.6s ease-in-out infinite; }

          /* climbing */
          .a-climbing .fig-thighA { animation: fsf_climb_thighA 1.2s ease-in-out infinite; transform-origin: 100px 92px; }
          .a-climbing .fig-thighB { animation: fsf_climb_thighB 1.2s ease-in-out infinite; transform-origin: 100px 92px; }
          .a-climbing .fig-bob    { animation: fsf_climb_rise 4s linear infinite alternate; }
          .a-climbing .fig-armA { animation: fsf_climb_armA 1.2s ease-in-out infinite; transform-origin: 100px 68px; }
          .a-climbing .fig-armB { animation: fsf_climb_armB 1.2s ease-in-out infinite; transform-origin: 100px 68px; }

          /* spinning */
          .a-spinning .fig-bob { animation: fsf_spin_fig 1.4s linear infinite; transform-origin: 100px 92px; }
          .a-spinning .fig-armA { transform: rotate(-90deg); transform-origin: 100px 68px; }
          .a-spinning .fig-armB { transform: rotate(90deg); transform-origin: 100px 68px; }

          /* shrugging */
          .a-shrugging .fig-armA { animation: fsf_shrug_armA 0.9s ease-in-out infinite; transform-origin: 100px 68px; }
          .a-shrugging .fig-armB { animation: fsf_shrug_armB 0.9s ease-in-out infinite; transform-origin: 100px 68px; }
          .a-shrugging .fig-body { animation: fsf_shrug_body 0.9s ease-in-out infinite; transform-origin: 100px 80px; }
        `}</style>

        {/* Floor line */}
        <line x1="20" y1="148" x2="220" y2="148" stroke="#3f3f46" strokeWidth="1" strokeDasharray="3,3" />

        {/* Stairs for climbing — only shown when that action is active */}
        {action === "climbing" && (
          <g stroke="#3f3f46" strokeWidth="1.5" fill="none">
            <polyline points="40,148 70,148 70,132 110,132 110,116 150,116 150,100 190,100" />
          </g>
        )}

        {/* Outer "traveler" group walks back and forth across the floor.
            Yoga turns this off via .a-yoga override. */}
        <g className={`traveler a-${action}`}>
          <g className="fig-bob">
            {/* Head — faceless circle, matches the Race & Calculate baseline
                style. No eyes, no smile. */}
            <circle cx="100" cy="52" r="12" fill="none" stroke="#e4e4e7" strokeWidth="2.5" />
            {/* Body — starts at y=66 (below head), ends at hip y=92. */}
            <line className="fig-body" x1="100" y1="66" x2="100" y2="92" stroke="#e4e4e7" strokeWidth="2.5" strokeLinecap="round" />
            {/* Arms — pivot at shoulder (100, 68). The right arm (fig-armA)
                also holds the magic wand: when the magic action is active
                its rotation makes the wand point diagonally up-right past
                the head. The wand is INSIDE the rotating group so it
                visually emerges from the hand, not from the body. */}
            <g className="fig-armA">
              <line x1="100" y1="68" x2="100" y2="90" stroke="#e4e4e7" strokeWidth="2.5" strokeLinecap="round" />
              {action === "magicTrick" && (
                <>
                  <line x1="100" y1="90" x2="100" y2="108" stroke="#71717a" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="100" cy="108" r="2" fill="#fbbf24" />
                </>
              )}
              {action === "cutting" && (
                <>
                  {/* Knife — held at hand, swings with the arm */}
                  <line x1="100" y1="90" x2="100" y2="104" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" />
                  <line x1="98" y1="104" x2="102" y2="104" stroke="#e4e4e7" strokeWidth="3" strokeLinecap="round" />
                </>
              )}
              {action === "writing" && (
                <>
                  {/* Marker tip */}
                  <line x1="100" y1="90" x2="100" y2="98" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
                </>
              )}
              {action === "thinking" && (
                <>
                  {/* Forearm so hand reaches chin */}
                  <line x1="100" y1="90" x2="100" y2="100" stroke="#e4e4e7" strokeWidth="2.5" strokeLinecap="round" />
                </>
              )}
            </g>
            <g className="fig-armB">
              <line x1="100" y1="68" x2="100" y2="90" stroke="#e4e4e7" strokeWidth="2.5" strokeLinecap="round" />
            </g>

            {/* Legs — single-segment straight lines from hip to foot,
                no knees. Pivot at hip (100, 92); foot at y=132. The
                swing animation floats rather than stepping (see
                fsf_walk_thighA/B keyframes). */}
            {action === "yoga" ? (
              <>
                {/* Cross-legged sit — angled lines forming a wide triangle */}
                <line x1="100" y1="92" x2="80" y2="120" stroke="#e4e4e7" strokeWidth="3" strokeLinecap="round" />
                <line x1="100" y1="92" x2="120" y2="120" stroke="#e4e4e7" strokeWidth="3" strokeLinecap="round" />
                <line x1="80" y1="120" x2="120" y2="120" stroke="#e4e4e7" strokeWidth="3" strokeLinecap="round" />
              </>
            ) : (
              <>
                <g className="fig-thighA">
                  <line x1="100" y1="92" x2="100" y2="132" stroke="#e4e4e7" strokeWidth="3" strokeLinecap="round" />
                </g>
                <g className="fig-thighB">
                  <line x1="100" y1="92" x2="100" y2="132" stroke="#e4e4e7" strokeWidth="3" strokeLinecap="round" />
                </g>
              </>
            )}

            {/* Per-action props */}
            {action === "juggling" && (
              <>
                <circle className="ball1" cx="100" cy="50" r="4" fill="#f59e0b" />
                <circle className="ball2" cx="100" cy="50" r="4" fill="#60a5fa" />
                <circle className="ball3" cx="100" cy="50" r="4" fill="#22c55e" />
              </>
            )}
            {action === "hammering" && (
              <>
                {/* Hammer — held at hand (100, 90), striking down at the anvil */}
                <line x1="100" y1="90" x2="78" y2="108" stroke="#71717a" strokeWidth="2" strokeLinecap="round" />
                <rect x="70" y="102" width="14" height="6" rx="1" fill="#a1a1aa" />
                {/* Impact pulse */}
                <circle className="pulse" cx="73" cy="115" r="8" fill="none" stroke="#fbbf24" strokeWidth="2" />
                {/* Anvil */}
                <rect x="62" y="118" width="22" height="6" rx="1" fill="#52525b" />
              </>
            )}
            {action === "sweeping" && (
              <>
                {/* Broom — held at hand (100, 90), sweeps the floor */}
                <line x1="100" y1="90" x2="125" y2="120" stroke="#a16207" strokeWidth="2" strokeLinecap="round" />
                <line x1="120" y1="120" x2="135" y2="120" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
                <line x1="122" y1="120" x2="130" y2="128" stroke="#fbbf24" strokeWidth="1.5" />
                <line x1="125" y1="120" x2="133" y2="128" stroke="#fbbf24" strokeWidth="1.5" />
                <line x1="128" y1="120" x2="136" y2="128" stroke="#fbbf24" strokeWidth="1.5" />
                {/* Dust cloud */}
                <circle className="dust" cx="140" cy="128" r="2" fill="#71717a" opacity="0.6" />
                <circle className="dust" cx="143" cy="126" r="1.5" fill="#71717a" opacity="0.6" />
              </>
            )}
            {action === "magicTrick" && (
              <>
                {/* Magic star pulses at the wand tip. Positioned in
                    SVG-absolute coordinates (above-right of head) so it
                    stays at the tip after the arm rotates the wand. */}
                <g className="star" transform="translate(125 30)">
                  <path d="M 0 -8 L 2 -2 L 8 -2 L 3 2 L 5 8 L 0 4 L -5 8 L -3 2 L -8 -2 L -2 -2 Z" fill="#fbbf24" />
                </g>
              </>
            )}
            {action === "weightlifting" && (
              <>
                {/* Barbell — bar across both arms held overhead, above the
                    new bigger head (top at y=40) */}
                <g className="barbell">
                  <line x1="75" y1="32" x2="125" y2="32" stroke="#a1a1aa" strokeWidth="3" strokeLinecap="round" />
                  <rect x="70" y="26" width="6" height="12" rx="1" fill="#52525b" />
                  <rect x="124" y="26" width="6" height="12" rx="1" fill="#52525b" />
                </g>
              </>
            )}
            {action === "yoga" && (
              <>
                {/* Halo / serenity dots above the head (top at y=40) */}
                <circle cx="92" cy="34" r="1.5" fill="#a78bfa" />
                <circle cx="100" cy="30" r="1.5" fill="#a78bfa" />
                <circle cx="108" cy="34" r="1.5" fill="#a78bfa" />
              </>
            )}

            {/* === Math-game pose props === */}

            {action === "cutting" && (
              <>
                {/* Pie on a cutting board at figure's feet */}
                <rect x="62" y="126" width="40" height="3" rx="1" fill="#52525b" />
                <path d="M 72 126 A 10 10 0 0 1 92 126 Z" fill="none" stroke="#fbbf24" strokeWidth="2" />
                <line x1="82" y1="126" x2="82" y2="116" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="2,2" />
                {/* Puff burst when the knife lands */}
                <circle className="puff" cx="82" cy="120" r="6" fill="none" stroke="#e4e4e7" strokeWidth="1.5" opacity="0.7" />
              </>
            )}

            {action === "measuring" && (
              <>
                {/* Ruler stretched between the two hands (~y=100) */}
                <g className="ruler">
                  <rect x="70" y="96" width="60" height="6" rx="1" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
                  <line x1="80" y1="96" x2="80" y2="100" stroke="#fbbf24" strokeWidth="1" />
                  <line x1="90" y1="96" x2="90" y2="100" stroke="#fbbf24" strokeWidth="1" />
                  <line x1="100" y1="96" x2="100" y2="100" stroke="#fbbf24" strokeWidth="1" />
                  <line x1="110" y1="96" x2="110" y2="100" stroke="#fbbf24" strokeWidth="1" />
                  <line x1="120" y1="96" x2="120" y2="100" stroke="#fbbf24" strokeWidth="1" />
                </g>
              </>
            )}

            {action === "thinking" && (
              <>
                {/* Question-mark bubble above head */}
                <g className="qbubble" transform="translate(118 32)">
                  <circle cx="0" cy="0" r="9" fill="none" stroke="#a78bfa" strokeWidth="1.5" />
                  <text x="0" y="4" textAnchor="middle" fontSize="12" fill="#a78bfa" fontFamily="sans-serif" fontWeight="bold">?</text>
                </g>
              </>
            )}

            {action === "writing" && (
              <>
                {/* Chalkboard / whiteboard */}
                <rect x="118" y="60" width="40" height="30" rx="2" fill="none" stroke="#e4e4e7" strokeWidth="1.5" />
                {/* Scribble trails */}
                <line className="trail" x1="126" y1="72" x2="148" y2="72" stroke="#fbbf24" strokeWidth="1.5" />
                <line className="trail" x1="126" y1="80" x2="142" y2="80" stroke="#fbbf24" strokeWidth="1.5" />
              </>
            )}

            {action === "stacking" && (
              <>
                {/* Existing stack on the ground (2 blocks) */}
                <rect x="118" y="136" width="16" height="12" fill="none" stroke="#e4e4e7" strokeWidth="1.5" />
                <rect x="118" y="124" width="16" height="12" fill="none" stroke="#e4e4e7" strokeWidth="1.5" />
                {/* Moving block being carried */}
                <g className="block-moving">
                  <rect x="92" y="92" width="16" height="12" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
                </g>
              </>
            )}

            {action === "shrugging" && (
              <>
                {/* Small "IDK" dots framing the head */}
                <circle cx="82" cy="48" r="1.5" fill="#a78bfa" />
                <circle cx="76" cy="52" r="1.5" fill="#a78bfa" />
                <circle cx="118" cy="48" r="1.5" fill="#a78bfa" />
                <circle cx="124" cy="52" r="1.5" fill="#a78bfa" />
              </>
            )}
          </g>
        </g>
      </svg>
      <p className="text-xs text-zinc-500 italic">{labelFor(action)}</p>
    </div>
  )
}

function labelFor(action: Action): string {
  switch (action) {
    case "dancing": return "...dancing while the game compiles..."
    case "juggling": return "...juggling some bits and bytes..."
    case "hammering": return "...hammering the math into place..."
    case "sweeping": return "...sweeping up the bugs..."
    case "magicTrick": return "...doing a little magic..."
    case "weightlifting": return "...lifting heavy code..."
    case "yoga": return "...finding inner balance..."
    case "cutting": return "...slicing up some fractions..."
    case "measuring": return "...measuring twice, coding once..."
    case "thinking": return "...hmm, let me think..."
    case "writing": return "...scribbling the answer..."
    case "stacking": return "...stacking blocks of logic..."
    case "climbing": return "...climbing the number line..."
    case "spinning": return "...spinning up some probability..."
    case "shrugging": return "...honestly, no idea..."
  }
}
