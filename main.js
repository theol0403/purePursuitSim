
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


let canvasScale = 80;
const lineWidth = 1;

const waypointWidth = 4;
const pointWidth = 2;

const marginOffset = 9; //correction for canvas choords vs window choords. related to margin

const minVel = 1;
const maxVel = 8;
const maxAccel = 10;
const turnK = 10;

canvas.width = window.innerWidth - marginOffset * 2;
canvas.height = window.innerHeight - 80;

let points = [
{ x: 1, y: 1 },
{ x: 5, y: 3 },
{ x: 9, y: 2 },
];

let path = [];


let botPos = localPointToCanvasPoint(points[0]);
let bot = new Bot(botPos.x, botPos.y, 0);

function animate() {

  /* maintain canvas */
  canvas.width = window.innerWidth - marginOffset * 2;
  canvas.height = window.innerHeight - 80;
  c.lineWidth = lineWidth;

  /* slider value calculations */
  let resolution = resolutionSlider.value / 1000;
  resValue.innerHTML = resolution;

  let curve = curveSlider.value / 1000;
  curveValue.innerHTML = curve;

  let tolerance = Math.pow(10, -toleranceSlider.value / 100) * 100;
  tolValue.innerHTML = tolerance;


  /* path calculations */
  path = insertPoints(points, resolution);
  path = smoothen(path, curve, tolerance);
  path = computeDistances(path);
  path = computeCurvatures(path);
  path = computeVelocity(path, maxVel, maxAccel, turnK);
  path = limitVelocity(path, minVel, maxAccel);
  // for (let i = 0; i < path.length; i++) {
  //   console.log(i, path[i].loc);
  // }


  botPos = canvasPointToLocalPoint(bot.getPos());
  let velocities = update(path, new Vector(botPos.x, botPos.y), bot.getHeading(), 0.5);
  bot.tank(velocities.left/maxVel, velocities.right/maxVel);
  bot.update();

  /* draw waypoints and path */
  drawWaypoints(points);
  drawPath(path, a => a.velocity, minVel, maxVel);

  if (showRect) {
    c.beginPath();
    c.lineWidth = "2";
    c.strokeStyle = "#000";
    c.rect(rectangle[0].x, rectangle[0].y, rectangle[1].x - rectangle[0].x, rectangle[1].y - rectangle[0].y);
    c.stroke();
  }

  // debugger;
  requestAnimationFrame(animate);
}


window.onload = animate;
