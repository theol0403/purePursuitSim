
///////////////////////////
// Constants and Globals //
///////////////////////////
const waypointWidth = 4;
const pointWidth = 2;
const lookaheadWidth = 3;

let sliders = { resolution: 0, curve: 0, tolerance: 0};

///////////////////////
// Utility Functions //
///////////////////////
function maintainCanvas() {
  canvas.width = window.innerWidth - marginOffset * 2;
  canvas.height = window.innerHeight - 80;
  c.lineWidth = 1;

  /* slider value calculations */
  sliders.resolution = resolutionSlider.value / 1000;
  resValue.innerHTML = sliders.resolution;

  sliders.curve = curveSlider.value / 1000;
  curveValue.innerHTML = sliders.curve;

  sliders.tolerance = Math.pow(10, -toleranceSlider.value / 100) * 100;
  tolValue.innerHTML = sliders.tolerance;

  if (showRect) {
    c.beginPath();
    c.lineWidth = "2";
    c.strokeStyle = "#000";
    c.rect(rectangle[0].x, rectangle[0].y, rectangle[1].x - rectangle[0].x, rectangle[1].y - rectangle[0].y);
    c.stroke();
  }
}

/**
 * Turn percentage into RGB range from yellow to red
 * @param  {Number} perc value between min and max
 * @param  {Number} min  
 * @param  {Number} max  
 * @return {String} RGB hex code
 */
function perc2color(perc, min, max) {
  let base = max - min;
  if (base == 0) { 
    perc = 0; 
  } else {
    perc = (perc - min) / base * 100; 
  }
  let r, g, b = 0;
  if (perc < 50) {
    r = 255;
    g = Math.round(5.1 * perc);
  } else {
    g = 255;
    r = Math.round(510 - 5.10 * perc);
  }
  let h = r * 0x10000 + g * 0x100 + b * 0x1;
  return '#' + ('000000' + h.toString(16)).slice(-6);
}

/**
 * Turn percentage into RGB range rainbow
 * @param  {Number} perc value between min and max
 * @param  {Number} min  
 * @param  {Number} max  
 * @return {String} RGB hex code
 */
function perc2multcolor(perc, min, max) {
  let base = max - min;
  if (base == 0) { 
    perc = 0; 
  } else {
    perc = (perc - min) / base * 100; 
  }
  let r, g, b = 0;
  if (perc >= 0 && perc <= 20) {
    r = 255;
    g = Math.round(12.75 * perc);
    b = 0;
  } else if (perc > 20 && perc <= 40) {
    r = Math.round(-12.75 * perc + 510);
    g = 255;
    b = 0;
  } else if (perc > 40 && perc <= 60) {
    r = 0;
    g = 255;
    b = Math.round(12.75 * perc) - 510;
  } else if (perc > 60 && perc <= 80) {
    r = 0;
    g = Math.round(-12.75 * perc + 1020);
    b = 255;
  } else {
    r = Math.round(12.75 * perc - 1020);
    g = 0;
    b = 255;
  }
  let h = r * 0x10000 + g * 0x100 + b * 0x1;
  return '#' + ('000000' + h.toString(16)).slice(-6);
}

/**
 * gets a value from an variable nested in an array such as the min curvature
 * @param  {Array} Array
 * @param  {Function} compare min or max
 * @param  {Function} get     get nested element
 * @return {Number}           get final value
 */
function getAttr(array, compare, get) {
  return array.reduce((a, b) => {
    return compare(a, get(b));
  }, get(array[0]));
}

//////////////////////
// Canvas Functions //
//////////////////////

/**
 * Scales coordenates from simulation coordenates to canvas coordenates
 */
function localToCanvas(point) {
  return { x: point.x * canvasScale, y: canvas.height - (point.y * canvasScale)};
}
/**
 * Scales coordenates from canvas coordenates to simulation coordenates
 */
function canvasToLocal(point) {
  return { x: point.x / canvasScale, y: (canvas.height - point.y) / canvasScale};
}

/**
 * Draws a line from origin to point, then draws a point
 */
function drawLineToPoint(origin, point) {
  c.beginPath();
  c.arc(point.x, point.y, lookaheadWidth, 0, Math.PI * 2);
  c.closePath();
  c.fill();
  c.beginPath();
  c.moveTo(origin.x, origin.y);
  c.lineTo(point.x, point.y);
  c.closePath();
  c.stroke();
}

/**
 * Draws array of points
 */
function drawWaypoints(points) {
  c.fillStyle = "#ff7f00";
  points.forEach((node, i) => {
    let cPoint = localToCanvas(node);
    c.beginPath();
    c.arc(cPoint.x, cPoint.y, waypointWidth, 0, Math.PI * 2);
    c.closePath();
    c.fill();
  });
}

let fullMin = Infinity;
let fullMax = 0;

//ommit min and max OR min = false : iterative min and max calculation
//min = true : historical min and max calculation
//min + max = number  : static min and max
function drawPath(path, colorGet, min, max) {

  //curvature color calculations
  if(min === true) {
    fullMin = Math.min(fullMin, getAttr(path, Math.min, colorGet));
    fullMax = Math.max(fullMax, getAttr(path, Math.max, colorGet));
  } else if (min === undefined || min === false) { 
    //if min is not provided or is false
    fullMin = getAttr(path, Math.min, colorGet);
    fullMax = getAttr(path, Math.max, colorGet);
  } else {
    fullMin = min;
    fullMax = max;
  }

  path.forEach((node, i) => {
   let canvasX = node.x() * canvasScale;
   let canvasY = node.y() * canvasScale;
   let style = perc2multcolor(colorGet(node), fullMin, fullMax);
   c.fillStyle = style;
   c.strokeStyle = style;
    //draw points
    c.beginPath();
    if(nodeIndex == i) {
      c.arc(canvasX, canvas.height - canvasY, pointWidth * 2, 0, Math.PI * 2);
    } else {
      c.arc(canvasX, canvas.height - canvasY, pointWidth, 0, Math.PI * 2);
    }
    c.closePath();
    c.fill();
    //draw lines
    if (i > 0) {
      let lastX = path[i - 1].x() * canvasScale;
      let lastY = path[i - 1].y() * canvasScale;
      c.beginPath();
      c.moveTo(lastX, canvas.height - lastY);
      c.lineTo(canvasX, canvas.height - canvasY);
      c.closePath();
      c.stroke();
    }
  });
}


function drawLookahead(currPos, lookahead) {
  c.fillStyle = "#ff0087";
  c.strokeStyle = "#ff0087";
  drawLineToPoint(currPos, localToCanvas(lookahead));
  c.strokeStyle = "#000";
  c.beginPath();
  c.arc(currPos.x, currPos.y, Vector.dist(currPos, localToCanvas(lookahead)), 0, Math.PI * 2);
  c.closePath();
  c.stroke();
}

function drawClosest(currPos, closest) {
  c.fillStyle = "#2b00ba";
  c.strokeStyle = "#2b00ba";
  drawLineToPoint(currPos, localToCanvas(closest));
}

function drawCurvature(curvature, p1, p2) {
  let radius = Math.abs(1/curvature);

  let x3 = (p1.x + p2.x) / 2;
  let y3 = (p1.y + p2.y) / 2;
  let q = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

  let x = x3 + Math.sqrt(Math.pow(radius, 2) - Math.pow(q / 2, 2)) * (p1.y - p2.y)/q * sgn(curvature);
  let y = y3 + Math.sqrt(Math.pow(radius, 2) - Math.pow(q / 2, 2)) * (p2.x - p1.x)/q * sgn(curvature);

  // let b = Math.sqrt(Math.pow(radius, 2) - Math.pow(q / 2, 2));

  // let x = x3 - b * (p1.y - p2.y)/q * sgn(curvature);
  // let y = y3 - b * (p2.x - p1.x)/q * sgn(curvature);

  let canvasPoint = localToCanvas({ x: x, y: y});

  c.beginPath();
  c.arc(canvasPoint.x, canvasPoint.y, Math.abs(1/curvature*canvasScale), 0, Math.PI * 2);
  c.closePath();
  c.stroke();
}


////////////////////////
// Canvas Interaction //
////////////////////////
let showRect = false;
let rectangle = [{ x: 0, y: 0 }, { x: 0, y: 0 }];
let deleteIndexes = [];

let hovering = false;
let dragging = false;
let dragIndex = -1;
let lastCoord = { x: 0, y: 0 };

let nodeIndex = -1;


function canvasEventToLocalCoord(e) {
  let screenX = e.clientX - marginOffset;
  let screenY = e.clientY - marginOffset;
  return canvasToLocal({ x: screenX, y: screenY });
}


function click(e) {
  window.focus();
  //left click
  if (e.button == 0) {
    if (e.ctrlKey) {
      dragIndex = -2;
    } else if(nodeIndex != -1 && !hovering) {
      lastCoord = canvasEventToLocalCoord(e);
      points.splice(path[nodeIndex].segment + 1, 0, lastCoord);
      move(e);
    } else if (!hovering) {
      lastCoord = canvasEventToLocalCoord(e);
      points.push(lastCoord);
      // dragging = true;
      move(e);
    }
    dragging = true;
  } else if (e.button == 2) { //right click
    if (e.ctrlKey) {
      bots.push(new Bot(e.clientX, e.clientY, -0.5 * PI));
    } else if (hovering) {
      points.splice(dragIndex, 1);
      move(e);
    } else {
      dragIndex = -3;
      dragging = true;
    }
  }
}

function move(e) {
  e.preventDefault();

  /* waypoint interaction */
  if (!dragging) {
    lastCoord = canvasEventToLocalCoord(e);
    dragIndex = points.findIndex(function (node) {
      return lastCoord.x >= node.x - waypointWidth / canvasScale
      && lastCoord.x <= node.x + waypointWidth / canvasScale
      && lastCoord.y >= node.y - waypointWidth / canvasScale
      && lastCoord.y <= node.y + waypointWidth / canvasScale;
    });

    if (e.ctrlKey) {
      document.body.style.cursor = "move";
    } else if (dragIndex == -1) {
      document.body.style.cursor = "auto";
      hovering = false;
    } else {
      document.body.style.cursor = "pointer";
      hovering = true;
    }
    showRect = false;
  } else if (dragIndex == -2) {
    document.body.style.cursor = "move";
    let newCoord = canvasEventToLocalCoord(e);
    let offsetX = newCoord.x - lastCoord.x;
    let offsetY = newCoord.y - lastCoord.y;
    lastCoord = newCoord;
    points.forEach((node, i) => {
      node.x += offsetX;
      node.y += offsetY;
    });
  } else if (dragIndex == -3) {
    showRect = true;
    let goal = canvasEventToLocalCoord(e);
    rectangle[0] = localToCanvas(lastCoord);
    rectangle[1] = localToCanvas(goal);
    deleteIndexes = [];
    points.forEach(function (node, i) {
      let orginX = Math.min(lastCoord.x, goal.x);
      let orginY = Math.min(lastCoord.y, goal.y);
      let goalX = Math.max(lastCoord.x, goal.x);
      let goalY = Math.max(lastCoord.y, goal.y);
      if (goalX >= node.x
        && orginX <= node.x
        && goalY >= node.y
        && orginY <= node.y) {
        deleteIndexes.push(i);
    }
  });
  } else {
    lastCoord = canvasEventToLocalCoord(e);
    points[dragIndex] = lastCoord;
  }


  /* node interaction */
  nodeIndex = path.findIndex(function (node) {
    return lastCoord.x >= node.x() - waypointWidth * 2 / canvasScale
    && lastCoord.x <= node.x() + waypointWidth * 2 / canvasScale
    && lastCoord.y >= node.y() - waypointWidth * 2 / canvasScale
    && lastCoord.y <= node.y() + waypointWidth * 2 / canvasScale;
  });
  if (nodeIndex == -1) {
    tooltip.style.opacity = "0";
  } else {
    tooltip.style.opacity = "1";
    tooltip.style.left = e.clientX + marginOffset + 'px';
    tooltip.style.top = e.clientY - marginOffset + 'px';

    tooltip.innerHTML = 
    "curvature: " + path[nodeIndex].curvature.toFixed(4) + 
    "\nvelocity: " + path[nodeIndex].velocity.toFixed(4);
  }
}

function end(e) {
  if (dragIndex == -3) {
    deleteIndexes.forEach(function (node) {
      points.splice(node, 1);
      deleteIndexes.forEach(function (val, i) {
        if (node <= val) deleteIndexes[i]--;
      });
    });
    deleteIndexes = [];
  }
  dragging = false;
  dragIndex = -1;
  move(e);
}

function right(e) {
  e.preventDefault();
}

let key = false;
function keydown(e) {
  if (e.code != "ControlLeft") return;
  if (!key && !dragging) {
    key = true;
    document.body.style.cursor = "move";
  }
}

function keyup(e) {
  if (e.code != "ControlLeft") return;
  key = false;
  if (dragIndex == -1 || dragIndex == -3) {
    document.body.style.cursor = "auto";
    hovering = false;
  } else if (dragIndex != -2) {
    document.body.style.cursor = "pointer";
    hovering = true;
  }
}



let scrollRatio = 5;

function zoom(e) {
  if (e.ctrlKey) {
    e.preventDefault();
    if (e.originalEvent.detail > 0) {
      canvasScale -= scrollRatio;
    } else {
      canvasScale += scrollRatio;
    }
  }
}

/* zooming the points result in the smoothing being affected
let scrollRatio = 0.05;

function zoom(e) {
  if (e.ctrlKey) {
    e.preventDefault();
    if (e.originalEvent.detail > 0) {
      points.forEach((node, i) => {
        node.x += (lastCoord.x - node.x) * scrollRatio;
        node.y += (lastCoord.y - node.y) * scrollRatio;
      });
    } else {
      points.forEach((node, i) => {
        node.x -= (lastCoord.x - node.x) * scrollRatio;
        node.y -= (lastCoord.y - node.y) * scrollRatio;
      });
    }
  }
}
*/
