# Labmouse Testing Checklist

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
- ✅ **Player.test.ts**: 11 tests passing
  - Initialization with position and radius
  - Direction setting and movement
  - Collision detection
  - State serialization
  
- ✅ **Maze.test.ts**: 12 tests passing
  - Grid structure and dimensions
  - Collision detection with walls
  - Boundary checking
  - BFS pathfinding (hasPath)
  - Diagonal collision handling
  
- ✅ **Input.test.ts**: 8 tests passing
  - Keyboard state tracking
  - WASD and arrow key recognition
  - Direction priority order
  - Key press and release events
  
- ✅ **Renderer.test.ts**: 12 tests passing
  - Layer initialization
  - Viewport coordinate conversion
  - Fog-of-war visibility calculations
  - World bounds calculation
  - Area visibility checks

- ✅ **MazeGenerator.test.ts**: 14 tests passing
  - Procedural maze generation
  - Grid connectivity
  - BFS pathfinding to goal
  - Random maze variance

- ✅ **SoundManager.test.ts**: 10 tests passing
  - Web Audio API initialization
  - Sound playback (move, collect, win)
  - Error handling

- ✅ **Leaderboard.test.ts**: 12 tests passing
  - LocalStorage persistence
  - Time ranking
  - Top 5 filtering
  - Difficulty separation

**Total Expected**: 79 tests passing

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
- [ ] Three difficulty buttons visible: Easy, Medium, Hard
- [ ] Medium difficulty selected by default (green highlight)
- [ ] Leaderboard section shows "🏆 Best Times (MEDIUM) 🏆"
- [ ] "No times yet - be the first!" or top 5 times displayed
- [ ] Instructions: "Use WASD or arrow keys"
- [ ] "Click difficulty to change" instruction visible
- [ ] Semi-transparent dark background
- [ ] No console errors

**Screenshot checkpoint**: Title screen with difficulty selector

---

### 2. Difficulty Selection
**Steps:**
1. Click "Easy" difficulty button
2. Observe screen changes
3. Click "Hard" difficulty button
4. Click "Medium" difficulty button again

**Expected:**
- [ ] Clicked button highlights in green
- [ ] Other buttons remain gray
- [ ] Leaderboard title updates to match difficulty (EASY/MEDIUM/HARD)
- [ ] Leaderboard times update for selected difficulty
- [ ] No game start on difficulty button click
- [ ] Smooth visual feedback

**Screenshot checkpoint**: Each difficulty selected

---

### 3. Title Screen Interaction
**Steps:**
1. With Medium selected, press any key (e.g., spacebar, Enter, W)
2. Alternatively, click anywhere outside difficulty buttons

**Expected:**
- [ ] Title screen disappears immediately
- [ ] Game world appears with fog-of-war
- [ ] 🐭 emoji mouse visible in center (not red circle)
- [ ] Gray maze walls visible within fog radius (120px on Medium)
- [ ] 🧀 emoji cheese visible somewhere in maze
- [ ] Timer starts at top-left (00:00.00)
- [ ] HUD shows "MEDIUM" in top-right corner
- [ ] Sound initializes (check browser console if blocked)
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

### 4. Sound Effects
**Steps:**
1. After starting game (sound initializes on first interaction)
2. Press W to move up
3. Press A to move left (change direction)
4. Navigate to cheese
5. Reach cheese
6. Observe win screen

**Expected:**
- [ ] Short blip sound plays when changing direction (440Hz tone)
- [ ] No sound when continuing in same direction
- [ ] No sound when standing still
- [ ] Collection chime plays when touching cheese (C5→E5 rising tones)
- [ ] Victory fanfare plays on win screen (C5→E5→G5 melody)
- [ ] Sounds are brief and non-intrusive
- [ ] Works in Chrome, Firefox, Safari
- [ ] No errors if browser blocks audio (graceful degradation)

**Note**: If audio doesn't play, check browser console for autoplay policy messages.

---

### 5. Fog-of-War System  
**Steps:**
1. Move player around the maze
2. Explore different areas
3. Test on each difficulty

**Expected:**
- [ ] Easy: ~150px radius (~3 cells visible)
- [ ] Medium: ~120px radius (~2.4 cells visible)
- [ ] Hard: ~100px radius (~2 cells visible - more challenging)
- [ ] Fog overlay is dark (alpha 0.85)
- [ ] Blue glow circle at fog edge (subtle)
- [ ] Viewport centers on player smoothly
- [ ] Walls render only within visible area
- [ ] Cheese visible when within fog radius
- [ ] Dark areas completely black outside radius

**Screenshot checkpoint**: Fog-of-war on each difficulty

---

### 6. Collision Detection
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

### 7. Timer Display (HUD)
**Steps:**
1. Watch timer for 10 seconds
2. Check HUD elements

**Expected:**
- [ ] Timer format: MM:SS.ms (e.g., 00:10.50)
- [ ] Timer updates smoothly (every frame)
- [ ] Timer has drop shadow for readability
- [ ] Timer positioned at (16, 12) top-left
- [ ] "Find the cheese!" instruction at bottom center
- [ ] Difficulty shown in top-right (EASY/MEDIUM/HARD)
- [ ] Text readable against dark background

---

### 8. Cheese Collection & Leaderboard
**Steps:**
1. Navigate maze to reach 🧀 cheese emoji
2. Move player to touch cheese
3. Complete 5 games to fill leaderboard

**Expected:**
- [ ] Collection chime plays when touching cheese
- [ ] Win screen triggers immediately on contact
- [ ] Victory fanfare plays
- [ ] Win screen shows "🧀 You Win! 🧀" in gold
- [ ] Final time displayed correctly (e.g., "Time: 00:45.30")
- [ ] If time qualifies: "🏆 #X on Leaderboard! 🏆" badge shows
- [ ] Position shown (1-5) if in top 5
- [ ] No badge if time doesn't qualify for top 5
- [ ] "Press any key or tap to play again" message visible
- [ ] Game world hidden behind semi-transparent overlay
- [ ] HUD timer hidden
- [ ] Timer stopped at contact moment

**Leaderboard Testing:**
- [ ] Complete game in 30 seconds (should rank #1)
- [ ] Complete again in 45 seconds (should rank #2)
- [ ] Return to title - leaderboard shows both times
- [ ] Times sorted fastest to slowest
- [ ] Each difficulty has separate leaderboard
- [ ] Leaderboard persists after page reload

**Screenshot checkpoint**: Win screen with leaderboard position

---

### 9. Play Again Flow
**Steps:**
1. After winning, press any key or click
2. Observe screen transition

**Expected:**
- [ ] Win screen disappears
- [ ] Title screen reappears with selected difficulty
- [ ] Leaderboard updates with new time
- [ ] Can click difficulty to change before restarting
- [ ] Can start new game by pressing key
- [ ] Timer resets to 00:00.00 on new game
- [ ] Player reset to starting position (1,1)
- [ ] NEW procedurally generated maze (different from previous)
- [ ] Cheese in new position (BFS calculates farthest point)

---

### 10. Difficulty Level Testing
**Steps:**
1. Test Easy difficulty
2. Test Medium difficulty
3. Test Hard difficulty

**Easy Mode:**
- [ ] Maze size: 12×9 cells (desktop) or 9×12 (mobile)
- [ ] Fog radius: 150px (most visible area)
- [ ] Feels easier to navigate
- [ ] Leaderboard shows "BEST TIMES (EASY)"
- [ ] Times saved separately from other difficulties

**Medium Mode:**
- [ ] Maze size: 16×12 cells (desktop) or 12×16 (mobile)
- [ ] Fog radius: 120px (balanced visibility)
- [ ] Default difficulty on game start
- [ ] Leaderboard shows "BEST TIMES (MEDIUM)"

**Hard Mode:**
- [ ] Maze size: 20×15 cells (desktop) or 15×20 (mobile)
- [ ] Fog radius: 100px (most challenging, limited vision)
- [ ] Larger maze takes longer to explore
- [ ] Leaderboard shows "BEST TIMES (HARD)"
- [ ] HUD displays "HARD" during gameplay

**Difficulty Persistence:**
- [ ] Selected difficulty persists after winning
- [ ] Can change difficulty on title screen
- [ ] Each playthrough uses selected difficulty settings

**Screenshot checkpoint**: Each difficulty's gameplay

---

### 11. Visual Polish Checks
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
