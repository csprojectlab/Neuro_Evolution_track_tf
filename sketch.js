const TOTAL = 100;
const MUTATION_RATE = 0.1;
const LIFESPAN = 25;
const SIGHT = 50;
const PIN_LENGTH = 50;

let generationCount = 1;

let walls = [];
let ray;

let population = [];
let savedParticles = [];

let start, end;

let speedSlider;

let inside = [];
let outside = [];
let checkpoints = [];

/**
 * 5 to 6 successfully completed rounds will make the fitness of 500+. So max
 * fitness is set to 500. Thus the changeMap flag becomes true and we will create 
 * new map when any of the particle completes multiple rounds in current map.
 * This will help to make the current generation to work on new map and generalize 
 * to variety of maps.
 */
const maxFitness = 500;
let changeMap = false;

// Image of car.
let carIcon;

// Speedometer.
let currentSpeed = null;
let speedometer;

/**
 * Slider for making project more reponsive
 */
let checkpointsSlider;
let noiseSlider;
let widthSlider;

/**
 * Checkboxes
 */
let regenerateCB;
let showRaysCB;
let showGoalsCB;
let audioCB;
var ding;
var peelOut;

/**
 * Variable of implementation of noLoop and loop functionality.
 */
let pause = false

function buildTrack() {
  checkpoints = [];
  inside = [];
  outside = [];

  // let noiseMax = 3;
  // const total = 60;     // Checkpoints => More means smoother track.
  // const pathWidth = 60;
  let noiseMax = noiseSlider.value();
  const total = checkpointsSlider.value();
  const pathWidth = widthSlider.value();
  let startX = random(1200);
  let startY = random(1000);
  for (let i = 0; i < total; i++) {
    let a = map(i, 0, total, 0, TWO_PI);
    let xoff = map(cos(a), -1, 1, 0, noiseMax) + startX;
    let yoff = map(sin(a), -1, 1, 0, noiseMax) + startY;
    let xr = map(noise(xoff, yoff), 0, 1, 100, width * 0.5);
    let yr = map(noise(xoff, yoff), 0, 1, 100, height * 0.5);
    let x1 = width / 2 + (xr - pathWidth) * cos(a);
    let y1 = height / 2 + (yr - pathWidth) * sin(a);
    let x2 = width / 2 + (xr + pathWidth) * cos(a);
    let y2 = height / 2 + (yr + pathWidth) * sin(a);
    checkpoints.push(new Boundary(x1, y1, x2, y2));
    inside.push(createVector(x1, y1));
    outside.push(createVector(x2, y2));
  }
  walls = [];
  for (let i = 0; i < checkpoints.length; i++) {
    let a1 = inside[i];
    let b1 = inside[(i + 1) % checkpoints.length];
    walls.push(new Boundary(a1.x, a1.y, b1.x, b1.y));
    let a2 = outside[i];
    let b2 = outside[(i + 1) % checkpoints.length];
    walls.push(new Boundary(a2.x, a2.y, b2.x, b2.y));
  }

  start = checkpoints[0].midpoint();
  end = checkpoints[checkpoints.length - 1].midpoint();
}     // End of buildTrack function.

function changeTrack() {
  generationCount = 1;
  buildTrack();
  for (let i = 0; i < TOTAL; i++) {
      population[i] = new Particle();        
  }
}   // End of changeTrack function.


function keyPressed () {
  console.log("Key pressed")
  if (key == 'r' || key == 'R')
    showRaysCB.checked(!showRaysCB.checked());
  else if (key == 'g' || key == 'G')
    showGoalsCB.checked(!showGoalsCB.checked());
  else if (key == 't' || key == 'T') {
    regenerateCB.checked(!regenerateCB.checked());
    changeTrack();
  } else if (key == 'a' || key == 'A') {
    audioCB.checked(!audioCB.checked())
  } else if (key == ' ') {
    if (!pause) {
      pause = true;
      noLoop();
    } else {
      pause = false;
      loop()
    }
  }

}   // End of keyPressed function.

function preload () {
  //carIcon = loadImage("car.png", () => console.log("Car image is loaded."));
  ding = loadSound('ding2.wav', () => console.log("Ding sound loaded"));
  peelOut = loadSound('car-drive.wav', () => console.log("Drive out sound loaded"))
}   // End of preload function.


function setup() {
  createCanvas(1200, 900);
  tf.setBackend('cpu');       // Set CPU as back end for processing.
  
  //speedSlider = createSlider(1, 10, 1);
  speedometer = new Meter(1100, 70);

  showRaysCB = createCheckbox('Show rays (r)', false);
  showGoalsCB = createCheckbox('Show goals (g)', false);
  regenerateCB = createCheckbox('Reset track', false);
  audioCB = createCheckbox('Goal audio (a)', false);
  regenerateCB.changed(changeTrack);

  createSpan('Speed:');
  speedSlider = createSlider(1, 10, 1);
  createSpan('Checkpoints:');
  checkpointsSlider = createSlider(20, 200, 30);
  createSpan('Noise:');
  noiseSlider = createSlider(1, 5, 2);
  createSpan('Width:');
  widthSlider = createSlider(10, 150, 30);

  checkpointsSlider.changed(changeTrack);
  noiseSlider.changed(changeTrack);
  widthSlider.changed(changeTrack);

  buildTrack();
  for (let i = 0; i < TOTAL; i++) {
    population[i] = new Particle();
  }  

  setInterval(() => {
    if (audioCB.checked())
      peelOut.play();
  }, 3000)
}     // End of setup function.

function draw() {
  const cycles = speedSlider.value();
  background(0);

  let bestP = population[0];      // Best car particle.
  for (let n = 0; n < cycles; n++) {
    for (let particle of population) {
      particle.look(walls);       // Looking at the walls.
      particle.check(checkpoints);
      particle.bounds();
      particle.update();
      particle.show();

      // Get the best one
      if (particle.fitness > bestP.fitness) {
        bestP = particle;
      }
    }

    for (let i = population.length - 1; i >= 0; i--) {
      const particle = population[i];
      if (particle.dead || particle.finished) {
        savedParticles.push(population.splice(i, 1)[0]);
      }

      if (!changeMap && particle.fitness > maxFitness) {
        changeMap = true;
      }
    }

    if (population.length !== 0 && changeMap) {   // Means fitness of a particle has reached the maxFitness.
      for (let i = population.length - 1; i >= 0; i--) {
        savedParticles.push(population.splice(i, 1)[0]);
      }

      buildTrack();
      nextGeneration();
      generationCount++;
      changeMap = false;
    }

    if (population.length == 0) {
      buildTrack();
      nextGeneration();
      generationCount++;
    }
  }

  
  for (let wall of walls) {
    wall.show();
  }
  for (let particle of population) {
    particle.show();
  }

  bestP.highlight();

  fill(255, 0, 0);
  textSize(24);
  strokeWeight(2);
  text('Generation: ' + generationCount + ' {Population: '+ population.length + '}', 10, 35);
  textSize(16)
  strokeWeight(1);
  text('Speed: ' + currentSpeed.toPrecision(4), 1050, 100)
  speedometer.show();

  stroke(0, 0, 255);
  textSize(10);
  text("0", 1040, 73)
  text("50", 1155, 73)

  // ellipse(start.x, start.y, 10);
  // ellipse(end.x, end.y, 10);

  fill(255);
  textSize(16);
  noStroke();
  text('Frame Rate: ' + speedSlider.value(), 10, 60);
  text('Checkpoints: ' + checkpointsSlider.value(), 10, 80);
  text('Noise: ' + noiseSlider.value(), 10, 100);
  text('Track width: ' + widthSlider.value(), 10, 120);  
}
