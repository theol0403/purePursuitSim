
const canvas = document.getElementById("c");
const c = canvas.getContext("2d");

const resolutionSlider = document.getElementById('resolutionSlider');
const curveSlider = document.getElementById('curveSlider');
const toleranceSlider = document.getElementById('toleranceSlider');

const resValue = document.getElementById('resValue');
const curveValue = document.getElementById('curveValue');
const tolValue = document.getElementById('tolValue');

canvas.addEventListener("mousedown", click);
canvas.addEventListener("mousemove", move);
canvas.addEventListener("mouseup", end);
canvas.addEventListener("contextmenu", right);
window.addEventListener("keydown", keydown);
window.addEventListener("keyup", keyup);
$(window).bind('mousewheel DOMMouseScroll', zoom);
window.focus();


let canvasScale = 80;
const lineWidth = 0.1;

const waypointWidth = 4;
const pointWidth = 2;

const marginOffset = 9; //correction for canvas choords vs window choords. related to margin


let points = [
{ x: 1, y: 1 },
{ x: 2, y: 6 },
{ x: 4, y: 2 },
];


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
  let path = insertPoints(points, resolution);
  path = smoothen(path, curve, tolerance);
  path = computeDistances(path);
  path = computeCurvatures(path);
  path = computeVelocity(path, 6, 6, 6);
  for (let i = 0; i < path.length; i++) {
    console.log(path[i].velocity);
  }

  /* draw waypoints and path */
  drawWaypoints(points);
  drawPath(path, a => a.velocity, 0, 6);

  if (showRect) {
    c.beginPath();
    c.lineWidth = "2";
    c.strokeStyle = "#000";
    c.rect(rectangle[0].x, rectangle[0].y, rectangle[1].x - rectangle[0].x, rectangle[1].y - rectangle[0].y);
    c.stroke();
  }

  // debugger;
  // requestAnimationFrame(animate);
}


window.onload = animate;