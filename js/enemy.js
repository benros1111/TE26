// Fiender.
//   E = går fram och tillbaka
//   K = sköldpadda. Hoppa på den så blir den ett skal. Spring in i skalet så sparkar du iväg det!
//   J = hoppar hela tiden
//   S = skal som redan åker fort
const ENEMY_SPEED = 1.2;
const SHELL_SPEED = 7;

class Enemy {
  constructor(x, y, ch, speedMul) {
    this.type = { E: "walker", K: "koopa", J: "jumper", S: "shell" }[ch];
    this.w = 28;
    this.h = this.type === "koopa" ? 40 : 28;
    this.x = x + 2;
    this.y = y + TILE - this.h;
    this.speed = ENEMY_SPEED * speedMul;
    this.vx = 0;
    this.vy = 0;
    this.state = "alive";   // "alive", "squashed", "flipped" eller "gone"
    this.active = false;    // fienden börjar röra sig först när den syns på skärmen
    this.timer = 0;
    this.jumpTimer = 40;
    this.kickGrace = 0;     // en kort stund efter en spark kan skalet inte skada spelaren
    this.startsMoving = ch === "S";
  }

  get alive() { return this.state === "alive"; }
  get movingShell() { return this.alive && this.type === "shell" && this.vx !== 0; }

  activate() {
    this.active = true;
    this.vx = this.startsMoving ? -SHELL_SPEED * (this.speed / ENEMY_SPEED) * 0.8 : -this.speed;
  }

  update(level) {
    if (this.state === "squashed") {
      if (--this.timer <= 0) this.state = "gone";
      return;
    }
    if (this.state === "flipped") {
      this.vy += GRAVITY;
      this.x += this.vx;
      this.y += this.vy;
      if (this.y > level.height + 50) this.state = "gone";
      return;
    }

    if (this.type === "jumper" && this.onGround && --this.jumpTimer <= 0) {
      this.vy = -10;
      this.jumpTimer = 50 + Math.floor(Math.random() * 40);
    }

    this.vy += GRAVITY;
    const speed = this.vx;
    moveAndCollide(this, level);
    if (this.hitWall) this.vx = -speed; // vänd vid vägg
    if (this.kickGrace > 0) this.kickGrace--;
    if (this.y > level.height) this.state = "gone";
  }

  // Spelaren hoppade på fienden
  stomp() {
    if (this.type === "koopa") {
      this.type = "shell";
      this.y += this.h - 28;
      this.h = 28;
      this.vx = 0;
    } else if (this.type === "shell") {
      this.vx = 0;
    } else {
      this.state = "squashed";
      this.timer = 30;
    }
  }

  kick(direction) {
    this.vx = SHELL_SPEED * direction;
    this.kickGrace = 12;
  }

  // Träffad av ett skal eller ett block underifrån
  flip() {
    this.state = "flipped";
    this.vy = -7;
    this.vx = this.vx >= 0 ? 1.5 : -1.5;
  }

  draw(ctx, camX) {
    if (this.state === "gone") return;
    const x = this.x - camX;
    const y = this.y;

    if (this.state === "squashed") {
      ctx.fillStyle = "#8b5a2b";
      ctx.fillRect(x, y + this.h - 10, this.w, 10);
      return;
    }

    ctx.save();
    if (this.state === "flipped") {
      ctx.translate(x + this.w / 2, y + this.h / 2);
      ctx.scale(1, -1);
      ctx.translate(-(x + this.w / 2), -(y + this.h / 2));
    }

    const feet = Math.floor(Date.now() / 150) % 2 * 3;
    if (this.type === "walker" || this.type === "jumper") {
      ctx.fillStyle = this.type === "jumper" ? "#c0392b" : "#8b5a2b";
      ctx.beginPath();
      ctx.moveTo(x, y + this.h - 6);
      ctx.lineTo(x + 4, y + 2);
      ctx.lineTo(x + this.w - 4, y + 2);
      ctx.lineTo(x + this.w, y + this.h - 6);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.fillRect(x + 1 + feet, y + this.h - 6, 10, 6);
      ctx.fillRect(x + this.w - 11 - feet, y + this.h - 6, 10, 6);
      ctx.fillStyle = "#fff";
      ctx.fillRect(x + 6, y + 8, 6, 7);
      ctx.fillRect(x + this.w - 12, y + 8, 6, 7);
      ctx.fillStyle = "#000";
      ctx.fillRect(x + 8, y + 10, 3, 4);
      ctx.fillRect(x + this.w - 10, y + 10, 3, 4);
      if (this.type === "jumper") { // små vingar
        ctx.fillStyle = "#fff";
        ctx.fillRect(x - 6, y + 6 - feet, 6, 8);
        ctx.fillRect(x + this.w, y + 6 - feet, 6, 8);
      }
    }

    if (this.type === "koopa") {
      const dir = this.vx > 0 ? 1 : -1;
      ctx.fillStyle = "#f1c27d"; // huvud
      ctx.fillRect(dir > 0 ? x + this.w - 10 : x - 2, y, 12, 14);
      ctx.fillStyle = "#000";
      ctx.fillRect(dir > 0 ? x + this.w - 4 : x + 1, y + 4, 3, 3);
      ctx.fillStyle = "#27ae60"; // skal
      ctx.fillRect(x, y + 12, this.w, 22);
      ctx.fillStyle = "#1e8449";
      ctx.fillRect(x + 6, y + 18, this.w - 12, 10);
      ctx.fillStyle = "#f1c27d"; // fötter
      ctx.fillRect(x + 2 + feet, y + 34, 8, 6);
      ctx.fillRect(x + this.w - 10 - feet, y + 34, 8, 6);
    }

    if (this.type === "shell") {
      const fast = this.startsMoving;
      ctx.fillStyle = fast ? "#c0392b" : "#27ae60";
      ctx.fillRect(x, y + 4, this.w, this.h - 4);
      ctx.fillStyle = fast ? "#922b21" : "#1e8449";
      ctx.fillRect(x + 6, y + 10, this.w - 12, 10);
      ctx.fillStyle = "#fff";
      ctx.fillRect(x, y + this.h - 6, this.w, 3);
    }

    ctx.restore();
  }
}
