/**
 * Game orchestrates the main game loop and state.
 */

import { Player } from './Player'
import { Maze } from './Maze'
import type { Cell } from './Maze'
import { Input } from './Input'
import { Renderer } from './Renderer'
import { Viewport } from './Viewport'

export interface GameState {
  isRunning: boolean;
  isWon: boolean;
  elapsedTime: number; // milliseconds
}

/**
 * 10x10 test maze with guaranteed path from (50,50) to (400,400)
 */
export const TEST_MAZE_GRID: Cell[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

export class Game {
  player: Player;
  maze: Maze;
  input: Input;
  renderer: Renderer;
  viewport: Viewport;
  state: GameState;
  cheeseX: number;
  cheeseY: number;
  frameId: number | null = null;
  targetFPS: number = 60;
  lastFrameTime: number = 0;

  constructor(canvasElement: HTMLCanvasElement) {
    // Initialize maze
    this.maze = new Maze({
      width: 10,
      height: 10,
      cellSize: 50,
      grid: TEST_MAZE_GRID,
    });

    // Initialize player at maze start (grid position (1,1))
    this.player = new Player(1 * 50 + 25, 1 * 50 + 25, 8);

    // Place cheese at valid position (grid position (7,7))
    this.cheeseX = 7 * 50 + 25;
    this.cheeseY = 7 * 50 + 25;

    // Initialize input
    this.input = new Input();

    // Initialize renderer
    this.renderer = new Renderer(canvasElement);

    // Initialize viewport with fog-of-war
    this.viewport = new Viewport({
      width: 800,
      height: 600,
      radius: 150, // Fog-of-war visibility radius
      canvasWidth: 800,
      canvasHeight: 600,
    });

    // Initialize game state
    this.state = {
      isRunning: true,
      isWon: false,
      elapsedTime: 0,
    };
  }

  /**
   * Initialize the game asynchronously (must be called before start()).
   */
  async init(): Promise<void> {
    await this.renderer.init();
  }

  /**
   * Start the game loop using PixiJS ticker.
   */
  start(): void {
    this.state.isRunning = true;
    this.lastFrameTime = Date.now();

    // Use PixiJS ticker for animation loop
    this.renderer.app.ticker.add(() => {
      if (!this.state.isRunning) return;

      const now = Date.now();
      const deltaTime = now - this.lastFrameTime;
      this.lastFrameTime = now;

      // Update game state
      this.update(deltaTime);

      // Render
      this.render();
    });
  }

  /**
   * Main game loop (deprecated - use ticker instead).
   */
  private gameLoop = (): void => {
    if (!this.state.isRunning) return;

    const now = Date.now();
    const deltaTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    // Update game state
    this.update(deltaTime);

    // Render
    this.render();

    // Schedule next frame
    this.frameId = requestAnimationFrame(this.gameLoop);
  };

  /**
   * Update game state.
   */
  private update(deltaTime: number): void {
    if (!this.state.isRunning || this.state.isWon) return;

    // Update elapsed time
    this.state.elapsedTime += deltaTime;

    // Get input direction
    const direction = this.input.getDirection();
    if (direction) {
      this.player.setDirection(direction);
    }

    // Update player position
    this.player.update((x: number, y: number) => {
      return this.maze.canMoveTo(x, y, this.player.radius);
    });

    // Update viewport
    this.viewport.centerOn(this.player.x, this.player.y);

    // Check win condition (collision with cheese)
    if (this.player.collidesWith(this.cheeseX, this.cheeseY, 10)) {
      this.state.isWon = true;
    }
  }

  /**
   * Render current frame.
   */
  private render(): void {
    // Clear
    this.renderer.clear();

    // Render maze
    this.renderer.renderMaze(this.maze, this.viewport);

    // Render cheese
    this.renderer.renderCheese(this.cheeseX, this.cheeseY, this.viewport);

    // Render player
    this.renderer.renderPlayer(this.player, this.viewport);

    // Render fog-of-war
    this.renderer.renderFogOfWar(this.viewport);

    // Render HUD
    const timerText = this.formatTime(this.state.elapsedTime);
    if (this.state.isWon) {
      this.renderer.renderMessage(
        `🧀 You reached the cheese!\n\nTime: ${timerText}\n\nRefresh to play again`,
        0xffd700
      );
    } else {
      this.renderer.renderHUD(
        timerText,
        'Find the cheese!',
        0xffffff,
        800,
        600
      );
    }
  }

  /**
   * Format time in MM:SS.ms format.
   */
  private formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
  }

  /**
   * Stop the game loop.
   */
  stop(): void {
    this.state.isRunning = false;
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  /**
   * Get current game state.
   */
  getState(): GameState {
    return { ...this.state };
  }

  /**
   * Reset game to initial state.
   */
  reset(): void {
    this.state = {
      isRunning: true,
      isWon: false,
      elapsedTime: 0,
    };
    this.player = new Player(1 * 50 + 25, 1 * 50 + 25, 8);
    this.lastFrameTime = Date.now();
  }
}
