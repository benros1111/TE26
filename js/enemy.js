// En enkel fiende som går fram och tillbaka.
class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 28;
    this.h = 28;
    this.vx = -1.2;
    this.vy = 0;
    this.alive = true;
    this.onGround = false;
  }

  update(level) {
    if (!this.alive) return;
    this.vy += GRAVITY;
    const speed = this.vx;
    this.hitWall = false;
    moveAndCollide(this, level);
    if (this.hitWall) this.vx = -speed; // vänd vid vägg
  }

  draw(ctx, camX) {
    if (!this.alive) return;
    const x = this.x - camX;
    ctx.fillStyle = "#8b5a2b";
    ctx.fillRect(x, this.y, this.w, this.h - 6);
    ctx.fillStyle = "#000";
    ctx.fillRect(x + 2, this.y + this.h - 6, 10, 6);
    ctx.fillRect(x + this.w - 12, this.y + this.h - 6, 10, 6);
    ctx.fillStyle = "#fff";
    ctx.fillRect(x + 6, this.y + 6, 6, 6);
    ctx.fillRect(x + this.w - 12, this.y + 6, 6, 6);
  }
}
