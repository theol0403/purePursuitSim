
class WayPoint {

  constructor(x, y, theta, vel) {
    this.x = x;
    this.y = y;
    this.theta = theta;
    this.vel = vel;  
  }

  getCoords() {
    return new Vector(this.x, this.y);
  }

  vector() {
    return new Vector(this.x, this.y);
  }
}