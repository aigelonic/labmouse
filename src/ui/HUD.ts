/**
 * HUD displays in-game UI: timer, instructions, and status text.
 */

import { Container, Graphics, Text, TextStyle } from 'pixi.js'

export class HUD {
  private container: Container
  private timerText: Text | null = null
  private instructionText: Text | null = null
  private statusText: Text | null = null
  private menuButton: Graphics | null = null
  private menuButtonText: Text | null = null

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
   * Display menu button in top-right corner.
   */
  displayMenuButton(): void {
    if (!this.menuButton) {
      // Button background
      this.menuButton = new Graphics()
      this.menuButton.rect(-45, -15, 90, 30)
      this.menuButton.fill({ color: 0x333333 })
      this.menuButton.stroke({ color: 0x666666, width: 2 })
      this.menuButton.x = 720
      this.menuButton.y = 70
      this.menuButton.eventMode = 'static'
      this.menuButton.cursor = 'pointer'
      this.container.addChild(this.menuButton)

      // Button text
      const buttonStyle = new TextStyle({
        fontFamily: 'monospace',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0xffffff,
        align: 'center',
      })

      this.menuButtonText = new Text({ text: '🏠 Menu', style: buttonStyle })
      this.menuButtonText.x = 720
      this.menuButtonText.y = 70
      this.menuButtonText.anchor.set(0.5, 0.5)
      this.container.addChild(this.menuButtonText)
    }
  }

  /**
   * Check if a click/tap hits the menu button.
   */
  isMenuButtonClicked(x: number, y: number): boolean {
    if (!this.menuButton) {
      return false
    }
    const bounds = this.menuButton.getBounds()
    return x >= bounds.x && x <= bounds.x + bounds.width &&
           y >= bounds.y && y <= bounds.y + bounds.height
  }

  /**
   * Set menu button hover state (for visual feedback).
   */
  setMenuButtonHover(isHovered: boolean): void {
    if (!this.menuButton) return
    // Scale and color change on hover
    this.menuButton.scale.set(isHovered ? 1.1 : 1.0);
    this.menuButton.fill({ color: isHovered ? 0x444444 : 0x333333 });
  }

  /**
   * Set menu button pressed state (for click feedback).
   */
  setMenuButtonPressed(isPressed: boolean): void {
    if (!this.menuButton) return
    // Scale down on press for feedback
    this.menuButton.scale.set(isPressed ? 0.95 : 1.0);
  }

  /**
   * Clear all HUD elements.
   */
  clear(): void {
    this.container.removeChildren()
    this.timerText = null
    this.instructionText = null
    this.statusText = null
    this.menuButton = null
    this.menuButtonText = null
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
