import Vue from 'vue'
import Vuex from 'vuex'

import { FEN, SanMove } from '../types'
import { getMovePrefix } from '../utils'
import Analysis from '../analysis/models/analysis'
import { AnalysisOptions, defaultAnalysisOptions } from '../analysis/options'
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
  boardPolarity: number // 1 or -1
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
  boardPolarity: 1,
})

const getters = {
  position(state: GlobalState): (number) => FEN {
    return i => (i < 0) ? state.positions[0] : state.positions[i]
  },
  currentFen(state: GlobalState): FEN {
    return state.positions[state.positionIndex]
    if (state.mode === `normal`) {
      return state.positions[state.positionIndex]
    } else if (state.mode === `analysis`) {
      const j = state.variationIndex + 1
      const k = state.variationPositionIndex
      return state.currentAnalysis.variations[k].positions[j]
    }
  },
  positionInfoText(state: GlobalState): string {
    const i = state.positionIndex - 1
    if (state.mode === `normal`) {
      return `${getMovePrefix(i)} ${state.moves[i]}`
    } else if (state.mode === `analysis`) {
      const k = state.variationPositionIndex
      const firstVariationMove = state.currentAnalysis.variations[k].firstMove
      return `Variation after ${getMovePrefix(i)} ${firstVariationMove}`
    }
  },
  analysisOptions(state: GlobalState): AnalysisOptions {
    const { multipv, depth } = state
    return { multipv, depth }
  }
}

const store = new Vuex.Store({ state, getters })

initBackboneBridge(state, getters)

export default store
