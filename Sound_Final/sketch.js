let bugSheet;
let bugs = [];
const bugCount = 5;
const splatFrame = 4;
let gameFont;
let score = 0;
let time = 30;
let gameState = "start";
let bugSpeed = 1;

// Sound elements
let synth = new Tone.Synth().toDestination();
let squishSynth, missSynth;
let humOsc, humFilter, humGain;
let melodySynth;
let melodyPart;
let melodyGain;

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

  switch (gameState) {
    case "start":
      drawStartScreen();
      break;
    case "play":
      drawGameplay();
      break;
    case "end":
      drawEndScreen();
      break;
  }
}

function drawStartScreen() {
  textAlign(CENTER, CENTER);
  textSize(16);
  text("Click ENTER to Start", width / 2, height / 2);
}

function drawGameplay() {
  textAlign(LEFT, TOP);
  text(`Score: ${score}`, 10, 10);

  textAlign(RIGHT, TOP);
  text(`Time: ${Math.ceil(time)}`, width - 10, 10);

  time -= deltaTime / 1000;
  if (time <= 0) {
    gameState = "end";
    stopBackgroundMusic();
  }

  adjustMusicForGame();

  if (frameCount % 300 === 0) {
    bugs.push(new Bug(random(80, width - 80), random(80, height - 80)));
  }

  for (let bug of bugs) {
    bug.update();
    bug.draw();
  }
}

function drawEndScreen() {
  textAlign(CENTER, CENTER);
  text("Game Over!", width / 2, height / 2 - 40);
  text(`Score: ${score}`, width / 2, height / 2);
  text("Press ENTER to Retry", width / 2, height / 2 + 40);
}

function keyPressed() {
  if (keyCode === ENTER) {
    if (gameState === "start" || gameState === "end") {
      Tone.start();
      resetGame();
      gameState = "play";
      startBackgroundMusic();
    }
  }
}

function mousePressed() {
  if (gameState !== "play") return;

  let hit = false;
  for (let bug of bugs) {
    if (!bug.squished && dist(mouseX, mouseY, bug.x, bug.y) < 40) {
      bug.squish();
      playSquishSound();
      score++;
      bugSpeed += 0.2;
      hit = true;
      break;
    }
  }

  if (!hit) {
    playMissSound();
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

// --------------------- SOUND ---------------------

function startMelody() {
  melodyGain = new Tone.Gain(0.1).toDestination();
  melodySynth = new Tone.Synth({
    oscillator: {
      type: "square"
    },
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.1,
      release: 0.1
    }
  }).connect(melodyGain);

  const notes = [
    ["0:0:0", "C5"],
    ["0:0:2", "E5"],
    ["0:1:0", "G5"],
    ["0:1:2", "A5"],
    ["0:2:0", "G5"],
    ["0:2:2", "E5"],
    ["0:3:0", "C5"],
    ["0:3:2", "D5"]
  ];

  melodyPart = new Tone.Part((time, note) => {
    melodySynth.triggerAttackRelease(note, "8n", time);
  }, notes);

  melodyPart.loop = true;
  melodyPart.loopEnd = "1m";
  melodyPart.start(0);
}

function stopMelody() {
  if (melodyPart) melodyPart.stop();
}

function startBackgroundMusic() {
  // Ambient hum
  humOsc = new Tone.Oscillator({ frequency: 70, type: "sine" });
  humFilter = new Tone.Filter({ frequency: 300, type: "lowpass", rolloff: -24 });
  humGain = new Tone.Gain(0.2);

  humOsc.chain(humFilter, humGain, Tone.Destination);
  humOsc.start();
  humGain.gain.linearRampTo(0.3, 2);

  // Start melody
  startMelody();
  Tone.Transport.start();
}

function stopBackgroundMusic() {
  if (humOsc) {
    humGain.gain.linearRampTo(0.0, 1);
    setTimeout(() => humOsc.stop(), 1000);
  }
  stopMelody();
  Tone.Transport.stop();
}

function adjustMusicForGame() {
  if (gameState === "play") {
    Tone.Transport.bpm.value = 90 + (bugSpeed * 10);
    synth.volume.value = map(bugSpeed, 1, 5, -12, 0);
  } else if (gameState === "end") {
    Tone.Transport.bpm.value = 60;
  }
}

function playSquishSound() {
  const squish = new Tone.NoiseSynth({
    volume: -12,
    noise: { type: "white" },
    envelope: {
      attack: 0.001,
      decay: 0.2,
      sustain: 0,
      release: 0.05
    },
    filterEnvelope: {
      attack: 0.001,
      decay: 0.1,
      sustain: 0,
      release: 0.05,
      baseFrequency: 600,
      octaves: -2
    }
  }).toDestination();

  squish.triggerAttackRelease("16n");
}

function playMissSound() {
  const womp = new Tone.MonoSynth({
    oscillator: { type: "square" },
    envelope: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0,
      release: 0.1
    }
  }).toDestination();

  womp.triggerAttackRelease("C2", "8n");
}

// --------------------- Bug & Animation ---------------------

class Bug {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.squished = false;
    this.dir = p5.Vector.random2D();
    this.animation = new SpriteAnimation(bugSheet, 0, 0, 4);
    this.splatTimer = 0;
  }

  update() {
    if (this.squished) {
      this.splatTimer++;
      if (this.splatTimer > 30) {
        this.respawn();
      }
      return;
    }

    this.x += this.dir.x * bugSpeed;
    this.y += this.dir.y * bugSpeed;

    if (this.x < 40 || this.x > width - 40) this.dir.x *= -1;
    if (this.y < 40 || this.y > height - 40) this.dir.y *= -1;
  }

  draw() {
    push();
    translate(this.x, this.y);
    if (!this.squished) rotate(this.dir.heading() + HALF_PI);
    this.squished ? this.animation.drawFrame(splatFrame) : this.animation.draw();
    pop();
  }

  squish() {
    this.squished = true;
  }

  respawn() {
    this.x = random(80, width - 80);
    this.y = random(80, height - 80);
    this.dir = p5.Vector.random2D();
    this.squished = false;
    this.splatTimer = 0;
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
    const frame = (floor(this.frameCount / 10) % this.duration) + this.startU;
    this.drawFrame(frame);
    this.frameCount++;
  }

  drawFrame(frame) {
    image(this.sheet, 0, 0, 80, 80, frame * 80, this.v * 80, 80, 80);
  }
}
