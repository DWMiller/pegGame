import { Link } from 'react-router';
import './launcher.css';

export default React => {
  const Launcher = props => (
    <div className="launcher">
      <h1>Game Launcher</h1>
      <div className="launcher-game-modes">
        <Link className="btn" to="/game">Demonstration Mode</Link>

        <a className="btn disabled" disabled>Local Play</a>
        <a className="btn disabled" disabled>Online Multiplayer</a>
      </div>
    </div>
  );

  Launcher.propTypes = {};

  return Launcher;
};
