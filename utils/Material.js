const Component = require('./Component');

class Material extends Component {

  static builder() {
    return new MaterialBuilder();
  }

  constructor(friction, elasticity) {
    super('Material');
    this.friction = friction;
    this.elasticity = elasticity;
  }

}

module.exports = Material;

class MaterialBuilder {

  constructor() {
    this.friction = 1;
    this.elasticity = 1;
  }

  withFriction(friction) {
    this.friction = friction;
    return this;
  }

  withElasticity(elasticity) {
    this.elasticity = elasticity;
    return this;
  }

  build() {
    return new Material(this.friction, this.elasticity);
  }

}
