import {autoDetectRenderer, Container, Texture, Sprite} from 'pixi.js'
import shipImage from '../resources/images/ship.png';

let name = 'top-down-arena-shooter';
let version = '0.0.1';
document.title = `${name} v${version}`;

const WIDTH = 1000;
const HEIGHT = 1000;

let renderer = autoDetectRenderer(WIDTH, HEIGHT);
document.body.appendChild(renderer.view);

let stage = new Container();

let shipTexture = Texture.fromImage(shipImage);
let ship = new Sprite(shipTexture);

ship.anchor.x = 0.5;
ship.anchor.y = 0.5;

ship.position.x = WIDTH / 2;
ship.position.y = HEIGHT / 2;

stage.addChild(ship);

let shipIsRotatingLeft = false;
let shipIsRotatingRight = false;
let shipRotationSpeed = 0.1;

const startRotatingShipLeft = () => {
  shipIsRotatingLeft = true;
};

const startRotatingShipRight = () => {
  shipIsRotatingRight = true;
};

const stopRotatingShipLeft = () => {
  shipIsRotatingLeft = false;
};

const stopRotatingShipRight = () => {
  shipIsRotatingRight = false;
};

const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const KEY_A = 65;
const KEY_D = 68;

window.addEventListener('keydown', (event) => {
  switch (event.keyCode) {
    case KEY_A:
    case KEY_LEFT:
      startRotatingShipLeft();
      break;
    case KEY_D:
    case KEY_RIGHT:
      startRotatingShipRight();
      break;
    default:
      break;
  }
});

window.addEventListener('keyup', (event) => {
  switch (event.keyCode) {
    case KEY_A:
    case KEY_LEFT:
      stopRotatingShipLeft();
      break;
    case KEY_D:
    case KEY_RIGHT:
      stopRotatingShipRight();
      break;
    default:
      break;
  }
});

loop();
function loop() {
  requestAnimationFrame(loop);

  if (shipIsRotatingLeft) {
    ship.rotation -= shipRotationSpeed;
  }

  if (shipIsRotatingRight) {
    ship.rotation += shipRotationSpeed;
  }

  renderer.render(stage);
}
