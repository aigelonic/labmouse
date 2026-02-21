/**
 * AnimationManager orchestrates all tweens, particles, and effects.
 */

import { Tween, Particle, Easing } from './Animation';
import type { EasingFunction } from './Animation';

export class AnimationManager {
  private tweens: Tween[] = [];
  private particles: Particle[] = [];
  private screenFadeAlpha: number = 0; // 0 = opaque, 1 = transparent
  private screenFadeActive: boolean = false;

  /**
   * Create a new tween and add to manager.
   */
  createTween(
    startValue: number,
    endValue: number,
    duration: number,
    onUpdate: (value: number) => void,
    easing: EasingFunction = Easing.easeOut,
    onComplete?: () => void
  ): Tween {
    const tween = new Tween(startValue, endValue, duration, onUpdate, easing, onComplete);
    this.tweens.push(tween);
    return tween;
  }

  /**
   * Emit particles from a position.
   */
  emitParticles(
    x: number,
    y: number,
    count: number = 12,
    emoji: string = '✨',
    maxLife: number = 500
  ): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 1.5 + Math.random() * 1;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 0.5; // slight upward bias
      const particle = new Particle(x, y, vx, vy, emoji, maxLife);
      this.particles.push(particle);
    }
  }

  /**
   * Start screen fade transition.
   */
  fadeScreenOut(duration: number = 200, onComplete?: () => void): void {
    this.screenFadeActive = true;
    this.createTween(
      0,
      1,
      duration,
      (alpha) => {
        this.screenFadeAlpha = alpha;
      },
      Easing.linear,
      () => {
        this.screenFadeActive = false;
        onComplete?.();
      }
    );
  }

  /**
   * Start screen fade in transition.
   */
  fadeScreenIn(duration: number = 200, onComplete?: () => void): void {
    this.screenFadeActive = true;
    this.createTween(
      1,
      0,
      duration,
      (alpha) => {
        this.screenFadeAlpha = alpha;
      },
      Easing.linear,
      () => {
        this.screenFadeActive = false;
        onComplete?.();
      }
    );
  }

  /**
   * Get current screen fade alpha (0 = opaque, 1 = fully faded).
   */
  getScreenFadeAlpha(): number {
    return this.screenFadeAlpha;
  }

  /**
   * Check if screen is currently fading.
   */
  isScreenFading(): boolean {
    return this.screenFadeActive;
  }

  /**
   * Update all animations by delta time (ms).
   */
  update(deltaTime: number): void {
    // Update tweens
    for (let i = this.tweens.length - 1; i >= 0; i--) {
      if (!this.tweens[i].update(deltaTime)) {
        this.tweens.splice(i, 1);
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(deltaTime);
      if (!this.particles[i].isAlive()) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Get all active particles.
   */
  getParticles(): Particle[] {
    return this.particles;
  }

  /**
   * Clear all animations.
   */
  clear(): void {
    this.tweens = [];
    this.particles = [];
    this.screenFadeAlpha = 0;
    this.screenFadeActive = false;
  }
}
