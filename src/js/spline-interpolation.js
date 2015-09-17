var SignaturePad = require('./signaturepad');

function drawSmooth(points, graphics, end) {
  var pad = new SignaturePad(graphics);
  var i = 0;

  if (points.length === 1) {
    graphics.drawCircle(points[0][0], points[0][1], 2.5);
    end();
  } else if (points.length === 2) {
    graphics.drawCircle(points[0][0], points[0][1], 2.5);
    graphics.drawCircle(points[0][0], points[0][1], 2.5);
    end();
  } else {
    nextPoint();
  }

  function nextPoint() {
    pad.addPoint(points[i]);
    if (i < points.length) {
      i++;
      requestAnimationFrame(nextPoint);
    } else {
      end();
    }
  }
}

module.exports = {
  drawSmooth : drawSmooth
};
