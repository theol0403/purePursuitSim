
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
const minVel = 2;
const maxVel = 8;
const maxAccel = 10;
const turnK = 10;

/**
 * Starting points
 */
let points = [];
let bots = [];
let path = [];

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
  // path = limitVelocity(path, minVel, maxVel);

  bots.forEach((bot) => {
    let pursuit = update(path, bot.getLocalPos(), bot.getHeading(), 0.5);
    bot.tank(pursuit.left/maxVel, pursuit.right/maxVel);
    bot.update();

    drawLookahead(bot.getCanvasPos(), pursuit.lookahead);
    drawClosest(bot.getCanvasPos(), pursuit.closest);
    // drawCurvature(pursuit.curvature, canvasPos, pursuit.lookahead);
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

function test() {

  maintainCanvas();

  drawWaypoints(points);

  let curvature = computeSingleCurvature(new WayPoint(points[0].x, points[0].y), new WayPoint(points[1].x, points[1].y), new WayPoint(points[2].x, points[2].y));
  // drawCurvature(curvature, points[1], points[2]);

  points[0] = {x:points[2].x,y:points[2].y - (points[2].y - points[1].y) * 2};

  c.beginPath();
  c.moveTo(localToCanvas(points[1]).x, localToCanvas(points[1]).y);
  c.lineTo(localToCanvas(points[1]).x + 1/curvature*canvasScale, localToCanvas(points[1]).y);
  c.closePath();
  c.stroke();

  c.beginPath();
  c.arc(localToCanvas(points[1]).x + 1/curvature*canvasScale, localToCanvas(points[1]).y, Math.abs(1/curvature*canvasScale), 0, Math.PI * 2);
  c.closePath();
  c.stroke();


  bots.forEach((bot) => {
    // let pursuit = update(path, bot.getLocalPos(), bot.getHeading(), 0.5);
    // bot.tank(pursuit.left/maxVel, pursuit.right/maxVel);
    // bot.update();
    // drawLookahead(bot.getCanvasPos(), pursuit.lookahead);
    // drawClosest(bot.getCanvasPos(), pursuit.closest);
    bot.draw();
  });

  // debugger;
  requestAnimationFrame(test);
}





function main() {
  // points.push({ x: 1, y: 1 });
  // points.push({ x: 5, y: 4 });
  // points.push({ x: 9, y: 2 });
  // bots.push(new Bot(localToCanvas(points[0]).x, localToCanvas(points[0]).y, 0));
  // animate();

  points.push({x:4, y:1});
  points.push({x:2, y:3});
  points.push({x:4, y:5});
  bots.push(new Bot(localToCanvas(points[1]).x, localToCanvas(points[1]).y, -0.5 * PI));
  test();
}

window.onload = main;
