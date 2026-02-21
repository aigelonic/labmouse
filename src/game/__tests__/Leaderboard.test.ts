/**
 * Unit tests for Leaderboard
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Leaderboard } from '../Leaderboard'

describe('Leaderboard', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    Leaderboard.clearAll()
  })

  afterEach(() => {
    // Clean up after tests
    Leaderboard.clearAll()
  })

  describe('saveTime', () => {
    it('should save a time and return position 1 for first entry', () => {
      const position = Leaderboard.saveTime('easy', 5000)
      expect(position).toBe(1)
    })

    it('should save multiple times and rank them correctly', () => {
      Leaderboard.saveTime('medium', 10000) // 1st
      Leaderboard.saveTime('medium', 5000)  // 1st (faster)
      const position = Leaderboard.saveTime('medium', 7500)  // 2nd
      
      expect(position).toBe(2)
    })

    it('should keep only top 5 entries', () => {
      for (let i = 1; i <= 7; i++) {
        Leaderboard.saveTime('hard', i * 1000)
      }
      
      const entries = Leaderboard.getTopTimes('hard')
      expect(entries.length).toBe(5)
      expect(entries[0].time).toBe(1000) // Fastest
      expect(entries[4].time).toBe(5000) // 5th fastest
    })

    it('should return null for times outside top 5', () => {
      // Fill with fast times
      for (let i = 1; i <= 5; i++) {
        Leaderboard.saveTime('easy', i * 1000)
      }
      
      // Add a slow time
      const position = Leaderboard.saveTime('easy', 10000)
      expect(position).toBeNull()
    })

    it('should store different difficulties separately', () => {
      Leaderboard.saveTime('easy', 5000)
      Leaderboard.saveTime('medium', 3000)
      Leaderboard.saveTime('hard', 8000)
      
      const easyTimes = Leaderboard.getTopTimes('easy')
      const mediumTimes = Leaderboard.getTopTimes('medium')
      const hardTimes = Leaderboard.getTopTimes('hard')
      
      expect(easyTimes.length).toBe(1)
      expect(mediumTimes.length).toBe(1)
      expect(hardTimes.length).toBe(1)
      expect(easyTimes[0].time).toBe(5000)
      expect(mediumTimes[0].time).toBe(3000)
      expect(hardTimes[0].time).toBe(8000)
    })
  })

  describe('getTopTimes', () => {
    it('should return empty array when no times saved', () => {
      const times = Leaderboard.getTopTimes('medium')
      expect(times).toEqual([])
    })

    it('should return times sorted by speed', () => {
      Leaderboard.saveTime('hard', 10000)
      Leaderboard.saveTime('hard', 5000)
      Leaderboard.saveTime('hard', 7500)
      
      const times = Leaderboard.getTopTimes('hard')
      expect(times[0].time).toBe(5000)
      expect(times[1].time).toBe(7500)
      expect(times[2].time).toBe(10000)
    })
  })

  describe('wouldQualify', () => {
    it('should return true when less than 5 entries exist', () => {
      Leaderboard.saveTime('easy', 5000)
      
      expect(Leaderboard.wouldQualify('easy', 10000)).toBe(true)
    })

    it('should return true for times better than worst entry', () => {
      for (let i = 1; i <= 5; i++) {
        Leaderboard.saveTime('medium', i * 1000)
      }
      
      // 4500ms is better than 5000ms (worst entry)
      expect(Leaderboard.wouldQualify('medium', 4500)).toBe(true)
    })

    it('should return false for times worse than worst entry', () => {
      for (let i = 1; i <= 5; i++) {
        Leaderboard.saveTime('medium', i * 1000)
      }
      
      // 6000ms is worse than 5000ms (worst entry)
      expect(Leaderboard.wouldQualify('medium', 6000)).toBe(false)
    })
  })

  describe('clearTimes', () => {
    it('should clear times for specific difficulty', () => {
      Leaderboard.saveTime('easy', 5000)
      Leaderboard.saveTime('medium', 3000)
      
      Leaderboard.clearTimes('easy')
      
      const easyTimes = Leaderboard.getTopTimes('easy')
      const mediumTimes = Leaderboard.getTopTimes('medium')
      
      expect(easyTimes.length).toBe(0)
      expect(mediumTimes.length).toBe(1)
    })
  })

  describe('clearAll', () => {
    it('should clear all leaderboard data', () => {
      Leaderboard.saveTime('easy', 5000)
      Leaderboard.saveTime('medium', 3000)
      Leaderboard.saveTime('hard', 8000)
      
      Leaderboard.clearAll()
      
      const data = Leaderboard.getAllData()
      expect(data.easy.length).toBe(0)
      expect(data.medium.length).toBe(0)
      expect(data.hard.length).toBe(0)
    })
  })

  describe('getAllData', () => {
    it('should return all difficulties\' data', () => {
      Leaderboard.saveTime('easy', 5000)
      Leaderboard.saveTime('medium', 3000)
      
      const data = Leaderboard.getAllData()
      
      expect(data).toHaveProperty('easy')
      expect(data).toHaveProperty('medium')
      expect(data).toHaveProperty('hard')
      expect(data.easy.length).toBe(1)
      expect(data.medium.length).toBe(1)
      expect(data.hard.length).toBe(0)
    })
  })
})
