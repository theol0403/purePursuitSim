
function findClosestIndex(path, currentPos) {
  let closestDist = Number.POSITIVE_INFINITY;
  let closestIndex = 0;

  for (let i = closestIndex; i < path.length; i++) {
    let distance = Vector.dist(currentPos, path[i].vector());    
    if(distance < closestDist) {
      closestDist = distance;
      closestIndex = i;
    }
  }
  
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

var lastLook = {i: 0, t: null};

function findLookahead(path, currentPos, lookaheadDistance) {

  for(let i = lastLook.i; i < path.length - 1; i++) {
    let segmentStart = path[i].vector();
    let segmentEnd = path[i + 1].vector();

    let t = findIntersectionT(segmentStart, segmentEnd, currentPos, lookaheadDistance);
    if(t != null) {
      // If the segment is further along or the fractional index is greater, then this is the correct point
      if(i > lastLook.i || t > lastLook.t) {
        lastLook = {i: i, t: t};
        break;
      }
    }
  }
  // Just return last look ahead result
  if(lastLook.i >= path.length - 1) lastLook.i = path.length - 2;
  let segmentStart = path[lastLook.i].vector();
  let segmentEnd = path[lastLook.i + 1].vector();
  return Vector.add(segmentStart, Vector.scalarMult(Vector.sub(segmentEnd, segmentStart), lastLook.t));
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


function computeLeftVel(targetVel, curvature, robotTrack) {
  return targetVel * (2 + robotTrack * curvature) / 2;
}

function computeRightVel(targetVel, curvature, robotTrack) {
  return targetVel * (2 - robotTrack * curvature) / 2;
}


function update(path, currentPos, heading, lookaheadDistance) {
  let closestIndex = findClosestIndex(path, currentPos);
  let lookaheadPoint = findLookahead(path, currentPos, lookaheadDistance);

  let curvature = findLookaheadCurvature(currentPos, heading, lookaheadPoint, lookaheadDistance);
  let leftVel = computeLeftVel(path[closestIndex].velocity, curvature, 1/12.8);
  let rightVel = computeRightVel(path[closestIndex].velocity, curvature, 1/12.8);

  return {left: leftVel, right: rightVel, lookahead: lookaheadPoint, curvature: curvature, closest: path[closestIndex].vector()};
}
