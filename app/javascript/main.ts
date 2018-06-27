// Reflects the state of the analysis board (board + move list)
// For undo'ing moves and state changes
// state - i, fen, moves, position

import * as Backbone from 'backbone'
import * as Immutable from 'immutable'
import Chess from 'chess.js'

interface WorldStateSnapshot {
  i: number,
  moves: Immutable.List<string>,
  positions: Immutable.List<string>,
}

export default class WorldState extends Backbone.Model {
  private states: Immutable.Stack<Immutable.Map<string, any>>

  initialize() {
    this.states = Immutable.Stack()
    this.listenForEvents()
    this.reset()
  }

  listenForEvents() {
    this.listenTo(this, "change", this.recordState)
    this.listenTo(this, "reset",  this.reset)
  }

  recordState(state) {
    this.states = this.states.push(Immutable.Map(<WorldStateSnapshot>state.attributes))
  }

  reset() {
    this.set({
      moves: Immutable.List(),
      positions: Immutable.List([ new Chess().fen() ]),
      i: -1
    })
  }

  rewind() {
    if (this.states.size <= 1) {
      return
    }
    this.states = this.states.pop()
    this.set(this.states.first().toObject())
    this.states = this.states.pop()
  }
}

export const world = new WorldState
