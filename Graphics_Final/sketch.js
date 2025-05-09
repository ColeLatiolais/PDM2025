let bugSheet;
let bugs = [];
let bugCount = 5;
let splatFrame = 4;
let gameFont;
let score = 0;
let time = 30;
let gameState = "start";
let bugSpeed = 1;

function preload() {
  gameFont = loadFont("media/PressStart2P-Regular.ttf");
  bugSheet = loadImage("media/FreakBug.png");
}

function setup() {
  createCanvas(700, 700);
  textFont(gameFont);
  imageMode(CENTER);

  for (let i = 0; i < bugCount; i++) {
    bugs.push(new Bug(random(80, width - 80), random(80, height - 80)));
  }
}

function draw() {
  background(220);

  switch(gameState) {
    case "start":
      textAlign(CENTER, CENTER);
      textSize(16);
      text("Click ENTER to Start", width / 2, height / 2);
      break;
    case "play":
      textAlign(LEFT, TOP);
      text("Score: " + score, 10, 10);
      textAlign(RIGHT, TOP);
      text("Time: " + Math.ceil(time), width - 10, 10);

      time -= deltaTime / 1000;
      if (time <= 0) {
        gameState = "end";
      }

      if (frameCount % 300 === 0) { // every ~5 seconds at 60 FPS
        bugs.push(new Bug(random(80, width - 80), random(80, height - 80)));
      }

      for (let bug of bugs) {
        bug.update();
        bug.draw();
      }

      break;
    case "end":
      textAlign(CENTER, CENTER);
      text("Game Over!", width / 2, height / 2 - 40);
      text("Score: " + score, width / 2, height / 2);
      text("Press ENTER to Retry", width / 2, height / 2 + 40);
      break;
  }
}

function keyPressed() {
  if (keyCode === ENTER) {
    if (gameState === "start" || gameState === "end") {
      resetGame();
      gameState = "play";
    }
  }
}

function mousePressed() {
  if (gameState !== "play") return;
  for (let bug of bugs) {
    if (!bug.squished && dist(mouseX, mouseY, bug.x, bug.y) < 40) {
      bug.squish();
      score++;
      bugSpeed += 0.2; // Increase difficulty
      break;
    }
  }
}

function resetGame() {
  score = 0;
  time = 30;
  bugSpeed = 1;
  bugs = [];
  for (let i = 0; i < bugCount; i++) {
    bugs.push(new Bug(random(80, width - 80), random(80, height - 80)));
  }
}

// ---------------- Bug & SpriteAnimation ----------------
class Bug {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.squished = false;
    this.dir = p5.Vector.random2D();
    this.animation = new SpriteAnimation(bugSheet, 0, 0, 4); // 4-frame walk
    this.splatTimer = 0;
  }

  update() {
    if (this.squished) {
      this.splatTimer++;

      if (this.splatTimer > 30) {
        // Respawn
        this.x = random(80, width - 80);
        this.y = random(80, height - 80);
        this.dir = p5.Vector.random2D();
        this.squished = false;
        this.splatTimer = 0;
      }

      return;
    }

    this.x += this.dir.x * bugSpeed;
    this.y += this.dir.y * bugSpeed;

    // Bounce off edges
    if (this.x < 40 || this.x > width - 40) this.dir.x *= -1;
    if (this.y < 40 || this.y > height - 40) this.dir.y *= -1;
  }

  draw() {
    push();
    translate(this.x, this.y);

    // Rotate to face movement direction
    if (!this.squished) {
      rotate(this.dir.heading() + HALF_PI); // add HALF_PI to correct for "head-up" default
    }

    if (this.squished) {
      this.animation.drawFrame(splatFrame);
    } else {
      this.animation.draw();
    }

    pop();
  }

  squish() {
    this.squished = true;
  }
}

class SpriteAnimation {
  constructor(sheet, startU, startV, duration) {
    this.sheet = sheet;
    this.u = startU;
    this.v = startV;
    this.duration = duration;
    this.startU = startU;
    this.frameCount = 0;
  }

  draw() {
    let frame = (floor(this.frameCount / 10) % this.duration) + this.startU;
    this.drawFrame(frame);
    this.frameCount++;
  }

  drawFrame(frame) {
    image(this.sheet, 0, 0, 80, 80, frame * 80, this.v * 80, 80, 80);
  }
}
