
class PurePursuit {

  constructor(pos) {
    this.path = undefined;
    this.lookDistance = undefined;
    this.robotTrack = undefined;
    this.followBackward = false;

    // if(pos == undefined) pos = path[0].vector(); 
    this.bot = new Bot(localToCanvas({x:pos.x}).x, localToCanvas({y:pos.y}).y, ((Math.random()*2)-1)*2*PI);

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
    let onPath = (Vector.dist(currentPos, closestPoint.vector()) < this.lookDistance);

    let lookPoint = this.findLookahead(currentPos);
    let projectedLookPoint = Vector.add(Vector.scalarMult(Vector.normalize(Vector.sub(lookPoint, currentPos)), this.lookDistance), currentPos);
    let finalLookPoint = onPath && Vector.dist(currentPos, lookPoint) < Vector.dist(currentPos, projectedLookPoint) ? lookPoint : projectedLookPoint;

    let curvature = this.findLookaheadCurvature(currentPos, heading, finalLookPoint);

    // finished if on path, closest point is target, if lookahead is target, and if distance to
    // point is closer than a segment width
    this.isFinished =
        onPath && (closestIndex >= path.length - 1) && this.lastLookIndex >= path.length - 2;

    let targetVel = 0;
    if(onPath) {
      targetVel = Math.min(closestPoint.velocity, turnK / Math.abs(curvature));
    } else {
      targetVel = Math.min(maxVel, turnK / Math.abs(curvature));
    }

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
    for (let i = closestIndex; i <= this.lastLookIndex + 1; i++) {
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
    // used for optimizing number of intersection searches
    let lastIntersection = 0;

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
          // if this is the second intersection that was found, we are done
          if(lastIntersection > 0) break;
          // record the index of the first intersection
          lastIntersection = i;
        }
      }

      // Optimization: if an intersection has been found, and the loop is checking distances from
      // the last intersection that are further than the lookahead, we are done.
      if(lastIntersect > 0 &&
         Vector.dist(this.path[i].vector(), this.path[lastIntersect].vector()) >= this.lookDistance) {
        break;
      }
    }

    // lookahead can't be behind closest
    if(this.lastLookIndex < this.lastClosestIndex) {
      this.lastLookIndex = this.lastClosestIndex; // add here to push lookahead forward
      this.lastLookT = 1; // assume lookahead is furthest along segment
    }
    // make sure index is not beyond path
    if(this.lastLookIndex > this.path.length-2) {
      this.lastLookIndex = this.path.length-2;
      this.lastLookT = 1; // assume lookahead is furthest along segment, as it was trying to go further anyway
    }
    let segmentStart = this.path[this.lastLookIndex].vector();
    let segmentEnd = this.path[this.lastLookIndex + 1].vector();
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

