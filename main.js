
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

  points.push(new Vector(1, 1), new Vector(5, 5));
  bots.push(new PurePursuit(new Vector(1, 1)));

  animate();
}


function animate() {

  maintainCanvas();

  let waypoints = [];
  points.forEach(p => {waypoints.push(new WayPoint(p.x, p.y, 0, sliders.resolution))});

  let test = new QuinticPathPlanner(waypoints);
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
