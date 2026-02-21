/**
 * Game orchestrates the main game loop and state.
 */

import { Player } from './Player'
import { Maze } from './Maze'
import { MazeGenerator } from './MazeGenerator'
import { Input } from './Input'
import { Renderer } from './Renderer'
import { Viewport } from './Viewport'
import { HUD } from '../ui/HUD'
import { Screen } from '../ui/Screen'

export interface GameState {
  isRunning: boolean;
  isWon: boolean;
  elapsedTime: number; // milliseconds
  screenState: 'title' | 'playing' | 'win' | null;
}

export interface LayoutConfig {
  width: number;
  height: number;
  cellSize: number;
  canvasWidth: number;
  canvasHeight: number;
}

/**
 * Detect viewport size and return appropriate layout configuration.
 * Desktop: 16×12 cells @ 50px = 800×600px
 * Mobile: 12×16 cells @ 40px = 480×640px
 */
export function detectLayout(): LayoutConfig {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Use mobile layout if width < 800px or portrait orientation
  const isMobile = viewportWidth < 800 || viewportHeight > viewportWidth;
  
  if (isMobile) {
    return {
      width: 12,
      height: 16,
      cellSize: 40,
      canvasWidth: 480,
      canvasHeight: 640,
    };
  }
  
  // Desktop layout
  return {
    width: 16,
    height: 12,
    cellSize: 50,
    canvasWidth: 800,
    canvasHeight: 600,
  };
}

export class Game {
  player: Player;
  maze: Maze;
  input: Input;
  renderer: Renderer;
  viewport: Viewport;
  hud: HUD;
  titleScreen: Screen;
  winScreen: Screen;
  state: GameState;
  cheeseX: number;
  cheeseY: number;
  layout: LayoutConfig;
  frameId: number | null = null;
  targetFPS: number = 60;
  lastFrameTime: number = 0;
  
  // Store references for cleanup
  private tickerCallback: (() => void) | null = null;
  private startGameHandler: (() => void) | null = null;
  private playAgainHandler: (() => void) | null = null;

  constructor(canvasElement: HTMLCanvasElement) {
    // Detect layout based on viewport size
    this.layout = detectLayout();
    
    // Generate procedural maze
    const generator = new MazeGenerator({
      width: this.layout.width,
      height: this.layout.height,
    });
    const mazeGrid = generator.generate();
    
    // Initialize maze
    this.maze = new Maze({
      width: this.layout.width,
      height: this.layout.height,
      cellSize: this.layout.cellSize,
      grid: mazeGrid,
    });

    // Initialize player at maze start (grid position (1,1))
    const playerGridX = 1;
    const playerGridY = 1;
    this.player = new Player(
      playerGridX * this.layout.cellSize + this.layout.cellSize / 2,
      playerGridY * this.layout.cellSize + this.layout.cellSize / 2,
      8
    );

    // Find cheese position using generator's pathfinding
    const goalPosition = generator.findGoalPosition(playerGridX, playerGridY);
    if (!goalPosition) {
      // Fallback to bottom-right if no goal found
      this.cheeseX = (this.layout.width - 2) * this.layout.cellSize + this.layout.cellSize / 2;
      this.cheeseY = (this.layout.height - 2) * this.layout.cellSize + this.layout.cellSize / 2;
    } else {
      this.cheeseX = goalPosition.x * this.layout.cellSize + this.layout.cellSize / 2;
      this.cheeseY = goalPosition.y * this.layout.cellSize + this.layout.cellSize / 2;
    }

    // Initialize input
    this.input = new Input();

    // Initialize renderer with responsive canvas size
    this.renderer = new Renderer(canvasElement);

    // Initialize UI with responsive dimensions
    this.hud = new HUD()
    this.titleScreen = new Screen({
      canvasWidth: this.layout.canvasWidth,
      canvasHeight: this.layout.canvasHeight,
    });
    this.winScreen = new Screen({
      canvasWidth: this.layout.canvasWidth,
      canvasHeight: this.layout.canvasHeight,
    });

    // Initialize viewport with fog-of-war and responsive dimensions
    this.viewport = new Viewport({
      width: this.layout.canvasWidth,
      height: this.layout.canvasHeight,
      radius: 150, // Fog-of-war visibility radius
      canvasWidth: this.layout.canvasWidth,
      canvasHeight: this.layout.canvasHeight,
    });

    // Initialize game state
    this.state = {
      isRunning: false,
      isWon: false,
      elapsedTime: 0,
      screenState: 'title',
    };
  }

  /**
   * Initialize the game asynchronously (must be called before start()).
   */
  async init(): Promise<void> {
    await this.renderer.init();
    
    // Add UI layers to renderer
    this.renderer.container.addChild(this.hud.getContainer());
    this.renderer.container.addChild(this.titleScreen.getContainer());
    this.renderer.container.addChild(this.winScreen.getContainer());
    
    // Show title screen
    this.showTitleScreen();
  }

  /**
   * Show the title screen.
   */
  private showTitleScreen(): void {
    this.state.screenState = 'title';
    this.state.isRunning = false;
    this.titleScreen.displayTitle();
    this.titleScreen.show();
    
    // Clean up old listener if exists
    if (this.startGameHandler) {
      window.removeEventListener('keydown', this.startGameHandler);
      document.removeEventListener('click', this.startGameHandler);
    }
    
    // Listen for any key or tap to start
    this.startGameHandler = () => {
      this.startPlaying();
      window.removeEventListener('keydown', this.startGameHandler!);
      document.removeEventListener('click', this.startGameHandler!);
      this.startGameHandler = null;
    };
    
    window.addEventListener('keydown', this.startGameHandler);
    document.addEventListener('click', this.startGameHandler);
  }

  /**
   * Start playing the game.
   */
  private startPlaying(): void {
    this.state.screenState = 'playing';
    this.state.isRunning = true;
    this.state.elapsedTime = 0;
    this.state.isWon = false;
    
    this.titleScreen.hide();
    this.winScreen.hide();
    this.hud.show();
    
    this.lastFrameTime = Date.now();
  }

  /**
   * Show the win screen.
   */
  private showWinScreen(): void {
    this.state.screenState = 'win';
    this.state.isRunning = false;
    
    const timeString = this.formatTime(this.state.elapsedTime);
    this.winScreen.displayWin(timeString);
    this.winScreen.show();
    this.hud.hide();
    
    // Clean up old listener if exists
    if (this.playAgainHandler) {
      window.removeEventListener('keydown', this.playAgainHandler);
      document.removeEventListener('click', this.playAgainHandler);
    }
    
    // Listen for any key or tap to play again
    this.playAgainHandler = () => {
      this.reset();
      this.showTitleScreen();
      window.removeEventListener('keydown', this.playAgainHandler!);
      document.removeEventListener('click', this.playAgainHandler!);
      this.playAgainHandler = null;
    };
    
    window.addEventListener('keydown', this.playAgainHandler);
    document.addEventListener('click', this.playAgainHandler);
  }

  /**
   * Start the game loop using PixiJS ticker.
   */
  start(): void {
    // Remove old ticker callback if exists (prevent accumulation)
    if (this.tickerCallback) {
      this.renderer.app.ticker.remove(this.tickerCallback);
    }
    
    // Create and store ticker callback
    this.tickerCallback = () => {
      if (!this.state.isRunning && this.state.screenState !== 'title') return;

      const now = Date.now();
      const deltaTime = now - this.lastFrameTime;
      this.lastFrameTime = now;

      // Update game state if playing
      if (this.state.isRunning) {
        this.update(deltaTime);
      }

      // Render
      this.render();
    };
    
    // Use PixiJS ticker for animation loop
    this.renderer.app.ticker.add(this.tickerCallback);
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

    // Get input direction (always set, even if null, to handle key release)
    const direction = this.input.getDirection();
    this.player.setDirection(direction);

    // Update player position
    this.player.update((x: number, y: number) => {
      return this.maze.canMoveTo(x, y, this.player.radius);
    });

    // Update viewport
    this.viewport.centerOn(this.player.x, this.player.y);

    // Check win condition (collision with cheese)
    if (this.player.collidesWith(this.cheeseX, this.cheeseY, 10)) {
      this.state.isWon = true;
      this.showWinScreen();
    }
  }

  /**
   * Render current frame.
   */
  private render(): void {
    // Clear
    this.renderer.clear();

    // Render game world only if playing
    if (this.state.screenState === 'playing') {
      // Render maze
      this.renderer.renderMaze(this.maze, this.viewport);

      // Render cheese
      this.renderer.renderCheese(this.cheeseX, this.cheeseY, this.viewport);

      // Render player
      this.renderer.renderPlayer(this.player, this.viewport);

      // Render fog-of-war
      this.renderer.renderFogOfWar(this.viewport);

      // Update HUD timer
      const timerText = this.formatTime(this.state.elapsedTime);
      this.hud.displayTimer(timerText);
      this.hud.displayInstructions('Find the cheese!');
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
    if (this.tickerCallback) {
      this.renderer.app.ticker.remove(this.tickerCallback);
      this.tickerCallback = null;
    }
  }

  /**
   * Get current game state.
   */
  getState(): GameState {
    return { ...this.state };
  }

  /**
   * Reset game to initial state and generate new maze.
   */
  reset(): void {
    // Generate new procedural maze
    const generator = new MazeGenerator({
      width: this.layout.width,
      height: this.layout.height,
    });
    const mazeGrid = generator.generate();
    
    this.maze = new Maze({
      width: this.layout.width,
      height: this.layout.height,
      cellSize: this.layout.cellSize,
      grid: mazeGrid,
    });
    
    // Reset player to start position
    const playerGridX = 1;
    const playerGridY = 1;
    this.player = new Player(
      playerGridX * this.layout.cellSize + this.layout.cellSize / 2,
      playerGridY * this.layout.cellSize + this.layout.cellSize / 2,
      8
    );
    
    // Find new cheese position
    const goalPosition = generator.findGoalPosition(playerGridX, playerGridY);
    if (!goalPosition) {
      this.cheeseX = (this.layout.width - 2) * this.layout.cellSize + this.layout.cellSize / 2;
      this.cheeseY = (this.layout.height - 2) * this.layout.cellSize + this.layout.cellSize / 2;
    } else {
      this.cheeseX = goalPosition.x * this.layout.cellSize + this.layout.cellSize / 2;
      this.cheeseY = goalPosition.y * this.layout.cellSize + this.layout.cellSize / 2;
    }
    
    // Reset game state
    this.state = {
      isRunning: false,
      isWon: false,
      elapsedTime: 0,
      screenState: 'title',
    };
    
    this.lastFrameTime = Date.now();
  }
}
