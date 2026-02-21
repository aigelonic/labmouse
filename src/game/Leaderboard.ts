/**
 * Leaderboard manages high scores using LocalStorage.
 * Stores top 5 times for each difficulty level.
 */

export interface LeaderboardEntry {
  time: number; // milliseconds
  date: string; // ISO date string
}

export interface LeaderboardData {
  easy: LeaderboardEntry[];
  medium: LeaderboardEntry[];
  hard: LeaderboardEntry[];
}

export class Leaderboard {
  private static readonly STORAGE_KEY = 'labmouse_leaderboard';
  private static readonly MAX_ENTRIES = 5;

  /**
   * Save a time to the leaderboard if it qualifies for top 5.
   * Returns the position (1-5) if it made the board, null otherwise.
   */
  static saveTime(difficulty: 'easy' | 'medium' | 'hard', time: number): number | null {
    const data = this.loadData();
    const entries = data[difficulty];
    
    // Add new entry
    entries.push({
      time,
      date: new Date().toISOString(),
    });
    
    // Sort by time (ascending - faster is better)
    entries.sort((a, b) => a.time - b.time);
    
    // Find position of the newly added time
    const position = entries.findIndex(entry => 
      entry.time === time && entry.date === entries[entries.length - 1].date
    ) + 1;
    
    // Keep only top entries
    data[difficulty] = entries.slice(0, this.MAX_ENTRIES);
    
    // Save to localStorage
    this.saveData(data);
    
    // Return position if it made the top 5
    return position <= this.MAX_ENTRIES ? position : null;
  }

  /**
   * Get top times for a difficulty level.
   */
  static getTopTimes(difficulty: 'easy' | 'medium' | 'hard'): LeaderboardEntry[] {
    const data = this.loadData();
    return data[difficulty];
  }

  /**
   * Get all leaderboard data.
   */
  static getAllData(): LeaderboardData {
    return this.loadData();
  }

  /**
   * Clear times for a specific difficulty.
   */
  static clearTimes(difficulty: 'easy' | 'medium' | 'hard'): void {
    const data = this.loadData();
    data[difficulty] = [];
    this.saveData(data);
  }

  /**
   * Clear all leaderboard data.
   */
  static clearAll(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Check if a time qualifies for the leaderboard (without saving).
   */
  static wouldQualify(difficulty: 'easy' | 'medium' | 'hard', time: number): boolean {
    const entries = this.getTopTimes(difficulty);
    
    // If less than max entries, it qualifies
    if (entries.length < this.MAX_ENTRIES) {
      return true;
    }
    
    // Check if time is better than worst entry
    const worstTime = entries[entries.length - 1].time;
    return time < worstTime;
  }

  /**
   * Load leaderboard data from localStorage.
   */
  private static loadData(): LeaderboardData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load leaderboard data:', error);
    }
    
    // Return default empty structure
    return {
      easy: [],
      medium: [],
      hard: [],
    };
  }

  /**
   * Save leaderboard data to localStorage.
   */
  private static saveData(data: LeaderboardData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save leaderboard data:', error);
    }
  }
}
