
let Point = { x: 0, y: 0 };

class WayPoint {

  constructor(ix, iy) {
    this.loc = [ ix, iy ];
    this.distance = 0;
    this.targetVel = 0;
    this.curvature = 0;
  }

  // constructor(WayPoint p) {
  //   this.loc = p.loc;
  //   this.distance = p.distance;
  //   this.targetVel = p.targetVel;
  //   this.curvature = p.curvature;
  // }

  x() {
    return this.loc[0];
  }

  y() {
    return this.loc[1];
  }

  setDistance(idistance) {
    this.distance = idistance;
  }

  setTargetVel(itargetVel) {
    this.targetVel = itargetVel;
  }

  setCurvature(icurvature) {
    this.curvature = icurvature;
  }
}
