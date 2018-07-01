import Vue from 'vue'
import Vuex from 'vuex'
import Chess from 'chess.js'
import Immutable from 'immutable'

import { FEN, SanMove, ChessMove } from '../types'
import { getMovePrefix } from '../utils'
import analysisEngine from '../analysis/engine'
import Analysis from '../analysis/models/analysis'
import { AnalysisOptions, defaultAnalysisOptions } from '../analysis/options'
import initBackboneBridge from './bridge'
import { world } from '../world_state'
import { chess } from '../chess_mechanism'

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
    world.set({ i: positionIndex })
  },
  setMovesAndPositions(state, { moves, positions }) {
    state.moves = moves
    state.positions = positions
    world.set({
      moves: Immutable.List(moves),
      positions: Immutable.List(positions)
    })
  },
  setWorldState(state, { moves, positions, i }) {
    state.positionIndex = i
    state.moves = moves
    state.positions = positions
    world.set({
      moves: Immutable.List(moves),
      positions: Immutable.List(positions),
      i
    })
  },
  loadWorldState(state, { moves, positions, i }) {
    state.positionIndex = i
    state.moves = moves
    state.positions = positions
  }
}

const actions = {
  setMode({ commit }, mode: string) {
    commit(`setMode`, mode)
  },
  setPositionIndex({ commit, getters, state }, positionIndex: number) {
    if (state.mode === `analysis`) {
      commit(`setMode`, `normal`)
      return
    }
    if (positionIndex < 0 || positionIndex >= state.positions.length) {
      return
    }
    if ((<any>window).chessboard.isAnimating()) {
      return
    }
    commit(`setPositionIndex`, positionIndex)
    analysisEngine.enqueueWork(getters.currentFen, getters.analysisOptions)
  },
  loadPgn({ dispatch, commit, getters }, pgn: string) {
    let cjs = new Chess
    if (!cjs.load_pgn(pgn)) {
      return false
    }
    console.log(`loading pgn`)
    const moves: Array<SanMove> = cjs.history()
    cjs = new Chess
    const positions = [cjs.fen()]
    for (let move of moves) {
      cjs.move(move)
      positions.push(cjs.fen())
    }
    commit(`setWorldState`, { moves, positions, i: 1 })
    positions.forEach(fen => {
      analysisEngine.enqueueWork(fen, getters.analysisOptions)
    })
    return true
  },
  setAnalysisOptions({ commit, getters }, analysisOptions: AnalysisOptions) {
    commit(`setAnalysisOptions`, analysisOptions)
    analysisEngine.enqueueWork(getters.currentFen, getters.analysisOptions)
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
    commit(`setWorldState`, { moves, positions, i: (i < 0) ? 1 : i + 1 })
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

const store = new Vuex.Store({ state, mutations, actions, getters })

initBackboneBridge(state, getters)

export default store
