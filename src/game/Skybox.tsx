import { BackSide } from 'three'

export default function Skybox() {
  return (
    <mesh>
      <boxGeometry args={[1000, 1000, 1000]} />
      <meshBasicMaterial color="#9999ff" side={BackSide} />
    </mesh>
  )
}
