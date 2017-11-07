import {Texture, Sprite} from 'pixi.js';
import image from '../resources/images/ship.png';

export class Entity {

  constructor(id, position, rotation) {
    this.id = id;

    let texture = Texture.fromImage(image);
    this.sprite = new Sprite(texture);
    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 0.5;

    this.setPosition(position);
    this.setRotationDegrees(rotation);
  }

  setPosition(position) {
    this.sprite.position.x = position[0];
    this.sprite.position.y = position[1];
  }

  setRotationRadians(radians) {
    this.sprite.rotation = radians;
  }

  setRotationDegrees(degrees) {
    let radians = degrees * Math.PI / 180;
    this.setRotationRadians(radians);
  }

}