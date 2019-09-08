
class PurePursuit {

  constructor(path, lookDistance, robotTrack, pos) {
    this.path = path;
    this.lookDistance = lookDistance;
    this.robotTrack = robotTrack;

    if(pos == undefined) pos = path[0].vector(); 
    this.bot = new Bot(localToCanvas(pos[0]).x, localToCanvas(pos[0]).y, -PI/2);

    this.lastLookIndex = 0;
    this.lastLookT = null;
  }

  setLookDistance(lookDistance) {
    this.lookDistance = lookDistance;
  }

  update() {
    let currentPos = this.bot.getLocalPos();
    let heading = this.bot.getHeading();

    let closestIndex = findClosestIndex(currentPos);
    let closestPoint = this.path[closestIndex];
    let targetVel = closestPoint.velocity;

    let lookPoint = findLookahead(currentPos);
    let curvature = findLookaheadCurvature(currentPos, heading, lookPoint);

    let leftVel = computeLeftVel(targetVel, curvature, this.robotTrack);
    let rightVel = computeRightVel(targetVel, curvature, this.robotTrack);

    this.bot.tank(leftVel/maxVel, rightVel/maxVel);
    this.bot.update();

    drawLookahead(bot.getCanvasPos(), lookPoint, this.lookDistance);
    drawClosest(bot.getCanvasPos(), closestPoint.vector());
    drawCurvature(curvature, this.bot.getLocalPos(), lookPoint);
    this.bot.draw();
  }


  findClosestIndex(currentPos) {
    let closestDist = Number.POSITIVE_INFINITY;
    let closestIndex = 0;

    for (let i = closestIndex; i < this.path.length; i++) {
      let distance = Vector.dist(currentPos, this.path[i].vector());    
      if(distance < closestDist) {
        closestDist = distance;
        closestIndex = i;
      }
    }

    return closestIndex;
  }


  findIntersectionT(segmentStart, segmentEnd, currentPos) {
    let d = Vector.sub(segmentEnd, segmentStart);
    let f = Vector.sub(segmentStart, currentPos);

    let a = Vector.dot(d, d);
    let b = 2 * Vector.dot(f, d);
    let c = Vector.dot(f, f) - Math.pow(this.lookDistance, 2);
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


  findLookahead(currentPos) {
    // loop through every segment looking for intersection
    for(let i = this.lastLookIndex; i < this.path.length - 1; i++) {
      let segmentStart = this.path[i].vector();
      let segmentEnd = this.path[i + 1].vector();

      let intersectionT = findIntersectionT(segmentStart, segmentEnd, currentPos, this.lookDistance);
      if(t != null) {
        // If the segment is further along or the fractional index is greater, then this is the correct point
        if(i > this.lastLookIndex || intersectionT > this.lastLookT) {
          this.lastLookIndex = i;
          this.lastLookT = intersectionT;
          break;
        }
      }
    }

    // check if path got smaller
    if(this.lastLookIndex > this.path.length-2) this.lastLookIndex = this.path.length-2;
    // Just return last look ahead result
    let segmentStart = this.path[this.lastLookIndex].vector();
    let segmentEnd = this.path[this.lastLookIndex + 1].vector();
    return Vector.add(segmentStart, Vector.scalarMult(Vector.sub(segmentEnd, segmentStart), this.lastLookT));
  }



  findLookaheadCurvature(currentPos, heading, lookPoint) {
    // let a = -Math.tan(heading);
    // let b = 1;
    // let c = (Math.tan(heading) * currentPos.x) - currentPos.y;
    // let x = Math.abs((a * lookPoint.x) + (b * lookPoint.y) + c) / Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
    // let cross = (Math.sin(heading) * (lookPoint.x - currentPos.x)) - (Math.cos(heading) * (lookPoint.y - currentPos.y));
    // let side = cross > 0 ? 1 : -1;
    // let curvature = (2 * x) / Math.pow(this.lookDistance, 2);
    // return curvature * side;

    let side = sgn(Math.sin(heading)*(lookPoint.x-currentPos.x) - Math.cos(heading)*(lookPoint.y-currentPos.y))
    let a = -Math.tan(heading)
    let c = Math.tan(heading)*currentPos.x - currentPos.y
    let x = Math.abs(a * lookPoint.x + lookPoint.y + c) / Math.sqrt(Math.pow(a, 2) + 1)
    return side * (2*x/(Math.pow(this.lookDistance, 2)))
  }


  computeLeftVel(targetVel, curvature) {
    return targetVel * (2 + this.robotTrack * curvature) / 2;
  }

  computeRightVel(targetVel, curvature) {
    return targetVel * (2 - this.robotTrack * curvature) / 2;
  }

}




