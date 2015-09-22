/**
 * Heavily modified from https://github.com/szimek/signature_pad to use PIXI.js graphics object and not use mouse/touch
 * events here.
 */
var SignaturePad = (function () {
  "use strict";

  var SignaturePad = function (graphics, options) {
    var opts = options || {};

    this.velocityFilterWeight = opts.velocityFilterWeight || 0.7;
    this.minWidth = opts.minWidth || 0.5;
    this.maxWidth = opts.maxWidth || 2.5;

    this._lastVelocity = 0;
    this._lastWidth = this.minWidth;

    this.points = [];

    this._ctx = graphics;
  };

  SignaturePad.prototype.addPoint = function (point) {
    var points = this.points,
      c2, c3, curve, tmp;

    points.push(new Point(point[0], point[1], point[2]));

    if (points.length > 2) {
      // To reduce the initial lag make it work with 3 points
      // by copying the first point to the beginning.
      if (points.length === 3) points.unshift(points[0]);

      tmp = this._calculateCurveControlPoints(points[0], points[1], points[2]);
      c2 = tmp.c2;
      tmp = this._calculateCurveControlPoints(points[1], points[2], points[3]);
      c3 = tmp.c1;
      curve = new Bezier(points[1], c2, c3, points[2]);
      this._addCurve(curve);

      // Remove the first element from the list,
      // so that we always have no more than 4 points in points array.
      points.shift();
    }
  };

  SignaturePad.prototype._calculateCurveControlPoints = function (s1, s2, s3) {
    var dx1 = s1.x - s2.x, dy1 = s1.y - s2.y,
      dx2 = s2.x - s3.x, dy2 = s2.y - s3.y,

      m1 = {x : (s1.x + s2.x) / 2.0, y : (s1.y + s2.y) / 2.0},
      m2 = {x : (s2.x + s3.x) / 2.0, y : (s2.y + s3.y) / 2.0},

      l1 = Math.sqrt(dx1 * dx1 + dy1 * dy1),
      l2 = Math.sqrt(dx2 * dx2 + dy2 * dy2),

      dxm = (m1.x - m2.x),
      dym = (m1.y - m2.y),

      k = l2 / (l1 + l2),
      cm = {x : m2.x + dxm * k, y : m2.y + dym * k},

      tx = s2.x - cm.x,
      ty = s2.y - cm.y;

    return {
      c1 : new Point(m1.x + tx, m1.y + ty),
      c2 : new Point(m2.x + tx, m2.y + ty)
    };
  };

  SignaturePad.prototype._addCurve = function (curve) {
    var startPoint = curve.startPoint,
      endPoint = curve.endPoint,
      velocity, newWidth;

    velocity = endPoint.velocityFrom(startPoint);
    velocity = this.velocityFilterWeight * velocity
      + (1 - this.velocityFilterWeight) * this._lastVelocity;

    newWidth = this._strokeWidth(velocity);
    this._drawCurve(curve, this._lastWidth, newWidth);

    this._lastVelocity = velocity;
    this._lastWidth = newWidth;
  };

  SignaturePad.prototype._drawPoint = function (x, y, size) {
    var ctx = this._ctx;

    ctx.moveTo(x, y);
    ctx.drawCircle(x, y, size);
  };

  SignaturePad.prototype._drawCurve = function (curve, startWidth, endWidth) {
    var widthDelta = endWidth - startWidth,
      drawSteps, width, i, t, tt, ttt, u, uu, uuu, x, y;

    drawSteps = Math.floor(curve.length());
    for (i = 0; i < drawSteps; i++) {
      // Calculate the Bezier (x, y) coordinate for this step.
      t = i / drawSteps;
      tt = t * t;
      ttt = tt * t;
      u = 1 - t;
      uu = u * u;
      uuu = uu * u;

      x = uuu * curve.startPoint.x;
      x += 3 * uu * t * curve.control1.x;
      x += 3 * u * tt * curve.control2.x;
      x += ttt * curve.endPoint.x;

      y = uuu * curve.startPoint.y;
      y += 3 * uu * t * curve.control1.y;
      y += 3 * u * tt * curve.control2.y;
      y += ttt * curve.endPoint.y;

      width = startWidth + ttt * widthDelta;
      this._drawPoint(x, y, width);
    }
  };

  SignaturePad.prototype._strokeWidth = function (velocity) {
    return Math.max(this.maxWidth / (velocity + 1), this.minWidth);
  };


  var Point = function (x, y, time) {
    this.x = x;
    this.y = y;
    this.time = time || new Date().getTime();
  };

  Point.prototype.velocityFrom = function (start) {
    return (this.time !== start.time) ? this.distanceTo(start) / (this.time - start.time) : 1;
  };

  Point.prototype.distanceTo = function (start) {
    return Math.sqrt(Math.pow(this.x - start.x, 2) + Math.pow(this.y - start.y, 2));
  };

  var Bezier = function (startPoint, control1, control2, endPoint) {
    this.startPoint = startPoint;
    this.control1 = control1;
    this.control2 = control2;
    this.endPoint = endPoint;
  };

  // Returns approximated length.
  Bezier.prototype.length = function () {
    var steps = 10,
      length = 0,
      i, t, cx, cy, px, py, xdiff, ydiff;

    for (i = 0; i <= steps; i++) {
      t = i / steps;
      cx = this._point(t, this.startPoint.x, this.control1.x, this.control2.x, this.endPoint.x);
      cy = this._point(t, this.startPoint.y, this.control1.y, this.control2.y, this.endPoint.y);
      if (i > 0) {
        xdiff = cx - px;
        ydiff = cy - py;
        length += Math.sqrt(xdiff * xdiff + ydiff * ydiff);
      }
      px = cx;
      py = cy;
    }
    return length;
  };

  Bezier.prototype._point = function (t, start, c1, c2, end) {
    return start * (1.0 - t) * (1.0 - t) * (1.0 - t)
      + 3.0 * c1 * (1.0 - t) * (1.0 - t) * t
      + 3.0 * c2 * (1.0 - t) * t * t
      + end * t * t * t;
  };

  return SignaturePad;
})();

module.exports = SignaturePad;
