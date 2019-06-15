
const dist = (a, b) =>
Math.sqrt((a.x() - b.x()) * (a.x() - b.x()) + (a.y() - b.y()) * (a.y() - b.y()));


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
