const random = require('./random');

let asteroids = [];
for (let i = 0; i < 500; ++i) {
  let x = random.getNumberBetween(-5016, 4998);
  let y = random.getNumberBetween(-5016, 4998);
  let r = random.getNumberBetween(0, 360);
  let size = random.flipCoin() ? 16 : 34;
  asteroids.push({x:x, y:y, r:r, size:size});
}
console.log(JSON.stringify(asteroids, null, 2));
