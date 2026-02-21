/**
 * Unit tests for SoundManager
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SoundManager } from '../SoundManager'

// Mock Web Audio API
class MockAudioContext {
  currentTime = 0
  destination = {}
  
  createOscillator() {
    return {
      frequency: { value: 0 },
      type: 'sine',
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    }
  }
  
  createGain() {
    return {
      gain: {
        value: 0,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    }
  }
  
  close() {
    return Promise.resolve()
  }
}

describe('SoundManager', () => {
  let soundManager: SoundManager

  beforeEach(() => {
    // Mock AudioContext globally
    ;(window as any).AudioContext = MockAudioContext
    soundManager = new SoundManager()
  })

  it('should not be enabled before initialization', () => {
    expect(soundManager.isEnabled()).toBe(false)
  })

  it('should be enabled after initialization', () => {
    soundManager.init()
    expect(soundManager.isEnabled()).toBe(true)
  })

  it('should only initialize once', () => {
    soundManager.init()
    const wasEnabled = soundManager.isEnabled()
    
    soundManager.init() // Call again
    expect(soundManager.isEnabled()).toBe(wasEnabled)
  })

  it('should play move sound when enabled', () => {
    soundManager.init()
    
    // Should not throw
    expect(() => soundManager.playMove()).not.toThrow()
  })

  it('should not throw when playing sounds while disabled', () => {
    // Should not throw even when not initialized
    expect(() => soundManager.playMove()).not.toThrow()
    expect(() => soundManager.playCollect()).not.toThrow()
    expect(() => soundManager.playWin()).not.toThrow()
  })

  it('should play collect sound when enabled', () => {
    soundManager.init()
    
    // Should not throw
    expect(() => soundManager.playCollect()).not.toThrow()
  })

  it('should play win sound when enabled', () => {
    soundManager.init()
    
    // Should not throw
    expect(() => soundManager.playWin()).not.toThrow()
  })

  it('should destroy audio context', async () => {
    soundManager.init()
    expect(soundManager.isEnabled()).toBe(true)
    
    await soundManager.destroy()
    expect(soundManager.isEnabled()).toBe(false)
  })

  it('should handle missing Web Audio API gracefully', () => {
    // Remove AudioContext mock
    delete (window as any).AudioContext
    
    const manager = new SoundManager()
    
    // Should not throw and should not be enabled
    expect(() => manager.init()).not.toThrow()
    expect(manager.isEnabled()).toBe(false)
  })
})
