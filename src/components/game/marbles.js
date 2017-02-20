import createMarble from '../../materials/marble';

function posOrNeg() {
  return Math.round(Math.random()) * 2 - 1;
}

export default (THREE, Physijs) => ({
  addMarbles(scene, count) {
    const marbles = [];
    for (var i = 0; i < count; i++) {
      var oneMarble = createMarble(THREE, Physijs);

      oneMarble.position.set(
        posOrNeg() * Math.random() * 0.25,
        Math.random() * 10 + 5,
        posOrNeg() * Math.random() * 0.25
      );

      marbles.push(oneMarble);
    }

    marbles.forEach((marble, index) => {
      setTimeout(
        function() {
          scene.add(marble);
        },
        25 * i
      );
    });

    return marbles;
  },
  removeMarbles(scene, marbles) {
    marbles.forEach(marble => scene.remove(marble));
  }
});
