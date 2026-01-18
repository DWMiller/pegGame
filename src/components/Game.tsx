import { useEffect, useState, Suspense, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { useGameStore } from '../stores/gameStore'
import ErrorBoundary from './ErrorBoundary'
import SettingsPanel from './SettingsPanel'
import Scene from '../game/Scene'
import './Game.css'

const SETUP_DURATION = 1500  // ms - marbles spawn while last pegs slide in

function LoadingScreen() {
  return (
    <div className="loading">
      <div className="loading-spinner" />
      <p>Loading game...</p>
    </div>
  )
}

function ErrorFallback() {
  return (
    <div className="error-fallback">
      <h2>3D rendering error</h2>
      <p>Unable to load the game. Your browser may not support WebGL.</p>
      <Link className="btn" to="/">Back to Menu</Link>
    </div>
  )
}

const GRAVITY = -10

export default function Game() {
  const {
    gameId,
    phase,
    isRunning,
    isPaused,
    gameOver,
    marbles,
    sticks,
    currentPlayer,
    playerScores,
    startGame,
    resetGame,
    pauseGame,
    resumeGame,
    setPhase
  } = useGameStore()

  const activeMarblesCount = marbles.filter(m => !m.fallen).length

  const [showSettings, setShowSettings] = useState(false)
  const setupTimerRef = useRef<number | null>(null)

  useEffect(() => {
    startGame()
  }, [startGame])

  // Handle setup -> playing transition
  // gameId in deps ensures timer restarts on each reset even if phase unchanged
  useEffect(() => {
    if (phase === 'setup') {
      // Clear any existing timer
      if (setupTimerRef.current) {
        clearTimeout(setupTimerRef.current)
      }
      // Transition to playing after setup animation completes
      setupTimerRef.current = window.setTimeout(() => {
        setPhase('playing')
      }, SETUP_DURATION)
    }

    return () => {
      if (setupTimerRef.current) {
        clearTimeout(setupTimerRef.current)
      }
    }
  }, [gameId, phase, setPhase])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        pauseGame()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [pauseGame])

  const handlePauseResume = () => {
    if (isPaused) {
      resumeGame()
    } else {
      pauseGame()
    }
  }

  return (
    <div className="game-container">
      <div className="game-ui">
        <div className="score-panel">
          <div className="player-scores">
            <div className={`player-score ${currentPlayer === 1 ? 'active' : ''}`}>
              PLAYER 1: {playerScores[0]}
            </div>
            <div className={`player-score ${currentPlayer === 2 ? 'active' : ''}`}>
              PLAYER 2: {playerScores[1]}
            </div>
          </div>
          <div className="current-turn">
            {phase === 'playing' && `Player ${currentPlayer}: remove a peg to start your turn`}
          </div>
          <div className="stats">
            Marbles: {activeMarblesCount} | Sticks: {sticks.filter(s => !s.dropped).length}
          </div>
          <button className="btn" onClick={handlePauseResume}>
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button className="btn" onClick={resetGame}>
            Start Over
          </button>
          <button className="btn" onClick={() => setShowSettings(true)}>
            Settings
          </button>
          <Link className="btn" to="/">
            Back to Menu
          </Link>
        </div>
      </div>

      {isPaused && !gameOver && !showSettings && phase !== 'setup' && (
        <div className="pause-overlay">
          <div className="pause-panel">
            <h2>Paused</h2>
            <button className="btn" onClick={resumeGame}>
              Resume
            </button>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-panel">
            <h2>Game Over!</h2>
            <div className="final-scores">
              <p>PLAYER 1: {playerScores[0]} points</p>
              <p>PLAYER 2: {playerScores[1]} points</p>
            </div>
            <p className="winner">
              {playerScores[0] < playerScores[1]
                ? 'PLAYER 1 wins!'
                : playerScores[1] < playerScores[0]
                ? 'PLAYER 2 wins!'
                : "It's a tie!"}
            </p>
            <button className="btn" onClick={resetGame}>
              Play Again
            </button>
          </div>
        </div>
      )}

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

      <ErrorBoundary fallback={<ErrorFallback />}>
        <Suspense fallback={<LoadingScreen />}>
          <Canvas
            shadows
            camera={{ position: [0, 10, 7], fov: 75, near: 0.1, far: 100 }}
          >
            <color attach="background" args={['#9999ff']} />
            <fog attach="fog" args={['#9999ff', 10, 50]} />

            <Physics gravity={[0, GRAVITY, 0]} paused={!isRunning || isPaused}>
              <Scene />
            </Physics>

            <OrbitControls
              target={[0, 4, 0]}
              minDistance={3}
              maxDistance={10}
              minPolarAngle={0.15}
              maxPolarAngle={Math.PI / 2}
            />
          </Canvas>
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
