

/*----Uility Functions----*/
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

function perc2multcolor(perc, min, max) {
  let base = max - min;
  if (base == 0) { 
    perc = 0; 
  } else {
    perc = (perc - min) / base * 100; 
  }
  let r, g, b = 0

  if (perc >= 0 && perc <= 20) {
    r = 255
    g = Math.round(12.75 * perc)
    b = 0
  }
  else if (perc > 20 && perc <= 40) {
    r = Math.round(-12.75 * perc + 510)
    g = 255
    b = 0
  }
  else if (perc > 40 && perc <= 60) {
    r = 0
    g = 255
    b = Math.round(12.75 * perc) - 510
  }
  else if (perc > 60 && perc <= 80) {
    r = 0
    g = Math.round(-12.75 * perc + 1020)
    b = 255
  }
  else {
    r = Math.round(12.75 * perc - 1020)
    g = 0
    b = 255
  }

  let h = r * 0x10000 + g * 0x100 + b * 0x1
  return '#' + ('000000' + h.toString(16)).slice(-6)
}

function rgbToHex(rgb){
  return '#' + ((rgb[0] << 16) | (rgb[1] << 8) | rgb[2]).toString(16);
};

//gets a value from an variable nested in an array such as the min curvature
function getAttr(array, compare, get) {
  return array.reduce((a, b) => {
    return compare(a, get(b));
  }, get(array[0]));
}


function localPointToCanvasPoint(point) {
  return { x: point.x * canvasScale, y: canvas.height - (point.y * canvasScale)};
}

function canvasPointToLocalPoint(point) {
  return { x: point.x / canvasScale, y: (canvas.height - point.y) / canvasScale};
}


/*----Canvas Display----*/
function drawLookahead(lookahead, currPos) {
  let cPoint = localPointToCanvasPoint(lookahead);
  c.fillStyle = "#ff0087";
  c.strokeStyle = "#ff0087";
  c.beginPath();
  c.arc(cPoint.x, cPoint.y, lookaheadWidth, 0, Math.PI * 2);
  c.closePath();
  c.fill();
  c.beginPath();
  c.moveTo(currPos.x, currPos.y);
  c.lineTo(cPoint.x, cPoint.y);
  c.closePath();
  c.stroke();
}

function drawClosest(closest, currPos) {
  let cPoint = localPointToCanvasPoint(closest);
  c.fillStyle = "#2b00ba";
  c.strokeStyle = "#2b00ba";
  c.beginPath();
  c.arc(cPoint.x, cPoint.y, pointWidth, 0, Math.PI * 2);
  c.closePath();
  c.fill();
  c.beginPath();
  c.moveTo(currPos.x, currPos.y);
  c.lineTo(cPoint.x, cPoint.y);
  c.closePath();
  c.stroke();
}

function drawCurvature(curvature, currPos, lookahead) {
  // currPos = {x: 4, y: 6};
  // lookahead = {x: 5, y: 7};
  // curvature = 0.00001;
let q = Math.sqrt(Math.pow(lookahead.x-currPos.x, 2) + Math.pow(lookahead.y-currPos.y, 2));
let x3 = (currPos.x+lookahead.x)/2;
let y3 = (currPos.y+lookahead.y)/2;
let x = x3 + Math.sqrt(Math.pow(1/curvature, 2)-Math.pow(q/2, 2)) * (currPos.y-lookahead.y)/q * sgn(curvature);
let y = y3 + Math.sqrt(Math.pow(1/curvature, 2)-Math.pow(q/2, 2)) * (currPos.x-lookahead.x)/q * sgn(curvature);
  let canvasPoint = localPointToCanvasPoint({ x: x, y: y });
  // x = Math.cos(-Math.PI / 2) * x;
  // y = Math.sin(-Math.PI / 2) * y;
  let canvasPoint = localPointToCanvasPoint({ x: x, y: y });
  // console.log(canvasPoint)

  c.beginPath();
  c.arc(canvasPoint.x, canvasPoint.y, Math.abs(1/curvature*canvasScale), 0, Math.PI * 2);
  c.closePath();
  c.stroke();
 // c.fill();

  // c.beginPath();
//   let radius = isNaN(1/curvature) ? 0 : 1/curvature;
// // console.log(radius)
// let x = currPos.x + radius * (lookahead.x - currPos.x);
// //let y = currPos.y + radius * Math.sin(0);
// c.arc(x, currPos.y, Math.abs(radius), 0, Math.PI * 2);
// c.closePath();
// c.stroke();
}

function drawWaypoints(points) {
  c.fillStyle = "#ff7f00";
  points.forEach((node, i) => {
    c.beginPath();
    let cPoint = localPointToCanvasPoint(node);
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


/*----Canvas Interaction----*/
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
  return canvasPointToLocalPoint({ x: screenX, y: screenY });
}


function click(e) {
  //left click
  if (e.button == 0) {
    window.focus();
    if (e.ctrlKey) {
      dragIndex = -2;
    } else if(nodeIndex != -1 && !hovering) {
      lastCoord = canvasEventToLocalCoord(e);
      points.splice(path[nodeIndex].segment + 1, 0, lastCoord);
      move(e);
    } else if (!hovering) {
      lastCoord = canvasEventToLocalCoord(e);
      points.push(lastCoord);
      move(e);
    }
    dragging = true;
  } else if (e.button == 2) { //right click
    if (hovering) {
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
    rectangle[0] = localPointToCanvasPoint(lastCoord);
    rectangle[1] = localPointToCanvasPoint(goal);
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
