
const SPEED_LIM = 2;

const PI = Math.PI;
const TAU = Math.PI * 2;

const sgn = v => (v > 0 ? 1 : v < 0 ? -1 : 0);
const rollAngle360 = angle => angle - TAU * Math.floor(angle / TAU);
const rollAngle180 = angle => angle - TAU * Math.floor((angle + PI) / TAU);

const slew = (input, last, slewRate) => {
  return _.clamp(input, last - slewRate, last + slewRate);
  // return last += _.clamp(input - last, -slewRate, slewRate);
}

class Bot {
  constructor(x, y, a) {
    this.pos = { x: x, y: y, a: a };
    this.vel = { x: 0, y: 0 };
    this.spd = { l: 0, r: 0 };
  }

  tank(left, right) { 

    ///////////
    // Clamp //
    ///////////
    // left = _.clamp(left, -1, 1);
    // right = _.clamp(right, -1, 1);

    ////////////////
    // Scale down //
    //////////////
    // let maxMag = Math.max(Math.abs(left), Math.abs(right));
    // if (maxMag > 1) {
    //   left /= maxMag;
    //   right /= maxMag;
    // }

    /////////////////////////////////
    // Subtract overflow from both //
    /////////////////////////////////
    let maxMag;
    if(Math.abs(left) > Math.abs(right)) {
      maxMag = left;
    } else {
      maxMag = right;
    }
    if(Math.abs(maxMag) > 1) {
      left -= (Math.abs(maxMag) - 1) * sgn(maxMag);
      right -= (Math.abs(maxMag) - 1) * sgn(maxMag);
    }

    this.spd = {l: left, r: right}; 
  }

  getLocalPos() {
    return canvasToLocal(this.pos);
  }

  getCanvasPos() {
    return this.pos;
  }

  getHeading() {
    return -this.pos.a;
  }

  update() {
    let dA = (this.spd.r - this.spd.l) * SPEED_LIM / PI;
    this.pos.a -= dA;
    this.pos.a = rollAngle180(this.pos.a);

    let xVel = Math.cos(this.pos.a) * (this.spd.r + this.spd.l) * SPEED_LIM;
    let yVel = Math.sin(this.pos.a) * (this.spd.r + this.spd.l) * SPEED_LIM;

    this.vel.x = slew(xVel, this.vel.x, 0.2);
    this.vel.y = slew(yVel, this.vel.y, 0.2);;

    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
  }

  draw() {
    c.fillStyle = "#000";
    c.beginPath();
    c.arc(this.pos.x, this.pos.y, 4, 0, Math.PI * 2);
    c.closePath();
    c.fill();

    c.strokeStyle = "#000";
    c.beginPath();
    c.moveTo(this.pos.x, this.pos.y);
    c.lineTo(
      this.pos.x + Math.cos(this.pos.a) * 15,
      this.pos.y + Math.sin(this.pos.a) * 15
      );
    c.closePath();
    c.stroke();

    c.lineWidth = "2";
    c.strokeStyle = "#0F0";
    c.beginPath();
    c.moveTo(
      this.pos.x + Math.cos(this.pos.a + Math.PI / 2) * 10,
      this.pos.y + Math.sin(this.pos.a + Math.PI / 2) * 10
      );
    c.lineTo(
      this.pos.x +
      Math.cos(this.pos.a + Math.PI / 2) * 10 +
      this.spd.r * 20 * Math.cos(this.pos.a),
      this.pos.y +
      Math.sin(this.pos.a + Math.PI / 2) * 10 +
      this.spd.r * 20 * Math.sin(this.pos.a)
      );
    c.closePath();
    c.stroke();

    c.strokeStyle = "#0F0";
    c.beginPath();
    c.moveTo(
      this.pos.x + Math.cos(this.pos.a - Math.PI / 2) * 10,
      this.pos.y + Math.sin(this.pos.a - Math.PI / 2) * 10
      );
    c.lineTo(
      this.pos.x +
      Math.cos(this.pos.a - Math.PI / 2) * 10 +
      this.spd.l * 20 * Math.cos(this.pos.a),
      this.pos.y +
      Math.sin(this.pos.a - Math.PI / 2) * 10 +
      this.spd.l * 20 * Math.sin(this.pos.a)
      );
    c.closePath();
    c.stroke();
  }
}