/**
 * Renderer handles PixiJS rendering, including fog-of-war masking.
 */

import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { Player } from './Player';
import { Maze } from './Maze';
import { Viewport } from './Viewport';

export class Renderer {
  app: Application;
  canvas: HTMLCanvasElement;
  container: Container;
  fogMask: Graphics;
  wallsLayer: Container;
  objectsLayer: Container;
  uiLayer: Container;
  
  // Reusable Graphics objects for fog-of-war (prevent memory leaks)
  private fogTopRect: Graphics;
  private fogBottomRect: Graphics;
  private fogLeftRect: Graphics;
  private fogRightRect: Graphics;
  private fogGlowCircle: Graphics;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.app = new Application();
    this.container = new Container();
    this.wallsLayer = new Container();
    this.objectsLayer = new Container();
    this.uiLayer = new Container();

    this.fogMask = new Graphics();
    
    // Initialize reusable fog Graphics objects
    this.fogTopRect = new Graphics();
    this.fogBottomRect = new Graphics();
    this.fogLeftRect = new Graphics();
    this.fogRightRect = new Graphics();
    this.fogGlowCircle = new Graphics();
  }

  /**
   * Initialize PixiJS app asynchronously.
   */
  async init(): Promise<void> {
    await this.app.init({
      canvas: this.canvas,
      width: 800,
      height: 600,
      backgroundColor: 0x0a0a0a,
    });

    this.app.stage.addChild(this.container);
    this.container.addChild(this.wallsLayer);
    this.container.addChild(this.objectsLayer);
    this.container.addChild(this.fogMask);
    this.container.addChild(this.uiLayer);
    
    // Add fog Graphics objects to fogMask once
    this.fogMask.addChild(this.fogTopRect);
    this.fogMask.addChild(this.fogBottomRect);
    this.fogMask.addChild(this.fogLeftRect);
    this.fogMask.addChild(this.fogRightRect);
    this.fogMask.addChild(this.fogGlowCircle);
  }

  /**
   * Render the maze walls with fog-of-war.
   */
  renderMaze(maze: Maze, viewport: Viewport): void {
    this.wallsLayer.removeChildren();

    const cellSize = maze.cellSize;
    const bounds = viewport.getWorldBounds();

    // Render walls in visible area
    for (let y = 0; y < maze.height; y++) {
      for (let x = 0; x < maze.width; x++) {
        const worldX = x * cellSize;
        const worldY = y * cellSize;

        // Check if cell is in viewport bounds
        if (
          worldX < bounds.minX - cellSize ||
          worldX > bounds.maxX + cellSize ||
          worldY < bounds.minY - cellSize ||
          worldY > bounds.maxY + cellSize
        ) {
          continue;
        }

        if (maze.grid[y][x] === 1) {
          // Wall cell
          const wallGraphics = new Graphics();
          wallGraphics.rect(0, 0, cellSize, cellSize);
          wallGraphics.fill(0x444444);
          wallGraphics.stroke({ color: 0x666666, width: 1 });

          const screenPos = viewport.worldToScreen(worldX, worldY);
          wallGraphics.x = screenPos.x;
          wallGraphics.y = screenPos.y;

          this.wallsLayer.addChild(wallGraphics);
        }
      }
    }
  }

  /**
   * Render the player sprite.
   */
  renderPlayer(player: Player, viewport: Viewport): void {
    const screenPos = viewport.worldToScreen(player.x, player.y);

    const playerGraphics = new Graphics();
    playerGraphics.circle(0, 0, player.radius);
    playerGraphics.fill(0xff6b6b); // Red mouse
    playerGraphics.stroke({ color: 0xff0000, width: 2 });

    playerGraphics.x = screenPos.x;
    playerGraphics.y = screenPos.y;

    this.objectsLayer.addChild(playerGraphics);
  }

  /**
   * Render the cheese goal.
   */
  renderCheese(cheeseX: number, cheeseY: number, viewport: Viewport): void {
    const screenPos = viewport.worldToScreen(cheeseX, cheeseY);
    const cheeseSize = 10;

    const cheeseGraphics = new Graphics();
    cheeseGraphics.rect(-cheeseSize / 2, -cheeseSize / 2, cheeseSize, cheeseSize);
    cheeseGraphics.fill(0xffd700); // Yellow cheese
    cheeseGraphics.stroke({ color: 0xffaa00, width: 1 });

    cheeseGraphics.x = screenPos.x;
    cheeseGraphics.y = screenPos.y;

    this.objectsLayer.addChild(cheeseGraphics);
  }

  /**
   * Render fog-of-war mask (dark vignette around visible area with glow effect).
   */
  renderFogOfWar(viewport: Viewport): void {
    const centerX = this.app.canvas.width / 2;
    const centerY = this.app.canvas.height / 2;
    const visibleRadius = viewport.radius;
    
    // Reuse Graphics objects and just update their geometry
    // Top
    this.fogTopRect.clear();
    this.fogTopRect.rect(0, 0, this.app.canvas.width, centerY - visibleRadius);
    this.fogTopRect.fill({ color: 0x000000, alpha: 0.85 });
    
    // Bottom
    this.fogBottomRect.clear();
    this.fogBottomRect.rect(0, centerY + visibleRadius, this.app.canvas.width, this.app.canvas.height - (centerY + visibleRadius));
    this.fogBottomRect.fill({ color: 0x000000, alpha: 0.85 });
    
    // Left
    this.fogLeftRect.clear();
    this.fogLeftRect.rect(0, centerY - visibleRadius, centerX - visibleRadius, visibleRadius * 2);
    this.fogLeftRect.fill({ color: 0x000000, alpha: 0.85 });
    
    // Right
    this.fogRightRect.clear();
    this.fogRightRect.rect(centerX + visibleRadius, centerY - visibleRadius, this.app.canvas.width - (centerX + visibleRadius), visibleRadius * 2);
    this.fogRightRect.fill({ color: 0x000000, alpha: 0.85 });
    
    // Glow effect at fog edge
    this.fogGlowCircle.clear();
    this.fogGlowCircle.circle(0, 0, visibleRadius);
    this.fogGlowCircle.stroke({ color: 0x6699ff, width: 2, alpha: 0.3 });
    this.fogGlowCircle.x = centerX;
    this.fogGlowCircle.y = centerY;
  }

  /**
   * Render HUD text (timer, instructions).
   */
  renderHUD(
    timerText: string,
    additionalText?: string,
    textColor: number = 0xffffff,
    canvasWidth: number = 800,
    canvasHeight: number = 600
  ): void {
    this.uiLayer.removeChildren();

    const style = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 18,
      fill: textColor,
      align: 'left',
    });

    const timerDisplay = new Text({ text: timerText, style });
    timerDisplay.x = 10;
    timerDisplay.y = 10;
    this.uiLayer.addChild(timerDisplay);

    if (additionalText) {
      const additionalStyle = new TextStyle({
        fontFamily: 'monospace',
        fontSize: 14,
        fill: textColor,
        align: 'center',
      });
      const additionalDisplay = new Text({
        text: additionalText,
        style: additionalStyle,
      });
      additionalDisplay.x =
        canvasWidth / 2 - additionalDisplay.width / 2;
      additionalDisplay.y = canvasHeight - 50;
      this.uiLayer.addChild(additionalDisplay);
    }
  }

  /**
   * Render a full screen message (e.g., win screen).
   */
  renderMessage(message: string, textColor: number = 0xffffff): void {
    this.uiLayer.removeChildren();

    const style = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 32,
      fill: textColor,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 400,
    });

    const text = new Text({ text: message, style });
    text.x = this.app.canvas.width / 2 - text.width / 2;
    text.y = this.app.canvas.height / 2 - text.height / 2;

    this.uiLayer.addChild(text);
  }

  /**
   * Clear all layers (destroy Graphics to prevent memory leaks).
   */
  clear(): void {
    // Properly destroy all children to free memory
    this.wallsLayer.removeChildren().forEach(child => child.destroy());
    this.objectsLayer.removeChildren().forEach(child => child.destroy());
    this.uiLayer.removeChildren().forEach(child => child.destroy());
  }
  
  /**
   * Destroy renderer and clean up all resources.
   */
  destroy(): void {
    this.wallsLayer.destroy({ children: true });
    this.objectsLayer.destroy({ children: true });
    this.uiLayer.destroy({ children: true });
    this.fogMask.destroy({ children: true });
    this.container.destroy({ children: true });
  }
}
