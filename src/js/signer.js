var PIXI = require('pixi.js');
var smoothLine = require('./spline-interpolation').drawSmooth;

function Signer(options) {
  var opts = options || {};

  var tempColor = opts.draftColor || opts.color || 0xffd900;
  var smoothColor = opts.color || 0x00d9ff;
  var signerId = opts.signerId || 'signature';
  var resetSelector = opts.resetSelector || '#' + signerId + ' .reset';
  var canvasSelector = opts.canvasSelector || '#' + signerId + ' canvas';

  var resolution = (function () {
    var w = window,
      d = document,
      e = d.documentElement,
      g = d.getElementsByTagName('body')[0],
      x = w.innerWidth || e.clientWidth || g.clientWidth,
      y = w.innerHeight || e.clientHeight || g.clientHeight;

    return [x, y];
  }());

  var maxWidth = resolution[0];
  var maxHeight = resolution[1];

  var canvas = document.querySelector(canvasSelector);
  canvas.width = maxWidth;
  canvas.height = maxHeight;

  var renderer = PIXI.autoDetectRenderer(maxWidth, maxHeight, {view : canvas});

// create the root of the scene graph
  var stage = new PIXI.Container();

  var graphics = new PIXI.Graphics();
  var smoothed = new PIXI.Graphics();

  var status = {isDrawing : false};
  var points = [];
  var finger;

  var currentX = 0;
  var currentY = 0;

  var deleteBtn = document.querySelector(resetSelector);
  deleteBtn.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();

    reset();
  });

  stage.interactive = true;
  stage.hitArea = new PIXI.Rectangle(0, 0, maxWidth, maxHeight);
  stage
    .on('mousedown', onDown)
    .on('touchstart', onDown);

  reset();

// run the render loop
  animate();

  function drawStart(x, y) {
    status.isDrawing = true;
    points.push([x, y, new Date().getTime()]);

    graphics.moveTo(x, y);
    graphics.lineTo(x, y);

    currentX = x;
    currentY = y;

    stage.addChild(graphics);
  }

  function drawTo(x, y) {
    points.push([x, y, new Date().getTime()]);

    graphics.moveTo(currentX, currentY);
    graphics.lineTo(x, y);

    currentX = x;
    currentY = y;
  }

  function drawEnd() {
    status.isDrawing = false;
    var graphicsToClear = graphics;

    smoothLine(status, points, smoothed, function () {
      graphicsToClear.clear();
      graphicsToClear = null;
    });

    graphics = new PIXI.Graphics();
    graphics.lineStyle(4, tempColor, 1);

    stage.addChild(graphics);
    stage.addChild(smoothed);

    points = [];
  }

  function reset() {
    graphics.clear();
    smoothed.clear();

    graphics.lineStyle(4, tempColor, 1);
    smoothed.lineStyle(4, smoothColor, 1);

    stage.addChild(graphics);
    stage.addChild(smoothed);
  }

  function animate() {
    renderer.render(stage);

    requestAnimationFrame(animate);
  }

  function onDown(eventData) {
    eventData.stopPropagation();

    finger = eventData.data.originalEvent.changedTouches[0].identifier;
    stage
      .on('mouseup', onUp)
      .on('mouseupoutside', onUp)
      .on('mousemove', onMove)
      .on('touchend', onUp)
      .on('touchendoutside', onUp)
      .on('touchmove', onMove);

    drawStart(eventData.data.global.x, eventData.data.global.y);
  }

  function onUp(eventData) {
    if (eventData.data.originalEvent.changedTouches[0].identifier === finger) {
      stage
        .off('mouseup', onUp)
        .off('mouseupoutside', onUp)
        .off('mousemove', onMove)
        .off('touchend', onUp)
        .off('touchendoutside', onUp)
        .off('touchmove', onMove);

      drawTo(eventData.data.global.x, eventData.data.global.y);
      drawEnd();
    }
  }

  function onMove(eventData) {
    if (eventData.data.originalEvent.changedTouches[0].identifier === finger) {
      drawTo(eventData.data.global.x, eventData.data.global.y);
    }
  }

}

module.exports = Signer;
