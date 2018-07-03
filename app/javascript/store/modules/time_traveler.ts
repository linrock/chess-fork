import Immutable from 'immutable'
import { FEN, SanMove } from '../../types'

interface WorldStateSnapshot {
  i: number,
  moves: Immutable.List<SanMove>,
  positions: Immutable.List<FEN>,
}

const initialWorldState: WorldStateSnapshot = {
  i: -1,
  moves: <Immutable.List<SanMove>>Immutable.List(),
  positions: Immutable.List([
    `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`
  ]),
}

const state = {
  worldStateSnapshots: Immutable.Stack<WorldStateSnapshot>()
}

const mutations = {
  reset(state) {
    const snapshots = state.worldStateSnapshots
    state.worldStateSnapshots = snapshots.push(initialWorldState)
  },
  rewind(state) {
    state.worldStateSnapshots = state.worldStateSnapshots.pop()
  },
  record(state, attributes) {
    const snapshots = state.worldStateSnapshots
    state.worldStateSnapshots = snapshots.push(attributes)
  }
}

const actions = {
  resetWorld({ commit, getters, dispatch }) {
    commit(`reset`)
    dispatch(`loadWorldState`, getters.latestWorldStateAttributes)
  },
  rewindWorld({ commit, getters, dispatch }) {
    commit(`rewind`)
    dispatch(`loadWorldState`, getters.latestWorldStateAttributes)
  },
  recordWorld({ commit, getters }, attributes) {
    commit(`record`, Object.assign({}, getters.latestWorldState, attributes))
  }
}

const getters = {
  latestWorldState(state) {
    return state.worldStateSnapshots.first() || initialWorldState
  },
  latestWorldStateAttributes(state) {
    const attributes = state.worldStateSnapshots.first() || initialWorldState
    return {
      i: attributes.i,
      moves: attributes.moves.toArray(),
      positions: attributes.positions.toArray()
    }
  }
}

export default { state, mutations, actions, getters }
