// Svampen som kommer ur M-block. Tar man den blir man stor.
class Mushroom {
  constructor(x, y) {
    this.w = 28;
    this.h = 28;
    this.x = x + 2;
    this.y = y + 4;      // börjar inne i blocket ...
    this.emerge = TILE;  // ... och glider upp ur det
    this.vx = 0;
    this.vy = 0;
    this.alive = true;
  }

  update(level) {
    if (this.emerge > 0) {
      this.y -= 1;
      if (--this.emerge === 0) this.vx = 2;
      return;
    }
    this.vy += GRAVITY;
    const speed = this.vx;
    moveAndCollide(this, level);
    if (this.hitWall) this.vx = -speed;
    if (this.y > level.height) this.alive = false;
  }

  draw(ctx, camX) {
    const x = this.x - camX;
    const y = this.y;
    ctx.fillStyle = "#f5deb3";                 // fot
    ctx.fillRect(x + 6, y + 14, 16, 14);
    ctx.fillStyle = "#000";
    ctx.fillRect(x + 9, y + 17, 3, 5);
    ctx.fillRect(x + 16, y + 17, 3, 5);
    ctx.fillStyle = "#e52521";                 // hatt
    ctx.beginPath();
    ctx.ellipse(x + 14, y + 14, 14, 13, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = "#fff";                    // prickar
    ctx.fillRect(x + 4, y + 7, 6, 5);
    ctx.fillRect(x + 18, y + 7, 6, 5);
    ctx.fillRect(x + 11, y + 2, 6, 4);
  }
}
