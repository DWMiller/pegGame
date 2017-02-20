import createStick from '../../materials/stick';

function posOrNeg() {
  return Math.round(Math.random()) * 2 - 1;
}

function spinStick(stick, side) {
  stick.rotation.set(
    posOrNeg() * Math.random() * 0.1,
    0.75 * side, //8 / 3.5, //Math.random() * 3,
    0 //UtilitiesService.posOrNeg() * (Math.random() * 0.4 + 1.1) // up to 1.5 in either direction
  );
  return stick;
}

function shiftStick(stick, side) {
  var horizontalVariation = 0.275, heightVariation = 0.3;

  var shiftX = posOrNeg() * Math.random() * horizontalVariation;
  var shiftZ = posOrNeg() * Math.random() * horizontalVariation;

  // var shiftsX = [3];
  // var shiftsZ = [1];
  // var shiftsBoth = [0, 2];

  if (side === 0 || side === 2) {
  } else if (side === 3) {
    shiftZ = 0;
  } else if (side === 1) {
    shiftX = 0;
  }

  var x = shiftX, y = Math.random() * heightVariation + 3.5, z = shiftZ;

  stick.position.set(x, y, z);
}

export default (THREE, Physijs) => ({
  addSticks(scene, count) {
    const sticks = [];
    for (var i = 0; i < count; i++) {
      var oneStick = createStick(THREE, Physijs);

      // alternate walls and spin the stick to match
      var side = i % 4;
      spinStick(oneStick, side);
      shiftStick(oneStick, side);

      sticks.push(oneStick);
      // scene.add(oneStick);
    }

    sticks.forEach(stick => scene.add(stick));

    return sticks;
  },
  removeSticks(scene, sticks) {
    sticks.forEach(stick => scene.remove(stick));
  }
});
