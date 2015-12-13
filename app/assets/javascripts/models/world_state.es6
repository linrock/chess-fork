{

  // Reflects the state of the analysis board (board + move list)
  // For undo'ing moves and state changes
  // state - i, fen, moves, position
  //
  class WorldState extends Backbone.Model {

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
      this.states = this.states.push(new Immutable.Map(state.attributes))
    }

    reset() {
      this.set({
        moves: new Immutable.List(),
        positions: new Immutable.List([ new Chess().fen() ]),
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


  Models.WorldState = WorldState

}
