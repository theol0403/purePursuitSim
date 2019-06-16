
class Spine {
    constructor(a, b, c, d, e, x_offset, y_offset, angle_offset, knot_distance, arc_length) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.x_offset = x_offset;
        this.y_offset = y_offset;
        this.angle_offset = angle_offset;
        this.knot_distance = knot_distance;
        this.arc_length = arc_length;
    }
}


class TrajectoryConfig {
    constructor(dt, x, y, position, velocity, acceleration, jerk, heading) {
        this.dt = dt;
        this.x = x;
        this.y = y;
        this.position = position;
        this.velocity = velocity;
        this.acceleration = acceleration;
        this.jerk = jerk;
        this.heading = heading;
    }
}


class TrajectoryInfo {
    constructor(filter1, filter2, length, dt, u, v, impulse) {
        this.filter1 = filter1;
        this.filter2 = filter2;
        this.length = length;
        this.dt = dt;
        this.u = u;
        this.v = v;
        this.impulse = impulse;
    }
}


class TrajectoryCandidate {
    constructor(splines, lengths, totalLength, length, path_length, info, config) {
        this.splines = splines;
        this.lengths = lengths;
        this.totalLength = totalLength;
        this.length = length;
        this.path_length = path_length;
        this.info = info;
        this.config = config;
    }
}