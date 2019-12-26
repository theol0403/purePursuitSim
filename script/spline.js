
class QuinticPolynomial {
  
  constructor(xstart, vstart, xend, vend) {
    let T = 1;

    let A = math.matrix([[Math.pow(T, 3), Math.pow(T, 4), Math.pow(T, 5)],
                         [3 * T*T, 4 * Math.pow(T, 3), 5 * Math.pow(T, 4)],
                         [6 * T, 12 * T*T, 20 * Math.pow(T, 3)]]);
    let b = math.matrix([[xend - xstart - vstart * T],
                         [vend - vstart],
                         [0]]);

    let x = math.lusolve(A, b);

    this.a3 = math.subset(x, math.index(0, 0));
    this.a4 = math.subset(x, math.index(1, 0));
    this.a5 = math.subset(x, math.index(2, 0));

    this.coeffs = [xstart, vstart, 0, this.a3, this.a4, this.a5];
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

  constructor(points, dt=0.01) {
    if(points.length == 2) {
      let [p1, p2] = points;
      let segment = new QuinticSegmentPlanner(p1, p2, dt);

      this.path = segment.getPath();
    } else {
      this.path = [];
      for(let i = 0; i < points.length - 1; i++) {
        let p1 = points[i];
        let p2 = points[i+1];
        let segment = new QuinticSegmentPlanner(p1, p2, dt);

        this.path = this.path.concat(segment.getPath());
      }
    }
  }

  getPath() {
    return this.path;
  }
}