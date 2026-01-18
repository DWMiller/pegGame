import Board from './Board'
import Walls from './Walls'
import Marbles from './Marbles'
import Sticks from './Sticks'
import Lighting from './Lighting'
import Skybox from './Skybox'

export default function Scene() {
  return (
    <>
      <Lighting />
      <Skybox />
      <Board />
      <Walls />
      <Sticks />
      <Marbles />
    </>
  )
}
