let port;
let connectionButton, zeroButton;
let cursorX, cursorY;
let speed = 0.01;
let board;
let lastButtonState = 0;
let lastMoveTime = 0;
let moveDelay = 300; // milliseconds between moves

// Sum of numbers for each row and column
let rowSums = [];
let colSums = [];
let rowVoltorbs = [];
let colVoltorbs = [];

class Board {
  constructor(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    this.grid = [];
  
    // Initialize row/column sums and Voltorbs
    rowSums = Array(rows).fill(0);
    colSums = Array(cols).fill(0);
    rowVoltorbs = Array(rows).fill(0);
    colVoltorbs = Array(cols).fill(0);
  
    // Calculate the number of Voltorbs and 1's
    let numVoltorbs = floor(random(6, 11)); // Between 6 and 10 Voltorbs
    let numOnes = floor(random(5, 10));     // Between 5 and 9 1's
    let numTwoThree = 25 - numVoltorbs - numOnes;
  
    // Create values array
    let values = [];
  
    for (let i = 0; i < numVoltorbs; i++) values.push('V');
    for (let i = 0; i < numOnes; i++) values.push(1);
    for (let i = 0; i < numTwoThree; i++) values.push(random() < 0.5 ? 2 : 3);
  
    // Manual Fisher-Yates shuffle for values
    for (let i = values.length - 1; i > 0; i--) {
      let j = floor(random(i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }
  
    // Fill grid and assign values
    let index = 0;
    for (let y = 0; y < rows; y++) {
      this.grid[y] = [];
      for (let x = 0; x < cols; x++) {
        let val = values[index++];
        this.grid[y][x] = {
          value: val,
          flipped: false
        };
  
        if (val === 'V') {
          rowVoltorbs[y]++;
          colVoltorbs[x]++;
        } else {
          rowSums[y] += val;
          colSums[x] += val;
        }
      }
    }
  }

  flip(x, y) {
    this.grid[y][x].flipped = true;
    return this.grid[y][x].value;
  }

  display(cursorX, cursorY) {
    let w = 500 / this.cols;
    let h = 500 / this.rows;
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        stroke(0);
        let tileX = x * w;
        let tileY = y * h;
        noStroke();
        // Draw tile background
        noStroke();
        fill(100, 149, 237);
        rect(tileX, tileY, w, h);

        fill(173, 216, 230);
        rect(tileX + w / 4 - 5, tileY + h / 4 - 5, 27, 27);         
        rect(tileX + w / 2 - 5, tileY + h / 2 - 1, 15, 15);         
        rect(tileX + 3 * w / 4 - 5, tileY + 2 * h / 4 - 7, 10, 10); 

        stroke(0);
        noFill();
        rect(tileX, tileY, w, h);


        if (this.grid[y][x].flipped) {
          fill(0);
          textSize(24);
          textAlign(CENTER, CENTER);
          text(this.grid[y][x].value, x * w + w / 2, y * h + h / 2);
        }
      }
    }

    // Draw cursor
    noFill();
    stroke(255, 0, 0);
    strokeWeight(4);
    rect(cursorX * w, cursorY * h, w, h);
  }
}

function setup() {
  createCanvas(700, 700);
  
  port = createSerial();
  connectionButton = createButton('Connect');
  connectionButton.mousePressed(connect);

  zeroButton = createButton('Zero Joystick');
  zeroButton.mousePressed(zero);

  cursorX = 0;
  cursorY = 0;

  board = new Board(5, 5); // 5x5 grid
}

function draw() {
  background(220);

  // Read from Arduino
  let str = port.readUntil('\n');
  if (str !== "") {
    const values = str.split(',');
    if (values.length === 3) {
      let x = Number(values[0]);
      let y = Number(values[1]);
      let sw = Number(values[2]);

      // Only update the cursor position if enough time has passed
      let currentTime = millis();
      if (currentTime - lastMoveTime > moveDelay) {
        // Joystick movement thresholds
        let xThreshold = 150;
        let yThreshold = 150;

        // Update cursor based on joystick movement
        if (x < -xThreshold) {
          cursorX = max(0, cursorX - 1);
          lastMoveTime = currentTime; // Update last move time
        } else if (x > xThreshold) {
          cursorX = min(4, cursorX + 1);
          lastMoveTime = currentTime; // Update last move time
        }

        if (y < -yThreshold) {
          cursorY = max(0, cursorY - 1);
          lastMoveTime = currentTime; // Update last move time
        } else if (y > yThreshold) {
          cursorY = min(4, cursorY + 1);
          lastMoveTime = currentTime; // Update last move time
        }
      }

      // Flip tile on button press (debounced)
      if (sw === 1 && lastButtonState === 0) {
        let result = board.flip(cursorX, cursorY);
        playSound(result); // Play sound with Tone.js
        if (result === 'V') {
          port.write("redOn\n"); // Activate red LED
        } else {
          port.write("greenOn\n"); // Activate green LED
        }
      }
      lastButtonState = sw;
    }
  }

  board.display(cursorX, cursorY); // Display game board

  // Display row/column sums and Voltorbs off to the right and below the grid
  displaySumsAndVoltorbs();
}

// Function to display row/column sums and Voltorbs
function displaySumsAndVoltorbs() {
  // Set background for info area
  noStroke();
  fill(100, 149, 237);
  rect(502, 0, 200, 700);
  rect(0, 502, 700, 200); 

  fill(0);
  noStroke();
  textSize(16);
  textAlign(LEFT, TOP);

  for (let i = 0; i < board.rows; i++) {
    text(`${rowSums[i]}`, 545, 50 + i * 100); // left column for row sums
    text(`${rowVoltorbs[i]}`, 640, 50 + i * 100); // right column for Voltorbs
  }

  // Display column sums/Voltorbs (below the grid)
  textAlign(CENTER, TOP);
  text(`Sum`, 550, 545);
  text(`Voltorbs`, 550, 640);
  text(`Voltorbs`, 640, 545);
  for (let j = 0; j < board.cols; j++) {
    text(`${colSums[j]}`, 50 + j * 100, 545); // Display sum for column
    text(`${colVoltorbs[j]}`, 50 + j * 100, 640); // Display Voltorbs for column
  }
}


function connect() {
  port.open('Arduino', 9600);
}

function zero() {
  if (port.opened()) {
    port.write('zero\n');
  }
}

function playSound(val) {
  const voltorbSynth = new Tone.MembraneSynth().toDestination();
  const rewardSynth = new Tone.Synth().toDestination();

  if (val === 'V') {
    voltorbSynth.triggerAttackRelease("C2", "8n");
  } else if (val === 2 || val === 3) {
    rewardSynth.triggerAttackRelease("G4", "8n");
  } else {
    rewardSynth.triggerAttackRelease("E4", "8n");
  }
}
