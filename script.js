// === CONFIGURAÇÃO INICIAL ===
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameStarted = false;
let gameOverState = false;

// Gato (personagem)
let cat = {
  x: 80,
  y: canvas.height / 2,
  width: 40,
  height: 40,
  velocity: 0
};

// Física
let gravity = 0.5;
let jump = -8;

// Obstáculos e fantasmas
let obstacles = [];
let ghosts = [];
let frame = 0;
let score = 0;

// Carregar imagem de "Game Over" (gato fantasma)
const gameOverImg = new Image();
gameOverImg.src = "gato_gameover.png"; // coloque sua imagem na mesma pasta

// === CONTROLES ===
document.addEventListener('keydown', e => {
  if (e.code === 'Space') startOrJump();
});
document.addEventListener('click', startOrJump);

function startOrJump() {
  // Reiniciar após o Game Over
  if (gameOverState) {
    location.reload();
    return;
  }

  // Iniciar o jogo
  if (!gameStarted) {
    document.body.classList.add('game-started');
    gameStarted = true;
    requestAnimationFrame(update);
  }

  // Fazer o gato pular
  cat.velocity = jump;
}

// === LOOP PRINCIPAL ===
function update() {
  frame++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Fundo (leve névoa)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Atualizar o gato
  cat.velocity += gravity;
  cat.y += cat.velocity;

  drawCat(cat.x, cat.y);

  // === CRIAÇÃO DE OBSTÁCULOS ===
  if (frame % 90 === 0) {
    let gap = 140;
    let topHeight = Math.random() * (canvas.height - gap - 100) + 50;

    obstacles.push({
      x: canvas.width,
      y: 0,
      width: 60,
      height: topHeight
    });

    obstacles.push({
      x: canvas.width,
      y: topHeight + gap,
      width: 60,
      height: canvas.height - topHeight - gap
    });
  }

  // === CRIAÇÃO DE FANTASMAS ===
  if (frame % 200 === 0) {
    ghosts.push({
      x: canvas.width,
      y: Math.random() * (canvas.height - 100),
      width: 40,
      height: 40,
      speed: 6
    });
  }

  // === DESENHAR E MOVER OBSTÁCULOS ===
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let o = obstacles[i];
    o.x -= 3;

    // Mãos de zumbi (verdes)
    ctx.fillStyle = '#7eff7e';
    ctx.fillRect(o.x, o.y, o.width, o.height);
    ctx.strokeStyle = '#004400';
    ctx.strokeRect(o.x, o.y, o.width, o.height);

    // Colisão
    if (checkCollision(cat, o)) {
      gameOver();
      return;
    }

    // Remover obstáculos antigos
    if (o.x + o.width < 0) obstacles.splice(i, 1);
  }

  // === DESENHAR E MOVER FANTASMAS ===
  for (let i = ghosts.length - 1; i >= 0; i--) {
    let g = ghosts[i];
    g.x -= g.speed;
    drawGhost(g.x, g.y);

    if (checkCollision(cat, g)) {
      gameOver();
      return;
    }

    if (g.x + g.width < 0) ghosts.splice(i, 1);
  }

  // === PONTUAÇÃO ===
  score++;
  ctx.fillStyle = '#fff';
  ctx.font = '20px "Press Start 2P"';
  ctx.fillText(`Pontos: ${Math.floor(score / 10)}`, 20, 30);

  // Verifica se o gato caiu fora da tela
  if (cat.y + cat.height > canvas.height || cat.y < 0) {
    gameOver();
    return;
  }

  // Continua o loop
  requestAnimationFrame(update);
}

// === DESENHAR O GATO ===
function drawCat(x, y) {
  ctx.fillStyle = '#fff';
  ctx.fillRect(x, y, cat.width, cat.height);
  ctx.fillStyle = '#000';
  ctx.fillRect(x + 10, y + 10, 8, 8); // Olho
}

// === DESENHAR FANTASMAS ===
function drawGhost(x, y) {
  ctx.beginPath();
  ctx.arc(x + 20, y + 20, 20, Math.PI, 0);
  ctx.lineTo(x + 40, y + 40);
  ctx.lineTo(x, y + 40);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.fillRect(x + 10, y + 15, 5, 5);
  ctx.fillRect(x + 25, y + 15, 5, 5);
}

// === DETECÇÃO DE COLISÃO ===
function checkCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// === GAME OVER ===
function gameOver() {
  gameOverState = true;

  // Escurecer a tela
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Mostrar imagem do gato fantasma
  const imgSize = 100;
  ctx.drawImage(
    gameOverImg,
    canvas.width / 2 - imgSize / 2,
    canvas.height / 2 - imgSize / 2 - 40,
    imgSize,
    imgSize
  );

  // Texto "Game Over"
  ctx.fillStyle = '#ff3333';
  ctx.font = '22px "Press Start 2P"';
  ctx.fillText('GAME OVER', canvas.width / 2 - 110, canvas.height / 2 + 60);

  // Instruções para reiniciar
  ctx.fillStyle = '#fff';
  ctx.font = '12px "Press Start 2P"';
  ctx.fillText(
    'Pressione ESPAÇO para reiniciar',
    25,
    canvas.height / 2 + 100
  );
}

