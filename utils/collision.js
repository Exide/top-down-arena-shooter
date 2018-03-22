exports.applyBounce = function (entity, edge) {
  // lifted from this SO answer:
  // https://stackoverflow.com/a/573206/157212

  let v = entity.velocity.clone();
  let n = edge.toLeftNormal().normalize();
  let u = n.multiplyScalar(v.dot(n));
  let w = v.subtract(u);
  let friction = 0.7;
  let elasticity = 0.7;

  // redirect the entity
  entity.velocity = w.multiplyScalar(friction).subtract(u.multiplyScalar(elasticity));
};
