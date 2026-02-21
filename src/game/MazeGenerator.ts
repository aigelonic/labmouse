/**
 * MazeGenerator creates procedurally generated mazes using recursive backtracking.
 * Guarantees a valid path from start to any reachable cell.
 */

import type { Cell } from './Maze';

export interface MazeGeneratorConfig {
  width: number;
  height: number;
}

export class MazeGenerator {
  private width: number;
  private height: number;
  private grid: Cell[][];

  constructor(config: MazeGeneratorConfig) {
    this.width = config.width;
    this.height = config.height;
    this.grid = [];
  }

  /**
   * Generate a new maze using recursive backtracking algorithm.
   * @returns 2D grid where 0 = passable, 1 = wall
   */
  generate(): Cell[][] {
    // Initialize grid with all walls
    this.grid = Array(this.height)
      .fill(null)
      .map(() => Array(this.width).fill(1) as Cell[]);

    // Start carving from (1,1) to ensure border walls remain
    this.carvePassage(1, 1);

    // Ensure start position is passable (should already be, but ensure it)
    this.grid[1][1] = 0;

    return this.grid;
  }

  /**
   * Recursively carve passages through the maze using DFS with backtracking.
   */
  private carvePassage(x: number, y: number): void {
    // Mark current cell as passable
    this.grid[y][x] = 0;

    // Get all possible directions in random order
    const directions = this.getRandomDirections();

    for (const dir of directions) {
      const nx = x + dir.dx * 2; // Move 2 cells to skip walls
      const ny = y + dir.dy * 2;

      // Check if the new position is valid and unvisited
      if (this.isValidCell(nx, ny) && this.grid[ny][nx] === 1) {
        // Carve wall between current and next cell
        this.grid[y + dir.dy][x + dir.dx] = 0;
        
        // Recursively carve from new position
        this.carvePassage(nx, ny);
      }
    }
  }

  /**
   * Check if a cell is within bounds and can be carved.
   */
  private isValidCell(x: number, y: number): boolean {
    return x > 0 && x < this.width - 1 && y > 0 && y < this.height - 1;
  }

  /**
   * Get directions in random order for maze generation.
   */
  private getRandomDirections(): Array<{ dx: number; dy: number }> {
    const directions = [
      { dx: 0, dy: -1 }, // Up
      { dx: 0, dy: 1 },  // Down
      { dx: -1, dy: 0 }, // Left
      { dx: 1, dy: 0 },  // Right
    ];

    // Shuffle directions using Fisher-Yates algorithm
    for (let i = directions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [directions[i], directions[j]] = [directions[j], directions[i]];
    }

    return directions;
  }

  /**
   * Find a valid position for the cheese (goal) that's reachable from start.
   * Uses BFS to ensure path exists.
   */
  findGoalPosition(startX: number, startY: number): { x: number; y: number } | null {
    const visited = new Set<string>();
    const queue: Array<{ x: number; y: number; distance: number }> = [
      { x: startX, y: startY, distance: 0 },
    ];
    visited.add(`${startX},${startY}`);

    let farthestCell: { x: number; y: number; distance: number } | null = null;

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      // Track farthest cell from start
      if (!farthestCell || current.distance > farthestCell.distance) {
        farthestCell = current;
      }

      // Check all 4 neighbors
      const neighbors = [
        { x: current.x, y: current.y - 1 }, // Up
        { x: current.x, y: current.y + 1 }, // Down
        { x: current.x - 1, y: current.y }, // Left
        { x: current.x + 1, y: current.y }, // Right
      ];

      for (const neighbor of neighbors) {
        const key = `${neighbor.x},${neighbor.y}`;
        
        if (
          !visited.has(key) &&
          this.isValidCell(neighbor.x, neighbor.y) &&
          this.grid[neighbor.y][neighbor.x] === 0
        ) {
          visited.add(key);
          queue.push({
            x: neighbor.x,
            y: neighbor.y,
            distance: current.distance + 1,
          });
        }
      }
    }

    // Return farthest reachable cell (makes game more interesting)
    return farthestCell && farthestCell.distance > 0
      ? { x: farthestCell.x, y: farthestCell.y }
      : null;
  }

  /**
   * Get the generated grid.
   */
  getGrid(): Cell[][] {
    return this.grid;
  }
}
