
class PurePursuit {

  constructor(pos) {
    this.path = undefined;
    this.lookDistance = undefined;
    this.robotTrack = undefined;
    this.followBackward = false;

    // if(pos == undefined) pos = path[0].vector(); 
    this.bot = new Bot(localToCanvas({x:pos.x}).x, localToCanvas({y:pos.y}).y, -PI/2);

    this.lastClosestIndex = 0;
    this.lastLookIndex = 0;
    this.lastLookT = null;
    this.isFinished = false;
  }

  setPath(path) {
    this.path = path;
  }

  setLookDistance(lookDistance) {
    this.lookDistance = lookDistance;
  }

  setRobotTrack(robotTrack) {
    this.robotTrack = robotTrack;
  }

  update() {
    let currentPos = this.bot.getLocalPos();
    let heading = this.bot.getHeading();
    if(this.followBackward) heading -= PI;

    let closestIndex = this.findClosestIndex(currentPos);
    let closestPoint = this.path[closestIndex];
    let targetVel = closestPoint.velocity;

    let lookPoint = this.findLookahead(currentPos);
    let projectedLookPoint = Vector.add(Vector.scalarMult(Vector.normalize(Vector.sub(lookPoint, currentPos)), this.lookDistance), currentPos);
    let curvature = this.findLookaheadCurvature(currentPos, heading, projectedLookPoint);

    this.isFinished = (closestIndex >= path.length - 1) && (this.lastLookIndex >= path.length - 2) && (Vector.dist(currentPos, lookPoint) < this.lookDistance);

    let leftVel = 0;
    let rightVel = 0;
    if(!this.isFinished) {
      if(!this.followBackward) {
        leftVel = this.computeLeftVel(targetVel, curvature, this.robotTrack);
        rightVel = this.computeRightVel(targetVel, curvature, this.robotTrack);
      } else {
        leftVel = -this.computeRightVel(targetVel, curvature, this.robotTrack);
        rightVel = -this.computeLeftVel(targetVel, curvature, this.robotTrack);
      }
    }

    this.bot.tank(leftVel/maxVel, rightVel/maxVel);
    this.bot.update();

    drawLookahead(this.bot.getCanvasPos(), lookPoint, this.lookDistance, projectedLookPoint);
    drawClosest(this.bot.getCanvasPos(), closestPoint.vector());
    drawCurvature(curvature, this.bot.getLocalPos(), projectedLookPoint);
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

    this.lastClosestIndex = closestIndex;
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

      // prioritize further down path
      if (t2 >= 0 && t2 <= 1) {
        return t2;
      } else if (t1 >= 0 && t1 <= 1) {
        return t1;
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

      let intersectionT = this.findIntersectionT(segmentStart, segmentEnd, currentPos, this.lookDistance);
      if(intersectionT != null) {
        // If the segment is further along or the fractional index is greater, then this is the correct point
        if(i > this.lastLookIndex || intersectionT > this.lastLookT) {
          this.lastLookIndex = i;
          this.lastLookT = intersectionT;
          break;
        }
      }
    }

    let lookAheadIndex = this.lastLookIndex;
    // lookahead can't be behind closest
    if(lookAheadIndex < this.lastClosestIndex) lookAheadIndex = this.lastClosestIndex; // add here to push lookahead forward
    // make sure index is not beyond path
    if(lookAheadIndex > this.path.length-2) lookAheadIndex = this.path.length-2;

    let segmentStart = this.path[lookAheadIndex].vector();
    let segmentEnd = this.path[lookAheadIndex + 1].vector();
    return Vector.add(segmentStart, Vector.scalarMult(Vector.sub(segmentEnd, segmentStart), this.lastLookT));
  }


  findLookaheadCurvature(currentPos, heading, lookPoint) {
    let side = sgn(Math.sin(heading)*(lookPoint.x - currentPos.x) - Math.cos(heading)*(lookPoint.y - currentPos.y));
    let a = -Math.tan(heading);
    let c = Math.tan(heading)*currentPos.x - currentPos.y;
    let x = Math.abs(a * lookPoint.x + lookPoint.y + c) / Math.sqrt(Math.pow(a, 2) + 1);
    return side * ((2*x) / Math.pow(this.lookDistance, 2));
  }

  computeLeftVel(targetVel, curvature) {
    return targetVel * (2 + this.robotTrack * curvature) / 2;
  }

  computeRightVel(targetVel, curvature) {
    return targetVel * (2 - this.robotTrack * curvature) / 2;
  }

}

