
const SPEED_LIM = 1;
const TURN_MAG = 3;

const PI = Math.PI;
const TAU = Math.PI * 2;

const sgn = v => (v > 0 ? 1 : v < 0 ? -1 : 0);
const rollAngle360 = angle => angle - TAU * Math.floor(angle / TAU);
const rollAngle180 = angle => angle - TAU * Math.floor((angle + PI) / TAU);

class Bot {
  constructor(x, y, a) {
    this.pos = { x: x, y: y, a: a };
    this.vel = { x: 0, y: 0 };
    this.acc = { x: 0, y: 0 };
    this.spd = { l: 0, r: 0 };
  }

  tank(left, right) { this.spd = { l: Math.abs(left) > 1 ? 1 * sgn(left) : left, r: Math.abs(right) > 1 ? 1 * sgn(right) : right }; }

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

    this.vel.x = Math.cos(this.pos.a) * (this.spd.r + this.spd.l) * SPEED_LIM;
    this.vel.y = Math.sin(this.pos.a) * (this.spd.r + this.spd.l) * SPEED_LIM;

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
      this.pos.x + Math.cos(this.pos.a) * 10,
      this.pos.y + Math.sin(this.pos.a) * 10
      );
    c.closePath();
    c.stroke();

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