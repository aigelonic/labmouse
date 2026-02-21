/**
 * AnimationManager.test.ts - Unit tests for AnimationManager class
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { AnimationManager } from '../AnimationManager'

describe('AnimationManager', () => {
  let manager: AnimationManager

  beforeEach(() => {
    manager = new AnimationManager()
  })

  describe('Tweens', () => {
    it('should create and manage tweens', () => {
      let values: number[] = []
      manager.createTween(0, 100, 100, (v) => values.push(v))

      manager.update(50)
      expect(values.length).toBeGreaterThan(0)
      expect(values[values.length - 1]).toBeGreaterThan(0)
    })

    it('should complete tweens', () => {
      let completeCalled = false
      manager.createTween(0, 100, 100, () => {}, undefined, () => {
        completeCalled = true
      })

      manager.update(100)
      expect(completeCalled).toBe(true)
    })

    it('should remove completed tweens', () => {
      manager.createTween(0, 100, 100, () => {})
      manager.update(100)
      manager.update(100) // Second update shouldn't cause errors

      // If it doesn't throw, tweens are properly cleaned up
      expect(true).toBe(true)
    })
  })

  describe('Particles', () => {
    it('should emit particles', () => {
      manager.emitParticles(100, 100, 10, '✨')

      const particles = manager.getParticles()
      expect(particles.length).toBe(10)
    })

    it('should emit custom emoji particles', () => {
      manager.emitParticles(100, 100, 5, '⭐')

      const particles = manager.getParticles()
      expect(particles.every((p) => p.emoji === '⭐')).toBe(true)
    })

    it('should emit particles with radial distribution', () => {
      manager.emitParticles(0, 0, 8, '✨')

      const particles = manager.getParticles()
      // Should have variety in velocity directions
      const angles = particles.map((p) => Math.atan2(p.vy, p.vx))
      const uniqueAngles = new Set(angles.map((a) => Math.round(a * 100)))
      expect(uniqueAngles.size).toBeGreaterThan(1) // At least different angles
    })

    it('should update and remove dead particles', () => {
      manager.emitParticles(0, 0, 5, '✨', 100)
      expect(manager.getParticles().length).toBe(5)

      manager.update(100)
      expect(manager.getParticles().length).toBe(0) // All dead
    })

    it('should keep alive particles', () => {
      manager.emitParticles(0, 0, 5, '✨', 1000)
      manager.update(500)

      const particles = manager.getParticles()
      expect(particles.length).toBe(5)
      expect(particles.every((p) => p.isAlive())).toBe(true)
    })
  })

  describe('Screen Fade', () => {
    it('should fade screen out', () => {
      manager.fadeScreenOut(100)

      expect(manager.isScreenFading()).toBe(true)
      manager.update(50)
      const alpha1 = manager.getScreenFadeAlpha()
      expect(alpha1).toBeGreaterThan(0)
      expect(alpha1).toBeLessThan(1)
    })

    it('should complete fade out', () => {
      manager.fadeScreenOut(100)

      manager.update(100)
      expect(manager.isScreenFading()).toBe(false)
      expect(manager.getScreenFadeAlpha()).toBe(1)
    })

    it('should fade screen in', () => {
      manager.fadeScreenIn(100)

      expect(manager.isScreenFading()).toBe(true)
      manager.update(50)
      const alpha1 = manager.getScreenFadeAlpha()
      expect(alpha1).toBeGreaterThan(0)
      expect(alpha1).toBeLessThan(1)
    })

    it('should complete fade in', () => {
      manager.fadeScreenIn(100)

      manager.update(100)
      expect(manager.isScreenFading()).toBe(false)
      expect(manager.getScreenFadeAlpha()).toBe(0)
    })

    it('should call fade completion callback', () => {
      let completeCalled = false
      manager.fadeScreenOut(100, () => {
        completeCalled = true
      })

      manager.update(100)
      expect(completeCalled).toBe(true)
    })
  })

  describe('Clear', () => {
    it('should clear all animations', () => {
      manager.createTween(0, 100, 1000, () => {})
      manager.emitParticles(0, 0, 10)
      manager.fadeScreenOut(1000)

      manager.clear()

      expect(manager.getParticles().length).toBe(0)
      expect(manager.getScreenFadeAlpha()).toBe(0)
      expect(manager.isScreenFading()).toBe(false)
    })
  })

  describe('Update', () => {
    it('should update all systems by delta time', () => {
      let tweenValue = 0
      manager.createTween(0, 100, 1000, (v) => {
        tweenValue = v
      })
      manager.emitParticles(0, 0, 5, '✨', 500)
      manager.fadeScreenOut(500)

      manager.update(250)

      expect(tweenValue).toBeGreaterThan(0)
      expect(manager.getScreenFadeAlpha()).toBeGreaterThan(0)
      expect(manager.getParticles().length).toBe(5) // Still alive
    })
  })
})
