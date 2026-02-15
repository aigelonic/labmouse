/**
 * Viewport handles the fog-of-war visibility system.
 * Shows only the area around the player.
 */

export interface ViewportConfig {
  width: number;
  height: number;
  radius: number; // Visibility radius around player
  canvasWidth: number;
  canvasHeight: number;
}

export class Viewport {
  readonly width: number;
  readonly height: number;
  readonly radius: number;
  readonly canvasWidth: number;
  readonly canvasHeight: number;
  x: number = 0;
  y: number = 0;

  constructor(config: ViewportConfig) {
    this.width = config.width;
    this.height = config.height;
    this.radius = config.radius;
    this.canvasWidth = config.canvasWidth;
    this.canvasHeight = config.canvasHeight;
  }

  /**
   * Update viewport to center on player position.
   */
  centerOn(playerX: number, playerY: number): void {
    this.x = playerX;
    this.y = playerY;
  }

  /**
   * Check if a world position is visible in the fog-of-war.
   */
  isVisible(worldX: number, worldY: number): boolean {
    const dx = worldX - this.x;
    const dy = worldY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= this.radius;
  }

  /**
   * Check if a square area is at least partially visible.
   */
  isAreaVisible(worldX: number, worldY: number, size: number): boolean {
    const dx = worldX + size / 2 - this.x;
    const dy = worldY + size / 2 - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    // Add size/2 to radius for partial visibility
    return distance <= this.radius + size / 2;
  }

  /**
   * Get world bounds currently in view.
   */
  getWorldBounds(): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } {
    return {
      minX: this.x - this.radius,
      maxX: this.x + this.radius,
      minY: this.y - this.radius,
      maxY: this.y + this.radius,
    };
  }

  /**
   * Convert world coordinates to screen coordinates.
   */
  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: this.canvasWidth / 2 + (worldX - this.x),
      y: this.canvasHeight / 2 + (worldY - this.y),
    };
  }

  /**
   * Convert screen coordinates to world coordinates.
   */
  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: this.x + (screenX - this.canvasWidth / 2),
      y: this.y + (screenY - this.canvasHeight / 2),
    };
  }

  /**
   * Get configuration for serialization.
   */
  getConfig(): ViewportConfig {
    return {
      width: this.width,
      height: this.height,
      radius: this.radius,
      canvasWidth: this.canvasWidth,
      canvasHeight: this.canvasHeight,
    };
  }
}
