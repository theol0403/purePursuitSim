
class QuinticPolynomial {
  
  constructor(xstart, vstart, xend, vend) {
    let u = xend - xstart - vstart;
    let v = vend - vstart;

    let a3 = 10 * u - 4 * v;
    let a4 = -15 * u + 7 * v;
    let a5 = 6 * u - 3 * v;

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

  constructor(s, g, steps) {
    this.rx = [];
    this.ry = [];

    if(steps <= 0) {
      this.rx.push(s.x);
      this.ry.push(s.y);
    } else {
      let vxs = s.vel * Math.cos(s.theta);
      let vys = s.vel * Math.sin(s.theta);
      let vxg = g.vel * Math.cos(g.theta);
      let vyg = g.vel * Math.sin(g.theta);

      let xqp = new QuinticPolynomial(s.x, vxs, g.x, vxg);
      let yqp = new QuinticPolynomial(s.y, vys, g.y, vyg);

      for(let t = 0; t <= 1; t += 1 / steps) {
        this.rx.push(xqp.calcPoint(t));
        this.ry.push(yqp.calcPoint(t));
      }
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

  constructor(points, steps, slopeScalar=0.8) {
    this.points = points;
    this.steps = steps;
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
      let segment = new QuinticSegmentPlanner(p1, p2, this.steps);
      this.path = segment.getPath();
    } else {
      this.path = [];
      for(let i = 0; i < this.points.length - 1; i++) {
        let p1 = this.points[i];
        let p2 = this.points[i+1];
        let segment =
          new QuinticSegmentPlanner(p1, p2, i == this.points.length - 2 ? this.steps : this.steps-1);
        let segmentPath = segment.getPath();
        segmentPath.forEach(node => {
          node.setSegmentIndex(i);
        });
        this.path = this.path.concat(segmentPath);
      }
    }
  }
}