
// TODO get rid of these somehow
const minTime = 3;
const maxtime = 100;

class QuinticPolynomial {
  
  constructor(xstart, vstart, astart, xend, vend, aend, T) {
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

  calcFirstDeriv(t) {
    let xt = 0;
    for(let power = 1; power < 6; power ++) {
      xt += power * this.coeffs[power] * Math.pow(t, power - 1);
    }

    return xt;
  }

  calcSecondDeriv(t) {
    let xt = 0;
    for(let power = 2; power < 6; power ++) {
      xt += power * (power - 1) * this.coeffs[power] * Math.pow(t, power - 2);
    }

    return xt;
  }

  calcThirdDeriv(t) {
    let xt = 0;
    for(let power = 3; power < 6; power ++) {
      xt += power * (power - 1) * (power - 2) * this.coeffs[power] * Math.pow(t, power - 3);
    }

    return xt;
  }
}

class QuinticSegmentPlanner {

  constructor(sx, sy, syaw, sv, sa, gx, gy, gyaw, gv, ga, maxA, maxJ, dt) {
    let vxs = sv * Math.cos(syaw);
    let vys = sv * Math.sin(syaw);
    let vxg = gv * Math.cos(gyaw);
    let vyg = gv * Math.sin(gyaw);

    let axs = sa * Math.cos(syaw);
    let ays = sa * Math.sin(syaw);
    let axg = ga * Math.cos(gyaw);
    let ayg = ga * Math.sin(gyaw);
    
    for(let T = minTime; T <= maxtime; T += minTime) {
      let xqp = new QuinticPolynomial(sx, vxs, axs, gx, vxg, axg, T);
      let yqp = new QuinticPolynomial(sy, vys, ays, gy, vyg, ayg, T);

      let time = [];
      let rx = [];
      let ry = [];
      let ryaw = [];
      let rv = [];
      let ra = [];
      let rj = [];

      for(let t = 0; t <= T + dt; t += dt) {
        time.push(t);
        rx.push(xqp.calcPoint(t));
        ry.push(yqp.calcPoint(t));

        let vx = xqp.calcFirstDeriv(t);
        let vy = yqp.calcFirstDeriv(t);
        rv.push(math.hypot(vx, vy));
        ryaw.push(Math.atan2(vy, vx));

        let ax = xqp.calcSecondDeriv(t);
        let ay = yqp.calcSecondDeriv(t);
        let a = math.hypot(ax, ay);
        if(rv.length >=2 && rv[rv.length-1] - rv[rv.length-2] < 0) {
          a *= -1;
        }
        ra.push(a);

        let jx = xqp.calcThirdDeriv(t);
        let jy = yqp.calcThirdDeriv(t);
        let j = math.hypot(jx, jy);
        if(ra.length >=2 && ra[ra.length-1] - ra[ra.length-2] < 0) {
          j *= -1;
        }
        rj.push(j);
      }

      if(Math.max(math.abs(ra)) <= maxA && Math.max(math.abs(rj)) <= maxJ) {
        console.log('path found');
        break;
      }

      this.results = [time, rx, ry, ryaw, rv, ra, rj];
    }
  }

  getPath() {
    let path = []
    let [t, x, y, theta, v, a, j] = this.results;

    for(let i = 0; i < x.length; i++) {
      let p = new PathPoint(x[i], y[i]);
      path.push(p);
    }

    return path;
  }
}

class QuinticPathPlanner {

  constructor(points, maxAccel, maxJerk, dt=2) {
    if(points.length == 2) {
      let [p1, p2] = points;
      let segment = new QuinticSegmentPlanner(p1.x, p1.y, p1.theta, p1.vel, p1.accel,
                                          p2.x, p2.y, p2.theta, p2.vel, p2.accel, maxAccel, maxJerk, dt);

      this.path = segment.getPath();
    } else {
      this.path = [];
      for(let i = 0; i < points.length - 1; i++) {
        let p1 = points[i];
        let p2 = points[i+1];
        let segment = new QuinticSegmentPlanner(p1.x, p1.y, p1.theta, p1.vel, p1.accel,
                                                p2.x, p2.y, p2.theta, p2.vel, p2.accel, maxAccel, maxJerk, dt);
        
        this.path = this.path.concat(segment.getPath());
      }
    }
  }

  getPath() {
    return this.path;
  }
}