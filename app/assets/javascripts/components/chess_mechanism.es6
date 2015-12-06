// Handling the internal state of chess positions/history

{

  class ChessMechanism extends Backbone.Model {

    initialize() {
      this.mechanism = new Chess
      this.set({
        i: 0,
        moves: [],
        positions: [this.mechanism.fen()]
      })
    }

    setFen(fen) {
      this.set({ fen: fen })
    }

    start() {
      this.setFen(this.mechanism.fen())
    }

    move(move) {
      let moves = this.get("moves").slice(0, this.get("i"))
      let c = new Chess
      for (let m of moves) {
        c.move(m)
      }
      if (!c.move(move)) {
        return
      }
      this.mechanism = c
      this.setFen(c.fen())
      this.updatePositions(c.history())
      this.set({ i: this.get("i") + 1 })
    }

    // TODO DRY usage of new chess instance to generate a
    // different state and position set
    //
    updatePositions(moves) {
      let c = new Chess
      let positions = [c.fen()]
      for (let move of moves) {
        c.move(move)
        positions.push(c.fen())
      }
      this.set({
        moves: moves,
        positions: positions
      })
    }

    getMovePrefix() {
      let nMoves = this.get("i")
      let moveNum = 1 + ~~(nMoves / 2)
      return moveNum + (nMoves % 2 == 0 ? "." : "...")
    }

    loadPgn(pgn) {
      if (!this.mechanism.load_pgn(pgn)) {
        return false
      }
      this.updatePositions(this.mechanism.history())
      this.firstMove()
      return true
    }

    firstMove() {
      this.setPositionIndex(0)
    }

    prevMove() {
      this.setPositionIndex(this.get("i") - 1)
    }

    nextMove() {
      this.setPositionIndex(this.get("i") + 1)
    }

    lastMove() {
      this.setPositionIndex(this.get("positions").length - 1)
    }

    setPositionIndex(i) {
      if (i < 0 || i >= this.get("positions").length) {
        return
      }
      this.set({ i: i })
    }

  }


  Components.ChessMechanism = ChessMechanism

}
