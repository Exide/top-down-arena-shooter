import config from '../config.json';
import {autoDetectRenderer, Container} from 'pixi.js'
import Ship from './ship';
import {Key} from './input';
import {RelativeDirection} from './math';

let name = 'top-down-arena-shooter';
let version = '0.0.1';
document.title = `${name} v${version}`;

let renderer = autoDetectRenderer(config.width, config.height);
document.body.appendChild(renderer.view);

let stage = new Container();
let ship = new Ship();
stage.addChild(ship.sprite);

window.addEventListener('keydown', (event) => {
  if (event.keyCode === Key.A || event.keyCode === Key.Left) {
    ship.enableRotation(RelativeDirection.Left);
  }

  if (event.keyCode === Key.D || event.keyCode === Key.Right) {
    ship.enableRotation(RelativeDirection.Right);
  }
});

window.addEventListener('keyup', (event) => {
  if (event.keyCode === Key.A || event.keyCode === Key.Left) {
    ship.disableRotation(RelativeDirection.Left);
  }

  if (event.keyCode === Key.D || event.keyCode === Key.Right) {
    ship.disableRotation(RelativeDirection.Right);
  }
});

loop();
function loop() {
  requestAnimationFrame(loop);
  ship.update();
  renderer.render(stage);
}
