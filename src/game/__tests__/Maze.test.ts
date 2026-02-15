/**
 * Maze.test.ts - Unit tests for Maze class
 */

import { describe, it, expect } from 'vitest';
import { Maze } from '../Maze';
import type { Cell } from '../Maze';

describe('Maze', () => {
  const simpleMaze: Cell[][] = [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ];

  it('should initialize with correct dimensions and grid', () => {
    const maze = new Maze({
      width: 5,
      height: 5,
      cellSize: 50,
      grid: simpleMaze,
    });

    expect(maze.width).toBe(5);
    expect(maze.height).toBe(5);
    expect(maze.cellSize).toBe(50);
  });

  it('should calculate pixel dimensions correctly', () => {
    const maze = new Maze({
      width: 10,
      height: 10,
      cellSize: 50,
      grid: Array(10).fill(Array(10).fill(0)),
    });

    expect(maze.getPixelWidth()).toBe(500);
    expect(maze.getPixelHeight()).toBe(500);
  });

  it('should allow movement to passable cells', () => {
    const maze = new Maze({
      width: 5,
      height: 5,
      cellSize: 50,
      grid: simpleMaze,
    });

    // Position (75, 75) is in cell (1, 1) which is passable (0)
    const canMove = maze.canMoveTo(75, 75, 8);
    expect(canMove).toBe(true);
  });

  it('should block movement to wall cells', () => {
    const maze = new Maze({
      width: 5,
      height: 5,
      cellSize: 50,
      grid: simpleMaze,
    });

    // Position (25, 25) is in cell (0, 0) which is a wall (1)
    const canMove = maze.canMoveTo(25, 25, 8);
    expect(canMove).toBe(false);
  });

  it('should block movement outside bounds', () => {
    const maze = new Maze({
      width: 5,
      height: 5,
      cellSize: 50,
      grid: simpleMaze,
    });

    // Position outside maze bounds
    const canMove = maze.canMoveTo(-50, 100, 8);
    expect(canMove).toBe(false);
  });

  it('should get cell at grid position', () => {
    const maze = new Maze({
      width: 5,
      height: 5,
      cellSize: 50,
      grid: simpleMaze,
    });

    expect(maze.getCellAt(0, 0)).toBe(1); // Wall
    expect(maze.getCellAt(1, 1)).toBe(0); // Passable
  });

  it('should return 1 (wall) for out-of-bounds cells', () => {
    const maze = new Maze({
      width: 5,
      height: 5,
      cellSize: 50,
      grid: simpleMaze,
    });

    expect(maze.getCellAt(-1, 0)).toBe(1);
    expect(maze.getCellAt(0, -1)).toBe(1);
    expect(maze.getCellAt(10, 0)).toBe(1);
  });

  it('should find path between two accessible cells', () => {
    const maze = new Maze({
      width: 5,
      height: 5,
      cellSize: 50,
      grid: simpleMaze,
    });

    // Both (1,1) and (3,1) are passable and connected
    const hasPath = maze.hasPath(1, 1, 3, 1);
    expect(hasPath).toBe(true);
  });

  it('should not find path to unreachable cell', () => {
    const maze = new Maze({
      width: 5,
      height: 5,
      cellSize: 50,
      grid: simpleMaze,
    });

    // (1,1) is accessible but (0,0) is a wall
    const hasPath = maze.hasPath(1, 1, 0, 0);
    expect(hasPath).toBe(false);
  });

  it('should not find path from wall to wall', () => {
    const maze = new Maze({
      width: 5,
      height: 5,
      cellSize: 50,
      grid: simpleMaze,
    });

    // Both (0,0) and (4,4) are walls
    const hasPath = maze.hasPath(0, 0, 4, 4);
    expect(hasPath).toBe(false);
  });

  it('should get config for serialization', () => {
    const maze = new Maze({
      width: 5,
      height: 5,
      cellSize: 50,
      grid: simpleMaze,
    });

    const config = maze.getConfig();
    expect(config.width).toBe(5);
    expect(config.height).toBe(5);
    expect(config.cellSize).toBe(50);
    expect(config.grid.length).toBe(5);
  });

  it('should handle diagonal collision detection', () => {
    const maze = new Maze({
      width: 5,
      height: 5,
      cellSize: 50,
      grid: simpleMaze,
    });

    // Test position that touches a wall diagonally
    // Cell (2, 2) is a wall, so position near corner should fail
    const canMove = maze.canMoveTo(125, 125, 16); // r=16 should touch wall at (2,2)
    expect(canMove).toBe(false);
  });
});
