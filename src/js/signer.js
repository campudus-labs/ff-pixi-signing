var PIXI = require('pixi.js');
var smoothLine = require('./spline-interpolation').drawSmooth;

function Signer(options) {
  var self = this;
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

  self.active = true;
  self.renderer = PIXI.autoDetectRenderer(maxWidth, maxHeight, {view : canvas});
  self.renderer.backgroundColor = 0xFFFFFF;

  // create the root of the scene graph
  self.stage = new PIXI.Container();

  self.graphics = new PIXI.Graphics();
  self.smoothed = new PIXI.Graphics();

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

  self.onMouseDown = function (eventData) {
    eventData.stopPropagation();

    self.stage
      .on('mouseup', self.onMouseUp)
      .on('mouseupoutside', self.onMouseUp)
      .on('mousemove', self.onMouseMove);

    drawStart(eventData.data.global.x, eventData.data.global.y);
  };

  self.onDown = function (eventData) {
    eventData.stopPropagation();

    finger = eventData.data.originalEvent.changedTouches[0].identifier;
    self.stage
      .on('touchend', self.onUp)
      .on('touchendoutside', self.onUp)
      .on('touchmove', self.onMove);

    drawStart(eventData.data.global.x, eventData.data.global.y);
  };

  self.onMouseUp = function (eventData) {
    self.stage
      .off('mouseup', self.onMouseUp)
      .off('mouseupoutside', self.onMouseUp)
      .off('mousemove', self.onMouseMove);

    drawTo(eventData.data.global.x, eventData.data.global.y);
    drawEnd();
  };

  self.onUp = function (eventData) {
    if (eventData.data.originalEvent.changedTouches[0].identifier === finger) {
      self.stage
        .off('touchend', self.onUp)
        .off('touchendoutside', self.onUp)
        .off('touchmove', self.onMove);

      drawTo(eventData.data.global.x, eventData.data.global.y);
      drawEnd();
    }
  };

  self.onMouseMove = function (eventData) {
    console.log('blubb?');
    drawTo(eventData.data.global.x, eventData.data.global.y);
  };

  self.onMove = function (eventData) {
    if (eventData.data.originalEvent.changedTouches[0].identifier === finger) {
      drawTo(eventData.data.global.x, eventData.data.global.y);
    }
  };

  self.stage.interactive = true;
  self.stage.hitArea = new PIXI.Rectangle(0, 0, maxWidth, maxHeight);
  self.stage
    .on('mousedown', self.onMouseDown)
    .on('touchstart', self.onDown);

  reset();

  // run the render loop
  animate();

  function drawStart(x, y) {
    status.isDrawing = true;
    points.push([x, y, new Date().getTime()]);

    self.graphics.moveTo(x, y);
    self.graphics.lineTo(x, y);

    currentX = x;
    currentY = y;

    self.stage.addChild(self.graphics);
  }

  function drawTo(x, y) {
    points.push([x, y, new Date().getTime()]);

    self.graphics.moveTo(currentX, currentY);
    self.graphics.lineTo(x, y);

    currentX = x;
    currentY = y;
  }

  function drawEnd() {
    status.isDrawing = false;
    var graphicsToClear = self.graphics;

    smoothLine(status, points, self.smoothed, function () {
      graphicsToClear.clear();
      graphicsToClear = null;
    });

    self.graphics = new PIXI.Graphics();
    self.graphics.lineStyle(4, tempColor, 1);

    self.stage.addChild(self.graphics);
    self.stage.addChild(self.smoothed);

    points = [];
  }

  function reset() {
    self.graphics.clear();
    self.smoothed.clear();

    self.graphics.lineStyle(4, tempColor, 1);
    self.smoothed.lineStyle(4, smoothColor, 1);

    self.stage.addChild(self.graphics);
    self.stage.addChild(self.smoothed);
  }

  function animate() {
    if (self.active) {
      self.renderer.render(self.stage);

      requestAnimationFrame(animate);
    }
  }

}

Signer.prototype.destroy = function () {
  console.log('destroying');
  this.active = false;
  this.renderer.destroy();
  console.log('destroyed all');
};

module.exports = Signer;
