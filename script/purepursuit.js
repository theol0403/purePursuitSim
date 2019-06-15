
var lastClosestPoint = 0;
var lastLookaheadPoint = 0;
var onLastSegment = false;

function findClosestPoint(path, currentPos) {
  let closestDist = Number.POSITIVE_INFINITY;
  let closestPoint;

  for (let i = 0; i < path.length; i++) {
    let distance = dist(currentPos, path[i]);
    // console.log("Dist at", i, "is", distance);
    if(distance < closestDist) {
      closestDist = distance;
      closestPoint = i;
    }
  }

  lastClosestPoint = closestPoint;
  return closestPoint;
}


function calcTVal(path, i, currentPos, lookAheadDistance) {
  d = new Vector(path[i+1].x() - path[i].x(), path[i+1].y() - path[i].y());
  f = new Vector(path[i+1].x() - currentPos.x(), path[i+1].y() - currentPos.y());

  a = Vector.dot(d, d);
  b = 2 * Vector.dot(f, d);
  z = Vector.dot(f, f) - Math.pow(lookAheadDistance, 2);
  discriminant = Math.pow(b, 2) - 4 * a * z;

  if (discriminant < 0) {
    return -1; //no intersection on this interval
  }
  else {
    discriminant = Math.sqrt(discriminant);
    t1 = (-b - discriminant) / (2 * a);
    t2 = (-b + discriminant) / (2 * a);

    if (t1 >= 0 && t1 <= 1) {
      return t1;
    }
    if (t2 >= 0 && t2 <= 1) {
      return t2;
    }
  }

  return -1; //no intersection
}


function findLookaheadPoint(path, closestPoint, currentPos, lookAheadDistance) {
  if (onLastSegment) {
    lastLookaheadPoint = path.length - 1;
    return path.length - 1;
  }

  for (let i = Math.floor(lastLookaheadPoint); i < path.length - 1; i++) {
    tVal = calcTVal(path, i, currentPos, lookAheadDistance);
    fracIndex = closestPoint + tVal;

    if (tVal != -1) {
        lastLookaheadPoint = fracIndex;
        return fracIndex;
    }
  }

  return lastLookaheadPoint;
}
