#!/bin/bash

# Commit script for organized git history
# Creates 7 logical commits following Conventional Commits format

set -e

echo "Creating organized git commits..."

# Commit 1: Remove unused Vite template file
git add -A
git commit -m "chore: Remove unused Vite template file

- Delete src/counter.ts (Vite template artifact)
- Clean up template code not needed for game"

# Commit 2: Add UI system (Phase 2)
git add src/ui/HUD.ts src/ui/Screen.ts
git add src/game/Game.ts src/game/Renderer.ts
git add index.html src/main.ts
git commit -m "feat: Add UI system with HUD and Screen components (Phase 2)

- Add HUD.ts: In-game overlay (timer, instructions, status)
- Add Screen.ts: Full-screen overlays (title, win, pause)
- Integrate UI into Game.ts with screen state management
- Add fog glow effect to Renderer.ts
- Update main.ts to use async PixiJS v8 initialization
- Add title screen at game start
- Display win screen with time on cheese collection"

# Commit 3: Add Renderer tests (Phase 2)
git add src/game/__tests__/Renderer.test.ts
git commit -m "test: Add Renderer and Viewport unit tests (Phase 2)

- Add Renderer.test.ts with 12 tests
- Test layer system, fog-of-war rendering, win condition display
- Verify proper initialization and cleanup
- Total: 41 tests passing (Player: 11, Maze: 12, Input: 8, Renderer: 12)"

# Commit 4: Add procedural maze generation (Phase 3)
git add src/game/MazeGenerator.ts
git add src/game/__tests__/MazeGenerator.test.ts
git commit -m "feat: Add procedural maze generation (Phase 3)

- Add MazeGenerator.ts with recursive backtracking algorithm
- Generate random solvable mazes with guaranteed path to goal
- BFS pathfinding to place cheese at farthest reachable position
- Add 14 unit tests for generation correctness
- Verify all passages connected, no isolated areas
- Total: 55 tests passing"

# Commit 5: Integrate procedural generation + fix game loop memory leaks
git add src/game/Game.ts src/game/Maze.ts
git commit -m "feat: Integrate procedural generation with responsive layout and fix memory leaks

Game.ts changes:
- Add detectLayout() for responsive sizing (desktop 16×12@50px, mobile 12×16@40px)
- Use MazeGenerator instead of static TEST_MAZE_GRID
- Generate new maze on each restart with reset()
- Fix ticker callback accumulation (store reference, remove before adding)
- Fix event listener leaks (cleanup handlers before creating new ones)
- Prevent multiple game loops running simultaneously

Maze.ts changes:
- Add constructor parameter for dynamic grid initialization
- Support responsive grid sizes from MazeGenerator"

# Commit 6: Fix renderer memory leaks (Performance)
git add src/game/Renderer.ts
git commit -m "perf: Fix memory leaks in fog-of-war rendering

Critical fixes:
- Reuse 5 Graphics objects for fog-of-war instead of creating 300/second
- Add fogTopRect, fogBottomRect, fogLeftRect, fogRightRect, fogGlowCircle
- Update renderFogOfWar() to modify existing geometry instead of recreating
- Fix clear() to destroy Graphics objects: removeChildren().forEach(child => child.destroy())
- Add destroy() method for complete resource cleanup

Performance impact:
- Eliminates GPU memory leak (was accumulating Graphics objects)
- Maintains stable 60 FPS during extended gameplay
- Game no longer slows down after multiple restarts"

# Commit 7: Add comprehensive documentation
git add README.md CHANGELOG.md TESTING_PHASE2.md
git commit -m "docs: Add comprehensive documentation

- README.md: Complete game documentation with features, controls, tech stack
- CHANGELOG.md: Development history tracking all 4 phases
- TESTING_PHASE2.md: Manual testing checklist for Phase 2 features
- Document 57 passing unit tests across 5 test suites
- Document memory leak fixes and performance optimizations
- Add Phase 4 completion checklist"

echo ""
echo "✨ All commits created successfully!"
echo ""
echo "Commits created:"
git log --oneline -7
echo ""
echo "Ready to push to remote: git push origin main"
