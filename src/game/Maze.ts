/**
 * Maze represents the grid-based level.
 * Handles collision detection and maze layout.
 */

export type Cell = 0 | 1; // 0 = passable, 1 = wall

export interface MazeConfig {
  width: number;
  height: number;
  cellSize: number;
  grid: Cell[][];
}

export class Maze {
  readonly width: number;
  readonly height: number;
  readonly cellSize: number;
  readonly grid: Cell[][];

  constructor(config: MazeConfig) {
    this.width = config.width;
    this.height = config.height;
    this.cellSize = config.cellSize;
    this.grid = config.grid;
  }

  /**
   * Check if a position (in pixels) is valid for the player.
   * Validates against walls and bounds.
   */
  canMoveTo(x: number, y: number, playerRadius: number = 8): boolean {
    // Convert pixel coordinates to grid cell
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);

    // Check bounds
    if (cellX < 0 || cellX >= this.width || cellY < 0 || cellY >= this.height) {
      return false;
    }

    // Check if cell is walkable (0 = passable, 1 = wall)
    if (this.grid[cellY][cellX] === 1) {
      return false;
    }

    // Check adjacent cells for more precise collision (4-directional sweep)
    const adjacentCells = this.getAdjacentCells(x, y, playerRadius);
    for (const cell of adjacentCells) {
      if (this.grid[cell.y] && this.grid[cell.y][cell.x] === 1) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get grid cells adjacent to player position.
   */
  private getAdjacentCells(
    x: number,
    y: number,
    radius: number
  ): Array<{ x: number; y: number }> {
    const cells: Array<{ x: number; y: number }> = [];
    const halfRadius = radius / 2;

    // Check 4 corners around player position
    const corners = [
      { px: x - halfRadius, py: y - halfRadius },
      { px: x + halfRadius, py: y - halfRadius },
      { px: x - halfRadius, py: y + halfRadius },
      { px: x + halfRadius, py: y + halfRadius },
    ];

    for (const corner of corners) {
      const cx = Math.floor(corner.px / this.cellSize);
      const cy = Math.floor(corner.py / this.cellSize);
      if (cx >= 0 && cx < this.width && cy >= 0 && cy < this.height) {
        // Only add unique cells
        if (!cells.some((c) => c.x === cx && c.y === cy)) {
          cells.push({ x: cx, y: cy });
        }
      }
    }

    return cells;
  }

  /**
   * Get cell type at grid position.
   */
  getCellAt(cellX: number, cellY: number): Cell {
    if (cellY < 0 || cellY >= this.height || cellX < 0 || cellX >= this.width) {
      return 1; // Out of bounds = wall
    }
    return this.grid[cellY][cellX];
  }

  /**
   * Get canvas dimensions in pixels.
   */
  getPixelWidth(): number {
    return this.width * this.cellSize;
  }

  getPixelHeight(): number {
    return this.height * this.cellSize;
  }

  /**
   * Check if path exists between two grid cells (simple BFS).
   */
  hasPath(fromX: number, fromY: number, toX: number, toY: number): boolean {
    if (
      this.getCellAt(fromX, fromY) === 1 ||
      this.getCellAt(toX, toY) === 1
    ) {
      return false;
    }

    const visited = new Set<string>();
    const queue: Array<{ x: number; y: number }> = [{ x: fromX, y: fromY }];
    visited.add(`${fromX},${fromY}`);

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.x === toX && current.y === toY) {
        return true;
      }

      // Check all 4 directions
      const neighbors = [
        { x: current.x - 1, y: current.y },
        { x: current.x + 1, y: current.y },
        { x: current.x, y: current.y - 1 },
        { x: current.x, y: current.y + 1 },
      ];

      for (const neighbor of neighbors) {
        const key = `${neighbor.x},${neighbor.y}`;
        if (
          !visited.has(key) &&
          this.getCellAt(neighbor.x, neighbor.y) === 0
        ) {
          visited.add(key);
          queue.push(neighbor);
        }
      }
    }

    return false;
  }

  /**
   * Get config for serialization.
   */
  getConfig(): MazeConfig {
    return {
      width: this.width,
      height: this.height,
      cellSize: this.cellSize,
      grid: this.grid.map((row) => [...row]), // Deep copy
    };
  }
}
