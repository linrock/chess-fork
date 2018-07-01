import Mousetrap from 'mousetrap'
import { chess } from './chess_mechanism'
import { world } from './world_state'
import store from './store'

export default class HotKeys {

  constructor() {
    Mousetrap.bind(["left"], () => store.dispatch(`prevMove`))
    Mousetrap.bind(["right"], () => store.dispatch(`nextMove`))
    Mousetrap.bind(["up"], e => {
      e.preventDefault()
      store.dispatch(`prevVariationMove`)
    })
    Mousetrap.bind(["down"], e => {
      e.preventDefault()
      store.dispatch(`nextVariationMove`)
    })
    Mousetrap.bind(["esc"], () => store.dispatch(`setMode`, `normal`))
    Mousetrap.bind(["command+z", "ctrl+z"], () => world.rewind())
  }
}
