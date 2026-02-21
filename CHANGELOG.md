# Changelog

All notable changes to the Labmouse project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - Phase 1 (Core Loop)
- **Game loop**: 60 FPS game loop with PixiJS ticker
- **Player system**: Movement with WASD/arrow keys, collision detection
- **Maze system**: Grid-based collision detection and pathfinding (BFS)
- **Input system**: Unified keyboard and touch input handling
- **Viewport system**: Fog-of-war with 150px radius visibility
- **Renderer system**: PixiJS-based rendering with layer management
- **Win condition**: Player reaches cheese to complete level
- **Timer**: Real-time elapsed time tracking
- **Unit tests**: 20 tests covering Player, Maze, and Input classes

### Added - Phase 2 (Polish & Visuals)
- **HUD system**: In-game UI with timer, instructions, and status display
- **Screen system**: Title screen, win screen, and pause screen overlays
- **Game flow**: Complete state management (title → playing → win → restart)
- **Visual enhancements**: 
  - Drop shadows on all text for readability
  - Blue glow effect on fog-of-war edge
  - Semi-transparent screen overlays
- **Unit tests**: 12 Renderer and Viewport tests

### Added - Phase 3 (Procedural Generation & Responsive Design)
- **MazeGenerator**: Recursive backtracking algorithm for procedural maze generation
- **Responsive layouts**:
  - Desktop: 16×12 cells @ 50px per cell (800×600px canvas)
  - Mobile: 12×16 cells @ 40px per cell (480×640px canvas, portrait)
  - Automatic layout detection based on viewport size
- **Smart cheese placement**: Uses BFS to find farthest reachable cell from start
- **Dynamic maze sizing**: Canvas and viewport adapt to detected layout
- **Unit tests**: 14 MazeGenerator tests verifying generation correctness

### Fixed
- **Movement bug**: Player now stops immediately when key is released (both WASD and arrow keys)
- **Isolated passages**: Fixed maze generation to ensure all passages are connected
- **Test reliability**: Relaxed distance requirements for randomly generated mazes

### Technical Details
- **Dependencies**:
  - pixi.js: ^8.7.0 (rendering engine)
  - vite: ^7.3.1 (build tool)
  - typescript: ~5.9.3 (type safety)
  - vitest: ^2.0.0 (testing framework)
  - jsdom: ^28.1.0 (test environment)

### Test Coverage
- **Total**: 57 unit tests passing
- **Player**: 11 tests (movement, collision, state)
- **Maze**: 12 tests (structure, collision, pathfinding)
- **Input**: 8 tests (keyboard and touch handling)
- **Renderer**: 12 tests (viewport, fog-of-war, visibility)
- **MazeGenerator**: 14 tests (generation, connectivity, goal placement)

## Phase 4 Checklist

### Cleanup Tasks
- [ ] Remove unused `src/counter.ts` file (Vite template artifact)
- [ ] Run `rm src/counter.ts`

### Security Audit
- [ ] Run `pnpm audit` to check for vulnerabilities
- [ ] Address any high/critical security issues
- [ ] Document findings and resolutions

### Dependency Updates
- [ ] Check for outdated packages: `pnpm outdated`
- [ ] Review breaking changes in major updates
- [ ] Update dependencies: `pnpm update --latest`
- [ ] Re-run full test suite: `pnpm test`
- [ ] Verify build succeeds: `pnpm run build`

### Code Security Review
- [x] No use of `eval()`, `Function()`, or dynamic code execution
- [x] No `innerHTML` with untrusted input (using PixiJS Text API)
- [x] No hardcoded secrets or API keys
- [x] Input validation implemented (keyboard and touch)
- [x] No form submissions or external API calls in MVP

### Performance Validation
- [ ] Desktop: Verify 60 FPS during gameplay
- [ ] Mobile: Verify ≥50 FPS on mobile devices/emulators
- [ ] Fog-of-war: Confirm efficient rendering (only visible cells)
- [ ] Memory: Check for leaks during extended gameplay

### Final Testing
- [ ] All 57 unit tests pass
- [ ] Manual testing on desktop (Chrome, Firefox, Safari)
- [ ] Manual testing on mobile (iOS and Android)
- [ ] Responsive layout switches correctly at 800px breakpoint
- [ ] Game restarts properly without memory leaks

### Documentation
- [x] CHANGELOG.md created
- [ ] README.md updated with gameplay instructions
- [ ] Code comments verified for clarity

## Known Issues
None at this time.

## Future Enhancements (Post-MVP)
- **Leaderboard**: localStorage for high scores
- **Multiple levels**: Difficulty progression
- **Power-ups**: Speed boost, wall reveal
- **Sound effects**: Footsteps, cheese collection
- **Animations**: Sprite animations for player movement
- **Enemies**: Moving hazards (optional)
