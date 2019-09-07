
var lastClosestPointIndex = 0;


function findClosestIndex(path, currentPos) {
  let closestDist = Number.POSITIVE_INFINITY;
  let closestIndex = lastClosestPointIndex;

  if(closestIndex >= path.length) closestIndex = 0;

  for (let i = closestIndex; i < path.length; i++) {
    let distance = Vector.dist(currentPos, path[i].vector());    
    if(distance < closestDist) {
      closestDist = distance;
      closestIndex = i;
    }
  }

  lastClosestPointIndex = closestIndex;
  return closestIndex;
}


function findIntersectionT(segmentStart, segmentEnd, currentPos, lookaheadDistance) {
  let d = Vector.sub(segmentEnd, segmentStart);
  let f = Vector.sub(segmentStart, currentPos);

  let a = Vector.dot(d, d);
  let b = 2 * Vector.dot(f, d);
  let c = Vector.dot(f, f) - Math.pow(lookaheadDistance, 2);
  let discriminant = Math.pow(b, 2) - 4 * a * c;

  if (discriminant >= 0) {
    discriminant = Math.sqrt(discriminant);
    let t1 = (-b - discriminant) / (2 * a);
    let t2 = (-b + discriminant) / (2 * a);

    if (t1 >= 0 && t1 <= 1) {
      return t1;
    } if (t2 >= 0 && t2 <= 1) {
      return t2;
    }
  }

  //no intersection on this interval
  return null;
}


function findIntersectionPoint(segmentStart, segmentEnd, currentPos, lookaheadDistance) {
  let intersection = findIntersectionT(segmentStart, segmentEnd, currentPos, lookaheadDistance);
  if (intersection != null) {
    let intersect = Vector.sub(segmentEnd, segmentStart);
    let segment = Vector.scalarMult(intersect, intersection);
    let point = Vector.add(segmentStart, segment);
    return point;
  }

  //no intersection on this interval
  return null;
}

function findLookahead(path, currentPos, closestIndex, lookaheadDistance) {
  let lookaheadPoint = path[closestIndex].vector();

  for (let i = closestIndex; i < path.length; i++) {
    let segmentStart = path[i].vector();
    let segmentEnd = path[i + 1].vector();

    let lookaheadPointTemp = null;

    // if on last segment
    if (i == path.length - 1) {
      lookaheadPointTemp = path[path.length-1].vector();
    } else {
      lookaheadPointTemp = findIntersectionPoint(segmentStart, segmentEnd, currentPos, lookaheadDistance);
    }

    // if intersection point found
    if (lookaheadPointTemp != null) {
      lookaheadPoint = lookaheadPointTemp;
      break;
    }
  }
  return lookaheadPoint;
}


function findLookaheadCurvature(currentPos, heading, lookaheadPoint, lookaheadDistance) {
  // let a = -Math.tan(heading);
  // let b = 1;
  // let c = (Math.tan(heading) * currentPos.x) - currentPos.y;
  // let x = Math.abs((a * lookaheadPoint.x) + (b * lookaheadPoint.y) + c) / Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
  // let cross = (Math.sin(heading) * (lookaheadPoint.x - currentPos.x)) - (Math.cos(heading) * (lookaheadPoint.y - currentPos.y));
  // let side = cross > 0 ? 1 : -1;
  // let curvature = (2 * x) / Math.pow(lookaheadDistance, 2);
  // return curvature * side;

  let side = sgn(Math.sin(heading)*(lookaheadPoint.x-currentPos.x) - Math.cos(heading)*(lookaheadPoint.y-currentPos.y))
  let a = -Math.tan(heading)
  let c = Math.tan(heading)*currentPos.x - currentPos.y
  let x = Math.abs(a * lookaheadPoint.x + lookaheadPoint.y + c) / Math.sqrt(a**2 + 1)
  return side * (2*x/(lookaheadDistance**2))
}


function computeLeftTargetVel(targetVel, curvature, robotTrack) {
  return targetVel * (2 + robotTrack * curvature) / 2;
}

function computeRightTargetVel(targetVel, curvature, robotTrack) {
  return targetVel * (2 - robotTrack * curvature) / 2;
}


function update(path, currentPos, heading, lookaheadDistance) {
  let closestIndex = findClosestIndex(path, currentPos);
  let lookaheadPoint = findLookahead(path, currentPos, closestIndex, lookaheadDistance);

  let curvature = findLookaheadCurvature(currentPos, heading, lookaheadPoint, lookaheadDistance);
  let leftTargetVel = computeLeftTargetVel(path[closestIndex].velocity, curvature, 1/12.8);
  let rightTargetVel = computeRightTargetVel(path[closestIndex].velocity, curvature, 1/12.8);

  return {left: leftTargetVel, right: rightTargetVel, lookahead: lookaheadPoint, curvature: curvature, closest: path[closestIndex].vector()};
}
