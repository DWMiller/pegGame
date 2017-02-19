import createStick from './stick.factory';
import createBoard from './board.factory';
import createMarble from './marble.factory';
import createWall from './wall.factory';

export default function objectGenerator(THREE, Physijs) {
  var factoryMap = {
    stick: createStick(THREE, Physijs),
    board: createBoard(THREE, Physijs),
    marble: createMarble(THREE, Physijs),
    wall: createWall(THREE, Physijs)
  };

  return {
    create(type) {
      return factoryMap[type].create();
    }
  };
}
