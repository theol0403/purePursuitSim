

/**
 * Pursuit Constants
 */
const minVel = 2;
const maxVel = 8;
const maxAccel = 5;
const turnK = 20;

/**
 * Starting points
 */
let points = [];
let bots = [];
let path = [];


function main() {
  maintainCanvas();

  points.push(new Vector(1, 1));
  points.push(new Vector(5, 4));
  points.push(new Vector(9, 2));
  bots.push(new Bot(localToCanvas(points[0]).x, localToCanvas(points[0]).y, -0.5 * PI));
  animate();
}


function animate() {

  maintainCanvas();

  /**
   * Pure Pursuit Algorithm
   */
  path = insertPoints(points, sliders.resolution);
  path = smoothen(path, 0.25, 1e-15);

  path = computeDistances(path);
  path = computeCurvatures(path);
  path = computeVelocity(path, maxVel, maxAccel, turnK);
  path = limitVelocity(path, minVel, maxAccel**2);

  bots.forEach((bot) => {

  });

  /**
   * Canvas Drawing
   */
  drawWaypoints(points);
  drawPath(path, a => a.velocity, minVel, maxVel);

  // debugger;
  requestAnimationFrame(animate);
}



window.onload = main;
