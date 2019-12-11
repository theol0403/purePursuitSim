
class WayPoint {

  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.theta = Infinity;
    this.accel = 0;
  }

  constructor(x, y, theta) {
    this.x = x;
    this.y = y;
    this.theta = theta;
    this.accel = 0;
  }

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