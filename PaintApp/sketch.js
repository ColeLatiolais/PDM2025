let colors = [
  "red", "orange", "yellow", "green", "cyan", "blue", "magenta", "brown", "white", "black"
];
let selectedColor = "black";
let paletteWidth = 50;
let prevX, prevY;
let canvasBuffer;

function setup() {
  createCanvas(600, 400);
  canvasBuffer = createGraphics(600, 400);
  canvasBuffer.background(255);
}

function drawPalette() {
  noStroke();
  for (let i = 0; i < colors.length; i++) {
    fill(colors[i]);
    rect(0, i * 40, paletteWidth, 40);
  }
}

function mousePressed() {
  if (mouseX < paletteWidth) {
    let index = floor(mouseY / 40);
    if (index >= 0 && index < colors.length) {
      selectedColor = colors[index];
    }
  }
  prevX = mouseX;
  prevY = mouseY;
}

function draw() {
  background(255);
  image(canvasBuffer, 0, 0);
  drawPalette();
  if (mouseIsPressed && mouseX > paletteWidth) {
    canvasBuffer.stroke(selectedColor);
    canvasBuffer.strokeWeight(3);
    canvasBuffer.line(prevX, prevY, mouseX, mouseY);
    prevX = mouseX;
    prevY = mouseY;
  }
}
