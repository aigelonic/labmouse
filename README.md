# 🐭 Labmouse

A personal variant of an old Amstrad-style game - guide the mouse through a procedurally generated maze to reach the cheese!

## 🎮 Game Features

- **Procedural Maze Generation**: Every game is unique with recursive backtracking algorithm
- **Fog of War**: Explore the maze with limited visibility (150px radius)
- **Responsive Design**: 
  - Desktop: 16×12 cells (800×600px)
  - Mobile: 12×16 cells portrait (480×640px)
- **Time-Based Scoring**: Race against the clock to find the cheese
- **Smooth Controls**: WASD or arrow keys on desktop, touch zones on mobile

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## 🎯 How to Play

### Desktop Controls
- **W** or **↑**: Move up
- **S** or **↓**: Move down
- **A** or **←**: Move left
- **D** or **→**: Move right

### Mobile Controls
- Tap on the screen in the direction you want to move
- The canvas is divided into 4 zones (up, down, left, right)

### Objective
1. Press any key on the title screen to start
2. Navigate the maze using keyboard or touch
3. Find the yellow cheese (🧀) within the fog of war
4. Reach the cheese as quickly as possible
5. View your completion time on the win screen
6. Press any key to play again with a new maze

## 🛠️ Technology Stack

- **PixiJS v8**: High-performance 2D rendering
- **TypeScript**: Type-safe game logic
- **Vite**: Fast build tool and dev server
- **Vitest**: Unit testing framework
- **pnpm**: Fast, disk-efficient package manager

## 📁 Project Structure

```
labmouse/
├── src/
│   ├── game/
│   │   ├── Game.ts              # Main game orchestration
│   │   ├── Player.ts            # Player movement and collision
│   │   ├── Maze.ts              # Maze data structure
│   │   ├── MazeGenerator.ts     # Procedural generation
│   │   ├── Input.ts             # Keyboard + touch input
│   │   ├── Renderer.ts          # PixiJS rendering
│   │   ├── Viewport.ts          # Fog-of-war system
│   │   └── __tests__/           # 57 unit tests
│   ├── ui/
│   │   ├── HUD.ts               # In-game UI (timer, instructions)
│   │   └── Screen.ts            # Title/win/pause screens
│   ├── main.ts                  # Application entry point
│   └── style.css                # Minimal styling
├── index.html                   # HTML entry
├── GAME_PLAN.md                 # Detailed development plan
├── CHANGELOG.md                 # Change history
└── package.json                 # Dependencies
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
pnpm test
```

**Test Coverage**: 57 passing tests
- Player: 11 tests (movement, collision)
- Maze: 12 tests (structure, pathfinding)
- Input: 8 tests (keyboard and touch)
- Renderer: 12 tests (viewport, fog-of-war)
- MazeGenerator: 14 tests (generation, connectivity)

## 🎨 Design Philosophy

- **Retro Minimal Aesthetic**: Simple shapes and colors reminiscent of classic arcade games
- **Fog of War Exploration**: Creates sense of discovery and challenge
- **Guaranteed Solvable**: Every maze has a valid path from start to cheese
- **Responsive First**: Works seamlessly on desktop and mobile
- **Performance Focused**: 60 FPS on desktop, ≥50 FPS on mobile

## 📜 License

See [LICENSE](LICENSE) file for details.

## 🤝 Contributing

This is a personal project, but feedback and suggestions are welcome! Open an issue or submit a pull request.

## 🎯 Development Phases

- ✅ **Phase 1**: Core game loop, movement, fog-of-war, win condition
- ✅ **Phase 2**: HUD, screens, visual polish
- ✅ **Phase 3**: Procedural generation, responsive design
- 🔄 **Phase 4**: Security audit, dependency updates, cleanup

## 🐛 Known Issues

None at this time! All 57 tests passing.

## 🔮 Future Enhancements

- Leaderboard with localStorage
- Multiple difficulty levels
- Power-ups (speed boost, wall reveal)
- Sound effects and music
- Animated sprites
- Moving enemies (optional)

---

**Have fun navigating the maze! 🧀**
