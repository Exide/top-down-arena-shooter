const moment = require('moment');
const Component = require('./Component');

class Expiration extends Component {

  static builder() {
    return new ExpirationBuilder();
  }

  constructor(ttlSeconds) {
    super('Expiration');
    this.ttlSeconds = ttlSeconds;
    this.spawnTime = moment.utc();
  }

  update(deltaTimeSeconds) {
    let elapsedTimeMS = moment.utc().diff(this.spawnTime);
    let elapsedTimeSeconds = moment.duration(elapsedTimeMS).asSeconds();
    if (elapsedTimeSeconds > this.ttlSeconds) {
      this.parent.destroy();
    }
  }

}

module.exports = Expiration;

class ExpirationBuilder {

  constructor() {
    this.ttlSeconds = 1;
  }

  withTTLSeconds(ttlSeconds) {
    this.ttlSeconds = ttlSeconds;
    return this;
  }

  build() {
    return new Expiration(this.ttlSeconds);
  }

}
