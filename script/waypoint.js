
class WayPoint {

  constructor(x, y, theta) {
    this.x = x;
    this.y = y;
    this.theta = theta;
  }

  getCoords() {
    return new Vector(this.x, this.y);
  }

  vector() {
    return new Vector(this.x, this.y);
  }
}