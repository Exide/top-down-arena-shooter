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

window.addEventListener('keydown', (event) => {
  switch (event.keyCode) {
    case 65:
    case 37:
      startRotatingShipLeft();
      break;
    case 68:
    case 39:
      startRotatingShipRight();
      break;
    default:
      break;
  }
});

window.addEventListener('keyup', (event) => {
  switch (event.keyCode) {
    case 65:
    case 37:
      stopRotatingShipLeft();
      break;
    case 68:
    case 39:
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
