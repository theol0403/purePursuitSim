
class QuinticSpline {

  constructor(waypoints) {
    this.waypoints = waypoints;

    this._generateControlVectors();
    this._generateSplines();
  }

  _generateControlVectors() {
    let vectors = [];
    
    for(let i = 0; i < length(this.waypoints) - 1; i++) {
      let p0 = this.waypoints[i];
      let p1 = this.waypoints[i+1];

      let scalar = 1.2 * Vector.dist(p0.vector(), p1.vector());

      vectors.push(this._createControlVector(scalar, p0));
      vectors.push(this._createControlVector(scalar, p1));
    }

    this.controlVectors = vectors;
  }

  _generateSplines() {
    let splines = [];

    for(let i = 0; i < length(this.controlVectors) - 1; i++) {
      let xInitial = this.controlVectors[i].x;
      let yInitial = this.controlVectors[i].y;
      let xFinal = this.controlVectors[i+1].x;
      let yFinal = this.controlVectors[i+1].y;

      splines.push(_this.generateSpline(xInitial, xFinal, yInitial, yFinal));
    }

    this.splines = splines;
  }

  _createControlVector(scalar, point) {
    return {x: [point.x, scalar * Math.cos(point.theta), 0],
            y: [point.y, scalar * Math.sin(point.theta), 0]};
  }

  _generateSpline(xInitial, xFinal, yInitial, yFinal) {
    let coeffs = math.zeros([6, 6]);

    let hermite = [[ -6, -3, -0.5,   6, -3, 0.5],
                   [ 15,  8,  1.5, -15,  7,   1],
                   [-10, -6, -1.5,  10, -4, 0.5],
                   [  0,  0,  0.5,   0,  0,   0],
                   [  0,  1,    0,   0,  0,   0],
                   [  1,  0,    0,   0,  0,  0]];

    let x = [[xInitial[0]], [xInitial[1]], [xInitial[2]], 
             [xFinal[0]], [xFinal[1]], [xFinal[2]]];

    let y = [[yInitial[0]], [yInitial[1]], [yInitial[2]], 
             [yFinal[0]], [yFinal[1]], [yFinal[2]]];

    coeffs.subset(math.index(0), math.transpose(hermite * x));
    coeffs.subset(math.index(1), math.transpose(hermite * y));

    for(let i = 0; i < 6; i++) {
      coeffs.subset(math.index([2, 3], i), math.subset(coeffs, math.index([0, 1], i) * (5-i)));
    }

    for(let i = 0; i < 5; i ++) {
      coeffs.subset(math.index([4, 5], i), math.subset(coeffs, math.index([2, 3], i) * (4-i)));
    }

    this.coeffs = coeffs;
  }
}