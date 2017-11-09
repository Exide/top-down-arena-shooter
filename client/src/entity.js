import {Texture, Sprite} from 'pixi.js';
import image from '../resources/images/ship.png';
import {degreesToRadians} from '../../utils/math';
import config from '../config.json';

/**
 *  PixiJS axes (top-left origin):
 *
 *            0---- +X
 *            |
 *            |
 *           +Y
 *
 *  PixiJS rotation (radians):
 *
 *     -r <-- 0 --> +r
 *            |
 *            |
 *  3pi/2 ----+---- pi/2
 *            |
 *            |
 *            pi
 */

export class Entity {

  constructor(id, x, y, r) {
    this.id = id;

    let texture = Texture.fromImage(image);
    this.sprite = new Sprite(texture);
    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 0.5;

    this.setPosition(x, y);
    this.setRotation(r);
  }

  setPosition(x, y) {
    this.sprite.position.x = x + (config.width / 2);
    this.sprite.position.y = -y + (config.height / 2);
  }

  setRotation(degrees) {
    this.sprite.rotation = degreesToRadians(degrees);
  }

}