import './style.css'
import { Game } from './game/Game'

/**
 * Initialize and start the game
 */
async function initGame(): Promise<void> {
  const canvas = document.querySelector('canvas')
  if (!canvas) {
    console.error('Canvas element not found')
    return
  }

  // Create game instance
  const game = new Game(canvas as HTMLCanvasElement)

  // Initialize renderer asynchronously
  await game.init()

  // Start the game loop
  game.start()

  console.log('🐭 Labmouse game started!')
  console.log('Move with WASD or arrow keys')
  console.log('On mobile, tap the direction you want to move')
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame)
} else {
  initGame().catch(console.error)
}


