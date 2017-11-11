let instance;

export default class MapService {

  static get() {
    if (!instance) {
      instance = new MapService();
    }
    return instance;
  }

  constructor() {
    this.setDimensions(0, 0);
  }

  setDimensions(width, height) {
    this.width = width;
    this.height = height;
  }
  
  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

}
