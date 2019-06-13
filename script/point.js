
let Point = { x: 0, y: 0 };

class WayPoint {

  constructor(ix, iy) {
    this.loc = [ ix, iy ];
    this.distance = 0;
    this.velocity = 0;
    this.curvature = 0;
  }

  // constructor(WayPoint p) {
  //   this.loc = p.loc;
  //   this.distance = p.distance;
  //   this.velocity = p.velocity;
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

  setVelocity(ivelocity) {
    this.velocity = ivelocity;
  }

  setCurvature(icurvature) {
    this.curvature = icurvature;
  }
}
