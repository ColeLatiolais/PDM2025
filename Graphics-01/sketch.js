function setup() {
  createCanvas(700, 700);
  colorMode(RGB);
  angleMode(DEGREES);
}

function draw() {
  background(250);
  stroke('black');
  strokeWeight(1);

  //top left square - ex1
  fill(119, 242, 59);
  square(0, 0, 350);

  fill(250);
  circle(125, 125, 50);
  square(165, 100, 50);

  //top right square - ex2
  fill(250);
  square(350, 0, 350);

  noStroke();
  fill(255, 170, 169);
  circle(525, 100, 100);
  fill(100, 255, 100, 125);
  circle(558, 155, 100);
  fill(100, 100, 255, 125);
  circle(492, 155, 100);
  stroke('black');

  //bottom left square - ex3
  fill(0);
  square(0, 350, 350);

  noStroke();

  fill(255, 248, 74);
  arc(125, 475, 50, 50, 225, 135);

  fill(234, 65, 44); 
  rect(165, 475, 50, 25);
  circle(190, 475, 50);

  fill(255);
  circle(177, 475, 15);
  circle(203, 475, 15);

  fill(0, 68, 247);
  circle(177, 475, 10);
  circle(203, 475, 10);

  stroke('black');

  //bottom right square - ex4
  fill(0, 0, 129);
  square(350, 350, 350);

  stroke('white');
  strokeWeight(3);
  fill(0, 128, 0);
  circle(525, 525, 100);

  fill(255, 0, 0);
  beginShape();
  vertex(525, 545); 
  vertex(495, 570); //bottom left tip
  vertex(510, 530);
  vertex(475, 510); //upper left tip
  vertex(515, 510);
  vertex(525, 475); //top of the star
  vertex(535, 510);
  vertex(575, 510); //upper right tip
  vertex(540, 530);
  vertex(555, 570); //bottom right tip
  vertex(525, 545); 
  endShape();
  //    I worked on the star starting at the 
  // top tip and then tried mimicing each side 
  // above and below that part of code 
}
