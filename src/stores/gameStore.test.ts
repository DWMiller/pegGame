import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.setState({
      gameId: 0,
      isRunning: false,
      isPaused: false,
      gameOver: false,
      currentPlayer: 1,
      lastActingPlayer: 1,
      hasAnyoneActed: false,
      playerScores: [0, 0],
      sticks: [],
      marbles: [],
      hoveredStickId: null,
      settings: { stickCount: 30, marbleCount: 30 }
    })
  })

  describe('startGame', () => {
    it('should initialize game with correct number of sticks', () => {
      useGameStore.setState({ settings: { stickCount: 10, marbleCount: 15 } })
      useGameStore.getState().startGame()

      const state = useGameStore.getState()
      expect(state.sticks).toHaveLength(10)
      expect(state.isRunning).toBe(true)
      expect(state.playerScores).toEqual([0, 0])
      expect(state.currentPlayer).toBe(1)
    })

    it('should set isRunning to true', () => {
      useGameStore.getState().startGame()
      expect(useGameStore.getState().isRunning).toBe(true)
    })
  })

  describe('pauseGame / resumeGame', () => {
    it('should pause the game', () => {
      useGameStore.getState().startGame()
      useGameStore.getState().pauseGame()
      expect(useGameStore.getState().isPaused).toBe(true)
    })

    it('should resume the game', () => {
      useGameStore.getState().startGame()
      useGameStore.getState().pauseGame()
      useGameStore.getState().resumeGame()
      expect(useGameStore.getState().isPaused).toBe(false)
    })
  })

  describe('removeStick', () => {
    it('should remove a stick by id', () => {
      useGameStore.getState().startGame()
      const stickId = useGameStore.getState().sticks[0].id
      const initialCount = useGameStore.getState().sticks.length

      useGameStore.getState().removeStick(stickId)

      expect(useGameStore.getState().sticks).toHaveLength(initialCount - 1)
      expect(useGameStore.getState().sticks.find(s => s.id === stickId)).toBeUndefined()
    })

    it('should clear hoveredStickId if removed stick was hovered', () => {
      useGameStore.getState().startGame()
      const stickId = useGameStore.getState().sticks[0].id
      useGameStore.getState().setHoveredStick(stickId)

      useGameStore.getState().removeStick(stickId)

      expect(useGameStore.getState().hoveredStickId).toBeNull()
    })
  })

  describe('dropStick', () => {
    it('should mark stick as dropped, set lastActingPlayer, hasAnyoneActed, and swap player', () => {
      useGameStore.getState().startGame()
      const stickId = useGameStore.getState().sticks[0].id
      expect(useGameStore.getState().currentPlayer).toBe(1)
      expect(useGameStore.getState().hasAnyoneActed).toBe(false)

      useGameStore.getState().dropStick(stickId, [0, 0, 0])

      const stick = useGameStore.getState().sticks.find(s => s.id === stickId)
      expect(stick?.dropped).toBe(true)
      expect(useGameStore.getState().hasAnyoneActed).toBe(true)
      expect(useGameStore.getState().lastActingPlayer).toBe(1)  // Player 1 acted
      expect(useGameStore.getState().currentPlayer).toBe(2)  // Now player 2's turn
    })
  })

  describe('markMarbleFallen', () => {
    it('should not add points if no one has acted yet', () => {
      useGameStore.getState().startGame()
      useGameStore.getState().setPhase('playing')
      const marbleId = useGameStore.getState().marbles[0].id

      // No one has acted yet
      useGameStore.getState().markMarbleFallen(marbleId)

      const marble = useGameStore.getState().marbles.find(m => m.id === marbleId)
      expect(marble?.fallen).toBe(true)
      expect(useGameStore.getState().playerScores[0]).toBe(0)  // No points
      expect(useGameStore.getState().playerScores[1]).toBe(0)
    })

    it('should add point to lastActingPlayer after someone has acted', () => {
      useGameStore.getState().startGame()
      useGameStore.getState().setPhase('playing')
      const stickId = useGameStore.getState().sticks[0].id

      // Player 1 drops a stick
      useGameStore.getState().dropStick(stickId, [0, 0, 0])
      // Now currentPlayer is 2, but lastActingPlayer is 1, hasAnyoneActed is true

      const marbleId = useGameStore.getState().marbles[0].id
      useGameStore.getState().markMarbleFallen(marbleId)

      // Point should go to player 1 (lastActingPlayer)
      expect(useGameStore.getState().playerScores[0]).toBe(1)
      expect(useGameStore.getState().playerScores[1]).toBe(0)
    })
  })

  describe('removeMarble', () => {
    it('should remove a marble from the array', () => {
      useGameStore.getState().startGame()
      useGameStore.getState().setPhase('playing')
      const marbleId = useGameStore.getState().marbles[0].id
      const initialCount = useGameStore.getState().marbles.length

      useGameStore.getState().removeMarble(marbleId)

      expect(useGameStore.getState().marbles).toHaveLength(initialCount - 1)
    })
  })

  describe('checkGameOver', () => {
    it('should set gameOver when all marbles are fallen', () => {
      useGameStore.setState({
        marbles: [{ id: 'test', position: [0, 0, 0], color: 'red', fallen: true }],
        isRunning: true
      })
      useGameStore.getState().checkGameOver()

      expect(useGameStore.getState().gameOver).toBe(true)
      expect(useGameStore.getState().isRunning).toBe(false)
    })

    it('should not set gameOver when active marbles remain', () => {
      useGameStore.getState().startGame()
      useGameStore.getState().setPhase('playing')
      useGameStore.getState().checkGameOver()

      expect(useGameStore.getState().gameOver).toBe(false)
    })
  })

  describe('updateSettings', () => {
    it('should update settings partially', () => {
      useGameStore.getState().updateSettings({ stickCount: 50 })

      const settings = useGameStore.getState().settings
      expect(settings.stickCount).toBe(50)
      expect(settings.marbleCount).toBe(30) // unchanged
    })
  })

  describe('resetGame', () => {
    it('should reset scores and regenerate objects', () => {
      useGameStore.getState().startGame()
      useGameStore.getState().setPhase('playing')
      // Drop a stick first so hasAnyoneActed is true
      useGameStore.getState().dropStick(useGameStore.getState().sticks[0].id, [0, 0, 0])
      useGameStore.getState().markMarbleFallen(useGameStore.getState().marbles[0].id)
      expect(useGameStore.getState().playerScores[0]).toBe(1)

      useGameStore.getState().resetGame()

      expect(useGameStore.getState().playerScores).toEqual([0, 0])
      expect(useGameStore.getState().gameOver).toBe(false)
      expect(useGameStore.getState().currentPlayer).toBe(1)
      expect(useGameStore.getState().hasAnyoneActed).toBe(false)
    })
  })

  describe('swapPlayer', () => {
    it('should swap between players', () => {
      expect(useGameStore.getState().currentPlayer).toBe(1)
      useGameStore.getState().swapPlayer()
      expect(useGameStore.getState().currentPlayer).toBe(2)
      useGameStore.getState().swapPlayer()
      expect(useGameStore.getState().currentPlayer).toBe(1)
    })
  })
})
