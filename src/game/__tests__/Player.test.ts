/**
 * Player.test.ts - Unit tests for Player class
 */

import { describe, it, expect } from 'vitest';
import { Player } from '../Player';

describe('Player', () => {
  it('should initialize with correct position and radius', () => {
    const player = new Player(100, 200, 8);
    expect(player.x).toBe(100);
    expect(player.y).toBe(200);
    expect(player.radius).toBe(8);
  });

  it('should have default speed of 2 pixels per frame', () => {
    const player = new Player(0, 0);
    expect(player.speed).toBe(2);
  });

  it('should set direction correctly', () => {
    const player = new Player(0, 0);
    player.setDirection('up');
    expect(player.nextDirection).toBe('up');
  });

  it('should calculate velocity for up direction', () => {
    const player = new Player(0, 0);
    player.direction = 'up';
    const velocityY = -player.speed; // Should be -2
    expect(velocityY).toBe(-2);
  });

  it('should update position when moving', () => {
    const player = new Player(100, 100);
    player.setDirection('right');
    const canMove = () => true; // Always allow movement for this test

    player.update(canMove);

    // After update, nextDirection becomes direction
    expect(player.direction).toBe('right');
    // Position should move by speed (2 pixels) to the right
    expect(player.x).toBe(102);
    expect(player.y).toBe(100);
  });

  it('should not move if canMove callback returns false', () => {
    const player = new Player(100, 100);
    player.setDirection('right');
    const canMove = () => false; // Never allow movement

    player.update(canMove);

    expect(player.x).toBe(100);
    expect(player.y).toBe(100);
  });

  it('should detect collision with another entity', () => {
    const player = new Player(100, 100, 8);
    const targetX = 100;
    const targetY = 100;
    const targetRadius = 8;

    expect(player.collidesWith(targetX, targetY, targetRadius)).toBe(true);
  });

  it('should not detect collision when far away', () => {
    const player = new Player(100, 100, 8);
    const targetX = 200;
    const targetY = 100;
    const targetRadius = 8;

    expect(player.collidesWith(targetX, targetY, targetRadius)).toBe(false);
  });

  it('should buffer nextDirection correctly', () => {
    const player = new Player(0, 0);
    player.setDirection('up');
    expect(player.nextDirection).toBe('up');
    expect(player.direction).toBe(null); // Direction hasn't changed yet
  });

  it('should switch to buffered direction if valid', () => {
    const player = new Player(100, 100);
    player.direction = 'right';
    player.setDirection('up');
    const canMove = () => true;

    player.update(canMove);

    expect(player.direction).toBe('up');
  });

  it('should get state for serialization', () => {
    const player = new Player(100, 200, 8);
    const state = player.getState();

    expect(state.x).toBe(100);
    expect(state.y).toBe(200);
    expect(state.radius).toBe(8);
  });
});
