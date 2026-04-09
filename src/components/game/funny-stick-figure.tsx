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
          /* === Walking gait (shared by every action except yoga) ===
             Hip pivot is at (100, 108). Each leg is a thigh+shin pair
             so the knee can bend during the gait cycle. */
          @keyframes fsf_walk_thighA { 0%,100% { transform: rotate(-22deg); } 50% { transform: rotate(22deg); } }
          @keyframes fsf_walk_thighB { 0%,100% { transform: rotate(22deg); } 50% { transform: rotate(-22deg); } }
          @keyframes fsf_walk_shinA  { 0%,100% { transform: rotate(0deg); } 25% { transform: rotate(35deg); } 50% { transform: rotate(0deg); } }
          @keyframes fsf_walk_shinB  { 0%,100% { transform: rotate(0deg); } 75% { transform: rotate(35deg); } 50% { transform: rotate(0deg); } }
          @keyframes fsf_walk_bob    { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-1.5px); } }

          /* Whole-figure horizontal travel — bounces between two ends of the floor */
          @keyframes fsf_travel { 0%,100% { transform: translateX(-30px); } 50% { transform: translateX(30px); } }

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

          @keyframes fsf_magic_armA { 0%,100% { transform: rotate(-90deg); } 50% { transform: rotate(-110deg); } }
          @keyframes fsf_magic_armB { 0%,100% { transform: rotate(90deg); } 50% { transform: rotate(110deg); } }
          @keyframes fsf_magic_star { 0%,100% { opacity: 0; transform: scale(0); } 50% { opacity: 1; transform: scale(1.2) rotate(180deg); } }

          @keyframes fsf_lift_armA { 0%,100% { transform: rotate(-90deg); } 50% { transform: rotate(-95deg); } }
          @keyframes fsf_lift_armB { 0%,100% { transform: rotate(90deg); } 50% { transform: rotate(95deg); } }
          @keyframes fsf_lift_bar  { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }

          @keyframes fsf_yoga_body { 0%,100% { transform: scale(1); } 50% { transform: scale(1.02); } }

          /* === Walking + travel applied on every non-yoga action === */
          .traveler { animation: fsf_travel 6s ease-in-out infinite; }
          .traveler.a-yoga { animation: none; }

          .a-dancing .fig-thighA, .a-juggling .fig-thighA, .a-hammering .fig-thighA,
          .a-sweeping .fig-thighA, .a-magicTrick .fig-thighA, .a-weightlifting .fig-thighA {
            animation: fsf_walk_thighA 0.7s ease-in-out infinite; transform-origin: 100px 108px;
          }
          .a-dancing .fig-thighB, .a-juggling .fig-thighB, .a-hammering .fig-thighB,
          .a-sweeping .fig-thighB, .a-magicTrick .fig-thighB, .a-weightlifting .fig-thighB {
            animation: fsf_walk_thighB 0.7s ease-in-out infinite; transform-origin: 100px 108px;
          }
          .a-dancing .fig-shinA, .a-juggling .fig-shinA, .a-hammering .fig-shinA,
          .a-sweeping .fig-shinA, .a-magicTrick .fig-shinA, .a-weightlifting .fig-shinA {
            animation: fsf_walk_shinA 0.7s ease-in-out infinite; transform-origin: 100px 122px;
          }
          .a-dancing .fig-shinB, .a-juggling .fig-shinB, .a-hammering .fig-shinB,
          .a-sweeping .fig-shinB, .a-magicTrick .fig-shinB, .a-weightlifting .fig-shinB {
            animation: fsf_walk_shinB 0.7s ease-in-out infinite; transform-origin: 100px 122px;
          }
          .a-dancing .fig-bob, .a-juggling .fig-bob, .a-hammering .fig-bob,
          .a-sweeping .fig-bob, .a-magicTrick .fig-bob, .a-weightlifting .fig-bob {
            animation: fsf_walk_bob 0.7s ease-in-out infinite;
          }

          /* dancing — extra body sway on top of the walk */
          .a-dancing .fig-armA { animation: fsf_dance_armA 0.6s ease-in-out infinite; transform-origin: 100px 70px; }
          .a-dancing .fig-armB { animation: fsf_dance_armB 0.6s ease-in-out infinite; transform-origin: 100px 70px; }
          .a-dancing .fig-body { animation: fsf_dance_body 0.6s ease-in-out infinite; transform-origin: 100px 105px; }

          /* juggling */
          .a-juggling .fig-armA { animation: fsf_juggle_armA 0.5s ease-in-out infinite; transform-origin: 100px 70px; }
          .a-juggling .fig-armB { animation: fsf_juggle_armB 0.5s ease-in-out infinite; transform-origin: 100px 70px; }
          .a-juggling .ball1 { animation: fsf_juggle_b1 0.8s ease-in-out infinite; }
          .a-juggling .ball2 { animation: fsf_juggle_b2 0.8s ease-in-out 0.27s infinite; }
          .a-juggling .ball3 { animation: fsf_juggle_b3 0.8s ease-in-out 0.53s infinite; }

          /* hammering */
          .a-hammering .fig-armA { animation: fsf_hammer_arm 0.7s ease-in-out infinite; transform-origin: 100px 70px; }
          .a-hammering .pulse { animation: fsf_hammer_pulse 0.7s ease-in-out infinite; transform-origin: 75px 110px; }

          /* sweeping */
          .a-sweeping .fig-armA { animation: fsf_sweep_armA 1s ease-in-out infinite; transform-origin: 100px 70px; }
          .a-sweeping .dust { animation: fsf_sweep_dust 1s ease-in-out infinite; }

          /* magicTrick */
          .a-magicTrick .fig-armA { animation: fsf_magic_armA 1.5s ease-in-out infinite; transform-origin: 100px 70px; }
          .a-magicTrick .fig-armB { animation: fsf_magic_armB 1.5s ease-in-out infinite; transform-origin: 100px 70px; }
          .a-magicTrick .star { animation: fsf_magic_star 1.5s ease-in-out infinite; transform-origin: center; }

          /* weightlifting */
          .a-weightlifting .fig-armA { animation: fsf_lift_armA 1.4s ease-in-out infinite; transform-origin: 100px 70px; }
          .a-weightlifting .fig-armB { animation: fsf_lift_armB 1.4s ease-in-out infinite; transform-origin: 100px 70px; }
          .a-weightlifting .barbell { animation: fsf_lift_bar 1.4s ease-in-out infinite; }

          /* yoga — sit still (legs are folded, no gait) */
          .a-yoga .fig-body { animation: fsf_yoga_body 3s ease-in-out infinite; transform-origin: 100px 105px; }
        `}</style>

        {/* Floor line */}
        <line x1="20" y1="148" x2="220" y2="148" stroke="#3f3f46" strokeWidth="1" strokeDasharray="3,3" />

        {/* Outer "traveler" group walks back and forth across the floor.
            Yoga turns this off via .a-yoga override. */}
        <g className={`traveler a-${action}`}>
          <g className="fig-bob">
            {/* Head */}
            <circle cx="100" cy="55" r="9" fill="none" stroke="#e4e4e7" strokeWidth="2.5" />
            {/* Smile */}
            <path d="M 96 56 Q 100 60 104 56" fill="none" stroke="#e4e4e7" strokeWidth="1.5" strokeLinecap="round" />
            {/* Eyes */}
            <circle cx="97" cy="53" r="0.8" fill="#e4e4e7" />
            <circle cx="103" cy="53" r="0.8" fill="#e4e4e7" />
            {/* Body — neck (64) → hip (108) */}
            <line className="fig-body" x1="100" y1="64" x2="100" y2="108" stroke="#e4e4e7" strokeWidth="2.5" strokeLinecap="round" />
            {/* Arms — pivot at shoulder (100, 70) */}
            <g className="fig-armA">
              <line x1="100" y1="70" x2="100" y2="95" stroke="#e4e4e7" strokeWidth="2.5" strokeLinecap="round" />
            </g>
            <g className="fig-armB">
              <line x1="100" y1="70" x2="100" y2="95" stroke="#e4e4e7" strokeWidth="2.5" strokeLinecap="round" />
            </g>

            {/* Legs — two-segment so the knee bends during the gait cycle.
                Thigh pivots at hip (100, 108); shin pivots at knee (100, 122);
                foot is a short horizontal line at (100, 138). */}
            {action === "yoga" ? (
              <>
                {/* Cross-legged sit — two short angled legs in front */}
                <line x1="100" y1="108" x2="86" y2="125" stroke="#e4e4e7" strokeWidth="3" strokeLinecap="round" />
                <line x1="100" y1="108" x2="114" y2="125" stroke="#e4e4e7" strokeWidth="3" strokeLinecap="round" />
                <line x1="86" y1="125" x2="114" y2="125" stroke="#e4e4e7" strokeWidth="3" strokeLinecap="round" />
              </>
            ) : (
              <>
                <g className="fig-thighA">
                  <line x1="100" y1="108" x2="100" y2="122" stroke="#e4e4e7" strokeWidth="3" strokeLinecap="round" />
                  <g className="fig-shinA" style={{ transform: "translate(0,0)" }}>
                    <line x1="100" y1="122" x2="100" y2="138" stroke="#e4e4e7" strokeWidth="3" strokeLinecap="round" />
                    {/* Foot */}
                    <line x1="98" y1="138" x2="106" y2="138" stroke="#e4e4e7" strokeWidth="3" strokeLinecap="round" />
                  </g>
                </g>
                <g className="fig-thighB">
                  <line x1="100" y1="108" x2="100" y2="122" stroke="#e4e4e7" strokeWidth="3" strokeLinecap="round" />
                  <g className="fig-shinB">
                    <line x1="100" y1="122" x2="100" y2="138" stroke="#e4e4e7" strokeWidth="3" strokeLinecap="round" />
                    {/* Foot */}
                    <line x1="98" y1="138" x2="106" y2="138" stroke="#e4e4e7" strokeWidth="3" strokeLinecap="round" />
                  </g>
                </g>
              </>
            )}

            {/* Per-action props */}
            {action === "juggling" && (
              <>
                <circle className="ball1" cx="100" cy="55" r="4" fill="#f59e0b" />
                <circle className="ball2" cx="100" cy="55" r="4" fill="#60a5fa" />
                <circle className="ball3" cx="100" cy="55" r="4" fill="#22c55e" />
              </>
            )}
            {action === "hammering" && (
              <>
                {/* Hammer */}
                <line x1="100" y1="95" x2="80" y2="115" stroke="#71717a" strokeWidth="2" strokeLinecap="round" />
                <rect x="72" y="108" width="14" height="6" rx="1" fill="#a1a1aa" />
                {/* Impact pulse */}
                <circle className="pulse" cx="75" cy="110" r="8" fill="none" stroke="#fbbf24" strokeWidth="2" />
              </>
            )}
            {action === "sweeping" && (
              <>
                {/* Broom */}
                <line x1="100" y1="95" x2="125" y2="125" stroke="#a16207" strokeWidth="2" strokeLinecap="round" />
                <line x1="120" y1="125" x2="135" y2="125" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
                <line x1="122" y1="125" x2="130" y2="132" stroke="#fbbf24" strokeWidth="1.5" />
                <line x1="125" y1="125" x2="133" y2="132" stroke="#fbbf24" strokeWidth="1.5" />
                <line x1="128" y1="125" x2="136" y2="132" stroke="#fbbf24" strokeWidth="1.5" />
                {/* Dust cloud */}
                <circle className="dust" cx="140" cy="130" r="2" fill="#71717a" opacity="0.6" />
                <circle className="dust" cx="143" cy="128" r="1.5" fill="#71717a" opacity="0.6" />
              </>
            )}
            {action === "magicTrick" && (
              <>
                {/* Wand */}
                <line x1="100" y1="95" x2="115" y2="55" stroke="#71717a" strokeWidth="2" strokeLinecap="round" />
                <circle cx="115" cy="55" r="2.5" fill="#fbbf24" />
                {/* Magic star */}
                <g className="star" transform="translate(130 45)">
                  <path d="M 0 -8 L 2 -2 L 8 -2 L 3 2 L 5 8 L 0 4 L -5 8 L -3 2 L -8 -2 L -2 -2 Z" fill="#fbbf24" />
                </g>
              </>
            )}
            {action === "weightlifting" && (
              <>
                {/* Barbell — bar across both arms held overhead */}
                <g className="barbell">
                  <line x1="75" y1="40" x2="125" y2="40" stroke="#a1a1aa" strokeWidth="3" strokeLinecap="round" />
                  <rect x="70" y="34" width="6" height="12" rx="1" fill="#52525b" />
                  <rect x="124" y="34" width="6" height="12" rx="1" fill="#52525b" />
                </g>
              </>
            )}
            {action === "yoga" && (
              <>
                {/* Halo / serenity dots */}
                <circle cx="92" cy="40" r="1.5" fill="#a78bfa" />
                <circle cx="100" cy="36" r="1.5" fill="#a78bfa" />
                <circle cx="108" cy="40" r="1.5" fill="#a78bfa" />
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
  }
}
