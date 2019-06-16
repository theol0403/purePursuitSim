
function splinify(path, fit, sampleCount, dt, maxVel, maxAccel, maxJerk, candidate) {
    if (path.length <= 2) {return path;}

    let totalLength = 0;

    for (let i = 0; i < path.length - 1; i++) {
        let s = fit(path[i], path[i+1], s);
        let dist = splineDistance(s, sampleCount);
        candidate.splines[i] = s;
        candidate.lengths[i] = dist;
        totalLength += dist;
    }

    let config = new TrajectoryConfig(dt, maxVel, maxAccel, maxJerk, 0,
        path[0].angle, totalLength, 0, path[0].angle, sampleCount);

    let info = trajectoryPrepare(config);
}


function fitCubic(p1, p2, s) {
    let spl = fitPre(p1, p2, s);

    let a0_delta = Math.tan(boundRadians(p1.angle - spl.angle_offset));
    let a1_delta = Math.tan(boundRadians(p2.angle - spl.angle_offset));
    
    spl.a = 0;
    spl.b = 0;
    spl.c = (a0_delta + a1_delta) / (spl.knot_distance * spl.knot_distance);
    spl.d = -(2 * a0_delta + a1_delta) / spl.knot_distance;
    spl.e = a0_delta;

    return spl;
}


function fitPre(p1, p2, s) {
    let spl = new Spline(0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

    spl.y_offset = p1.y();
    spl.x_offset = p1.x();

    let delta = Math.sqrt(Math.pow(p2.x() - p1.x(), 2) + Math.pow(p2.y() - p1.y(), 2));
    spl.knot_distance = delta;
    spl.angle_offset = Math.atan2(p2.y() - p1.y(), p2.x() - p1.x());

    return spl;
}


function boundRadians(angle) {
    let newAngle = angle % (2 * Math.PI);
    if (newAngle < 0) {newAngle += 2 * Math.PI;}
    return newAngle;
}


function splineDistance(spline, sampleCount) {
    let a = spline.a;
    let b = spline.b;
    let c = spline.c;
    let d = spline.d;
    let e = spline.e;
    let knot = spline.knot_distance;

    let arcLength = 0;
    let t = 0;
    let dydt = 0;

    let deriv0 = splineDeriv(a, b, c, d, e, knot, 0);

    let integrand = 0;
    let lastIntegrand = Math.sqrt(1 + deriv0*deriv0) / sampleCount;

    for (let i = 0; i <= sampleCount; i++) {
        t = i / sampleCount;
        dydt = splineDeriv(a, b, c, d, e, knot, t);
        integrand = Math.sqrt(1 + dydt*dydt) / sampleCount;
        arcLength += (integrand + lastIntegrand) / 2;
        lastIntegrand = integrand;
    }

    let al = knot * arcLength;
    spline.arcLength = al;
    return al;
}


function splineDeriv(a, b, c, d, e, k, p) {
    let x = p * k;
    return (5*a*x + 4*b) * (x*x*x) + (3*c*x + 2*d) * x + e;
}


function trajectoryPrepare(config) {
    let maxA2 = config.maxA * config.maxA;
    let maxJ2 = config.maxJ * config.maxJ;

    let 
}