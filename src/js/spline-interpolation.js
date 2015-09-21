var SignaturePad = require('./signaturepad');

function drawSmooth(status, points, graphics, end) {
  var pad = new SignaturePad(graphics);
  var i = 0;

  if (points.length === 1) {
    graphics.drawCircle(points[0][0], points[0][1], 2.5);
    end();
  } else if (points.length === 2) {
    graphics.drawCircle(points[0][0], points[0][1], 2.5);
    graphics.drawCircle(points[0][0], points[0][1], 2.5);
    end();
  } else if (points.length >= 3) {
    nextPoint();
  }

  function nextPoint() {
    if (status.isDrawing) {
      requestAnimationFrame(nextPoint);
    } else {
      pad.addPoint(points[i]);
      if (i < points.length - 1) {
        i++;
        requestAnimationFrame(nextPoint);
      } else {
        end();
      }
    }
  }
}

module.exports = {
  drawSmooth : drawSmooth
};
