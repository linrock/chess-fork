import Vue from 'vue'
import Vuex from 'vuex'

import { FEN, SanMove } from '../types'
import Analysis from '../analysis/models/analysis'
import { defaultAnalysisOptions } from '../analysis/options'
import initBackboneBridge from './bridge'

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

const store = new Vuex.Store({
  state,
  getters: {
    currentFen(state): FEN {
      return state.positions[state.positionIndex]
    }
  }
})

initBackboneBridge(state)

export default store
