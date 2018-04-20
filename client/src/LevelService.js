let instance;

export default class LevelService {

  static get() {
    if (!instance) {
      instance = new LevelService();
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

  getSize() {
    return {
      w: this.width,
      h: this.height
    }
  }

}
