import createWall from '../../materials/wall';

export default (THREE, Physijs) => ({
  addWalls(scene) {
    const walls = [];
    var y = 7 / 2;

    var side1 = createWall(THREE, Physijs);
    side1.position.set(-0.70, y, 0);
    side1.rotation.set(0, 1.5, 0);

    var side2 = createWall(THREE, Physijs);
    side2.position.set(0, y, 0.70);
    side2.rotation.set(0, 3, 0);

    var side3 = createWall(THREE, Physijs);
    side3.position.set(0.70, y, 0);
    side3.rotation.set(0, -1.5, 0);

    var side4 = createWall(THREE, Physijs);
    side4.position.set(0, y, -0.70);
    side4.rotation.set(0, 0, 0);

    var side5 = createWall(THREE, Physijs);
    side5.position.set(-0.5, y, -0.5); //top left
    side5.rotation.set(0, 0.75, 0);

    var side6 = createWall(THREE, Physijs);
    side6.position.set(0.5, y, -0.5); //top right
    side6.rotation.set(0, -0.75, 0);

    var side7 = createWall(THREE, Physijs);
    side7.position.set(-0.5, y, 0.5); //bottom left
    side7.rotation.set(0, 2.5, 0);

    var side8 = createWall(THREE, Physijs);
    side8.position.set(0.5, y, 0.5); //bottom right
    side8.rotation.set(0, -2.5, 0);

    walls.push(side1);
    walls.push(side2);
    walls.push(side3);
    walls.push(side4);
    walls.push(side5);
    walls.push(side6);
    walls.push(side7);
    walls.push(side8);

    walls.forEach(wall => {
      scene.add(wall);
    });

    return walls;
  },
  removeWalls(scene, walls) {
    walls.forEach(wall => scene.remove(wall));
  }
});
