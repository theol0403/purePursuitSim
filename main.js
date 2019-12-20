

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
let waypoints = [new WayPoint(1, 1, 0, 0.04, 0), new WayPoint(4, 4, Math.PI/2, 0.02, 0), new WayPoint(7, 4, 0, 0.03 , 0), new WayPoint(2, 2, Math.PI/2 + 0.3, 0.03, 0)];
let test = new QuinticPathPlanner(waypoints, 15, 25, 3);

function main() {
  maintainCanvas();

  points.push(new Vector(1, 1));
  bots.push(new PurePursuit(new Vector(1, 1)));
  path = test.getPath();; 
  animate();
}


function animate() {

  maintainCanvas();

  /**
   * Pure Pursuit Algorithm
   */
  // path = insertPoints(points, sliders.resolution);
  // path = smoothen(path, 0.25, 1e-10);

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
