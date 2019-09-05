
const dist = (ax, ay, bx, by) =>
Math.sqrt((ax - bx) * (ax - bx) + (ay - by) * (ay - by));
const distWaypoint = (a, b) => dist(a.x(), a.y(), b.x(), b.y());


function insertPoints(points, angles, resolution) {
  let path = [];
  let numPoints = points.length;

  for (let i = 0; i < numPoints - 1; i++) {
    let start = points[i];
    let end = points[i + 1];

    let xNet = end.x - start.x;
    let yNet = end.y - start.y;

    let mag = Math.sqrt(Math.pow(xNet, 2) + Math.pow(yNet, 2)) / 3;

    let numInsert = (1 / resolution);

//    console.log("Mag / Num Insert", mag, numInsert);

    let startV = new WayPoint( start.x + (mag * Math.sin(1.5707963268 - angles[i])), start.y + (mag * Math.sin(angles[i])));
    let endV = new WayPoint( end.x + (mag * Math.sin(1.5707963268 - angles[i + 1])), end.y + (mag * Math.sin(angles[i + 1])));

    //let xStep = xNet / numInsert;
    //let yStep = yNet / numInsert;
    // let xStep = xNet / mag * resolution;
    // let yStep = yNet / mag * resolution;

    for (let j = 0; j < 1; j+=numInsert) {
      let newPoint = new WayPoint( findHermitePoint( j, start, startV, end, endV ) );
      newPoint.setSegment(i);
      path.push(newPoint);
    }
  }

//  if (numPoints > 0) {
//    path.push(new WayPoint(points[numPoints - 1].x, points[numPoints - 1].y));
//  }

  return path;
}

function findHermitePoint( ij, start, startV, end, endV ){
  let j = _.cloneDeep(ij);
  let x = h(j, start.x, startV.x, end.x, endV.x);
  let y = h(j, start.y, startV.y, end.y, endV.y);
//  console.log("Point Generated", x, y);
  return new WayPoint( x, y );
}

function h(j, start, startV, end, endV){
    let output =  h1(j) * start + 
                  h2(j) * startV + 
                  h3(j) * end +
                  h4(j) * endV;
//    console.log(start, startV);
//    console.log(end, endV);
//    console.log(h1(j));
//    console.log(output);
    return  output;
}

function h1(x){
  return (2 * Math.pow(x, 3)) - (3 * Math.pow(x,2)) + 1;
}

function h2(x){
  return (Math.pow(x, 3)) - (2 * Math.pow(x,2)) + x;
}

function h3(x){
  return (-2 * Math.pow(x, 3)) + (3 * Math.pow(x,2));
}

function h4(x){
  return (Math.pow(x, 3)) - ( Math.pow(x,2));
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

function computeSingleCurvature(prevPoint, point, nextPoint) {
  let distOne = distWaypoint(point, prevPoint);
  let distTwo = distWaypoint(point, nextPoint);
  let distThree = distWaypoint(nextPoint, prevPoint);

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
