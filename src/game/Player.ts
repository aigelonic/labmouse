/**
 * Player represents the mouse in the maze.
 * Handles position, movement, and collision detection.
 */

export interface PlayerState {
  x: number;
  y: number;
  radius: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right' | null;

export class Player {
  x: number;
  y: number;
  readonly radius: number;
  direction: Direction = null;
  nextDirection: Direction = null;
  readonly speed: number = 2; // pixels per frame

  constructor(x: number, y: number, radius: number = 8) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  /**
   * Set the direction the player wants to move.
   * nextDirection is buffered to allow for smoother input.
   */
  setDirection(dir: Direction): void {
    this.nextDirection = dir;
  }

  /**
   * Update player position and direction.
   * @param canMove - Callback to check if position is valid (no collision)
   */
  update(canMove: (x: number, y: number) => boolean): void {
    // Always update direction from input (stops when key released)
    this.direction = this.nextDirection;

    // Move in current direction if valid
    if (this.direction !== null) {
      const newX = this.x + this.getVelocityX();
      const newY = this.y + this.getVelocityY();

      if (canMove(newX, newY)) {
        this.x = newX;
        this.y = newY;
      }
    }
  }

  /**
   * Get horizontal velocity based on direction.
   */
  private getVelocityX(): number {
    if (this.direction === 'left') return -this.speed;
    if (this.direction === 'right') return this.speed;
    return 0;
  }

  /**
   * Get vertical velocity based on direction.
   */
  private getVelocityY(): number {
    if (this.direction === 'up') return -this.speed;
    if (this.direction === 'down') return this.speed;
    return 0;
  }

  /**
   * Check if player is colliding with another circle/point.
   */
  collidesWith(x: number, y: number, radius: number = 0): boolean {
    const dx = this.x - x;
    const dy = this.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.radius + radius;
  }

  /**
   * Get current state for serialization/debugging.
   */
  getState(): PlayerState {
    return {
      x: this.x,
      y: this.y,
      radius: this.radius,
    };
  }
}
