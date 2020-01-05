
class WayPoint {

  constructor(x, y, theta) {
    this.x = x;
    this.y = y;
    this.theta = theta;
    this.vel = 0;
  }

  getCoords() {
    return new Vector(this.x, this.y);
  }

  vector() {
    return new Vector(this.x, this.y);
  }
}