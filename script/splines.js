
function splinify(path, fit, sampleCount, dt, maxVel, maxAccel, maxJerk, candidate) {
    if (path.length <= 2) {return path;}

    let totalLength = 0;

    for (let i = 0; i < path.length - 1; i++) {
        let s = fit(path[i], path[i+1], s);
    }
}


function fit_cubic(p1, p2, s) {
    let spl = fit_pre(p1, p2, s);

    let a0_delta = Math.tan(bound_radians(p1.angle - spl.angle_offset));
    let a1_delta = Math.tan(bound_radians(p2.angle - spl.angle_offset));
    
    spl.a = 0;
    spl.b = 0;
    spl.c = (a0_delta + a1_delta) / (spl.knot_distance * spl.knot_distance);
    spl.d = -(2 * a0_delta + a1_delta) / spl.knot_distance;
    spl.e = a0_delta;

    return spl;
}


function fit_pre(p1, p2, s) {
    let spl = new Spline(0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

    spl.y_offset = p1.y();
    spl.x_offset = p1.x();

    let delta = Math.sqrt(Math.pow(p2.x() - p1.x(), 2) + Math.pow(p2.y() - p1.y(), 2));
    spl.knot_distance = delta;
    spl.angle_offset = Math.atan2(p2.y() - p1.y(), p2.x() - p1.x());

    return spl;
}


function bound_radians(angle) {
    let newAngle = angle % (2 * Math.PI);
    if (newAngle < 0) {newAngle += 2 * Math.PI;}
    return newAngle;
}