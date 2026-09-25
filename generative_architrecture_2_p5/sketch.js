// Generative Architecture — Procedural Facades
// A quiet skyline of building elevations assembled from recursive
// floor/bay subdivision — minimal line-and-fill architectural drawing.

const INK = [43, 41, 36]; // unified ink used for every outline

const PALETTES = [
  { wall: "#e4ded0", dark: "#2f2c26", glass: "#b9cdd6" }, // stone
  { wall: "#c17a5c", dark: "#2a211c", glass: "#cddbd2" }, // terracotta
  { wall: "#a8b39a", dark: "#232a22", glass: "#dfe6d3" }, // sage
  { wall: "#6b727c", dark: "#181b1f", glass: "#b9d6e6" }, // slate
  { wall: "#ded0ae", dark: "#3c2f22", glass: "#e7ddc4" }, // sand
];

// weighted toward "flat" for a calmer skyline
const ROOF_TYPES = ["flat", "flat", "parapet", "setback", "pitched"];

let composition;
let seedValue;

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
  regenerate();
}

function canvasSize() {
  const w = constrain(windowWidth - 64, 640, 1500);
  const h = constrain(windowHeight - 96, 480, 980);
  return { w, h };
}

function regenerate() {
  seedValue = floor(random(1000000));
  randomSeed(seedValue);
  noiseSeed(seedValue);
  composition = generateComposition(width, height);
  redraw();
}

function draw() {
  drawSky();
  drawGround();
  for (const building of composition.buildings) {
    drawBuilding(building);
  }
}

function mousePressed() {
  if (mouseY < 0 || mouseY > height || mouseX < 0 || mouseX > width) return;
  regenerate();
}

function keyPressed() {
  if (key === " ") {
    regenerate();
  } else if (key === "s" || key === "S") {
    saveCanvas(`facades_${seedValue}`, "png");
  }
}

// ---------- composition ----------

function generateComposition(w, h) {
  const marginTop = h * 0.18;
  const groundY = h - h * 0.12;
  const spanH = groundY - marginTop;

  const buildings = [];
  let x = 0;

  while (x < w) {
    const remaining = w - x;
    let bw = random(110, 230);
    if (remaining - bw < 70 && remaining - bw > 0) bw = remaining;
    bw = min(bw, remaining);

    const palette = random(PALETTES);
    const floorH = random(38, 58);
    const maxFloors = floor((spanH * random(0.35, 0.78)) / floorH);
    const floors = max(3, maxFloors);
    const buildingH = floors * floorH;
    const bayW = random(40, 62);
    const bays = max(1, round(bw / bayW));

    buildings.push({
      x,
      y: groundY - buildingH,
      w: bw,
      h: buildingH,
      groundY,
      floors,
      floorH,
      bays,
      palette,
      roof: random(ROOF_TYPES),
      cells: generateCells(floors, bays),
    });

    x += bw;
  }
  return { buildings, groundY };
}

function generateCells(floors, bays) {
  const cells = [];
  for (let f = 0; f < floors; f++) {
    const isGround = f === 0;
    const row = [];
    for (let b = 0; b < bays; b++) row.push(pickCellType(isGround));
    cells.push(row);
  }
  return cells;
}

function pickCellType(isGround) {
  const r = random();
  if (isGround) {
    if (r < 0.4) return "storefront";
    if (r < 0.68) return "door";
    return "wall";
  }
  if (r < 0.55) return "window";
  if (r < 0.68) return "balcony";
  if (r < 0.8) return "recessed";
  return "wall";
}

// ---------- rendering ----------

function drawSky() {
  const top = color("#f5f1e6");
  const bottom = color("#eae3d2");
  for (let y = 0; y < height; y++) {
    stroke(lerpColor(top, bottom, y / height));
    line(0, y, width, y);
  }
  noStroke();
}

function drawGround() {
  const g = composition.groundY;
  noStroke();
  fill("#d7cfb9");
  rect(0, g, width, height - g);
  stroke(...INK, 60);
  strokeWeight(1);
  line(0, g, width, g);
  noStroke();
}

function drawBuilding(bld) {
  const { x, y, w, h } = bld;

  noStroke();
  fill(0, 0, 0, 18);
  //rect(x + w * 0.06, bld.groundY, w, 5);

  push();
  translate(x, y);

  fill(bld.palette.wall);
  noStroke();
  rect(0, 0, w, h);

  drawCells(bld);
  //drawRoof(bld);

  stroke(...INK, 200);
  strokeWeight(1);
  noFill();
  rect(0, 0, w, h);
  noStroke();

  pop();
}

function drawCells(bld) {
  const { w, floors, floorH, bays, cells, palette } = bld;
  const bayW = w / bays;
  const pad = min(bayW, floorH) * 0.3;

  for (let f = 0; f < floors; f++) {
    const fy = bld.h - (f + 1) * floorH;
    for (let b = 0; b < bays; b++) {
      drawCell(cells[f][b], b * bayW, fy, bayW, floorH, pad, palette);
    }
  }
}

function drawCell(type, x, y, w, h, pad, palette) {
  const gx = x + pad;
  const gy = y + pad;
  const gw = w - pad * 2;
  const gh = h - pad * 2;
  if (gw <= 2 || gh <= 2) return;

  switch (type) {
    case "window":
      fill(palette.glass);
      stroke(...INK, 130);
      strokeWeight(0.75);
      rect(gx, gy, gw, gh);
      noStroke();
      break;
    case "balcony":
      fill(palette.glass);
      stroke(...INK, 130);
      strokeWeight(0.75);
      rect(gx, gy, gw, gh);
      stroke(...INK, 90);
      line(x, y + h - pad * 0.5, x + w, y + h - pad * 0.5);
      noStroke();
      break;
    case "recessed":
      fill(lerpColor(color(palette.wall), color(0), 0.14));
      rect(gx, gy, gw, gh);
      break;
    case "door":
      fill(palette.dark);
      rect(x + w * 0.3, y + pad * 0.3, w * 0.4, h - pad * 0.3);
      stroke(...INK, 70);
      line(x + w / 2, y + pad * 0.3, x + w / 2, y + h);
      noStroke();
      break;
    case "storefront":
      fill(palette.glass);
      stroke(...INK, 150);
      strokeWeight(0.9);
      rect(gx, gy, gw, gh);
      noStroke();
      break;
    case "wall":
    default:
      break;
  }
}

function drawRoof(bld) {
  const { w, h, palette, roof, floorH } = bld;
  stroke(...INK, 200);
  strokeWeight(1);
  fill(palette.wall);

  if (roof === "flat") {
    // silhouette outline alone reads as a flat roofline
  } else if (roof === "parapet") {
    rect(w * 0.08, -floorH * 0.28, w * 0.84, floorH * 0.28);
  } else if (roof === "setback") {
    const setW = w * 0.55;
    rect((w - setW) / 2, -floorH * 1.4, setW, floorH * 1.4);
  } else if (roof === "pitched") {
    triangle(0, 0, w, 0, w / 2, -floorH * 1.1);
  }
  noStroke();
}
