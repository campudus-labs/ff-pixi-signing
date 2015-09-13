var pixi = require('pixi.js');

var canvas = document.getElementById('signer');
var width = canvas.width;
var height = canvas.height;

var renderer = new pixi.autoDetectRenderer(width, height, {view : canvas});

// create the root of the scene graph
var stage = new PIXI.Container();
stage.interactive = true;

var graphics = new PIXI.Graphics();

var x, y;

reset();

// run the render loop
animate();

function drawStart(x, y) {
  // TODO graphics.moveTo
  graphics.moveTo(x, y);
}

function drawTo(x, y) {
  // TODO graphics.lineTo
  graphics.lineTo(x, y);
}

function reset() {
  // TODO reset canvas / pixi
  graphics.beginFill(0xFF3300);
  graphics.lineStyle(4, 0xffd900, 1);

  x = 100;
  y = 100;
  drawStart(x, y);
}

function animate() {
  x = (x + 1) % 100;
  y = (y + 1) % 100;

  drawTo(x, y);

  stage.addChild(graphics);
  renderer.render(stage);

  requestAnimationFrame(animate);
}