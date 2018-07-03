import Mousetrap from 'mousetrap'

import { Mode } from './enums'
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
    Mousetrap.bind(["esc"], () => store.dispatch(`setMode`, Mode.Normal))
    Mousetrap.bind(["command+z", "ctrl+z"], () => store.dispatch(`rewindWorld`))
  }
}
