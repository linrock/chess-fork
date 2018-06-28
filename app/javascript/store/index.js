import Backbone from 'backbone'

import analysisCache from '../analysis/cache'
import { defaultAnalysisOptions } from '../analysis/options'
import { chess } from '../chess_mechanism'
import { world } from '../main'

const store = Object.assign({}, defaultAnalysisOptions, {
  positionIndex: 0,
  variationIndex: null,
  variationPositionIndex: null,
  currentAnalysis: null
})

const currentFen = () => chess.getPosition(store.positionIndex)

const listener = Object.assign({}, Backbone.Events)
listener.listenTo(world, "change:i", (_, i) => {
  store.positionIndex = i
  const fen = currentFen()
  const analysisOptions = {
    multipv: store.multipv,
    depth: store.depth
  }
  chess.trigger("analysis:enqueue", fen, analysisOptions)
})
listener.listenTo(chess, "change:j", (_, j) => store.variationIndex = j)
listener.listenTo(chess, "change:k", (_, k) => store.variationPositionIndex = k)
listener.listenTo(chess, "analysis:complete", fen => {
  const analysisOptions = {
    multipv: store.multipv,
    depth: store.depth
  }
  const analysis = analysisCache.get(fen, analysisOptions)
  if (fen === chess.getPosition(store.positionIndex)) {
    store.currentAnalysis = analysis
  }
})
listener.listenTo(chess, "analysis:options:change", ({ multipv, depth }) => {
  const fen = currentFen()
  store.multipv = multipv
  store.depth = depth
  chess.trigger("analysis:enqueue", fen, { multipv, depth })
})

export default store
