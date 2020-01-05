
class PathPoint {

  constructor(ix, iy) {
    this.loc = [ ix, iy ];
    this.distance = 0;
    this.velocity = 0;
    this.curvature = 0;
    this.segmentIndex = 0;
  }

  x() {
    return this.loc[0];
  }

  y() {
    return this.loc[1];
  }

  vector() {
    return new Vector(this.x(), this.y());
  }

  setDistance(idistance) {
    this.distance = idistance;
  }

  setVelocity(ivelocity) {
    this.velocity = ivelocity;
  }

  setCurvature(icurvature) {
    this.curvature = icurvature;
  }

  setSegmentIndex(isegmentIndex) {
    this.segmentIndex = isegmentIndex;
  }
}
