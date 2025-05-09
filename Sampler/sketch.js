let startContext, samples, button1, button2, button3, button4;
let wahSlider, tremoloSlider;

let wah = new Tone.AutoWah({
  baseFrequency: 100,
  octaves: 2.6,
  sensitivity: -30,
  Q: 6,
  gain: 2,
  follower: 0.1,
  wet: 1
});

let tremolo = new Tone.Tremolo({
  frequency: 4,
  depth: 0,
  spread: 180
}).start();

wah.connect(tremolo);
tremolo.toDestination();

function preload() {
  samples = new Tone.Players({
    frog: "media/frog.mp3",
    thunder: "media/thunder.mp3",
    harp: "media/harp.mp3",
    laser: "media/laser-light.mp3"
  }).connect(wah);
}

function setup() {
  createCanvas(400, 400);

  startContext = createButton("Start Audio Context");
  startContext.position(0, 0);
  startContext.mousePressed(startAudioContext);

  button1 = createButton("Play Frog Sample");
  button1.position(10, 30);
  button2 = createButton("Play Thunder Sample");
  button2.position(200, 30);
  button3 = createButton("Play Harp Sample");
  button3.position(10, 70);
  button4 = createButton("Play Laser Light Sample");
  button4.position(200, 70);

  button1.mousePressed(() => { samples.player("frog").start(); });
  button2.mousePressed(() => { samples.player("thunder").start(); });
  button3.mousePressed(() => { samples.player("harp").start(); });
  button4.mousePressed(() => { samples.player("laser").start(); });

  wahSlider = createSlider(50, 1000, 100, 1);
  wahSlider.position(10, 140);
  wahSlider.input(() => {
    wah.baseFrequency = wahSlider.value();
  });

  // i like this one for what it does in particular to the Laser Light audio
  tremoloSlider = createSlider(0, 1, 0, 0.01);
  tremoloSlider.position(200, 140);
  tremoloSlider.input(() => {
    tremolo.depth = tremoloSlider.value();
  });
}

function draw() {
  background(220);
  text("Wah Base Frequency: " + wahSlider.value(), 15, 130);
  text("Tremolo Depth: " + tremoloSlider.value(), 205, 130);
}

function startAudioContext() {
  if (Tone.context.state !== 'running') {
    Tone.start();
    console.log("Audio Context Started");
  } else {
    console.log("Audio Context is already running");
  }
}
