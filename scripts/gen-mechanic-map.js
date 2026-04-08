// Generate the standalone HTML map of all 17 game mechanics with their
// animated stick figures and matched moons. Output: ~/Desktop/mechanic-moon-map.html
//
// Run: node scripts/gen-mechanic-map.js

const fs = require("fs")
const path = require("path")
const os = require("os")

const STANDARDS_PATH = path.join(__dirname, "..", "src", "data", "standards.json")

function isClusterNode(id) {
  const parts = id.split(".")
  return parts.length === 3 && /^[A-Z]$/.test(parts[2])
}

const data = JSON.parse(fs.readFileSync(STANDARDS_PATH, "utf8"))
const moons = (data.nodes || []).filter((n) => !isClusterNode(n.id))

// 17 mechanics, each with friendly title, math domain, keyword list for
// matching to standards, and a self-contained SVG with the stick figure
// animated. Keep these in sync with src/lib/mechanic-animations.tsx.
const mechanics = [
  {
    id: "resource-management",
    title: "Collect & Manage",
    domain: "arithmetic operations",
    keywords: ["add", "subtract", "operation", "sum", "difference", "plus", "minus", "OA", "NBT"],
    svg: `<svg viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg">
<style>
  @keyframes walkRight { 0%,100%{transform:translateX(0)}50%{transform:translateX(20px)} }
  @keyframes legSwing  { 0%,100%{transform:rotate(0deg)}50%{transform:rotate(20deg)} }
  @keyframes armSwing  { 0%,100%{transform:rotate(0deg)}50%{transform:rotate(-15deg)} }
  @keyframes pop       { 0%,30%{opacity:0;transform:scale(0)}40%,100%{opacity:1;transform:scale(1)} }
  .col   { animation: walkRight 2s ease-in-out infinite; transform-origin: 35px 75px; }
  .legR  { animation: legSwing 0.6s ease-in-out infinite; transform-origin: 35px 75px; }
  .legL  { animation: legSwing 0.6s ease-in-out 0.3s infinite; transform-origin: 35px 75px; }
  .armR  { animation: armSwing 0.6s ease-in-out infinite; transform-origin: 35px 62px; }
  .item1 { animation: pop 2s ease-in-out infinite; }
  .item2 { animation: pop 2s ease-in-out 0.4s infinite; opacity: 0; }
  .item3 { animation: pop 2s ease-in-out 0.8s infinite; opacity: 0; }
</style>
<rect width="180" height="120" fill="#18181b"/>
<g class="col">
  <circle cx="35" cy="50" r="6" fill="none" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="35" y1="56" x2="35" y2="75" stroke="#e4e4e7" stroke-width="2"/>
  <line class="armR" x1="35" y1="62" x2="48" y2="58" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="35" y1="62" x2="22" y2="68" stroke="#e4e4e7" stroke-width="2"/>
  <line class="legR" x1="35" y1="75" x2="42" y2="89" stroke="#e4e4e7" stroke-width="2"/>
  <line class="legL" x1="35" y1="75" x2="28" y2="89" stroke="#e4e4e7" stroke-width="2"/>
</g>
<circle class="item1" cx="70" cy="70" r="4" fill="#f59e0b"/>
<circle class="item2" cx="90" cy="65" r="4" fill="#f59e0b"/>
<circle class="item3" cx="110" cy="70" r="4" fill="#f59e0b"/>
<rect x="120" y="30" width="50" height="22" rx="4" fill="none" stroke="#60a5fa" stroke-width="1.5"/>
<text x="145" y="45" font-size="10" fill="#60a5fa" text-anchor="middle" font-family="monospace">3 + 2</text>
<text x="90" y="110" font-size="7" fill="#71717a" text-anchor="middle">collect to add up</text>
</svg>`,
  },
  {
    id: "partitioning",
    title: "Split & Share",
    domain: "fractions and ratios",
    keywords: ["fraction", "ratio", "part", "whole", "half", "quarter", "third", "NF", "RP", "partition"],
    svg: `<svg viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg">
<style>
  @keyframes slice { 0%,40%{transform:translateY(-3px)} 50%,90%{transform:translateY(3px)} }
  @keyframes chopArm { 0%,40%{transform:rotate(-30deg)} 50%,90%{transform:rotate(0deg)} }
  @keyframes lean  { 0%,100%{transform:rotate(0deg)}50%{transform:rotate(2deg)} }
  .figure { animation: lean 1s ease-in-out infinite; transform-origin: 30px 65px; }
  .knife  { animation: slice 1s ease-in-out infinite; }
  .chopArm { animation: chopArm 1s ease-in-out infinite; transform-origin: 30px 52px; }
</style>
<rect width="180" height="120" fill="#18181b"/>
<g class="figure">
  <circle cx="30" cy="40" r="6" fill="none" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="30" y1="46" x2="30" y2="65" stroke="#e4e4e7" stroke-width="2"/>
  <line class="chopArm" x1="30" y1="52" x2="55" y2="40" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="30" y1="52" x2="15" y2="55" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="23" y1="79" x2="30" y2="65" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="30" y1="65" x2="37" y2="79" stroke="#e4e4e7" stroke-width="2"/>
</g>
<g transform="translate(100,55)">
  <circle cx="0" cy="0" r="22" fill="none" stroke="#f59e0b" stroke-width="2"/>
  <line class="knife" x1="0" y1="-22" x2="0" y2="22" stroke="#60a5fa" stroke-width="2"/>
  <text x="-12" y="5" font-size="9" fill="#e4e4e7" font-family="monospace">1/2</text>
  <text x="6" y="5" font-size="9" fill="#e4e4e7" font-family="monospace">1/2</text>
</g>
<text x="90" y="110" font-size="7" fill="#71717a" text-anchor="middle">split into equal parts</text>
</svg>`,
  },
  {
    id: "balance-systems",
    title: "Balance & Equalize",
    domain: "equations",
    keywords: ["equal", "equation", "balance", "solve", "variable", "unknown", "EE", "A-REI", "A-CED"],
    svg: `<svg viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg">
<style>
  @keyframes tilt   { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
  @keyframes drop   { 0%,60%{transform:translateY(-15px);opacity:0} 70%,100%{transform:translateY(0);opacity:1} }
  @keyframes reach  { 0%,40%{transform:rotate(0deg)} 60%,100%{transform:rotate(-40deg)} }
  @keyframes thinker{ 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
  .figure  { animation: thinker 1.4s ease-in-out infinite; transform-origin: 25px 65px; }
  .reachArm{ animation: reach 3s ease-in-out infinite; transform-origin: 25px 55px; }
  .beam    { animation: tilt 3s ease-in-out infinite; transform-origin: 100px 50px; }
  .newWeight { animation: drop 3s ease-in-out infinite; }
</style>
<rect width="180" height="120" fill="#18181b"/>
<g class="figure">
  <circle cx="25" cy="45" r="6" fill="none" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="25" y1="51" x2="25" y2="68" stroke="#e4e4e7" stroke-width="2"/>
  <line class="reachArm" x1="25" y1="55" x2="42" y2="48" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="25" y1="55" x2="14" y2="60" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="19" y1="82" x2="25" y2="68" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="25" y1="68" x2="31" y2="82" stroke="#e4e4e7" stroke-width="2"/>
</g>
<polygon points="100,70 90,85 110,85" fill="none" stroke="#e4e4e7" stroke-width="1.5"/>
<g class="beam">
  <line x1="50" y1="50" x2="150" y2="50" stroke="#e4e4e7" stroke-width="2"/>
  <rect x="58" y="38" width="12" height="12" rx="2" fill="#60a5fa" opacity="0.6"/>
  <rect x="73" y="38" width="12" height="12" rx="2" fill="#60a5fa" opacity="0.6"/>
  <rect x="118" y="38" width="12" height="12" rx="2" fill="#f59e0b" opacity="0.6"/>
  <rect class="newWeight" x="133" y="38" width="12" height="12" rx="2" fill="#f59e0b" opacity="0"/>
</g>
<text x="70" y="32" font-size="8" fill="#60a5fa" text-anchor="middle" font-family="monospace">2x</text>
<text x="130" y="32" font-size="8" fill="#f59e0b" text-anchor="middle" font-family="monospace">= ?</text>
<text x="100" y="110" font-size="7" fill="#71717a" text-anchor="middle">make both sides equal</text>
</svg>`,
  },
  {
    id: "spatial-puzzles",
    title: "Fit & Rotate",
    domain: "geometry",
    keywords: ["shape", "angle", "rotate", "symmetry", "transform", "congruent", "geometry", "G"],
    svg: `<svg viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg">
<style>
  @keyframes spin  { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }
  @keyframes slide { 0%,30%{transform:translate(20px,-10px);opacity:0.3} 60%,100%{transform:translate(0,0);opacity:1} }
  @keyframes pointArm { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(20deg)} }
  @keyframes lean  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-1.5px)} }
  .figure   { animation: lean 1s ease-in-out infinite; transform-origin: 30px 65px; }
  .pointArm { animation: pointArm 1.5s ease-in-out infinite; transform-origin: 30px 52px; }
  .rotating { animation: spin 4s linear infinite; transform-origin: 130px 55px; }
  .sliding  { animation: slide 3s ease-in-out infinite; }
</style>
<rect width="180" height="120" fill="#18181b"/>
<g class="figure">
  <circle cx="30" cy="40" r="6" fill="none" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="30" y1="46" x2="30" y2="65" stroke="#e4e4e7" stroke-width="2"/>
  <line class="pointArm" x1="30" y1="52" x2="50" y2="45" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="30" y1="52" x2="18" y2="58" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="23" y1="79" x2="30" y2="65" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="30" y1="65" x2="37" y2="79" stroke="#e4e4e7" stroke-width="2"/>
</g>
<rect x="60" y="35" width="40" height="40" rx="2" fill="none" stroke="#60a5fa" stroke-width="1" stroke-dasharray="3,2"/>
<g class="sliding">
  <polygon points="60,55 80,35 80,55" fill="#60a5fa" opacity="0.3" stroke="#60a5fa" stroke-width="1.5"/>
</g>
<g class="rotating">
  <polygon points="130,40 145,55 130,70 115,55" fill="none" stroke="#f59e0b" stroke-width="1.5"/>
</g>
<text x="100" y="110" font-size="7" fill="#71717a" text-anchor="middle">rotate to fit</text>
</svg>`,
  },
  {
    id: "probability-systems",
    title: "Roll & Predict",
    domain: "statistics and probability",
    keywords: ["probability", "chance", "data", "random", "likely", "predict", "statistics", "SP", "S-CP", "S-ID"],
    svg: `<svg viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg">
<style>
  @keyframes shake { 0%,100%{transform:translateX(-3px)} 50%{transform:translateX(3px)} }
  @keyframes roll  { 0%,20%{transform:rotate(0) translateY(0)} 40%{transform:rotate(180deg) translateY(-15px)} 60%,100%{transform:rotate(360deg) translateY(0)} }
  @keyframes shakeArm { 0%,100%{transform:rotate(-25deg)} 50%{transform:rotate(25deg)} }
  .figure  { animation: shake 0.4s ease-in-out infinite; transform-origin: 25px 55px; }
  .shakeArm{ animation: shakeArm 0.4s ease-in-out infinite; transform-origin: 25px 52px; }
  .die     { animation: roll 2s ease-in-out infinite; transform-origin: 100px 55px; }
</style>
<rect width="180" height="120" fill="#18181b"/>
<g class="figure">
  <circle cx="25" cy="40" r="6" fill="none" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="25" y1="46" x2="25" y2="65" stroke="#e4e4e7" stroke-width="2"/>
  <line class="shakeArm" x1="25" y1="52" x2="40" y2="40" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="25" y1="52" x2="14" y2="55" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="19" y1="79" x2="25" y2="65" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="25" y1="65" x2="31" y2="79" stroke="#e4e4e7" stroke-width="2"/>
</g>
<g class="die">
  <rect x="88" y="43" width="24" height="24" rx="3" fill="none" stroke="#e4e4e7" stroke-width="2"/>
  <circle cx="96" cy="51" r="2" fill="#e4e4e7"/>
  <circle cx="104" cy="59" r="2" fill="#e4e4e7"/>
  <circle cx="100" cy="55" r="2" fill="#e4e4e7"/>
</g>
<line x1="125" y1="85" x2="170" y2="85" stroke="#71717a" stroke-width="1"/>
<rect x="128" y="70" width="10" height="15" fill="#60a5fa" opacity="0.6" rx="1"/>
<rect x="142" y="55" width="10" height="30" fill="#60a5fa" opacity="0.8" rx="1"/>
<rect x="156" y="62" width="10" height="23" fill="#60a5fa" opacity="0.7" rx="1"/>
<text x="90" y="110" font-size="7" fill="#71717a" text-anchor="middle">roll and track results</text>
</svg>`,
  },
  {
    id: "path-optimization",
    title: "Navigate & Optimize",
    domain: "graph reasoning",
    keywords: ["path", "graph", "shortest", "route", "network", "vertex", "edge", "distance"],
    svg: `<svg viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg">
<style>
  @keyframes walk { 0%{offset-distance:0%} 100%{offset-distance:100%} }
  @keyframes glow { 0%,100%{stroke:#60a5fa} 50%{stroke:#22c55e} }
  @keyframes legA { 0%,100%{transform:rotate(-15deg)} 50%{transform:rotate(15deg)} }
  @keyframes legB { 0%,100%{transform:rotate(15deg)} 50%{transform:rotate(-15deg)} }
  .pathGlow { animation: glow 2s ease-in-out infinite; }
  .walker   { animation: walk 4s linear infinite; offset-path: path("M 30 80 L 70 40 L 120 60 L 155 30"); }
  .wlegA    { animation: legA 0.4s linear infinite; transform-origin: center; transform-box: fill-box; }
  .wlegB    { animation: legB 0.4s linear infinite; transform-origin: center; transform-box: fill-box; }
</style>
<rect width="180" height="120" fill="#18181b"/>
<circle cx="30" cy="80" r="5" fill="#60a5fa" opacity="0.5"/>
<circle cx="70" cy="40" r="5" fill="#60a5fa" opacity="0.5"/>
<circle cx="120" cy="60" r="5" fill="#60a5fa" opacity="0.5"/>
<circle cx="155" cy="30" r="5" fill="#22c55e" opacity="0.7"/>
<line x1="30" y1="80" x2="70" y2="40" stroke="#71717a" stroke-width="1" stroke-dasharray="3,2"/>
<line x1="70" y1="40" x2="120" y2="60" stroke="#71717a" stroke-width="1" stroke-dasharray="3,2"/>
<line x1="120" y1="60" x2="155" y2="30" stroke="#71717a" stroke-width="1" stroke-dasharray="3,2"/>
<path class="pathGlow" d="M 30 80 L 70 40 L 120 60 L 155 30" fill="none" stroke="#60a5fa" stroke-width="2"/>
<text x="45" y="55" font-size="7" fill="#f59e0b" font-family="monospace">5</text>
<text x="90" y="45" font-size="7" fill="#f59e0b" font-family="monospace">7</text>
<text x="140" y="40" font-size="7" fill="#f59e0b" font-family="monospace">4</text>
<g class="walker">
  <circle cx="0" cy="-5" r="3" fill="none" stroke="#e4e4e7" stroke-width="1.5"/>
  <line x1="0" y1="-2" x2="0" y2="5" stroke="#e4e4e7" stroke-width="1.5"/>
  <line x1="0" y1="0" x2="-4" y2="3" stroke="#e4e4e7" stroke-width="1.5"/>
  <line x1="0" y1="0" x2="4" y2="3" stroke="#e4e4e7" stroke-width="1.5"/>
  <line class="wlegA" x1="0" y1="5" x2="-3" y2="11" stroke="#e4e4e7" stroke-width="1.5"/>
  <line class="wlegB" x1="0" y1="5" x2="3" y2="11" stroke="#e4e4e7" stroke-width="1.5"/>
</g>
<text x="90" y="110" font-size="7" fill="#71717a" text-anchor="middle">find the best path</text>
</svg>`,
  },
  {
    id: "construction-systems",
    title: "Build & Measure",
    domain: "area and volume",
    keywords: ["area", "volume", "perimeter", "length", "width", "height", "square", "cube", "MD", "G-GMD"],
    svg: `<svg viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg">
<style>
  @keyframes lift { 0%,30%{transform:translateY(0)} 50%{transform:translateY(-12px)} 70%,100%{transform:translateY(0)} }
  @keyframes liftArm { 0%,30%{transform:rotate(0deg)} 50%{transform:rotate(-30deg)} 70%,100%{transform:rotate(0deg)} }
  @keyframes stack { 0%,30%{transform:translateY(0);opacity:1} 50%{transform:translateY(-22px);opacity:0.6} 70%,100%{transform:translateY(-22px);opacity:1} }
  .figure  { animation: lift 3s ease-in-out infinite; transform-origin: 30px 60px; }
  .liftArm { animation: liftArm 3s ease-in-out infinite; transform-origin: 30px 48px; }
  .block3  { animation: stack 3s ease-in-out infinite; }
</style>
<rect width="180" height="120" fill="#18181b"/>
<g class="figure">
  <circle cx="30" cy="35" r="6" fill="none" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="30" y1="41" x2="30" y2="60" stroke="#e4e4e7" stroke-width="2"/>
  <line class="liftArm" x1="30" y1="48" x2="48" y2="42" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="30" y1="48" x2="18" y2="52" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="23" y1="74" x2="30" y2="60" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="30" y1="60" x2="37" y2="74" stroke="#e4e4e7" stroke-width="2"/>
</g>
<rect x="65" y="65" width="20" height="20" fill="#60a5fa" opacity="0.3" stroke="#60a5fa" stroke-width="1"/>
<rect x="85" y="65" width="20" height="20" fill="#60a5fa" opacity="0.3" stroke="#60a5fa" stroke-width="1"/>
<rect x="65" y="45" width="20" height="20" fill="#60a5fa" opacity="0.3" stroke="#60a5fa" stroke-width="1"/>
<rect x="85" y="45" width="20" height="20" fill="#60a5fa" opacity="0.3" stroke="#60a5fa" stroke-width="1"/>
<rect class="block3" x="105" y="65" width="20" height="20" fill="#f59e0b" opacity="0.5" stroke="#f59e0b" stroke-width="1"/>
<line x1="63" y1="90" x2="107" y2="90" stroke="#f59e0b" stroke-width="1"/>
<text x="85" y="100" font-size="7" fill="#f59e0b" text-anchor="middle" font-family="monospace">2 x 3</text>
<text x="140" y="75" font-size="7" fill="#f59e0b" text-anchor="middle">area = 6</text>
</svg>`,
  },
  {
    id: "motion-simulation",
    title: "Race & Calculate",
    domain: "rates and slopes",
    keywords: ["rate", "speed", "slope", "distance", "time", "per", "unit rate", "RP", "F-IF", "F-LE"],
    svg: `<svg viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg">
<style>
  @keyframes run     { 0%{transform:translateX(0)} 100%{transform:translateX(110px)} }
  @keyframes runLegA { 0%,100%{transform:rotate(-30deg)} 50%{transform:rotate(30deg)} }
  @keyframes runLegB { 0%,100%{transform:rotate(30deg)}  50%{transform:rotate(-30deg)} }
  @keyframes runArmA { 0%,100%{transform:rotate(30deg)}  50%{transform:rotate(-30deg)} }
  @keyframes runArmB { 0%,100%{transform:rotate(-30deg)} 50%{transform:rotate(30deg)} }
  .runner { animation: run 3s linear infinite; }
  .rLegA  { animation: runLegA 0.3s linear infinite; transform-origin: 15px 75px; }
  .rLegB  { animation: runLegB 0.3s linear infinite; transform-origin: 15px 75px; }
  .rArmA  { animation: runArmA 0.3s linear infinite; transform-origin: 15px 65px; }
  .rArmB  { animation: runArmB 0.3s linear infinite; transform-origin: 15px 65px; }
</style>
<rect width="180" height="120" fill="#18181b"/>
<line x1="15" y1="80" x2="165" y2="80" stroke="#71717a" stroke-width="1"/>
<line x1="15" y1="78" x2="15" y2="82" stroke="#71717a" stroke-width="1"/>
<line x1="65" y1="78" x2="65" y2="82" stroke="#71717a" stroke-width="1"/>
<line x1="115" y1="78" x2="115" y2="82" stroke="#71717a" stroke-width="1"/>
<line x1="165" y1="78" x2="165" y2="82" stroke="#71717a" stroke-width="1"/>
<text x="15" y="92" font-size="6" fill="#71717a" text-anchor="middle">0</text>
<text x="65" y="92" font-size="6" fill="#71717a" text-anchor="middle">10</text>
<text x="115" y="92" font-size="6" fill="#71717a" text-anchor="middle">20</text>
<text x="165" y="92" font-size="6" fill="#71717a" text-anchor="middle">30m</text>
<g class="runner">
  <circle cx="15" cy="55" r="6" fill="none" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="15" y1="61" x2="15" y2="75" stroke="#e4e4e7" stroke-width="2"/>
  <line class="rArmA" x1="15" y1="65" x2="22" y2="72" stroke="#e4e4e7" stroke-width="2"/>
  <line class="rArmB" x1="15" y1="65" x2="8" y2="72" stroke="#e4e4e7" stroke-width="2"/>
  <line class="rLegA" x1="15" y1="75" x2="22" y2="80" stroke="#e4e4e7" stroke-width="2"/>
  <line class="rLegB" x1="15" y1="75" x2="8" y2="80" stroke="#e4e4e7" stroke-width="2"/>
</g>
<rect x="55" y="20" width="70" height="20" rx="4" fill="none" stroke="#60a5fa" stroke-width="1"/>
<text x="90" y="33" font-size="8" fill="#60a5fa" text-anchor="middle" font-family="monospace">10 m/sec</text>
<text x="90" y="110" font-size="7" fill="#71717a" text-anchor="middle">speed = distance / time</text>
</svg>`,
  },
  {
    id: "constraint-puzzles",
    title: "Solve & Eliminate",
    domain: "logical reasoning",
    keywords: ["logic", "reason", "if", "then", "constraint", "rule", "deduce", "MP"],
    svg: `<svg viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg">
<style>
  @keyframes nod   { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
  @keyframes scratch { 0%,100%{transform:rotate(-15deg)} 50%{transform:rotate(15deg)} }
  @keyframes crossOut { 0%,60%{opacity:0} 70%,100%{opacity:1} }
  @keyframes highlight { 0%,70%{stroke:#60a5fa} 80%,100%{stroke:#22c55e;fill:rgba(34,197,94,0.15)} }
  .figure   { animation: nod 2s ease-in-out infinite; transform-origin: 25px 60px; }
  .scratchArm { animation: scratch 1s ease-in-out infinite; transform-origin: 25px 52px; }
  .cross    { animation: crossOut 3s ease-in-out infinite; }
  .answer   { animation: highlight 3s ease-in-out infinite; }
</style>
<rect width="180" height="120" fill="#18181b"/>
<g class="figure">
  <circle cx="25" cy="40" r="6" fill="none" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="25" y1="46" x2="25" y2="62" stroke="#e4e4e7" stroke-width="2"/>
  <line class="scratchArm" x1="25" y1="52" x2="32" y2="40" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="25" y1="52" x2="14" y2="55" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="19" y1="76" x2="25" y2="62" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="25" y1="62" x2="31" y2="76" stroke="#e4e4e7" stroke-width="2"/>
</g>
<rect x="55" y="30" width="30" height="22" rx="3" fill="none" stroke="#60a5fa" stroke-width="1.5"/>
<text x="70" y="45" font-size="10" fill="#60a5fa" text-anchor="middle" font-family="monospace">A</text>
<rect x="95" y="30" width="30" height="22" rx="3" fill="none" stroke="#60a5fa" stroke-width="1.5"/>
<text x="110" y="45" font-size="10" fill="#60a5fa" text-anchor="middle" font-family="monospace">B</text>
<rect class="answer" x="135" y="30" width="30" height="22" rx="3" fill="none" stroke-width="1.5"/>
<text x="150" y="45" font-size="10" fill="#60a5fa" text-anchor="middle" font-family="monospace">C</text>
<line class="cross" x1="55" y1="30" x2="85" y2="52" stroke="#fb7185" stroke-width="2"/>
<line class="cross" x1="85" y1="30" x2="55" y2="52" stroke="#fb7185" stroke-width="2"/>
<line class="cross" x1="95" y1="30" x2="125" y2="52" stroke="#fb7185" stroke-width="2" style="animation-delay:0.3s"/>
<line class="cross" x1="125" y1="30" x2="95" y2="52" stroke="#fb7185" stroke-width="2" style="animation-delay:0.3s"/>
<text x="110" y="75" font-size="7" fill="#71717a" text-anchor="middle">rule: must be &gt; 5</text>
<text x="90" y="110" font-size="7" fill="#71717a" text-anchor="middle">eliminate wrong answers</text>
</svg>`,
  },
  {
    id: "strategy-economy",
    title: "Grow & Compound",
    domain: "exponential growth",
    keywords: ["exponent", "growth", "double", "multiply", "compound", "power", "F-LE", "F-BF"],
    svg: `<svg viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg">
<style>
  @keyframes growCurve { 0%{stroke-dashoffset:100} 100%{stroke-dashoffset:0} }
  @keyframes pop1 { 0%,30%{r:0} 40%,100%{r:3} }
  @keyframes pop2 { 0%,50%{r:0} 60%,100%{r:3} }
  @keyframes pop3 { 0%,70%{r:0} 80%,100%{r:3} }
  @keyframes excited { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
  @keyframes wave1 { 0%,100%{transform:rotate(-30deg)} 50%{transform:rotate(-60deg)} }
  @keyframes wave2 { 0%,100%{transform:rotate(30deg)} 50%{transform:rotate(60deg)} }
  .figure { animation: excited 0.6s ease-in-out infinite; transform-origin: 18px 95px; }
  .armA   { animation: wave1 0.6s ease-in-out infinite; transform-origin: 18px 80px; }
  .armB   { animation: wave2 0.6s ease-in-out infinite; transform-origin: 18px 80px; }
  .curve  { stroke-dasharray: 100; animation: growCurve 3s ease-out infinite; }
  .dot1   { animation: pop1 3s ease-out infinite; }
  .dot2   { animation: pop2 3s ease-out infinite; }
  .dot3   { animation: pop3 3s ease-out infinite; }
</style>
<rect width="180" height="120" fill="#18181b"/>
<line x1="35" y1="100" x2="170" y2="100" stroke="#71717a" stroke-width="1"/>
<line x1="35" y1="100" x2="35" y2="20" stroke="#71717a" stroke-width="1"/>
<path class="curve" d="M 35 95 Q 65 90 85 80 Q 105 65 125 45 Q 145 22 165 18" fill="none" stroke="#60a5fa" stroke-width="2"/>
<circle class="dot1" cx="85" cy="80" r="0" fill="#f59e0b"/>
<circle class="dot2" cx="125" cy="45" r="0" fill="#f59e0b"/>
<circle class="dot3" cx="165" cy="18" r="0" fill="#f59e0b"/>
<text x="85" y="112" font-size="6" fill="#71717a" text-anchor="middle">1x</text>
<text x="125" y="112" font-size="6" fill="#71717a" text-anchor="middle">2x</text>
<text x="165" y="112" font-size="6" fill="#71717a" text-anchor="middle">4x</text>
<g class="figure">
  <circle cx="18" cy="70" r="6" fill="none" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="18" y1="76" x2="18" y2="92" stroke="#e4e4e7" stroke-width="2"/>
  <line class="armA" x1="18" y1="80" x2="32" y2="70" stroke="#e4e4e7" stroke-width="2"/>
  <line class="armB" x1="18" y1="80" x2="4" y2="70" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="14" y1="106" x2="18" y2="92" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="18" y1="92" x2="22" y2="106" stroke="#e4e4e7" stroke-width="2"/>
</g>
</svg>`,
  },
  {
    id: "measurement-challenges",
    title: "Measure & Compare",
    domain: "units and measurement",
    keywords: ["measure", "unit", "length", "weight", "capacity", "convert", "estimate", "MD"],
    svg: `<svg viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg">
<style>
  @keyframes measure { 0%,100%{transform:translateX(0)} 50%{transform:translateX(35px)} }
  @keyframes lean    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-1px)} }
  @keyframes pointArm{ 0%,100%{transform:rotate(0)} 50%{transform:rotate(15deg)} }
  .figure   { animation: lean 1.2s ease-in-out infinite; transform-origin: 25px 65px; }
  .pointArm { animation: pointArm 2.5s ease-in-out infinite; transform-origin: 25px 56px; }
  .measuring{ animation: measure 2.5s ease-in-out infinite; }
</style>
<rect width="180" height="120" fill="#18181b"/>
<g class="figure">
  <circle cx="25" cy="45" r="6" fill="none" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="25" y1="51" x2="25" y2="68" stroke="#e4e4e7" stroke-width="2"/>
  <line class="pointArm" x1="25" y1="56" x2="42" y2="48" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="25" y1="56" x2="14" y2="60" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="19" y1="82" x2="25" y2="68" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="25" y1="68" x2="31" y2="82" stroke="#e4e4e7" stroke-width="2"/>
</g>
<g class="measuring">
  <rect x="50" y="52" width="80" height="8" rx="1" fill="none" stroke="#f59e0b" stroke-width="1.5"/>
  <line x1="50" y1="52" x2="50" y2="56" stroke="#f59e0b" stroke-width="1"/>
  <line x1="60" y1="52" x2="60" y2="54" stroke="#f59e0b" stroke-width="1"/>
  <line x1="70" y1="52" x2="70" y2="56" stroke="#f59e0b" stroke-width="1"/>
  <line x1="80" y1="52" x2="80" y2="54" stroke="#f59e0b" stroke-width="1"/>
  <line x1="90" y1="52" x2="90" y2="56" stroke="#f59e0b" stroke-width="1"/>
  <line x1="100" y1="52" x2="100" y2="54" stroke="#f59e0b" stroke-width="1"/>
  <line x1="110" y1="52" x2="110" y2="56" stroke="#f59e0b" stroke-width="1"/>
  <line x1="120" y1="52" x2="120" y2="54" stroke="#f59e0b" stroke-width="1"/>
  <line x1="130" y1="52" x2="130" y2="56" stroke="#f59e0b" stroke-width="1"/>
</g>
<rect x="55" y="72" width="35" height="12" rx="3" fill="#60a5fa" opacity="0.4" stroke="#60a5fa" stroke-width="1"/>
<rect x="100" y="72" width="55" height="12" rx="3" fill="#60a5fa" opacity="0.4" stroke="#60a5fa" stroke-width="1"/>
<text x="72" y="98" font-size="7" fill="#60a5fa" text-anchor="middle" font-family="monospace">3.5</text>
<text x="127" y="98" font-size="7" fill="#60a5fa" text-anchor="middle" font-family="monospace">5.5</text>
<text x="90" y="115" font-size="7" fill="#71717a" text-anchor="middle">measure and compare</text>
</svg>`,
  },
  {
    id: "scoring-ranking",
    title: "Score & Rank",
    domain: "ordering and comparison",
    keywords: ["order", "compare", "greater", "less", "rank", "sort", "number sense", "CC", "NBT"],
    svg: `<svg viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg">
<style>
  @keyframes celebrate { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
  @keyframes raise { 0%,100%{transform:rotate(-60deg)} 50%{transform:rotate(-90deg)} }
  .winner { animation: celebrate 1s ease-in-out infinite; transform-origin: 97px 60px; }
  .winnerArm { animation: raise 1s ease-in-out infinite; transform-origin: 97px 35px; }
</style>
<rect width="180" height="120" fill="#18181b"/>
<rect x="60" y="55" width="25" height="30" fill="#60a5fa" opacity="0.4" stroke="#60a5fa" stroke-width="1"/>
<rect x="85" y="40" width="25" height="45" fill="#f59e0b" opacity="0.4" stroke="#f59e0b" stroke-width="1"/>
<rect x="110" y="65" width="25" height="20" fill="#60a5fa" opacity="0.3" stroke="#60a5fa" stroke-width="1"/>
<text x="72" y="75" font-size="9" fill="#e4e4e7" text-anchor="middle" font-family="monospace">2nd</text>
<text x="97" y="60" font-size="9" fill="#f59e0b" text-anchor="middle" font-family="monospace">1st</text>
<text x="122" y="78" font-size="9" fill="#e4e4e7" text-anchor="middle" font-family="monospace">3rd</text>
<circle cx="72" cy="48" r="5" fill="none" stroke="#e4e4e7" stroke-width="1.5"/>
<line x1="72" y1="53" x2="72" y2="55" stroke="#e4e4e7" stroke-width="1.5"/>
<g class="winner">
  <circle cx="97" cy="32" r="6" fill="none" stroke="#f59e0b" stroke-width="2"/>
  <line x1="97" y1="38" x2="97" y2="40" stroke="#f59e0b" stroke-width="2"/>
  <line class="winnerArm" x1="97" y1="35" x2="105" y2="22" stroke="#f59e0b" stroke-width="2"/>
  <line x1="97" y1="35" x2="89" y2="22" stroke="#f59e0b" stroke-width="2"/>
</g>
<circle cx="122" cy="58" r="5" fill="none" stroke="#e4e4e7" stroke-width="1.5"/>
<text x="72" y="100" font-size="7" fill="#71717a" text-anchor="middle">85</text>
<text x="97" y="100" font-size="7" fill="#f59e0b" text-anchor="middle">97</text>
<text x="122" y="100" font-size="7" fill="#71717a" text-anchor="middle">72</text>
<text x="90" y="115" font-size="7" fill="#71717a" text-anchor="middle">rank by score</text>
</svg>`,
  },
  {
    id: "timing-rhythm",
    title: "Pattern & Repeat",
    domain: "patterns and sequences",
    keywords: ["pattern", "sequence", "repeat", "rule", "next", "term", "OA", "F-BF"],
    svg: `<svg viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg">
<style>
  @keyframes beat1 { 0%,100%{r:5;opacity:0.5} 10%,20%{r:8;opacity:1} }
  @keyframes beat2 { 0%,100%{r:5;opacity:0.5} 30%,40%{r:8;opacity:1} }
  @keyframes beat3 { 0%,100%{r:5;opacity:0.5} 50%,60%{r:8;opacity:1} }
  @keyframes beat4 { 0%,100%{r:5;opacity:0.5} 70%,80%{r:8;opacity:1} }
  @keyframes nodA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
  @keyframes tap1 { 0%,10%{transform:rotate(-30deg)} 20%,30%{transform:rotate(0deg)} }
  .figure { animation: nodA 0.5s linear infinite; transform-origin: 25px 65px; }
  .tapArm { animation: tap1 2s linear infinite; transform-origin: 25px 52px; }
  .b1 { animation: beat1 2s linear infinite; }
  .b2 { animation: beat2 2s linear infinite; }
  .b3 { animation: beat3 2s linear infinite; }
  .b4 { animation: beat4 2s linear infinite; }
</style>
<rect width="180" height="120" fill="#18181b"/>
<g class="figure">
  <circle cx="25" cy="40" r="6" fill="none" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="25" y1="46" x2="25" y2="65" stroke="#e4e4e7" stroke-width="2"/>
  <line class="tapArm" x1="25" y1="52" x2="35" y2="40" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="25" y1="52" x2="14" y2="55" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="19" y1="79" x2="25" y2="65" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="25" y1="65" x2="31" y2="79" stroke="#e4e4e7" stroke-width="2"/>
</g>
<circle class="b1" cx="55" cy="45" r="5" fill="#60a5fa"/>
<circle class="b2" cx="80" cy="45" r="5" fill="#f59e0b"/>
<circle class="b3" cx="105" cy="45" r="5" fill="#60a5fa"/>
<circle class="b4" cx="130" cy="45" r="5" fill="#f59e0b"/>
<circle cx="155" cy="45" r="7" fill="none" stroke="#71717a" stroke-width="1.5" stroke-dasharray="3,2"/>
<text x="155" y="48" font-size="10" fill="#71717a" text-anchor="middle">?</text>
<text x="55" y="65" font-size="7" fill="#60a5fa" text-anchor="middle">A</text>
<text x="80" y="65" font-size="7" fill="#f59e0b" text-anchor="middle">B</text>
<text x="105" y="65" font-size="7" fill="#60a5fa" text-anchor="middle">A</text>
<text x="130" y="65" font-size="7" fill="#f59e0b" text-anchor="middle">B</text>
<text x="155" y="65" font-size="7" fill="#71717a" text-anchor="middle">?</text>
<text x="90" y="110" font-size="7" fill="#71717a" text-anchor="middle">find the pattern</text>
</svg>`,
  },
  {
    id: "scaling-resizing",
    title: "Scale & Transform",
    domain: "proportional reasoning",
    keywords: ["proportion", "scale", "ratio", "similar", "enlarge", "shrink", "G-SRT", "RP"],
    svg: `<svg viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg">
<style>
  @keyframes scaleUp { 0%,100%{transform:scale(1)} 50%{transform:scale(1.4)} }
  @keyframes shrinkFig { 0%,100%{transform:scale(0.8)} 50%{transform:scale(1.0)} }
  @keyframes pointArm { 0%,100%{transform:rotate(0)} 50%{transform:rotate(20deg)} }
  .figure  { animation: shrinkFig 2.5s ease-in-out infinite; transform-origin: 25px 78px; }
  .pointArm{ animation: pointArm 2.5s ease-in-out infinite; transform-origin: 25px 60px; }
  .scaling { animation: scaleUp 2.5s ease-in-out infinite; transform-origin: 120px 55px; }
</style>
<rect width="180" height="120" fill="#18181b"/>
<g class="figure">
  <circle cx="25" cy="48" r="6" fill="none" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="25" y1="54" x2="25" y2="72" stroke="#e4e4e7" stroke-width="2"/>
  <line class="pointArm" x1="25" y1="60" x2="42" y2="55" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="25" y1="60" x2="14" y2="62" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="19" y1="84" x2="25" y2="72" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="25" y1="72" x2="31" y2="84" stroke="#e4e4e7" stroke-width="2"/>
</g>
<rect x="55" y="50" width="20" height="30" rx="2" fill="none" stroke="#60a5fa" stroke-width="1.5"/>
<text x="65" y="92" font-size="6" fill="#71717a" text-anchor="middle">1x</text>
<line x1="80" y1="65" x2="100" y2="65" stroke="#71717a" stroke-width="1"/>
<polygon points="100,62 107,65 100,68" fill="#71717a"/>
<text x="90" y="58" font-size="7" fill="#f59e0b" text-anchor="middle">x2</text>
<g class="scaling">
  <rect x="110" y="35" width="30" height="40" rx="2" fill="none" stroke="#f59e0b" stroke-width="1.5"/>
</g>
<text x="125" y="92" font-size="6" fill="#71717a" text-anchor="middle">2x</text>
<text x="90" y="112" font-size="7" fill="#71717a" text-anchor="middle">same shape, different size</text>
</svg>`,
  },
  {
    id: "inventory-crafting",
    title: "Craft & Combine",
    domain: "addition and grouping",
    keywords: ["add", "group", "combine", "total", "altogether", "OA", "NBT"],
    svg: `<svg viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg">
<style>
  @keyframes mergeL  { 0%,40%{transform:translateX(0)} 60%,100%{transform:translateX(15px)} }
  @keyframes mergeR  { 0%,40%{transform:translateX(0)} 60%,100%{transform:translateX(-15px)} }
  @keyframes appear  { 0%,70%{opacity:0;transform:scale(0.5)} 80%,100%{opacity:1;transform:scale(1)} }
  @keyframes craft   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
  @keyframes craftArm { 0%,30%{transform:rotate(0deg)} 50%,80%{transform:rotate(-25deg)} }
  .figure   { animation: craft 1.5s ease-in-out infinite; transform-origin: 25px 90px; }
  .craftArm { animation: craftArm 1.5s ease-in-out infinite; transform-origin: 25px 80px; }
  .mergeL   { animation: mergeL 3s ease-in-out infinite; }
  .mergeR   { animation: mergeR 3s ease-in-out infinite; }
  .result   { animation: appear 3s ease-in-out infinite; transform-origin: 130px 50px; }
</style>
<rect width="180" height="120" fill="#18181b"/>
<g class="figure">
  <circle cx="25" cy="68" r="5" fill="none" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="25" y1="73" x2="25" y2="88" stroke="#e4e4e7" stroke-width="2"/>
  <line class="craftArm" x1="25" y1="78" x2="38" y2="65" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="25" y1="78" x2="15" y2="83" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="20" y1="100" x2="25" y2="88" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="25" y1="88" x2="30" y2="100" stroke="#e4e4e7" stroke-width="2"/>
</g>
<g class="mergeL">
  <rect x="50" y="40" width="18" height="18" rx="3" fill="#60a5fa" opacity="0.5" stroke="#60a5fa" stroke-width="1"/>
  <text x="59" y="52" font-size="8" fill="#e4e4e7" text-anchor="middle">3</text>
</g>
<text x="80" y="52" font-size="12" fill="#71717a" text-anchor="middle">+</text>
<g class="mergeR">
  <rect x="90" y="40" width="18" height="18" rx="3" fill="#f59e0b" opacity="0.5" stroke="#f59e0b" stroke-width="1"/>
  <text x="99" y="52" font-size="8" fill="#e4e4e7" text-anchor="middle">4</text>
</g>
<text x="118" y="52" font-size="10" fill="#71717a" text-anchor="middle">=</text>
<g class="result">
  <rect x="128" y="36" width="24" height="24" rx="4" fill="#22c55e" opacity="0.3" stroke="#22c55e" stroke-width="1.5"/>
  <text x="140" y="52" font-size="10" fill="#22c55e" text-anchor="middle" font-weight="bold">7</text>
</g>
<text x="100" y="115" font-size="7" fill="#71717a" text-anchor="middle">combine ingredients</text>
</svg>`,
  },
  {
    id: "terrain-generation",
    title: "Plot & Explore",
    domain: "coordinate systems",
    keywords: ["coordinate", "grid", "plot", "x", "y", "axis", "point", "ordered pair", "G-GPE"],
    svg: `<svg viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg">
<style>
  @keyframes blink { 0%,100%{opacity:0.3} 50%{opacity:1} }
  @keyframes walkPath { 0%{offset-distance:0%} 100%{offset-distance:100%} }
  @keyframes legA { 0%,100%{transform:rotate(-20deg)} 50%{transform:rotate(20deg)} }
  @keyframes legB { 0%,100%{transform:rotate(20deg)} 50%{transform:rotate(-20deg)} }
  .target { animation: blink 1.5s ease-in-out infinite; }
  .explorer { animation: walkPath 4s linear infinite; offset-path: path("M 50 80 L 80 65 L 110 50 L 140 35"); }
  .eLegA { animation: legA 0.4s linear infinite; transform-origin: center; transform-box: fill-box; }
  .eLegB { animation: legB 0.4s linear infinite; transform-origin: center; transform-box: fill-box; }
</style>
<rect width="180" height="120" fill="#18181b"/>
<line x1="35" y1="90" x2="170" y2="90" stroke="#71717a" stroke-width="1"/>
<line x1="35" y1="90" x2="35" y2="20" stroke="#71717a" stroke-width="1"/>
<line x1="65" y1="88" x2="65" y2="20" stroke="#71717a" stroke-width="0.3"/>
<line x1="95" y1="88" x2="95" y2="20" stroke="#71717a" stroke-width="0.3"/>
<line x1="125" y1="88" x2="125" y2="20" stroke="#71717a" stroke-width="0.3"/>
<line x1="155" y1="88" x2="155" y2="20" stroke="#71717a" stroke-width="0.3"/>
<line x1="35" y1="75" x2="170" y2="75" stroke="#71717a" stroke-width="0.3"/>
<line x1="35" y1="60" x2="170" y2="60" stroke="#71717a" stroke-width="0.3"/>
<line x1="35" y1="45" x2="170" y2="45" stroke="#71717a" stroke-width="0.3"/>
<line x1="35" y1="30" x2="170" y2="30" stroke="#71717a" stroke-width="0.3"/>
<text x="100" y="102" font-size="7" fill="#71717a" text-anchor="middle">x</text>
<text x="28" y="55" font-size="7" fill="#71717a" text-anchor="middle">y</text>
<circle class="target" cx="140" cy="35" r="4" fill="#f59e0b"/>
<text x="140" y="28" font-size="7" fill="#f59e0b" text-anchor="middle" font-family="monospace">(3,4)</text>
<g class="explorer">
  <circle cx="0" cy="-7" r="3.5" fill="none" stroke="#22c55e" stroke-width="1.5"/>
  <line x1="0" y1="-3.5" x2="0" y2="5" stroke="#22c55e" stroke-width="1.5"/>
  <line x1="0" y1="0" x2="-4" y2="3" stroke="#22c55e" stroke-width="1.5"/>
  <line x1="0" y1="0" x2="4" y2="3" stroke="#22c55e" stroke-width="1.5"/>
  <line class="eLegA" x1="0" y1="5" x2="-3" y2="11" stroke="#22c55e" stroke-width="1.5"/>
  <line class="eLegB" x1="0" y1="5" x2="3" y2="11" stroke="#22c55e" stroke-width="1.5"/>
</g>
<text x="100" y="115" font-size="7" fill="#71717a" text-anchor="middle">navigate the grid</text>
</svg>`,
  },
  {
    id: "bidding-auction",
    title: "Bid & Estimate",
    domain: "estimation and place value",
    keywords: ["estimate", "round", "approximate", "place value", "digit", "value", "NBT"],
    svg: `<svg viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg">
<style>
  @keyframes bid1 { 0%,40%{transform:translateY(0)} 50%,90%{transform:translateY(-10px)} }
  @keyframes bid2 { 0%,40%{transform:translateY(0)} 60%,100%{transform:translateY(-10px)} }
  @keyframes raise1 { 0%,40%{transform:rotate(0deg)} 50%,90%{transform:rotate(-50deg)} }
  @keyframes raise2 { 0%,40%{transform:rotate(0deg)} 60%,100%{transform:rotate(50deg)} }
  .bidder1   { animation: bid1 2.5s ease-in-out infinite; transform-origin: 35px 90px; }
  .bidder1Arm{ animation: raise1 2.5s ease-in-out infinite; transform-origin: 35px 60px; }
  .bidder2   { animation: bid2 2.5s ease-in-out infinite; transform-origin: 145px 90px; }
  .bidder2Arm{ animation: raise2 2.5s ease-in-out infinite; transform-origin: 145px 65px; }
</style>
<rect width="180" height="120" fill="#18181b"/>
<g class="bidder1">
  <circle cx="35" cy="50" r="6" fill="none" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="35" y1="56" x2="35" y2="72" stroke="#e4e4e7" stroke-width="2"/>
  <line class="bidder1Arm" x1="35" y1="60" x2="48" y2="50" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="35" y1="60" x2="22" y2="65" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="29" y1="86" x2="35" y2="72" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="35" y1="72" x2="41" y2="86" stroke="#e4e4e7" stroke-width="2"/>
</g>
<rect x="48" y="32" width="30" height="14" rx="3" fill="#60a5fa" opacity="0.3" stroke="#60a5fa" stroke-width="1"/>
<text x="63" y="42" font-size="8" fill="#60a5fa" text-anchor="middle" font-family="monospace">$25</text>
<g class="bidder2">
  <circle cx="145" cy="55" r="6" fill="none" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="145" y1="61" x2="145" y2="75" stroke="#e4e4e7" stroke-width="2"/>
  <line class="bidder2Arm" x1="145" y1="65" x2="158" y2="55" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="145" y1="65" x2="133" y2="58" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="139" y1="89" x2="145" y2="75" stroke="#e4e4e7" stroke-width="2"/>
  <line x1="145" y1="75" x2="151" y2="89" stroke="#e4e4e7" stroke-width="2"/>
</g>
<rect x="103" y="38" width="30" height="14" rx="3" fill="#f59e0b" opacity="0.3" stroke="#f59e0b" stroke-width="1"/>
<text x="118" y="48" font-size="8" fill="#f59e0b" text-anchor="middle" font-family="monospace">$30</text>
<rect x="80" y="75" width="30" height="15" rx="3" fill="none" stroke="#71717a" stroke-width="1.5"/>
<text x="95" y="86" font-size="7" fill="#71717a" text-anchor="middle">?</text>
<text x="90" y="110" font-size="7" fill="#71717a" text-anchor="middle">estimate the value</text>
</svg>`,
  },
]

// Match a moon to a mechanic. Score: keyword in description = +2,
// keyword in domain code = +3. Highest score wins.
function matchTopMechanic(desc, domainCode) {
  const d = (desc || "").toLowerCase()
  let bestId = mechanics[0].id
  let bestScore = -1
  for (const m of mechanics) {
    let score = 0
    for (const kw of m.keywords) {
      if (d.includes(kw.toLowerCase())) score += 2
      if (domainCode.includes(kw.toUpperCase())) score += 3
    }
    if (score > bestScore) {
      bestScore = score
      bestId = m.id
    }
  }
  return bestId
}

// Build the mechanic→moons map
const mechanicMap = {}
for (const m of mechanics) mechanicMap[m.id] = []
for (const moon of moons) {
  const domainCode = moon.id.split(".").slice(0, 2).join(".")
  const top = matchTopMechanic(moon.description || "", domainCode)
  mechanicMap[top].push({ id: moon.id, desc: moon.description || "" })
}

// Build the HTML
const css = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #09090b; color: #e4e4e7; font-family: -apple-system, sans-serif; padding: 32px 24px; }
h1 { font-size: 22px; color: #fff; margin-bottom: 6px; }
.subtitle { color: #71717a; font-size: 14px; margin-bottom: 32px; }
.mechanic { background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 20px; margin-bottom: 20px; display: grid; grid-template-columns: 220px 1fr; gap: 20px; align-items: start; }
.mechanic-num { font-size: 11px; color: #52525b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
.mechanic-title { font-size: 17px; font-weight: 700; color: #fff; margin-bottom: 2px; }
.mechanic-domain { font-size: 12px; color: #60a5fa; margin-bottom: 10px; }
.svg-wrap { width: 200px; height: 130px; border-radius: 8px; overflow: hidden; border: 1px solid #3f3f46; background: #18181b; }
.svg-wrap svg { width: 100%; height: 100%; display: block; }
.moons-section h3 { font-size: 11px; color: #52525b; font-weight: 700; margin-bottom: 6px; letter-spacing: 0.08em; text-transform: uppercase; }
.moon-count { font-size: 12px; color: #71717a; margin-bottom: 8px; }
.moon-grid { display: flex; flex-direction: column; gap: 4px; }
.moon-tag { background: #27272a; border: 1px solid #3f3f46; border-radius: 6px; padding: 6px 10px; font-size: 12px; color: #a1a1aa; cursor: default; transition: background 0.15s; display: flex; gap: 8px; align-items: baseline; width: 100%; }
.moon-tag:hover { background: #3f3f46; color: #f4f4f5; }
.moon-tag .moon-id { font-family: monospace; font-size: 11px; color: #60a5fa; white-space: nowrap; flex-shrink: 0; }
.moon-tag .moon-desc { color: #d4d4d8; line-height: 1.4; }
`

let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Option C — 17 Game Mechanics (animated)</title>
<style>${css}</style>
</head>
<body>
<h1>Option C — Game Mechanics</h1>
<p class="subtitle">17 reusable game loops. Each stick figure is animated. Below each one: the math standards that map to it.</p>
`

mechanics.forEach((m, i) => {
  const moonList = mechanicMap[m.id] || []
  const moonRows = moonList
    .map((mn) => `<div class="moon-tag"><span class="moon-id">${mn.id}</span><span class="moon-desc">${mn.desc.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span></div>`)
    .join("")
  html += `
<div class="mechanic">
  <div>
    <div class="mechanic-num">Mechanic #${i + 1}</div>
    <div class="mechanic-title">${m.title}</div>
    <div class="mechanic-domain">${m.domain}</div>
    <div class="svg-wrap">${m.svg}</div>
  </div>
  <div class="moons-section">
    <h3>Matched Moons</h3>
    <div class="moon-count">${moonList.length} standards use this mechanic</div>
    <div class="moon-grid">${moonRows}</div>
  </div>
</div>`
})

html += "\n</body>\n</html>\n"

const desktopPath = path.join(os.homedir(), "Desktop", "mechanic-moon-map.html")
fs.writeFileSync(desktopPath, html)
console.log(`Done — ${html.length} bytes written to ${desktopPath}`)
