function drawSmooth(points, graphics, tension) {
  var cps, i, p0, p1, p2;
  var pointsLength = points.length;

  graphics.moveTo(points[0][0], points[0][1]);
  if (pointsLength === 2) {
    graphics.lineTo(points[1][0], points[1][1]);
  } else if (pointsLength === 3) {
    p0 = points[0];
    p1 = points[1];
    p2 = points[2];
    cps = getControlPoints(p0[0], p0[1], p1[0], p1[1], p2[0], p2[1], tension);
    graphics.moveTo(p0[0], p0[1]);
    graphics.bezierCurveTo(cps[0], cps[1], cps[2], cps[3], p2[0], p2[1]);
  } else {
    for (i = 1; i < pointsLength - 1; i++) {
      p0 = points[i - 1];
      p1 = points[i];
      p2 = points[i + 1];
      cps = getControlPoints(p0[0], p0[1], p1[0], p1[1], p2[0], p2[1], tension);
      graphics.moveTo(p0[0], p0[1]);
      graphics.bezierCurveTo(cps[0], cps[1], cps[2], cps[3], p2[0], p2[1]);
    }
  }
}

function getControlPoints(x0, y0, x1, y1, x2, y2, tension) {
  var d01 = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
  var d12 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  var fa = tension * d01 / (d01 + d12);   // scaling factor for triangle Ta
  var fb = tension * d12 / (d01 + d12);   // ditto for Tb, simplifies to fb=t-fa
  var p1x = x1 - fa * (x2 - x0);    // x2-x0 is the width of triangle T
  var p1y = y1 - fa * (y2 - y0);    // y2-y0 is the height of T
  var p2x = x1 + fb * (x2 - x0);
  var p2y = y1 + fb * (y2 - y0);

  return [p1x, p1y, p2x, p2y];
}

module.exports = {
  drawSmooth : drawSmooth
};
