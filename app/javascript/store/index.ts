import Vue from 'vue'
import Vuex from 'vuex'
import Chess from 'chess.js'
import Immutable from 'immutable'

import { FEN, SanMove, ChessMove } from '../types'
import { getMovePrefix } from '../utils'
import Analysis from '../analysis/models/analysis'
import Variation from '../analysis/models/variation'
import analysisEngine from '../analysis/engine'
import { AnalysisOptions, defaultAnalysisOptions } from '../analysis/options'
import { world } from '../world_state'

Vue.use(Vuex)

interface GlobalState {
  mode: string
  moves: Array<SanMove>
  positions: Array<FEN>
  positionIndex: number
  variationIndex: number
  variationPositionIndex: number
  currentFen: FEN
  currentAnalysis: Analysis
  boardPolarity: number // 1 or -1
  boardIsAnimating: boolean
  multipv?: number
  depth?: number
}

const state: GlobalState = Object.assign({}, defaultAnalysisOptions, {
  mode: `normal`,
  moves: [],
  positions: [`rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`],
  positionIndex: 0,
  variationIndex: 0,
  variationPositionIndex: 0,
  currentAnalysis: null,
  currentFen: `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`,
  boardPolarity: 1,
  boardIsAnimating: false,
})

const mutations = {
  setMode(state, mode) {
    state.mode = mode
  },
  setAnalysisOptions(state, { depth, multipv }) {
    state.depth = depth
    state.multipv = multipv
  },
  setPositionIndex(state, positionIndex) {
    state.positionIndex = positionIndex
  },
  setVariationIndex(state, variationIndex) {
    state.variationIndex = variationIndex
  },
  setVariationPositionIndex(state, variationPositionIndex) {
    state.variationPositionIndex = variationPositionIndex
  },
  setMovesAndPositions(state, { moves, positions }) {
    state.moves = moves
    state.positions = positions
  },
  setCurrentFen(state, fen: FEN) {
    state.currentFen = fen
  },
  setCurrentAnalysis(state, analysis: Analysis) {
    state.currentAnalysis = analysis
  },
  loadWorldState(state, { moves, positions, i }) {
    state.positionIndex = i
    state.moves = moves
    state.positions = positions
  },
  flipBoard(state) {
    state.boardPolarity *= -1
  },
  setBoardIsAnimating(state, isAnimating: boolean) {
    state.boardIsAnimating = isAnimating
  }
}

const actions = {
  setPositionIndex({ dispatch, commit, getters, state }, positionIndex: number) {
    if (state.mode === `analysis`) {
      dispatch(`setMode`, `normal`)
      commit(`setVariationPositionIndex`, 0)
      return
    }
    if (positionIndex < 0 || positionIndex >= state.positions.length) {
      return
    }
    if (state.boardIsAnimating) {
      return
    }
    commit(`setPositionIndex`, positionIndex)
    world.set({ i: positionIndex })
    analysisEngine.enqueueWork(getters.currentFen, getters.analysisOptions)
  },
  setWorldState({ commit }, { moves, positions, i }) {
    commit(`setMovesAndPositions`, { moves, positions })
    commit(`setPositionIndex`, i)
    world.set({
      moves: Immutable.List(moves),
      positions: Immutable.List(positions),
      i
    })
  },
  loadPgn({ dispatch, commit, getters }, pgn: string): boolean {
    let cjs = new Chess
    if (!cjs.load_pgn(pgn)) {
      return false
    }
    const moves: Array<SanMove> = cjs.history()
    cjs = new Chess
    const positions = [cjs.fen()]
    for (let move of moves) {
      cjs.move(move)
      positions.push(cjs.fen())
    }
    dispatch(`setWorldState`, { moves, positions, i: 1 })
    positions.forEach(fen => {
      analysisEngine.enqueueWork(fen, getters.analysisOptions)
    })
    return true
  },
  setAnalysisOptions({ commit, getters }, analysisOptions: AnalysisOptions) {
    commit(`setAnalysisOptions`, analysisOptions)
    analysisEngine.enqueueWork(getters.currentFen, analysisOptions)
  },
  analysisComplete({ commit, state, getters }, payload) {
    const { fen, options, analysis } = payload
    const { multipv, depth } = getters.analysisOptions
    if (fen === getters.currentFen
        && options.multipv === multipv
        && options.depth === depth) {
      commit(`setCurrentAnalysis`, analysis)
      if (state.variationIndex > multipv) {
        commit(`setVariationIndex`, 0)
      }
    }
  },
  makeMove({ dispatch, commit, state, getters }, move: ChessMove) {
    const i = state.positionIndex
    const cjs = new Chess(getters.currentFen)
    const moveAttempt = cjs.move(move)
    if (!moveAttempt) {
      return
    }
    const moves: Array<SanMove> = this.state.moves.slice(0, i)
    moves.push(moveAttempt.san)
    const newFen = cjs.fen()
    const ind = i < 1 ? 1 : i + 1
    const positions = state.positions.slice(0, ind)
    positions.push(newFen)
    dispatch(`setWorldState`, { moves, positions, i: (i < 0) ? 1 : i + 1 })
    analysisEngine.enqueueWork(newFen, getters.analysisOptions)
  },
  firstMove({ dispatch }) {
    dispatch(`setPositionIndex`, 0)
  },
  prevMove({ dispatch, state }) {
    dispatch(`setPositionIndex`, state.positionIndex - 1)
  },
  nextMove({ dispatch, state }) {
    dispatch(`setPositionIndex`, state.positionIndex + 1)
  },
  lastMove({ dispatch, state }) {
    dispatch(`setPositionIndex`, state.positions.length - 1)
  },
  loadWorldState({ commit }, worldState) {
    commit(`loadWorldState`, worldState)
  },

  prevVariationMove({ dispatch, state }) {
    dispatch(`setVariationPositionIndex`, state.variationPositionIndex - 1)
  },
  nextVariationMove({ dispatch, state }) {
    dispatch(`setVariationPositionIndex`, state.variationPositionIndex + 1)
  },
  setVariationPositionIndex({ dispatch, commit, getters, state }, variationPositionIndex) {
    if (variationPositionIndex < 0) {
      dispatch(`setMode`, `normal`)
      return
    }
    if (state.mode === `normal` && state.variationPositionIndex >= 0) {
      dispatch(`analyzeCurrentPosition`, 0)
      return
    }
    const analysis = state.currentAnalysis
    if (!analysis || variationPositionIndex >= getters.currentAnalysisVariation.length) {
      return
    }
    if (state.boardIsAnimating) {
      return
    }
    commit(`setVariationPositionIndex`, variationPositionIndex)
  },
  analyzeCurrentPosition({ dispatch, commit }, variationIndex) {
    dispatch(`setMode`, `analysis`)
    commit(`setVariationIndex`, variationIndex)
    commit(`setVariationPositionIndex`, 0)
  },
  setMode({ commit, state, getters }, mode: string) {
    commit(`setMode`, mode)
  },
  setFen({ commit }, fen: FEN) {
    commit(`setCurrentFen`, fen)
  },
  flipBoard({ commit }) {
    commit(`flipBoard`)
  },
  setBoardIsAnimating({ commit }, isAnimating: boolean) {
    commit(`setBoardIsAnimating`, isAnimating)
  }
}

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
  currentAnalysisVariation(state: GlobalState): Variation {
    return state.currentAnalysis.variations[state.variationIndex]
  },
  positionInfoText(state: GlobalState): string {
    const i = state.positionIndex - 1
    if (i < 0) {
      return ``
    } else if (state.mode === `normal`) {
      return `${getMovePrefix(i)} ${state.moves[i]}`
    } else if (state.currentAnalysis && state.mode === `analysis`) {
      const k = state.variationIndex
      if (state.currentAnalysis.variations[k]) {
        const firstVariationMove = state.currentAnalysis.variations[k].firstMove
        return `Variation after ${getMovePrefix(i + 1)} ${firstVariationMove}`
      } else {
        return ``
      }
    }
  },
  analysisOptions(state: GlobalState): AnalysisOptions {
    const { multipv, depth } = state
    return { multipv, depth }
  }
}

const store = new Vuex.Store({ state, mutations, actions, getters })

export default store
