
const distPathPoint = (a, b) => Vector.dist(a.vector(), b.vector());

function insertPoints(points, resolution) {
  let path = [];
  let numPoints = points.length;

  for (let i = 0; i < numPoints - 1; i++) {
    let start = points[i];
    let end = points[i + 1];
    
    let diff = Vector.sub(end, start); // start - end
    let numInsert = Math.ceil(Vector.mag(diff) / resolution); // number of points needed
    let step = Vector.scalarMult(diff, 1 / numInsert); // how much to increment each point

    for (let j = 0; j < numInsert; j++) {
      let xNew = start.x + step.x * j;
      let yNew = start.y + step.y * j;
      let newPoint = new PathPoint(xNew, yNew);
      newPoint.setSegment(i);
      path.push(newPoint);
    }
  }

  if (numPoints > 0) {
    path.push(new PathPoint(points[numPoints - 1].x, points[numPoints - 1].y));
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
    let distance = path[i].distance + distPathPoint(path[i], path[i + 1]);
    path[i + 1].setDistance(distance);
  }
  return path;
}

function computeSingleCurvature(prevPoint, point, nextPoint) {
  let distOne = distPathPoint(point, prevPoint);
  let distTwo = distPathPoint(point, nextPoint);
  let distThree = distPathPoint(nextPoint, prevPoint);

  let productOfSides = distOne * distTwo * distThree;
  let semiPerimeter = (distOne + distTwo + distThree) / 2;
  let triangleArea = Math.sqrt(semiPerimeter * (semiPerimeter - distOne) * (semiPerimeter - distTwo) * (semiPerimeter - distThree));

  let r = (productOfSides) / (4 * triangleArea);
  let curvature = isNaN(1/r) ? 0 : 1/r;
  return curvature;
}

function computeCurvatures(path) {
  path[0].setCurvature(0);
  for (let i = 1; i < path.length - 1; i++) {
    let curvature = computeSingleCurvature(path[i - 1], path[i], path[i + 1]);
    path[i].setCurvature(curvature);
  }
  path[path.length - 1].setCurvature(0);
  return path;
}


function computeVelocity(path, maxVel, maxRate, k) {
  path[path.length-1].setVelocity(0);
  for (let i = path.length - 1; i > 0; i--) {
    let start = path[i];
    let end = path[i - 1];
    let wantedVel = Math.min(maxVel, (k / path[i].curvature));
    let distance = distPathPoint(start, end);
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
    let distance = distPathPoint(start, end);
    let wantedVel = Math.min(end.velocity, Math.sqrt(Math.pow(start.velocity, 2) + (2 * maxRate * distance)));
    let newVel = Math.max(wantedVel, minVel);
    path[i + 1].setVelocity(newVel);
  }
  return path;
}
