

const dist = (ax, ay, bx, by) =>
Math.sqrt((ax - bx) * (ax - bx) + (ay - by) * (ay - by));
const distWaypoint = (a, b) => dist(a.x(), a.y(), b.x(), b.y());


function insertPoints(points, resolution) {
  let path = [];
  let numPoints = points.length;

  for (let i = 0; i < numPoints - 1; i++) {
    let start = points[i];
    let end = points[i + 1];

    let xNet = end.x - start.x;
    let yNet = end.y - start.y;

    let mag = Math.sqrt(Math.pow(xNet, 2) + Math.pow(yNet, 2));

    let numInsert = Math.ceil(mag / resolution);

    let xStep = xNet / numInsert;
    let yStep = yNet / numInsert;
    // let xStep = xNet / mag * resolution;
    // let yStep = yNet / mag * resolution;

    for (let j = 0; j < numInsert; j++) {
      let xNew = start.x + xStep * j;
      let yNew = start.y + yStep * j;
      path.push(new WayPoint(xNew, yNew));
    }
  }

  if (numPoints > 0) {
    path.push(new WayPoint(points[numPoints - 1].x, points[numPoints - 1].y));
  }

  return path;
}


function smoothen(inp, dataWeight, tolerance) {
  let path = _.cloneDeep(inp); //copy
  let smoothWeight = 1.0 - dataWeight;
  let change = tolerance;
  while (change >= tolerance) {
    change = 0.0;
    for (let i = 1; i < inp.length - 1; i++) {
      for (let j = 0; j < 2; j++) {
        let aux = path[i].loc[j];
        let dataFac = dataWeight * (inp[i].loc[j] - path[i].loc[j]);
        let smoothFac = smoothWeight * (path[i - 1].loc[j] + path[i + 1].loc[j] - (2.0 * path[i].loc[j]));
        path[i].loc[j] += (dataFac + smoothFac);
        change = Math.abs(aux - path[i].loc[j]);
      }
    }
  }
  return path;
}


function computeDistances(path) {
  path[0].setDistance(0);
  for (let i = 0; i < path.length - 1; i++) {
    let distance = path[i].distance + distWaypoint(path[i], path[i + 1]);
    path[i + 1].setDistance(distance);
  }
  return path;
}


function computeCurvatures(path) {
  path[0].setCurvature(0);

  for (let i = 1; i < path.length - 1; i++) {
    let point = path[i];
    let prevPoint = path[i - 1];
    let nextPoint = path[i + 1];

    let distanceOne = distWaypoint(point, prevPoint);
    let distanceTwo = distWaypoint(point, nextPoint);
    let distanceThree = distWaypoint(nextPoint, prevPoint);

    let productOfSides = distanceOne * distanceTwo * distanceThree;
    let semiPerimeter = (distanceOne + distanceTwo + distanceThree) / 2;
    let triangleArea = Math.sqrt(semiPerimeter * (semiPerimeter - distanceOne) * (semiPerimeter - distanceTwo) * (semiPerimeter - distanceThree));

    let r = (productOfSides) / (4 * triangleArea);
    let curvature = isNaN(1/r) ? 0 : 1/r;
    path[i].setCurvature(curvature);
  }

  path[path.length - 1].setCurvature(0) ;
  return path;
}



function computeVelocity(path, maxVel, maxRate, k) {
  path[path.length-1].setVelocity(0);
  for (let i = path.length - 1; i > 0; i--) {
    let start = path[i];
    let end = path[i - 1];
    let wantedVel = Math.min(maxVel, (k / path[i].curvature));
    let distance = distWaypoint(start, end);
    let newVel = Math.min(wantedVel, Math.sqrt(Math.pow(start.velocity, 2) + (2 * maxRate * distance)));
    path[i - 1].setVelocity(newVel);
  }
  return path;
}

function limitVelocity(path, minVel, maxRate) {
  path[0].setVelocity(minVel);
  for (let i = 0; i < path.length - 1; i++) {
    let start = path[i];
    let end = path[i + 1];
    let distance = distWaypoint(start, end);
    let wantedVel = Math.min(end.velocity, Math.sqrt(Math.pow(start.velocity, 2) + (2 * maxRate * distance)));
    let newVel = Math.max(wantedVel, minVel);
    path[i + 1].setVelocity(newVel);
  }
  return path;
}
