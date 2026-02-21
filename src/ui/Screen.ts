/**
 * Screen displays full-screen overlays: title, win, and pause screens.
 */

import { Container, Graphics, Text, TextStyle } from 'pixi.js'

export type ScreenType = 'title' | 'win' | 'pause' | null

export interface ScreenConfig {
  canvasWidth: number
  canvasHeight: number
}

export class Screen {
  private container: Container
  private background: Graphics
  private titleText: Text | null = null
  private messageText: Text | null = null
  private instructionText: Text | null = null
  private canvasWidth: number
  private canvasHeight: number

  constructor(config: ScreenConfig) {
    this.canvasWidth = config.canvasWidth
    this.canvasHeight = config.canvasHeight
    this.container = new Container()

    // Semi-transparent dark background
    this.background = new Graphics()
    this.background.rect(0, 0, this.canvasWidth, this.canvasHeight)
    this.background.fill({ color: 0x000000, alpha: 0.75 })
    this.container.addChild(this.background)
  }

  /**
   * Display title screen.
   */
  displayTitle(): void {
    this.clearText()

    const titleStyle = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 48,
      fontWeight: 'bold',
      fill: 0xffd700,
      align: 'center',
    })

    this.titleText = new Text({ text: 'LabMouse', style: titleStyle })
    this.titleText.x = this.canvasWidth / 2
    this.titleText.y = 120
    this.titleText.anchor.set(0.5, 0.5)
    this.container.addChild(this.titleText)

    const subtitleStyle = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 20,
      fill: 0xcccccc,
      align: 'center',
    })

    const subtitle = new Text({ text: 'Reach the Cheese!', style: subtitleStyle })
    subtitle.x = this.canvasWidth / 2
    subtitle.y = 200
    subtitle.anchor.set(0.5, 0.5)
    this.container.addChild(subtitle)

    const instructionStyle = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 16,
      fill: 0xaaaaaa,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 600,
    })

    const instructions = new Text(
      {
        text: 'Use WASD or arrow keys to move\nOn mobile, tap to move\n\nPress any key to start',
        style: instructionStyle,
      }
    )
    instructions.x = this.canvasWidth / 2
    instructions.y = 320
    instructions.anchor.set(0.5, 0.5)
    this.container.addChild(instructions)
  }

  /**
   * Display win screen with time.
   */
  displayWin(timeString: string): void {
    this.clearText()

    const titleStyle = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 44,
      fontWeight: 'bold',
      fill: 0xffd700,
      align: 'center',
    })

    this.titleText = new Text({ text: '🧀 You Win! 🧀', style: titleStyle })
    this.titleText.x = this.canvasWidth / 2
    this.titleText.y = 150
    this.titleText.anchor.set(0.5, 0.5)
    this.container.addChild(this.titleText)

    const messageStyle = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 28,
      fill: 0xffffff,
      align: 'center',
    })

    this.messageText = new Text({ text: `Time: ${timeString}`, style: messageStyle })
    this.messageText.x = this.canvasWidth / 2
    this.messageText.y = 280
    this.messageText.anchor.set(0.5, 0.5)
    this.container.addChild(this.messageText)

    const instructionStyle = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 16,
      fill: 0xaaaaaa,
      align: 'center',
    })

    this.instructionText = new Text(
      { text: 'Press any key or tap to play again', style: instructionStyle }
    )
    this.instructionText.x = this.canvasWidth / 2
    this.instructionText.y = 380
    this.instructionText.anchor.set(0.5, 0.5)
    this.container.addChild(this.instructionText)
  }

  /**
   * Display pause screen.
   */
  displayPause(): void {
    this.clearText()

    const titleStyle = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 48,
      fontWeight: 'bold',
      fill: 0xffffff,
      align: 'center',
    })

    this.titleText = new Text({ text: 'PAUSED', style: titleStyle })
    this.titleText.x = this.canvasWidth / 2
    this.titleText.y = 260
    this.titleText.anchor.set(0.5, 0.5)
    this.container.addChild(this.titleText)

    const instructionStyle = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 16,
      fill: 0xaaaaaa,
      align: 'center',
    })

    this.instructionText = new Text(
      { text: 'Press P to resume', style: instructionStyle }
    )
    this.instructionText.x = this.canvasWidth / 2
    this.instructionText.y = 340
    this.instructionText.anchor.set(0.5, 0.5)
    this.container.addChild(this.instructionText)
  }

  /**
   * Clear all text elements.
   */
  private clearText(): void {
    if (this.titleText) {
      this.container.removeChild(this.titleText)
      this.titleText = null
    }
    if (this.messageText) {
      this.container.removeChild(this.messageText)
      this.messageText = null
    }
    if (this.instructionText) {
      this.container.removeChild(this.instructionText)
      this.instructionText = null
    }
  }

  /**
   * Hide this screen.
   */
  hide(): void {
    this.container.visible = false
  }

  /**
   * Show this screen.
   */
  show(): void {
    this.container.visible = true
  }

  /**
   * Get the screen container.
   */
  getContainer(): Container {
    return this.container
  }
}
