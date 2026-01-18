import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, RapierRigidBody, BallCollider } from '@react-three/rapier'
import { useGameStore, PEG_Y_MIN } from '../stores/gameStore'
import { MarbleData } from '../types'

// Threshold below which marbles are considered "fallen through"
const FALLEN_THRESHOLD = PEG_Y_MIN - 0.5  // A bit below the lowest pegs

interface MarbleProps {
  data: MarbleData
}

function Marble({ data }: MarbleProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const phase = useGameStore((state) => state.phase)
  const markMarbleFallen = useGameStore((state) => state.markMarbleFallen)
  const removeMarble = useGameStore((state) => state.removeMarble)
  const checkGameOver = useGameStore((state) => state.checkGameOver)

  useFrame(() => {
    if (rigidBodyRef.current) {
      const position = rigidBodyRef.current.translation()

      // Only track fallen marbles during playing phase
      if (phase === 'playing' && !data.fallen && position.y < FALLEN_THRESHOLD) {
        markMarbleFallen(data.id)
        checkGameOver()
      }

      // Remove from scene when far below board
      if (position.y < -2) {
        removeMarble(data.id)
      }
    }
  })

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={data.position}
      colliders={false}
      restitution={0.2}
      friction={0.3}
      mass={0.1}
      linearDamping={0.5}
      angularDamping={0.5}
    >
      <BallCollider args={[0.125]} />
      <mesh castShadow receiveShadow>
        <icosahedronGeometry args={[0.125, 2]} />
        <meshStandardMaterial color={data.color} roughness={0.2} metalness={0.1} />
      </mesh>
    </RigidBody>
  )
}

export default function Marbles() {
  const marbles = useGameStore((state) => state.marbles)

  return (
    <>
      {marbles.map((marble) => (
        <Marble key={marble.id} data={marble} />
      ))}
    </>
  )
}
