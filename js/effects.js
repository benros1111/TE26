// Effekter: partiklar, poäng som flyger upp, mynt som snurrar upp ur block och skakande skärm.
const effects = { particles: [], texts: [], coinPops: [], shake: 0 };

function clearEffects() {
  effects.particles = [];
  effects.texts = [];
  effects.coinPops = [];
  effects.shake = 0;
}

function addParticles(x, y, color, count, power = 4) {
  for (let i = 0; i < count; i++) {
    effects.particles.push({
      x, y,
      vx: (Math.random() - 0.5) * power * 2,
      vy: -Math.random() * power * 1.5 - 2,
      size: 4 + Math.random() * 6,
      color,
      life: 40,
    });
  }
}

function addText(x, y, text) {
  effects.texts.push({ x, y, text, life: 45 });
}

function addCoinPop(x, y) {
  effects.coinPops.push({ x, y, vy: -9, life: 28 });
}

function updateEffects() {
  for (const p of effects.particles) { p.vy += 0.5; p.x += p.vx; p.y += p.vy; p.life--; }
  for (const t of effects.texts) { t.y -= 1; t.life--; }
  for (const c of effects.coinPops) { c.vy += 0.6; c.y += c.vy; c.life--; }
  effects.particles = effects.particles.filter(p => p.life > 0);
  effects.texts = effects.texts.filter(t => t.life > 0);
  effects.coinPops = effects.coinPops.filter(c => c.life > 0);
  if (effects.shake > 0) effects.shake--;
}

function drawCoin(ctx, x, y, w, h) {
  // Myntet "snurrar" genom att bli smalare och bredare
  const spin = Math.abs(Math.sin(Date.now() / 150));
  const cw = Math.max(3, w * spin);
  ctx.fillStyle = "#ffd700";
  ctx.fillRect(x + (w - cw) / 2, y, cw, h);
  ctx.fillStyle = "#b8860b";
  ctx.fillRect(x + (w - cw) / 2 + cw / 2 - 1, y + 4, 2, h - 8);
}

function drawEffects(ctx, camX) {
  for (const c of effects.coinPops) drawCoin(ctx, c.x - camX, c.y, 16, 20);
  for (const p of effects.particles) {
    ctx.globalAlpha = Math.min(1, p.life / 20);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - camX, p.y, p.size, p.size);
  }
  ctx.globalAlpha = 1;
  ctx.font = "bold 16px monospace";
  for (const t of effects.texts) {
    ctx.globalAlpha = Math.min(1, t.life / 20);
    ctx.fillStyle = "#000";
    ctx.fillText(t.text, t.x - camX + 1, t.y + 1);
    ctx.fillStyle = "#fff";
    ctx.fillText(t.text, t.x - camX, t.y);
  }
  ctx.globalAlpha = 1;
}
