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
    this.setRotation(rotation);
  }

  setPosition(position) {
    this.sprite.position.x = position[0];
    this.sprite.position.y = position[1];
  }

  setRotation(rotation) {
    this.sprite.rotation = rotation;
  }

}