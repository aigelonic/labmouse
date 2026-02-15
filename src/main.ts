import './style.css'
import { Application, Container, Graphics, Text } from 'pixi.js'

async function initGame() {
  // Initialize PixiJS application
  const app = new Application()
  await app.init({ width: 800, height: 600, backgroundColor: 0x1a1a2e })

  document.body.appendChild(app.canvas)

  // Create a simple game scene
  const gameScene = new Container()
  app.stage.addChild(gameScene)

  // Placeholder: title text
  const title = new Text({
    text: 'labmouse',
    style: {
      fontSize: 48,
      fill: 0xffffff,
    },
  })
  title.x = 300
  title.y = 250
  gameScene.addChild(title)

  // Placeholder: simple grid for maze reference
  const grid = new Graphics()
  grid.stroke({ color: 0x444444, width: 1 })
  for (let i = 0; i <= 800; i += 50) {
    grid.moveTo(i, 0)
    grid.lineTo(i, 600)
  }
  for (let i = 0; i <= 600; i += 50) {
    grid.moveTo(0, i)
    grid.lineTo(800, i)
  }
  gameScene.addChild(grid)

  console.log('PixiJS game initialized')
}

initGame().catch(err => console.error('Failed to initialize game:', err))


