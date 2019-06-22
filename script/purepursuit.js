
var lastClosestPointIndex = 0;
var robotTrack = 2;


function findclosestPointIndex(path, currentPos) {
  let closestDist = Number.POSITIVE_INFINITY;
  let closestPointIndex = lastClosestPointIndex;

  for (let i = lastClosestPointIndex; i < path.length; i++) {
    let distance = Vector.dist(currentPos, path[i].vector());    
    if(distance < closestDist) {
      closestDist = distance;
      closestPointIndex = i;
    }
  }

  lastClosestPointIndex = closestPointIndex;
  return closestPointIndex;
}


function calcTVal(start, end, currentPos, lookAheadDistance) {
  let d = Vector.sub(end, start);
  let f = Vector.sub(start, currentPos);

  let a = Vector.dot(d, d);
  let b = 2 * Vector.dot(f, d);
  let c = Vector.dot(f, f) - Math.pow(lookAheadDistance, 2);
  let discriminant = Math.pow(b, 2) - 4 * a * c;

  if (discriminant < 0) {
    return null; //no intersection on this interval
  } else {
    discriminant = Math.sqrt(discriminant);
    let t1 = (-b - discriminant) / (2 * a);
    let t2 = (-b + discriminant) / (2 * a);

    if (t1 >= 0 && t1 <= 1) {
      return t1;
    } if (t2 >= 0 && t2 <= 1) {
      return t2;
    }
  }

  return null;
}


function findLookaheadPoint(path, start, end, currentPos, lookAheadDistance, onLastSegment) {
  let tVal = calcTVal(start, end, currentPos, lookAheadDistance);
  if (onLastSegment) {
    return path[path.length-1].vector();
  } else if (tVal == null) {
    return null;
  } else {
    let intersect = Vector.sub(end, start);
    let segment = Vector.scalarMult(intersect, tVal);
    let point = Vector.add(start, segment);
    return point;
  }
}


function computeLookaheadArcCurvature(currentPos, heading, lookaheadPoint, lookAheadDistance) {
  let a = -Math.tan(heading);
  let b = 1;
  let c = (Math.tan(heading) * currentPos.x) - currentPos.y;
  let x = Math.abs(a * lookaheadPoint.x + b * lookaheadPoint.y + c) / Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
  let cross = (Math.sin(heading) * (lookaheadPoint.x - currentPos.x)) - (Math.cos(heading) * (lookaheadPoint.y - currentPos.y));
  let side = cross > 0 ? 1 : -1;
  let curvature = (2 * x) / Math.pow(lookAheadDistance, 2);

  return curvature * side;
}


function computeLeftTargetVel(targetVel, curvature) {
  return targetVel * (2 + robotTrack * curvature) / 2;
}


function computeRightTargetVel(targetVel, curvature) {
  return targetVel * (2 - robotTrack * curvature) / 2;
}


function update(path, currentPos, heading, lookAheadDistance) {
  let onLastSegment = false;
  let closestPointIndex = findclosestPointIndex(path, currentPos);
  let lookaheadPoint = new Vector(0, 0);

  for (let i = closestPointIndex + 1; i < path.length; i++) {
    let startPoint = path[i-1].vector();
    let endPoint = path[i].vector();

    onLastSegment = i == (path.length);

    let lookaheadPointTemp = findLookaheadPoint(path, startPoint, endPoint, currentPos, lookAheadDistance, onLastSegment);

    if (lookaheadPointTemp != null) {
      lookaheadPoint = lookaheadPointTemp;
      break;
    }
  }

  let curvature = computeLookaheadArcCurvature(currentPos, heading, lookaheadPoint, lookAheadDistance);
  let leftTargetVel = computeLeftTargetVel(path[closestPointIndex].velocity, curvature);
  let rightTargetVel = computeRightTargetVel(path[closestPointIndex].velocity, curvature);

  return {left: leftTargetVel, right: rightTargetVel, lookahead: lookaheadPoint, curvature: curvature};
}
