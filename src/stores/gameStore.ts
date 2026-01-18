import { create } from 'zustand'
import { GameSettings, StickData, MarbleData, GamePhase, HolePosition, PlayerNumber } from '../types'

const MARBLE_COLORS = [
  '#0332FD', '#C30FDE', '#0DCE0D', '#F0FE11', '#33FAF3',
  '#ED0C0C', '#FF8A00', '#9301FA', '#000000', '#FFFFFF', '#4A2E18'
]

function posOrNeg(): number {
  return Math.round(Math.random()) * 2 - 1
}

// Hole grid constants
const SIDES = 8
const INNER_RADIUS = 0.7
export const HOLES_PER_ROW = 8
export const ROWS_PER_WALL = 6

// Calculate wall width at inner radius
const WALL_WIDTH = 2 * INNER_RADIUS * Math.sin(Math.PI / SIDES)

// Hole and peg sizing
export const HOLE_RADIUS = 0.015  // Just slightly bigger than peg radius
export const PEG_THICKNESS = 0.02
export const PEG_LENGTH = 2.5  // Spans octagon diameter + extends past walls

// Export Y range for Walls.tsx (scaled to maintain density with 6 rows)
export const PEG_Y_MIN = 3.4
export const PEG_Y_MAX = 3.8

// Get wall center position and angle
function getWallGeometry(wallIndex: number) {
  const angle = (wallIndex / SIDES) * Math.PI * 2 - Math.PI / 2
  const x = Math.cos(angle) * INNER_RADIUS
  const z = Math.sin(angle) * INNER_RADIUS
  return { x, z, angle }
}

// Get world position for a hole
export function getHoleWorldPosition(hole: HolePosition): [number, number, number] {
  const { x, z, angle } = getWallGeometry(hole.wallIndex)

  // Local position along wall (horizontal offset from center)
  let localX = ((hole.col + 0.5) / HOLES_PER_ROW - 0.5) * WALL_WIDTH * 0.95

  // IMPORTANT: Mirror localX for walls 4-7 so opposite walls have aligned holes
  // This allows pegs to go straight through both walls
  if (hole.wallIndex >= 4) {
    localX = -localX
  }

  // Height position - narrow vertical band
  const pegYRange = PEG_Y_MAX - PEG_Y_MIN
  const y = PEG_Y_MIN + ((hole.row + 0.5) / ROWS_PER_WALL) * pegYRange

  // Transform local to world coordinates
  // Wall normal points inward, so we offset perpendicular to that
  const perpAngle = angle + Math.PI / 2
  const worldX = x + Math.cos(perpAngle) * localX
  const worldZ = z + Math.sin(perpAngle) * localX

  return [worldX, y, worldZ]
}

// Shuffle array (Fisher-Yates)
function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function generateSticks(count: number, gameId: number): StickData[] {
  // Stratified selection: distribute evenly across walls with minimum per row
  const wallCount = 4
  const basePerWall = Math.floor(count / wallCount)
  const extraPegs = count % wallCount

  const selectedHoles: HolePosition[] = []

  for (let wallIndex = 0; wallIndex < wallCount; wallIndex++) {
    // Some walls get one extra peg to account for remainder
    const pegsForThisWall = basePerWall + (wallIndex < extraPegs ? 1 : 0)
    const wallHoles: HolePosition[] = []
    const usedPositions = new Set<string>()

    // First pass: ensure at least 1 peg per row (if we have enough pegs)
    const rowsToFill = Math.min(ROWS_PER_WALL, pegsForThisWall)
    for (let row = 0; row < rowsToFill; row++) {
      const cols = shuffle([...Array(HOLES_PER_ROW).keys()])
      const col = cols[0]
      wallHoles.push({ wallIndex, row, col })
      usedPositions.add(`${row}-${col}`)
    }

    // Second pass: fill remaining slots randomly from unused positions
    const remainingPositions: HolePosition[] = []
    for (let row = 0; row < ROWS_PER_WALL; row++) {
      for (let col = 0; col < HOLES_PER_ROW; col++) {
        if (!usedPositions.has(`${row}-${col}`)) {
          remainingPositions.push({ wallIndex, row, col })
        }
      }
    }

    const shuffledRemaining = shuffle(remainingPositions)
    const stillNeeded = pegsForThisWall - wallHoles.length
    wallHoles.push(...shuffledRemaining.slice(0, stillNeeded))

    selectedHoles.push(...wallHoles)
  }

  return selectedHoles.map((hole, i) => {
    // Entry hole position (wall 0-3)
    const entryPos = getHoleWorldPosition(hole)

    // Exit hole position (opposite wall: 0↔4, 1↔5, 2↔6, 3↔7)
    const exitHole: HolePosition = {
      wallIndex: hole.wallIndex + 4,
      row: hole.row,
      col: hole.col
    }
    const exitPos = getHoleWorldPosition(exitHole)

    // Peg positioned at midpoint between entry and exit holes
    const position: [number, number, number] = [
      (entryPos[0] + exitPos[0]) / 2,
      (entryPos[1] + exitPos[1]) / 2,
      (entryPos[2] + exitPos[2]) / 2
    ]

    // Rotation: peg Z-axis points from entry to exit
    const dx = exitPos[0] - entryPos[0]
    const dz = exitPos[2] - entryPos[2]
    const angle = Math.atan2(dx, dz)  // Note: atan2(x,z) for rotation around Y
    const rotation: [number, number, number] = [0, angle, 0]

    // Start position: slide in along peg axis from outside
    // Randomly choose which side to slide in from for visual variety
    const slideDirection = Math.random() < 0.5 ? 1 : -1
    const slideOffset = PEG_LENGTH * slideDirection
    const startX = position[0] - Math.sin(angle) * slideOffset
    const startZ = position[2] - Math.cos(angle) * slideOffset

    return {
      id: `stick-${gameId}-${i}`,
      position,
      rotation,
      holePosition: hole,
      startPosition: [startX, position[1], startZ] as [number, number, number],
      animDelay: Math.random() * 0.3  // Slight stagger (0-300ms)
    }
  })
}

function generateMarbles(count: number): MarbleData[] {
  const marbles: MarbleData[] = []
  for (let i = 0; i < count; i++) {
    // Spawn high above tube, stagger heights to avoid collision chaos
    const spawnHeight = 8 + (i * 0.4)
    marbles.push({
      id: `marble-${i}`,
      position: [
        posOrNeg() * Math.random() * 0.25,
        spawnHeight,
        posOrNeg() * Math.random() * 0.25
      ],
      color: MARBLE_COLORS[Math.floor(Math.random() * MARBLE_COLORS.length)]
    })
  }
  return marbles
}

interface GameStore {
  // Settings
  settings: GameSettings
  updateSettings: (settings: Partial<GameSettings>) => void

  // Game state
  gameId: number  // Increments on each reset to force component remounts
  phase: GamePhase
  isRunning: boolean
  isPaused: boolean
  gameOver: boolean

  // Multiplayer state
  currentPlayer: PlayerNumber
  lastActingPlayer: PlayerNumber  // Who last pulled a peg (for scoring)
  hasAnyoneActed: boolean  // False until first peg is pulled
  playerScores: [number, number]  // [player1, player2]

  // Objects
  sticks: StickData[]
  marbles: MarbleData[]
  hoveredStickId: string | null

  // Actions
  startGame: () => void
  resetGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  setPhase: (phase: GamePhase) => void
  removeStick: (id: string) => void
  dropStick: (id: string, position: [number, number, number]) => void
  activeStickCount: () => number
  markMarbleFallen: (id: string) => void
  removeMarble: (id: string) => void
  setHoveredStick: (id: string | null) => void
  swapPlayer: () => void
  activeMarblesCount: () => number
  checkGameOver: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  settings: {
    stickCount: 30,
    marbleCount: 30
  },

  gameId: 0,
  phase: 'idle',
  isRunning: false,
  isPaused: false,
  gameOver: false,

  // Multiplayer
  currentPlayer: 1,
  lastActingPlayer: 1,
  hasAnyoneActed: false,  // No one has pulled a peg yet
  playerScores: [0, 0],

  sticks: [],
  marbles: [],
  hoveredStickId: null,

  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings }
    })),

  startGame: () => {
    const { settings, gameId } = get()
    const newGameId = gameId + 1
    set({
      gameId: newGameId,
      phase: 'setup',
      isRunning: true,
      isPaused: false,
      gameOver: false,
      currentPlayer: 1,
      lastActingPlayer: 1,
      hasAnyoneActed: false,
      playerScores: [0, 0],
      sticks: generateSticks(settings.stickCount, newGameId),
      marbles: generateMarbles(settings.marbleCount),
      hoveredStickId: null
    })
  },

  resetGame: () => {
    const { settings, gameId } = get()
    const newGameId = gameId + 1
    set({
      gameId: newGameId,
      phase: 'setup',
      isRunning: true,
      isPaused: false,
      gameOver: false,
      currentPlayer: 1,
      lastActingPlayer: 1,
      hasAnyoneActed: false,
      playerScores: [0, 0],
      sticks: generateSticks(settings.stickCount, newGameId),
      marbles: generateMarbles(settings.marbleCount),
      hoveredStickId: null
    })
  },

  pauseGame: () => set({ isPaused: true, phase: 'paused' }),
  resumeGame: () => set((state) => ({
    isPaused: false,
    phase: state.marbles.length > 0 ? 'playing' : 'setup'
  })),

  setPhase: (phase) => {
    if (phase === 'gameover') {
      set({ phase, gameOver: true, isRunning: false })
    } else {
      set({ phase })
    }
  },

  removeStick: (id) =>
    set((state) => {
      const newSticks = state.sticks.filter((s) => s.id !== id)
      return {
        sticks: newSticks,
        hoveredStickId: state.hoveredStickId === id ? null : state.hoveredStickId
      }
    }),

  dropStick: (id, position) =>
    set((state) => ({
      sticks: state.sticks.map((s) =>
        s.id === id ? { ...s, dropped: true, droppedPosition: position } : s
      ),
      hoveredStickId: state.hoveredStickId === id ? null : state.hoveredStickId,
      // Mark that someone has acted (for scoring)
      hasAnyoneActed: true,
      // Mark current player as the one who acted (for scoring)
      lastActingPlayer: state.currentPlayer,
      // Swap to next player immediately
      currentPlayer: state.currentPlayer === 1 ? 2 : 1
    })),

  activeStickCount: () => get().sticks.filter((s) => !s.dropped).length,

  markMarbleFallen: (id) =>
    set((state) => {
      // Only score if someone has actually pulled a peg
      const newScores: [number, number] = [...state.playerScores]
      if (state.hasAnyoneActed) {
        newScores[state.lastActingPlayer - 1] += 1
      }
      return {
        marbles: state.marbles.map((m) =>
          m.id === id ? { ...m, fallen: true } : m
        ),
        playerScores: newScores
      }
    }),

  removeMarble: (id) =>
    set((state) => ({
      marbles: state.marbles.filter((m) => m.id !== id)
    })),

  setHoveredStick: (id) => set({ hoveredStickId: id }),

  swapPlayer: () =>
    set((state) => ({
      currentPlayer: state.currentPlayer === 1 ? 2 : 1
    })),

  activeMarblesCount: () => get().marbles.filter((m) => !m.fallen).length,

  checkGameOver: () => {
    const { marbles, phase } = get()
    // Only check during playing phase
    if (phase !== 'playing') return
    const activeMarbles = marbles.filter((m) => !m.fallen)
    if (activeMarbles.length === 0 && marbles.length > 0) {
      set({ gameOver: true, isRunning: false, phase: 'gameover' })
    }
  }
}))
