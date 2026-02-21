/**
 * Screen displays full-screen overlays: title, win, and pause screens.
 */

import { Container, Graphics, Text, TextStyle } from 'pixi.js'
import { Leaderboard } from '../game/Leaderboard'

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
  private difficultyButtons: Graphics[] = []

  constructor(config: ScreenConfig) {
    this.canvasWidth = config.canvasWidth
    this.canvasHeight = config.canvasHeight
    this.container = new Container()

    // Fully opaque dark background (prevents game world from showing through)
    this.background = new Graphics()
    this.background.rect(0, 0, this.canvasWidth, this.canvasHeight)
    this.background.fill({ color: 0x1a1a1a, alpha: 1.0 })
    this.container.addChild(this.background)
  }

  /**
   * Display title screen with difficulty selection.
   */
  displayTitle(currentDifficulty: 'easy' | 'medium' | 'hard' = 'medium'): void {
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
    this.titleText.y = 80
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
    subtitle.y = 140
    subtitle.anchor.set(0.5, 0.5)
    this.container.addChild(subtitle)

    // Difficulty selection
    this.displayDifficultySelector(currentDifficulty)

    // Leaderboard display
    this.displayLeaderboard(currentDifficulty)

    const instructionStyle = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 14,
      fill: 0xaaaaaa,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 600,
    })

    const instructions = new Text(
      {
        text: 'Use WASD or arrow keys\nClick difficulty to change\n\nPress any key to start',
        style: instructionStyle,
      }
    )
    instructions.x = this.canvasWidth / 2
    instructions.y = this.canvasHeight - 60
    instructions.anchor.set(0.5, 0.5)
    this.container.addChild(instructions)
  }

  /**
   * Display win screen with time.
   */
  displayWin(timeString: string, leaderboardPosition?: number | null): void {
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
    this.titleText.y = 120
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
    this.messageText.y = 220
    this.messageText.anchor.set(0.5, 0.5)
    this.container.addChild(this.messageText)
    
    // Show leaderboard position if it qualifies
    if (leaderboardPosition !== null && leaderboardPosition !== undefined) {
      const recordStyle = new TextStyle({
        fontFamily: 'monospace',
        fontSize: 20,
        fontWeight: 'bold',
        fill: 0xffaa00,
        align: 'center',
      })
      
      const recordText = new Text({ 
        text: `🏆 #${leaderboardPosition} on Leaderboard! 🏆`, 
        style: recordStyle 
      })
      recordText.x = this.canvasWidth / 2
      recordText.y = 290
      recordText.anchor.set(0.5, 0.5)
      this.container.addChild(recordText)
    }

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
    this.instructionText.y = this.canvasHeight - 100
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
   * Display difficulty selector buttons.
   */
  private displayDifficultySelector(currentDifficulty: 'easy' | 'medium' | 'hard'): void {
    const labelStyle = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 16,
      fill: 0xcccccc,
      align: 'center',
    })

    const label = new Text({ text: 'Select Difficulty:', style: labelStyle })
    label.x = this.canvasWidth / 2
    label.y = 190
    label.anchor.set(0.5, 0.5)
    this.container.addChild(label)

    const difficulties: Array<{ name: 'easy' | 'medium' | 'hard'; label: string; x: number }> = [
      { name: 'easy', label: 'Easy', x: this.canvasWidth / 2 - 120 },
      { name: 'medium', label: 'Medium', x: this.canvasWidth / 2 },
      { name: 'hard', label: 'Hard', x: this.canvasWidth / 2 + 120 },
    ]

    this.difficultyButtons = []

    difficulties.forEach(diff => {
      const isSelected = diff.name === currentDifficulty
      
      // Button background
      const button = new Graphics()
      button.rect(-50, -15, 100, 30)
      button.fill({ color: isSelected ? 0x4CAF50 : 0x333333 })
      button.stroke({ color: isSelected ? 0x66BB6A : 0x666666, width: 2 })
      button.x = diff.x
      button.y = 230
      button.eventMode = 'static'
      button.cursor = 'pointer'
      
      // Store difficulty name on button for click handling
      ;(button as any).difficultyName = diff.name
      
      this.difficultyButtons.push(button)
      this.container.addChild(button)

      // Button label
      const buttonStyle = new TextStyle({
        fontFamily: 'monospace',
        fontSize: 14,
        fontWeight: 'bold',
        fill: isSelected ? 0xffffff : 0xaaaaaa,
        align: 'center',
      })

      const buttonText = new Text({ text: diff.label, style: buttonStyle })
      buttonText.x = diff.x
      buttonText.y = 230
      buttonText.anchor.set(0.5, 0.5)
      this.container.addChild(buttonText)
    })
  }

  /**
   * Display leaderboard for selected difficulty.
   */
  private displayLeaderboard(difficulty: 'easy' | 'medium' | 'hard'): void {
    const titleStyle = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 16,
      fill: 0xffd700,
      align: 'center',
    })

    const title = new Text({ text: `🏆 Best Times (${difficulty.toUpperCase()}) 🏆`, style: titleStyle })
    title.x = this.canvasWidth / 2
    title.y = 290
    title.anchor.set(0.5, 0.5)
    this.container.addChild(title)

    const entries = Leaderboard.getTopTimes(difficulty)
    
    if (entries.length === 0) {
      const emptyStyle = new TextStyle({
        fontFamily: 'monospace',
        fontSize: 12,
        fill: 0x888888,
        align: 'center',
      })
      
      const emptyText = new Text({ text: 'No times yet - be the first!', style: emptyStyle })
      emptyText.x = this.canvasWidth / 2
      emptyText.y = 330
      emptyText.anchor.set(0.5, 0.5)
      this.container.addChild(emptyText)
    } else {
      const entryStyle = new TextStyle({
        fontFamily: 'monospace',
        fontSize: 12,
        fill: 0xffffff,
        align: 'left',
      })

      entries.slice(0, 5).forEach((entry, index) => {
        const minutes = Math.floor(entry.time / 60000)
        const seconds = Math.floor((entry.time % 60000) / 1000)
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`
        
        const entryText = new Text({ 
          text: `${index + 1}. ${timeStr}`, 
          style: entryStyle 
        })
        entryText.x = this.canvasWidth / 2 - 40
        entryText.y = 320 + (index * 20)
        entryText.anchor.set(0, 0.5)
        this.container.addChild(entryText)
      })
    }
  }

  /**
   * Get clicked difficulty button (if any).
   */
  getDifficultyButtonClick(x: number, y: number): 'easy' | 'medium' | 'hard' | null {
    for (const button of this.difficultyButtons) {
      const bounds = button.getBounds()
      if (x >= bounds.x && x <= bounds.x + bounds.width &&
          y >= bounds.y && y <= bounds.y + bounds.height) {
        return (button as any).difficultyName
      }
    }
    return null
  }

  /**
   * Get hovered difficulty button (if any) for visual feedback.
   */
  getDifficultyButtonHover(x: number, y: number): 'easy' | 'medium' | 'hard' | null {
    for (const button of this.difficultyButtons) {
      const bounds = button.getBounds()
      if (x >= bounds.x && x <= bounds.x + bounds.width &&
          y >= bounds.y && y <= bounds.y + bounds.height) {
        return (button as any).difficultyName
      }
    }
    return null
  }

  /**
   * Set difficulty button hover state (for visual feedback).
   */
  setDifficultyButtonHover(difficulty: 'easy' | 'medium' | 'hard' | null): void {
    for (const button of this.difficultyButtons) {
      const isHovered = (button as any).difficultyName === difficulty;
      button.scale.set(isHovered ? 1.1 : 1.0);
    }
  }

  /**
   * Set difficulty button pressed state (for click feedback).
   */
  setDifficultyButtonPressed(difficulty: 'easy' | 'medium' | 'hard' | null): void {
    for (const button of this.difficultyButtons) {
      const isPressed = (button as any).difficultyName === difficulty;
      button.scale.set(isPressed ? 0.95 : 1.0);
    }
  }

  /**
   * Clear all text elements.
   */
  private clearText(): void {
    // Remove and destroy all children except background
    while (this.container.children.length > 1) {
      const child = this.container.children[1]
      this.container.removeChild(child)
      child.destroy() // Properly destroy to prevent memory leaks and rendering artifacts
    }
    
    this.titleText = null
    this.messageText = null
    this.instructionText = null
    this.difficultyButtons = []
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
