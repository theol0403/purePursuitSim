

/*----Uility Functions----*/
function perc2color(perc, min, max) {
  let base = (max - min);
  // console.log(max);
  // if(Math.abs(base) < 0.001) {
  //   base = 0;
  // }
  // console.log(max)

  if (base == 0) { 
    perc = 100; 
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


/*----Canvas Display----*/
function drawWaypoints(points) {
  let waypoints = [];
  points.forEach((node, i) => {
    waypoints.push({ x: node.x * canvasScale, y: node.y * canvasScale });
  });

  c.fillStyle = "#ff7f00";
  waypoints.forEach((node, i) => {
    c.beginPath();
    c.arc(node.x, canvas.height - node.y, waypointWidth, 0, Math.PI * 2);
    c.closePath();
    c.fill();
  });
}

function drawPath(path) {
  //extract points from path and upcanvasScale
  let canvasPath = [];

  path.forEach((node, i) => {
    canvasPath.push({ x: node.loc[0] * canvasScale, y: node.loc[1] * canvasScale })
  });

  let minCurvature = path.reduce(function(a, b) {
    return Math.min(a, b.curvature);
  }, path[0].curvature);

  let maxCurvature = path.reduce(function(a, b) {
    return Math.max(a, b.curvature);
  }, path[0].curvature);

  c.strokeStyle = "#000";
  c.fillStyle = perc2color(0, minCurvature, maxCurvature);

  canvasPath.forEach((node, i) => {

    //find curvature colors
    c.fillStyle = perc2color(node.curvature, minCurvature, maxCurvature);
    //draw points
    c.beginPath();
    c.arc(node.x, canvas.height - node.y, pointWidth, 0, Math.PI * 2);
    c.closePath();
    c.fill();

    //draw lines
    if (i > 0) {
      c.beginPath();
      //move to previous point except for 0
      c.moveTo(canvasPath[i - 1].x, canvas.height - canvasPath[i - 1].y);
      c.lineTo(node.x, canvas.height - node.y);
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


function canvasEventToLocalCoord(e) {
  let screenX = e.clientX - marginOffset;
  let screenY = e.clientY - marginOffset;

  let newX = screenX / canvasScale;
  let newY = (canvas.height - screenY) / canvasScale;

  return { x: newX, y: newY };
}

function localCoordToCanvasCoord(point) {
  let newX = point.x * canvasScale;
  let newY = canvas.height - (point.y * canvasScale);
  return { x: newX, y: newY };
}

function click(e) {
  //left click
  if (e.button == 0) {
    window.focus();
    if (e.ctrlKey) {
      dragIndex = -2;
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
    rectangle[0] = localCoordToCanvasCoord(lastCoord);
    rectangle[1] = localCoordToCanvasCoord(goal);
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
