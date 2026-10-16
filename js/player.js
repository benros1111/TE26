// Spelaren. Prova att ändra siffrorna nedan och se vad som händer!
const GRAVITY = 0.6;
const MOVE_SPEED = 0.6;    // hur snabbt spelaren accelererar
const MAX_SPEED = 5;
const FRICTION = 0.8;      // 1 = ingen friktion, 0 = stannar direkt
const JUMP_POWER = 13.5;
const COYOTE_FRAMES = 6;   // man kan hoppa en liten stund efter att man gått över en kant
const JUMP_BUFFER = 6;     // trycker man hopp lite för tidigt räknas det ändå
const SMALL_H = 30;
const BIG_H = 58;

class Player {
  constructor(x, y) {
    this.w = 24;
    this.h = SMALL_H;
    this.x = x + 4;
    this.y = y + TILE - this.h;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.facing = 1;
    this.big = false;
    this.invincible = 0;   // blinkar och kan inte skadas när > 0
    this.coyote = 0;
    this.jumpBuffer = 0;
    this.jumpWasDown = false;
    this.growTimer = 0;
  }

  grow() {
    if (this.big) return;
    this.big = true;
    this.y -= BIG_H - SMALL_H;
    this.h = BIG_H;
    this.growTimer = 30;
  }

  shrink() {
    this.big = false;
    this.y += BIG_H - SMALL_H;
    this.h = SMALL_H;
    this.invincible = 120;
    this.growTimer = 30;
  }

  // Returnerar { jumped, head } där head är blocket man slog huvudet i.
  update(keys, level) {
    if (keys.left) { this.vx -= MOVE_SPEED; this.facing = -1; }
    if (keys.right) { this.vx += MOVE_SPEED; this.facing = 1; }
    if (!keys.left && !keys.right) this.vx *= FRICTION;
    this.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, this.vx));

    // Hopp: man måste släppa knappen mellan hoppen
    const pressed = keys.jump && !this.jumpWasDown;
    this.jumpWasDown = keys.jump;
    if (pressed) this.jumpBuffer = JUMP_BUFFER;
    else if (this.jumpBuffer > 0) this.jumpBuffer--;

    if (this.onGround) this.coyote = COYOTE_FRAMES;
    else if (this.coyote > 0) this.coyote--;

    let jumped = false;
    if (this.jumpBuffer > 0 && this.coyote > 0) {
      this.vy = -JUMP_POWER - Math.abs(this.vx) * 0.15; // springer man hoppar man lite högre
      this.jumpBuffer = 0;
      this.coyote = 0;
      jumped = true;
    }

    // Släpper man hoppknappen tidigt blir hoppet kortare
    if (!keys.jump && this.vy < -4) this.vy = -4;

    this.vy += GRAVITY;
    if (this.vy > 15) this.vy = 15;
    if (this.invincible > 0) this.invincible--;
    if (this.growTimer > 0) this.growTimer--;

    const head = moveAndCollide(this, level);
    return { jumped, head };
  }

  draw(ctx, camX) {
    // Blinka när man inte kan skadas
    if (this.invincible > 0 && Math.floor(this.invincible / 4) % 2 === 0) return;
    // Blinka mellan stor och liten när man växer/krymper
    let h = this.h;
    if (this.growTimer > 0 && Math.floor(this.growTimer / 5) % 2 === 0) h = this.big ? SMALL_H : BIG_H;

    const x = this.x - camX;
    const y = this.y + this.h - h;
    const u = h / 30; // skala

    ctx.fillStyle = "#e52521";                         // keps
    ctx.fillRect(x, y, this.w, 8 * u);
    ctx.fillRect(x + (this.facing > 0 ? 12 : -4), y + 5 * u, 16, 3 * u);
    ctx.fillStyle = "#ffcc99";                         // ansikte
    ctx.fillRect(x + 4, y + 8 * u, 16, 7 * u);
    ctx.fillStyle = "#000";                            // öga
    ctx.fillRect(x + (this.facing > 0 ? 15 : 6), y + 9 * u, 3, 3);
    ctx.fillStyle = "#e52521";                         // tröja
    ctx.fillRect(x + 2, y + 15 * u, this.w - 4, 5 * u);
    ctx.fillStyle = "#1c4fd8";                         // byxor
    ctx.fillRect(x, y + 19 * u, this.w, 8 * u);
    ctx.fillStyle = "#5a2a10";                         // skor
    const step = this.onGround && Math.abs(this.vx) > 0.5 ? Math.floor(Date.now() / 100) % 2 * 3 : 0;
    ctx.fillRect(x - step, y + 27 * u, 10, 3 * u);
    ctx.fillRect(x + this.w - 10 + step, y + 27 * u, 10, 3 * u);
  }
}
