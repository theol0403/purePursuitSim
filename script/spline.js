
class QuinticPolynomial {
  
  constructor(xstart, vstart, astart, xend, vend, aend) {
    let T = 1;

    this.xs = xstart;
    this.vs = vstart;
    this.as = astart;
    this.xe = xend;
    this.ve = vend;
    this.ae = aend;
    
    this.a0 = this.xs;
    this.a1 = this.vs;
    this.a2 = this.as / 2.0;

    let A = math.matrix([[Math.pow(T, 3), Math.pow(T, 4), Math.pow(T, 5)],
                         [3 * T*T, 4 * Math.pow(T, 3), 5 * Math.pow(T, 4)],
                         [6 * T, 12 * T*T, 20 * Math.pow(T, 3)]]);
    let b = math.matrix([[this.xe - this.a0 - this.a1 * T - this.a2 * T*T],
                         [this.ve - this.a1 - 2 * this.a2 * T],
                         [this.ae - 2 * this.a2]]);

    let x = math.lusolve(A, b);

    this.a3 = math.subset(x, math.index(0, 0));
    this.a4 = math.subset(x, math.index(1, 0));
    this.a5 = math.subset(x, math.index(2, 0));

    this.coeffs = [this.a0, this.a1, this.a2, this.a3, this.a4, this.a5];
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

  constructor(sx, sy, syaw, sv, sa, gx, gy, gyaw, gv, ga, dt) {
    let vxs = sv * Math.cos(syaw);
    let vys = sv * Math.sin(syaw);
    let vxg = gv * Math.cos(gyaw);
    let vyg = gv * Math.sin(gyaw);

    let axs = sa * Math.cos(syaw);
    let ays = sa * Math.sin(syaw);
    let axg = ga * Math.cos(gyaw);
    let ayg = ga * Math.sin(gyaw);
    
    let xqp = new QuinticPolynomial(sx, vxs, axs, gx, vxg, axg);
    let yqp = new QuinticPolynomial(sy, vys, ays, gy, vyg, ayg);

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
      let segment = new QuinticSegmentPlanner(p1.x, p1.y, p1.theta, p1.vel, p1.accel,
                                              p2.x, p2.y, p2.theta, p2.vel, p2.accel, dt);

      this.path = segment.getPath();
    } else {
      this.path = [];
      for(let i = 0; i < points.length - 1; i++) {
        let p1 = points[i];
        let p2 = points[i+1];
        let segment = new QuinticSegmentPlanner(p1.x, p1.y, p1.theta, p1.vel, p1.accel,
                                                p2.x, p2.y, p2.theta, p2.vel, p2.accel, dt);
        
        this.path = this.path.concat(segment.getPath());
      }
    }
  }

  getPath() {
    return this.path;
  }
}