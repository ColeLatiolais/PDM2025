let synth1, filt, rev, polySynth, noise1, noise2, ampEnv1, ampEnv2, filt1;
let filtSlider;
let activeKey = null;

let keyNotes = {
  'a': 'A4',
  's': 'B4',
  'd': 'C5',
  'f': 'D5'
}

let keyNotes1 = {
  'q': 'C4',
  'w': 'D4',
  'e': 'E4',
  'r': 'F4',
  't': 'G4',
  'y': 'A4',
  'u': 'B4',
  'i': 'C5'
};


function setup() {
  createCanvas(400, 400);
  filtSlider = createSlider(200, 5000, 1500);
  filtSlider.position(20, height - 30);
  filtSlider.style('width', '200px');
  filt = new Tone.Filter(1500, "lowpass").toDestination();
  rev = new Tone.Reverb(2).connect(filt);
  synth1 = new Tone.Synth({
    envelope: {
      attack: 0.1,
      decay: 0.2,
      sustain: 0.9,
      release: 0.3
    }
  }).connect(rev);
  synth1.portamento.value = 0.5;
  polySynth = new Tone.PolySynth(Tone.Synth).connect(rev);
  polySynth.set({
    envelope: {
      attack: 0.1,
      decay: 0.1,
      sustain: 1,
      release: 0.1
    },
    oscillator: {
      type: 'sawtooth'
    }
  })
  polySynth.volume.value = -6;
  ampEnv1 = new Tone.AmplitudeEnvelope({
    attack: 0.1,
    decay: 0.5,
    sustain: 0,
    release: 0.1
  }).toDestination();
  filt1 = new Tone.Filter(1500, "highpass").connect(ampEnv1);
  noise1 = new Tone.Noise('pink').start().connect(filt1)
}

function draw() {
  background(220);
  filt.frequency.rampTo(filtSlider.value(), 0.1);
  text("PolySynth Keys (q-i): C4–C5\nMonoSynth Keys (a-f): A4–D5\n'z' = Noise Hit\nUse slider to adjust filter cutoff", 20, 20);
  text("Filter Cutoff: " + filtSlider.value(), 20, height - 40);
}

function keyPressed() {
  let pitch = keyNotes[key];
  let pitch1 = keyNotes1[key];
  if (pitch && key !== activeKey) {
    synth1.triggerRelease();
    activeKey = key;
    synth1.triggerAttack(pitch);
  } else if (pitch1) {
    polySynth.triggerAttack(pitch1);
  } else if (key === "z") {
    ampEnv1.triggerAttackRelease(0.1);
  }
}

function keyReleased() {
  let pitch1 = keyNotes1[key];
  if (key === activeKey) {
    synth1.triggerRelease();
    activeKey = null;
  } else if (pitch1) {
    polySynth.triggerRelease(pitch1);
  }
}