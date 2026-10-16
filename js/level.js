// Banan ritas med tecken. Varje tecken är en ruta (TILE x TILE pixlar).
//   #  = mark        B = tegelblock     ?  = frågeblock
//   o  = mynt        E = fiende         P  = spelarens start
//   F  = målflagga   .  = luft
const TILE = 32;

const LEVEL_MAP = [
  "....................................................................................",
  "....................................................................................",
  "....................................................................................",
  "....................................................................................",
  "..........?.................o.o.o...................................................",
  "....................................................................................",
  "...........................BBBBBB...................................................",
  "...............................................?B?B................o.o........#.....",
  "....?...B?B?B.....................................................BBBBB......##.....",
  "............................................................................###.....",
  "..P.................##.........o.o...............E.........................####.....",
  ".................E..##..............E.......##.............E....##....E...#####..F..",
  "########################..##############...############..###########################",
  "########################..##############...############..###########################",
  "########################..##############...############..###########################",
];

// Tecken som man inte kan gå igenom.
const SOLID = ["#", "B", "?"];

function loadLevel() {
  const tiles = LEVEL_MAP.map(row => row.split(""));
  const coins = [];
  const enemies = [];
  let start = { x: 64, y: 64 };
  let goal = null;

  for (let row = 0; row < tiles.length; row++) {
    for (let col = 0; col < tiles[row].length; col++) {
      const ch = tiles[row][col];
      const x = col * TILE;
      const y = row * TILE;
      if (ch === "o") { coins.push({ x: x + 8, y: y + 8, w: 16, h: 16, taken: false }); tiles[row][col] = "."; }
      if (ch === "E") { enemies.push(new Enemy(x, y)); tiles[row][col] = "."; }
      if (ch === "P") { start = { x, y }; tiles[row][col] = "."; }
      if (ch === "F") { goal = { x: x + 12, y: y - TILE * 6, w: 8, h: TILE * 7 }; tiles[row][col] = "."; }
    }
  }

  return {
    tiles,
    coins,
    enemies,
    start,
    goal,
    width: tiles[0].length * TILE,
    height: tiles.length * TILE,
  };
}

function isSolid(level, px, py) {
  const col = Math.floor(px / TILE);
  const row = Math.floor(py / TILE);
  if (row < 0 || col < 0 || col >= level.tiles[0].length) return true; // väggar på sidorna
  if (row >= level.tiles.length) return false; // hål i botten
  return SOLID.includes(level.tiles[row][col]);
}

// Flyttar en figur och stoppar den mot block. Sätter onGround = true när den står på något.
function moveAndCollide(obj, level) {
  // X-led
  obj.x += obj.vx;
  if (obj.vx > 0 && (isSolid(level, obj.x + obj.w, obj.y + 1) || isSolid(level, obj.x + obj.w, obj.y + obj.h - 1))) {
    obj.x = Math.floor((obj.x + obj.w) / TILE) * TILE - obj.w - 0.01;
    obj.vx = 0;
    obj.hitWall = true;
  } else if (obj.vx < 0 && (isSolid(level, obj.x, obj.y + 1) || isSolid(level, obj.x, obj.y + obj.h - 1))) {
    obj.x = (Math.floor(obj.x / TILE) + 1) * TILE;
    obj.vx = 0;
    obj.hitWall = true;
  }

  // Y-led
  obj.y += obj.vy;
  obj.onGround = false;
  if (obj.vy > 0 && (isSolid(level, obj.x + 1, obj.y + obj.h) || isSolid(level, obj.x + obj.w - 1, obj.y + obj.h))) {
    obj.y = Math.floor((obj.y + obj.h) / TILE) * TILE - obj.h;
    obj.vy = 0;
    obj.onGround = true;
  } else if (obj.vy < 0 && (isSolid(level, obj.x + 1, obj.y) || isSolid(level, obj.x + obj.w - 1, obj.y))) {
    obj.y = (Math.floor(obj.y / TILE) + 1) * TILE;
    obj.vy = 0;
  }
}

function drawLevel(ctx, level, camX) {
  const firstCol = Math.floor(camX / TILE);
  const lastCol = firstCol + Math.ceil(ctx.canvas.width / TILE) + 1;
  for (let row = 0; row < level.tiles.length; row++) {
    for (let col = firstCol; col <= lastCol; col++) {
      const ch = level.tiles[row][col];
      const x = col * TILE - camX;
      const y = row * TILE;
      if (ch === "#") { ctx.fillStyle = "#8b4513"; ctx.fillRect(x, y, TILE, TILE); ctx.fillStyle = "#3c9a3c"; if (row === 0 || level.tiles[row - 1][col] !== "#") ctx.fillRect(x, y, TILE, 6); }
      if (ch === "B") { ctx.fillStyle = "#c0572b"; ctx.fillRect(x, y, TILE, TILE); ctx.strokeStyle = "#5a2a10"; ctx.strokeRect(x + 1, y + 1, TILE - 2, TILE - 2); }
      if (ch === "?") { ctx.fillStyle = "#f0b400"; ctx.fillRect(x, y, TILE, TILE); ctx.fillStyle = "#000"; ctx.font = "bold 20px monospace"; ctx.fillText("?", x + 10, y + 23); }
    }
  }
}
