import { RigidBody as RapierRigidBody } from '@dimforge/rapier3d-compat'
import { Object3D } from 'three'

export type GamePhase = 'idle' | 'setup' | 'playing' | 'paused' | 'gameover'

export interface GameSettings {
  stickCount: number
  marbleCount: number
}

export interface GameState {
  isRunning: boolean
  isPaused: boolean
  score: number
  marblesRemaining: number
  sticksRemaining: number
}

export interface HolePosition {
  wallIndex: number
  row: number
  col: number
}

export interface StickData {
  id: string
  position: [number, number, number]
  rotation: [number, number, number]
  holePosition: HolePosition
  startPosition: [number, number, number]  // For animation
  animDelay: number  // Slight stagger for slide-in animation
  dropped?: boolean  // Physics-enabled after sliding out
  droppedPosition?: [number, number, number]  // Position when dropped
}

export interface MarbleData {
  id: string
  position: [number, number, number]
  color: string
  fallen?: boolean  // Fallen below pegs, counts as scored
}

export type PlayerNumber = 1 | 2

export interface RigidBodyRef {
  current: RapierRigidBody | null
}

export interface MeshRef {
  current: Object3D | null
}
