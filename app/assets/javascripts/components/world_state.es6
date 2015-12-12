{

  // Reflects the state of the analysis board (board + move list)
  // For undo'ing moves and state changes
  // state - i, fen, moves, position
  //
  class WorldState extends Backbone.Model {

    initialize() {
      this.states = Immutable.Stack()
      this.set({
        moves: new Immutable.List(),
        positions: new Immutable.List([ new Chess().fen() ]),
        i: -1
      })
      this.initHistory()
      this.listenForEvents()
    }

    listenForEvents() {
      this.listenTo(this, "change", this.recordState)
    }

    recordState(state) {
      this.states = this.states.push(new Immutable.Map(state.attributes))
    }

    initHistory() {
      this.states = this.states.push(new Immutable.Map({
        moves: this.get("moves"),
        positions: this.get("positions"),
        i: -1
      }))
    }

    rewind() {
      this.states = this.states.pop()
      this.set(this.states.first().toObject())
      this.states = this.states.pop() // XXX because setting a state records the state again
    }

  }


  Components.WorldState = WorldState

}
