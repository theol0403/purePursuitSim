
class QuinticSpline {
  
  constructor(x0, y0, theta0, accel0, x1, y1, theta1, accel1) {
    this.x0 = x0;
    this.y0 = y0;
    this.theta0 = theta0;
    this.accel0 = accel0;
    
    this.x1 = x1;
    this.y1 = y1;
    this.theta1 = theta1;
    this.accel1 = accel1;
  }

  // using points with internal x and y
  constructor(point0, theta0, accel0, point1, theta1, accel1) {
    this.x0 = point0.x;
    this.y0 = point0.y;
    this.theta0 = theta0;
    this.accel0 = accel0;
    
    this.x1 = point1.x;
    this.y1 = point1.y;
    this.theta1 = theta1;
    this.accel1 = accel1;
  }

  // using WayPoints
  constructor(point0, point1) {
    this.x0 = point0.x;
    this.y0 = point0.y;
    this.theta0 = point0.theta;
    this.accel0 = point0.accel;
    
    this.x1 = point1.x;
    this.y1 = point1.y;
    this.theta1 = point1.theta;
    this.accel1 = point1.accel;
  }
}