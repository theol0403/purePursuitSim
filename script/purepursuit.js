
var lastclosestPointIndex = 0;
var onLastSegment = false;

function findclosestPointIndex(path, currentPos) {
  let closestDist = Number.POSITIVE_INFINITY;
  let closestPointIndex;

  for (let i = 0; i < path.length; i++) {
    let distance = dist(currentPos, path[i]);
    console.log("Dist at", i, "is", distance);
    if(distance < closestDist) {
      closestDist = distance;
      closestPointIndex = i;
    }
  }

  lastclosestPointIndex = closestPointIndex;
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
  }
  else {
    discriminant = Math.sqrt(discriminant);
    let t1 = (-b - discriminant) / (2 * a);
    let t2 = (-b + discriminant) / (2 * a);

    if (t1 >= 0 && t1 <= 1) {
      return t1;
    }
    if (t2 >= 0 && t2 <= 1) {
      return t2;
    }
  }

  return null;
}


function findLookaheadPoint(path, start, end, currentPos, lookAheadDistance, onLastSegment) {
  let tVal = calcTVal(start, end, currentPos, lookAheadDistance);
  if (onLastSegment) {
    return path[path.length-1];
  }
  else if (tVal == null) {
    return null;
  }
  else {
    let intersect = Vector.sub(end, start);
    let segment = Vector.scalarMult(intersect, tVal);
    let point = Vector.add(start, segment);
    return point;
  }
}


function update(path, currentPos, currentLeft, currentRight, heading, lookAheadDistance) {
  onLastSegment = false;
  let closestPointIndex = findclosestPointIndex(path, currentPos);
  let lookaheadPoint = new WayPoint(0, 0);

  for (let i = closestPointIndex + 1; i < path.length; i++) {
    let startPoint = new Vector(path[i-1].x(), path[i-1.y()]);
    let endPoint = new Vector(path[i].x(), path[i].y());

    onLastSegment = i == path.length - 1;


  }
}
