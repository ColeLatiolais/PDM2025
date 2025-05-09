let cyclops;
let helsing;
let character;
let character2;

function preload() {
  cyclops = loadImage("media/cyclops.png");
  helsing = loadImage("media/Van_Helsing.png");
}

function setup() {
  createCanvas(700, 700);
  imageMode(CENTER);

  character = new Character(random(80, width-80),random(80, height-80));
  character.addAnimation("down", new SpriteAnimation(cyclops, 6, 5, 6));
  character.addAnimation("up", new SpriteAnimation(cyclops, 0, 5, 6));
  character.addAnimation("right", new SpriteAnimation(cyclops, 1, 0, 8));
  character.addAnimation("left", new SpriteAnimation(cyclops, 1, 0, 8));
  character.addAnimation("stand", new SpriteAnimation(cyclops, 0, 0, 1));
  character.currentAnimation = "stand";

  character2 = new Character(random(80, width-80),random(80, height-80));
  character2.addAnimation("down", new SpriteAnimation(helsing, 6, 5, 6));
  character2.addAnimation("up", new SpriteAnimation(helsing, 0, 5, 6));
  character2.addAnimation("right", new SpriteAnimation(helsing, 1, 0, 8));
  character2.addAnimation("left", new SpriteAnimation(helsing, 1, 0, 8));
  character2.addAnimation("stand", new SpriteAnimation(helsing, 0, 0, 1));
  character2.currentAnimation = "stand";
}

function draw() {
  background(220);

  character.draw();
  character2.draw();
}

function keyPressed() {
  character.keyPressed();
  character2.keyPressed();
}

function keyReleased() {
  character.keyReleased();
  character2.keyReleased();
}

class Character {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.currentAnimation = null;
    this.animations = {};
  }

  addAnimation(key, animation) {
    this.animations[key] = animation;
  }

  draw() {
    let animation = this.animations[this.currentAnimation];
    if (animation) {
      switch (this.currentAnimation) {
        case "up":
          this.y -= 2;
          break;
        case "down": 
          this.y += 2;
          break;
        case "left":
          this.x -= 2;
          break;
        case "right":
          this.x += 2;
          break;
      }
      push();
      translate(this.x, this.y);
      animation.draw();
      pop();
    }
  }

  keyPressed() {
    switch(keyCode) {
      case UP_ARROW:
        this.currentAnimation = "up";
        break;
      case DOWN_ARROW:
        this.currentAnimation = "down";
        break;
      case LEFT_ARROW:
        this.currentAnimation = "left";
        this.animations[this.currentAnimation].flipped = true;
        break;
      case RIGHT_ARROW:
        this.currentAnimation = "right";
        break;
    }
  }
  
  keyReleased() {
    this.currentAnimation = "stand";
  }
}

class SpriteAnimation {
  constructor(spritesheet, startU, startV, duration) {
    this.spritesheet = spritesheet;
    this.u = startU;
    this.v = startV;
    this.duration = duration;
    this.startU = startU;
    this.frameCount = 0;
    this.flipped = false;
  }

  draw() {

    let s = (this.flipped) ? -1 : 1;
    scale(s,1);
    image(this.spritesheet, 0, 0, 80, 80, this.u*80, this.v*80, 80, 80);

    this.frameCount++;
    if (this.frameCount % 10 === 0)
      this.u++;

    if (this.u === this.startU + this.duration)
      this.u = this.startU;
  }
}