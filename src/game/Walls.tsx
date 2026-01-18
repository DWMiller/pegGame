import { useMemo } from 'react'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { Shape, ExtrudeGeometry, DoubleSide, Path } from 'three'
import { HOLES_PER_ROW, ROWS_PER_WALL, HOLE_RADIUS, PEG_Y_MIN, PEG_Y_MAX } from '../stores/gameStore'

const SIDES = 8
const OUTER_RADIUS = 0.75
const INNER_RADIUS = 0.7
const HEIGHT = 10
const WALL_THICKNESS = OUTER_RADIUS - INNER_RADIUS
const WALL_Y_MIN = -1.5

const PEG_Y_RANGE = PEG_Y_MAX - PEG_Y_MIN

// Calculate wall width at inner radius (with slight expansion to reduce corner gaps)
const WALL_WIDTH = 2 * INNER_RADIUS * Math.sin(Math.PI / SIDES) * 1.07

// Create a single wall segment with holes
function createWallSegmentWithHoles(wallIndex: number) {
  const angle = (wallIndex / SIDES) * Math.PI * 2 - Math.PI / 2

  // Wall dimensions in local space (before rotation)
  // Shape is defined in XY plane, then extruded along Z
  const halfWidth = WALL_WIDTH / 2
  const yBottom = WALL_Y_MIN
  const yTop = WALL_Y_MIN + HEIGHT

  // Create the wall shape (rectangle)
  const shape = new Shape()
  shape.moveTo(-halfWidth, yBottom)
  shape.lineTo(halfWidth, yBottom)
  shape.lineTo(halfWidth, yTop)
  shape.lineTo(-halfWidth, yTop)
  shape.closePath()

  // Add circular holes
  for (let row = 0; row < ROWS_PER_WALL; row++) {
    for (let col = 0; col < HOLES_PER_ROW; col++) {
      // Local X position along wall (matches gameStore logic)
      let localX = ((col + 0.5) / HOLES_PER_ROW - 0.5) * WALL_WIDTH * 0.95

      // Mirror for walls 4-7 to align with opposite walls
      if (wallIndex >= 4) {
        localX = -localX
      }

      // Local Y position
      const localY = PEG_Y_MIN + ((row + 0.5) / ROWS_PER_WALL) * PEG_Y_RANGE

      // Create circular hole
      const holePath = new Path()
      const segments = 16
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2
        const hx = localX + Math.cos(theta) * HOLE_RADIUS
        const hy = localY + Math.sin(theta) * HOLE_RADIUS
        if (i === 0) {
          holePath.moveTo(hx, hy)
        } else {
          holePath.lineTo(hx, hy)
        }
      }
      shape.holes.push(holePath)
    }
  }

  // Extrude the shape
  const geometry = new ExtrudeGeometry(shape, {
    depth: WALL_THICKNESS,
    bevelEnabled: false
  })

  // Position and rotate the wall segment
  // The shape is in XY plane, extruded along +Z
  // We need to position it at the wall location and rotate to face inward

  // Move so the inner face is at inner radius
  geometry.translate(0, 0, -WALL_THICKNESS / 2)

  // Rotate around Y axis to position on octagon
  geometry.rotateY(-angle + Math.PI / 2)

  // Translate to wall position
  const wallX = Math.cos(angle) * (INNER_RADIUS + WALL_THICKNESS / 2)
  const wallZ = Math.sin(angle) * (INNER_RADIUS + WALL_THICKNESS / 2)
  geometry.translate(wallX, 0, wallZ)

  return geometry
}

// Generate collider positions for each wall segment
const WALL_CENTER_Y = 3.5

function getWallColliders(): Array<{
  position: [number, number, number]
  rotation: [number, number, number]
  size: [number, number, number]
}> {
  const midRadius = (OUTER_RADIUS + INNER_RADIUS) / 2
  const colliders = []

  for (let i = 0; i < SIDES; i++) {
    const angle = (i / SIDES) * Math.PI * 2 - Math.PI / 2
    const x = Math.cos(angle) * midRadius
    const z = Math.sin(angle) * midRadius
    const wallWidth = 2 * midRadius * Math.sin(Math.PI / SIDES)

    colliders.push({
      position: [x, WALL_CENTER_Y, z] as [number, number, number],
      rotation: [0, -angle + Math.PI / 2, 0] as [number, number, number],
      size: [wallWidth / 2, HEIGHT / 2, WALL_THICKNESS / 2] as [number, number, number]
    })
  }

  return colliders
}

export default function Walls() {
  const wallGeometries = useMemo(() => {
    return Array.from({ length: SIDES }, (_, i) => createWallSegmentWithHoles(i))
  }, [])
  const colliders = useMemo(() => getWallColliders(), [])

  return (
    <RigidBody type="fixed" position={[0, 0, 0]} colliders={false}>
      {wallGeometries.map((geometry, i) => (
        <mesh key={i} geometry={geometry}>
          <meshPhysicalMaterial
            color="#d0e8f0"
            transparent
            opacity={0.4}
            roughness={0.1}
            metalness={0}
            clearcoat={0.3}
            side={DoubleSide}
          />
        </mesh>
      ))}
      {colliders.map((collider, i) => (
        <CuboidCollider
          key={i}
          args={collider.size}
          position={collider.position}
          rotation={collider.rotation}
        />
      ))}
    </RigidBody>
  )
}
