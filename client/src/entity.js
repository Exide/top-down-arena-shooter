import {Texture, Sprite, Point, extras} from 'pixi.js';
import shipPNG from '../resources/images/ship.png';
import wallPNG from '../resources/images/wall.png';
import smallAsteroidPNG from '../resources/images/small-asteroid.png';
import largeAsteroidPNG from '../resources/images/large-asteroid.png';
import {degreesToRadians, radiansToDegrees} from '../../utils/math';
import {topLeftToCentered, centeredToTopLeft} from '../../utils/coordinate';
import MapService from './MapService';
const {TilingSprite} = extras;

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

  constructor(id, type, x, y, r, w, h) {
    this.id = id;
    this.type = type;

    if (type === 'Ship') {
      this.sprite = new Sprite(Texture.fromImage(shipPNG));
    } else if (type === 'Wall') {
      this.sprite = new TilingSprite(Texture.fromImage(wallPNG));
    } else if (type === 'Asteroid') {
      let asteroidPNG = (w == 16) ? smallAsteroidPNG : largeAsteroidPNG;
      this.sprite = new Sprite(Texture.fromImage(asteroidPNG));
    } else {
      throw new Error('unknown entity type: ' + type);
    }

    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 0.5;

    this.setPosition(x, y);
    this.setRotation(r);
    this.setSize(w, h);

    console.debug('entity created:', id, type, x, y, r, w, h);
  }

  setPosition(x, y) {
    let mapService = MapService.get();
    let w = mapService.getWidth();
    let h = mapService.getHeight();
    let position = centeredToTopLeft(x, y, w, h);
    this.sprite.position.x = position.x;
    this.sprite.position.y = position.y;
  }

  getPosition() {
    let x = this.sprite.position.x;
    let y = this.sprite.position.y;
    let mapService = MapService.get();
    let w = mapService.getWidth();
    let h = mapService.getHeight();
    return topLeftToCentered(x, y, w, h);
  }

  setRotation(degrees) {
    this.sprite.rotation = degreesToRadians(degrees);
  }

  getRotation() {
    return radiansToDegrees(this.sprite.rotation);
  }

  setSize(w, h) {
    this.sprite.width = w;
    this.sprite.height = h;
  }
  
  getSize() {
    return {
      w: this.sprite.width,
      h: this.sprite.height
    }
  }

}
