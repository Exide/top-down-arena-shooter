import config from '../config.json';
import {autoDetectRenderer, Container} from 'pixi.js'
import Ship from './ship';
import {Key} from './input';
import {RelativeDirection} from './math';

let name = 'top-down-arena-shooter';
let version = '0.0.1';
document.title = `${name} v${version}`;

const socket = new WebSocket(`ws://${config.server}`);

socket.addEventListener('open', (event) => {
  console.log('websocket opened:', config.server);
});

socket.addEventListener('message', (event) => {
  console.log('websocket message received:', event.data);
});

socket.addEventListener('close', (event) => {
  console.log('websocket closed:', config.server);
});

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

  if (event.keyCode === Key.Space) {
    let message = ':p';
    socket.send(message);
    console.log('websocket message sent:', message);
  }
});

loop();
function loop() {
  requestAnimationFrame(loop);
  ship.update();
  renderer.render(stage);
}
