
class Vector {

  constructor(ix, iy) {
    this.x = ix;
    thix.y = iy;
  }

  // vec1 - vec2
  static sub(vec1, vec2) {
    return Vector(vec1.x - vec2.x, vec1.y - vec2.y);
  }


  // vec1 dotted with vec2
  static dot(vec1, vec2) {
    return (vec1.x * ve2.x) + (vec1.y * vec2.y);
  }
}
