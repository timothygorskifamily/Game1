(function () {
  const FamilyDash = (window.FamilyDash = window.FamilyDash || {});
  FamilyDash.getCollisionBoxes = function (entity) {
    if (!entity) return [];
    const source = typeof entity.collisionBoxes === "function" ? entity.collisionBoxes(entity) : entity.collisionBoxes;
    if (Array.isArray(source) && source.length > 0) {
      return source.map((box) => ({
        x: entity.x + entity.width * box.x,
        y: entity.y + entity.height * box.y,
        width: entity.width * box.width,
        height: entity.height * box.height
      }));
    }
    if (entity.hitbox && typeof entity.hitbox.x === "number") return [entity.hitbox];
    return [entity];
  };

  FamilyDash.intersects = function (a, b) {
    const boxesA = FamilyDash.getCollisionBoxes(a);
    const boxesB = FamilyDash.getCollisionBoxes(b);
    return boxesA.some((boxA) =>
      boxesB.some((boxB) =>
        boxA.x < boxB.x + boxB.width &&
        boxA.x + boxA.width > boxB.x &&
        boxA.y < boxB.y + boxB.height &&
        boxA.y + boxA.height > boxB.y
      )
    );
  };
})();
