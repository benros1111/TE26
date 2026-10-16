// Huvudloopen: läs tangenter -> uppdatera -> rita. Körs ca 60 gånger per sekund.
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const keys = { left: false, right: false, jump: false };

const KEY_MAP = {
  ArrowLeft: "left", KeyA: "left",
  ArrowRight: "right", KeyD: "right",
  ArrowUp: "jump", KeyW: "jump", Space: "jump",
};

window.addEventListener("keydown", e => {
  if (KEY_MAP[e.code]) { keys[KEY_MAP[e.code]] = true; e.preventDefault(); }
  if (e.code === "KeyR") reset();
});
window.addEventListener("keyup", e => {
  if (KEY_MAP[e.code]) keys[KEY_MAP[e.code]] = false;
});

let level, player, camX, score, state;

function reset() {
  level = loadLevel();
  player = new Player(level.start.x, level.start.y);
  camX = 0;
  score = 0;
  state = "playing"; // "playing", "dead" eller "won"
}

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function update() {
  if (state !== "playing") return;

  player.update(keys, level);

  // Mynt
  for (const coin of level.coins) {
    if (!coin.taken && overlaps(player, coin)) { coin.taken = true; score += 100; }
  }

  // Fiender: hoppa på dem uppifrån, annars dör du
  for (const enemy of level.enemies) {
    enemy.update(level);
    if (!enemy.alive || !overlaps(player, enemy)) continue;
    if (player.vy > 0 && player.y + player.h - enemy.y < 14) {
      enemy.alive = false;
      player.vy = -8;
      score += 200;
    } else {
      state = "dead";
    }
  }

  // Ramla ner i ett hål
  if (player.y > level.height) state = "dead";

  // Mål
  if (level.goal && overlaps(player, level.goal)) state = "won";

  // Kameran följer spelaren
  camX = player.x - canvas.width / 2 + player.w / 2;
  camX = Math.max(0, Math.min(level.width - canvas.width, camX));
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawLevel(ctx, level, camX);

  ctx.fillStyle = "#ffd700";
  for (const coin of level.coins) {
    if (!coin.taken) ctx.fillRect(coin.x - camX, coin.y, coin.w, coin.h);
  }

  if (level.goal) {
    ctx.fillStyle = "#fff";
    ctx.fillRect(level.goal.x - camX, level.goal.y, 4, level.goal.h);
    ctx.fillStyle = "#2ecc40";
    ctx.fillRect(level.goal.x - camX + 4, level.goal.y, 24, 16);
  }

  for (const enemy of level.enemies) enemy.draw(ctx, camX);
  player.draw(ctx, camX);

  ctx.fillStyle = "#000";
  ctx.font = "bold 20px monospace";
  ctx.fillText("POÄNG: " + score, 16, 28);

  if (state !== "playing") {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 40px monospace";
    ctx.textAlign = "center";
    ctx.fillText(state === "won" ? "DU VANN!" : "GAME OVER", canvas.width / 2, canvas.height / 2);
    ctx.font = "20px monospace";
    ctx.fillText("Tryck R för att spela igen", canvas.width / 2, canvas.height / 2 + 40);
    ctx.textAlign = "left";
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

reset();
loop();
