
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
const maxVel = 10;
const maxAccel = 5;
const turnK = 20;

/**
 * Starting points
 */
let points = [];
let vectors = [];
let bots = [];
let path = [];

function main() {
  points.push({ x: 1, y: 1 });
  points.push({ x: 5, y: 4 });
  points.push({ x: 9, y: 2 });
  vectors.push({ x: 1.001, y: 3 });
  vectors.push({ x: 5.001, y: 2 });
  vectors.push({ x: 7.001, y: 2 });
  bots.push(new Bot(localToCanvas(points[0]).x, localToCanvas(points[0]).y, -0.5 * PI));
  animate();
}

function animate() {
  path = [];

  maintainCanvas();

  /**
   * Pure Pursuit Algorithm
   */
  if( points.length = vectors.length ){
    for( let i = 0; i <= points.length; i++ ){
      for( let ij = 0; ij <= 1; ij += 1/20 ){
        let newPoint = findHermitePoint( ij, points[0], vectors[0], points[1], vectors[1] );
//        console.log(newPoint);
        path.push(newPoint);
      }
    }
  }else{
//    console.log( "Error: Line 70 in main.js: Initialize a vector point for each point." )
  }
  
//  path = smoothen(path, sliders.curve, sliders.tolerance);

  path = computeDistances(path);
  path = computeCurvatures(path);
  path = computeVelocity(path, maxVel, maxAccel, turnK);
  path = limitVelocity(path, minVel, maxVel);

  bots.forEach((bot) => {
    let pursuit = update(path, bot.getLocalPos(), bot.getHeading(), 0.4);
    bot.tank(pursuit.left/maxVel, pursuit.right/maxVel);
    bot.update();

    drawLookahead(bot.getCanvasPos(), pursuit.lookahead);
    drawClosest(bot.getCanvasPos(), pursuit.closest);
    // drawCurvature(pursuit.curvature, bot.getLocalPos(), pursuit.lookahead);
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
