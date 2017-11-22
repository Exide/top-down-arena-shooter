class Node {

  //  +---+---+
  //  | 0 | 1 |
  //  +---+---+
  //  | 2 | 3 |
  //  +---+---+

  constructor(x, y, w, h) {
    this.minimumSize = {w: 128, h: 128};
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.quads = [
      [], // 0: top left
      [], // 1: top right
      [], // 2: bottom left
      []  // 3: bottom right
    ];
  }

  insert(entity) {
    if (entity.position.x <= this.x && entity.position.y >= this.y) {
      this.populateQuad(0, entity, this.x - this.w / 4, this.y + this.h / 4);
    }

    if (entity.position.x >= this.x && entity.position.y >= this.y) {
      this.populateQuad(1, entity, this.x + this.w / 4, this.y + this.h / 4);
    }

    if (entity.position.x <= this.x && entity.position.y <= this.y) {
      this.populateQuad(2, entity, this.x - this.w / 4, this.y - this.h / 4);
    }

    if (entity.position.x >= this.x && entity.position.y <= this.y) {
      this.populateQuad(3, entity, this.x + this.w / 4, this.y - this.h / 4);
    }
  }

  populateQuad(quad, entity, x, y) {
    if (this.isQuadArray(quad)) {
      this.quads[quad].push(entity);

      if (this.shouldSubdivide(quad)) {
        let node = new Node(x, y, this.w / 4, this.h / 4);
        this.quads[quad].forEach(q => node.insert(q));
        this.quads[quad] = node;
      }

    } else {
      this.quads[quad].insert(entity);
    }
  }

  isQuadArray(quad) {
    return Array.isArray(this.quads[quad]);
  }

  shouldSubdivide(quad) {
    let canSubdivide = this.w / 2 > this.minimumSize.w && this.h / 2 > this.minimumSize.h;
    let hasTooManyEntities = this.quads[quad].length > 3;
    return canSubdivide && hasTooManyEntities;
  }

  get() {
    let data = [];
    data.push(...this.getFromQuad(0));
    data.push(...this.getFromQuad(1));
    data.push(...this.getFromQuad(2));
    data.push(...this.getFromQuad(3));
    return data;
  }
  
  getFromQuad(quad) {
    let data = [];
    if (this.isQuadArray(quad)) {
      data.push(this.quads[quad]);
    } else {
      data = data.concat(this.quads[quad].get());
    }
    return data;
  }

  dump() {
    return {
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h,
      quads: {
        0: this.isQuadArray(0) ? this.quads[0].map(e => e.id) : this.quads[0].dump(),
        1: this.isQuadArray(1) ? this.quads[1].map(e => e.id) : this.quads[1].dump(),
        2: this.isQuadArray(2) ? this.quads[2].map(e => e.id) : this.quads[2].dump(),
        3: this.isQuadArray(3) ? this.quads[3].map(e => e.id) : this.quads[3].dump()
      }
    };
  }

}

exports.Node = Node;
