/**
 * Renderer.test.ts - Unit tests for Renderer class
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { Graphics } from 'pixi.js'
import { Renderer } from '../Renderer'
import { Viewport } from '../Viewport'

describe('Renderer', () => {
  let canvas: HTMLCanvasElement
  let renderer: Renderer

  beforeEach(() => {
    // Create a mock canvas element
    canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    renderer = new Renderer(canvas)
  })

  it('should initialize with a canvas', () => {
    expect(renderer.canvas).toBe(canvas)
  })

  it('should create layers', () => {
    expect(renderer.wallsLayer).toBeDefined()
    expect(renderer.objectsLayer).toBeDefined()
    expect(renderer.uiLayer).toBeDefined()
    expect(renderer.fogMask).toBeDefined()
  })

  it('should have a PixiJS application', () => {
    expect(renderer.app).toBeDefined()
  })

  it('should create container with proper structure', () => {
    expect(renderer.container).toBeDefined()
    expect(renderer.container.children.length).toBe(0) // Before init
  })

  it('should clear all layers', () => {
    renderer.wallsLayer.addChild(new Graphics())
    renderer.objectsLayer.addChild(new Graphics())
    renderer.uiLayer.addChild(new Graphics())

    renderer.clear()

    expect(renderer.wallsLayer.children.length).toBe(0)
    expect(renderer.objectsLayer.children.length).toBe(0)
    expect(renderer.uiLayer.children.length).toBe(0)
  })

  it('should create viewport config', () => {
    const viewport = new Viewport({
      width: 800,
      height: 600,
      radius: 150,
      canvasWidth: 800,
      canvasHeight: 600,
    })

    expect(viewport.radius).toBe(150)
    expect(viewport.canvasWidth).toBe(800)
    expect(viewport.canvasHeight).toBe(600)
  })

  it('should have fog mask with correct center', () => {
    const viewport = new Viewport({
      width: 800,
      height: 600,
      radius: 150,
      canvasWidth: 800,
      canvasHeight: 600,
    })

    viewport.centerOn(400, 300) // Center of canvas
    expect(viewport.x).toBe(400)
    expect(viewport.y).toBe(300)
  })

  it('should check visibility within radius', () => {
    const viewport = new Viewport({
      width: 800,
      height: 600,
      radius: 150,
      canvasWidth: 800,
      canvasHeight: 600,
    })

    viewport.centerOn(400, 300)

    // Point at center should be visible
    expect(viewport.isVisible(400, 300)).toBe(true)

    // Point at edge of radius should be visible
    expect(viewport.isVisible(400 + 150, 300)).toBe(true)

    // Point beyond radius should not be visible
    expect(viewport.isVisible(400 + 200, 300)).toBe(false)
  })

  it('should convert world to screen coordinates', () => {
    const viewport = new Viewport({
      width: 800,
      height: 600,
      radius: 150,
      canvasWidth: 800,
      canvasHeight: 600,
    })

    viewport.centerOn(400, 300)

    // Center of world should map to center of screen
    const screenPos = viewport.worldToScreen(400, 300)
    expect(screenPos.x).toBe(400)
    expect(screenPos.y).toBe(300)

    // Point to the right should map to right on screen
    const rightPos = viewport.worldToScreen(500, 300)
    expect(rightPos.x).toBe(500)
    expect(rightPos.y).toBe(300)
  })

  it('should convert screen to world coordinates', () => {
    const viewport = new Viewport({
      width: 800,
      height: 600,
      radius: 150,
      canvasWidth: 800,
      canvasHeight: 600,
    })

    viewport.centerOn(400, 300)

    // Screen center should map to viewport center
    const worldPos = viewport.screenToWorld(400, 300)
    expect(worldPos.x).toBe(400)
    expect(worldPos.y).toBe(300)
  })

  it('should get world bounds for visibility culling', () => {
    const viewport = new Viewport({
      width: 800,
      height: 600,
      radius: 150,
      canvasWidth: 800,
      canvasHeight: 600,
    })

    viewport.centerOn(400, 300)

    const bounds = viewport.getWorldBounds()
    expect(bounds.minX).toBe(250) // 400 - 150
    expect(bounds.maxX).toBe(550) // 400 + 150
    expect(bounds.minY).toBe(150) // 300 - 150
    expect(bounds.maxY).toBe(450) // 300 + 150
  })

  it('should check if area is visible', () => {
    const viewport = new Viewport({
      width: 800,
      height: 600,
      radius: 150,
      canvasWidth: 800,
      canvasHeight: 600,
    })

    viewport.centerOn(400, 300)

    // Area at center should be visible
    expect(viewport.isAreaVisible(400, 300, 50)).toBe(true)

    // Area partially within radius should be visible
    expect(viewport.isAreaVisible(540, 300, 50)).toBe(true)

    // Area completely outside should not be visible
    expect(viewport.isAreaVisible(600, 300, 50)).toBe(false)
  })
})
