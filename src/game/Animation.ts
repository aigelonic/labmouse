/**
 * Animation system for tweens, particles, and effects.
 */

export type EasingFunction = (t: number) => number;

export const Easing = {
  linear: (t: number) => t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
  easeIn: (t: number) => t * t * t,
  easeInOut: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
};

/**
 * Tween animates numeric values over time.
 */
export class Tween {
  private startValue: number;
  private endValue: number;
  private duration: number;
  private elapsed: number = 0;
  private easing: EasingFunction;
  private onUpdate: (value: number) => void;
  private onComplete?: () => void;
  private isComplete: boolean = false;

  constructor(
    startValue: number,
    endValue: number,
    duration: number,
    onUpdate: (value: number) => void,
    easing: EasingFunction = Easing.easeOut,
    onComplete?: () => void
  ) {
    this.startValue = startValue;
    this.endValue = endValue;
    this.duration = duration;
    this.onUpdate = onUpdate;
    this.easing = easing;
    this.onComplete = onComplete;
  }

  /**
   * Update tween by delta time (ms).
   */
  update(deltaTime: number): boolean {
    if (this.isComplete) return false;

    this.elapsed += deltaTime;
    if (this.elapsed >= this.duration) {
      this.onUpdate(this.endValue);
      this.isComplete = true;
      this.onComplete?.();
      return false;
    }

    const progress = this.elapsed / this.duration;
    const easedProgress = this.easing(progress);
    const currentValue = this.startValue + (this.endValue - this.startValue) * easedProgress;
    this.onUpdate(currentValue);
    return true;
  }

  /**
   * Check if tween has completed.
   */
  isFinished(): boolean {
    return this.isComplete;
  }
}

/**
 * Particle represents a single animated particle.
 */
export class Particle {
  x: number;
  y: number;
  vx: number; // velocity x
  vy: number; // velocity y
  life: number; // 0-1, where 1 is full opacity
  maxLife: number;
  emoji: string;
  gravity: number = 0.15;

  constructor(x: number, y: number, vx: number, vy: number, emoji: string = '✨', maxLife: number = 500) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.emoji = emoji;
    this.maxLife = maxLife;
    this.life = 1;
  }

  /**
   * Update particle by delta time (ms).
   */
  update(deltaTime: number): void {
    this.vy += this.gravity;
    this.x += this.vx * deltaTime * 0.001;
    this.y += this.vy * deltaTime * 0.001;
    this.life -= deltaTime / this.maxLife;
  }

  /**
   * Check if particle is still alive.
   */
  isAlive(): boolean {
    return this.life > 0;
  }
}
