import {Texture, Sprite, Point} from 'pixi.js';
import image from '../resources/images/ship.png';
import {degreesToRadians, radiansToDegrees} from '../../utils/math';
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

  getPosition() {
    let x = this.sprite.position.x - (config.width / 2);
    let y = -this.sprite.position.y - (config.height / 2);
    return new Point(x, y);
  }

  setRotation(degrees) {
    this.sprite.rotation = degreesToRadians(degrees);
  }

  getRotation() {
    return radiansToDegrees(this.sprite.rotation);
  }

}