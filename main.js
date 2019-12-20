

/**
 * Pursuit Constants
 */
const minVel = 2;
const maxVel = 8;
const maxAccel = 15;
const turnK = 20;

/**
 * Starting points
 */
let points = [];
let bots = [];
let path = [];
let test = new QuinticSegmentPlanner(1, 1, Math.PI/2, 0.01, 0, 8, 4, Math.PI, 0.03, 0, 50, 35, 1.5);

function main() {
  maintainCanvas();

  points.push(new Vector(1, 1));
  bots.push(new PurePursuit(new Vector(1, 1)));
  animate();
}


function animate() {

  maintainCanvas();

  /**
   * Pure Pursuit Algorithm
   */
  // path = insertPoints(points, sliders.resolution);
  // path = smoothen(path, 0.25, 1e-10);

  // path = computeCurvatures(path);
  // path = computeVelocity(path, maxVel, maxAccel, turnK);

  path = test.getPath();

  bots.forEach((bot, i) => {
    bot.setPath(path);
    bot.setLookDistance(sliders.lookahead);
    bot.setRobotTrack(1/12.8);

    bot.update();
    if(bot.isFinished) {
      bots.splice(i, 1);
    }
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
