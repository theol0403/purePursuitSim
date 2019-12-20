
class WayPoint {

  constructor(x, y, theta, accel) {
    this.x = x;
    this.y = y;
    this.theta = theta;
    this.accel = accel;
  }

  getCoords() {
    return new Vector(x, y);
  }
}