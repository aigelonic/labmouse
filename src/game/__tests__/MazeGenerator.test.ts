/**
 * Unit tests for MazeGenerator.
 */

import { describe, it, expect } from 'vitest';
import { MazeGenerator } from '../MazeGenerator';

describe('MazeGenerator', () => {
  describe('generate()', () => {
    it('should generate a grid with correct dimensions', () => {
      const generator = new MazeGenerator({ width: 10, height: 10 });
      const grid = generator.generate();

      expect(grid.length).toBe(10);
      expect(grid[0].length).toBe(10);
    });

    it('should generate desktop layout (16×12)', () => {
      const generator = new MazeGenerator({ width: 16, height: 12 });
      const grid = generator.generate();

      expect(grid.length).toBe(12);
      expect(grid[0].length).toBe(16);
    });

    it('should generate mobile layout (12×16)', () => {
      const generator = new MazeGenerator({ width: 12, height: 16 });
      const grid = generator.generate();

      expect(grid.length).toBe(16);
      expect(grid[0].length).toBe(12);
    });

    it('should have border walls', () => {
      const generator = new MazeGenerator({ width: 10, height: 10 });
      const grid = generator.generate();

      // Check top and bottom borders
      for (let x = 0; x < 10; x++) {
        expect(grid[0][x]).toBe(1); // Top
        expect(grid[9][x]).toBe(1); // Bottom
      }

      // Check left and right borders
      for (let y = 0; y < 10; y++) {
        expect(grid[y][0]).toBe(1); // Left
        expect(grid[y][9]).toBe(1); // Right
      }
    });

    it('should have start position passable', () => {
      const generator = new MazeGenerator({ width: 10, height: 10 });
      const grid = generator.generate();

      // Start at (1,1)
      expect(grid[1][1]).toBe(0);
    });

    it('should have some passages (not all walls)', () => {
      const generator = new MazeGenerator({ width: 10, height: 10 });
      const grid = generator.generate();

      const passageCount = grid.flat().filter((cell) => cell === 0).length;
      
      // Should have meaningful number of passages (at least 10% of total cells)
      expect(passageCount).toBeGreaterThan(10);
    });

    it('should generate different mazes on multiple calls', () => {
      const generator = new MazeGenerator({ width: 10, height: 10 });
      
      const grid1 = generator.generate();
      const grid2 = generator.generate();

      // Converting to strings for comparison
      const str1 = JSON.stringify(grid1);
      const str2 = JSON.stringify(grid2);

      // Very high probability that two generated mazes differ
      // (Could occasionally fail due to randomness, but extremely unlikely)
      expect(str1).not.toBe(str2);
    });

    it('should not have isolated passages (all passages connected)', () => {
      const generator = new MazeGenerator({ width: 10, height: 10 });
      const grid = generator.generate();

      // Use flood fill from start position to count reachable cells
      const reachable = floodFill(grid, 1, 1);
      
      // Count all passages in grid
      const totalPassages = grid.flat().filter((cell) => cell === 0).length;

      // All passages should be reachable from start
      expect(reachable).toBe(totalPassages);
    });
  });

  describe('findGoalPosition()', () => {
    it('should find a valid goal position', () => {
      const generator = new MazeGenerator({ width: 10, height: 10 });
      generator.generate();

      const goal = generator.findGoalPosition(1, 1);

      expect(goal).not.toBeNull();
      expect(goal!.x).toBeGreaterThanOrEqual(1);
      expect(goal!.x).toBeLessThan(9);
      expect(goal!.y).toBeGreaterThanOrEqual(1);
      expect(goal!.y).toBeLessThan(9);
    });

    it('should find goal on a passable cell', () => {
      const generator = new MazeGenerator({ width: 10, height: 10 });
      const grid = generator.generate();

      const goal = generator.findGoalPosition(1, 1);

      expect(goal).not.toBeNull();
      expect(grid[goal!.y][goal!.x]).toBe(0);
    });

    it('should find goal different from start position', () => {
      const generator = new MazeGenerator({ width: 10, height: 10 });
      generator.generate();

      const startX = 1;
      const startY = 1;
      const goal = generator.findGoalPosition(startX, startY);

      expect(goal).not.toBeNull();
      expect(goal!.x !== startX || goal!.y !== startY).toBe(true);
    });

    it('should find goal reachable from start', () => {
      const generator = new MazeGenerator({ width: 10, height: 10 });
      const grid = generator.generate();

      const goal = generator.findGoalPosition(1, 1);

      expect(goal).not.toBeNull();
      
      // Verify path exists using BFS
      const hasPath = bfs(grid, 1, 1, goal!.x, goal!.y);
      expect(hasPath).toBe(true);
    });

    it('should prefer distant goal positions', () => {
      const generator = new MazeGenerator({ width: 16, height: 12 });
      generator.generate();

      const goal = generator.findGoalPosition(1, 1);

      expect(goal).not.toBeNull();
      
      // Goal should be farther from start than adjacent cells (distance > 1)
      const distance = Math.abs(goal!.x - 1) + Math.abs(goal!.y - 1);
      expect(distance).toBeGreaterThan(1);
    });
  });

  describe('getGrid()', () => {
    it('should return the generated grid', () => {
      const generator = new MazeGenerator({ width: 10, height: 10 });
      const generatedGrid = generator.generate();
      const retrievedGrid = generator.getGrid();

      expect(retrievedGrid).toBe(generatedGrid);
    });
  });
});

/**
 * Flood fill helper to count reachable cells from a start position.
 */
function floodFill(grid: number[][], startX: number, startY: number): number {
  const visited = new Set<string>();
  const queue: Array<{ x: number; y: number }> = [{ x: startX, y: startY }];
  visited.add(`${startX},${startY}`);
  let count = 0;

  while (queue.length > 0) {
    const { x, y } = queue.shift()!;
    count++;

    const neighbors = [
      { x, y: y - 1 },
      { x, y: y + 1 },
      { x: x - 1, y },
      { x: x + 1, y },
    ];

    for (const neighbor of neighbors) {
      const key = `${neighbor.x},${neighbor.y}`;
      
      if (
        !visited.has(key) &&
        neighbor.y >= 0 &&
        neighbor.y < grid.length &&
        neighbor.x >= 0 &&
        neighbor.x < grid[0].length &&
        grid[neighbor.y][neighbor.x] === 0
      ) {
        visited.add(key);
        queue.push(neighbor);
      }
    }
  }

  return count;
}

/**
 * BFS helper to check if path exists between two points.
 */
function bfs(
  grid: number[][],
  startX: number,
  startY: number,
  goalX: number,
  goalY: number
): boolean {
  const visited = new Set<string>();
  const queue: Array<{ x: number; y: number }> = [{ x: startX, y: startY }];
  visited.add(`${startX},${startY}`);

  while (queue.length > 0) {
    const { x, y } = queue.shift()!;

    if (x === goalX && y === goalY) {
      return true;
    }

    const neighbors = [
      { x, y: y - 1 },
      { x, y: y + 1 },
      { x: x - 1, y },
      { x: x + 1, y },
    ];

    for (const neighbor of neighbors) {
      const key = `${neighbor.x},${neighbor.y}`;
      
      if (
        !visited.has(key) &&
        neighbor.y >= 0 &&
        neighbor.y < grid.length &&
        neighbor.x >= 0 &&
        neighbor.x < grid[0].length &&
        grid[neighbor.y][neighbor.x] === 0
      ) {
        visited.add(key);
        queue.push(neighbor);
      }
    }
  }

  return false;
}
