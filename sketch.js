// Generative Architecture — Blueprint Studies
// A procedurally generated skyline rendered as a technical blueprint sheet:
// wireframe buildings, dimension lines, survey marks, and a title block.
// Click to regenerate. Press S to save a PNG. Press R to regenerate.

const SHEET_W = 1000;
const SHEET_H = 1400;
const MARGIN = 36;

const INK = { r: 214, g: 233, b: 255 };
const BG = [5, 20, 40];
const SHOW_ANNOTATIONS = true;

let buildings = [];
let topBuildings = [];
let markers = [];
let callouts = [];
let seed;
let projectNumber;
let groundY;
let topY;

function setup() {
  const holder = document.getElementById("sketch-holder");
  const c = createCanvas(SHEET_W, SHEET_H);
  c.parent(holder);
  noLoop();
  rectMode(CORNER);
  regenerate();
}

function mousePressed() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    regenerate();
  }
}

function keyPressed() {
  if (key === "s" || key === "S") {
    saveCanvas("blueprint-" + projectNumber, "png");
  } else if (key === "r" || key === "R") {
    regenerate();
  }
}

function regenerate() {
  seed = floor(random(100000));
  randomSeed(seed);
  noiseSeed(seed);
  projectNumber = nf(seed % 9999, 4);
  //groundY = SHEET_H - 260;
  groundY = SHEET_H - 34;
  //topY = MARGIN + 140;
  topY = MARGIN;
  buildings = generateBuildings();
  topBuildings = generateBuildings();
  markers = generateMarkers();
  callouts = generateCallouts();
  redraw();
}

// ---------- generation ----------

function generateBuildings() {
  const arr = [];
  const usableWidth = SHEET_W - MARGIN * 2 - 40;
  const n = floor(random(5, 8));
  const slotWidth = usableWidth / n;

  for (let i = 0; i < n; i++) {
    const slotX = MARGIN + 20 + i * slotWidth;
    const bw = slotWidth * random(0.42, 0.72);
    const bx = slotX + (slotWidth - bw) * random(0.15, 0.85);

    const tiers = floor(random(1, 4));
    const tierHeights = [];
    const tierWidths = [];
    let baseH = random(140, 300);
    let curW = bw;
    for (let t = 0; t < tiers; t++) {
      tierHeights.push(baseH * pow(random(0.55, 0.82), t));
      tierWidths.push(curW);
      curW *= random(0.55, 0.8);
    }
    const totalHeight = tierHeights.reduce((a, b) => a + b, 0);
    const floorHeight = random(16, 24);
    const hasSpire = random() < 0.35;
    const hasBrace = random() < 0.4;
    const mullionSpacing = random(12, 20);

    arr.push({
      x: bx,
      baseWidth: bw,
      tierHeights,
      tierWidths,
      totalHeight,
      floorHeight,
      hasSpire,
      hasBrace,
      mullionSpacing,
      id: i + 1,
    });
  }
  return arr;
}

function generateMarkers() {
  const arr = [];
  const count = floor(random(4, 7));
  for (let i = 0; i < count; i++) {
    arr.push({
      x: random(MARGIN + 30, SHEET_W - MARGIN - 30),
      label: "BM-" + nf(i + 1, 2),
    });
  }
  return arr;
}

function generateCallouts() {
  const labels = [
    "CURTAIN WALL",
    "STRUCTURAL BAY",
    "SETBACK LINE",
    "MECH. PENTHOUSE",
    "PODIUM LEVEL",
    "FACADE MODULE",
    "ROOF ACCESS",
  ];
  const arr = [];
  const count = min(3, buildings.length);
  const chosen = new Set();
  while (chosen.size < count) chosen.add(floor(random(buildings.length)));
  chosen.forEach((idx) => {
    const b = buildings[idx];
    const t = random(0.3, 0.9);
    arr.push({
      x: b.x + b.baseWidth * random(0.2, 0.8),
      y: groundY - b.totalHeight * t,
      label: random(labels),
      dir: random() < 0.5 ? -1 : 1,
    });
  });
  return arr;
}

// ---------- drawing ----------

function draw() {
  background(BG[0], BG[1], BG[2]);
  drawGrid();
  drawBorder();
  drawGround();
  drawCeiling();
  for (const b of buildings) drawBuilding(b, groundY, -1);
  for (const b of topBuildings) drawBuilding(b, topY, 1);
  if (SHOW_ANNOTATIONS) {
    drawDimensions();
    drawMarkers();
    //drawCallouts();
  }
  //drawCompass();
  //drawTitleBlock();
  drawInstructions();
}

function ink(a) {
  return color(INK.r, INK.g, INK.b, a);
}

function drawGrid() {
  stroke(ink(16));
  strokeWeight(1);
  for (let x = 0; x <= SHEET_W; x += 20) line(x, 0, x, SHEET_H);
  for (let y = 0; y <= SHEET_H; y += 20) line(0, y, SHEET_W, y);

  stroke(ink(38));
  for (let x = 0; x <= SHEET_W; x += 100) line(x, 0, x, SHEET_H);
  for (let y = 0; y <= SHEET_H; y += 100) line(0, y, SHEET_W, y);
}

function drawBorder() {
  noFill();
  stroke(ink(200));
  strokeWeight(2);
  rect(MARGIN, MARGIN, SHEET_W - MARGIN * 2, SHEET_H - MARGIN * 2);

  strokeWeight(1);
  for (let x = MARGIN; x <= SHEET_W - MARGIN; x += 50) {
    line(x, MARGIN, x, MARGIN + 8);
    line(x, SHEET_H - MARGIN, x, SHEET_H - MARGIN - 8);
  }
  for (let y = MARGIN; y <= SHEET_H - MARGIN; y += 50) {
    line(MARGIN, y, MARGIN + 8, y);
    line(SHEET_W - MARGIN, y, SHEET_W - MARGIN - 8, y);
  }
}

function drawGround() {
  stroke(ink(220));
  strokeWeight(2.5);
  line(MARGIN, groundY, SHEET_W - MARGIN, groundY);

  stroke(ink(60));
  strokeWeight(1);
  const hatchBottom = min(groundY + 26, SHEET_H - MARGIN);
  for (let x = MARGIN; x < SHEET_W - MARGIN; x += 12) {
    line(x, groundY + 3, x - 10, hatchBottom);
  }
}

function drawCeiling() {
  stroke(ink(220));
  strokeWeight(2.5);
  line(MARGIN, topY, SHEET_W - MARGIN, topY);

  stroke(ink(60));
  strokeWeight(1);
  const hatchTop = max(topY - 26, MARGIN);
  for (let x = MARGIN; x < SHEET_W - MARGIN; x += 12) {
    line(x, topY - 3, x - 10, hatchTop);
  }
}

function drawBuilding(b, anchorY, dir) {
  push();
  translate(b.x, anchorY);

  let cy = 0;
  stroke(ink(230));
  strokeWeight(1.6);
  fill(0, 75);

  const tierRects = [];
  for (let t = 0; t < b.tierHeights.length; t++) {
    const th = b.tierHeights[t];
    const tw = b.tierWidths[t];
    const tx = (b.baseWidth - tw) / 2;
    const yA = dir * cy;
    const yB = dir * (cy + th);
    tierRects.push({
      x: tx,
      yTop: min(yA, yB),
      yBot: max(yA, yB),
      w: tw,
      h: th,
    });
    cy += th;
  }

  // outline per tier
  for (const r of tierRects) {
    rect(r.x, r.yTop, r.w, r.h);
  }

  // floor lines + mullions
  stroke(ink(100));
  strokeWeight(0.8);
  // for (const r of tierRects) {
  //   for (let fy = r.yBot; fy > r.yTop; fy -= b.floorHeight) {
  //     const yy = max(fy, r.yTop);
  //     line(r.x, yy, r.x + r.w, yy);
  //   }
  //   for (let fx = r.x; fx <= r.x + r.w; fx += b.mullionSpacing) {
  //     line(fx, r.yTop, fx, r.yBot);
  //   }
  // }

  // cross bracing on lowest tier
  // if (b.hasBrace && tierRects.length > 0) {
  //   const r = tierRects[0];
  //   stroke(ink(160));
  //   strokeWeight(1.2);
  //   line(r.x, r.yBot, r.x + r.w, r.yTop);
  //   line(r.x + r.w, r.yBot, r.x, r.yTop);
  // }

  // spire
  if (b.hasSpire) {
    const top = tierRects[tierRects.length - 1];
    const cx = top.x + top.w / 2;
    stroke(ink(220));
    strokeWeight(1.4);
    const spireH = random(30, 70);
    const spireEnd = dir < 0 ? top.yTop - spireH : top.yBot + spireH;
    line(cx, dir < 0 ? top.yTop : top.yBot, cx, spireEnd);
    noStroke();
    fill(ink(220));
    ellipse(cx, spireEnd, 4, 4);
    noFill();
  }

  pop();
}

function drawDimensions() {
  textFont("Courier New");
  textSize(10);
  noFill();

  for (const b of buildings) {
    const topY = groundY - b.totalHeight;
    const dimX = b.x - 14;

    stroke(ink(140));
    strokeWeight(0.8);
    line(dimX, groundY, dimX, topY);
    line(dimX - 4, groundY, dimX + 4, groundY);
    line(dimX - 4, topY, dimX + 4, topY);

    push();
    translate(dimX - 6, (groundY + topY) / 2);
    rotate(-HALF_PI);
    noStroke();
    fill(ink(200));
    textAlign(CENTER, CENTER);
    text(round(b.totalHeight) + " u", 0, 0);
    pop();

    stroke(ink(120));
    strokeWeight(0.8);
    const dimY = groundY + 16;
    line(b.x, dimY, b.x + b.baseWidth, dimY);
    line(b.x, dimY - 4, b.x, dimY + 4);
    line(b.x + b.baseWidth, dimY - 4, b.x + b.baseWidth, dimY + 4);
    noStroke();
    fill(ink(200));
    textAlign(CENTER, TOP);
    text(round(b.baseWidth) + " u", b.x + b.baseWidth / 2, dimY + 4);
  }
}

function drawMarkers() {
  for (const m of markers) {
    stroke(ink(180));
    strokeWeight(1);
    noFill();
    ellipse(m.x, groundY, 10, 10);
    line(m.x - 6, groundY, m.x + 6, groundY);
    line(m.x, groundY - 6, m.x, groundY + 6);

    noStroke();
    fill(ink(160));
    textFont("Courier New");
    textSize(9);
    textAlign(CENTER, TOP);
    text(m.label, m.x, groundY + 10);
  }
}

function drawCallouts() {
  textFont("Courier New");
  textSize(10);
  for (const c of callouts) {
    const lx = c.x + c.dir * 60;
    stroke(ink(150));
    strokeWeight(0.8);
    line(c.x, c.y, lx, c.y - 20);
    line(lx, c.y - 20, lx + c.dir * 20, c.y - 20);

    noStroke();
    fill(ink(170));
    ellipse(c.x, c.y, 3, 3);

    fill(ink(210));
    textAlign(c.dir > 0 ? LEFT : RIGHT, BOTTOM);
    text(
      c.label,
      lx + c.dir * 22 * (c.dir > 0 ? 1 : -1) - (c.dir > 0 ? 0 : 0),
      c.y - 22,
    );
  }
}

function drawCompass() {
  const cx = SHEET_W - MARGIN - 60;
  const cy = MARGIN + 60;
  const r = 30;

  noFill();
  stroke(ink(200));
  strokeWeight(1.4);
  ellipse(cx, cy, r * 2, r * 2);

  stroke(ink(230));
  strokeWeight(1.6);
  line(cx, cy + r - 4, cx, cy - r + 4);
  line(cx - r + 4, cy, cx + r - 4, cy);

  noStroke();
  fill(ink(230));
  triangle(cx, cy - r + 4, cx - 5, cy - r + 16, cx + 5, cy - r + 16);

  textFont("Courier New");
  textSize(11);
  textAlign(CENTER, BOTTOM);
  text("N", cx, cy - r - 4);
}

function drawTitleBlock() {
  const bw = 320;
  const bh = 130;
  const bx = SHEET_W - MARGIN - bw;
  const by = SHEET_H - MARGIN - bh;

  noFill();
  stroke(ink(200));
  strokeWeight(1.4);
  rect(bx, by, bw, bh);

  stroke(ink(120));
  strokeWeight(0.8);
  const rowH = bh / 5;
  for (let i = 1; i < 5; i++) {
    line(bx, by + rowH * i, bx + bw, by + rowH * i);
  }
  line(bx + bw * 0.32, by, bx + bw * 0.32, by + rowH);

  noStroke();
  fill(ink(230));
  textFont("Courier New");
  textAlign(LEFT, CENTER);

  textSize(13);
  text("GENERATIVE ARCHITECTURE", bx + 10, by + rowH * 0.5);

  textSize(10);
  fill(ink(180));
  text("STUDY NO.", bx + 10, by + rowH * 1.5);
  fill(ink(230));
  textAlign(RIGHT, CENTER);
  text(projectNumber, bx + bw - 10, by + rowH * 1.5);

  textAlign(LEFT, CENTER);
  fill(ink(180));
  text("SCALE", bx + 10, by + rowH * 2.5);
  fill(ink(230));
  textAlign(RIGHT, CENTER);
  text("1 : 100", bx + bw - 10, by + rowH * 2.5);

  textAlign(LEFT, CENTER);
  fill(ink(180));
  text("SEED", bx + 10, by + rowH * 3.5);
  fill(ink(230));
  textAlign(RIGHT, CENTER);
  text(String(seed), bx + bw - 10, by + rowH * 3.5);

  textAlign(LEFT, CENTER);
  fill(ink(180));
  text("REV", bx + 10, by + rowH * 4.5);
  fill(ink(230));
  textAlign(RIGHT, CENTER);
  text("A", bx + bw - 10, by + rowH * 4.5);
}

function drawInstructions() {
  noStroke();
  fill(ink(90));
  textFont("Courier New");
  textSize(10);
  textAlign(LEFT, BOTTOM);
  text(
    "CLICK: REGENERATE   [S] SAVE PNG   [R] REGENERATE",
    MARGIN + 4,
    SHEET_H - MARGIN - 8,
  );
}
