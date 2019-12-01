
const angleBetweenPoints = (target, current) =>
rollAngle180(Math.atan2(target.y - current.y, target.x - current.x));

const angleToPoint = (target, current, heading) =>
rollAngle180(angleBetweenPoints(target, current) - heading);


class PurePursuit {

  constructor(pos) {
    this.path = undefined;
    this.lookDistance = undefined;
    this.robotTrack = undefined;
    this.followBackward = false;

    // if(pos == undefined) pos = path[0].vector(); 
    this.bot = new Bot(localToCanvas({x:pos.x}).x, localToCanvas({y:pos.y}).y, ((Math.random()*2)-1)*2*PI);
    // this.bot = new Bot(localToCanvas({x:pos.x}).x, localToCanvas({y:pos.y}).y, -PI/2.0);


    this.lastClosestIndex = 0;
    this.lastLookIndex = 0;
    this.lastLookT = null;
    this.isFinished = false;

    this.lastPos = this.bot.getLocalPos();
    this.lastVelocity = minVel;
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

    let closestIndex = this.findClosestIndex(currentPos);
    let closestPoint = this.path[closestIndex];
    let onPath = (Vector.dist(currentPos, closestPoint.vector()) < this.lookDistance);

    let lookPoint = this.findLookahead(currentPos);
    let projectedLookPoint = Vector.add(Vector.scalarMult(Vector.normalize(Vector.sub(lookPoint, currentPos)), this.lookDistance), currentPos);
    let finalLookPoint = onPath && Vector.dist(currentPos, lookPoint) < Vector.dist(currentPos, projectedLookPoint) ? lookPoint : projectedLookPoint;

    let followBackward = false;
    if(Vector.dist(currentPos, this.path[this.path.length - 1].vector()) > this.lookDistance) {
      followBackward = this.followBackward;
    } else{
      let angleToLook = angleToPoint(lookPoint, currentPos, heading); 
      followBackward = Math.abs(angleToLook) > Math.PI / 2;;
    }

    if(followBackward) heading -= PI;
    let curvature = this.findLookaheadCurvature(currentPos, heading, finalLookPoint);

    // finished if on path, closest point is target, if lookahead is target, and if distance to
    // point is closer than a segment width
    this.isFinished =
    (closestIndex >= path.length - 1) ;

    let targetVel = 0;
    if(onPath) {
      targetVel = Math.min(closestPoint.velocity, turnK / Math.abs(curvature));
    } else {
      targetVel = Math.min(maxVel, turnK / Math.abs(curvature));
    }

    // minimum velocity
    targetVel = Math.max(targetVel, minVel);
    // get distance from last loop
    let distDt = Vector.dist(this.lastPos, currentPos);
    // get maximum allowable change in velocity
    let maxVelocity = Math.sqrt(Math.pow(this.lastVelocity, 2) + (2 * maxAccel * distDt));
    // limit the velocity
    if(targetVel > maxVelocity) targetVel = maxVelocity;

    this.lastPos = currentPos;
    this.lastVelocity = targetVel;

    let leftVel = 0;
    let rightVel = 0;
    if(!this.isFinished) {
      if(!followBackward) {
        leftVel = this.computeLeftVel(targetVel, curvature, this.robotTrack);
        rightVel = this.computeRightVel(targetVel, curvature, this.robotTrack);
      } else {
        leftVel = -this.computeRightVel(targetVel, curvature, this.robotTrack);
        rightVel = -this.computeLeftVel(targetVel, curvature, this.robotTrack);
      }
    }

    this.bot.tank(leftVel/maxVel, rightVel/maxVel);
    this.bot.update();

    drawLookahead(this.bot.getCanvasPos(), lookPoint, this.lookDistance, finalLookPoint);
    drawClosest(this.bot.getCanvasPos(), closestPoint.vector());
    drawCurvature(curvature, this.bot.getLocalPos(), finalLookPoint);
    this.bot.draw();
  }


  findClosestIndex(currentPos) {
    let closestDist = Number.POSITIVE_INFINITY;
    let closestIndex = this.lastClosestIndex;

    // Optimization:
    // limit the progression of the closest point
    // it considers the last closest point, and all the options up to the lookahead + 1
    // if the lookahead is 0, then new options will never be discovered unless the closest searches beyond
    // so it searches one point beyond the lookahead, and if that's closer, it will choose that
    // then later the lookahead will be bumped so it's not behind closest
    // this makes it so the closest can consider pushing the lookahead forward
    // the reason it does not scan all options so that the closest won't catch a much further point in an intersection 
    for (let i = closestIndex; i < this.lastLookIndex + 2; i++) {
      if(i >= this.path.length) break;
      let distance = Vector.dist(currentPos, this.path[i].vector());    
      if(distance < closestDist) {
        closestDist = distance;
        closestIndex = i;
      }
    }

    this.lastClosestIndex = closestIndex;
    return closestIndex;
  }


  findIntersectT(segmentStart, segmentEnd, currentPos) {
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

    // return the end of the path if it is within the lookahead
    if(Vector.dist(currentPos, this.path[this.path.length - 1].vector()) <= this.lookDistance) {
      this.lastLookIndex = this.path.length - 2;
      this.lastLookT = 1;
      return this.path[this.path.length - 1].vector();
    }

    // used for optimizing number of intersection searches
    let lastIntersect = 0;

    // loop through every segment looking for intersection
    for(let i = Math.max(this.lastLookIndex, this.lastClosestIndex); i < this.path.length - 1; i++) {
      let segmentStart = this.path[i].vector();
      let segmentEnd = this.path[i + 1].vector();

      let intersectionT = this.findIntersectT(segmentStart, segmentEnd, currentPos, this.lookDistance);
      if(intersectionT != null) {
        // If the segment is further along or the fractional index is greater, then this is the correct point
        if(i > this.lastLookIndex || intersectionT > this.lastLookT) {
          this.lastLookIndex = i;
          this.lastLookT = intersectionT;
          // if this is the second intersection that was found, we are done
          if(lastIntersect > 0) break;
          // record the index of the first intersection
          lastIntersect = i;
        }
      }

      // Optimization: if an intersection has been found, and the loop is checking distances from
      // the last intersection that are further than the lookahead, we are done.
      if(lastIntersect > 0 &&
       Vector.dist(this.path[i].vector(), this.path[lastIntersect].vector()) >= this.lookDistance * 2)
        break;
    }

    let segmentStart = this.path[this.lastLookIndex].vector();
    let segmentEnd = this.path[this.lastLookIndex + 1].vector();
    let lookPoint = Vector.add(
      segmentStart, Vector.scalarMult(Vector.sub(segmentEnd, segmentStart), this.lastLookT));

    return Vector.add(segmentStart, Vector.scalarMult(Vector.sub(segmentEnd, segmentStart), this.lastLookT));
  }


  findLookaheadCurvature(currentPos, heading, lookPoint) {
    let side = sgn(Math.sin(heading)*(lookPoint.x - currentPos.x) - Math.cos(heading)*(lookPoint.y - currentPos.y));
    let a = -Math.tan(heading);
    let c = Math.tan(heading)*currentPos.x - currentPos.y;
    let x = Math.abs(a * lookPoint.x + lookPoint.y + c) / Math.sqrt(Math.pow(a, 2) + 1);
    return side * ((2*x) / Math.pow(Vector.dist(currentPos, lookPoint), 2));
  }

  computeLeftVel(targetVel, curvature) {
    return targetVel * (2 + this.robotTrack * curvature) / 2;
  }

  computeRightVel(targetVel, curvature) {
    return targetVel * (2 - this.robotTrack * curvature) / 2;
  }

}

