# Overnight Report — April 17-18, 2026

## What was built

### 1. Vibe Coder Toolbar (NOT a chatbot)
- 5 one-click action buttons at the bottom of the Sandpack builder:
  - **Make harder** — increases difficulty within K rules
  - **Make easier** — simplifies for struggling learners
  - **Add celebration** — adds confetti/glow effects on win
  - **Change look** — completely reskins the game
  - **More animation** — adds CSS transitions and hover effects
- **"Your idea" button** — expands a text input for custom requests ("make the elephants bigger")
- **NOT a chat** — one action, one click, code updates, preview refreshes. Inspired by Canva's Magic toolbar (5B uses).
- New API endpoint: `/api/game/modify` — takes current HTML + modification request → returns modified HTML

### 2. Fun Game Styles for K.OA.A.1
**Research result:** Pac-Man, Snake, and Space Shooter all FAIL the 3 criteria — their core mechanics (navigation, steering, aiming) aren't math. Two styles PASS:
- **Sum Jumper (platformer)** — player jumps between platforms to collect TWO GROUPS that add to a target. The jump-and-collect IS the addition.
- **Wall Builder (tower defense)** — player combines two defender groups to match required wall strength. The combining IS the addition.
Both are now on the builder picker as "game style" options with purple accent.

### 3. Code Panel Toggle
- Code hidden by default — game preview takes full width
- "Show code" / "Hide code" button in header
- Learners see the game first, code is optional

### 4. Visual Quality Improvements
- Added 8 visual quality rules (V1-V8) to the generation prompt
- CSS animations, gradients, glow effects, depth, smooth transitions
- Goal: "looks like a professional game studio, not a student project"

### 5. Gemini Re-enabled
- Gemini is primary generator again (Sandpack handles its React output)
- Falls back to Claude if Gemini fails

## Research Completed

### Vibe Coder UX (what approach to use)
- **Winner: Toolbar + contextual buttons** (like Canva, not like a chatbot)
- Rejected: command palette (too developer-y), voice (impractical in classrooms), chat input (Khanmigo proved this fails)
- Phase 2 potential: click-to-modify in preview (like Figma AI)

### Fun Game Mechanics (Habgood & Ainsworth 2011)
- Intrinsic integration = math IS the core mechanic, not a quiz gate
- Their study showed 7x more engagement with intrinsic games
- Pac-Man/Snake/Shooter fail because the player action (navigate/steer/aim) isn't math
- Platformer/Tower defense pass because the player action (collect groups/combine defenders) IS addition

### Khanmigo Death Analysis
- Saved full analysis to Storyteller knowledge
- Key: chatbots don't work with kids. "For a lot of students, it was a non-event."
- Our approach (building, not chatting) is validated by Khanmigo's failure
- Competitive landscape: the biggest chatbot tutor just admitted defeat

## What's on the builder picker now (in order)
1. **Quick start** — 6 scenario cards (Bakery, Toy Store, Farm, Sports, Party, Classroom)
2. **Game styles** — Sum Jumper (platformer), Wall Builder (tower defense)
3. **Or create your own** — Fill in the blanks, Create a comic, Write your own
4. **Bottom links** — Start from template, Paste your HTML

## What needs Barbara's input
1. **Test the vibe coder toolbar** — click "Add celebration" or "Change look" on a generated game and see if the modifications work well
2. **Test Sum Jumper and Wall Builder** — do the generated games actually play well?
3. **Hackathon strategy** — 4 days until it starts. What to prioritize?
4. **Dark theme on generated games** — is the quality better now with V1-V8 rules?

## Known issues still open
- Search → library glitch (from pilot)
- Some generated games still show answer (prompt improved but AI is unpredictable)
- Firestore rules still not deployed (Mike)
- K.OA.A.3 (decompose) not tested
