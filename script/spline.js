
function generateSpline(point0, theta0, point1, theta1) {
  let coeffs = [0, 0, 0, 0];
  let x0 = point0.loc[0];
  let y0 = point0.loc[1];
  let x1 = point1.loc[0];
  let y1 = point1.loc[1];

  let xOffset = x0;
  let yOffset = y0;

  let dist = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));

  // if same point
  if(dist == 0) {
    return coeffs;
  }

  let thetaOffset = Math.atan2(y1 - y0, x1 - x0);
  let theta0Diff = negPiToPi(theta0 - thetaOffset);
  let theta1Diff = negPiToPi(theta1 - thetaOffset);

  // if nearly 90 deg
  if(Math.abs(Math.abs(theta0Diff) - Math.PI/2) < 1e-6 || Math.abs(Math.abs(theta1Diff) - Math.PI/2) < 1e-6) {
    return false;
  }

  // if endpoints facing each other
  if(Math.abs(theta1Diff - theta0Diff) >= Math.PI/2) {
    return false;
  }

  let y0p = Math.tan(theta0Diff);
  let y1p = Math.tan(theta1Diff);

  let a = yOffset;
  let b = (y1p + y0p) / Math.pow(dist, 2);
  let c = - (2*y0p + y1p) / dist;
  let d = y0p;

  coeffs = [a, b, c, d];

  return coeffs, xOffset;
}

function negPiToPi(angle) {
  while(angle >= Math.PI) {
    angle -= 2.0 * Math.PI;
  }
  while(angle > -Math.PI) {
    angle += 2.0 * Math.PI;
  }

  return angle;
}

function evalSpline(t, coeffs, xOffset=0) {
  let order = coeffs.length;
  let sum = 0;

  for(let i = 0; i < order; i++) {
    sum += coeffs[i] * Math.pow(t, i);
  }

  return sum;
}