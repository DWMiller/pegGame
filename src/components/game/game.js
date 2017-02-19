// import './game.css';

import createService from './game.service.js';
const gameService = createService();

function play() {
  gameService.start();
  gameService.endRound();
  gameService.newRound();
}

export default React => {
  const Game = props => (
    <div id="viewport">
      <div id="score">
        <button onClick={() => play()}>Start Over</button>
      </div>
    </div>
  );

  Game.propTypes = {};

  return Game;
};
