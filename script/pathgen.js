
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
  const dist = (a, b) =>
  Math.sqrt((a.loc[0] - b.loc[0]) * (a.loc[0] - b.loc[0]) + (a.loc[1] - b.loc[1]) * (a.loc[1] - b.loc[1]));

  path[0].setDistance(0);
  for (let i = 0; i < path.length - 1; i++) {
    let distance = path[i].distance + dist(path[i + 1], path[i]);
    path[i + 1].setDistance(distance);
  }
  return path;
}


function computeCurvature(path) {

  path[0].setCurvature(0);

  for(let i = 0; i < path.length - 2; i++) {
    let x2 = path[i].loc[0];
    let y2 = path[i].loc[1];
    let x1 = path[i+1].loc[0];
    let y1 = path[i+1].loc[1];
    let x3 = path[i+2].loc[0];
    let y3 = path[i+2].loc[1];

    let base = (x1 - x2);
    let k1 = 0.5 * (Math.pow(x1, 2) + Math.pow(y1, 2) - Math.pow(x2, 2) - Math.pow(y2, 2)) / base;
    let k2 = (y1 - y2) / base;
    let b = 0.5*(Math.pow(x2, 2) - 2*x2*k1 + Math.pow(y2, 2) - Math.pow(x3, 3) + 2*x3*k1 - Math.pow(y3, 2))/(x3*k2 - y3 + y2 - x2*k2);
    let a = k1 - k2*b;
    let r = Math.sqrt(Math.pow(x1-a, 2) + Math.pow(y1-b, 2));
    let curve = isNaN(1/r) ? 0 : 1/r;

    path[i+1].setCurvature(curve);
  }

  return path;
}



function computeVelocity(path, maxVel, k, maxRate) {
  const dist = (a, b) =>
  Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
  path[0].setTargetVel(0);
  for (let i = path.length - 1; i > 0; i--) {
    let lastVel = Math.min(maxVel, (k / path[i].curvature));
    let start = path[i];
    let end = path[i - 1];
    let distance = dist({x: start.x, y: start.y}, {x: end.x, y: end.y});
    let newVel = Math.min(lastVel, Math.sqrt(Math.pow(path[i].targetVel, 2) + 2 * maxRate * distance));
    path[i - 1].setTargetVel(newVel);
  }
  return path;
}



