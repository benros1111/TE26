// Spelaren. Prova att ändra siffrorna nedan och se vad som händer!
const GRAVITY = 0.6;
const MOVE_SPEED = 0.6;   // hur snabbt spelaren accelererar
const MAX_SPEED = 5;
const FRICTION = 0.8;     // 1 = ingen friktion, 0 = stannar direkt
const JUMP_POWER = 13;

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 24;
    this.h = 30;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.facing = 1;
  }

  update(keys, level) {
    if (keys.left) { this.vx -= MOVE_SPEED; this.facing = -1; }
    if (keys.right) { this.vx += MOVE_SPEED; this.facing = 1; }
    if (!keys.left && !keys.right) this.vx *= FRICTION;
    this.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, this.vx));

    if (keys.jump && this.onGround) this.vy = -JUMP_POWER;

    this.vy += GRAVITY;
    if (this.vy > 15) this.vy = 15;

    moveAndCollide(this, level);
  }

  draw(ctx, camX) {
    const x = this.x - camX;
    ctx.fillStyle = "#e52521";          // keps och tröja
    ctx.fillRect(x, this.y, this.w, 10);
    ctx.fillStyle = "#ffcc99";          // ansikte
    ctx.fillRect(x + 4, this.y + 8, 16, 8);
    ctx.fillStyle = "#1c4fd8";          // byxor
    ctx.fillRect(x, this.y + 16, this.w, 14);
    ctx.fillStyle = "#000";             // öga
    ctx.fillRect(x + (this.facing > 0 ? 15 : 6), this.y + 10, 3, 3);
  }
}
