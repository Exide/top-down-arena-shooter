import config from '../config.json';
import image from '../resources/images/ship.png';
import {RelativeDirection} from './math';
import {Texture, Sprite} from 'pixi.js';

export default class Ship {

  constructor() {
    let texture = Texture.fromImage(image);

    this.sprite = new Sprite(texture);
    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 0.5;

    this.sprite.position.x = config.width / 2;
    this.sprite.position.y = config.height / 2;

    this.rotationSpeed = 0.1;
    this.isRotatingLeft = false;
    this.isRotatingRight = false;
  }

  update() {
    if (this.isRotatingLeft) {
      this.sprite.rotation -= this.rotationSpeed;
    }

    if (this.isRotatingRight) {
      this.sprite.rotation += this.rotationSpeed;
    }
  }

  enableRotation(direction) {
    if (direction !== RelativeDirection.Left && direction !== RelativeDirection.Right)
      throw new Error('the "direction" parameter must be "left" or "right"');

    if (direction === RelativeDirection.Left && this.isRotatingLeft === false) {
      this.isRotatingLeft = true;
    }

    if (direction === RelativeDirection.Right && this.isRotatingRight === false) {
      this.isRotatingRight = true;
    }
  }

  disableRotation(direction) {
    if (direction !== RelativeDirection.Left && direction !== RelativeDirection.Right)
      throw new Error('the "direction" parameter must be "left" or "right"');

    if (direction === RelativeDirection.Left && this.isRotatingLeft === true) {
      this.isRotatingLeft = false;
    }

    if (direction === RelativeDirection.Right && this.isRotatingRight === true) {
      this.isRotatingRight = false;
    }
  }

}
