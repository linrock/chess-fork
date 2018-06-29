import Backbone from 'backbone'

import { FEN } from '../types'
import { chess } from '../chess_mechanism'
import { world } from '../main'
import Analysis from '../analysis/models/analysis'
import analysisCache from '../analysis/cache'
import { defaultAnalysisOptions } from '../analysis/options'

interface Store {
  multipv?: number
  depth?: number
  positionIndex: number
  variationIndex: number
  variationPositionIndex: number
  currentAnalysis: Analysis
}

const store: Store = Object.assign({}, defaultAnalysisOptions, {
  positionIndex: 0,
  variationIndex: null,
  variationPositionIndex: null,
  currentAnalysis: null
})

const currentFen = (): FEN => chess.getPosition(store.positionIndex)

const listener = <any>Object.assign({}, Backbone.Events)
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
