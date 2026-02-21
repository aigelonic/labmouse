/**
 * HUD displays in-game UI: timer, instructions, and status text.
 */

import { Container, Text, TextStyle } from 'pixi.js'

export class HUD {
  private container: Container
  private timerText: Text | null = null
  private instructionText: Text | null = null
  private statusText: Text | null = null

  constructor() {
    this.container = new Container()
  }

  /**
   * Display timer in top-left corner.
   */
  displayTimer(timeString: string): void {
    if (this.timerText) {
      this.timerText.text = timeString
    } else {
      const style = new TextStyle({
        fontFamily: 'monospace',
        fontSize: 24,
        fontWeight: 'bold',
        fill: 0xffffff,
      })

      this.timerText = new Text({ text: timeString, style })
      this.timerText.x = 16
      this.timerText.y = 12
      this.container.addChild(this.timerText)
    }
  }

  /**
   * Display instruction text.
   */
  displayInstructions(text: string): void {
    if (this.instructionText) {
      this.instructionText.text = text
    } else {
      const style = new TextStyle({
        fontFamily: 'monospace',
        fontSize: 14,
        fill: 0xcccccc,
        align: 'center',
      })

      this.instructionText = new Text({ text, style })
      this.instructionText.x = 400
      this.instructionText.y = 560
      this.instructionText.anchor.set(0.5, 1)
      this.container.addChild(this.instructionText)
    }
  }

  /**
   * Display status text (e.g., current level or debug info).
   */
  displayStatus(text: string): void {
    if (this.statusText) {
      this.statusText.text = text
    } else {
      const style = new TextStyle({
        fontFamily: 'monospace',
        fontSize: 12,
        fill: 0x999999,
        align: 'right',
      })

      this.statusText = new Text({ text, style })
      this.statusText.x = 784
      this.statusText.y = 12
      this.statusText.anchor.set(1, 0)
      this.container.addChild(this.statusText)
    }
  }

  /**
   * Clear all HUD elements.
   */
  clear(): void {
    this.container.removeChildren()
    this.timerText = null
    this.instructionText = null
    this.statusText = null
  }

  /**
   * Get the HUD container for rendering.
   */
  getContainer(): Container {
    return this.container
  }

  /**
   * Hide all HUD elements.
   */
  hide(): void {
    this.container.visible = false
  }

  /**
   * Show all HUD elements.
   */
  show(): void {
    this.container.visible = true
  }
}
