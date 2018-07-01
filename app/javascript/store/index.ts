import Backbone from 'backbone'

import { FEN, SanMove } from '../types'
import { chess } from '../chess_mechanism'
import { world } from '../world_state'
import Analysis from '../analysis/models/analysis'
import analysisCache from '../analysis/cache'
import { defaultAnalysisOptions } from '../analysis/options'

interface Store {
  mode: string
  moves: Array<SanMove>
  positions: Array<FEN>
  positionIndex: number
  variationIndex: number
  variationPositionIndex: number
  currentAnalysis: Analysis
  multipv?: number
  depth?: number
}

const store: Store = Object.assign({}, defaultAnalysisOptions, {
  mode: `normal`,
  moves: [],
  positions: [`rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`],
  positionIndex: 0,
  variationIndex: null,
  variationPositionIndex: null,
  currentAnalysis: null,
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
listener.listenTo(chess, "change:mode", (_, mode) => store.mode = mode)

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
listener.listenTo(chess, "analysis:options:change", () => {
  const fen = currentFen()
  const { multipv, depth } = store
  chess.trigger("analysis:enqueue", fen, { multipv, depth })
})

listener.listenTo(world, "change:moves", (_, moves) => {
  store.moves = moves.toArray()
})
listener.listenTo(world, "change:positions", (_, positions) => {
  store.positions = positions.toArray()
})

export default store
