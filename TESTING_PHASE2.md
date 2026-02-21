# Phase 2 Testing Checklist

## Test Environment Setup

**Prerequisites:**
- jsdom installed for vitest (✓ completed)
- TypeScript compilation successful (✓ no errors)
- Dev server: `pnpm dev`

---

## Automated Unit Tests

### Command
```bash
pnpm test
```

### Expected Results
- ✅ **Player.test.ts**: 9 tests passing
  - Initialization with position and radius
  - Direction setting and movement
  - Collision detection
  - State serialization
  
- ✅ **Maze.test.ts**: 11 tests passing
  - Grid structure and dimensions
  - Collision detection with walls
  - Boundary checking
  - BFS pathfinding (hasPath)
  - Diagonal collision handling
  
- ✅ **Input.test.ts**: 9 tests passing
  - Keyboard state tracking
  - WASD and arrow key recognition
  - Direction priority order
  - Key press and release events
  
- ✅ **Renderer.test.ts**: 10+ tests passing
  - Layer initialization
  - Viewport coordinate conversion
  - Fog-of-war visibility calculations
  - World bounds calculation
  - Area visibility checks

**Total Expected**: ~39 tests passing

---

## Manual Testing Checklist

### 1. Game Startup Flow
**Steps:**
1. Run `pnpm dev`
2. Open browser at `http://localhost:5173`
3. Observe initial screen

**Expected:**
- [ ] Title screen displays "LabMouse" in gold
- [ ] Subtitle "Reach the Cheese!" visible
- [ ] Instructions text readable: "Use WASD or arrow keys to move"
- [ ] "Press any key to start" prompt visible
- [ ] Semi-transparent dark background
- [ ] No console errors

**Screenshot checkpoint**: Title screen

---

### 2. Title Screen Interaction
**Steps:**
1. Press any key (e.g., spacebar, Enter, W)
2. Alternatively, click anywhere on canvas

**Expected:**
- [ ] Title screen disappears immediately
- [ ] Game world appears with fog-of-war
- [ ] Red mouse player visible in center
- [ ] Gray maze walls visible within fog radius
- [ ] Yellow cheese visible somewhere in fog area
- [ ] Timer starts at 00:00.00 in top-left
- [ ] "Find the cheese!" instruction at bottom
- [ ] Fog glow effect (blue circle) around visible area

**Screenshot checkpoint**: First frame of gameplay

---

### 3. Player Movement
**Steps:**
1. Press **W** (move up)
2. Release **W**
3. Press **S** (move down)
4. Press **A** (move left)
5. Press **D** (move right)
6. Try arrow keys: ↑ ↓ ← →

**Expected:**
- [ ] Player moves smoothly in each direction
- [ ] Player STOPS when key is released (critical fix)
- [ ] Fog-of-war follows player position
- [ ] Player cannot move through gray walls
- [ ] Timer continues counting up
- [ ] Movement is responsive (no lag)
- [ ] Both WASD and arrow keys work identically

**Bug to verify fixed**: Player should NOT continue moving after key release

---

### 4. Fog-of-War System
**Steps:**
1. Move player around the maze
2. Explore different areas
3. Move to maze corners

**Expected:**
- [ ] Visible radius is ~150px (roughly 3 cell widths)
- [ ] Fog overlay is dark (alpha 0.85)
- [ ] Blue glow circle at fog edge (subtle)
- [ ] Viewport centers on player smoothly
- [ ] Walls render only within visible area (performance optimization)
- [ ] Cheese visible when within fog radius
- [ ] Dark areas completely black outside radius

**Screenshot checkpoint**: Fog-of-war in action

---

### 5. Collision Detection
**Steps:**
1. Try to move player into walls from all 4 directions
2. Move along wall edges
3. Try diagonal approaches to corners

**Expected:**
- [ ] Player stops at wall boundaries
- [ ] No clipping through walls
- [ ] Smooth sliding along walls
- [ ] Diagonal collision handled correctly
- [ ] Player radius (8px) considered in collision

---

### 6. Timer Display (HUD)
**Steps:**
1. Watch timer for 10 seconds
2. Check timer format

**Expected:**
- [ ] Timer format: MM:SS.ms (e.g., 00:10.50)
- [ ] Timer updates smoothly (every frame)
- [ ] Timer has drop shadow for readability
- [ ] Timer positioned at (16, 12) top-left
- [ ] "Find the cheese!" instruction at bottom center
- [ ] Text readable against dark background

---

### 7. Cheese Collection (Win Condition)
**Steps:**
1. Navigate maze to reach yellow cheese
2. Move player to touch cheese

**Expected:**
- [ ] Win screen triggers immediately on contact
- [ ] Win screen shows "🧀 You Win! 🧀" in gold
- [ ] Final time displayed correctly (e.g., "Time: 00:45.30")
- [ ] "Press any key or tap to play again" message visible
- [ ] Game world hidden behind semi-transparent overlay
- [ ] HUD timer hidden
- [ ] Timer stopped at contact moment

**Screenshot checkpoint**: Win screen

---

### 8. Play Again Flow
**Steps:**
1. After winning, press any key or click
2. Observe screen transition

**Expected:**
- [ ] Win screen disappears
- [ ] Title screen reappears
- [ ] "Press any key to start" prompt visible
- [ ] Can start new game by pressing key
- [ ] Timer resets to 00:00.00 on new game
- [ ] Player reset to starting position (1,1)
- [ ] Cheese in same position (7,7)

---

### 9. Visual Polish Checks
**Steps:**
1. Review all visual elements
2. Check text readability

**Expected:**
- [ ] Drop shadows on all text elements
- [ ] Consistent color scheme:
  - Background: #0a0a0a (very dark)
  - Walls: #444444 (gray)
  - Player: #ff6b6b (red/pink)
  - Cheese: #ffd700 (gold)
  - Fog glow: #6699ff (blue, alpha 0.3)
- [ ] Monospace font used consistently
- [ ] Text aligned properly (center, left, right as designed)
- [ ] No visual glitches or flashing

---

### 10. Performance Testing
**Steps:**
1. Open browser DevTools (F12)
2. Go to Performance tab
3. Start recording
4. Play game for 30 seconds
5. Stop recording

**Expected:**
- [ ] Steady 60 FPS during gameplay
- [ ] No frame drops during movement
- [ ] No memory leaks (check memory graph)
- [ ] CPU usage reasonable (<50% on modern hardware)
- [ ] Fog-of-war rendering efficient (only visible cells rendered)

---

### 11. Edge Cases
**Steps:**
1. Spam multiple keys simultaneously
2. Rapidly press start on title screen
3. Try to move before game starts
4. Press keys on win screen

**Expected:**
- [ ] No crashes or errors
- [ ] Game handles rapid input gracefully
- [ ] Input ignored when not in "playing" state
- [ ] Only one instance of event listeners
- [ ] Win screen listens correctly for restart

---

### 12. Console Error Check
**Steps:**
1. Open browser Console (F12)
2. Play through entire game flow
3. Check for any errors or warnings

**Expected:**
- [ ] No console errors
- [ ] No PixiJS deprecation warnings
- [ ] No "undefined" or "null" errors
- [ ] No network errors
- [ ] Clean console output

---

## Test Results Summary

### Automated Tests
- [ ] All 39 unit tests passing
- [ ] No test failures
- [ ] No test timeouts

### Manual Tests
- [ ] Title screen: ___/12 checks passed
- [ ] Gameplay: ___/12 checks passed
- [ ] Win flow: ___/8 checks passed
- [ ] Visual polish: ___/8 checks passed
- [ ] Performance: ___/5 checks passed
- [ ] Edge cases: ___/5 checks passed

### Critical Issues Found
(List any blockers or critical bugs here)

### Minor Issues Found
(List any polish items or non-critical bugs here)

### Notes
(Add any observations or suggestions here)

---

## Sign-off

**Phase 2 Testing Complete**: ☐ Yes ☐ No

**Ready for Phase 3**: ☐ Yes ☐ No (resolve issues first)

**Tester**: _______________
**Date**: _______________
**Browser/Version**: _______________
**OS**: _______________
