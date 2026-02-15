/**
 * Input handles keyboard and touch input, providing a unified interface.
 */

import type { Direction } from './Player';

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export class Input {
  private state: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  private lastTouchZone: Direction = null;

  constructor() {
    this.setupKeyboardListeners();
    this.setupTouchListeners();
  }

  /**
   * Get the current direction based on input state.
   */
  getDirection(): Direction {
    // Priority: check in order (allows diagonal input, but returns single direction)
    if (this.state.up) return 'up';
    if (this.state.down) return 'down';
    if (this.state.left) return 'left';
    if (this.state.right) return 'right';
    return null;
  }

  /**
   * Get touch direction (4-zone direct touch).
   */
  private getTouchDirection(event: TouchEvent, canvas: HTMLCanvasElement): Direction {
    if (event.touches.length === 0) return null;

    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Divide canvas into 4 zones
    const dx = x - centerX;
    const dy = y - centerY;
    const angle = Math.atan2(dy, dx);

    // Map angle to 4 directions
    if (angle > -Math.PI / 4 && angle <= Math.PI / 4) return 'right';
    if (angle > Math.PI / 4 && angle <= (3 * Math.PI) / 4) return 'down';
    if (angle > (3 * Math.PI) / 4 || angle <= -(3 * Math.PI) / 4) return 'left';
    return 'up';
  }

  /**
   * Set up keyboard event listeners.
   */
  private setupKeyboardListeners(): void {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') {
        this.state.up = true;
        e.preventDefault();
      }
      if (key === 's' || key === 'arrowdown') {
        this.state.down = true;
        e.preventDefault();
      }
      if (key === 'a' || key === 'arrowleft') {
        this.state.left = true;
        e.preventDefault();
      }
      if (key === 'd' || key === 'arrowright') {
        this.state.right = true;
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') this.state.up = false;
      if (key === 's' || key === 'arrowdown') this.state.down = false;
      if (key === 'a' || key === 'arrowleft') this.state.left = false;
      if (key === 'd' || key === 'arrowright') this.state.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  }

  /**
   * Set up touch event listeners.
   */
  private setupTouchListeners(): void {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      const direction = this.getTouchDirection(e, canvas);
      if (direction) {
        this.lastTouchZone = direction;
        // Set keyboard state to match touch
        this.state.up = direction === 'up';
        this.state.down = direction === 'down';
        this.state.left = direction === 'left';
        this.state.right = direction === 'right';
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const direction = this.getTouchDirection(e, canvas);
      if (direction && direction !== this.lastTouchZone) {
        this.lastTouchZone = direction;
        // Update keyboard state
        this.state.up = direction === 'up';
        this.state.down = direction === 'down';
        this.state.left = direction === 'left';
        this.state.right = direction === 'right';
      }
    };

    const handleTouchEnd = () => {
      this.state.up = false;
      this.state.down = false;
      this.state.left = false;
      this.state.right = false;
      this.lastTouchZone = null;
    };

    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);
  }

  /**
   * Get full input state for testing/debugging.
   */
  getState(): InputState {
    return { ...this.state };
  }
}
