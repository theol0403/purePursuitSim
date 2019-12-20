
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
    this.a4 = math.subset(x, math.index(0, 1));
    this.a5 = math.subset(x, math.index(0, 2));

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