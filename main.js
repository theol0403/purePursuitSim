
/**
 * Canvas DOM setup
 */
const canvas = document.getElementById("c");
const c = canvas.getContext("2d");

const resolutionSlider = document.getElementById('resolutionSlider');
const curveSlider = document.getElementById('curveSlider');
const toleranceSlider = document.getElementById('toleranceSlider');

const resValue = document.getElementById('resValue');
const curveValue = document.getElementById('curveValue');
const tolValue = document.getElementById('tolValue');

var tooltip = document.getElementById('tooltip-span');

canvas.addEventListener("mousedown", click);
canvas.addEventListener("mousemove", move);
canvas.addEventListener("mouseup", end);
canvas.addEventListener("contextmenu", right);
window.addEventListener("keydown", keydown);
window.addEventListener("keyup", keyup);
$(window).bind('mousewheel DOMMouseScroll', zoom);
window.focus();

/**
 * Canvas Constants
 */
let canvasScale = 80; //ratio between simulated position and canvas position
const marginOffset = 9; //correction for canvas choords vs window choords. related to margin
canvas.width = window.innerWidth - marginOffset * 2;
canvas.height = window.innerHeight - 80;

/**
 * Pursuit Constants
 */
const minVel = 1;
const maxVel = 8;
const maxAccel = 6;
const turnK = 20;

/**
 * Starting points
 */
let points = [];
let bots = [];
let path = [];


function main() {
  points.push({ x: 1, y: 1 });
  points.push({ x: 5, y: 4 });
  points.push({ x: 9, y: 2 });
  bots.push(new Bot(localToCanvas(points[0]).x, localToCanvas(points[0]).y, -0.5 * PI));
  animate();
}


function animate() {

  maintainCanvas();

  /**
   * Pure Pursuit Algorithm
   */
  path = insertPoints(points, sliders.resolution);
  path = smoothen(path, sliders.curve, sliders.tolerance);

  path = computeDistances(path);
  path = computeCurvatures(path);
  path = computeVelocity(path, maxVel, maxAccel, turnK);
  path = limitVelocity(path, minVel, maxAccel**2);

  bots.forEach((bot) => {
    let pursuit = update(path, bot.getLocalPos(), bot.getHeading(), 0.2);
    bot.tank(pursuit.left/maxVel, pursuit.right/maxVel);
    bot.update();

    drawLookahead(bot.getCanvasPos(), pursuit.lookahead);
    drawClosest(bot.getCanvasPos(), pursuit.closest);
    drawCurvature(pursuit.curvature, bot.getLocalPos(), pursuit.lookahead);
    bot.draw();
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
