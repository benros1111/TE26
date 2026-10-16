// Huvudloopen: läs tangenter -> uppdatera -> rita. Körs ca 60 gånger per sekund.
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const START_LIVES = 3;
const MUSIC_TEMPO = [140, 156, 172]; // musiken går snabbare på svårare banor

const keys = { left: false, right: false, jump: false };

const KEY_MAP = {
  ArrowLeft: "left", KeyA: "left",
  ArrowRight: "right", KeyD: "right",
  ArrowUp: "jump", KeyW: "jump", Space: "jump",
};

window.addEventListener("keydown", e => {
  startAudio();
  if (KEY_MAP[e.code]) { keys[KEY_MAP[e.code]] = true; e.preventDefault(); }
  if (e.code === "KeyR") newGame();
  if (e.code === "KeyM") pressMute();
  if ((state === "gameover" || state === "won") && (e.code === "Space" || e.code === "Enter")) newGame();
});
window.addEventListener("keyup", e => {
  if (KEY_MAP[e.code]) keys[KEY_MAP[e.code]] = false;
});

let levelIndex, level, player, camX, score, coinCount, lives, state, stateTimer, introTimer;

// Startar ljudet första gången spelaren trycker på något.
function startAudio() {
  const first = !audioCtx;
  unlockAudio();
  if (first && state === "playing") startMusic(MUSIC_TEMPO[levelIndex]);
}

function pressMute() {
  const isMuted = toggleMute();
  const button = document.getElementById("mute");
  if (button) button.textContent = isMuted ? "🔇" : "🔊";
}

function newGame() {
  levelIndex = 0;
  score = 0;
  coinCount = 0;
  lives = START_LIVES;
  startLevel();
}

function startLevel() {
  level = loadLevel(levelIndex);
  player = new Player(level.start.x, level.start.y);
  camX = 0;
  state = "playing"; // "playing", "dying", "levelclear", "gameover" eller "won"
  stateTimer = 0;
  introTimer = 120;
  clearEffects();
  startMusic(MUSIC_TEMPO[levelIndex]);
}

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function addScore(points, x, y) {
  score += points;
  addText(x, y, String(points));
}

function addCoin(x, y) {
  coinCount++;
  if (coinCount % 50 === 0) { lives++; addText(x, y - 20, "1UP!"); }
  sfx.coin();
}

function hurtPlayer() {
  if (player.invincible > 0) return;
  if (player.big) {
    player.shrink();
    sfx.hurt();
  } else {
    killPlayer();
  }
}

function killPlayer() {
  state = "dying";
  stateTimer = 150;
  player.vx = 0;
  player.vy = -11;
  player.invincible = 0;
  stopMusic();
  sfx.die();
}

// Spelaren slog huvudet i ett block
function hitBlock(col, row) {
  const ch = level.tiles[row][col];
  const x = col * TILE;
  const y = row * TILE;

  if (ch === "?") {
    level.tiles[row][col] = "X";
    level.bumps.push({ col, row, t: 10 });
    addCoinPop(x + 8, y - 20);
    addCoin(x, y);
    addScore(200, x + 4, y - 24);
  } else if (ch === "M") {
    level.tiles[row][col] = "X";
    level.bumps.push({ col, row, t: 10 });
    level.items.push(new Mushroom(x, y));
    sfx.appear();
  } else if (ch === "B") {
    if (player.big) {
      level.tiles[row][col] = ".";
      addParticles(x + 16, y + 16, "#c0572b", 10, 4);
      effects.shake = 6;
      score += 50;
      sfx.brick();
    } else {
      level.bumps.push({ col, row, t: 10 });
      sfx.bump();
    }
  } else {
    sfx.bump();
  }

  // Fiender som står på blocket flyger bort
  const top = { x, y: y - 6, w: TILE, h: 6 };
  for (const enemy of level.enemies) {
    if (enemy.alive && enemy.active && overlaps(enemy, top)) {
      enemy.flip();
      addScore(100, enemy.x, enemy.y);
    }
  }
}

function update() {
  updateEffects();
  if (introTimer > 0) introTimer--;
  for (const b of level.bumps) b.t--;
  level.bumps = level.bumps.filter(b => b.t > 0);

  if (state === "dying") {
    player.vy += GRAVITY;
    player.y += player.vy;
    if (--stateTimer <= 0) {
      lives--;
      if (lives > 0) startLevel();
      else state = "gameover";
    }
    return;
  }

  if (state === "levelclear") {
    if (--stateTimer <= 0) {
      levelIndex++;
      if (levelIndex < LEVELS.length) startLevel();
      else { state = "won"; stopMusic(); }
    }
    return;
  }

  if (state !== "playing") return;

  const result = player.update(keys, level);
  if (result.jumped) sfx.jump();
  if (result.head) hitBlock(result.head.col, result.head.row);

  // Mynt
  for (const coin of level.coins) {
    if (!coin.taken && overlaps(player, coin)) {
      coin.taken = true;
      score += 100;
      addCoin(coin.x, coin.y);
      addParticles(coin.x + 8, coin.y + 8, "#ffd700", 5, 2);
    }
  }

  // Svampar
  for (const item of level.items) {
    item.update(level);
    if (item.alive && item.emerge === 0 && overlaps(player, item)) {
      item.alive = false;
      player.grow();
      addScore(1000, item.x, item.y);
      sfx.powerup();
    }
  }
  level.items = level.items.filter(i => i.alive);

  // Taggar
  if (touchesSpikes(level, player)) {
    hurtPlayer();
    if (state === "playing" && player.vy >= 0) player.vy = -8;
  }

  // Fiender
  for (const enemy of level.enemies) {
    if (!enemy.active && enemy.x < camX + canvas.width + 64) enemy.activate();
    if (!enemy.active) continue;
    enemy.update(level);

    // Ett skal som åker slår ut andra fiender
    if (enemy.movingShell) {
      for (const other of level.enemies) {
        if (other !== enemy && other.alive && other.active && overlaps(enemy, other)) {
          other.flip();
          addScore(200, other.x, other.y);
          addParticles(other.x + 14, other.y + 14, "#fff", 6, 3);
          sfx.kick();
        }
      }
    }

    if (!enemy.alive || !overlaps(player, enemy)) continue;

    const fromAbove = player.vy > 0 && player.y + player.h - player.vy <= enemy.y + 12;

    if (enemy.type === "shell" && enemy.vx === 0) {
      // Stilla skal: sparka iväg det
      const dir = player.x + player.w / 2 < enemy.x + enemy.w / 2 ? 1 : -1;
      enemy.kick(dir);
      if (fromAbove) player.vy = -8;
      score += 100;
      sfx.kick();
    } else if (fromAbove) {
      enemy.stomp();
      player.vy = keys.jump ? -12 : -8;
      addScore(enemy.type === "shell" ? 100 : 200, enemy.x, enemy.y);
      addParticles(enemy.x + 14, enemy.y + 4, "#fff", 4, 2);
      sfx.stomp();
    } else if (enemy.type === "shell" && enemy.kickGrace > 0) {
      // Precis sparkat skal skadar inte
    } else {
      hurtPlayer();
    }
    if (state !== "playing") break;
  }
  level.enemies = level.enemies.filter(e => e.state !== "gone");

  // Ramla ner i ett hål
  if (state === "playing" && player.y > level.height) killPlayer();

  // Mål
  if (state === "playing" && level.goal && overlaps(player, level.goal)) {
    state = "levelclear";
    stateTimer = 180;
    const bonus = Math.max(100, Math.round((level.goal.y + level.goal.h - player.y) / 10) * 100);
    addScore(bonus, player.x, player.y - 20);
    addParticles(level.goal.x, player.y, "#2ecc40", 20, 5);
    stopMusic();
    sfx.clear();
  }

  // Kameran följer spelaren
  camX = player.x - canvas.width / 2 + player.w / 2;
  camX = Math.max(0, Math.min(level.width - canvas.width, camX));
}

// Bakgrund med moln och kullar som rör sig långsammare än banan (parallax)
function drawBackground() {
  ctx.fillStyle = level.sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const night = levelIndex === 2;

  if (night) {
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 137) - camX * 0.1) % (canvas.width + 20);
      ctx.fillRect((sx + canvas.width + 20) % (canvas.width + 20), (i * 53) % 200, 2, 2);
    }
  }

  ctx.fillStyle = night ? "#3b3f7a" : "#4caf50";
  for (let i = -1; i < 6; i++) {
    const hx = i * 300 - ((camX * 0.4) % 300);
    ctx.beginPath();
    ctx.ellipse(hx + 150, 384, 160, 110, 0, Math.PI, 0);
    ctx.fill();
  }

  ctx.fillStyle = night ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.9)";
  for (let i = -1; i < 5; i++) {
    const cx = i * 260 - ((camX * 0.2) % 260) + 60;
    const cy = 50 + (i % 2) * 40;
    ctx.fillRect(cx, cy, 70, 18);
    ctx.fillRect(cx + 14, cy - 12, 40, 14);
  }
}

function drawHud() {
  ctx.font = "bold 18px monospace";
  const text = `POÄNG ${String(score).padStart(6, "0")}   MYNT ×${coinCount}   BANA ${levelIndex + 1}   LIV ${lives}`;
  ctx.fillStyle = "#000";
  ctx.fillText(text, 17, 29);
  ctx.fillStyle = "#fff";
  ctx.fillText(text, 16, 28);
}

function drawCenterText(big, small) {
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = "bold 40px monospace";
  ctx.fillText(big, canvas.width / 2, canvas.height / 2);
  ctx.font = "20px monospace";
  if (small) ctx.fillText(small, canvas.width / 2, canvas.height / 2 + 40);
  ctx.textAlign = "left";
}

function draw() {
  ctx.save();
  if (effects.shake > 0) ctx.translate((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6);

  drawBackground();
  for (const item of level.items) item.draw(ctx, camX); // ritas före blocken så att svampen kommer upp ur dem
  drawLevel(ctx, level, camX);

  for (const coin of level.coins) {
    if (!coin.taken) drawCoin(ctx, coin.x - camX, coin.y, coin.w, coin.h);
  }

  if (level.goal) {
    const g = level.goal;
    ctx.fillStyle = "#ddd";
    ctx.fillRect(g.x - camX, g.y, 4, g.h);
    ctx.fillStyle = "#ffd700";
    ctx.beginPath(); ctx.arc(g.x - camX + 2, g.y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#2ecc40";
    const wave = Math.sin(Date.now() / 200) * 3;
    ctx.beginPath();
    ctx.moveTo(g.x - camX + 4, g.y + 8);
    ctx.lineTo(g.x - camX + 34, g.y + 18 + wave);
    ctx.lineTo(g.x - camX + 4, g.y + 30);
    ctx.fill();
  }

  for (const enemy of level.enemies) enemy.draw(ctx, camX);
  player.draw(ctx, camX);
  drawEffects(ctx, camX);
  ctx.restore();

  drawHud();

  if (introTimer > 0 && state === "playing") {
    ctx.globalAlpha = Math.min(1, introTimer / 30);
    ctx.textAlign = "center";
    ctx.font = "bold 32px monospace";
    ctx.fillStyle = "#000";
    ctx.fillText("BANA " + level.name, canvas.width / 2 + 2, 152);
    ctx.fillStyle = "#fff";
    ctx.fillText("BANA " + level.name, canvas.width / 2, 150);
    ctx.textAlign = "left";
    ctx.globalAlpha = 1;
  }

  if (state === "levelclear") drawCenterText("BANA KLAR!", levelIndex + 1 < LEVELS.length ? "Nästa bana kommer..." : "");
  if (state === "gameover") drawCenterText("GAME OVER", "Tryck R eller på skärmen för att spela igen");
  if (state === "won") drawCenterText("DU KLARADE ALLA BANOR!", `Poäng: ${score} · Tryck R eller på skärmen`);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

newGame();
loop();
