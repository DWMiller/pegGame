import { useTexture } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'

export default function Board() {
  const texture = useTexture('/assets/images/wood.jpg')

  return (
    <RigidBody type="fixed" position={[0, -1, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[25, 1, 25]} />
        <meshStandardMaterial map={texture} />
      </mesh>
    </RigidBody>
  )
}
