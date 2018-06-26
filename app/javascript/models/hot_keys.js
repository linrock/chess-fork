import Mousetrap from 'mousetrap'
import { chess } from '../chess_mechanism'
import { world } from '../main'

export default class HotKeys {

  constructor() {
    Mousetrap.bind(["left"],  ()  => { chess.prevMove() })
    Mousetrap.bind(["right"], ()  => { chess.nextMove() })
    Mousetrap.bind(["up"],    (e) => {
      e.preventDefault()
      chess.prevEngineMove()
    })
    Mousetrap.bind(["down"],  (e) => {
      e.preventDefault()
      chess.nextEngineMove()
    })

    Mousetrap.bind(["esc"],   ()  => { chess.set({ mode: "normal" }) })
    Mousetrap.bind(["command+z", "ctrl+z"], () => {
      world.rewind()
    })
  }
}
