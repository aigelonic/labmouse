# 🐭 Labmouse

A personal variant of an old Amstrad-style game - guide the mouse (🐭) through a procedurally generated maze to reach the cheese (🧀)!

## 🎮 Game Features

- **Emoji Graphics**: Charming mouse and cheese emoji instead of simple shapes
- **Procedural Maze Generation**: Every game is unique with recursive backtracking algorithm
- **Three Difficulty Levels**: 
  - **Easy**: 12×9 cells, 150px fog radius (more visible area)
  - **Medium**: 16×12 cells, 120px fog radius (balanced)
  - **Hard**: 20×15 cells, 100px fog radius (challenging exploration)
- **Dynamic Fog of War**: Limited visibility that scales with difficulty
- **Responsive Design**: Auto-detects viewport for optimal layout on desktop and mobile
- **Sound Effects**: Programmatic Web Audio for movement, collection, and victory
- **Leaderboard System**: Top 5 times per difficulty saved in LocalStorage
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
1. On the title screen, click a difficulty button to select your challenge level
2. View the leaderboard showing top 5 times for the selected difficulty
3. Press any key or tap to start playing
4. Navigate the maze using keyboard or touch controls
5. Find the cheese (🧀) within the fog of war
6. Reach the cheese as quickly as possible
7. View your completion time and leaderboard position (if you made top 5!)
8. Press any key to return to title and play again with a new maze

### Audio
- Sound effects initialize on first user interaction (browser requirement)
- Hear little blips when changing direction
- Collect sound when reaching the cheese
- Victory fanfare on the win screen

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
│   │   ├── Renderer.ts          # PixiJS rendering with emoji
│   │   ├── Viewport.ts          # Fog-of-war system
│   │   ├── SoundManager.ts      # Web Audio API sound effects
│   │   ├── Leaderboard.ts       # LocalStorage high scores
│   │   └── __tests__/           # 79 unit tests
│   ├── ui/
│   │   ├── HUD.ts               # In-game UI (timer, difficulty indicator)
│   │   └── Screen.ts            # Title/win screens with leaderboard
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

**Test Coverage**: 79 passing tests
- Player: 11 tests (movement, collision)
- Maze: 12 tests (structure, pathfinding)
- Input: 8 tests (keyboard and touch)
- Renderer: 12 tests (viewport, fog-of-war)
- MazeGenerator: 14 tests (generation, connectivity)
- SoundManager: 10 tests (Web Audio API, initialization)
- Leaderboard: 12 tests (LocalStorage, ranking, persistence)

## 🎨 Design Philosophy

- **Retro with Modern Charm**: Classic arcade gameplay enhanced with emoji graphics
- **Emoji-First Graphics**: Using 🐭 and 🧀 for instant visual recognition
- **Fog of War Exploration**: Creates sense of discovery and challenge
- **Difficulty Progression**: Three balanced difficulty levels for all skill levels
- **Guaranteed Solvable**: Every maze has a valid path from start to cheese
- **Responsive First**: Works seamlessly on desktop and mobile
- **Performance Focused**: Maintains 60 FPS with optimized rendering
- **Progressive Enhancement**: Sound effects enhance but don't block gameplay

## 📜 License

See [LICENSE](LICENSE) file for details.

## 🤝 Contributing

This is a personal project, but feedback and suggestions are welcome! Open an issue or submit a pull request.

## 🎯 Development Phases

- ✅ **Phase 1**: Core game loop, movement, fog-of-war, win condition
- ✅ **Phase 2**: HUD, screens, visual polish
- ✅ **Phase 3**: Procedural generation, responsive design
- ✅ **Phase 4**: Security audit, dependency updates, performance optimization
- ✅ **Enhancement Phase**: Emoji graphics, sound effects, difficulty levels, leaderboard

## 🐛 Known Issues

None at this time! All 79 tests passing.

## 🔮 Future Enhancement Ideas

- Persistent fog reveal (show explored areas in gray)
- Particle effects on cheese collection
- Power-ups (speed boost, wall reveal, extended vision)
- Mini-map in corner
- Moving enemies (optional hardcore mode)
- Animated sprite sheets
- Multiplayer ghost racing (race against your best time)
- Touch controls improvement (virtual joystick)

---

**Have fun navigating the maze! 🧀**
