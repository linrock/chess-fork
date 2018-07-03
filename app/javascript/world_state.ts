// Reflects the state of the analysis board (board + move list)
// For undo'ing moves and state changes
// state - i, moves, positions

import Backbone from 'backbone'
import Immutable from 'immutable'
import Chess from 'chess.js'

import { FEN, SanMove } from './types'
import store from './store'

interface WorldStateSnapshot {
  i: number,
  moves: Immutable.List<SanMove>,
  positions: Immutable.List<FEN>,
}

class WorldState extends Backbone.Model {
  private states: Immutable.Stack<Immutable.Map<string, any>>

  initialize() {
    this.states = Immutable.Stack()
    this.listenTo(this, "change", this.recordState)
    this.reset()
  }

  public reset(): void {
    const worldState = {
      i: -1,
      moves: <Immutable.List<SanMove>>Immutable.List(),
      positions: Immutable.List([ new Chess().fen() ])
    }
    this.set(worldState)
    this.dispatchWorldState(worldState)
  }

  public rewind(): void {
    if (this.states.size <= 1) {
      return
    }
    this.states = this.states.pop()
    const prevState = <WorldStateSnapshot>this.states.first().toObject()
    this.dispatchWorldState(prevState)
    this.set(prevState)
    this.states = this.states.pop()
    const worldState = <WorldStateSnapshot>this.states.first().toObject()
    this.dispatchWorldState(worldState)
  }

  private recordState(state: WorldState) {
    this.states = this.states.push(Immutable.Map(<WorldStateSnapshot>state.attributes))
  }

  private dispatchWorldState(worldState: WorldStateSnapshot) {
    store.dispatch(`loadWorldState`, {
      i: worldState.i,
      moves: worldState.moves.toArray(),
      positions: worldState.positions.toArray()
    })
  }
}

let worldState

export const getWorldState = () => {
  if (!worldState) {
    worldState = new WorldState
  }
  return worldState
}
