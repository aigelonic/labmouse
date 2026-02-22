/**
 * Game orchestrates the main game loop and state.
 */

import { Player } from './Player'
import type { Direction } from './Player'
import { Maze } from './Maze'
import { MazeGenerator } from './MazeGenerator'
import { Input } from './Input'
import { Renderer } from './Renderer'
import { Viewport } from './Viewport'
import { HUD } from '../ui/HUD'
import { Screen } from '../ui/Screen'
import { SoundManager } from './SoundManager'
import { Leaderboard } from './Leaderboard'
import { AnimationManager } from './AnimationManager'

export interface GameState {
  isRunning: boolean;
  isWon: boolean;
  elapsedTime: number; // milliseconds
  screenState: 'title' | 'playing' | 'win' | null;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface LayoutConfig {
  width: number;
  height: number;
  cellSize: number;
  canvasWidth: number;
  canvasHeight: number;
  fogRadius: number;
}

/**
 * Detect viewport size and return appropriate layout configuration based on difficulty.
 * Easy: Desktop 12×9@50px, Mobile 9×12@40px, Fog 130px
 * Medium: Desktop 16×12@50px, Mobile 12×16@40px, Fog 100px
 * Hard: Desktop 20×15@50px, Mobile 15×20@40px, Fog 80px
 */
export function detectLayout(difficulty: 'easy' | 'medium' | 'hard' = 'medium'): LayoutConfig {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Use mobile layout if width < 800px or portrait orientation
  const isMobile = viewportWidth < 800 || viewportHeight > viewportWidth;
  
  // Define layouts for each difficulty level
  const layouts = {
    easy: {
      desktop: { width: 12, height: 9, cellSize: 50, fogRadius: 130 },
      mobile: { width: 9, height: 12, cellSize: 40, fogRadius: 130 },
    },
    medium: {
      desktop: { width: 16, height: 12, cellSize: 50, fogRadius: 100 },
      mobile: { width: 12, height: 16, cellSize: 40, fogRadius: 100 },
    },
    hard: {
      desktop: { width: 20, height: 15, cellSize: 50, fogRadius: 80 },
      mobile: { width: 15, height: 20, cellSize: 40, fogRadius: 80 },
    },
  };
  
  const layout = layouts[difficulty][isMobile ? 'mobile' : 'desktop'];
  
  return {
    width: layout.width,
    height: layout.height,
    cellSize: layout.cellSize,
    canvasWidth: layout.width * layout.cellSize,
    canvasHeight: layout.height * layout.cellSize,
    fogRadius: layout.fogRadius,
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
  soundManager: SoundManager;
  animationManager: AnimationManager;
  state: GameState;
  cheeseX: number;
  cheeseY: number;
  layout: LayoutConfig;
  frameId: number | null = null;
  targetFPS: number = 60;
  lastFrameTime: number = 0;
  
  // Store references for cleanup
  private tickerCallback: (() => void) | null = null;
  private startGameHandler: ((e?: any) => void) | null = null;
  private playAgainHandler: (() => void) | null = null;
  private menuButtonHandler: ((e: MouseEvent) => void) | null = null;
  private lastDirection: Direction | null = null;

  constructor(canvasElement: HTMLCanvasElement, difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
    // Detect layout based on viewport size and difficulty
    this.layout = detectLayout(difficulty);
    
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
    
    // Initialize sound manager
    this.soundManager = new SoundManager();

    // Initialize animation manager
    this.animationManager = new AnimationManager();

    // Initialize viewport with fog-of-war and responsive dimensions
    this.viewport = new Viewport({
      width: this.layout.canvasWidth,
      height: this.layout.canvasHeight,
      radius: this.layout.fogRadius, // Fog-of-war visibility radius based on difficulty
      canvasWidth: this.layout.canvasWidth,
      canvasHeight: this.layout.canvasHeight,
    });

    // Initialize game state
    this.state = {
      isRunning: false,
      isWon: false,
      elapsedTime: 0,
      screenState: 'title',
      difficulty: difficulty,
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
    
    // Hide HUD and win screen initially (only show title screen)
    this.hud.hide();
    this.winScreen.hide();
    
    // Show title screen
    this.showTitleScreen();
  }

  /**
   * Show the title screen.
   */
  private showTitleScreen(): void {
    this.state.screenState = 'title';
    this.state.isRunning = false;
    
    // Hide other screens and show title screen
    this.hud.hide();
    this.winScreen.hide();
    this.titleScreen.displayTitle(this.state.difficulty);
    this.titleScreen.show();
    
    // Fade in title screen
    this.animationManager.fadeScreenIn(250);
    
    // Clean up old listeners if exists
    if (this.startGameHandler) {
      window.removeEventListener('keydown', this.startGameHandler);
      document.removeEventListener('click', this.startGameHandler);
    }
    
    // Handle keyboard - start game
    const keyHandler = () => {
      // Initialize sound on first user interaction
      if (!this.soundManager.isEnabled()) {
        this.soundManager.init();
      }
      
      this.startPlaying();
      window.removeEventListener('keydown', keyHandler);
      document.removeEventListener('click', clickHandler);
    };
    
    // Handle clicks - check for difficulty button or start game
    const clickHandler = (e: MouseEvent) => {
      const canvas = this.renderer.app.canvas;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Check if clicking a difficulty button
      const clickedDifficulty = this.titleScreen.getDifficultyButtonClick(x, y);
      if (clickedDifficulty) {
        // Change difficulty and refresh title screen
        this.setDifficulty(clickedDifficulty);
        this.showTitleScreen(); // Refresh the screen
        return;
      }
      
      // Otherwise, start the game
      if (!this.soundManager.isEnabled()) {
        this.soundManager.init();
      }
      
      this.startPlaying();
      window.removeEventListener('keydown', keyHandler);
      document.removeEventListener('click', clickHandler);
    };
    
    this.startGameHandler = keyHandler; // Store for cleanup
    
    window.addEventListener('keydown', keyHandler);
    document.addEventListener('click', clickHandler);
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
    
    // Fade in gameplay
    this.animationManager.fadeScreenIn(250);
    
    // Display menu button
    this.hud.displayMenuButton();
    
    // Clean up old menu button handler if exists
    if (this.menuButtonHandler) {
      document.removeEventListener('click', this.menuButtonHandler);
    }
    
    // Add click handler for menu button
    this.menuButtonHandler = (e: MouseEvent) => {
      const canvas = this.renderer.app.canvas;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      if (this.hud.isMenuButtonClicked(x, y)) {
        // Return to main menu
        this.returnToMenu();
      }
    };
    
    document.addEventListener('click', this.menuButtonHandler);
    
    this.lastFrameTime = Date.now();
  }

  /**
   * Return to main menu from gameplay.
   */
  private returnToMenu(): void {
    this.state.isRunning = false;
    
    // Clean up menu button handler
    if (this.menuButtonHandler) {
      document.removeEventListener('click', this.menuButtonHandler);
      this.menuButtonHandler = null;
    }
    
    // Show title screen
    this.showTitleScreen();
  }

  /**
   * Show the win screen.
   */
  private showWinScreen(): void {
    this.state.screenState = 'win';
    this.state.isRunning = false;
    
    // Play win sound
    this.soundManager.playWin();
    
    // Emit celebration particles at cheese position
    this.animationManager.emitParticles(this.cheeseX, this.cheeseY, 16, '⭐', 600);
    
    // Clean up menu button handler
    if (this.menuButtonHandler) {
      document.removeEventListener('click', this.menuButtonHandler);
      this.menuButtonHandler = null;
    }
    
    // Save time to leaderboard
    const position = Leaderboard.saveTime(this.state.difficulty, this.state.elapsedTime);
    
    const timeString = this.formatTime(this.state.elapsedTime);
    
    // Hide other screens and show win screen
    this.hud.hide();
    this.titleScreen.hide();
    this.winScreen.displayWin(timeString, position);
    this.winScreen.show();
    
    // Fade in win screen
    this.animationManager.fadeScreenIn(300);
    
    // Clean up old listener if exists
    if (this.playAgainHandler) {
      window.removeEventListener('keydown', this.playAgainHandler);
      document.removeEventListener('click', this.playAgainHandler);
    }
    
    // Delay listener attachment to prevent last keypress from triggering restart
    setTimeout(() => {
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
    }, 300); // 300ms delay prevents accidental restart from last movement key
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

      // Update animations
      this.animationManager.update(deltaTime);

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
    
    // Play move sound and trigger bounce animation if direction changed (and not null)
    if (direction && direction !== this.lastDirection) {
      this.soundManager.playMove();
      // Trigger player bounce animation
      this.animationManager.createTween(
        1,
        1.15,
        100,
        (scale) => {
          this.renderer.setPlayerScale(scale);
        },
        undefined, // use default easeOut
        () => {
          // Bounce back
          this.animationManager.createTween(
            1.15,
            1,
            100,
            (scale) => {
              this.renderer.setPlayerScale(scale);
            }
          );
        }
      );
    }
    this.lastDirection = direction;

    // Update player position
    this.player.update((x: number, y: number) => {
      return this.maze.canMoveTo(x, y, this.player.radius);
    });

    // Update viewport
    this.viewport.centerOn(this.player.x, this.player.y);

    // Check win condition (collision with cheese)
    if (this.player.collidesWith(this.cheeseX, this.cheeseY, 10)) {
      this.state.isWon = true;
      this.soundManager.playCollect();
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

      // Render fog-of-war with soft vignette
      this.renderer.renderFogOfWar(this.viewport);

      // Render particles
      this.renderer.renderParticles(this.animationManager.getParticles());

      // Update HUD timer
      const timerText = this.formatTime(this.state.elapsedTime);
      this.hud.displayTimer(timerText);
      this.hud.displayInstructions('Find the cheese!');
      this.hud.displayStatus(this.state.difficulty.toUpperCase());
    }

    // Render screen fade overlay
    this.renderer.renderScreenFade(this.animationManager.getScreenFadeAlpha());
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
      difficulty: this.state.difficulty, // Preserve difficulty
    };
    
    this.lastFrameTime = Date.now();
  }

  /**
   * Change difficulty level and regenerate game.
   */
  setDifficulty(difficulty: 'easy' | 'medium' | 'hard'): void {
    // Update layout configuration
    this.layout = detectLayout(difficulty);
    
    // Update viewport fog radius
    this.viewport = new Viewport({
      width: this.layout.canvasWidth,
      height: this.layout.canvasHeight,
      radius: this.layout.fogRadius,
      canvasWidth: this.layout.canvasWidth,
      canvasHeight: this.layout.canvasHeight,
    });
    
    // Update canvas size
    this.renderer.app.canvas.width = this.layout.canvasWidth;
    this.renderer.app.canvas.height = this.layout.canvasHeight;
    this.renderer.app.renderer.resize(this.layout.canvasWidth, this.layout.canvasHeight);
    
    // Reset fog-of-war state to force recreation with new dimensions
    this.renderer.resetFogState();
    
    // Remove old screen containers from renderer
    this.renderer.container.removeChild(this.titleScreen.getContainer());
    this.renderer.container.removeChild(this.winScreen.getContainer());
    
    // Create new screen objects with updated dimensions
    this.titleScreen = new Screen({
      canvasWidth: this.layout.canvasWidth,
      canvasHeight: this.layout.canvasHeight,
    });
    this.winScreen = new Screen({
      canvasWidth: this.layout.canvasWidth,
      canvasHeight: this.layout.canvasHeight,
    });
    
    // Add new screen containers to renderer
    this.renderer.container.addChild(this.titleScreen.getContainer());
    this.renderer.container.addChild(this.winScreen.getContainer());
    
    // Ensure correct visibility (title screen should be visible)
    this.winScreen.hide();
    
    // Update difficulty in state
    this.state.difficulty = difficulty;
    
    // Reset game with new layout
    this.reset();
  }
}
