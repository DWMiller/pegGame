import { Link } from 'react-router-dom'
import './Launcher.css'

export default function Launcher() {
  return (
    <div className="launcher">
      <h1>Peg Game</h1>
      <p className="description">
        Remove sticks to let marbles fall. Score points for each marble that drops!
      </p>
      <div className="launcher-game-modes">
        <Link className="btn" to="/game">
          Play Game
        </Link>
      </div>
    </div>
  )
}
