// === CONFIGURAÇÕES DO CANVAS ===
const canvas = document.createElement("canvas");
canvas.width = 480;
canvas.height = 640;
canvas.id = "gameCanvas";
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");

// === VARIÁVEIS DO JOGO ===
let gameStarted = false;
let gameOverState = false;

let gravity = 0.5;
let jumpForce = -8;
let score = 0;
let frame = 0;

// === IMAGENS ===
const imgBackground = new Image();
imgBackground.src = "cenario.png";

const imgCat = new Image();
imgCat.src = "gato.png";

const imgCatDead = new Image();
imgCatDead.src = "gato2.png";

const imgZombieHand = new Image();
imgZombieHand.src = "mao.png";

const imgGhost = new Image();
imgGhost.src = "fantasma.png";

// === PERSONAGEM ===
const cat = {
  x: 80,
  y: canvas.height / 2,
  width: 60,
  height: 60,
  velocity: 0,
  alive: true,
};

// === ARRAYS DE OBJETOS ===
let obstacles = []; // mãos de zumbi
let ghosts = []; // fantasmas

// === EVENTOS DE CONTROLE ===
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") startOrJump();
});
document.addEventListener("click", startOrJump);

function startOrJump() {
  if (gameOverState) {
    location.reload();
    return;
  }
  if (!gameStarted) {
    document.querySelector(".start-screen").style.display = "none";
    gameStarted = true;
    requestAnimationFrame(update);
  }
  cat.velocity = jumpForce;
}

// === LOOP PRINCIPAL ===
function update() {
  frame++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();

  // === FÍSICA DO GATO ===
  cat.velocity += gravity;
  cat.y += cat.velocity;
  drawCat();

  // === GERAR OBSTÁCULOS ===
  if (frame % 100 === 0) {
    let gap = 150;
    let topHeight = Math.random() * (canvas.height - gap - 120) + 60;
    obstacles.push({ x: canvas.width, y: 0, width: 70, height: topHeight });
    obstacles.push({
      x: canvas.width,
      y: topHeight + gap,
      width: 70,
      height: canvas.height - topHeight - gap,
    });
  }

  // === GERAR FANTASMAS ===
  if (frame % 200 === 0) {
    ghosts.push({
      x: canvas.width,
      y: Math.random() * (canvas.height - 100),
      width: 50,
      height: 50,
      speed: 6 + Math.random() * 2,
    });
  }

  // === ATUALIZAR E DESENHAR OBSTÁCULOS ===
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    o.x -= 3;
    drawZombieHand(o.x, o.y, o.width, o.height);
    if (checkCollision(cat, o)) return gameOver();
    if (o.x + o.width < 0) obstacles.splice(i, 1);
  }

  // === ATUALIZAR E DESENHAR FANTASMAS ===
  for (let i = ghosts.length - 1; i >= 0; i--) {
    const g = ghosts[i];
    g.x -= g.speed;
    drawGhost(g.x, g.y, g.width, g.height);
    if (checkCollision(cat, g)) return gameOver();
    if (g.x + g.width < 0) ghosts.splice(i, 1);
  }

  // === PONTUAÇÃO ===
  score++;
  ctx.fillStyle = "#fff";
  ctx.font = '18px "Press Start 2P"';
  ctx.fillText(`Pontos: ${Math.floor(score / 10)}`, 20, 30);

  // === VERIFICAR LIMITES ===
  if (cat.y + cat.height > canvas.height || cat.y < 0) {
    gameOver();
    return;
  }

  if (!gameOverState) requestAnimationFrame(update);
}

// === DESENHAR FUNDO COM MOVIMENTO ===
function drawBackground() {
  const bgWidth = canvas.width;
  const offset = (frame * 2) % bgWidth;
  ctx.drawImage(imgBackground, -offset, 0, bgWidth, canvas.height);
  ctx.drawImage(imgBackground, bgWidth - offset, 0, bgWidth, canvas.height);
}

// === DESENHAR O GATO ===
function drawCat() {
  if (!cat.alive) return;
  ctx.drawImage(imgCat, cat.x, cat.y, cat.width, cat.height);
}

// === DESENHAR MÃO DE ZUMBI ===
function drawZombieHand(x, y, w, h) {
  ctx.drawImage(imgZombieHand, x, y, w, h);
}

// === DESENHAR FANTASMA ===
function drawGhost(x, y, w, h) {
  ctx.drawImage(imgGhost, x, y, w, h);
}

// === COLISÃO ===
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
  cat.alive = false;
  gameOverState = true;

  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const imgSize = 130;
  ctx.drawImage(
    imgCatDead,
    canvas.width / 2 - imgSize / 2,
    canvas.height / 2 - imgSize / 2 - 40,
    imgSize,
    imgSize
  );

  ctx.fillStyle = "#ff3333";
  ctx.font = '22px "Press Start 2P"';
  ctx.fillText("GAME OVER", canvas.width / 2 - 110, canvas.height / 2 + 70);

  ctx.fillStyle = "#fff";
  ctx.font = '12px "Press Start 2P"';
  ctx.fillText(
    "Pressione ESPAÇO para reiniciar",
    40,
    canvas.height / 2 + 110
  );
}

