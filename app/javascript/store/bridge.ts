import Backbone from 'backbone'

import { FEN } from '../types'
import { chess } from '../chess_mechanism'
import { world } from '../world_state'
import analysisCache from '../analysis/cache'

// temporary bridge between backbone events and vuex store
const initBackboneBridge = state => {
  const currentFen = (): FEN => chess.getPosition(state.positionIndex)

  const listener = <any>Object.assign({}, Backbone.Events)

  listener.listenTo(world, "change:i", (_, i) => {
    state.positionIndex = i
    const fen = currentFen()
    const analysisOptions = {
      multipv: state.multipv,
      depth: state.depth
    }
    chess.trigger("analysis:enqueue", fen, analysisOptions)
  })
  listener.listenTo(chess, "change:j", (_, j) => state.variationIndex = j)
  listener.listenTo(chess, "change:k", (_, k) => state.variationPositionIndex = k)
  listener.listenTo(chess, "change:mode", (_, mode) => state.mode = mode)

  listener.listenTo(chess, "analysis:complete", fen => {
    const analysisOptions = {
      multipv: state.multipv,
      depth: state.depth
    }
    const analysis = analysisCache.get(fen, analysisOptions)
    if (fen === chess.getPosition(state.positionIndex)) {
      state.currentAnalysis = analysis
    }
  })
  listener.listenTo(chess, "analysis:options:change", () => {
    const fen = currentFen()
    const { multipv, depth } = state
    chess.trigger("analysis:enqueue", fen, { multipv, depth })
  })
  listener.listenTo(chess, "polarity:flip", () => state.boardPolarity *= -1)

  listener.listenTo(world, "change:moves", (_, moves) => {
    state.moves = moves.toArray()
  })
  listener.listenTo(world, "change:positions", (_, positions) => {
    state.positions = positions.toArray()
  })
}

export default initBackboneBridge
