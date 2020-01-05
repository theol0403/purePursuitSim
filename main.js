
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

function main() {
  maintainCanvas();

  points.push(new WayPoint(1, 1, 0), new WayPoint(5, 5, 0), new WayPoint(7, 2, 3*Math.PI/2));
  bots.push(new PurePursuit(new Vector(1, 1)));

  animate();
}


function animate() {

  maintainCanvas();

  let test = new QuinticPathPlanner(points, 0.01, sliders.scalar);
  path = test.getPath();

  /**
   * Pure Pursuit Algorithm
   */

  path = computeCurvatures(path);
  path = computeVelocity(path, maxVel, maxAccel, turnK);


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
