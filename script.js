// === CONFIGURAÇÕES DO CANVAS ===
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// === VARIÁVEIS DO JOGO ===
let gameStarted = false;
let gameOverState = false;

let gravity = 0.5;
let jumpForce = -8;
let score = 0;
let frame = 0;

// === IMAGENS ===
const imagesToLoad = {
  imgBackground: "cenario.png",
  imgCat: "gato.png",
  imgCatDead: "gato2.png",
  imgZombieHand: "mao.png",
  imgGhost: "fantasma.png",
  imgTomb: "tumulo.png",
};

const imgs = {};

function carregarImagens(imagens) {
  const promises = [];

  for (const key in imagens) {
    promises.push(
      new Promise((resolve, reject) => {
        imgs[key] = new Image();
        imgs[key].src = imagens[key];
        imgs[key].onload = () => resolve();
        imgs[key].onerror = () =>
          reject(new Error(`Erro ao carregar imagem: ${imagens[key]}`));
      })
    );
  }

  return Promise.all(promises);
}

// === TÚMULO ===
const tombY = canvas.height - 100;

// === PERSONAGEM ===
const cat = {
  x: 80,
  y: tombY,
  width: 60,
  height: 60,
  velocity: 0,
  alive: true,
};

// === ARRAYS DE OBJETOS ===
let obstacles = [];
let ghosts = [];

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
    document.body.classList.add("game-started"); // mostrar canvas se tiver CSS relacionado
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
  drawTomb();

  // === GATO SAINDO DO TÚMULO ===
  if (gameStarted && cat.y > canvas.height / 2) {
    cat.y -= 4; // sobe suavemente
  } else {
    cat.velocity += gravity;
    cat.y += cat.velocity;
  }

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
  if (gameStarted && cat.y <= canvas.height / 2) score++;
  ctx.fillStyle = "#fff";
  ctx.font = '18px "Press Start 2P", cursive, monospace';
  ctx.fillText(`Pontos: ${Math.floor(score / 10)}`, 20, 30);

  // === VERIFICAR LIMITES ===
  if (cat.y + cat.height > canvas.height || cat.y < 0) {
    gameOver();
    return;
  }

  if (!gameOverState) requestAnimationFrame(update);
}

// === FUNÇÕES DE DESENHO ===
function drawBackground() {
  const bgWidth = canvas.width;
  const offset = (frame * 2) % bgWidth;
  ctx.drawImage(imgs.imgBackground, -offset, 0, bgWidth, canvas.height);
  ctx.drawImage(imgs.imgBackground, bgWidth - offset, 0, bgWidth, canvas.height);
}

function drawTomb() {
  ctx.drawImage(imgs.imgTomb, cat.x - 10, tombY + 30, 80, 50);
}

function drawCat() {
  if (!cat.alive) return;
  ctx.drawImage(imgs.imgCat, cat.x, cat.y, cat.width, cat.height);
}

function drawZombieHand(x, y, w, h) {
  ctx.drawImage(imgs.imgZombieHand, x, y, w, h);
}

function drawGhost(x, y, w, h) {
  ctx.drawImage(imgs.imgGhost, x, y, w, h);
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
    imgs.imgCatDead,
    canvas.width / 2 - imgSize / 2,
    canvas.height / 2 - imgSize / 2 - 40,
    imgSize,
    imgSize
  );

  ctx.fillStyle = "#ff3333";
  ctx.font = '22px "Press Start 2P", cursive, monospace';
  ctx.fillText("GAME OVER", canvas.width / 2 - 110, canvas.height / 2 + 70);

  ctx.fillStyle = "#fff";
  ctx.font = '12px "Press Start 2P", cursive, monospace';
  ctx.fillText("Pressione ESPAÇO para reiniciar", 40, canvas.height / 2 + 110);
}

// === INICIALIZAÇÃO ===
carregarImagens(imagesToLoad)
  .then(() => {
    console.log("Todas as imagens carregadas com sucesso.");
    // Opcional: desenhar tela inicial ou aguardar input
  })
  .catch((erro) => {
    console.error(erro);
    ctx.fillStyle = "red";
    ctx.font = "24px Arial";
    ctx.fillText("Erro ao carregar imagens. Atualize a página.", 20, canvas.height / 2);
  });
