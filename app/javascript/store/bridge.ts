import Backbone from 'backbone'

import { FEN } from '../types'
import { chess } from '../chess_mechanism'

// temporary bridge between backbone events and vuex store
const initBackboneBridge = (state, getters) => {
  const listener = <any>Object.assign({}, Backbone.Events)

  // chess mechanism events
  listener.listenTo(chess, "change:j", (_, j) => state.variationIndex = j)
  listener.listenTo(chess, "change:k", (_, k) => state.variationPositionIndex = k)
  listener.listenTo(chess, "change:mode", (_, mode) => state.mode = mode)
  listener.listenTo(chess, "polarity:flip", () => state.boardPolarity *= -1)
}

export default initBackboneBridge
