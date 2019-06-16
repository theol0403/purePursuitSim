
class Spline {
    constructor(a, b, c, d, e, x_offset, y_offset, angle_offset, knot_distance, arcLength) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.x_offset = x_offset;
        this.y_offset = y_offset;
        this.angle_offset = angle_offset;
        this.knot_distance = knot_distance;
        this.arcLength = arcLength;
    }
}


class TrajectoryConfig {
    constructor(dt, maxV, maxA, maxJ, srcV, srcTheta, destPos, destV, destTheta, sampleCount) {
        this.dt = dt;
        this.maxV = maxV;
        this.maxA = maxA;
        this.maxJ = maxJ;
        this.srcV = srcV;
        this.srcTheta = srcTheta;
        this.destPos = destPos;
        this.destV = destV;
        this.destTheta = destTheta;
        this.sampleCount = sampleCount;
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
    constructor(splines, lengths, totalLength, length, pathLength, info, config) {
        this.splines = splines;
        this.lengths = lengths;
        this.totalLength = totalLength;
        this.length = length;
        this.pathLength = pathLength;
        this.info = info;
        this.config = config;
    }
}