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

export default class WorldState extends Backbone.Model {
  private states: Immutable.Stack<Immutable.Map<string, any>>

  initialize() {
    this.states = Immutable.Stack()
    this.listenTo(this, "change", this.recordState)
    this.reset()
  }

  public reset(): void {
    this.set({
      i: -1,
      moves: Immutable.List(),
      positions: Immutable.List([ new Chess().fen() ])
    })
    store.dispatch(`loadWorldState`, {
      i: -1,
      moves: [],
      positions: [ new Chess().fen() ]
    })
  }

  public rewind(): void {
    if (this.states.size <= 1) {
      return
    }
    this.states = this.states.pop()
    this.set(this.states.first().toObject())
    this.states = this.states.pop()
    const worldState = this.states.first().toObject()
    console.dir({
      i: worldState.i,
      moves: worldState.moves.toArray(),
      positions: worldState.positions.toArray()
    })
    store.dispatch(`loadWorldState`, {
      i: worldState.i,
      moves: worldState.moves.toArray(),
      positions: worldState.positions.toArray()
    })
  }

  public getPositions(): Immutable.List<FEN> {
    return this.get("positions")
  }

  public nPositions(): number {
    return this.getPositions().size
  }

  public getPosition(i: number): FEN {
    return this.getPositions().get(i)
  }

  public getCurrentPosition(): FEN {
    return this.getPosition(this.get("i"))
  }

  private recordState(state: WorldState) {
    this.states = this.states.push(Immutable.Map(<WorldStateSnapshot>state.attributes))
  }
}

export const world = new WorldState
