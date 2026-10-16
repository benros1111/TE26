// Banorna ritas med tecken. Varje tecken är en ruta (TILE x TILE pixlar).
//   #  = mark / sten        B = tegelblock (stor spelare kan krossa det)
//   ?  = frågeblock (mynt)  M = frågeblock med svamp (gör dig stor)
//   X  = tomt block         ^ = taggar (gör ont!)
//   o  = mynt               P = spelarens start      F = målflagga
//   E  = fiende som går     K = sköldpadda (hoppa på den -> skal, sparka skalet!)
//   J  = fiende som hoppar  S = skal som redan åker fort
//   .  = luft
const TILE = 32;

const LEVELS = [
  {
    name: "1 – Gröna kullarna",
    sky: "#6bb5ff",
    enemySpeed: 1,
    map: [
      "................................................................................................................",
      "................................................................................................................",
      "................................................................................................................",
      "................................................................................................................",
      "............?..............................?B?..................................................................",
      "................................................................................................................",
      "................................................................................................................",
      ".........................................o.o.o....................?B?.................oooo......................",
      "......?...B?BMB.........................BBB?BBB.......................................BBBB.........##...........",
      "..................................##.................##...#.......................................###...........",
      "....................##....o.o.o...##................###...##..............o.o.o..................####...........",
      "..P.............E...##...E........##........E...E..####...###.......E...E.................E.....#####.....F.....",
      "#######################################################...######################...#############################",
      "#######################################################...######################...#############################",
      "#######################################################...######################...#############################",
    ],
  },
  {
    name: "2 – Skalens dal",
    sky: "#f5a25d",
    enemySpeed: 1.4,
    map: [
      "..........................................................................................................................",
      "..........................................................................................................................",
      "..........................................................................................................................",
      "..........................................................................................................................",
      "..........................................................................................................................",
      ".......................................o.o.o..............................................................................",
      "..........................................................................................................................",
      "..........................................................................................................................",
      ".......?B?....................BMB.....B?B?B...................???...............B?B...................?M?....##...........",
      "...........................##...................BB..............................................oo..........###...........",
      "...........................##...........................................##.................................####...........",
      "..P...........K...^^.......##....E.E......K...........J...J...^^^..K..K.##..........E.E.E..^^........J....#####.....F.....",
      "######################...######################....#########################...################....#######################",
      "######################...######################....#########################...################....#######################",
      "######################...######################....#########################...################....#######################",
    ],
  },
  {
    name: "3 – Snabba natten",
    sky: "#2b2d5c",
    enemySpeed: 1.8,
    map: [
      "......................................................................................................................................",
      "......................................................................................................................................",
      "......................................................................................................................................",
      "......................................................................................................................................",
      "......................................................................................................................................",
      "......................................................................................................................................",
      "......................................................................................................................................",
      "..............................o....o....o.............................................................................................",
      "......?M?...........................................B?B?B.........BMB...................?..................................##.........",
      "..................................J.........................##............................................................###.........",
      ".............................##...##...##...................##..........................................##...............####.........",
      "..P.........E.......S........##...##...##......^^^....K..K..##........S...........^^..J..^^..J......S...##.......E.E.K..#####....F....",
      "##########################...##...##...##...###############################....#############################...#######################",
      "##########################...##...##...##...###############################....#############################...#######################",
      "##########################...##...##...##...###############################....#############################...#######################",
    ],
  },
];

// Tecken som man inte kan gå igenom.
const SOLID = ["#", "B", "?", "M", "X"];

function loadLevel(index) {
  const info = LEVELS[index];
  const width = Math.max(...info.map.map(row => row.length));
  const tiles = info.map.map(row => row.padEnd(width, ".").split(""));
  const coins = [];
  const enemies = [];
  let start = { x: 64, y: 64 };
  let goal = null;

  for (let row = 0; row < tiles.length; row++) {
    for (let col = 0; col < tiles[row].length; col++) {
      const ch = tiles[row][col];
      const x = col * TILE;
      const y = row * TILE;
      if (ch === "o") { coins.push({ x: x + 8, y: y + 6, w: 16, h: 20, taken: false }); tiles[row][col] = "."; }
      if ("EKJS".includes(ch)) { enemies.push(new Enemy(x, y, ch, info.enemySpeed)); tiles[row][col] = "."; }
      if (ch === "P") { start = { x, y }; tiles[row][col] = "."; }
      if (ch === "F") { goal = { x: x + 12, y: y - TILE * 7, w: 8, h: TILE * 8 }; tiles[row][col] = "."; }
    }
  }

  return {
    name: info.name,
    sky: info.sky,
    tiles,
    coins,
    enemies,
    items: [],   // svampar
    bumps: [],   // block som studsar när man slår i dem
    start,
    goal,
    width: width * TILE,
    height: tiles.length * TILE,
  };
}

function tileAt(level, px, py) {
  const col = Math.floor(px / TILE);
  const row = Math.floor(py / TILE);
  if (row < 0 || row >= level.tiles.length) return ".";
  return level.tiles[row][col] || ".";
}

function isSolid(level, px, py) {
  const col = Math.floor(px / TILE);
  if (col < 0 || col >= level.tiles[0].length) return true; // väggar på sidorna
  return SOLID.includes(tileAt(level, px, py));
}

// Punkter längs en kant, max en ruta mellan varje. Då missar vi inga block,
// inte ens när spelaren är stor (högre än en ruta).
function edgePoints(start, length) {
  const points = [];
  for (let p = start + 1; p < start + length - 1; p += TILE - 2) points.push(p);
  points.push(start + length - 1);
  return points;
}

// Flyttar en figur och stoppar den mot block.
// Sätter onGround och hitWall. Returnerar blocket man slog huvudet i (eller null).
function moveAndCollide(obj, level) {
  let head = null;
  obj.hitWall = false;

  // X-led
  obj.x += obj.vx;
  if (obj.vx > 0) {
    const edge = obj.x + obj.w;
    if (edgePoints(obj.y, obj.h).some(py => isSolid(level, edge, py))) {
      obj.x = Math.floor(edge / TILE) * TILE - obj.w - 0.01;
      obj.vx = 0;
      obj.hitWall = true;
    }
  } else if (obj.vx < 0) {
    if (edgePoints(obj.y, obj.h).some(py => isSolid(level, obj.x, py))) {
      obj.x = (Math.floor(obj.x / TILE) + 1) * TILE;
      obj.vx = 0;
      obj.hitWall = true;
    }
  }

  // Y-led
  obj.y += obj.vy;
  obj.onGround = false;
  if (obj.vy > 0) {
    const edge = obj.y + obj.h;
    if (edgePoints(obj.x, obj.w).some(px => isSolid(level, px, edge))) {
      obj.y = Math.floor(edge / TILE) * TILE - obj.h;
      obj.vy = 0;
      obj.onGround = true;
    }
  } else if (obj.vy < 0) {
    const hits = edgePoints(obj.x, obj.w).filter(px => isSolid(level, px, obj.y));
    if (hits.length > 0) {
      // Slå bara i det block som är närmast mitten av huvudet
      const center = obj.x + obj.w / 2;
      const px = hits.reduce((a, b) => Math.abs(b - center) < Math.abs(a - center) ? b : a);
      head = { col: Math.floor(px / TILE), row: Math.floor(obj.y / TILE) };
      obj.y = (Math.floor(obj.y / TILE) + 1) * TILE;
      obj.vy = 0;
    }
  }

  return head;
}

// Rör figuren någon taggruta?
function touchesSpikes(level, obj) {
  const box = { x: obj.x + 4, y: obj.y + obj.h - 12, w: obj.w - 8, h: 12 };
  for (const px of [box.x, box.x + box.w]) {
    for (const py of [box.y, box.y + box.h - 1]) {
      if (tileAt(level, px, py) === "^" && (py % TILE) > TILE - 20) return true;
    }
  }
  return false;
}

function drawLevel(ctx, level, camX) {
  const firstCol = Math.max(0, Math.floor(camX / TILE));
  const lastCol = firstCol + Math.ceil(ctx.canvas.width / TILE) + 1;
  for (let row = 0; row < level.tiles.length; row++) {
    for (let col = firstCol; col <= lastCol; col++) {
      const ch = level.tiles[row][col];
      if (!ch || ch === ".") continue;
      const bump = level.bumps.find(b => b.col === col && b.row === row);
      const x = col * TILE - camX;
      const y = row * TILE - (bump ? Math.sin((bump.t / 10) * Math.PI) * 10 : 0);

      if (ch === "#") {
        ctx.fillStyle = "#8b4513"; ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = "#6e3610"; ctx.fillRect(x + 4, y + 18, 6, 6); ctx.fillRect(x + 20, y + 8, 6, 6);
        if (row === 0 || level.tiles[row - 1][col] !== "#") { ctx.fillStyle = "#3c9a3c"; ctx.fillRect(x, y, TILE, 7); }
      }
      if (ch === "B") {
        ctx.fillStyle = "#c0572b"; ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = "#5a2a10";
        ctx.fillRect(x, y + 15, TILE, 2); ctx.fillRect(x + 15, y, 2, 15); ctx.fillRect(x + 7, y + 17, 2, 15); ctx.fillRect(x + 23, y + 17, 2, 15);
      }
      if (ch === "?" || ch === "M") {
        const shine = Math.floor(Date.now() / 200) % 4 === 0;
        ctx.fillStyle = shine ? "#ffd84d" : "#f0b400"; ctx.fillRect(x, y, TILE, TILE);
        ctx.strokeStyle = "#8a5a00"; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, TILE - 2, TILE - 2);
        ctx.fillStyle = "#6b3d00"; ctx.font = "bold 20px monospace"; ctx.fillText("?", x + 10, y + 23);
      }
      if (ch === "X") {
        ctx.fillStyle = "#9c6b3c"; ctx.fillRect(x, y, TILE, TILE);
        ctx.strokeStyle = "#5a3a1a"; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, TILE - 2, TILE - 2);
      }
      if (ch === "^") {
        ctx.fillStyle = "#cfd3d6";
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(x + i * 8, y + TILE);
          ctx.lineTo(x + i * 8 + 4, y + TILE - 16);
          ctx.lineTo(x + i * 8 + 8, y + TILE);
          ctx.fill();
        }
      }
    }
  }
}
