// Elementos do DOM
const startScreen = document.getElementById("startScreen")
const gameScreen = document.getElementById("gameScreen")
const gameOverScreen = document.getElementById("gameOverScreen")
const startButton = document.getElementById("startButton")
const restartButton = document.getElementById("restartButton")
const playerCat = document.getElementById("playerCat")
const obstaclesContainer = document.getElementById("obstacles")
const ghostsContainer = document.getElementById("ghosts")
const scoreElement = document.getElementById("score")
const finalScoreElement = document.getElementById("finalScore")

// Variáveis do jogo
let gameLoop
let obstacleLoop
let ghostLoop
let isGameRunning = false
let score = 0
let catY = 250
let catVelocity = 0
const gravity = 0.6
const jumpStrength = -10
const catX = 100

// Arrays para armazenar obstáculos e fantasmas
let obstacles = []
let ghosts = []

// Iniciar o jogo
startButton.addEventListener("click", startGame)
restartButton.addEventListener("click", restartGame)

// Controles
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && isGameRunning) {
    e.preventDefault()
    jump()
  }
})

document.addEventListener("click", (e) => {
  if (isGameRunning && !e.target.closest("button")) {
    jump()
  }
})

function startGame() {
  // Esconder tela inicial e mostrar jogo
  startScreen.classList.add("hidden")
  gameScreen.classList.add("active")

  // Resetar variáveis
  score = 0
  catY = 250
  catVelocity = 0
  obstacles = []
  ghosts = []
  obstaclesContainer.innerHTML = ""
  ghostsContainer.innerHTML = ""
  scoreElement.textContent = score

  isGameRunning = true

  // Iniciar loops do jogo
  gameLoop = setInterval(updateGame, 1000 / 60) // 60 FPS
  obstacleLoop = setInterval(createObstacle, 2000) // Novo obstáculo a cada 2s
  ghostLoop = setInterval(createGhost, 3500) // Novo fantasma a cada 3.5s
}

function jump() {
  catVelocity = jumpStrength
}

function updateGame() {
  // Atualizar física do gato
  catVelocity += gravity
  catY += catVelocity

  // Limitar posição do gato
  if (catY < 0) {
    catY = 0
    catVelocity = 0
  }

  if (catY > window.innerHeight - 130) {
    // 80px do chão + 50px do gato
    gameOver()
    return
  }

  // Atualizar posição visual do gato
  playerCat.style.top = catY + "px"

  // Rotação do gato baseada na velocidade
  const rotation = Math.min(Math.max(catVelocity * 3, -30), 30)
  playerCat.style.transform = `rotate(${rotation}deg)`

  // Atualizar obstáculos
  updateObstacles()

  // Atualizar fantasmas
  updateGhosts()
}

function createObstacle() {
  if (!isGameRunning) return

  const obstacle = document.createElement("div")
  obstacle.className = "obstacle"

  const gap = 180 // Espaço entre as mãos
  const minHeight = 100
  const maxHeight = window.innerHeight - gap - 180 // 80px do chão + 100px mínimo
  const topHeight = Math.random() * (maxHeight - minHeight) + minHeight

  obstacle.innerHTML = `
    <div class="zombie-hand top" style="height: ${topHeight}px;">
      <img src="/images/mao.png" alt="Mão de zumbi">
    </div>
    <div class="zombie-hand bottom" style="height: ${window.innerHeight - topHeight - gap - 80}px; top: ${topHeight + gap}px;">
      <img src="/images/mao.png" alt="Mão de zumbi" style="transform: rotate(180deg);">
    </div>
  `

  obstacle.style.right = "-80px"
  obstaclesContainer.appendChild(obstacle)

  obstacles.push({
    element: obstacle,
    x: window.innerWidth,
    scored: false,
    topHeight: topHeight,
    gap: gap,
  })
}

function updateObstacles() {
  obstacles.forEach((obstacle, index) => {
    obstacle.x -= 3 // Velocidade do obstáculo
    obstacle.element.style.right = window.innerWidth - obstacle.x + "px"

    // Verificar pontuação
    if (!obstacle.scored && obstacle.x < catX) {
      obstacle.scored = true
      score++
      scoreElement.textContent = score
    }

    // Verificar colisão
    if (checkCollisionWithObstacle(obstacle)) {
      gameOver()
    }

    // Remover obstáculos fora da tela
    if (obstacle.x < -80) {
      obstacle.element.remove()
      obstacles.splice(index, 1)
    }
  })
}

function createGhost() {
  if (!isGameRunning) return

  const ghost = document.createElement("div")
  ghost.className = "ghost"
  ghost.innerHTML = '<div class="ghost-body"><img src="/images/fantasma.png" alt="Fantasma"></div>'

  const ghostY = Math.random() * (window.innerHeight - 200) + 50
  ghost.style.top = ghostY + "px"
  ghost.style.right = "-40px"

  ghostsContainer.appendChild(ghost)

  ghosts.push({
    element: ghost,
    x: window.innerWidth,
    y: ghostY,
  })
}

function updateGhosts() {
  ghosts.forEach((ghost, index) => {
    ghost.x -= 8 // Fantasmas são mais rápidos
    ghost.element.style.right = window.innerWidth - ghost.x + "px"

    // Verificar colisão
    if (checkCollisionWithGhost(ghost)) {
      gameOver()
    }

    // Remover fantasmas fora da tela
    if (ghost.x < -40) {
      ghost.element.remove()
      ghosts.splice(index, 1)
    }
  })
}

function checkCollisionWithObstacle(obstacle) {
  const catLeft = catX
  const catRight = catX + 50
  const catTop = catY
  const catBottom = catY + 50

  const obstacleLeft = obstacle.x
  const obstacleRight = obstacle.x + 80

  // Verificar se o gato está na área horizontal do obstáculo
  if (catRight > obstacleLeft && catLeft < obstacleRight) {
    // Verificar colisão com a mão de cima
    if (catTop < obstacle.topHeight) {
      return true
    }
    // Verificar colisão com a mão de baixo
    if (catBottom > obstacle.topHeight + obstacle.gap) {
      return true
    }
  }

  return false
}

function checkCollisionWithGhost(ghost) {
  const catLeft = catX
  const catRight = catX + 50
  const catTop = catY
  const catBottom = catY + 50

  const ghostLeft = ghost.x
  const ghostRight = ghost.x + 40
  const ghostTop = ghost.y
  const ghostBottom = ghost.y + 50

  return catRight > ghostLeft && catLeft < ghostRight && catBottom > ghostTop && catTop < ghostBottom
}

function gameOver() {
  isGameRunning = false

  // Parar todos os loops
  clearInterval(gameLoop)
  clearInterval(obstacleLoop)
  clearInterval(ghostLoop)

  // Mostrar tela de game over
  finalScoreElement.textContent = score
  gameOverScreen.classList.add("active")
}

function restartGame() {
  // Esconder tela de game over
  gameOverScreen.classList.remove("active")

  // Reiniciar o jogo
  startGame()
}
