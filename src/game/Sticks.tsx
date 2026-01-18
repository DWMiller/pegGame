import { useRef, useEffect, useState } from 'react'
import { useTexture } from '@react-three/drei'
import { RigidBody, RapierRigidBody } from '@react-three/rapier'
import { ThreeEvent, useFrame } from '@react-three/fiber'
import { useGameStore } from '../stores/gameStore'
import { StickData } from '../types'
import { PEG_LENGTH } from '../stores/gameStore'

const SETUP_DURATION = 1.5  // seconds for all pegs to slide in
const SLIDE_OUT_DELAY = 0.12  // pause before movement starts
const SLIDE_OUT_DURATION = 0.7  // seconds to slide out (after delay)

interface StickProps {
  data: StickData
}

function Stick({ data }: StickProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const texture = useTexture('/assets/images/plywood.jpg')
  const { phase, hoveredStickId, setHoveredStick, dropStick } = useGameStore()

  // Animation state
  const animStartTime = useRef<number | null>(null)

  // Slide out state: null = not sliding, 1 or -1 = direction
  const [slidingOut, setSlidingOut] = useState<number | null>(null)
  const slideOutStartTime = useRef<number | null>(null)

  const isHovered = hoveredStickId === data.id && slidingOut === null

  // Current interpolated position
  const currentPos = useRef<[number, number, number]>([...data.startPosition])

  useFrame((_, delta) => {
    // Once dropped, physics handles everything
    if (data.dropped) return

    // Handle slide-out animation
    if (slidingOut !== null) {
      if (slideOutStartTime.current === null) {
        slideOutStartTime.current = 0
        // Start from current position
        currentPos.current = [...data.position]
      }

      slideOutStartTime.current += delta

      // Delay before movement starts
      if (slideOutStartTime.current < SLIDE_OUT_DELAY) {
        return
      }

      const moveTime = slideOutStartTime.current - SLIDE_OUT_DELAY
      const progress = Math.min(1, moveTime / SLIDE_OUT_DURATION)

      // Ease in quartic - starts slow, accelerates toward end
      const eased = Math.pow(progress, 3)

      // Calculate exit position based on direction
      const angle = data.rotation[1]
      const slideOffset = PEG_LENGTH
      const exitX = data.position[0] + Math.sin(angle) * slideOffset * slidingOut
      const exitZ = data.position[2] + Math.cos(angle) * slideOffset * slidingOut

      // Interpolate to exit
      currentPos.current = [
        data.position[0] + (exitX - data.position[0]) * eased,
        data.position[1],
        data.position[2] + (exitZ - data.position[2]) * eased
      ]

      if (rigidBodyRef.current) {
        rigidBodyRef.current.setTranslation(
          { x: currentPos.current[0], y: currentPos.current[1], z: currentPos.current[2] },
          true
        )
      }

      // Drop when animation complete
      if (progress >= 1 && !data.dropped) {
        dropStick(data.id, [...currentPos.current])
      }
      return
    }

    // Handle setup animation
    if (phase !== 'setup') return

    if (animStartTime.current === null) {
      animStartTime.current = 0
    }

    animStartTime.current += delta

    // Wait for per-peg delay before animating
    const effectiveTime = Math.max(0, animStartTime.current - data.animDelay)
    const progress = Math.min(1, effectiveTime / SETUP_DURATION)

    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3)

    // Interpolate position
    currentPos.current = [
      data.startPosition[0] + (data.position[0] - data.startPosition[0]) * eased,
      data.startPosition[1] + (data.position[1] - data.startPosition[1]) * eased,
      data.startPosition[2] + (data.position[2] - data.startPosition[2]) * eased
    ]

    // Update rigid body position during animation
    if (rigidBodyRef.current) {
      rigidBodyRef.current.setTranslation(
        { x: currentPos.current[0], y: currentPos.current[1], z: currentPos.current[2] },
        true
      )
    }
  })

  // Reset animation when phase changes to setup
  useEffect(() => {
    if (phase === 'setup') {
      animStartTime.current = null
      slideOutStartTime.current = null
      setSlidingOut(null)
      currentPos.current = [...data.startPosition]
    }
  }, [phase, data.startPosition])


  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    if (phase !== 'playing' || slidingOut !== null) return
    e.stopPropagation()
    setHoveredStick(data.id)
    document.body.style.cursor = 'pointer'
  }

  const handlePointerOut = () => {
    setHoveredStick(null)
    document.body.style.cursor = 'auto'
  }

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (phase !== 'playing' || slidingOut !== null) return
    e.stopPropagation()

    // Determine which half was clicked based on click position
    // Project click point onto the peg's axis
    const clickPoint = e.point
    const pegCenter = data.position
    const angle = data.rotation[1]

    // Peg direction vector (normalized)
    const dirX = Math.sin(angle)
    const dirZ = Math.cos(angle)

    // Vector from peg center to click point
    const toClickX = clickPoint.x - pegCenter[0]
    const toClickZ = clickPoint.z - pegCenter[2]

    // Dot product tells us which side of center was clicked
    const dot = toClickX * dirX + toClickZ * dirZ

    // Slide in the direction of the click (positive dot = positive direction)
    const direction = dot >= 0 ? 1 : -1

    setSlidingOut(direction)
    setHoveredStick(null)
    document.body.style.cursor = 'auto'
  }

  // Use appropriate position based on state
  const displayPosition = data.dropped
    ? data.droppedPosition!
    : (phase === 'setup' || slidingOut !== null)
      ? currentPos.current
      : data.position

  // Key forces remount when dropped state changes
  const bodyKey = data.dropped ? `${data.id}-dropped` : data.id

  return (
    <RigidBody
      key={bodyKey}
      ref={rigidBodyRef}
      type={data.dropped ? "dynamic" : "kinematicPosition"}
      position={displayPosition}
      rotation={data.rotation}
      colliders="cuboid"
      mass={0.1}
      linearDamping={0.1}
      angularDamping={0.1}
      ccd
    >
      <mesh
        castShadow={!data.dropped}
        receiveShadow
        frustumCulled={false}
        onPointerOver={data.dropped ? undefined : handlePointerOver}
        onPointerOut={data.dropped ? undefined : handlePointerOut}
        onClick={data.dropped ? undefined : handleClick}
      >
        <boxGeometry args={[0.02, 0.02, 2.5]} />
        {isHovered ? (
          <meshStandardMaterial color="#F31717" />
        ) : (
          <meshStandardMaterial map={texture} />
        )}
      </mesh>
    </RigidBody>
  )
}

export default function Sticks() {
  const sticks = useGameStore((state) => state.sticks)

  return (
    <>
      {sticks.map((stick) => (
        <Stick key={stick.id} data={stick} />
      ))}
    </>
  )
}
