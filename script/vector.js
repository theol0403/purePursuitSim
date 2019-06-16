
class Vector {

  constructor(ix, iy) {
    this.x = ix;
    this.y = iy;
  }


  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }


  // vec1 - vec2
  static sub(vec1, vec2) {
    return new Vector(vec1.x - vec2.x, vec1.y - vec2.y);
  }


  // vec1 + vec2
  static add(vec1, vec2) {
    return new Vector(vec1.x + vec2.x, vec1.y + vec2.y);
  }


  // vec1 dotted with vec2
  static dot(vec1, vec2) {
    return (vec1.x * vec2.x) + (vec1.y * vec2.y);
  }

  // scalar multiplication
  static scalarMult(vec, scalar) {
    return new Vector(vec.x * scalar, vec.y * scalar);
  }

  //distance formula
  static dist(vec1, vec2) {
    return Math.sqrt((vec1.x - vec2.x) * (vec1.x - vec2.x) + (vec1.y - vec2.y) * (vec1.y - vec2.y));
  }
  
}
