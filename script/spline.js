
class QuinticPolynomial {
  
  constructor(xstart, vstart, xend, vend) {

    let A = math.matrix([[1,  1,  1],
                         [3,  4,  5],
                         [6, 12, 20]]);
    let b = math.matrix([[xend - xstart - vstart * T],
                         [vend - vstart],
                         [0]]);

    let x = math.lusolve(A, b);

    let a3 = math.subset(x, math.index(0, 0));
    let a4 = math.subset(x, math.index(1, 0));
    let a5 = math.subset(x, math.index(2, 0));

    this.coeffs = [xstart, vstart, 0, a3, a4, a5];
  }

  calcPoint(t) {
    let xt = 0;
    for(let power = 0; power < 6; power++) {
      xt += this.coeffs[power] * Math.pow(t, power);
    }

    return xt;
  }
}

class QuinticSegmentPlanner {

  constructor(s, g, dt) {
    let vxs = s.vel * Math.cos(s.theta);
    let vys = s.vel * Math.sin(s.theta);
    let vxg = g.vel * Math.cos(g.theta);
    let vyg = g.vel * Math.sin(g.theta);
    
    let xqp = new QuinticPolynomial(s.x, vxs, g.x, vxg);
    let yqp = new QuinticPolynomial(s.y, vys, g.y, vyg);

    this.rx = [];
    this.ry = [];

    for(let t = 0; t <= 1; t += dt) {
      this.rx.push(xqp.calcPoint(t));
      this.ry.push(yqp.calcPoint(t));
    }
  }

  getPath() {
    let path = []

    for(let i = 0; i < this.rx.length; i++) {
      let p = new PathPoint(this.rx[i], this.ry[i]);
      path.push(p);
    }

    return path;
  }
}

class QuinticPathPlanner {

  constructor(points, dt=0.01, slopeScalar=0.8) {
    this.points = points;
    this.dt = dt;
    this.slopeScalar = slopeScalar;
    this._generateVelocities();
    this._generatePath();
  }

  getPath() {
    return this.path;
  }

  _generateVelocities() {
    for(let i = 0; i < this.points.length-1; i++) {
      let p1 = this.points[i];
      let p2 = this.points[i+1];

      let vel = this.slopeScalar * Vector.dist(p1.vector(), p2.vector());
      p1.vel = vel;

      if(i == this.points.length - 2) {
        p2.vel = vel;
      }
    }
  }

  _generatePath() {
    if(this.points.length == 2) {
      let [p1, p2] = this.points;
      let segment = new QuinticSegmentPlanner(p1, p2, this.dt);

      this.path = segment.getPath();
    } else {
      this.path = [];
      for(let i = 0; i < this.points.length - 1; i++) {
        let p1 = this.points[i];
        let p2 = this.points[i+1];
        let segment = new QuinticSegmentPlanner(p1, p2, this.dt);
        let segmentPath = segment.getPath();
        segmentPath.forEach(node => {
          node.setSegmentIndex(i);
        });
        this.path = this.path.concat(segmentPath);
      }
    }
  }
}