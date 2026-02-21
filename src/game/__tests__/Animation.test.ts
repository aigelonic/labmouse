/**
 * Animation.test.ts - Unit tests for Animation and Particle classes
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { Tween, Particle, Easing } from '../Animation'

describe('Easing Functions', () => {
  it('should apply linear easing', () => {
    expect(Easing.linear(0)).toBe(0)
    expect(Easing.linear(0.5)).toBe(0.5)
    expect(Easing.linear(1)).toBe(1)
  })

  it('should apply easeOut', () => {
    expect(Easing.easeOut(0)).toBe(0)
    expect(Easing.easeOut(1)).toBe(1)
    expect(Easing.easeOut(0.5)).toBeGreaterThan(0.5) // easeOut accelerates towards end
  })

  it('should apply easeIn', () => {
    expect(Easing.easeIn(0)).toBe(0)
    expect(Easing.easeIn(1)).toBe(1)
    expect(Easing.easeIn(0.5)).toBeLessThan(0.5) // easeIn starts slow
  })

  it('should apply easeInOut', () => {
    expect(Easing.easeInOut(0)).toBe(0)
    expect(Easing.easeInOut(1)).toBe(1)
  })
})

describe('Tween', () => {
  let updateValues: number[] = []

  beforeEach(() => {
    updateValues = []
  })

  it('should interpolate between start and end values', () => {
    const tween = new Tween(0, 100, 1000, (value) => {
      updateValues.push(value)
    })

    // Halfway through
    tween.update(500)
    expect(updateValues[updateValues.length - 1]).toBeGreaterThan(0)
    expect(updateValues[updateValues.length - 1]).toBeLessThan(100)

    // Complete
    tween.update(500)
    expect(updateValues[updateValues.length - 1]).toBe(100)
  })

  it('should complete after duration', () => {
    const tween = new Tween(0, 100, 1000, () => {})

    expect(tween.isFinished()).toBe(false)
    tween.update(1000)
    expect(tween.isFinished()).toBe(true)
  })

  it('should call onComplete callback', () => {
    let completeCalled = false
    const tween = new Tween(0, 100, 100, () => {}, undefined, () => {
      completeCalled = true
    })

    tween.update(100)
    expect(completeCalled).toBe(true)
  })

  it('should apply custom easing function', () => {
    const easeOutValues: number[] = []
    const tween = new Tween(0, 100, 1000, (value) => {
      easeOutValues.push(value)
    }, Easing.easeOut)

    tween.update(500)
    // easeOut should reach > 50% at 50% time
    expect(easeOutValues[easeOutValues.length - 1]).toBeGreaterThan(50)
  })

  it('should not update after finishing', () => {
    let updateCount = 0
    const tween = new Tween(0, 100, 100, () => {
      updateCount++
    })

    tween.update(100)
    const isActive = tween.update(100) // Should return false
    expect(isActive).toBe(false)
    expect(updateCount).toBe(1) // Should not increment
  })
})

describe('Particle', () => {
  it('should initialize with position and velocity', () => {
    const particle = new Particle(100, 200, 1, 0.5, '✨', 500)

    expect(particle.x).toBe(100)
    expect(particle.y).toBe(200)
    expect(particle.vx).toBe(1)
    expect(particle.vy).toBe(0.5)
    expect(particle.life).toBe(1)
  })

  it('should update position based on velocity', () => {
    const particle = new Particle(0, 0, 1, 0, '✨')

    particle.update(100) // 100ms
    expect(particle.x).toBeGreaterThan(0)
  })

  it('should apply gravity', () => {
    const particle = new Particle(0, 0, 0, 0, '✨')

    particle.update(100)
    expect(particle.vy).toBeGreaterThan(0) // gravity increases vy
    expect(particle.y).toBeGreaterThan(0) // particle falls
  })

  it('should decrease life over time', () => {
    const particle = new Particle(0, 0, 0, 0, '✨', 1000)

    const initialLife = particle.life
    particle.update(500)
    expect(particle.life).toBeLessThan(initialLife)
  })

  it('should be alive when life > 0', () => {
    const particle = new Particle(0, 0, 0, 0, '✨', 100)

    expect(particle.isAlive()).toBe(true)
    particle.update(50)
    expect(particle.isAlive()).toBe(true)
    particle.update(50)
    expect(particle.isAlive()).toBe(false)
  })

  it('should support custom emoji', () => {
    const particle1 = new Particle(0, 0, 0, 0, '⭐')
    const particle2 = new Particle(0, 0, 0, 0, '✨')

    expect(particle1.emoji).toBe('⭐')
    expect(particle2.emoji).toBe('✨')
  })

  it('should not show life below 0', () => {
    const particle = new Particle(0, 0, 0, 0, '✨', 100)

    particle.update(200) // longer than max life
    expect(particle.life).toBeLessThanOrEqual(0)
  })
})
