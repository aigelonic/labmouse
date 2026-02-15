# Labmouse Game Development Plan

## TL;DR
Build a simple arcade maze game where the player navigates a procedurally-generated maze as a mouse to reach cheese. Retro minimal aesthetic, static barriers only, mobile + desktop, time-based scoring. MVP is one playable level demo in 4–8 hours.

## Core Vision
A relaxing, pick-up-and-play web game. Player controls a mouse navigating a maze with static walls to collect cheese. Fast completion time = high score. Retro pixel/shape art. Works on desktop (keyboard) and mobile (touch/virtual joystick).

## Game Mechanics & Core Systems

### Architecture
- `src/game/Game.ts` — main scene & loop
- `src/game/Player.ts` — mouse entity, position, movement, collision
- `src/game/Maze.ts` — maze generation & collision
- `src/game/Input.ts` — keyboard + touch input layer
- `src/game/Renderer.ts` — PixiJS setup & draw
- `src/ui/HUD.ts` — timer, UI text
- `src/ui/Screen.ts` — title/win screens
- `src/main.ts` — app bootstrap

### Player Mechanics
- 4-direction movement (WASD / arrow keys, or touch directional pad)
- Collision detection with walls (stop movement)
- Single sprite/shape representing mouse
- Smooth animation when moving

### Maze Generation
- Grid-based procedural generation (recursive backtracking or similar)
- **Dual level generation:**
  - **Desktop:** 16×12 cells @ 50px per cell = 800×600px canvas
  - **Mobile:** 12×16 cells @ 40px per cell = 480×640px canvas (portrait)
  - Responsive scaling detects viewport and selects appropriate maze size
- Guaranteed path from start to cheese
- Static walls (no moving hazards)
- Wall thickness: 1 cell unit
- **Fog-of-war visibility:** Only show maze within ~150px radius of player (circular or square viewport)
  - Hidden areas appear as dark/black
  - Cheese remains visible if within viewport radius
  - Creates sense of exploration and discovery

### Cheese Target
- Single goal per level, fixed position (randomly placed on valid path)
- Win state: player touches cheese
- Visual indicator (larger, brighter than walls)

### Score & Timer
- Real-time timer (seconds elapsed, displayed as HH:MM:SS or decimal)
- Display time on completion ("You reached the cheese in X seconds!")
- Optional: persist high scores via localStorage

## Input & Controls

### Desktop
- WASD or arrow keys for directional movement
- Responsive, frame-based input handling

### Mobile
- **Input method decision:** Direct touch (tap direction on canvas) > virtual touchpad
  - **Rationale:** Minimizes screen clutter, reduces latency, simpler UX
  - Divide canvas into 4 zones (up, down, left, right) based on touch position
  - Player moves in direction of last touch zone
  - Alternative fallback: arrow-button HUD if direct touch feels imprecise
- Touch-based input layer abstracts from desktop
- Responsive scaling for small screens

### Shared Input System
- Both desktop and mobile use same `Input.ts` interface
- State-based (current direction) rather than event-driven for smooth movement

## Visual & Art

### Style
Minimal retro — pixel art or simple shapes

### Assets Needed
- Player sprite (small mouse, 32×32 or similar, animated or static)
- Cheese sprite (goal indicator, bright/distinct)
- Wall tiles (can be solid rectangles or pixel tiles)
- Grid background (optional reference grid for alignment)

### Color Palette
- Dark background (#0a0a0a or similar)
- Light walls (#444 or neutral gray)
- Bright cheese (#FFD700 or cheerful color)
- Player highlight (contrasting color)

### Rendering
- PixiJS `Graphics` for walls and shapes
- PixiJS `Sprite` for player and cheese
- No 3D, no complex animations required for MVP

## UI/UX

### Screens
1. **Title Screen**
   - Simple title: "Labmouse — Reach the Cheese"
   - Start button or "Press any key" prompt
   - Brief instructions

2. **In-Game HUD**
   - Timer in top corner (countdown or elapsed time)
   - Level/session info (optional)
   - Pause button (optional for MVP)

3. **Victory Screen**
   - Show time taken
   - Congratulations message
   - "Play Again" button

### Responsive Design
- Scales for mobile/desktop
- Canvas centered on screen
- UI text legible on small screens
- Touch targets large enough (50px minimum)

## MVP Feature Breakdown (Delivery Order)

### Phase 1 — Core Loop (2–3 hours)
**Goal:** Playable game loop with movement, maze, fog-of-war, win condition

**Time breakdown:**
- Player movement + input (30 min)
- Maze data structure + collision (45 min)
- Fog-of-war viewport system (45 min)
- Win state + timer display (30 min)
- Unit tests (15 min)
- Testing & bug fixes (15 min)

**Tasks:**
- **Player:** WASD movement in 4 directions, collision detection
- **Maze:** Hand-crafted simple 10×10 maze for desktop (testing only)
- **Fog-of-war:** Viewport follows player, 150px radius, hidden areas dark
- **Goal:** Touch cheese to win
- **Timer:** Display elapsed seconds
- **Rendering:** Basic PixiJS scene, fog-of-war mask
- **Win state:** Display victory screen with time

**Unit tests:**
- `src/game/__tests__/Player.test.ts` — movement, collision with walls
- `src/game/__tests__/Maze.test.ts` — maze structure, path validation
- `src/game/__tests__/Input.test.ts` — keyboard input parsing

**Deliverable:** Type `pnpm run dev`, see fog-of-war viewport, WASD to move and explore, reach cheese, see win screen with time. All unit tests pass.

### Phase 2 — Polish & Visuals (1–2 hours)
**Goal:** Make it look and feel like a real game

**Time breakdown:**
- Pixel art sprites or polished shapes (45 min)
- HUD layout and timer display (30 min)
- Visual feedback (fog glow, animations) (30 min)
- Unit tests (15 min)
- Testing & refinement (15 min)

**Tasks:**
- **Art:** Upgrade to pixel art sprites (mouse, cheese, walls) or polished shapes
- **HUD:** Clean timer display, instruction text, visible fog-of-war indicator
- **Visual feedback:**
  - Fog edge glow or vignette effect
  - Mouse sprite indicates direction
  - Screen flash on win
- **Sound:** None required for MVP (optional nice-to-have)

**Unit tests:**
- `src/game/__tests__/Renderer.test.ts` — fog-of-war masking correctness
- Visual regression tests (manual screenshots)

**Deliverable:** Game looks intentional, professional, retro-charming. Fog-of-war clear and intuitive.

### Phase 3 — Procedural Maze & Mobile (1–2 hours)
**Goal:** Generated mazes + mobile support

**Time breakdown:**
- Procedural maze generation (45 min)
- Mobile layout detection + dual sizes (30 min)
- Touch input system (4-zone direct touch) (30 min)
- Mobile testing & performance (15 min)

**Tasks:**
- **Maze generation:** Implement recursive backtracking algorithm
- **Dual layout system:**
  - Detect viewport width/height
  - Load 16×12 maze @ 50px for desktop (≥800px width)
  - Load 12×16 maze @ 40px for mobile (<800px width)
- **Mobile input:** Direct touch (4 zones: up/down/left/right on canvas)
- **Responsive scaling:** CSS media queries for HUD, canvas sizing
- **Touch controls:** Responsive feedback, smooth movement via touch
- **Performance testing:** Verify 60 FPS on mobile (fog-of-war may impact)

**Unit tests:**
- `src/game/__tests__/MazeGenerator.test.ts` — procedural generation correctness
- `src/game/__tests__/Input.test.ts` — touch zone detection
- Integration test: maze size selection based on viewport

**Deliverable:** Each session generates new maze. Works seamlessly on mobile and desktop with responsive controls. Fog-of-war smooth on both platforms (≥50 FPS).

## Development Timeline

| Phase | Work | Time | Cumulative |
|-------|------|------|-----------|
| 1 | Core loop + fog-of-war + tests | 2–3h | 2–3h |
| 2 | Visuals & HUD polish + tests | 1–2h | 3–5h |
| 3 | Procedural + mobile + tests | 1–2h | 4–8h |
| 4 | Dependencies update + security audit | 30 min | 4.5–8.5h |
| **Total** | | | **4.5–8.5h** |

### Testing Strategy (per phase)
- **Unit tests:** Run with `pnpm test` (if Vitest configured)
- **Manual QA:** Play through each phase before moving next
- **Mobile testing:** Emulator or real device by end of Phase 3
- **Performance:** Monitor FPS, especially fog-of-war rendering

## Directory Structure

```
labmouse/
├── src/
│   ├── game/
│   │   ├── Game.ts              # Main scene logic, loop, win/lose
│   │   ├── Player.ts            # Mouse entity, movement, collision
│   │   ├── Maze.ts              # Maze data structure, collision
│   │   ├── MazeGenerator.ts     # Procedural maze generation (Phase 3)
│   │   ├── Input.ts             # Keyboard + touch input
│   │   ├── Renderer.ts          # PixiJS rendering, fog-of-war
│   │   ├── Viewport.ts          # Fog-of-war visibility logic
│   │   └── __tests__/           # Unit tests
│   │       ├── Player.test.ts
│   │       ├── Maze.test.ts
│   │       ├── MazeGenerator.test.ts
│   │       ├── Input.test.ts
│   │       └── Renderer.test.ts
│   ├── ui/
│   │   ├── HUD.ts               # Timer, score display
│   │   └── Screen.ts            # Title/win/pause screens
│   ├── main.ts                  # App bootstrap
│   ├── style.css
│   └── counter.ts               # (Remove in cleanup phase)
├── assets/
│   └── sprites/                 # Player, cheese, wall tiles (PNG or SVG)
├── public/
│   └── vite.svg
├── index.html
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vitest.config.ts             # Test runner config (Phase 1 setup)
├── GAME_PLAN.md                 # This file
├── CHANGELOG.md                 # Dependency and release notes
└── README.md
```

## Testing Framework Setup

### Test Configuration
- **Framework:** Vitest (TypeScript-native, works with Vite)
- **Config:** `vitest.config.ts` at root
- **Test files:** `src/game/__tests__/*.test.ts`
- **Run tests:** `pnpm test` or `pnpm test --watch`
- **Coverage:** Target ≥70% for core game logic

### Unit Test Structure (per Phase)
**Phase 1:**
- `Player.test.ts` — movement logic, wall collision, boundary detection
- `Maze.test.ts` — maze grid structure, collision detection, path validation
- `Input.test.ts` — keyboard input parsing, key state tracking

**Phase 2:**
- `Renderer.test.ts` — fog-of-war mask correctness, visibility calculations
- Manual visual regression tests (screenshots)

**Phase 3:**
- `MazeGenerator.test.ts` — maze generation algorithm, guaranteed paths
- `Input.test.ts` — touch zone detection, multi-touch handling
- Integration test: responsive layout switching

## Manual Validation Checklist

### Phase 1 Validation
- [ ] Player moves in 4 directions with WASD
- [ ] Player cannot move through walls
- [ ] Fog-of-war viewport follows player smoothly
- [ ] Cheese visible within fog-of-war radius
- [ ] Touching cheese triggers win state
- [ ] Timer displays and counts up
- [ ] Win screen shows time taken
- [ ] Unit tests pass: `pnpm test`
- [ ] FPS stable at 60 or higher

### Phase 2 Validation
- [ ] Visual design is cohesive and retro
- [ ] Fog-of-war edge is clear (not confusing)
- [ ] Text is readable on dark background
- [ ] Canvas centered and sized correctly
- [ ] No visual glitches or lag
- [ ] Visual tests pass: screenshots match expectations
- [ ] FPS stable during gameplay

### Phase 3 Validation
- [ ] Maze is unique each session
- [ ] Guaranteed path from start to cheese exists
- [ ] Desktop: loads 16×12 maze at 50px/cell
- [ ] Mobile: loads 12×16 maze at 40px/cell
- [ ] Touch input (4 zones) moves player correctly
- [ ] Game scales to mobile screen (tested on emulator or device)
- [ ] Performance is ≥50 FPS on mobile
- [ ] Integration tests pass: `pnpm test`

### Phase 4 — Dependencies & Security
- [ ] `pnpm audit` shows no vulnerabilities
- [ ] Dependencies updated: `pnpm update --latest`
- [ ] All tests still pass after updates
- [ ] CHANGELOG.md updated with changes

## Phase 4: Dependency Management & Security Audit (30 min)

### Dependency Updates
**Action:** Update all dependencies to latest safe versions
- Check outdated packages: `pnpm outdated`
- Review major/minor updates for breaking changes
- Update non-breaking: `pnpm update --latest`
- Re-run full test suite: `pnpm test`
- Verify build succeeds: `pnpm run build`
- Document updates in CHANGELOG.md

### Security Audit
**Dependency vulnerabilities:**
- Run `pnpm audit` — check for known CVEs in dependencies
- Remediate high/critical vulnerabilities immediately
- Monitor: enable `pnpm audit --fix` if safe
- Policy: No unresolved high/critical in production

**Code security review:**
- ✓ No use of `eval()`, `Function()`, or dynamic code execution
- ✓ No innerHTML with untrusted user input (use PixiJS Text instead)
- ✓ No hardcoded API keys, tokens, or secrets in code
- ✓ Input validation: All keyboard and touch input sanitized before use
- ✓ localStorage safety: If leaderboard added, validate/sanitize before storing

**Browser & deployment security:**
- ✓ HTTPS required (GitHub Pages and Vercel default to HTTPS)
- ✓ No form submissions or external API calls in MVP
- ✓ Canvas game immune to clickjacking and XSS from forms
- ✓ Optional: Add Content-Security-Policy header for additional protection

**Performance & DoS prevention:**
- ✓ Maze generation: Cap max size at 32×32 cells (prevents CPU exhaustion)
- ✓ Fog-of-war rendering: Monitor FPS, throttle if drops below 50
- ✓ Input handling: Throttle to game loop rate (60 FPS max)
- ✓ Memory limits: No unbounded allocations or memory leaks

## Deployment

- Build for production: `pnpm run build` → generates `dist/` folder
- Deploy to GitHub Pages, Vercel, or similar
- Works offline (except future leaderboard or cloud features)
- Run `pnpm audit` and security checklist before each release
- Pin dependency versions in `pnpm-lock.yaml` for reproducibility

## Key Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Gameplay feel** | Simple arcade | Easy to prototype, relaxing |
| **Maze type** | Procedurally generated per session | Replayable, new challenge each time |
| **Win condition** | Single cheese goal per level | Clear, simple objective |
| **Hazards** | Static walls only, no enemies | Simpler collision, easier MVP |
| **Art style** | Minimal retro (pixel art or shapes) | Fast to implement, stylistically clear |
| **Platform** | Desktop + mobile equally | Both important, planned from start |
| **Scoring** | Time-based | Arcade-style, encourages speed runs |
| **MVP scope** | One playable level, 4–8 hours | Achievable demo with core loop |
| **Framework** | PixiJS + Vite + TypeScript | Fast rendering, type safety, web-first |
| **Input** | Abstracted layer (desktop + mobile) | Clean architecture, easy to extend |

## Success Criteria for MVP

- **Functional:** Player can reach cheese in a playable maze
- **Polished:** Retro aesthetic is intentional and cohesive
- **Playable:** Smooth controls, no lag, no bugs blocking gameplay
- **Mobile-ready:** Works on both desktop and mobile screens
- **Documented:** Code comments and this plan make development clear

## Nice-to-Haves / Phase 2+ Features

- **Leaderboard:** localStorage for high scores per session
- **Levels:** Multiple difficulty patterns (tight mazes, large mazes, etc.)
- **Power-ups:** Speed boost, wall reveal, temporary immunity
- **Animations:** Bouncing cheese, squashing player sprite, smooth transitions
- **Sound:** Footsteps, cheese collection sound, background music (low priority)
- **Enemies:** Optional moving hazards (Phase 2 if time)
- **Progression:** Story mode with increasing difficulty vs. endless procedural

---

## Next Steps (After Plan Approval)

### Pre-Phase Setup (5–10 min)
1. Install test framework: `pnpm add -D vitest`
2. Create `vitest.config.ts` in repo root
3. Add test script to `package.json`: `"test": "vitest"`
4. Create test directory: `mkdir -p src/game/__tests__`

### Phase 1: Core Loop (2–3h)
1. Create `src/game/Game.ts` — main loop, state management
2. Create `src/game/Player.ts` — position, direction, collision
3. Create `src/game/Maze.ts` — grid structure, collision
4. Create `src/game/Viewport.ts` — fog-of-war visibility
5. Create `src/game/Input.ts` — keyboard input (WASD)
6. Create `src/game/Renderer.ts` — PixiJS canvas + fog-of-war mask
7. Create unit tests: Player, Maze, Input
8. Hand-craft 10×10 test maze
9. Implement cheese goal + win state + timer
10. Run `pnpm test` — all tests pass

### Phase 2: Polish & Visuals (1–2h)
1. Create or find pixel art sprites (mouse, cheese, walls)
2. Update HUD: timer, instructions, fog indicator
3. Add visual effects: fog glow, win flash
4. Update Renderer with sprite rendering
5. Create visual regression tests (manual)
6. Run `pnpm test` — all tests pass

### Phase 3: Procedural + Mobile (1–2h)
1. Create `src/game/MazeGenerator.ts` — recursive backtracking
2. Add viewport detection: desktop (16×12 @ 50px) vs. mobile (12×16 @ 40px)
3. Create touch input in `Input.ts` — 4-zone direct touch
4. Add CSS media queries for responsive layout
5. Create integration tests
6. Test on mobile emulator/device
7. Optimize fog-of-war rendering (profile FPS)
8. Run `pnpm test` — all tests pass

### Phase 4: Dependencies & Security (30 min)
1. Check dependencies: `pnpm outdated`
2. Run security audit: `pnpm audit`
3. Update safe packages: `pnpm update --latest`
4. Re-run tests: `pnpm test`
5. Complete security checklist
6. Update CHANGELOG.md

### Release
1. Build production: `pnpm run build`
2. Test production build locally
3. Deploy to GitHub Pages or Vercel
4. Share live link + git commit with tag (e.g., `v1.0.0`)
