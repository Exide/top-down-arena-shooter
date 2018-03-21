const Victor = require('victor');

exports.Vector = class Vector extends Victor {

  constructor(x, y) {
    super(x, y);
  }

  clone() {
    return new Vector(this.x, this.y);
  }

  toLeftNormal() {
    return new Vector(-this.y, this.x);
  }

  denormalize(magnitude) {
    return this.clone().multiplyScalar(magnitude);
  }

};
