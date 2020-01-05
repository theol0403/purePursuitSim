
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
let points = [new WayPoint(1, 1, 0, 1), new WayPoint(5, 5, 0, 1), new WayPoint(7, 2, 3*Math.PI/2, 1)];
let bots = [];
let path = [];

let test = new QuinticSpline(points);

function main() {
  maintainCanvas();

  // points.push(new WayPoint(1, 1, 0, 1), new WayPoint(5, 5, 0, 1));
  bots.push(new PurePursuit(new Vector(1, 1)));
  console.log(test.getPath());

  animate();
}


function animate() {

  maintainCanvas();

  let waypoints = [];
  points.forEach(p => {
    p.vel = sliders.resolution;
  });

  // let test = new QuinticSpline(points);
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
