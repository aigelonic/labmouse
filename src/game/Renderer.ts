/**
 * Renderer handles PixiJS rendering, including fog-of-war masking.
 */

import { Application, Container, Graphics, Text, TextStyle, Sprite, Texture } from 'pixi.js';
import { Player } from './Player';
import { Maze } from './Maze';
import { Viewport } from './Viewport';
import type { Particle } from './Animation';

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
  
  // Animation state
  private playerScale: number = 1;
  private screenFadeOverlay: Sprite | null = null;
  private fadeTexture: Texture | null = null;
  
  // Fog-of-war reusable objects (prevent memory leaks)
  private fogCanvas: HTMLCanvasElement | null = null;
  private fogSprite: Sprite | null = null;
  private fogTexture: Texture | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.app = new Application();
    this.container = new Container();
    this.wallsLayer = new Container();
    this.objectsLayer = new Container();
    this.uiLayer = new Container();

    // Don't create Graphics objects yet - they need PixiJS context
    // These will be created in init() after app.init() completes
    this.fogMask = null as any;
    this.fogTopRect = null as any;
    this.fogBottomRect = null as any;
    this.fogLeftRect = null as any;
    this.fogRightRect = null as any;
    this.fogGlowCircle = null as any;
  }

  /**
   * Initialize PixiJS app asynchronously.
   */
  async init(): Promise<void> {
    console.log('[Renderer.init] Starting renderer initialization...');
    
    await this.app.init({
      canvas: this.canvas,
      width: 800,
      height: 600,
      backgroundColor: 0x0a0a0a,
    });
    console.log('[Renderer.init] PixiJS app initialized, creating Graphics objects...');

    // NOW create all Graphics objects (after app.init() has context)
    this.fogMask = new Graphics();
    this.fogTopRect = new Graphics();
    this.fogBottomRect = new Graphics();
    this.fogLeftRect = new Graphics();
    this.fogRightRect = new Graphics();
    this.fogGlowCircle = new Graphics();
    console.log('[Renderer.init] All Graphics objects created successfully');

    // Create screen fade overlay using a texture-based Sprite (more reliable than Graphics)
    console.log('[Renderer.init] Creating screen fade overlay sprite...');
    const fadeCanvas = document.createElement('canvas');
    fadeCanvas.width = 800;
    fadeCanvas.height = 600;
    const fadeCtx = fadeCanvas.getContext('2d');
    if (fadeCtx) {
      // Draw black color (alpha will be controlled by Sprite.alpha)
      fadeCtx.fillStyle = 'black';
      fadeCtx.fillRect(0, 0, 800, 600);
    }
    this.fadeTexture = Texture.from(fadeCanvas);
    this.screenFadeOverlay = new Sprite(this.fadeTexture);
    this.screenFadeOverlay.alpha = 0; // Start transparent
    console.log('[Renderer.init] Screen fade overlay created successfully');

    this.app.stage.addChild(this.container);
    this.container.addChild(this.wallsLayer);
    this.container.addChild(this.fogMask);
    this.container.addChild(this.objectsLayer);
    this.container.addChild(this.uiLayer);
    
    // Add fog Graphics objects to fogMask
    this.fogMask.addChild(this.fogTopRect);
    this.fogMask.addChild(this.fogBottomRect);
    this.fogMask.addChild(this.fogLeftRect);
    this.fogMask.addChild(this.fogRightRect);
    this.fogMask.addChild(this.fogGlowCircle);
    
    // Add screen fade overlay to UI layer
    this.uiLayer.addChild(this.screenFadeOverlay);
    
    // Render once to fully initialize all objects with render context
    console.log('[Renderer.init] Performing initial render to sync context...');
    this.app.render();
    console.log('[Renderer.init] Renderer initialization complete');
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

    const mouseEmoji = new Text({
      text: '🐭',
      style: {
        fontSize: player.radius * 2.5,
        align: 'center',
      },
    });
    mouseEmoji.anchor.set(0.5);
    mouseEmoji.x = screenPos.x;
    mouseEmoji.y = screenPos.y;
    mouseEmoji.scale.set(this.playerScale); // Apply animation scale

    this.objectsLayer.addChild(mouseEmoji);
  }

  /**
   * Set player scale for bounce animation.
   */
  setPlayerScale(scale: number): void {
    this.playerScale = scale;
  }

  /**
   * Render the cheese goal (only if visible in fog-of-war).
   */
  renderCheese(cheeseX: number, cheeseY: number, viewport: Viewport): void {
    // Only render cheese if it's visible within fog-of-war
    // Use area visibility with cheese size (24) to prevent blinking at fog edge
    if (!viewport.isAreaVisible(cheeseX, cheeseY, 24)) {
      return;
    }
    
    const screenPos = viewport.worldToScreen(cheeseX, cheeseY);

    const cheeseEmoji = new Text({
      text: '🧀',
      style: {
        fontSize: 24,
        align: 'center',
      },
    });
    cheeseEmoji.anchor.set(0.5);
    cheeseEmoji.x = screenPos.x;
    cheeseEmoji.y = screenPos.y;

    this.objectsLayer.addChild(cheeseEmoji);
  }

  /**
   * Render fog-of-war using a canvas with radial gradient.
   * Reuses the same canvas and sprite to prevent memory leaks.
   */
  renderFogOfWar(viewport: Viewport): void {
    try {
      // Guard: ensure app and canvas are both initialized
      if (!this.app || !this.app.canvas) {
        return;
      }
      
      const canvasW = this.app.canvas.width;
      const canvasH = this.app.canvas.height;
      const visibleRadius = viewport.radius;
      
      // Initialize fog canvas and sprite on first call
      if (!this.fogCanvas) {
        this.fogCanvas = document.createElement('canvas');
        this.fogCanvas.width = canvasW;
        this.fogCanvas.height = canvasH;
        
        this.fogTexture = Texture.from(this.fogCanvas);
        this.fogSprite = new Sprite(this.fogTexture);
        this.fogMask.addChild(this.fogSprite);
      }
      
      // Update canvas size if screen size changed
      if (this.fogCanvas.width !== canvasW || this.fogCanvas.height !== canvasH) {
        this.fogCanvas.width = canvasW;
        this.fogCanvas.height = canvasH;
      }
      
      // Draw gradient on existing canvas
      const ctx = this.fogCanvas.getContext('2d');
      if (!ctx) return; // Canvas not supported
      
      // Create radial gradient: transparent in center -> black at edges
      const gradient = ctx.createRadialGradient(
        canvasW / 2, canvasH / 2, 0,           // Inner circle (center)
        canvasW / 2, canvasH / 2, visibleRadius + 100  // Outer circle
      );
      
      // Gradient stops: transparent near center, opaque at edges
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');      // Center: transparent
      gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.3)');  // 60% toward edge: light fog
      gradient.addColorStop(1.0, 'rgba(0, 0, 0, 1)');    // Edge: full black
      
      // Fill with gradient
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasW, canvasH);
      
      // Update texture from canvas (efficient - reuses existing texture)
      this.fogTexture?.update();
    } catch {
      // Silently ignore errors (e.g., during tests where PixiJS is not fully initialized)
      // In production, the guard checks prevent this from happening
    }
  }

  /**
   * Render particles on screen.
   */
  renderParticles(particles: Particle[]): void {
    for (const particle of particles) {
      const particleText = new Text({
        text: particle.emoji,
        style: {
          fontSize: 16,
          align: 'center',
        },
      });
      particleText.x = particle.x;
      particleText.y = particle.y;
      particleText.anchor.set(0.5);
      particleText.alpha = Math.max(0, particle.life); // Fade out as life decreases
      
      this.objectsLayer.addChild(particleText);
    }
  }

  /**
   * Render screen fade overlay for transitions.
   */
  renderScreenFade(fadeAlpha: number): void {
    if (!this.screenFadeOverlay) {
      console.warn('[Renderer.renderScreenFade] WARNING: screenFadeOverlay is null! Renderer not initialized?');
      return;
    }
    
    // Simply set the alpha on the sprite - no Graphics context needed
    this.screenFadeOverlay.alpha = Math.max(0, Math.min(1, fadeAlpha));
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
   * Reset fog-of-war state to force recreation with new dimensions.
   * Call this when viewport size changes (e.g., difficulty change or window resize).
   */
  resetFogState(): void {
    this.fogCanvas = null;
    this.fogSprite = null;
    this.fogTexture = null;
    // Remove old fog sprite from fogMask if it exists
    this.fogMask.removeChildren();
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
