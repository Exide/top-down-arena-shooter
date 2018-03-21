const {Point} = require('./point');

exports.Edge = class Edge {

  /**
   * @param {Point} a origin point
   * @param {Point} b destination point
   */
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  toVector() {
    return this.b.clone().subtract(this.a);
  }

  toLeftNormal() {
    return this.toVector().toLeftNormal();
  }

};
