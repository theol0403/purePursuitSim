
const dist = (a, b) =>
Math.sqrt((a.x() - b.x()) * (a.x() - b.x()) + (a.y() - b.y()) * (a.y() - b.y()));

var lastClosestPoint;

function findClosestPointIndex(path, currentPos) {
  let closestDist = Number.POSITIVE_INFINITY;
  let closestPointIndex;

  for(let i = 0; i < path.length; i++) {
    let distance = dist(currentPos, path[i]);
    if(distance < closestDist) {
      closestPointIndex = i;
    }
  }

  return closestPointIndex;
}


function findTVal(path, i, currPos, lookAheadDistance) {
  d = Vector(path[i+1].x() - path[i].x(), path[i+1].y() - path[i].y());
  f = Vector(path[i+1].x() - currPos.x(), path[i+1].y() - currPos.y());

  a = Vector.dot(d, d);
  b = 2 * Vector.dot(f, d);
  c = Vector.dot(f, f) - Math.pow(lookAheadDistance, 2);
  discriminant = Math.pow(b, 2) - 4 * a * c;

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


function findLookaheadPoint(path, closestPointIndex, currentPos) {

}
