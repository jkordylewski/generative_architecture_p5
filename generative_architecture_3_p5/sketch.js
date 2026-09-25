// Generative Architecture — Megastructure at Dusk
// A sprawling isometric megastructure assembled from stacked modular
// blocks (Habitat 67 / Kowloon Walled City lineage): irregular column
// heights, cantilevered jitter between levels, and warm lit windows
// against a dusk sky. Click / space to regenerate, S to save a PNG.

const HALF_W = 34; // half-width of an iso tile diamond
const HALF_H = 18; // half-height of an iso tile diamond
const MODULE_H = 30; // vertical extrusion per stacked module

const CONCRETE = ["#8a8478", "#9d9686", "#736c60", "#b0a894"];
const ACCENT = ["#c1774a", "#d8a24a", "#9a5b42"];
const SKY_TOP = "#3a2440";
const SKY_BOTTOM = "#e8834a";
const GROUND = "#4a3b3a";

let modules;
let groundTiles;
let seedValue;
let sceneOffsetX, sceneOffsetY;

function setup() {
  const size = canvasSize();
  createCanvas(size.w, size.h).parent("sketch-holder");
  pixelDensity(2);
  noStroke();
  regenerate();
}

function windowResized() {
  const size = canvasSize();
  resizeCanvas(size.w, size.h);
  layoutScene();
  redraw();
}

function canvasSize() {
  const w = constrain(windowWidth - 64, 640, 1500);
  const h = constrain(windowHeight - 96, 480, 980);
  return { w, h };
}

function mousePressed() {
  if (mouseY < 0 || mouseY > height || mouseX < 0 || mouseX > width) return;
  regenerate();
}

function keyPressed() {
  if (key === " ") {
    regenerate();
  } else if (key === "s" || key === "S") {
    saveCanvas(`megastructure_${seedValue}`, "png");
  }
}

function regenerate() {
  seedValue = floor(random(1000000));
  randomSeed(seedValue);
  noiseSeed(seedValue);
  buildMegastructure();
  layoutScene();
  redraw();
}

// ---------- composition ----------

function buildMegastructure() {
  const gridN = floor(random(7, 11));
  const noiseScale = random(0.22, 0.4);
  groundTiles = [];
  modules = [];

  for (let gx = 0; gx < gridN; gx++) {
    for (let gz = 0; gz < gridN; gz++) {
      groundTiles.push({ gx, gz });

      const n = noise(gx * noiseScale, gz * noiseScale);
      const edgeFalloff = 1 - (abs(gx - gridN / 2) + abs(gz - gridN / 2)) / gridN;
      const isCourtyard = random() < 0.13;
      if (isCourtyard) continue;

      const levels = max(1, round(map(n * edgeFalloff, 0, 1, 1, 11)));
      const baseColor = color(random(CONCRETE));
      let jitterX = 0;
      let jitterZ = 0;

      for (let level = 0; level < levels; level++) {
        if (level > 0 && random() < 0.55) {
          jitterX += random(-0.16, 0.16);
          jitterZ += random(-0.1, 0.1);
        }
        const isAccent = random() < 0.1;
        modules.push({
          gx,
          gz,
          level,
          jitterX,
          jitterZ,
          scale: random(0.86, 1.0),
          col: isAccent ? color(random(ACCENT)) : baseColor,
        });
      }
    }
  }
}

function layoutScene() {
  if (!modules || modules.length === 0) {
    sceneOffsetX = width / 2;
    sceneOffsetY = height * 0.8;
    return;
  }

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const m of modules) {
    const p = moduleTop(m);
    const w = HALF_W * m.scale;
    const h = HALF_H * m.scale;
    minX = min(minX, p.x - w);
    maxX = max(maxX, p.x + w);
    minY = min(minY, p.y - h);
    maxY = max(maxY, p.y + h + MODULE_H);
  }
  for (const t of groundTiles) {
    const gsx = (t.gx - t.gz) * HALF_W;
    const gsy = (t.gx + t.gz) * HALF_H;
    minX = min(minX, gsx - HALF_W);
    maxX = max(maxX, gsx + HALF_W);
    maxY = max(maxY, gsy + HALF_H);
  }

  sceneOffsetX = width / 2 - (minX + maxX) / 2;
  sceneOffsetY = height * 0.92 - maxY;
}

function moduleTop(m) {
  const gsx = (m.gx - m.gz) * HALF_W + m.jitterX * HALF_W * 2;
  const gsy = (m.gx + m.gz) * HALF_H + m.jitterZ * HALF_H * 2;
  return { x: gsx, y: gsy - (m.level + 1) * MODULE_H };
}

// ---------- drawing ----------

function draw() {
  drawSky();

  push();
  translate(sceneOffsetX, sceneOffsetY);

  drawGround();

  const ordered = [...modules].sort((a, b) => {
    const da = a.gx + a.gz;
    const db = b.gx + b.gz;
    if (da !== db) return da - db;
    return a.level - b.level;
  });
  for (const m of ordered) drawModule(m);

  pop();
}

function drawSky() {
  const top = color(SKY_TOP);
  const bottom = color(SKY_BOTTOM);
  for (let y = 0; y < height; y++) {
    stroke(lerpColor(top, bottom, pow(y / height, 1.3)));
    line(0, y, width, y);
  }
  noStroke();
  fill(255, 244, 224, 60);
  circle(width * 0.78, height * 0.22, min(width, height) * 0.12);
}

function drawGround() {
  noStroke();
  fill(GROUND);
  for (const t of groundTiles) {
    const gsx = (t.gx - t.gz) * HALF_W;
    const gsy = (t.gx + t.gz) * HALF_H;
    drawDiamond(gsx, gsy, HALF_W, HALF_H);
  }
}

function drawDiamond(sx, sy, hw, hh) {
  beginShape();
  vertex(sx, sy - hh);
  vertex(sx + hw, sy);
  vertex(sx, sy + hh);
  vertex(sx - hw, sy);
  endShape(CLOSE);
}

function drawModule(m) {
  const top = moduleTop(m);
  const hw = HALF_W * m.scale;
  const hh = HALF_H * m.scale;
  const bh = MODULE_H;
  const sx = top.x;
  const sy = top.y;

  const topCol = m.col;
  const leftCol = lerpColor(m.col, color(0), 0.32);
  const rightCol = lerpColor(m.col, color(0), 0.16);

  const topQuad = [
    { x: sx, y: sy - hh },
    { x: sx + hw, y: sy },
    { x: sx, y: sy + hh },
    { x: sx - hw, y: sy },
  ];
  const leftQuad = [
    { x: sx - hw, y: sy },
    { x: sx, y: sy + hh },
    { x: sx, y: sy + hh + bh },
    { x: sx - hw, y: sy + bh },
  ];
  const rightQuad = [
    { x: sx + hw, y: sy },
    { x: sx, y: sy + hh },
    { x: sx, y: sy + hh + bh },
    { x: sx + hw, y: sy + bh },
  ];

  fill(rightCol);
  drawQuad(rightQuad);
  fill(leftCol);
  drawQuad(leftQuad);
  fill(topCol);
  drawQuad(topQuad);

  drawWindows(leftQuad, m);
  drawWindows(rightQuad, m);
}

function drawQuad(q) {
  beginShape();
  for (const p of q) vertex(p.x, p.y);
  endShape(CLOSE);
}

function lerpQuad(q, u, v) {
  const ax = q[1].x - q[0].x, ay = q[1].y - q[0].y;
  const bx = q[3].x - q[0].x, by = q[3].y - q[0].y;
  return { x: q[0].x + ax * u + bx * v, y: q[0].y + ay * u + by * v };
}

function drawWindows(quad, m) {
  const cols = 2;
  const rows = 2;
  const pad = 0.16;
  const litChance = m.level < 3 ? 0.55 : 0.32;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const u0 = pad + (c / cols) * (1 - pad * 2);
      const u1 = pad + ((c + 1) / cols) * (1 - pad * 2);
      const v0 = pad + (r / rows) * (1 - pad * 2);
      const v1 = pad + ((r + 1) / rows) * (1 - pad * 2);

      const p0 = lerpQuad(quad, u0, v0);
      const p1 = lerpQuad(quad, u1, v0);
      const p2 = lerpQuad(quad, u1, v1);
      const p3 = lerpQuad(quad, u0, v1);

      const lit = random() < litChance;
      fill(lit ? color(255, 214, 140, 235) : color(30, 26, 30, 160));
      beginShape();
      vertex(p0.x, p0.y);
      vertex(p1.x, p1.y);
      vertex(p2.x, p2.y);
      vertex(p3.x, p3.y);
      endShape(CLOSE);
    }
  }
}
