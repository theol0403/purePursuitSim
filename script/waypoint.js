
class WayPoint {

  constructor(x, y, theta, vel, accel) {
    this.x = x;
    this.y = y;
    this.theta = theta;
    this.vel = vel;
    this.accel = accel;
  }

  getCoords() {
    return new Vector(x, y);
  }
}