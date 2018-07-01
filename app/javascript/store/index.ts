import Vue from 'vue'
import Vuex from 'vuex'
import Backbone from 'backbone'

import { FEN, SanMove } from '../types'
import { chess } from '../chess_mechanism'
import { world } from '../world_state'
import Analysis from '../analysis/models/analysis'
import analysisCache from '../analysis/cache'
import { defaultAnalysisOptions } from '../analysis/options'

Vue.use(Vuex)

interface GlobalState {
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

const state: GlobalState = Object.assign({}, defaultAnalysisOptions, {
  mode: `normal`,
  moves: [],
  positions: [`rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`],
  positionIndex: 0,
  variationIndex: null,
  variationPositionIndex: null,
  currentAnalysis: null,
})

const currentFen = (): FEN => chess.getPosition(state.positionIndex)

// temporary bridge between backbone events and vuex store
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

listener.listenTo(world, "change:moves", (_, moves) => {
  state.moves = moves.toArray()
})
listener.listenTo(world, "change:positions", (_, positions) => {
  state.positions = positions.toArray()
})

const store = new Vuex.Store({
  state,
  getters: {

  }
})

export default store
