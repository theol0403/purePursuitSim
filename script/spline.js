
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
    for (let power = 0; power < 6; power++) {
      xt += this.coeffs[power] * Math.pow(t, power);
    }

    return xt;
  }
}

class QuinticSegmentPlanner {

  constructor(s, g, steps, end) {
    this.rx = [];
    this.ry = [];

    let vxs = s.vel * Math.sin(s.theta);
    let vys = s.vel * Math.cos(s.theta);
    let vxg = g.vel * Math.sin(g.theta);
    let vyg = g.vel * Math.cos(g.theta);

    let xqp = new QuinticPolynomial(s.x, vxs, g.x, vxg);
    let yqp = new QuinticPolynomial(s.y, vys, g.y, vyg);

    for (let i = 0; i <= (end ? steps : steps - 1); i++) {
      this.rx.push(xqp.calcPoint(i / steps));
      this.ry.push(yqp.calcPoint(i / steps));
    }
  }

  getPath() {
    let path = []

    for (let i = 0; i < this.rx.length; i++) {
      let p = new PathPoint(this.rx[i], this.ry[i]);
      path.push(p);
    }

    return path;
  }
}

class QuinticPathPlanner {

  constructor(points, steps, slopeScalar = 0.8) {
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
    for (let i = 0; i < this.points.length - 1; i++) {
      let p1 = this.points[i];
      let p2 = this.points[i + 1];

      let vel = this.slopeScalar * Vector.dist(p1.vector(), p2.vector());
      p1.vel = vel;

      if (i == this.points.length - 2) {
        p2.vel = vel;
      }
    }
  }

  _generatePath() {
    if (this.points.length == 2) {
      let [p1, p2] = this.points;
      let segment = new QuinticSegmentPlanner(p1, p2, this.steps, true);
      this.path = segment.getPath();
    } else {
      this.path = [];
      for (let i = 0; i < this.points.length - 1; i++) {
        let p1 = this.points[i];
        let p2 = this.points[i + 1];
        let segment = new QuinticSegmentPlanner(p1, p2, this.steps, i >= this.points.length - 2);
        let segmentPath = segment.getPath();
        segmentPath.forEach(node => {
          node.setSegmentIndex(i);
        });
        this.path = this.path.concat(segmentPath);
      }
    }
  }
}

const angleBetweenPointsSpline = (current, target) =>
  rollAngle180(Math.atan2(target.x - current.x, target.y - current.y));

function calculateAngles(path) {
  path[0].theta = angleBetweenPointsSpline(path[0], path[1]);
  for (let i = 1; i < path.length - 1; i++) {
    path[i].theta = angleBetweenPointsSpline(path[i - 1], path[i + 1]);
  }
  path[path.length - 1].theta = angleBetweenPointsSpline(path[path.length - 2], path[path.length - 1]);
  return path;
}