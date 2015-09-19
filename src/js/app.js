var PIXI = require('pixi.js');
var smoothLine = require('./spline-interpolation').drawSmooth;

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

var canvas = document.getElementById('signer');
canvas.width = maxWidth;
canvas.height = maxHeight;

var renderer = PIXI.autoDetectRenderer(maxWidth, maxHeight, {view : canvas});

// create the root of the scene graph
var stage = new PIXI.Container();

var graphics = new PIXI.Graphics();
var smoothed = new PIXI.Graphics();

var points = [];

var currentX = 0;
var currentY = 0;

var deleteBtn = document.querySelector('#signature .reset');
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
  console.log('draw end, smoothing line');
  var graphicsToClear = graphics;

  smoothLine(points, smoothed, function() {
    console.log('done!');
    graphicsToClear.clear();
    graphicsToClear = null;
  });

  graphics = new PIXI.Graphics();
  graphics.lineStyle(4, 0xffd900, 1);

  stage.addChild(graphics);
  stage.addChild(smoothed);

  points = [];
}

function reset() {
  console.log('reset');
  graphics.clear();
  smoothed.clear();

  graphics.lineStyle(4, 0xffd900, 1);
  smoothed.lineStyle(4, 0x00d9ff, 1);

  stage.addChild(graphics);
  stage.addChild(smoothed);
}

function animate() {
  stage.addChild(graphics);
  renderer.render(stage);

  requestAnimationFrame(animate);
}

function onDown(eventData) {
  stage
    .on('mouseup', onUp)
    .on('touchend', onUp)
    .on('mouseupoutside', onUp)
    .on('touchendoutside', onUp)
    .on('mousemove', onMove)
    .on('touchmove', onMove);

  drawStart(eventData.data.global.x, eventData.data.global.y);
}

function onUp(eventData) {
  stage
    .off('mouseup', onUp)
    .off('touchend', onUp)
    .off('mouseupoutside', onUp)
    .off('touchendoutside', onUp)
    .off('mousemove', onMove)
    .off('touchmove', onMove);

  drawTo(eventData.data.global.x, eventData.data.global.y);
  drawEnd();
}

function onMove(eventData) {
  drawTo(eventData.data.global.x, eventData.data.global.y);
}
